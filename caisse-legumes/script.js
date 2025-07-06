// État global de l'application
let cart = [];
let currentProduct = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    updateHeaderStats();
});

// Ajouter un produit au panier
function addToCart(id, name, pricePerKg) {
    currentProduct = { id, name, pricePerKg };
    openWeightModal();
}

// Ouvrir la modal de poids
function openWeightModal() {
    const modal = document.getElementById('weightModal');
    const productDisplay = document.getElementById('selectedProduct');
    
    productDisplay.textContent = `${currentProduct.name} - ${currentProduct.pricePerKg} FCFA/kg`;
    document.getElementById('weight').value = '1';
    modal.classList.add('active');
    document.getElementById('weight').focus();
}

// Fermer la modal de poids
function closeWeightModal() {
    document.getElementById('weightModal').classList.remove('active');
    currentProduct = null;
}

// Confirmer l'ajout avec le poids
function confirmWeight() {
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (weight <= 0) {
        alert('Veuillez saisir un poids valide');
        return;
    }
    
    const totalPrice = currentProduct.pricePerKg * weight;
    
    // Vérifier si le produit existe déjà
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.weight += weight;
        existingItem.totalPrice = existingItem.pricePerKg * existingItem.weight;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            pricePerKg: currentProduct.pricePerKg,
            weight: weight,
            totalPrice: totalPrice
        });
    }
    
    updateCartDisplay();
    updateHeaderStats();
    closeWeightModal();
    
    // Animation de feedback
    showAddedFeedback();
}

// Afficher feedback d'ajout
function showAddedFeedback() {
    // Créer un élément de notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '✅ Produit ajouté au panier';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Mettre à jour l'affichage du panier
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Panier vide</p>
                <small>Sélectionnez des produits</small>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-details">
                    ${item.weight}kg × ${item.pricePerKg} FCFA = ${item.totalPrice.toLocaleString()} FCFA
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="adjustWeight('${item.id}', -0.1)">-</button>
                    <span class="quantity">${item.weight}kg</span>
                    <button class="quantity-btn" onclick="adjustWeight('${item.id}', 0.1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        </div>
    `).join('');
}

// Ajuster le poids d'un produit
function adjustWeight(id, adjustment) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.weight = Math.max(0.1, Math.round((item.weight + adjustment) * 10) / 10);
        item.totalPrice = item.pricePerKg * item.weight;
        updateCartDisplay();
        updateHeaderStats();
    }
}

// Supprimer un produit du panier
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
    updateHeaderStats();
}

// Vider le panier
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
        cart = [];
        updateCartDisplay();
        updateHeaderStats();
    }
}

// Mettre à jour les statistiques du header
function updateHeaderStats() {
    const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemsCount = cart.length;
    
    document.getElementById('totalAmount').textContent = totalAmount.toLocaleString();
    document.getElementById('cartTotal').textContent = totalAmount.toLocaleString();
    document.getElementById('itemsCount').textContent = itemsCount;
    
    // Activer/désactiver le bouton de checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
}

// Traiter la commande
function processCheckout() {
    if (cart.length === 0) {
        alert('Le panier est vide');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemsList = cart.map(item => 
        `• ${item.name}: ${item.weight}kg = ${item.totalPrice.toLocaleString()} FCFA`
    ).join('\n');
    
    const receipt = `
🧾 TICKET DE CAISSE
==================

${itemsList}

==================
TOTAL: ${total.toLocaleString()} FCFA
==================

Merci de votre achat !
    `;
    
    if (confirm(`Confirmer la vente ?\n\n${receipt}`)) {
        // Ici vous pouvez ajouter l'intégration avec votre système de caisse
        alert('Vente enregistrée avec succès !');
        
        // Vider le panier après la vente
        cart = [];
        updateCartDisplay();
        updateHeaderStats();
        
        // Optionnel: imprimer le reçu
        printReceipt(receipt);
    }
}

// Imprimer le reçu (optionnel)
function printReceipt(receipt) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Reçu de caisse</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    pre { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <pre>${receipt}</pre>
                <script>window.print(); window.close();</script>
            </body>
        </html>
    `);
}

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Échap pour fermer la modal
    if (e.key === 'Escape') {
        closeWeightModal();
    }
    
    // Entrée pour confirmer dans la modal
    if (e.key === 'Enter' && document.getElementById('weightModal').classList.contains('active')) {
        confirmWeight();
    }
    
    // Ctrl+C pour vider le panier
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        clearCart();
    }
    
    // Ctrl+Enter pour checkout
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        processCheckout();
    }
});

// Formatage automatique du champ poids
document.getElementById('weight').addEventListener('input', function(e) {
    let value = parseFloat(e.target.value);
    if (value < 0.1) {
        e.target.value = '0.1';
    }
    if (value > 100) {
        e.target.value = '100';
    }
});
