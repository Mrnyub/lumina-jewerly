/* =========================================
   LUMINA JEWELRY | STAFF PORTAL (FAIL-SAFE)
   ========================================= */
const CORRECT_PIN = "2026";
let targetTab = "inventory"; 

// 1. INITIALIZE ON LOAD
window.onload = function() {
    const overlay = document.getElementById("loginOverlay");
    if(overlay) overlay.style.display = "none";
    
    switchTab('orders'); 

    const pinInput = document.getElementById("adminPin");
    if(pinInput) {
        pinInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                window.checkPin();
            }
        });
    }

    const loginBtn = document.getElementById("loginBtn");
    if(loginBtn) {
        loginBtn.addEventListener("click", function(event) {
            event.preventDefault(); 
            window.checkPin();
        });
    }

    if(overlay) {
        overlay.addEventListener("click", function(e) {
            if(e.target === this) {
                this.style.display = "none";
            }
        });
    }

    loadInventory();
    loadOrders();
};

// 2. TAB SWITCHING LOGIC (Force Redraw)
window.switchTab = function(tabName) {
    if (tabName === 'inventory' && localStorage.getItem("luminaAdminAccess") !== "granted") {
        targetTab = tabName; 
        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("adminPin").focus(); 
        return; 
    }

    // Hide all views
    document.getElementById('view-inventory').style.display = 'none';
    document.getElementById('view-orders').style.display = 'none';
    document.getElementById('view-analytics').style.display = 'none';

    // Remove active highlights
    document.getElementById('nav-inventory').classList.remove('active');
    document.getElementById('nav-orders').classList.remove('active');
    document.getElementById('nav-analytics').classList.remove('active');

    // Show selected view
    document.getElementById('view-' + tabName).style.display = 'block';
    document.getElementById('nav-' + tabName).classList.add('active');

    // Update Header
    const titleMap = {
        'inventory': 'Vault Inventory Management',
        'orders': 'Client Order Fulfillment',
        'analytics': 'Boutique Performance Analytics'
    };
    document.getElementById('dashboardTitle').innerText = titleMap[tabName];

    // FAIL-SAFE: Force tables to redraw when tab is clicked
    if(tabName === 'inventory') window.loadInventory();
    if(tabName === 'orders') window.loadOrders();
};

// 3. VERIFY THE PIN 
window.checkPin = function() {
    const pinInput = document.getElementById("adminPin");
    if (!pinInput) return; 
    
    const enteredPin = pinInput.value.trim();
    
    if (enteredPin === CORRECT_PIN) {
        alert("Authorization Successful. Vault Unlocked.");
        localStorage.setItem("luminaAdminAccess", "granted");
        document.getElementById("loginOverlay").style.display = "none";
        
        const errorMsg = document.getElementById("loginError");
        if(errorMsg) errorMsg.style.display = "none";
        
        pinInput.value = ""; 
        switchTab(targetTab); 
    } else {
        const errorMsg = document.getElementById("loginError");
        if (errorMsg) errorMsg.style.display = "block";
        pinInput.value = ""; 
        pinInput.focus();
    }
};

// 4. LOGOUT FUNCTION
window.logout = function() {
    localStorage.removeItem("luminaAdminAccess");
    alert("Vault Locked. PIN required for inventory access.");
    switchTab('orders'); 
};

// 5. INVENTORY SYSTEM LOGIC
let inventoryData = [
    { id: "LUM-RNG-01", name: "Rose Gold Eternity Ring", price: 24500, stock: 5 },
    { id: "LUM-PND-01", name: "Sapphire Drop Pendant", price: 18990, stock: 2 },
    { id: "LUM-BRC-01", name: "Diamond Tennis Bracelet", price: 45000, stock: 0 }
];

// FAIL-SAFE: Crash protection for local memory
try {
    if (localStorage.getItem("luminaInventoryData")) {
        inventoryData = JSON.parse(localStorage.getItem("luminaInventoryData"));
    }
} catch (e) {
    console.error("Memory corrupted. Restoring default vault inventory.");
    localStorage.removeItem("luminaInventoryData");
}

