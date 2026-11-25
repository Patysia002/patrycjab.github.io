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

document.addEventListener('DOMContentLoaded', () => {

    /* ===================================================
       INTERAKTYWNA SEGREGACJA ODPADÓW (Z pułapkami i zmieszanymi)
       =================================================== */
    const bazaOdpadow = {
        papier: {
            tytuł: "📦 Niebieski kosz – Papier",
            elementy: ["Gazety, czasopisma i ulotki", "Karton i tektura", "Zeszyty i papier biurowy", "Papierowe torby i pakunki"],
            pulapki: ["Tłusty papier po pizzy", "Paragony z kas fiskalnych (papier termiczny)", "Zużyte ręczniki papierowe i chusteczki higieniczne", "Kartony po mleku i sokach (to tetrapak -> do żółtego!)"]
        },
        plastik: {
            tytuł: "♻️ Żółty kosz – Tworzywa sztuczne i metal",
            elementy: ["Butelki PET po napojach", "Plastikowe nakrętki", "Puszki aluminiowe i po konserwach", "Kartony po mleku i sokach (tetrapak)", "Plastikowe opakowania po kosmetykach"],
            pulapki: ["Zużyte baterie i akumulatory (niebezpieczne odpady!)", "Mała elektronika i sprzęt AGD", "Zabrudzony olejem styropian gastronomiczny", "Pampersy i artykuły higieniczne"]
        },
        szklo: {
            tytuł: "🍾 Zielony kosz – Szkło",
            elementy: ["Szklane butelki po napojach i oliwie", "Szklane słoiki (bez nakrętek)", "Szklane flakony po perfumach"],
            pulapki: ["Ceramika, fajans i porcelana", "Żarówki i świetlówki", "Szkło okularowe i żaroodporne", "Lustra i szyby samochodowe"]
        },
        bio: {
            tytuł: "🍎 Brązowy kosz – Bioodpady",
            elementy: ["Obierki warzyw i owoców", "Fusy po kawie i herbacie", "Skorupki jaj", "Zwiędłe kwiaty i liście", "Resztki jedzenia roślinnego"],
            pulapki: ["Kości, mięso i ości ryb (przyciągają szkodniki)", "Odchody zwierząt domowych", "Leki i chemia", "Ziemia w doniczkach i kamienie"]
        },
        zmieszane: {
            tytuł: "⚫ Czarny kosz – Odpady zmieszane (reszta, której nie da się odzyskać)",
            elementy: ["Zużyte artykuły higieniczne (pieluchy, chusteczki nawilżane)", "Zawilgocony lub mocno zabrudzony papier", "Potłucena ceramika i żarówki", "Zwykłe worki po odkurzaczu i zimny popiół z pieca"],
            pulapki: ["Sprzęt elektryczny i elektronika (musi trafić do PSZOK!)", "Baterie i akumulatory", "Leki przeterminowane (oddajemy do apteki)", "Odpady budowlane i gruz"]
        }
    };

    const koszButtons = document.querySelectorAll('.kosz-btn');
    const wynikSegregacji = document.querySelector('#wynik-segregacji');
    const tytulKosza = document.querySelector('#tytul-kosza');
    const listaOdpadow = document.querySelector('#lista-odpadow');
    const listaPulapek = document.querySelector('#lista-pulapek');

    if (koszButtons.length > 0 && wynikSegregacji && tytulKosza && listaOdpadow && listaPulapek) {
        koszButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                koszButtons.forEach(b => b.classList.remove('aktywny'));
                btn.classList.add('aktywny');

                const kategoria = btn.getAttribute('data-kosz');
                const dane = bazaOdpadow[kategoria];

                if (dane) {
                    tytulKosza.textContent = dane.tytuł;
                    
                    // Wypełnienie listy dozwolonych odpadów
                    listaOdpadow.innerHTML = '';
                    dane.elementy.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        listaOdpadow.appendChild(li);
                    });

                    // Wypełnienie listy pułapek (czego NIE wrzucać)
                    listaPulapek.innerHTML = '';
                    dane.pulapki.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        listaPulapek.appendChild(li);
                    });

                    wynikSegregacji.style.display = 'block';
                    wynikSegregacji.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

});
/* ===================================================
       2. RUCHOMA GALERIA (SLIDER)
       =================================================== */
    let slideIndex = 1;
    showSlides(slideIndex);

    // Automatyczna zmiana co 4 sekundy
    setInterval(() => {
        plusSlides(1);
    }, 6000);

    // Globalne funkcje do strzałek (przypisane do window, by działały z onclick w HTML)
    window.plusSlides = function(n) {
        showSlides(slideIndex += n);
    }

    function showSlides(n) {
        let slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        slides.forEach(slide => slide.style.display = 'none');
        slides[slideIndex - 1].style.display = 'block';
    }
;

