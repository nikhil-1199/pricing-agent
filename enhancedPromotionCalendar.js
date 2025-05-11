// Enhanced Promotion Calendar Generator with comprehensive coverage and detailed information

const COMPREHENSIVE_PROMOTIONAL_EVENTS_DB = {
  INDIA: {
    // E-commerce platforms
    AMAZON: [
      {
        name: "Amazon Great Indian Festival",
        dates: { start: { month: 10, day: 3 }, duration: 7 },
        typicalDiscount: { min: 20, max: 70 },
        description: "Amazon's flagship annual sale event in India",
        categories: ["ELECTRONICS", "CLOTHING", "HOME", "BOOKS", "BEAUTY"],
        targetAudience: "Mass market",
        marketingChannels: ["social_media", "email", "display_ads", "tv"],
        competition: "Competes with Flipkart Big Billion Days",
        historicalPerformance: { avgLift: "150%", avgDiscount: "45%" },
        inventory: "High stock recommended",
        specialOffers: ["Flash deals", "Lightning deals", "Bank offers"]
      },
      {
        name: "Prime Day",
        platform: "Amazon Prime",
        dates: { start: { month: 7, day: 15 }, duration: 2 },
        typicalDiscount: { min: 20, max: 50 },
        description: "Exclusive sale for Amazon Prime members",
        categories: ["ELECTRONICS", "HOME", "SPORTS", "BEAUTY"],
        targetAudience: "Prime members",
        marketingChannels: ["email", "app_notifications", "social_media"],
        exclusivity: "Prime members only",
        specialOffers: ["Early access", "Member exclusive deals"]
      },
      {
        name: "Freedom Sale",
        dates: { start: { month: 8, day: 9 }, duration: 7 },
        typicalDiscount: { min: 15, max: 50 },
        description: "Independence Day themed sale",
        patrioticTheme: true,
        categories: ["ALL"],
        targetAudience: "General public",
        specialOffers: ["Patriotic bundles", "Indian brands focus"]
      }
    ],
    FLIPKART: [
      {
        name: "Big Billion Days",
        dates: { start: { month: 10, day: 10 }, duration: 7 },
        typicalDiscount: { min: 30, max: 80 },
        description: "Flipkart's mega annual sale event",
        categories: ["ELECTRONICS", "CLOTHING", "HOME", "BEAUTY", "TOYS"],
        targetAudience: "Mass market",
        marketingChannels: ["social_media", "tv", "outdoor", "influencers"],
        specialFeatures: ["Supermarket section", "Fashion showcase"],
        directCompetitor: "Amazon Great Indian Festival",
        buyerProtection: ["No cost EMI", "Return guarantee"]
      },
      {
        name: "Flipkart Fashion Days",
        dates: { start: { month: 4, day: 15 }, duration: 5 },
        typicalDiscount: { min: 40, max: 80 },
        description: "Dedicated fashion and lifestyle sale",
        categories: ["CLOTHING", "FASHION", "BEAUTY", "ACCESSORIES"],
        targetAudience: "Fashion enthusiasts",
        specialFeatures: ["Fashion shows", "Designer collaborations"],
        trendFocus: ["Ethnic wear", "Western wear", "Fusion styles"]
      }
    ],
    MYNTRA: [
      {
        name: "End of Reason Sale",
        dates: { start: { month: 6, day: 25 }, duration: 10 },
        typicalDiscount: { min: 50, max: 90 },
        description: "Major fashion clearance sale",
        categories: ["CLOTHING", "FASHION", "BEAUTY", "SHOES", "ACCESSORIES"],
        fashionFocus: ["Branded clothes", "Designer wear"],
        targetAudience: "Fashion-conscious buyers",
        specialOffers: ["Brand partnerships", "Fashion influencer collabs"]
      },
      {
        name: "Big Fashion Festival",
        dates: { start: { month: 9, day: 30 }, duration: 7 },
        typicalDiscount: { min: 30, max: 80 },
        description: "Pre-festive fashion sale",
        categories: ["CLOTHING", "FASHION", "BEAUTY", "JEWELRY"],
        seasonalFocus: "Festive wear",
        targetAudience: "Festival shoppers"
      }
    ],
    NYKAA: [
      {
        name: "Pink Friday",
        dates: { start: { month: 11, day: 24 }, duration: 3 },
        typicalDiscount: { min: 20, max: 60 },
        description: "Beauty-focused Black Friday event",
        categories: ["BEAUTY", "COSMETICS", "SKINCARE", "FRAGRANCE"],
        specialFeatures: ["Exclusive beauty bundles", "Limited edition launches"],
        targetAudience: "Beauty enthusiasts"
      },
      {
        name: "Nykaa Festive Beauty Sale",
        dates: { start: { month: 10, day: 1 }, duration: 5 },
        typicalDiscount: { min: 30, max: 70 },
        description: "Festive season beauty sale",
        categories: ["BEAUTY", "COSMETICS", "SKINCARE"],
        festiveFocus: "Festive makeup and skincare"
      }
    ],
    // General/National Events
    GENERAL: [
      {
        name: "Diwali Sale",
        dates: { start: { month: 11, day: 1 }, duration: 7 },
        typicalDiscount: { min: 30, max: 70 },
        description: "Festival of lights shopping season",
        categories: ["ALL"],
        isNational: true,
        culturalSignificance: "Major Hindu festival",
        popularPurchases: ["Electronics", "Gold", "Decor", "Clothing", "Gifts"],
        shoppingPeak: "Dhanteras and Diwali day",
        specialOffers: ["Gold coins", "Festival bundles", "Home decor"]
      },
      {
        name: "Independence Day Sale",
        dates: { start: { month: 8, day: 14 }, duration: 3 },
        typicalDiscount: { min: 20, max: 50 },
        description: "Patriotic shopping event",
        categories: ["ALL"],
        isNational: true,
        patrioticTheme: true,
        promotionalFocus: ["Indian brands", "Swadeshi products"]
      },
      {
        name: "New Year Sale",
        dates: { start: { month: 1, day: 1 }, duration: 7 },
        typicalDiscount: { min: 20, max: 50 },
        description: "New year clearance and fresh start sales",
        categories: ["ALL"],
        seasonalFocus: ["Fitness", "Organization", "Electronics"],
        consumerBehavior: "Resolution-driven purchases"
      },
      {
        name: "Holi Sale",
        dates: { start: { month: 3, day: 17 }, duration: 3 },
        typicalDiscount: { min: 15, max: 40 },
        description: "Festival of colors celebration",
        categories: ["CLOTHING", "HOME", "TOYS", "PARTY_SUPPLIES"],
        culturalProducts: ["Organic colors", "Traditional wear", "Sweets"]
      }
    ]
  },
  
  US: {
    AMAZON: [
      {
        name: "Prime Day",
        platform: "Amazon Prime",
        dates: { start: { month: 7, day: 11 }, duration: 2 },
        typicalDiscount: { min: 20, max: 70 },
        description: "Amazon's biggest shopping event for Prime members",
        categories: ["ELECTRONICS", "HOME", "FASHION", "BEAUTY"],
        membershipBenefits: ["Free shipping", "Early access", "Exclusive deals"],
        marketingIntensity: "High - TV, Social, Email",
        competitorResponse: "Target Deal Days, Walmart+ Week"
      },
      {
        name: "Prime Big Deal Days",
        platform: "Amazon Prime",
        dates: { start: { month: 10, day: 10 }, duration: 2 },
        typicalDiscount: { min: 30, max: 60 },
        description: "October Prime exclusive sale",
        categories: ["ALL"],
        holidayPrep: "Early holiday shopping",
        exclusiveAccess: "Prime members only"
      }
    ],
    WALMART: [
      {
        name: "Walmart+ Week",
        platform: "Walmart Plus",
        dates: { start: { month: 6, day: 17 }, duration: 5 },
        typicalDiscount: { min: 30, max: 50 },
        description: "Walmart+ member exclusive event",
        categories: ["ELECTRONICS", "HOME", "GROCERIES", "CLOTHING"],
        memberPerks: ["Free delivery", "Gas discounts", "Exclusive prices"],
        competitiveResponse: "Counter to Amazon Prime Day"
      }
    ],
    GENERAL: [
      {
        name: "Black Friday",
        dates: { start: { month: 11, day: 24 }, duration: 4 },
        typicalDiscount: { min: 20, max: 70 },
        description: "Biggest shopping event of the year",
        categories: ["ALL"],
        isNational: true,
        culturalSignificance: "Post-Thanksgiving shopping tradition",
        shoppingPatterns: ["Doorbusters", "Midnight deals", "Online vs in-store"],
        retailerStrategies: ["Extended hours", "Price matching", "Layaway programs"]
      },
      {
        name: "Cyber Monday",
        dates: { start: { month: 11, day: 27 }, duration: 1 },
        typicalDiscount: { min: 25, max: 60 },
        description: "Online shopping focused event",
        categories: ["ELECTRONICS", "SOFTWARE", "DIGITAL_GOODS"],
        focusArea: "Online only deals",
        targetAudience: "Tech-savvy shoppers"
      },
      {
        name: "Memorial Day Sale",
        dates: { start: { month: 5, day: 29 }, duration: 4 },
        typicalDiscount: { min: 20, max: 40 },
        description: "Summer kickoff sales",
        categories: ["HOME", "OUTDOOR", "APPLIANCES", "CLOTHING"],
        seasonalProducts: ["Outdoor furniture", "BBQ equipment", "Summer clothes"],
        longWeekend: "3-day weekend boost"
      },
      {
        name: "Back to School",
        dates: { start: { month: 8, day: 1 }, duration: 30 },
        typicalDiscount: { min: 15, max: 50 },
        description: "Student-focused shopping season",
        categories: ["OFFICE", "ELECTRONICS", "CLOTHING", "SCHOOL_SUPPLIES"],
        targetAudience: ["Students", "Parents", "Teachers"],
        popularItems: ["Laptops", "Backpacks", "Stationery", "Dorm supplies"]
      }
    ]
  },
  
  UK: {
    AMAZON: [
      {
        name: "Prime Day UK",
        platform: "Amazon Prime",
        dates: { start: { month: 7, day: 11 }, duration: 2 },
        typicalDiscount: { min: 20, max: 60 },
        description: "UK version of Amazon's Prime Day",
        categories: ["ELECTRONICS", "HOME", "FASHION", "GARDEN"],
        localFocus: ["UK brands", "Local delivery"],
        competitorResponse: "Argos sales, Currys events"
      }
    ],
    GENERAL: [
      {
        name: "Boxing Day Sales",
        dates: { start: { month: 12, day: 26 }, duration: 7 },
        typicalDiscount: { min: 30, max: 80 },
        description: "Traditional post-Christmas sales",
        categories: ["ALL"],
        isNational: true,
        culturalSignificance: "Major British shopping tradition",
        shoppingBehavior: ["Gift returns", "New year prep", "Bargain hunting"]
      },
      {
        name: "Summer Bank Holiday Sale",
        dates: { start: { month: 8, day: 26 }, duration: 4 },
        typicalDiscount: { min: 20, max: 40 },
        description: "Late summer long weekend sale",
        categories: ["OUTDOOR", "GARDEN", "HOME", "FASHION"],
        seasonalFocus: "End-of-summer clearance"
      }
    ]
  },
  
  GLOBAL: [
    {
      name: "Singles' Day",
      dates: { start: { month: 11, day: 11 }, duration: 1 },
      typicalDiscount: { min: 30, max: 90 },
      description: "World's largest shopping event (originated in China)",
      categories: ["ALL"],
      isGlobal: true,
      globalParticipation: ["Alibaba", "JD", "Amazon", "Many retailers"],
      culturalOrigin: "Chinese anti-Valentine's Day",
      salesMagnitude: "Larger than Black Friday + Cyber Monday combined"
    },
    {
      name: "Earth Day",
      dates: { start: { month: 4, day: 22 }, duration: 3 },
      typicalDiscount: { min: 15, max: 30 },
      description: "Environmental awareness sales",
      categories: ["ECO", "SUSTAINABLE", "RENEWABLE"],
      focusProducts: ["Eco-friendly products", "Sustainable brands", "Recycled materials"],
      corporateResponsibility: "Green initiatives and donations"
    },
    {
      name: "Valentine's Day",
      dates: { start: { month: 2, day: 10 }, duration: 5 },
      typicalDiscount: { min: 20, max: 50 },
      description: "Romance-themed shopping",
      categories: ["JEWELRY", "GIFTS", "FLOWERS", "BEAUTY", "EXPERIENCES"],
      genderMarketing: ["His/hers sections", "Couple packages"],
      lastMinute: "Same-day delivery premium"
    },
    {
      name: "Mother's Day",
      dates: { start: { month: 5, day: 8 }, duration: 7 },
      typicalDiscount: { min: 25, max: 55 },
      description: "Gift-giving for mothers",
      categories: ["BEAUTY", "JEWELRY", "FLOWERS", "HOME", "EXPERIENCES"],
      popularGifts: ["Spa products", "Jewelry", "Flowers", "Tech gadgets"],
      internationalVariations: "Different dates in different countries"
    }
  ]
};

