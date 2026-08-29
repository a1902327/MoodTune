document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const root = document.documentElement;

    // Apply the saved theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        root.classList.add('light-theme');
    }

    themeToggleButton.addEventListener('click', () => {
        if (root.classList.contains('light-theme')) {
            root.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    });
});