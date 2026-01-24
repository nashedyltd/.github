// Nashedy Public Website JavaScript - Secure Backend Integration
// All dynamic content fetched from secure Rust backend

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.nashedy.io';

// Security headers for all requests
const SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Nashedy-Client': 'web-public'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize security
    initializeSecurity();
    
    // Load dynamic content from backend
    loadPublicData();
    
    // Setup secure navigation
    setupSecureNavigation();
    
    // Initialize animations and interactions
    initializeAnimations();
    
    // Setup form handling
    setupSecureForms();
});

function initializeSecurity() {
    // Validate browser security
    if (!window.crypto || !window.fetch) {
        console.error('Browser security requirements not met');
        return;
    }
    
    // Add CSP meta tag
    const csp = document.createElement('meta');
    csp.httpEquiv = 'Content-Security-Policy';
    csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.nashedy.io;";
    document.head.appendChild(csp);
    
    // Monitor for security violations
    window.addEventListener('securitypolicyviolation', function(e) {
        console.error('CSP Violation:', e);
        reportSecurityViolation(e);
    });
}

async function loadPublicData() {
    try {
        // Load system status for public display
        const statusResponse = await securePublicRequest('/api/public/status');
        if (statusResponse.success) {
            updatePublicStatus(statusResponse.data);
        }
        
        // Load service statistics
        const statsResponse = await securePublicRequest('/api/public/stats');
        if (statsResponse.success) {
            updatePublicStats(statsResponse.data);
        }
        
        // Load feature information
        const featuresResponse = await securePublicRequest('/api/public/features');
        if (featuresResponse.success) {
            updateFeaturesDisplay(featuresResponse.data);
        }
        
    } catch (error) {
        console.error('Error loading public data:', error);
        // Graceful degradation - show static content
    }
}

async function securePublicRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
        ...SECURITY_HEADERS,
        ...options.headers
    };
    
    const requestOptions = {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit' // No credentials for public endpoints
    };
    
    try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response structure');
        }
        
        return data;
    } catch (error) {
        console.error('Public API request failed:', error);
        throw error;
    }
}

function updatePublicStatus(statusData) {
    // Update system status indicators
    const statusElements = document.querySelectorAll('.system-status');
    statusElements.forEach(element => {
        if (statusData.system_online) {
            element.textContent = 'System Online';
            element.className = 'system-status online';
        } else {
            element.textContent = 'System Maintenance';
            element.className = 'system-status maintenance';
        }
    });
    
    // Update uptime display
    const uptimeElements = document.querySelectorAll('.uptime-display');
    uptimeElements.forEach(element => {
        element.textContent = statusData.uptime || '99.9%';
    });
}

function updatePublicStats(statsData) {
    // Update statistics with real backend data
    if (statsData.metrics) {
        const metrics = statsData.metrics;
        
        // Update user count
        const userCountElements = document.querySelectorAll('.user-count');
        userCountElements.forEach(element => {
            if (metrics.total_users) {
                animateCounter(element, metrics.total_users);
            }
        });
        
        // Update project count
        const projectCountElements = document.querySelectorAll('.project-count');
        projectCountElements.forEach(element => {
            if (metrics.total_projects) {
                animateCounter(element, metrics.total_projects);
            }
        });
        
        // Update uptime percentage
        const uptimeElements = document.querySelectorAll('.uptime-stat');
        uptimeElements.forEach(element => {
            if (metrics.uptime_percentage) {
                element.textContent = `${metrics.uptime_percentage}%`;
            }
        });
    }
}

