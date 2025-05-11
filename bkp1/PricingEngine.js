// PricingEngine.js (at the root of your project)
class PricingEngine {
    constructor(productionCostPerUnit, salesPerMonth, targetMargin, currentPrice, competitorPrices) {
        this.productionCostPerUnit = parseFloat(productionCostPerUnit);
        this.salesPerMonth = parseInt(salesPerMonth);
        this.targetMargin = parseFloat(targetMargin) / 100; // Convert percentage to decimal
        this.currentPrice = parseFloat(currentPrice);
        // Ensure competitorPrices is an array and handle potential non-numeric values gracefully
        this.competitorPrices = Array.isArray(competitorPrices) ? competitorPrices.map(price => parseFloat(price)).filter(price => !isNaN(price)) : [];
        
        // Calculate key metrics
        this.averageCompetitorPrice = this.calculateAverageCompetitorPrice();
        // Handle empty competitorPrices for min/max
        this.minimumCompetitorPrice = this.competitorPrices.length > 0 ? Math.min(...this.competitorPrices) : 0;
        this.maximumCompetitorPrice = this.competitorPrices.length > 0 ? Math.max(...this.competitorPrices) : 0;
        this.priceFloor = this.calculatePriceFloor();
    }

    // Calculate average competitor price
    calculateAverageCompetitorPrice() {
        if (this.competitorPrices.length === 0) return 0; // Or handle as NaN or null if preferred
        const sum = this.competitorPrices.reduce((acc, price) => acc + price, 0);
        return sum / this.competitorPrices.length;
    }

    // Calculate price floor (price to achieve target margin)
    calculatePriceFloor() {
        if (this.targetMargin >= 1) return Infinity; // Avoid division by zero or negative if target margin is 100% or more
        return this.productionCostPerUnit / (1 - this.targetMargin);
    }

    // Calculate price elasticity estimate based on position in market
    estimatePriceElasticity() {
        // A simplified elasticity model
        if (this.averageCompetitorPrice === 0) return -1.0; // Default if no competitor data
        if (this.currentPrice > this.averageCompetitorPrice * 1.1) { // Adjusted threshold slightly
            return -1.5;
        } else if (this.currentPrice < this.averageCompetitorPrice * 0.9) {
            return -0.7;
        } else {
            return -1.0;
        }
    }

    // Calculate revenue impact of price changes
    calculateRevenueImpact(newPrice) {
        if (this.currentPrice === 0) return { newSales: 0, currentRevenue: 0, newRevenue: 0, revenueChange: 0, revenueChangePercent: 0 }; // Avoid division by zero

        const priceChange = (newPrice - this.currentPrice) / this.currentPrice;
        const elasticity = this.estimatePriceElasticity();
        // Cap sales change to prevent extreme values from simplified elasticity
        const salesChange = Math.max(-0.9, Math.min(2.0, priceChange * elasticity)); // e.g., max 90% decrease or 200% increase

        const newSales = this.salesPerMonth * (1 + salesChange);
        const newRevenue = newPrice * newSales;
        const currentRevenue = this.currentPrice * this.salesPerMonth;
        
        return {
            newSales: Math.round(newSales),
            currentRevenue,
            newRevenue,
            revenueChange: newRevenue - currentRevenue,
            revenueChangePercent: currentRevenue === 0 ? (newRevenue > 0 ? Infinity : 0) : ((newRevenue / currentRevenue) - 1) * 100
        };
    }

