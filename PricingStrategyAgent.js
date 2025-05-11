// Tentative structure for a new orchestrator, e.g., PricingStrategyAgent.js

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


// Import functions/classes from your existing modules
const runFullCompetitorAnalysis = require('./CompetitorAnalysisPipeline.js');
const DynamicPricingEngine = require('./pricingengine.js'); // Assuming the class file

// API key for Firecrawl (needed by CompetitorAnalysisPipeline)
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
// Other API keys (PERPLEXITY_API_KEY, SERPER_API_KEY) are handled within CompetitorAnalysisPipeline

async function determineOptimalPrice(
  // Inputs for CompetitorAnalysisPipeline
  initialProductName,
  initialCompany,
  initialCategory,
  initialPrice, // This is the user's current product price
  initialCurrencyCode,
  initialCountryCode,
  // Inputs for DynamicPricingEngine (userParams)
  productionCost,
  marginTarget,
  minimumMargin,
  averageSalesPerMonth
) {
  console.log("--- Starting Pricing Strategy Agent ---");

  // --- Step 1: Run Competitor Analysis ---
  console.log("\n[Pricing Agent] Step 1: Running Competitor Analysis Pipeline...");
  const competitorAnalysisResult = await runFullCompetitorAnalysis(
    initialProductName,
    initialCompany,
    initialCategory,
    initialPrice, // User's product's current price
    initialCurrencyCode,
    initialCountryCode
  );

  if (competitorAnalysisResult.error) {
    console.error("[Pricing Agent] Error from Competitor Analysis Pipeline:", competitorAnalysisResult.error);
    return { error: `Competitor analysis failed: ${competitorAnalysisResult.error}` };
  }

  if (!competitorAnalysisResult.competitorDetails || competitorAnalysisResult.competitorDetails.length === 0) {
    console.log("[Pricing Agent] No competitor details found by the pipeline. Cannot proceed to pricing engine.");
    // Decide how to handle this - maybe return a message, or try pricing without competitors (engine might not support this well)
    return { message: "No competitor data for pricing engine.", analysisResult: competitorAnalysisResult };
  }
  console.log("[Pricing Agent] Competitor Analysis Pipeline completed.");

  // --- Step 2: Prepare Inputs for Dynamic Pricing Engine ---
  console.log("\n[Pricing Agent] Step 2: Preparing inputs for Dynamic Pricing Engine...");

  // Extract numerical competitor prices
  const competitorPricesNumeric = competitorAnalysisResult.competitorDetails
    .filter(detail => detail.price !== null && typeof detail.price === 'number' && !detail.error) // Ensure price is valid & no error for that competitor
    .map(detail => detail.price);

  if (competitorPricesNumeric.length === 0) {
      console.log("[Pricing Agent] No valid competitor prices extracted from pipeline results. Cannot run pricing engine.");
      return { message: "No valid competitor prices to use for pricing engine.", analysisResult: competitorAnalysisResult };
  }

  const engineInput = {
    productData: {
      currentPrice: initialPrice // The user's main product's current numerical price
    },
    competitorPrices: competitorPricesNumeric,
    userParams: {
      productionCost: productionCost,
      marginTarget: marginTarget,
      minimumMargin: minimumMargin,
      averageSalesPerMonth: averageSalesPerMonth
    },
    currency: initialCurrencyCode // Or a preferred display currency symbol like '₹', '$', etc.
                                 // The engine uses this for formatting, so initialCurrencyCode is fine.
  };
  console.log("[Pricing Agent] Inputs for Pricing Engine prepared.");
  // console.log("[Pricing Agent] Engine Input:", JSON.stringify(engineInput, null, 2)); // For debugging

  // --- Step 3: Run Dynamic Pricing Engine ---
  console.log("\n[Pricing Agent] Step 3: Running Dynamic Pricing Engine...");
  const pricingEngine = new DynamicPricingEngine();
  try {
    const pricingRecommendation = pricingEngine.calculatePricing(engineInput);
    console.log("[Pricing Agent] Dynamic Pricing Engine completed.");
    return {
        competitorAnalysis: competitorAnalysisResult,
        pricingStrategy: pricingRecommendation
    };
  } catch (error) {
    console.error("[Pricing Agent] Error from Dynamic Pricing Engine:", error.message);
    if (error.stack) console.error(error.stack);
    return {
        error: `Pricing engine calculation failed: ${error.message}`,
        competitorAnalysis: competitorAnalysisResult
    };
  }
}

// --- CLI Section for this new orchestrator ---
if (require.main === module) {
  if (!FIRECRAWL_API_KEY) { // Basic check, more comprehensive checks in underlying modules
    console.error("Error: FIRECRAWL_API_KEY is not set.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.length < 10) { // 6 for pipeline + 4 for pricing engine userParams
    console.log('Usage: node PricingStrategyAgent.js "Product Name" "Company" "Category" CurrentPrice CurrencyCode CountryCode ProductionCost MarginTarget MinMarginTarget AvgSalesPerMonth');
    console.log('Example: node PricingStrategyAgent.js "iPhone 15" "Apple" "Electronics" 999 USD US 600 30 15 1000');
    process.exit(1);
  }

  const [
    productName, company, category, currentPriceStr, currencyCode, countryCode,
    productionCostStr, marginTargetStr, minimumMarginStr, averageSalesPerMonthStr
  ] = args;

  // Convert string inputs to numbers
  const currentPrice = parseFloat(currentPriceStr);
  const productionCost = parseFloat(productionCostStr);
  const marginTarget = parseFloat(marginTargetStr);
  const minimumMargin = parseFloat(minimumMarginStr);
  const averageSalesPerMonth = parseInt(averageSalesPerMonthStr, 10);

  // Basic validation for numeric inputs
  if (isNaN(currentPrice) || isNaN(productionCost) || isNaN(marginTarget) || isNaN(minimumMargin) || isNaN(averageSalesPerMonth)) {
    console.error("Error: Price, production cost, margins, and sales must be valid numbers.");
    process.exit(1);
  }

  determineOptimalPrice(
    productName, company, category, currentPrice, currencyCode, countryCode,
    productionCost, marginTarget, minimumMargin, averageSalesPerMonth
  )
    .then(result => {
      console.log("\n--- AGENT FINAL OUTPUT ---");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('\n--- AGENT FAILED ---');
      console.error('Error in agent execution:', error.message);
      if (error.stack) {
        console.error("Stack Trace:", error.stack);
      }
      process.exit(1);
    });
}

module.exports = determineOptimalPrice; // Export the main function