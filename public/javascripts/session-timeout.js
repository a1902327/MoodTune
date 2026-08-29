const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes

let logoutTimer;

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    alert('You have been logged out due to inactivity.');
    fetch('/users/logout', { method: 'DELETE' })
    .then(() => { window.location.href = '/users/login'; }); // Adjust this path if your logout route is different
  }, AUTO_LOGOUT_TIME);
}

// Reset timer on user activity
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach((event) => {
  document.addEventListener(event, resetLogoutTimer, true);
});

// Start timer on page load
resetLogoutTimer();