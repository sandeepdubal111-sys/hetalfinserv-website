// Site content — real data from Hetal Finserv Pvt Ltd (Pune)

export const SITE = {
  brand: "Hetal Finserv",
  legal: "Hetal Finserv Pvt. Ltd.",
  logo: "https://customer-assets-7cd3h4nn.emergentagent.net/job_hetal-trust/artifacts/22yu1f2i_HFPL_Profile_Picture.png",
  tagline: "It's Not Just a Strategy. It's Personal.",
  subTagline:
    "One-stop financial partner for Mutual Funds, PMS, Insurance, Loans and Real Estate.",
  phone: "+91 87670 95307",
  phoneAlt: "+91 94230 16559",
  phoneClean: "+918767095307",
  whatsapp: "+918767095307",
  email: "info@hetalfinserv.com",
  address: "Wadgaon Sheri, Pune — 411 014, Maharashtra, India",
  hours: "Mon – Sat · 10:00 – 19:00 IST",
  founded: 2001,
  incorporated: "03-Oct-2022",
  socials: {
    facebook: "https://www.facebook.com/hetalfinservpvtltd",
    instagram: "https://www.instagram.com/hetalfinservpvtltd/",
    linkedin: "https://in.linkedin.com/in/sandeep-dubal-44a29547",
  },
};

// Regulatory registrations — critical trust signals
export const REGISTRATIONS = [
  {
    label: "AMFI Registered MFD",
    detail: "ARN-254254 · Valid till 02-Oct-2028",
    tag: "AMFI",
  },
  {
    label: "MahaRERA Broker",
    detail: "A52100043460 · Maharashtra",
    tag: "MAHARERA",
  },
  {
    label: "IRDAI Certified BQP",
    detail: "Insurance Broker Reg. 00115138383",
    tag: "IRDAI",
  },
  {
    label: "PMS Distributor",
    detail: "APRN No. APRN00234",
    tag: "PMS",
  },
  {
    label: "Govt Registered Pvt Ltd",
    detail: "CIN U67100PN2022PTC212632",
    tag: "MCA",
  },
];

export const REG_AUTHORITIES = ["AMFI", "NISM", "MahaRERA", "SEBI", "IRDA"];

// Regulator authorities — used in the Regulators grid + Verify Us modal
// Brand color per authority for the elegant text-token fallback.
export const REGULATORS = [
  {
    key: "amfi",
    name: "AMFI",
    full: "Association of Mutual Funds in India",
    domain: "amfiindia.com",
    brandColor: "#0F4C81",
    verifyUrl:
      "https://www.amfiindia.com/locator/search-by-arn?arncode=254254",
    regNo: "ARN-254254",
  },
  {
    key: "sebi",
    name: "SEBI",
    full: "Securities & Exchange Board of India",
    domain: "sebi.gov.in",
    brandColor: "#00437A",
    verifyUrl: "https://www.sebi.gov.in/",
    regNo: "SEBI-regulated distributor",
  },
  {
    key: "irdai",
    name: "IRDAI",
    full: "Insurance Regulatory & Development Authority of India",
    domain: "irdai.gov.in",
    brandColor: "#B8232F",
    verifyUrl:
      "https://www.irdai.gov.in/con_intermediaries/List-of-Insurance-Brokers.aspx",
    regNo: "Broker Reg. 00115138383 · Certified BQP",
  },
  {
    key: "maharera",
    name: "MahaRERA",
    full: "Maharashtra Real Estate Regulatory Authority",
    domain: "maharera.maharashtra.gov.in",
    brandColor: "#8A5A00",
    logoOverride:
      "https://customer-assets-7cd3h4nn.emergentagent.net/job_hetal-trust/artifacts/vlzmrv4i_images.png",
    verifyUrl:
      "https://maharera.maharashtra.gov.in/en/agents-search-result",
    regNo: "A52100043460",
  },
  {
    key: "nism",
    name: "NISM",
    full: "National Institute of Securities Markets",
    domain: "nism.ac.in",
    brandColor: "#0E7C4A",
    verifyUrl: "https://www.nism.ac.in/",
    regNo: "Certified Financial Goal Planner",
  },
];

