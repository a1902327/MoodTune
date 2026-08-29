document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('spotify-search-form');
    const searchQueryInput = document.getElementById('search-query-input');
    const searchResultsArea = document.getElementById('search-results-area');

    if (!searchForm || !searchQueryInput || !searchResultsArea) {
        console.warn('Spotify search elements not found on this page. Search functionality will not be active.');
        return;
    }

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = searchQueryInput.value.trim();
        if (!query) {
            searchResultsArea.innerHTML = '<p class="search-message">Please enter a search term.</p>';
            return;
        }

        searchResultsArea.innerHTML = '<div class="loader"></div>';

        try {
            const response = await fetch(`/spotify/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message);
            }
            const data = await response.json();
            displaySearchResults(data, searchResultsArea); // Use the shared display function
        } catch (error) {
            console.error('Spotify Search Error:', error);
            searchResultsArea.innerHTML = `<p class="search-message error-message">Error: ${error.message}</p>`;
        }
    });
});

/**
 * SHARED FUNCTION: Displays Spotify search or recommendation results in a container.
 * @param {object} data - The data object containing tracks.
 * @param {HTMLElement} container - The HTML element to display results in.
 */
function displaySearchResults(data, container) {
    container.innerHTML = ''; // Clear previous content or loader

    const tracks = data?.tracks || [];
    if (!tracks.length) {
        container.innerHTML = '<p class="search-message">No tracks found. Try a different search!</p>';
        return;
    }

    tracks.forEach(track => {
        // FIX: Ensure all necessary track data is packaged here for the save button.
        // The `id` from spotify.js is now available in `track.id`.
        const trackData = {
            id: track.id,
            name: track.name,
            artist: track.artist,
            album: track.album,
            artwork: track.artwork,
            spotify_url: track.spotify_url
        };
        // Sanitize the JSON string for use in an HTML attribute.
        const trackInfoString = JSON.stringify(trackData).replace(/'/g, "&apos;");

        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item', 'glass-gradient');
        resultItem.dataset.songId = track.id; // Used for like/dislike

        resultItem.innerHTML = `
            <button class="song-action-button add-to-list-btn" title="Add to My List" data-track-info='${trackInfoString}'>
                <i class="fas fa-plus"></i>
            </button>
            <img src="${track.artwork}" alt="Album art for ${track.name}" class="result-artwork">
            <div class="result-info">
                <h3 class="result-track-name">${track.name}</h3>
                <p class="result-artist-name">${track.artist}</p>
                <a href="${track.spotify_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary result-spotify-link">
                    <i class="fab fa-spotify"></i> Listen on Spotify
                </a>
            </div>
            <div class="song-ratings-container">
                <div class="song-rating">
                    <button class="song-rating-button like-btn" data-song-id="${track.id}" aria-label="Like">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                </div>
                <div class="song-rating">
                    <button class="song-rating-button dislike-btn" data-song-id="${track.id}" aria-label="Dislike">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(resultItem);
    });

    // Set up like/dislike buttons for the newly created results
    if (typeof window.setupLikeDislikeButtons === 'function') {
        window.setupLikeDislikeButtons(container);
    }
}
