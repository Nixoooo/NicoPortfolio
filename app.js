// Mock Data
const mockData = {
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', phone: '123-456-7890', address: '123 Main St, Anytown', isAdmin: false },
        { id: 2, name: 'Admin User', email: 'admin@example.com', password: 'admin123', phone: '987-654-3210', address: '456 Admin St, Admintown', isAdmin: true }
    ],
    products: [
        { id: 1, name: 'Box Container', price: 45.00, stock: 50, lowStockThreshold: 20, type: 'box' },
        { id: 2, name: 'Cylinder Container', price: 25.00, stock: 75, lowStockThreshold: 30, type: 'cylinder' }
    ],
    orders: [],
    inventoryHistory: [],
    salesData: [
        { month: 'Jan', sales: 5200 },
        { month: 'Feb', sales: 5800 },
        { month: 'Mar', sales: 6000 },
        { month: 'Apr', sales: 5500 },
        { month: 'May', sales: 6500 },
        { month: 'Jun', sales: 7000 },
        { month: 'Jul', sales: 7500 },
        { month: 'Aug', sales: 8000 },
        { month: 'Sep', sales: 8200 },
        { month: 'Oct', sales: 7800 },
        { month: 'Nov', sales: 8500 },
        { month: 'Dec', sales: 9000 }
    ],
    salesReports: [
        { period: 'Jan 2023', boxSold: 48, cylinderSold: 95, totalOrders: 72, revenue: 4635, growth: '+12%' },
        { period: 'Feb 2023', boxSold: 52, cylinderSold: 103, totalOrders: 81, revenue: 4955, growth: '+7%' },
        { period: 'Mar 2023', boxSold: 58, cylinderSold: 121, totalOrders: 92, revenue: 5655, growth: '+14%' },
        { period: 'Apr 2023', boxSold: 45, cylinderSold: 87, totalOrders: 65, revenue: 4230, growth: '-25%' },
        { period: 'May 2023', boxSold: 62, cylinderSold: 134, totalOrders: 97, revenue: 6130, growth: '+45%' },
        { period: 'Jun 2023', boxSold: 68, cylinderSold: 142, totalOrders: 105, revenue: 6610, growth: '+8%' }
    ]
};

// Current user data
let currentUser = null;
let cart = { items: [], subtotal: 0, total: 0 };
let selectedOrderId = null;
let charts = {};

// DOM elements mapping for quick access
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching for login/register
    document.getElementById('login-tab').addEventListener('click', function() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-tab').classList.add('text-water-blue', 'border-water-blue');
        document.getElementById('login-tab').classList.remove('text-gray-500');
        document.getElementById('register-tab').classList.remove('text-water-blue', 'border-water-blue');
        document.getElementById('register-tab').classList.add('text-gray-500');
    });

    document.getElementById('register-tab').addEventListener('click', function() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('register-tab').classList.add('text-water-blue', 'border-water-blue');
        document.getElementById('register-tab').classList.remove('text-gray-500');
        document.getElementById('login-tab').classList.remove('text-water-blue', 'border-water-blue');
        document.getElementById('login-tab').classList.add('text-gray-500');
    });

    // User dropdown toggling
    document.getElementById('user-dropdown-btn').addEventListener('click', function() {
        document.getElementById('user-dropdown').classList.toggle('hidden');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('user-dropdown');
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        
        if (!dropdown.contains(event.target) && !dropdownBtn.contains(event.target) && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    // Add demo orders
    generateDemoOrders();
    
    // Add demo inventory history
    generateDemoInventoryHistory();
});

// User Authentication Functions
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = mockData.users.find(u => u.email === email && u.password === password && !u.isAdmin);
    
    if (user) {
        currentUser = user;
        showNotification('success', 'Login Successful', 'Welcome back, ' + user.name + '!');
        
        // Update UI with user info
        document.getElementById('current-username').textContent = user.name;
        document.getElementById('dashboard-username').textContent = user.name;
        
        // Populate profile data
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-phone').value = user.phone;
        document.getElementById('profile-address').value = user.address;
        
        // Show authenticated nav and customer dashboard
        document.getElementById('authenticated-nav').classList.remove('hidden');
        document.getElementById('auth-section').classList.remove('active-section');
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('customer-dashboard').classList.add('active-section');
        
        // Update dashboard data
        updateCustomerDashboard();
    } else {
        showNotification('error', 'Login Failed', 'Invalid email or password.');
    }
}

function adminLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const admin = mockData.users.find(u => u.email === email && u.password === password && u.isAdmin);
    
    if (admin) {
        currentUser = admin;
        showNotification('success', 'Admin Login Successful', 'Welcome back, ' + admin.name + '!');
        
        // Show admin nav and dashboard
        document.getElementById('admin-nav').classList.remove('hidden');
        document.getElementById('auth-section').classList.remove('active-section');
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('active-section');
        
        // Initialize admin dashboard
        updateAdminDashboard();
        initializeCharts();
    } else {
        showNotification('error', 'Admin Login Failed', 'Invalid admin credentials.');
    }
}

