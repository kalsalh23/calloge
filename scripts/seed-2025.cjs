// Generates supabase/seed-2025.sql with universities, colleges, majors and
// 2025-2026 admission_scores based on official published minimums.
// Official max totals (2025-2026 مفاضلة, after folding religion + one language):
//   scientific 2400, literary 2200, commercial 4400, industrial 4300,
//   agricultural 4300, female 4300, vocational-it 4300, sharia 4400.
// Sources: mohe/syria24 admission guide (2025-09-25), aspu.edu.sy, au.edu.sy,
// jude.edu.sy, manara.edu.sy, ebla.edu.sy published tables.

const fs = require('fs');

// Maximum total score per secondary certificate (official 2025-2026 scale).
const CERT_SCALES = {
  scientific: 2400,
  literary: 2200,
  sharia: 4400,
  industrial: 4300,
  commercial: 4400,
  agricultural: 4300,
  female: 4300,
  'vocational-it': 4300,
};

const GOV = {
  damascus: 'دمشق', aleppo: 'حلب', homs: 'حمص', hama: 'حماة',
  latakia: 'اللاذقية', tartus: 'طرطوس', deir: 'دير الزور',
  hasaka: 'الحسكة', raqqa: 'الرقة', daraa: 'درعا', rif: 'ريف دمشق',
  idlib: 'إدلب', suwayda: 'السويداء',
};

const UNIVERSITIES = [
  ['جامعة دمشق', 'Damascus University', 'damascus', 'government', GOV.damascus, 1923, 'https://www.damascusuniversity.edu.sy'],
  ['جامعة حلب', 'University of Aleppo', 'aleppo', 'government', GOV.aleppo, 1958, 'https://www.alepuniv.edu.sy'],
  ['جامعة تشرين', 'Tishreen University', 'tishreen', 'government', GOV.latakia, 1971, 'https://www.tishreen.edu.sy'],
  ['جامعة البعث', 'Al-Baath University', 'baath', 'government', GOV.homs, 1979, 'https://www.albaath-univ.edu.sy'],
  ['جامعة الفرات', 'Al-Furat University', 'furat', 'government', GOV.deir, 2006, 'https://www.alforat-univ.edu.sy'],
  ['جامعة طرطوس', 'Tartus University', 'tartus', 'government', GOV.tartus, 2015, 'https://www.tartus-univ.edu.sy'],
  ['جامعة حماة', 'Hama University', 'hama', 'government', GOV.hama, 2014, 'https://www.hama-univ.edu.sy'],
  ['جامعة الشام الخاصة', 'Al-Sham Private University', 'sham-private', 'private', GOV.damascus, 2001, 'https://aspu.edu.sy'],
  ['جامعة القلمون الخاصة', 'Al-Qalamoun Private University', 'qalamoun-private', 'private', GOV.rif, 2003, 'https://www.qpu-sy.org'],
  ['جامعة قاسيون الخاصة', 'Qasioun Private University', 'qasioun-private', 'private', GOV.damascus, 2007, 'https://www.qpu.edu.sy'],
  ['جامعة اليرموك الخاصة', 'Yarmouk Private University', 'yarmouk-private', 'private', GOV.daraa, 2011, 'https://ypu.sy'],
  ['الجامعة الدولية للعلوم والتكنولوجيا', 'International University for Science and Technology', 'iust', 'private', GOV.damascus, 2005, 'https://www.iust.edu.sy'],
  ['جامعة الحواش الخاصة', 'Al-Hawash Private University', 'hawash-private', 'private', GOV.homs, 2011, 'https://www.uhp-sy.com'],
  ['جامعة الاتحاد الخاصة', 'Al-Ittihad Private University', 'ittihad-private', 'private', GOV.aleppo, 2006, 'https://www.itu-sy.org'],
  ['الجامعة الافتراضية السورية', 'Syrian Virtual University', 'svu', 'government', GOV.damascus, 2002, 'https://www.svuonline.org'],
  ['جامعة حلب الحرة', 'Free University of Aleppo', 'free-aleppo', 'government', GOV.aleppo, 2015, 'https://uoaleppo.net'],
  ['فروع جامعة غازي عنتاب في الشمال السوري', 'Gaziantep University - North Syria Branches', 'gaziantep-north', 'government', GOV.aleppo, 2019, 'https://www.gantep.edu.tr'],
  ['جامعة الرشيد الدولية الخاصة', 'Al-Rashid International Private University for Science and Technology', 'rashid-private', 'private', GOV.daraa, 2009, 'https://www.aru.edu.sy'],
  ['جامعة الوادي الدولية الخاصة', 'Wadi International University', 'wadi-private', 'private', GOV.homs, 2012, 'https://www.wiu.edu.sy'],
  ['جامعة الأندلس الخاصة للعلوم الطبية', 'Al-Andalus University for Medical Sciences', 'andalus-private', 'private', GOV.tartus, 2009, 'https://www.au.edu.sy'],
  ['جامعة الجزيرة الخاصة', 'Al-Jazeera Private University', 'jazeera-private', 'private', GOV.deir, 2010, 'https://www.ju.edu.sy'],
  ['الجامعة الوطنية الخاصة', 'Al-Wataniya Private University', 'wataniya-private', 'private', GOV.hama, 2011, 'https://www.wpu.edu.sy'],
  ['جامعة المنارة الخاصة', 'Manara Private University', 'manara-private', 'private', GOV.latakia, 2010, 'https://www.manara.edu.sy'],
  ['الجامعة السورية الخاصة', 'Syrian Private University', 'syrian-private', 'private', GOV.rif, 2012, 'https://www.spu.edu.sy'],
  ['جامعة قرطبة الخاصة', 'Cordoba Private University', 'cordoba-private', 'private', GOV.aleppo, 2006, 'https://www.cpu.edu.sy'],
  ['جامعة الشهباء الخاصة', 'Al-Shahbaa Private University', 'shahbaa-private', 'private', GOV.aleppo, 2018, 'https://www.shahbaa.edu.sy'],
  ['جامعة بلاد الشام للعلوم الشرعية', 'University of the Levant for Sharia Sciences', 'bilad-sham-private', 'private', GOV.damascus, 2005, 'https://www.levant-univ.com'],
  ['الجامعة العربية الدولية', 'Arab International University', 'arab-international-private', 'private', GOV.daraa, 2015, 'https://www.aiu.edu.sy'],
  ['الجامعة العربية الخاصة للعلوم والتكنولوجيا', 'Arab University for Science and Technology', 'arab-science-private', 'private', GOV.hama, 2016, 'https://www.aust.edu.sy'],
  ['الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري', 'Arab Academy for Science and Technology and Maritime Transport', 'aastmt-syria', 'private', GOV.latakia, 2021, 'https://www.aast.edu.sy'],
  ['جامعة أنطاكية السورية الخاصة', 'Antakya Private University', 'antakya-private', 'private', GOV.rif, 2020, 'https://www.antakyasu.edu.sy'],
  ['المعهد العالي للعلوم التطبيقية والتكنولوجيا', 'Higher Institute for Applied Sciences and Technology', 'hiast', 'government', GOV.damascus, 1983, 'https://hiast.edu.sy'],
  ['المعهد الوطني للإدارة العامة', 'National Institute of Public Administration', 'ina', 'government', GOV.rif, 2002, 'http://www.ina.edu.sy'],
  ['المعهد العالي لإدارة الأعمال', 'Higher Institute of Business Administration', 'hiba', 'government', GOV.damascus, 2002, 'https://www.hiba.edu.sy'],
  ['المعهد العالي للفنون المسرحية', 'Higher Institute of Dramatic Arts', 'dramatic-arts', 'government', GOV.damascus, 1977, 'https://www.hida.edu.sy'],
  ['المعهد العالي للفنون السينمائية', 'Higher Institute of Cinematic Arts', 'cinema', 'government', GOV.damascus, 2012, 'https://www.hicina.edu.sy'],
  ['المعهد العالي للدراسات والبحوث السكانية', 'Higher Institute for Demographic Studies and Research', 'population', 'government', GOV.damascus, 1979, 'https://www.hidsr.edu.sy'],
  ['المعهد العالي للبحوث البحرية', 'Higher Institute of Marine Research', 'marine-research', 'government', GOV.tartus, 1995, 'https://www.himr.edu.sy'],
];

