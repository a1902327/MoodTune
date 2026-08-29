const regParams = new URLSearchParams(window.location.search);
const regError = regParams.get("error");
const regErrorDiv = document.getElementById("error-message");

if (regError) {
    regErrorDiv.textContent = regError;
    regErrorDiv.style.display = "block";
    regErrorDiv.style.color = "red";
    regErrorDiv.style.fontWeight = "bold";
    regErrorDiv.style.marginBottom = "1rem";
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    form.addEventListener('submit', (e) => {
        let valid = true;
        // Reset previous errors
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';

        if (password.value.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters.';
            valid = false;
        }

        if (password.value !== confirmPassword.value) {
            confirmPasswordError.textContent = 'Passwords do not match.';
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
        }
    });
});