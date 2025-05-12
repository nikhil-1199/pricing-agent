// CompetitorFinder.js
// A Node.js program that finds top 5 competitors for a given product and returns purchase URLs

// Make dotenv optional
try {
  require('dotenv').config();
  console.log("LOG: dotenv loaded successfully, but will prioritize system environment variables");
} catch (err) {
  console.log("LOG: dotenv not available, using system environment variables only");
}

const axios = require('axios');
const { getCountry } = require('countries-and-timezones');

// Get API keys directly from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function findCompetitors(
  productName,
  company,
  category,
  price,
  currencyCode,
  countryCode
) {
  try {
    // Check API keys at runtime
    if (!PERPLEXITY_API_KEY) {
      return { error: "PERPLEXITY_API_KEY environment variable is not set" };
    }
    if (!SERPER_API_KEY) {
      return { error: "SERPER_API_KEY environment variable is not set" };
    }
    
  // Convert country code to name
    let countryName;
    try {
      const country = getCountry(countryCode);
      if (!country) {
        throw new Error(`Country not found for code: ${countryCode}`);
      }
      countryName = country.name;
    } catch (error) {
      console.error(`Error converting country code ${countryCode} to name:`, error);
      return { error: `Invalid country code: ${countryCode}` };
    }

    // Ensure category is formatted properly
    const categoryFormatted = category || "general";

    // Step 1: Find top 5 competitors using Perplexity
    const competitors = await findTopCompetitors(
      productName,
      price,
      currencyCode,
      countryName,
      categoryFormatted
    );

    if (!competitors || !competitors.product_names || competitors.product_names.length === 0) {
      return { error: "Failed to find competitors" };
    }

    // Step 2-3: Find purchase URLs for each competitor
    const urls = await findPurchaseUrls(competitors.product_names, countryCode, countryName, categoryFormatted);

    return { urls };
  } catch (error) {
    console.error("Error in findCompetitors:", error);
    return { error: error.message || "Unknown error occurred" };
  }
}

async function findTopCompetitors(productName, price, currencyCode, countryName, category) {
  try {
    // Create prompt for Perplexity with specific price bracket definition
    const prompt = `Who are the top 5 competitors of "${productName}" which costs ${currencyCode} ${price} in ${countryName} in the ${category} category? Consider only those products that compete directly with said product in ${countryName}, which belong to a different brand and are in the same price bracket (defined as within ±15% of the product's price: ${currencyCode} ${(price * 0.85).toFixed(2)} to ${currencyCode} ${(price * 1.15).toFixed(2)}). Give me only the product names in json format like: {"product_names": ["prod 1", "prod 2",...]}.  Do not include any additional reasoning text.  Do not return multiple jsons.`;

    console.log("Querying Perplexity for competitors...");
    console.log(prompt);
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro', // Upgraded to Sonar Pro model
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse JSON from response
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No valid JSON found in response");
      }
      
      const jsonContent = content.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse JSON from Perplexity response:", parseError);
      console.log("Raw response:", content);
      throw new Error("Invalid response format from Perplexity");
    }
  } catch (error) {
    console.error("Error in findTopCompetitors:", error);
    if (error.response) {
      console.error("API response error:", error.response.data);
    }
    throw error;
  }
}

async function findPurchaseUrls(competitorProducts, countryCode, countryName, category) {
  const urls = [];

  for (const product of competitorProducts) {
    try {
      console.log(`Finding purchase URL for: ${product}`);
      
      // Step 2.1: Call Serper search API
      const searchQuery = `Buy "${product}" from ${category} category in ${countryName}`;
      const serperResponse = await axios.post(
        'https://google.serper.dev/search',
        {
          q: searchQuery,
          gl: countryCode
        },
        {
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      // Filter Serper results to only include relevant fields
      const filteredSerperData = {
        searchParameters: serperResponse.data.searchParameters,
        organic: serperResponse.data.organic || [],
        answerBox: serperResponse.data.answerBox || {}
      };

      // Step 2.2: Call Perplexity to extract the URL
      const systemPrompt = `From this list of search results representing where I can buy a certain product, return exactly one URL that can be used to purchase the product. In case there are many URL's that qualify, pick one that points to the specific product mentioned in the searchParameters and ignore links that may be pointing to a product category (the presence of an exact price in the search results normally denotes a specific product). Return just the url string without any referrer codes in json format like {"url": "https://example.com/product1"}. If no url is suitable for purchasing the product, return an empty json.`;
      console.log(JSON.stringify(filteredSerperData));	    
      const perplexityResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro', // Upgraded to Sonar Pro model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(filteredSerperData) }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          }
        }
      );

      const content = perplexityResponse.data.choices[0].message.content;
      
      // Parse JSON from response
      try {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === -1) {
          console.warn(`No valid JSON found in Perplexity response for ${product}`);
          continue;
        }
        
        const jsonContent = content.substring(jsonStart, jsonEnd);
        const urlData = JSON.parse(jsonContent);
        
        if (urlData.url && urlData.url.startsWith('http')) {
          urls.push(urlData.url);
        } else {
          console.warn(`No valid URL found for competitor: ${product}`);
        }
      } catch (parseError) {
        console.error(`Failed to parse URL JSON for ${product}:`, parseError);
      }
    } catch (error) {
      console.error(`Error processing competitor ${product}:`, error);
    }
  }

  return urls;
}

// Example usage as a module
module.exports = findCompetitors;

// Example usage as a standalone script
if (require.main === module) {
  // Parse command line arguments if called directly
  const args = process.argv.slice(2);
  
  if (args.length < 6) {
    console.log('Usage: node CompetitorFinder.js "Product Name" "Company" "Category/SubCategory" Price Currency_code Country_code');
    process.exit(1);
  }

  const [productName, company, category, price, currencyCode, countryCode] = args;

  findCompetitors(productName, company, category, price, currencyCode, countryCode)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}