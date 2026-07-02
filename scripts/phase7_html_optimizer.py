import os
import re

html_files = []
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'scratch' in root or '.vercel' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 1. Add decoding="async" to <img>
    def img_replacer(match):
        img_tag = match.group(0)
        if 'decoding=' not in img_tag:
            return img_tag.replace('<img ', '<img decoding="async" ')
        return img_tag
    content = re.sub(r'<img\b[^>]*>', img_replacer, content)

    # 2. Scripts defer (auth.js and script.js)
    def script_replacer(match):
        tag = match.group(0)
        if 'src=' in tag and 'defer' not in tag and 'application/ld+json' not in tag:
            # Only defer auth.js and script.js based on user instructions to be careful
            if 'auth.js' in tag or 'script.js' in tag:
                return tag.replace('<script ', '<script defer ')
        return tag
    content = re.sub(r'<script\b[^>]*>', script_replacer, content)
    
    # 3. Add Preconnects and Preload to <head>
    head_additions = """
  <!-- Preload & Preconnect Optimizations -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://rwsmafafptupucthrjwx.supabase.co">
  <link rel="preconnect" href="https://rwsmafafptupucthrjwx.supabase.co" crossorigin>
"""
    match_styles = re.search(r'<link[^>]*href="([^"]*styles\.css)"', content)
    if match_styles:
        styles_path = match_styles.group(1)
        preload_styles = f'  <link rel="preload" href="{styles_path}" as="style">\n'
        head_additions = preload_styles + head_additions

    # Check if we already injected this to avoid duplicates
    if 'rwsmafafptupucthrjwx.supabase.co' not in content:
        content = content.replace('</head>', head_additions + '</head>')
        
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
