/**
 * Seed `govt_schemes` with 30+ major Indian agricultural welfare schemes.
 *
 * Run: `npm run seed:schemes`  (idempotent, upserts by slug)
 * Pass `--reset` to drop the collection first.
 *
 * Sources verified against pmkisan.gov.in, pmfby.gov.in, myscheme.gov.in,
 * agricoop.nic.in and ICAR/KVK publications.
 */

import { ensureDnsResolves } from "./_dnsFix"; // ← also loads .env.local
import mongoose from "mongoose";
import GovtScheme from "../src/models/GovtScheme";

type SchemeSeed = {
  slug: string;
  name: string;
  shortName?: string;
  type:
    | "subsidy"
    | "insurance"
    | "credit"
    | "training"
    | "input_support"
    | "marketing"
    | "pension"
    | "other";
  description: string;
  benefits: string;
  eligibility: string[];
  applicationProcess?: string;
  requiredDocuments: string[];
  officialUrl?: string;
  helpline?: string;
  ministry?: string;
  applicableStates?: string[];
  targetFarmers: string[];
};

const SCHEMES: SchemeSeed[] = [
  {
    slug: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi",
    shortName: "PM-KISAN",
    type: "input_support",
    description:
      "Direct income support for landholding farmer families across India. Three equal installments of ₹2,000 are credited every four months.",
    benefits: "₹6,000 per year, transferred directly to the bank account in three installments.",
    eligibility: [
      "Indian farmer family with cultivable landholding",
      "Excludes income tax payers, government employees and pensioners above ₹10,000/month",
      "Excludes constitutional post holders and elected representatives",
    ],
    applicationProcess:
      "Register at pmkisan.gov.in or through your nearest Common Service Centre (CSC) with land records.",
    requiredDocuments: ["Aadhaar", "Bank account details", "Land record / Khasra-Khatauni"],
    officialUrl: "https://pmkisan.gov.in",
    helpline: "155261 / 1800-115-526",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    type: "insurance",
    description:
      "Crop insurance against yield loss caused by non-preventable natural risks — drought, flood, pest attack, and post-harvest losses.",
    benefits:
      "Compensation up to the sum insured (cost of cultivation) when yield falls below the threshold.",
    eligibility: [
      "All farmers — owner-cultivators, tenants, sharecroppers — growing notified crops in notified areas",
      "Compulsory for loanee farmers, voluntary for non-loanee farmers",
    ],
    applicationProcess:
      "Apply through the National Crop Insurance Portal, your bank, CSC, or insurance company before the cut-off date for each crop season.",
    requiredDocuments: [
      "Aadhaar",
      "Bank account",
      "Land records / sowing certificate",
      "Tenant/sharecropper agreement if applicable",
    ],
    officialUrl: "https://pmfby.gov.in",
    helpline: "14447",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "kcc",
    name: "Kisan Credit Card",
    shortName: "KCC",
    type: "credit",
    description:
      "Short-term institutional credit for crop production, post-harvest expenses, and consumption requirements at concessional interest rates.",
    benefits:
      "Loans up to ₹3 lakh at 7% interest. With timely repayment, effective rate drops to 4% via interest subvention.",
    eligibility: [
      "Farmers — individual, joint or tenant cultivators",
      "Self-help groups and joint liability groups of farmers",
    ],
    applicationProcess:
      "Apply at any commercial bank, regional rural bank, or co-operative bank with land records and identity proof.",
    requiredDocuments: ["Aadhaar", "PAN", "Land documents", "Two passport-size photos"],
    officialUrl: "https://www.myscheme.gov.in/schemes/kcc",
    helpline: "1800-180-1551",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    type: "subsidy",
    description:
      "Convergent irrigation programme covering watershed development, micro-irrigation (drip and sprinkler) and command area development.",
    benefits:
      "Subsidies of 55% for small/marginal farmers and 45% for others on micro-irrigation systems.",
    eligibility: [
      "Farmer with cultivable land",
      "Land must have an assured water source",
    ],
    applicationProcess: "Apply through the state agriculture/horticulture department or pmksy.gov.in.",
    requiredDocuments: ["Aadhaar", "Land record", "Water source proof"],
    officialUrl: "https://www.myscheme.gov.in/schemes/pmksypdmc",
    ministry: "Ministry of Jal Shakti",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "shc",
    name: "Soil Health Card Scheme",
    shortName: "SHC",
    type: "input_support",
    description:
      "Provides farmers with a soil health card carrying crop-wise nutrient and fertilizer recommendations based on soil testing every two years.",
    benefits:
      "Free soil testing and personalized fertilizer recommendations to reduce input cost and improve yield.",
    eligibility: ["Any farmer with cultivable land"],
    applicationProcess:
      "Submit a soil sample at the nearest Krishi Vigyan Kendra or state agriculture office.",
    requiredDocuments: ["Aadhaar", "Land details"],
    officialUrl: "https://soilhealth.dac.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana",
    shortName: "PKVY",
    type: "subsidy",
    description:
      "Promotes organic farming through cluster-based farmer participatory guarantee system (PGS) certification.",
    benefits:
      "₹50,000 per hectare over 3 years to clusters of 50+ farmers, including ₹31,000 directly to farmers for organic inputs.",
    eligibility: [
      "Farmers willing to form/join a 50-farmer cluster",
      "Minimum cluster size: 50 farmers covering 50 hectares",
    ],
    applicationProcess:
      "Approach your state organic certification body or the District Agriculture Office.",
    requiredDocuments: ["Aadhaar", "Land record", "Cluster registration"],
    officialUrl: "https://naturalfarming.dac.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "pm-kisan-mandhan",
    name: "PM Kisan Maan Dhan Yojana",
    shortName: "PM-KMY",
    type: "pension",
    description:
      "Voluntary contributory pension scheme for small and marginal farmers aged 18 to 40 to ensure ₹3,000/month pension after age 60.",
    benefits: "Monthly pension of ₹3,000 from age 60 onwards.",
    eligibility: [
      "Small and marginal farmer (cultivable land up to 2 hectares)",
      "Age 18 to 40 at time of enrolment",
      "Not a beneficiary of any other social security scheme",
    ],
    applicationProcess:
      "Enrol via maandhan.in or at the nearest Common Service Centre with Aadhaar and bank details.",
    requiredDocuments: ["Aadhaar", "Bank account", "Land record"],
    officialUrl: "https://pmkmy.gov.in",
    helpline: "1800-3000-3468",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal"],
  },
  {
    slug: "nmoop",
    name: "National Mission on Edible Oils — Oil Palm",
    shortName: "NMEO-OP",
    type: "subsidy",
    description:
      "Mission to expand area under oil palm cultivation, particularly in the North-East and Andaman & Nicobar Islands, to reduce edible-oil import dependency.",
    benefits:
      "Assistance for planting material, maintenance, drip irrigation, harvesting tools, and a viability price formula for fresh fruit bunches.",
    eligibility: ["Farmers in identified oil palm cultivation states"],
    applicationProcess: "Apply through state horticulture department.",
    requiredDocuments: ["Aadhaar", "Land record"],
    officialUrl: "https://nmeo.dac.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applicableStates: [
      "Andhra Pradesh",
      "Telangana",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Odisha",
      "Mizoram",
      "Nagaland",
      "Manipur",
      "Tripura",
      "Assam",
      "Arunachal Pradesh",
    ],
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    shortName: "SMAM",
    type: "subsidy",
    description:
      "Promotes farm mechanization by subsidising tractors, implements, custom hiring centres and post-harvest equipment.",
    benefits:
      "40–50% subsidy on a wide range of farm machinery, with higher rates for small/marginal farmers, women, and SC/ST.",
    eligibility: ["Individual farmers, FPOs, custom hiring centres, self-help groups"],
    applicationProcess: "Apply through agrimachinery.nic.in or state agriculture department.",
    requiredDocuments: ["Aadhaar", "Land record", "Bank details"],
    officialUrl: "https://agrimachinery.nic.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "women", "sc_st", "all"],
  },
  {
    slug: "pm-aasha",
    name: "Pradhan Mantri Annadata Aay Sanrakshan Abhiyan",
    shortName: "PM-AASHA",
    type: "marketing",
    description:
      "Umbrella scheme to ensure remunerative prices to farmers for oilseeds, pulses and copra through procurement, price deficiency payment, and pilot private procurement.",
    benefits:
      "MSP-based procurement, or compensation when market price falls below MSP for notified crops.",
    eligibility: ["Farmers growing notified pulses, oilseeds and copra"],
    applicationProcess:
      "Register at the procurement centre or e-NAM portal during notified procurement window.",
    requiredDocuments: ["Aadhaar", "Land record", "Bank account"],
    officialUrl: "https://www.myscheme.gov.in/schemes/pm-aasha",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "e-nam",
    name: "National Agriculture Market",
    shortName: "e-NAM",
    type: "marketing",
    description:
      "Pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities.",
    benefits:
      "Transparent online price discovery, larger buyer pool, and online payments directly to the farmer's account.",
    eligibility: ["Any farmer registered with a participating APMC"],
    applicationProcess:
      "Register at enam.gov.in or with your nearest e-NAM enabled APMC mandi.",
    requiredDocuments: ["Aadhaar", "Bank account", "Mandi registration"],
    officialUrl: "https://enam.gov.in",
    helpline: "1800-270-0224",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "fpo-scheme",
    name: "Formation and Promotion of 10,000 FPOs",
    shortName: "10K FPOs",
    type: "training",
    description:
      "Central scheme to form and promote 10,000 new Farmer Producer Organizations (FPOs) by 2027–28 with cluster-based business support.",
    benefits:
      "Equity grant of ₹15 lakh per FPO, credit guarantee up to ₹2 crore, and 5 years of CBBO handholding.",
    eligibility: [
      "Group of farmers willing to form an FPO with minimum 300 (100 in NER/hilly areas) members",
    ],
    applicationProcess:
      "Approach implementing agencies (NABARD, NCDC, SFAC) or sfacindia.com.",
    requiredDocuments: ["FPO registration", "Member list", "Aadhaar of members"],
    officialUrl: "https://sfacindia.com",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "rkvy",
    name: "Rashtriya Krishi Vikas Yojana",
    shortName: "RKVY",
    type: "subsidy",
    description:
      "State-driven flagship scheme that gives flexibility to states to plan and execute agriculture and allied sector projects.",
    benefits:
      "Funding for state-specific projects: extension, post-harvest, marketing, water conservation, and value chain.",
    eligibility: ["State governments, FPOs, agri-startups"],
    applicationProcess: "Approach state department of agriculture for project-specific calls.",
    requiredDocuments: ["Project proposal", "Implementing agency credentials"],
    officialUrl: "https://rkvy.da.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "namo-drone-didi",
    name: "Namo Drone Didi",
    shortName: "Drone Didi",
    type: "subsidy",
    description:
      "Provides agricultural drones to women-led Self Help Groups for spraying services in agriculture.",
    benefits:
      "80% subsidy (up to ₹8 lakh) on a drone package for SHGs, plus pilot training.",
    eligibility: [
      "Women-led SHG with operational capacity",
      "Aspirational district preference",
    ],
    applicationProcess: "Through National Rural Livelihoods Mission (NRLM) state mission.",
    requiredDocuments: ["SHG registration", "Aadhaar of members"],
    officialUrl: "https://www.myscheme.gov.in/schemes/namo-drone-didi",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["women"],
  },
  {
    slug: "nmnf",
    name: "National Mission on Natural Farming",
    shortName: "NMNF",
    type: "subsidy",
    description:
      "Promotes chemical-free natural farming through cluster-based capacity building and certification.",
    benefits:
      "₹15,000 per hectare over 2 years to farmers in identified clusters, plus training and certification support.",
    eligibility: ["Farmers willing to convert to natural farming, organized into clusters"],
    applicationProcess: "Apply through state department of agriculture or KVK.",
    requiredDocuments: ["Aadhaar", "Land record"],
    officialUrl: "https://naturalfarming.dac.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "agri-infra-fund",
    name: "Agriculture Infrastructure Fund",
    shortName: "AIF",
    type: "credit",
    description:
      "₹1 lakh-crore financing facility for post-harvest management infrastructure and community farming assets, with interest subvention.",
    benefits: "3% interest subvention on loans up to ₹2 crore, with credit guarantee.",
    eligibility: [
      "Individual farmers, FPOs, agri-entrepreneurs, PACS, marketing cooperatives, SHGs, JLGs",
    ],
    applicationProcess: "Apply at agriinfra.dac.gov.in via any participating lender.",
    requiredDocuments: ["Project DPR", "Aadhaar", "Bank account", "Collateral as required"],
    officialUrl: "https://agriinfra.dac.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "nfsm",
    name: "National Food Security Mission",
    shortName: "NFSM",
    type: "input_support",
    description:
      "Increases production and productivity of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.",
    benefits:
      "Subsidy on certified seeds, INM/IPM demonstrations, farm machinery, water-saving devices, and capacity building.",
    eligibility: ["Farmers in identified districts for each notified crop"],
    applicationProcess: "Apply via state agriculture department.",
    requiredDocuments: ["Aadhaar", "Land record"],
    officialUrl: "https://www.nfsm.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "mids",
    name: "Mission for Integrated Development of Horticulture",
    shortName: "MIDH",
    type: "subsidy",
    description:
      "Holistic growth of horticulture sector covering fruits, vegetables, flowers, spices, mushrooms, and bee-keeping.",
    benefits:
      "Subsidies on planting material, area expansion, protected cultivation, post-harvest infrastructure and bee-keeping.",
    eligibility: ["Farmers, SHGs, FPOs, entrepreneurs in horticulture"],
    applicationProcess: "Apply through state horticulture mission.",
    requiredDocuments: ["Aadhaar", "Land record", "Project plan if needed"],
    officialUrl: "https://midh.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "kvk-network",
    name: "Krishi Vigyan Kendra Network",
    shortName: "KVK",
    type: "training",
    description:
      "District-level farm-science centres providing on-farm testing, frontline demonstrations, training and advisory services.",
    benefits: "Free training, on-farm demonstrations and crop advisories tailored to local conditions.",
    eligibility: ["Any farmer in the district"],
    applicationProcess: "Visit your district KVK or contact via icar.org.in/kvk-mobile-numbers.",
    requiredDocuments: ["Aadhaar"],
    officialUrl: "https://kvk.icar.gov.in",
    ministry: "ICAR / Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "atma",
    name: "Agricultural Technology Management Agency",
    shortName: "ATMA",
    type: "training",
    description:
      "District-level extension reform initiative connecting farmers with research institutes, technologies and exposure visits.",
    benefits:
      "Demonstrations, exposure visits, farmer-scientist interactions, and Farm School trainings.",
    eligibility: ["Farmers, FPOs, women's groups"],
    applicationProcess: "Approach district ATMA office or state agriculture department.",
    requiredDocuments: ["Aadhaar"],
    officialUrl: "https://extensionreforms.da.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "pmegp",
    name: "Prime Minister Employment Generation Programme",
    shortName: "PMEGP",
    type: "credit",
    description:
      "Credit-linked subsidy scheme for setting up new micro-enterprises in rural and urban areas, including agro-based.",
    benefits:
      "15–35% margin money subsidy on project up to ₹50 lakh (manufacturing) or ₹20 lakh (service).",
    eligibility: [
      "Individuals above 18 years",
      "SHGs, institutions registered under Societies Registration Act",
    ],
    applicationProcess: "Apply online at kviconline.gov.in/pmegpeportal.",
    requiredDocuments: ["Aadhaar", "Project report", "Caste/category certificate if applicable"],
    officialUrl: "https://www.kviconline.gov.in/pmegpeportal",
    ministry: "Ministry of MSME",
    targetFarmers: ["small", "marginal", "women", "sc_st", "all"],
  },
  {
    slug: "pm-svanidhi",
    name: "PM Street Vendor's AatmaNirbhar Nidhi",
    shortName: "PM SVANidhi",
    type: "credit",
    description:
      "Working capital loan for street vendors including those selling fruits and vegetables, with interest subsidy.",
    benefits:
      "Collateral-free working capital up to ₹50,000 in tranches with 7% interest subsidy and digital cashback.",
    eligibility: ["Street vendors with vending certificate from urban local body"],
    applicationProcess: "Apply at pmsvanidhi.mohua.gov.in or via lender.",
    requiredDocuments: ["Aadhaar", "Vendor certificate", "Bank account"],
    officialUrl: "https://pmsvanidhi.mohua.gov.in",
    ministry: "Ministry of Housing & Urban Affairs",
    targetFarmers: ["all"],
  },
  {
    slug: "nabard-dairy",
    name: "Dairy Entrepreneurship Development Scheme",
    shortName: "DEDS",
    type: "subsidy",
    description:
      "NABARD-administered scheme for creating self-employment opportunities through commercial dairy farming and milk products.",
    benefits:
      "25% capital subsidy (33.33% for SC/ST) on bankable dairy projects.",
    eligibility: ["Farmers, SHGs, cooperatives, dairy entrepreneurs"],
    applicationProcess: "Apply via NABARD's nodal banks with a dairy project proposal.",
    requiredDocuments: ["Aadhaar", "Project DPR", "Bank account"],
    officialUrl: "https://www.nabard.org",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "rkvy-raftaar-startups",
    name: "RKVY-RAFTAAR Agri-Startup Programme",
    shortName: "Agri-Startup",
    type: "training",
    description:
      "Funding and incubation support for agri-tech startups across the agriculture and allied sector.",
    benefits:
      "Idea/Pre-seed grants up to ₹5 lakh; Seed grant up to ₹25 lakh through R-ABIs.",
    eligibility: [
      "Indian agri startups registered as a company / LLP / partnership",
      "Less than 5 years old, turnover below threshold",
    ],
    applicationProcess: "Apply via RKVY-RAFTAAR knowledge partners and R-ABIs.",
    requiredDocuments: ["Startup pitch", "Company registration", "Aadhaar of founders"],
    officialUrl: "https://rkvy.da.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "national-bee-mission",
    name: "National Bee-keeping & Honey Mission",
    shortName: "NBHM",
    type: "subsidy",
    description:
      "Promotes scientific bee-keeping for crop pollination, honey production and farmer livelihood diversification.",
    benefits:
      "Subsidies for bee colonies, equipment, processing units, and capacity building.",
    eligibility: ["Farmers, FPOs, SHGs, cooperatives"],
    applicationProcess: "Apply via National Bee Board or state horticulture department.",
    requiredDocuments: ["Aadhaar", "Project proposal"],
    officialUrl: "https://nbb.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["small", "marginal", "women", "all"],
  },
  {
    slug: "msp-procurement",
    name: "Minimum Support Price Procurement",
    shortName: "MSP",
    type: "marketing",
    description:
      "Government procurement of notified crops at MSP through FCI, NAFED, CCI and state agencies during procurement seasons.",
    benefits:
      "Assured floor price for paddy, wheat, pulses, oilseeds, cotton, jute and sugarcane (FRP).",
    eligibility: ["Farmers selling notified crops at registered procurement centres"],
    applicationProcess:
      "Register on state procurement portal (e.g., Punjab anaaj kharid, Telangana, etc.) and bring produce to procurement centre.",
    requiredDocuments: ["Aadhaar", "Land record", "Bank account"],
    officialUrl: "https://fci.gov.in",
    ministry: "Ministry of Consumer Affairs / Ministry of Agriculture & Farmers Welfare",
    targetFarmers: ["all"],
  },
  {
    slug: "saubhagya",
    name: "Pradhan Mantri Sahaj Bijli Har Ghar Yojana",
    shortName: "Saubhagya",
    type: "subsidy",
    description:
      "Provides last-mile electricity connections to all un-electrified households, including agricultural homesteads.",
    benefits: "Free electricity connection for BPL households; affordable for others.",
    eligibility: ["Households without an existing connection"],
    applicationProcess: "Apply via state distribution company or saubhagya.gov.in.",
    requiredDocuments: ["Aadhaar", "Address proof"],
    officialUrl: "https://powermin.gov.in/en/content/saubhagya",
    ministry: "Ministry of Power",
    targetFarmers: ["all"],
  },
  {
    slug: "pm-kusum",
    name: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan",
    shortName: "PM-KUSUM",
    type: "subsidy",
    description:
      "Solarisation of agriculture pumps and decentralised solar power for farmers — solar pumps, grid-connected solar plants on barren land, and solarisation of grid-connected pumps.",
    benefits:
      "Up to 60% central + state subsidy on standalone solar pumps; lease income for solar plants on farmland.",
    eligibility: [
      "Individual farmers, FPOs, panchayats, water user associations",
    ],
    applicationProcess: "Apply via state nodal agency / discom under PM-KUSUM.",
    requiredDocuments: ["Aadhaar", "Land record", "Electricity bill"],
    officialUrl: "https://pmkusum.mnre.gov.in",
    ministry: "Ministry of New & Renewable Energy",
    targetFarmers: ["small", "marginal", "all"],
  },
  {
    slug: "operation-greens",
    name: "Operation Greens",
    shortName: "TOP — Tomato Onion Potato",
    type: "marketing",
    description:
      "Stabilises supply and prices of tomato, onion and potato (and other notified perishables) through cluster-based value chain investment and transport/storage subsidy.",
    benefits:
      "50% transportation subsidy from production cluster to consumption centres, plus storage support.",
    eligibility: ["FPOs, food processors, marketing cooperatives, exporters dealing in TOP crops"],
    applicationProcess: "Apply via mofpi.nic.in.",
    requiredDocuments: ["Project DPR", "Bank account"],
    officialUrl: "https://www.mofpi.gov.in",
    ministry: "Ministry of Food Processing Industries",
    targetFarmers: ["all"],
  },
  {
    slug: "kisan-rail",
    name: "Kisan Rail",
    shortName: "Kisan Rail",
    type: "marketing",
    description:
      "Special trains operated by Indian Railways with multi-commodity, multi-stop service for transporting perishable agricultural produce across the country.",
    benefits:
      "50% subsidy on freight for fruits and vegetables under Operation Greens; faster, cooler transit.",
    eligibility: ["Farmers, FPOs, traders dispatching perishables"],
    applicationProcess: "Book parcel via Indian Railways FOIS / nearest goods office.",
    requiredDocuments: ["Aadhaar", "Consignment details"],
    officialUrl: "https://indianrailways.gov.in",
    ministry: "Ministry of Railways",
    targetFarmers: ["all"],
  },
  {
    slug: "nlm",
    name: "National Livestock Mission",
    shortName: "NLM",
    type: "subsidy",
    description:
      "Supports entrepreneurship development in poultry, sheep, goat, piggery and fodder, with capital subsidy.",
    benefits:
      "50% capital subsidy up to ₹50 lakh for individual entrepreneurs and ₹2 crore for cooperatives.",
    eligibility: ["Individual farmers, SHGs, FPOs, JLGs, cooperatives"],
    applicationProcess: "Apply at nlm.udyamimitra.in.",
    requiredDocuments: ["Aadhaar", "Project DPR", "Bank statement"],
    officialUrl: "https://nlm.udyamimitra.in",
    ministry: "Ministry of Fisheries, Animal Husbandry & Dairying",
    targetFarmers: ["small", "marginal", "women", "all"],
  },
  {
    slug: "pmmsy",
    name: "Pradhan Mantri Matsya Sampada Yojana",
    shortName: "PMMSY",
    type: "subsidy",
    description:
      "Flagship scheme for sustainable and responsible development of fisheries — aquaculture ponds, cold chain, marketing, and skilling.",
    benefits:
      "40% subsidy for general / 60% for SC, ST and women on a wide list of fisheries activities.",
    eligibility: ["Fish farmers, fishers, FPOs, fish workers, SHGs, entrepreneurs"],
    applicationProcess: "Apply at pmmsy.dof.gov.in or state fisheries department.",
    requiredDocuments: ["Aadhaar", "Land/water lease", "Project DPR"],
    officialUrl: "https://pmmsy.dof.gov.in",
    ministry: "Ministry of Fisheries, Animal Husbandry & Dairying",
    targetFarmers: ["small", "marginal", "women", "sc_st", "all"],
  },
];

async function main() {
  const reset = process.argv.includes("--reset");
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }
  ensureDnsResolves();
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  if (reset) {
    await GovtScheme.deleteMany({});
    console.log("🗑  Cleared govt_schemes");
  }

  let count = 0;
  for (const s of SCHEMES) {
    const result = await GovtScheme.updateOne(
      { slug: s.slug },
      {
        $set: {
          ...s,
          status: "active",
          applicableStates: s.applicableStates ?? [],
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount) count += 1;
  }

  console.log(`✅ Seeded ${count} schemes (out of ${SCHEMES.length})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
