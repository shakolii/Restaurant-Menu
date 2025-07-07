
const scrollToRight = () => {
   const container = document.getElementById('scrollList');
   if (container) { 
       container.scrollBy({ left: 200, behavior: 'smooth' });
   }
};

const scrollToLeft = () => {
   const container = document.getElementById('scrollList');
   if (container) { 
       container.scrollBy({ left: -200, behavior: 'smooth' });
   }
};

function goToBreakfast () {
    window.location.href= "goToBreakfast.html"
};
function Bacon() {
   window.location.href= "Bacon.html"
}
function goToCart() {
   window.location.href= "cart.html"
}


const cartItemsContainer = document.querySelector('.cart-items-container');
const cartSummarySubtotal = document.querySelector('.summary-value');
const cartSummaryTotal = document.querySelector('.final-total');
const emptyCartMessage = document.querySelector('.empty-cart-message');
const proceedToCheckoutBtn = document.querySelector('.proceed-to-checkout-btn');
const cartItemCountSpan = document.querySelector('.cart-icon .cart-item-count'); 


let cartItems = []; 
loadCartFromLocalStorage(); 

/**
 * Calculates the total price for a single cart item including base price and add-ons.
 * @param {object} item 
 * @returns {number} 
 */
function calculateItemTotalPrice(item) {
    let addonsTotal = 0;
    if (item.addons) {
        item.addons.forEach(addon => {
            addonsTotal += addon.price;
        });
    }
    return (item.basePrice + addonsTotal);
}

/**
 * Calculates the total price of all items in the cart.
 * @returns {number} 
 */
function calculateCartTotal() {
    let total = 0;
    cartItems.forEach(item => {
        total += calculateItemTotalPrice(item) * item.quantity;
    });
    return total;
}


function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
}


function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('shoppingCart');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
    } else {
        cartItems = []; 
    }
}


