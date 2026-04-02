/* Theme toggle */
function toggleTheme() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    updateGrafanaTheme();
}

function updateGrafanaTheme() {
    var theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var iframes = document.querySelectorAll('.grafana-uptime iframe');
    for (var i = 0; i < iframes.length; i++) {
        var src = iframes[i].src;
        iframes[i].src = src.replace(/theme=(dark|light)/, 'theme=' + theme);
    }
}

/* Load saved theme */
(function () {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateGrafanaTheme();
    }
})();

/* GitHub-style contribution graph (simulated) */
(function () {
    const graph = document.getElementById('github-graph');
    if (!graph) return;

    var weeks = 52;
    var days = 7;
    for (var w = 0; w < weeks; w++) {
        var col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '3px';
        for (var d = 0; d < days; d++) {
            var cell = document.createElement('div');
            cell.className = 'gh-cell';
            var r = Math.random();
            var level = 0;
            if (r > 0.55) level = 1;
            if (r > 0.72) level = 2;
            if (r > 0.85) level = 3;
            if (r > 0.93) level = 4;
            cell.setAttribute('data-level', level);
            col.appendChild(cell);
        }
        graph.appendChild(col);
    }
})();

/* Live healthcheck tiles */
(function () {
    var grid = document.getElementById('healthcheck-grid');
    if (!grid) return;

    var services = [
        { name: 'roussev.com', url: 'https://roussev.com' },
        { name: 'grafana', url: 'https://grafana.roussev.com' },
        { name: 'argocd', url: 'https://argo.roussev.com' },
        { name: 'docmost', url: 'https://docs.roussev.com' },
        { name: 'harbor', url: 'https://harbor.roussev.com' },
        { name: 'traefik', url: 'https://traefik.roussev.com' }
    ];

    // Track tile elements
    var tiles = {};

    function createTile(svc, index) {
        var tile = document.createElement('div');
        tile.className = 'hc-tile';
        tile.style.animationDelay = (index * 150) + 'ms';
        tile.innerHTML =
            '<span class="hc-dot pending"></span>' +
            '<span class="hc-name">' + svc.name + '</span>' +
            '<span class="hc-ms">—</span>' +
            '<span class="hc-badge">checking</span>';
        return tile;
    }

    function checkService(svc, index) {
        // Create tile if it doesn't exist yet
        if (!tiles[svc.name]) {
            var tile = createTile(svc, index);
            grid.appendChild(tile);
            tiles[svc.name] = tile;
        }

        var tile = tiles[svc.name];
        var dot = tile.querySelector('.hc-dot');
        var ms = tile.querySelector('.hc-ms');
        var badge = tile.querySelector('.hc-badge');

        // Set to pending state
        dot.className = 'hc-dot pending';
        badge.className = 'hc-badge';
        badge.textContent = '...';

        var start = performance.now();

        fetch(svc.url, { mode: 'no-cors', cache: 'no-store' })
            .then(function () {
                var duration = Math.round(performance.now() - start);
                dot.className = 'hc-dot up';
                ms.textContent = duration + 'ms';
                badge.className = 'hc-badge up';
                badge.textContent = 'UP';
            })
            .catch(function () {
                dot.className = 'hc-dot down';
                ms.textContent = '—';
                badge.className = 'hc-badge down';
                badge.textContent = 'DOWN';
            });
    }

    // Initial check: stagger each service so tiles pop in one by one
    function initialCheck() {
        services.forEach(function (svc, i) {
            setTimeout(function () {
                checkService(svc, i);
            }, i * 300);
        });
    }

    // Recurring checks every 5 seconds, staggered
    function recurringCheck() {
        services.forEach(function (svc, i) {
            setTimeout(function () {
                checkService(svc, i);
            }, i * 200);
        });
    }

    initialCheck();
    setInterval(recurringCheck, 5000);
})();