export const NAV = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Calculators", to: "/calculators" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const SERVICES = [
  {
    id: "financial-planning",
    number: "01",
    title: "Financial Planning",
    tagline: "Personalised, goal-based strategies for every life stage.",
    bullets: [
      "Certified Financial Goal Planner (CFGP — NISM & PGP Academy)",
      "Retirement corpus modelling",
      "Child's education & marriage planning",
      "Will & estate planning",
    ],
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "wealth-investments",
    number: "02",
    title: "Wealth & Investments",
    tagline: "Mutual Funds, SIP, PMS, AIFs, NPS, Bonds & Sovereign Gold Bonds.",
    bullets: [
      "Mutual Funds (SIP / Lumpsum) — 25+ AMC partners",
      "PMS Distributor (APRN No. APRN00234)",
      "AIFs, NPS & Retirement Solutions",
      "Fixed Deposits, NCDs, RBI Floating Bonds, SGB",
    ],
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "insurance",
    number: "03",
    title: "Insurance Services",
    tagline: "IRDAI Certified BQP — Life, Health, Motor, Home, Travel & Commercial.",
    bullets: [
      "Life & term insurance",
      "Health & critical illness cover",
      "Motor, home, travel policies",
      "Group, Marine/Cargo, Fire, Commercial",
    ],
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "loans",
    number: "04",
    title: "Loan Services",
    tagline: "Home, Personal, Business, Education & Gold Loans via 25+ banks & NBFCs.",
    bullets: [
      "Home loans & balance transfer",
      "Business & working capital loans",
      "Loan against property / securities",
      "Personal, education, vehicle & gold loans",
    ],
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "real-estate",
    number: "05",
    title: "Real Estate",
    tagline: "MahaRERA Registered Broker — residential, commercial & luxury properties.",
    bullets: [
      "Residential & luxury properties",
      "Commercial, industrial & land",
      "New launch, resale & affordable housing",
      "Legal, documentation & NRI services",
    ],
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "channel-partner",
    number: "06",
    title: "Channel Partner",
    tagline: "Zero investment. Full support. Attractive commissions on referrals.",
    bullets: [
      "Product training & marketing materials",
      "Real-time digital portal to track referrals",
      "Transparent commission structure",
      "Backed by 5 regulatory registrations",
    ],
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  },
];

export const MANIFESTO = [
  {
    number: "01",
    kicker: "The Standard",
    title: "No two clients should have the same strategy.",
    body: "Complete objectivity. Unbiased, personalised advice. Founded by Sandeep Dubal — Certified Financial Goal Planner with 20+ years of experience — Hetal Finserv serves individuals, families and businesses with the highest standards of integrity and expertise across Pune and across India.",
  },
  {
    number: "02",
    kicker: "The Structure",
    title: "One firm. Five regulatory registrations.",
    body: "AMFI (ARN-254254). MahaRERA (A52100043460). IRDAI Certified BQP. PMS Distributor (APRN00234). Government-registered Pvt Ltd. Every conversation, every recommendation, and every rupee moved is backed by the correct license — and full disclosure of every commission we earn.",
  },
  {
    number: "03",
    kicker: "The Relationship",
    title: "Personally invested in your success.",
    body: "Unlike large corporate firms, at Hetal Finserv you get direct access to our founders — Sandeep and Tanuja Dubal — certified, experienced and personally involved with every client relationship. Your goals. Your strategy. Personally crafted.",
  },
];

export const STATS = [
  { value: "20+", label: "Years of experience" },
  { value: "5+", label: "Service verticals" },
  { value: "5", label: "Regulatory registrations" },
  { value: "4.9", label: "Client rating · 200+ reviews" },
];

