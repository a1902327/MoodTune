// Check for error query parameter and display message
const urlParams = new URLSearchParams(window.location.search);
const errorParam = urlParams.get('error');
const errorMessageDiv = document.getElementById('error-message');

if (errorParam) {
    // You can customize messages based on the error type if needed
    if (errorParam === 'invalid_credentials') {
        errorMessageDiv.textContent = 'Invalid email or password. Please try again.';
    } else {
        errorMessageDiv.textContent = 'An unknown error occurred. Please try again.';
    }
    errorMessageDiv.style.display = 'block';
}

// Adjust icon position based on label and input state
// This script remains in the HTML as it directly manipulates the DOM elements of this page.
document.querySelectorAll('.form-group input').forEach((input) => {
    const icon = input.nextElementSibling; // Assuming icon is always the next sibling
    if (icon && icon.classList.contains('input-icon')) {
        const label = input.previousElementSibling;
        const adjustIcon = () => {
            // Check if the input has a value, is focused, or is a placeholder-only input (no preceding label)
            if (input.value || document.activeElement === input || (input.placeholder && !label)) {
                icon.style.top = '70%'; // Position for when text is present or input is active
            } else {
                icon.style.top = '70%'; // Default position if label is above
            }
        };
        input.addEventListener('input', adjustIcon);
        input.addEventListener('focus', adjustIcon);
        input.addEventListener('blur', () => { // Re-evaluate on blur
            if (!input.value) {
                // Reset to default if input is empty and not focused
                icon.style.top = '70%';
            }
        });
        adjustIcon(); // Initial adjustment
    }
});