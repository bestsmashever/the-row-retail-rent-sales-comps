export type Dataset = 'lease' | 'sale'
export type SaleCategory = 'Unanchored Strip' | 'Lifestyle / Power Center'

export interface MapPoint {
  id: string
  name: string
  kind: Dataset | 'target'
  city: string
  address: string
  lat: number
  lng: number
  geocodeNote: string
}

export interface LeaseComp {
  id: string
  property: string
  tenant: string
  status: 'Lease' | 'LOI'
  sfLabel: string
  sf: number | null
  baseRentLabel: string
  baseRentLow: number | null
  baseRentHigh: number | null
  nnnLabel: string
  nnn: number | null
  tiLabel: string
  ti: number | null
  pointId: string
}

export interface SaleComp {
  id: string
  category: SaleCategory
  property: string
  city: string
  address: string
  sizeSf: number
  saleDate: string
  salePriceLabel: string
  salePrice: number | null
  psfLabel: string
  psf: number | null
  capRateLabel: string
  capRate: number | null
  occupancyLabel: string
  occupancy: number | null
  tenants: string
  pointId: string
}

export const mapPoints: MapPoint[] = [
  {
    id: 'target-the-row',
    name: 'The Row / Velocity',
    kind: 'target',
    city: 'Del Valle / Austin ETJ',
    address: 'SH 71 & SH 130',
    lat: 30.195102,
    lng: -97.624136,
    geocodeNote: 'ArcGIS match: State Hwy-71 & State Highway 130, Del Valle, TX',
  },
  {
    id: 'easton-park',
    name: 'Easton Park',
    kind: 'lease',
    city: 'Austin',
    address: 'E William Cannon Dr & McKinney Falls Pkwy',
    lat: 30.163244,
    lng: -97.7259,
    geocodeNote: 'Specific retail intersection from public Easton Park / First Hartford materials; ArcGIS intersection match.',
  },
  {
    id: 'southpark-meadows',
    name: 'Southpark Meadows',
    kind: 'lease',
    city: 'Austin',
    address: 'Southpark Meadows',
    lat: 30.154203,
    lng: -97.792593,
    geocodeNote: 'ArcGIS place match: Southpark Meadows.',
  },
  {
    id: 'oaks-at-slaughter',
    name: 'Oaks at Slaughter',
    kind: 'lease',
    city: 'Austin',
    address: 'S Congress Ave & W Slaughter Ln',
    lat: 30.167063,
    lng: -97.788529,
    geocodeNote: 'ArcGIS intersection match.',
  },
  {
    id: 'burleson-crossing-east',
    name: 'Burleson Crossing East',
    kind: 'lease',
    city: 'Bastrop',
    address: '655 Hwy 71, Bastrop',
    lat: 30.098724,
    lng: -97.274073,
    geocodeNote: 'Specific Sprouts/Burleson Crossing East public address; ArcGIS address match.',
  },
  {
    id: '8901-i35',
    name: '8901 I-35',
    kind: 'lease',
    city: 'Austin',
    address: '8901 S Interstate 35',
    lat: 30.167916,
    lng: -97.784077,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '1023-springdale',
    name: '1023 Springdale Road',
    kind: 'lease',
    city: 'Austin',
    address: '1023 Springdale Rd',
    lat: 30.267093,
    lng: -97.692456,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '1920-riverside',
    name: '1920 E Riverside Drive',
    kind: 'lease',
    city: 'Austin',
    address: '1920 E Riverside Dr',
    lat: 30.242508,
    lng: -97.728098,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '2201-airport',
    name: '2201 Airport Blvd',
    kind: 'lease',
    city: 'Austin',
    address: '2201 Airport Blvd',
    lat: 30.285553,
    lng: -97.705164,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '1510-cesar-chavez',
    name: '1510 E Cesar Chavez',
    kind: 'lease',
    city: 'Austin',
    address: '1510 E Cesar Chavez St',
    lat: 30.25877,
    lng: -97.728822,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '2226-cesar-chavez',
    name: '2226 E Cesar Chavez',
    kind: 'lease',
    city: 'Austin',
    address: '2226 E Cesar Chavez St',
    lat: 30.255588,
    lng: -97.719614,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '2708-cesar-chavez',
    name: '2708 E Cesar Chavez',
    kind: 'lease',
    city: 'Austin',
    address: '2708 E Cesar Chavez St',
    lat: 30.253439,
    lng: -97.713526,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'shops-at-domain',
    name: 'Shops at Domain',
    kind: 'sale',
    city: 'Austin',
    address: '3310 W Braker Ln',
    lat: 30.392805,
    lng: -97.725876,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'dominion-creek',
    name: 'Dominion Creek',
    kind: 'sale',
    city: 'San Antonio',
    address: '23110 W Interstate 10',
    lat: 29.657237,
    lng: -98.624964,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'alamo-ranch-south',
    name: 'Alamo Ranch South',
    kind: 'sale',
    city: 'San Antonio',
    address: '12016 Alamo Ranch Pkwy',
    lat: 29.483806,
    lng: -98.730005,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'gruene-heights',
    name: 'Gruene Heights',
    kind: 'sale',
    city: 'New Braunfels',
    address: '1050 FM 306',
    lat: 29.742582,
    lng: -98.093556,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'creekview-shops',
    name: 'Creekview Shops',
    kind: 'sale',
    city: 'New Braunfels',
    address: '2802 IH-35',
    lat: 29.728811,
    lng: -98.076698,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'bulverde-marketplace',
    name: 'Bulverde Marketplace',
    kind: 'sale',
    city: 'San Antonio',
    address: '17202 Bulverde Rd',
    lat: 29.59614,
    lng: -98.419135,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'shops-at-greenlawn',
    name: 'Shops at Greenlawn',
    kind: 'sale',
    city: 'Round Rock',
    address: '3200 Greenlawn Blvd',
    lat: 30.480762,
    lng: -97.661354,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'ledgestone-east',
    name: 'Ledgestone East',
    kind: 'sale',
    city: 'Austin',
    address: 'W Hwy 290 & Ledgestone Dr',
    lat: 30.206159,
    lng: -97.978406,
    geocodeNote: 'ArcGIS intersection match.',
  },
  {
    id: 'trails-at-620',
    name: 'Trails at 620',
    kind: 'sale',
    city: 'Austin',
    address: '8300 N FM 620',
    lat: 30.421919,
    lng: -97.847254,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'cannon-crossing',
    name: 'Cannon Crossing',
    kind: 'sale',
    city: 'Austin',
    address: '4012 W William Cannon Dr',
    lat: 30.220047,
    lng: -97.834719,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'dry-river-district',
    name: 'Dry River District',
    kind: 'sale',
    city: 'Kyle',
    address: 'IH-35 & Kyle Crossing',
    lat: 30.035666,
    lng: -97.84607,
    geocodeNote: 'ArcGIS intersection match.',
  },
  {
    id: 'oak-hill-centre',
    name: 'Oak Hill Centre',
    kind: 'sale',
    city: 'Austin',
    address: '6705 W US 290 Hwy',
    lat: 30.233172,
    lng: -97.865627,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'oak-hill-plaza',
    name: 'Oak Hill Plaza',
    kind: 'sale',
    city: 'Austin',
    address: '7101 SH-71',
    lat: 30.234483,
    lng: -97.877712,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: '1890-ranch',
    name: '1890 Ranch',
    kind: 'sale',
    city: 'Cedar Park',
    address: '1890 Ranch',
    lat: 30.528735,
    lng: -97.813788,
    geocodeNote: 'ArcGIS place match.',
  },
  {
    id: 'gateway-shopping-center',
    name: 'Gateway Shopping Center',
    kind: 'sale',
    city: 'Austin',
    address: '9629 Research Blvd',
    lat: 30.38946,
    lng: -97.74344,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'lantana-place',
    name: 'Lantana Place',
    kind: 'sale',
    city: 'Austin',
    address: '7415 Southwest Pkwy',
    lat: 30.256439,
    lng: -97.870441,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'republic-square',
    name: 'Republic Square',
    kind: 'sale',
    city: 'Georgetown',
    address: '900-930 N Austin Ave',
    lat: 30.651001,
    lng: -97.676064,
    geocodeNote: 'ArcGIS address match on 900 N Austin Ave.',
  },
  {
    id: 'stassney-heights',
    name: 'Stassney Heights',
    kind: 'sale',
    city: 'Austin',
    address: '716 S Congress Ave',
    lat: 30.255087,
    lng: -97.747703,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'university-commons',
    name: 'University Commons',
    kind: 'sale',
    city: 'Round Rock',
    address: '200 University Blvd',
    lat: 30.560548,
    lng: -97.690196,
    geocodeNote: 'ArcGIS address match.',
  },
  {
    id: 'walden-park',
    name: 'Walden Park',
    kind: 'sale',
    city: 'Cedar Park',
    address: '10900 Lakeline Mall Dr & 14005 Research Blvd',
    lat: 30.476396,
    lng: -97.796925,
    geocodeNote: 'ArcGIS address match on 10900 Lakeline Mall Dr.',
  },
]

