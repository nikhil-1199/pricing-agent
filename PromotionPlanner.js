// PromotionPlanner.js - Module for integration with Dynamic Pricing Agent
// This module provides promotion scheduling and budgets based on product category seasonality

// Convert your existing category seasonality data to the format expected by the main app
const categorySeasonality = {
    electronics: {
        'January': 0.7,  // Normalize values to 0-1.5 scale
        'February': 0.5,
        'March': 0.4,
        'April': 0.3,
        'May': 0.5,
        'June': 0.6,
        'July': 0.6,    
        'August': 0.8,  
        'September': 0.6,
        'October': 0.7,
        'November': 1.0, 
        'December': 1.0  
    },
    clothing: {
        'January': 0.7,  
        'February': 0.6,
        'March': 0.7,   
        'April': 0.6,
        'May': 0.8,
        'June': 0.6,
        'July': 0.8,
        'August': 0.9,  
        'September': 0.7, 
        'October': 0.5,
        'November': 0.9, 
        'December': 1.0
    },
    home: {
        'January': 0.8,
        'February': 0.6,
        'March': 0.7,   
        'April': 0.6,   
        'May': 0.9,
        'June': 0.8,
        'July': 0.8,
        'August': 0.6,
        'September': 0.7,
        'October': 0.5,
        'November': 1.0, 
        'December': 0.9
    },
    beauty: {
        'January': 0.6,
        'February': 0.8, 
        'March': 0.5,
        'April': 0.6,
        'May': 0.9,     
        'June': 0.6,
        'July': 0.5,
        'August': 0.6,
        'September': 0.7,
        'October': 0.6,
        'November': 0.9,
        'December': 1.0  
    },
    toys: {
        'January': 0.5,  
        'February': 0.3,
        'March': 0.3,
        'April': 0.5,
        'May': 0.6,
        'June': 0.6,
        'July': 0.5,
        'August': 0.7,
        'September': 0.6,
        'October': 0.8,  
        'November': 0.9, 
        'December': 1.0  
    },
    food: {
        'January': 0.6,
        'February': 0.7,
        'March': 0.6,
        'April': 0.8,
        'May': 0.7,
        'June': 0.7,
        'July': 0.9,
        'August': 0.7,
        'September': 0.7,
        'October': 0.8,
        'November': 1.0, 
        'December': 1.0  
    },
    sports: {
        'January': 0.8,  
        'February': 0.6,
        'March': 0.7,
        'April': 0.8,
        'May': 0.7,
        'June': 0.8,
        'July': 0.9,
        'August': 0.8,
        'September': 0.7,
        'October': 0.6,
        'November': 0.7,
        'December': 0.9  
    },
    accessories: {
        'January': 0.7,
        'February': 0.5,
        'March': 0.6,
        'April': 0.6,
        'May': 0.7,
        'June': 0.7,
        'July': 0.7,
        'August': 0.7,
        'September': 0.7,
        'October': 0.7,
        'November': 0.9,
        'December': 1.0
    },
    books: {
        'January': 0.9,
        'February': 0.9,
        'March': 0.9,
        'April': 1.0,
        'May': 1.0,
        'June': 0.9,
        'July': 0.9,
        'August': 1.2,  
        'September': 1.1,
        'October': 1.0,
        'November': 1.1,
        'December': 1.3  
    },
    default: {
        'January': 0.7,
        'February': 0.5,
        'March': 0.6,
        'April': 0.6,
        'May': 0.7,
        'June': 0.7,
        'July': 0.7,
        'August': 0.7,
        'September': 0.7,
        'October': 0.7,
        'November': 0.9,
        'December': 1.0
    }
};

