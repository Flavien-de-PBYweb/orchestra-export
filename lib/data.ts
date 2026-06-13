// ── Types ────────────────────────────────────────────────────────────────────

export type CountryStatus = "actif" | "prospect" | "négociation" | "suspendu" | "en_ouverture";
export type PartnershipType = "franchise" | "licence" | "distribution" | "joint-venture" | "propre";
export type TodoStatus = "à_faire" | "en_cours" | "terminé" | "bloqué";
export type TodoPriority = "haute" | "moyenne" | "basse";
export type TicketStatus = "ouvert" | "en_cours" | "résolu" | "fermé";
export type TicketPriority = "critique" | "haute" | "moyenne" | "basse";

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 2-letter
  flag: string;
  status: CountryStatus;
  partnership: PartnershipType;
  partner?: string;
  stores: number;
  openingDate?: string;
  manager: string;
  revenue?: number;
  growth?: number;
  region: "Europe" | "Moyen-Orient" | "Afrique" | "Asie" | "Amériques";
  notes?: string;
}

export interface Todo {
  id: string;
  countryId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  assignee: string;
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
  duration: number; // minutes
  participants: string[];
  transcript?: string;
  summary?: string;
  actionItems?: string[];
  countryIds?: string[];
  firefliesId?: string;
  recordingUrl?: string;
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
  avatar?: string;
  countries?: string[];
  lastActive?: string;
  active: boolean;
}

export interface EcommerceStore {
  id: string;
  countryId: string;
  platform: string;
  url: string;
  revenue30d: number;
  revenue7d: number;
  orders30d: number;
  conversionRate: number;
  growth: number;
  currency: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  { id: "ma", name: "Maroc", code: "MA", flag: "🇲🇦", status: "actif", partnership: "franchise", partner: "Retail Maroc SA", stores: 24, openingDate: "2015-03-01", manager: "Sophie Martin", revenue: 8400000, growth: 12.3, region: "Afrique" },
  { id: "dz", name: "Algérie", code: "DZ", flag: "🇩🇿", status: "actif", partnership: "licence", partner: "Groupe Cevital", stores: 18, openingDate: "2017-09-01", manager: "Sophie Martin", revenue: 5200000, growth: 8.1, region: "Afrique" },
  { id: "tn", name: "Tunisie", code: "TN", flag: "🇹🇳", status: "actif", partnership: "franchise", partner: "Tunisie Retail", stores: 12, openingDate: "2016-04-01", manager: "Marc Dupont", revenue: 3100000, growth: 5.4, region: "Afrique" },
  { id: "ae", name: "Émirats Arabes Unis", code: "AE", flag: "🇦🇪", status: "actif", partnership: "distribution", partner: "Gulf Fashion LLC", stores: 8, openingDate: "2019-11-01", manager: "Sophie Martin", revenue: 4600000, growth: 22.1, region: "Moyen-Orient" },
  { id: "sa", name: "Arabie Saoudite", code: "SA", flag: "🇸🇦", status: "actif", partnership: "franchise", partner: "Al Hokair Group", stores: 15, openingDate: "2020-02-01", manager: "Marc Dupont", revenue: 7100000, growth: 31.5, region: "Moyen-Orient" },
  { id: "kw", name: "Koweït", code: "KW", flag: "🇰🇼", status: "actif", partnership: "distribution", partner: "M.H. Alshaya", stores: 4, openingDate: "2021-06-01", manager: "Marc Dupont", revenue: 1800000, growth: 18.7, region: "Moyen-Orient" },
  { id: "qa", name: "Qatar", code: "QA", flag: "🇶🇦", status: "négociation", partnership: "franchise", stores: 0, manager: "Sophie Martin", region: "Moyen-Orient" },
  { id: "pl", name: "Pologne", code: "PL", flag: "🇵🇱", status: "prospect", partnership: "franchise", stores: 0, manager: "Marie Leroy", region: "Europe" },
  { id: "ro", name: "Roumanie", code: "RO", flag: "🇷🇴", status: "en_ouverture", partnership: "franchise", partner: "Fashion Group RO", stores: 0, openingDate: "2025-09-01", manager: "Marie Leroy", region: "Europe" },
  { id: "pt", name: "Portugal", code: "PT", flag: "🇵🇹", status: "actif", partnership: "propre", stores: 6, openingDate: "2018-05-01", manager: "Marie Leroy", revenue: 2200000, growth: 3.2, region: "Europe" },
  { id: "es", name: "Espagne", code: "ES", flag: "🇪🇸", status: "actif", partnership: "propre", stores: 22, openingDate: "2013-01-01", manager: "Marie Leroy", revenue: 11500000, growth: 1.8, region: "Europe" },
  { id: "it", name: "Italie", code: "IT", flag: "🇮🇹", status: "actif", partnership: "franchise", partner: "Italmoda SpA", stores: 9, openingDate: "2020-10-01", manager: "Sophie Martin", revenue: 3400000, growth: 15.2, region: "Europe" },
  { id: "sn", name: "Sénégal", code: "SN", flag: "🇸🇳", status: "prospect", partnership: "franchise", stores: 0, manager: "Marc Dupont", region: "Afrique" },
  { id: "ci", name: "Côte d'Ivoire", code: "CI", flag: "🇨🇮", status: "en_ouverture", partnership: "franchise", partner: "Abidjan Retail", stores: 0, openingDate: "2025-12-01", manager: "Marc Dupont", region: "Afrique" },
];

