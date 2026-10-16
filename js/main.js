// المنتجات المميزة للظهور في الصفحة الرئيسية فقط (باستخدام مسارات مباشرة مأمونة)
const featuredProducts = [
    {
        id: '1',
        name: "نجف كريستال مودرن فاخر",
        price: 45000,
        image: "./images/chand1.jpg"
    },
    {
        id: '2',
        name: "ثريا سقف معلقة أسلوب حديث",
        price: 32000,
        image: "./images/chand2.jpg"
    },
    {
        id: '3',
        name: "لمبة سبوت لايت LED ذكية (12 وات)",
        price: 2500,
        image: "./images/led1.jpg"
    }
];
// رقم واتساب التاجر المباشر
const merchantPhone = "967776926118";

// تهيئة السلة
let cart = JSON.parse(localStorage.getItem('shawafi_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {

    // تشغيل القوائم بذكاء حسب الصفحة الحالية
    if (document.getElementById('featured-products-container')) {
        renderFeaturedProducts();
    }

    if (document.getElementById('all-products-container') || document.querySelector('.products-grid')) {
        renderAllProducts();
    }

    updateCartUI();

    // التحكم بالوضع الداكن (Dark Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggleBtn.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
});

// دالة تصحيح المسار التلقائي للصور حسب موقع الصفحة
function fixImagePath(imagePath) {
    if (!imagePath) return 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;

    const isSubPage = window.location.pathname.includes('/pages/');
    let cleanPath = imagePath.replace(/^(\.\.\/|\.\/)/, '');

    return isSubPage ? '../' + cleanPath : cleanPath;
}

// جلب جميع المنتجات لصفحة المنتجات فقط (الأساسية + المضافة من لوحة التحكم)
function getAllProducts() {
    const customProducts = JSON.parse(localStorage.getItem('customProducts'))
        || JSON.parse(localStorage.getItem('custom_products'))
        || [];
    return [...defaultProducts, ...customProducts];
}

// 1. عرض الصفحة الرئيسية فقط (3 منتجات مميزة أساسية)
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;

    container.innerHTML = '';

    featuredProducts.forEach(product => {
        const productCard = document.createElement('article');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${fixImagePath(product.image)}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400';">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price">${Number(product.price).toLocaleString()} ريال</div>
                <button class="buy-btn" onclick="addToCart('${product.id}')">
                    <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// عرض المنتجات المضافة من لوحة التحكم في صفحة المنتجات (products.html) فقط
function renderAllProducts() {
    const container = document.getElementById('all-products-container');
    if (!container) return;

    const customProducts = JSON.parse(localStorage.getItem('customProducts'))
        || JSON.parse(localStorage.getItem('custom_products'))
        || [];

    const oldDynamicCards = container.querySelectorAll('.dynamic-product');
    oldDynamicCards.forEach(card => card.remove());

    customProducts.forEach(product => {
        let imgSrc = product.image || '';
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../') && !imgSrc.startsWith('data:')) {
            imgSrc = '../' + imgSrc;
        }

        const productCard = document.createElement('article');
        productCard.className = 'product-card dynamic-product';
        productCard.innerHTML = `
            <img src="${imgSrc}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400';">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price">${Number(product.price).toLocaleString()} ريال</div>
                <button class="buy-btn" onclick="addToCartPage('${product.name}', ${product.price}, '${imgSrc}')">
                    <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// إضافة منتج للسلة
function addToCart(productId) {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    const existingItem = cart.find(item => String(item.id) === String(productId));
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCartAndUpdate();
    toggleCart(true);
}

// حذف منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCartAndUpdate();
}

// حفظ السلة
function saveCartAndUpdate() {
    localStorage.setItem('shawafi_cart', JSON.stringify(cart));
    updateCartUI();
}

// تحديث واجهة السلة
function updateCartUI() {
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCountElement) cartCountElement.innerText = totalCount;
    if (cartTotalAmount) cartTotalAmount.innerText = `${totalPrice.toLocaleString()} ريال`;

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">السلة فارغة حالياً.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name} (x${item.quantity})</h4>
                    <p>${(item.price * item.quantity).toLocaleString()} ريال</p>
                </div>
                <button style="background:none; border:none; color:#ef4444; cursor:pointer;" onclick="removeFromCart('${item.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
}

// إظهار وإخفاء السلة
function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;

    if (forceOpen) {
        drawer.classList.add('active');
        overlay.classList.add('active');
    } else {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.toggle('show');
}

// إرسال الطلب عبر الواتساب مباشرة بدون طلب اسم العميل
function sendOrderWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة! يرجى إضافة منتجات أولاً.");
        return;
    }

    let message = "مرحباً، أرغب في طلب المنتجات التالية من متجر بصمة فن:\n\n";
    let total = 0;

    cart.forEach((item, i) => {
        const itemTotal = item.price * item.quantity;
        message += `${i + 1}. *${item.name}*\n   الكمية: ${item.quantity}\n   السعر: ${itemTotal.toLocaleString()} ريال\n\n`;
        total += itemTotal;
    });

    message += `------------------------------\n`;
    message += `*الإجمالي النهائي:* ${total.toLocaleString()} ريال\n\n`;
    message += `يرجى تزويدي بتفاصيل التوصيل وتأكيد الطلب.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${merchantPhone}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}