// Convert promotional events to the format expected
const promotionalEvents = {
    'January': [
        { name: 'New Year Sales', impact: 1.3, duration: '1-7' },
        { name: 'Inventory Clearance', impact: 1.2, duration: '8-31' }
    ],
    'February': [
        { name: 'Valentine\'s Day', impact: 1.4, duration: '10-14', categories: ['beauty', 'accessories', 'clothing'] },
        { name: 'President\'s Day', impact: 1.2, duration: '15-17' }
    ],
    'March': [
        { name: 'Spring Sales', impact: 1.1, duration: '1-31' },
        { name: 'End of Quarter', impact: 1.1, duration: '25-31' }
    ],
    'April': [
        { name: 'Easter', impact: 1.2, duration: '10-12', categories: ['food', 'toys', 'clothing'] },
        { name: 'Spring Break', impact: 1.2, duration: '15-31' }
    ],
    'May': [
        { name: 'Mother\'s Day', impact: 1.4, duration: '8-10', categories: ['beauty', 'accessories', 'home'] },
        { name: 'Memorial Day', impact: 1.3, duration: '24-26' }
    ],
    'June': [
        { name: 'Father\'s Day', impact: 1.3, duration: '15-17', categories: ['electronics', 'sports', 'accessories'] },
        { name: 'Graduation', impact: 1.2, duration: '1-15' }
    ],
    'July': [
        { name: 'Independence Day', impact: 1.2, duration: '1-4' },
        { name: 'Prime Day-type Events', impact: 1.4, duration: '15-16', categories: ['electronics'] }
    ],
    'August': [
        { name: 'Back to School', impact: 1.4, duration: '15-31', categories: ['electronics', 'clothing', 'books'] }
    ],
    'September': [
        { name: 'Labor Day', impact: 1.2, duration: '1-3' },
        { name: 'Fall Kickoff', impact: 1.1, duration: '15-30' }
    ],
    'October': [
        { name: 'Halloween', impact: 1.3, duration: '25-31', categories: ['toys', 'clothing', 'food'] },
        { name: 'Pre-Holiday Sales', impact: 1.1, duration: '1-31' }
    ],
    'November': [
        { name: 'Black Friday', impact: 1.8, duration: '24-26' },
        { name: 'Cyber Monday', impact: 1.6, duration: '27', categories: ['electronics'] },
        { name: 'Thanksgiving', impact: 1.3, duration: '23-25', categories: ['food'] }
    ],
    'December': [
        { name: 'Holiday Shopping', impact: 1.5, duration: '1-23' },
        { name: 'Christmas', impact: 1.6, duration: '20-25' },
        { name: 'End of Year', impact: 1.3, duration: '26-31' }
    ]
};

// Calculate promotion budget based on product metrics
function calculatePromotionBudget(productCost, productPrice, marginTarget, avgMonthlySales, seasonalityFactor) {
    // Calculate current margin
    const currentMargin = ((productPrice - productCost) / productPrice) * 100;
    
    // Calculate average monthly revenue
    const monthlyRevenue = avgMonthlySales * productPrice;
    
    // Base budget as percentage of monthly revenue, adjusted by seasonality
    const basePercentage = 5; // 5% of monthly revenue as base
    let budgetPercentage = basePercentage * seasonalityFactor; // Adjust by seasonality
    
    // Adjust budget based on margin health
    if (currentMargin > marginTarget * 1.2) {
        // Healthy margin, can spend more on promotion
        budgetPercentage *= 1.3;
    } else if (currentMargin < marginTarget) {
        // Tight margin, be more conservative
        budgetPercentage *= 0.7;
    }
    
    // Calculate promotion budget
    const promotionBudget = (monthlyRevenue * budgetPercentage) / 100;
    
    return {
        promotionBudget: Math.round(promotionBudget),
        budgetAsPercentageOfRevenue: Math.round(budgetPercentage * 10) / 10,
        currentMargin: Math.round(currentMargin * 10) / 10,
        marginTarget: marginTarget
    };
}

// Recommend discount based on seasonality and margins
function recommendDiscount(currentMargin, marginTarget, seasonalityFactor) {
    // Base discount percentage
    let baseDiscount = 10;
    
    // Adjust based on seasonality
    if (seasonalityFactor >= 0.9) {
        // Peak season - lower discounts needed
        baseDiscount = 10;
    } else if (seasonalityFactor >= 0.7) {
        // High season
        baseDiscount = 15;
    } else if (seasonalityFactor >= 0.5) {
        // Medium season
        baseDiscount = 20;
    } else {
        // Low season - higher discounts needed
        baseDiscount = 25;
    }
    
    // Adjust based on margin health
    const marginBuffer = currentMargin - marginTarget;
    
    if (marginBuffer > 15) {
        // Very healthy margin, can offer more discount
        baseDiscount += 10;
    } else if (marginBuffer > 10) {
        // Healthy margin
        baseDiscount += 5;
    } else if (marginBuffer < 0) {
        // Already below target margin, reduce discount
        baseDiscount = Math.max(5, baseDiscount - 10);
    }
    
    // Cap the discount at a reasonable level
    return Math.min(35, Math.round(baseDiscount));
}