window.loadInventory = function() {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return; 

    tableBody.innerHTML = ""; 
    let lowStockCount = 0;
    let totalVaultValue = 0;

    inventoryData.forEach((item, index) => {
        // Fallback safety checks
        let safePrice = item.price || 0;
        let safeStock = item.stock || 0;

        let badgeHTML = '';
        if (safeStock > 3) {
            badgeHTML = '<span class="status-badge in-stock">In Vault</span>';
        } else if (safeStock > 0) {
            badgeHTML = '<span class="status-badge low-stock">Low Stock</span>';
            lowStockCount++;
        } else {
            badgeHTML = '<span class="status-badge out-stock">Sold Out</span>';
            lowStockCount++;
        }

        totalVaultValue += (safePrice * safeStock);
        let formattedPrice = "₱" + safePrice.toLocaleString();

        const row = `
            <tr>
                <td style="color: #D4AF37;">${item.id}</td>
                <td>${item.name}</td>
                <td>${formattedPrice}</td>
                <td>${safeStock}</td>
                <td>${badgeHTML}</td>
                <td>
                    <button class="action-btn" onclick="editProduct(${index})" style="color: #4CAF50; margin-right: 15px;" title="Edit Stock/Price"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn" onclick="deleteProduct(${index})" style="color: #F44336;" title="Delete Item"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("totalProductsStat").innerText = inventoryData.length;
    document.getElementById("lowStockStat").innerText = lowStockCount;
    document.getElementById("valueStat").innerText = "₱" + totalVaultValue.toLocaleString();
};

window.addNewProduct = function() {
    const name = prompt("Enter Jewelry Piece Name:");
    if (!name) return; 
    
    let price = parseInt(prompt("Enter Price as a number (e.g., 15000):"));
    if (isNaN(price)) price = 0;
    
    let stock = parseInt(prompt("Enter Starting Stock Quantity:"));
    if (isNaN(stock)) stock = 0; 

    const randomNum = Math.floor(Math.random() * 90) + 10;
    const id = "LUM-NEW-" + randomNum; 

    inventoryData.push({ id: id, name: name, price: price, stock: stock });
    localStorage.setItem("luminaInventoryData", JSON.stringify(inventoryData));
    window.loadInventory();
};

window.editProduct = function(index) {
    let item = inventoryData[index];
    
    let newStock = prompt(`Update Stock Quantity for ${item.name}:`, item.stock);
    if (newStock !== null && !isNaN(parseInt(newStock))) {
        item.stock = parseInt(newStock);
    }
    
    let newPrice = prompt(`Update Price for ${item.name} (Current: ₱${item.price}):`, item.price);
    if (newPrice !== null && !isNaN(parseInt(newPrice))) {
        item.price = parseInt(newPrice);
    }

    localStorage.setItem("luminaInventoryData", JSON.stringify(inventoryData));
    window.loadInventory();
};

window.deleteProduct = function(index) {
    if (confirm("Are you sure you want to remove this piece from the vault?")) {
        inventoryData.splice(index, 1); 
        localStorage.setItem("luminaInventoryData", JSON.stringify(inventoryData));
        window.loadInventory();
    }
};

// 6. ORDER MANAGEMENT LOGIC
let ordersData = [
    { orderId: "LUM-987654", customer: "Isabella T.", date: "Today, 10:42 AM", total: "₱24,500", status: "Pending" },
    { orderId: "LUM-987653", customer: "Michael C.", date: "Yesterday", total: "₱45,000", status: "Pending" },
    { orderId: "LUM-987650", customer: "Chloe R.", date: "Mar 25, 2026", total: "₱18,990", status: "Shipped" }
];

window.loadOrders = function() {
    const tableBody = document.getElementById("ordersTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    let pendingCount = 0;

    ordersData.forEach((order, index) => {
        let badgeClass = order.status === 'Pending' ? 'low-stock' : 'in-stock';
        let actionBtn = order.status === 'Pending' 
            ? `<button class="btn primary-btn" onclick="shipOrder(${index})" style="padding: 5px 10px; font-size: 12px; background-color:#D4AF37; color:#121212; border:none; cursor:pointer; border-radius:3px;">Dispatch Courier</button>` 
            : `<span style="color: #888; font-size: 12px;">Delivered</span>`;

        if(order.status === "Pending") pendingCount++;

        const row = `
            <tr>
                <td style="color: #D4AF37; font-weight: bold;">${order.orderId}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${order.total}</td>
                <td><span class="status-badge ${badgeClass}">${order.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("pendingOrdersStat").innerText = pendingCount;
};

window.shipOrder = function(index) {
    ordersData[index].status = "Shipped";
    window.loadOrders();
    alert(`Order ${ordersData[index].orderId} has been securely dispatched. The client will be notified.`);
};