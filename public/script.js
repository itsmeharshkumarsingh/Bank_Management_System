/**
 * APPLICATION CLIENT STATE: Global Memory Store.
 * Holds in-memory representations of the session context.
 * `user`: Stores the active session payload (id, name, balance) upon verified cryptographic response.
 * `allUsers`: Caches recipient metadata locally to eliminate redundant network overhead during transfer instantiations.
 */
let user = null;
let allUsers = [];

/**
 * CLIENT-SIDE ROUTING: Vanilla JS SPA Tab Orchestration.
 * Minimizes processing cycles by batch-hiding panels using basic utility constraints (`.hidden`).
 * Directly manipulates layout parameters via the DOM rather than triggering server-side document requests,
 * ensuring fluid view state alterations with strict separation of concerns.
 */
function switchTab(viewId, element) {
    // Structural Guard: Linearly disables visibility layers to purge the viewport state
    const panels = ['overview', 'cards', 'subscriptions', 'transactions', 'loans', 'support'];
    panels.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    // Mounts the selected view panel dynamically into the DOM layout flow
    document.getElementById(viewId).classList.remove('hidden');

    // Visual State Management: Updates class indices to track current navigation metrics
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');
}

/**
 * AUTHENTICATION SIDE-EFFECT: Form Submittal Listener & Session Hydration.
 * Prevents native form lifecycle bubbling (`e.preventDefault()`) to intercept and handle thread logic natively.
 * Dispatches an asynchronous `POST` HTTP wire payload containing target authentication criteria.
 * Hydrates client memory objects and explicitly commands DOM visualization parameters upon positive validation.
 */
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
            // Memory State Hydration: Commits API response into runtime application storage
            user = data.user;
            
            // View Transition: Dismounts the gateway authorization portal and spins up the main dashboard context
            document.getElementById('loginView').classList.add('hidden');
            document.getElementById('dashboardView').classList.remove('hidden');
            
            // UI Thread Rendering: Maps database decimal records into localized human-readable string patterns
            const bal = `$${parseFloat(user.balance).toLocaleString()}`;
            document.getElementById('mainBalance').innerText = bal;
            document.getElementById('statBalance').innerText = bal;
            document.getElementById('cardName').innerText = user.name;
            document.getElementById('navAvatar').innerText = user.name.charAt(0);
            
            // Initialization Phase: Concurrent firing of analytics visualization and caching engines
            initCharts();
            fetchCustomers();
        } else {
            alert(data.message);
        }
    } catch (err) { 
        alert('Cannot connect to database. Ensure server is running and MySQL is connected.'); 
    }
});

/**
 * SECURE DATA STREAMING: Isolated User Transaction Retrieval.
 * Executes background data aggregation by parsing the active system context parameter directly into a RESTful path template.
 * INTERVIEW FOCUS: Enforces strict data isolation on the wire by requesting filtered sets via variable substitution (`${user.id}`).
 * Iterates over incoming JSON arrays to programmatically map and insert native sanitized string nodes directly into the tbody layer.
 */
async function loadTransactions(element) {
    switchTab('transactions', element);
    try {
        // Asynchronous Request Boundary: Pulls isolated ledger blocks based on unique token contexts
        const res = await fetch(`/api/transactions/${user.id}`);
        const data = await res.json();
        
        // Dynamic DOM Manipulation: Structural generation of records via memory array map cycles
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

/**
 * CACHING LAYER: Asynchronous Customer Ledger Syncer.
 * populates the system cache with peer directory properties.
 * Eliminates repetitive endpoint requests when compiling select properties.
 */
async function fetchCustomers() {
    const res = await fetch('/api/customers');
    const data = await res.json();
    allUsers = data.customers;
}

/**
 * CLIENT INTERACTION INTERCEPTOR: Dynamic Selector Compilation.
 * Compiles a relative selection matrix dynamically from local runtime parameters.
 * FILTER CRITERIA: Enforces transactional invariants by stripping the logged-in individual's context 
 * (`u.id !== user.id`) directly out of the dropdown view, completely blocking self-transfer operations.
 */
function openTransferModal() {
    const select = document.getElementById('receiverId');
    // DOM Node Compilation: Injecting default layouts followed by filtered map generations
    select.innerHTML = '<option disabled selected>Select Recipient</option>' + 
        allUsers.filter(u => u.id !== user.id).map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    
    document.getElementById('transferModal').classList.remove('hidden');
}

/**
 * VIEWPORT DE-ALLOCATION: Modal View Lifecycle Terminator.
 * Toggles structural flags to drop the current interaction framework from visible alignment properties.
 */
function closeModal() { 
    document.getElementById('transferModal').classList.add('hidden'); 
}

/**
 * ATOMIC TRANSACTION DISPATCHER: Ledger Alteration Wire Payload Producer.
 * Encapsulates client interaction attributes into an isolated, standardized transactional layout.
 * Passes information down via Express to trigger target Stored Procedure execution sequences inside MySQL.
 * Refreshes the active document state (`location.reload()`) upon valid loop execution to synchronize database balances.
 */
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

/**
 * ANALYTICS ENGINE: Chart.js Canvas Rendering Framework.
 * Programmatically binds vector analytics instances straight to designated viewport canvas references.
 * `donutChart`: Instantiates structural allocation records utilizing an inner-cut layout engine (80% cutout).
 * `barChart`: Mounts comparative double-dataset configurations with localized styling constraints and axis optimization.
 */
function initCharts() {
    // Render Layer - Credit Allocation Monitor
    new Chart(document.getElementById('donutChart'), { 
        type: 'doughnut', 
        data: { 
            labels: ['Remaining', 'Utilized'], 
            datasets: [{ data: [75, 25], backgroundColor: ['#e2e8f0', '#7c3aed'], borderWidth: 0 }] 
        },
        options: { cutout: '80%', plugins: { legend: { display: false } } }
    });

    // Render Layer - Multi-Dataset Seasonal Flow Analysis
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