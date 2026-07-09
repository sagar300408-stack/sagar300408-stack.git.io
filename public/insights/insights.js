document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('insightsGrid');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const chips = document.querySelectorAll('.chip');
    
    // In production, this should point to your Vercel URL
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/v1' : '/api/v1';

    let currentFilter = 'all';

    async function fetchInsights() {
        showSkeletons();
        try {
            // Build query params
            const params = new URLSearchParams();
            if (currentFilter !== 'all') {
                params.append('type', currentFilter);
            }

            const response = await fetch(`${API_BASE}/content?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const { data } = await response.json();
            renderGrid(data);
        } catch (error) {
            console.error('Error fetching insights:', error);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: var(--amber); margin-bottom: 1rem;"></i>
                    <h3>Unable to load insights</h3>
                    <p>There was a problem connecting to the content engine. Please try again later.</p>
                </div>
            `;
        }
    }

    function showSkeletons() {
        grid.innerHTML = Array(6).fill('').map(() => `
            <div class="insight-card" style="pointer-events: none;">
                <div class="image-wrapper skeleton" style="background-color: var(--bg-tertiary);"></div>
                <div class="content">
                    <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 1rem;"></div>
                    <div class="skeleton" style="height: 24px; width: 90%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 24px; width: 70%; margin-bottom: 1rem;"></div>
                    <div class="skeleton" style="height: 60px; width: 100%; margin-bottom: 1rem;"></div>
                    <div class="footer" style="border-top: none;">
                        <div class="skeleton" style="height: 16px; width: 30%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderGrid(data) {
        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; color: var(--text-secondary); background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
                    <i class="fa-solid fa-pen-nib" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1.5rem;"></i>
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: var(--text-primary); margin-bottom: 1rem;">No insights published yet</h3>
                    <p style="font-size: 1.1rem;">Check back soon for new articles, or select a different category.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = data.map(node => {
            const date = new Date(node.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
            <div class="insight-card" onclick="window.location.href='/insights/article.html?slug=${node.slug}'">
                <div class="image-wrapper">
                    <img src="${node.cover_image || 'https://placehold.co/800x450/f5f5f2/4a4a4a?text=Originyx'}" alt="${node.title}" loading="lazy">
                </div>
                <div class="content">
                    <div class="meta">
                        <span style="color: var(--accent-color); font-weight: 500;">${node.type?.name || 'Article'}</span>
                        <span>•</span>
                        <span>${node.reading_time_minutes} min read</span>
                    </div>
                    <h3>${node.title}</h3>
                    <p>${node.excerpt || 'Read this insight to learn more about how Originyx is shaping the future of AI.'}</p>
                    <div class="footer">
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${date}</span>
                        <span class="read-more">Read <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    // Global Search Functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search failed');
                
                const { results } = await response.json();
                
                if (results.length === 0) {
                    searchResults.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); font-size: 0.9rem;">No results found for "${query}"</div>`;
                } else {
                    searchResults.innerHTML = results.map(res => `
                        <a href="/insights/article.html?slug=${res.slug}" style="display: block; padding: 1rem; border-bottom: 1px solid var(--border-color); text-decoration: none; color: inherit; transition: background 0.2s;">
                            <div style="font-size: 0.8rem; color: var(--accent-color); font-weight: 600; margin-bottom: 0.25rem; text-transform: uppercase;">${res.type?.slug || 'Insight'}</div>
                            <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.25rem;">${res.title}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${res.excerpt || ''}</div>
                        </a>
                    `).join('');
                }
                
                searchResults.style.display = 'block';
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300); // 300ms debounce
    });

    // Close search results on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Filter Chips
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            fetchInsights();
        });
    });

    // Initial load
    fetchInsights();
});
