// app.js - Fixed Session Management and PromotionPlanner integration
const express = require('express');
const cors = require('cors');
const path = require('path');

// Make dotenv optional
try {
  require('dotenv').config();
  console.log("LOG: dotenv loaded successfully, but will prioritize system environment variables");
} catch (err) {
  console.log("LOG: dotenv not available, using system environment variables only");
}

const { scrapeProductDetails } = require('./ProductScraperLim');
const findCompetitors = require('./CompetitorFinder');
const { PricingEngine } = require('./PricingEngine');
const { PromotionPlanner } = require('./PromotionPlanner');

const app = express();
const PORT = process.env.PORT || 3000;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Check for API keys with more informative messages
if (!FIRECRAWL_API_KEY) {
    console.warn('WARNING: FIRECRAWL_API_KEY is not set in environment variables');
    console.warn('Set this environment variable before running the application');
}
if (!PERPLEXITY_API_KEY) {
    console.warn('WARNING: PERPLEXITY_API_KEY is not set in environment variables');
    console.warn('Set this environment variable before running the application');
}
if (!SERPER_API_KEY) {
    console.warn('WARNING: SERPER_API_KEY is not set in environment variables');
    console.warn('Set this environment variable before running the application');
}


// In-memory storage for session data
const sessionData = new Map();

function generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/analyze-product', async (req, res) => {
    console.log('LOG: Received analyze-product request:', req.query);
    const { productUrl } = req.query;
    if (!productUrl) {
        return res.status(400).json({ success: false, error: 'Product URL is required' });
    }
    
    const sessionId = generateSessionId();
    console.log(`LOG: Generated session ID: ${sessionId}`); // Add this log
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Session-Id': sessionId
    });
    
    const sendUpdate = (type, data) => {
        if (res.writableEnded) {
            console.warn(`LOG: [${sessionId}] Attempted to write to an ended stream. Type: ${type}`);
            return;
        }
        res.write(`data: ${JSON.stringify({ type, data, sessionId })}\n\n`);
    };
    
    try {
        console.log(`LOG: [${sessionId}] Starting product analysis for: ${productUrl}`);
        sendUpdate('status', 'Scraping product details...');
        const mainProductDetails = await scrapeProductDetails(productUrl, FIRECRAWL_API_KEY);
        
        if (!mainProductDetails) {
            console.error(`ERROR: [${sessionId}] No product details found for main URL`);
            sendUpdate('error', 'No product details found for the provided URL. The URL might be invalid or the scraper could not access it.');
            return;
        }
        
        console.log(`LOG: [${sessionId}] Main product details scraped:`, mainProductDetails.name);
        sendUpdate('productDetails', mainProductDetails);
        
        // Create session with session ID
        sessionData.set(sessionId, {
            productDetails: mainProductDetails,
            competitorDetails: [], 
            competitorUrls: [],   
            timestamp: Date.now()
        });
        console.log(`LOG: [${sessionId}] Session data stored`); // Add this log

        sendUpdate('status', 'Finding competitors...');
        const competitorResult = await findCompetitors(
            mainProductDetails.name,
            mainProductDetails.company || '',
            mainProductDetails.category || 'GENERAL',
            mainProductDetails.price,
            mainProductDetails.currency_code || 'USD',
            mainProductDetails.country_code || 'US'
        );

        let competitorUrls = [];
        if (competitorResult.error) {
            console.warn(`WARNING: [${sessionId}] Error finding competitors:`, competitorResult.error);
            sendUpdate('competitorError', competitorResult.error);
        } else if (competitorResult.urls && Array.isArray(competitorResult.urls) && competitorResult.urls.length > 0) {
            competitorUrls = competitorResult.urls.filter(url => typeof url === 'string' && url.startsWith('http'));
            console.log(`LOG: [${sessionId}] Found ${competitorUrls.length} valid competitor URLs.`);
            sendUpdate('competitorUrls', competitorUrls);
            const currentSession = sessionData.get(sessionId);
            if (currentSession) {
                currentSession.competitorUrls = competitorUrls;
            }
        } else {
             const msg = (competitorResult.urls && competitorResult.urls.length === 0) ? 'No competitor URLs returned.' : 'Competitor URLs format invalid or not found.';
             console.warn(`WARNING: [${sessionId}] ${msg}`);
             sendUpdate('competitorError', msg);
        }

        if (competitorUrls.length > 0) {
            sendUpdate('status', `Scraping details for ${competitorUrls.length} competitors...`);
            const currentSessionForCompetitors = sessionData.get(sessionId);

            for (let i = 0; i < competitorUrls.length; i++) {
                const url = competitorUrls[i];
                 if (!url) {
                    console.warn(`LOG: [${sessionId}] Skipping invalid competitor URL at index ${i}`);
                    continue;
                }
                try {
                    console.log(`LOG: [${sessionId}] Scraping competitor ${i + 1}/${competitorUrls.length}: ${url}`);
                    sendUpdate('status', `Scraping competitor ${i + 1} of ${competitorUrls.length}...`);
                    
                    const details = await scrapeProductDetails(url, FIRECRAWL_API_KEY);
                    if (details) {
                        if (currentSessionForCompetitors) { 
                           currentSessionForCompetitors.competitorDetails.push(details);
                        }
                        sendUpdate('competitorDetails', { url, details, index: i });
                        console.log(`LOG: [${sessionId}] Scraped competitor ${i + 1}: ${details.name || 'Name not found'}`);
                    } else {
                         console.warn(`WARNING: [${sessionId}] No details returned for competitor URL ${url}`);
                         sendUpdate('competitorScrapingError', { url, error: 'No details returned from scraper', index: i });
                    }
                } catch (scraperError) {
                    console.error(`WARNING: [${sessionId}] Failed to scrape competitor URL ${url}:`, scraperError.message);
                    sendUpdate('competitorScrapingError', { url, error: scraperError.message || 'Unknown scraping error', index: i });
                }
            }
        }
        
        console.log(`LOG: [${sessionId}] Product analysis completed.`);
        // Send session ID one more time in the complete event
        sendUpdate('complete', `Analysis completed. Session ID: ${sessionId}`);
        console.log(`LOG: [${sessionId}] Available sessions:`, Array.from(sessionData.keys())); // Add this log
        
    } catch (error) {
        console.error(`ERROR: [${sessionId}] Error during product analysis:`, error.stack || error);
        sendUpdate('error', error.message || 'An unexpected error occurred during product analysis.');
    } finally {
        if (!res.writableEnded) { 
            console.log(`LOG: [${sessionId}] Explicitly ending SSE stream.`);
            res.end();
        }
    }
});

