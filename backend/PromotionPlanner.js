// PromotionPlanner.js - With Perplexity integration for dynamic promotional suggestions
// This version properly handles currencies and product details

class PromotionPlanner {
    constructor() {
      console.log('PromotionPlanner initialized');
    }
  
    async generatePromotionalCalendar(options = {}) {
      try {
        console.log('Generating promotional calendar with options:', options);
        
        // Extract all options with robust defaults for any missing fields
        // Prioritize currency information from the product data with clear fallbacks
        const currencyCode = options.currencyCode || options.currency_code || 'USD';
        const currencySymbol = options.currencySymbol || options.currency_symbol || '';
        
        const { 
          category = "GENERAL", 
          country = "Global", 
          subCategory = "", 
          productName = 'Product',
          productPrice = 0,
          productionCost = productPrice * 0.6,
          targetMargin = 20,
          competitors = []
        } = options;
        
        console.log(`Using currency: ${currencySymbol} (${currencyCode}) for promotions`);
        
        // Use Perplexity to generate promotional calendar data
        const perplexityParams = {
          productName,
          category,
          subCategory,
          country,
          currencyCode,
          currencySymbol,
          productPrice,
          productionCost,
          targetMargin,
          competitors: Array.isArray(competitors) ? competitors.join(", ") : ""
        };
        
        console.log('Sending data to Perplexity:', JSON.stringify(perplexityParams, null, 2));
        const perplexityData = await this.callPerplexity(perplexityParams);
        
        // If we have a valid response from Perplexity, use it
        if (perplexityData) {
          console.log("Successfully generated promotional calendar using Perplexity AI");
          
          // Ensure currency information is correctly set in the response
          // If Perplexity didn't include it, add it from our input
          if (!perplexityData.currencyCode || perplexityData.currencyCode === 'USD' && currencyCode !== 'USD') {
            perplexityData.currencyCode = currencyCode;
          }
          
          if (!perplexityData.currencySymbol) {
            perplexityData.currencySymbol = currencySymbol;
          }
          
          // Fix currency issues in all promotions too
          if (perplexityData.promotionSuggestions && Array.isArray(perplexityData.promotionSuggestions)) {
            perplexityData.promotionSuggestions.forEach(promo => {
              if (!promo.currencyCode || promo.currencyCode === 'USD' && currencyCode !== 'USD') {
                promo.currencyCode = currencyCode;
              }
              if (!promo.currencySymbol) {
                promo.currencySymbol = currencySymbol;
              }
            });
          }
          
          return perplexityData;
        } else {
          // Fall back to the default calendar if Perplexity fails
          console.log("Using fallback promotional calendar");
          return this.getFallbackCalendar({
            category,
            country,
            subCategory,
            currencyCode,
            currencySymbol,
            productName,
            productPrice,
            productionCost,
            targetMargin
          });
        }
      } catch (error) {
        console.error("Error in PromotionPlanner.generatePromotionalCalendar:", error);
        return this.getFallbackCalendar(options);
      }
    }
    
