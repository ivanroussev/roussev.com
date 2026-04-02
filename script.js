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
    for (var w = 0; w < 52; w++) {
        var col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '3px';
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
        { name: 'harbor', url: 'https://harbor.roussev.com' },
        { name: 'traefik', url: 'https://traefik.roussev.com' }
    ];
    var tiles = {};
    function createTile(svc, index) {
        var tile = document.createElement('div');
        tile.className = 'hc-tile';
        tile.style.animationDelay = (index * 150) + 'ms';
        tile.innerHTML = '<span class="hc-dot pending"></span><span class="hc-name">' + svc.name + '</span><span class="hc-ms">—</span><span class="hc-badge">checking</span>';
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
    var wm = { 0:{icon:'☀️',desc:'Clear sky'},1:{icon:'🌤️',desc:'Mainly clear'},2:{icon:'⛅',desc:'Partly cloudy'},3:{icon:'☁️',desc:'Overcast'},45:{icon:'🌫️',desc:'Foggy'},48:{icon:'🌫️',desc:'Icy fog'},51:{icon:'🌦️',desc:'Light drizzle'},53:{icon:'🌦️',desc:'Drizzle'},55:{icon:'🌧️',desc:'Heavy drizzle'},61:{icon:'🌧️',desc:'Light rain'},63:{icon:'🌧️',desc:'Rain'},65:{icon:'🌧️',desc:'Heavy rain'},66:{icon:'🌨️',desc:'Freezing rain'},67:{icon:'🌨️',desc:'Heavy freezing rain'},71:{icon:'🌨️',desc:'Light snow'},73:{icon:'❄️',desc:'Snow'},75:{icon:'❄️',desc:'Heavy snow'},77:{icon:'🌨️',desc:'Snow grains'},80:{icon:'🌦️',desc:'Light showers'},81:{icon:'🌧️',desc:'Showers'},82:{icon:'⛈️',desc:'Heavy showers'},85:{icon:'🌨️',desc:'Snow showers'},86:{icon:'🌨️',desc:'Heavy snow showers'},95:{icon:'⛈️',desc:'Thunderstorm'},96:{icon:'⛈️',desc:'Thunderstorm + hail'},99:{icon:'⛈️',desc:'Thunderstorm + heavy hail'} };
    function updateTime() { timeEl.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    function fetchWeather() {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=42.6977&longitude=23.3219&current=temperature_2m,weather_code&timezone=Europe%2FSofia')
            .then(function (r) { return r.json(); })
            .then(function (d) { var w = wm[d.current.weather_code] || {icon:'🌡️',desc:'Unknown'}; iconEl.textContent = w.icon; descEl.textContent = w.desc; tempEl.textContent = Math.round(d.current.temperature_2m) + '°C'; })
            .catch(function () { iconEl.textContent = '❓'; descEl.textContent = 'Could not load'; tempEl.textContent = '--°'; });
    }
    updateTime(); setInterval(updateTime, 1000); fetchWeather(); setInterval(fetchWeather, 600000);
})();