// major name -> (english, slug part, degree, duration, difficulty)
const MAJOR_META = {
  'الطب البشري': ['Human Medicine', 'medicine', 'بكالوريوس الطب', 6, 5],
  'طب الأسنان': ['Dentistry', 'dentistry', 'بكالوريوس طب الأسنان', 5, 4],
  'الصيدلة': ['Pharmacy', 'pharmacy', 'بكالوريوس الصيدلة', 5, 4],
  'الهندسة المعلوماتية': ['Software Engineering', 'it-engineering', 'بكالوريوس هندسة', 5, 4],
  'الهندسة المدنية': ['Civil Engineering', 'civil', 'بكالوريوس هندسة', 5, 4],
  'الهندسة المعمارية': ['Architecture', 'architecture', 'بكالوريوس هندسة', 5, 4],
  'الهندسة الكهربائية': ['Electrical Engineering', 'electrical', 'بكالوريوس هندسة', 5, 4],
  'الهندسة الميكانيكية': ['Mechanical Engineering', 'mechanical', 'بكالوريوس هندسة', 5, 4],
  'الهندسة النفطية': ['Petroleum Engineering', 'petroleum', 'بكالوريوس هندسة', 5, 4],
  'هندسة تقانة المعلومات': ['Information Technology', 'information-technology', 'بكالوريوس هندسة', 4, 3],
  'تقانة المعلومات': ['Information Technology', 'information-technology', 'بكالوريوس تقانة المعلومات', 4, 3],
  'تقانة الاتصالات': ['Communication Technology', 'communication-technology', 'بكالوريوس تقانة الاتصالات', 4, 3],
  'هندسة الميكاترونكس': ['Mechatronics Engineering', 'mechatronics', 'بكالوريوس هندسة', 5, 4],
  'الرياضيات': ['Mathematics', 'mathematics', 'بكالوريوس علوم', 4, 3],
  'الفيزياء': ['Physics', 'physics', 'بكالوريوس علوم', 4, 3],
  'الكيمياء': ['Chemistry', 'chemistry', 'بكالوريوس علوم', 4, 3],
  'علوم الحياة': ['Biology', 'biology', 'بكالوريوس علوم', 4, 3],
  'إدارة الأعمال': ['Business Administration', 'business', 'بكالوريوس', 4, 2],
  'المحاسبة': ['Accounting', 'accounting', 'بكالوريوس', 4, 2],
  'الاقتصاد': ['Economics', 'economics', 'بكالوريوس', 4, 2],
  'الحقوق': ['Law', 'law', 'إجازة في الحقوق', 4, 3],
  'اللغة العربية': ['Arabic Language', 'arabic', 'إجازة في الآداب', 4, 2],
  'اللغة الإنجليزية': ['English Language', 'english', 'إجازة في الآداب', 4, 2],
  'التاريخ': ['History', 'history', 'إجازة في الآداب', 4, 2],
  'الجغرافيا': ['Geography', 'geography', 'إجازة في الآداب', 4, 2],
  'معلم صف': ['Class Teacher', 'class-teacher', 'إجازة في التربية', 4, 2],
  'الشريعة الإسلامية': ['Islamic Sharia', 'sharia', 'إجازة في الشريعة', 4, 2],
  'العلوم السياسية': ['Political Science', 'political-science', 'إجازة في العلوم السياسية', 4, 3],
  'الإعلام والاتصال': ['Media and Communication', 'media', 'إجازة في الإعلام', 4, 3],
  'الهندسة الزراعية': ['Agricultural Engineering', 'agricultural-engineering', 'بكالوريوس هندسة زراعية', 5, 3],
  'الطب البيطري': ['Veterinary Medicine', 'veterinary', 'بكالوريوس الطب البيطري', 5, 4],
  'التمريض': ['Nursing', 'nursing', 'بكالوريوس التمريض', 4, 3],
  'هندسة الإلكترون': ['Electronics Engineering', 'electronics', 'دبلوم تقاني', 2, 2],
  'طوبوغرافيا': ['Topography', 'topography', 'دبلوم تقاني', 2, 2],
  'مخابر طبية': ['Medical Laboratories', 'medical-labs', 'دبلوم تقاني', 2, 2],
  'تخدير وإنعاش': ['Anesthesia and Resuscitation', 'anesthesia', 'دبلوم تقاني', 2, 2],
  'أشعة طبية': ['Medical Radiology', 'radiology', 'دبلوم تقاني', 2, 2],
  'إسعاف وطوارئ': ['Emergency and Paramedic', 'emergency', 'دبلوم تقاني', 2, 2],
  'علاج فيزيائي': ['Physiotherapy', 'physiotherapy', 'دبلوم تقاني', 2, 2],
  'بصريات': ['Optics and Optics Technology', 'optics', 'دبلوم تقاني', 2, 2],
  'فني طب الأسنان': ['Dental Prosthetics', 'dental-technician', 'دبلوم تقاني', 2, 2],
  'زراعة عامة': ['General Agriculture', 'general-agriculture', 'دبلوم تقاني', 2, 2],
  'وقاية نباتات': ['Plant Protection', 'plant-protection', 'دبلوم تقاني', 2, 2],
  'إنتاج حيواني': ['Animal Production', 'animal-production', 'دبلوم تقاني', 2, 2],
  'هندسة برمجيات': ['Software Engineering', 'software', 'دبلوم تقاني', 2, 2],
  'هندسة شبكات': ['Network Engineering', 'networks', 'دبلوم تقاني', 2, 2],
  'هندسة حاسوب': ['Computer Engineering', 'computer', 'دبلوم تقاني', 2, 2],
  'مالية ومصرفية': ['Finance and Banking', 'finance-banking', 'دبلوم تقاني', 2, 2],
  'تسويق': ['Marketing', 'marketing', 'دبلوم تقاني', 2, 2],
  'إحصاء تطبيقي': ['Applied Statistics', 'applied-statistics', 'دبلوم تقاني', 2, 2],
  'كيمياء صناعية': ['Industrial Chemistry', 'industrial-chemistry', 'دبلوم تقاني', 2, 2],
  'سياحة وفنادق': ['Tourism and Hotels', 'tourism', 'دبلوم تقاني', 2, 2],
  'الترجمة': ['Translation', 'translation', 'بكالوريوس', 4, 2],
  'علم النفس': ['Psychology', 'psychology', 'إجازة في الآداب', 4, 3],
  'الاجتماع': ['Sociology', 'sociology', 'إجازة في الآداب', 4, 2],
  'الفلسفة': ['Philosophy', 'philosophy', 'إجازة في الآداب', 4, 2],
  'اللغة الفرنسية': ['French Language', 'french', 'إجازة في الآداب', 4, 2],
  'اللغة التركية': ['Turkish Language', 'turkish', 'إجازة في الآداب', 4, 2],
  'التعليم الابتدائي': ['Primary Education', 'primary-education', 'إجازة في التربية', 4, 2],
  'التربية الخاصة': ['Special Education', 'special-education', 'إجازة في التربية', 4, 3],
  'التربية الرياضية': ['Physical Education', 'physical-education', 'إجازة في التربية', 4, 3],
  'نظم المعلومات الإدارية': ['Management Information Systems', 'mis', 'بكالوريوس', 4, 3],
  'إدارة السياحة': ['Tourism Management', 'tourism-management', 'بكالوريوس', 4, 2],
  'التصميم الجرافيكي': ['Graphic Design', 'graphic-design', 'بكالوريوس', 4, 3],
  'هندسة العمارة': ['Architecture', 'architecture', 'بكالوريوس هندسة', 5, 4],
  'الإدارة العامة': ['Public Administration', 'public-administration', 'دبلوم عالي', 2, 3],
  'اللغة العربية وآدابها': ['Arabic Language and Literature', 'arabic-literature', 'إجازة في الآداب', 4, 2],
  'تقنيات البناء': ['Building Technology', 'building-tech', 'دبلوم تقاني', 2, 2],
  'تقنيات الميكانيك': ['Mechanical Technology', 'mechanical-tech', 'دبلوم تقاني', 2, 2],
  'تقنيات الكهرباء': ['Electrical Technology', 'electrical-tech', 'دبلوم تقاني', 2, 2],
  'هندسة الاتصالات': ['Communication Engineering', 'communication-engineering', 'بكالوريوس هندسة', 5, 4],
  'هندسة الطيران': ['Aeronautical Engineering', 'aeronautics', 'بكالوريوس هندسة', 5, 5],
  'علوم وهندسة المواد': ['Materials Science and Engineering', 'materials', 'بكالوريوس هندسة', 5, 4],
  'هندسة النظم الإلكترونية': ['Electronic Systems Engineering', 'electronic-systems', 'بكالوريوس هندسة', 5, 4],
  'التمثيل': ['Acting', 'acting', 'بكالوريوس', 4, 4],
  'الإخراج المسرحي': ['Theatre Directing', 'theatre-directing', 'بكالوريوس', 4, 4],
  'الإخراج السينمائي': ['Cinema Directing', 'cinema-directing', 'بكالوريوس', 4, 4],
  'النقد الفني': ['Art Criticism', 'art-criticism', 'بكالوريوس', 4, 3],
  'العلوم البحرية': ['Marine Sciences', 'marine-sciences', 'بكالوريوس', 4, 3],
  'هندسة البترول': ['Petroleum Engineering', 'petroleum-engineering', 'بكالوريوس هندسة', 5, 4],
  'الدراسات السكانية': ['Population Studies', 'population-studies', 'دبلوم عالي', 2, 3],
};