// Complete category patterns with detailed information
const COMPLETE_CATEGORY_PATTERNS = {
  ELECTRONICS: {
    peakMonths: [11, 1, 7, 8],
    bestEvents: ["Black Friday", "Prime Day", "Singles' Day", "Cyber Monday"],
    typicalDiscountRange: { min: 15, max: 70 },
    seasonalTrends: {
      1: { theme: "Post-holiday clearance", focus: "Previous year models" },
      7: { theme: "Summer tech deals", focus: "Travel gadgets, outdoor tech" },
      8: { theme: "Back to school", focus: "Laptops, tablets, accessories" },
      11: { theme: "Holiday shopping", focus: "Latest models, bundles" }
    },
    subCategories: {
      SMARTPHONES: { avgDiscount: "20-50%", peakEvents: ["Prime Day", "Black Friday"] },
      LAPTOPS: { avgDiscount: "15-40%", peakEvents: ["Back to School", "Black Friday"] },
      TVS: { avgDiscount: "25-60%", peakEvents: ["Super Bowl", "Black Friday"] },
      GAMING: { avgDiscount: "20-40%", peakEvents: ["Black Friday", "Holiday season"] }
    }
  },
  
  CLOTHING: {
    peakMonths: [1, 7, 10, 12],
    bestEvents: ["End of Season Sales", "Black Friday", "Fashion Week"],
    typicalDiscountRange: { min: 30, max: 80 },
    seasonalTrends: {
      1: { theme: "Winter clearance", focus: "Heavy winter wear" },
      3: { theme: "Spring arrivals", focus: "Light clothing, pastels" },
      7: { theme: "Summer clearance", focus: "Summer wear, beachwear" },
      9: { theme: "Fall fashion", focus: "Sweaters, boots, fall colors" },
      12: { theme: "Holiday outfits", focus: "Party wear, formal" }
    },
    subCategories: {
      FASHION: { avgDiscount: "40-90%", trendy: true },
      CASUAL: { avgDiscount: "30-70%", yearRound: true },
      FORMAL: { avgDiscount: "20-60%", peakEvents: ["Wedding season", "Holiday"] },
      ETHNIC: { avgDiscount: "30-80%", culturalEvents: ["Diwali", "Eid", "Christmas"] }
    }
  },
  
  BEAUTY: {
    peakMonths: [2, 5, 11, 12],
    bestEvents: ["Valentine's Day", "Mother's Day", "Holiday Sets"],
    typicalDiscountRange: { min: 15, max: 50 },
    seasonalTrends: {
      2: { theme: "Valentine's beauty", focus: "Romance-themed products" },
      5: { theme: "Mother's Day gifts", focus: "Gift sets, luxury items" },
      7: { theme: "Summer skincare", focus: "Sun protection, hydration" },
      11: { theme: "Holiday makeup", focus: "Party looks, gift sets" }
    },
    subCategories: {
      SKINCARE: { avgDiscount: "20-40%", yearRound: true },
      MAKEUP: { avgDiscount: "25-60%", trendy: true },
      FRAGRANCE: { avgDiscount: "15-40%", giftable: true },
      HAIR_CARE: { avgDiscount: "25-50%", essential: true }
    }
  },
  
  HOME: {
    peakMonths: [3, 5, 9, 11],
    bestEvents: ["Memorial Day", "Labor Day", "Black Friday"],
    typicalDiscountRange: { min: 20, max: 60 },
    seasonalTrends: {
      1: { theme: "Organization season", focus: "Storage, decluttering" },
      3: { theme: "Spring cleaning", focus: "Cleaning supplies, organization" },
      5: { theme: "Outdoor living", focus: "Patio furniture, gardening" },
      11: { theme: "Holiday decor", focus: "Christmas decorations" }
    },
    subCategories: {
      FURNITURE: { avgDiscount: "30-60%", bigTicket: true },
      DECOR: { avgDiscount: "25-70%", seasonal: true },
      APPLIANCES: { avgDiscount: "20-50%", peakEvents: ["Memorial Day", "Black Friday"] },
      KITCHEN: { avgDiscount: "25-60%", essential: true }
    }
  },
  
  SPORTS: {
    peakMonths: [1, 4, 6, 9],
    bestEvents: ["New Year Fitness", "Memorial Day", "Back to School"],
    typicalDiscountRange: { min: 20, max: 60 },
    seasonalTrends: {
      1: { theme: "New Year resolutions", focus: "Fitness equipment, activewear" },
      4: { theme: "Spring sports", focus: "Outdoor gear, bicycles" },
      6: { theme: "Summer activities", focus: "Water sports, camping" },
      9: { theme: "Fall sports gear", focus: "Football, winter prep" }
    },
    subCategories: {
      FITNESS: { avgDiscount: "25-50%", peakJanuary: true },
      OUTDOOR: { avgDiscount: "20-60%", seasonal: true },
      FOOTWEAR: { avgDiscount: "30-70%", yearRound: true },
      TEAM_SPORTS: { avgDiscount: "25-55%", seasonSpecific: true }
    }
  },
  
  TOYS: {
    peakMonths: [7, 11, 12],
    bestEvents: ["Toy Fair", "Black Friday", "Pre-Christmas"],
    typicalDiscountRange: { min: 25, max: 70 },
    seasonalTrends: {
      2: { theme: "Valentine's toys", focus: "Plush toys, gifts" },
      7: { theme: "Summer toys", focus: "Outdoor toys, water toys" },
      11: { theme: "Holiday preview", focus: "Hot toys, gift guides" },
      12: { theme: "Last-minute gifts", focus: "Stocking stuffers" }
    },
    subCategories: {
      EDUCATIONAL: { avgDiscount: "20-50%", yearRound: true },
      OUTDOOR: { avgDiscount: "30-60%", summer: true },
      ELECTRONICS: { avgDiscount: "25-60%", peakHoliday: true },
      PLUSH: { avgDiscount: "40-80%", giftable: true }
    }
  }
};