export const leaseComps: LeaseComp[] = [
  lease('l01', 'Easton Park', 'TJ Maxx', 'Lease', '~20K SF', 20000, '$20.00 - $21.00', 20, 21, '-', null, 'Turnkey delivery', null, 'easton-park'),
  lease('l02', 'Easton Park', 'Wings N More', 'LOI', 'Ground Lease PAD', null, '$170,000', null, null, '-', null, '$250,000', 250000, 'easton-park'),
  lease('l03', 'Southpark Meadows', 'Paris Baguette', 'LOI', '4,000', 4000, '$43.00', 43, 43, '$10.25', 10.25, '$55.00', 55, 'southpark-meadows'),
  lease('l04', 'Southpark Meadows', 'Escapology', 'LOI', '4,000', 4000, '$37.00', 37, 37, '$10.25', 10.25, '$37.00', 37, 'southpark-meadows'),
  lease('l05', 'Southpark Meadows', 'Appliances for Less', 'LOI', '8,901', 8901, '$18.00', 18, 18, '$10.25', 10.25, '$20.00', 20, 'southpark-meadows'),
  lease('l06', 'Southpark Meadows', 'Moreno BBQ', 'Lease', '3,022', 3022, '$36.00', 36, 36, '$10.25', 10.25, '-', null, 'southpark-meadows'),
  lease('l07', 'Southpark Meadows', 'GloTanning', 'Lease', '2,750', 2750, '$34.00', 34, 34, '$10.25', 10.25, '-', null, 'southpark-meadows'),
  lease('l08', 'Southpark Meadows', 'Another Broken Egg Cafe', 'Lease', '3,000', 3000, '$40.50', 40.5, 40.5, '$9.00', 9, '$30.00', 30, 'southpark-meadows'),
  lease('l09', 'Southpark Meadows', 'Crunch Fitness', 'Lease', '40,000', 40000, '$19.50', 19.5, 19.5, '$10.25', 10.25, '-', null, 'southpark-meadows'),
  lease('l10', 'Oaks at Slaughter', 'Tomlinsons', 'Lease', '2,786', 2786, '$38.00', 38, 38, '$15.87', 15.87, '-', null, 'oaks-at-slaughter'),
  lease('l11', 'Oaks at Slaughter', 'Juiceland', 'Lease', '1,260', 1260, '$38.50', 38.5, 38.5, '$15.87', 15.87, '-', null, 'oaks-at-slaughter'),
  lease('l12', 'Oaks at Slaughter', 'Ramen Tatsuya', 'Lease', '2,480', 2480, '$38.50', 38.5, 38.5, '$15.87', 15.87, '-', null, 'oaks-at-slaughter'),
  lease('l13', 'Burleson Crossing East', 'Aspen Dental', 'Lease', '3,000', 3000, '$48.00', 48, 48, '$12.00', 12, '-', null, 'burleson-crossing-east'),
  lease('l14', 'Burleson Crossing East', 'Freebirds', 'Lease', '2,500', 2500, '$48.00', 48, 48, '$12.00', 12, '-', null, 'burleson-crossing-east'),
  lease('l15', 'Burleson Crossing East', 'Sprouts', 'Lease', '22,000', 22000, '$32.00 - $34.00', 32, 34, '$12.00', 12, 'Full turnkey delivery', null, 'burleson-crossing-east'),
  lease('l16', '8901 I-35', 'IHop', 'Lease', '4,127', 4127, '$39.24', 39.24, 39.24, '-', null, '-', null, '8901-i35'),
  lease('l17', '1023 Springdale Road', 'Moontower', 'Lease', '515', 515, '$37.00', 37, 37, '-', null, '-', null, '1023-springdale'),
  lease('l18', '1920 E Riverside Drive', 'AT&T', 'Lease', '4,025', 4025, '$40.00', 40, 40, '-', null, '-', null, '1920-riverside'),
  lease('l19', '2201 Airport Blvd', 'Buffalo Wild Wings To Go', 'Lease', '1,300', 1300, '$44.00', 44, 44, '-', null, '-', null, '2201-airport'),
  lease('l20', '1510 E Cesar Chavez', 'Casa Bianca', 'Lease', '3,640', 3640, '$46.00', 46, 46, '-', null, '-', null, '1510-cesar-chavez'),
  lease('l21', '2226 E Cesar Chavez', 'Dear Dry Drinker', 'Lease', '912', 912, '$54.00', 54, 54, '-', null, '-', null, '2226-cesar-chavez'),
  lease('l22', '2708 E Cesar Chavez', 'Ezov', 'Lease', '3,543', 3543, '$55.00', 55, 55, '-', null, '-', null, '2708-cesar-chavez'),
]

