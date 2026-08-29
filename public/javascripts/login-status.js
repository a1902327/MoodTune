document.addEventListener('DOMContentLoaded', async () => {
    const loggedOutDiv = document.querySelector('.auth-buttons.logged-out');
    const loggedInDiv = document.querySelector('.auth-buttons.logged-in');
    const profileBtn = document.getElementById('profile-btn'); // The <a> tag for profile/admin

    try {
        const response = await fetch('/users/status');
        const data = await response.json();

        if (data.loggedIn && data.user) {
            // User is logged in
            if (loggedOutDiv) loggedOutDiv.style.display = 'none';
            if (loggedInDiv) loggedInDiv.style.display = 'flex';

            // Update the profile/admin button based on user role
            if (profileBtn) {
                if (data.user.is_admin) {
                    profileBtn.textContent = 'Admin';
                    profileBtn.href = '/admin.html';
                } else {
                    profileBtn.textContent = 'Profile';
                    profileBtn.href = '/profile.html';
                }
            }

        } else {
            // User is not logged in
            if (loggedOutDiv) loggedOutDiv.style.display = 'flex';
            if (loggedInDiv) loggedInDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        // Default to logged-out view on error
        if (loggedOutDiv) loggedOutDiv.style.display = 'flex';
        if (loggedInDiv) loggedInDiv.style.display = 'none';
    }
});