    // Generate market position analysis
    analyzeMarketPosition() {
        const competitorCount = this.competitorPrices.length;
        const cheaperCompetitors = competitorCount > 0 ? this.competitorPrices.filter(price => price < this.currentPrice).length : 0;
        const pricePositionPercentile = competitorCount > 0 ? (cheaperCompetitors / competitorCount) * 100 : 50; // Default to mid if no competitors

        const currentMargin = this.currentPrice > 0 ? (this.currentPrice - this.productionCostPerUnit) / this.currentPrice * 100 : -Infinity;
        const averageCompetitorMargin = (this.averageCompetitorPrice > 0 && this.averageCompetitorPrice !== Infinity) ?
            (this.averageCompetitorPrice - this.productionCostPerUnit) / this.averageCompetitorPrice * 100 : -Infinity;
        
        return {
            priceRelativeToAverage: (this.averageCompetitorPrice > 0 && this.averageCompetitorPrice !== Infinity) ? (this.currentPrice / this.averageCompetitorPrice - 1) * 100 : 0,
            pricePositionPercentile,
            currentMargin,
            targetMargin: this.targetMargin * 100,
            marginGap: currentMargin - (this.targetMargin * 100),
            averageCompetitorPrice: this.averageCompetitorPrice,
            minimumCompetitorPrice: this.minimumCompetitorPrice,
            maximumCompetitorPrice: this.maximumCompetitorPrice,
            priceRange: this.maximumCompetitorPrice - this.minimumCompetitorPrice,
            competitorsAbove: competitorCount > 0 ? competitorCount - cheaperCompetitors : 0,
            competitorsBelow: cheaperCompetitors
        };
    }

