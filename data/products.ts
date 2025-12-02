import { Product } from "../types";

export const PRODUCTS: Product[] = [
  // --- STARLINK ---
  {
    id: "sl-std-v4",
    name: "Starlink Standard Kit (Gen 3)",
    price: 8500,
    category: "Starlink",
    image: "https://images.unsplash.com/photo-1697558628043-410a56828519?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "The standard for high-speed, low-latency internet. Includes Kickstand, Gen 3 Router, and Cables.",
    features: ["Dual-band WiFi 6", "Weather Resistant", "Easy Self-Install"],
    stock: 25
  },
  {
    id: "sl-mini",
    name: "Starlink Mini Kit",
    price: 6200,
    category: "Starlink",
    image: "https://plus.unsplash.com/premium_photo-1682125177822-63c27a3830ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Compact, portable high-speed internet. Perfect for travel and mobile setups.",
    features: ["Ultra Portable", "Integrated WiFi", "DC Power Input"],
    stock: 10
  },

  // --- NEW PDF ITEMS: MESH & WIFI ---
  {
    id: "tplink-deco-m4",
    name: "Tp-Link Deco M4 (3 Pack)",
    price: 1550,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Whole Home Mesh Wi-Fi System (3-Pack) for seamless coverage up to 5,500 sq. ft.",
    features: ["AC1200 Dual-Band", "Seamless Roaming", "Connects 100+ Devices"],
    stock: 15
  },
  {
    id: "tplink-deco-x60",
    name: "Tp-Link Deco X60 AX3000",
    price: 7000,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1563770095-5198c1f4900c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Next-Gen Wi-Fi 6 Mesh System for high-speed, lag-free coverage throughout your home.",
    features: ["WiFi 6 Speeds", "OFDMA & MU-MIMO", "Enhanced Security"],
    stock: 8
  },
  {
    id: "tplink-re650",
    name: "Tp-Link RE650 Mesh Extender",
    price: 1130,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "AC2600 Wi-Fi Range Extender with 4 external antennas.",
    features: ["AC2600 Dual Band", "4-Stream", "Gigabit Ethernet Port"],
    stock: 20
  },

  // --- NEW PDF ITEMS: ROUTERS & APs ---
  {
    id: "dlink-n300",
    name: "D-Link N300 Router (DIR-612)",
    price: 240,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Wireless N300 Router, 2.4GHz, ideal for small homes and apartments.",
    features: ["300Mbps Speed", "Repeater Mode", "2 External Antennas"],
    stock: 50
  },
  {
    id: "tenda-ac10",
    name: "Tenda AC1200 Smart Router (AC10)",
    price: 299,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1563770095-5198c1f4900c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "AC1200 MU-MIMO Dual Band Gigabit Wi-Fi Router.",
    features: ["Dual Band", "4 Gigabit Ports", "High Gain Antennas"],
    stock: 40
  },
  {
    id: "grandstream-gwn7602",
    name: "Grandstream GWN7602 Access Point",
    price: 1000,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f1826?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Compact Wi-Fi Access Point with integrated ethernet switch for small businesses.",
    features: ["AC1200", "Integrated Switch", "Supports 80 Clients"],
    stock: 15
  },

  // --- NEW PDF ITEMS: SWITCHES & RACKS ---
  {
    id: "dlink-24-poe",
    name: "D-Link 24-Port Gigabit PoE Switch",
    price: 2700,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DGS-F1024P Unmanaged PoE Switch for powering IP cameras and APs.",
    features: ["24 Gigabit Ports", "250m PoE Range", "Plug & Play"],
    stock: 10
  },
  {
    id: "dlink-8-poe-managed",
    name: "D-Link 8-Port Gigabit Smart Managed",
    price: 1450,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DGS-F1100 Series Smart Managed PoE Switch.",
    features: ["8 PoE+ Ports", "VLAN Support", "Web Management"],
    stock: 12
  },
  {
    id: "tenda-24-gigabit",
    name: "Tenda 24-Port Gigabit Switch",
    price: 600,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "TEG1024G Ethernet Switch for high-speed data transfer.",
    features: ["24 Gigabit Ports", "Metal Housing", "Rack Mountable"],
    stock: 20
  },
  {
    id: "server-rack-27u",
    name: "AK 27U Server Rack Cabinet",
    price: 2700,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "600x800 Floor Standing Server Rack for professional equipment storage.",
    features: ["27U Height", "Glass Door", "Ventilated"],
    stock: 3
  },

  // --- NEW PDF ITEMS: CAMERAS & SECURITY ---
  {
    id: "hik-2mp-colorvu",
    name: "Hikvision 2MP ColorVu IP Camera",
    price: 550,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1589980757782-b75cb6e93892?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DS-2CD1027G2H-LIUF Full color night vision with 2-way audio.",
    features: ["ColorVu Technology", "2-Way Audio", "IP67 Weatherproof"],
    stock: 30
  },
  {
    id: "hik-4mp-acusense",
    name: "Hikvision 4MP AcuSense Bullet",
    price: 1450,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DS-2CD2T43G2-4L High performance camera with human/vehicle classification.",
    features: ["4MP Resolution", "AcuSense AI", "DarkFighter"],
    stock: 15
  },
  {
    id: "hik-solar-4g",
    name: "Hikvision 4MP Solar 4G Camera",
    price: 850,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DS-2CFS04 Standalone Solar Camera kit for remote monitoring.",
    features: ["Solar Powered", "4G LTE Support", "ColorVu"],
    stock: 10
  },
  {
    id: "tiandy-4mp-kit",
    name: "Tiandy 4MP IP PoE Audio Kit",
    price: 2400,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Complete 4MP IP Camera System kit with Audio recording.",
    features: ["4MP Resolution", "PoE NVR Included", "Audio Support"],
    stock: 5
  },
  {
    id: "dahua-2mp-analog",
    name: "Dahua 2MP Full Color Analog",
    price: 215,
    category: "CCTV Analog",
    image: "https://images.unsplash.com/photo-1563456073-42ebaf0d56dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DH-HAC-HDW1209TQP-A Eyeball camera with full-color night vision.",
    features: ["Full Color", "Built-in Mic", "CVI/TVI/AHD/CVBS"],
    stock: 40
  },
  {
    id: "hilook-intercom",
    name: "HiLook Analog Video Intercom",
    price: 740,
    category: "Security",
    image: "https://images.unsplash.com/photo-1558002038-1091a1661116?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "VL-K13P 4-Wire Analog Video Door Phone Kit.",
    features: ["7-inch Screen", "Door Station", "One-touch Call"],
    stock: 12
  },

  // --- NEW PDF ITEMS: OFFICE & OTHER ---
  {
    id: "epson-projector",
    name: "Epson LCD Projector (CO-W01)",
    price: 4500,
    category: "Office",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "3000 Lumens WXGA Projector for bright and clear presentations.",
    features: ["3000 Lumens", "WXGA Resolution", "HDMI"],
    stock: 5
  },
  {
    id: "epson-l1800",
    name: "Epson L1800 A3+ Photo Printer",
    price: 13500,
    category: "Office",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-quality 6-color A3+ photo printer with ink tank system.",
    features: ["A3+ Printing", "6-Color Ink", "High Yield"],
    stock: 2
  },
  {
    id: "takoma-battery",
    name: "Takoma 12V 55AH Battery",
    price: 750,
    category: "Power",
    image: "https://images.unsplash.com/photo-1620059596365-d6d48c084776?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "13 Plate Car/Inverter Battery for backup power solutions.",
    features: ["12V 55AH", "Maintenance Free", "High Durability"],
    stock: 20
  },
  {
    id: "ak-cat6-outdoor",
    name: "AK High Quality Cat6 Outdoor",
    price: 645,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1626162983690-e5d263309a90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "305m SFTP Networking Cable designed for outdoor use.",
    features: ["SFTP Shielded", "305m Roll", "Weatherproof"],
    stock: 60
  },

  // --- ROUTERS & ACCESS POINTS (EXISTING) ---
  {
    id: "mikrotik-hex",
    name: "MikroTik hEX RB750Gr3",
    price: 950,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Gigabit Ethernet router with 5 ports, dual core 880MHz CPU, 256MB RAM.",
    features: ["5 Gigabit Ports", "RouterOS", "Hardware Encryption"],
    stock: 15
  },
  {
    id: "mikrotik-hap-ac2",
    name: "MikroTik hAP ac2",
    price: 1200,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1621905251189-08b95d6c2a81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Dual-concurrent Access Point with 5 Gigabit ports and USB support.",
    features: ["Dual-Band WiFi", "IPsec Support", "Tower Case"],
    stock: 20
  },
  {
    id: "ubiquiti-ac-lite",
    name: "Ubiquiti UniFi AC Lite AP",
    price: 1600,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Compact dual-band 802.11ac Wi-Fi Access Point for indoor use.",
    features: ["2x2 MIMO", "Gigabit Ethernet", "UniFi Controller"],
    stock: 30
  },
  {
    id: "ubiquiti-litebeam-m5",
    name: "Ubiquiti LiteBeam M5 (PTP)",
    price: 900,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f1826?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Long-range, lightweight airMAX CPE for Point-to-Point connections.",
    features: ["23dBi Gain", "Directional Antenna", "Outdoor Rated"],
    stock: 12
  },
  {
    id: "ubiquiti-powerbeam",
    name: "Ubiquiti PowerBeam (PTMP)",
    price: 1450,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f1826?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-performance airMAX bridge for Point-to-MultiPoint networks.",
    features: ["High Isolation", "Noise Immunity", "Long Range"],
    stock: 8
  },
  {
    id: "wavelink-router",
    name: "Wavelink AC1200 Router",
    price: 550,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1563770095-5198c1f4900c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Dual-band smart WiFi router for home and small office coverage.",
    features: ["1200Mbps Speed", "4 External Antennas", "Easy Setup"],
    stock: 40
  },
  {
    id: "mesh-router-sys",
    name: "Whole Home Mesh WiFi System",
    price: 1800,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Seamless roaming mesh system (pack of 3) to eliminate dead zones.",
    features: ["3000 sq ft Coverage", "App Control", "Parental Controls"],
    stock: 10
  },

  // --- CABLES (EXISTING) ---
  {
    id: "cat6-in-305",
    name: "Cat6 Indoor Cable (305m)",
    price: 1200,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1599394600213-9aa6c669d045?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Pure copper 305m roll for high-speed Gigabit networking indoors.",
    features: ["Solid Copper", "UTP", "Grey Jacket"],
    stock: 100
  },
  {
    id: "cat6-in-100",
    name: "Cat6 Indoor Cable (100m)",
    price: 450,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1599394600213-9aa6c669d045?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "100m Cat6 UTP cable suitable for smaller indoor installations.",
    features: ["Pure Copper", "Gigabit Ready", "Flexible"],
    stock: 50
  },
  {
    id: "cat6-out-305",
    name: "Cat6 Outdoor Cable (305m)",
    price: 1600,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1626162983690-e5d263309a90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Double-jacketed 305m Cat6 cable designed for harsh outdoor weather.",
    features: ["UV Resistant", "Waterproof", "Heavy Duty"],
    stock: 80
  },
  {
    id: "cat6-out-100",
    name: "Cat6 Outdoor Cable (100m)",
    price: 600,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1626162983690-e5d263309a90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "100m heavy duty outdoor networking cable.",
    features: ["UV Resistant", "Weatherproof", "Durable"],
    stock: 40
  },
  {
    id: "coax-305",
    name: "Coaxial Cable RG59+Power (305m)",
    price: 850,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-grade RG59 coaxial cable with attached power line for CCTV.",
    features: ["Composite Cable", "Low Loss", "Shotgun Type"],
    stock: 60
  },
  {
    id: "coax-100",
    name: "Coaxial Cable RG59+Power (100m)",
    price: 350,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "100m roll of RG59 coaxial cable with power for analog cameras.",
    features: ["Easy Install", "Copper Clad", "Black Jacket"],
    stock: 40
  },

  // --- CONNECTORS & ACCESSORIES ---
  {
    id: "rj45-connectors",
    name: "RJ45 Connectors (Pack of 100)",
    price: 150,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1616440263632-47496e628469?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-quality Cat6 RJ45 pass-through connectors.",
    features: ["Gold Plated", "Pass-Through", "100 Pcs"],
    stock: 200
  },
  {
    id: "bnc-connectors",
    name: "BNC Connectors (Pack of 10)",
    price: 80,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1588699478493-24285746b52d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Screw-type BNC connectors for CCTV coaxial cables.",
    features: ["No Soldering", "Secure Fit", "10 Pcs"],
    stock: 150
  },
  {
    id: "dc-male",
    name: "DC Power Male Connectors (Pack of 10)",
    price: 50,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1623938561144-8d264560412a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Male DC pigtail or screw terminal connectors for camera power.",
    features: ["Standard 2.1mm", "Screw Terminal", "10 Pcs"],
    stock: 150
  },
  {
    id: "dc-female",
    name: "DC Power Female Connectors (Pack of 10)",
    price: 50,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1623938561144-8d264560412a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Female DC power adapter connectors.",
    features: ["Standard 2.1mm", "Screw Terminal", "10 Pcs"],
    stock: 150
  },

  // --- POWER SUPPLIES ---
  {
    id: "psu-4ch",
    name: "4-Channel CCTV Power Box (12V 5A)",
    price: 250,
    category: "Power",
    image: "https://images.unsplash.com/photo-1620059596365-d6d48c084776?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Metal fused power supply box for up to 4 cameras.",
    features: ["Individual Fuses", "Key Lock", "12V 5A Output"],
    stock: 40
  },
  {
    id: "psu-8ch",
    name: "8-Channel CCTV Power Box (12V 10A)",
    price: 450,
    category: "Power",
    image: "https://images.unsplash.com/photo-1620059596365-d6d48c084776?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Robust power supply for medium size CCTV installations.",
    features: ["8 Ports", "Surge Protection", "12V 10A Output"],
    stock: 35
  },
  {
    id: "psu-16ch",
    name: "16-Channel CCTV Power Box (12V 20A)",
    price: 750,
    category: "Power",
    image: "https://images.unsplash.com/photo-1620059596365-d6d48c084776?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Heavy duty power distribution for large camera systems.",
    features: ["16 Ports", "Active Cooling", "12V 20A Output"],
    stock: 20
  },

  // --- CCTV IP CAMERAS (EXISTING) ---
  {
    id: "ip-cam-2mp-in",
    name: "2MP Indoor IP Dome Camera",
    price: 450,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1589980757782-b75cb6e93892?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Full HD PoE Dome camera for office and home interiors. Ceiling mount.",
    features: ["1080p Resolution", "Night Vision (20m)", "PoE Support"],
    stock: 50
  },
  {
    id: "ip-cam-4mp-in",
    name: "4MP QHD Indoor IP Camera",
    price: 680,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-resolution 4MP indoor camera with superior clarity and audio recording.",
    features: ["4MP QHD", "Two-way Audio", "Smart Motion Detection"],
    stock: 40
  },
  {
    id: "ip-cam-2mp-out",
    name: "2MP Outdoor IP Bullet Camera",
    price: 550,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Weatherproof bullet camera designed for outdoor surveillance.",
    features: ["IP67 Weatherproof", "30m Night Vision", "Remote Viewing"],
    stock: 45
  },
  {
    id: "ip-cam-4mp-out",
    name: "4MP Outdoor IP Bullet Camera",
    price: 850,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Crystal clear 4MP outdoor security with extended IR range.",
    features: ["4MP Resolution", "Exir Night Vision", "Metal Housing"],
    stock: 35
  },

  // --- CCTV ANALOG CAMERAS (EXISTING) ---
  {
    id: "ana-cam-2mp",
    name: "2MP Analog HD Camera",
    price: 280,
    category: "CCTV Analog",
    image: "https://images.unsplash.com/photo-1563456073-42ebaf0d56dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Standard Turbo HD camera compatible with most DVRs.",
    features: ["1080p HD", "Day/Night Switch", "Coaxial Transmission"],
    stock: 100
  },
  {
    id: "ana-cam-5mp",
    name: "5MP Analog HD Camera",
    price: 380,
    category: "CCTV Analog",
    image: "https://images.unsplash.com/photo-1585237775199-6e3e4a945dce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High definition analog camera for sharper details over coax.",
    features: ["5MP Resolution", "Smart IR", "Wide Angle"],
    stock: 60
  },

  // --- NVRs (Network Video Recorders) ---
  {
    id: "nvr-4ch-poe",
    name: "4-Channel PoE NVR",
    price: 1100,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Plug-and-play NVR with 4 built-in PoE ports for IP cameras.",
    features: ["4K Output", "4 PoE Interfaces", "H.265+ Compression"],
    stock: 20
  },
  {
    id: "nvr-8ch-poe",
    name: "8-Channel PoE NVR",
    price: 1850,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Professional 8-channel recorder handling up to 8MP cameras.",
    features: ["8 PoE Interfaces", "Dual HDD Support", "Remote App Access"],
    stock: 15
  },
  {
    id: "nvr-16ch-poe",
    name: "16-Channel PoE NVR",
    price: 3200,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1563770095-5198c1f4900c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Enterprise grade 16-channel NVR for large installations.",
    features: ["16 PoE Interfaces", "Rack Mountable", "Smart Analytics"],
    stock: 8
  },
  {
    id: "nvr-12ch-std",
    name: "12/16-Channel NVR (Non-PoE)",
    price: 1400,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Cost-effective recorder for cameras connected via external switch.",
    features: ["Supports 12-16 Cameras", "Gigabit LAN", "HDMI/VGA"],
    stock: 10
  },

  // --- DVRs (Digital Video Recorders) ---
  {
    id: "dvr-4ch",
    name: "4-Channel 1080p DVR",
    price: 650,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Compact DVR for small analog camera setups.",
    features: ["1080p Lite", "Motion Detection", "H.265"],
    stock: 30
  },
  {
    id: "dvr-8ch",
    name: "8-Channel 5MP DVR",
    price: 1200,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Versatile 8-channel DVR supporting HD-TVI/AHD/CVI cameras.",
    features: ["5MP Supported", "Smartphone View", "Audio over Coax"],
    stock: 25
  },
  {
    id: "dvr-16ch",
    name: "16-Channel Professional DVR",
    price: 2100,
    category: "Recorders",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "High-capacity DVR for extensive analog surveillance systems (Fits 12-16 cams).",
    features: ["16 Channels", "2 SATA Interfaces", "Long Distance Trans."],
    stock: 12
  },
  
  // --- SWITCHES ---
  {
    id: "net-switch-8",
    name: "Gigabit Switch 8-Port PoE",
    price: 950,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Power over Ethernet switch to power your IP cameras and Access Points.",
    features: ["8 Gigabit Ports", "4 PoE+ Ports", "Plug and Play"],
    stock: 20
  }
];