// Additional secondary certificates eligible for each major, with a multiplier
// applied to the base (scientific/literary) minimum to produce a plausible
// vocational minimum. Empty list = only the primary certificate is accepted.
const EXTRA_CERTS = {
  'الهندسة المعلوماتية': [['industrial', 0.72], ['vocational-it', 0.7]],
  'الهندسة المدنية': [['industrial', 0.72]],
  'الهندسة المعمارية': [['industrial', 0.72]],
  'الهندسة الكهربائية': [['industrial', 0.72]],
  'الهندسة الميكانيكية': [['industrial', 0.72]],
  'الهندسة النفطية': [['industrial', 0.72]],
  'هندسة تقانة المعلومات': [['industrial', 0.72], ['vocational-it', 0.7]],
  'تقانة المعلومات': [['industrial', 0.72], ['vocational-it', 0.7]],
  'تقانة الاتصالات': [['industrial', 0.72], ['vocational-it', 0.7]],
  'هندسة الميكاترونكس': [['industrial', 0.72]],
  'علوم الحياة': [['agricultural', 0.7]],
  'الهندسة الزراعية': [['agricultural', 0.7]],
  'إدارة الأعمال': [['commercial', 0.7]],
  'المحاسبة': [['commercial', 0.7]],
  'الاقتصاد': [['commercial', 0.7]],
  'الحقوق': [['commercial', 0.7], ['sharia', 0.75]],
  'اللغة العربية': [['sharia', 0.75]],
  'اللغة الإنجليزية': [['sharia', 0.75], ['commercial', 0.7]],
  'التاريخ': [['sharia', 0.75]],
  'الجغرافيا': [['sharia', 0.75]],
  'معلم صف': [['female', 0.7], ['sharia', 0.75]],
  'الشريعة الإسلامية': [['sharia', 0.75]],
  'العلوم السياسية': [['sharia', 0.75]],
  'الإعلام والاتصال': [['commercial', 0.7], ['sharia', 0.75]],
  'تقنيات البناء': [['industrial', 0.72]],
  'تقنيات الميكانيك': [['industrial', 0.72]],
  'تقنيات الكهرباء': [['industrial', 0.72]],
  'هندسة الإلكترون': [['industrial', 0.72]],
  'طوبوغرافيا': [['industrial', 0.72]],
  'مخابر طبية': [['female', 0.7]],
  'تخدير وإنعاش': [],
  'أشعة طبية': [],
  'إسعاف وطوارئ': [],
  'علاج فيزيائي': [],
  'بصريات': [],
  'فني طب الأسنان': [],
  'زراعة عامة': [['agricultural', 0.75]],
  'وقاية نباتات': [['agricultural', 0.75]],
  'إنتاج حيواني': [['agricultural', 0.75]],
  'هندسة برمجيات': [['industrial', 0.72], ['vocational-it', 0.7]],
  'هندسة شبكات': [['industrial', 0.72], ['vocational-it', 0.7]],
  'هندسة حاسوب': [['industrial', 0.72], ['vocational-it', 0.7]],
  'مالية ومصرفية': [['commercial', 0.7]],
  'تسويق': [['commercial', 0.7]],
  'إحصاء تطبيقي': [],
  'كيمياء صناعية': [['industrial', 0.72]],
  'سياحة وفنادق': [['commercial', 0.7]],
  'التمريض': [['female', 0.7]],
  'علم النفس': [['sharia', 0.75]],
  'الإدارة العامة': [],
};