    // Generate optimal price
    generatePriceRecommendation() {
        const marketAnalysis = this.analyzeMarketPosition();
        let recommendedPrice = this.currentPrice; // Default to current price
        let strategy = "MAINTAIN_PRICE";
        let justification = "Initial analysis suggests maintaining current price. Further review needed if conditions change.";
    
        const currentMarginValue = this.currentPrice > 0 ? (this.currentPrice - this.productionCostPerUnit) / this.currentPrice : -1; // Use -1 to indicate price is 0 or less
    
        if (this.productionCostPerUnit <= 0) { // Handle cases with no or invalid production cost
            strategy = "REVIEW_COST_DATA";
            justification = "Production cost data is invalid or missing. Cannot reliably recommend a price.";
            recommendedPrice = this.currentPrice; // Or some other safe default
        } else if (this.averageCompetitorPrice === 0 && this.competitorPrices.length > 0) { // If avg is 0 but there are prices (e.g. all 0)
             strategy = "REVIEW_COMPETITOR_DATA";
             justification = "Competitor price data seems unusual (average is 0). Review competitor data.";
             recommendedPrice = this.priceFloor > 0 && this.priceFloor !== Infinity ? this.priceFloor : this.currentPrice;
        }
         else if (currentMarginValue < this.targetMargin && currentMarginValue !== -1) {
            strategy = "INCREASE_PRICE_TO_MARGIN";
            recommendedPrice = this.priceFloor; // Price to achieve target margin
            justification = "Current margin is below target. Recommending price to achieve target margin.";
            if (this.averageCompetitorPrice > 0) { // Only consider competitor average if it's valid
                if (recommendedPrice > this.averageCompetitorPrice * 1.2) { // If target margin price is too high vs competitors
                    justification += " However, this price is significantly above average competitor price. Consider a balance.";
                    recommendedPrice = Math.min(recommendedPrice, this.averageCompetitorPrice * 1.15); // Cap it
                }
                if (this.currentPrice < this.averageCompetitorPrice) {
                     // Below average price with insufficient margin - increase price
                     recommendedPrice = Math.max(this.priceFloor, Math.min(
                        this.averageCompetitorPrice * 0.95, 
                        this.priceFloor 
                    ));
                    justification = "Current price is below market average and doesn't meet target margin. Adjusting to meet margin or align closer to competitors.";
                } else {
                     // Above average price with insufficient margin
                     recommendedPrice = Math.max(this.priceFloor, this.priceFloor * 1.05); // Slight increase on floor
                     strategy = "OPTIMIZE_PRICE_FOR_MARGIN";
                     justification = "Current price is above market average but still doesn't achieve target margin. Minor adjustment to improve margin.";
                }
            }
        } else if (currentMarginValue >= this.targetMargin && this.averageCompetitorPrice > 0) { // Margin is sufficient, and we have competitor data
            if (this.currentPrice > this.averageCompetitorPrice * 1.15) {
                recommendedPrice = Math.max(this.priceFloor, this.averageCompetitorPrice * 1.1);
                strategy = "DECREASE_FOR_COMPETITIVENESS";
                justification = "Current price is high vs competitors. Consider reduction for competitiveness.";
            } else if (this.currentPrice < this.averageCompetitorPrice * 0.85) {
                recommendedPrice = Math.min(this.averageCompetitorPrice * 0.9, this.currentPrice * 1.10); // Cap increase
                strategy = "INCREASE_FOR_PROFIT";
                justification = "Current price is low vs competitors. Potential to increase price and profit.";
            } else {
                strategy = "MAINTAIN_PRICE";
                recommendedPrice = this.currentPrice;
                justification = "Current price is competitive and meets margin requirements.";
            }
        } else if (currentMarginValue === -1) { // Current price is 0 or less
            strategy = "INVALID_CURRENT_PRICE";
            justification = "Current price is invalid. Cannot make recommendation.";
            recommendedPrice = this.priceFloor > 0 && this.priceFloor !== Infinity ? this.priceFloor : this.productionCostPerUnit * 2; // A safe guess
        }
        // Ensure recommended price is at least the floor price if floor price is valid
        if (this.priceFloor > 0 && this.priceFloor !== Infinity && recommendedPrice < this.priceFloor) {
            recommendedPrice = this.priceFloor;
            justification += " Adjusted to meet minimum target margin price.";
        }
        // Ensure recommended price is not less than production cost
        if (recommendedPrice < this.productionCostPerUnit) {
            recommendedPrice = this.productionCostPerUnit * (1 + this.targetMargin + 0.05); // Cost + target margin + small buffer
            justification += " Adjusted to be above production cost, aiming for target margin.";
            strategy = "ENSURE_PROFITABILITY";
        }


        const impact = this.calculateRevenueImpact(recommendedPrice);
        
        return {
            currentPrice: this.currentPrice,
            recommendedPrice: parseFloat(recommendedPrice.toFixed(2)),
            priceDifference: parseFloat((recommendedPrice - this.currentPrice).toFixed(2)),
            priceChangePercent: this.currentPrice > 0 ? parseFloat(((recommendedPrice / this.currentPrice - 1) * 100).toFixed(2)) : (recommendedPrice > 0 ? Infinity : 0),
            recommendationStrategy: strategy,
            justification,
            estimatedImpact: {
                currentSales: this.salesPerMonth,
                projectedSales: Math.round(impact.newSales),
                salesChangePercent: this.salesPerMonth > 0 ? parseFloat(((impact.newSales / this.salesPerMonth - 1) * 100).toFixed(2)) : (impact.newSales > 0 ? Infinity : 0),
                projectedRevenue: parseFloat(impact.newRevenue.toFixed(2)),
                projectedRevenueChangePercent: parseFloat(impact.revenueChangePercent.toFixed(2)),
                projectedMargin: recommendedPrice > 0 ? parseFloat(((recommendedPrice - this.productionCostPerUnit) / recommendedPrice * 100).toFixed(2)) : -Infinity
            }
        };
    }

    // Estimate volume increase from discount
    estimateVolumeIncrease(discountPercent) {
        // Simple elasticity model
        if (discountPercent <= 0) return 1.0;
        if (discountPercent <= 5) return 1.1;
        if (discountPercent <= 10) return 1.25;
        if (discountPercent <= 15) return 1.4;
        if (discountPercent <= 20) return 1.6;
        return 1.8; 
    }

