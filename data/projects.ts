export interface ProjectItem {
  id: number;
  name: string;
  location: string;
  type: string;
  area: string;
  category: string;
  featured: boolean;
  image: string;
  client: string;
  year: string;
  description: string;
  specs: string[];
  gallery: string[];
}

export const projectsData: ProjectItem[] = [
  {
    id: 1,
    name: 'Grand Riviera Commercial Plaza',
    location: 'Gurugram, NCR',
    type: 'Turnkey Civil RCC Superstructure',
    area: '250,000 Sq.Ft.',
    category: 'Civil',
    featured: true,
    image: '/projects/proj1.jpg',
    client: 'DLF Commercial Developers',
    year: '2025',
    description: 'A 250,000 sq.ft state-of-the-art commercial plaza engineered from foundation to high-rise RCC superstructure. The project features heavy RCC post-tensioned slabs, bored piling foundations, AAC masonry, and IGBC Gold Green Building certification.',
    specs: [
      'RCC Superstructure with Post-Tensioned Slabs',
      'Deep Bored Piling & Retaining Foundation Walls',
      'AAC Masonry & Core Concrete Pumping',
      'IGBC Gold Green Building Certified',
      'Digital Measurement Book (MB) Reconciliation'
    ],
    gallery: [
      '/projects/proj1.jpg',
      '/projects/civil_gallery1.jpg',
      '/projects/civil.jpg',
      '/projects/proj5.jpg',
    ]
  },
  {
    id: 2,
    name: 'Sapphire Urban High-Rise Towers',
    location: 'Bengaluru',
    type: 'Civil RCC Superstructure',
    area: '380,000 Sq.Ft.',
    category: 'Civil',
    featured: true,
    image: '/projects/proj2.jpg',
    client: 'Prestige Infrastructure Ltd.',
    year: '2024',
    description: 'G+32 Story structural tower constructed with high-strength RCC M50 concrete, post-tensioned beam systems, bored piling foundation, and AAC masonry. Designed for seismic zone compliance with zero safety lost time incidents.',
    specs: [
      'G+32 Story Tower Structural Engineering',
      'Deep Bored Piling & Retaining Walls',
      'Digital Measurement Book (MB) Reconciliation',
      'Zero-Accident HSE Safety Record',
      'AAC Masonry & Core Concrete Pumping'
    ],
    gallery: [
      '/projects/proj2.jpg',
      '/projects/civil_gallery1.jpg',
      '/projects/civil.jpg',
      '/projects/proj1.jpg',
    ]
  },
  {
    id: 3,
    name: 'NEXUS Global Tech Headquarters',
    location: 'Noida, UP',
    type: 'Luxury Interior Fitout',
    area: '120,000 Sq.Ft.',
    category: 'Interior Fitout',
    featured: true,
    image: '/projects/proj3.jpg',
    client: 'NEXUS Software Technologies',
    year: '2025',
    description: 'Turnkey interior fitout for 1,200 software engineers incorporating acoustic baffled ceilings, Italian marble flooring, custom modular workstations, executive boardrooms, cafeteria hub, and smart IoT lighting controls.',
    specs: [
      '1,200 Workstation Modular Joinery',
      'CXO Executive Suites & Boardrooms',
      'Smart Motion Sensor Lighting & HVAC Integration',
      'Custom Veneer Acoustic Wall Cladding',
      'Italian Marble & Engineered Hardwood Flooring'
    ],
    gallery: [
      '/projects/proj3.jpg',
      '/projects/interior_gallery1.jpg',
      '/projects/interior.jpg',
      '/projects/proj7.jpg',
    ]
  },
  {
    id: 4,
    name: 'AeroCity Business Gateway Facade',
    location: 'New Delhi',
    type: 'Unitized Facade & Glazing',
    area: '95,000 Sq.Ft.',
    category: 'Exterior Facade',
    featured: false,
    image: '/projects/proj4.jpg',
    client: 'GMR Infrastructure',
    year: '2024',
    description: 'Iconic double-glazed unitized curtain wall facade engineered for airport proximity acoustic insulation (STC 45dB). Features PVDF-coated metallic ACP louvers, structural weather seals, and frameless entrance glass canopy.',
    specs: [
      'Unitized Double Glazed Glass Panels (28mm Low-E)',
      '4mm PVDF Coated ACP Metallic Louvers',
      'Structural Silicone Weather Seals',
      'Wind Tunnel Tested for 180 km/h Air Speeds',
      'Acoustic STC 45dB Airport Proximity Rating'
    ],
    gallery: [
      '/projects/proj4.jpg',
      '/projects/proj6.jpg',
      '/projects/facade.jpg',
      '/projects/proj4.jpg',
    ]
  },
  {
    id: 5,
    name: 'Vanguard Luxury Corporate Park',
    location: 'Hyderabad, Telangana',
    type: 'Heavy Civil Superstructure',
    area: '180,000 Sq.Ft.',
    category: 'Civil',
    featured: false,
    image: '/projects/proj5.jpg',
    client: 'Vanguard Realty Partners',
    year: '2024',
    description: 'Commercial corporate park featuring heavy RCC superstructure, deep foundation piling, post-tensioned floor plates, and integrated MEP infrastructure.',
    specs: [
      'Heavy RCC Frame & Post-Tensioned Floor Plates',
      'Deep Foundation Piling & Excavation',
      'Seismic Zone Resistant Structural Frame',
      'Central Utility Ducting & MEP Infrastructure'
    ],
    gallery: [
      '/projects/proj5.jpg',
      '/projects/civil_gallery1.jpg',
      '/projects/proj1.jpg',
      '/projects/civil.jpg',
    ]
  },
  {
    id: 6,
    name: 'Infinity Tech Park Glass Atrium',
    location: 'Pune, Maharashtra',
    type: 'Structural Glazing & Exterior Envelope',
    area: '110,000 Sq.Ft.',
    category: 'Exterior Facade',
    featured: false,
    image: '/projects/proj6.jpg',
    client: 'Infinity Spaces India',
    year: '2025',
    description: 'High-tech atrium glass facade featuring tensioned stainless steel spider glazing, frameless glass canopies, Low-E double glazing, and architectural sun louvers.',
    specs: [
      'Spider Glazing SS316 Tension Rod Assembly',
      'Laminated Frameless Glass Walkways & Canopy',
      'Solar Heat Gain Reduction Low-E Double Glazing',
      'Bespoke Metal Architectural Louver Fin'
    ],
    gallery: [
      '/projects/proj6.jpg',
      '/projects/proj4.jpg',
      '/projects/facade.jpg',
      '/projects/proj6.jpg',
    ]
  },
  {
    id: 7,
    name: 'Solitaire Executive CXO Suites & Club Lounge',
    location: 'Hyderabad, Telangana',
    type: 'Luxury Interior Fitout',
    area: '85,000 Sq.Ft.',
    category: 'Interior Fitout',
    featured: true,
    image: '/projects/proj7.jpg',
    client: 'Solitaire Capital Holdings',
    year: '2025',
    description: 'Ultra-luxury executive suite fitout featuring Italian Statuario marble floors, acoustical slat ceilings, custom brass inlay joinery, private CXO dining lounges, and integrated smart Lutron lighting controls.',
    specs: [
      'Italian Statuario Marble Flooring',
      'Acoustic Walnut Wood Slat Ceilings & Brass Inlay',
      'Custom CXO Boardroom Joinery & Dining Lounge',
      'Smart Motion Sensor Lutron Lighting Controls'
    ],
    gallery: [
      '/projects/proj7.jpg',
      '/projects/interior_gallery1.jpg',
      '/projects/proj3.jpg',
      '/projects/interior.jpg',
    ]
  },
  {
    id: 8,
    name: 'Aura Corporate Tech Innovation Hub',
    location: 'Bengaluru',
    type: 'Luxury Workplace Fitout',
    area: '140,000 Sq.Ft.',
    category: 'Interior Fitout',
    featured: false,
    image: '/projects/proj8.jpg',
    client: 'Aura Global Enterprises',
    year: '2024',
    description: 'Modern corporate tech campus fitout incorporating biophilic indoor planters, acoustic felt wall cladding, agile collaborative zones, cafeteria auditorium, and ergonomic workstation clusters.',
    specs: [
      'Biophilic Living Green Wall Planters',
      'Hexagonal Acoustic Felt Wall Cladding',
      'Agile Modular Collaboration Pods & Lounge',
      'Ergonomic Workstation Cluster Systems'
    ],
    gallery: [
      '/projects/proj8.jpg',
      '/projects/interior_gallery1.jpg',
      '/projects/proj7.jpg',
      '/projects/proj3.jpg',
    ]
  }
];