function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const phone = document.getElementById('register-phone').value;
    const address = document.getElementById('register-address').value;
    
    // Simple validation
    if (!name || !email || !password || !phone || !address) {
        showNotification('error', 'Registration Failed', 'Please fill in all required fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('error', 'Registration Failed', 'Passwords do not match.');
        return;
    }
    
    // Check if email already exists
    if (mockData.users.some(u => u.email === email)) {
        showNotification('error', 'Registration Failed', 'Email is already registered.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: mockData.users.length + 1,
        name,
        email,
        password,
        phone,
        address,
        isAdmin: false
    };
    
    mockData.users.push(newUser);
    
    showNotification('success', 'Registration Successful', 'You can now log in with your credentials.');
    
    // Switch back to login tab
    document.getElementById('login-tab').click();
}

function logout() {
    currentUser = null;
    cart = { items: [], subtotal: 0, total: 0 };
    
    // Hide authenticated nav and show login page
    document.getElementById('authenticated-nav').classList.add('hidden');
    document.getElementById('admin-nav').classList.add('hidden');
    
    // Hide all sections except auth
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('hidden');
    });
    
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('auth-section').classList.add('active-section');
    
    // Reset login form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    showNotification('info', 'Logged Out', 'You have been logged out successfully.');
}

// Navigation Functions
function showPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show selected section
    document.getElementById(pageId).classList.add('active-section');
    
    // Additional logic for specific pages
    if (pageId === 'customer-dashboard') {
        updateCustomerDashboard();
    } else if (pageId === 'order') {
        updateProductStock();
    } else if (pageId === 'admin-dashboard') {
        updateAdminDashboard();
    } else if (pageId === 'admin-orders') {
        populateAdminOrders();
    } else if (pageId === 'admin-inventory') {
        updateInventoryPage();
    } else if (pageId === 'admin-analytics') {
        updateAnalyticsPage();
    }
}

// Customer Dashboard Functions
function updateCustomerDashboard() {
    // Get user's orders
    const userOrders = mockData.orders.filter(order => order.userId === currentUser?.id);
    
    // Update counts
    const activeOrders = userOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
    document.getElementById('active-orders-count').textContent = activeOrders.length;
    document.getElementById('total-orders-count').textContent = userOrders.length;
    
    // Update next delivery
    const nextDeliveryOrder = activeOrders.find(order => order.status === 'out-for-delivery');
    document.getElementById('next-delivery').textContent = nextDeliveryOrder ? 'Today' : 'None';
    
    // Update recent orders table
    const recentOrdersTable = document.getElementById('recent-orders-table');
    recentOrdersTable.innerHTML = '';
    
    const sortedOrders = [...userOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentOrders = sortedOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No orders yet</td>
        `;
        recentOrdersTable.appendChild(row);
    } else {
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(order.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${getOrderItemsText(order)}</td>
                <td class="px-6 py-4 whitespace-nowrap">₱${order.total.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                        ${capitalizeFirstLetter(order.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="viewOrderTracking(${order.id})" class="text-water-blue hover:underline">Track</button>
                    ${order.status === 'pending' ? `<button onclick="cancelOrder(${order.id})" class="text-red-600 hover:underline ml-3">Cancel</button>` : ''}
                </td>
            `;
            recentOrdersTable.appendChild(row);
        });
    }
}

function viewOrderTracking(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    selectedOrderId = orderId;
    
    const trackingContainer = document.getElementById('order-tracking-container');
    
    const statusSteps = ['pending', 'processing', 'out-for-delivery', 'delivered'];
    const currentStepIndex = statusSteps.indexOf(order.status);
    
    let stepsHtml = '<div class="flex items-center justify-between mb-8">';
    
    statusSteps.forEach((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        stepsHtml += `
            <div class="flex flex-col items-center">
                <div class="w-10 h-10 flex items-center justify-center rounded-full ${isCompleted ? 'bg-water-blue' : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-blue-100' : ''}">
                    <i class="fas ${getStatusIcon(step)} text-white"></i>
                </div>
                <p class="mt-2 text-sm font-medium ${isCompleted ? 'text-water-blue' : 'text-gray-500'}">${capitalizeFirstLetter(step)}</p>
            </div>
            ${index < statusSteps.length - 1 ? `
                <div class="flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-water-blue' : 'bg-gray-200'}"></div>
            ` : ''}
        `;
    });
    
    stepsHtml += '</div>';
    
    const orderDetails = `
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 class="font-medium text-gray-800 mb-2">Order #${order.id}</h3>
            <p class="text-sm text-gray-600 mb-1">Date: ${formatDate(order.date)}</p>
            <p class="text-sm text-gray-600 mb-1">Items: ${getOrderItemsText(order)}</p>
            <p class="text-sm text-gray-600">Total: ₱${order.total.toFixed(2)}</p>
        </div>
    `;
    
    trackingContainer.innerHTML = orderDetails + stepsHtml;
    
    if (order.status === 'pending') {
        trackingContainer.innerHTML += `
            <div class="text-center mt-4">
                <button onclick="cancelOrder(${order.id})" class="bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700">
                    Cancel Order
                </button>
            </div>
        `;
    }
}

