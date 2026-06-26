// ── Types ────────────────────────────────────────────────────────────────────

export type StoreStatus = "✅ Ouvert" | "🔍 En recherche cellule" | "⏸️ Suspendu" | "🚧 En cours" | "❌ Fermé" | "FERMETURE A VENIR";
export type PartnershipType = "FRANCHISE" | "MASTER FRANCHISE" | "DISTRI LIGHT" | "COMMISSION AFFILIATION";
export type ProductType = "TEXTILE" | "MIXTE" | "";
export type TodoStatus = "à_faire" | "en_cours" | "terminé" | "bloqué";
export type TodoPriority = "haute" | "moyenne" | "basse";
export type TicketStatus = "ouvert" | "en_cours" | "résolu" | "fermé";
export type TicketPriority = "critique" | "haute" | "moyenne" | "basse";

export interface Store {
  id: string;
  name: string;
  country: string; // Country key
  status: StoreStatus;
  partnership: PartnershipType;
  product: ProductType;
  code: string;
  rep: string;
  denom: string;
  address: string;
  city: string;
  notes: string;
  surface: string;
  codaRowId?: string; // Coda row ID for updates
}

export interface Country {
  id: string;       // slug e.g. "algerie"
  name: string;     // display name e.g. "Algérie"
  codaKey: string;  // Coda table key e.g. "ALGERIE"
  flag: string;
  region: string;
  codaPageId?: string; // Coda page ID for this country
}