    // Calculate profitability of a discount strategy
    calculateDiscountProfitability(recommendedPrice, discountPercent) {
        const discountMultiplier = 1 - (discountPercent / 100);
        const discountedPrice = recommendedPrice * discountMultiplier;
        
        if (discountedPrice <= 0) { // Avoid issues with zero or negative discounted price
            return { /* sensible defaults for invalid scenario */ 
                discountPercent, discountedPrice:0, recommendation: "NOT_RECOMMENDED", profitChange: -Infinity 
            };
        }

        const discountMargin = (discountedPrice - this.productionCostPerUnit) / discountedPrice;
        const volumeMultiplier = this.estimateVolumeIncrease(discountPercent);
        const newVolume = Math.round(this.salesPerMonth * volumeMultiplier);
        
        const currentRevenue = recommendedPrice * this.salesPerMonth;
        const currentProfit = (recommendedPrice - this.productionCostPerUnit) * this.salesPerMonth;
        
        const newRevenue = discountedPrice * newVolume;
        const newProfit = (discountedPrice - this.productionCostPerUnit) * newVolume;
        
        const revenueChange = newRevenue - currentRevenue;
        const profitChange = newProfit - currentProfit;
        
        return {
            discountPercent,
            discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            originalPrice: recommendedPrice,
            discountMarginPercent: parseFloat((discountMargin * 100).toFixed(2)),
            estimatedVolumeMultiplier: volumeMultiplier,
            estimatedNewVolume: newVolume,
            volumeIncrease: newVolume - this.salesPerMonth,
            volumeIncreasePercent: this.salesPerMonth > 0 ? parseFloat(((volumeMultiplier - 1) * 100).toFixed(2)) : (volumeMultiplier > 1 ? Infinity : 0),
            currentRevenue: parseFloat(currentRevenue.toFixed(2)),
            newRevenue: parseFloat(newRevenue.toFixed(2)),
            revenueChange: parseFloat(revenueChange.toFixed(2)),
            revenueChangePercent: currentRevenue !== 0 ? parseFloat(((revenueChange / currentRevenue) * 100).toFixed(2)) : (revenueChange > 0 ? Infinity : 0),
            currentProfit: parseFloat(currentProfit.toFixed(2)),
            newProfit: parseFloat(newProfit.toFixed(2)),
            profitChange: parseFloat(profitChange.toFixed(2)),
            profitChangePercent: currentProfit !== 0 ? parseFloat(((profitChange / currentProfit) * 100).toFixed(2)) : (profitChange > 0 ? Infinity : (profitChange < 0 ? -Infinity : 0)),
            recommendation: profitChange > 0 ? "RECOMMENDED" : "NOT_RECOMMENDED"
        };
    }

    // Generate different discount strategies
    generateDiscountStrategies(recommendedPrice) {
        if (recommendedPrice <= 0 || this.productionCostPerUnit <= 0) { // Safety check
            return { scenarios: [], summary: { recommendations: [{ strategyType: "NO_DISCOUNT", discountValue: 0, discountedPrice: recommendedPrice, reasoning: "Invalid pricing data for discount calculation.", expectedImpact: { volumeIncrease: "0%", revenueChange: "0%", profitChange: "0%"}}]} };
        }

        const currentMarginAtRecPrice = (recommendedPrice - this.productionCostPerUnit) / recommendedPrice;
        // Max discount allows for at least a very small positive margin, or 80% of target if target is low
        const minMarginForDiscount = Math.max(0.01, this.targetMargin * 0.5); 
        const maxAllowableDiscount = Math.floor(Math.max(0, (currentMarginAtRecPrice - minMarginForDiscount)) * 100);
        const maxDiscount = Math.min(maxAllowableDiscount, 30); // Cap max discount considered at 30%
        
        const discountScenarios = [];
        const discountSteps = [5, 10, 15, 20, 25];

        discountSteps.forEach(step => {
            if (maxDiscount >= step) {
                discountScenarios.push(this.calculateDiscountProfitability(recommendedPrice, step));
            }
        });
        
        if (maxDiscount > 0 && !discountSteps.includes(maxDiscount) && maxDiscount < Math.min(...discountSteps, Infinity)) { // Add maxDiscount if unique and smaller than smallest step
             discountScenarios.push(this.calculateDiscountProfitability(recommendedPrice, maxDiscount));
        }
         // Ensure scenarios are sorted by discountPercent for predictability
        discountScenarios.sort((a, b) => a.discountPercent - b.discountPercent);

        const profitableScenarios = discountScenarios.filter(s => s.recommendation === "RECOMMENDED" && s.profitChange !== -Infinity);
        let mostProfitableDiscount = 0;
        if (profitableScenarios.length > 0) {
            mostProfitableDiscount = profitableScenarios.reduce((max, scenario) => 
                scenario.profitChange > max.profitChange ? scenario : max, { profitChange: -Infinity }).discountPercent;
        }
        
        return {
            scenarios: discountScenarios,
            summary: {
                maxRecommendedDiscount: profitableScenarios.length > 0 ? Math.max(...profitableScenarios.map(s => s.discountPercent)) : 0,
                mostProfitableDiscount: mostProfitableDiscount,
                breakEvenDiscountPercent: currentMarginAtRecPrice > 0 ? parseFloat((currentMarginAtRecPrice * 100).toFixed(2)) : 0, // Simplified
                recommendations: this.generateDiscountRecommendations(recommendedPrice, discountScenarios)
            }
        };
    }