// Enhanced generator with detailed information
class EnhancedPromotionCalendarGenerator {
  generatePromotionalCalendar(input) {
    const year = new Date().getFullYear();
    
    // Get all relevant events with full details
    const relevantEvents = this.getRelevantEventsWithDetails(input);
    
    // Sort events by date
    const sortedEvents = this.sortEventsByDate(relevantEvents);
    
    // Convert to calendar format with actual dates
    const eventsWithDates = this.convertToDateFormat(sortedEvents, year);
    
    // Group into quarters
    const quarters = this.groupIntoQuarters(eventsWithDates);
    
    // Generate enhanced summary
    const summary = this.generateEnhancedSummary(eventsWithDates, input);
    
    // Get category insights
    const categoryInsights = this.getCategoryInsights(input.category, input.subCategory);
    
    return {
      year,
      country: input.country,
      category: input.category,
      subCategory: input.subCategory,
      quarters,
      summary,
      categoryInsights,
      marketingRecommendations: this.generateMarketingRecommendations(eventsWithDates, input),
      competitiveAnalysis: this.generateCompetitiveAnalysis(eventsWithDates, input.country)
    };
  }
  
  getRelevantEventsWithDetails(input) {
    const countryEvents = this.getCountrySpecificEvents(input.country);
    const globalEvents = COMPREHENSIVE_PROMOTIONAL_EVENTS_DB.GLOBAL || [];
    
    let allEvents = [...globalEvents, ...countryEvents];
    
    // Filter by category and subcategory
    allEvents = allEvents.filter(event => 
      this.isEventRelevantForCategory(event, input.category, input.subCategory)
    );
    
    // Add category-specific seasonal events if needed
    if (allEvents.length < 6) {
      allEvents = this.addDetailedSeasonalEvents(allEvents, input);
    }
    
    return allEvents;
  }
  