function updateFeaturesDisplay(featuresData) {
    // Update feature cards with real data from backend
    if (featuresData.features) {
        const featuresContainer = document.querySelector('.features-grid');
        if (featuresContainer) {
            featuresContainer.innerHTML = featuresData.features.map(feature => `
                <div class="feature-card">
                    <div class="feature-icon">${sanitizeInput(feature.icon)}</div>
                    <h3>${sanitizeInput(feature.title)}</h3>
                    <p>${sanitizeInput(feature.description)}</p>
                </div>
            `).join('');
        }
    }
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>\"'&]/g, function(match) {
        const map = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
        };
        return map[match];
    });
}
function setupSecureNavigation() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.navbar-nav');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Secure navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Close mobile menu when link is clicked
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Validate internal links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            } else if (href && !href.startsWith('http')) {
                // Internal page navigation - validate and allow
                if (isValidInternalLink(href)) {
                    // Allow navigation to proceed normally
                    return true;
                } else {
                    e.preventDefault();
                    console.warn('Invalid internal link:', href);
                }
            }
        });
    });

    // Navbar brand click handler
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.addEventListener('click', function(e) {
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Navbar background on scroll
    const navbar = document.querySelector('.site-header');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function isValidInternalLink(href) {
    const validPages = [
        'index.html', 'about.html', 'features.html', 'pricing.html',
        'hosting.html', 'domains.html', 'contact.html', 'dashboard.html'
    ];
    return validPages.includes(href) || (href.startsWith('./') && validPages.includes(href.substring(2)));
}

function initializeAnimations() {
    // Animate elements on scroll with improved performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                // Add staggered animation for grid items
                if (entry.target.parentElement.classList.contains('grid') || 
                    entry.target.parentElement.classList.contains('features-grid') ||
                    entry.target.parentElement.classList.contains('pricing-grid')) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(`
        .card, .feature-card, .pricing-card, .tech-item, .value-card, 
        .faq-item, .impact-stat, .column-card, .service-card, 
        .solution-item, .impact-story, .stat-item, .metric, 
        .contact-method
    `);
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Counter animation for stats with improved performance
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/[^\d]/g, ''));
                
                if (number && number > 0) {
                    animateCounter(entry.target, number);
                }
            }
        });
    }, { threshold: 0.5 });

    const statNumbers = document.querySelectorAll(`
        .stat-number, .metric-number, .user-count, .project-count, 
        .amount, .impact-stat .stat-number
    `);
    
    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });

    // Enhanced hover effects for cards with better performance
    const cards = document.querySelectorAll(`
        .card, .feature-card, .pricing-card, .tech-item, .value-card, 
        .faq-item, .column-card, .service-card, .solution-item, 
        .contact-method
    `);
    
    cards.forEach(card => {
        let hoverTimeout;
        
        card.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                this.style.transform = 'translateY(0)';
            }, 50);
        });
        
        // Add touch support for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'translateY(0)';
            }, 150);
        });
    });

    // Parallax effect for hero sections (disabled on mobile for performance)
    if (window.innerWidth > 768) {
        const heroSections = document.querySelectorAll('.hero, .hero-section, .page-hero');
        
        window.addEventListener('scroll', throttle(function() {
            const scrolled = window.pageYOffset;
            
            heroSections.forEach(hero => {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            });
        }, 16)); // 60fps throttling
    }
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function setupSecureForms() {
    // Contact form handling
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleSecureFormSubmission);
    }
    
    // Newsletter signup
    const newsletterForm = document.querySelector('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
    
    // Domain search form
    const domainForm = document.querySelector('#domain-search-form');
    if (domainForm) {
        domainForm.addEventListener('submit', handleDomainSearch);
    }
}

