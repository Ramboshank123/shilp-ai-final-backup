import type { GiTagInfo } from "./types";

export interface GiCraftRegistryEntry extends GiTagInfo {
  category: string;
  materials: string[];
  historical_origin: string;
  traditional_artisan_community: string;
  protection_law: string;
}

export const GI_REGISTRY: GiCraftRegistryEntry[] = [
  {
    tag_number: "GI-IN-AP0023",
    craft_name: "Kondapalli Bommallu",
    state: "Andhra Pradesh",
    registered_year: 2007,
    verified: true,
    heritage_seal: "Government of India GI Certified • Class 28 Handicraft",
    category: "Woodwork",
    materials: ["Tella Poniki softwood", "Tamarind seed paste", "Vegetable dyes"],
    historical_origin:
      "400-year-old tradition rooted in Krishna district, carved by Arya Kshatriyas.",
    traditional_artisan_community: "Nakarshalu Woodcarver Guild",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-KA0012",
    craft_name: "Channapatna Toys & Lacware",
    state: "Karnataka",
    registered_year: 2006,
    verified: true,
    heritage_seal: "Government of India GI Certified • Gomal Town Registry",
    category: "Woodwork",
    materials: [
      "Hale (Wrightia tinctoria) Ivory wood",
      "Natural shellac",
      "Turmeric & indigo dyes",
    ],
    historical_origin:
      "Patronized by Tipu Sultan in the 18th century, pioneering non-toxic vegetable lac turnery.",
    traditional_artisan_community: "Channapatna Turners Guild",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-UP0051",
    craft_name: "Khurja Terracotta & Pottery",
    state: "Uttar Pradesh",
    registered_year: 2015,
    verified: true,
    heritage_seal: "Government of India GI Certified • Ceramic City Bulandshahr",
    category: "Pottery",
    materials: ["Local alluvial clay", "Feldspar", "Natural cobalt mineral glaze"],
    historical_origin:
      "500-year legacy dating back to artisans who migrated during the Mughal and Afghan periods.",
    traditional_artisan_community: "Khurja Kumhar Samiti",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-MP0018",
    craft_name: "Chanderi Fabric & Sarees",
    state: "Madhya Pradesh",
    registered_year: 2005,
    verified: true,
    heritage_seal: "Government of India GI Certified • Handloom Mark",
    category: "Handloom",
    materials: ["Pure organza cotton", "Raw silk warp", "Zari motifs"],
    historical_origin:
      "Woven since the 2nd century BCE, renowned for sheer texture and gold zari brocades.",
    traditional_artisan_community: "Chanderi Bunkar Vikas Samiti",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-AS0112",
    craft_name: "Assam Bamboo & Cane Works",
    state: "Assam",
    registered_year: 2011,
    verified: true,
    heritage_seal: "Government of India GI Certified • Brahmaputra Valley Cluster",
    category: "Bamboo",
    materials: ["Jati bamboo", "Bhaluka bamboo", "Natural cane peel"],
    historical_origin:
      "Indigenous craft mentioned in Harsha Charita, integral to rural Assamese domestic life.",
    traditional_artisan_community: "Barpeta & Nalbari Craft SHGs",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-UP0045",
    craft_name: "Varanasi Wooden Lacquerware & Toys",
    state: "Uttar Pradesh",
    registered_year: 2014,
    verified: true,
    heritage_seal: "Government of India GI Certified • Kashi Heritage Registry",
    category: "Woodwork",
    materials: ["Koriya wood", "Natural resin lac", "Kewda oil polish"],
    historical_origin: "Centuries-old turning art practiced in the bylanes of Khojwan, Varanasi.",
    traditional_artisan_community: "Kashi Kashta Kala Samiti",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-BR0034",
    craft_name: "Madhubani (Mithila) Art",
    state: "Bihar",
    registered_year: 2007,
    verified: true,
    heritage_seal: "Government of India GI Certified • Mithilanchal Heritage",
    category: "Painting",
    materials: ["Handmade Lokta/Cotton paper", "Bamboo twig pens", "Cowdung wash & natural dyes"],
    historical_origin:
      "Practiced by women of Mithila since the era of Raja Janak to commemorate weddings and festivals.",
    traditional_artisan_community: "Jitwarpur & Ranti Mahila Artists",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-TG0002",
    craft_name: "Pochampally Ikat",
    state: "Telangana",
    registered_year: 2004,
    verified: true,
    heritage_seal: "Government of India GI Certified • India's First Handloom GI",
    category: "Textiles",
    materials: ["Mulberry silk", "Cotton yarn", "Resist tie-dye natural pigments"],
    historical_origin:
      "World-renowned double-ikat 'Pagdu Bandhu' weaving technique centered in Bhoodan Pochampally.",
    traditional_artisan_community: "Pochampally Handloom Weavers Cooperative",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-WB0089",
    craft_name: "Dokra Bell Metal Craft",
    state: "West Bengal",
    registered_year: 2018,
    verified: true,
    heritage_seal: "Government of India GI Certified • Lost-Wax Metalwork",
    category: "Metal craft",
    materials: ["Beeswax wire", "Red river clay", "Brass & bronze bell metal"],
    historical_origin:
      "4,000-year-old non-ferrous lost-wax casting dating back to the Mohenjo-daro Dancing Girl.",
    traditional_artisan_community: "Dhokra Damar Metallurgists",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
  {
    tag_number: "GI-IN-RJ0041",
    craft_name: "Blue Pottery of Jaipur",
    state: "Rajasthan",
    registered_year: 2008,
    verified: true,
    heritage_seal: "Government of India GI Certified • Pink City Heritage",
    category: "Pottery",
    materials: ["Quartz powder", "Glass cullet", "Fuller's earth & cobalt oxide"],
    historical_origin:
      "Turko-Persian ceramic art brought to Jaipur by Maharaja Sawai Ram Singh II in the 19th century.",
    traditional_artisan_community: "Jaipur Traditional Potters Guild",
    protection_law: "Geographical Indications of Goods (Registration & Protection) Act, 1999",
  },
];

/** Matches text/craft description against official GI craft database. */
export function matchGiCraft(query: string): GiCraftRegistryEntry | null {
  if (!query) return null;
  const q = query.toLowerCase();

  for (const entry of GI_REGISTRY) {
    const nameMatch = entry.craft_name
      .toLowerCase()
      .split(" ")
      .some((w) => w.length > 3 && q.includes(w));
    const stateMatch = q.includes(entry.state.toLowerCase());
    const categoryMatch = q.includes(entry.category.toLowerCase());

    if (q.includes("kondapalli") || (q.includes("toy") && q.includes("andhra"))) {
      if (entry.tag_number === "GI-IN-AP0023") return entry;
    }
    if (q.includes("channapatna") || (q.includes("lacquer") && q.includes("karnataka"))) {
      if (entry.tag_number === "GI-IN-KA0012") return entry;
    }
    if (
      q.includes("khurja") ||
      (q.includes("diya") && q.includes("terracotta")) ||
      (q.includes("clay") && q.includes("pradesh"))
    ) {
      if (entry.tag_number === "GI-IN-UP0051") return entry;
    }
    if (q.includes("chanderi") || (q.includes("scarf") && q.includes("handloom"))) {
      if (entry.tag_number === "GI-IN-MP0018") return entry;
    }
    if (
      q.includes("bamboo") ||
      q.includes("cane") ||
      q.includes("basket") ||
      q.includes("barpeta")
    ) {
      if (entry.tag_number === "GI-IN-AS0112") return entry;
    }
    if (q.includes("varanasi") || q.includes("sheesham") || q.includes("wooden box")) {
      if (entry.tag_number === "GI-IN-UP0045") return entry;
    }
    if (q.includes("madhubani") || q.includes("mithila") || q.includes("bihar")) {
      if (entry.tag_number === "GI-IN-BR0034") return entry;
    }
    if (q.includes("ikat") || q.includes("pochampally") || q.includes("telangana")) {
      if (entry.tag_number === "GI-IN-TG0002") return entry;
    }
    if (q.includes("dokra") || q.includes("dhokra") || q.includes("bell metal")) {
      if (entry.tag_number === "GI-IN-WB0089") return entry;
    }
    if (q.includes("blue pottery") || q.includes("jaipur")) {
      if (entry.tag_number === "GI-IN-RJ0041") return entry;
    }

    if (nameMatch || (stateMatch && categoryMatch)) {
      return entry;
    }
  }

  // Fallback match by category
  for (const entry of GI_REGISTRY) {
    if (q.includes(entry.category.toLowerCase())) {
      return entry;
    }
  }

  return null;
}