    async callPerplexity(params) {
      try {
        // Sanitize params to handle empty values gracefully
        const { 
          productName = "Product", 
          category = "GENERAL", 
          subCategory = "", 
          country = "Global", 
          currencyCode = "USD", 
          currencySymbol = "",
          productPrice = 0,
          productionCost = 0,
          targetMargin = 20,
          competitors = ""
        } = params;
        
        // Sanitize values to prevent "undefined" or "null" from appearing in the prompt
        const safeProductName = productName || "Product";
        const safeCategory = category || "GENERAL";
        const safeSubCategory = subCategory || ""; 
        const safeCountry = country || "Global";
        const safeCompetitors = competitors || "No specific competitors";
        
        // Make sure we have valid currency information
        const safeCurrencyCode = currencyCode || "USD";
        // If no symbol is provided but we have a code, use the code as a fallback
        const safeCurrencySymbol = currencySymbol || this.getCurrencySymbolForCode(safeCurrencyCode);
        
        // Format price values with currency information for the prompt
        const formattedPrice = this.formatPriceWithCurrency(productPrice, safeCurrencySymbol, safeCurrencyCode);
        const formattedCost = this.formatPriceWithCurrency(productionCost, safeCurrencySymbol, safeCurrencyCode);
        
        // Construct the Perplexity prompt with optional fields handled gracefully
        let prompt = `
  Create a data-driven promotional calendar for a ${safeProductName} in the ${safeCategory} category`;
  
        // Only add subcategory if it exists
        if (safeSubCategory) {
          prompt += ` (subcategory: ${safeSubCategory})`;
        }
        
        prompt += ` in ${safeCountry}.
  
  Product details:
  - Current price: ${formattedPrice}`;
  
        // Only add production cost if it's greater than 0
        if (productionCost > 0) {
          prompt += `
  - Production cost: ${formattedCost}`;
        }
  
        prompt += `
  - Target profit margin: ${targetMargin}%`;
        
        // Only add competitors if they exist
        if (safeCompetitors && safeCompetitors !== "No specific competitors") {
          prompt += `
  - Key competitors: ${safeCompetitors}`;
        }
  
        prompt += `
  
  First, analyze:
  1. Category seasonality`;
        
        // Add region-specific analysis if we have a specific country
        if (safeCountry !== "Global") {
          prompt += ` in ${safeCountry}`;
        }
        
        prompt += `
  2. Product lifecycle stage (new launch, growth, maturity, decline)
  3. Competitive landscape and pricing strategies
  4. Distribution channels (online vs. offline) effectiveness
  
  Then, design a promotional calendar with the following structure (return as JSON only):
  {
    "currencyCode": "${safeCurrencyCode}",
    "currencySymbol": "${safeCurrencySymbol}",
    "productInfo": {
      "name": "${safeProductName}",
      "category": "${safeCategory}",`;
        
        // Only include subcategory if it exists
        if (safeSubCategory) {
          prompt += `
      "subCategory": "${safeSubCategory}",`;
        }
        
        prompt += `
      "lifecycleStage": "stage of product lifecycle"
    },
    "baseRecommendedPrice": ${productPrice},
    "seasonalInsights": {
      "categorySeasonality": "Description of demand fluctuations",
      "peakShoppingWindows": [
        {
          "name": "Name of shopping season/event",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "reason": "Why this period sees higher demand",
          "expectedSalesLift": "Estimated percentage increase"
        }
      ]
    },
    "promotionSuggestions": [
      {
        "type": "Type of promotion",
        "details": "Specific description",
        "promotionalPrice": discounted price as number,
        "originalPrice": ${productPrice},
        "discountValue": discount amount as number,
        "discountUnit": "% or fixed amount",
        "marginImpact": "Change to profit margin",
        "durationDays": number of days,
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "channel": "e-commerce/retail/both",
        "timing": "Strategic timing rationale",
        "reasoning": "Strategic business rationale",
        "budgetEstimate": estimated promotional budget,
        "targetKPI": "Primary success metric",
        "expectedROI": "Estimated return on promotional investment",
        "currencySymbol": "${safeCurrencySymbol}",
        "currencyCode": "${safeCurrencyCode}"
      }
    ],`;
        
        // Only include competitor insights if we have competitors
        if (safeCompetitors && safeCompetitors !== "No specific competitors") {
          prompt += `
    "competitorInsights": [
      {
        "competitorName": "Name of competitor product",
        "price": competitor price,
        "promotionalTrends": "Their typical promotional strategy",
        "howToCounter": "Strategic recommendation"
      }
    ]`;
        } else {
          prompt += `
    "competitorInsights": []`;
        }
        
        prompt += `
  }
  
  Include 3-4 different promotion suggestions distributed strategically throughout the year. Focus on maximizing profit while maintaining competitiveness. Use real dates in 2025.
  
  Return only the valid JSON object.
        `;
        
        console.log("Sending query to Perplexity API...");
        
        // Here's where you would make the actual API call
        // const response = await fetch('https://api.perplexity.ai/query', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_API_KEY' },
        //   body: JSON.stringify({ query: prompt })
        // });
        // const data = await response.json();
        
        // For now, simulate a successful response with a mock
        // In production, replace this with the actual API call
        const simulatedResponse = this.simulatePerplexityResponse(params);
        
        // Parse JSON response - in production, you'd parse the actual API response
        return simulatedResponse;
        
      } catch (error) {
        console.error("Error calling Perplexity API:", error);
        return null;
      }
    }
    
    // Get currency symbol for a code if missing
    getCurrencySymbolForCode(code) {
      const symbolMap = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'RUB': '₽',
        'HKD': 'HK$'
      };
      