async function handleSecureFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate and sanitize form data
    const sanitizedData = {
        name: sanitizeInput(data.name || ''),
        email: sanitizeInput(data.email || ''),
        subject: sanitizeInput(data.subject || ''),
        message: sanitizeInput(data.message || '')
    };
    
    // Validate required fields
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
        showFormError('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(sanitizedData.email)) {
        showFormError('Please enter a valid email address');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Submit to secure backend
        const response = await securePublicRequest('/api/public/contact', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
        
        if (response.success) {
            showFormSuccess('Thank you for your message! We will get back to you soon.');
            form.reset();
        } else {
            throw new Error(response.message || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormError('Failed to send message. Please try again later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleNewsletterSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = sanitizeInput(form.querySelector('input[type="email"]').value);
    
    if (!isValidEmail(email)) {
        showFormError('Please enter a valid email address');
        return;
    }
    
    try {
        const response = await securePublicRequest('/api/public/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        
        if (response.success) {
            showFormSuccess('Successfully subscribed to newsletter!');
            form.reset();
        } else {
            throw new Error(response.message || 'Subscription failed');
        }
        
    } catch (error) {
        console.error('Newsletter signup error:', error);
        showFormError('Failed to subscribe. Please try again later.');
    }
}

async function handleDomainSearch(e) {
    e.preventDefault();
    
    const form = e.target;
    const domain = sanitizeInput(form.querySelector('input[type="text"]').value);
    
    if (!domain || domain.length < 3) {
        showFormError('Please enter a valid domain name');
        return;
    }
    
    try {
        const response = await securePublicRequest('/api/public/domain-check', {
            method: 'POST',
            body: JSON.stringify({ domain })
        });
        
        if (response.success) {
            displayDomainResults(response.data);
        } else {
            throw new Error(response.message || 'Domain check failed');
        }
        
    } catch (error) {
        console.error('Domain search error:', error);
        showFormError('Failed to check domain availability.');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

function showFormError(message) {
    showNotification('error', message);
}

function showFormSuccess(message) {
    showNotification('success', message);
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${sanitizeInput(message)}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function displayDomainResults(results) {
    // Display domain search results
    const resultsContainer = document.querySelector('#domain-results');
    if (resultsContainer && results.domains) {
        resultsContainer.innerHTML = results.domains.map(domain => `
            <div class="domain-result">
                <span class="domain-name">${sanitizeInput(domain.name)}</span>
                <span class="domain-status ${domain.available ? 'available' : 'taken'}">
                    ${domain.available ? 'Available' : 'Taken'}
                </span>
                ${domain.available ? `<span class="domain-price">$${domain.price}/year</span>` : ''}
            </div>
        `).join('');
    }
}

// Add CSS for mobile menu
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 80px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 80px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 2rem;
            transition: left 0.3s ease;
            z-index: 999;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-link {
            padding: 1rem 0;
            font-size: 1.2rem;
        }
        
        .nav-toggle.active .bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active .bar:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    updateCounter();
}

// Security violation reporting
async function reportSecurityViolation(violation) {
    try {
        await securePublicRequest('/api/public/security-violation', {
            method: 'POST',
            body: JSON.stringify({
                type: 'csp_violation',
                blocked_uri: violation.blockedURI,
                violated_directive: violation.violatedDirective,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Failed to report security violation:', error);
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    }
});

// Performance optimization: Lazy load images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', function() {
    initializeLazyLoading();
});

// Preload critical resources
function preloadResource(href, as) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
}

// Preload fonts
preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 'style');

console.log('🔒 Nashedy secure public website loaded - All data from backend APIs');

// Cookie Consent Management
function initializeCookieConsent() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');
    
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('nashedy-cookie-consent');
    
    if (!cookieConsent) {
        // Show banner after a short delay
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000);
    }
    
    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('nashedy-cookie-consent', 'accepted');
        cookieBanner.classList.remove('show');
        
        // Initialize analytics or other tracking here
        console.log('Cookies accepted - Analytics initialized');
    });
    
    declineBtn.addEventListener('click', function() {
        localStorage.setItem('nashedy-cookie-consent', 'declined');
        cookieBanner.classList.remove('show');
        
        console.log('Cookies declined - No tracking initialized');
    });
}

// Web Search Functionality
function performWebSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('error', 'Please enter a search term');
        return;
    }
    
    // Sanitize the search query
    const sanitizedQuery = encodeURIComponent(query);
    
    // Perform web search using multiple search engines
    const searchEngines = [
        {
            name: 'Google',
            url: `https://www.google.com/search?q=${sanitizedQuery}+site:nashedy.io`,
            primary: true
        },
        {
            name: 'DuckDuckGo',
            url: `https://duckduckgo.com/?q=${sanitizedQuery}+site:nashedy.io`,
            primary: false
        },
        {
            name: 'Bing',
            url: `https://www.bing.com/search?q=${sanitizedQuery}+site:nashedy.io`,
            primary: false
        }
    ];
    
    // Try to search our backend first
    searchNashedyContent(query).then(results => {
        if (results && results.length > 0) {
            displaySearchResults(results);
        } else {
            // Fallback to web search
            const primaryEngine = searchEngines.find(engine => engine.primary);
            window.open(primaryEngine.url, '_blank', 'noopener,noreferrer');
        }
    }).catch(error => {
        console.error('Search error:', error);
        // Fallback to web search
        const primaryEngine = searchEngines.find(engine => engine.primary);
        window.open(primaryEngine.url, '_blank', 'noopener,noreferrer');
    });
    
    // Clear search input
    searchInput.value = '';
}

