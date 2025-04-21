import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs"; // Import bcrypt

const prisma = new PrismaClient();

// Available languages in your JSON files
const LANGUAGES = [
  { code: "en", name: "English", filePath: "public/locales/en/common.json" },
  { code: "et", name: "Estonian", filePath: "public/locales/et/common.json" },
  { code: "lv", name: "Latvian", filePath: "public/locales/lv/common.json" },
  { code: "ru", name: "Russian", filePath: "public/locales/ru/common.json" },
];

// Process nested translations recursively
async function processTranslations(obj: any, prefix: string, langCode: string) {
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      // This is a nested object, recurse
      await processTranslations(value, fullPath, langCode);
    } else {
      // This is a leaf node (actual translation)

      // First, ensure the translation key exists
      let translationKey = await prisma.translationKey.upsert({
        where: { keyPath: fullPath },
        update: {},
        create: { keyPath: fullPath },
      });

      // Insert or update the translation
      await prisma.translation.upsert({
        where: {
          keyId_languageCode: {
            keyId: translationKey.id,
            languageCode: langCode,
          },
        },
        update: { value: String(value) },
        create: {
          keyId: translationKey.id,
          languageCode: langCode,
          value: String(value),
        },
      });
    }
  }
}

// Load JSON file
function loadJsonFile(filePath: string): any {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    console.log(`Attempting to load file: ${fullPath}`);

    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return null;
    }

    const fileContent = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error);
    return null;
  }
}