function cancelOrder(orderId) {
    const orderIndex = mockData.orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        const order = mockData.orders[orderIndex];
        
        // Only allow cancellation if not out for delivery or delivered
        if (order.status === 'out-for-delivery' || order.status === 'delivered') {
            showNotification('error', 'Cannot Cancel', 'Orders that are out for delivery or delivered cannot be cancelled.');
            return;
        }
        
        // Update order status
        mockData.orders[orderIndex].status = 'cancelled';
        
        // Return items to inventory
        order.items.forEach(item => {
            const productIndex = mockData.products.findIndex(p => p.type === item.type);
            if (productIndex !== -1) {
                mockData.products[productIndex].stock += item.quantity;
            }
        });
        
        // Add inventory history
        order.items.forEach(item => {
            mockData.inventoryHistory.push({
                date: new Date(),
                productType: item.type,
                type: 'add',
                quantity: item.quantity,
                user: currentUser.name,
                notes: `Returned from cancelled order #${order.id}`
            });
        });
        
        showNotification('success', 'Order Cancelled', `Order #${orderId} has been cancelled.`);
        
        // Update UI
        updateCustomerDashboard();
        
        if (selectedOrderId === orderId) {
            viewOrderTracking(orderId);
        }
    }
}

// Order Functions
function updateProductStock() {
    const boxStock = mockData.products.find(p => p.type === 'box')?.stock || 0;
    const cylinderStock = mockData.products.find(p => p.type === 'cylinder')?.stock || 0;
    
    document.getElementById('box-stock').textContent = `In stock: ${boxStock}`;
    document.getElementById('cylinder-stock').textContent = `In stock: ${cylinderStock}`;
    
    // Disable add buttons if out of stock
    const boxAddBtn = document.querySelector('button[onclick="addToCart(\'box\')"]');
    const cylinderAddBtn = document.querySelector('button[onclick="addToCart(\'cylinder\')"]');
    
    if (boxStock === 0) {
        boxAddBtn.disabled = true;
        boxAddBtn.classList.add('opacity-50', 'cursor-not-allowed');
        document.getElementById('box-stock').classList.add('text-red-500', 'font-bold');
        document.getElementById('box-stock').textContent = 'Out of stock';
    } else {
        boxAddBtn.disabled = false;
        boxAddBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('box-stock').classList.remove('text-red-500', 'font-bold');
    }
    
    if (cylinderStock === 0) {
        cylinderAddBtn.disabled = true;
        cylinderAddBtn.classList.add('opacity-50', 'cursor-not-allowed');
        document.getElementById('cylinder-stock').classList.add('text-red-500', 'font-bold');
        document.getElementById('cylinder-stock').textContent = 'Out of stock';
    } else {
        cylinderAddBtn.disabled = false;
        cylinderAddBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('cylinder-stock').classList.remove('text-red-500', 'font-bold');
    }
    
    // Update cart display
    updateCartDisplay();
}

function incrementQuantity(type) {
    const inputElement = document.getElementById(`${type}-quantity`);
    const currentValue = parseInt(inputElement.value) || 0;
    const maxStock = mockData.products.find(p => p.type === type)?.stock || 0;
    
    if (currentValue < maxStock) {
        inputElement.value = currentValue + 1;
    } else {
        showNotification('warning', 'Maximum Stock Reached', `Cannot add more than available stock (${maxStock}).`);
    }
}

function decrementQuantity(type) {
    const inputElement = document.getElementById(`${type}-quantity`);
    const currentValue = parseInt(inputElement.value) || 0;
    
    if (currentValue > 0) {
        inputElement.value = currentValue - 1;
    }
}

