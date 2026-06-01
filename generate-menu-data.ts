import { readFileSync, writeFileSync } from 'fs';

function generate() {
  const rawData = JSON.parse(readFileSync('live_menu_extracted.json', 'utf-8'));
  const dishes = rawData.dishes || [];
  
  console.log(`Processing ${dishes.length} dishes for TypeScript generation...`);
  
  // High quality Unsplash and asset mappings for context-aware placeholders
  const fallbacks: { [key: string]: string } = {
    'səhər yeməyi': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=600',
    'salatlar': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    'soyuq qəlyanaltılar': 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600',
    'şorbalar': 'https://images.unsplash.com/photo-1547592165-e1d17ffd2671?auto=format&fit=crop&q=80&w=600',
    'toyuq yeməkləri': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600',
    'xəmir yeməkləri': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
    'plovlar': 'https://images.unsplash.com/photo-1547928576-a4a3323dce9d?auto=format&fit=crop&q=80&w=600',
    'qarnirlər': 'https://images.unsplash.com/photo-1518013041235-01e404c45063?auto=format&fit=crop&q=80&w=600',
    'kabablar': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
    'balıq yeməkləri': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=600',
    'sac': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', // saj
    'ət yeməkləri': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    'souslar': 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&q=80&w=600',
    'məzə': 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600',
    'çərəzlər': 'https://images.unsplash.com/photo-1511140139194-e0c65ef454c0?auto=format&fit=crop&q=80&w=600',
    'desertlər': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
    'mürəbbələr': 'https://images.unsplash.com/photo-1582236378031-7ad653fa3b9b?auto=format&fit=crop&q=80&w=600',
    'qəhvə': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    'təzə meyvə şirələri': 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=600',
    'içkilər': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600',
    'çay': 'https://images.unsplash.com/photo-1457121665415-3224026006e3?auto=format&fit=crop&q=80&w=600',
    'spirtli': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600'
  };
  
  const mappedItems = dishes.map((d: any) => {
    const subLower = d.sub_category_name.toLowerCase().trim();
    const mainLower = d.main_category_name.toLowerCase().trim();
    
    // Determine category mapping for the UI filters
    let category = 'isti-yemekler'; // default
    
    if (subLower === 'səhər yeməyi') {
      category = 'seher-yemeyi';
    } else if (subLower === 'salatlar' || subLower === 'soyuq qəlyanaltılar' || subLower === 'məzə') {
      category = 'salatlar-mezeler';
    } else if (subLower === 'sac') {
      category = 'saclar';
    } else if (subLower === 'kabablar') {
      category = 'kabablar';
    } else if (mainLower === 'şirniyyatlar' || subLower === 'desertlər' || subLower === 'çərəzlər' || subLower === 'mürəbbələr') {
      category = 'desertler';
    } else if (mainLower === 'alkoqolsuz i̇çki̇lər' || mainLower === 'alkoqolsuz içkilər' || subLower === 'çay' || subLower === 'qəhvə' || subLower === 'içkilər' || subLower === 'təzə meyvə şirələri') {
      category = 'ickiler';
    } else if (mainLower === 'spirtli̇ i̇çki̇lər' || mainLower === 'spirtli içkilər') {
      category = 'spirtli-ickiler';
    } else if (subLower === 'şorbalar') {
      // It stays in isti-yemekler, or we can make a custom category or leave in isti-yemekler
      category = 'isti-yemekler';
    }
    
    // Fallback image logic
    let img = d.image;
    if (!img) {
      if (fallbacks[subLower]) {
        img = fallbacks[subLower];
      } else if (mainLower.includes('spirtli')) {
        img = fallbacks['spirtli'];
      } else {
        img = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'; // general meat fallback
      }
    }
    
    // Specific asset images fallback for key match items to keep Google AI images
    if (d.name.toLowerCase().includes('sac') && d.name.toLowerCase().includes('quzu')) {
      img = '/src/assets/images/qala_divari_saj_1780303742362.png';
    } else if (d.name.toLowerCase().includes('kabab') && d.name.toLowerCase().includes('assorti')) {
      img = '/src/assets/images/qala_divari_kebab_1780303675477.png';
    } else if (d.name.toLowerCase().includes('samovar') || d.name.toLowerCase().includes('çay dəstgahi')) {
      img = '/src/assets/images/qala_divari_tea_1780303698310.png';
    }
    
    // Clean string id
    const cleanId = `live-${d.id}`;
    
    // Set Popular and ChefSpecial tags for some key representative dishes
    const isPopular = d.is_popular || d.price >= 30 || d.name.toLowerCase().includes('piti') || d.name.toLowerCase().includes('sac') || d.name.toLowerCase().includes('lülə') || d.name.toLowerCase().includes('böyük') || d.name.toLowerCase().includes('manqal');
    const isChefSpecial = d.is_chef_special || d.name.toLowerCase().includes('qala divari') || d.name.toLowerCase().includes('sac quzu') || d.name.toLowerCase().includes('fəsəli') || d.name.toLowerCase().includes('piti');
    
    // Custom ingredients estimation based on name for rich popup details
    let ingredients: string[] = [];
    const nameLower = d.name.toLowerCase();
    if (nameLower.includes('sac')) {
      ingredients = ["Köz üzərində ət", "Kartof", "Badımcan", "Göyərti", "Bibər", "Kərə yağı"];
    } else if (nameLower.includes('kabab') || nameLower.includes('lülə') || nameLower.includes('tikə')) {
      ingredients = ["Manqalda bişmiş ət", "Sumax", "Közlənmiş pomidor", "Lavaş", "Soğan"];
    } else if (nameLower.includes('plov')) {
      ingredients = ["Zəfəranlı düyü", "Kərə yağı", "Süzmə parça ət", "Qaysı və kişmiş", "Şabalıd"];
    } else if (nameLower.includes('piti')) {
      ingredients = ["Quzu əti", "Noxud", "Şabalıd", "Quyruq yağı", "Zəfəran", "Quru nanə"];
    } else if (nameLower.includes('xəngəl')) {
      ingredients = ["Əl işi xəmir", "Qiymə ət", "Bol qızardılmış soğan", "Qatıq", "Sarımsaq"];
    } else if (nameLower.includes('salat') || nameLower.includes('pomidor') || nameLower.includes('mimoza') || nameLower.includes('paytaxt')) {
      ingredients = ["Təzə fermer tərəvəzləri", "Zeytun yağı", "Göbələk", "Şefin bəzəyi"];
    } else if (nameLower.includes('çay dəstgahi')) {
      ingredients = ["Kəklikotulu çay", "Paxlava", "Mürəbbələr", "Limon", "Noxud çərəzi", "Şokalad"];
    } else {
      ingredients = ["Hərarətlə hazırlanan milli inqrediyentlər", "Premium dərəcəli kərə yağı", "Dad qoruyucu ədviyyatlar"];
    }

    return {
      id: cleanId,
      name: d.name,
      description: d.description || `${d.name} — Qala Divarı restoranının sənətkar kulinarlar qrupu tərəfindən təmiz kərə yağı və təbii inqrediyentlərlə hazırlanan ləziz məhsulu.`,
      price: d.price,
      category: category,
      image: img,
      isPopular: isPopular,
      isChefSpecial: isChefSpecial,
      weight: d.weight || undefined,
      ingredients: ingredients
    };
  });
  
  // Create output file content
  const fileContent = `// Real, live Synchronized menu items extracted from cafetap.az API for restaurant 23 ("Qala Divarı")
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  weight?: string;
  ingredients?: string[];
}

export const menuItems: MenuItem[] = ${JSON.stringify(mappedItems, null, 2)};
`;

  writeFileSync('src/menuData.ts', fileContent);
  console.log(`\nSuccessfully created src/menuData.ts with ${mappedItems.length} active typed dishes!`);
}

generate();
