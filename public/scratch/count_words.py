import re
from bs4 import BeautifulSoup

file_path = r"c:\Users\acer\OneDrive\Documents\GitHub\sagar300408-stack.git.io\projects\shadowos\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, "html.parser")

# Extract text from the main body
body_text = soup.body.get_text()

# Clean up whitespace and get words
words = re.findall(r"\b[a-zA-Z0-9'-]+\b", body_text)
word_count = len(words)

print(f"Total words in body: {word_count}")