function addToCart(type) {
    const quantity = parseInt(document.getElementById(`${type}-quantity`).value) || 0;
    
    if (quantity <= 0) {
        showNotification('warning', 'Invalid Quantity', 'Please select at least 1 item.');
        return;
    }
    
    const product = mockData.products.find(p => p.type === type);
    
    if (!product) {
        showNotification('error', 'Product Not Found', 'The selected product does not exist.');
        return;
    }
    
    if (quantity > product.stock) {
        showNotification('error', 'Insufficient Stock', `Only ${product.stock} items available.`);
        return;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.type === type);
    
    if (existingItemIndex !== -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * product.price;
    } else {
        // Add new item
        cart.items.push({
            type,
            name: product.name,
            price: product.price,
            quantity,
            subtotal: quantity * product.price
        });
    }
    
    // Update cart totals
    cart.subtotal = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.total = cart.subtotal + 20; // Add delivery fee
    
    // Update product stock temporarily (will be actually deducted at checkout)
    product.stock -= quantity;
    
    // Reset quantity input
    document.getElementById(`${type}-quantity`).value = 0;
    
    // Update UI
    updateProductStock();
    updateCartDisplay();
    
    showNotification('success', 'Added to Cart', `${quantity} ${product.name}(s) added to your cart.`);
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCart = document.getElementById('empty-cart');
    const cartItems = document.getElementById('cart-items');
    
    if (cart.items.length === 0) {
        emptyCart.classList.remove('hidden');
        cartItems.classList.add('hidden');
        return;
    }
    
    emptyCart.classList.add('hidden');
    cartItems.classList.remove('hidden');
    
    // Update cart items list
    cartItemsList.innerHTML = '';
    
    cart.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex justify-between items-center mb-3';
        itemElement.innerHTML = `
            <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-gray-500">₱${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="flex items-center">
                <span class="font-medium">₱${item.subtotal.toFixed(2)}</span>
                <button onclick="removeFromCart('${item.type}')" class="ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        cartItemsList.appendChild(itemElement);
    });
    
    // Update totals
    document.getElementById('cart-subtotal').textContent = `₱${cart.subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₱${cart.total.toFixed(2)}`;
}

function removeFromCart(type) {
    const itemIndex = cart.items.findIndex(item => item.type === type);
    
    if (itemIndex !== -1) {
        const item = cart.items[itemIndex];
        
        // Return quantity to product stock
        const productIndex = mockData.products.findIndex(p => p.type === type);
        if (productIndex !== -1) {
            mockData.products[productIndex].stock += item.quantity;
        }
        
        // Remove item from cart
        cart.items.splice(itemIndex, 1);
        
        // Update cart totals
        cart.subtotal = cart.items.reduce((total, item) => total + item.subtotal, 0);
        cart.total = cart.subtotal + 20; // Add delivery fee
        
        // Update UI
        updateProductStock();
        updateCartDisplay();
        
        showNotification('info', 'Removed from Cart', `${item.name} removed from your cart.`);
    }
}

function checkout() {
    if (cart.items.length === 0) {
        showNotification('warning', 'Empty Cart', 'Your cart is empty. Add some items before checkout.');
        return;
    }
    
    // Create order
    const order = {
        id: mockData.orders.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        userAddress: currentUser.address,
        date: new Date(),
        items: [...cart.items],
        subtotal: cart.subtotal,
        deliveryFee: 20,
        total: cart.total,
        status: 'pending'
    };
    
    mockData.orders.push(order);
    
    // Add inventory history
    order.items.forEach(item => {
        mockData.inventoryHistory.push({
            date: new Date(),
            productType: item.type,
            type: 'remove',
            quantity: item.quantity,
            user: 'System',
            notes: `Deducted from order #${order.id}`
        });
    });
    
    // Reset cart
    cart = { items: [], subtotal: 0, total: 0 };
    
    // Update UI
    updateCartDisplay();
    
    showNotification('success', 'Order Placed', `Your order #${order.id} has been placed successfully.`);
    
    // Navigate to dashboard
    showPage('customer-dashboard');
}

// Profile Functions
function updateProfile() {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    const address = document.getElementById('profile-address').value;
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;
    const confirmPassword = document.getElementById('profile-confirm-password').value;
    
    // Simple validation
    if (!name || !email || !phone || !address) {
        showNotification('error', 'Update Failed', 'Please fill in all required fields.');
        return;
    }
    
    // Find user in mock data
    const userIndex = mockData.users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Update basic info
        mockData.users[userIndex].name = name;
        mockData.users[userIndex].email = email;
        mockData.users[userIndex].phone = phone;
        mockData.users[userIndex].address = address;
        
        // Update password if provided
        if (currentPassword && newPassword && confirmPassword) {
            if (currentPassword !== mockData.users[userIndex].password) {
                showNotification('error', 'Password Update Failed', 'Current password is incorrect.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('error', 'Password Update Failed', 'New passwords do not match.');
                return;
            }
            
            mockData.users[userIndex].password = newPassword;
        }
        
        // Update current user
        currentUser = { ...mockData.users[userIndex] };
        
        // Update UI
        document.getElementById('current-username').textContent = name;
        document.getElementById('dashboard-username').textContent = name;
        
        // Clear password fields
        document.getElementById('profile-current-password').value = '';
        document.getElementById('profile-new-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
        
        showNotification('success', 'Profile Updated', 'Your profile has been updated successfully.');
    }
}

// Admin Dashboard Functions
function updateAdminDashboard() {
    // Update counts
    document.getElementById('admin-total-orders').textContent = mockData.orders.length;
    
    const totalSales = mockData.orders.reduce((total, order) => total + order.total, 0);
    document.getElementById('admin-total-sales').textContent = `₱${totalSales.toFixed(2)}`;
    
    const uniqueCustomers = new Set(mockData.orders.map(order => order.userId));
    document.getElementById('admin-total-customers').textContent = uniqueCustomers.size;
    
    const pendingOrders = mockData.orders.filter(order => order.status === 'pending').length;
    document.getElementById('admin-pending-orders').textContent = pendingOrders;
    
    // Update inventory bars
    const boxProduct = mockData.products.find(p => p.type === 'box');
    const cylinderProduct = mockData.products.find(p => p.type === 'cylinder');
    
    document.getElementById('admin-box-inventory').textContent = boxProduct.stock;
    document.getElementById('admin-cylinder-inventory').textContent = cylinderProduct.stock;
    
    const boxPercentage = Math.min(100, (boxProduct.stock / 100) * 100);
    const cylinderPercentage = Math.min(100, (cylinderProduct.stock / 100) * 100);
    
    document.getElementById('admin-box-inventory-bar').style.width = `${boxPercentage}%`;
    document.getElementById('admin-cylinder-inventory-bar').style.width = `${cylinderPercentage}%`;
    
    // Change bar color if low stock
    if (boxProduct.stock <= boxProduct.lowStockThreshold) {
        document.getElementById('admin-box-inventory-bar').classList.remove('bg-water-blue');
        document.getElementById('admin-box-inventory-bar').classList.add('bg-red-500');
    } else {
        document.getElementById('admin-box-inventory-bar').classList.remove('bg-red-500');
        document.getElementById('admin-box-inventory-bar').classList.add('bg-water-blue');
    }
    
    if (cylinderProduct.stock <= cylinderProduct.lowStockThreshold) {
        document.getElementById('admin-cylinder-inventory-bar').classList.remove('bg-water-blue');
        document.getElementById('admin-cylinder-inventory-bar').classList.add('bg-red-500');
    } else {
        document.getElementById('admin-cylinder-inventory-bar').classList.remove('bg-red-500');
        document.getElementById('admin-cylinder-inventory-bar').classList.add('bg-water-blue');
    }
    
    // Update recent orders table
    const recentOrdersTable = document.getElementById('admin-recent-orders-table');
    recentOrdersTable.innerHTML = '';
    
    const sortedOrders = [...mockData.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentOrders = sortedOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No orders yet</td>
        `;
        recentOrdersTable.appendChild(row);
    } else {
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${order.userName}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(order.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">₱${order.total.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                        ${capitalizeFirstLetter(order.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="openOrderStatusModal(${order.id})" class="text-water-blue hover:underline">Update</button>
                    <button onclick="viewAdminOrderDetails(${order.id})" class="text-gray-600 hover:underline ml-3">View</button>
                </td>
            `;
            recentOrdersTable.appendChild(row);
        });
    }
}

