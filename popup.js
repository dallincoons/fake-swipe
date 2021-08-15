// Initialize button with user's preferred color
let submitSwipeBtn = document.getElementById("submit-swipe");
let cardOptions = document.getElementById("cardOptions");
let cardNumberInput = document.getElementById("card-number");

cardOptions.onchange = function() {
    loadCardNumber(this.value);
};

window.onload=function(){
    loadCardNumber(cardOptions.value);
};

function loadCardNumber(cardType) {
    cardNumberInput.value = getDefaultCardNumber(cardType);
}

function swipeMercury(cardNumber) {
    swipe(cardNumber);
}

function swipeSpoton(cardNumber) {
    swipe(`%SOLOYALTY:${cardNumber}?`);
}

function swipeEmagine(cardNumber) {
    swipe(`;${cardNumber}?`);
}

function swipeDishout(cardNumber) {
    swipe(`;${cardNumber}?`);
}

function swipeDineLoyalLoyalty(cardNumber) {
    swipe(`;${cardNumber}?`);
}

async function swipe(code) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.storage.local.set({
        code: code,
    }, function () {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            // code: 'var config = ' + JSON.stringify(code),
            function: function() {
                chrome.storage.local.get(['code'], function(result) {
                    let typeKey = function(key, code, keyCode) {
                        var evt = new KeyboardEvent("keydown", {key: key, code: code, keyCode: keyCode, which: keyCode, shiftKey: false, bubbles: true})
                        var evtp = new KeyboardEvent("keypress", {key: key, code: code, keyCode: keyCode, which: keyCode, shiftKey: false, bubbles: true})
                        document.body.dispatchEvent(evt)
                        document.body.dispatchEvent(evtp)
                    }

                    result.code.split('').forEach((c) => {
                        typeKey(c);
                    })
                    typeKey("",  "Enter", 13);
                });
            },
        });
    });
}

function getDefaultCardNumber(cardType) {
    switch(cardType) {
    //     case 'mercury-gift':
    //         return '12345';
    //     case 'emagine-gift':
    //         return '2222';
    //     case 'spoton-loyalty':
    //         return '3333';
        case 'dishout-gift':
            return '7000123456789123';
    //     case 'dineloyal-loyalty':
    //         return '5555';
        default:
            return '12345';
    }
}

// When the button is clicked, inject setPageBackgroundColor into current page
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
    }
});
