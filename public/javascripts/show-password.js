// Password visibility toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = togglePassword.querySelector('.eye-icon');
const eyeOffIcon = togglePassword.querySelector('.eye-off-icon');

if (togglePassword && passwordInput && eyeIcon && eyeOffIcon) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Toggle icon visibility
        eyeIcon.style.display = type === 'password' ? 'block' : 'none';
        eyeOffIcon.style.display = type === 'text' ? 'block' : 'none';
    });
}