// Admin Orders Functions
function populateAdminOrders() {
    const ordersTable = document.getElementById('admin-all-orders-table');
    ordersTable.innerHTML = '';
    
    const sortedOrders = [...mockData.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">No orders yet</td>
        `;
        ordersTable.appendChild(row);
    } else {
        sortedOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${order.userName}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(order.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${getOrderItemsText(order)}</td>
                <td class="px-6 py-4 whitespace-nowrap">₱${order.total.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                        ${capitalizeFirstLetter(order.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="openOrderStatusModal(${order.id})" class="text-water-blue hover:underline">Update</button>
                    <button onclick="viewAdminOrderDetails(${order.id})" class="text-gray-600 hover:underline ml-3">View</button>
                </td>
            `;
            ordersTable.appendChild(row);
        });
    }
    
    document.getElementById('admin-orders-total').textContent = sortedOrders.length;
}

function viewAdminOrderDetails(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const detailsContainer = document.getElementById('admin-order-details');
    
    const orderItems = order.items.map(item => `
        <div class="flex justify-between py-2 border-b">
            <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-gray-500">₱${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <p class="font-medium">₱${item.subtotal.toFixed(2)}</p>
        </div>
    `).join('');
    
    const statusClass = getStatusClass(order.status);
    const statusText = capitalizeFirstLetter(order.status);
    
    detailsContainer.innerHTML = `
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold text-xl text-gray-800">Order #${order.id}</h3>
                <span class="px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </div>
            <p class="text-gray-600 mb-1">Date: ${formatDate(order.date)}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h3 class="font-semibold text-gray-800 mb-2">Customer Information</h3>
                <p class="text-gray-600 mb-1">Name: ${order.userName}</p>
                <p class="text-gray-600">Address: ${order.userAddress}</p>
            </div>
            <div>
                <h3 class="font-semibold text-gray-800 mb-2">Order Summary</h3>
                <p class="text-gray-600 mb-1">Subtotal: ₱${order.subtotal.toFixed(2)}</p>
                <p class="text-gray-600 mb-1">Delivery Fee: ₱${order.deliveryFee.toFixed(2)}</p>
                <p class="font-semibold">Total: ₱${order.total.toFixed(2)}</p>
            </div>
        </div>
        
        <div class="mb-6">
            <h3 class="font-semibold text-gray-800 mb-2">Order Items</h3>
            <div class="border rounded-lg overflow-hidden">
                ${orderItems}
            </div>
        </div>
        
        <div class="flex justify-end">
            <button onclick="openOrderStatusModal(${order.id})" class="btn-water py-2 px-4 rounded-md font-medium">
                Update Status
            </button>
        </div>
    `;
}

function openOrderStatusModal(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    selectedOrderId = orderId;
    
    document.getElementById('current-order-status').textContent = capitalizeFirstLetter(order.status);
    document.getElementById('new-order-status').value = order.status;
    document.getElementById('order-status-notes').value = '';
    
    document.getElementById('order-status-modal').classList.remove('hidden');
}

function closeOrderStatusModal() {
    document.getElementById('order-status-modal').classList.add('hidden');
    selectedOrderId = null;
}

function updateOrderStatus() {
    const newStatus = document.getElementById('new-order-status').value;
    const notes = document.getElementById('order-status-notes').value;
    
    if (!selectedOrderId) {
        closeOrderStatusModal();
        return;
    }
    
    const orderIndex = mockData.orders.findIndex(o => o.id === selectedOrderId);
    
    if (orderIndex !== -1) {
        const oldStatus = mockData.orders[orderIndex].status;
        
        // Update order status
        mockData.orders[orderIndex].status = newStatus;
        mockData.orders[orderIndex].statusNotes = notes;
        
        showNotification('success', 'Status Updated', `Order #${selectedOrderId} status changed from ${capitalizeFirstLetter(oldStatus)} to ${capitalizeFirstLetter(newStatus)}.`);
        
        // Update UI
        if (document.getElementById('admin-dashboard').classList.contains('active-section')) {
            updateAdminDashboard();
        } else if (document.getElementById('admin-orders').classList.contains('active-section')) {
            populateAdminOrders();
            
            // Update order details if currently viewing
            if (document.getElementById('admin-order-details').innerHTML.includes(`Order #${selectedOrderId}`)) {
                viewAdminOrderDetails(selectedOrderId);
            }
        }
        
        closeOrderStatusModal();
    }
}

