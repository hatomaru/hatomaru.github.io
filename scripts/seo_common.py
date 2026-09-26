"""Shared, dependency-free HTML inventory for the two maintained sites."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://hatomaru.github.io/'
TARGET_DIRS = ('OneTeam_dot', 'portfolio')


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.source = path.read_text(encoding='utf-8')
        self.tags = []
        self.feed(self.source)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]

    def meta(self, key):
        matches = self.select('meta', name=key) + self.select('meta', property=key)
        return matches[0].get('content', '') if matches else ''

    @property
    def url(self):
        relative = self.path.relative_to(ROOT).as_posix()
        if self.path.name == 'index.html':
            relative = relative[:-10]
        return BASE_URL + quote(relative, safe='/')

    @property
    def canonical(self):
        links = self.select('link', rel='canonical')
        return links[0].get('href', '') if links else ''

    @property
    def indexable(self):
        return 'noindex' not in self.meta('robots').lower() and self.canonical == self.url


def pages():
    for folder in TARGET_DIRS:
        for path in sorted((ROOT / folder).rglob('*.html')):
            if path.name.startswith('google'):
                continue  # Search Console ownership token, not a content page.
            yield Page(path)


def local_target(page, reference):
    url = urlsplit(urljoin(page.url, reference))
    if url.scheme not in ('http', 'https') or url.netloc != urlsplit(BASE_URL).netloc:
        return None
    path = ROOT / unquote(url.path.lstrip('/'))
    return path / 'index.html' if url.path.endswith('/') else path
