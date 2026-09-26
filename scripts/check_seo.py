"""Validate committed HTML, local assets, language alternates and sitemap coverage."""
import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from seo_common import ROOT, TARGET_DIRS, pages, local_target


def check(sitemaps=False, links=False):
    errors = []
    inventory = list(pages())
    by_url = {p.url: p for p in inventory}
    titles, descriptions = {}, {}
    for page in inventory:
        name = page.path.relative_to(ROOT).as_posix()
        def require(condition, message):
            if not condition:
                errors.append(f'{name}: {message}')
        require(bool(re.match(r'\s*<!doctype html>', page.source, re.I)), 'missing HTML doctype')
        require(len(page.select('html')) == 1 and bool(page.select('html')[0].get('lang')), 'missing document language')
        found = re.findall(r'<title>(.*?)</title>', page.source, re.S)
        require(len(found) == 1 and bool(found[0].strip()), 'expected one nonempty title')
        title = html.unescape(found[0]) if found else ''
        desc = page.meta('description')
        require(len(page.select('meta', name='description')) == 1 and bool(desc), 'expected one description')
        require(len(page.select('link', rel='canonical')) == 1 and page.canonical == page.url, 'canonical does not match published URL')
        require(page.meta('og:url') == page.url, 'OG URL mismatch')
        require(page.meta('og:title') == title and page.meta('twitter:title') == title, 'social title mismatch')
        require(page.meta('og:description') == desc and page.meta('twitter:description') == desc, 'social description mismatch')
        for key in ('og:image', 'twitter:image'):
            target = local_target(page, page.meta(key))
            require(page.meta(key).startswith('https://') and target is not None and target.is_file(), f'missing social image: {key}')
        if page.indexable:
            require(title not in titles, f'duplicate title with {titles.get(title)}')
            require(desc not in descriptions, f'duplicate description with {descriptions.get(desc)}')
            titles[title], descriptions[desc] = name, name
        blocks = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', page.source, re.S)
        require(bool(blocks), 'missing structured data')
        for block in blocks:
            try:
                data = json.loads(block)
                require(data.get('@context') == 'https://schema.org', 'incorrect schema context')
            except ValueError:
                require(False, 'invalid JSON-LD')
        for alternate in page.select('link', rel='alternate'):
            if 'hreflang' not in alternate:
                continue
            target = by_url.get(alternate.get('href'))
            require(target is not None, 'alternate URL missing')
            if target:
                require(target.indexable, 'alternate URL is not indexable')
                require(any(a.get('href') == page.url for a in target.select('link', rel='alternate')), 'alternate lacks return link')
        if links:
            require(bool(page.select('h1')), 'missing main heading')
            for tag, attrs in page.tags:
                key = 'href' if tag in ('a', 'link') else 'src' if tag in ('img', 'script') else None
                if not key or not attrs.get(key):
                    continue
                target = local_target(page, attrs[key])
                require(target is None or target.is_file(), f'broken local {tag}: {attrs[key]}')
                if tag == 'img':
                    require('alt' in attrs, f'image missing alt: {attrs[key]}')
    if sitemaps:
        for folder in ('', *TARGET_DIRS):
            path = ROOT / folder / 'sitemap.xml'
            actual = [e.text for e in ET.parse(path).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
            expected = {p.url for p in inventory if p.indexable and (not folder or p.path.is_relative_to(ROOT / folder))}
            if len(actual) != len(set(actual)) or set(actual) != expected:
                errors.append(f'{path.relative_to(ROOT)}: sitemap mismatch; missing={expected-set(actual)}, extra={set(actual)-expected}')
    for error in errors:
        print(error)
    print(f'Checked {len(inventory)} pages; {len(errors)} errors')
    return bool(errors)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sitemaps', action='store_true')
    parser.add_argument('--links', action='store_true')
    args = parser.parse_args()
    sys.exit(check(args.sitemaps, args.links))