export const saleComps: SaleComp[] = [
  sale('s01', 'Unanchored Strip', 'Shops at Domain', 'Austin', '3310 W Braker Lane', 13449, 'Under Contract', '$12,350,000', 12350000, '$918', 918, '6.10%', 6.1, '100%', 100, 'Mattress Firm, Swish Dental', 'shops-at-domain'),
  sale('s02', 'Unanchored Strip', 'Dominion Creek', 'San Antonio', '23110 W I-10', 18665, 'Under Contract', '$10,000,000', 10000000, '$536', 536, '6.44%', 6.44, '100%', 100, 'Jersey Mikes, Wingstop', 'dominion-creek'),
  sale('s03', 'Unanchored Strip', 'Alamo Ranch South', 'San Antonio', '12016 Alamo Ranch Parkway', 15502, 'Dec 2025', '$8,357,000', 8357000, '$539', 539, '6.77%', 6.77, '100%', 100, 'Five Guys, Teriyaki Madness, Alloy Fitness', 'alamo-ranch-south'),
  sale('s04', 'Unanchored Strip', 'Gruene Heights', 'New Braunfels', '1050 FM 306', 25767, 'Dec 2025', '$13,150,000', 13150000, '$510', 510, '6.81%', 6.81, '100%', 100, 'Chicken Salad Chick, Action Behavior Center', 'gruene-heights'),
  sale('s05', 'Unanchored Strip', 'Creekview Shops', 'New Braunfels', '2802 IH-35', 19522, 'Nov 2025', '$12,500,000', 12500000, '$640', 640, '6.25%', 6.25, '100%', 100, 'Mattress Firm, Verizon, AT&T', 'creekview-shops'),
  sale('s06', 'Unanchored Strip', 'Bulverde Marketplace', 'San Antonio', '17202 Bulverde Road', 16153, 'Sep 2025', '$9,015,000', 9015000, '$558', 558, '6.43%', 6.43, '100%', 100, 'Chipotle, Jersey Mikes', 'bulverde-marketplace'),
  sale('s07', 'Unanchored Strip', 'Shops at Greenlawn', 'Round Rock', '3200 Greenlawn Blvd', 22970, 'Jul 2025', '$12,150,000', 12150000, '$529', 529, '5.68%', 5.68, '100%', 100, 'Tide Dry Cleaners, F45, Wise Guys', 'shops-at-greenlawn'),
  sale('s08', 'Unanchored Strip', 'Ledgestone East', 'Austin', 'NEC of Hwy 290 & Ledgestone Dr', 14968, 'Jul 2024', '$10,575,000', 10575000, '$707', 707, '6.20%', 6.2, '100%', 100, "Amy's Ice Cream, Urgent Vet, Beverly Hills Rejuvenation Center", 'ledgestone-east'),
  sale('s09', 'Unanchored Strip', 'Trails at 620', 'Austin', '8300 N FM 620', 69037, 'Sep 2024', '$25,000,000', 25000000, '$362', 362, '5.68%', 5.68, '80%', 80, "Freebirds, Schlotzsky's, SportClips", 'trails-at-620'),
  sale('s10', 'Unanchored Strip', 'Cannon Crossing', 'Austin', '4012 William Cannon Drive', 13320, 'Jun 2024', '$8,935,000', 8935000, '$671', 671, '5.04%', 5.04, '100%', 100, 'Taco Cabana, T-Mobile', 'cannon-crossing'),
  sale('s11', 'Unanchored Strip', 'Dry River District', 'Kyle', 'IH-35 & Kyle Crossing', 18076, 'Jan 2024', '$14,000,000', 14000000, '$775', 775, '6.40%', 6.4, '100%', 100, 'Via 313, Einsteins, Freebirds', 'dry-river-district'),
  sale('s12', 'Unanchored Strip', 'Oak Hill Centre', 'Austin', '6705 US-290', 43313, 'Apr 2022', '$13,900,000', 13900000, '$321', 321, '5.17%', 5.17, '80%', 80, "Via 313, Juiceland, O'Reilly Auto Parts", 'oak-hill-centre'),
  sale('s13', 'Unanchored Strip', 'Oaks at Slaughter', 'Austin', 'South Congress & Slaughter Lane', 25809, 'Aug 2023', '$14,100,000', 14100000, '$546', 546, '5.73%', 5.73, '94%', 94, "Torchy's, Twin Liquors, Ramen Tatsuya", 'oaks-at-slaughter'),
  sale('s14', 'Lifestyle / Power Center', 'Oak Hill Plaza', 'Austin', '7101 SH-71', 115512, 'Under Contract', '$36,000,000', 36000000, '$312', 312, '7.00%', 7, '93%', 93, 'Pluckers, Picklr, F45', 'oak-hill-plaza'),
  sale('s15', 'Lifestyle / Power Center', '1890 Ranch', 'Cedar Park', '1890 Ranch', 441620, 'Jun 2026', 'N/A', null, '~$285', 285, '7.00%', 7, '99%', 99, 'Whole Foods, TJ Maxx', '1890-ranch'),
  sale('s16', 'Lifestyle / Power Center', 'Gateway Shopping Center', 'Austin', '9629 Research Blvd', 513520, 'Feb 2026', '$160,000,000', 160000000, '$312', 312, '~6.00%', 6, '98.9%', 98.9, 'Whole Foods Market, Crate & Barrel, Saks Fifth Avenue Off 5th, The Container Store', 'gateway-shopping-center'),
  sale('s17', 'Lifestyle / Power Center', 'Lantana Place', 'Austin', '7415 Southwest Parkway', 198180, 'Nov 2025', '$57,500,000', 57500000, '$290', 290, '6.50%', 6.5, '99%', 99, 'Ling Wu, Black Rock Coffee, AMC Theaters', 'lantana-place'),
  sale('s18', 'Lifestyle / Power Center', 'Republic Square', 'Georgetown', '900-930 N Austin Avenue', 113772, 'Sep 2025', '$31,000,000', 31000000, '$272', 272, '7.35%', 7.35, '98%', 98, 'Dollar Tree, Harbor Freight, Starbucks, Pizza Hut', 'republic-square'),
  sale('s19', 'Lifestyle / Power Center', 'Stassney Heights', 'Austin', '716 S Congress', 103030, 'Mar 2025', 'N/A', null, 'N/A', null, '5.75%', 5.75, '100%', 100, 'Fiesta Mart, Frost Bank, Pizza Hut, Great Clips, T-Mobile, other local', 'stassney-heights'),
  sale('s20', 'Lifestyle / Power Center', 'University Commons', 'Round Rock', '200 University Blvd', 218258, 'Oct 2024', 'N/A', null, 'N/A', null, '5.70%', 5.7, '94%', 94, 'HEB, Jamba, Twin Liqors, Freebirds', 'university-commons'),
  sale('s21', 'Lifestyle / Power Center', 'Walden Park', 'Cedar Park', '10900 Lakeline Mall Drive & 14005 Research Blvd', 90824, 'Jul 2024', '$27,000,000', 27000000, '$297', 297, '6.50%', 6.5, '100%', 100, 'Homegoods, Ulta, Subway, First Watch', 'walden-park'),
]