// Insert media data with Cloudinary URLs
async function insertMediaData() {
  console.log("Cleaning up existing media data...");

  // First, delete all existing media references to avoid foreign key constraint issues
  await prisma.mediaReference.deleteMany({});

  // Then delete all existing media entries
  await prisma.media.deleteMany({});

  console.log("Inserting media data with Cloudinary URLs...");

  // Define your media files with Cloudinary URLs
  const mediaFiles = [
    // Logos
    {
      filename: "logo.svg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo.svg",
      cloudinaryId: "media/logo.svg",
      mediaType: "image/svg+xml",
      altText: "Steel Buckle Logo",
    },
    {
      filename: "logo_blue.png",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo_blue.png",
      cloudinaryId: "media/logo_blue.png",
      mediaType: "image/png",
      altText: "Steel Buckle Logo Blue",
    },
    {
      filename: "logo_dark.svg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo_dark.svg",
      cloudinaryId: "media/logo_dark.svg",
      mediaType: "image/svg+xml",
      altText: "Steel Buckle Logo",
    },
    {
      filename: "logo_green.png",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo_green.png",
      cloudinaryId: "media/logo_green.png",
      mediaType: "image/png",
      altText: "Steel Buckle Logo Green",
    },
    {
      filename: "logo_grey.svg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo_grey.svg",
      cloudinaryId: "media/logo_grey.svg",
      mediaType: "image/svg+xml",
      altText: "Steel Buckle Logo Grey",
    },
    {
      filename: "logo_white.svg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/logo_white.svg",
      cloudinaryId: "media/logo_white.svg",
      mediaType: "image/svg+xml",
      altText: "Steel Buckle Logo",
    },
    // Project Images
    {
      filename: "naissaare.png",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/naissaare.png",
      cloudinaryId: "media/naissaare.png",
      mediaType: "image/png",
      altText: "Naissaare",
    },
    {
      filename: "Liepaja_(61).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Liepaja_(61).jpg",
      cloudinaryId: "media/Liepaja_(61).jpg",
      mediaType: "image/jpeg",
      altText: "Liepaja Station",
    },
    {
      filename: "valgaraudteejaam.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/valgaraudteejaam.jpg",
      cloudinaryId: "media/valgaraudteejaam.jpg",
      mediaType: "image/jpeg",
      altText: "Valga Railway Station",
    },
    {
      filename: "Bolderaja_(49).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Bolderaja_(49).jpg",
      cloudinaryId: "media/Bolderaja_(49).jpg",
      mediaType: "image/jpeg",
      altText: "Bolderaja",
    },
    {
      filename: "Shkirotava_(14).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(14).jpg",
      cloudinaryId: "media/Shkirotava_(14).jpg",
      mediaType: "image/jpeg",
      altText: "Shkirotava Station",
    },
    {
      filename: "Shkirotava_(55).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(55).jpg",
      cloudinaryId: "media/Shkirotava_(55).jpg",
      mediaType: "image/jpeg",
      altText: "Shkirotava Sorting Hill",
    },
    {
      filename: "Avaleht_Renome_EST.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Avaleht_Renome_EST.jpg",
      cloudinaryId: "media/Avaleht_Renome_EST.jpg",
      mediaType: "image/jpeg",
      altText: "Avaleht Renome EST",
    },
    {
      filename: "Avaleht_Valga_2.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Avaleht_Valga_2.jpg",
      cloudinaryId: "media/Avaleht_Valga_2.jpg",
      mediaType: "image/jpeg",
      altText: "Avaleht Valga 2",
    },
    {
      filename: "Krievu_Sala_3.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Krievu_Sala_3.jpg",
      cloudinaryId: "media/Krievu_Sala_3.jpg",
      mediaType: "image/jpeg",
      altText: "Krievu Sala 3",
    },
    {
      filename: "Kazlu_Rida_3.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Kazlu_Rida_3.jpg",
      cloudinaryId: "media/Kazlu_Rida_3.jpg",
      mediaType: "image/jpeg",
      altText: "Kazlu Rida 3",
    },
    {
      filename: "Kazlu_Ruda_2.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754192/media/Kazlu_Ruda_2.jpg",
      cloudinaryId: "media/Kazlu_Ruda_2.jpg",
      mediaType: "image/jpeg",
      altText: "Kazlu Ruda 2",
    },
    {
      filename: "Skriveri_1.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg",
      cloudinaryId: "media/Skriveri_1.jpg",
      mediaType: "image/jpeg",
      altText: "Skriveri 1",
    },
    {
      filename: "Liepaja_(77).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Liepaja_(77).jpg",
      cloudinaryId: "media/Liepaja_(77).jpg",
      mediaType: "image/jpeg",
      altText: "Liepaja 77",
    },
    {
      filename: "Liepaja_(57).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Liepaja_(57).jpg",
      cloudinaryId: "media/Liepaja_(57).jpg",
      mediaType: "image/jpeg",
      altText: "Liepaja 57",
    },
    {
      filename: "Remont_2.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Remont_2.jpg",
      cloudinaryId: "media/Remont_2.jpg",
      mediaType: "image/jpeg",
      altText: "Remont 2",
    },
    {
      filename: "foto_jooksev.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/foto_jooksev.jpg",
      cloudinaryId: "media/foto_jooksev.jpg",
      mediaType: "image/jpeg",
      altText: "Current Photo",
    },
    {
      filename: "thumbnail_Lumetorje_1.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/thumbnail_Lumetorje_1.jpg",
      cloudinaryId: "media/thumbnail_Lumetorje_1.jpg",
      mediaType: "image/jpeg",
      altText: "Snow Removal 1",
    },
    {
      filename: "thumbnail_lumetorje_2.jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/thumbnail_lumetorje_2.jpg",
      cloudinaryId: "media/thumbnail_lumetorje_2.jpg",
      mediaType: "image/jpeg",
      altText: "Snow Removal 2",
    },
    {
      filename:
        "Eesti_Raudtee_Muuga_jaama_kõrik._Taamal_paistmas_ka_jaama_juhtimiskeskus_(ET-post).jpg",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Eesti_Raudtee_Muuga_jaama_kõrik._Taamal_paistmas_ka_jaama_juhtimiskeskus_(ET-post).jpg",
      cloudinaryId:
        "media/Eesti_Raudtee_Muuga_jaama_kõrik._Taamal_paistmas_ka_jaama_juhtimiskeskus_(ET-post).jpg",
      mediaType: "image/jpeg",
      altText: "Muuga Port Station",
    },
    {
      filename: "giphy_qmfoxn.gif",
      path: "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744871872/giphy_qmfoxn.gif",
      cloudinaryId: "media/giphy_qmfoxn.gif",
      mediaType: "image/svg+xml",
      altText: "Gif",
    },
  ];

  // Media references remain the same
  const mediaReferences = [
    // Existing references
    { key: "site.logo", filename: "logo.svg" },

    // Home page
    { key: "about.main_image", filename: "Shkirotava_(14).jpg" },
    { key: "benefits.main_image", filename: "Avaleht_Renome_EST.jpg" },
    { key: "services_slider.slide1.image", filename: "foto_jooksev.jpg" },
    { key: "services_slider.slide2.image", filename: "Remont_2.jpg" },
    { key: "services_slider.slide3.image", filename: "Kazlu_Ruda_2.jpg" },
    { key: "services_slider.slide4.image", filename: "Skriveri_1.jpg" },
    { key: "hero.youtube_embed", filename: "logo.svg" }, // This is just a placeholder

    // Railway maintenance page
    {
      key: "railway_maintenance_page.images.first_image",
      filename: "foto_jooksev.jpg",
    },
    {
      key: "railway_maintenance_page.images.second_image",
      filename: "Liepaja_(57).jpg",
    },

    // Railway design page
    {
      key: "railway_design_page.images.main_image",
      filename: "Bolderaja_(49).jpg",
    },

    // Railway infrastructure page
    {
      key: "railway_infrastructure_page.images.main_image",
      filename: "Shkirotava_(14).jpg",
    },

    // Repair and renovation page
    {
      key: "repair_renovation_page.images.first_image",
      filename: "Remont_2.jpg",
    },
    {
      key: "repair_renovation_page.images.second_image",
      filename: "Kazlu_Ruda_2.jpg",
    },
  ];

  // Insert media files with Cloudinary URLs and IDs
  for (const file of mediaFiles) {
    await prisma.media.upsert({
      where: { path: file.path },
      update: {
        filename: file.filename,
        cloudinaryId: file.cloudinaryId,
        mediaType: file.mediaType,
        altText: file.altText,
      },
      create: {
        filename: file.filename,
        path: file.path,
        cloudinaryId: file.cloudinaryId,
        mediaType: file.mediaType,
        altText: file.altText,
      },
    });
  }

  // Insert media references - this code remains the same
  for (const ref of mediaReferences) {
    // Find the media by filename
    const media = await prisma.media.findFirst({
      where: { filename: ref.filename },
    });

    if (media) {
      await prisma.mediaReference.upsert({
        where: { referenceKey: ref.key },
        update: { mediaId: media.id },
        create: { referenceKey: ref.key, mediaId: media.id },
      });
    }
  }
}