    // Generate specific discount recommendations
    generateDiscountRecommendations(recommendedPrice, scenarios) {
        const profitableScenarios = scenarios.filter(s => s.recommendation === "RECOMMENDED" && s.profitChange !== -Infinity);
        
        if (profitableScenarios.length === 0) {
            return [{
                strategyType: "NO_DISCOUNT",
                discountValue: 0,
                discountedPrice: recommendedPrice,
                reasoning: "No profitable discount strategies found with current assumptions.",
                expectedImpact: { volumeIncrease: "0%", revenueChange: "0%", profitChange: "0%" }
            }];
        }
        
        const bestScenario = profitableScenarios.reduce((max, scenario) => scenario.profitChange > max.profitChange ? scenario : max, profitableScenarios[0]);
        const volumeMaximizer = profitableScenarios.reduce((max, scenario) => scenario.estimatedNewVolume > max.estimatedNewVolume ? scenario : max, profitableScenarios[0]);
            
        const recommendations = [];
        
        recommendations.push({
            strategyType: "PROFIT_MAXIMIZER",
            discountValue: bestScenario.discountPercent,
            discountedPrice: bestScenario.discountedPrice,
            reasoning: `A ${bestScenario.discountPercent}% discount is estimated to maximize profitability.`,
            expectedImpact: {
                volumeIncrease: `${bestScenario.volumeIncreasePercent || 0}%`,
                revenueChange: `${(bestScenario.revenueChangePercent || 0).toFixed(1)}%`,
                profitChange: `${(bestScenario.profitChangePercent || 0).toFixed(1)}%`
            }
        });
        
        if (volumeMaximizer.discountPercent !== bestScenario.discountPercent) {
            recommendations.push({
                strategyType: "VOLUME_MAXIMIZER",
                discountValue: volumeMaximizer.discountPercent,
                discountedPrice: volumeMaximizer.discountedPrice,
                reasoning: `A ${volumeMaximizer.discountPercent}% discount is estimated to maximize sales volume.`,
                expectedImpact: {
                    volumeIncrease: `${volumeMaximizer.volumeIncreasePercent || 0}%`,
                    revenueChange: `${(volumeMaximizer.revenueChangePercent || 0).toFixed(1)}%`,
                    profitChange: `${(volumeMaximizer.profitChangePercent || 0).toFixed(1)}%`
                }
            });
        }
        // ... (other discount recommendation types can be added here if needed)
        return recommendations;
    }