      return symbolMap[code] || code;
    }
    
    // Format price with currency in a proper localized format
    formatPriceWithCurrency(price, symbol, code) {
      if (!price || isNaN(price)) return '0';
      
      // Format the number based on currency code
      const formattedNumber = this.formatCurrencyValue(price, code);
      
      // Currency symbols that typically appear before the amount 
      const prefixSymbols = ['$', '£', '€', '¥', '₩', '฿', '₴', '₦', 'R$', 'C$', 'A$', 'HK$', 'S$'];
      
      // Position symbol correctly based on common conventions
      if (symbol && prefixSymbols.includes(symbol)) {
        return `${symbol}${formattedNumber}`;
      } else if (symbol) {
        return `${formattedNumber} ${symbol}`;
      } else {
        // If no symbol, use the code
        return `${formattedNumber} ${code}`;
      }
    }
    
    // This is a temporary function to simulate Perplexity response
    // In production, this would be replaced with the actual API call
    simulatePerplexityResponse(params) {
      const { 
        productName, 
        category, 
        subCategory, 
        country, 
        currencyCode, 
        currencySymbol,
        productPrice
      } = params;
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Use provided currency or get a symbol based on code
      const effectiveCurrencySymbol = currencySymbol || this.getCurrencySymbolForCode(currencyCode);
      
      // Base response structure that applies to any product
      return {
        currencyCode: currencyCode,
        currencySymbol: effectiveCurrencySymbol,
        productInfo: {
          name: productName,
          category: category,
          subCategory: subCategory,
          lifecycleStage: "Growth",
          currencyCode: currencyCode,
          currencySymbol: effectiveCurrencySymbol
        },
        baseRecommendedPrice: productPrice,
        seasonalInsights: {
          categorySeasonality: `${category} products typically see demand fluctuations throughout the year with peak periods during key shopping seasons.`,
          peakShoppingWindows: [
            {
              name: "Holiday Season",
              startDate: `${currentYear}-11-15`,
              endDate: `${currentYear}-12-25`,
              reason: "Increased gift-giving during holiday period",
              expectedSalesLift: "25%"
            },
            {
              name: this.getCountrySpecificEvent(country),
              startDate: this.getCountrySpecificDates(country).start,
              endDate: this.getCountrySpecificDates(country).end,
              reason: `Major shopping event in ${country}`,
              expectedSalesLift: "20%"
            }
          ]
        },
        promotionSuggestions: [
          {
            type: "Standard Discount",
            details: "10% off recommended price",
            promotionalPrice: this.formatCurrencyValue(productPrice * 0.9, currencyCode),
            originalPrice: productPrice,
            discountValue: 10,
            discountUnit: "%",
            marginImpact: "Maintains acceptable margins",
            durationDays: 7,
            startDate: formatDate(new Date(currentDate.setDate(currentDate.getDate() + 14))),
            endDate: formatDate(new Date(currentDate.setDate(currentDate.getDate() + 21))),
            channel: "both",
            timing: "General offer that can be run anytime with moderate impact",
            reasoning: "Standard discount to attract price-sensitive customers",
            budgetEstimate: this.formatCurrencyValue(productPrice * 0.05 * 1000, currencyCode),
            targetKPI: "Sales volume",
            expectedROI: "2.5x",
            currencySymbol: effectiveCurrencySymbol,
            currencyCode: currencyCode
          },
          {
            type: "Seasonal Promotion",
            details: "15% off for holiday season",
            promotionalPrice: this.formatCurrencyValue(productPrice * 0.85, currencyCode),
            originalPrice: productPrice,
            discountValue: 15,
            discountUnit: "%",
            marginImpact: "Reduced but justified by volume",
            durationDays: 14,
            startDate: `${currentYear}-11-15`,
            endDate: `${currentYear}-11-29`,
            channel: "e-commerce",
            timing: "Aligns with holiday shopping season",
            reasoning: "Take advantage of increased buying intent",
            budgetEstimate: this.formatCurrencyValue(productPrice * 0.08 * 2000, currencyCode),
            targetKPI: "Market share",
            expectedROI: "3.2x",
            currencySymbol: effectiveCurrencySymbol,
            currencyCode: currencyCode
          }
        ],
        competitorInsights: [
          {
            competitorName: "Primary Competitor",
            price: this.formatCurrencyValue(productPrice * 0.9, currencyCode),
            promotionalTrends: "Aggressive discounting during key seasons",
            howToCounter: "Focus on product quality and value-adds"
          }
        ]
      };
    }
    
    // Helper methods to generate some country-specific data for the simulation
    getCountrySpecificEvent(country) {
      const events = {
        'US': 'Black Friday',
        'IN': 'Diwali Festival',
        'GB': 'Boxing Day',
        'CN': 'Singles Day',
        'JP': 'Golden Week',
        'DE': 'Pre-Christmas Shopping',
        'FR': 'Bastille Day Sales',
        'BR': 'Black Friday Brazil',
        'AU': 'Boxing Day'
      };
      return events[country] || 'Mid-Year Sale';
    }
    
    getCountrySpecificDates(country) {
      const currentYear = new Date().getFullYear();
      const dates = {
        'US': { start: `${currentYear}-11-25`, end: `${currentYear}-12-02` },
        'IN': { start: `${currentYear}-10-15`, end: `${currentYear}-11-05` },
        'GB': { start: `${currentYear}-12-26`, end: `${currentYear}-01-05` },
        'CN': { start: `${currentYear}-11-11`, end: `${currentYear}-11-13` },
        'JP': { start: `${currentYear}-04-29`, end: `${currentYear}-05-05` },
        'DE': { start: `${currentYear}-11-30`, end: `${currentYear}-12-20` },
        'FR': { start: `${currentYear}-07-10`, end: `${currentYear}-07-18` },
        'BR': { start: `${currentYear}-11-25`, end: `${currentYear}-11-30` },
        'AU': { start: `${currentYear}-12-26`, end: `${currentYear}-01-05` }
      };
      return dates[country] || { start: `${currentYear}-06-15`, end: `${currentYear}-06-30` };
    }
    
    // Format currency value based on currency code
    formatCurrencyValue(value, currencyCode) {
      if (!value || isNaN(value)) return 0;
      
      // Currencies that don't use decimal places
      if (['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ISK', 'HUF', 'TWD'].includes(currencyCode)) {
        return Math.round(value);
      }
      
      // Most currencies use 2 decimal places
      return parseFloat(value.toFixed(2));
    }
    
    // Fallback promotional calendar with proper currency handling
    getFallbackCalendar(options) {
      const { 
        category = "GENERAL", 
        country = "Global", 
        subCategory = "", 
        currencyCode = options.currency_code || 'USD', 
        currencySymbol = options.currency_symbol || '',
        productName = 'Product',
        productPrice = 0
      } = options;
      
      // Get a currency symbol if one isn't provided
      const effectiveCurrencySymbol = currencySymbol || this.getCurrencySymbolForCode(currencyCode);
      
      const currentDate = new Date();
      
      const oneMonthLater = new Date(currentDate);
      oneMonthLater.setMonth(currentDate.getMonth() + 1);
      
      const threeMonthsLater = new Date(currentDate);
      threeMonthsLater.setMonth(currentDate.getMonth() + 3);
      
      return {
        currencyCode: currencyCode,
        currencySymbol: effectiveCurrencySymbol,
        
        productInfo: {
          id: "product-id",
          name: productName,
          category: category,
          subCategory: subCategory,
          currencyCode: currencyCode,
          currencySymbol: effectiveCurrencySymbol
        },
        baseRecommendedPrice: this.formatCurrencyValue(productPrice, currencyCode),
        promotionSuggestions: [
          {
            type: "Standard Discount",
            details: "10% off recommended price",
            promotionalPrice: this.formatCurrencyValue(productPrice * 0.9, currencyCode),
            originalPrice: this.formatCurrencyValue(productPrice, currencyCode),
            discountValue: 10,
            discountUnit: "%",
            estimatedMargin: 0,
            startDate: formatDate(oneMonthLater),
            endDate: formatDate(new Date(oneMonthLater.getTime() + 7 * 24 * 60 * 60 * 1000)),
            durationDays: 7,
            timing: "General promotion that can be run anytime",
            budgetEstimate: 0,
            reasoning: "Standard discount to generate sales and interest",
            currencySymbol: effectiveCurrencySymbol,
            currencyCode: currencyCode
          },
          {
            type: "Seasonal Promotion",
            details: "15% off for seasonal event",
            promotionalPrice: this.formatCurrencyValue(productPrice * 0.85, currencyCode),
            originalPrice: this.formatCurrencyValue(productPrice, currencyCode),
            discountValue: 15,
            discountUnit: "%",
            estimatedMargin: 0,
            startDate: formatDate(threeMonthsLater),
            endDate: formatDate(new Date(threeMonthsLater.getTime() + 14 * 24 * 60 * 60 * 1000)),
            durationDays: 14,
            timing: "Align with upcoming seasonal demand",
            budgetEstimate: 0,
            reasoning: "Take advantage of seasonal buying patterns",
            currencySymbol: effectiveCurrencySymbol,
            currencyCode: currencyCode
          }
        ],
        seasonalInsights: {
          categorySeasonality: `${category} products typically see demand fluctuations throughout the year.`,
          peakShoppingWindows: [
            {
              name: "Holiday Season",
              startDate: "2025-11-15",
              endDate: "2025-12-25",
              reason: "Increased gift-giving during holiday period",
              expectedSalesLift: "20%"
            }
          ]
        }
      };
    }
  }
  
  // Helper function to format dates as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  module.exports = { PromotionPlanner };