  getCountrySpecificEvents(country) {
    const countryData = COMPREHENSIVE_PROMOTIONAL_EVENTS_DB[country.toUpperCase()] || {};
    let allEvents = [];
    
    // Get all events from all platforms for the country
    Object.values(countryData).forEach(platformEvents => {
      if (Array.isArray(platformEvents)) {
        allEvents.push(...platformEvents);
      }
    });
    
    return allEvents;
  }
  
  isEventRelevantForCategory(event, category, subCategory) {
    // If event has no category restriction, it's for all categories
    if (!event.categories) return true;
    if (event.categories.includes("ALL")) return true;
    
    // Check if category matches
    if (event.categories.includes(category.toUpperCase())) return true;
    
    // Check subcategory if provided
    if (subCategory && event.categories.includes(subCategory.toUpperCase())) return true;
    
    return false;
  }
  
  addDetailedSeasonalEvents(existingEvents, input) {
    const pattern = COMPLETE_CATEGORY_PATTERNS[input.category.toUpperCase()];
    if (!pattern) return existingEvents;
    
    const seasonalEvents = [];
    
    // Add detailed seasonal events for each peak month
    Object.entries(pattern.seasonalTrends).forEach(([month, trend]) => {
      const monthNum = parseInt(month);
      const eventExists = existingEvents.some(e => e.dates.start.month === monthNum);
      
      if (!eventExists) {
        seasonalEvents.push({
          name: `${trend.theme}`,
          dates: { start: { month: monthNum, day: 1 }, duration: 7 },
          typicalDiscount: pattern.typicalDiscountRange,
          description: `${input.category} ${trend.theme} focusing on ${trend.focus}`,
          categories: [input.category.toUpperCase()],
          seasonalFocus: trend.focus,
          targetAudience: "General consumers",
          isSeasonal: true
        });
      }
    });
    
    return [...existingEvents, ...seasonalEvents];
  }
  
