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
    var iframes = document.querySelectorAll('.grafana-uptime iframe, .grafana-gauge iframe, .ssl-embed iframe');
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
    requestAnimationFrame(function () {
        document.documentElement.classList.add('theme-ready');
    });
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

/* Homepage hero scroll handoff */
(function () {
    var header = document.querySelector('.home-page .site-header');
    var hero = document.querySelector('.hero-profile');
    var main = document.getElementById('main-content');
    var arrow = document.querySelector('.hero-scroll');
    if (!hero || !main) return;

    function updateHeaderState() {
        if (!header) return;
        if (window.scrollY > 16) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    function goToMain() {
        main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (arrow) {
        arrow.addEventListener('click', function (e) {
            e.preventDefault();
            goToMain();
        });
    }

    var locking = false;
    window.addEventListener('wheel', function (e) {
        if (locking) return;
        if (window.scrollY > 8) return;
        if (e.deltaY <= 6) return;
        locking = true;
        e.preventDefault();
        goToMain();
        setTimeout(function () { locking = false; }, 900);
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
        if (window.scrollY > 8) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            goToMain();
        }
    });
})();
