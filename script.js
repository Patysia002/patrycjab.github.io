document.addEventListener('DOMContentLoaded', () => {

    /* ===================================================
       1. RESPONSYWNE MENU NAWIGACYJNE
       =================================================== */
    const hamburger = document.querySelector('#menu-toggle');
    const menu = document.querySelector('.menu');

    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });

        document.addEventListener('click', (event) => {
            if (!menu.contains(event.target) && !hamburger.contains(event.target) && menu.classList.contains('active')) {
                menu.classList.remove('active');
            }
        });
    }

    /* ===================================================
       2. INTERAKTYWNY KALKULATOR (kalkulator.html)
       =================================================== */
    const kalkulatorForm = document.querySelector('#formularz-kalkulator');
    if (kalkulatorForm) {
        kalkulatorForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const osoby = parseInt(document.querySelector('#liczba-osob').value) || 1;
            const maZmywarke = document.querySelector('input[name="zmywarka"]:checked').value === 'tak';
            const segreguje = document.querySelector('input[name="segregacja"]:checked').value === 'tak';
            const procentLed = parseInt(document.querySelector('#zarowki').value);

            let oszczednoscWodyLitry = !maZmywarke ? osoby * 7000 : osoby * 1500;
            let zyskZlotych = (oszczednoscWodyLitry / 1000) * 12;

            let oszczednoscPraduKwh = 0;
            if (procentLed === 0) oszczednoscPraduKwh += osoby * 120;
            else if (procentLed === 50) oszczednoscPraduKwh += osoby * 60;
            else oszczednoscPraduKwh += osoby * 15;
            zyskZlotych += oszczednoscPraduKwh * 1.15;

            if (segreguje) zyskZlotych += osoby * 180;

            document.querySelector('#wynik-woda').textContent = `${oszczednoscWodyLitry.toLocaleString('pl-PL')} litrów`;
            document.querySelector('#wynik-prad').textContent = `${oszczednoscPraduKwh.toLocaleString('pl-PL')} kWh`;
            document.querySelector('#wynik-pieniadze').textContent = `ok. ${Math.round(zyskZlotych).toLocaleString('pl-PL')} zł`;

            let porada = !segreguje 
                ? '💡 Wskazówka: Rozpoczęcie segregacji bioodpadów i plastiku natychmiast obniży Twoje opłaty komunalne!'
                : (!maZmywarke 
                    ? '💡 Wskazówka: Montaż perlatorów na kranach w kuchni i łazience pozwoli zaoszczędzić nawet kilkaset złotych rocznie.'
                    : '🌿 Świetna robota! Twoje gospodarstwo już stosuje dobre eko-praktyki.');

            document.querySelector('#wynik-wskazowka').textContent = porada;

            const wynikKontener = document.querySelector('#wynik-kalkulatora');
            wynikKontener.style.display = 'block';
            wynikKontener.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ===================================================
       3. INTERAKTYWNY KOSZYK SKLEPU (sklep.html)
       =================================================== */
    // Odczytujemy zapisany koszyk z pamięci przeglądarki (lub pustą tablicę)
    let cart = JSON.parse(localStorage.getItem('ekodom_cart')) || [];

    const cartCounter = document.querySelector('#cart-counter');
    const cartList = document.querySelector('#cart-list');
    const emptyMsg = document.querySelector('#empty-cart-msg');
    const cartSummary = document.querySelector('#cart-summary');
    const totalPriceEl = document.querySelector('#cart-total-price');
    const clearCartBtn = document.querySelector('#btn-clear-cart');
    const checkoutBtn = document.querySelector('#btn-checkout');

    // Funkcja odświeżająca widok koszyka
    function updateCartUI() {
        // Oblicz łączną liczbę sztuk
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItemsCount;
        }

        // Jeśli jesteśmy na podstronie z panelem koszyka
        if (cartList) {
            cartList.innerHTML = '';

            if (cart.length === 0) {
                if (emptyMsg) emptyMsg.style.display = 'block';
                if (cartSummary) cartSummary.style.display = 'none';
            } else {
                if (emptyMsg) emptyMsg.style.display = 'none';
                if (cartSummary) cartSummary.style.display = 'block';

                let totalAmount = 0;

                cart.forEach(item => {
                    totalAmount += item.price * item.quantity;

                    const li = document.createElement('li');
                    li.className = 'cart-item';
                    li.innerHTML = `
                        <div class="cart-item-info">
                            <span class="cart-item-title">${item.name}</span>
                            <span class="cart-item-qty">${item.quantity} szt. × ${item.price.toFixed(2)} zł</span>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}" title="Usuń z koszyka">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                    cartList.appendChild(li);
                });

                if (totalPriceEl) {
                    totalPriceEl.textContent = `${totalAmount.toFixed(2)} zł`;
                }

                // Obsługa przycisków usuwania pojedynczego produktu
                cartList.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idToRemove = btn.getAttribute('data-id');
                        removeFromCart(idToRemove);
                    });
                });
            }
        }

        // Zapis stanu w pamięci podręcznej przeglądarki
        localStorage.setItem('ekodom_cart', JSON.stringify(cart));
    }

    // Dodanie produktu do koszyka
    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price: parseFloat(price), quantity: 1 });
        }

        updateCartUI();
    }

    // Usunięcie produktu z koszyka
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // Nasłuchiwanie przycisków "Dodaj do koszyka"
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const id = card.getAttribute('data-id');
                const name = card.getAttribute('data-name');
                const price = card.getAttribute('data-price');
                
                addToCart(id, name, price);

                // Wizualny efekt potwierdzenia kliknięcia
                const originalText = button.textContent;
                button.textContent = '✓ Dodano!';
                button.style.backgroundColor = '#2e6931';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                }, 1000);
            }
        });
    });

    // Czyszczenie koszyka
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
        });
    }

    // Przejście do kasy
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Dziękujemy za złożenie zamówienia w EkoDom! Twój koszyk został zrealizowany.');
            cart = [];
            updateCartUI();
        });
    }

    // Pierwsze załadowanie stanu koszyka po wejściu na stronę
    updateCartUI();

});