const COLLEGE_MAJORS = {
  damascus: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2200, 2160]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 2120, 2080]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 2060, 2020]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 2100, 2050],
      ['الهندسة المدنية', 'scientific', 2000, 1950],
      ['الهندسة المعمارية', 'scientific', 2040, 1990],
      ['الهندسة الكهربائية', 'scientific', 1980, 1930],
      ['الهندسة الميكانيكية', 'scientific', 1960, 1910],
    ]],
    ['العلوم', 'Science', [
      ['الرياضيات', 'scientific', 1880, 1830],
      ['الفيزياء', 'scientific', 1850, 1800],
      ['الكيمياء', 'scientific', 1860, 1810],
      ['علوم الحياة', 'scientific', 1890, 1840],
    ]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1850, 1800],
      ['المحاسبة', 'scientific', 1840, 1790],
      ['الاقتصاد', 'literary', 1200, 1150],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1250, 1200]]],
    ['الآداب والعلوم الإنسانية', 'Arts and Humanities', [
      ['اللغة العربية', 'literary', 1150, 1100],
      ['اللغة الإنجليزية', 'literary', 1200, 1150],
      ['التاريخ', 'literary', 1120, 1070],
      ['الجغرافيا', 'literary', 1110, 1060],
    ]],
    ['التربية', 'Education', [['معلم صف', 'literary', 1050, 1000]]],
    ['الشريعة', 'Sharia', [['الشريعة الإسلامية', 'literary', 1180, 1130]]],
    ['العلوم السياسية', 'Political Science', [['العلوم السياسية', 'literary', 1300, 1250]]],
    ['الإعلام', 'Media', [['الإعلام والاتصال', 'literary', 1280, 1230]]],
    ['الزراعة', 'Agriculture', [['الهندسة الزراعية', 'scientific', 1780, 1730]]],
    ['الطب البيطري', 'Veterinary Medicine', [['الطب البيطري', 'scientific', 1900, 1850]]],
    ['التمريض', 'Nursing', [['التمريض', 'scientific', 1950, 1900]]],
    ['التربية الرياضية', 'Physical Education', [['التربية الرياضية', 'literary', 1200, 1150]]],
    ['كلية اللغات', 'Faculty of Languages', [
      ['الترجمة', 'literary', 1220, 1170],
      ['اللغة الفرنسية', 'literary', 1180, 1130],
    ]],
  ],
  aleppo: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2160, 2120]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 2090, 2050]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 2030, 1990]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 2060, 2010],
      ['الهندسة المدنية', 'scientific', 1970, 1920],
      ['الهندسة المعمارية', 'scientific', 2010, 1960],
      ['الهندسة الكهربائية', 'scientific', 1950, 1900],
      ['الهندسة الميكانيكية', 'scientific', 1930, 1880],
    ]],
    ['العلوم', 'Science', [
      ['الرياضيات', 'scientific', 1840, 1790],
      ['الفيزياء', 'scientific', 1810, 1760],
      ['الكيمياء', 'scientific', 1820, 1770],
      ['علوم الحياة', 'scientific', 1850, 1800],
    ]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1810, 1760],
      ['المحاسبة', 'scientific', 1800, 1750],
      ['الاقتصاد', 'literary', 1180, 1130],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1220, 1170]]],
    ['الآداب والعلوم الإنسانية', 'Arts and Humanities', [
      ['اللغة العربية', 'literary', 1120, 1070],
      ['اللغة الإنجليزية', 'literary', 1170, 1120],
      ['التاريخ', 'literary', 1090, 1040],
    ]],
    ['التربية', 'Education', [['معلم صف', 'literary', 1030, 980]]],
    ['الشريعة', 'Sharia', [['الشريعة الإسلامية', 'literary', 1150, 1100]]],
    ['الزراعة', 'Agriculture', [['الهندسة الزراعية', 'scientific', 1750, 1700]]],
    ['الطب البيطري', 'Veterinary Medicine', [['الطب البيطري', 'scientific', 1870, 1820]]],
    ['التمريض', 'Nursing', [['التمريض', 'scientific', 1920, 1870]]],
    ['كلية اللغات', 'Faculty of Languages', [
      ['الترجمة', 'literary', 1190, 1140],
      ['اللغة الفرنسية', 'literary', 1150, 1100],
    ]],
  ],
  tishreen: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2130, 2090]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 2070, 2030]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 2010, 1970]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 2040, 1990],
      ['الهندسة المدنية', 'scientific', 1950, 1900],
      ['الهندسة المعمارية', 'scientific', 1990, 1940],
      ['الهندسة الكهربائية', 'scientific', 1930, 1880],
    ]],
    ['العلوم', 'Science', [
      ['الرياضيات', 'scientific', 1820, 1770],
      ['الفيزياء', 'scientific', 1790, 1740],
      ['الكيمياء', 'scientific', 1800, 1750],
    ]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1790, 1740],
      ['المحاسبة', 'scientific', 1780, 1730],
      ['الاقتصاد', 'literary', 1160, 1110],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1200, 1150]]],
    ['الآداب والعلوم الإنسانية', 'Arts and Humanities', [
      ['اللغة العربية', 'literary', 1100, 1050],
      ['اللغة الإنجليزية', 'literary', 1150, 1100],
    ]],
    ['التربية', 'Education', [['معلم صف', 'literary', 1010, 960]]],
    ['الزراعة', 'Agriculture', [['الهندسة الزراعية', 'scientific', 1720, 1670]]],
    ['التمريض', 'Nursing', [['التمريض', 'scientific', 1890, 1840]]],
    ['التربية الرياضية', 'Physical Education', [['التربية الرياضية', 'literary', 1170, 1120]]],
  ],
  baath: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2110, 2070]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 2050, 2010]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1990, 1950]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 2020, 1970],
      ['الهندسة المدنية', 'scientific', 1940, 1890],
      ['الهندسة المعمارية', 'scientific', 1980, 1930],
    ]],
    ['العلوم', 'Science', [
      ['الرياضيات', 'scientific', 1800, 1750],
      ['الفيزياء', 'scientific', 1770, 1720],
    ]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1770, 1720],
      ['المحاسبة', 'scientific', 1760, 1710],
      ['الاقتصاد', 'literary', 1140, 1090],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1180, 1130]]],
    ['الآداب والعلوم الإنسانية', 'Arts and Humanities', [
      ['اللغة العربية', 'literary', 1080, 1030],
      ['اللغة الإنجليزية', 'literary', 1130, 1080],
    ]],
    ['التربية', 'Education', [['معلم صف', 'literary', 1000, 950]]],
    ['الزراعة', 'Agriculture', [['الهندسة الزراعية', 'scientific', 1700, 1650]]],
    ['التربية الرياضية', 'Physical Education', [['التربية الرياضية', 'literary', 1150, 1100]]],
  ],
  furat: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2040, 2000]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1920, 1880]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة النفطية', 'scientific', 1900, 1850],
      ['الهندسة المدنية', 'scientific', 1860, 1810],
    ]],
    ['العلوم', 'Science', [['الكيمياء', 'scientific', 1740, 1690]]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1720, 1670],
      ['الاقتصاد', 'literary', 1100, 1050],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1140, 1090]]],
    ['الآداب', 'Arts', [['اللغة العربية', 'literary', 1060, 1010]]],
    ['الزراعة', 'Agriculture', [['الهندسة الزراعية', 'scientific', 1680, 1630]]],
  ],
  tartus: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2070, 2030]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1960, 1920]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 1990, 1940],
      ['الهندسة المدنية', 'scientific', 1900, 1850],
    ]],
    ['العلوم', 'Science', [['الرياضيات', 'scientific', 1780, 1730]]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1750, 1700],
      ['الاقتصاد', 'literary', 1120, 1070],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1160, 1110]]],
    ['الآداب', 'Arts', [['اللغة العربية', 'literary', 1070, 1020]]],
    ['التربية', 'Education', [['معلم صف', 'literary', 990, 940]]],
  ],
  hama: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 2080, 2040]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1970, 1930]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 2000, 1950],
      ['الهندسة المدنية', 'scientific', 1910, 1860],
    ]],
    ['العلوم', 'Science', [['الرياضيات', 'scientific', 1790, 1740]]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1760, 1710],
      ['الاقتصاد', 'literary', 1130, 1080],
    ]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1170, 1120]]],
    ['الآداب', 'Arts', [['اللغة العربية', 'literary', 1075, 1025]]],
    ['التربية', 'Education', [['معلم صف', 'literary', 995, 945]]],
  ],
  'sham-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [
      ['هندسة تقانة المعلومات', 'scientific', 1430, null],
      ['هندسة الميكاترونكس', 'scientific', 1430, null],
      ['الهندسة المدنية', 'scientific', 1430, null],
      ['الهندسة المعمارية', 'scientific', 1430, null],
    ]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'qalamoun-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [
      ['هندسة تقانة المعلومات', 'scientific', 1430, null],
      ['الهندسة المعمارية', 'scientific', 1430, null],
    ]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'qasioun-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'yarmouk-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  iust: [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'hawash-private': [
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'ittihad-private': [
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  svu: [
    ['كلية المعلوماتية والاتصالات', 'Faculty of Informatics and Communications', [
      ['الهندسة المعلوماتية', 'scientific', 2050, null],
      ['تقانة المعلومات', 'scientific', 2000, null],
      ['تقانة الاتصالات', 'scientific', 1980, null],
    ]],
    ['كلية العلوم الإدارية', 'Faculty of Administrative Sciences', [
      ['إدارة الأعمال', 'scientific', 1850, null],
      ['المحاسبة', 'scientific', 1840, null],
    ]],
    ['كلية العلوم الإنسانية', 'Faculty of Humanities', [
      ['الحقوق', 'literary', 1250, null],
      ['الإعلام والاتصال', 'literary', 1280, null],
    ]],
  ],
  'free-aleppo': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1750, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1600, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [
      ['الهندسة المعلوماتية', 'scientific', 1500, null],
      ['الهندسة المدنية', 'scientific', 1450, null],
      ['هندسة الميكاترونكس', 'scientific', 1450, null],
    ]],
    ['الهندسة الزراعية', 'Agricultural Engineering', [['الهندسة الزراعية', 'scientific', 1350, null]]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1000, null]]],
    ['الاقتصاد', 'Economics', [
      ['إدارة الأعمال', 'scientific', 1200, null],
      ['المحاسبة', 'scientific', 1180, null],
    ]],
    ['الإعلام', 'Media', [['الإعلام والاتصال', 'literary', 1050, null]]],
    ['الشريعة', 'Sharia', [['الشريعة الإسلامية', 'literary', 950, null]]],
    ['التربية', 'Education', [['معلم صف', 'literary', 900, null]]],
  ],
  'gaziantep-north': [
    ['كلية العلوم الإدارية والاقتصادية', 'Faculty of Administrative and Economic Sciences', [
      ['إدارة الأعمال', 'scientific', 1250, null],
      ['المحاسبة', 'scientific', 1230, null],
      ['الاقتصاد', 'literary', 1150, null],
    ]],
    ['كلية التربية', 'Faculty of Education', [['معلم صف', 'literary', 1050, null]]],
    ['كلية العلوم الإسلامية', 'Faculty of Islamic Sciences', [['الشريعة الإسلامية', 'literary', 1000, null]]],
  ],
  'rashid-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'wadi-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [
      ['هندسة تقانة المعلومات', 'scientific', 1430, null],
      ['الهندسة المدنية', 'scientific', 1430, null],
      ['الهندسة المعمارية', 'scientific', 1430, null],
    ]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'andalus-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['كلية العلوم الصحية', 'Faculty of Health Sciences', [
      ['التمريض', 'scientific', 1300, null],
      ['مخابر طبية', 'scientific', 1280, null],
    ]],
  ],
  'jazeera-private': [
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'wataniya-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'manara-private': [
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1100, null]]],
    ['التربية', 'Education', [['معلم صف', 'literary', 1000, null]]],
  ],
  'syrian-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1100, null]]],
  ],
  'cordoba-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'shahbaa-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'bilad-sham-private': [
    ['الشريعة', 'Sharia', [
      ['الشريعة الإسلامية', 'literary', 1050, null],
      ['اللغة العربية', 'literary', 1000, null],
    ]],
    ['التربية', 'Education', [['معلم صف', 'literary', 950, null]]],
  ],
  'arab-international-private': [
    ['الطب البشري', 'Human Medicine', [['الطب البشري', 'scientific', 1760, null]]],
    ['طب الأسنان', 'Dentistry', [['طب الأسنان', 'scientific', 1650, null]]],
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
  ],
  'arab-science-private': [
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1100, null]]],
  ],
  'aastmt-syria': [
    ['الهندسة البحرية', 'Marine Engineering', [['تقنيات الميكانيك', 'scientific', 1430, null, 'marine-mechanical']]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
    ['الاقتصاد', 'Economics', [['الاقتصاد', 'literary', 1120, null]]],
  ],
  'antakya-private': [
    ['الصيدلة', 'Pharmacy', [['الصيدلة', 'scientific', 1650, null]]],
    ['الهندسة', 'Engineering', [['هندسة تقانة المعلومات', 'scientific', 1430, null]]],
    ['إدارة الأعمال', 'Business Administration', [['إدارة الأعمال', 'scientific', 1210, null]]],
    ['الحقوق', 'Law', [['الحقوق', 'literary', 1100, null]]],
  ],
  hiast: [
    ['التأهيل الهندسي', 'Engineering Cycle', [
      ['هندسة الاتصالات', 'scientific', 2200, null],
      ['الهندسة المعلوماتية', 'scientific', 2190, null],
      ['هندسة النظم الإلكترونية', 'scientific', 2180, null],
      ['هندسة الميكاترونكس', 'scientific', 2170, null],
      ['هندسة الطيران', 'scientific', 2180, null],
      ['علوم وهندسة المواد', 'scientific', 2150, null],
    ]],
  ],
  ina: [
    ['الإدارة العامة', 'Public Administration', [['الإدارة العامة', 'literary', 1200, null, 'public-admin']]],
  ],
  hiba: [
    ['الإدارة العامة', 'Public Administration', [['الإدارة العامة', 'literary', 1150, null, 'hiba-public-admin']]],
  ],
  'dramatic-arts': [
    ['الفنون المسرحية', 'Theatre Arts', [
      ['التمثيل', 'literary', 1000, null],
      ['الإخراج المسرحي', 'literary', 1000, null],
    ]],
  ],
  cinema: [
    ['الفنون السينمائية', 'Cinematic Arts', [
      ['الإخراج السينمائي', 'literary', 1000, null],
      ['النقد الفني', 'literary', 950, null],
    ]],
  ],
  population: [
    ['الدراسات السكانية', 'Population Studies', [['الدراسات السكانية', 'literary', 1000, null, 'population-studies']]],
  ],
  'marine-research': [
    ['البحوث البحرية', 'Marine Research', [['العلوم البحرية', 'scientific', 1500, null, 'marine-sciences']]],
  ],
};

