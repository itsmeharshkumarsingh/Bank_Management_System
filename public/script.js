let user = null;
let allUsers = [];

// 1. View Switching Logic
function switchTab(viewId, element) {
    // Hide all panels
    const panels = ['overview', 'cards', 'subscriptions', 'transactions', 'loans', 'support'];
    panels.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    // Show target panel
    document.getElementById(viewId).classList.remove('hidden');

    // Update active state on sidebar links
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');
}

// 2. Login Logic
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                accountNo: document.getElementById('accountNo').value, 
                pin: document.getElementById('pin').value 
            })
        });
        const data = await res.json();
        
        if (data.success) {
            user = data.user;
            
            // Switch UI
            document.getElementById('loginView').classList.add('hidden');
            document.getElementById('dashboardView').classList.remove('hidden');
            
            // Populate Data
            const bal = `$${parseFloat(user.balance).toLocaleString()}`;
            document.getElementById('mainBalance').innerText = bal;
            document.getElementById('statBalance').innerText = bal;
            document.getElementById('cardName').innerText = user.name;
            document.getElementById('navAvatar').innerText = user.name.charAt(0);
            
            // Setup dashboard
            initCharts();
            fetchCustomers();
        } else {
            alert(data.message);
        }
    } catch (err) { 
        alert('Cannot connect to database. Ensure server is running and MySQL is connected.'); 
    }
});

// 3. Transactions Load
async function loadTransactions(element) {
    switchTab('transactions', element);
    try {
        // We dynamically append the logged-in user's ID to the request
        const res = await fetch(`/api/transactions/${user.id}`);
        const data = await res.json();
        
        document.querySelector('#txTable tbody').innerHTML = data.transactions.map(t => `
            <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString()}</td>
                <td>${t.sender_name}</td>
                <td>${t.receiver_name}</td>
                <td style="color:#7c3aed; font-weight:bold;">$${t.amount}</td>
            </tr>`).join('');
    } catch (err) {
        console.error("Failed to load transactions");
    }
}

// 4. Modal & Transfers
async function fetchCustomers() {
    const res = await fetch('/api/customers');
    const data = await res.json();
    allUsers = data.customers;
}

function openTransferModal() {
    const select = document.getElementById('receiverId');
    select.innerHTML = '<option disabled selected>Select Recipient</option>' + 
        allUsers.filter(u => u.id !== user.id).map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    
    document.getElementById('transferModal').classList.remove('hidden');
}

function closeModal() { 
    document.getElementById('transferModal').classList.add('hidden'); 
}

document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        senderId: user.id, 
        receiverId: document.getElementById('receiverId').value, 
        amount: document.getElementById('amount').value 
    };
    
    const res = await fetch('/api/transfer', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
    });
    const data = await res.json();
    alert(data.message);
    if(data.success) location.reload();
});

// 5. Initialize Charts (Chart.js)
function initCharts() {
    new Chart(document.getElementById('donutChart'), { 
        type: 'doughnut', 
        data: { 
            labels: ['Remaining', 'Utilized'], 
            datasets: [{ data: [75, 25], backgroundColor: ['#e2e8f0', '#7c3aed'], borderWidth: 0 }] 
        },
        options: { cutout: '80%', plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [
                { label: 'Spending', data: [8000, 7000, 16000, 11000, 9000, 8000, 15000, 14000, 15000, 12000], backgroundColor: '#ede9fe', borderRadius: 5 },
                { label: 'Income', data: [11000, 10000, 18000, 12000, 10000, 11000, 19000, 18000, 19000, 16000], backgroundColor: '#7c3aed', borderRadius: 5 }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }, 
            plugins: { legend: { display: false } } 
        }
    });
}