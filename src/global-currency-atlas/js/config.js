export const RAW_COUNTRIES = `
AFG:AF:AFN AGO:AO:AOA ALB:AL:ALL ARE:AE:AED ARG:AR:ARS ARM:AM:AMD AUS:AU:AUD AUT:AT:EUR AZE:AZ:AZN
BDI:BI:BIF BEL:BE:EUR BEN:BJ:XOF BFA:BF:XOF BGD:BD:BDT BGR:BG:EUR BHS:BS:BSD BIH:BA:BAM BLR:BY:BYN
BLZ:BZ:BZD BOL:BO:BOB BRA:BR:BRL BRN:BN:BND BTN:BT:BTN BWA:BW:BWP CAF:CF:XAF CAN:CA:CAD CHE:CH:CHF
CHL:CL:CLP CHN:CN:CNY CIV:CI:XOF CMR:CM:XAF COD:CD:CDF COG:CG:XAF COL:CO:COP CRI:CR:CRC CUB:CU:CUP
CYP:CY:EUR CZE:CZ:CZK DEU:DE:EUR DJI:DJ:DJF DNK:DK:DKK DOM:DO:DOP DZA:DZ:DZD ECU:EC:USD EGY:EG:EGP
ERI:ER:ERN ESH:EH:MAD ESP:ES:EUR EST:EE:EUR ETH:ET:ETB FIN:FI:EUR FJI:FJ:FJD FLK:FK:FKP FRA:FR:EUR
GAB:GA:XAF GBR:GB:GBP GEO:GE:GEL GHA:GH:GHS GIN:GN:GNF GMB:GM:GMD GNB:GW:XOF GNQ:GQ:XAF GRC:GR:EUR
GRL:GL:DKK GTM:GT:GTQ GUF:GF:EUR GUY:GY:GYD HKG:HK:HKD HND:HN:HNL HRV:HR:EUR HTI:HT:HTG HUN:HU:HUF IDN:ID:IDR
IND:IN:INR IRL:IE:EUR IRN:IR:IRR IRQ:IQ:IQD ISL:IS:ISK ISR:IL:ILS ITA:IT:EUR JAM:JM:JMD JOR:JO:JOD
JPN:JP:JPY KAZ:KZ:KZT KEN:KE:KES KGZ:KG:KGS KHM:KH:KHR KOR:KR:KRW KWT:KW:KWD LAO:LA:LAK LBN:LB:LBP
LBR:LR:LRD LBY:LY:LYD LKA:LK:LKR LSO:LS:LSL LTU:LT:EUR LUX:LU:EUR LVA:LV:EUR MAR:MA:MAD MDA:MD:MDL
MDG:MG:MGA MEX:MX:MXN MKD:MK:MKD MLI:ML:XOF MLT:MT:EUR MMR:MM:MMK MNE:ME:EUR MNG:MN:MNT MOZ:MZ:MZN
MRT:MR:MRU MUS:MU:MUR MDV:MV:MVR MWI:MW:MWK MYS:MY:MYR NAM:NA:NAD NCL:NC:XPF NER:NE:XOF NGA:NG:NGN
NIC:NI:NIO NLD:NL:EUR NOR:NO:NOK NPL:NP:NPR NZL:NZ:NZD OMN:OM:OMR PAK:PK:PKR PAN:PA:PAB PER:PE:PEN
PHL:PH:PHP PNG:PG:PGK POL:PL:PLN PRI:PR:USD PRK:KP:KPW PRT:PT:EUR PRY:PY:PYG PSE:PS:ILS QAT:QA:QAR
ROU:RO:RON RUS:RU:RUB RWA:RW:RWF SAU:SA:SAR SDN:SD:SDG SEN:SN:XOF SGP:SG:SGD SLB:SB:SBD SLE:SL:SLE
SLV:SV:USD SOM:SO:SOS SRB:RS:RSD SSD:SS:SSP SUR:SR:SRD SVK:SK:EUR SVN:SI:EUR SWE:SE:SEK SWZ:SZ:SZL
SYR:SY:SYP TCD:TD:XAF TGO:TG:XOF THA:TH:THB TJK:TJ:TJS TKM:TM:TMT TLS:TL:USD TTO:TT:TTD TUN:TN:TND
TUR:TR:TRY TWN:TW:TWD TZA:TZ:TZS UGA:UG:UGX UKR:UA:UAH URY:UY:UYU USA:US:USD UZB:UZ:UZS VEN:VE:VES
VNM:VN:VND VUT:VU:VUV YEM:YE:YER ZAF:ZA:ZAR ZMB:ZM:ZMW ZWE:ZW:ZWG BHR:BH:BHD
`;

