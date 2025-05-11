// agent-core.js - Frontend JavaScript for Dynamic Pricing Agent (Fixed)

// Global state
let currentProductDetails = null;
let currentCompetitorDetails = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAvailableCategories();
    setupEventListeners();
    
    // Initialize the UI state
    resetUIForNewAnalysis();
});

// Event Listeners Setup
function setupEventListeners() {
    const productForm = document.getElementById('productAnalysisForm');
    const pricingForm = document.getElementById('pricingForm');
    const promotionForm = document.getElementById('promotionForm');
    
    if (productForm) productForm.addEventListener('submit', handleProductAnalysis);
    if (pricingForm) pricingForm.addEventListener('submit', handlePriceOptimization);
    if (promotionForm) promotionForm.addEventListener('submit', handlePromotionGeneration);
}

// Product Analysis Handler
async function handleProductAnalysis(e) {
    e.preventDefault();
    const productUrl = document.getElementById('productUrl').value;
    
    if (!productUrl) {
        showAlert('Please enter a product URL', 'warning');
        return;
    }
    
    showLoading(true);
    resetUIForNewAnalysis();
    
    try {
        const response = await fetch('/api/analyze-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productUrl })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to analyze product');
        }
        
        currentProductDetails = result.data.mainProduct;
        currentCompetitorDetails = result.data.competitorsProduct;
        
        showAlert(result.message || 'Analysis successful!', 'success');
        displayResults(result.data);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showAlert(`Analysis failed: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

// Price Optimization Handler
async function handlePriceOptimization(e) {
    e.preventDefault();
    
    if (!currentProductDetails) {
        showAlert('Please analyze a product first', 'warning');
        return;
    }
    
    const competitorPrices = currentCompetitorDetails?.competitors?.map(c => c.price).filter(p => p !== null && !isNaN(p)) || [];
    
    const payload = {
        productionCostPerUnit: parseFloat(document.getElementById('productionCost').value),
        salesPerMonth: parseInt(document.getElementById('salesPerMonth').value),
        targetMargin: parseFloat(document.getElementById('targetMargin').value),
        productPrice: currentProductDetails.price,
        competitorPrices: competitorPrices,
        currency: currentProductDetails.currency_code || 'USD'
    };
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/optimize-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to optimize price');
        }
        
        displayPricingStrategy(result);
        showAlert('Price optimization successful!', 'success');
        
    } catch (error) {
        console.error('Optimization error:', error);
        showAlert(`Optimization failed: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

// Promotion Generation Handler
async function handlePromotionGeneration(e) {
    e.preventDefault();
    
    if (!currentProductDetails) {
        showAlert('Please analyze a product first', 'warning');
        return;
    }
    
    const payload = {
        category: document.getElementById('productCategory').value,
        productCost: parseFloat(document.getElementById('promoProductCost').value),
        productPrice: parseFloat(document.getElementById('promoProductPrice').value),
        marginTarget: parseFloat(document.getElementById('promoTargetMargin').value),
        avgMonthlySales: parseInt(document.getElementById('promoAvgMonthlySales').value)
    };
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/generate-promotion-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to generate promotions');
        }
        
        displayPromotionSchedule(result.data);
        showAlert('Promotion schedule generated successfully!', 'success');
        
    } catch (error) {
        console.error('Promotion error:', error);
        showAlert(`Failed to generate promotions: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

// Display Functions
function displayResults(data) {
    // Display main product
    const mainProductSection = document.getElementById('mainProductSection');
    const mainProductDetails = document.getElementById('mainProductDetails');
    
    if (data.mainProduct && mainProductDetails) {
        mainProductDetails.innerHTML = createProductCard(data.mainProduct, true);
        if (mainProductSection) mainProductSection.style.display = 'block';
        
        // Populate pricing and promotion forms
        populateFormsWithProductData(data.mainProduct);
    }
    
    // Display competitors
    if (data.competitorsProduct) {
        displayCompetitors(data.competitorsProduct);
    }
    
    // Show sections
    const pricingSection = document.getElementById('pricingParametersSection');
    const promotionSection = document.getElementById('promotionParametersSection');
    
    if (pricingSection) pricingSection.style.display = 'block';
    if (promotionSection) promotionSection.style.display = 'block';
}

function createProductCard(product, isMainProduct = false) {
    const currency = product.currency || product.currency_symbol || '$';
    const price = product.price ? `${currency}${parseFloat(product.price).toFixed(2)}` : 'N/A';
    
    let html = `
        <div class="card mb-3">
            <div class="row g-0">
                ${product.product_image_url ? `
                    <div class="col-md-3">
                        <img src="${product.product_image_url}" class="img-fluid rounded-start product-image" alt="${product.name || 'Product'}">
                    </div>
                ` : ''}
                <div class="${product.product_image_url ? 'col-md-9' : 'col-12'}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name || 'Unknown Product'}</h5>
                        ${product.company ? `<p class="text-muted">Brand: ${product.company}</p>` : ''}
                        <p class="card-text">
                            <span class="fw-bold fs-4 competitor-price">${price}</span>
                        </p>
                        ${product.description ? `<p class="card-text">${product.description.substring(0, 150)}...</p>` : ''}
                        ${isMainProduct && (product.category || product.market) ? `
                            <div class="mt-2">
                                ${product.category ? `<span class="badge bg-secondary me-2">${product.category}</span>` : ''}
                                ${product.market ? `<span class="badge bg-info">${product.market}</span>` : ''}
                            </div>
                        ` : ''}
                        ${!isMainProduct && product.url ? `
                            <a href="${product.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                <i class="bi bi-box-arrow-up-right me-1"></i>View Product
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

function displayCompetitors(competitorData) {
    const competitorSection = document.getElementById('competitorSection');
    const competitorGrid = document.getElementById('competitorGrid');
    const competitorSource = document.getElementById('competitorSource');
    
    if (competitorData.source && competitorSource) {
        competitorSource.textContent = `Source: ${competitorData.source}`;
        if (competitorData.error) {
            competitorSource.textContent += ` | Note: ${competitorData.error}`;
        }
    }
    
    if (competitorGrid) {
        if (competitorData.competitors && competitorData.competitors.length > 0) {
            competitorGrid.innerHTML = competitorData.competitors.map(competitor => `
                <div class="col-md-6 col-lg-4">
                    ${createProductCard(competitor)}
                </div>
            `).join('');
        } else {
            competitorGrid.innerHTML = '<div class="col-12"><p class="text-muted">No competitors found.</p></div>';
        }
    }
    
    if (competitorSection) competitorSection.style.display = 'block';
}

function displayPricingStrategy(result) {
    const strategySection = document.getElementById('pricingStrategySection');
    const strategyResults = document.getElementById('strategyResults');
    const currency = result.currency || '$';
    
    if (!strategyResults) return;
    
    let html = '';
    
    // Optimized strategy (highlighted)
    if (result.optimizedStrategy) {
        html += `
            <div class="strategy-card optimized-strategy">
                <h4 class="text-primary mb-3">
                    <i class="bi bi-star-fill me-2"></i>Recommended Strategy
                </h4>
                <h5>${result.optimizedStrategy.name}</h5>
                <p class="competitor-price">${currency}${parseFloat(result.optimizedStrategy.price).toFixed(2)}</p>
                <p class="text-muted">${result.optimizedStrategy.justification}</p>
                <div class="metrics mt-3">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Projected Profit:</span>
                        <span class="fw-bold">${currency}${parseFloat(result.optimizedStrategy.projectedProfit).toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Current Margin:</span>
                        <span class="fw-bold">${result.optimizedStrategy.currentMargin?.toFixed(2) || 'N/A'}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Other strategies
    if (result.productStrategies && result.productStrategies.length > 0) {
        html += result.productStrategies.map(strategy => `
            <div class="strategy-card">
                <h5>${strategy.name}</h5>
                <p class="competitor-price">${currency}${parseFloat(strategy.price).toFixed(2)}</p>
                <p class="text-muted">${strategy.justification}</p>
                <div class="metrics mt-3">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Projected Profit:</span>
                        <span class="fw-bold">${currency}${parseFloat(strategy.projectedProfit).toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Current Margin:</span>
                        <span class="fw-bold">${strategy.currentMargin?.toFixed(2) || 'N/A'}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    strategyResults.innerHTML = html;
    if (strategySection) strategySection.style.display = 'block';
}

function displayPromotionSchedule(promotionData) {
    const promotionSection = document.getElementById('promotionSection');
    const promotionCalendar = document.getElementById('promotionCalendar');
    
    if (!promotionCalendar) return;
    
    if (promotionData.promotionSchedule && promotionData.promotionSchedule.length > 0) {
        promotionCalendar.innerHTML = promotionData.promotionSchedule.map(event => `
            <div class="promotion-event">
                <h5>${event.month}</h5>
                <div class="mb-2">
                    <span class="badge bg-primary">${event.priority} Priority</span>
                    <span class="badge bg-secondary">${event.discount}% Discount</span>
                </div>
                <p class="text-muted mb-1">${event.reason}</p>
                <p class="mb-1"><strong>Budget:</strong> ${event.promotionBudget} (${event.budgetPercentage}%)</p>
                <p class="mb-1"><strong>Sales Increase:</strong> ${event.salesIncrease}%</p>
                <div class="mt-2">
                    <small class="text-muted">
                        <strong>Actions:</strong> ${event.actions ? event.actions.join(', ') : 'Standard promotions'}
                    </small>
                </div>
            </div>
        `).join('');
    } else {
        promotionCalendar.innerHTML = '<p class="text-muted">No promotion schedule available.</p>';
    }
    
    if (promotionSection) promotionSection.style.display = 'block';
}

// Utility Functions
function populateFormsWithProductData(product) {
    // Populate promotion form
    const priceInput = document.getElementById('promoProductPrice');
    if (priceInput && product.price) {
        priceInput.value = parseFloat(product.price).toFixed(2);
    }
    
    const categorySelect = document.getElementById('productCategory');
    if (categorySelect && product.category) {
        // Try to select the matching category
        const categoryValue = product.category.toLowerCase();
        for (let option of categorySelect.options) {
            if (option.value === categoryValue) {
                categorySelect.value = categoryValue;
                break;
            }
        }
    }
}

async function fetchAvailableCategories() {
    try {
        const response = await fetch('/api/available-categories');
        const result = await response.json();
        
        if (result.success && result.categories) {
            const categorySelect = document.getElementById('productCategory');
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Select Category</option>';
                
                result.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.toLowerCase();
                    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    categorySelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertId = `alert_${Date.now()}`;
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const analyzeButton = document.getElementById('analyzeButton');
    const optimizeButton = document.getElementById('optimizePriceButton');
    const generateButton = document.getElementById('generatePromotionButton');
    
    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
    
    if (analyzeButton) analyzeButton.disabled = show;
    if (optimizeButton) optimizeButton.disabled = show;
    if (generateButton) generateButton.disabled = show;
}

function resetUIForNewAnalysis() {
    const sections = [
        'mainProductSection',
        'competitorSection',
        'pricingParametersSection',
        'pricingStrategySection',
        'promotionParametersSection',
        'promotionSection'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Clear content divs
    const contentDivs = [
        'mainProductDetails',
        'competitorGrid',
        'strategyResults',
        'promotionCalendar',
        'alertContainer'
    ];
    
    contentDivs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = '';
    });
    
    // Reset text elements
    const competitorSource = document.getElementById('competitorSource');
    if (competitorSource) competitorSource.textContent = '';
    
    // Reset global state
    currentProductDetails = null;
    currentCompetitorDetails = null;
}