export interface Todo {
  id: string;
  countryId?: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  assignee: string;
  category?: string;
  codaRowId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Ticket {
  id: string;
  jiraKey?: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  reporter: string;
  countryId?: string;
  createdAt: string;
  updatedAt: string;
  labels?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  transcript?: string;
  summary?: string;
  actionItems?: string[];
  countryIds?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  countryId?: string;
  tags?: string[];
  pinned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  countries?: string[];
  lastActive?: string;
  active: boolean;
}

// ── Countries Master List (from Coda EXPORT doc) ─────────────────────────────

export const COUNTRIES: Country[] = [
  { id: "albanie", name: "Albanie", codaKey: "ALBANIE", flag: "🇦🇱", region: "Europe", codaPageId: "section-iPNQfDHjQR" },
  { id: "algerie", name: "Algérie", codaKey: "ALGERIE", flag: "🇩🇿", region: "Afrique du Nord", codaPageId: "section-uOi8mKMQv3" },
  { id: "allemagne", name: "Allemagne", codaKey: "ALLEMAGNE", flag: "🇩🇪", region: "Europe", codaPageId: "section-amhDhLstIX" },
  { id: "armenie", name: "Arménie", codaKey: "ARMENIE", flag: "🇦🇲", region: "Caucase", codaPageId: "section-jxFdQM5Rko" },
  { id: "canada", name: "Canada", codaKey: "CANADA", flag: "🇨🇦", region: "Amériques", codaPageId: "section-20TEmy9O65" },
  { id: "cote-ivoire", name: "Côte d'Ivoire", codaKey: "COTE IVOIRE", flag: "🇨🇮", region: "Afrique", codaPageId: "section-TSTuyOaryD" },
  { id: "croatie", name: "Croatie", codaKey: "CROATIE", flag: "🇭🇷", region: "Europe", codaPageId: "section-BsCuc8_RwF" },
  { id: "espagne", name: "Espagne", codaKey: "ESPAGNE", flag: "🇪🇸", region: "Europe", codaPageId: "section-AXpj0UbqZz" },
  { id: "gabon", name: "Gabon", codaKey: "GABON", flag: "🇬🇦", region: "Afrique", codaPageId: "section-Zz-Fpm0NtP" },
  { id: "georgie", name: "Géorgie", codaKey: "GEORGIE", flag: "🇬🇪", region: "Caucase", codaPageId: "section-DxFqepMLlo" },
  { id: "ghana", name: "Ghana", codaKey: "GHANA", flag: "🇬🇭", region: "Afrique", codaPageId: "section-HS8lqZdsL3" },
  { id: "guadeloupe", name: "Guadeloupe", codaKey: "GUADELOUPE", flag: "🇬🇵", region: "DOM-TOM", codaPageId: "section-42_uHOwExF" },
  { id: "guyane", name: "Guyane", codaKey: "GUYANE", flag: "🇬🇫", region: "DOM-TOM", codaPageId: "section-5vDkO9D48U" },
  { id: "kazakhstan", name: "Kazakhstan", codaKey: "KAZAKHSTAN", flag: "🇰🇿", region: "Asie Centrale", codaPageId: "section-cxzHllmuFH" },
  { id: "kosovo", name: "Kosovo", codaKey: "KOSOVO", flag: "🇽🇰", region: "Europe", codaPageId: "section-hH5Zpw6H_x" },
  { id: "liban", name: "Liban", codaKey: "LIBAN", flag: "🇱🇧", region: "Moyen-Orient", codaPageId: "section-Gk3-7b_0Ii" },
  { id: "madagascar", name: "Madagascar", codaKey: "MADAGASCAR", flag: "🇲🇬", region: "Afrique", codaPageId: "section-_kBEMu7E-G" },
  { id: "martinique", name: "Martinique", codaKey: "MARTINIQUE", flag: "🇲🇶", region: "DOM-TOM", codaPageId: "section-XJXc_ZF1kk" },
  { id: "maurice", name: "Maurice", codaKey: "MAURICE", flag: "🇲🇺", region: "Afrique", codaPageId: "section-aiuuSL9cQj" },
  { id: "mauritanie", name: "Mauritanie", codaKey: "MAURITANIE", flag: "🇲🇷", region: "Afrique du Nord", codaPageId: "section-IXOgc4LSg3" },
  { id: "moldavie", name: "Moldavie", codaKey: "MOLDAVIE", flag: "🇲🇩", region: "Europe", codaPageId: "section-MWTWWE1hUm" },
  { id: "mongolie", name: "Mongolie", codaKey: "MONGOLIE", flag: "🇲🇳", region: "Asie", codaPageId: "section-B8-WO5HrKR" },
  { id: "nouvelle-caledonie", name: "Nouvelle-Calédonie", codaKey: "NOUVELLE CALEDONIE", flag: "🇳🇨", region: "DOM-TOM", codaPageId: "section-NMXaJEelYv" },
  { id: "ouzbekistan", name: "Ouzbékistan", codaKey: "OUZBEKISTAN", flag: "🇺🇿", region: "Asie Centrale", codaPageId: "section-ZSwIq53OJb" },
  { id: "paraguay", name: "Paraguay", codaKey: "PARAGUAY", flag: "🇵🇾", region: "Amériques", codaPageId: "section-F83Xs1EEVI" },
  { id: "portugal", name: "Portugal", codaKey: "PORTUGAL", flag: "🇵🇹", region: "Europe", codaPageId: "section-T3dCmPiq9q" },
  { id: "reunion", name: "Réunion", codaKey: "REUNION", flag: "🇷🇪", region: "DOM-TOM", codaPageId: "section-oNDQ76MYBA" },
  { id: "roumanie", name: "Roumanie", codaKey: "ROUMANIE", flag: "🇷🇴", region: "Europe", codaPageId: "section-DPh58Ehf-X" },
  { id: "senegal", name: "Sénégal", codaKey: "SENEGAL", flag: "🇸🇳", region: "Afrique", codaPageId: "section-AAwHBoP8Qa" },
  { id: "st-martin", name: "Saint-Martin", codaKey: "ST MARTIN", flag: "🏝️", region: "DOM-TOM", codaPageId: "section-S5iVuFh7IF" },
  { id: "st-pierre-miquelon", name: "Saint-Pierre-et-Miquelon", codaKey: "ST PIERRE MIQUELON", flag: "🏝️", region: "DOM-TOM", codaPageId: "section-qk9w_LMbQQ" },
  { id: "west-bank", name: "West Bank", codaKey: "WEST BANK", flag: "🇵🇸", region: "Moyen-Orient", codaPageId: "section-Eaj5saR3qO" },
];

// ── Stores (real data from Coda "📦 Magasins — Base Globale") ─────────────────

export const STORES: Store[] = [
  { id: "i-IflVGGjWhY", name: "ZAGREB (City Center East)", country: "CROATIE", status: "FERMETURE A VENIR", partnership: "FRANCHISE", product: "TEXTILE", code: "C43532", rep: "Mrs Dajana Vidić", denom: "BRUNIK TRADE d.o.o.", address: "City Center one East, Slavonska av. 11, Zagreb", city: "Zagreb, Croatie", notes: "", surface: "" },
  { id: "i-N1xVY5wiai", name: "ST MARTIN", country: "ST MARTIN", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C42739", rep: "M. JIMENEZ", denom: "SAMADIS MADISA", address: "", city: "Saint-Martin", notes: "", surface: "" },
  { id: "i-RRKoAE0VAX", name: "DURES", country: "ALBANIE", status: "🔍 En recherche cellule", partnership: "MASTER FRANCHISE", product: "TEXTILE", code: "", rep: "Mrs Dora-Xhoi ISMAILI / Mr Arjan XHAHO", denom: "JL FASHIN SHPK", address: "", city: "Durres", notes: "", surface: "" },
  { id: "i-apfzxDll4I", name: "OULAN-BATOR", country: "MONGOLIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "", code: "C46241", rep: "Tugs Ochi SODBAATAR", denom: "WellRegal Investment Co.Ltd", address: "", city: "Oulan-Bator, Mongolie", notes: "", surface: "" },
  { id: "i-eXWsu6Blcp", name: "ORAN", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43627", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Oran, Algérie", notes: "", surface: "320" },
  { id: "i-ztHFZttj67", name: "ACCRA", country: "GHANA", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "TEXTILE", code: "C46219", rep: "Mrs Jennifer BOATENG", denom: "", address: "", city: "Accra, Ghana", notes: "", surface: "208" },
  { id: "i-fW4g1X1yuB", name: "MENORCA", country: "ESPAGNE", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "TEXTILE", code: "C42981", rep: "Ana Maria Lopez Luna", denom: "Luna infantil", address: "Plaza Jaime II Nº17 Local", city: "Menorca, Espagne", notes: "", surface: "100" },
  { id: "i-frRCJoWqfV", name: "LEIPZIG", country: "ALLEMAGNE", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "TEXTILE", code: "C46239", rep: "Thomas SCHIRMER", denom: "KIDSONLY", address: "", city: "Leipzig, Allemagne", notes: "", surface: "250" },
  { id: "i-iXe8tIDdTk", name: "CHISINAU", country: "MOLDAVIE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C46221", rep: "Mrs Ana Nagrudnîi", denom: "", address: "", city: "Chisinau, Moldavie", notes: "", surface: "" },
  { id: "i-mXhYMMRYc3", name: "CIUDAD DEL ESTE", country: "PARAGUAY", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C43332", rep: "JACSON JORBEL GRIEBELER", denom: "", address: "", city: "Ciudad del Este, Paraguay", notes: "", surface: "" },
  { id: "i-sVNURx2ilu", name: "ZAGREB (City Center West)", country: "CROATIE", status: "⏸️ Suspendu", partnership: "FRANCHISE", product: "TEXTILE", code: "C43535", rep: "Mrs Dajana Vidić", denom: "BRUNIK TRADE d.o.o.", address: "", city: "Zagreb, Croatie", notes: "", surface: "" },
  { id: "i-wG4rEJS6BU", name: "ST PAUL", country: "REUNION", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "MIXTE", code: "RE3", rep: "M. Shakir Ismael LOCATE", denom: "", address: "", city: "Saint-Paul, Réunion", notes: "", surface: "" },
  { id: "i-jl4UfSF_AR", name: "DELY BRAHIM", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43593", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "Avenue 11 décembre, Alger", city: "Dely Brahim, Alger, Algérie", notes: "", surface: "650" },
  { id: "i-XPU-K8QJCQ", name: "ROSE BELLE", country: "MAURICE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43704", rep: "M. Roupesh Hematlal", denom: "", address: "", city: "Rose Belle, Maurice", notes: "", surface: "" },
  { id: "i-2xoLgFDkvh", name: "CONSTANTINE", country: "ALGERIE", status: "🚧 En cours", partnership: "FRANCHISE", product: "TEXTILE", code: "C43718", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Constantine, Algérie", notes: "", surface: "" },
  { id: "i-76gL8J1Ktk", name: "YEREVAN", country: "ARMENIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C41792", rep: "Miss Gayane Babken Chakaryan", denom: "", address: "Yerevan Mall, Arshakunyats street 34/3", city: "Yerevan, Arménie", notes: "", surface: "230" },
  { id: "i-M0xqzA-uCJ", name: "ANTANANARIVO", country: "MADAGASCAR", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C43713", rep: "Mme Sarah Popat", denom: "", address: "", city: "Antananarivo, Madagascar", notes: "", surface: "" },
  { id: "i-S0VtCxvv27", name: "NOUMEA", country: "NOUVELLE CALEDONIE", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C42233", rep: "M. Michel Verges", denom: "", address: "", city: "Nouméa, Nouvelle-Calédonie", notes: "", surface: "" },
  { id: "i-8qz5jryc3I", name: "PORTO", country: "PORTUGAL", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C46223", rep: "Heully Dias Sonia", denom: "", address: "", city: "Porto, Portugal", notes: "", surface: "" },
  { id: "i-fmy58utb7M", name: "BERLIN DAS SCHLOSS", country: "ALLEMAGNE", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "TEXTILE", code: "C46240", rep: "Thomas SCHIRMER", denom: "KIDSONLY", address: "", city: "Berlin, Allemagne", notes: "", surface: "200" },
  { id: "i-KflOwBuF_X", name: "ANNABA", country: "ALGERIE", status: "🚧 En cours", partnership: "FRANCHISE", product: "TEXTILE", code: "C43719", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Annaba, Algérie", notes: "", surface: "" },
  { id: "i-Hl8Ak008MG", name: "ST PIERRE & MIQUELON", country: "ST PIERRE MIQUELON", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C41472", rep: "Mme Sylvie LEMOINE", denom: "", address: "", city: "Saint-Pierre-et-Miquelon", notes: "", surface: "" },
  { id: "i-pPMQYjT-1z", name: "GRACANICE", country: "KOSOVO", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43628", rep: "Mr Nysret GASHI", denom: "", address: "", city: "Gracanice, Kosovo", notes: "", surface: "" },
  { id: "i-m5XxfrkaVg", name: "ASTANA ALMATY (x12 + Outlet)", country: "KAZAKHSTAN", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C43630", rep: "Mrs Elmira NURSEITOVA / Mr Murat Khazret", denom: "", address: "", city: "Astana / Almaty, Kazakhstan", notes: "", surface: "" },
  { id: "i-MB1QNAvm_S", name: "TIZZI OUZOU", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43716", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Tizi Ouzou, Algérie", notes: "", surface: "190" },
  { id: "i-P82RFke78F", name: "FLACQ", country: "MAURICE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43703", rep: "M. Roupesh Hematlal", denom: "", address: "", city: "Flacq, Maurice", notes: "", surface: "" },
  { id: "i-2FgM-pHx_j", name: "TIRANA 2", country: "ALBANIE", status: "🔍 En recherche cellule", partnership: "MASTER FRANCHISE", product: "TEXTILE", code: "", rep: "Mrs Dora-Xhoi ISMAILI / Mr Arjan XHAHO", denom: "JL FASHIN SHPK", address: "", city: "Tirana, Albanie", notes: "", surface: "" },
  { id: "i-W_gwNR4fHe", name: "LA CROISETTE", country: "MAURICE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43702", rep: "M. Roupesh Hematlal", denom: "", address: "", city: "La Croisette, Maurice", notes: "", surface: "" },
  { id: "i-5AE5Kpj-9r", name: "TIRANA - Ring center", country: "ALBANIE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "TEXTILE", code: "C46216", rep: "Mrs Dora-Xhoi ISMAILI / Mr Arjan XHAHO", denom: "JL FASHIN SHPK", address: "", city: "Tirana, Albanie", notes: "", surface: "140" },
  { id: "i-fnFpPhNtHu", name: "ALMADIES", country: "SENEGAL", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C46215", rep: "Mme Gabrielle KANE", denom: "", address: "", city: "Almadies, Sénégal", notes: "", surface: "" },
  { id: "i-NYehUJqFYo", name: "ZADAR", country: "CROATIE", status: "FERMETURE A VENIR", partnership: "FRANCHISE", product: "TEXTILE", code: "C43534", rep: "Mrs Dajana Vidić", denom: "BRUNIK TRADE d.o.o.", address: "", city: "Zadar, Croatie", notes: "", surface: "" },
  { id: "i-HdrAWIMy2P", name: "OTOPENI", country: "ROUMANIE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C46228", rep: "OPREA Ovidiu", denom: "", address: "", city: "Otopeni, Roumanie", notes: "", surface: "" },
  { id: "i-NQwnhuK9Fk", name: "TASHKENT", country: "OUZBEKISTAN", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C46230", rep: "ILKHOM BABAMURADOV", denom: "", address: "", city: "Tachkent, Ouzbékistan", notes: "", surface: "" },
  { id: "i-kDhRvbWG3N", name: "ST PIERRE", country: "REUNION", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "MIXTE", code: "RE4", rep: "M. Shakir Ismael LOCATE", denom: "", address: "", city: "Saint-Pierre, Réunion", notes: "", surface: "" },
  { id: "i-PAYD4yRldp", name: "BERLIN WILMA", country: "ALLEMAGNE", status: "🚧 En cours", partnership: "COMMISSION AFFILIATION", product: "TEXTILE", code: "C46246", rep: "Thomas SCHIRMER", denom: "KIDSONLY", address: "", city: "Berlin, Allemagne", notes: "", surface: "" },
  { id: "i-twBaNnznxd", name: "ST PIERRE CENTRE", country: "REUNION", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "MIXTE", code: "RE5", rep: "M. Shakir Ismael LOCATE", denom: "", address: "", city: "Saint-Pierre Centre, Réunion", notes: "", surface: "" },
  { id: "i-Epzh1Q1Oxi", name: "PRISTINA", country: "KOSOVO", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C42892", rep: "Mr Nysret GASHI", denom: "", address: "", city: "Pristina, Kosovo", notes: "", surface: "" },
  { id: "i-Ae8Sw7qbwX", name: "TBILISSI (East point)", country: "GEORGIE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C43717", rep: "Aleksandre SAMKHARADZE", denom: "Tradeline LLC", address: "", city: "Tbilissi, Géorgie", notes: "", surface: "744" },
  { id: "i-KvnQoakRDf", name: "RUSTAVELLI (Mall)", country: "GEORGIE", status: "🚧 En cours", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C43717", rep: "Aleksandre SAMKHARADZE", denom: "Tradeline LLC", address: "", city: "Rustavelli city, Géorgie", notes: "", surface: "" },
  { id: "i-fUG-mzt-bg", name: "LIBREVILLE", country: "GABON", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "TEXTILE", code: "C42435", rep: "Dominique BRUN BOURINGHI", denom: "Dylan Boutique", address: "Montée de Louis Galerie verte 1er étage, Libreville", city: "Libreville, Gabon", notes: "", surface: "100" },
  { id: "i-GnuNnJ_P8R", name: "ABIDJAN", country: "COTE IVOIRE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C46222", rep: "Mr DAMANA Ange Denis", denom: "AXIUM", address: "77 boulevard francois mitterrand, Abidjan", city: "Abidjan, Côte d'Ivoire", notes: "", surface: "200" },
  { id: "i-OXGBLdvpIw", name: "ALGER BAB EZZOUAR", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43714", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Bab Ezzouar, Alger, Algérie", notes: "", surface: "190" },
  { id: "i-t9skEpLR0S", name: "BERLIN SPANDAU", country: "ALLEMAGNE", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "TEXTILE", code: "C46242", rep: "Thomas SCHIRMER", denom: "KIDSONLY", address: "", city: "Berlin Spandau, Allemagne", notes: "", surface: "170" },
  { id: "i-2qHmdZo6ox", name: "TRIBECA", country: "MAURICE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43705", rep: "M. Roupesh Hematlal", denom: "", address: "", city: "Tribeca, Maurice", notes: "", surface: "" },
  { id: "i-Pj8axxGvT_", name: "SPLIT", country: "CROATIE", status: "FERMETURE A VENIR", partnership: "FRANCHISE", product: "TEXTILE", code: "C43533", rep: "Mrs Dajana Vidić", denom: "BRUNIK TRADE d.o.o.", address: "", city: "Split, Croatie", notes: "", surface: "230" },
  { id: "i-5A1NRCNmTy", name: "NOUAKCHOTT", country: "MAURITANIE", status: "✅ Ouvert", partnership: "MASTER FRANCHISE", product: "MIXTE", code: "C46229", rep: "Mme Widad GHADDA", denom: "", address: "", city: "Nouakchott, Mauritanie", notes: "", surface: "" },
  { id: "i-Xc_HutSNDi", name: "ORAN ES SENIA", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43715", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Es Sénia, Oran, Algérie", notes: "", surface: "160" },
  { id: "i-lZaeY1DtIY", name: "BEYROUTH (x2 + 1 outlet)", country: "LIBAN", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C43159", rep: "Mme Rabah KOUSSA", denom: "", address: "", city: "Beyrouth, Liban", notes: "", surface: "" },
  { id: "i---JdEYHvwI", name: "HEBRON", country: "WEST BANK", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C46214", rep: "Mr Ahmad KABADJI", denom: "", address: "", city: "Hébron, West Bank", notes: "", surface: "" },
  { id: "i-PcCQwf3BcL", name: "STE MARIE", country: "REUNION", status: "✅ Ouvert", partnership: "COMMISSION AFFILIATION", product: "MIXTE", code: "RE1", rep: "M. Shakir Ismael LOCATE", denom: "", address: "", city: "Sainte-Marie, Réunion", notes: "", surface: "" },
  { id: "i-pZu8JOYSQu", name: "BAGATELLE", country: "MAURICE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43701", rep: "M. Roupesh Hematlal", denom: "", address: "", city: "Bagatelle, Maurice", notes: "", surface: "" },
  { id: "i-s5A95bX8q2", name: "SETIF", country: "ALGERIE", status: "✅ Ouvert", partnership: "FRANCHISE", product: "TEXTILE", code: "C43594", rep: "M. AIT MEZIANE LYES", denom: "EURL AML FASHION AND RETAIL", address: "", city: "Sétif, Algérie", notes: "", surface: "320" },
  { id: "i-Q7fHTveneZ", name: "COLOGNE", country: "ALLEMAGNE", status: "🚧 En cours", partnership: "COMMISSION AFFILIATION", product: "TEXTILE", code: "C46245", rep: "Thomas SCHIRMER", denom: "KIDSONLY", address: "", city: "Cologne, Allemagne", notes: "", surface: "" },
  { id: "i-I37MxvrfR7", name: "LAVAL", country: "CANADA", status: "⏸️ Suspendu", partnership: "FRANCHISE", product: "TEXTILE", code: "C46244", rep: "Mr CERET Gaëtan", denom: "", address: "", city: "Laval, Canada", notes: "", surface: "" },
  { id: "i-p4k0EAAno0", name: "ST MARTIN (2)", country: "ST MARTIN", status: "✅ Ouvert", partnership: "DISTRI LIGHT", product: "MIXTE", code: "C42739", rep: "M. JIMENEZ", denom: "SAMADIS MADISA", address: "", city: "Saint-Martin", notes: "", surface: "" },
];

// Helper: get stores for a country (by codaKey)
export function getStoresForCountry(codaKey: string): Store[] {
  return STORES.filter((s) => s.country === codaKey);
}

// Helper: get country by slug
export function getCountryById(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id);
}

// Helper: get country by codaKey
export function getCountryByCodaKey(codaKey: string): Country | undefined {
  return COUNTRIES.find((c) => c.codaKey === codaKey);
}

// ── Global stats (from Coda "📊 Statistiques Globales") ──────────────────────

export const GLOBAL_STATS = {
  totalCountries: 30,
  totalStores: 55,
  storesOpen: 43,
  storesEnCours: 5,
  storesSuspendu: 2,
  storesEnRecherche: 2,
  storesFermeture: 3,
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  { id: "u1", name: "Laura Fernandez", email: "lfernandez@orchestra-premaman.com", role: "admin", active: true, lastActive: "2026-06-13" },
  { id: "u2", name: "PBYweb", email: "pbywebagency@gmail.com", role: "admin", active: true, lastActive: "2026-06-13" },
];

// ── Todos (editable via UI, synced to Coda) ───────────────────────────────────

export const INITIAL_TODOS: Todo[] = [
  { id: "t1", countryId: "roumanie", title: "Signature contrat partenaire Roumanie", description: "Finaliser le contrat avec le partenaire master franchise", status: "en_cours", priority: "haute", dueDate: "2026-07-30", assignee: "Laura Fernandez", createdAt: "2026-05-01", updatedAt: "2026-06-10", tags: ["contrat", "juridique"] },
  { id: "t2", countryId: "albanie", title: "Ouverture DURES — recherche cellule active", status: "en_cours", priority: "haute", dueDate: "2026-08-15", assignee: "Laura Fernandez", createdAt: "2026-05-15", updatedAt: "2026-06-12" },
  { id: "t3", countryId: "algerie", title: "Ouverture Constantine — suivi travaux", status: "en_cours", priority: "haute", dueDate: "2026-07-31", assignee: "Laura Fernandez", createdAt: "2026-06-01", updatedAt: "2026-06-12" },
  { id: "t4", countryId: "allemagne", title: "Ouverture Berlin WILMA — finalisation", status: "en_cours", priority: "moyenne", dueDate: "2026-08-01", assignee: "Laura Fernandez", createdAt: "2026-05-20", updatedAt: "2026-06-08" },
  { id: "t5", countryId: "croatie", title: "Fermeture Zagreb City Center East — procédure", description: "Gérer la fermeture et communication partenaire", status: "à_faire", priority: "haute", dueDate: "2026-07-15", assignee: "Laura Fernandez", createdAt: "2026-06-01", updatedAt: "2026-06-01" },
  { id: "t6", countryId: "georgie", title: "Ouverture Rustavelli Mall — suivi DEV IT", status: "en_cours", priority: "moyenne", assignee: "Laura Fernandez", createdAt: "2026-04-15", updatedAt: "2026-06-10" },
];

// ── Tickets ───────────────────────────────────────────────────────────────────

export const TICKETS: Todo[] = [];

export const INITIAL_TICKETS = [
  { id: "tk1", jiraKey: "EXP-142", title: "Synchronisation Coda bidirectionnelle", description: "API Coda — lecture et écriture depuis l'outil export", status: "en_cours" as TicketStatus, priority: "haute" as TicketPriority, assignee: "Dev", reporter: "Laura Fernandez", createdAt: "2026-06-01", updatedAt: "2026-06-13", labels: ["coda", "api"] },
  { id: "tk2", jiraKey: "EXP-143", title: "Connexion Fireflies.ai — transcriptions automatiques", status: "ouvert" as TicketStatus, priority: "haute" as TicketPriority, assignee: "Dev", reporter: "Laura Fernandez", createdAt: "2026-06-05", updatedAt: "2026-06-12", labels: ["fireflies"] },
  { id: "tk3", jiraKey: "EXP-144", title: "Génération PDF rapport pays", status: "en_cours" as TicketStatus, priority: "moyenne" as TicketPriority, assignee: "Dev", reporter: "Laura Fernandez", createdAt: "2026-06-08", updatedAt: "2026-06-13", labels: ["pdf"] },
  { id: "tk4", jiraKey: "EXP-145", title: "Connexion JIRA — tickets bidirectionnels", status: "ouvert" as TicketStatus, priority: "moyenne" as TicketPriority, assignee: "Dev", reporter: "Laura Fernandez", createdAt: "2026-06-10", updatedAt: "2026-06-10", labels: ["jira"] },
  { id: "tk5", jiraKey: "EXP-140", title: "Carte interactive magasins monde", status: "résolu" as TicketStatus, priority: "haute" as TicketPriority, assignee: "Dev", reporter: "Laura Fernandez", createdAt: "2026-05-20", updatedAt: "2026-06-05", labels: ["cartographie"] },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const INITIAL_NOTES: Note[] = [
  { id: "n1", title: "Conditions standards franchise Orchestra International", content: "Droit d'entrée : selon marché.\nRoyalties : % du CA défini par contrat.\nDurée : 5 ans renouvelables.\nFormation obligatoire : formation aux standards Orchestra.\n\nDocuments requis :\n- DIP (Document d'Information Précontractuelle)\n- Questionnaire franchise signé par franchisé\n- Plan cellule DWG + photos\n- Justificatifs financiers", author: "Laura Fernandez", createdAt: "2026-05-01", updatedAt: "2026-06-01", tags: ["franchise", "juridique"], pinned: true },
  { id: "n2", title: "Informations préalables lancement nouveau partenaire", content: "Juridique :\n[ ] Fiche candidat DIP à remplir et faire signer\n[ ] Questionnaire franchise Orchestra signé\n\nTravaux — documents à demander au partenaire :\n[ ] Plan cellule DWG (ou PDF si DWG impossible)\n[ ] Plan façade DWG avec dimensions (entrée + vitrines)\n[ ] Photos intérieur, extérieur, façade\n[ ] Coupe cellule DWG + hauteur sous plafond\n\nInformations à recueillir :\n[ ] Adresse exacte cellule\n[ ] Surface de vente m2\n[ ] Adresse dépôt livraison", author: "Laura Fernandez", createdAt: "2026-05-15", updatedAt: "2026-06-10", tags: ["checklist", "lancement"], pinned: true },
  { id: "n3", title: "Noms de domaine — suivi", content: "Suivre les renouvellements des noms de domaine par pays.\nVoir page Coda dédiée : 'Noms de domaine'", author: "Laura Fernandez", createdAt: "2026-06-01", updatedAt: "2026-06-01", tags: ["digital", "technique"], pinned: false },
];

// ── Meetings ──────────────────────────────────────────────────────────────────

export const INITIAL_MEETINGS: Meeting[] = [
  { id: "m1", title: "Point hebdo Export — Juin 2026", date: "2026-06-09", duration: 60, participants: ["Laura Fernandez"], summary: "Revue avancement ouvertures en cours. Point Roumanie, Albanie (DURES), suivi Allemagne WILMA.", actionItems: ["Relancer partenaire Roumanie avant 15/06", "Suivi travaux DURES — visite prévue juillet"], countryIds: ["roumanie", "albanie", "allemagne"] },
  { id: "m2", title: "Audit site Algérie — Constantine & Annaba", date: "2026-06-02", duration: 45, participants: ["Laura Fernandez", "M. AIT MEZIANE LYES"], summary: "Revue avancement chantiers Constantine et Annaba. Ouvertures prévues Q3 2026.", actionItems: ["Envoyer plan implantation Constantine", "Confirmer date livraison travaux Annaba"], countryIds: ["algerie"] },
];