    // Main method
    getOptimizedPricingStrategy() {
        const marketAnalysis = this.analyzeMarketPosition();
        const priceRecommendation = this.generatePriceRecommendation();
        const discountStrategies = this.generateDiscountStrategies(priceRecommendation.recommendedPrice);
        
        const recs = discountStrategies.summary.recommendations;
        const firstRec = recs && recs.length > 0 ? recs[0] : { 
            strategyType: "NO_DISCOUNT", 
            discountValue: 0, 
            discountedPrice: priceRecommendation.recommendedPrice, 
            expectedImpact: { profitChange: "0%", volumeIncrease: "0%" } 
        };
        
        return {
            marketAnalysis,
            priceRecommendation,
            discountStrategies,
            summary: {
                currentPrice: this.currentPrice,
                recommendedPrice: priceRecommendation.recommendedPrice,
                optimalPriceStrategy: priceRecommendation.recommendationStrategy,
                optimalDiscountStrategy: firstRec.strategyType,
                optimalDiscountValue: firstRec.discountValue,
                optimalDiscountedPrice: firstRec.discountedPrice,
                estimatedProfitChange: firstRec.expectedImpact.profitChange,
                estimatedVolumeChange: firstRec.expectedImpact.volumeIncrease
            }
        };
    }

    // Get product-specific pricing strategy recommendations (entry point for API)
    getProductStrategies() { // This is likely what your /api/optimize-price calls
        try {
            const optimizedStrategy = this.getOptimizedPricingStrategy(); // Contains summary and details
            const marketPosition = this.determinePricePosition();
            
            // The optimizedStrategy.summary already contains most of what we need.
            // The strategicRecommendations are more qualitative.
            return {
                optimizedStrategy: { // This structure matches what the frontend might expect from /api/optimize-price
                    name: optimizedStrategy.summary.optimalPriceStrategy, // e.g., MAINTAIN_PRICE
                    price: optimizedStrategy.summary.recommendedPrice,
                    rationale: optimizedStrategy.priceRecommendation.justification,
                    cost: this.productionCostPerUnit,
                    profit: optimizedStrategy.summary.recommendedPrice - this.productionCostPerUnit,
                    margin: optimizedStrategy.summary.recommendedPrice > 0 ? 
                            ((optimizedStrategy.summary.recommendedPrice - this.productionCostPerUnit) / optimizedStrategy.summary.recommendedPrice * 100) 
                            : 0,
                    details: `Optimal discount: ${optimizedStrategy.summary.optimalDiscountValue}% leading to price ${optimizedStrategy.summary.optimalDiscountedPrice}. Est. Profit Change: ${optimizedStrategy.summary.estimatedProfitChange}`
                },
                productStrategies: this.generateStrategicRecommendations(marketPosition, optimizedStrategy) // More detailed text-based strategies
                // Consider adding discountStrategies.summary.recommendations directly if frontend needs more discount options
            };
        } catch (error) {
            console.error('Error in getProductStrategies:', error);
            return { // Fallback structure
                optimizedStrategy: { name: "Error", price: this.currentPrice, rationale: "Error during calculation.", cost:this.productionCostPerUnit, profit:0, margin:0, details: error.message },
                productStrategies: [{ strategy: "Error", description: error.message, implementation: "Check logs", rationale: "Calculation failed" }]
            };
        }
    }
    
    // Determine price position
    determinePricePosition() {
        if (this.competitorPrices.length === 0) {
            return { positionName: "Unknown (No Competitor Data)", isPremium: false, isValue: false, isCompetitive: false, percentilePosition: 50 };
        }
        const isPremium = this.currentPrice > this.averageCompetitorPrice * 1.1;
        const isValue = this.currentPrice < this.averageCompetitorPrice * 0.9;
        
        return {
            isPremium,
            isValue,
            isCompetitive: !isPremium && !isValue,
            percentilePosition: (this.competitorPrices.filter(p => p < this.currentPrice).length / this.competitorPrices.length) * 100,
            positionName: isPremium ? "Premium" : (isValue ? "Value" : "Competitive")
        };
    }
    