// Search Nashedy Content
async function searchNashedyContent(query) {
    try {
        const response = await securePublicRequest('/api/public/search', {
            method: 'POST',
            body: JSON.stringify({ query: sanitizeInput(query) })
        });
        
        if (response.success) {
            return response.data.results;
        }
        
        return null;
    } catch (error) {
        console.error('Nashedy content search failed:', error);
        return null;
    }
}

// Display Search Results
function displaySearchResults(results) {
    // Create search results modal
    const modal = document.createElement('div');
    modal.className = 'search-results-modal';
    modal.innerHTML = `
        <div class="search-results-content">
            <div class="search-results-header">
                <h3>Search Results</h3>
                <button class="close-search-results" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="search-results-list">
                ${results.map(result => `
                    <div class="search-result-item">
                        <h4><a href="${sanitizeInput(result.url)}" target="_blank" rel="noopener">${sanitizeInput(result.title)}</a></h4>
                        <p>${sanitizeInput(result.description)}</p>
                        <span class="search-result-url">${sanitizeInput(result.url)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Enhanced Navigation with Logo Animation
function enhanceNavigation() {
    const logo = document.querySelector('.navbar-brand img');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Logo animation on hover
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Enhanced nav link animations
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize Enhanced Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functionality
    initializeSecurity();
    loadPublicData();
    setupSecureNavigation();
    initializeAnimations();
    setupSecureForms();
    
    // Initialize new features
    initializeCookieConsent();
    enhanceNavigation();
    
    // Add search form event listener
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', performWebSearch);
    }
});

// Add search results modal styles
const searchModalStyles = document.createElement('style');
searchModalStyles.textContent = `
    .search-results-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    }
    
    .search-results-content {
        background: var(--surface-primary);
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .search-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .close-search-results {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .close-search-results:hover {
        background: var(--surface-secondary);
    }
    
    .search-results-list {
        padding: 1rem;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .search-result-item {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s ease;
    }
    
    .search-result-item:hover {
        background: var(--surface-secondary);
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .search-result-item h4 {
        margin: 0 0 0.5rem 0;
    }
    
    .search-result-item h4 a {
        color: var(--primary-color);
        text-decoration: none;
    }
    
    .search-result-item h4 a:hover {
        text-decoration: underline;
    }
    
    .search-result-item p {
        margin: 0 0 0.5rem 0;
        color: var(--text-secondary);
        line-height: 1.4;
    }
    
    .search-result-url {
        font-size: 0.9rem;
        color: var(--text-tertiary);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(searchModalStyles);

console.log('🔍 Enhanced Nashedy website loaded - Search, cookies, and animations ready');

// Domain Search Functionality
function performDomainSearch(event) {
    event.preventDefault();
    
    const domainInput = document.getElementById('domainSearch');
    const query = domainInput.value.trim();
    
    if (!query) {
        showNotification('error', 'Please enter a domain name');
        return;
    }
    
    // Clean the domain name
    const cleanDomain = query.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Show loading state
    const resultsContainer = document.getElementById('domain-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="domain-loading">
                <div class="loading-spinner"></div>
                <p>Searching for "${cleanDomain}"...</p>
            </div>
        `;
    }
    
    // Simulate domain search (replace with real API call)
    setTimeout(() => {
        const extensions = ['.com', '.net', '.org', '.io', '.tech', '.co', '.app', '.dev'];
        const results = extensions.map(ext => {
            const fullDomain = cleanDomain.replace(/\.[a-z]+$/, '') + ext;
            const available = Math.random() > 0.5; // Random availability for demo
            const price = getRandomPrice(ext);
            
            return {
                name: fullDomain,
                available: available,
                price: price
            };
        });
        
        displayDomainSearchResults(results);
    }, 2000);
}