function esc(s) {
  return String(s).replace(/'/g, "''");
}

// Technical institutes (2-year diploma programs) per government university.
// Each entry: [name_ar, name_en, majors], majors = [name_ar, cert, g, p].
const TECH_INSTITUTES = {
  damascus: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1640, 1590],]],
    ['المعهد التقاني للهندسة الميكانيكية والكهربائية', 'Mechanical and Electrical Engineering Technical Institute', [
      ['تقنيات الميكانيك', 'scientific', 1595, 1545],
      ['تقنيات الكهرباء', 'scientific', 1610, 1560],
      ['هندسة الإلكترون', 'scientific', 1625, 1575],
    ]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 2127, 2077],
      ['تخدير وإنعاش', 'scientific', 2095, 2045],
      ['أشعة طبية', 'scientific', 2100, 2050],
      ['إسعاف وطوارئ', 'scientific', 2070, 2020],
      ['علاج فيزيائي', 'scientific', 2085, 2035],
      ['بصريات', 'scientific', 2060, 2010],
      ['التمريض', 'scientific', 2040, 1990, 'nursing-tech'],
    ]],
    ['المعهد التقاني لطب الأسنان', 'Dental Technical Institute', [
      ['فني طب الأسنان', 'scientific', 1720, 1670],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1500, 1450],
      ['وقاية نباتات', 'scientific', 1470, 1420],
      ['إنتاج حيواني', 'scientific', 1460, 1410],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1763, 1713],
      ['هندسة شبكات', 'scientific', 1745, 1695],
      ['هندسة حاسوب', 'scientific', 1750, 1700],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1210, 1160],
      ['المحاسبة', 'literary', 1190, 1140, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1180, 1130, 'business-tech'],
      ['تسويق', 'literary', 1160, 1110],
    ]],
    ['المعهد التقاني الإحصائي', 'Statistical Technical Institute', [
      ['إحصاء تطبيقي', 'literary', 1150, 1100],
    ]],
    ['المعهد التقاني للصناعات الكيميائية', 'Chemical Industries Technical Institute', [
      ['كيمياء صناعية', 'scientific', 1642, 1592],
    ]],
  ],
  aleppo: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1410, 1360],]],
    ['المعهد التقاني للهندسة الميكانيكية والكهربائية', 'Mechanical and Electrical Engineering Technical Institute', [
      ['تقنيات الميكانيك', 'scientific', 1324, 1274],
      ['تقنيات الكهرباء', 'scientific', 1340, 1290],
      ['هندسة الإلكترون', 'scientific', 1355, 1305],
    ]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1989, 1939],
      ['تخدير وإنعاش', 'scientific', 1955, 1905],
      ['أشعة طبية', 'scientific', 1960, 1910],
      ['التمريض', 'scientific', 1900, 1850, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1230, 1180],
      ['وقاية نباتات', 'scientific', 1200, 1150],
      ['إنتاج حيواني', 'scientific', 1190, 1140],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1524, 1474],
      ['هندسة شبكات', 'scientific', 1505, 1455],
      ['هندسة حاسوب', 'scientific', 1510, 1460],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1130, 1080],
      ['المحاسبة', 'literary', 1110, 1060, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1100, 1050, 'business-tech'],
      ['تسويق', 'literary', 1080, 1030],
    ]],
    ['المعهد التقاني لطب الأسنان', 'Dental Technical Institute', [
      ['فني طب الأسنان', 'scientific', 1500, 1450],
    ]],
  ],
  tishreen: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1290, 1240],]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1860, 1810],
      ['تخدير وإنعاش', 'scientific', 1830, 1780],
      ['أشعة طبية', 'scientific', 1835, 1785],
      ['التمريض', 'scientific', 1780, 1730, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1102, 1052],
      ['وقاية نباتات', 'scientific', 1080, 1030],
      ['إنتاج حيواني', 'scientific', 1070, 1020],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1434, 1384],
      ['هندسة شبكات', 'scientific', 1415, 1365],
      ['هندسة حاسوب', 'scientific', 1420, 1370],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1090, 1040],
      ['المحاسبة', 'literary', 1070, 1020, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1060, 1010, 'business-tech'],
      ['تسويق', 'literary', 1040, 990],
    ]],
    ['المعهد التقاني الإحصائي', 'Statistical Technical Institute', [
      ['إحصاء تطبيقي', 'literary', 1050, 1000],
    ]],
    ['المعهد التقاني السياحي والفندقي', 'Tourism and Hotel Technical Institute', [
      ['سياحة وفنادق', 'literary', 1030, 980],
    ]],
  ],
  baath: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1450, 1400],]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1900, 1850],
      ['تخدير وإنعاش', 'scientific', 1870, 1820],
      ['أشعة طبية', 'scientific', 1875, 1825],
      ['التمريض', 'scientific', 1820, 1770, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1396, 1346],
      ['وقاية نباتات', 'scientific', 1370, 1320],
      ['إنتاج حيواني', 'scientific', 1360, 1310],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1450, 1400],
      ['هندسة شبكات', 'scientific', 1430, 1380],
      ['هندسة حاسوب', 'scientific', 1435, 1385],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1120, 1070],
      ['المحاسبة', 'literary', 1100, 1050, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1090, 1040, 'business-tech'],
      ['تسويق', 'literary', 1070, 1020],
    ]],
    ['المعهد التقاني للصناعات الكيميائية', 'Chemical Industries Technical Institute', [
      ['كيمياء صناعية', 'scientific', 1344, 1294],
    ]],
    ['المعهد التقاني لطب الأسنان', 'Dental Technical Institute', [
      ['فني طب الأسنان', 'scientific', 1550, 1500],
    ]],
  ],
  furat: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1060, 1010],]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1700, 1650],
      ['تخدير وإنعاش', 'scientific', 1670, 1620],
      ['التمريض', 'scientific', 1630, 1580, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1171, 1121],
      ['وقاية نباتات', 'scientific', 1145, 1095],
      ['إنتاج حيواني', 'scientific', 1135, 1085],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1200, 1150],
      ['هندسة شبكات', 'scientific', 1180, 1130],
      ['هندسة حاسوب', 'scientific', 1185, 1135],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1060, 1010],
      ['المحاسبة', 'literary', 1040, 990, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1030, 980, 'business-tech'],
      ['تسويق', 'literary', 1010, 960],
    ]],
  ],
  tartus: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1310, 1260],]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1750, 1700],
      ['تخدير وإنعاش', 'scientific', 1720, 1670],
      ['أشعة طبية', 'scientific', 1725, 1675],
      ['التمريض', 'scientific', 1670, 1620, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1335, 1285],
      ['وقاية نباتات', 'scientific', 1310, 1260],
      ['إنتاج حيواني', 'scientific', 1300, 1250],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1300, 1250],
      ['هندسة شبكات', 'scientific', 1280, 1230],
      ['هندسة حاسوب', 'scientific', 1285, 1235],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1080, 1030],
      ['المحاسبة', 'literary', 1060, 1010, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1050, 1000, 'business-tech'],
      ['تسويق', 'literary', 1030, 980],
    ]],
  ],
  hama: [
    ['المعهد التقاني الهندسي', 'Technical Engineering Institute', [      ['طوبوغرافيا', 'scientific', 1410, 1360],]],
    ['المعهد التقاني الطبي', 'Medical Technical Institute', [
      ['مخابر طبية', 'scientific', 1903, 1853],
      ['تخدير وإنعاش', 'scientific', 1870, 1820],
      ['أشعة طبية', 'scientific', 1875, 1825],
      ['التمريض', 'scientific', 1820, 1770, 'nursing-tech'],
    ]],
    ['المعهد التقاني الزراعي', 'Agricultural Technical Institute', [
      ['زراعة عامة', 'scientific', 1285, 1235],
      ['وقاية نباتات', 'scientific', 1260, 1210],
      ['إنتاج حيواني', 'scientific', 1250, 1200],
    ]],
    ['المعهد التقاني للحاسوب', 'Computer Technical Institute', [
      ['هندسة برمجيات', 'scientific', 1300, 1250],
      ['هندسة شبكات', 'scientific', 1280, 1230],
      ['هندسة حاسوب', 'scientific', 1285, 1235],
    ]],
    ['المعهد التقاني للعلوم المالية والمصرفية', 'Finance and Banking Technical Institute', [
      ['مالية ومصرفية', 'literary', 1080, 1030],
      ['المحاسبة', 'literary', 1060, 1010, 'accounting-tech'],
    ]],
    ['المعهد التقاني لإدارة الأعمال والتسويق', 'Business Administration and Marketing Technical Institute', [
      ['إدارة الأعمال', 'literary', 1050, 1000, 'business-tech'],
      ['تسويق', 'literary', 1030, 980],
    ]],
    ['المعهد التقاني لطب الأسنان', 'Dental Technical Institute', [
      ['فني طب الأسنان', 'scientific', 1500, 1450],
    ]],
  ],
};

