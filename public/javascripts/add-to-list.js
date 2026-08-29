document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for dynamically created search results
    document.body.addEventListener('click', handleAddToListClick);

    async function handleAddToListClick(event) {
        const addButton = event.target.closest('.add-to-list-btn');
        if (!addButton) return; // Exit if the click was not on an add button

        event.preventDefault();

        const trackInfo = JSON.parse(addButton.dataset.trackInfo);

        try {
            // FIX: Corrected fetch call to point to the correct API route
            const response = await fetch('/profile/save-track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trackInfo),
            });

            // Robust error handling to prevent JSON.parse errors
            let result;
            try {
                result = await response.json();
            } catch (e) {
                const errorText = await response.text();
                console.error("Server response was not valid JSON:", errorText);
                throw new Error("Server returned an invalid response. Check console.");
            }

            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }

            showToast(result.message);
            addButton.innerHTML = '<i class="fas fa-check"></i>';
            addButton.disabled = true;

        } catch (error) {
            console.error('Error saving track:', error);
            showToast(`Error: ${error.message}`, true);
        }
    }

    function showToast(message, isError = false) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        if (isError) toast.style.backgroundColor = 'var(--error-color)';

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});