  getCategoryInsights(category, subCategory) {
    const pattern = COMPLETE_CATEGORY_PATTERNS[category.toUpperCase()];
    if (!pattern) return {};
    
    const insights = {
      peakMonths: pattern.peakMonths,
      bestEvents: pattern.bestEvents,
      typicalDiscountRange: pattern.typicalDiscountRange,
      seasonalTrends: pattern.seasonalTrends
    };
    
    // Add subcategory specific insights if available
    if (subCategory && pattern.subCategories && pattern.subCategories[subCategory.toUpperCase()]) {
      insights.subCategoryDetails = pattern.subCategories[subCategory.toUpperCase()];
    }
    
    return insights;
  }
  
  generateMarketingRecommendations(events, input) {
    const recommendations = [];
    const pattern = COMPLETE_CATEGORY_PATTERNS[input.category.toUpperCase()];
    
    // Timeline recommendations
    recommendations.push({
      type: "timing",
      suggestion: `Focus marketing efforts on peak months: ${pattern?.peakMonths?.join(', ')}`,
      priority: "high"
    });
    
    // Event-specific recommendations
    const majorEvents = events.filter(e => e.isNational || e.isGlobal || e.typicalDiscount.max > 50);
    recommendations.push({
      type: "events",
      suggestion: `Prioritize participation in: ${majorEvents.map(e => e.name).join(', ')}`,
      priority: "high"
    });
    
    // Channel recommendations
    const uniqueChannels = [...new Set(events.flatMap(e => e.marketingChannels || []))];
    recommendations.push({
      type: "channels",
      suggestion: `Utilize these channels: ${uniqueChannels.join(', ')}`,
      priority: "medium"
    });
    
    // Competitive strategy
    recommendations.push({
      type: "competition",
      suggestion: "Monitor competitor pricing during major events and prepare counter-strategies",
      priority: "high"
    });
    
    return recommendations;
  }
  
