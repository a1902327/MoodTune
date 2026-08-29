/**
 * Shows a toast notification at the bottom of the screen.
 * @param {string} message The message to display.
 * @param {'info' | 'success' | 'error'} type The type of toast, for styling.
 */
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create the toast element
    const toast = document.createElement('div');
    // Basic styling and the type-specific class
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add it to the body
    document.body.appendChild(toast);

    // Animate it into view with a slight delay for better effect
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // After 3.5 seconds, fade it out and then remove it from the DOM
    setTimeout(() => {
        toast.classList.remove('show');
        // Wait for transition to complete before removing
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Attaches click event listeners to like/dislike buttons on song cards.
     * This function should be called every time new song cards are added to the page.
     * @param {HTMLElement} container The parent element containing the song cards. Defaults to the whole document.
     */
    window.setupLikeDislikeButtons = (container) => {
        const parentElement = container || document;

        parentElement.querySelectorAll('.song-card, .search-result-item').forEach((card) => {
            // Prevent attaching listeners multiple times to the same card
            if (card.dataset.likeDislikeAttached) {
                return;
            }
            card.dataset.likeDislikeAttached = 'true';

            const ratings = card.querySelectorAll('.song-rating');
            if (ratings.length < 2) {
                return; // Skip if the card is incomplete
            }

            const likeRating = ratings[0];
            const dislikeRating = ratings[1];

            // Get song ID from the first button (they should both have the same song ID)
            const likeButton = likeRating.querySelector('.song-rating-button');
            const dislikeButton = dislikeRating.querySelector('.song-rating-button');

            if (!likeButton || !dislikeButton) {
                return; // Skip if buttons are missing
            }

            const songId = likeButton.dataset.songId || dislikeButton.dataset.songId;
            if (!songId) {
                console.warn('Song ID not found on buttons:', card);
                return; // Skip if song ID is missing
            }

            ratings.forEach((rating) => {
                const button = rating.querySelector('.song-rating-button');
                button.addEventListener('click', async (event) => {
                    event.preventDefault();

                    // Don't do anything if the button is already selected
                    if (rating.classList.contains('song-rating-selected')) {
                        return;
                    }

                    const action = rating === likeRating ? 'like' : 'dislike';

                    try {
                        const response = await fetch(`/spotify/${songId}/${action}`, {
                            method: 'POST',
                        });

                        // If the action was successful on the server
                        if (response.ok) {
                            // Now we update the UI to reflect the successful state change
                            rating.classList.add('song-rating-selected');
                            // Deselect the other button
                            const otherRating = rating === likeRating ? dislikeRating : likeRating;
                            otherRating.classList.remove('song-rating-selected');

                            // Show success message with appropriate color
                            const actionText = action === 'like' ? 'liked' : 'disliked';
                            const toastType = action === 'like' ? 'success' : 'error';
                            showToast(`Song ${actionText} successfully!`, toastType);
                        } else {
                            // If the server returned an error (e.g., 401 Not Authenticated)
                            const errorData = await response.json();
                            const message = errorData.message || 'An unknown error occurred.';
                            showToast(message, 'error');
                        }
                    } catch (err) {
                        // Handle network errors (e.g., server is down)
                        console.error('Network error:', err);
                        showToast('Could not connect to the server.', 'error');
                    }
                });
            });
        });
    };

    // Run the setup for any static cards that are on the page when it first loads.
    window.setupLikeDislikeButtons();
});
