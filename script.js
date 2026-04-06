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

/* Sofia weather + time */
(function () {
    var iconEl = document.getElementById('weather-icon'), timeEl = document.getElementById('weather-time'), descEl = document.getElementById('weather-desc'), tempEl = document.getElementById('weather-temp');
    if (!iconEl) return;
    var wm = { 0:{day:'☀️',night:'🌙',desc:'Clear sky'},1:{day:'🌤️',night:'🌙',desc:'Mainly clear'},2:{day:'⛅',night:'☁️',desc:'Partly cloudy'},3:{day:'☁️',night:'☁️',desc:'Overcast'},45:{day:'🌫️',night:'🌫️',desc:'Foggy'},48:{day:'🌫️',night:'🌫️',desc:'Icy fog'},51:{day:'🌦️',night:'🌦️',desc:'Light drizzle'},53:{day:'🌦️',night:'🌦️',desc:'Drizzle'},55:{day:'🌧️',night:'🌧️',desc:'Heavy drizzle'},61:{day:'🌧️',night:'🌧️',desc:'Light rain'},63:{day:'🌧️',night:'🌧️',desc:'Rain'},65:{day:'🌧️',night:'🌧️',desc:'Heavy rain'},66:{day:'🌨️',night:'🌨️',desc:'Freezing rain'},67:{day:'🌨️',night:'🌨️',desc:'Heavy freezing rain'},71:{day:'🌨️',night:'🌨️',desc:'Light snow'},73:{day:'❄️',night:'❄️',desc:'Snow'},75:{day:'❄️',night:'❄️',desc:'Heavy snow'},77:{day:'🌨️',night:'🌨️',desc:'Snow grains'},80:{day:'🌦️',night:'🌦️',desc:'Light showers'},81:{day:'🌧️',night:'🌧️',desc:'Showers'},82:{day:'⛈️',night:'⛈️',desc:'Heavy showers'},85:{day:'🌨️',night:'🌨️',desc:'Snow showers'},86:{day:'🌨️',night:'🌨️',desc:'Heavy snow showers'},95:{day:'⛈️',night:'⛈️',desc:'Thunderstorm'},96:{day:'⛈️',night:'⛈️',desc:'Thunderstorm + hail'},99:{day:'⛈️',night:'⛈️',desc:'Thunderstorm + heavy hail'} };
    function updateTime() { timeEl.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    function fetchWeather() {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6977&longitude=23.3219&current=temperature_2m,weather_code,is_day&timezone=Europe%2FSofia')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var isDay = d && d.current && d.current.is_day === 1;
                var w = wm[d.current.weather_code] || { day: '🌡️', night: '🌡️', desc: 'Unknown' };
                iconEl.textContent = isDay ? w.day : w.night;
                descEl.textContent = w.desc;
                tempEl.textContent = Math.round(d.current.temperature_2m) + '°C';
            })
            .catch(function () { iconEl.textContent = '❓'; descEl.textContent = 'Could not load'; tempEl.textContent = '--°'; });
    }
    updateTime(); setInterval(updateTime, 1000); fetchWeather(); setInterval(fetchWeather, 600000);
})();

/* Deploy ticker */
(function () {
    var tickerEl = document.getElementById('deploy-ticker-text');
    if (!tickerEl) return;

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
            tickerEl.textContent = 'Last deploy: unavailable';
            return;
        }
        var parts = ['Last deploy: ' + formatRelativeTime(at)];
        if (meta && meta.image_tag) parts.push('tag ' + meta.image_tag);
        if (meta && meta.commit_short) parts.push(meta.commit_short);
        tickerEl.textContent = parts.join(' · ');
        tickerEl.title = 'Deployed at ' + at + (meta && meta.image_ref ? ('\n' + meta.image_ref) : '');
    }

    function loadDeployMeta() {
        fetch('/build-info.json?ts=' + Date.now(), { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('missing')); })
            .then(function (meta) {
                render(meta);
                setInterval(function () { render(meta); }, 60000);
            })
            .catch(function () {
                tickerEl.textContent = 'Last deploy: unavailable';
            });
    }

    loadDeployMeta();
})();
