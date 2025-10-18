// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('themeToggle');
const settingsThemeToggle = document.getElementById('settingsThemeToggle');
const loginBtn = document.getElementById('loginBtn');
const userGreeting = document.getElementById('userGreeting');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const pages = document.querySelectorAll('.page');
const timeBtns = document.querySelectorAll('.time-btn');
const calculatorTabs = document.querySelectorAll('.calculator-tab');
const calculators = document.querySelectorAll('.calculator');
const connectBankBtn = document.getElementById('connectBankBtn');
const connectBankModal = document.getElementById('connectBankModal');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const connectBtn = document.getElementById('connectBtn');
const banksGrid = document.getElementById('banksGrid');
const financialData = document.getElementById('financialData');
const totalBalance = document.getElementById('totalBalance');
const monthlyIncome = document.getElementById('monthlyIncome');
const monthlyExpenses = document.getElementById('monthlyExpenses');
const savingsRate = document.getElementById('savingsRate');
const transactionsList = document.getElementById('transactionsList');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const switchTabs = document.querySelectorAll('.switch-tab');
const loginSubmit = document.getElementById('loginSubmit');
const signupSubmit = document.getElementById('signupSubmit');

// Calculator Elements
const calculateBudget = document.getElementById('calculateBudget');
const resetBudget = document.getElementById('resetBudget');
const budgetResult = document.getElementById('budgetResult');
const budgetSuggestions = document.getElementById('budgetSuggestions');
const calculateSIP = document.getElementById('calculateSIP');
const resetSIP = document.getElementById('resetSIP');
const sipResult = document.getElementById('sipResult');
const sipTotal = document.getElementById('sipTotal');
const calculateLoan = document.getElementById('calculateLoan');
const resetLoan = document.getElementById('resetLoan');
const loanResult = document.getElementById('loanResult');
const monthlyPayment = document.getElementById('monthlyPayment');
const totalInterest = document.getElementById('totalInterest');

// Chart Variables
let incomeExpenseChart, budgetChart, sipChart, loanChart;

// App State
let currentUser = null;
let isLoggedIn = false;
let connectedBanks = [];
let transactions = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeCharts();
});

function initializeApp() {
    // Check if user is logged in (in a real app, this would check localStorage or a session)
    const savedUser = localStorage.getItem('afinityUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateUIForLoggedInUser();
    }
    
    // Load connected banks from localStorage
    const savedBanks = localStorage.getItem('afinityBanks');
    if (savedBanks) {
        connectedBanks = JSON.parse(savedBanks);
        updateBanksGrid();
    }
    
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('afinityTransactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        updateTransactionsList();
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    settingsThemeToggle.addEventListener('click', toggleTheme);
    
    // Login button
    loginBtn.addEventListener('click', showAuthPage);
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
            
            // Close mobile menu after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Time filter buttons
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateIncomeExpenseChart(this.textContent);
        });
    });
    
    // Calculator tabs
    calculatorTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const calcType = this.getAttribute('data-calc');
            showCalculator(calcType);
        });
    });
    
    // Budget calculator
    calculateBudget.addEventListener('click', calculateBudgetPlan);
    resetBudget.addEventListener('click', resetBudgetCalculator);
    
    // SIP calculator
    calculateSIP.addEventListener('click', calculateSIPProjection);
    resetSIP.addEventListener('click', resetSIPCalculator);
    
    // Loan calculator
    calculateLoan.addEventListener('click', calculateLoanDetails);
    resetLoan.addEventListener('click', resetLoanCalculator);
    
    // Account aggregator
    connectBankBtn.addEventListener('click', showConnectBankModal);
    modalClose.addEventListener('click', hideConnectBankModal);
    cancelBtn.addEventListener('click', hideConnectBankModal);
    connectBtn.addEventListener('click', connectBankAccount);
    
    // Authentication
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    switchTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    loginSubmit.addEventListener('click', handleLogin);
    signupSubmit.addEventListener('click', handleSignup);
    
    // Settings actions
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleSettingsAction(action);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === connectBankModal) {
            hideConnectBankModal();
        }
    });
}

