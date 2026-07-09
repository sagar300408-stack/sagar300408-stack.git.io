document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('article-container');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        showError('No article specified.');
        return;
    }

    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/v1' : '/api/v1';

    try {
        const response = await fetch(`${API_BASE}/content?slug=${slug}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Insight not found');
            throw new Error('Failed to load insight');
        }
        
        const article = await response.json();
        renderArticle(article);
        updateSEO(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        showError(error.message);
    }

    function renderArticle(article) {
        const date = new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        // Simple TipTap JSON to HTML converter (for basic nodes)
        function generateHTML(json) {
            if (!json || !json.content) return '';
            let html = '';
            for (const node of json.content) {
                if (node.type === 'paragraph') {
                    html += `<p>${node.content ? node.content.map(n => n.text).join('') : ''}</p>`;
                } else if (node.type === 'heading') {
                    const level = node.attrs?.level || 2;
                    html += `<h${level}>${node.content ? node.content.map(n => n.text).join('') : ''}</h${level}>`;
                }
            }
            return html;
        }

        const bodyHTML = article.content?.type === 'doc' ? generateHTML(article.content) : '<p>Content parsing error.</p>';
        const coverImg = article.cover_image || 'https://placehold.co/1200x600/f5f5f2/4a4a4a?text=Originyx';

        container.innerHTML = `
            <header class="article-header">
                <span class="article-category">${article.type?.name || 'Insight'}</span>
                <h1 class="article-title">${article.title}</h1>
                <p class="article-excerpt">${article.excerpt || ''}</p>
                <div class="article-meta">
                    <span class="author">
                        <i class="fa-solid fa-user-circle"></i>
                        ${article.author?.email.split('@')[0] || 'Originyx'}
                    </span>
                    <span>•</span>
                    <span>${date}</span>
                    <span>•</span>
                    <span>${article.reading_time_minutes} min read</span>
                </div>
            </header>
            
            <div class="article-cover">
                <img src="${coverImg}" alt="${article.title}">
            </div>
            
            <div class="article-body">
                ${bodyHTML}
            </div>
        `;
    }

    function updateSEO(article) {
        document.title = `${article.title} | Originyx Insights`;
        document.getElementById('meta-description').content = article.excerpt || '';
        document.getElementById('meta-og-title').content = article.title;
        document.getElementById('meta-og-description').content = article.excerpt || '';
        if (article.cover_image) {
            document.getElementById('meta-og-image').content = article.cover_image;
        }
    }

    function showError(message) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-file-circle-xmark" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1.5rem;"></i>
                <h2 style="font-size: 2rem; color: var(--text-primary); margin-bottom: 1rem;">Insight Not Found</h2>
                <p style="margin-bottom: 2rem;">${message}</p>
                <a href="/insights/" style="color: var(--accent-color); font-weight: 500; text-decoration: none;">&larr; Back to Insights</a>
            </div>
        `;
    }
});
