// Generates supabase/seed-2025.sql with universities, colleges, majors and
// 2025-2026 admission_scores based on official published minimums.
// Scale: scientific out of 2200 (religion excluded), literary out of 1600.
// Vocational/secondary certificate types (sharia, industrial, commercial,
// agricultural, female, vocational-it) are generated as multipliers of the
// base scientific/literary minimum for their eligible majors.
// Sources: Syria24/yallasyrianews guide (2025-09-25), aspu.edu.sy table,
// published private-university minimums.

const fs = require('fs');

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
};

function esc(s) {
  return String(s).replace(/'/g, "''");
}

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

for (const [uslug, colleges] of Object.entries(COLLEGE_MAJORS)) {
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
    majors.forEach(([m]) => majorRows.push([ca, m]));
  });
  lines.push('with univ as (select id from public.universities where slug = \'' + uslug + '\')');
  lines.push('insert into public.majors (college_id, name_ar, name_en, slug, degree, study_duration_years, difficulty, is_active)');
  lines.push('select c.id, v.name_ar, v.name_en, v.slug, v.degree, v.duration, v.difficulty, true from (values');
  majorRows.forEach(([ca, m], i) => {
    const comma = i === majorRows.length - 1 ? '' : ',';
    const meta = MAJOR_META[m];
    const cslug = uslug + '-' + slugifyCollege(ca);
    lines.push(`  ('${esc(m)}', '${meta[0]}', '${uslug}-${meta[1]}', '${cslug}', '${meta[2]}', ${meta[3]}, ${meta[4]})${comma}`);
  });
  lines.push(') as v(name_ar, name_en, slug, college_slug, degree, duration, difficulty)');
  lines.push('join univ u on true');
  lines.push('join public.colleges c on c.university_id = u.id and c.slug = v.college_slug');
  lines.push('on conflict (slug) do update set name_ar = excluded.name_ar, is_active = true;');
  lines.push('');

  // scores
  const rows = [];
  colleges.forEach(([ca, ce, majors]) => {
    majors.forEach(([m, cert, g, p]) => {
      const meta = MAJOR_META[m];
      const mslug = uslug + '-' + meta[1];
      const cslug = uslug + '-' + slugifyCollege(ca);
      const add = (certSlug, adm, val) => {
        if (val == null) return;
        rows.push(`  ('${mslug}', '${cslug}', '${certSlug}', '${adm}', ${val}, 'الحد الأدنى للقبول ${adm === 'general' ? 'العام' : 'الموازي'} 2025-2026')`);
      };
      add(cert, 'general', g);
      add(cert, 'parallel', p);
      (EXTRA_CERTS[m] || []).forEach(([cslug, factor]) => {
        add(cslug, 'general', g == null ? null : Math.round(g * factor));
        add(cslug, 'parallel', p == null ? null : Math.round(p * factor));
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
  };
  return map[s] || ('college-' + s.length);
}

fs.writeFileSync(__dirname + '/../supabase/seed-2025.sql', lines.join('\n'), 'utf8');
console.log('Wrote', lines.length, 'lines to supabase/seed-2025.sql');