async function seedSeoMetadata() {
  console.log("Seeding SEO metadata...");

  try {
    // First, delete all existing SEO translations and metadata
    console.log("Deleting existing SEO metadata...");
    await prisma.seoTranslation.deleteMany({});
    await prisma.seoMetadata.deleteMany({});

    // Define SEO metadata for main pages with updated formatting
    const seoData = [
      {
        pageKey: "home",
        translations: {
          en: {
            title: "Railway Construction & Maintenance | Steel Buckle",
            metaDescription:
              "Steel Buckle provides comprehensive railway construction, repair & maintenance services with over 35 years of experience across Estonia, Latvia & Lithuania. Expert solutions for all railway infrastructure needs.",
            keywords:
              "railway construction, railway maintenance, railway repair, Estonia, Latvia, Lithuania",
            ogTitle: "Railway Construction & Maintenance | Steel Buckle",
            ogDescription:
              "Railway construction, repair & maintenance services across the Baltics with 35+ years of industry experience.",
          },
          et: {
            title: "Raudteede ehitus ja hooldus | Steel Buckle",
            metaDescription:
              "Steel Buckle pakub põhjalikke raudtee-ehitus-, remondi- ja hooldusteenuseid enam kui 35-aastase kogemusega Eestis, Lätis ja Leedus. Professionaalsed lahendused kõikidele raudteeinfrastruktuuri vajadustele.",
            keywords:
              "raudtee-ehitus, raudtee hooldus, raudtee remont, Eesti, Läti, Leedu",
            ogTitle: "Raudteede ehitus ja hooldus | Steel Buckle",
            ogDescription:
              "Raudteede ehitus-, remondi- ja hooldusteenused üle Baltikumi 35+ aasta kogemusega.",
          },
          lv: {
            title: "Dzelzceļu būvniecība un uzturēšana | Steel Buckle",
            metaDescription:
              "Steel Buckle piedāvā visaptverošus dzelzceļa būvniecības, remonta un uzturēšanas pakalpojumus ar vairāk nekā 35 gadu pieredzi Igaunijā, Latvijā un Lietuvā. Profesionāli risinājumi visām dzelzceļa infrastruktūras vajadzībām.",
            keywords:
              "dzelzceļa būvniecība, dzelzceļa uzturēšana, dzelzceļa remonts, Igaunija, Latvija, Lietuva",
            ogTitle: "Dzelzceļu būvniecība un uzturēšana | Steel Buckle",
            ogDescription:
              "Dzelzceļa būvniecības, remonta un uzturēšanas pakalpojumi Baltijā ar 35+ gadu pieredzi nozarē.",
          },
          ru: {
            title: "Строительство и обслуживание железных дорог | Steel Buckle",
            metaDescription:
              "Steel Buckle предоставляет комплексные услуги по строительству, ремонту и обслуживанию железных дорог с более чем 35-летним опытом в Эстонии, Латвии и Литве. Профессиональные решения для всех потребностей железнодорожной инфраструктуры.",
            keywords:
              "строительство железных дорог, обслуживание железных дорог, ремонт железных дорог, Эстония, Латвия, Литва",
            ogTitle:
              "Строительство и обслуживание железных дорог | Steel Buckle",
            ogDescription:
              "Услуги по строительству, ремонту и обслуживанию железных дорог в Прибалтике с 35+ летним опытом в отрасли.",
          },
        },
      },
      {
        pageKey: "about",
        translations: {
          en: {
            title: "About Our Company | Steel Buckle",
            metaDescription:
              "Learn about Steel Buckle - a trusted railway construction company with over 35 years of experience in Estonia, Latvia & Lithuania. Specializing in high-quality railway services, maintenance and infrastructure development since 1989.",
            keywords:
              "about Steel Buckle, railway construction company, railway maintenance company, Estonia, Latvia, Lithuania",
            ogTitle: "About Our Company | Steel Buckle",
            ogDescription:
              "Steel Buckle has been providing railway construction and maintenance services across the Baltic region for over three decades.",
          },
          et: {
            title: "Ettevõttest | Steel Buckle",
            metaDescription:
              "Tutvu Steel Buckle'iga - usaldusväärne raudtee-ehitusettevõte enam kui 35-aastat kogemust Eestis, Lätis ja Leedus. Spetsialiseerunud kvaliteetsetele raudteeteenustele, hooldusele ja infrastruktuuri arendamisele alates 1989. aastast.",
            keywords:
              "Steel Buckle'ist, raudtee-ehitusettevõte, raudtee hooldusettevõte, Eesti, Läti, Leedu",
            ogTitle: "Ettevõttest | Steel Buckle",
            ogDescription:
              "Steel Buckle on pakkunud raudtee-ehitus ja hooldusteenuseid üle Baltikumi rohkem kui kolmkümmend aastat.",
          },
          lv: {
            title: "Par uzņēmumu | Steel Buckle",
            metaDescription:
              "Uzziniet par Steel Buckle - uzticams dzelzceļa būvniecības uzņēmums ar vairāk nekā 35 gadu pieredzi Igaunijā, Latvijā un Lietuvā. Specializējamies kvalitatīvos dzelzceļa pakalpojumos, uzturēšanā un infrastruktūras attīstīšanā kopš 1989. gada.",
            keywords:
              "par Steel Buckle, dzelzceļa būvniecības uzņēmums, dzelzceļa uzturēšanas uzņēmums, Igaunija, Latvija, Lietuva",
            ogTitle: "Par uzņēmumu | Steel Buckle",
            ogDescription:
              "Steel Buckle sniedz dzelzceļa būvniecības un uzturēšanas pakalpojumus visā Baltijas reģionā vairāk nekā trīs gadu desmitus.",
          },
          ru: {
            title: "О компании | Steel Buckle",
            metaDescription:
              "Узнайте о Steel Buckle - надежной железнодорожной строительной компании с более чем 35-летним опытом в Эстонии, Латвии и Литве. Специализируемся на высококачественных железнодорожных услугах, обслуживании и развитии инфраструктуры с 1989 года.",
            keywords:
              "о Steel Buckle, железнодорожная строительная компания, компания по обслуживанию железных дорог, Эстония, Латвия, Литва",
            ogTitle: "О компании | Steel Buckle",
            ogDescription:
              "Steel Buckle предоставляет услуги по строительству и обслуживанию железных дорог по всему Прибалтийскому региону более трех десятилетий.",
          },
        },
      },
      {
        pageKey: "services/railway-maintenance",
        translations: {
          en: {
            title: "Railway Maintenance Services | Steel Buckle",
            metaDescription:
              "Railway maintenance and ongoing upkeep services by Steel Buckle. Regular inspections, defectoscopy, and technical maintenance for safe railway operations.",
            keywords:
              "railway maintenance, track maintenance, railway inspections, defectoscopy, Estonia, Latvia, Lithuania",
            ogTitle: "Railway Maintenance Services | Steel Buckle",
            ogDescription:
              "Comprehensive railway maintenance services including inspections, measurements, and technical maintenance to ensure safe and reliable railway infrastructure.",
          },
          et: {
            title: "Raudteede jooksev korrashoid | Steel Buckle",
            metaDescription:
              "Raudteede jooksva korrashoiu teenused Steel Buckle'ilt. Regulaarsed ülevaatused, defektoskoopia ja tehniline hooldus ohutuks raudtee toimimiseks.",
            keywords:
              "raudteede korrashoid, rööbastee hooldus, raudtee inspektsioonid, defektoskoopia, Eesti, Läti, Leedu",
            ogTitle: "Raudteede jooksev korrashoid | Steel Buckle",
            ogDescription:
              "Põhjalikud raudtee hooldusteenused, sealhulgas ülevaatused, mõõtmised ja tehniline hooldus, et tagada ohutu ja usaldusväärne raudteeinfrastruktuur.",
          },
          lv: {
            title: "Dzelzceļu uzturēšanas pakalpojumi | Steel Buckle",
            metaDescription:
              "Dzelzceļu uzturēšanas un pastāvīgas apkopes pakalpojumi no Steel Buckle. Regulāras pārbaudes, defektoskopija un tehniskā apkope drošām dzelzceļa darbībām.",
            keywords:
              "dzelzceļa uzturēšana, sliežu ceļu uzturēšana, dzelzceļa inspekcijas, defektoskopija, Igaunija, Latvija, Lietuva",
            ogTitle: "Dzelzceļu uzturēšanas pakalpojumi | Steel Buckle",
            ogDescription:
              "Visaptveroši dzelzceļa uzturēšanas pakalpojumi, tostarp inspekcijas, mērījumi un tehniskā apkope, lai nodrošinātu drošu un uzticamu dzelzceļa infrastruktūru.",
          },
          ru: {
            title: "Услуги по обслуживанию железных дорог | Steel Buckle",
            metaDescription:
              "Услуги по обслуживанию и текущему содержанию железных дорог от Steel Buckle. Регулярные осмотры, дефектоскопия и техническое обслуживание для безопасной работы железных дорог.",
            keywords:
              "обслуживание железных дорог, содержание путей, инспекции железных дорог, дефектоскопия, Эстония, Латвия, Литва",
            ogTitle: "Услуги по обслуживанию железных дорог | Steel Buckle",
            ogDescription:
              "Комплексные услуги по обслуживанию железных дорог, включая инспекции, измерения и техническое обслуживание для обеспечения безопасной и надежной железнодорожной инфраструктуры.",
          },
        },
      },
      {
        pageKey: "services/repair-renovation",
        translations: {
          en: {
            title: "Railway Repair & Renovation Services | Steel Buckle",
            metaDescription:
              "Railway repair and renovation services from Steel Buckle. Rail and sleeper replacement, switch repairs, rail crossing renovation, and complete track overhaul.",
            keywords:
              "railway repair, railway renovation, rail replacement, sleeper replacement, switch repair, Estonia, Latvia, Lithuania",
            ogTitle: "Railway Repair & Renovation Services | Steel Buckle",
            ogDescription:
              "Railway repair and renovation services using certified materials and modern technologies for long-lasting railway infrastructure.",
          },
          et: {
            title: "Raudtee remont ja renoveerimine | Steel Buckle",
            metaDescription:
              "Raudteede remondi- ja renoveerimisteenus Steel Buckle'ilt. Rööbaste ja liiprite vahetus, pöörmete remont, raudteeülesõitude uuendamine ja täielik tee kapitaalremont.",
            keywords:
              "raudtee remont, raudtee renoveerimine, rööbaste vahetus, liiprite vahetus, pöörmete remont, Eesti, Läti, Leedu",
            ogTitle: "Raudtee remont ja renoveerimine | Steel Buckle",
            ogDescription:
              "Raudtee remondi- ja renoveerimisteenus, kasutades sertifitseeritud materjale ja kaasaegseid tehnoloogiaid pikaajalise raudteeinfrastruktuuri jaoks.",
          },
          lv: {
            title:
              "Dzelzceļa remonta un renovācijas pakalpojumi | Steel Buckle",
            metaDescription:
              "Dzelzceļa remonta un renovācijas pakalpojumi no Steel Buckle. Sliežu un gulšņu nomaiņa, pārmiju remonts, dzelzceļa pārbrauktuvju renovācija un pilnīga ceļa kapitālais remonts.",
            keywords:
              "dzelzceļa remonts, dzelzceļa renovācija, sliežu nomaiņa, gulšņu nomaiņa, pārmiju remonts, Igaunija, Latvija, Lietuva",
            ogTitle:
              "Dzelzceļa remonta un renovācijas pakalpojumi | Steel Buckle",
            ogDescription:
              "Dzelzceļa remonta un renovācijas pakalpojumi, izmantojot sertificētus materiālus un mūsdienīgas tehnoloģijas ilgtspējīgai dzelzceļa infrastruktūrai.",
          },
          ru: {
            title:
              "Услуги по ремонту и реновации железных дорог | Steel Buckle",
            metaDescription:
              "Услуги по ремонту и реновации железных дорог от Steel Buckle. Замена рельсов и шпал, ремонт стрелочных переводов, реновация железнодорожных переездов и полный капитальный ремонт путей.",
            keywords:
              "ремонт железных дорог, реновация железных дорог, замена рельсов, замена шпал, ремонт стрелочных переводов, Эстония, Латвия, Литва",
            ogTitle:
              "Услуги по ремонту и реновации железных дорог | Steel Buckle",
            ogDescription:
              "Услуги по ремонту и реновации железных дорог с использованием сертифицированных материалов и современных технологий для долговечной железнодорожной инфраструктуры.",
          },
        },
      },
      {
        pageKey: "services/railway-construction",
        translations: {
          en: {
            title: "Railway Construction Services | Steel Buckle",
            metaDescription:
              "Railway construction services from Steel Buckle. From project documentation to commissioning, we build reliable railway infrastructure across Estonia, Latvia & Lithuania.",
            keywords:
              "railway construction, track construction, railway infrastructure, Estonia, Latvia, Lithuania",
            ogTitle: "Railway Construction Services | Steel Buckle",
            ogDescription:
              "Railway construction services including project planning, technical documentation, construction, and commissioning by experienced railway specialists.",
          },
          et: {
            title: "Raudtee-ehitusteenused | Steel Buckle",
            metaDescription:
              "Raudtee-ehitusteenused Steel Buckle'ilt. Projektdokumentatsioonist kuni kasutuselevõtuni ehitame usaldusväärset raudteeinfrastruktuuri üle Eesti, Läti ja Leedu.",
            keywords:
              "raudtee-ehitus, rööbastee ehitus, raudteeinfrastruktuur, Eesti, Läti, Leedu",
            ogTitle: "Raudtee-ehitusteenused | Steel Buckle",
            ogDescription:
              "Raudtee-ehitusteenused, sh projekti planeerimine, tehniline dokumentatsioon, ehitus ja kasutuselevõtt kogenud raudteespetsialistide poolt.",
          },
          lv: {
            title: "Dzelzceļa būvniecības pakalpojumi | Steel Buckle",
            metaDescription:
              "Dzelzceļa būvniecības pakalpojumi no Steel Buckle. No projekta dokumentācijas līdz nodošanai ekspluatācijā mēs būvējam uzticamu dzelzceļa infrastruktūru Igaunijā, Latvijā un Lietuvā.",
            keywords:
              "dzelzceļa būvniecība, sliežu ceļu būvniecība, dzelzceļa infrastruktūra, Igaunija, Latvija, Lietuva",
            ogTitle: "Dzelzceļa būvniecības pakalpojumi | Steel Buckle",
            ogDescription:
              "Dzelzceļa būvniecības pakalpojumi, tostarp projekta plānošana, tehniskā dokumentācija, būvniecība un nodošana ekspluatācijā no pieredzējušiem dzelzceļa speciālistiem.",
          },
          ru: {
            title: "Услуги по строительству железных дорог | Steel Buckle",
            metaDescription:
              "Услуги по строительству железных дорог от Steel Buckle. От проектной документации до ввода в эксплуатацию, мы строим надежную железнодорожную инфраструктуру в Эстонии, Латвии и Литве.",
            keywords:
              "строительство железных дорог, строительство путей, железнодорожная инфраструктура, Эстония, Латвия, Литва",
            ogTitle: "Услуги по строительству железных дорог | Steel Buckle",
            ogDescription:
              "Услуги по строительству железных дорог, включая планирование проекта, техническую документацию, строительство и ввод в эксплуатацию опытными специалистами по железным дорогам.",
          },
        },
      },
      {
        pageKey: "services/design",
        translations: {
          en: {
            title: "Railway Design & Engineering Services | Steel Buckle",
            metaDescription:
              "Railway design and engineering services from Steel Buckle. Technical documentation preparation, railway infrastructure design, and permit documentation.",
            keywords:
              "railway design, railway engineering, technical documentation, railway planning, Estonia, Latvia, Lithuania",
            ogTitle: "Railway Design & Engineering Services | Steel Buckle",
            ogDescription:
              "Specialized railway design services that consider client needs, terrain specifics, and regional requirements for optimal railway infrastructure solutions.",
          },
          et: {
            title: "Raudtee projekteerimisteenused | Steel Buckle",
            metaDescription:
              "Raudtee projekteerimisteenused Steel Buckle'ilt. Tehnilise dokumentatsiooni ettevalmistamine, raudteeinfrastruktuuri projekteerimine ja lubade dokumentatsioon.",
            keywords:
              "raudtee projekteerimine, raudtee inseneritöö, tehniline dokumentatsioon, raudtee planeerimine, Eesti, Läti, Leedu",
            ogTitle: "Raudtee projekteerimisteenused | Steel Buckle",
            ogDescription:
              "Spetsialiseeritud raudtee projekteerimisteenused, mis arvestavad kliendi vajadusi, maastiku eripärasid ja piirkondlikke nõudeid optimaalsete raudteeinfrastruktuuri lahenduste jaoks.",
          },
          lv: {
            title: "Dzelzceļa projektēšanas pakalpojumi | Steel Buckle",
            metaDescription:
              "Dzelzceļa projektēšanas pakalpojumi no Steel Buckle. Tehniskās dokumentācijas sagatavošana, dzelzceļa infrastruktūras projektēšana un atļauju dokumentācija.",
            keywords:
              "dzelzceļa projektēšana, dzelzceļa inženierija, tehniskā dokumentācija, dzelzceļa plānošana, Igaunija, Latvija, Lietuva",
            ogTitle: "Dzelzceļa projektēšanas pakalpojumi | Steel Buckle",
            ogDescription:
              "Specializēti dzelzceļa projektēšanas pakalpojumi, kas ņem vērā klienta vajadzības, reljefa īpatnības un reģionālās prasības optimāliem dzelzceļa infrastruktūras risinājumiem.",
          },
          ru: {
            title: "Услуги по проектированию железных дорог | Steel Buckle",
            metaDescription:
              "Услуги по проектированию железных дорог от Steel Buckle. Подготовка технической документации, проектирование железнодорожной инфраструктуры и документация для разрешений.",
            keywords:
              "проектирование железных дорог, железнодорожный инжиниринг, техническая документация, планирование железных дорог, Эстония, Латвия, Литва",
            ogTitle: "Услуги по проектированию железных дорог | Steel Buckle",
            ogDescription:
              "Специализированные услуги по проектированию железных дорог, учитывающие потребности клиента, особенности рельефа и региональные требования для оптимальных решений железнодорожной инфраструктуры.",
          },
        },
      },
      {
        pageKey: "contact",
        translations: {
          en: {
            title: "Contact Us | Steel Buckle",
            metaDescription:
              "Get in touch with Steel Buckle for railway construction, maintenance, and repair services in Estonia, Latvia, and Lithuania. Request a quote today.",
            keywords:
              "contact Steel Buckle, railway construction company contact, railway maintenance contact, Estonia, Latvia, Lithuania",
            ogTitle: "Contact Us | Steel Buckle",
            ogDescription:
              "Reach out to our team of railway construction and maintenance experts for your next project across the Baltic countries.",
          },
          et: {
            title: "Võta ühendust | Steel Buckle",
            metaDescription:
              "Võta ühendust Steel Buckle'iga raudtee-ehitus-, hooldus- ja remonditeenuste saamiseks Eestis, Lätis ja Leedus. Küsi pakkumist juba täna.",
            keywords:
              "kontakt Steel Buckle, raudtee-ehitusettevõtte kontakt, raudtee hoolduse kontakt, Eesti, Läti, Leedu",
            ogTitle: "Võta ühendust | Steel Buckle",
            ogDescription:
              "Võta ühendust meie raudtee-ehituse ja hoolduse ekspertidega oma järgmise projekti jaoks Balti riikides.",
          },
          lv: {
            title: "Sazinies ar mums | Steel Buckle",
            metaDescription:
              "Sazinies ar Steel Buckle par dzelzceļa būvniecības, uzturēšanas un remonta pakalpojumiem Igaunijā, Latvijā un Lietuvā. Pieprasi piedāvājumu jau šodien.",
            keywords:
              "kontaktinformācija Steel Buckle, dzelzceļa būvniecības uzņēmuma kontakti, dzelzceļa uzturēšanas kontakti, Igaunija, Latvija, Lietuva",
            ogTitle: "Sazinies ar mums | Steel Buckle",
            ogDescription:
              "Sazinies ar mūsu dzelzceļa būvniecības un uzturēšanas ekspertiem savam nākamajam projektam Baltijas valstīs.",
          },
          ru: {
            title: "Свяжитесь с нами | Steel Buckle",
            metaDescription:
              "Свяжитесь с Steel Buckle для получения услуг по строительству, обслуживанию и ремонту железных дорог в Эстонии, Латвии и Литве. Запросите предложение сегодня.",
            keywords:
              "контакты Steel Buckle, контакты компании по строительству железных дорог, контакты по обслуживанию железных дорог, Эстония, Латвия, Литва",
            ogTitle: "Свяжитесь с нами | Steel Buckle",
            ogDescription:
              "Обратитесь к нашей команде экспертов по строительству и обслуживанию железных дорог для вашего следующего проекта в странах Балтии.",
          },
        },
      },
      {
        pageKey: "projects",
        translations: {
          en: {
            title: "Our Railway Projects | Steel Buckle",
            metaDescription:
              "Explore Steel Buckle's portfolio of railway construction and renovation projects across Estonia, Latvia, and Lithuania. See our expertise in action.",
            keywords:
              "railway projects, rail construction portfolio, completed railway works, Estonia, Latvia, Lithuania",
            ogTitle: "Our Railway Projects | Steel Buckle",
            ogDescription:
              "Browse through our railway construction, repair, and renovation projects showcasing our expertise across the Baltic region.",
          },
          et: {
            title: "Meie raudteeprojektid | Steel Buckle",
            metaDescription:
              "Tutvu Steel Buckle'i lõpetatud raudtee-ehitus- ja renoveerimisprojektide portfoolioga Eestis, Lätis ja Leedus. Vaata meie kogemust töös.",
            keywords:
              "raudteeprojektid, raudtee-ehituse portfoolio, tehtud raudteetööd, Eesti, Läti, Leedu",
            ogTitle: "Meie raudteeprojektid | Steel Buckle",
            ogDescription:
              "Sirvige meie raudtee-ehitus-, remondi- ja renoveerimisprojekte, mis näitavad meie oskusi kogu Baltikumi piirkonnas.",
          },
          lv: {
            title: "Mūsu dzelzceļa projekti | Steel Buckle",
            metaDescription:
              "Izpētiet Steel Buckle pabeigtus dzelzceļa būvniecības un renovācijas projektus Igaunijā, Latvijā un Lietuvā. Skatiet mūsu pieredzi darbībā.",
            keywords:
              "dzelzceļa projekti, sliežu būvniecības portfolio, pabeigtie dzelzceļa darbi, Igaunija, Latvija, Lietuva",
            ogTitle: "Mūsu dzelzceļa projekti | Steel Buckle",
            ogDescription:
              "Pārlūkojiet mūsu dzelzceļa būvniecības, remonta un renovācijas projektus, kas demonstrē mūsu zināšanas visā Baltijas reģionā.",
          },
          ru: {
            title: "Наши железнодорожные проекты | Steel Buckle",
            metaDescription:
              "Изучите портфолио завершенных проектов Steel Buckle по строительству и ремонту железных дорог в Эстонии, Латвии и Литве. Ознакомьтесь с нашим опытом.",
            keywords:
              "железнодорожные проекты, портфолио строительства железных дорог, выполненные железнодорожные работы, Эстония, Латвия, Литва",
            ogTitle: "Наши железнодорожные проекты | Steel Buckle",
            ogDescription:
              "Просмотрите наши проекты по строительству, ремонту и реновации железных дорог, демонстрирующие наш опыт по всему Балтийскому региону.",
          },
        },
      },
      {
        pageKey: "404",
        translations: {
          en: {
            title: "Page Not Found | Steel Buckle",
            metaDescription:
              "The page you're looking for cannot be found. Steel Buckle provides professional railway construction, repair & maintenance services across Estonia, Latvia & Lithuania with over 35 years of industry expertise.",
            keywords: "404, page not found, Steel Buckle, railway services",
            ogTitle: "Page Not Found | Steel Buckle",
            ogDescription:
              "Sorry, the page you're looking for doesn't exist. Return to our homepage to explore our railway construction and maintenance services across the Baltic region.",
          },
          et: {
            title: "Lehte ei leitud | Steel Buckle",
            metaDescription:
              "Otsitavat lehekülge ei leitud. Steel Buckle pakub professionaalseid raudtee-ehitus-, remondi- ja hooldusteenuseid Eestis, Lätis ja Leedus enam kui 35-aastase kogemusega raudteevaldkonnas.",
            keywords: "404, lehekülge ei leitud, Steel Buckle, raudteeteenused",
            ogTitle: "Lehte ei leitud | Steel Buckle",
            ogDescription:
              "Vabandame, kuid otsitavat lehekülge ei eksisteeri. Naase avalehele, et tutvuda meie raudtee-ehitus- ja hooldusteenustega Balti riikides.",
          },
          lv: {
            title: "Lapa nav atrasta | Steel Buckle",
            metaDescription:
              "Meklētā lapa nav atrasta. Steel Buckle piedāvā profesionālus dzelzceļa būvniecības, remonta un uzturēšanas pakalpojumus Igaunijā, Latvijā un Lietuvā ar vairāk nekā 35 gadu pieredzi dzelzceļa nozarē.",
            keywords:
              "404, lapa nav atrasta, Steel Buckle, dzelzceļa pakalpojumi",
            ogTitle: "Lapa nav atrasta | Steel Buckle",
            ogDescription:
              "Atvainojamies, meklētā lapa neeksistē. Atgriezieties sākumlapā, lai apskatītu mūsu dzelzceļa būvniecības un uzturēšanas pakalpojumus Baltijas valstīs.",
          },
          ru: {
            title: "Страница не найдена | Steel Buckle",
            metaDescription:
              "Запрашиваемая страница не найдена. Steel Buckle предоставляет профессиональные услуги по строительству, ремонту и обслуживанию железных дорог в Эстонии, Латвии и Литве с более чем 35-летним опытом в отрасли.",
            keywords:
              "404, страница не найдена, Steel Buckle, железнодорожные услуги",
            ogTitle: "Страница не найдена | Steel Buckle",
            ogDescription:
              "Извините, запрашиваемая страница не существует. Вернитесь на главную страницу, чтобы ознакомиться с нашими услугами по строительству и обслуживанию железных дорог в странах Балтии.",
          },
        },
      },
    ];

    // Insert the data into the database
    for (const page of seoData) {
      // Create the SeoMetadata entry
      const seoMetadata = await prisma.seoMetadata.create({
        data: { pageKey: page.pageKey },
      });

      // Create translations for each language
      for (const [langCode, translation] of Object.entries(page.translations)) {
        await prisma.seoTranslation.create({
          data: {
            seoId: seoMetadata.id,
            languageCode: langCode,
            title: translation.title,
            metaDescription: translation.metaDescription,
            keywords: translation.keywords || null,
            ogTitle: translation.ogTitle || null,
            ogDescription: translation.ogDescription || null,
          },
        });
      }
    }

    console.log("SEO metadata seeded successfully");
  } catch (error) {
    console.error("Error seeding SEO metadata:", error);
  }
}

