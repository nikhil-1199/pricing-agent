// PricingEngine.js - Standalone version with proper currency handling
// This is a simplified implementation without requiring external modules

class PricingEngine {
    constructor(productionCost, salesPerMonth, targetMargin, currentPrice, competitorPrices) {
      this.productionCost = parseFloat(productionCost);
      this.salesPerMonth = parseInt(salesPerMonth);
      this.targetMargin = parseFloat(targetMargin);
      this.currentPrice = parseFloat(currentPrice);
      this.competitorPrices = Array.isArray(competitorPrices) 
        ? competitorPrices.map(price => parseFloat(price)).filter(price => !isNaN(price))
        : [];
      
      // Currency information will be added via setProductDetails
      this.currencyCode = 'USD';
      this.currencySymbol = '$';
      
      // Debugging
      console.log('PricingEngine initialized with:', {
        productionCost: this.productionCost,
        salesPerMonth: this.salesPerMonth,
        targetMargin: this.targetMargin,
        currentPrice: this.currentPrice,
        competitorPrices: this.competitorPrices.length > 0 ? this.competitorPrices : 'None'
      });
    }
    
    // Add method to set product details including currency
    setProductDetails(details) {
      if (!details) return;
      
      this.productName = details.name || 'Product';
      this.productCategory = details.category || 'General';
      this.currencyCode = details.currency_code || 'USD';
      this.currencySymbol = details.currency_symbol || details.currency || '$';
      
      console.log('Product details set with currency:', this.currencyCode, this.currencySymbol);
    }
    
    // Format currency value based on currency code
    formatCurrencyValue(value) {
      if (!value || isNaN(value)) return 0;
      
      // Currencies that don't use decimal places
      if (['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ISK', 'HUF', 'TWD'].includes(this.currencyCode)) {
        return Math.round(value);
      }
      
      // Currencies that use 3 decimal places
      if (['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'].includes(this.currencyCode)) {
        return parseFloat(value.toFixed(3));
      }
      
      // Most currencies use 2 decimal places
      return parseFloat(value.toFixed(2));
    }
    
    async getProductStrategies() {
      try {
        console.log('Generating pricing strategy...');
        
        // Basic calculations
        const avgCompPrice = this.competitorPrices.length > 0 
          ? this.competitorPrices.reduce((a, b) => a + b, 0) / this.competitorPrices.length 
          : this.currentPrice;
        
        const minCompPrice = this.competitorPrices.length > 0 
          ? Math.min(...this.competitorPrices) 
          : this.currentPrice * 0.8;
        
        const maxCompPrice = this.competitorPrices.length > 0 
          ? Math.max(...this.competitorPrices) 
          : this.currentPrice * 1.2;
        
        // Calculate minimum price needed for desired margin
        const minMarginPrice = this.productionCost / (1 - (this.targetMargin / 100));
        
        // Calculate price range
        const priceRange = {
          min: this.formatCurrencyValue(Math.max(minMarginPrice * 0.9, minCompPrice * 0.9, this.productionCost * 1.1)),
          max: this.formatCurrencyValue(Math.max(minMarginPrice * 1.3, avgCompPrice * 1.2))
        };
        
        // Different strategies
        const strategies = {
          // Base strategy: balanced approach
          balanced: {
            name: "Balanced Pricing",
            description: "A balanced approach considering both margin requirements and market competitiveness",
            price: this.formatCurrencyValue((minMarginPrice + avgCompPrice) / 2)
          },
          
          // Value strategy: compete on price (lower end)
          value: {
            name: "Value Pricing",
            description: "Position as a value product with competitive lower price",
            price: this.formatCurrencyValue(Math.max(minMarginPrice * 1.05, avgCompPrice * 0.9))
          },
          
          // Premium strategy: higher price, perceived quality
          premium: {
            name: "Premium Pricing",
            description: "Position as a premium product with higher price",
            price: this.formatCurrencyValue(Math.max(maxCompPrice * 1.05, avgCompPrice * 1.15))
          }
        };
        
        // Choose optimal strategy based on conditions
        let optimalStrategy;
        
        // If high margin potential and market allows (premium)
        if (this.targetMargin > 35 && avgCompPrice > this.productionCost * 2) {
          optimalStrategy = strategies.premium;
        }
        // If tight competition and lower margins (value)
        else if (this.competitorPrices.length > 2 && this.targetMargin < 25) {
          optimalStrategy = strategies.value;
        }
        // Default to balanced
        else {
          optimalStrategy = strategies.balanced;
        }
        
        // Ensure optimal price is within range
        const recommendedPrice = Math.min(
          Math.max(optimalStrategy.price, priceRange.min),
          priceRange.max
        );
        
        // Calculate actual margin percentage
        const actualMargin = calculateMargin(recommendedPrice, this.productionCost);
        
        // Determine market positioning
        const relativeToAverage = avgCompPrice > 0 
          ? ((recommendedPrice - avgCompPrice) / avgCompPrice) * 100 
          : 0;
        
        let positioning;
        if (relativeToAverage > 10) positioning = "Premium";
        else if (relativeToAverage < -10) positioning = "Value";
        else positioning = "Mid-Range";
        
        // Create insights based on data
        let insights = "Based on analysis of ";
        if (this.competitorPrices.length > 0) {
          insights += `${this.competitorPrices.length} competitors with average price of ${this.currencySymbol}${avgCompPrice.toFixed(2)}, `;
        }
        insights += `and target margin of ${this.targetMargin}%, the recommended pricing strategy is ${optimalStrategy.name}. `;
        
        if (actualMargin < this.targetMargin) {
          insights += `Note that the achievable margin (${actualMargin.toFixed(2)}%) is below your target. Consider reducing costs or adjusting your margin expectations.`;
        } else {
          insights += `This pricing achieves your target margin while maintaining market competitiveness.`;
        }
        
        // Return formatted response with currency information
        return {
          currentPrice: this.currentPrice,
          optimizedPrice: recommendedPrice,
          competitorsPriceRange: {
            min: minCompPrice,
            max: maxCompPrice
          },
          marginAnalysis: {
            productCost: this.productionCost,
            targetMargin: this.targetMargin,
            actualMargin: actualMargin
          },
          optimizedStrategy: {
            name: optimalStrategy.name,
            description: optimalStrategy.description
          },
          alternativeStrategies: [
            {
              name: strategies.value.name,
              description: strategies.value.description,
              price: strategies.value.price,
              margin: calculateMargin(strategies.value.price, this.productionCost)
            },
            {
              name: strategies.premium.name,
              description: strategies.premium.description,
              price: strategies.premium.price,
              margin: calculateMargin(strategies.premium.price, this.productionCost)
            }
          ],
          insights: insights,
          competitivePosition: {
            relativeToAverage: relativeToAverage,
            positioning: positioning
          },
          // Add currency information to the response
          currencyCode: this.currencyCode,
          currencySymbol: this.currencySymbol
        };
      } catch (error) {
        console.error("Error in PricingEngine.getProductStrategies:", error);
        
        // Provide a fallback response in case of error
        return this.getFallbackStrategy();
      }
    }
    