  generateCompetitiveAnalysis(events, country) {
    const competitorEvents = {};
    const directCompetitors = [];
    
    events.forEach(event => {
      if (event.platform) {
        if (!competitorEvents[event.platform]) {
          competitorEvents[event.platform] = [];
        }
        competitorEvents[event.platform].push(event.name);
      }
      
      if (event.directCompetitor) {
        directCompetitors.push(event.directCompetitor);
      }
    });
    
    return {
      competitorEvents,
      directCompetitors: [...new Set(directCompetitors)],
      countrySpecificTrends: this.getCountryTrends(country),
      platformAnalysis: this.analyzePlatformStrategies(events)
    };
  }
  
  getCountryTrends(country) {
    const trends = {
      INDIA: {
        majorSales: ["Diwali", "Independence Day"],
        platformLeaders: ["Amazon", "Flipkart"],
        consumerBehavior: "Festival-driven, price-sensitive",
        paymentMethods: ["UPI", "COD", "EMI"]
      },
      US: {
        majorSales: ["Black Friday", "Cyber Monday"],
        platformLeaders: ["Amazon", "Walmart"],
        consumerBehavior: "Deal-hunting, loyalty programs",
        paymentMethods: ["Credit cards", "Buy now pay later"]
      },
      UK: {
        majorSales: ["Boxing Day", "Black Friday"],
        platformLeaders: ["Amazon", "Tesco"],
        consumerBehavior: "Traditional shopping, online growth",
        paymentMethods: ["Debit cards", "PayPal"]
      }
    };
    
    return trends[country.toUpperCase()] || {};
  }
  