function renderCartItems() {
    if (!cartItemsContainer) {
        updateCartIconCount();
        return;
    }

    cartItemsContainer.innerHTML = ''; 

    if (cartItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        if (proceedToCheckoutBtn) { 
             proceedToCheckoutBtn.disabled = true;
        }
    } else {
        emptyCartMessage.style.display = 'none';
        if (proceedToCheckoutBtn) { 
            proceedToCheckoutBtn.disabled = false;
        }
        cartItems.forEach(item => {
            const itemTotalPrice = calculateItemTotalPrice(item); 
            const totalForThisQuantity = itemTotalPrice * item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.dataset.itemId = item.id; 

            const addonsHtml = item.addons && item.addons.length > 0 ?
                `<div class="cart-item-addons">
                    <p>Add-ons:</p>
                    <ul>
                       ${item.addons.map(addon => `<li><span class="math-inline">\{addon\.name\} \(\+</span>${(addon.price !== null && typeof addon.price === 'number' ? addon.price.toFixed(2) : '0.00')})</li>`).join('')}
                    </ul>
                </div>` : '';

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h2 class="cart-item-name">${item.name}</h2>
                    <p class="cart-item-base-price">Base Price: $${item.basePrice.toFixed(2)}</p>
                    ${addonsHtml}
                    <p class="cart-item-total-price">Total for Item: $${totalForThisQuantity.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity-control">
                    <button class="quantity-btn decrease-qty">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="item-quantity-input">
                    <button class="quantity-btn increase-qty">+</button>
                </div>
                <button class="remove-item-btn">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
    }

    updateCartSummary(); 
    updateCartIconCount(); 
}


function updateCartSummary() {
    if (!cartSummarySubtotal) return; 
    const total = calculateCartTotal();
    cartSummarySubtotal.textContent = `$${total.toFixed(2)}`;
    cartSummaryTotal.textContent = `$${total.toFixed(2)}`;
}


function updateCartIconCount() {
    const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    if (cartItemCountSpan) { 
        cartItemCountSpan.textContent = totalItemsInCart;
    }
}

/**
 * 
 * @param {object} product 
 * @param {Array} selectedAddons 
 */
function addItemToCart(product, selectedAddons) {
  
    const addonIds = selectedAddons.map(addon => addon.id).sort().join('-');
    const itemId = `${product.id}-${addonIds}`;

    
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);

    if (existingItemIndex > -1) {
       
        cartItems[existingItemIndex].quantity++;
    } else {
        
        cartItems.push({
            id: itemId,
            name: product.name,
            image: product.image,
            basePrice: product.price,
            quantity: 1,
            addons: selectedAddons
        });
    }

    saveCartToLocalStorage(); 
    updateCartIconCount(); 
    console.log('Cart after adding:', cartItems);
}



if (cartItemsContainer) {
   
    cartItemsContainer.addEventListener('click', function(event) {
        const target = event.target;
        const cartItemDiv = target.closest('.cart-item'); 
        if (!cartItemDiv) return; 

        const itemId = cartItemDiv.dataset.itemId;
        const itemIndex = cartItems.findIndex(item => item.id === itemId);

        if (itemIndex === -1) return; 

        if (target.classList.contains('increase-qty')) {
            cartItems[itemIndex].quantity++;
        } else if (target.classList.contains('decrease-qty')) {
            if (cartItems[itemIndex].quantity > 1) {
                cartItems[itemIndex].quantity--;
            }
        } else if (target.classList.contains('remove-item-btn')) {
            cartItems.splice(itemIndex, 1);
        }

        saveCartToLocalStorage(); 
        renderCartItems(); 
    });

    
    cartItemsContainer.addEventListener('change', function(event) {
        const target = event.target;
        if (target.classList.contains('item-quantity-input')) {
            const cartItemDiv = target.closest('.cart-item');
            if (!cartItemDiv) return;

            const itemId = cartItemDiv.dataset.itemId;
            const itemIndex = cartItems.findIndex(item => item.id === itemId);

            if (itemIndex !== -1) {
                let newQuantity = parseInt(target.value, 10);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; 
                    target.value = 1; 
                }
                cartItems[itemIndex].quantity = newQuantity;
                saveCartToLocalStorage(); 
                renderCartItems(); 
            }
        }
    });

    
    if (proceedToCheckoutBtn) { 
        proceedToCheckoutBtn.addEventListener('click', function() {
            alert('Proceeding to Checkout! (This would lead to your checkout page)');
        });
    }
}



document.addEventListener('DOMContentLoaded', () => {
    
    renderCartItems(); 
    updateCartIconCount(); 
});
 
    function handleAddToCart() {
        const productName = document.getElementById('product-name').textContent;
        const productPriceText = document.getElementById('product-price').textContent;
        const productPrice = parseFloat(productPriceText.replace('$', ''));
        const productImage = document.querySelector('.product-detail img').src; // آدرس عکس رو از تگ img می‌گیریم

        const selectedAddons = [];
        document.querySelectorAll('.options input[type="checkbox"]:checked').forEach(checkbox => {
            selectedAddons.push({
                id: checkbox.id, 
                name: checkbox.dataset.addonName,
                price: parseFloat(checkbox.dataset.addonPrice)
            });
        });

        
        const product = {
            id: 'bacon-hashbrowns', 
            name: productName,
            image: productImage,
            price: productPrice
        };

       
        addItemToCart(product, selectedAddons);
        
        
        goToCart(); 
    }
function goToSeafood() {
   window.location.href= "seafood.html"
}
function Burrito() {
   window.location.href= "goToBurrito.html"
}
function Scrambled() {
   window.location.href= "Scrambled.html"
}
function Oatmeal() {
   window.location.href= "Oatmeal.html"
}
function Croissants() {
   window.location.href= "Croissants.html"
}
function Berry() {
   window.location.href= "berry.html"
}
function Pancakes() {
   window.location.href= "Pancakes.html"
}
function Pudding() {
   window.location.href= "Pudding.html"
}
function Grilledobster() {
   window.location.href= "GrilledLobster.html"
}
function SeafoodPaella() {
   window.location.href= "SeafoodPaella.html"
}
function BakedOysters () {
   window.location.href= "BakedOysters.html"
}
function Bouillabaisse () {
   window.location.href= "Bouillabaisse.html"
}
function Sushi () {
   window.location.href= "Sushi.html"
}
function GrilledSalmon () {
   window.location.href= "GrilledSalmon.html"
}
function Blackened () {
   window.location.href= "Blackened.html"
}
function Home () {
   window.location.href= "index.html"
}
function salad () {
   window.location.href= "goToSalad.html"
}
function Garden () {
   window.location.href= "garden.html"
}
function Strawberry () {
   window.location.href= "Strawberry.html"
}
function Mediterranean () {
   window.location.href= "Mediterranean.html"
}
function Summer () {
   window.location.href= "Summer.html"
}
function Bounty () {
   window.location.href= "Bounty.html"
}
function Enigmatic () {
   window.location.href= "Enigmatic.html"
}
function steak () {
   window.location.href= "goToSteak.html"
}
function Ribeye () {
   window.location.href= "Ribeye.html"
}
function Deluxe () {
   window.location.href= "Deluxe.html"
}
function Mignon () {
   window.location.href= "Mignon.html"
}
function Garlic () {
   window.location.href= "Garlic.html"
}
function GarlicButter () {
   window.location.href= "GarlicButter.html"
}
function Dessert () {
   window.location.href= "goToDessert.html"
}
function Tiramisu () {
    window.location.href= "Tiramisu.html"
}
function Tart () {
    window.location.href= "Tart.html"
}
function Cheescake () {
    window.location.href= "Cheescake.html"
}
function Lava () {
    window.location.href= "Lava.html"
}
function Compote () {
    window.location.href= "Compote.html"
}
function Pie () {
    window.location.href= "Pie.html"
}
function Drink () {
    window.location.href= "goToDrink.html"
}
function Rosemary () {
    window.location.href= "Rosemary.html"
}
function Tai () {
    window.location.href= "Tai.html"
}
function Martini () {
    window.location.href= "Martini.html"
}
function Spritz () {
    window.location.href= "Spritz.html"
}
function Mojito () {
    window.location.href= "Mojito.html"
}
function Fashioned () {
    window.location.href= "Fashioned.html"
}
function Cosmopolitan () {
    window.location.href= "Cosmopolitan.html"
}
