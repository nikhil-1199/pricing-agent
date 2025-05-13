// ProductScraperLim.js
console.log("LOG: Script execution started."); // VERY FIRST LOG

// Using Koyeb environment variables directly
console.log("LOG: Using system environment variables");

/**
 * Scrapes product details from a given URL using Firecrawl's v1/scrape API
 * @param {string} productUrl - The URL of the product to scrape
 * @param {string} apiKey - Your Firecrawl API key
 * @returns {Promise<Object|null>} - A promise that resolves to the product details or throws on critical failure
 */
async function scrapeProductDetails(productUrl, apiKey) {
  console.log("LOG: scrapeProductDetails function started.");
  try {
    // Validate inputs
    if (!productUrl || typeof productUrl !== 'string') {
      console.error("ERROR: Product URL is required and must be a string.");
      throw new Error('Product URL is required and must be a string');
    }
    if (!apiKey || typeof apiKey !== 'string') {
      console.error("ERROR: Firecrawl API key is required and must be a string.");
      throw new Error('Firecrawl API key is required and must be a string');
    }

    console.log(`LOG: Starting product scraping for ${productUrl} using v1/scrape with jsonOptions.`);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: productUrl,
        formats: ["json"],
        jsonOptions: {
          prompt: 'Extract the following product details. Respond with ONLY the JSON object, no other text. ' +
                  '{"name": "full product name", ' +
                  '"company": "brand or manufacturer name (null if not found)", ' +
                  '"category": "general product category (e.g., Electronics, Clothing)", ' +
                  '"subcategory": "specific sub-category (null if not found)", ' +
                  '"price": 123.45, ' +
                  '"currency_code": "ISO 4217 currency code (e.g., USD, INR, EUR, null if not found)", ' +
                  '"currency_symbol": "currency symbol (e.g., $, ₹, €, null if not found)", ' +
                  '"country_code": "ISO 3166-1 alpha-2 country code (e.g., US, IN, GB, null if not found, inferred from page context or currency)", ' +
                  '"description": "concise product description", ' +
                  '"product_image_url": "direct URL to the main product image (null if not found)"}'
        }
      })
    };

    console.log("LOG: Sending request to FireCrawl v1/scrape API...");
    
    let response;
    try {
        response = await fetch('https://api.firecrawl.dev/v1/scrape', requestOptions);
    } catch (fetchError) {
        console.error("FATAL ERROR: fetch() call failed. This might be a network issue, an issue with Node's fetch (check Node version >= 18), or Firecrawl API endpoint problem.", fetchError);
        throw fetchError; // Re-throw to be caught by the outer try-catch
    }


    console.log(`LOG: Received response for ${productUrl} with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ERROR: FireCrawl API Error for ${productUrl}: ${response.status}`, errorText);
      throw new Error(`Scraping failed for ${productUrl} with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data || !data.data.json) {
      console.error('ERROR: FireCrawl API v1/scrape response missing data.json or success is false:', data);
      throw new Error('No product details (data.json) found in FireCrawl v1/scrape API response or request failed.');
    }

    const productDetails = data.data.json;

    if (!productDetails) {
      console.error('ERROR: Extracted product details (data.json) are null or undefined.');
      throw new Error('Extracted product details (data.json) are null or undefined.');
    }

    console.log(`LOG: Raw extracted product details for ${productUrl}:`, JSON.stringify(productDetails, null, 2));

    const processedDetails = {
      name: productDetails.name || null,
      company: productDetails.company || null,
      category: productDetails.category || "Unknown",
      subcategory: productDetails.subcategory || null,
      price: processPrice(productDetails.price),
      currency_code: productDetails.currency_code ? String(productDetails.currency_code).toUpperCase() : null,
      currency_symbol: productDetails.currency_symbol || productDetails.currency || "$",
      country_code: productDetails.country_code ? String(productDetails.country_code).toUpperCase() : null,
      market: productDetails.market || productDetails.country_code || null,
      currency: productDetails.currency_symbol || productDetails.currency || "$",
      description: productDetails.description || null,
      product_image_url: productDetails.product_image_url || productDetails.product_image || null
    };

    if (!processedDetails.name || processedDetails.price === null || isNaN(processedDetails.price)) {
      console.error("ERROR: Missing essential product details (name or valid price) after processing:", processedDetails);
      throw new Error('Missing essential product details (name or price) from scrape.');
    }

    if (!processedDetails.currency_code) {
        console.warn(`WARNING: currency_code is missing for ${productUrl}. Competitor search accuracy might be affected.`);
    }
    if (!processedDetails.country_code) {
        console.warn(`WARNING: country_code is missing for ${productUrl}. Competitor search accuracy might be affected.`);
    }
    if (processedDetails.category === "Unknown") {
        console.warn(`WARNING: category is "Unknown" for ${productUrl}. Competitor search accuracy might be affected.`);
    }

    console.log(`LOG: Processed product details for ${productUrl}:`, JSON.stringify(processedDetails, null, 2));
    return processedDetails;

  } catch (error) {
    // Logged where it's thrown, or in the fetch catch block
    console.error(`ERROR in scrapeProductDetails's main try-catch for ${productUrl}: ${error.message}`);
    // Add stack trace for more details
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
    throw error;
  }
}