async function seedUsers() {
  console.log("Seeding admin users...");

  try {
    // Delete all existing users
    console.log("Deleting existing users...");
    await prisma.user.deleteMany({});

    // Get environment variables with fallbacks
    const adminUsername = process.env.FIRSTADMIN_USERNAME || "default_admin1";
    const adminPassword =
      process.env.FIRSTADMIN_PASSWORD || "default_password1";

    const firstHashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: firstHashedPassword,
        role: "admin",
      },
    });
    console.log("Main admin user created successfully");

    // Create second admin user with hashed password
    const adminSecondUsername =
      process.env.SECONDADMIN_USERNAME || "default_admin2";
    const adminSecondPassword =
      process.env.SECONDADMIN_PASSWORD || "default_password2";

    const secondHashedPassword = await bcrypt.hash(adminSecondPassword, 10);
    await prisma.user.create({
      data: {
        username: adminSecondUsername,
        password: secondHashedPassword,
        role: "admin",
      },
    });
    console.log("Second admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin users:", error);
  }
}

async function seedContactInfo() {
  console.log("Seeding contact information...");

  try {
    // Check if contact info already exists
    const existingContact = await prisma.contactInfo.findFirst();

    if (!existingContact) {
      // Create contact info based on your common.json data
      const contactInfo = await prisma.contactInfo.create({
        data: {
          email: "steelbuckle@steelbuckle.ee",
          officeCity: "Tallinn",
          officePostal: "11415",
          officeStreet: "Peterburi tee 46",
          officeRoom: "Ruum 507",
        },
      });

      // Create phone numbers
      const phones = [
        { number: "+372 5879 5887", label: "Üldtelefon" },
        { number: "+372 5340 8493", label: "Dmitri Butkevitš" },
        { number: "+372 505 9047", label: "Valeri Fjodorov" },
      ];

      for (const phone of phones) {
        await prisma.phoneNumber.create({
          data: {
            contactInfoId: contactInfo.id,
            number: phone.number,
            label: phone.label,
          },
        });
      }

      console.log("Contact information created successfully");
    } else {
      console.log("Contact information already exists, skipping creation");
    }
  } catch (error) {
    console.error("Error seeding contact information:", error);
  }
}

