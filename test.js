// test.js - Simple test script for the product scraper
const { scrapeProductDetails } = require('./ProductScraperLim');
const dotenv = require('dotenv');

//test
// Load environment variables
dotenv.config();

async function runTests() {
    console.log('Starting product scraper tests...\n');
    
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    
    if (!FIRECRAWL_API_KEY) {
        console.error('ERROR: FIRECRAWL_API_KEY is not set in environment variables');
        process.exit(1);
    }
    
    // Test URLs - you can add more test cases here
    const testUrls = [
        'https://www.amazon.com/dp/B0863FR3S9',  // Example Amazon product
        // Add more test URLs here as needed
    ];
    
    for (const url of testUrls) {
        console.log(`\n=== Testing URL: ${url} ===`);
        
        try {
            const details = await scrapeProductDetails(url, FIRECRAWL_API_KEY);
            console.log('SUCCESS: Product details scraped successfully');
            console.log('Product Name:', details.name);
            console.log('Company:', details.company);
            console.log('Price:', `${details.currency_symbol}${details.price}`);
            console.log('Category:', details.category);
            console.log('Country:', details.country_code);
            console.log('\nFull details:', JSON.stringify(details, null, 2));
        } catch (error) {
            console.error('ERROR: Failed to scrape product details');
            console.error('Error message:', error.message);
        }
    }
    
    console.log('\n=== Tests completed ===');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('Fatal error during testing:', error);
        process.exit(1);
    });
}

module.exports = { runTests };