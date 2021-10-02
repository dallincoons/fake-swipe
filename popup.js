// Initialize button with user's preferred color
let submitSwipeBtn = document.getElementById("submit-swipe");
let submitScanBtn = document.getElementById("submit-scan");
let cardOptions = document.getElementById("cardOptions");
let cardNumberInput = document.getElementById("card-number");

cardOptions.onchange = async function() {
    await loadCardNumber(this.value);
};

window.onload = async function(){
    await selectCardType()
    await loadCardNumber(cardOptions.value);
};

async function selectCardType() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['cardType'], function (result) {
            if (result.cardType !== undefined) {
                cardOptions.value = result.cardType;
                resolve(result.cardType);
            }
        });
    });
}

async function loadCardNumber(cardType) {
    cardNumberInput.value = await getDefaultCardNumber(cardType);
}

function swipeMercury(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
        cardType: 'mercury-gift',
    }, function () {
        swipe(`;1234=1234abc${cardNumber}?`);
    });
}

function swipeSpoton(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
        cardType: 'spoton-loyalty',
    }, function () {
        swipe(`%SOLOYALTY:${cardNumber}?`);
    });
}

function scanSpoton(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
    }, function () {
        swipe(`^{c:${cardNumber},t:'030b04f3520b0ea13008bef0dc063d3'}`);
    });
}

function scanBarcode(barcode) {
    swipe(`^${barcode}`);
}

function swipeEmagine(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
        cardType: 'emagine-gift',
    }, function () {
        swipe(`;${cardNumber}?`);
    });
}

function swipeDishout(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
        cardType: 'dishout-gift',
    }, function () {
        swipe(`;${cardNumber}?`);
    });
}

function swipeDineLoyalLoyalty(cardNumber) {
    chrome.storage.local.set({
        cardNumber: cardNumber,
        cardType: 'dineloyal-loyalty',
    }, function () {
        swipe(`;${cardNumber}?`);
    });
}

function swipeBarcode(barcode) {
    chrome.storage.local.set({
        cardNumber: barcode,
        cardType: 'barcode',
    }, function () {
        swipe(`^${barcode}`);
    });
}

async function swipe(code) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [code],
        function: function(code) {
            let typeKey = function(key, code, keyCode) {
                var evt = new KeyboardEvent("keydown", {key: key, code: code, keyCode: keyCode, which: keyCode, shiftKey: false, bubbles: true})
                var evtp = new KeyboardEvent("keypress", {key: key, code: code, keyCode: keyCode, which: keyCode, shiftKey: false, bubbles: true})
                document.body.dispatchEvent(evt)
                document.body.dispatchEvent(evtp)
            };

            code.split('').forEach((c) => {
                typeKey(c);
            });
            typeKey("",  "Enter", 13);
        },
    });
}

async function getDefaultCardNumber(cardType) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['cardNumber'], function (result) {
            if (result.cardNumber !== undefined) {
                return resolve(result.cardNumber);
            }
            switch (cardType) {
                case 'dishout-gift':
                    return '7000123456789123';
                default:
                    return '12345';
            }
        });
    });
}

submitSwipeBtn.addEventListener("click", async () => {
    switch(cardOptions.value) {
        case 'mercury-gift':
            swipeMercury(cardNumberInput.value);
            break;
        case 'emagine-gift':
            swipeEmagine(cardNumberInput.value);
            break;
        case 'spoton-loyalty':
            swipeSpoton(cardNumberInput.value);
            break;
        case 'dishout-gift':
            swipeDishout(cardNumberInput.value);
            break;
        case 'dineloyal-loyalty':
            swipeDineLoyalLoyalty(cardNumberInput.value);
            break;
        case 'barcode':
            swipeBarcode(cardNumberInput.value);
            break;
    }
    submitSwipeBtn.classList.add('clicked');
    window.setTimeout( () => { removeClass(submitSwipeBtn) }, 1500);
});

submitScanBtn.addEventListener("click", async () => {
    switch(cardOptions.value) {
        case 'mercury-gift':
            break;
        case 'emagine-gift':
            break;
        case 'spoton-loyalty':
            scanSpoton(cardNumberInput.value);
            break;
        case 'dishout-gift':
            break;
        case 'dineloyal-loyalty':
            break;
        case 'barcode':
            scanBarcode(cardNumberInput.value)
    }
    submitScanBtn.classList.add('clicked');
    window.setTimeout( () => { removeClass(submitScanBtn) }, 1500);
});

function removeClass(button){
    button.classList.remove('clicked');
}
