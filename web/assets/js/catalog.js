/* ============================================================
   OpenSpotAuto — catalogue des voitures & tiers de rareté
   Source de vérité pour le score : chaque modèle est associé à
   un tier de rareté (commun → mythique) qui fixe ses points.
   Couverture centrée marché européen (~45 marques, ~500 modèles).
   ============================================================ */

const TIERS = [
  { id: "commun",      label: "Commun",      points: 10,   rank: 0, short: "C" },
  { id: "peu-commun",  label: "Peu commun",  points: 30,   rank: 1, short: "PC" },
  { id: "rare",        label: "Rare",        points: 80,   rank: 2, short: "R" },
  { id: "epique",      label: "Épique",      points: 220,  rank: 3, short: "E" },
  { id: "legendaire",  label: "Légendaire",  points: 600,  rank: 4, short: "L" },
  { id: "mythique",    label: "Mythique",    points: 1800, rank: 5, short: "M" },
];

const CATALOG = [
  { brand: "Abarth", country: "Italie", models: {
    "500 / 595": "peu-commun", "695": "rare", "124 Spider": "rare",
    "Grande Punto": "rare", "1000 / nouvelle 500e": "rare",
  }},
  { brand: "Alfa Romeo", country: "Italie", models: {
    "MiTo": "peu-commun", "Giulietta": "peu-commun", "Giulia": "rare",
    "Giulia Quadrifoglio": "epique", "Stelvio": "peu-commun",
    "Stelvio Quadrifoglio": "epique", "Tonale": "peu-commun",
    "Junior": "commun", "4C": "epique", "8C Competizione": "legendaire",
    "GTV / Spider (916)": "rare", "156 GTA": "rare", "147 GTA": "rare",
    "159": "peu-commun", "Brera": "rare", "Montreal": "legendaire",
    "SZ / RZ": "legendaire", "GTV6": "epique", "Spider Duetto": "epique",
    "Alfetta": "rare", "33 Stradale": "mythique",
  }},
  { brand: "Alpine", country: "France", models: {
    "A110": "rare", "A110 S / GT / R": "epique", "A290": "rare",
    "A310": "epique", "A610": "epique", "A110 berlinette (1973)": "legendaire",
  }},
  { brand: "Aston Martin", country: "Royaume-Uni", models: {
    "DB7": "rare", "DB9": "legendaire", "DB11": "legendaire",
    "DB12": "legendaire", "DBS": "legendaire", "Vantage": "legendaire",
    "Vanquish": "legendaire", "DBX": "epique", "Rapide": "epique",
    "Valkyrie": "mythique", "Valhalla": "mythique", "One-77": "mythique",
    "Cygnet": "legendaire", "Virage": "legendaire",
  }},
  { brand: "Audi", country: "Allemagne", models: {
    "A1": "commun", "A3 / S3": "commun", "A4 / S4": "commun",
    "A5 / S5": "peu-commun", "A6 / S6": "peu-commun", "A7 / S7": "peu-commun",
    "A8 / S8": "rare", "Q2": "commun", "Q3": "commun", "Q4 e-tron": "commun",
    "Q5": "commun", "Q7": "peu-commun", "Q8": "peu-commun",
    "TT": "peu-commun", "TT RS": "rare", "RS3": "rare", "RS4": "epique",
    "RS5": "epique", "RS6 / RS6 GT": "epique", "RS7": "epique",
    "RS Q3": "rare", "SQ7 / SQ8": "rare", "R8": "legendaire",
    "e-tron GT": "rare", "S1": "rare", "RS2 Avant": "legendaire",
    "Sport Quattro": "legendaire", "Quattro (Ur-Quattro)": "legendaire",
    "80 / 90 / 100": "peu-commun", "200 Turbo": "rare", "V8": "rare",
  }},
  { brand: "Bentley", country: "Royaume-Uni", models: {
    "Continental GT": "legendaire", "Bentayga": "epique",
    "Flying Spur": "legendaire", "Mulsanne": "legendaire",
    "Arnage": "legendaire", "Brooklands": "legendaire", "Batur": "mythique",
  }},
  { brand: "BMW", country: "Allemagne", models: {
    "Série 1": "commun", "Série 2": "commun", "Série 3": "commun",
    "Série 4": "peu-commun", "Série 5": "peu-commun", "Série 7": "rare",
    "Série 8": "rare", "X1": "commun", "X2": "commun", "X3": "commun",
    "X4": "peu-commun", "X5": "peu-commun", "X6": "peu-commun",
    "X7": "rare", "Z3": "rare", "Z4": "rare", "Z8": "mythique",
    "i3": "commun", "i4": "peu-commun", "i7": "rare", "i8": "rare",
    "iX": "peu-commun", "M2": "rare", "M2 CS": "legendaire",
    "M3": "epique", "M4": "epique", "M5": "epique", "M8": "epique",
    "X3 M / X4 M": "rare", "X5 M / X6 M": "rare", "1M": "legendaire",
    "M3 E30": "legendaire", "M3 E36": "rare", "M3 E46": "epique",
    "M3 CSL (E46)": "legendaire", "M5 E39": "epique", "M5 E60 V10": "epique",
    "M1": "mythique", "3.0 CSL": "mythique", "2002 Turbo": "legendaire",
    "850 CSi": "epique", "Z4 M": "epique", "635 CSi": "rare",
  }},
  { brand: "Bugatti", country: "France", models: {
    "Veyron": "mythique", "Chiron": "mythique", "Divo": "mythique",
    "Bolide": "mythique", "Tourbillon": "mythique", "EB110": "mythique",
    "Type 35 / ancienne": "mythique",
  }},
  { brand: "Caterham", country: "Royaume-Uni", models: {
    "Seven": "rare",
  }},
  { brand: "Chevrolet", country: "États-Unis", models: {
    "Spark / Aveo / Cruze": "commun", "Camaro": "rare",
    "Camaro ZL1": "epique", "Corvette C5 / C6": "epique",
    "Corvette C7": "legendaire", "Corvette C8": "legendaire",
    "Corvette Z06 / ZR1": "mythique", "Corvette classique (C1-C3)": "legendaire",
    "Silverado": "rare",
  }},
  { brand: "Citroën", country: "France", models: {
    "C1": "commun", "C3": "commun", "C3 Aircross": "commun",
    "C4 / C4 X": "commun", "C5 Aircross": "commun", "C5 X": "peu-commun",
    "Berlingo": "commun", "Ami": "peu-commun", "DS3": "peu-commun",
    "DS3 Racing": "rare", "DS4 / DS5": "peu-commun", "2CV": "peu-commun",
    "Méhari": "rare", "Dyane": "rare", "GS / GSA": "rare", "CX": "rare",
    "XM": "rare", "C6": "rare", "DS (1955)": "rare", "SM": "legendaire",
    "BX 4TC": "legendaire", "Visa 1000 Pistes": "legendaire",
    "ZX Rallye Raid": "legendaire", "Xantia Activa": "rare",
    "Saxo VTS": "peu-commun", "Xsara VTS": "peu-commun",
  }},
  { brand: "Cupra", country: "Espagne", models: {
    "Formentor": "peu-commun", "Leon": "peu-commun", "Born": "peu-commun",
    "Ateca": "commun", "Tavascan": "rare",
  }},
  { brand: "Dacia", country: "Roumanie", models: {
    "Sandero": "commun", "Duster": "commun", "Jogger": "commun",
    "Spring": "commun", "Logan": "commun", "Bigster": "commun",
    "1300 / ancienne": "rare",
  }},
  { brand: "DeLorean", country: "États-Unis", models: {
    "DMC-12": "legendaire",
  }},
  { brand: "Dodge", country: "États-Unis", models: {
    "Challenger": "rare", "Challenger Hellcat / Demon": "epique",
    "Charger": "rare", "Viper": "legendaire", "RAM": "rare",
    "Dart / Nitro / Journey": "peu-commun",
  }},
  { brand: "DS Automobiles", country: "France", models: {
    "DS 3": "commun", "DS 4": "peu-commun", "DS 7": "peu-commun",
    "DS 9": "rare", "N°8": "rare",
  }},
  { brand: "Ferrari", country: "Italie", models: {
    "Roma": "legendaire", "296 GTB": "legendaire", "SF90": "legendaire",
    "458 Italia": "legendaire", "488": "legendaire", "F8": "legendaire",
    "812 Superfast": "legendaire", "Portofino": "legendaire",
    "California": "epique", "FF / GTC4Lusso": "legendaire",
    "F12 Berlinetta": "legendaire", "599 GTB": "legendaire",
    "F430": "legendaire", "360 Modena": "epique", "355": "epique",
    "348": "epique", "Testarossa": "mythique", "550 / 575 Maranello": "epique",
    "Mondial": "epique", "308 / 328": "legendaire", "Purosangue": "mythique",
    "LaFerrari": "mythique", "Enzo": "mythique", "F50": "mythique",
    "F40": "mythique", "288 GTO": "mythique", "250 GTO / classique": "mythique",
    "Dino 246": "mythique", "Daytona SP3": "mythique", "F80": "mythique",
  }},
  { brand: "Fiat", country: "Italie", models: {
    "500": "commun", "500e": "commun", "Panda": "commun",
    "Punto / Grande Punto": "commun", "Tipo": "commun", "500L": "commun",
    "500X": "commun", "600": "commun", "Doblò": "commun",
    "124 Spider": "rare", "Coupé (1993)": "rare", "Barchetta": "rare",
    "Multipla": "peu-commun", "X1/9": "rare", "Dino": "legendaire",
    "131 Abarth": "legendaire", "Uno Turbo": "rare", "Panda 4x4": "peu-commun",
    "500 (1957)": "rare", "600 (1955)": "peu-commun",
  }},
  { brand: "Ford", country: "États-Unis", models: {
    "Fiesta": "commun", "Focus": "commun", "Puma": "commun",
    "Kuga": "commun", "Ka / Ka+": "commun", "EcoSport": "commun",
    "Mondeo": "commun", "C-Max": "commun", "Explorer": "peu-commun",
    "Tourneo / Transit": "commun", "Ranger": "peu-commun",
    "Ranger Raptor": "rare", "Mustang": "rare", "Mustang GT": "rare",
    "Mustang Shelby GT500 / Dark Horse": "epique", "Mach-E": "peu-commun",
    "Fiesta ST": "peu-commun", "Focus ST": "peu-commun",
    "Focus RS": "epique", "Fiesta XR2 / ancienne sportive": "rare",
    "Escort RS Turbo / Cosworth": "legendaire", "Sierra Cosworth": "legendaire",
    "GT": "mythique", "GT40": "mythique", "RS200": "mythique",
    "Thunderbird": "rare", "F-150": "rare", "Bronco": "rare",
  }},
  { brand: "Honda", country: "Japon", models: {
    "Jazz": "commun", "Civic": "commun", "HR-V": "commun",
    "CR-V": "commun", "ZR-V": "commun", "Accord": "peu-commun",
    "e": "peu-commun", "Civic Type R": "epique", "Integra Type R": "legendaire",
    "S2000": "epique", "NSX": "legendaire", "NSX (2016)": "epique",
    "Prelude": "rare", "CRX / CR-Z": "rare", "S660 / Beat": "rare",
  }},
  { brand: "Hummer", country: "États-Unis", models: {
    "H1": "epique", "H2": "epique", "H3": "rare", "EV": "legendaire",
  }},
  { brand: "Hyundai", country: "Corée", models: {
    "i10": "commun", "i20": "commun", "i30": "commun", "Tucson": "commun",
    "Kona": "commun", "Bayon": "commun", "Santa Fe": "commun",
    "Ioniq": "commun", "Ioniq 5": "peu-commun", "Ioniq 6": "peu-commun",
    "i20 N": "rare", "i30 N": "rare", "Kona N": "rare",
    "Ioniq 5 N": "epique", "Genesis Coupé": "rare",
  }},
  { brand: "Jaguar", country: "Royaume-Uni", models: {
    "E-Pace": "commun", "F-Pace": "peu-commun", "I-Pace": "peu-commun",
    "XE": "peu-commun", "XF": "peu-commun", "XJ": "rare",
    "F-Type": "epique", "XK / XKR": "rare", "XJS": "rare",
    "E-Type": "mythique", "XJ220": "mythique", "XK120 / XK140": "legendaire",
    "Mk2": "legendaire", "F-Type SVR / Project 7": "legendaire",
  }},
  { brand: "Jeep", country: "États-Unis", models: {
    "Renegade": "commun", "Compass": "commun", "Avenger": "commun",
    "Cherokee": "peu-commun", "Grand Cherokee": "peu-commun",
    "Wrangler": "peu-commun", "Gladiator": "rare", "Willys / CJ": "rare",
  }},
  { brand: "Kia", country: "Corée", models: {
    "Picanto": "commun", "Rio": "commun", "Stonic": "commun",
    "Ceed / ProCeed": "commun", "Sportage": "commun", "Niro": "commun",
    "Sorento": "commun", "EV3 / EV6": "peu-commun", "EV9": "rare",
    "Stinger": "rare", "EV6 GT": "epique",
  }},
  { brand: "Koenigsegg", country: "Suède", models: {
    "Jesko": "mythique", "Regera": "mythique", "Gemera": "mythique",
    "Agera / CCX": "mythique",
  }},
  { brand: "Lamborghini", country: "Italie", models: {
    "Huracán": "legendaire", "Aventador": "legendaire",
    "Aventador SV / SVJ": "mythique", "Revuelto": "mythique",
    "Temerario": "legendaire", "Urus": "epique", "Gallardo": "epique",
    "Murciélago": "mythique", "Diablo": "mythique", "Countach": "mythique",
    "Miura": "mythique", "Espada": "legendaire", "Urraco / Jalpa": "legendaire",
    "Sián / Centenario": "mythique", "LM002": "legendaire",
  }},
  { brand: "Lancia", country: "Italie", models: {
    "Ypsilon": "commun", "Delta": "rare", "Delta Integrale HF": "legendaire",
    "Fulvia": "rare", "Thema 8.32": "legendaire", "Aurelia": "legendaire",
    "Flaminia": "epique", "Beta Montecarlo": "rare", "Stratos": "mythique",
    "037": "mythique", "Delta S4": "mythique",
  }},
  { brand: "Land Rover", country: "Royaume-Uni", models: {
    "Defender (ancien)": "peu-commun", "Defender (2020+)": "rare",
    "Discovery": "peu-commun", "Discovery Sport": "commun",
    "Freelander": "commun", "Range Rover": "epique",
    "Range Rover Sport": "peu-commun", "Range Rover Evoque": "commun",
    "Range Rover Velar": "peu-commun", "Range Rover SV": "legendaire",
    "Series I-III": "rare",
  }},
  { brand: "Lexus", country: "Japon", models: {
    "CT": "commun", "UX": "commun", "NX": "peu-commun", "RX": "peu-commun",
    "ES": "peu-commun", "IS": "rare", "RC / RC F": "rare", "LC 500": "epique",
    "LS": "rare", "GS / GS F": "epique", "SC 430": "rare", "LFA": "mythique",
  }},
  { brand: "Lotus", country: "Royaume-Uni", models: {
    "Elise": "epique", "Exige": "epique", "Evora": "epique",
    "Emira": "epique", "Esprit": "legendaire", "Elan": "rare",
    "Europa / Excel": "rare", "Eletre": "rare", "Emeya": "rare",
    "Evija": "mythique",
  }},
  { brand: "Maserati", country: "Italie", models: {
    "Ghibli": "rare", "Levante": "rare", "Grecale": "rare",
    "Quattroporte": "rare", "GranTurismo": "epique", "GranCabrio": "epique",
    "MC20": "legendaire", "3200 GT / 4200 GT": "rare", "Spyder": "rare",
    "Biturbo": "rare", "Shamal": "legendaire", "Bora / Merak": "legendaire",
    "MC12": "mythique", "Ghibli (1967)": "legendaire",
  }},
  { brand: "Mazda", country: "Japon", models: {
    "2": "commun", "3": "commun", "6": "commun", "CX-3": "commun",
    "CX-30": "commun", "CX-5": "commun", "CX-60": "peu-commun",
    "MX-30": "peu-commun", "MX-5": "peu-commun", "RX-8": "rare",
    "RX-7": "legendaire", "323 GTR": "rare", "Cosmo": "epique",
  }},
  { brand: "McLaren", country: "Royaume-Uni", models: {
    "570S / 570GT": "legendaire", "600LT": "legendaire",
    "720S": "legendaire", "765LT": "legendaire", "750S": "legendaire",
    "Artura": "legendaire", "GT": "legendaire", "12C": "epique",
    "Senna": "mythique", "P1": "mythique", "Speedtail": "mythique",
    "Elva": "mythique", "F1": "mythique", "Solus GT": "mythique",
  }},
  { brand: "Mercedes-Benz", country: "Allemagne", models: {
    "Classe A": "commun", "CLA": "commun", "Classe B": "commun",
    "Classe C": "commun", "Classe E": "peu-commun", "Classe S": "rare",
    "GLA": "commun", "GLB": "commun", "GLC": "commun", "GLE": "peu-commun",
    "GLS": "rare", "EQA / EQB": "peu-commun", "EQE / EQS": "rare",
    "Classe G": "epique", "Sprinter / Vito": "commun", "Classe V": "commun",
    "SLK / SLC": "rare", "SL": "epique", "AMG A 35 / A 45": "rare",
    "AMG C 43 / C 63": "epique", "AMG E 53 / E 63": "epique",
    "AMG GT": "legendaire", "AMG GT Black Series": "mythique",
    "SLS AMG": "legendaire", "AMG One": "mythique", "300 SL": "mythique",
    "SLR McLaren": "mythique", "CLK GTR": "mythique",
    "190 E 2.5-16 Evo": "legendaire", "500 E": "epique",
    "Classe X": "rare", "Pagode (W113)": "legendaire", "600 Grosser": "mythique",
  }},
  { brand: "Mini", country: "Royaume-Uni", models: {
    "Cooper / One": "commun", "Countryman": "commun", "Clubman": "peu-commun",
    "Cooper S": "peu-commun", "John Cooper Works": "rare",
    "Mini ancienne (Austin)": "peu-commun", "GP": "epique",
    "Coupé / Roadster": "rare",
  }},
  { brand: "Mitsubishi", country: "Japon", models: {
    "ASX": "commun", "Eclipse Cross": "commun", "Outlander": "commun",
    "Space Star": "commun", "Colt": "commun", "Pajero": "peu-commun",
    "L200": "commun", "i-MiEV": "commun", "Lancer Evolution": "epique",
    "3000 GT": "epique", "Eclipse (1990)": "rare", "FTO": "rare",
    "Starion": "rare", "Pajero Evolution": "legendaire",
  }},
  { brand: "Nissan", country: "Japon", models: {
    "Micra": "commun", "Juke": "commun", "Qashqai": "commun",
    "Note": "commun", "Leaf": "commun", "X-Trail": "commun",
    "Pulsar": "commun", "Ariya": "peu-commun", "Navara": "peu-commun",
    "Patrol": "peu-commun", "350Z": "rare", "370Z": "rare", "Z (RZ34)": "rare",
    "GT-R": "legendaire", "Skyline R32": "legendaire",
    "Skyline R33": "epique", "Skyline R34": "mythique",
    "Silvia S13/S14/S15": "epique", "Figaro": "rare", "Cube": "rare",
    "240Z / 280Z": "legendaire", "Pixo": "commun",
  }},
  { brand: "Opel", country: "Allemagne", models: {
    "Corsa": "commun", "Astra": "commun", "Mokka": "commun",
    "Crossland": "commun", "Grandland": "commun", "Insignia": "commun",
    "Karl / Adam": "commun", "Frontera": "commun", "Astra GTC / OPC": "peu-commun",
    "GT (2007)": "rare", "GT (1968)": "epique", "Speedster": "epique",
    "Manta": "rare", "Kadett": "peu-commun", "Calibra": "rare",
    "Monza / Senator": "rare",
  }},
  { brand: "Pagani", country: "Italie", models: {
    "Zonda": "mythique", "Huayra": "mythique", "Utopia": "mythique",
  }},
  { brand: "Peugeot", country: "France", models: {
    "108": "commun", "206 / 207": "commun", "208": "commun",
    "306 / 307": "commun", "308": "commun", "2008": "commun",
    "3008": "commun", "5008": "commun", "408": "commun", "508": "peu-commun",
    "Partner / Rifter": "commun", "205": "peu-commun", "205 GTI": "epique",
    "205 T16": "legendaire", "206 CC / 206 RC": "rare",
    "306 S16 / GTi-6": "rare", "406 Coupé": "rare", "RCZ": "rare",
    "RCZ R": "epique", "308 GTi": "peu-commun", "504 Coupé": "legendaire",
    "504 berline": "peu-commun", "505 Turbo / V6": "rare",
    "604 / 605 / 607": "rare", "106 Rallye / S16": "rare",
    "405 T16": "epique", "9X8 Hypercar": "mythique", "Onyx (concept)": "mythique",
  }},
  { brand: "Polestar", country: "Suède", models: {
    "Polestar 2": "peu-commun", "Polestar 3": "rare", "Polestar 4": "rare",
    "Polestar 1": "legendaire",
  }},
  { brand: "Porsche", country: "Allemagne", models: {
    "Macan": "peu-commun", "Cayenne": "peu-commun", "718 Cayman": "rare",
    "718 Boxster": "rare", "Cayman GT4 / Boxster Spyder": "legendaire",
    "911 Carrera": "epique", "911 Carrera S / GTS": "epique",
    "911 Turbo / Turbo S": "legendaire", "911 GT3": "legendaire",
    "911 GT3 RS": "legendaire", "911 GT2 RS": "mythique",
    "911 classique (964/993/996/997)": "epique", "911 (1970-80)": "legendaire",
    "911 Dakar / Sport Classic": "mythique", "Taycan": "rare",
    "Taycan Turbo GT": "legendaire", "Panamera": "rare",
    "924 / 944 / 968": "rare", "928": "rare", "356": "legendaire",
    "918 Spyder": "mythique", "Carrera GT": "mythique", "959": "mythique",
    "550 Spyder": "mythique", "718 RSK / ancienne course": "mythique",
  }},
  { brand: "Renault", country: "France", models: {
    "Clio": "commun", "Captur": "commun", "Mégane": "commun",
    "Austral": "commun", "Scénic": "commun", "Twingo": "commun",
    "Zoe": "commun", "Arkana": "commun", "R5 électrique": "commun",
    "Rafale": "commun", "Kangoo": "commun", "Trafic": "commun",
    "Espace": "peu-commun", "Laguna": "commun", "4L": "peu-commun",
    "Twizy": "peu-commun", "Mégane RS": "epique", "Clio RS": "rare",
    "Clio Williams": "legendaire", "Clio V6": "legendaire",
    "5 Turbo / Turbo 2": "legendaire", "R5 Turbo 3E": "mythique",
    "Alpine A110 (Renault)": "legendaire", "Spider": "legendaire",
    "Safrane Biturbo": "epique", "21 Turbo": "rare", "R8 Gordini": "epique",
    "R12 Gordini": "epique", "Avantime": "rare", "Vel Satis": "peu-commun",
    "Wind": "rare", "Fluence ZE": "peu-commun", "17 (1971)": "rare",
  }},
  { brand: "Rimac", country: "Croatie", models: {
    "Nevera": "mythique", "Concept One": "mythique",
  }},
  { brand: "Rolls-Royce", country: "Royaume-Uni", models: {
    "Phantom": "legendaire", "Ghost": "legendaire", "Wraith": "legendaire",
    "Dawn": "legendaire", "Cullinan": "legendaire", "Spectre": "legendaire",
    "Silver Shadow / ancienne": "legendaire", "Corniche": "mythique",
  }},
  { brand: "Saab", country: "Suède", models: {
    "9-3": "peu-commun", "9-5": "peu-commun", "900": "peu-commun",
    "900 Turbo": "rare", "9000": "rare", "Sonett": "epique",
    "96 / 99": "rare", "9-4X": "epique",
  }},
  { brand: "Seat", country: "Espagne", models: {
    "Ibiza": "commun", "Leon": "commun", "Arona": "commun",
    "Ateca": "commun", "Leon Cupra": "peu-commun", "600": "peu-commun",
    "124 Sport": "rare",
  }},
  { brand: "Skoda", country: "Tchéquie", models: {
    "Fabia": "commun", "Octavia": "commun", "Scala": "commun",
    "Kamiq": "commun", "Karoq": "commun", "Kodiaq": "commun",
    "Superb": "commun", "Enyaq": "commun", "Yeti": "commun",
    "Octavia RS": "peu-commun", "Fabia RS": "peu-commun",
    "Felicia / ancienne": "rare", "110 R": "rare",
  }},
  { brand: "Smart", country: "Allemagne", models: {
    "Fortwo": "commun", "Forfour": "commun", "#1 / #3": "peu-commun",
    "Roadster": "rare", "Crossblade": "legendaire",
  }},
  { brand: "Subaru", country: "Japon", models: {
    "Impreza": "rare", "Impreza WRX / STI": "epique", "WRX STI 22B": "mythique",
    "BRZ": "rare", "Forester": "peu-commun", "Outback": "peu-commun",
    "XV / Crosstrek": "peu-commun", "Legacy": "peu-commun",
    "SVX": "rare", "360 / ancienne": "rare",
  }},
  { brand: "Suzuki", country: "Japon", models: {
    "Swift": "commun", "Ignis": "commun", "Vitara": "commun",
    "S-Cross": "commun", "Across": "commun", "Jimny": "peu-commun",
    "Swift Sport": "peu-commun", "Cappuccino": "rare", "Samurai": "peu-commun",
  }},
  { brand: "Tesla", country: "États-Unis", models: {
    "Model 3": "commun", "Model Y": "commun", "Model S": "rare",
    "Model X": "rare", "Model S Plaid": "epique", "Cybertruck": "legendaire",
    "Roadster (2008)": "mythique", "Roadster (nouveau)": "mythique",
  }},
  { brand: "Toyota", country: "Japon", models: {
    "Aygo / Aygo X": "commun", "Yaris": "commun", "Yaris Cross": "commun",
    "Corolla": "commun", "C-HR": "commun", "RAV4": "commun",
    "Camry": "peu-commun", "Prius": "commun", "bZ4X": "commun",
    "Hilux": "commun", "Land Cruiser": "peu-commun", "Proace": "commun",
    "GR Yaris": "epique", "GR86": "rare", "GT86": "rare",
    "GR Supra": "epique", "Supra A80 (1993)": "legendaire",
    "GR Corolla": "epique", "MR2": "rare", "MR2 SW20 turbo": "epique",
    "Celica": "peu-commun", "Celica GT-Four": "epique", "2000GT": "mythique",
    "Century": "legendaire", "Starlet GT Turbo / Glanza": "rare",
    "AE86": "legendaire", "Urban Cruiser": "commun",
  }},
  { brand: "Volkswagen", country: "Allemagne", models: {
    "Polo": "commun", "Golf": "commun", "T-Roc": "commun",
    "Tiguan": "commun", "T-Cross": "commun", "Taigo": "commun",
    "Touran": "commun", "Passat": "commun", "up!": "commun",
    "ID.3": "commun", "ID.4 / ID.5": "commun", "ID.Buzz": "peu-commun",
    "Touareg": "peu-commun", "Arteon": "peu-commun", "Transporter": "commun",
    "Coccinelle / Beetle": "peu-commun", "Combi T1/T2/T3": "rare",
    "Golf GTI": "peu-commun", "Golf R": "rare", "Golf R32": "epique",
    "Scirocco": "peu-commun", "Corrado": "rare", "Phaeton": "rare",
    "XL1": "mythique", "Golf GTI Mk1": "rare", "Karmann Ghia": "rare",
    "EOS / CC": "peu-commun", "Lupo GTI": "rare",
  }},
  { brand: "Volvo", country: "Suède", models: {
    "XC40": "commun", "XC60": "peu-commun", "XC90": "peu-commun",
    "EX30": "commun", "EX40 / EC40": "peu-commun", "EX90": "rare",
    "S60 / V60": "peu-commun", "S90 / V90": "peu-commun", "V40": "commun",
    "C30": "peu-commun", "240 / 740 / 940": "peu-commun",
    "850 T-5R / R": "epique", "V70 R / S60 R": "rare",
    "Polestar Engineered": "rare", "P1800": "legendaire",
    "Amazon (121)": "rare", "480 ES": "rare",
  }},
];

/* ---------- Helpers ---------- */

const Catalog = (() => {
  const tierById = Object.fromEntries(TIERS.map((t) => [t.id, t]));

  function modelTier(brand, model) {
    const b = CATALOG.find((x) => x.brand === brand);
    if (!b) return tierById["commun"];
    const t = b.models[model];
    return tierById[t] || tierById["commun"];
  }

  function allModels() {
    const out = [];
    for (const b of CATALOG) {
      for (const [name, tier] of Object.entries(b.models)) {
        out.push({ brand: b.brand, model: name, tier });
      }
    }
    return out;
  }

  function search(q, limit = 30) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return allModels()
      .filter((m) => `${m.brand} ${m.model}`.toLowerCase().includes(q))
      .slice(0, limit);
  }

  function stats() {
    const byTier = {};
    TIERS.forEach((t) => (byTier[t.id] = 0));
    let total = 0;
    for (const b of CATALOG) {
      for (const t of Object.values(b.models)) {
        byTier[t] = (byTier[t] || 0) + 1;
        total++;
      }
    }
    return { brands: CATALOG.length, models: total, byTier };
  }

  return { tierById, modelTier, allModels, search, stats };
})();
