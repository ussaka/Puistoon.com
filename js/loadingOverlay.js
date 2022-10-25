function setLoadingOverlayVisibility(visible) {
    const loadingOverlayDiv = document.getElementById('loading-overlay');
    if (visible) {
        overlayTextStage = 0;
        loadingOverlayDiv.style.visibility = 'visible';
    } else {
        loadingOverlayDiv.style.visibility = 'hidden';
    }
}

setInterval(animateLoadingText, 500);
let overlayTextStage = 0;
function animateLoadingText() {
    const loadingOverlayDiv = document.getElementById('loading-overlay');
    loadingOverlayDiv.innerText = 'Etsitään puistoja';
    for (let i = 0; i < overlayTextStage; i++) {
        loadingOverlayDiv.innerText += ' .';
    }
    overlayTextStage = overlayTextStage > 2 ? 0 : ++overlayTextStage;
}