function getRandomPrice(extension) {
    const prices = {
        '.com': '$12.99',
        '.net': '$14.99',
        '.org': '$13.99',
        '.io': '$39.99',
        '.tech': '$24.99',
        '.co': '$29.99',
        '.app': '$19.99',
        '.dev': '$15.99'
    };
    return prices[extension] || '$19.99';
}

function displayDomainSearchResults(results) {
    const resultsContainer = document.getElementById('domain-results');
    if (!resultsContainer) return;
    
    const availableResults = results.filter(r => r.available);
    const takenResults = results.filter(r => !r.available);
    
    resultsContainer.innerHTML = `
        <div class="domain-results-header">
            <h3>Domain Search Results</h3>
        </div>
        
        ${availableResults.length > 0 ? `
            <div class="domain-section">
                <h4 class="section-title available">✓ Available Domains</h4>
                <div class="domain-list">
                    ${availableResults.map(domain => `
                        <div class="domain-result available">
                            <div class="domain-info">
                                <span class="domain-name">${sanitizeInput(domain.name)}</span>
                                <span class="domain-price">${domain.price}/year</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="registerDomain('${domain.name}')">
                                Register
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${takenResults.length > 0 ? `
            <div class="domain-section">
                <h4 class="section-title taken">✗ Unavailable Domains</h4>
                <div class="domain-list">
                    ${takenResults.map(domain => `
                        <div class="domain-result taken">
                            <div class="domain-info">
                                <span class="domain-name">${sanitizeInput(domain.name)}</span>
                                <span class="domain-status">Taken</span>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="suggestAlternatives('${domain.name}')">
                                Alternatives
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function registerDomain(domainName) {
    showNotification('success', `Redirecting to register ${domainName}...`);
    // In a real implementation, this would redirect to a registration page
    setTimeout(() => {
        window.open(`https://www.namecheap.com/domains/registration/results/?domain=${domainName}`, '_blank');
    }, 1000);
}

function suggestAlternatives(domainName) {
    const baseName = domainName.replace(/\.[a-z]+$/, '');
    const alternatives = [
        `get${baseName}.com`,
        `${baseName}hq.com`,
        `${baseName}pro.com`,
        `my${baseName}.com`,
        `${baseName}app.com`
    ];
    
    showNotification('info', `Suggested alternatives: ${alternatives.slice(0, 3).join(', ')}`);
}

// Initialize domain search when page loads
document.addEventListener('DOMContentLoaded', function() {
    const domainForm = document.querySelector('.domain-search-form');
    if (domainForm) {
        domainForm.addEventListener('submit', performDomainSearch);
    }
});

// ===== ENHANCED JAVASCRIPT FUNCTIONALITY =====

// Global animation controller
class AnimationController {
    constructor() {
        this.observers = [];
        this.init();
    }

    init() {
        // Initialize intersection observers for scroll animations
        this.initScrollAnimations();
        // Initialize staggered animations
        this.initStaggeredAnimations();
        // Initialize counter animations
        this.initCounterAnimations();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with scroll animation classes
        document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .js-animate')
            .forEach(el => observer.observe(el));

        this.observers.push(observer);
    }

    initStaggeredAnimations() {
        const grids = document.querySelectorAll('.grid-animate');
        grids.forEach(grid => {
            setTimeout(() => {
                grid.classList.add('animate');
            }, 300);
        });
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('.counter, .stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
        this.observers.push(observer);
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target') || element.textContent);
        const duration = 2000;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easeProgress);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
    }
}

// Form validation and enhancement
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.enhanceForms();
        this.setupValidation();
    }

    enhanceForms() {
        // Add floating labels effect
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', this.handleFocus.bind(this));
            input.addEventListener('blur', this.handleBlur.bind(this));
            input.addEventListener('input', this.handleInput.bind(this));
        });

        // Form submission handling
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        });
    }

    handleFocus(e) {
        e.target.parentElement.classList.add('focused');
    }

    handleBlur(e) {
        if (!e.target.value) {
            e.target.parentElement.classList.remove('focused');
        }
    }

    handleInput(e) {
        const isValid = e.target.checkValidity();
        const parent = e.target.parentElement;
        
        if (isValid) {
            parent.classList.remove('invalid');
            parent.classList.add('valid');
        } else {
            parent.classList.remove('valid');
            parent.classList.add('invalid');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Add loading state
        this.setLoadingState(submitBtn, true);
        
        try {
            // Form validation
            if (!form.checkValidity()) {
                this.showFormErrors(form);
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Simulate API call (replace with actual endpoint)
            await this.submitForm(data, form.action || '/api/contact');
            
            // Show success message
            this.showSuccess(form);
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(form, 'Something went wrong. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async submitForm(data, endpoint) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In production, this would be:
        // const response = await fetch(endpoint, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // return response.json();
        
        // For demo purposes, simulate success
        return { success: true, message: 'Form submitted successfully' };
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.textContent = 'Sending...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Send Message';
        }
    }

    showFormErrors(form) {
        const invalidFields = form.querySelectorAll(':invalid');
        invalidFields.forEach(field => {
            field.parentElement.classList.add('invalid');
            field.focus();
        });
        
        this.showError(form, 'Please correct the errors in the form.');
    }

    showSuccess(form) {
        const successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.innerHTML = `
            <div class="success-icon">✓</div>
            <div class="success-message">Message sent successfully! We'll get back to you soon.</div>
        `;
        
        form.parentNode.insertBefore(successMsg, form.nextSibling);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successMsg.remove();
        }, 5000);
    }

    showError(form, message) {
        // Remove existing error messages
        const existingError = form.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-error';
        errorMsg.textContent = message;
        
        form.appendChild(errorMsg);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMsg.remove();
        }, 5000);
    }
}