// Admin Inventory Functions
function updateInventoryPage() {
    const boxProduct = mockData.products.find(p => p.type === 'box');
    const cylinderProduct = mockData.products.find(p => p.type === 'cylinder');
    
    // Update current stock
    document.getElementById('box-current-stock').textContent = boxProduct.stock;
    document.getElementById('cylinder-current-stock').textContent = cylinderProduct.stock;
    
    // Update stock bars
    const boxPercentage = Math.min(100, (boxProduct.stock / 100) * 100);
    const cylinderPercentage = Math.min(100, (cylinderProduct.stock / 100) * 100);
    
    document.getElementById('box-stock-bar').style.width = `${boxPercentage}%`;
    document.getElementById('cylinder-stock-bar').style.width = `${cylinderPercentage}%`;
    
    // Change bar color if low stock
    if (boxProduct.stock <= boxProduct.lowStockThreshold) {
        document.getElementById('box-stock-bar').classList.remove('bg-water-blue');
        document.getElementById('box-stock-bar').classList.add('bg-red-500');
    } else {
        document.getElementById('box-stock-bar').classList.remove('bg-red-500');
        document.getElementById('box-stock-bar').classList.add('bg-water-blue');
    }
    
    if (cylinderProduct.stock <= cylinderProduct.lowStockThreshold) {
        document.getElementById('cylinder-stock-bar').classList.remove('bg-water-blue');
        document.getElementById('cylinder-stock-bar').classList.add('bg-red-500');
    } else {
        document.getElementById('cylinder-stock-bar').classList.remove('bg-red-500');
        document.getElementById('cylinder-stock-bar').classList.add('bg-water-blue');
    }
    
    // Update price and threshold inputs
    document.getElementById('box-price').value = boxProduct.price.toFixed(2);
    document.getElementById('cylinder-price').value = cylinderProduct.price.toFixed(2);
    document.getElementById('box-low-stock-threshold').value = boxProduct.lowStockThreshold;
    document.getElementById('cylinder-low-stock-threshold').value = cylinderProduct.lowStockThreshold;
    
    // Update inventory history table
    const historyTable = document.getElementById('inventory-history-table');
    historyTable.innerHTML = '';
    
    const sortedHistory = [...mockData.inventoryHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No inventory history yet</td>
        `;
        historyTable.appendChild(row);
    } else {
        sortedHistory.slice(0, 10).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(entry.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${capitalizeFirstLetter(entry.productType)} Container</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${entry.type === 'add' ? 'Added' : 'Removed'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.user}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entry.notes || '-'}</td>
            `;
            historyTable.appendChild(row);
        });
    }
}

function addInventory(type) {
    const quantity = parseInt(document.getElementById(`${type}-add-stock`).value) || 0;
    
    if (quantity <= 0) {
        showNotification('warning', 'Invalid Quantity', 'Please enter a positive quantity.');
        return;
    }
    
    const productIndex = mockData.products.findIndex(p => p.type === type);
    
    if (productIndex !== -1) {
        // Add to stock
        mockData.products[productIndex].stock += quantity;
        
        // Add inventory history
        mockData.inventoryHistory.push({
            date: new Date(),
            productType: type,
            type: 'add',
            quantity,
            user: currentUser.name,
            notes: 'Manual stock addition'
        });
        
        showNotification('success', 'Stock Added', `${quantity} ${capitalizeFirstLetter(type)} Container(s) added to inventory.`);
        
        // Update UI
        updateInventoryPage();
    }
}

function removeInventory(type) {
    const quantity = parseInt(document.getElementById(`${type}-remove-stock`).value) || 0;
    
    if (quantity <= 0) {
        showNotification('warning', 'Invalid Quantity', 'Please enter a positive quantity.');
        return;
    }
    
    const productIndex = mockData.products.findIndex(p => p.type === type);
    
    if (productIndex !== -1) {
        if (quantity > mockData.products[productIndex].stock) {
            showNotification('error', 'Insufficient Stock', `Cannot remove more than available stock (${mockData.products[productIndex].stock}).`);
            return;
        }
        
        // Remove from stock
        mockData.products[productIndex].stock -= quantity;
        
        // Add inventory history
        mockData.inventoryHistory.push({
            date: new Date(),
            productType: type,
            type: 'remove',
            quantity,
            user: currentUser.name,
            notes: 'Manual stock removal'
        });
        
        showNotification('success', 'Stock Removed', `${quantity} ${capitalizeFirstLetter(type)} Container(s) removed from inventory.`);
        
        // Update UI
        updateInventoryPage();
    }
}

