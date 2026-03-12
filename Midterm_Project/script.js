/* ===========================
   Seamless Ticker
   =========================== */
(function initTicker() {
    document.addEventListener('DOMContentLoaded', function () {
        var track = document.querySelector('.ticker-track');
        if (!track) return;

        // Collect original items
        var items = Array.from(track.children);
        if (items.length === 0) return;

        // Measure one full set width
        var setWidth = 0;
        items.forEach(function (item) {
            setWidth += item.offsetWidth;
        });

        // Calculate how many copies we need so the content is at least 2x the viewport
        var viewportWidth = window.innerWidth;
        var copies = Math.ceil((viewportWidth * 2) / setWidth) + 1;

        // Clone items enough times
        for (var i = 0; i < copies; i++) {
            items.forEach(function (item) {
                track.appendChild(item.cloneNode(true));
            });
        }

        // Set animation distance to exactly one set width via CSS custom property
        track.style.setProperty('--set-width', setWidth + 'px');
    });
})();

function loadMore(btn) {
    var wrap = btn.closest('.category-content') || btn.parentElement.parentElement;
    var mainGrid = wrap.querySelector('.category-grid:not(.hidden-cards)');
    var hiddenGrid = wrap.querySelector('.hidden-cards');

    if (hiddenGrid) {
        while (hiddenGrid.firstElementChild) {
            mainGrid.appendChild(hiddenGrid.firstElementChild);
        }
        hiddenGrid.remove();
        btn.textContent = 'No more articles';
        btn.disabled = true;
    }
}