export const USERS: User[] = [
  { id: "u1", name: "Sophie Martin", email: "s.martin@orchestra.fr", role: "admin", active: true, lastActive: "2025-06-13", countries: ["ma", "dz", "ae", "sa", "it", "qa"] },
  { id: "u2", name: "Marc Dupont", email: "m.dupont@orchestra.fr", role: "manager", active: true, lastActive: "2025-06-12", countries: ["tn", "kw", "sn", "ci"] },
  { id: "u3", name: "Marie Leroy", email: "m.leroy@orchestra.fr", role: "manager", active: true, lastActive: "2025-06-11", countries: ["pl", "ro", "pt", "es"] },
  { id: "u4", name: "Pierre Bernard", email: "p.bernard@orchestra.fr", role: "viewer", active: true, lastActive: "2025-06-10" },
  { id: "u5", name: "Lucie Fontaine", email: "l.fontaine@orchestra.fr", role: "viewer", active: false, lastActive: "2025-05-20" },
];

export const TODOS: Todo[] = [
  { id: "t1", countryId: "ro", title: "Signature contrat partenaire Roumanie", description: "Finaliser le contrat avec Fashion Group RO", status: "en_cours", priority: "haute", dueDate: "2025-06-30", assignee: "Marie Leroy", createdAt: "2025-05-01", updatedAt: "2025-06-10", tags: ["contrat", "juridique"] },
  { id: "t2", countryId: "ro", title: "Audit site premier magasin Bucarest", status: "à_faire", priority: "haute", dueDate: "2025-07-15", assignee: "Marie Leroy", createdAt: "2025-05-15", updatedAt: "2025-05-15" },
  { id: "t3", countryId: "qa", title: "Présentation deck investisseurs Qatar", status: "terminé", priority: "haute", assignee: "Sophie Martin", createdAt: "2025-04-01", updatedAt: "2025-06-01" },
  { id: "t4", countryId: "qa", title: "Due diligence franchise Qatar", status: "en_cours", priority: "moyenne", dueDate: "2025-07-31", assignee: "Sophie Martin", createdAt: "2025-06-01", updatedAt: "2025-06-12" },
  { id: "t5", countryId: "sa", title: "Plan expansion 5 nouveaux magasins KSA", status: "en_cours", priority: "haute", dueDate: "2025-08-01", assignee: "Marc Dupont", createdAt: "2025-05-20", updatedAt: "2025-06-08" },
  { id: "t6", countryId: "ci", title: "Visite terrain Abidjan", status: "à_faire", priority: "moyenne", dueDate: "2025-09-15", assignee: "Marc Dupont", createdAt: "2025-06-01", updatedAt: "2025-06-01" },
  { id: "t7", countryId: "ma", title: "Renouvellement contrat Retail Maroc SA", status: "à_faire", priority: "haute", dueDate: "2025-12-31", assignee: "Sophie Martin", createdAt: "2025-06-05", updatedAt: "2025-06-05" },
  { id: "t8", countryId: "pl", title: "Identification partenaire potentiel Pologne", status: "en_cours", priority: "basse", assignee: "Marie Leroy", createdAt: "2025-04-15", updatedAt: "2025-06-10" },
];

