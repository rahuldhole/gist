/**
 * CurrencyExchangeSDK - Global FX & World Country/Currency Directory SDK
 * Provides live exchange rates, cross-currency conversion, caching, and metadata
 * for 220+ countries/territories and 150+ currencies via open FX APIs + Intl.
 * Primary providers: open.er-api.com, Fawazahmed0 Currency API CDN
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CurrencyExchangeSDK = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Compact global directory: ISO3:ISO2:CURRENCY
    const RAW_COUNTRIES = `
AFG:AF:AFN AGO:AO:AOA ALB:AL:ALL AND:AD:EUR ARE:AE:AED ARG:AR:ARS ARM:AM:AMD ASM:AS:USD ATG:AG:XCD AUS:AU:AUD AUT:AT:EUR AZE:AZ:AZN
BDI:BI:BIF BEL:BE:EUR BEN:BJ:XOF BFA:BF:XOF BGD:BD:BDT BGR:BG:EUR BHR:BH:BHD BHS:BS:BSD BIH:BA:BAM BLR:BY:BYN BLZ:BZ:BZD BMU:BM:BMD
BOL:BO:BOB BRA:BR:BRL BRB:BB:BBD BRN:BN:BND BTN:BT:BTN BWA:BW:BWP CAF:CF:XAF CAN:CA:CAD CHE:CH:CHF CHL:CL:CLP CHN:CN:CNY CIV:CI:XOF
CMR:CM:XAF COD:CD:CDF COG:CG:XAF COL:CO:COP COM:KM:KMF CPV:CV:CVE CRI:CR:CRC CUB:CU:CUP CUW:CW:XCG CYM:KY:KYD CYP:CY:EUR CZE:CZ:CZK
DEU:DE:EUR DJI:DJ:DJF DMA:DM:XCD DNK:DK:DKK DOM:DO:DOP DZA:DZ:DZD ECU:EC:USD EGY:EG:EGP ERI:ER:ERN ESH:EH:MAD ESP:ES:EUR EST:EE:EUR
ETH:ET:ETB FIN:FI:EUR FJI:FJ:FJD FLK:FK:FKP FRA:FR:EUR FRO:FO:DKK FSM:FM:USD GAB:GA:XAF GBR:GB:GBP GEO:GE:GEL GGY:GG:GBP GHA:GH:GHS
GIB:GI:GIP GIN:GN:GNF GMB:GM:GMD GNB:GW:XOF GNQ:GQ:XAF GRC:GR:EUR GRD:GD:XCD GRL:GL:DKK GTM:GT:GTQ GUF:GF:EUR GUM:GU:USD GUY:GY:GYD
HKG:HK:HKD HND:HN:HNL HRV:HR:EUR HTI:HT:HTG HUN:HU:HUF IDN:ID:IDR IMN:IM:GBP IND:IN:INR IRL:IE:EUR IRN:IR:IRR IRQ:IQ:IQD ISL:IS:ISK
ISR:IL:ILS ITA:IT:EUR JAM:JM:JMD JEY:JE:GBP JOR:JO:JOD JPN:JP:JPY KAZ:KZ:KZT KEN:KE:KES KGZ:KG:KGS KHM:KH:KHR KIR:KI:AUD KNA:KN:XCD
KOR:KR:KRW KWT:KW:KWD LAO:LA:LAK LBN:LB:LBP LBR:LR:LRD LBY:LY:LYD LCA:LC:XCD LIE:LI:CHF LKA:LK:LKR LSO:LS:LSL LTU:LT:EUR LUX:LU:EUR
LVA:LV:EUR MAC:MO:MOP MAF:MF:EUR MAR:MA:MAD MCO:MC:EUR MDA:MD:MDL MDG:MG:MGA MDV:MV:MVR MEX:MX:MXN MHL:MH:USD MKD:MK:MKD MLI:ML:XOF
MLT:MT:EUR MMR:MM:MMK MNE:ME:EUR MNG:MN:MNT MNP:MP:USD MOZ:MZ:MZN MRT:MR:MRU MUS:MU:MUR MWI:MW:MWK MYS:MY:MYR NAM:NA:NAD NCL:NC:XPF
NER:NE:XOF NGA:NG:NGN NIC:NI:NIO NLD:NL:EUR NOR:NO:NOK NPL:NP:NPR NRU:NR:AUD NZL:NZ:NZD OMN:OM:OMR PAK:PK:PKR PAN:PA:PAB PER:PE:PEN
PHL:PH:PHP PLW:PW:USD PNG:PG:PGK POL:PL:PLN PRI:PR:USD PRK:KP:KPW PRT:PT:EUR PRY:PY:PYG PSE:PS:ILS PYF:PF:XPF QAT:QA:QAR ROU:RO:RON
RUS:RU:RUB RWA:RW:RWF SAU:SA:SAR SDN:SD:SDG SEN:SN:XOF SGP:SG:SGD SHN:SH:SHP SLB:SB:SBD SLE:SL:SLE SLV:SV:USD SMR:SM:EUR SOM:SO:SOS
SRB:RS:RSD SSD:SS:SSP STP:ST:STN SUR:SR:SRD SVK:SK:EUR SVN:SI:EUR SWE:SE:SEK SWZ:SZ:SZL SXM:SX:XCG SYC:SC:SCR SYR:SY:SYP TCA:TC:USD
TCD:TD:XAF TGO:TG:XOF THA:TH:THB TJK:TJ:TJS TKM:TM:TMT TLS:TL:USD TON:TO:TOP TTO:TT:TTD TUN:TN:TND TUR:TR:TRY TUV:TV:AUD TWN:TW:TWD
TZA:TZ:TZS UGA:UG:UGX UKR:UA:UAH URY:UY:UYU USA:US:USD UZB:UZ:UZS VAT:VA:EUR VCT:VC:XCD VEN:VE:VES VGB:VG:USD VIR:VI:USD VNM:VN:VND
VUT:VU:VUV WSM:WS:WST XKX:XK:EUR YEM:YE:YER ZAF:ZA:ZAR ZMB:ZM:ZMW ZWE:ZW:ZWG ABW:AW:AWG
`.trim();

    const POPULAR_CURRENCY_ORDER = [
        'USD', 'EUR', 'GBP', 'CNY', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'SGD',
        'HKD', 'AED', 'THB', 'MYR', 'VND', 'IDR', 'PHP', 'KRW', 'TWD', 'MXN',
        'BRL', 'ZAR', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'TRY', 'SAR', 'ILS'
    ];

    const POPULAR_COUNTRY_ORDER = [
        'USA', 'EMU', 'GBR', 'CHN', 'IND', 'JPN', 'CAN', 'AUS', 'CHE', 'SGP',
        'HKG', 'ARE', 'THA', 'PRT', 'ESP', 'DEU', 'FRA', 'ITA', 'GRC', 'MYS',
        'VNM', 'IDN', 'PHL', 'KOR', 'TWN', 'MEX', 'CRI', 'PAN', 'BRA', 'ARG',
        'TUR', 'NZL', 'NOR', 'SWE', 'DNK', 'POL', 'SAU', 'ZAF', 'ISR', 'GEO'
    ];

    const PRIMARY_COUNTRY_BY_CURRENCY = {
        USD: { countryCode: 'USA', iso2: 'US', region: 'United States' },
        EUR: { countryCode: 'EMU', iso2: 'EU', region: 'Eurozone' },
        GBP: { countryCode: 'GBR', iso2: 'GB', region: 'United Kingdom' },
        CNY: { countryCode: 'CHN', iso2: 'CN', region: 'China' },
        INR: { countryCode: 'IND', iso2: 'IN', region: 'India' },
        JPY: { countryCode: 'JPN', iso2: 'JP', region: 'Japan' },
        CAD: { countryCode: 'CAN', iso2: 'CA', region: 'Canada' },
        AUD: { countryCode: 'AUS', iso2: 'AU', region: 'Australia' },
        CHF: { countryCode: 'CHE', iso2: 'CH', region: 'Switzerland' },
        SGD: { countryCode: 'SGP', iso2: 'SG', region: 'Singapore' },
        AED: { countryCode: 'ARE', iso2: 'AE', region: 'UAE' },
        DKK: { countryCode: 'DNK', iso2: 'DK', region: 'Denmark' },
        MAD: { countryCode: 'MAR', iso2: 'MA', region: 'Morocco' },
        ILS: { countryCode: 'ISR', iso2: 'IL', region: 'Israel' },
        XOF: { countryCode: 'CIV', iso2: 'CI', region: 'West Africa (CFA)' },
        XAF: { countryCode: 'CMR', iso2: 'CM', region: 'Central Africa (CFA)' },
        XCD: { countryCode: 'LCA', iso2: 'LC', region: 'Eastern Caribbean' },
        XPF: { countryCode: 'PYF', iso2: 'PF', region: 'French Polynesia (CFP)' },
        XCG: { countryCode: 'CUW', iso2: 'CW', region: 'Curaçao & Sint Maarten' }
    };

    // Unambiguous compact symbols matching international usage
    const SYMBOL_OVERRIDES = {
        USD: '$', EUR: '€', GBP: '£', CNY: '¥', JPY: '¥', INR: '₹',
        CAD: 'CA$', AUD: 'A$', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$', TWD: 'NT$',
        MXN: 'MX$', BRL: 'R$', XCD: 'EC$', CHF: 'CHF', AED: 'AED', SAR: 'SAR',
        MYR: 'RM', IDR: 'Rp', THB: '฿', VND: '₫', PHP: '₱', KRW: '₩',
        TRY: '₺', ILS: '₪', PLN: 'zł', RUB: '₽', ZAR: 'R', NGN: '₦',
        UAH: '₴', KZT: '₸', ARS: 'AR$', CLP: 'CL$', COP: 'CO$', PEN: 'S/',
        XOF: 'CFA', XAF: 'FCFA', XPF: 'CFP', XCG: 'Cg'
    };

    const MACRO_REGIONS = {
        Americas: new Set([
            'AG', 'AR', 'AW', 'BB', 'BM', 'BO', 'BR', 'BS', 'BZ', 'CA', 'CL', 'CO',
            'CR', 'CU', 'CW', 'DM', 'DO', 'EC', 'FK', 'GD', 'GL', 'GT', 'GY', 'HN',
            'HT', 'JM', 'KN', 'KY', 'LC', 'MF', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY',
            'SR', 'SV', 'SX', 'TC', 'TT', 'US', 'UY', 'VC', 'VE', 'VG', 'VI'
        ]),
        Europe: new Set([
            'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK',
            'EE', 'ES', 'EU', 'FI', 'FO', 'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU',
            'IE', 'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME',
            'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK',
            'SM', 'UA', 'VA', 'XK'
        ]),
        'Asia-Pacific': new Set([
            'AF', 'AM', 'AS', 'AU', 'AZ', 'BD', 'BN', 'BT', 'CN', 'FJ', 'FM', 'GE',
            'GU', 'HK', 'ID', 'IN', 'JP', 'KG', 'KH', 'KI', 'KP', 'KR', 'KZ', 'LA',
            'LK', 'MH', 'MM', 'MN', 'MO', 'MP', 'MV', 'MY', 'NC', 'NP', 'NR', 'NZ',
            'PF', 'PG', 'PH', 'PK', 'PW', 'SB', 'SG', 'TH', 'TJ', 'TL', 'TM', 'TO',
            'TV', 'TW', 'UZ', 'VN', 'VU', 'WS'
        ])
        // Remaining ISO2 codes (Middle East & Africa) resolve to 'Middle East & Africa'
    };

    // Baseline offline exchange rates (relative to 1 USD) covering all 153 world currencies
    const FALLBACK_RATES = {
        aed: 3.6725, afn: 65.8841, all: 82.0634, amd: 360.421, aoa: 932.007, ars: 1592.02,
        aud: 1.50727, awg: 1.79, azn: 1.69867, bam: 1.78462, bbd: 2.0, bdt: 124.682,
        bhd: 0.376, bif: 3008.78, bmd: 1.0, bnd: 1.28992, bob: 11.7609, brl: 5.89442,
        bsd: 1.0, btn: 92.9321, bwp: 14.6572, byn: 2.98931, bzd: 2.0, cad: 1.42912,
        cdf: 2299.59, chf: 0.836724, clp: 1016.25, cny: 6.67818, cop: 3516.05, crc: 446.591,
        cup: 24.0, cve: 100.613, czk: 22.279, djf: 177.721, dkk: 6.82134, dop: 59.6923,
        dzd: 137.242, egp: 54.2259, ern: 15.0, etb: 161.537, eur: 0.91245, fjd: 2.31128,
        fkp: 0.763261, gbp: 0.763269, gel: 2.59361, ghs: 11.8774, gip: 0.763261, gmd: 74.8088,
        gnf: 8852.63, gtq: 7.64044, gyd: 209.129, hkd: 7.84185, hnl: 26.8865, htg: 131.153,
        huf: 337.292, idr: 18227.1, ils: 3.33978, inr: 92.9252, iqd: 1515.17, irr: 1814740,
        isk: 125.187, jmd: 158.428, jod: 0.709, jpy: 159.239, kes: 129.984, kgs: 87.4597,
        khr: 4067.12, kmf: 448.902, kpw: 899.471, krw: 1343.04, kwd: 0.31145, kyd: 0.833333,
        kzt: 460.037, lak: 22294.2, lbp: 89500, lkr: 332.424, lrd: 166.061, lsl: 17.5327,
        lyd: 6.46396, mad: 9.9952, mdl: 18.2898, mga: 4589.24, mkd: 55.8817, mmk: 2098.09,
        mnt: 3624.89, mop: 8.07712, mru: 40.7186, mur: 47.0136, mvr: 15.4276, mwk: 1744.63,
        mxn: 19.3755, myr: 4.1155, mzn: 63.7072, nad: 17.5327, ngn: 1366.83, nio: 36.7257,
        nok: 9.80164, npr: 148.691, nzd: 1.82629, omr: 0.384497, pab: 1.0, pen: 3.47269,
        pgk: 4.52592, php: 63.7697, pkr: 276.392, pln: 4.06987, pyg: 6403.9, qar: 3.64,
        ron: 4.87367, rsd: 107.382, rub: 81.9664, rwf: 1481.83, sar: 3.75, sbd: 8.04679,
        scr: 14.2045, sdg: 449.713, sek: 10.2406, sgd: 1.28993, shp: 0.763261, sle: 22.9294,
        sos: 571.337, srd: 37.5028, ssp: 5753.46, stn: 22.3553, syp: 121.534, szl: 17.5327,
        thb: 33.9401, tjs: 9.223, tmt: 3.49994, tnd: 3.05846, top: 2.41217, try: 50.6692,
        ttd: 6.75594, twd: 32.9182, tzs: 2668.41, uah: 45.326, ugx: 4085.84, usd: 1.0,
        uyu: 40.5324, uzs: 11969.9, ves: 922.564, vnd: 25765.9, vuv: 120.976, wst: 2.79455,
        xaf: 598.536, xcd: 2.7, xcg: 1.79, xof: 598.536, xpf: 108.886, yer: 236.257,
        zar: 17.5327, zmw: 20.7657, zwg: 26.5213
    };

    const TIMEZONE_TO_LOCATION = {
        'Asia/Shanghai': { code: 'CNY', countryCode: 'CHN' },
        'Asia/Chongqing': { code: 'CNY', countryCode: 'CHN' },
        'Asia/Harbin': { code: 'CNY', countryCode: 'CHN' },
        'Asia/Urumqi': { code: 'CNY', countryCode: 'CHN' },
        'Asia/Hong_Kong': { code: 'HKD', countryCode: 'HKG' },
        'Asia/Taipei': { code: 'TWD', countryCode: 'TWN' },
        'Asia/Macau': { code: 'MOP', countryCode: 'MAC' },
        'Asia/Kolkata': { code: 'INR', countryCode: 'IND' },
        'Asia/Calcutta': { code: 'INR', countryCode: 'IND' },
        'Europe/London': { code: 'GBP', countryCode: 'GBR' },
        'Europe/Belfast': { code: 'GBP', countryCode: 'GBR' },
        'GB': { code: 'GBP', countryCode: 'GBR' },
        'GB-Eire': { code: 'GBP', countryCode: 'GBR' },
        'Europe/Zurich': { code: 'CHF', countryCode: 'CHE' },
        'Asia/Tokyo': { code: 'JPY', countryCode: 'JPN' },
        'Japan': { code: 'JPY', countryCode: 'JPN' },
        'Asia/Seoul': { code: 'KRW', countryCode: 'KOR' },
        'Asia/Singapore': { code: 'SGD', countryCode: 'SGP' },
        'Singapore': { code: 'SGD', countryCode: 'SGP' },
        'Asia/Bangkok': { code: 'THB', countryCode: 'THA' },
        'Asia/Ho_Chi_Minh': { code: 'VND', countryCode: 'VNM' },
        'Asia/Saigon': { code: 'VND', countryCode: 'VNM' },
        'Asia/Jakarta': { code: 'IDR', countryCode: 'IDN' },
        'Asia/Kuala_Lumpur': { code: 'MYR', countryCode: 'MYS' },
        'Asia/Manila': { code: 'PHP', countryCode: 'PHL' },
        'Asia/Dubai': { code: 'AED', countryCode: 'ARE' },
        'Asia/Riyadh': { code: 'SAR', countryCode: 'SAU' },
        'Asia/Jerusalem': { code: 'ILS', countryCode: 'ISR' },
        'Europe/Istanbul': { code: 'TRY', countryCode: 'TUR' },
        'Europe/Moscow': { code: 'RUB', countryCode: 'RUS' },
        'Europe/Stockholm': { code: 'SEK', countryCode: 'SWE' },
        'Europe/Oslo': { code: 'NOK', countryCode: 'NOR' },
        'Europe/Copenhagen': { code: 'DKK', countryCode: 'DNK' },
        'Europe/Warsaw': { code: 'PLN', countryCode: 'POL' },
        'Europe/Prague': { code: 'CZK', countryCode: 'CZE' },
        'Europe/Budapest': { code: 'HUF', countryCode: 'HUN' },
        'Europe/Bucharest': { code: 'RON', countryCode: 'ROU' },
        'Europe/Paris': { code: 'EUR', countryCode: 'FRA' },
        'Europe/Berlin': { code: 'EUR', countryCode: 'DEU' },
        'Europe/Amsterdam': { code: 'EUR', countryCode: 'NLD' },
        'Europe/Madrid': { code: 'EUR', countryCode: 'ESP' },
        'Europe/Rome': { code: 'EUR', countryCode: 'ITA' },
        'Europe/Brussels': { code: 'EUR', countryCode: 'BEL' },
        'Europe/Vienna': { code: 'EUR', countryCode: 'AUT' },
        'Europe/Dublin': { code: 'EUR', countryCode: 'IRL' },
        'Europe/Lisbon': { code: 'EUR', countryCode: 'PRT' },
        'Europe/Helsinki': { code: 'EUR', countryCode: 'FIN' },
        'Europe/Athens': { code: 'EUR', countryCode: 'GRC' },
        'Europe/Luxembourg': { code: 'EUR', countryCode: 'LUX' },
        'Europe/Tallinn': { code: 'EUR', countryCode: 'EST' },
        'Europe/Riga': { code: 'EUR', countryCode: 'LVA' },
        'Europe/Vilnius': { code: 'EUR', countryCode: 'LTU' },
        'Europe/Bratislava': { code: 'EUR', countryCode: 'SVK' },
        'Europe/Ljubljana': { code: 'EUR', countryCode: 'SVN' },
        'Europe/Zagreb': { code: 'EUR', countryCode: 'HRV' },
        'Europe/Malta': { code: 'EUR', countryCode: 'MLT' },
        'Europe/Nicosia': { code: 'EUR', countryCode: 'CYP' },
        'Atlantic/Canary': { code: 'EUR', countryCode: 'ESP' },
        'Atlantic/Madeira': { code: 'EUR', countryCode: 'PRT' },
        'Atlantic/Azores': { code: 'EUR', countryCode: 'PRT' },
        'Africa/Johannesburg': { code: 'ZAR', countryCode: 'ZAF' },
        'Pacific/Auckland': { code: 'NZD', countryCode: 'NZL' },
        'America/Toronto': { code: 'CAD', countryCode: 'CAN' },
        'America/Vancouver': { code: 'CAD', countryCode: 'CAN' },
        'America/Edmonton': { code: 'CAD', countryCode: 'CAN' },
        'America/Winnipeg': { code: 'CAD', countryCode: 'CAN' },
        'America/Halifax': { code: 'CAD', countryCode: 'CAN' },
        'America/St_Johns': { code: 'CAD', countryCode: 'CAN' },
        'America/Regina': { code: 'CAD', countryCode: 'CAN' },
        'America/Montreal': { code: 'CAD', countryCode: 'CAN' },
        'America/Mexico_City': { code: 'MXN', countryCode: 'MEX' },
        'America/Sao_Paulo': { code: 'BRL', countryCode: 'BRA' },
        'America/Argentina/Buenos_Aires': { code: 'ARS', countryCode: 'ARG' },
        'America/Buenos_Aires': { code: 'ARS', countryCode: 'ARG' },
        'America/Santiago': { code: 'CLP', countryCode: 'CHL' },
        'America/Bogota': { code: 'COP', countryCode: 'COL' },
        'America/Lima': { code: 'PEN', countryCode: 'PER' },
        'America/New_York': { code: 'USD', countryCode: 'USA' },
        'America/Chicago': { code: 'USD', countryCode: 'USA' },
        'America/Denver': { code: 'USD', countryCode: 'USA' },
        'America/Los_Angeles': { code: 'USD', countryCode: 'USA' },
        'America/Phoenix': { code: 'USD', countryCode: 'USA' },
        'America/Anchorage': { code: 'USD', countryCode: 'USA' },
        'Pacific/Honolulu': { code: 'USD', countryCode: 'USA' },
        'America/Detroit': { code: 'USD', countryCode: 'USA' }
    };

    const TIMEZONE_PREFIXES = [
        ['Australia/', { code: 'AUD', countryCode: 'AUS' }],
        ['Canada/', { code: 'CAD', countryCode: 'CAN' }],
        ['America/Indiana/', { code: 'USD', countryCode: 'USA' }],
        ['America/Kentucky/', { code: 'USD', countryCode: 'USA' }],
        ['US/', { code: 'USD', countryCode: 'USA' }]
    ];

    const LANG_TO_LOCATION = {
        zh: { code: 'CNY', countryCode: 'CHN' },
        hi: { code: 'INR', countryCode: 'IND' }, ta: { code: 'INR', countryCode: 'IND' },
        te: { code: 'INR', countryCode: 'IND' }, kn: { code: 'INR', countryCode: 'IND' },
        ml: { code: 'INR', countryCode: 'IND' }, mr: { code: 'INR', countryCode: 'IND' },
        bn: { code: 'INR', countryCode: 'IND' }, gu: { code: 'INR', countryCode: 'IND' },
        pa: { code: 'INR', countryCode: 'IND' },
        ja: { code: 'JPY', countryCode: 'JPN' },
        ko: { code: 'KRW', countryCode: 'KOR' },
        th: { code: 'THB', countryCode: 'THA' },
        vi: { code: 'VND', countryCode: 'VNM' },
        id: { code: 'IDR', countryCode: 'IDN' },
        ms: { code: 'MYR', countryCode: 'MYS' },
        tr: { code: 'TRY', countryCode: 'TUR' },
        pl: { code: 'PLN', countryCode: 'POL' },
        sv: { code: 'SEK', countryCode: 'SWE' },
        no: { code: 'NOK', countryCode: 'NOR' }, nb: { code: 'NOK', countryCode: 'NOR' },
        da: { code: 'DKK', countryCode: 'DNK' },
        ru: { code: 'RUB', countryCode: 'RUS' },
        uk: { code: 'UAH', countryCode: 'UKR' },
        he: { code: 'ILS', countryCode: 'ISR' },
        de: { code: 'EUR', countryCode: 'DEU' },
        fr: { code: 'EUR', countryCode: 'FRA' },
        es: { code: 'EUR', countryCode: 'ESP' },
        it: { code: 'EUR', countryCode: 'ITA' },
        nl: { code: 'EUR', countryCode: 'NLD' },
        pt: { code: 'EUR', countryCode: 'PRT' },
        fi: { code: 'EUR', countryCode: 'FIN' },
        el: { code: 'EUR', countryCode: 'GRC' }
    };

    const regionDisplayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
        ? new Intl.DisplayNames(['en'], { type: 'region' })
        : null;
    const currencyDisplayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
        ? new Intl.DisplayNames(['en'], { type: 'currency' })
        : null;

    function getMacroRegion(iso2) {
        if (MACRO_REGIONS.Americas.has(iso2)) return 'Americas';
        if (MACRO_REGIONS.Europe.has(iso2)) return 'Europe';
        if (MACRO_REGIONS['Asia-Pacific'].has(iso2)) return 'Asia-Pacific';
        return 'Middle East & Africa';
    }

    function toFlagEmoji(iso2) {
        if (!iso2 || iso2.length !== 2) return '🌐';
        return String.fromCodePoint(...[...iso2.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
    }

    function resolveCurrencySymbol(code) {
        if (!code) return '$';
        const upper = code.toUpperCase();
        if (SYMBOL_OVERRIDES[upper]) return SYMBOL_OVERRIDES[upper];
        try {
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                const parts = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: upper,
                    currencyDisplay: 'narrowSymbol'
                }).formatToParts(0);
                const part = parts.find(p => p.type === 'currency');
                if (part && part.value) return part.value;
            }
        } catch (e) {}
        return upper;
    }

    function resolveCurrencyName(code) {
        const upper = String(code || '').toUpperCase();
        try {
            if (currencyDisplayNames) {
                return currencyDisplayNames.of(upper) || upper;
            }
        } catch (e) {}
        return upper;
    }

    function resolveRegionName(iso2) {
        const upper = String(iso2 || '').toUpperCase();
        if (upper === 'EU') return 'Eurozone';
        try {
            if (regionDisplayNames) {
                return regionDisplayNames.of(upper) || upper;
            }
        } catch (e) {}
        return upper;
    }

    // Build structured country & currency lists once
    const WORLD_COUNTRIES = [];
    const COUNTRY_BY_ISO3 = {};
    const COUNTRY_BY_ISO2 = {};
    const COUNTRIES_BY_CURRENCY = {};

    RAW_COUNTRIES.split(/\s+/).forEach(token => {
        if (!token) return;
        const [countryCode, iso2, currencyCode] = token.split(':');
        if (!countryCode || !iso2 || !currencyCode) return;

        const entry = {
            countryCode,
            iso2,
            flag: toFlagEmoji(iso2),
            region: resolveRegionName(iso2),
            currencyCode,
            currencyName: resolveCurrencyName(currencyCode),
            currencySymbol: resolveCurrencySymbol(currencyCode),
            macroRegion: getMacroRegion(iso2),
            isPopularCountry: POPULAR_COUNTRY_ORDER.includes(countryCode)
        };
        WORLD_COUNTRIES.push(entry);
        COUNTRY_BY_ISO3[countryCode] = entry;
        COUNTRY_BY_ISO2[iso2] = entry;
        if (!COUNTRIES_BY_CURRENCY[currencyCode]) COUNTRIES_BY_CURRENCY[currencyCode] = [];
        COUNTRIES_BY_CURRENCY[currencyCode].push(entry);
    });

    // Add EMU (Eurozone) aggregate country entry for convenience
    const EMU_ENTRY = {
        countryCode: 'EMU',
        iso2: 'EU',
        flag: toFlagEmoji('EU'),
        region: 'Eurozone',
        currencyCode: 'EUR',
        currencyName: resolveCurrencyName('EUR'),
        currencySymbol: resolveCurrencySymbol('EUR'),
        macroRegion: 'Europe',
        isPopularCountry: true
    };
    COUNTRY_BY_ISO3.EMU = EMU_ENTRY;

    const popularRank = new Map(POPULAR_CURRENCY_ORDER.map((c, i) => [c, i]));
    const popularCountryRank = new Map(POPULAR_COUNTRY_ORDER.map((c, i) => [c, i]));

    WORLD_COUNTRIES.sort((a, b) => {
        const ra = popularCountryRank.has(a.countryCode) ? popularCountryRank.get(a.countryCode) : 9999;
        const rb = popularCountryRank.has(b.countryCode) ? popularCountryRank.get(b.countryCode) : 9999;
        if (ra !== rb) return ra - rb;
        return a.region.localeCompare(b.region);
    });

    const WORLD_CURRENCIES = Object.keys(COUNTRIES_BY_CURRENCY)
        .map(code => {
            const list = COUNTRIES_BY_CURRENCY[code];
            const primary = PRIMARY_COUNTRY_BY_CURRENCY[code] || list[0];
            return {
                code,
                symbol: resolveCurrencySymbol(code),
                name: resolveCurrencyName(code),
                countryCode: primary.countryCode,
                iso2: primary.iso2,
                flag: toFlagEmoji(primary.iso2),
                region: primary.region,
                macroRegion: getMacroRegion(primary.iso2),
                isPopular: popularRank.has(code),
                countryCount: list.length
            };
        })
        .sort((a, b) => {
            const ra = popularRank.has(a.code) ? popularRank.get(a.code) : 9999;
            const rb = popularRank.has(b.code) ? popularRank.get(b.code) : 9999;
            if (ra !== rb) return ra - rb;
            return a.code.localeCompare(b.code);
        });

    class CurrencyExchangeSDK {
        constructor(options = {}) {
            this.cacheTimeoutMs = options.cacheTimeoutMs || 12 * 60 * 60 * 1000; // 12 hours
            this.wbCacheTimeoutMs = options.wbCacheTimeoutMs || 24 * 60 * 60 * 1000; // 24 hours
            this.rates = null;
            this.lastUpdated = null;
            this.listeners = [];
            this._wbFxCache = {};
            this._wbFxPromises = {};
            this._hydrateCachedRates();
        }

        _hydrateCachedRates() {
            try {
                if (typeof localStorage === 'undefined') return;
                const cached = localStorage.getItem('currency_exchange_rates_usd');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.rates) {
                        this.rates = parsed.rates;
                        this.lastUpdated = parsed.lastUpdated || null;
                    }
                }
            } catch (e) {}
        }

        getWorldCountries() {
            return WORLD_COUNTRIES;
        }

        getWorldCurrencies() {
            return WORLD_CURRENCIES;
        }

        getCountryByCode(countryCode) {
            if (!countryCode) return null;
            return COUNTRY_BY_ISO3[String(countryCode).toUpperCase()] || null;
        }

        getCountriesForCurrency(currencyCode) {
            if (!currencyCode) return [];
            const code = String(currencyCode).toUpperCase();
            const list = COUNTRIES_BY_CURRENCY[code] || [];
            if (code === 'EUR') return [EMU_ENTRY, ...list];
            return list;
        }

        getCurrencySymbol(code) {
            return resolveCurrencySymbol(code);
        }

        getCurrencyName(code) {
            return resolveCurrencyName(code);
        }

        getFlagEmoji(iso2) {
            return toFlagEmoji(iso2);
        }

        /**
         * Fetch latest exchange rates with USD as reference base
         * @returns {Promise<{rates: Object, lastUpdated: string, source: string}>}
         */
        async getLatestRates() {
            const cacheKey = 'currency_exchange_rates_usd';
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < this.cacheTimeoutMs && parsed.rates) {
                        this.rates = parsed.rates;
                        this.lastUpdated = parsed.lastUpdated;
                        return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'cache' };
                    }
                }
            } catch (e) {}

            // Providers in priority order (open.er-api is open & CORS-friendly)
            const endpoints = [
                {
                    url: 'https://open.er-api.com/v6/latest/USD',
                    parser: (data) => {
                        const r = {};
                        if (data && data.rates) {
                            for (const k in data.rates) {
                                r[k.toLowerCase()] = data.rates[k];
                            }
                            return { rates: r, date: data.time_last_update_utc || new Date().toISOString() };
                        }
                        return null;
                    }
                },
                {
                    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
                    parser: (data) => {
                        if (data && data.usd) {
                            data.usd.usd = 1;
                            return { rates: data.usd, date: data.date || new Date().toISOString() };
                        }
                        return null;
                    }
                }
            ];

            for (const ep of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    const res = await fetch(ep.url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) continue;
                    const json = await res.json();
                    const parsed = ep.parser(json);
                    if (parsed && parsed.rates) {
                        // Merge baseline FALLBACK_RATES underneath so rare codes like KPW still resolve if omitted by primary feed
                        this.rates = { ...FALLBACK_RATES, ...parsed.rates };
                        this.lastUpdated = parsed.date;

                        try {
                            localStorage.setItem(cacheKey, JSON.stringify({
                                timestamp: Date.now(),
                                rates: this.rates,
                                lastUpdated: this.lastUpdated
                            }));
                        } catch (e) {}

                        return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'live' };
                    }
                } catch (err) {
                    // Try next provider
                }
            }

            // Fallback to static offline baseline rates
            this.rates = { ...FALLBACK_RATES };
            this.lastUpdated = new Date().toISOString();
            return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'fallback' };
        }

        /**
         * Get exchange rate between two currency codes (e.g. from 'USD' to 'CNY')
         * @param {string} fromCur
         * @param {string} toCur
         * @returns {number|null} Rate: 1 fromCur = X toCur
         */
        getExchangeRate(fromCur = 'USD', toCur = 'USD') {
            const rates = this.rates || FALLBACK_RATES;
            const from = String(fromCur || 'USD').toLowerCase();
            const to = String(toCur || 'USD').toLowerCase();

            if (from === to) return 1.0;

            const fromRateInUSD = rates[from] ?? FALLBACK_RATES[from];
            const toRateInUSD = rates[to] ?? FALLBACK_RATES[to];

            if (!fromRateInUSD || !toRateInUSD) return null;

            return toRateInUSD / fromRateInUSD;
        }

        /**
         * Convert an amount from one currency to another
         * @param {number} amount
         * @param {string} fromCur
         * @param {string} toCur
         * @returns {number}
         */
        convert(amount, fromCur = 'USD', toCur = 'USD') {
            const rate = this.getExchangeRate(fromCur, toCur);
            if (rate === null) return amount;
            return amount * rate;
        }

        /**
         * Get target comparison currencies for a selected base currency
         * @param {string} baseCurrency
         * @param {number} amount
         * @returns {Array<{code: string, symbol: string, rate: number, convertedAmount: number}>}
         */
        getConversionsFor(baseCurrency = 'USD', amount = 1) {
            return WORLD_CURRENCIES
                .filter(t => t.code.toUpperCase() !== String(baseCurrency).toUpperCase())
                .map(t => {
                    const rate = this.getExchangeRate(baseCurrency, t.code) || 1;
                    return {
                        code: t.code,
                        symbol: t.symbol,
                        rate,
                        convertedAmount: amount * rate
                    };
                });
        }

        /**
         * Detect the user's likely currency & country from browser timezone and locale settings
         * without triggering permission prompts or network requests.
         * @param {Array<string>|null} supportedCodes
         * @param {{timeZone?: string, locales?: Array<string>}} overrides
         * @returns {{code: string, countryCode: string, source: 'timezone'|'locale'|'default'}}
         */
        detectUserCurrency(supportedCodes = null, overrides = {}) {
            const hasList = Array.isArray(supportedCodes) && supportedCodes.length > 0;
            const supported = hasList ? new Set(supportedCodes.map(c => String(c).toUpperCase())) : null;
            const isSupported = (code) => !!code && (!supported || supported.has(code));
            const defaultCode = (!supported || supported.has('USD')) ? 'USD' : String(supportedCodes[0]).toUpperCase();

            // 1. IANA Timezone check
            let tz = overrides.timeZone;
            if (tz === undefined) {
                try {
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                } catch (e) {
                    tz = '';
                }
            }
            if (tz) {
                const direct = TIMEZONE_TO_LOCATION[tz];
                if (direct && isSupported(direct.code)) {
                    return { ...direct, source: 'timezone' };
                }
                for (const [prefix, loc] of TIMEZONE_PREFIXES) {
                    if (tz.startsWith(prefix) && isSupported(loc.code)) {
                        return { ...loc, source: 'timezone' };
                    }
                }
            }

            // 2. Locale region & language fallback
            let locales = Array.isArray(overrides.locales) ? overrides.locales : null;
            if (!locales) {
                locales = [];
                try {
                    if (typeof navigator !== 'undefined' && navigator) {
                        if (Array.isArray(navigator.languages)) locales.push(...navigator.languages);
                        if (navigator.language) locales.push(navigator.language);
                    }
                } catch (e) {}
                try {
                    const intlLoc = Intl.DateTimeFormat().resolvedOptions().locale;
                    if (intlLoc) locales.push(intlLoc);
                } catch (e) {}
            }

            for (const rawLoc of locales) {
                if (!rawLoc) continue;
                const parts = String(rawLoc).replace(/_/g, '-').split('-');
                for (let i = 1; i < parts.length; i++) {
                    if (/^[a-zA-Z]{2}$/.test(parts[i])) {
                        const country = COUNTRY_BY_ISO2[parts[i].toUpperCase()];
                        if (country && isSupported(country.currencyCode)) {
                            return { code: country.currencyCode, countryCode: country.countryCode, source: 'locale' };
                        }
                    }
                }
                const lang = parts[0].toLowerCase();
                const langMapped = LANG_TO_LOCATION[lang];
                if (langMapped && isSupported(langMapped.code)) {
                    return { ...langMapped, source: 'locale' };
                }
            }

            return { code: defaultCode, countryCode: 'USA', source: 'default' };
        }

        _resolveFxAnchorCountry(currencyCode, countryCode = null) {
            const cur = String(currencyCode || 'USD').toUpperCase();
            if (cur === 'USD') return 'USA';
            if (cur === 'EUR') return 'EMU';
            if (countryCode && COUNTRY_BY_ISO3[String(countryCode).toUpperCase()]) {
                return String(countryCode).toUpperCase();
            }
            if (PRIMARY_COUNTRY_BY_CURRENCY[cur]) return PRIMARY_COUNTRY_BY_CURRENCY[cur].countryCode;
            const list = COUNTRIES_BY_CURRENCY[cur];
            return (list && list[0] && list[0].countryCode) || 'USA';
        }

        _getSyncCountryFxSeries(currencyCode, countryCode = null) {
            const cur = String(currencyCode || 'USD').toUpperCase();
            if (cur === 'USD') {
                const nowYr = new Date().getFullYear();
                const usdMap = {};
                for (let y = nowYr; y >= nowYr - 36; y--) usdMap[y] = 1;
                return usdMap;
            }
            const anchor = this._resolveFxAnchorCountry(cur, countryCode);
            const fallbackAnchor = PRIMARY_COUNTRY_BY_CURRENCY[cur]?.countryCode || COUNTRIES_BY_CURRENCY[cur]?.[0]?.countryCode;
            const candidates = anchor === fallbackAnchor ? [anchor] : [anchor, fallbackAnchor];

            for (const code of candidates) {
                if (!code) continue;
                if (this._wbFxCache[code]) return this._wbFxCache[code];
                try {
                    if (typeof localStorage !== 'undefined') {
                        const raw = localStorage.getItem(`fx_sdk_wb_hist_${code}`);
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            if (parsed && parsed.data && Object.keys(parsed.data).length > 0) {
                                this._wbFxCache[code] = parsed.data;
                                return parsed.data;
                            }
                        }
                    }
                } catch (e) {}
            }
            return null;
        }

        async _fetchRawCountryFxSeries(code) {
            if (!code) return null;
            if (code === 'USA') {
                const nowYr = new Date().getFullYear();
                const usdMap = {};
                for (let y = nowYr; y >= nowYr - 36; y--) usdMap[y] = 1;
                return usdMap;
            }

            if (this._wbFxCache[code]) return this._wbFxCache[code];

            let staleData = null;
            try {
                if (typeof localStorage !== 'undefined') {
                    const raw = localStorage.getItem(`fx_sdk_wb_hist_${code}`);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && parsed.data && Object.keys(parsed.data).length > 0) {
                            staleData = parsed.data;
                            if (Date.now() - parsed.timestamp < this.wbCacheTimeoutMs) {
                                this._wbFxCache[code] = parsed.data;
                                return parsed.data;
                            }
                        }
                    }
                }
            } catch (e) {}

            if (this._wbFxPromises[code]) return this._wbFxPromises[code];

            this._wbFxPromises[code] = (async () => {
                try {
                    const endYear = new Date().getFullYear();
                    const startYear = endYear - 36;
                    const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(code)}/indicator/PA.NUS.FCRF?date=${startYear}:${endYear}&format=json&per_page=60`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 7000);
                    const res = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) throw new Error(`WB FX HTTP ${res.status}`);
                    const json = await res.json();
                    if (Array.isArray(json) && Array.isArray(json[1])) {
                        const map = {};
                        for (const r of json[1]) {
                            if (r && r.value !== null && r.value !== undefined && Number(r.value) > 0) {
                                map[parseInt(r.date, 10)] = Number(r.value);
                            }
                        }
                        if (Object.keys(map).length > 0) {
                            this._wbFxCache[code] = map;
                            try {
                                if (typeof localStorage !== 'undefined') {
                                    localStorage.setItem(`fx_sdk_wb_hist_${code}`, JSON.stringify({
                                        timestamp: Date.now(),
                                        data: map
                                    }));
                                }
                            } catch (e) {}
                            return map;
                        }
                    }
                } catch (e) {
                    // Fall back to stale data if offline
                } finally {
                    delete this._wbFxPromises[code];
                }
                return staleData;
            })();

            return this._wbFxPromises[code];
        }

        async _fetchCountryHistoricalFx(currencyCode, countryCode = null) {
            const cur = String(currencyCode || 'USD').toUpperCase();
            if (cur === 'USD') return this._fetchRawCountryFxSeries('USA');
            const anchor = this._resolveFxAnchorCountry(cur, countryCode);
            let map = await this._fetchRawCountryFxSeries(anchor);
            if (!map) {
                const fallbackAnchor = PRIMARY_COUNTRY_BY_CURRENCY[cur]?.countryCode || COUNTRIES_BY_CURRENCY[cur]?.[0]?.countryCode;
                if (fallbackAnchor && fallbackAnchor !== anchor) {
                    map = await this._fetchRawCountryFxSeries(fallbackAnchor);
                }
            }
            return map;
        }

        _buildPairFxProfile(fromCurrency, toCurrency, fromMap, toMap, source = 'World Bank FX') {
            if (!fromMap || !toMap) {
                return {
                    pair: `${fromCurrency}->${toCurrency}`,
                    ready: false,
                    source: 'Pending World Bank FX',
                    latest: { rate: 0, year: new Date().getFullYear() - 1 },
                    avg3Y: 0, avg5Y: 0, avg10Y: 0, avg20Y: 0, avg30Y: 0,
                    maxDepr: { rate: 0, year: new Date().getFullYear() - 1 },
                    maxAppr: { rate: 0, year: new Date().getFullYear() - 1 },
                    history: []
                };
            }

            const years = Object.keys(toMap)
                .map(Number)
                .filter(y => fromMap[y] > 0 && toMap[y] > 0)
                .sort((a, b) => b - a);

            const cross = {};
            for (const y of years) cross[y] = toMap[y] / fromMap[y];

            const history = [];
            for (const y of years) {
                if (cross[y - 1] > 0) {
                    const pct = ((cross[y] / cross[y - 1]) - 1) * 100;
                    history.push({ year: y, value: Math.round(pct * 10) / 10, rate: cross[y] });
                }
            }

            const cagr = (n) => {
                if (years.length < 2) return 0;
                const y0 = years[0];
                const targetYr = y0 - n;
                const yN = years.find(y => y <= targetYr) ?? years[years.length - 1];
                const span = y0 - yN;
                if (!y0 || !yN || span <= 0 || !cross[y0] || !cross[yN]) return 0;
                const val = (Math.pow(cross[y0] / cross[yN], 1 / span) - 1) * 100;
                return Math.round(val * 10) / 10;
            };

            const latestEntry = history[0] || { year: years[0] || new Date().getFullYear() - 1, value: 0 };
            const recent15 = history.slice(0, 15);
            const maxDepr = recent15.reduce((best, r) => (!best || r.value > best.value ? r : best), null) || latestEntry;
            const maxAppr = recent15.reduce((best, r) => (!best || r.value < best.value ? r : best), null) || latestEntry;

            return {
                pair: `${fromCurrency}->${toCurrency}`,
                ready: history.length > 0,
                source,
                latest: { rate: latestEntry.value, year: latestEntry.year },
                avg3Y: cagr(3),
                avg5Y: cagr(5),
                avg10Y: cagr(10),
                avg20Y: cagr(20),
                avg30Y: cagr(30),
                maxDepr: { rate: maxDepr.value, year: maxDepr.year },
                maxAppr: { rate: maxAppr.value, year: maxAppr.year },
                history: recent15
            };
        }

        getSyncPairHistoricalProfile(fromCurrency, toCurrency, fromCountryCode = null, toCountryCode = null) {
            const fromMap = this._getSyncCountryFxSeries(fromCurrency, fromCountryCode);
            const toMap = this._getSyncCountryFxSeries(toCurrency, toCountryCode);
            return this._buildPairFxProfile(fromCurrency, toCurrency, fromMap, toMap, 'World Bank FX');
        }

        async getPairHistoricalProfile(fromCurrency, toCurrency, fromCountryCode = null, toCountryCode = null) {
            const [fromMap, toMap] = await Promise.all([
                this._fetchCountryHistoricalFx(fromCurrency, fromCountryCode),
                this._fetchCountryHistoricalFx(toCurrency, toCountryCode)
            ]);
            return this._buildPairFxProfile(fromCurrency, toCurrency, fromMap, toMap, 'World Bank FX');
        }
    }

    return new CurrencyExchangeSDK();
}));