app.post('/api/optimize-price', async (req, res) => {
    console.log('LOG: Received optimize-price request:', req.body);
    const { sessionId, productionCost, salesPerMonth, targetMargin } = req.body;
    
    console.log(`LOG: Looking for session: ${sessionId}`); // Add this log
    console.log(`LOG: Available sessions:`, Array.from(sessionData.keys())); // Add this log
    
    if (!sessionId || productionCost === undefined || salesPerMonth === undefined || targetMargin === undefined) {
        console.error('ERROR: Missing required fields for price optimization:', req.body);
        return res.status(400).json({ success: false, error: 'Missing required fields: sessionId, productionCost, salesPerMonth, or targetMargin.' });
    }
    
    const data = sessionData.get(sessionId);
    if (!data) {
        console.error('ERROR: Session not found for ID:', sessionId);
        console.log('DEBUGGING: Available sessions are:', Array.from(sessionData.keys())); // Add debugging info
        return res.status(404).json({ success: false, error: 'Session not found. Please re-analyze the product first.' });
    }
    
    try {
        const { productDetails, competitorDetails } = data;
        if (!productDetails) {
            console.error(`ERROR: [${sessionId}] Missing productDetails in session data for optimization.`);
            return res.status(500).json({ success: false, error: 'Critical error: Main product details missing from session.' });
        }
        
        const competitorPrices = (competitorDetails || [])
            .filter(comp => comp && comp.price !== null && !isNaN(parseFloat(comp.price)))
            .map(comp => parseFloat(comp.price));
        
        console.log(`LOG: [${sessionId}] Pricing Engine - Main Price: ${productDetails.price}, Competitor Prices Count: ${competitorPrices.length}`);
        
        const pricingEngine = new PricingEngine(
            productionCost, salesPerMonth, targetMargin, productDetails.price, competitorPrices
        );

        // Make sure to properly await the strategy and handle its result
        const pricingStrategyOutput = await pricingEngine.getProductStrategies();
        
        // Add extra safety check
        if (!pricingStrategyOutput) {
            console.error(`ERROR: [${sessionId}] Pricing strategy output is undefined`);
            return res.status(500).json({ success: false, error: 'Failed to generate pricing strategy.' });
        }
        
        // Log the output to help debug
        console.log(`LOG: [${sessionId}] Pricing strategy calculated:`, 
            pricingStrategyOutput?.optimizedStrategy?.name || 'Unnamed strategy');
        
        // Initialize the promotion planner with COMPLETE product details
        const planner = new PromotionPlanner();
        const promoCalendarInput = {
            // Add ALL product details needed for proper promotions
            productName: productDetails.name,
            category: (productDetails.category || 'GENERAL').toUpperCase(),
            country: (productDetails.country_code || 'US').toUpperCase(), 
            subCategory: productDetails.subcategory ? productDetails.subcategory.toUpperCase() : '',
            productPrice: productDetails.price,
            productionCost: productionCost,
            targetMargin: targetMargin,
            currencyCode: productDetails.currency_code || 'USD',
            currencySymbol: productDetails.currency_symbol || productDetails.currency || '$',
            competitors: competitorDetails.map(c => c.name || 'Unknown Competitor').filter(Boolean)
        };
        
        console.log(`LOG: [${sessionId}] Input for Promotion Planner:`, promoCalendarInput);
        
        // Generate promotional calendar - make sure to await if it returns a Promise
        const promotionCalendar = await planner.generatePromotionalCalendar(promoCalendarInput);
        
        if (!promotionCalendar) {
            console.error(`ERROR: [${sessionId}] Promotion calendar output is undefined`);
            return res.status(500).json({ success: false, error: 'Failed to generate promotion calendar.' });
        }
        
        console.log(`LOG: [${sessionId}] Promotion calendar generated successfully.`);
        
        const avgCompPrice = competitorPrices.length > 0 ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length : 0;

        // Add null checks for every property to prevent errors
        res.json({
            success: true,
            productDetails: {
                name: productDetails?.name || "Product", // Added null check
                currentPrice: productDetails?.price || 0,
                currency: productDetails?.currency_symbol || productDetails?.currency || '$',
                currencyCode: productDetails?.currency_code || 'USD'
            },
            strategy: pricingStrategyOutput || {
                currentPrice: productDetails?.price || 0,
                optimizedPrice: productDetails?.price || 0,
                competitorsPriceRange: { min: 0, max: 0 },
                marginAnalysis: { 
                    productCost: productionCost,
                    targetMargin: targetMargin,
                    actualMargin: 0
                },
                optimizedStrategy: {
                    name: "Default Strategy",
                    description: "Fallback strategy due to processing error"
                }
            },
            competitorAnalysis: {
                averagePrice: parseFloat(avgCompPrice.toFixed(2)),
                minPrice: competitorPrices.length > 0 ? Math.min(...competitorPrices) : 0,
                maxPrice: competitorPrices.length > 0 ? Math.max(...competitorPrices) : 0,
                numberOfCompetitors: competitorPrices.length
            },
            promotionCalendar: promotionCalendar || {
                productInfo: {
                    id: "product-id",
                    name: productDetails?.name || "Product",
                    category: productDetails?.category || "GENERAL",
                    currencyCode: productDetails?.currency_code || 'USD'
                },
                promotionSuggestions: []
            }
        });
        
    } catch (error) {
        console.error(`ERROR: [${sessionId}] Error during price optimization:`, error.stack || error);
        res.status(500).json({ success: false, error: error.message || 'Failed to optimize price and generate promotions.' });
    }
});