// Calculate projected sales increase based on seasonality and discount
function calculateProjectedSalesIncrease(seasonalityFactor, discountPercentage) {
    // Base increase from discount (every 5% discount increases sales by ~10%)
    const discountMultiplier = (discountPercentage / 5) * 10;
    
    // Seasonality impact
    const seasonalityMultiplier = seasonalityFactor * 20;
    
    // Calculate projected increase
    const projectedIncrease = discountMultiplier + seasonalityMultiplier;
    
    return Math.round(Math.min(100, projectedIncrease)); // Cap at 100%
}

// Get priority level based on seasonality
function getPriorityLevel(seasonalityFactor) {
    if (seasonalityFactor >= 0.9) return 'High';
    if (seasonalityFactor >= 0.7) return 'Medium';
    return 'Low';
}

// Get recommended actions based on seasonality and events
function getRecommendedActions(seasonalityFactor, events) {
    const actions = [];
    
    if (seasonalityFactor >= 0.8) {
        actions.push('Flash sales', 'Email campaigns', 'Social media ads', 'Influencer partnerships');
    } else if (seasonalityFactor >= 0.6) {
        actions.push('Email campaigns', 'Social media ads');
    } else {
        actions.push('Email campaigns', 'Loyalty program promotions');
    }
    
    // Add event-specific actions
    events.forEach(event => {
        if (event.impact >= 1.3) {
            actions.push(`${event.name} themed promotions`);
        }
    });
    
    return [...new Set(actions)]; // Remove duplicates
}

// Main function to generate promotion schedule
function generatePromotionSchedule(category, productCost, productPrice, marginTarget, avgMonthlySales) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Use the specified category or default if not found
    const seasonalityData = categorySeasonality[category] || categorySeasonality.default;
    
    const schedule = months.map(month => {
        const seasonalityFactor = seasonalityData[month];
        const events = promotionalEvents[month] || [];
        
        // Filter events relevant to this category
        const relevantEvents = events.filter(event => 
            !event.categories || event.categories.includes(category)
        );
        
        // Calculate budget based on seasonality factor
        const budgetInfo = calculatePromotionBudget(
            productCost,
            productPrice,
            marginTarget,
            avgMonthlySales,
            seasonalityFactor
        );
        
        // Recommend discount based on margins and seasonality
        const recommendedDiscount = recommendDiscount(
            budgetInfo.currentMargin,
            marginTarget,
            seasonalityFactor
        );
        
        // Calculate projected sales increase
        const projectedSalesIncrease = calculateProjectedSalesIncrease(
            seasonalityFactor,
            recommendedDiscount
        );
        
        // Get priority and actions
        const priority = getPriorityLevel(seasonalityFactor);
        const actions = getRecommendedActions(seasonalityFactor, relevantEvents);
        
        // Generate reason for this month's strategy
        let reason = '';
        if (seasonalityFactor >= 0.9) {
            reason = `Peak season for ${category}`;
            if (relevantEvents.length > 0) {
                reason += ` with ${relevantEvents.map(e => e.name).join(' and ')}`;
            }
        } else if (seasonalityFactor <= 0.5) {
            reason = `Low season for ${category}`;
            if (relevantEvents.length > 0) {
                reason += `, but ${relevantEvents.map(e => e.name).join(' and ')} provides opportunity`;
            } else {
                reason += '. Focus on inventory clearance and customer retention.';
            }
        } else {
            if (relevantEvents.length > 0) {
                reason = `Standard season with ${relevantEvents.map(e => e.name).join(' and ')}`;
            } else {
                reason = `Standard season for ${category}. Maintain steady promotion strategy.`;
            }
        }
        
        return {
            month: month,
            seasonalityFactor: seasonalityFactor.toFixed(2),
            priority: priority,
            discount: recommendedDiscount,
            promotionBudget: budgetInfo.promotionBudget,
            budgetPercentage: budgetInfo.budgetAsPercentageOfRevenue,
            salesIncrease: projectedSalesIncrease,
            currentMargin: budgetInfo.currentMargin,
            actions: actions,
            events: relevantEvents.map(e => e.name),
            reason: reason
        };
    });
    
    return {
        category: category,
        productMetrics: {
            cost: productCost,
            price: productPrice,
            marginTarget: marginTarget,
            avgMonthlySales: avgMonthlySales,
            currentMargin: budgetInfo.currentMargin
        },
        promotionSchedule: schedule
    };
}

module.exports = {
    categorySeasonality,
    promotionalEvents,
    calculatePromotionBudget,
    recommendDiscount,
    calculateProjectedSalesIncrease,
    getPriorityLevel,
    getRecommendedActions,
    generatePromotionSchedule
};