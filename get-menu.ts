import { writeFileSync } from 'fs';

async function scanAllBundlesForAPICalls() {
  const bundles = [
    'https://menu.cafetap.az/_nuxt/cee28f8.js',
    'https://menu.cafetap.az/_nuxt/35a7079.js',
    'https://menu.cafetap.az/_nuxt/cf7cc1b.js',
    'https://menu.cafetap.az/_nuxt/bdced0d.js',
    'https://menu.cafetap.az/_nuxt/0b94556.js'
  ];
  
  for (const bundle of bundles) {
    console.log(`\nScanning bundle: ${bundle}`);
    try {
      const res = await fetch(bundle);
      const text = await res.text();
      
      // Find occurrences of "foods" or "categories" that are NOT in CSS (avoid curly braces or font-size)
      // Look for strings like "/foods" or "/categories" or "foods" or "categories" next to api / get / post
      const keywords = ['/foods', '/categories', 'restaurant', 'foods?'];
      
      for (const kw of keywords) {
        let idx = text.indexOf(kw);
        let found = 0;
        while (idx !== -1 && found < 5) {
          // Look for context
          const start = Math.max(0, idx - 80);
          const end = Math.min(text.length, idx + 120);
          const snippet = text.substring(start, end);
          
          // Filter out CSS styling blocks (e.g. including "font-size", "height:", "width:", etc.)
          if (!snippet.includes('font-') && !snippet.includes('height:') && !snippet.includes('width:') && !snippet.includes('padding:')) {
            console.log(`  -> Found kw "${kw}" in ${bundle.split('/').pop()} at ${idx}:`);
            console.log(`     ...${snippet.replace(/\s+/g, ' ')}...`);
            found++;
          }
          idx = text.indexOf(kw, idx + kw.length);
        }
      }
    } catch (e: any) {
      console.log(`Error: ${e.message}`);
    }
  }
}

scanAllBundlesForAPICalls();
