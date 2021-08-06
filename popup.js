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

function getDefaultCardNumber(cardType) {
    switch(cardType) {
        case 'mercury-gift':
            return '12345';
        case 'emagine-gift':
            return '2222';
        case 'spoton-loyalty':
            return '3333';
        case 'dishout-gift':
            return '4444';
        case 'dineloyal-loyalty':
            return '5555';
    }
}

// When the button is clicked, inject setPageBackgroundColor into current page
submitSwipeBtn.addEventListener("click", async () => {
    alert(cardOptions.value);
    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    //
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: swipeCard,
    // });
});
