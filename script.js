function toggleTheme() {
    const html = document.documentElement;
    const checkbox = document.querySelector('.toggle-switch input');
    const isLight = checkbox.checked;

    if (isLight) {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved preference
(function () {
    const saved = localStorage.getItem('theme');
    const checkbox = document.querySelector('.toggle-switch input');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (checkbox) checkbox.checked = true;
    }
})();