function toggleMobileMenu() {
    sidebar.classList.toggle('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const settingsThemeIcon = settingsThemeToggle.querySelector('i');
    const settingsThemeText = settingsThemeToggle.querySelector('span');
    
    if (isDark) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
        settingsThemeIcon.className = 'fas fa-sun';
        settingsThemeText.textContent = 'Light Mode';
        localStorage.setItem('afinityTheme', 'dark');
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
        settingsThemeIcon.className = 'fas fa-moon';
        settingsThemeText.textContent = 'Dark Mode';
        localStorage.setItem('afinityTheme', 'light');
    }
    
    // Update charts if they exist
    if (incomeExpenseChart) incomeExpenseChart.update();
    if (budgetChart) budgetChart.update();
    if (sipChart) sipChart.update();
    if (loanChart) loanChart.update();
}

function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active sidebar link
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

function showAuthPage() {
    if (isLoggedIn) {
        // Logout functionality
        currentUser = null;
        isLoggedIn = false;
        localStorage.removeItem('afinityUser');
        updateUIForLoggedInUser();
        showPage('dashboard');
    } else {
        showPage('auth');
        switchAuthTab('login');
    }
}

function switchAuthTab(tabName) {
    // Update active tab
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding form
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${tabName}Form`) {
            form.classList.add('active');
        }
    });
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful login
    currentUser = {
        username: username,
        fullName: 'John Doe',
        email: 'john.doe@example.com'
    };
    
    isLoggedIn = true;
    localStorage.setItem('afinityUser', JSON.stringify(currentUser));
    
    updateUIForLoggedInUser();
    showPage('dashboard');
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function handleSignup() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!fullname || !email || !newUsername || !newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful signup
    currentUser = {
        username: newUsername,
        fullName: fullname,
        email: email
    };
    
    isLoggedIn = true;
    localStorage.setItem('afinityUser', JSON.stringify(currentUser));
    
    updateUIForLoggedInUser();
    showPage('dashboard');
    
    // Clear form
    document.getElementById('fullname').value = '';
    document.getElementById('email').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function updateUIForLoggedInUser() {
    if (isLoggedIn && currentUser) {
        userGreeting.textContent = `Welcome, ${currentUser.fullName || currentUser.username}!`;
        loginBtn.textContent = 'Logout';
        
        // Update user info in sidebar
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-details h3');
        
        if (userAvatar && userName) {
            userAvatar.textContent = getInitials(currentUser.fullName || currentUser.username);
            userName.textContent = currentUser.fullName || currentUser.username;
        }
    } else {
        userGreeting.textContent = 'Welcome, User!';
        loginBtn.textContent = 'Login';
        
        // Reset user info in sidebar
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-details h3');
        
        if (userAvatar && userName) {
            userAvatar.textContent = 'JD';
            userName.textContent = 'John Doe';
        }
    }
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function initializeCharts() {
    // Income vs Expense Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Income',
                    data: [62000, 64000, 61000, 65000, 63000, 64200],
                    backgroundColor: '#4CAF50',
                    borderRadius: 5
                },
                {
                    label: 'Expenses',
                    data: [41000, 42000, 40000, 43000, 41500, 41800],
                    backgroundColor: '#F44336',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Income vs Expenses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Initialize other charts with empty data (they'll be populated when calculators are used)
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    budgetChart = new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    const sipCtx = document.getElementById('sipChart').getContext('2d');
    sipChart = new Chart(sipCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Investment Growth',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    const loanCtx = document.getElementById('loanChart').getContext('2d');
    loanChart = new Chart(loanCtx, {
        type: 'pie',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#2196F3', '#FF9800']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateIncomeExpenseChart(timeRange) {
    // In a real app, this would fetch new data based on the time range
    // For demo purposes, we'll just update the chart title
    let title = 'Monthly Income vs Expenses';
    
    if (timeRange === '1Y') {
        title = 'Yearly Income vs Expenses';
    } else if (timeRange === 'Custom') {
        title = 'Custom Period Income vs Expenses';
    }
    
    incomeExpenseChart.options.plugins.title.text = title;
    incomeExpenseChart.update();
}

function showCalculator(calcType) {
    // Update active tab
    calculatorTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-calc') === calcType) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding calculator
    calculators.forEach(calc => {
        calc.style.display = 'none';
        if (calc.id === `${calcType}Calculator`) {
            calc.style.display = 'block';
        }
    });
}

function calculateBudgetPlan() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const groceries = parseFloat(document.getElementById('groceries').value) || 0;
    const entertainment = parseFloat(document.getElementById('entertainment').value) || 0;
    
    if (salary === 0) {
        alert('Please enter your monthly salary');
        return;
    }
    
    const totalExpenses = rent + utilities + groceries + entertainment;
    const savings = salary - totalExpenses;
    const savingsRate = (savings / salary) * 100;
    
    // Update chart
    budgetChart.data.labels = ['Rent', 'Utilities', 'Groceries', 'Entertainment', 'Savings'];
    budgetChart.data.datasets[0].data = [rent, utilities, groceries, entertainment, savings];
    budgetChart.update();
    
    // Generate suggestions
    let suggestions = '';
    
    if (savingsRate < 20) {
        suggestions = '<p class="suggestion warning">Your savings rate is low. Consider reducing discretionary spending.</p>';
    } else if (savingsRate >= 20 && savingsRate < 30) {
        suggestions = '<p class="suggestion good">Good savings rate! You\'re on track for financial health.</p>';
    } else {
        suggestions = '<p class="suggestion excellent">Excellent savings rate! Keep up the good work.</p>';
    }
    
    if (rent / salary > 0.3) {
        suggestions += '<p class="suggestion warning">Your housing costs are high. Consider finding more affordable options.</p>';
    }
    
    if (entertainment / salary > 0.15) {
        suggestions += '<p class="suggestion warning">You\'re spending a lot on entertainment. Look for free or low-cost alternatives.</p>';
    }
    
    budgetSuggestions.innerHTML = suggestions;
    budgetResult.style.display = 'block';
}

function resetBudgetCalculator() {
    document.getElementById('salary').value = '';
    document.getElementById('rent').value = '';
    document.getElementById('utilities').value = '';
    document.getElementById('groceries').value = '';
    document.getElementById('entertainment').value = '';
    budgetResult.style.display = 'none';
}

function calculateSIPProjection() {
    const amount = parseFloat(document.getElementById('sipAmount').value) || 0;
    const duration = parseFloat(document.getElementById('sipDuration').value) || 0;
    const returnRate = parseFloat(document.getElementById('sipReturn').value) || 0;
    
    if (amount === 0 || duration === 0 || returnRate === 0) {
        alert('Please fill in all fields');
        return;
    }
    
    const monthlyRate = returnRate / 12 / 100;
    const months = duration * 12;
    
    // Calculate future value of SIP
    const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvestment = amount * months;
    const totalGains = futureValue - totalInvestment;
    
    sipTotal.textContent = `Total Value: ₹${futureValue.toFixed(2).toLocaleString()} | Total Investment: ₹${totalInvestment.toLocaleString()} | Total Gains: ₹${totalGains.toFixed(2).toLocaleString()}`;
    
    // Generate chart data
    const labels = [];
    const data = [];
    
    for (let year = 1; year <= duration; year++) {
        labels.push(`Year ${year}`);
        const yearMonths = year * 12;
        const yearValue = amount * ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        data.push(yearValue);
    }
    
    sipChart.data.labels = labels;
    sipChart.data.datasets[0].data = data;
    sipChart.update();
    
    sipResult.style.display = 'block';
}

function resetSIPCalculator() {
    document.getElementById('sipAmount').value = '';
    document.getElementById('sipDuration').value = '';
    document.getElementById('sipReturn').value = '';
    sipResult.style.display = 'none';
}

function calculateLoanDetails() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('loanInterest').value) || 0;
    const term = parseFloat(document.getElementById('loanTerm').value) || 0;
    
    if (amount === 0 || interestRate === 0 || term === 0) {
        alert('Please fill in all fields');
        return;
    }
    
    const monthlyRate = interestRate / 12 / 100;
    const months = term * 12;
    
    // Calculate monthly payment
    const monthlyPaymentAmount = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPaymentAmount * months;
    const totalInterestAmount = totalPayment - amount;
    
    monthlyPayment.textContent = `Monthly Payment: ₹${monthlyPaymentAmount.toFixed(2).toLocaleString()}`;
    totalInterest.textContent = `Total Interest: ₹${totalInterestAmount.toFixed(2).toLocaleString()}`;
    
    // Update chart
    loanChart.data.datasets[0].data = [amount, totalInterestAmount];
    loanChart.update();
    
    loanResult.style.display = 'block';
}

function resetLoanCalculator() {
    document.getElementById('loanAmount').value = '';
    document.getElementById('loanInterest').value = '';
    document.getElementById('loanTerm').value = '';
    loanResult.style.display = 'none';
}

function showConnectBankModal() {
    if (!isLoggedIn) {
        alert('Please login to connect your bank accounts');
        showAuthPage();
        return;
    }
    
    connectBankModal.style.display = 'flex';
}

function hideConnectBankModal() {
    connectBankModal.style.display = 'none';
    // Reset form
    document.getElementById('bankSelect').value = '';
    document.getElementById('accountNumber').value = '';
    document.getElementById('ifscCode').value = '';
    document.getElementById('consent').checked = false;
}

function connectBankAccount() {
    const bankSelect = document.getElementById('bankSelect').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const ifscCode = document.getElementById('ifscCode').value;
    const consent = document.getElementById('consent').checked;
    
    if (!bankSelect || !accountNumber || !ifscCode) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!consent) {
        alert('Please consent to data sharing to connect your bank account');
        return;
    }
    
    // In a real app, this would be an API call to connect to the bank
    // For demo purposes, we'll simulate a successful connection
    
    const bankInfo = {
        id: Date.now(),
        name: getBankName(bankSelect),
        code: bankSelect,
        accountNumber: accountNumber.slice(-4), // Store only last 4 digits for display
        connectedDate: new Date().toLocaleDateString(),
        balance: Math.floor(Math.random() * 500000) + 10000 // Random balance for demo
    };
    
    connectedBanks.push(bankInfo);
    localStorage.setItem('afinityBanks', JSON.stringify(connectedBanks));
    
    // Generate sample transactions for the new account
    generateSampleTransactions(bankInfo.id);
    
    updateBanksGrid();
    hideConnectBankModal();
    
    alert(`Successfully connected your ${bankInfo.name} account!`);
}

function getBankName(code) {
    const banks = {
        'hdfc': 'HDFC Bank',
        'icici': 'ICICI Bank',
        'sbi': 'State Bank of India',
        'axis': 'Axis Bank',
        'kotak': 'Kotak Mahindra Bank'
    };
    
    return banks[code] || 'Unknown Bank';
}

function updateBanksGrid() {
    if (connectedBanks.length === 0) {
        banksGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-university"></i>
                <h3>No Banks Connected</h3>
                <p>Connect your bank accounts to view your financial data in one place.</p>
            </div>
        `;
        financialData.style.display = 'none';
        return;
    }
    
    banksGrid.innerHTML = '';
    
    connectedBanks.forEach(bank => {
        const bankCard = document.createElement('div');
        bankCard.className = 'bank-card';
        bankCard.innerHTML = `
            <div class="bank-logo">${bank.name.charAt(0)}</div>
            <div class="bank-info">
                <h4>${bank.name}</h4>
                <p>Account ending with ${bank.accountNumber}</p>
                <span class="bank-connected">Connected on ${bank.connectedDate}</span>
            </div>
            <div class="bank-balance">₹${bank.balance.toLocaleString()}</div>
            <button class="bank-disconnect" data-id="${bank.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        banksGrid.appendChild(bankCard);
    });
    
    // Add event listeners to disconnect buttons
    document.querySelectorAll('.bank-disconnect').forEach(btn => {
        btn.addEventListener('click', function() {
            const bankId = parseInt(this.getAttribute('data-id'));
            disconnectBank(bankId);
        });
    });
    
    // Show financial data
    updateFinancialOverview();
    financialData.style.display = 'block';
}

function disconnectBank(bankId) {
    if (confirm('Are you sure you want to disconnect this bank account?')) {
        connectedBanks = connectedBanks.filter(bank => bank.id !== bankId);
        localStorage.setItem('afinityBanks', JSON.stringify(connectedBanks));
        
        // Remove transactions for this bank
        transactions = transactions.filter(t => t.bankId !== bankId);
        localStorage.setItem('afinityTransactions', JSON.stringify(transactions));
        
        updateBanksGrid();
        updateTransactionsList();
    }
}

function generateSampleTransactions(bankId) {
    const sampleTransactions = [
        { type: 'credit', description: 'Salary Credit', amount: 64200, date: '2023-10-01', category: 'Income' },
        { type: 'debit', description: 'Rent Payment', amount: 15000, date: '2023-10-02', category: 'Housing' },
        { type: 'debit', description: 'Grocery Shopping', amount: 4500, date: '2023-10-05', category: 'Food' },
        { type: 'debit', description: 'Electricity Bill', amount: 2450, date: '2023-10-07', category: 'Utilities' },
        { type: 'debit', description: 'Dining Out', amount: 1200, date: '2023-10-10', category: 'Entertainment' },
        { type: 'debit', description: 'Fuel', amount: 2000, date: '2023-10-12', category: 'Transportation' },
        { type: 'credit', description: 'Freelance Work', amount: 8000, date: '2023-10-15', category: 'Income' },
        { type: 'debit', description: 'Online Shopping', amount: 3500, date: '2023-10-18', category: 'Shopping' },
        { type: 'debit', description: 'Mobile Recharge', amount: 299, date: '2023-10-20', category: 'Utilities' },
        { type: 'debit', description: 'Movie Tickets', amount: 600, date: '2023-10-22', category: 'Entertainment' }
    ];
    
    sampleTransactions.forEach(transaction => {
        transactions.push({
            ...transaction,
            id: Date.now() + Math.random(),
            bankId: bankId
        });
    });
    
    localStorage.setItem('afinityTransactions', JSON.stringify(transactions));
    updateTransactionsList();
}

function updateFinancialOverview() {
    if (connectedBanks.length === 0) return;
    
    // Calculate total balance
    const balance = connectedBanks.reduce((sum, bank) => sum + bank.balance, 0);
    totalBalance.textContent = `₹${balance.toLocaleString()}`;
    
    // Calculate monthly income and expenses from transactions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthlyTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyIncome.textContent = `₹${income.toLocaleString()}`;
    monthlyExpenses.textContent = `₹${expenses.toLocaleString()}`;
    
    // Calculate savings rate
    const savingsRateValue = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
    savingsRate.textContent = `${savingsRateValue}%`;
}

function updateTransactionsList() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No Transactions</h3>
                <p>Your transactions will appear here once you connect bank accounts.</p>
            </div>
        `;
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionsList.innerHTML = '';
    
    sortedTransactions.slice(0, 10).forEach(transaction => { // Show only last 10 transactions
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        
        const amountClass = transaction.type === 'credit' ? 'amount credit' : 'amount debit';
        const amountSign = transaction.type === 'credit' ? '+' : '-';
        
        transactionEl.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${transaction.date} • ${transaction.category}</p>
            </div>
            <div class="${amountClass}">
                ${amountSign}₹${transaction.amount.toLocaleString()}
            </div>
        `;
        
        transactionsList.appendChild(transactionEl);
    });
}

function handleSettingsAction(action) {
    switch(action) {
        case 'edit-profile':
            alert('Edit Profile functionality would open here');
            break;
        case 'security':
            alert('Security settings would open here');
            break;
        case 'notifications':
            alert('Notification settings would open here');
            break;
        case 'export-data':
            alert('Data export functionality would run here');
            break;
        case 'clear-data':
            if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
                localStorage.clear();
                connectedBanks = [];
                transactions = [];
                currentUser = null;
                isLoggedIn = false;
                updateUIForLoggedInUser();
                updateBanksGrid();
                updateTransactionsList();
                showPage('dashboard');
                alert('All data has been cleared.');
            }
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('afinityTheme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const settingsThemeIcon = settingsThemeToggle.querySelector('i');
    const settingsThemeText = settingsThemeToggle.querySelector('span');
    
    themeIcon.className = 'fas fa-sun';
    themeText.textContent = 'Light Mode';
    settingsThemeIcon.className = 'fas fa-sun';
    settingsThemeText.textContent = 'Light Mode';
}