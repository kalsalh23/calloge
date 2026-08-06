// Builds supabase/images-update.sql — fully static curated cover URLs for all
// universities and majors (no network calls, deterministic).
const fs = require('fs');
const path = require('path');

const UNIV = {
  damascus:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/UniversityDamasEngineering.jpg/1280px-UniversityDamasEngineering.jpg',
  aleppo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Aleppo_University_1960s.jpg',
  tishreen:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/University_of_Latakia_building_and_perimeter_2002.jpg/1280px-University_of_Latakia_building_and_perimeter_2002.jpg',
  baath:
    'https://upload.wikimedia.org/wikipedia/commons/3/35/Faculty_of_Medicine_in_Homs_University%2C_Syria.jpg',
  furat:
    'https://upload.wikimedia.org/wikipedia/commons/6/67/%D9%85%D8%A8%D9%86%D9%89_%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%A7%D9%84%D9%81%D8%B1%D8%A7%D8%AA.jpg',
  tartus: null,
  hama: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Hama_University_Logo.png',
  'sham-private':
    'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/sham-private-logo.png',
  'qalamoun-private':
    'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/qalamoun-logo.png',
  'qasioun-private':
    'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/qasioun-logo.png',
  'yarmouk-private': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Yarmouk_Private_University_Logo.png',
  iust: 'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/iust-logo.png',
  'hawash-private':
    'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/hawash-logo.png',
  'ittihad-private':
    'https://smpumryithpdeipkdtap.supabase.co/storage/v1/object/public/university-images/ittihad-logo.gif',
  svu: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/SVU-LOGO.jpg',
  'free-aleppo': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Aleppo-UniversitySquare-8Feb2025.jpg',
  'gaziantep-north':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Gaziantep_University_logo.svg/1280px-Gaziantep_University_logo.svg.png',
};

const MAJOR = {
  'الطب البشري':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/The_Doctor_Luke_Fildes_crop.jpg/1280px-The_Doctor_Luke_Fildes_crop.jpg',
  'طب الأسنان':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/20190202_GCC_%40_Moss_Dental_Clinic_-_46340656604.jpg/1280px-20190202_GCC_%40_Moss_Dental_Clinic_-_46340656604.jpg',
  'الصيدلة':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/PharmacistsMortar.svg/1280px-PharmacistsMortar.svg.png',
  'الهندسة المعلوماتية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Pexels-luis-gomes-546819.jpg/1280px-Pexels-luis-gomes-546819.jpg',
  'تقانة المعلومات':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Virginia_Tech_-_data_center.jpg/1280px-Virginia_Tech_-_data_center.jpg',
  'تقانة الاتصالات':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Erdfunkstelle_Raisting_2.jpg/1280px-Erdfunkstelle_Raisting_2.jpg',
  'الهندسة المدنية':
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Crane_and_new_Carrington_Bridge_-_geograph.org.uk_-_6778718.jpg',
  'الهندسة المعمارية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/View_of_Santa_Maria_del_Fiore_in_Florence.jpg/1280px-View_of_Santa_Maria_del_Fiore_in_Florence.jpg',
  'الهندسة الكهربائية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Umspannwerk-Pulverdingen_380kV-Trennschalter.jpg/1280px-Umspannwerk-Pulverdingen_380kV-Trennschalter.jpg',
  'الهندسة الميكانيكية': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Mechanical_components.png',
  'الهندسة النفطية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Pumping_Oil_%285960977380%29.jpg/1280px-Pumping_Oil_%285960977380%29.jpg',
  'هندسة تقانة المعلومات':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/STM32F100C4T6B-HD.jpg/1280px-STM32F100C4T6B-HD.jpg',
  'هندسة الميكاترونكس': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Mechatronics.jpg',
  'الرياضيات': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Math01.jpg/1280px-Math01.jpg',
  'الفيزياء':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Quantum_Physics%3B_Paired_Atoms%3B_Untrapped_Atom_Pairs_%285941065432%29.jpg/1280px-Quantum_Physics%3B_Paired_Atoms%3B_Untrapped_Atom_Pairs_%285941065432%29.jpg',
  'الكيمياء':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Reaction_Coordinate_Diagram.svg/1280px-Reaction_Coordinate_Diagram.svg.png',
  'علوم الحياة':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/DNA_simple_horizontal.svg/1280px-DNA_simple_horizontal.svg.png',
  'إدارة الأعمال':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Conference_room_in_the_Berlaymont_building_2.JPG/1280px-Conference_room_in_the_Berlaymont_building_2.JPG',
  'المحاسبة': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Pacioli.jpg/1280px-Pacioli.jpg',
  'الاقتصاد':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Euro_M%C3%BCnzgeld_und_Portmonee_mit_gr%C3%BCnem_Pfeil_%28Geld%2C_Kleingeld%2C_M%C3%BCnzen%29.jpg/1280px-Euro_M%C3%BCnzgeld_und_Portmonee_mit_gr%C3%BCnem_Pfeil_%28Geld%2C_Kleingeld%2C_M%C3%BCnzen%29.jpg',
  'الحقوق':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Justice_scale_silhouette%2C_medium.svg/1280px-Justice_scale_silhouette%2C_medium.svg.png',
  'اللغة العربية': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Learning_Arabic_calligraphy.jpg',
  'اللغة الإنجليزية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Library_books_1.jpg/1280px-Library_books_1.jpg',
  'التاريخ':
    'https://upload.wikimedia.org/wikipedia/commons/a/aa/Carstian_Luyckx_-_Still_life_with_a_globe%2C_books%2C_shells_and_corals_resting_on_a_stone_ledge.jpg',
  'الجغرافيا':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/CIA_World_Physical_Map_%282023%29.pdf/page1-1280px-CIA_World_Physical_Map_%282023%29.pdf.jpg',
  'معلم صف':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/A_public_high_school_teacher_in_a_classroom_in_the_United_States_08.jpg/1280px-A_public_high_school_teacher_in_a_classroom_in_the_United_States_08.jpg',
  'الشريعة الإسلامية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Minaret_mosque_of_Paris.jpg/1280px-Minaret_mosque_of_Paris.jpg',
  'العلوم السياسية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/UN_General_Assembly_hall.jpg/1280px-UN_General_Assembly_hall.jpg',
  'الإعلام والاتصال':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/UEFA_Euro_2020_-_Television_studio_01.jpg/1280px-UEFA_Euro_2020_-_Television_studio_01.jpg',
  'الهندسة الزراعية':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Tractor_at_work_on_a_field_in_Idaho_%28cropped%29.jpg/1280px-Tractor_at_work_on_a_field_in_Idaho_%28cropped%29.jpg',
};

const out = [];
out.push('-- Generated by scripts/fetch-images.cjs (static curated)');
out.push('');
out.push('-- ============ Universities ============');
for (const [slug, url] of Object.entries(UNIV)) {
  out.push(url ? `update public.universities set cover_url = '${url}' where slug = '${slug}';` : `-- NO IMAGE for ${slug}`);
}
out.push('');
out.push('-- ============ Majors ============');
for (const [name, url] of Object.entries(MAJOR)) {
  out.push(`update public.majors set cover_url = '${url}' where name_ar = '${name}';`);
}
fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'images-update.sql'), out.join('\n') + '\n', 'utf8');
console.log('Wrote', out.length, 'lines.');
