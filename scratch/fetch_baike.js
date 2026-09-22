const fs = require('fs');

async function scrapeUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();

    // 提取标题 <title> 或 <h1>
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/[-_].*$/, '').trim() : url;

    // 提取主要段落
    // 很多手游之家文章在 <div class="news_content">, <div class="content"> 或 <div class="neirong">
    let mainContent = '';
    const divMatches = html.matchAll(/<div[^>]*(?:class|id)=["']([^"']*(?:content|article|text|detail|neirong|context|body_content)[^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi);
    for (const m of divMatches) {
      const txt = m[2].replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, '\n')
                      .split('\n')
                      .map(s => s.trim())
                      .filter(s => s.length > 0 && !s.includes('所有游戏') && !s.includes('关于我们') && !s.includes('手游排行榜'))
                      .join('\n');
      if (txt.length > mainContent.length) {
        mainContent = txt;
      }
    }

    if (!mainContent) {
      // 提取所有的 <p> 标签内容
      const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
      mainContent = pMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 5).join('\n');
    }

    return { url, title, content: mainContent };
  } catch (err) {
    return { url, title: 'Error', content: err.message };
  }
}

async function main() {
  const urls = [
    'https://xyj.sjwyx.com/news/144931.html',
    'https://xyj.sjwyx.com/news/144932.html',
    'https://xyj.sjwyx.com/news/144934.html',
    'https://xyj.sjwyx.com/news/144936.html',
    'https://xyj.sjwyx.com/news/144937.html',
    'https://xyj.sjwyx.com/news/144939.html',
    'https://xyj.sjwyx.com/news/144941.html',
    'https://xyj.sjwyx.com/news/144947.html',
    'https://xyj.sjwyx.com/news/144948.html',
    'https://xyj.sjwyx.com/news/144950.html',
    'https://xyj.sjwyx.com/news/144961.html',
    'https://xyj.sjwyx.com/news/38058.html',
    'https://xyj.sjwyx.com/news/38701.html',
    'https://xyj.sjwyx.com/news/7695.html',
    'https://xyj.sjwyx.com/news/7698.html'
  ];

  const results = [];
  for (const u of urls) {
    console.log('Scraping:', u);
    const item = await scrapeUrl(u);
    results.push(item);
  }

  fs.writeFileSync('./scratch/baike_extracted.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved all to ./scratch/baike_extracted.json');
}

main();