    // Generate strategic text recommendations
    generateStrategicRecommendations(marketPosition, optimizationStrategy) {
        const recommendations = [];
        const priceRec = optimizationStrategy.priceRecommendation;
        const discountSummary = optimizationStrategy.discountStrategies.summary;

        // Price Strategy Recommendation
        recommendations.push({
            name: priceRec.recommendationStrategy.replace(/_/g, ' '), // e.g. "Price Increase To Margin"
            price: priceRec.recommendedPrice,
            rationale: priceRec.justification,
            margin: priceRec.estimatedImpact.projectedMargin
        });

        // Alternative: Cost Plus (Target Margin Price)
        const costPlusPrice = this.priceFloor;
        if (costPlusPrice !== Infinity && costPlusPrice.toFixed(2) !== priceRec.recommendedPrice.toFixed(2)) {
            recommendations.push({
                name: "Cost Plus (Target Margin)",
                price: costPlusPrice,
                rationale: `Price set to achieve your target margin of ${this.targetMargin * 100}%.`,
                margin: this.targetMargin * 100
            });
        }
        
        // Alternative: Match Average Competitor (if data available and different)
        if (this.averageCompetitorPrice > 0 && this.averageCompetitorPrice.toFixed(2) !== priceRec.recommendedPrice.toFixed(2)) {
             const marginAtAvgComp = this.averageCompetitorPrice > 0 ? ((this.averageCompetitorPrice - this.productionCostPerUnit) / this.averageCompetitorPrice * 100) : 0;
            recommendations.push({
                name: "Match Average Competitor",
                price: this.averageCompetitorPrice,
                rationale: `Matches the average competitor price.`,
                margin: marginAtAvgComp
            });
        }

        // Alternative: Value Leader (Slightly below lowest *sensible* competitor or average)
        let valueLeaderPrice = 0;
        if (this.minimumCompetitorPrice > this.productionCostPerUnit * 1.05) { // Ensure min comp is not too low
            valueLeaderPrice = this.minimumCompetitorPrice * 0.98; // Slightly undercut lowest
        } else if (this.averageCompetitorPrice > this.productionCostPerUnit * 1.05) {
            valueLeaderPrice = this.averageCompetitorPrice * 0.95; // Undercut average
        }
        if (valueLeaderPrice > this.productionCostPerUnit && valueLeaderPrice.toFixed(2) !== priceRec.recommendedPrice.toFixed(2)) {
             const marginAtValueLeader = valueLeaderPrice > 0 ? ((valueLeaderPrice - this.productionCostPerUnit) / valueLeaderPrice * 100) : 0;
            recommendations.push({
                name: "Value Leader",
                price: valueLeaderPrice,
                rationale: "Positions as a highly competitive value option.",
                margin: marginAtValueLeader
            });
        }


        // Add discount recommendations if any
        if (discountSummary && discountSummary.recommendations) {
            discountSummary.recommendations.forEach(discRec => {
                if (discRec.strategyType !== "NO_DISCOUNT") {
                    // This might be too verbose for 'productStrategies' if it's meant for alternative base prices
                    // But could be useful if 'productStrategies' is a list of all actionable advice
                    /*
                    recommendations.push({
                        name: `Discount: ${discRec.strategyType.replace(/_/g, ' ')} (${discRec.discountValue}%)`,
                        price: discRec.discountedPrice,
                        rationale: discRec.reasoning,
                        margin: discRec.discountedPrice > 0 ? ((discRec.discountedPrice - this.productionCostPerUnit) / discRec.discountedPrice * 100) : 0
                    });
                    */
                }
            });
        }
        
        // Filter out strategies that result in price <= production cost or NaN/Infinity prices, unless it's the primary recommendation
        return recommendations.filter((r, index) => 
            index === 0 || // Always keep the primary price recommendation
            (r.price > this.productionCostPerUnit && !isNaN(r.price) && isFinite(r.price))
        ).slice(0, 4); // Return primary + up to 3 alternatives
    }
}

module.exports = { PricingEngine };