async function seedProjects() {
  console.log("Seeding projects...");

  try {
    // First, delete all existing projects and their translations
    console.log("Deleting existing projects...");
    await prisma.projectTranslation.deleteMany({});
    await prisma.project.deleteMany({});

    // Sample project data with translations
    const projectsData = [
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/naissaare.png",
        year: "2018–2019",
        translations: {
          en: "Nõmme Historical Railway Track Renovation",
          et: "Nõmme ajaloolise raudtee lõigu renoveerimine",
          lv: "Nõmme vēsturiskā dzelzceļa posma atjaunošana",
          ru: "Реновация исторического железнодорожного участка Нымме",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Liepaja_(61).jpg",
        year: "2015",
        translations: {
          en: "Liepāja Railway Station Reconstruction",
          et: "Liepāja raudteejaama rekonstrueerimine",
          lv: "Liepājas dzelzceļa stacijas rekonstrukcija",
          ru: "Реконструкция железнодорожного вокзала Лиепаи",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/valgaraudteejaam.jpg",
        year: "2010-2012",
        translations: {
          en: "Valga Railway Station Reconstruction",
          et: "Valga raudteejaama rekonstrueerimine",
          lv: "Valgas dzelzceļa stacijas rekonstrukcija",
          ru: "Реконструкция железнодорожного вокзала Валга",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(55).jpg",
        year: "2013-2015",
        translations: {
          en: "Renovation of Sorting Hill and Underground Tracks at Šķirotava Station",
          et: "Sorteerimismäe ja mäealuste teede renoveerimine Šķirotava jaamas",
          lv: "Šķirotavas stacijas šķirošanas kalna un kalnapakšas ceļu renovācija",
          ru: "Реновация сортировочной горки и подгорных путей на станции Шкиротава",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Krievu_Sala_3.jpg",
        year: "2013-2015",
        translations: {
          en: "Construction of Technology Park in Krievu Island Area",
          et: "Tehnoloogiapargi ehitus Krievu saare piirkonnas",
          lv: "Tehnoloģiskā parka būvniecība Krievu salas rajonā",
          ru: "Строительство технологического парка в районе острова Криеву",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg",
        year: "2012-2015",
        translations: {
          en: "Construction of Second Track on Skrīveri-Krustpils Section",
          et: "Teise rööpapaari ehitamine lõigul Skrīveri-Krustpils",
          lv: "Otrā sliežu ceļa būvniecība posmā Skrīveri-Krustpils",
          ru: "Строительство второго пути на участке Скривери-Крустпилс",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Bolderaja_(49).jpg",
        year: "2015",
        translations: {
          en: "Construction of Bolderāja 2 Railway Station",
          et: "Raudteejaama Bolderāja 2 ehitamine",
          lv: "Dzelzceļa stacijas Bolderāja 2 būvniecība",
          ru: "Строительство железнодорожной станции Болдерая 2",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/thumbnail_lumetorje_2.jpg",
        year: "2012-2025",
        translations: {
          en: "Snow Removal Works on AS Eesti Raudtee Tracks and Switches",
          et: "Lumetõrjetööd AS Eesti Raudtee teedel ja pöörmetel",
          lv: "Sniega tīrīšanas darbi uz AS Eesti Raudtee ceļiem un pārmijām",
          ru: "Работы по уборке снега на путях и стрелках AS Eesti Raudtee",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Kazlu_Rida_3.jpg",
        year: "2013-2014",
        translations: {
          en: "Construction of Kazlų Rūda-Marijampole Railway Section (1435 mm Gauge)",
          et: "Raudteelõigu Kazlų Rūda-Marijampole ehitus (rööpmelaius 1435 mm)",
          lv: "Dzelzceļa posma Kazlų Rūda-Marijampole būvniecība (sliežu platums 1435 mm)",
          ru: "Строительство железнодорожного участка Казлу-Руда-Мариямполе (ширина колеи 1435 мм)",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Eesti_Raudtee_Muuga_jaama_kõrik._Taamal_paistmas_ka_jaama_juhtimiskeskus_(ET-post).jpg",
        year: "2014",
        translations: {
          en: "Reconstruction of Crane Tracks in Muuga Port",
          et: "Kraanateede rekonstrueerimine Muuga sadamas",
          lv: "Celtņu ceļu rekonstrukcija Mūgas ostā",
          ru: "Реконструкция крановых путей в порту Мууга",
        },
      },
      {
        image:
          "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744875430/lounasadam.jpg",
        year: "2015, 2016, 2019-2024",
        translations: {
          en: "Repair Works on Paldiski South Harbor Railway Tracks",
          et: "Paldiski Lõunasadama raudteede remonditööd",
          lv: "Paldiskas Dienvidu ostas dzelzceļa sliežu remontdarbi",
          ru: "Ремонтные работы железнодорожных путей Южного порта Палдиски",
        },
      },
    ];

    // Loop through projects and create them with translations
    for (const projectData of projectsData) {
      // Create the project
      const project = await prisma.project.create({
        data: {
          image: projectData.image,
          year: projectData.year,
        },
      });

      // Create translations for each language
      for (const [langCode, title] of Object.entries(
        projectData.translations
      )) {
        await prisma.projectTranslation.create({
          data: {
            projectId: project.id,
            languageCode: langCode,
            title: title,
          },
        });
      }
    }

    console.log("Projects seeded successfully");
  } catch (error) {
    console.error("Error seeding projects:", error);
  }
}

// Add this function to your seed.ts file

// async function seedSiteSettings() {
//   console.log("Seeding site settings...");

//   try {
//     // Define default site settings
//     const settings = [
//       {
//         key: "site.colorScheme",
//         value: JSON.stringify({
//           schemeId: "default",
//           logoVariant: "dark",
//           lineVariant: "dark",
//           colors: {
//             background: "#fde047",
//             text: "#000000",
//             accent: "#6b7280",
//             border: "#000000",
//             line: "#000000",
//           },
//         }),
//         description: "Global color scheme for the entire site",
//       },
//       // Add other global settings here if needed
//     ];

//     for (const setting of settings) {
//       await prisma.siteSettings.upsert({
//         where: { key: setting.key },
//         update: { value: setting.value },
//         create: {
//           key: setting.key,
//           value: setting.value,
//           description: setting.description,
//         },
//       });
//     }

//     console.log("Site settings seeded successfully");
//   } catch (error) {
//     console.error("Error seeding site settings:", error);
//   }
// }

// Main function
async function main() {
  try {
    console.log("Starting database seeding...");

    // Seed languages
    for (const lang of LANGUAGES) {
      console.log(`Seeding language: ${lang.name} (${lang.code})`);
      await prisma.language.upsert({
        where: { code: lang.code },
        update: { name: lang.name },
        create: { code: lang.code, name: lang.name },
      });
    }

    // Seed translations
    for (const lang of LANGUAGES) {
      console.log(`Processing translations for ${lang.name}...`);
      const data = loadJsonFile(lang.filePath);

      if (data) {
        try {
          console.log(
            `Starting to process ${
              Object.keys(data).length
            } top-level keys for ${lang.code}`
          );
          await processTranslations(data, "", lang.code);
          console.log(`Finished processing translations for ${lang.code}`);
        } catch (error) {
          console.error(
            `Error processing translations for ${lang.code}:`,
            error
          );
        }
      }
    }

    // Seed media data
    await insertMediaData();

    // Seed users
    await seedUsers();

    // Seed contact information
    await seedContactInfo();

    // Seed projects
    await seedProjects();

    // Seed SEO metadata
    await seedSeoMetadata();

    //await seedSiteSettings();
    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();
