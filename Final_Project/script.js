/* ===========================
   Seamless Ticker
   =========================== */
(function initTicker() {
    document.addEventListener('DOMContentLoaded', function () {
        var track = document.querySelector('.ticker-track');
        if (!track) return;

        var items = Array.from(track.children);
        if (items.length === 0) return;

        var setWidth = 0;
        items.forEach(function (item) {
            setWidth += item.offsetWidth;
        });

        var viewportWidth = window.innerWidth;
        var copies = Math.ceil((viewportWidth * 2) / setWidth) + 1;

        for (var i = 0; i < copies; i++) {
            items.forEach(function (item) {
                track.appendChild(item.cloneNode(true));
            });
        }

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
   Helper: Article link with ID
   =========================== */
function getArticleLink(article) {
    return 'article.html?id=' + article.id;
}

/* ===========================
   Helper: Find article by ID
   =========================== */
function findArticleById(data, id) {
    if (data.featured.id === id) return data.featured;
    var categories = ['stocks', 'currencies', 'cryptos', 'economics'];
    for (var i = 0; i < categories.length; i++) {
        var articles = data[categories[i]];
        for (var j = 0; j < articles.length; j++) {
            if (articles[j].id === id) return articles[j];
        }
    }
    return null;
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
                    renderArticlePage(data);
                }
            });
    });
})();

/* ---- Card creators ---- */
function createHomeCard(article) {
    var a = document.createElement('a');
    a.href = getArticleLink(article);
    a.className = 'card';
    a.innerHTML =
        '<img src="' + article.image + '" alt="' + article.title + '">' +
        '<p class="card-source">' + article.source + '</p>' +
        '<h3 class="card-title">' + article.title + '</h3>' +
        '<p class="card-date">' + article.date + '</p>';
    return a;
}

function createCategoryCard(article) {
    var a = document.createElement('a');
    a.href = getArticleLink(article);
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

function createRelatedCard(article) {
    var a = document.createElement('a');
    a.href = getArticleLink(article);
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

    var featured = data.featured;
    main.innerHTML =
        '<a href="' + getArticleLink(featured) + '" class="hero">' +
            '<div class="hero-image"><img src="' + featured.image + '" alt="Featured article image"></div>' +
            '<div class="hero-text">' +
                '<h2>' + featured.title + '</h2>' +
                '<p>' + featured.description + '</p>' +
            '</div>' +
        '</a><hr class="section-divider">';

    var categories = ['stocks', 'currencies', 'cryptos', 'economics'];
    var labels = { stocks: 'Stocks', currencies: 'Currencies', cryptos: 'Cryptos', economics: 'Economics' };

    categories.forEach(function (cat, idx) {
        var section = document.createElement('section');
        section.id = cat;
        section.className = 'category-section';

        var h2 = document.createElement('h2');
        h2.className = 'section-title';
        h2.innerHTML = '<a href="' + cat + '.html">' + labels[cat] + '</a>';
        section.appendChild(h2);

        var grid = document.createElement('div');
        grid.className = 'card-grid';
        data[cat].slice(0, 4).forEach(function (article) {
            grid.appendChild(createHomeCard(article));
        });
        section.appendChild(grid);
        main.appendChild(section);

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
    var labels = { stocks: 'Stocks', currencies: 'Currencies', cryptos: 'Cryptos', economics: 'Economics' };

    var title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = labels[category] || category;
    container.appendChild(title);

    var heroLink = document.createElement('a');
    heroLink.href = getArticleLink(featured);
    heroLink.className = 'category-hero';
    heroLink.innerHTML =
        '<div class="category-hero-image"><img src="' + featured.image + '" alt="Featured article"></div>' +
        '<div class="category-hero-text">' +
            '<h3>' + featured.title + '</h3>' +
            '<p>' + featured.description + '</p>' +
        '</div>';
    container.appendChild(heroLink);

    var hr = document.createElement('hr');
    hr.className = 'section-divider';
    container.appendChild(hr);

    var mainGrid = document.createElement('div');
    mainGrid.className = 'category-grid';
    articles.slice(0, 4).forEach(function (article) {
        mainGrid.appendChild(createCategoryCard(article));
    });
    container.appendChild(mainGrid);

    if (articles.length > 4) {
        var hiddenGrid = document.createElement('div');
        hiddenGrid.className = 'category-grid hidden-cards';
        hiddenGrid.style.display = 'none';
        articles.slice(4).forEach(function (article) {
            hiddenGrid.appendChild(createCategoryCard(article));
        });
        container.appendChild(hiddenGrid);
    }

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
   Render: Article Page
   =========================== */
function renderArticlePage(data) {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) return;

    var article = findArticleById(data, id);
    if (!article) return;

    var labels = { stocks: 'STOCKS', currencies: 'CURRENCIES', cryptos: 'CRYPTOS', economics: 'ECONOMICS' };

    // Update page title
    document.title = article.title + ' — FinanceDaily';

    // Render article body
    var articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    var contentHTML = '';
    article.content.forEach(function (para) {
        contentHTML += '<p>' + para + '</p>';
    });

    articleBody.innerHTML =
        '<p class="article-category">' + (labels[article.category] || article.category) + '</p>' +
        '<h1 class="article-title">' + article.title + '</h1>' +
        '<div class="article-meta">' +
            '<div class="article-meta-left">' +
                '<span class="article-author">' + article.author + '</span>' +
                '<span class="article-date">' + article.date + '</span>' +
            '</div>' +
            '<div class="article-social">' +
                '<a href="#" aria-label="Twitter">&#x1D54F;</a>' +
                '<a href="#" aria-label="Facebook">f</a>' +
                '<a href="#" aria-label="Email">✉</a>' +
                '<a href="#" aria-label="Share">⎘</a>' +
            '</div>' +
        '</div>' +
        '<div class="article-content">' + contentHTML + '</div>';

    // Render related section
    var relatedGrid = document.querySelector('.related-grid');
    var relatedSection = document.querySelector('.related-section');
    if (relatedGrid && article.category && data[article.category]) {
        // Update data-category
        relatedSection.setAttribute('data-category', article.category);
        relatedGrid.innerHTML = '';
        // Show up to 3 articles from same category, excluding current article
        var related = data[article.category].filter(function (a) { return a.id !== article.id; }).slice(0, 3);
        related.forEach(function (a) {
            relatedGrid.appendChild(createRelatedCard(a));
        });
    }

    // Highlight correct nav item
    var navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === article.category + '.html') {
            link.classList.add('active');
        }
    });
}