function updateProductInfo(type) {
    const price = parseFloat(document.getElementById(`${type}-price`).value) || 0;
    const threshold = parseInt(document.getElementById(`${type}-low-stock-threshold`).value) || 0;
    
    if (price <= 0) {
        showNotification('warning', 'Invalid Price', 'Please enter a positive price.');
        return;
    }
    
    if (threshold < 0) {
        showNotification('warning', 'Invalid Threshold', 'Please enter a non-negative threshold.');
        return;
    }
    
    const productIndex = mockData.products.findIndex(p => p.type === type);
    
    if (productIndex !== -1) {
        // Update product info
        mockData.products[productIndex].price = price;
        mockData.products[productIndex].lowStockThreshold = threshold;
        
        showNotification('success', 'Product Updated', `${capitalizeFirstLetter(type)} Container information updated.`);
        
        // Update UI
        updateInventoryPage();
    }
}

// Admin Analytics Functions
function updateAnalyticsPage() {
    // Populate sales report table
    const reportTable = document.getElementById('sales-report-table');
    reportTable.innerHTML = '';
    
    if (mockData.salesReports.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No sales data available</td>
        `;
        reportTable.appendChild(row);
    } else {
        mockData.salesReports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${report.period}</td>
                <td class="px-6 py-4 whitespace-nowrap">${report.boxSold}</td>
                <td class="px-6 py-4 whitespace-nowrap">${report.cylinderSold}</td>
                <td class="px-6 py-4 whitespace-nowrap">${report.totalOrders}</td>
                <td class="px-6 py-4 whitespace-nowrap">₱${report.revenue.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="${report.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${report.growth}</span>
                </td>
            `;
            reportTable.appendChild(row);
        });
    }
    
    // Update charts
    updateAnalyticsCharts();
}

