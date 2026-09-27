import nexonEvImage from "./assets/nexon-ev.jpg";
import cretaImage from "./assets/creta-suv.jpg";
import tharImage from "./assets/thar-suv.jpg";
import grandVitaraImage from "./assets/grand-vitara.jpg";
import seltosImage from "./assets/seltos.jpg";
import innovaImage from "./assets/innova-hycross.jpg";

// A vehicle record is shared by the catalogue, detail pages, and saved garage.
export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  body: string;
  color: string;
  image: string;
  featured?: boolean;
  description: string;
};

// Example inventory is shown in Indian rupees and kilometres.
export const initialVehicles: Vehicle[] = [
  {
    id: "tata-nexon-ev",
    make: "Tata",
    model: "Nexon EV Empowered+",
    year: 2025,
    price: 1_850_000,
    mileage: 6_400,
    fuel: "Electric",
    transmission: "Automatic",
    body: "SUV",
    color: "Daytona grey",
    featured: true,
    image: nexonEvImage,
    description:
      "An all-electric SUV made for everyday India: quiet in city traffic, confident on the highway, and thoughtfully equipped for family trips.",
  },
  {
    id: "hyundai-creta",
    make: "Hyundai",
    model: "Creta SX (O)",
    year: 2024,
    price: 1_780_000,
    mileage: 11_200,
    fuel: "Petrol",
    transmission: "Automatic",
    body: "SUV",
    color: "Atlas white",
    featured: true,
    image: cretaImage,
    description:
      "A well-kept Creta with a smooth automatic gearbox, a practical cabin, and the comfort features that make busy commutes easier.",
  },
  {
    id: "mahindra-thar",
    make: "Mahindra",
    model: "Thar LX 4x4",
    year: 2023,
    price: 1_590_000,
    mileage: 18_600,
    fuel: "Diesel",
    transmission: "Manual",
    body: "SUV",
    color: "Everest white",
    featured: true,
    image: tharImage,
    description:
      "A capable four-wheel-drive Thar with a clean history, ready for weekend trails and everyday drives alike.",
  },
  {
    id: "maruti-grand-vitara",
    make: "Maruti Suzuki",
    model: "Grand Vitara Alpha+",
    year: 2024,
    price: 1_850_000,
    mileage: 9_200,
    fuel: "Hybrid",
    transmission: "Automatic",
    body: "SUV",
    color: "Nexa blue",
    image: grandVitaraImage,
    description:
      "A spacious hybrid SUV with a comfortable ride, useful ground clearance, and an efficient powertrain for longer journeys.",
  },
  {
    id: "kia-seltos",
    make: "Kia",
    model: "Seltos GTX+",
    year: 2024,
    price: 1_890_000,
    mileage: 7_400,
    fuel: "Petrol",
    transmission: "Automatic",
    body: "SUV",
    color: "Imperial blue",
    image: seltosImage,
    description:
      "A feature-rich Seltos in excellent condition, with a refined automatic drive and room for the whole family.",
  },
  {
    id: "toyota-innova-hycross",
    make: "Toyota",
    model: "Innova Hycross ZX",
    year: 2023,
    price: 2_950_000,
    mileage: 13_200,
    fuel: "Hybrid",
    transmission: "Automatic",
    body: "MPV",
    color: "Blackish agate",
    image: innovaImage,
    description:
      "A premium hybrid people-mover with three-row flexibility, a calm cabin, and the comfort to make long family drives easy.",
  },
];

// Intl formats numbers using Indian digit grouping, for example ₹18,50,000.
export const popularIndianMakes = [
  "Tata",
  "Hyundai",
  "Mahindra",
  "Maruti Suzuki",
  "Kia",
  "Toyota",
  "Honda",
  "MG",
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export const serviceDetails: Record<
  string,
  { title: string; intro: string; items: string[] }
> = {
  sourcing: {
    title: "Personal sourcing",
    intro:
      "Tell us what you are looking for. Our team searches across India to find the right specification, history, and condition.",
    items: [
      "A dedicated vehicle specialist",
      "Independent service-history and RTO checks",
      "A clear, no-pressure shortlist",
    ],
  },
  finance: {
    title: "Simple finance",
    intro:
      "Compare down payments and monthly EMIs with clear terms. Our team helps you understand your options before you decide.",
    items: [
      "EMI options from trusted lending partners",
      "Part-exchange valuations",
      "Clear down-payment and tenure comparisons",
    ],
  },
  aftercare: {
    title: "Aftercare & warranty",
    intro:
      "Every detail is taken care of after handover, with thoughtful protection and support for the journeys ahead.",
    items: [
      "Comprehensive vehicle preparation",
      "Warranty options up to 24 months",
      "A real person when you need support",
    ],
  },
};
