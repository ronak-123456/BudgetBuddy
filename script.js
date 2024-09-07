
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let darkModeEnabled = JSON.parse(localStorage.getItem('darkMode')) || false;


function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}


function toggleDarkMode() {
    darkModeEnabled = !darkModeEnabled;
    localStorage.setItem('darkMode', JSON.stringify(darkModeEnabled));
    applyDarkMode();
}

function applyDarkMode() {
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}


function updateDashboardSummary() {
    const totalBalance = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
}

function createExpenseChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    const expenseCategories = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(expenseCategories),
            datasets: [{
                data: Object.values(expenseCategories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function createIncomeExpenseChart() {
    const ctx = document.getElementById('income-expense-chart').getContext('2d');
    const monthlyData = {};

    transactions.forEach(t => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
        }
        monthlyData[month][t.type] += t.amount;
    });

    const labels = Object.keys(monthlyData);
    const incomeData = labels.map(month => monthlyData[month].income);
    const expenseData = labels.map(month => monthlyData[month].expense);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#36A2EB'
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#FF6384'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function addTransaction(e) {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const date = new Date().toISOString().split('T')[0];

    const newTransaction = { id: Date.now(), description, amount, type, date };
    transactions.push(newTransaction);
    saveTransactions();
    updateDashboardSummary();
    createExpenseChart();
    createIncomeExpenseChart();
    displayTransactions();
    e.target.reset();
}

function displayTransactions() {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';

    transactions.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>${t.type}</td>
            <td>
                <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    displayTransactions();
    updateDashboardSummary();
    createExpenseChart();
    createIncomeExpenseChart();
}

function addGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goal-name').value;
    const amount = parseFloat(document.getElementById('goal-amount').value);
    const date = document.getElementById('goal-date').value;

    const newGoal = { id: Date.now(), name, amount, date, progress: 0 };
    goals.push(newGoal);
    saveGoals();
    displayGoals();
    e.target.reset();
}

function displayGoals() {
    const container = document.getElementById('goals-container');
    container.innerHTML = '';

    goals.forEach(g => {
        const goalElement = document.createElement('div');
        goalElement.classList.add('goal-item');
        goalElement.innerHTML = `
            <h3>${g.name}</h3>
            <p>Target: ${formatCurrency(g.amount)} by ${g.date}</p>
            <p>Progress: ${formatCurrency(g.progress)} (${Math.round((g.progress / g.amount) * 100)}%)</p>
            <progress value="${g.progress}" max="${g.amount}"></progress>
            <button class="edit-btn" onclick="editGoal(${g.id})">Edit</button>
            <button class="delete-btn" onclick="deleteGoal(${g.id})">Delete</button>
        `;
        container.appendChild(goalElement);
    });
}

function editGoal(id) {
    const goal = goals.find(g => g.id === id);
    
}

function deleteGoal(id) {
    goals = goals.filter(g => g.id !== id);
    saveGoals();
    displayGoals();
}


document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'dashboard.html' || currentPage === '') {
        updateDashboardSummary();
        createExpenseChart();
        createIncomeExpenseChart();
        document.getElementById('transaction-form').addEventListener('submit', addTransaction);
        applyDarkMode();
    } else if (currentPage === 'transactions.html') {
        displayTransactions();
        applyDarkMode();
    } else if (currentPage === 'goals.html') {
        displayGoals();
        document.getElementById('goal-form').addEventListener('submit', addGoal);
        applyDarkMode();
    }

    document.getElementById('dark-mode-toggle').addEventListener('change', toggleDarkMode);
});