function lease(
  id: string,
  property: string,
  tenant: string,
  status: 'Lease' | 'LOI',
  sfLabel: string,
  sf: number | null,
  baseRentLabel: string,
  baseRentLow: number | null,
  baseRentHigh: number | null,
  nnnLabel: string,
  nnn: number | null,
  tiLabel: string,
  ti: number | null,
  pointId: string,
): LeaseComp {
  return { id, property, tenant, status, sfLabel, sf, baseRentLabel, baseRentLow, baseRentHigh, nnnLabel, nnn, tiLabel, ti, pointId }
}

function sale(
  id: string,
  category: SaleCategory,
  property: string,
  city: string,
  address: string,
  sizeSf: number,
  saleDate: string,
  salePriceLabel: string,
  salePrice: number | null,
  psfLabel: string,
  psf: number | null,
  capRateLabel: string,
  capRate: number | null,
  occupancyLabel: string,
  occupancy: number | null,
  tenants: string,
  pointId: string,
): SaleComp {
  return { id, category, property, city, address, sizeSf, saleDate, salePriceLabel, salePrice, psfLabel, psf, capRateLabel, capRate, occupancyLabel, occupancy, tenants, pointId }
}

export const pointById = new Map(mapPoints.map((point) => [point.id, point]))

export function leaseRentMidpoint(comp: LeaseComp): number | null {
  if (comp.baseRentLow == null || comp.baseRentHigh == null) return null
  return (comp.baseRentLow + comp.baseRentHigh) / 2
}

export function formatNumber(value: number | null, maximumFractionDigits = 0): string {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
}