const lines = [];
lines.push('-- =============================================================');
lines.push('-- Seed 2025-2026 admission data (universities, colleges, majors, scores)');
lines.push('-- Generated by scripts/seed-2025.cjs');
lines.push('-- =============================================================');
lines.push('');

const CERTS = [
  ['scientific', 'الثانوية العامة - الفرع العلمي', 'General Secondary - Scientific', 'شهادة الثانوية العامة - الفرع العلمي (المنهاج السوري)', 1],
  ['literary', 'الثانوية العامة - الفرع الأدبي', 'General Secondary - Literary', 'شهادة الثانوية العامة - الفرع الأدبي (المنهاج السوري)', 2],
  ['sharia', 'الثانوية الشرعية', 'Religious Secondary', 'شهادة التعليم الثانوي الشرعي', 3],
  ['industrial', 'الثانوية الصناعية', 'Industrial Secondary', 'شهادة التعليم الثانوي الصناعي (التعليم المهني)', 4],
  ['commercial', 'الثانوية التجارية', 'Commercial Secondary', 'شهادة التعليم الثانوي التجاري (التعليم المهني)', 5],
  ['agricultural', 'الثانوية الزراعية', 'Agricultural Secondary', 'شهادة التعليم الثانوي الزراعي (التعليم المهني)', 6],
  ['female', 'الثانوية النسوية (الاقتصاد المنزلي)', 'Female / Home Economics Secondary', 'شهادة التعليم الثانوي النسوي (التعليم المهني)', 7],
  ['vocational-it', 'التعليم المهني - تقنيات الحاسوب والمعلوماتية', 'Vocational Secondary - IT', 'شهادة التعليم المهني - فرع تقنيات الحاسوب والمعلوماتية', 8],
];
const certSlugs = CERTS.map((c) => `'${c[0]}'`).join(', ');
lines.push(`insert into public.certificates (name_ar, name_en, slug, description, sort_order, is_active) values`);
CERTS.forEach((c, i) => {
  lines.push(`  ('${c[1]}', '${c[2]}', '${c[0]}', '${c[3]}', ${c[4]}, true)${i === CERTS.length - 1 ? '' : ','}`);
});
lines.push(`on conflict (slug) do update set name_ar = excluded.name_ar, name_en = excluded.name_en, description = excluded.description, sort_order = excluded.sort_order, is_active = true;`);
lines.push(`update public.certificates set is_active = false where slug not in (${certSlugs});`);
lines.push('');

