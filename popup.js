// Initialize button with user's preferred color
let submitSwipeBtn = document.getElementById("submit-swipe");
let submitScanBtn = document.getElementById("submit-scan");
let cardOptions = document.getElementById("cardOptions");
let cardNumberInput = document.getElementById("card-number");
let mercuryPrefix = document.getElementById('mercury-prefix');

cardOptions.onchange = async function() {
    let card = newCard(this.value);

    await loadCardNumber(card);

    if (!card.supportsScan()) {
        submitScanBtn.disabled = true;
        submitScanBtn.classList.add('disabled');
    } else {
        submitScanBtn.disabled = false;
        submitScanBtn.classList.remove('disabled');
    }

    if (card.getKey() === MercuryCard.key) {
        mercuryPrefix.style.display = 'block';
        populateMercuryPrefix(card);
    } else {
        mercuryPrefix.style.display = 'none';
    }
};

window.onload = async function(){
    await selectCardType();

    let card = newCard(cardOptions.value);

    if (!card.supportsScan()) {
        submitScanBtn.disabled = true;
        submitScanBtn.classList.add('disabled');
    } else {
        submitScanBtn.disabled = false;
        submitScanBtn.classList.remove('disabled');
    }

    if (card.getKey() === MercuryCard.key) {
        mercuryPrefix.style.display = 'block';
        populateMercuryPrefix(card);
    } else {
        mercuryPrefix.style.display = 'none';
    }

    await loadCardNumber(card);
};

class Card {
    getDefaultCardNumber() {
        return "123456";
    }

    supportsScan() {
        return false;
    }

    async performSwipe(code) {
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
}

class MercuryCard extends Card {
    static key = "mercury-gift";

    constructor() {
        super();
    }

    getKey() {
        return MercuryCard.key;
    }

    swipe(cardNumber) {
        chrome.storage.local.set({
            cardNumberMercury: cardNumber,
            mercuryPrefix: mercuryPrefix.value,
            cardType: MercuryCard.key,
        }, () => {
            swipe(`;${mercuryPrefix.value}=1234abcdef${cardNumber}?`);
        });
    }

    getDefaultPrefix() {
        return '9999';
    }

    getDefaultCardNumber() {
       return "123456";
    }
}

class SpotOnLoyaltyCard extends Card {
    parent = Card.prototype;
    static key = 'spoton-loyalty';

    constructor() {
        super();
    }

    supportsScan() {
       return true;
    }

    getKey() {
        return DishoutCard.key;
    }

    swipe(cardNumber) {
        chrome.storage.local.set({
            cardNumberSpotOnLoyalty: cardNumber,
            cardType: SpotOnLoyaltyCard.key,
        }, () => {
            this.parent.performSwipe(`%SOLOYALTY:${cardNumber}?`);
        });
    }

    scan(cardNumber) {
        chrome.storage.local.set({
            cardNumberScanSpotOnLoyalty: cardNumber,
            cardType: this.key,
        }, () => {
            this.parent.performSwipe(`^{c:${cardNumber},t:'030b04f3520b0ea13008bef0dc063d3'}`);
        });
    }

    getDefaultCardNumber() {
        return "123456789";
    }
}

class EmagineGiftCard extends Card {
    parent = Card.prototype;
    static key = "emagine-gift";

    constructor() {
        super();
    }

    getKey() {
        return DishoutCard.key;
    }

    swipe(cardNumber) {
        chrome.storage.local.set({
            cardNumberDishout: cardNumber,
            cardType: EmagineGiftCard.key,
        }, () => {
            this.parent.performSwipe(`;${cardNumber}?`);
        });
    }

    getDefaultCardNumber() {
        return "123456789";
    }
}

class DineLoyalCard extends Card {
    parent = Card.prototype;
    static key = "dineloyal-loyalty";

    constructor() {
        super();
    }

    getKey() {
        return DishoutCard.key;
    }