  analyzePlatformStrategies(events) {
    const strategies = {};
    
    events.forEach(event => {
      if (event.platform) {
        if (!strategies[event.platform]) {
          strategies[event.platform] = {
            exclusivityModel: event.exclusivity || "Open to all",
            avgDiscount: 0,
            specialOffers: [],
            membershipRequired: event.platform.includes("Prime") || event.platform.includes("Plus")
          };
        }
        
        strategies[event.platform].avgDiscount += (event.typicalDiscount.min + event.typicalDiscount.max) / 2;
        
        if (event.specialOffers) {
          strategies[event.platform].specialOffers.push(...event.specialOffers);
        }
      }
    });
    
    // Calculate average discounts
    Object.keys(strategies).forEach(platform => {
      const platformEvents = events.filter(e => e.platform === platform);
      if (platformEvents.length > 0) {
        strategies[platform].avgDiscount = Math.round(strategies[platform].avgDiscount / platformEvents.length);
      }
    });
    
    return strategies;
  }
  
  // All the helper methods from the basic version (sortEventsByDate, convertToDateFormat, etc.)
  sortEventsByDate(events) {
    return events.sort((a, b) => {
      const dateA = a.dates.start.month * 100 + a.dates.start.day;
      const dateB = b.dates.start.month * 100 + b.dates.start.day;
      return dateA - dateB;
    });
  }
  