    // Fallback strategy if any errors occur
    getFallbackStrategy() {
      const avgCompPrice = this.competitorPrices.length > 0 
        ? this.competitorPrices.reduce((a, b) => a + b, 0) / this.competitorPrices.length 
        : this.currentPrice;
      
      const minPrice = this.competitorPrices.length > 0 
        ? Math.min(...this.competitorPrices) 
        : this.currentPrice * 0.9;
      
      const maxPrice = this.competitorPrices.length > 0 
        ? Math.max(...this.competitorPrices) 
        : this.currentPrice * 1.1;
      
      // Simple recommendation based on minimum margin and market average
      const minMarginPrice = this.productionCost / (1 - (this.targetMargin / 100));
      const recommendedPrice = this.formatCurrencyValue((minMarginPrice + avgCompPrice) / 2);
      
      return {
        currentPrice: this.currentPrice,
        optimizedPrice: recommendedPrice,
        competitorsPriceRange: {
          min: this.formatCurrencyValue(minPrice),
          max: this.formatCurrencyValue(maxPrice)
        },
        marginAnalysis: {
          productCost: this.productionCost,
          targetMargin: this.targetMargin,
          actualMargin: calculateMargin(recommendedPrice, this.productionCost)
        },
        optimizedStrategy: {
          name: "Balanced Pricing",
          description: "A balanced approach between margin requirements and market competitiveness"
        },
        alternativeStrategies: [
          {
            name: "Premium Pricing",
            description: "Position as a premium product with higher price",
            price: this.formatCurrencyValue(maxPrice),
            margin: calculateMargin(maxPrice, this.productionCost)
          },
          {
            name: "Value Pricing",
            description: "Position as a value product with lower price",
            price: this.formatCurrencyValue(minPrice),
            margin: calculateMargin(minPrice, this.productionCost)
          }
        ],
        insights: "Fallback pricing strategy based on basic cost and competitor analysis.",
        competitivePosition: {
          relativeToAverage: ((recommendedPrice - avgCompPrice) / avgCompPrice) * 100,
          positioning: recommendedPrice > avgCompPrice ? "Premium" : "Value"
        },
        // Add currency information to the response
        currencyCode: this.currencyCode,
        currencySymbol: this.currencySymbol
      };
    }
  }
  
  // Helper function to calculate margin percentage
  function calculateMargin(price, cost) {
    if (price <= 0 || cost <= 0) return 0;
    const margin = ((price - cost) / price) * 100;
    return Math.min(Math.max(margin, 0), 99.99); // Ensure reasonable range
  }
  
  module.exports = { PricingEngine };