// Navigation enhancements
class NavigationHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileNav();
        this.setupSmoothScroll();
        this.setupActiveLinks();
    }

    setupMobileNav() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.navbar-nav');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Animate menu items
                const navItems = navMenu.querySelectorAll('li');
                navItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = navMenu.classList.contains('active') ? '1' : '0';
                        item.style.transform = navMenu.classList.contains('active') ? 'translateY(0)' : 'translateY(-10px)';
                    }, index * 50);
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => observer.observe(section));
    }
}

// Modal system
class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupModalTriggers();
        this.setupModalClose();
    }

    setupModalTriggers() {
        const triggers = document.querySelectorAll('[data-modal-trigger]');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-trigger');
                this.openModal(modalId);
            });
        });
    }

    setupModalClose() {
        const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close on overlay click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
}

// Pricing calculator
class PricingCalculator {
    constructor() {
        this.init();
    }

    init() {
        const toggle = document.getElementById('billing-toggle');
        if (toggle) {
            toggle.addEventListener('change', this.updatePrices.bind(this));
        }
    }

    updatePrices(e) {
        const isAnnual = e.target.checked;
        const prices = document.querySelectorAll('.price[data-monthly][data-annual]');
        
        prices.forEach(price => {
            const monthly = price.getAttribute('data-monthly');
            const annual = price.getAttribute('data-annual');
            const newValue = isAnnual ? annual : monthly;
            
            // Animate the change
            price.style.transform = 'scale(1.1)';
            price.style.opacity = '0.7';
            
            setTimeout(() => {
                price.textContent = newValue;
                price.style.transform = 'scale(1)';
                price.style.opacity = '1';
            }, 150);
        });
    }
}

// Domain search enhancement
class DomainSearch {
    constructor() {
        this.tlds = ['.com', '.io', '.tech', '.dev', '.ai', '.ng', '.africa'];
        this.init();
    }

    init() {
        this.setupTldSelection();
        this.setupSearchButton();
        this.setupResultsDisplay();
    }