    swipe(cardNumber) {
        chrome.storage.local.set({
            cardNumberDineLoyal: cardNumber,
            cardType: DineLoyalCard.key,
        }, function () {
            swipe(`;${cardNumber}?`);
        });
    }

    getDefaultCardNumber() {
        return "123456789";
    }
}

class Barcode extends Card {
    parent = Card.prototype;
    static key = "barcode";

    constructor() {
        super();
    }

    supportsScan() {
        return true;
    }

    getKey() {
        return Barcode.key;
    }

    swipe(barcode) {
        chrome.storage.local.set({
            cardNumberBarcode: barcode,
            cardType: this.key,
        }, () => {
            this.parent.performSwipe(`^${barcode}`);
        });
    }

    scan(barcode) {
        this.parent.performSwipe(`^${barcode}`);
    }

    getDefaultCardNumber() {
        return "123456789";
    }
}

class DishoutCard extends Card {
    parent = Card.prototype;
    static key = "dishout-gift";

    constructor() {
        super();
    }

    getKey() {
        return DishoutCard.key;
    }

    swipe(cardNumber) {
        chrome.storage.local.set({
            cardNumberDishout: cardNumber,
            cardType: DishoutCard.key,
        }, () => {
            this.parent.performSwipe(`;${cardNumber}?`);
        });
    }

    getDefaultCardNumber() {
        return "7000123456789123";
    }
}

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

async function populateMercuryPrefix(card) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['mercuryPrefix'], function (result) {
            if (result.mercuryPrefix !== undefined) {
                mercuryPrefix.value = result.mercuryPrefix;
                resolve(result.mercuryPrefix);
            } else {
                mercuryPrefix.value = card.getDefaultPrefix();
            }
        });
    });
}

async function loadCardNumber(card) {
    cardNumberInput.value = await getDefaultCardNumber(card);
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
                document.body.dispatchEvent(evt);
                document.body.dispatchEvent(evtp);
            };

            code.split('').forEach((c) => {
                typeKey(c);
            });
            typeKey("",  "Enter", 13);
        },
    });
}

function newCard(cardType) {
    switch (cardType) {
        case DishoutCard.key:
            return new DishoutCard();
        case MercuryCard.key:
            return new MercuryCard();
        case SpotOnLoyaltyCard.key:
            return new SpotOnLoyaltyCard();
        case EmagineGiftCard.key:
            return new EmagineGiftCard();
        case DineLoyalCard.key:
            return new DineLoyalCard();
        case Barcode.key:
            return new Barcode();
        default:
            return new Card();
    }
}

async function getDefaultCardNumber(card) {

    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['cardNumber'], function (result) {

            switch (card.getKey()) {
                case DishoutCard.key:
                    if (result.cardNumberDishout !== undefined) {
                        return resolve(result.cardNumberDishout);
                    }
                    return resolve(card.getDefaultCardNumber());
                case MercuryCard.key:
                    if (result.cardNumberMercury !== undefined) {
                        return resolve(result.cardNumberMercury);
                    }
                    return resolve(card.getDefaultCardNumber());
                default:
                    if (result.cardNumber !== undefined) {
                        return resolve(result.cardNumber);
                    }
                    return resolve(card.getDefaultCardNumber());
            }
        });
    });
}

submitSwipeBtn.addEventListener("click", async () => {
    let card = newCard(cardOptions.value);

    card.swipe(cardNumberInput.value);

    submitSwipeBtn.classList.add('clicked');
    window.setTimeout( () => { removeClass(submitSwipeBtn) }, 1500);
});

submitScanBtn.addEventListener("click", async () => {
    let card = newCard(cardOptions.value);

    if (!card.supportsScan()) {
        return;
    }

    card.scan(cardNumberInput.value);

    submitScanBtn.classList.add('clicked');
    window.setTimeout( () => { removeClass(submitScanBtn) }, 1500);
});

function removeClass(button){
    button.classList.remove('clicked');
}