function initializeCharts() {
    // Sales chart
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    charts.sales = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: mockData.salesData.map(item => item.month),
            datasets: [{
                label: 'Sales (₱)',
                data: mockData.salesData.map(item => item.sales),
                backgroundColor: 'rgba(92, 184, 214, 0.2)',
                borderColor: '#3a97b5',
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: '#3a97b5'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Forecast chart
    const forecastCtx = document.getElementById('forecast-chart').getContext('2d');
    
    // Generate forecast data (simple example)
    const actualData = mockData.salesData.map(item => item.sales);
    const forecastData = actualData.map(value => value * (1 + Math.random() * 0.2));
    
    charts.forecast = new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Actual Sales',
                    data: actualData,
                    borderColor: '#3a97b5',
                    backgroundColor: 'rgba(92, 184, 214, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#3a97b5'
                },
                {
                    label: 'Forecasted Sales',
                    data: forecastData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointBackgroundColor: '#f59e0b'
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Product distribution chart
    const productDistCtx = document.getElementById('product-distribution-chart').getContext('2d');
    charts.productDist = new Chart(productDistCtx, {
        type: 'doughnut',
        data: {
            labels: ['Box Containers', 'Cylinder Containers'],
            datasets: [{
                data: [60, 40],
                backgroundColor: ['#3a97b5', '#60a5fa'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Order status chart
    const orderStatusCtx = document.getElementById('order-status-chart').getContext('2d');
    charts.orderStatus = new Chart(orderStatusCtx, {
        type: 'pie',
        data: {
            labels: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
            datasets: [{
                data: [15, 20, 10, 50, 5],
                backgroundColor: ['#f59e0b', '#3a97b5', '#8b5cf6', '#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAnalyticsCharts() {
    // Update product distribution chart based on orders
    if (charts.productDist) {
        let boxTotal = 0;
        let cylinderTotal = 0;
        
        mockData.orders.forEach(order => {
            order.items.forEach(item => {
                if (item.type === 'box') {
                    boxTotal += item.quantity;
                } else if (item.type === 'cylinder') {
                    cylinderTotal += item.quantity;
                }
            });
        });
        
        charts.productDist.data.datasets[0].data = [boxTotal, cylinderTotal];
        charts.productDist.update();
    }
    
    // Update order status chart
    if (charts.orderStatus) {
        const statusCounts = {
            pending: 0,
            processing: 0,
            'out-for-delivery': 0,
            delivered: 0,
            cancelled: 0
        };
        
        mockData.orders.forEach(order => {
            statusCounts[order.status]++;
        });
        
        charts.orderStatus.data.datasets[0].data = [
            statusCounts.pending,
            statusCounts.processing,
            statusCounts['out-for-delivery'],
            statusCounts.delivered,
            statusCounts.cancelled
        ];
        charts.orderStatus.update();
    }
}

// Utility Functions
function showNotification(type, title, message) {
    const toast = document.getElementById('notification-toast');
    const titleEl = document.getElementById('notification-title');
    const messageEl = document.getElementById('notification-message');
    const iconEl = document.getElementById('notification-icon');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon based on type
    iconEl.innerHTML = '';
    if (type === 'success') {
        iconEl.innerHTML = '<i class="fas fa-check-circle text-green-500 text-xl"></i>';
    } else if (type === 'error') {
        iconEl.innerHTML = '<i class="fas fa-times-circle text-red-500 text-xl"></i>';
    } else if (type === 'warning') {
        iconEl.innerHTML = '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>';
    } else if (type === 'info') {
        iconEl.innerHTML = '<i class="fas fa-info-circle text-blue-500 text-xl"></i>';
    }
    
    toast.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(hideNotification, 3000);
}

function hideNotification() {
    document.getElementById('notification-toast').classList.add('hidden');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getOrderItemsText(order) {
    return order.items.map(item => `${item.quantity} ${item.name}`).join(', ');
}

function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'out-for-delivery':
            return 'bg-purple-100 text-purple-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'pending':
            return 'fa-clock';
        case 'processing':
            return 'fa-cog';
        case 'out-for-delivery':
            return 'fa-truck';
        case 'delivered':
            return 'fa-check';
        default:
            return 'fa-info-circle';
    }
}

function capitalizeFirstLetter(string) {
    return string.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateDemoOrders() {
    if (mockData.orders.length > 0) return;
    
    const dates = [
        new Date(2023, 5, 15),
        new Date(2023, 5, 20),
        new Date(2023, 5, 25),
        new Date(2023, 5, 28),
        new Date(2023, 6, 3)
    ];
    
    const demoOrders = [
        {
            id: 1,
            userId: 1,
            userName: 'John Doe',
            userAddress: '123 Main St, Anytown',
            date: dates[0],
            items: [
                { type: 'box', name: 'Box Container', price: 45.00, quantity: 2, subtotal: 90.00 }
            ],
            subtotal: 90.00,
            deliveryFee: 20.00,
            total: 110.00,
            status: 'delivered'
        },
        {
            id: 2,
            userId: 1,
            userName: 'John Doe',
            userAddress: '123 Main St, Anytown',
            date: dates[1],
            items: [
                { type: 'cylinder', name: 'Cylinder Container', price: 25.00, quantity: 3, subtotal: 75.00 }
            ],
            subtotal: 75.00,
            deliveryFee: 20.00,
            total: 95.00,
            status: 'delivered'
        },
        {
            id: 3,
            userId: 1,
            userName: 'John Doe',
            userAddress: '123 Main St, Anytown',
            date: dates[2],
            items: [
                { type: 'box', name: 'Box Container', price: 45.00, quantity: 1, subtotal: 45.00 },
                { type: 'cylinder', name: 'Cylinder Container', price: 25.00, quantity: 2, subtotal: 50.00 }
            ],
            subtotal: 95.00,
            deliveryFee: 20.00,
            total: 115.00,
            status: 'delivered'
        },
        {
            id: 4,
            userId: 1,
            userName: 'John Doe',
            userAddress: '123 Main St, Anytown',
            date: dates[3],
            items: [
                { type: 'cylinder', name: 'Cylinder Container', price: 25.00, quantity: 4, subtotal: 100.00 }
            ],
            subtotal: 100.00,
            deliveryFee: 20.00,
            total: 120.00,
            status: 'processing'
        },
        {
            id: 5,
            userId: 1,
            userName: 'John Doe',
            userAddress: '123 Main St, Anytown',
            date: dates[4],
            items: [
                { type: 'box', name: 'Box Container', price: 45.00, quantity: 3, subtotal: 135.00 }
            ],
            subtotal: 135.00,
            deliveryFee: 20.00,
            total: 155.00,
            status: 'pending'
        }
    ];
    
    mockData.orders = demoOrders;
}

function generateDemoInventoryHistory() {
    if (mockData.inventoryHistory.length > 0) return;
    
    const dates = [
        new Date(2023, 5, 10),
        new Date(2023, 5, 12),
        new Date(2023, 5, 15),
        new Date(2023, 5, 18),
        new Date(2023, 5, 20),
        new Date(2023, 5, 22),
        new Date(2023, 5, 25),
        new Date(2023, 6, 1),
        new Date(2023, 6, 5),
        new Date(2023, 6, 10)
    ];
    
    const demoHistory = [
        {
            date: dates[0],
            productType: 'box',
            type: 'add',
            quantity: 50,
            user: 'Admin User',
            notes: 'Initial inventory'
        },
        {
            date: dates[1],
            productType: 'cylinder',
            type: 'add',
            quantity: 75,
            user: 'Admin User',
            notes: 'Initial inventory'
        },
        {
            date: dates[2],
            productType: 'box',
            type: 'remove',
            quantity: 2,
            user: 'System',
            notes: 'Deducted from order #1'
        },
        {
            date: dates[3],
            productType: 'cylinder',
            type: 'remove',
            quantity: 3,
            user: 'System',
            notes: 'Deducted from order #2'
        },
        {
            date: dates[4],
            productType: 'box',
            type: 'remove',
            quantity: 1,
            user: 'System',
            notes: 'Deducted from order #3'
        },
        {
            date: dates[4],
            productType: 'cylinder',
            type: 'remove',
            quantity: 2,
            user: 'System',
            notes: 'Deducted from order #3'
        },
        {
            date: dates[5],
            productType: 'cylinder',
            type: 'remove',
            quantity: 4,
            user: 'System',
            notes: 'Deducted from order #4'
        },
        {
            date: dates[6],
            productType: 'box',
            type: 'remove',
            quantity: 3,
            user: 'System',
            notes: 'Deducted from order #5'
        },
        {
            date: dates[7],
            productType: 'box',
            type: 'add',
            quantity: 20,
            user: 'Admin User',
            notes: 'Restocking'
        },
        {
            date: dates[8],
            productType: 'cylinder',
            type: 'add',
            quantity: 30,
            user: 'Admin User',
            notes: 'Restocking'
        }
    ];
    
    mockData.inventoryHistory = demoHistory;
}