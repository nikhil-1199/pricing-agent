// CompetitorAnalysisPipeline.js
// Orchestrates finding competitor URLs and then scraping details for each.

// Load environment variables from .env file
require('dotenv').config();

// Import functions from your other modules
const findCompetitors = require('./CompetitorFinder.js'); // Assuming it's in the same directory
const { scrapeProductDetails } = require('./ProductScraperLim.js'); // Assuming it's in the same directory

// Get API key needed by ProductScraperLim (others are handled within CompetitorFinder)
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

async function runFullCompetitorAnalysis(
  productName,
  company,
  category,
  price,
  currencyCode,
  countryCode
) {
  console.log("Starting full competitor analysis pipeline...");
  console.log("--------------------------------------------");

  // --- Step 1: Find Competitor URLs ---
  console.log("\nStep 1: Finding competitor URLs...");
  const competitorFinderResult = await findCompetitors(
    productName,
    company,
    category,
    price,
    currencyCode,
    countryCode
  );

  if (competitorFinderResult.error) {
    console.error("Error finding competitors:", competitorFinderResult.error);
    return { error: `Failed during competitor URL finding: ${competitorFinderResult.error}` };
  }

  if (!competitorFinderResult.urls || competitorFinderResult.urls.length === 0) {
    console.log("No competitor URLs found.");
    return { message: "No competitor URLs found.", competitorDetails: [] };
  }

  const competitorUrls = competitorFinderResult.urls;
  console.log(`Found ${competitorUrls.length} competitor URLs:`, competitorUrls);
  console.log("--------------------------------------------");

  // --- Step 2: Scrape Details for Each Competitor URL ---
  console.log("\nStep 2: Scraping details for each competitor URL...");
  const scrapedCompetitorDetails = [];

  if (!FIRECRAWL_API_KEY) {
    const errorMessage = "FIRECRAWL_API_KEY is not set. Cannot scrape product details.";
    console.error(errorMessage);
    return { error: errorMessage, foundUrls: competitorUrls, competitorDetails: [] };
  }

  for (let i = 0; i < competitorUrls.length; i++) {
    const url = competitorUrls[i];
    console.log(`\nScraping URL ${i + 1} of ${competitorUrls.length}: ${url}`);
    try {
      const details = await scrapeProductDetails(url, FIRECRAWL_API_KEY);
      if (details) { // scrapeProductDetails should throw on critical failure, but good to check
        console.log(`Successfully scraped details for: ${url}`);
        scrapedCompetitorDetails.push({
          sourceUrl: url,
          ...details // Spread the scraped product details
        });
      } else {
        // This case might occur if scrapeProductDetails is modified to return null on non-critical errors
        console.warn(`No details returned for ${url}, but no explicit error thrown.`);
         scrapedCompetitorDetails.push({
          sourceUrl: url,
          error: "No details extracted, scrape function returned null/undefined.",
        });
      }
    } catch (error) {
      console.error(`Failed to scrape details for ${url}: ${error.message}`);
      scrapedCompetitorDetails.push({
        sourceUrl: url,
        error: error.message,
        // Optionally include stack if needed: stack: error.stack
      });
    }
  }
  console.log("--------------------------------------------");
  console.log("\nPipeline finished.");

  return {
    originalProduct: { productName, company, category, price, currencyCode, countryCode },
    foundUrlsCount: competitorUrls.length,
    competitorDetails: scrapedCompetitorDetails
  };
}

// Example usage as a standalone script
if (require.main === module) {
  // Check for Firecrawl API key early for CLI usage
  if (!FIRECRAWL_API_KEY) {
    console.error("Error: FIRECRAWL_API_KEY is not set in the .env file or environment variables.");
    console.error("This key is required for scraping competitor product details.");
    console.error("Please ensure your .env file contains FIRECRAWL_API_KEY='your_api_key_here'");
    process.exit(1);
  }
  // Perplexity and Serper keys are checked within CompetitorFinder.js,
  // so if that part fails, it will report its own error.

  const args = process.argv.slice(2);

  if (args.length < 6) {
    console.log('Usage: node CompetitorAnalysisPipeline.js "Product Name" "Company" "Category/SubCategory" Price Currency_code Country_code');
    console.log('Example: node CompetitorAnalysisPipeline.js "iPhone 15 Pro" "Apple" "Electronics/Smartphones" 999 USD US');
    process.exit(1);
  }

  const [productName, company, category, price, currencyCode, countryCode] = args;

  runFullCompetitorAnalysis(productName, company, category, parseFloat(price), currencyCode, countryCode)
    .then(result => {
      console.log("\n--- FINAL RESULT ---");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('\n--- PIPELINE FAILED ---');
      console.error('Error in pipeline execution:', error.message);
      if (error.stack) {
        console.error("Stack Trace:", error.stack);
      }
      process.exit(1);
    });
}

// Export for potential use in other modules (e.g., a web server)
module.exports = runFullCompetitorAnalysis;