  convertToDateFormat(events, year) {
    return events.map(event => {
      const startDate = new Date(year, event.dates.start.month - 1, event.dates.start.day);
      const endDate = new Date(startDate.getTime() + ((event.dates.duration || 1) * 24 * 60 * 60 * 1000));
      
      return {
        name: event.name,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        platform: event.platform,
        typicalDiscount: event.typicalDiscount,
        description: event.description || `${event.name} promotion`,
        isNational: event.isNational,
        isGlobal: event.isGlobal,
        // Enhanced details
        categories: event.categories,
        targetAudience: event.targetAudience,
        marketingChannels: event.marketingChannels,
        specialOffers: event.specialOffers,
        historicalPerformance: event.historicalPerformance,
        competition: event.competition,
        directCompetitor: event.directCompetitor,
        culturalSignificance: event.culturalSignificance,
        seasonalFocus: event.seasonalFocus,
        exclusivity: event.exclusivity,
        specialFeatures: event.specialFeatures
      };
    });
  }
  
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  groupIntoQuarters(events) {
    const quarters = {
      Q1: events.filter(e => this.getMonth(e.startDate) <= 3),
      Q2: events.filter(e => this.getMonth(e.startDate) > 3 && this.getMonth(e.startDate) <= 6),
      Q3: events.filter(e => this.getMonth(e.startDate) > 6 && this.getMonth(e.startDate) <= 9),
      Q4: events.filter(e => this.getMonth(e.startDate) > 9)
    };
    
    return quarters;
  }
  
  getMonth(dateString) {
    return parseInt(dateString.split('-')[1]);
  }
  
  generateEnhancedSummary(events, input) {
    const totalEvents = events.length;
    const keyEvents = events
      .filter(e => e.isNational || e.isGlobal || e.typicalDiscount.max > 50)
      .map(e => ({
        name: e.name,
        expectedDiscount: e.typicalDiscount,
        significance: e.isNational ? 'National' : e.isGlobal ? 'Global' : 'Major',
        targetAudience: e.targetAudience
      }));
    
    const monthCounts = {};
    events.forEach(event => {
      const month = this.getMonth(event.startDate);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const peakMonths = Object.entries(monthCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([month]) => parseInt(month));
    
    // Calculate average discounts
    const avgMinDiscount = events.reduce((sum, e) => sum + e.typicalDiscount.min, 0) / events.length;
    const avgMaxDiscount = events.reduce((sum, e) => sum + e.typicalDiscount.max, 0) / events.length;
    
    // Get all unique platforms
    const platforms = [...new Set(events.filter(e => e.platform).map(e => e.platform))];
    
    // Get all unique marketing channels
    const marketingChannels = [...new Set(events.flatMap(e => e.marketingChannels || []))];
    
    return {
      totalEvents,
      keyEvents,
      peakMonths,
      averageDiscount: {
        min: Math.round(avgMinDiscount),
        max: Math.round(avgMaxDiscount)
      },
      participatingPlatforms: platforms,
      recommendedMarketingChannels: marketingChannels,
      countrySpecific: input.country,
      categoryFocus: input.category,
      subcategoryFocus: input.subCategory
    };
  }
}

// Export for use in other files
module.exports = {
  EnhancedPromotionCalendarGenerator,
  COMPREHENSIVE_PROMOTIONAL_EVENTS_DB,
  COMPLETE_CATEGORY_PATTERNS
};

// Example usage with enhanced details
if (require.main === module) {
  const generator = new EnhancedPromotionCalendarGenerator();
  
  // Test with detailed output
  const result = generator.generatePromotionalCalendar({
    category: 'ELECTRONICS',
    country: 'INDIA',
    subCategory: 'SMARTPHONES'
  });
  
  console.log('Enhanced Promotion Calendar:');
  console.log(JSON.stringify(result, null, 2));
  
  // Show marketing recommendations
  console.log('\nMarketing Recommendations:');
  result.marketingRecommendations.forEach(rec => {
    console.log(`[${rec.priority.toUpperCase()}] ${rec.type}: ${rec.suggestion}`);
  });
  
  // Show competitive analysis
  console.log('\nCompetitive Analysis:');
  console.log('Platform Strategies:', result.competitiveAnalysis.platformAnalysis);
  console.log('Direct Competitors:', result.competitiveAnalysis.directCompetitors);
}