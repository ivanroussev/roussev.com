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

(function () {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateGrafanaTheme();
    }
})();

/* GitHub contribution graph (simulated) */
(function () {
    var graph = document.getElementById('github-graph');
    if (!graph) return;
    for (var w = 0; w < 20; w++) {
        var col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '2px';
        for (var d = 0; d < 7; d++) {
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
        { name: 'harbor', url: 'https://harbor.roussev.com' }
    ];
    var tiles = {};
    function createTile(svc, index) {
        var tile = document.createElement('div');
        tile.className = 'hc-tile';
        tile.style.animationDelay = (index * 150) + 'ms';
        var domain = svc.url.replace('https://', '');
        var nameHtml;
        if (domain === 'roussev.com') {
            nameHtml = 'roussev<span class="hc-domain">.com</span>';
        } else {
            var sub = domain.replace('.roussev.com', '');
            nameHtml = sub + '<span class="hc-domain">.roussev.com</span>';
        }
        tile.innerHTML = '<span class="hc-dot pending"></span><span class="hc-name">' + nameHtml + '</span><span class="hc-ms">—</span><span class="hc-badge">checking</span>';
        return tile;
    }
    function checkService(svc, index) {
        if (!tiles[svc.name]) { tiles[svc.name] = createTile(svc, index); grid.appendChild(tiles[svc.name]); }
        var tile = tiles[svc.name], dot = tile.querySelector('.hc-dot'), ms = tile.querySelector('.hc-ms'), badge = tile.querySelector('.hc-badge');
        dot.className = 'hc-dot pending'; badge.className = 'hc-badge'; badge.textContent = '...';
        var start = performance.now();
        fetch(svc.url, { mode: 'no-cors', cache: 'no-store' })
            .then(function () { var d = Math.round(performance.now() - start); dot.className = 'hc-dot up'; ms.textContent = d + 'ms'; badge.className = 'hc-badge up'; badge.textContent = 'UP'; })
            .catch(function () { dot.className = 'hc-dot down'; ms.textContent = '—'; badge.className = 'hc-badge down'; badge.textContent = 'DOWN'; });
    }
    services.forEach(function (svc, i) { setTimeout(function () { checkService(svc, i); }, i * 300); });
    setInterval(function () { services.forEach(function (svc, i) { setTimeout(function () { checkService(svc, i); }, i * 200); }); }, 5000);
})();

/* Release showcase */
(function () {
    var timeEl = document.getElementById('deploy-time-text');
    var tagEl = document.getElementById('deploy-tag-link');
    var commitEl = document.getElementById('deploy-commit-link');
    var repoEl = document.getElementById('deploy-repo-link');
    if (!timeEl || !tagEl || !commitEl || !repoEl) return;

    function formatRelativeTime(iso) {
        var then = new Date(iso).getTime();
        if (!then || isNaN(then)) return 'unknown';
        var diffMs = Date.now() - then;
        if (diffMs < 0) diffMs = 0;
        var sec = Math.floor(diffMs / 1000);
        if (sec < 60) return sec + 's ago';
        var min = Math.floor(sec / 60);
        if (min < 60) return min + 'm ago';
        var hr = Math.floor(min / 60);
        if (hr < 24) return hr + 'h ago';
        var day = Math.floor(hr / 24);
        return day + 'd ago';
    }

    function render(meta) {
        var at = meta && meta.deployed_at ? meta.deployed_at : null;
        if (!at) {
            timeEl.textContent = 'Latest release info unavailable';
            return;
        }
        var tagText = meta && meta.image_tag ? meta.image_tag : '--';
        var commitText = meta && meta.commit_short ? meta.commit_short : '--';
        var tagUrl = meta && meta.tag_url ? meta.tag_url : null;
        var repoUrl = meta && meta.repo_url ? meta.repo_url : null;
        var commitUrl = meta && meta.commit_url
            ? meta.commit_url
            : (repoUrl && meta && meta.commit_sha ? (repoUrl + '/commit/' + meta.commit_sha) : null);

        timeEl.textContent = 'Deployed ' + formatRelativeTime(at);
        timeEl.title = 'Deployed at ' + at + (meta && meta.image_ref ? ('\n' + meta.image_ref) : '');

        tagEl.textContent = 'tag: ' + tagText;
        if (tagUrl) {
            tagEl.href = tagUrl;
            tagEl.style.pointerEvents = '';
            tagEl.setAttribute('aria-disabled', 'false');
        } else {
            tagEl.removeAttribute('href');
            tagEl.style.pointerEvents = 'none';
            tagEl.setAttribute('aria-disabled', 'true');
        }

        commitEl.textContent = 'commit: ' + commitText;
        if (commitUrl) {
            commitEl.href = commitUrl;
            commitEl.style.pointerEvents = '';
            commitEl.setAttribute('aria-disabled', 'false');
        } else {
            commitEl.removeAttribute('href');
            commitEl.style.pointerEvents = 'none';
            commitEl.setAttribute('aria-disabled', 'true');
        }

        if (repoUrl) {
            repoEl.href = repoUrl;
            repoEl.style.display = 'inline-block';
        } else {
            repoEl.style.display = 'none';
        }
    }

    function loadDeployMeta() {
        fetch('/build-info.json?ts=' + Date.now(), { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('missing')); })
            .then(function (meta) {
                render(meta);
                setInterval(function () { render(meta); }, 60000);
            })
            .catch(function () {
                timeEl.textContent = 'Latest release info unavailable';
                tagEl.textContent = 'tag: --';
                commitEl.textContent = 'commit: --';
            });
    }

    loadDeployMeta();
})();
