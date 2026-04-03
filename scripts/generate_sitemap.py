import os
import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom

# 設定
BASE_URL = "https://hatomaru.github.io/"
TARGET_DIRS = ["portfolio", "OneTeam_dot"]
ROOT_SITEMAP = "sitemap.xml"

# 優先度設定 (デフォルト)
PRIORITY_TOP = "1.0"
PRIORITY_CONTENTS = "0.6"
PRIORITY_OTHER = "0.6"

# 個別オーバーライド
OVERRIDE_PRIORITY = {
    "portfolio/": "1.0",
    "OneTeam_dot/": "1.0",
    "portfolio/TrackRecord/": "0.9",
    "OneTeam_dot/Guideline/StreamingGuideline.html": "0.8",
    "portfolio/contents/AIDrivenFramework.html": "0.8",
    "portfolio/contents/AfterNSecondsWorld.html": "0.8",
    "portfolio/contents/Amevar.html": "0.8",
    "OneTeam_dot/Guideline/IPPolicy.html": "0.4",
}

# 除外パス
EXCLUDE_PATHS = [
    "OneTeam_dot/Guideline/BlockWorldAi.html",
    "OneTeam_dot/PrivacyPolicy-lab/en/",
    "OneTeam_dot/PrivacyPolicy-lab/jp/",
    "sitemap.xml",
    "sitemap_v2.xml",
]

EXCLUDE_FILENAMES = [
    "googled6fe98151435cadd.html"
]

def get_lastmod(filepath):
    """ファイルの最終更新日時を取得（ISO 8601形式）"""
    mtime = os.path.getmtime(filepath)
    dt = datetime.datetime.fromtimestamp(mtime)
    return dt.strftime('%Y-%m-%d')

def save_pretty_xml(root_node, filepath):
    xml_str = ET.tostring(root_node, encoding='utf-8')
    dom = minidom.parseString(xml_str)
    pretty_xml_bytes = dom.toprettyxml(indent="  ", encoding="UTF-8")
    with open(filepath, "wb") as f:
        f.write(pretty_xml_bytes)

def generate_sitemaps():
    all_urls = []

    for target_dir in TARGET_DIRS:
        if not os.path.exists(target_dir):
            continue
            
        urlset_node = ET.Element("urlset", {
            "xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
        })
        urls_found = []

        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if not file.endswith(".html"):
                    continue
                
                if file in EXCLUDE_FILENAMES:
                    continue

                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, ".").replace("\\", "/")
                
                if rel_path.endswith("index.html"):
                    url_path = rel_path[:-10]
                else:
                    url_path = rel_path
                
                is_excluded = False
                for ex in EXCLUDE_PATHS:
                    if rel_path == ex or url_path == ex:
                        is_excluded = True
                        break
                if is_excluded:
                    continue

                url = BASE_URL + url_path
                
                # 優先度の決定
                priority = PRIORITY_OTHER
                if url_path in OVERRIDE_PRIORITY:
                    priority = OVERRIDE_PRIORITY[url_path]
                elif "portfolio/contents/" in rel_path:
                    priority = PRIORITY_CONTENTS
                
                lastmod = get_lastmod(filepath)
                
                data = {
                    "loc": url,
                    "lastmod": lastmod,
                    "priority": priority
                }
                urls_found.append(data)
                all_urls.append(data)

        if not urls_found:
            continue

        sorted_urls = sorted(urls_found, key=lambda x: x["loc"])
        for u in sorted_urls:
            url_node = ET.SubElement(urlset_node, "url")
            ET.SubElement(url_node, "loc").text = u["loc"]
            ET.SubElement(url_node, "lastmod").text = u["lastmod"]
            ET.SubElement(url_node, "priority").text = u["priority"]

        target_sitemap = os.path.join(target_dir, "sitemap.xml")
        save_pretty_xml(urlset_node, target_sitemap)
        print(f"Generated {target_sitemap} with {len(sorted_urls)} entries.")

    # Root Consolidated Sitemap (urlset)
    root_node = ET.Element("urlset", {
        "xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation": "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    })
    
    unique_urls = {u["loc"]: u for u in all_urls}.values()
    sorted_all_urls = sorted(unique_urls, key=lambda x: x["loc"])

    for u in sorted_all_urls:
        url_node = ET.SubElement(root_node, "url")
        ET.SubElement(url_node, "loc").text = u["loc"]
        ET.SubElement(url_node, "lastmod").text = u["lastmod"]
        ET.SubElement(url_node, "priority").text = u["priority"]

    save_pretty_xml(root_node, ROOT_SITEMAP)
    print(f"Generated root consolidated {ROOT_SITEMAP} with {len(sorted_all_urls)} entries.")

if __name__ == "__main__":
    generate_sitemaps()
