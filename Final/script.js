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
                } else if (page === 'search') {
                    renderSearchPage(data);
                }
            })
            .catch(function (err) {
                console.error('Failed to load articles.json:', err);
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
   Render: Search Page
   =========================== */
function renderSearchPage(data) {
    var searchForm = document.getElementById('search-form');
    var searchInput = document.getElementById('search-input');
    var headingEl = document.getElementById('search-heading');
    var countEl = document.getElementById('search-count');
    var sortEl = document.getElementById('search-sort');
    var resultsList = document.getElementById('search-results');
    var sortBtns = document.querySelectorAll('.sort-btn');
    var categoryRadios = document.querySelectorAll('input[name="category"]');
    var sourceFiltersEl = document.getElementById('source-filters');

    if (!searchForm || !searchInput) return;

    var categoryLabels = { stocks: 'Stocks', currencies: 'Currencies', cryptos: 'Cryptos', economics: 'Economics' };

    // Gather all articles
    var allArticles = [];
    allArticles.push(data.featured);
    ['stocks', 'currencies', 'cryptos', 'economics'].forEach(function (cat) {
        data[cat].forEach(function (article) { allArticles.push(article); });
    });

    // Extract unique sources for source filter
    var sources = [];
    allArticles.forEach(function (a) {
        if (a.source && sources.indexOf(a.source) === -1) sources.push(a.source);
    });
    sources.sort();

    // Build source checkboxes (with All toggle on top)
    if (sourceFiltersEl) {
        var allLabel = document.createElement('label');
        allLabel.className = 'filter-option';
        allLabel.innerHTML = '<input type="checkbox" id="source-all" checked> All sources';
        sourceFiltersEl.appendChild(allLabel);

        sources.forEach(function (src) {
            var label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = '<input type="checkbox" name="source" value="' + src + '" checked> ' + src;
            sourceFiltersEl.appendChild(label);
        });
    }

    var currentSort = 'newest';
    var currentQuery = '';

    // Parse date string to sortable value
    function parseDate(dateStr) {
        var d = new Date(dateStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    // Check URL query param on load
    var urlParams = new URLSearchParams(window.location.search);
    var initialQ = urlParams.get('q');
    if (initialQ) {
        searchInput.value = initialQ;
        currentQuery = initialQ.trim().toLowerCase();
        performSearch();
    } else {
        // Show initial state
        resultsList.innerHTML =
            '<div class="search-initial">' +
                '<h3>Search FinanceDaily</h3>' +
                '<p>Search by article title, author, source, or keywords.</p>' +
            '</div>';
    }

    // Form submit
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        currentQuery = searchInput.value.trim().toLowerCase();
        // Update URL without reload
        var newUrl = 'search.html' + (currentQuery ? '?q=' + encodeURIComponent(searchInput.value.trim()) : '');
        history.replaceState(null, '', newUrl);
        performSearch();
    });

    // Sort buttons
    sortBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            sortBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentSort = btn.getAttribute('data-sort');
            performSearch();
        });
    });

    // Category filter
    categoryRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            performSearch();
        });
    });

    // Source filter
    if (sourceFiltersEl) {
        sourceFiltersEl.addEventListener('change', function (e) {
            var allCb = document.getElementById('source-all');
            var sourceCbs = sourceFiltersEl.querySelectorAll('input[name="source"]');
            if (e.target === allCb) {
                sourceCbs.forEach(function (cb) { cb.checked = allCb.checked; });
            } else if (e.target && e.target.name === 'source') {
                var allChecked = true;
                sourceCbs.forEach(function (cb) { if (!cb.checked) allChecked = false; });
                if (allCb) allCb.checked = allChecked;
            }
            performSearch();
        });
    }

    function performSearch() {
        if (!currentQuery) {
            headingEl.innerHTML = '';
            countEl.textContent = '';
            sortEl.style.display = 'none';
            resultsList.innerHTML =
                '<div class="search-initial">' +
                    '<h3>Search FinanceDaily</h3>' +
                    '<p>Search by article title, author, source, or keywords.</p>' +
                '</div>';
            return;
        }

        // Get active category
        var activeCategory = 'all';
        categoryRadios.forEach(function (r) { if (r.checked) activeCategory = r.value; });

        // Get active sources
        var activeSources = [];
        var sourceCheckboxes = document.querySelectorAll('input[name="source"]:checked');
        sourceCheckboxes.forEach(function (cb) { activeSources.push(cb.value); });

        // Filter
        var filtered = allArticles.filter(function (article) {
            // Category
            if (activeCategory !== 'all' && article.category !== activeCategory) return false;
            // Source
            if (activeSources.length > 0 && activeSources.indexOf(article.source) === -1) return false;
            // Text search
            var title = (article.title || '').toLowerCase();
            var source = (article.source || '').toLowerCase();
            var author = (article.author || '').toLowerCase();
            var desc = (article.description || '').toLowerCase();
            var content = (article.content || []).join(' ').toLowerCase();
            return title.indexOf(currentQuery) !== -1 ||
                   source.indexOf(currentQuery) !== -1 ||
                   author.indexOf(currentQuery) !== -1 ||
                   desc.indexOf(currentQuery) !== -1 ||
                   content.indexOf(currentQuery) !== -1;
        });

        // Sort
        filtered.sort(function (a, b) {
            var da = parseDate(a.date);
            var db = parseDate(b.date);
            return currentSort === 'newest' ? db - da : da - db;
        });

        // Update heading
        headingEl.innerHTML = 'Viewing results for <em>"' + searchInput.value.trim() + '"</em>';
        countEl.textContent = filtered.length + ' of ' + allArticles.length + ' articles';
        sortEl.style.display = '';

        // Render results
        resultsList.innerHTML = '';

        if (filtered.length === 0) {
            resultsList.innerHTML =
                '<div class="no-results">' +
                    '<h3>No articles found</h3>' +
                    '<p>Try adjusting your search or filter criteria.</p>' +
                '</div>';
            return;
        }

        var ITEMS_PER_PAGE = 5;
        var shownCount = 0;

        function renderBatch() {
            var end = Math.min(shownCount + ITEMS_PER_PAGE, filtered.length);
            for (var i = shownCount; i < end; i++) {
                var article = filtered[i];
                var a = document.createElement('a');
                a.href = getArticleLink(article);
                a.className = 'search-result-item';

                var descText = '';
                if (article.description) {
                    descText = article.description;
                } else if (article.content && article.content.length > 0) {
                    descText = article.content[0];
                }

                a.innerHTML =
                    '<div class="search-result-image"><img src="' + article.image + '" alt="' + article.title + '"></div>' +
                    '<div class="search-result-content">' +
                        '<p class="search-result-category">' + (categoryLabels[article.category] || article.category) + '</p>' +
                        '<h3 class="search-result-title">' + article.title + '</h3>' +
                        '<p class="search-result-desc">' + descText + '</p>' +
                        '<p class="search-result-date">' + article.date + '</p>' +
                    '</div>';

                resultsList.appendChild(a);
            }
            shownCount = end;

            // Remove existing load-more button
            var existingBtn = resultsList.querySelector('.load-more-btn');
            if (existingBtn) existingBtn.remove();

            // Add load-more button if more items remain
            if (shownCount < filtered.length) {
                var loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = 'Load More (' + (filtered.length - shownCount) + ' remaining)';
                loadMoreBtn.addEventListener('click', function () {
                    renderBatch();
                });
                resultsList.appendChild(loadMoreBtn);
            }
        }

        renderBatch();
    }
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
    var chartHTML = '';

    // Article hero image at the top of the body
    if (article.image) {
        contentHTML += '<img src="' + article.image + '" alt="' + article.title + '">';
    }

    // TradingView chart for stocks/currencies/cryptos
    if (article.ticker && article.ticker !== 'none') {
        chartHTML =
            '<div class="article-chart-container">' +
                '<div class="tradingview-widget-container" id="article-tv-chart">' +
                    '<div class="tradingview-widget-container__widget"></div>' +
                '</div>' +
            '</div>';
    }

    // Chart.js chart for economics articles
    if (article.chartData) {
        chartHTML =
            '<div class="article-chart-container chartjs-container">' +
                '<h3 class="chart-title">' + article.chartData.title + '</h3>' +
                '<canvas id="economics-chart"></canvas>' +
            '</div>';
    }

    // Insert chart after the 2nd paragraph (middle of content)
    var insertAfter = Math.min(2, Math.floor(article.content.length / 2));
    article.content.forEach(function (para, idx) {
        contentHTML += '<p>' + para + '</p>';
        if (chartHTML && idx === insertAfter - 1) {
            contentHTML += chartHTML;
        }
    });

    articleBody.innerHTML =
        '<p class="article-category">' + (labels[article.category] || article.category) + '</p>' +
        '<h1 class="article-title">' + article.title + '</h1>' +
        '<div class="article-meta">' +
            '<div class="article-meta-left">' +
                '<span class="article-author">' + article.author + '</span>' +
                '<span class="article-date">' + article.date + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="article-content">' + contentHTML + '</div>';

    // Initialize TradingView Advanced Chart widget for stock/currency/crypto articles
    if (article.ticker && article.ticker !== 'none' && !article.chartData) {
        var tvContainer = document.getElementById('article-tv-chart');
        if (tvContainer) {
            var tvScript = document.createElement('script');
            tvScript.type = 'text/javascript';
            tvScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
            tvScript.async = true;
            tvScript.textContent = JSON.stringify({
                "width": "100%",
                "height": "500",
                "symbol": article.ticker,
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "allow_symbol_change": false,
                "support_host": "https://www.tradingview.com"
            });
            tvContainer.appendChild(tvScript);
        }
    }

    // Initialize Chart.js chart for economics articles
    if (article.chartData && typeof Chart !== 'undefined') {
        var canvas = document.getElementById('economics-chart');
        if (canvas) {
            var cd = article.chartData;
            var datasets = cd.datasets.map(function (ds) {
                var config = {
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.backgroundColor,
                    borderWidth: 2,
                    tension: 0.3
                };
                if (ds.borderColor) {
                    config.borderColor = ds.borderColor;
                    config.fill = true;
                    config.pointRadius = 4;
                    config.pointHoverRadius = 6;
                }
                if (ds.stepped) {
                    config.stepped = true;
                    config.tension = 0;
                }
                return config;
            });
            new Chart(canvas, {
                type: cd.type,
                data: {
                    labels: cd.labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20, usePointStyle: true, font: { size: 13 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: cd.type === 'bar',
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            ticks: { font: { size: 12 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 12 } }
                        }
                    }
                }
            });
        }
    }

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
