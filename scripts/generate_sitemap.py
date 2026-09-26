"""Generate deterministic sitemaps from canonical, indexable HTML pages.

Filesystem mtimes are not published as lastmod: checkout dates are not content updates.
"""
import argparse
import sys
import xml.etree.ElementTree as ET
from seo_common import ROOT, TARGET_DIRS, pages


def sitemap_bytes(urls):
    root = ET.Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    for url in sorted(set(urls)):
        entry = ET.SubElement(root, 'url')
        ET.SubElement(entry, 'loc').text = url
    ET.indent(root, space='  ')
    return ET.tostring(root, encoding='utf-8', xml_declaration=True) + b'\n'


def generate_sitemaps(check=False):
    inventory = list(pages())
    stale = False
    for folder in (*TARGET_DIRS, ''):
        selected = [p.url for p in inventory if p.indexable and
                    (not folder or p.path.is_relative_to(ROOT / folder))]
        destination = ROOT / folder / 'sitemap.xml'
        expected = sitemap_bytes(selected)
        if check:
            if not destination.exists() or destination.read_bytes().replace(b'\r\n', b'\n') != expected:
                print(f'Stale sitemap: {destination.relative_to(ROOT)}')
                stale = True
        else:
            destination.write_bytes(expected)
            print(f'Generated {destination.relative_to(ROOT)} ({len(selected)} URLs)')
    return stale


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail on stale sitemaps without modifying files')
    sys.exit(generate_sitemaps(parser.parse_args().check))