function processPrice(price) {
  // console.log("LOG: processPrice called with:", price); // Optional: uncomment for very detailed price debugging
  if (price === null || price === undefined) {
    return null;
  }
  if (typeof price === 'number') {
    return price;
  }
  if (typeof price === 'string') {
    const numericPrice = price.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(numericPrice);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// Export the function for use in other modules
module.exports = {
  scrapeProductDetails
};

// CLI execution block - only runs when file is called directly
if (require.main === module) {
  console.log("LOG: CLI execution block started.");

  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  console.log(`LOG: FIRECRAWL_API_KEY from env: '${FIRECRAWL_API_KEY ? "********" : "NOT FOUND/EMPTY"}'`); // Mask key for logging

  if (!FIRECRAWL_API_KEY) {
    console.error("ERROR: FIRECRAWL_API_KEY is not set in environment variables.");
    console.error("Please set the FIRECRAWL_API_KEY environment variable before running this script.");
    process.exitCode = 1; // Use exitCode to allow logs to flush
    return; // Exit after setting code
  }

 
  const args = process.argv.slice(2);
  console.log("LOG: Command line arguments received:", args);

  if (args.length < 1) {
    console.log('Usage: node ProductScraperLim.js "ProductURL"');
    console.log('Example: node ProductScraperLim.js "https://www.amazon.com/dp/B0863FR3S9"');
    process.exitCode = 1;
    return;
  }

  const productUrl = args[0];

  console.log(`LOG: Attempting to scrape: ${productUrl}`);
  console.log("LOG: Using Firecrawl API Key (status logged above).");

  scrapeProductDetails(productUrl, FIRECRAWL_API_KEY)
    .then(result => {
      console.log("LOG: scrapeProductDetails promise resolved.");
      if (result) {
        console.log("\nSUCCESS: Scraped Product Details:");
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.warn("\nWARNING: scrapeProductDetails resolved but returned no result (null/undefined). This case should ideally not happen if errors are thrown.");
      }
    })
    .catch(error => {
      console.error('\nFATAL CLI ERROR: Error during scraping operation:', error.message);
      if (error.stack) {
          console.error("CLI Error Stack Trace:", error.stack);
      }
      process.exitCode = 1;
      // Add a small delay to help ensure logs flush, especially on Windows
      setTimeout(() => { /* process will exit due to exitCode */ }, 100);
    });

  // Handle unhandled rejections specifically, though the .catch above should get most.
  process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION: At:', promise, 'reason:', reason);
    if (reason.stack) {
        console.error("Stack:", reason.stack);
    }
    process.exitCode = 1;
    setTimeout(() => { /* process will exit due to exitCode */ }, 100);
  });

  process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err.message);
    if (err.stack) {
        console.error("Stack:", err.stack);
    }
    process.exitCode = 1;
    setTimeout(() => { /* process will exit due to exitCode */ }, 100);
  });
}