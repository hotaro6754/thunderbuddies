// Global state
let currentUser = null;
let isLoggedIn = false;
let users = JSON.parse(localStorage.getItem('afinityUsers')) || [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupThemeToggle();
    setupMobileMenu();
    loadPage('dashboard');
}

// Navigation setup
function setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            // Update active sidebar link
            sidebarLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            // Load target page
            loadPage(targetPage);
            
            // Close mobile menu if open
            if (window.innerWidth <= 576) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
}

// Theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
            ? '<i class="fas fa-sun"></i><span>Light Mode</span>' 
            : '<i class="fas fa-moon"></i><span>Dark Mode</span>';
        
        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
}

// Mobile menu
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Page loading system
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        const html = await response.text();
        
        document.getElementById('page-content').innerHTML = html;
        
        // Load page-specific CSS
        loadCSS(`styles/${pageName}.css`);
        
        // Load page-specific JS
        const script = document.createElement('script');
        script.src = `scripts/${pageName}.js`;
        script.onload = () => {
            // Initialize page after script loads
            if (window[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`]) {
                window[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`]();
            }
        };
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('page-content').innerHTML = '<div class="error">Page not found</div>';
    }
}

// Dynamic CSS loading
function loadCSS(href) {
    // Remove existing page-specific CSS
    const existingCSS = document.querySelector('link[data-page-css]');
    if (existingCSS) {
        existingCSS.remove();
    }
    
    // Add new CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-page-css', 'true');
    document.head.appendChild(link);
}

// Authentication functions
function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        updateUIAfterLogin();
        return true;
    }
    return false;
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    updateUIAfterLogout();
}

function updateUIAfterLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const userGreeting = document.getElementById('userGreeting');
    
    if (loginBtn && userGreeting) {
        loginBtn.textContent = 'Logout';
        userGreeting.textContent = `Welcome, ${currentUser.fullname || currentUser.username}!`;
    }
}

function updateUIAfterLogout() {
    const loginBtn = document.getElementById('loginBtn');
    const userGreeting = document.getElementById('userGreeting');
    
    if (loginBtn && userGreeting) {
        loginBtn.textContent = 'Login';
        userGreeting.textContent = 'Welcome, User!';
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}