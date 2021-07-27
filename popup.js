// Initialize button with user's preferred color
let submitSwipeBtn = document.getElementById("submit-swipe");
let cardOptions = document.getElementById("cardOptions");

chrome.storage.sync.get("card", ({ color }) => {
    // changeColor.style.backgroundColor = color;
});

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

// The body of this function will be executed as a content script inside the
// current page
function swipeCard() {
    chrome.storage.sync.get("card", ({ color }) => {
        // document.body.style.backgroundColor = color;
    });
}