document.addEventListener("DOMContentLoaded", () => {
    const dniTygodnia = [
        "Niedziela", "Poniedziałek", "Wtorek", "Środa",
        "Czwartek", "Piątek", "Sobota"
    ];

    function formatujDzien(dataISO) {
        const d = new Date(dataISO);
        return `${dniTygodnia[d.getDay()]} (${d.toLocaleDateString("pl-PL")})`;
    }

    const dzisiajEl = document.querySelector("#dzisiaj-info");
    if (dzisiajEl) {
        dzisiajEl.textContent = `Dzisiaj jest: ${formatujDzien(new Date().toISOString())}`;
    }

    const listaObiektow = document.querySelector("#listaObiektow");
    const pogoda = document.querySelector("#pogoda");
    const mapaEl = document.querySelector("#mapa");

    let mapa = null;
    let marker = null;

    if (mapaEl && typeof L !== "undefined") {
        mapa = L.map("mapa").setView([52.0, 19.0], 6);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap"
        }).addTo(mapa);
    }

    fetch("assets/data/eko-obiekty.json")
        .then(res => res.json())
        .then(obiekty => {
            if (listaObiektow && pogoda) {
                listaObiektow.innerHTML = "";
                obiekty.forEach(obiekt => {
                    const li = document.createElement("li");
                    li.textContent = `${obiekt.nazwa} (${obiekt.wojewodztwo})`;
                    li.style.cursor = "pointer";

                    li.addEventListener("click", () => {
                        document.querySelectorAll("#listaObiektow li").forEach(el => el.classList.remove("wybrany"));
                        li.classList.add("wybrany");
                        pogoda.innerHTML = "<p>Ładowanie danych...</p>";

                        if (mapa) {
                            if (marker) mapa.removeLayer(marker);
                            marker = L.marker([obiekt.lat, obiekt.lon])
                                .addTo(mapa)
                                .bindPopup(`<strong>${obiekt.nazwa}</strong><br>Województwo: ${obiekt.wojewodztwo}<br>Siedziba: ${obiekt.siedziba}`);
                            marker.openPopup();
                            mapa.setView([obiekt.lat, obiekt.lon], 10);
                        }

                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${obiekt.lat}&longitude=${obiekt.lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=3`;

                        fetch(url)
                            .then(r => r.json())
                            .then(data => {
                                pogoda.innerHTML = `
                                    <h3>${obiekt.nazwa}</h3>
                                    <p><strong>Województwo:</strong> ${obiekt.wojewodztwo}</p>
                                    <p><strong>Siedziba:</strong> ${obiekt.siedziba}</p>
                                    <hr>
                                    <h4>Aktualna pogoda</h4>
                                    <p><strong>Temperatura:</strong> ${data.current.temperature_2m} °C</p>
                                    <p><strong>Prędkość wiatru:</strong> ${data.current.wind_speed_10m} km/h</p>
                                    <hr>
                                    <h4>Prognoza na 3 dni</h4>
                                    <table>
                                        <tr><th>Data</th><th>Min</th><th>Max</th><th>Opady</th></tr>
                                        <tr>
                                            <td>${formatujDzien(data.daily.time[0])}</td>
                                            <td>${data.daily.temperature_2m_min[0]} °C</td>
                                            <td>${data.daily.temperature_2m_max[0]} °C</td>
                                            <td>${data.daily.precipitation_sum[0]} mm</td>
                                        </tr>
                                        <tr>
                                            <td>${formatujDzien(data.daily.time[1])}</td>
                                            <td>${data.daily.temperature_2m_min[1]} °C</td>
                                            <td>${data.daily.temperature_2m_max[1]} °C</td>
                                            <td>${data.daily.precipitation_sum[1]} mm</td>
                                        </tr>
                                        <tr>
                                            <td>${formatujDzien(data.daily.time[2])}</td>
                                            <td>${data.daily.temperature_2m_min[2]} °C</td>
                                            <td>${data.daily.temperature_2m_max[2]} °C</td>
                                            <td>${data.daily.precipitation_sum[2]} mm</td>
                                        </tr>
                                    </table>
                                `;
                            })
                            .catch(() => {
                                pogoda.innerHTML = "<p>Nie udało się pobrać danych pogodowych.</p>";
                            });
                    });

                    listaObiektow.appendChild(li);
                });
            }

            const ctxPow = document.getElementById("wykresPowierzchni");
            if (ctxPow && typeof Chart !== "undefined") {
                new Chart(ctxPow, {
                    type: "bar",
                    data: {
                        labels: obiekty.map(o => o.nazwa),
                        datasets: [{
                            label: "Powierzchnia [km²]",
                            data: obiekty.map(o => o.powierzchnia_km2),
                            backgroundColor: "rgba(46, 204, 113, 0.7)",
                            borderColor: "darkgreen",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: "y",
                        responsive: true,
                        plugins: {
                            title: { display: true, text: "Powierzchnia obiektów [km²]" }
                        },
                        maintainAspectRatio: false
                    }
                });
            }
        })
        .catch(err => console.error("Błąd JSON:", err));

    const ctxStat = document.getElementById("wykresSlupkowy");
    if (ctxStat && typeof Chart !== "undefined") {
        new Chart(ctxStat, {
            type: "bar",
            data: {
                labels: ["2023", "2024", "2025"],
                datasets: [{
                    label: "Produkcja miodu [tys. ton]",
                    data: [18.2, 21.5, 23.0],
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
});

