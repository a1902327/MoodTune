document.addEventListener('DOMContentLoaded', () => {
    const moodCards = document.querySelectorAll('.mood-card');
    const recommendationResultsArea = document.getElementById('recommendation-results');
    const sortOrderSelect = document.getElementById('sort-order'); // 👈 Add reference to dropdown

    if (!moodCards.length || !recommendationResultsArea) {
        console.warn('Mood cards or recommendation results area not found.');
        return;
    }

    moodCards.forEach(card => {
        card.addEventListener('click', async () => {
            const mood = card.getAttribute('data-mood');
            recommendationResultsArea.innerHTML = '<div class="loader"></div>';

            try {
                const response = await fetch(`/spotify/recommendations?mood=${encodeURIComponent(mood)}`);

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ message: 'Server error' }));
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                const data = await response.json();

                // 🔽 Sort tracks based on selected order (asc or desc)
                const sortOrder = sortOrderSelect?.value || 'asc';
                if (Array.isArray(data.tracks)) {
                    data.tracks.sort((a, b) =>
                        sortOrder === 'asc'
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name)
                    );
                }

                displaySearchResults(data, recommendationResultsArea);
            } catch (err) {
                console.error('Mood Search Error:', err);
                recommendationResultsArea.innerHTML = `<p class="search-message error-message">Error: ${err.message}</p>`;
            }
        });
    });
});