export const TICKETS: Ticket[] = [
  { id: "tk1", jiraKey: "EXP-142", title: "Interface de synchronisation Coda", description: "Développement du connecteur API Coda pour la synchronisation des données pays", status: "en_cours", priority: "haute", assignee: "Dev Team", reporter: "Sophie Martin", createdAt: "2025-06-01", updatedAt: "2025-06-12", labels: ["coda", "api"] },
  { id: "tk2", jiraKey: "EXP-138", title: "Module carte monde interactive", status: "en_cours", priority: "haute", assignee: "Dev Team", reporter: "Sophie Martin", createdAt: "2025-05-20", updatedAt: "2025-06-10", labels: ["cartographie"] },
  { id: "tk3", jiraKey: "EXP-125", title: "Connexion Fireflies.ai", status: "résolu", priority: "moyenne", assignee: "Dev Team", reporter: "Marie Leroy", createdAt: "2025-05-01", updatedAt: "2025-06-01", labels: ["fireflies", "meetings"] },
  { id: "tk4", jiraKey: "EXP-150", title: "Dashboard reporting e-commerce UAE", status: "ouvert", priority: "moyenne", assignee: "Dev Team", reporter: "Sophie Martin", countryId: "ae", createdAt: "2025-06-10", updatedAt: "2025-06-10", labels: ["reporting", "ecommerce"] },
  { id: "tk5", jiraKey: "EXP-151", title: "Bug: tri des pays par revenue", status: "ouvert", priority: "basse", assignee: "Dev Team", reporter: "Marc Dupont", createdAt: "2025-06-12", updatedAt: "2025-06-12", labels: ["bug"] },
];

export const MEETINGS: Meeting[] = [
  { id: "m1", title: "Point hebdo Export — Semaine 23", date: "2025-06-09", duration: 60, participants: ["Sophie Martin", "Marc Dupont", "Marie Leroy"], summary: "Revue avancement Roumanie, point Qatar, mise à jour KPI S1.", actionItems: ["Finaliser contrat RO avant 30/06", "Envoyer deck Qatar avant 15/06"], countryIds: ["ro", "qa"] },
  { id: "m2", title: "Call partenaire Al Hokair — Expansion KSA", date: "2025-06-05", duration: 90, participants: ["Sophie Martin", "Marc Dupont", "Ahmed Al Hokair"], summary: "Discussion plan ouverture 5 magasins supplémentaires en Arabie Saoudite pour 2026.", actionItems: ["Envoyer plan retombées économiques", "Proposer dates visite terrains"], countryIds: ["sa"] },
  { id: "m3", title: "Review Q2 2025 — Direction Export", date: "2025-06-02", duration: 120, participants: ["Sophie Martin", "Marie Leroy", "Marc Dupont", "Pierre Bernard"], summary: "Bilan S1 2025 : CA export +18% vs N-1. Points forts UAE et KSA. Actions correctives Tunisie.", countryIds: ["ae", "sa", "tn"] },
];

export const NOTES: Note[] = [
  { id: "n1", title: "Stratégie expansion Afrique sub-saharienne 2026", content: "Cibles prioritaires : Sénégal (Dakar), Côte d'Ivoire (Abidjan), puis Ghana. Format franchise avec partenaire local obligatoire. Budget alloué : 500k€ étude de marché.", author: "Sophie Martin", createdAt: "2025-06-01", updatedAt: "2025-06-10", tags: ["stratégie", "afrique"], pinned: true },
  { id: "n2", title: "Conditions franchise standard Orchestra International", content: "Droit d'entrée : 50-80k€ selon marché. Royalties : 4-6% du CA. Durée : 5 ans renouvelables. Formation obligatoire : 3 semaines Montpellier.", author: "Sophie Martin", createdAt: "2025-05-15", updatedAt: "2025-05-15", tags: ["franchise", "juridique"], pinned: true },
  { id: "n3", title: "Contact potentiel Pologne — Fashion Retail Polska", content: "Rencontré au salon CIFF Copenhague. Intéressé par master-franchise Pologne + Tchéquie. CA groupe : 120M€. Contact : Jan Kowalski, CEO.", author: "Marie Leroy", createdAt: "2025-06-08", updatedAt: "2025-06-08", countryId: "pl", tags: ["contact", "prospect"], pinned: false },
];

export const ECOMMERCE_STORES: EcommerceStore[] = [
  { id: "ec1", countryId: "ma", platform: "Shopify", url: "orchestra.ma", revenue30d: 285000, revenue7d: 68000, orders30d: 1240, conversionRate: 3.2, growth: 18.5, currency: "MAD" },
  { id: "ec2", countryId: "ae", platform: "WooCommerce", url: "orchestra-uae.com", revenue30d: 124000, revenue7d: 31000, orders30d: 890, conversionRate: 2.8, growth: 42.1, currency: "AED" },
  { id: "ec3", countryId: "sa", platform: "Shopify", url: "orchestra-ksa.com", revenue30d: 198000, revenue7d: 51000, orders30d: 1560, conversionRate: 3.5, growth: 55.3, currency: "SAR" },
  { id: "ec4", countryId: "es", platform: "SFCC", url: "orchestra.es", revenue30d: 410000, revenue7d: 98000, orders30d: 2100, conversionRate: 2.1, growth: 5.2, currency: "EUR" },
];