export const GEO_URL = 'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json';

export const MAP_DIMENSIONS = { W: 1000, H: 500 };

export const ALT_CURRENCIES = {
  SLE: 'SLL',
  MRU: 'MRO',
  ZWG: 'ZWL',
  STN: 'STD',
  VES: 'VEF'
};

export const COLOR_STOPS = ['#22c55e', '#a3e635', '#facc15', '#fb923c', '#ef4444'];

export const COMMODITIES = [
  { id: 'fuel', name: 'Retail Gasoline (Petrol)', symbol: 'GAS', icon: '⛽', category: 'energy', unit: 'Liter', desc: 'Local Retail Pump Gasoline (Subsidized vs Taxed)' },
  { id: 'xau', name: 'Gold Bullion (24K Pure)', symbol: 'XAU', icon: '🏅', category: 'metal', unit: 'troy oz', unitGrams: 31.1034768, desc: 'Pure 99.9% Investment Gold Standard' },
  { id: 'xag', name: 'Silver Bullion', symbol: 'XAG', icon: '🥈', category: 'metal', unit: 'troy oz', unitGrams: 31.1034768, desc: 'Fine Silver Bullion (99.9%)' },
  { id: 'xpt', name: 'Platinum Bullion', symbol: 'XPT', icon: '🪙', category: 'metal', unit: 'troy oz', unitGrams: 31.1034768, desc: 'Noble Catalyst & Industrial Precious Metal' },
  { id: 'xpd', name: 'Palladium', symbol: 'XPD', icon: '⚙️', category: 'metal', unit: 'troy oz', unitGrams: 31.1034768, desc: 'Rare Automotive & Industrial Noble Metal' }
];

// Real-world retail gasoline (petrol) benchmark in USD per liter across world markets
// Captures authentic global price divergence: state subsidies (e.g. VEN, IRN, LBY, DZA, EGY, SAU)
// vs market/taxation (USA, CAN, JPN, AUS, IND, BRA) vs extreme fuel duty (NOR, NLD, DNK, CHE, HKG)
export const FUEL_PRICES_USD = {
  // Ultra-subsidized producer economies (< $0.40/L)
  VEN: 0.035, IRN: 0.029, LBY: 0.031, DZA: 0.34, EGY: 0.32, KWT: 0.34, AGO: 0.36, NGA: 0.65,
  KAZ: 0.53, RUS: 0.62, SAU: 0.62, BHR: 0.53, QAT: 0.58, OMN: 0.62, ARE: 0.82, MYS: 0.45,
  // Moderate / Market subsidized ($0.70 - $1.25/L)
  ECU: 0.65, BOL: 0.54, COL: 0.98, USA: 0.94, CAN: 1.18, MEX: 1.28, ARG: 1.05, BRA: 1.08,
  CHL: 1.35, PER: 1.25, IDN: 0.88, VNM: 0.89, THA: 1.08, PHL: 1.12, CHN: 1.15, IND: 1.22,
  PAK: 0.98, BGD: 1.06, LKA: 1.12, ZAF: 1.24, AUS: 1.22, NZL: 1.62, JPN: 1.18, KOR: 1.25,
  TUR: 1.26, GEO: 1.15, ARM: 1.20, AZE: 0.60, UZB: 0.95, IRQ: 0.57, SYR: 0.90, LBN: 1.10,
  JOR: 1.60, ISR: 1.95, UKR: 1.32, POL: 1.62, CZE: 1.65, HUN: 1.68, ROU: 1.58, BGR: 1.48,
  // Heavy fuel taxation & European economies ($1.70 - $2.40/L)
  GBR: 1.78, DEU: 1.88, FRA: 1.85, ITA: 1.92, ESP: 1.68, PRT: 1.82, NLD: 2.15, BEL: 1.82,
  AUT: 1.72, CHE: 1.98, SWE: 1.76, NOR: 2.05, DNK: 2.02, FIN: 1.90, IRL: 1.84, GRC: 1.98,
  HKG: 3.12, SGP: 2.10, ISL: 2.25
};

export const GLOBAL_MEDIAN_FUEL_USD = 1.25;

export const MIN_DATE = new Date('2024-03-02T00:00:00Z');