lines.push('insert into public.universities (name_ar, name_en, slug, type, governorate_id, founding_year, website, housing_available, is_active)');
lines.push('select v.name_ar, v.name_en, v.slug, v.type, g.id, v.founding_year, v.website, v.housing, true from (values');
UNIVERSITIES.forEach((u, i) => {
  const comma = i === UNIVERSITIES.length - 1 ? '' : ',';
  lines.push(`  ('${esc(u[0])}', '${esc(u[1])}', '${u[2]}', '${u[3]}', '${u[4]}', ${u[5]}, '${u[6]}', ${u[3] === 'government'})${comma}`);
});
lines.push(') as v(name_ar, name_en, slug, type, gov_ar, founding_year, website, housing)');
lines.push('join public.governorates g on g.name_ar = v.gov_ar');
lines.push('on conflict (slug) do update set name_ar = excluded.name_ar, type = excluded.type, governorate_id = excluded.governorate_id, is_active = true;');
lines.push('');

for (const [uslug, collegesBase] of Object.entries(COLLEGE_MAJORS)) {
  const colleges = [...collegesBase, ...(TECH_INSTITUTES[uslug] || [])];
  lines.push(`-- University: ${uslug}`);

  // colleges
  lines.push('with univ as (select id from public.universities where slug = \'' + uslug + '\')');
  lines.push('insert into public.colleges (university_id, name_ar, name_en, slug, is_active)');
  lines.push('select univ.id, v.name_ar, v.name_en, v.slug, true from (values');
  colleges.forEach(([ca, ce], i) => {
    const comma = i === colleges.length - 1 ? '' : ',';
    lines.push(`  ('${esc(ca)}', '${esc(ce)}', '${uslug}-${slugifyCollege(ca)}')${comma}`);
  });
  lines.push(') as v(name_ar, name_en, slug), univ');
  lines.push('on conflict (university_id, slug) do update set name_ar = excluded.name_ar, is_active = true;');
  lines.push('');

  // majors
  const majorRows = [];
  colleges.forEach(([ca, ce, majors]) => {
    majors.forEach(([m, , , , mslug]) => majorRows.push([ca, m, mslug]));
  });
  lines.push('with univ as (select id from public.universities where slug = \'' + uslug + '\')');
  lines.push('insert into public.majors (college_id, name_ar, name_en, slug, degree, study_duration_years, difficulty, is_active)');
  lines.push('select c.id, v.name_ar, v.name_en, v.slug, v.degree, v.duration, v.difficulty, true from (values');
  majorRows.forEach(([ca, m, mslug], i) => {
    const comma = i === majorRows.length - 1 ? '' : ',';
    const meta = MAJOR_META[m];
    const cslug = uslug + '-' + slugifyCollege(ca);
    lines.push(`  ('${esc(m)}', '${meta[0]}', '${uslug}-${mslug || meta[1]}', '${cslug}', '${meta[2]}', ${meta[3]}, ${meta[4]})${comma}`);
  });
  lines.push(') as v(name_ar, name_en, slug, college_slug, degree, duration, difficulty)');
  lines.push('join univ u on true');
  lines.push('join public.colleges c on c.university_id = u.id and c.slug = v.college_slug');
  lines.push('on conflict (slug) do update set name_ar = excluded.name_ar, is_active = true;');
  lines.push('');

  // scores
  const rows = [];
  colleges.forEach(([ca, ce, majors]) => {
    majors.forEach(([m, cert, g, p, mslug]) => {
      const meta = MAJOR_META[m];
      const mslugF = uslug + '-' + (mslug || meta[1]);
      const cslug = uslug + '-' + slugifyCollege(ca);
      const baseScale = CERT_SCALES[cert] || 2400;
      const add = (certSlug, adm, val) => {
        if (val == null) return;
        rows.push(`  ('${mslugF}', '${cslug}', '${certSlug}', '${adm}', ${val}, 'الحد الأدنى للقبول ${adm === 'general' ? 'العام' : 'الموازي'} 2025-2026')`);
      };
      add(cert, 'general', g);
      add(cert, 'parallel', p);
      (EXTRA_CERTS[m] || []).forEach(([extraSlug, factor]) => {
        // Convert the base minimum onto the extra certificate's own scale,
        // preserving the same percentage point and applying the cert ratio.
        const scale = CERT_SCALES[extraSlug] || 2400;
        const conv = (v) => (v == null ? null : Math.round((v / baseScale) * scale * factor));
        add(extraSlug, 'general', conv(g));
        add(extraSlug, 'parallel', conv(p));
      });
    });
  });
  lines.push('with univ as (select id from public.universities where slug = \'' + uslug + '\')');
  lines.push('insert into public.admission_scores (year, university_id, college_id, major_id, certificate_type_id, admission_type, minimum_score, notes, is_published)');
  lines.push('select 2025, u.id, c.id, m.id, cert.id, v.adm, v.score, v.notes, true from (values');
  rows.forEach((r, i) => lines.push(r + (i === rows.length - 1 ? '' : ',')));
  lines.push(') as v(major_slug, college_slug, cert_slug, adm, score, notes)');
  lines.push('join univ u on true');
  lines.push('join public.majors m on m.slug = v.major_slug');
  lines.push('join public.colleges c on c.id = m.college_id and c.slug = v.college_slug');
  lines.push('join public.certificates cert on cert.slug = v.cert_slug');
  lines.push('on conflict (year, university_id, college_id, major_id, certificate_type_id, admission_type) do update set minimum_score = excluded.minimum_score, is_published = true, notes = excluded.notes;');
  lines.push('');
}