// AMC partners — with brand domain for logo lookup via public logo service (Clearbit)
export const AMCS = [
  { name: "SBI Mutual Fund", domain: "sbimf.com" },
  { name: "HDFC Mutual Fund", domain: "hdfcfund.com" },
  { name: "ICICI Prudential MF", domain: "icicipruamc.com" },
  { name: "Axis Mutual Fund", domain: "axismf.com" },
  { name: "Mirae Asset MF", domain: "miraeassetmf.co.in" },
  { name: "Nippon India MF", domain: "nipponindiaim.com" },
  { name: "Kotak Mahindra MF", domain: "kotakmf.com" },
  { name: "DSP Mutual Fund", domain: "dspim.com" },
  { name: "Franklin Templeton", domain: "franklintempletonindia.com" },
  { name: "Tata Mutual Fund", domain: "tatamutualfund.com" },
  { name: "Motilal Oswal MF", domain: "motilaloswalmf.com" },
  { name: "PGIM India MF", domain: "pgimindiamf.com" },
  { name: "Aditya Birla Sun Life MF", domain: "adityabirlacapital.com" },
  { name: "Edelweiss MF", domain: "edelweissmf.com" },
  { name: "WhiteOak Capital MF", domain: "whiteoakamc.com" },
  { name: "Canara Robeco MF", domain: "canararobeco.com" },
  { name: "UTI Mutual Fund", domain: "utimf.com" },
  { name: "Bandhan MF", domain: "bandhanmutual.com" },
  { name: "Quant Mutual Fund", domain: "quantmutual.com" },
  { name: "Invesco India MF", domain: "invescomutualfund.com" },
  { name: "Navi MF", domain: "navimutualfund.com" },
  { name: "360 ONE MF", domain: "360.one" },
  { name: "Helios MF", domain: "helioscapital.in" },
  { name: "Groww MF", domain: "groww.in" },
  { name: "ITI Mutual Fund", domain: "itimf.com" },
];

export const LEADERSHIP = [
  {
    id: "sandeep-dubal",
    name: "Sandeep Dubal",
    role: "Founder & Director",
    years: "20+ years in financial services",
    linkedin: "https://in.linkedin.com/in/sandeep-dubal-44a29547",
    portrait:
      "https://customer-assets-7cd3h4nn.emergentagent.net/job_hetal-trust/artifacts/gbpfg0jc_5.png",
    bio: "Sandeep founded Hetal Finserv on a single conviction — that no two clients should have the same strategy. A Certified Financial Goal Planner with two decades of experience across mutual funds, PMS, insurance, loans and real estate, he is personally involved with every client relationship — from first conversation to every quarterly review that follows.",
    certifications: [
      "Certified Financial Goal Planner — CFGP (NISM & PGP Academy)",
      "Investment Foundations® Certificate — CFA Institute",
      "Award in International Wealth Management — Moody's Analytics",
      "Practising Goal Planner (Advanced) — HSBC & PGP Academy",
      "Professional Certificate in Global Wealth Management — The Wealth Company",
      "MahaRERA Real Estate Consultant",
      "IRDAI Certified BQP · Insurance Broker",
      "AMFI Registered Mutual Fund Distributor (ARN-254254)",
    ],
    achievements: [
      { year: "20+ yrs", title: "Financial services experience across India" },
      { year: "5 licenses", title: "AMFI · MahaRERA · IRDAI · PMS · Insurance Broker" },
      { year: "200+", title: "Verified client reviews · 4.9★ average rating" },
      { year: "48+", title: "Financial products & services under one roof" },
    ],
  },
  {
    id: "tanuja-dubal",
    name: "Tanuja Dubal",
    role: "Co-Founder & Director",
    years: "Strategic leadership & client relations",
    portrait:
      "https://customer-assets-7cd3h4nn.emergentagent.net/job_hetal-trust/artifacts/5ltox82p_2.png",
    bio: "Tanuja anchors the client experience at Hetal Finserv — from the first conversation through every review cycle that follows. She leads strategic direction, client relationship management and operations, ensuring every family, every business and every referral is served with quiet consistency and personal care.",
    certifications: [
      "Strategic Leadership · Board Member — Hetal Finserv Pvt Ltd",
      "Client Relationship Management",
      "Operations & Compliance Oversight",
      "AMFI Registered Mutual Fund Distributor",
      "IRDAI Certified Insurance Consultant",
      "Certified in Financial Planning Practice",
    ],
    achievements: [
      { year: "Board", title: "Co-Founder & Director since incorporation (2022)" },
      { year: "Ops", title: "Heads client servicing, operations & compliance" },
      { year: "Care", title: "Personally involved with every family we serve" },
    ],
  },
];