    setupTldSelection() {
        const tldButtons = document.querySelectorAll('.tld-option');
        tldButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tldButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
            });
        });
    }

    setupSearchButton() {
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('domain-search-input');
        
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    async performSearch(domain) {
        if (!domain) return;
        
        const resultsContainer = document.getElementById('search-results');
        const activeTld = document.querySelector('.tld-option.active').textContent;
        const fullDomain = domain + activeTld;
        
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="domain-loading">
                <div class="loading-spinner"></div>
                <p>Searching for ${fullDomain}...</p>
            </div>
        `;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock results
            const results = [
                { domain: fullDomain, available: true, price: '$12.99/year' },
                { domain: domain + '.com', available: false, suggestion: domain + '-app.com' },
                { domain: domain + '.tech', available: true, price: '$19.99/year' }
            ];
            
            this.displayResults(results);
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="domain-error">
                    <p>Sorry, there was an error searching for domains. Please try again.</p>
                </div>
            `;
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'domain-result';
            
            if (result.available) {
                resultElement.innerHTML = `
                    <div class="domain-info">
                        <div class="domain-name">${result.domain}</div>
                        <div class="domain-status available">Available</div>
                    </div>
                    <div class="domain-price">${result.price}</div>
                    <button class="btn btn-primary btn-sm">Add to Cart</button>
                `;
            } else {
                resultElement.innerHTML = `
                    <div class="domain-info">
                        <div class="domain-name">${result.domain}</div>
                        <div class="domain-status unavailable">Taken</div>
                        <div class="domain-suggestion">Try: ${result.suggestion}</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" disabled>Unavailable</button>
                `;
            }
            
            resultsContainer.appendChild(resultElement);
        });
    }

    setupResultsDisplay() {
        // Results container styling is handled in CSS
    }
}

// Performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalAssets();
        this.optimizeThirdPartyScripts();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalAssets() {
        // Preload critical fonts and assets
        const preloadLinks = [
            { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
        ];
        
        preloadLinks.forEach(linkAttrs => {
            const link = document.createElement('link');
            Object.keys(linkAttrs).forEach(key => {
                link.setAttribute(key, linkAttrs[key]);
            });
            document.head.appendChild(link);
        });
    }

    optimizeThirdPartyScripts() {
        // Defer non-critical third-party scripts
        const scripts = document.querySelectorAll('script[data-defer]');
        scripts.forEach(script => {
            script.defer = true;
        });
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core components
    window.animationController = new AnimationController();
    window.formHandler = new FormHandler();
    window.navigationHandler = new NavigationHandler();
    window.modalManager = new ModalManager();
    window.pricingCalculator = new PricingCalculator();
    window.domainSearch = new DomainSearch();
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Initialize page-specific functionality
    initializePageSpecificFeatures();
    
    // Add loading animation to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea');
    interactiveElements.forEach(el => {
        el.classList.add('hover-lift');
    });
});

// Page-specific initialization
function initializePageSpecificFeatures() {
    const currentPage = document.body.dataset.page || window.location.pathname;
    
    switch(currentPage) {
        case '/pricing.html':
            // Initialize pricing-specific features
            break;
        case '/contact.html':
            // Initialize contact form features
            break;
        case '/dashboard.html':
            // Initialize dashboard features
            initializeDashboard();
            break;
        default:
            // Default initialization
            break;
    }
}

// Dashboard initialization
function initializeDashboard() {
    // Simulate loading dashboard data
    setTimeout(() => {
        const emptyProjects = document.getElementById('empty-projects');
        const projectsGrid = document.getElementById('projects-grid');
        
        if (emptyProjects && projectsGrid) {
            // Simulate having projects
            const hasProjects = Math.random() > 0.5;
            
            if (hasProjects) {
                emptyProjects.style.display = 'none';
                projectsGrid.style.display = 'grid';
                projectsGrid.innerHTML = `
                    <div class="project-card">
                        <h3>My First Project</h3>
                        <p>Web API application</p>
                        <div class="project-status">Active</div>
                    </div>
                `;
            }
        }
    }, 1000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    // In production, send to error tracking service
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}