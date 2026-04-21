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

/* ===========================
   Load More
   =========================== */
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

/* ===========================
   Articles from JSON
   =========================== */
(function initArticles() {
    document.addEventListener('DOMContentLoaded', function () {
        fetch('articles.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var page = document.body.getAttribute('data-page');
                if (page === 'home') {
                    renderHomePage(data);
                } else if (page === 'category') {
                    var category = document.querySelector('.category-content').getAttribute('data-category');
                    renderCategoryPage(data, category);
                } else if (page === 'article') {
                    renderRelatedSection(data);
                }
            });
    });
})();

/* ---- Helper: create a card for homepage ---- */
function createHomeCard(article) {
    var a = document.createElement('a');
    a.href = article.link;
    a.className = 'card';

    a.innerHTML =
        '<img src="' + article.image + '" alt="' + article.title + '">' +
        '<p class="card-source">' + article.source + '</p>' +
        '<h3 class="card-title">' + article.title + '</h3>' +
        '<p class="card-date">' + article.date + '</p>';

    return a;
}

/* ---- Helper: create a card for category page ---- */
function createCategoryCard(article) {
    var a = document.createElement('a');
    a.href = article.link;
    a.className = 'category-card';

    a.innerHTML =
        '<img src="' + article.image + '" alt="' + article.title + '">' +
        '<p class="card-source">' + article.source + '</p>' +
        '<div class="card-row">' +
            '<h3 class="card-title">' + article.title + '</h3>' +
            '<p class="card-date">' + article.date + '</p>' +
        '</div>';

    return a;
}

/* ---- Helper: create a related card ---- */
function createRelatedCard(article) {
    var a = document.createElement('a');
    a.href = article.link;
    a.className = 'related-card';

    a.innerHTML =
        '<img src="' + article.image + '" alt="' + article.title + '">' +
        '<p class="card-source">' + article.source + '</p>' +
        '<h3 class="card-title">' + article.title + '</h3>' +
        '<p class="card-date">' + article.date + '</p>';

    return a;
}

/* ===========================
   Render: Home Page
   =========================== */
function renderHomePage(data) {
    var main = document.getElementById('home-content');
    if (!main) return;

    // Hero
    var featured = data.featured;
    var heroHTML =
        '<a href="' + featured.link + '" class="hero">' +
            '<div class="hero-image">' +
                '<img src="' + featured.image + '" alt="Featured article image">' +
            '</div>' +
            '<div class="hero-text">' +
                '<h2>' + featured.title + '</h2>' +
                '<p>' + featured.description + '</p>' +
            '</div>' +
        '</a>' +
        '<hr class="section-divider">';
    main.innerHTML = heroHTML;

    // Category sections
    var categories = ['stocks', 'currencies', 'cryptos', 'economics'];
    var categoryLabels = {
        stocks: 'Stocks',
        currencies: 'Currencies',
        cryptos: 'Cryptos',
        economics: 'Economics'
    };

    categories.forEach(function (cat, idx) {
        var section = document.createElement('section');
        section.id = cat;
        section.className = 'category-section';

        var h2 = document.createElement('h2');
        h2.className = 'section-title';
        h2.innerHTML = '<a href="' + cat + '.html">' + categoryLabels[cat] + '</a>';
        section.appendChild(h2);

        var grid = document.createElement('div');
        grid.className = 'card-grid';

        // Show first 4 articles on home page
        var articles = data[cat].slice(0, 4);
        articles.forEach(function (article) {
            grid.appendChild(createHomeCard(article));
        });

        section.appendChild(grid);
        main.appendChild(section);

        // Add divider between sections (not after the last one)
        if (idx < categories.length - 1) {
            var hr = document.createElement('hr');
            hr.className = 'section-divider';
            main.appendChild(hr);
        }
    });
}

/* ===========================
   Render: Category Page
   =========================== */
function renderCategoryPage(data, category) {
    var container = document.querySelector('.category-content');
    if (!container || !data[category]) return;

    var featured = data.featured;
    var articles = data[category];
    var categoryLabels = {
        stocks: 'Stocks',
        currencies: 'Currencies',
        cryptos: 'Cryptos',
        economics: 'Economics'
    };

    // Title
    var title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = categoryLabels[category] || category;
    container.appendChild(title);

    // Hero
    var heroLink = document.createElement('a');
    heroLink.href = featured.link;
    heroLink.className = 'category-hero';
    heroLink.innerHTML =
        '<div class="category-hero-image">' +
            '<img src="' + featured.image + '" alt="Featured ' + category + ' article">' +
        '</div>' +
        '<div class="category-hero-text">' +
            '<h3>' + featured.title + '</h3>' +
            '<p>' + featured.description + '</p>' +
        '</div>';
    container.appendChild(heroLink);

    // Divider
    var hr = document.createElement('hr');
    hr.className = 'section-divider';
    container.appendChild(hr);

    // Main grid (first 4)
    var mainGrid = document.createElement('div');
    mainGrid.className = 'category-grid';
    articles.slice(0, 4).forEach(function (article) {
        mainGrid.appendChild(createCategoryCard(article));
    });
    container.appendChild(mainGrid);

    // Hidden grid (remaining articles, for Load More)
    if (articles.length > 4) {
        var hiddenGrid = document.createElement('div');
        hiddenGrid.className = 'category-grid hidden-cards';
        hiddenGrid.style.display = 'none';
        articles.slice(4).forEach(function (article) {
            hiddenGrid.appendChild(createCategoryCard(article));
        });
        container.appendChild(hiddenGrid);
    }

    // Load More button
    var loadWrap = document.createElement('div');
    loadWrap.className = 'load-more-wrap';
    var loadBtn = document.createElement('button');
    loadBtn.className = 'load-more-btn';
    loadBtn.textContent = 'Load more';
    loadBtn.onclick = function () { loadMore(loadBtn); };
    loadWrap.appendChild(loadBtn);
    container.appendChild(loadWrap);
}

/* ===========================
   Render: Article Related Section
   =========================== */
function renderRelatedSection(data) {
    var grid = document.querySelector('.related-grid');
    if (!grid) return;

    // Determine category from article page (data-category attribute on the related section)
    var section = document.querySelector('.related-section');
    var category = section ? section.getAttribute('data-category') : null;

    if (!category || !data[category]) return;

    // Clear existing hardcoded related cards
    grid.innerHTML = '';

    // Show up to 3 articles from the same category
    var articles = data[category].slice(0, 3);
    articles.forEach(function (article) {
        grid.appendChild(createRelatedCard(article));
    });
}