function slugifyCollege(s) {
  const map = {
    'الطب البشري': 'medicine', 'طب الأسنان': 'dentistry', 'الصيدلة': 'pharmacy',
    'الهندسة': 'engineering', 'العلوم': 'science', 'الاقتصاد': 'economics',
    'الحقوق': 'law', 'الآداب والعلوم الإنسانية': 'arts-humanities', 'الآداب': 'arts',
    'التربية': 'education', 'الشريعة': 'sharia', 'العلوم السياسية': 'political-science',
    'الإعلام': 'media', 'الزراعة': 'agriculture', 'إدارة الأعمال': 'business-administration',
    'الهندسة الزراعية': 'agricultural-engineering',
    'كلية المعلوماتية والاتصالات': 'informatics-communications',
    'كلية العلوم الإدارية': 'administrative-sciences',
    'كلية العلوم الإنسانية': 'humanities',
    'كلية العلوم الإدارية والاقتصادية': 'administrative-economic-sciences',
    'كلية التربية': 'education',
    'كلية العلوم الإسلامية': 'islamic-sciences',
    'كلية الطب البيطري': 'veterinary',
    'كلية التمريض': 'nursing',
    'كلية الهندسة التقنية': 'technical-engineering',
    'كلية العلوم الصحية': 'health-sciences',
    'كلية المعلوماتية': 'informatics',
    'كلية الصيدلة': 'pharmacy',
    'كلية تقانات الهندسة': 'engineering-technology',
    'كلية الهندسة المعلوماتية': 'it-engineering',
    'كلية اللغات': 'languages',
    'كلية التربية الرياضية': 'physical-education',
    'المعهد التقاني الهندسي': 'tech-engineering',
    'المعهد التقاني للهندسة الميكانيكية والكهربائية': 'tech-mechanical-electrical',
    'المعهد التقاني الطبي': 'tech-medical',
    'المعهد التقاني لطب الأسنان': 'tech-dentistry',
    'المعهد التقاني الزراعي': 'tech-agriculture',
    'المعهد التقاني للحاسوب': 'tech-computer',
    'المعهد التقاني للعلوم المالية والمصرفية': 'tech-finance',
    'المعهد التقاني لإدارة الأعمال والتسويق': 'tech-business',
    'المعهد التقاني الإحصائي': 'tech-statistics',
    'المعهد التقاني للصناعات الكيميائية': 'tech-chemistry',
    'المعهد التقاني للفنون التطبيقية': 'tech-applied-arts',
    'المعهد التقاني السياحي والفندقي': 'tech-tourism',
    'التأهيل الهندسي': 'engineering-cycle',
    'الإدارة العامة': 'public-administration',
    'الدراسات السكانية': 'population-studies',
    'البحوث البحرية': 'marine-research',
    'كلية اللغات': 'languages',
    'كلية العلوم الصحية': 'health-sciences',
    'الهندسة البحرية': 'marine-engineering',
    'الفنون المسرحية': 'theatre-arts',
    'الفنون السينمائية': 'cinematic-arts',
    'الطب البيطري': 'veterinary',
    'التمريض': 'nursing',
    'التربية الرياضية': 'physical-education',
    'كلية الطب البيطري': 'veterinary',
    'كلية التمريض': 'nursing',
    'كلية التربية الرياضية': 'physical-education',
  };
  return map[s] || ('college-' + s.length);
}

fs.writeFileSync(__dirname + '/../supabase/seed-2025.sql', lines.join('\n'), 'utf8');
console.log('Wrote', lines.length, 'lines to supabase/seed-2025.sql');
