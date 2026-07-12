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
        
        // TipTap JSON to HTML converter
        function renderMarks(text, marks) {
            if (!marks || marks.length === 0) return text;
            let result = text;
            marks.forEach(mark => {
                if (mark.type === 'bold') result = `<strong>${result}</strong>`;
                else if (mark.type === 'italic') result = `<em>${result}</em>`;
                else if (mark.type === 'strike') result = `<del>${result}</del>`;
                else if (mark.type === 'code') result = `<code>${result}</code>`;
                else if (mark.type === 'underline') result = `<u>${result}</u>`;
                else if (mark.type === 'link') result = `<a href="${mark.attrs?.href || '#'}" target="${mark.attrs?.target || '_blank'}">${result}</a>`;
                else if (mark.type === 'highlight') result = `<mark>${result}</mark>`;
            });
            return result;
        }

        function generateHTML(json) {
            if (typeof json === 'string') return json;
            if (!json || typeof json !== 'object') return '';
            
            if (json.type === 'doc' && json.content) {
                return json.content.map(node => generateHTML(node)).join('');
            }
            
            if (json.type === 'text') {
                return renderMarks(json.text || '', json.marks);
            }
            
            const childrenHTML = json.content ? json.content.map(node => generateHTML(node)).join('') : '';

            switch (json.type) {
                case 'paragraph': return `<p>${childrenHTML}</p>`;
                case 'heading': return `<h${json.attrs?.level || 2}>${childrenHTML}</h${json.attrs?.level || 2}>`;
                case 'bulletList': return `<ul>${childrenHTML}</ul>`;
                case 'orderedList': return `<ol>${childrenHTML}</ol>`;
                case 'listItem': return `<li>${childrenHTML}</li>`;
                case 'blockquote': return `<blockquote>${childrenHTML}</blockquote>`;
                case 'horizontalRule': return `<hr>`;
                case 'codeBlock': return `<pre><code>${childrenHTML}</code></pre>`;
                case 'image': return `<img src="${json.attrs?.src || ''}" alt="${json.attrs?.alt || ''}" title="${json.attrs?.title || ''}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0;">`;
                case 'hardBreak': return `<br>`;
                default: return childrenHTML;
            }
        }

        let bodyHTML = '';
        if (typeof article.content === 'string') {
            bodyHTML = article.content;
        } else if (article.content && typeof article.content === 'object' && article.content.type === 'doc') {
            bodyHTML = generateHTML(article.content);
        } else {
            bodyHTML = '<p><em>No content available.</em></p>';
        }
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

            <!-- START CTA MODULE -->
            <div class="article-cta" style="text-align: center; margin: 4rem auto 6rem; padding: 3rem 2rem; background: var(--bg-card, #f8f9fa); border-radius: 16px; border: 1px solid var(--border-color, #eaeaea); max-width: 720px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                <h3 class="gradient-text" style="font-size: 2rem; margin-bottom: 1rem; font-family: 'Outfit', sans-serif; font-weight: 600;">Ready to transform your workflow?</h3>
                <p style="color: var(--text-secondary, #666); margin-bottom: 2rem; font-size: 1.15rem; line-height: 1.6;">Let's map out your autonomous AI architecture and build a custom solution for your business.</p>
                <button class="btn btn-primary" data-modal-target="start-project-modal" style="padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 50px; cursor: pointer;">
                    Start a Project
                </button>
            </div>
            <!-- END CTA MODULE -->
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