export const FOUNDER = LEADERSHIP[0];

export const TESTIMONIALS = [
  {
    quote:
      "Hetal Finserv transformed how our entire family manages money. SIPs are on autopilot, insurance is sorted and our home loan was approved in record time. Sandeep and Tanuja are personally involved — best financial decision we ever made.",
    author: "Rajesh Kulkarni",
    context: "Pune · IT Professional",
    rating: 5,
    initials: "RK",
  },
  {
    quote:
      "I was overwhelmed by mutual funds until Hetal Finserv simplified everything. Three years later, my daughter's education fund is growing beyond expectations. The founders' personal attention makes all the difference.",
    author: "Priya Mehta",
    context: "Mumbai · Business Owner",
    rating: 5,
    initials: "PM",
  },
  {
    quote:
      "Full commission transparency, zero-pressure advice and a real estate deal that saved me ₹8 lakhs. Hetal Finserv genuinely care about clients — not just products. I recommend them to everyone.",
    author: "Anil Sharma",
    context: "Nashik · Retired Banker",
    rating: 5,
    initials: "AS",
  },
];

export const FAQS = [
  {
    q: "Who are the founders of Hetal Finserv and what are their qualifications?",
    a: "Hetal Finserv was founded by Sandeep Dubal and co-founded by Tanuja Dubal. Sandeep brings 20+ years of rich experience in financial services. He is a Certified Financial Goal Planner (CFGP — NISM & PGP Academy), holds the Investment Foundations® Certificate (CFA Institute), an Award in International Wealth Management (Moody's Analytics), Practising Goal Planner — Advanced Level (HSBC & PGP Academy), and a Professional Certificate in Global Wealth Management (The Wealth Company). He is also a MahaRERA Real Estate Consultant and IRDAI Certified BQP.",
  },
  {
    q: "Is Hetal Finserv AMFI registered?",
    a: "Yes. AMFI-Registered Mutual Fund Distributor with ARN-254254, registered since 03-Oct-2022 and valid till 02-Oct-2028. We deal in Regular Plans only and fully disclose all trailing commissions at every investment.",
  },
  {
    q: "What is the minimum SIP amount?",
    a: "You can start a SIP with as little as ₹500 per month. Free consultation is available to all investors regardless of investment size.",
  },
  {
    q: "What is Hetal Finserv's PMS Distributor registration?",
    a: "We are a registered PMS Distributor with APRN No. APRN00234, offering Portfolio Management Services to HNI investors through leading PMS providers in India.",
  },
  {
    q: "Is Hetal Finserv RERA registered?",
    a: "Yes. MahaRERA Registered Real Estate Broker (Reg. A52100043460) offering residential, commercial, industrial and luxury property services across Maharashtra.",
  },
  {
    q: "What makes Hetal Finserv different from other advisors?",
    a: "We are a truly one-stop shop with 5 separate regulatory certifications — AMFI, MahaRERA, IRDAI, PMS (APRN00234) and Insurance Broker. Our founders are personally involved with every client, ensuring personalised advice with complete transparency and 20+ years of experience.",
  },
  {
    q: "How do I become a Channel Partner?",
    a: "Contact us — zero investment required. We provide full product training, branded marketing materials and a real-time digital portal to track your referrals and commissions.",
  },
  {
    q: "Where is Hetal Finserv located?",
    a: "Wadgaon Sheri, Pune — 411 014, Maharashtra. Call +91 87670 95307 or email info@hetalfinserv.com. Consultations are also available on video for clients across India.",
  },
];
