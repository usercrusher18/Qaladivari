import { writeFileSync } from 'fs';

async function syncMenu() {
  const restaurant_id = 23;
  const baseUrl = 'https://minda.cafetap.az/api';
  
  try {
    console.log(`Step 1: Fetching menu categories for restaurant ${restaurant_id}...`);
    const catsRes = await fetch(`${baseUrl}/food-categories?restaurant_id=${restaurant_id}&lang=az`);
    const catsData = await catsRes.json();
    const categories = catsData.data || [];
    
    console.log(`Found ${categories.length} main categories.`);
    
    let allDishes: any[] = [];
    let subCategoriesList: any[] = [];
    
    for (const cat of categories) {
      const catId = cat.id;
      const catName = cat.title || `Category ${catId}`;
      console.log(`\nStep 2: Processing Main Category "${catName}" (ID: ${catId})...`);
      
      const foodsRes = await fetch(`${baseUrl}/foods?restaurant_id=${restaurant_id}&food_category_id=${catId}&lang=az`);
      const foodsData = await foodsRes.json();
      
      if (!foodsData.success || !foodsData.data) {
        console.log(`  -> Failed/No data for category: ${catName}`);
        continue;
      }
      
      const payload = foodsData.data;
      const subCats = payload.sub_categories || [];
      const subCatFoods = payload.sub_category_foods || {};
      
      console.log(`  -> Found ${subCats.length} sub-categories under "${catName}".`);
      
      // Map of id -> title for sub-categories
      const subCatMap: { [key: number]: string } = {};
      subCats.forEach((sc: any) => {
        subCatMap[sc.id] = sc.title;
        subCategoriesList.push({
          id: sc.id,
          parent_id: catId,
          parent_title: catName,
          title: sc.title,
          position: sc.position
        });
      });
      
      // Look inside sub_category_foods object
      const subCatKeys = Object.keys(subCatFoods);
      console.log(`  -> Number of sub-category lists containing foods: ${subCatKeys.length}`);
      
      subCatKeys.forEach((subIdStr) => {
        const subId = Number(subIdStr);
        const subName = subCatMap[subId] || `Subcategory ${subId}`;
        const foodsArray = subCatFoods[subIdStr] || [];
        
        console.log(`     - Sub-category "${subName}" (ID: ${subId}): ${foodsArray.length} items`);
        
        foodsArray.forEach((food: any) => {
          // Find translation for English and Russian if they exist
          let name_en = '';
          let name_ru = '';
          let desc_en = '';
          let desc_ru = '';
          
          if (food.translations && Array.isArray(food.translations)) {
            const enTrans = food.translations.find((t: any) => t.locale === 'en');
            if (enTrans) {
              name_en = enTrans.title || '';
              desc_en = enTrans.description || '';
            }
            const ruTrans = food.translations.find((t: any) => t.locale === 'ru');
            if (ruTrans) {
              name_ru = ruTrans.title || '';
              desc_ru = ruTrans.description || '';
            }
          }
          
          allDishes.push({
            id: food.id,
            name: food.title || '',
            name_en: name_en || food.title || '',
            name_ru: name_ru || food.title || '',
            description: food.description || '',
            description_en: desc_en,
            description_ru: desc_ru,
            price: Number(food.price),
            image: food.image_url || null,
            image_relative: food.image || null,
            in_stock: food.in_stock !== false,
            is_active: food.is_active !== false,
            weight: food.weight || '',
            main_category_id: catId,
            main_category_name: catName,
            sub_category_id: subId,
            sub_category_name: subName,
            ingredients: [] // API food items have empty ingredient structures, can enrich if needed
          });
        });
      });
    }
    
    console.log(`\nStep 3: Compiling output...`);
    console.log(`Total live dishes extracted: ${allDishes.length}`);
    
    const output = {
      restaurant_id,
      last_sync: new Date().toISOString(),
      main_categories: categories.map((c: any) => ({
        id: c.id,
        title: c.title,
        image: c.image_url
      })),
      sub_categories: subCategoriesList,
      dishes: allDishes
    };
    
    writeFileSync('live_menu_extracted.json', JSON.stringify(output, null, 2));
    console.log("Full data written to live_menu_extracted.json successfully!");
    
    // Print a nice, consolidated summary of categories and item counts
    const summary: any = {};
    allDishes.forEach(d => {
      const catKey = `${d.main_category_name} -> ${d.sub_category_name}`;
      summary[catKey] = (summary[catKey] || 0) + 1;
    });
    
    console.log("\nSummary of categories and item counts:");
    for (const [key, val] of Object.entries(summary)) {
      console.log(`- ${key}: ${val} items`);
    }
    
    // Write a simplified text catalog for review
    let summaryText = "QALA DIVARI REAL-TIME MENU EXTRANET\n=================================\n\n";
    for (const [key, val] of Object.entries(summary)) {
      summaryText += `\n--- ${key} (${val} items) ---\n`;
      const catDishes = allDishes.filter(d => `${d.main_category_name} -> ${d.sub_category_name}` === key);
      catDishes.forEach(d => {
        summaryText += `- ${d.name} (${d.price} ₼) | ${d.image ? 'Has Image' : 'No Image'}\n  Desc: ${d.description || 'No description.'}\n`;
      });
    }
    writeFileSync('menu_catalog_text.txt', summaryText);
    console.log("Saved readable catalog text file to menu_catalog_text.txt");
    
  } catch (err: any) {
    console.error("Critical error in syncMenu:", err.message);
  }
}

syncMenu();
