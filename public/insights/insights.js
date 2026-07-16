document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('insightsGrid');
    
    // In production, this should point to your Vercel URL
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/v1' : '/api/v1';

    async function fetchInsights() {
        showSkeletons();
        try {
            const response = await fetch(`${API_BASE}/content`);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const { data } = await response.json();
            renderGrid(data);
        } catch (error) {
            console.error('Error fetching insights:', error);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-on-glass-sub);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #ffab00; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-on-glass);">Unable to load insights</h3>
                    <p>There was a problem connecting to the content engine. Please try again later.</p>
                </div>
            `;
        }
    }

    function showSkeletons() {
        grid.innerHTML = Array(6).fill('').map(() => `
            <div class="insight-card" style="pointer-events: none;">
                <div class="image-wrapper skeleton"></div>
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
                <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.14);">
                    <i class="fa-solid fa-pen-nib" style="font-size: 3rem; color: var(--text-on-glass-mut); margin-bottom: 1.5rem;"></i>
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 2rem; color: var(--text-on-glass); margin-bottom: 1rem;">No insights published yet</h3>
                    <p style="font-size: 1.1rem; color: var(--text-on-glass-sub);">Check back soon for new articles.</p>
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
                        <span class="category">${node.type?.name || 'Article'}</span>
                        <span>•</span>
                        <span>${node.reading_time_minutes} min read</span>
                    </div>
                    <h3>${node.title}</h3>
                    <p>${node.excerpt || 'Read this insight to learn more about how Originyx is shaping the future of AI.'}</p>
                    <div class="footer">
                        <span>${date}</span>
                        <span class="read-more">Read <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    // Initial load
    fetchInsights();
});
