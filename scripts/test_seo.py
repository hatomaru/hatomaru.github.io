"""Regression checks for sitemap inclusion and stable public URLs."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import seo_common
from generate_sitemap import sitemap_bytes


class SitemapRules(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.root_patch = patch.object(seo_common, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def page(self, filename='portfolio/index.html', robots='', canonical=None):
        path = self.root / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        canonical = canonical or seo_common.BASE_URL + filename.removesuffix('index.html')
        path.write_text(f'<html><head><link rel="canonical" href="{canonical}">'
                        f'<meta name="robots" content="{robots}"></head></html>', encoding='utf-8')
        return seo_common.Page(path)

    def test_index_uses_directory_url(self):
        page = self.page()
        self.assertEqual(page.url, seo_common.BASE_URL + 'portfolio/')
        self.assertTrue(page.indexable)

    def test_noindex_is_excluded(self):
        self.assertFalse(self.page(robots='NOINDEX, follow').indexable)

    def test_noncanonical_page_is_excluded(self):
        self.assertFalse(self.page(canonical=seo_common.BASE_URL + 'OneTeam_dot/').indexable)

    def test_html_detail_keeps_extension(self):
        page = self.page('portfolio/contents/BlockWorld_PC.html')
        self.assertTrue(page.url.endswith('/BlockWorld_PC.html'))
        self.assertTrue(page.indexable)

    def test_xml_is_sorted_deduplicated_and_escaped(self):
        output = sitemap_bytes(['https://example.com/b?a=1&b=2', 'https://example.com/a', 'https://example.com/a'])
        self.assertEqual(output.count(b'<url>'), 2)
        self.assertLess(output.index(b'/a</loc>'), output.index(b'/b?a='))
        self.assertIn(b'&amp;', output)
        self.assertNotIn(b'lastmod', output)


if __name__ == '__main__':
    unittest.main()