// API endpoint to check session status (debugging helper)
app.get('/api/session-status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const exists = sessionData.has(sessionId);
    const allSessions = Array.from(sessionData.keys());
    res.json({
        sessionId,
        exists,
        allSessions
    });
});

// Fallback for POST to /api/analyze-product
app.post('/api/analyze-product', (req, res) => {
    const { productUrl } = req.body;
    if (!productUrl) return res.status(400).json({ success: false, error: 'Product URL is required' });
    res.redirect(307, `/api/analyze-product?productUrl=${encodeURIComponent(productUrl)}`);
});

// Centralized Error handling middleware
app.use((err, req, res, next) => {
    console.error('UNHANDLED ERROR:', err.stack || err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Cleanup old sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of sessionData.entries()) {
        // Remove sessions older than 1 hour
        if (now - data.timestamp > 3600000) {
            sessionData.delete(sessionId);
            console.log(`LOG: Cleaned up old session: ${sessionId}`);
        }
    }
}, 300000); // Run every 5 minutes

// Start server
app.listen(PORT, () => {
    console.log(`LOG: Dynamic Pricing Agent server running on port ${PORT}`);
    console.log(`LOG: API Key status: 
        FIRECRAWL: ${FIRECRAWL_API_KEY ? 'Loaded' : 'Missing!'}
        PERPLEXITY: ${PERPLEXITY_API_KEY ? 'Loaded' : 'Missing!'}
        SERPER: ${SERPER_API_KEY ? 'Loaded' : 'Missing!'}`);
    console.log(`LOG: Access application at: http://localhost:${PORT}`);
});

// Global catchers for unhandled issues
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED PROMISE REJECTION at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1); 
});

module.exports = app;