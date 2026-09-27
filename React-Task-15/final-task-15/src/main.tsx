import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import {
  formatPrice,
  initialVehicles,
  popularIndianMakes,
  serviceDetails,
  type Vehicle,
} from "./data";
import {
  removeSaved,
  store,
  toggleSaved,
  type AppDispatch,
  type RootState,
} from "./store";
import { useDebouncedValue } from "./hooks";
import nexonEvImage from "./assets/nexon-ev.jpg";
import showroomDetailImage from "./assets/showroom-detail.jpg";
import grandVitaraImage from "./assets/grand-vitara.jpg";
import "./style.css";

// The reducer keeps all catalogue changes in one easy-to-follow place.
type InventoryAction =
  | { type: "add"; vehicle: Vehicle }
  | { type: "update"; vehicle: Vehicle }
  | { type: "delete"; id: string };
function inventoryReducer(
  state: Vehicle[],
  action: InventoryAction,
): Vehicle[] {
  if (action.type === "add") return [action.vehicle, ...state];
  if (action.type === "update")
    return state.map((vehicle) =>
      vehicle.id === action.vehicle.id ? action.vehicle : vehicle,
    );
  return state.filter((vehicle) => vehicle.id !== action.id);
}

// Older saved cars may still point to remote photos. Replace them with assets.
function loadSavedInventory(defaultVehicles: Vehicle[]) {
  try {
    const savedVehicles = JSON.parse(
      localStorage.getItem("saarthi-inventory") ||
        localStorage.getItem("aarohan-inventory") ||
        "null",
    ) as Vehicle[] | null;
    if (!Array.isArray(savedVehicles)) return defaultVehicles;

    const defaultById = new Map(
      defaultVehicles.map((vehicle) => [vehicle.id, vehicle]),
    );
    return savedVehicles.map((vehicle) => ({
      ...vehicle,
      image: defaultById.get(vehicle.id)?.image ?? grandVitaraImage,
    }));
  } catch {
    return defaultVehicles;
  }
}

type NoticeContextType = { notify: (message: string) => void };
const NoticeContext = createContext<NoticeContextType>({
  notify: () => undefined,
});
function NoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState("");
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };
  return (
    <NoticeContext.Provider value={{ notify }}>
      {children}
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
    </NoticeContext.Provider>
  );
}

// In-app links keep the browser's current scroll position by default.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// App owns the catalogue, saves it between visits, and defines every route.
// Routes map URLs to pages; nested routes keep detail screens under their menu.
function App() {
  const [vehicles, dispatchInventory] = useReducer(
    inventoryReducer,
    initialVehicles,
    loadSavedInventory,
  );
  useEffect(
    () => localStorage.setItem("saarthi-inventory", JSON.stringify(vehicles)),
    [vehicles],
  );
  return (
    <NoticeProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage vehicles={vehicles} />} />
          <Route path="inventory" element={<InventoryLayout />}>
            <Route
              index
              element={
                <InventoryPage
                  vehicles={vehicles}
                  dispatchInventory={dispatchInventory}
                />
              }
            />
            <Route
              path=":vehicleId"
              element={<VehiclePage vehicles={vehicles} />}
            />
          </Route>
          <Route path="services" element={<ServicesLayout />}>
            <Route index element={<ServicesPage />} />
            <Route path=":serviceSlug" element={<ServiceDetailPage />} />
          </Route>
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="garage" element={<GaragePage vehicles={vehicles} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </NoticeProvider>
  );
}

// The shared header and footer surround every page.
function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const savedCount = useSelector(
    (state: RootState) => state.garage.savedIds.length,
  );
  const navItems = [
    ["Inventory", "/inventory"],
    ["Services", "/services"],
    ["Our story", "/about"],
    ["Contact", "/contact"],
  ] as const;
  return (
    <div className="site-shell">
      <div className="topline">
        <span>Independent cars, thoughtfully chosen.</span>
        <span>
          <Clock3 size={13} /> Open today 10:00–19:00 IST{" "}
          <span className="topline-divider">·</span>{" "}
          <a href="tel:+919876543210">+91 98765 43210</a>
        </span>
      </div>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Saarthi Motors home">
          <span className="wordmark-icon">
            S<span>.</span>
          </span>
          <span>
            SAARTHI<small>PUNE · INDIA</small>
          </span>
        </Link>
        <button
          className="mobile-menu icon-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/garage"
            className="garage-link"
            onClick={() => setMenuOpen(false)}
          >
            <Heart size={16} /> Garage{" "}
            <span className="saved-count">{savedCount}</span>
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="footer-mark">
        S<span>.</span>
      </Link>
      <p>Good cars. Good people. No guesswork.</p>
      <div className="footer-links">
        <Link to="/inventory">The collection</Link>
        <Link to="/services">What we do</Link>
        <Link to="/contact">Get in touch</Link>
      </div>
      <small>© 2026 Saarthi Motors India</small>
    </footer>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
}) {
  return (
    <div className="page-intro">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
  );
}

// Props let this reusable card display any vehicle from the catalogue.
function VehicleCard({
  vehicle,
  compact = false,
}: {
  vehicle: Vehicle;
  compact?: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const isSaved = useSelector((state: RootState) =>
    state.garage.savedIds.includes(vehicle.id),
  );
  const { notify } = useContext(NoticeContext);
  const handleSave = () => {
    dispatch(toggleSaved(vehicle.id));
    notify(isSaved ? "Removed from your garage" : "Saved to your garage");
  };
  return (
    <article className={`vehicle-card ${compact ? "compact" : ""}`}>
      <div className="vehicle-image-wrap">
        <Link
          to={`/inventory/${vehicle.id}`}
          className="vehicle-image-link"
          aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        >
          <img
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
          />
        </Link>
        {vehicle.featured && (
          <span className="image-tag">
            <Sparkles size={12} /> SAARTHI PICK
          </span>
        )}
        <button
          className={`save-button ${isSaved ? "is-saved" : ""}`}
          onClick={handleSave}
          aria-label={isSaved ? "Remove from garage" : "Save to garage"}
          title={isSaved ? "Remove from garage" : "Save to garage"}
        >
          <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="vehicle-card-body">
        <div className="vehicle-card-heading">
          <div>
            <span className="vehicle-year">
              {vehicle.year} · {vehicle.make}
            </span>
            <h3>
              <Link to={`/inventory/${vehicle.id}`}>{vehicle.model}</Link>
            </h3>
          </div>
          <strong>{formatPrice(vehicle.price)}</strong>
        </div>
        <div className="vehicle-specs">
          <span>{vehicle.mileage.toLocaleString("en-IN")} km</span>
          <i />
          <span>{vehicle.fuel}</span>
          <i />
          <span>{vehicle.transmission}</span>
        </div>
        {!compact && (
          <Link to={`/inventory/${vehicle.id}`} className="text-link card-link">
            Explore this car <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
    </article>
  );
}

function HomePage({ vehicles }: { vehicles: Vehicle[] }) {
  const picks = vehicles.filter((vehicle) => vehicle.featured);
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const activeVehicle = vehicles[activeSlide] ?? vehicles[0];
  const slideCount = Math.max(vehicles.length, 1);

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + slideCount) % slideCount);
  };
  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slideCount);
  };
  const handleTouchEnd = (touchEndX: number) => {
    if (touchStartX.current === null) return;

    const swipeDistance = touchEndX - touchStartX.current;
    if (Math.abs(swipeDistance) > 45) {
      swipeDistance < 0 ? showNextSlide() : showPreviousSlide();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <Eyebrow>THE SAARTHI DIFFERENCE · PUNE</Eyebrow>
          <h1>
            A better kind
            <br />
            of <em>car</em> search.
          </h1>
          <p>
            From city-friendly SUVs to family-ready hybrids, find a carefully
            checked car with clear pricing and friendly advice.
          </p>
          <div className="hero-actions">
            <Link to="/inventory" className="button button-dark">
              Explore the collection <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="quiet-link">
              Get to know us <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              <span>J</span>
              <span>M</span>
              <span>A</span>
            </div>
            <div>
              <strong>4.9 / 5</strong>
              <small>From 280+ happy drivers</small>
            </div>
            <span className="proof-rule" />
            <div className="proof-check">
              <BadgeCheck size={20} />
              <span>
                Independently
                <br />
                inspected
              </span>
            </div>
          </div>
        </div>
        <div
          className="hero-visual"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            handleTouchEnd(event.changedTouches[0].clientX);
          }}
        >
          <img
            key={activeVehicle?.id ?? "default-vehicle"}
            src={activeVehicle?.image ?? nexonEvImage}
            alt={
              activeVehicle
                ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                : "White SUV on a scenic open road"
            }
          />
          <div className="hero-image-shade" />
          <div className="hero-photo-note">
            <button
              className="hero-carousel-button"
              type="button"
              onClick={showPreviousSlide}
              aria-label="Show previous car photo"
              title="Previous photo"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="hero-slide-count">
              {String(activeSlide + 1).padStart(2, "0")} /{" "}
              {String(slideCount).padStart(2, "0")}
            </span>
            <span className="hero-slide-caption">
              {activeVehicle
                ? `${activeVehicle.make} ${activeVehicle.model}`
                : "Explore Saarthi Motors"}
            </span>
            <button
              className="hero-carousel-button"
              type="button"
              onClick={showNextSlide}
              aria-label="Show next car photo"
              title="Next photo"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <a
            className="hero-stamp"
            href="#featured-cars"
            aria-label="Explore the featured cars"
          >
            <span className="hero-stamp-label">SAARTHI SELECT</span>
            <span className="hero-stamp-copy">
              Handpicked.
              <br />
              Road-ready.
            </span>
            <ArrowDown className="hero-stamp-arrow" size={16} />
          </a>
        </div>
      </section>
      <section className="trust-strip">
        <span>
          <ShieldCheck /> Every car independently checked
        </span>
        <i />
        <span>
          <BatteryCharging /> Electric, hybrid & ready for Indian roads
        </span>
        <i />
        <span>
          <CircleHelp /> Advice without the sales pitch
        </span>
      </section>
      <section id="featured-cars" className="section collection-section">
        <div className="section-heading">
          <div>
            <Eyebrow>THE CURRENT COLLECTION</Eyebrow>
            <h2>Worth a closer look.</h2>
          </div>
          <Link to="/inventory" className="button button-outline">
            View all vehicles <ArrowRight size={15} />
          </Link>
        </div>
        <div className="vehicle-grid">
          {picks.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>
      <section className="manifesto">
        <div className="manifesto-image">
          <img
            src={showroomDetailImage}
            alt="Classic car details in afternoon light"
            loading="lazy"
          />
          <span>NOT JUST ANOTHER FORECOURT</span>
        </div>
        <div className="manifesto-copy">
          <Eyebrow>A LITTLE MORE HUMAN</Eyebrow>
          <h2>
            Buying a car
            <br />
            should feel <em>good.</em>
          </h2>
          <p>
            Saarthi started with a simple idea: finding a pre-owned car in India
            should come with clear history, fair pricing, and time to decide.
          </p>
          <Link to="/about" className="text-link">
            Our story <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="home-cta">
        <div>
          <Eyebrow>YOUR NEXT CHAPTER</Eyebrow>
          <h2>
            Let’s find your
            <br />
            <em>kind of car.</em>
          </h2>
        </div>
        <Link to="/contact" className="button button-lime">
          Start a conversation <ArrowRight size={16} />
        </Link>
        <span className="cta-orbit" />
      </section>
    </>
  );
}

function InventoryLayout() {
  return (
    <div className="route-frame">
      <Outlet />
    </div>
  );
}
// Live suggestions are combined with Indian makes for use when offline.
function useVehicleMakes() {
  const [makes, setMakes] = useState<string[]>(popularIndianMakes);
  const [status, setStatus] = useState<"loading" | "ready" | "offline">(
    "loading",
  );
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Manufacturer service unavailable");
        return response.json();
      })
      .then((payload: { Results?: { MakeName?: string }[] }) => {
        const liveMakes = (payload.Results ?? [])
          .map((entry) => entry.MakeName ?? "")
          .filter(Boolean);
        setMakes(
          [...new Set([...popularIndianMakes, ...liveMakes])].slice(0, 180),
        );
        setStatus("ready");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setStatus("offline");
      });
    return () => controller.abort();
  }, []);
  return { makes, status };
}

function InventoryPage({
  vehicles,
  dispatchInventory,
}: {
  vehicles: Vehicle[];
  dispatchInventory: React.Dispatch<InventoryAction>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [body, setBody] = useState(searchParams.get("body") ?? "All vehicles");
  const debouncedQuery = useDebouncedValue(query);
  const searchRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | undefined>();
  const { makes, status } = useVehicleMakes();
  const { notify } = useContext(NoticeContext);
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    debouncedQuery ? next.set("q", debouncedQuery) : next.delete("q");
    body !== "All vehicles" ? next.set("body", body) : next.delete("body");
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, body]);
  const normalized = debouncedQuery.trim().toLowerCase();
  const filtered = vehicles.filter((vehicle) => {
    const matchesText =
      `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.fuel}`
        .toLowerCase()
        .includes(normalized);
    return matchesText && (body === "All vehicles" || vehicle.body === body);
  });
  const beginEdit = (vehicle?: Vehicle) => {
    setEditing(vehicle);
    setModalOpen(true);
  };
  const saveVehicle = (vehicle: Vehicle) => {
    dispatchInventory(
      editing ? { type: "update", vehicle } : { type: "add", vehicle },
    );
    setModalOpen(false);
    notify(
      editing ? "Vehicle details updated" : "Vehicle added to the collection",
    );
  };
  const deleteVehicle = (vehicle: Vehicle) => {
    if (
      window.confirm(
        `Remove ${vehicle.year} ${vehicle.make} ${vehicle.model} from the collection?`,
      )
    ) {
      dispatchInventory({ type: "delete", id: vehicle.id });
      notify("Vehicle removed from the collection");
    }
  };
  return (
    <>
      <PageIntro
        eyebrow="THE COLLECTION"
        title={
          <>
            Find your <em>next.</em>
          </>
        }
        copy="A small, considered collection of cars we would be proud to drive ourselves. Every one independently checked and ready for its next chapter."
      />
      <div className="inventory-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            ref={searchRef}
            list="manufacturer-suggestions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘hybrid’ or ‘Tata’"
            aria-label="Search vehicles"
          />
          <datalist id="manufacturer-suggestions">
            {makes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
          <button
            onClick={() => {
              setQuery("");
              searchRef.current?.focus();
            }}
            className="search-clear"
            aria-label="Clear search"
          >
            {query && <X size={15} />}
          </button>
        </label>
        <label className="select-field">
          <SlidersHorizontal size={16} />
          <select
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="Filter by body style"
          >
            <option>All vehicles</option>
            <option>SUV</option>
            <option>Hatchback</option>
            <option>Sedan</option>
            <option>MPV</option>
          </select>
          <ChevronDown size={14} />
        </label>
        <button
          className="button button-dark add-vehicle"
          onClick={() => beginEdit()}
        >
          <Plus size={16} /> Add vehicle
        </button>
      </div>
      <div className="collection-meta">
        <span>
          {filtered.length} considered {filtered.length === 1 ? "car" : "cars"}
        </span>
        <span className="api-note">
          <span className={`api-dot ${status}`} />
          {status === "loading"
            ? "Connecting to live vehicle data…"
            : status === "ready"
              ? "Live vehicle maker suggestions are ready"
              : "Popular Indian brands are available offline"}
        </span>
      </div>
      {filtered.length ? (
        <div className="vehicle-grid inventory-grid">
          {filtered.map((vehicle) => (
            <div className="managed-vehicle" key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
              <div className="manage-actions">
                <button onClick={() => beginEdit(vehicle)}>
                  <Wrench size={13} /> Edit details
                </button>
                <button
                  className="delete-action"
                  onClick={() => deleteVehicle(vehicle)}
                >
                  <X size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={23} />
          <h3>No cars found just yet.</h3>
          <p>Try another search or clear the body style filter.</p>
          <button
            className="text-link"
            onClick={() => {
              setQuery("");
              setBody("All vehicles");
            }}
          >
            Clear filters <ArrowRight size={15} />
          </button>
        </div>
      )}
      {modalOpen && (
        <VehicleForm
          vehicle={editing}
          onClose={() => setModalOpen(false)}
          onSave={saveVehicle}
        />
      )}
    </>
  );
}

function VehicleForm({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle?: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}) {
  const [error, setError] = useState("");
  const [form, setForm] = useState<Vehicle>(
    vehicle ?? {
      id: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      fuel: "Hybrid",
      transmission: "Automatic",
      body: "SUV",
      color: "",
      image: grandVitaraImage,
      description: "",
    },
  );
  const update = (key: keyof Vehicle, value: string | number) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.make.trim() ||
      !form.model.trim() ||
      !form.color.trim() ||
      !form.description.trim()
    ) {
      setError("Complete every required field before saving.");
      return;
    }
    if (
      form.price <= 0 ||
      form.year < 1990 ||
      form.year > new Date().getFullYear() + 1 ||
      form.mileage < 0
    ) {
      setError("Check the price, model year and mileage.");
      return;
    }
    onSave({
      ...form,
      id: vehicle?.id ?? `vehicle-${Date.now()}`,
      image: form.image || grandVitaraImage,
    });
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="vehicle-modal" onSubmit={submit} noValidate>
        <div className="modal-heading">
          <div>
            <Eyebrow>THE COLLECTION</Eyebrow>
            <h2>{vehicle ? "Edit vehicle" : "Add a vehicle"}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        <div className="form-grid">
          <label>
            Make
            <input
              value={form.make}
              onChange={(event) => update("make", event.target.value)}
              placeholder="e.g. Volvo"
            />
          </label>
          <label>
            Model
            <input
              value={form.model}
              onChange={(event) => update("model", event.target.value)}
              placeholder="e.g. Nexon EV"
            />
          </label>
          <label>
            Year
            <input
              type="number"
              value={form.year}
              onChange={(event) => update("year", Number(event.target.value))}
            />
          </label>
          <label>
            Price (₹)
            <input
              type="number"
              value={form.price || ""}
              onChange={(event) => update("price", Number(event.target.value))}
              placeholder="1850000"
            />
          </label>
          <label>
            Mileage (km)
            <input
              type="number"
              value={form.mileage || ""}
              onChange={(event) =>
                update("mileage", Number(event.target.value))
              }
              placeholder="4200"
            />
          </label>
          <label>
            Body style
            <select
              value={form.body}
              onChange={(event) => update("body", event.target.value)}
            >
              <option>SUV</option>
              <option>Sedan</option>
              <option>Hatchback</option>
              <option>MPV</option>
            </select>
          </label>
          <label>
            Fuel
            <select
              value={form.fuel}
              onChange={(event) => update("fuel", event.target.value)}
            >
              <option>Hybrid</option>
              <option>Plug-in hybrid</option>
              <option>Electric</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>CNG</option>
            </select>
          </label>
          <label>
            Transmission
            <select
              value={form.transmission}
              onChange={(event) => update("transmission", event.target.value)}
            >
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </label>
          <label>
            Exterior color
            <input
              value={form.color}
              onChange={(event) => update("color", event.target.value)}
              placeholder="e.g. Glacier silver"
            />
          </label>
          <label className="form-wide">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="What makes this car special?"
            />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="button button-dark" type="submit">
            {vehicle ? "Save changes" : "Add to collection"}{" "}
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

function VehiclePage({ vehicles }: { vehicles: Vehicle[] }) {
  const { vehicleId } = useParams();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const dispatch = useDispatch<AppDispatch>();
  const isSaved = useSelector((state: RootState) =>
    state.garage.savedIds.includes(vehicleId ?? ""),
  );
  const { notify } = useContext(NoticeContext);
  const navigate = useNavigate();
  if (!vehicle)
    return (
      <div className="empty-state detail-missing">
        <CircleHelp size={28} />
        <h2>That car has moved on.</h2>
        <p>Take a look through our current collection instead.</p>
        <Link to="/inventory" className="button button-dark">
          Browse the collection <ArrowRight size={15} />
        </Link>
      </div>
    );
  return (
    <article className="vehicle-detail">
      <button className="back-link" onClick={() => navigate("/inventory")}>
        <ArrowLeft size={15} /> Back to the collection
      </button>
      <div className="detail-photo">
        <img
          src={vehicle.image}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        />
        <span className="image-tag">
          <BadgeCheck size={13} /> INDEPENDENTLY CHECKED
        </span>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <Eyebrow>
            {vehicle.year} · {vehicle.make}
          </Eyebrow>
          <h1>{vehicle.model}</h1>
          <p className="detail-description">{vehicle.description}</p>
          <div className="detail-facts">
            {[
              [vehicle.mileage.toLocaleString("en-IN"), "kilometres"],
              [vehicle.fuel, "powertrain"],
              [vehicle.transmission, "gearbox"],
              [vehicle.body, "body style"],
              [vehicle.color, "exterior"],
            ].map(([value, label]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="detail-story">
            <h2>A car with a little more to it.</h2>
            <p>
              Every Saarthi car is independently inspected, thoughtfully
              prepared and presented with its full history. No surprises, no
              pressure, just the details you need to make a good decision.
            </p>
          </div>
        </div>
        <aside className="detail-aside">
          <span className="detail-price">{formatPrice(vehicle.price)}</span>
          <small>Ex-showroom price. On-road costs vary by city.</small>
          <button
            className="button button-dark"
            onClick={() => {
              dispatch(toggleSaved(vehicle.id));
              notify(
                isSaved ? "Removed from your garage" : "Saved to your garage",
              );
            }}
          >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved to your garage" : "Save to your garage"}
          </button>
          <Link to="/contact" className="button button-outline">
            Arrange a viewing <ArrowRight size={15} />
          </Link>
          <p>
            <ShieldCheck size={15} /> Inspected and ready for the road
          </p>
        </aside>
      </div>
    </article>
  );
}

function ServicesLayout() {
  return (
    <div className="route-frame">
      <Outlet />
    </div>
  );
}
function ServicesPage() {
  const services = [
    {
      slug: "sourcing",
      number: "01",
      title: "Personal sourcing",
      icon: <Search />,
      copy: "The right car, even if it is not in our collection yet.",
    },
    {
      slug: "finance",
      number: "02",
      title: "Flexible finance",
      icon: <ArrowUpRight />,
      copy: "Clear options built around the way you want to drive.",
    },
    {
      slug: "aftercare",
      number: "03",
      title: "Aftercare & warranty",
      icon: <ShieldCheck />,
      copy: "Thoughtful support that stays with you after handover.",
    },
  ];
  return (
    <>
      <PageIntro
        eyebrow="HERE FOR THE WHOLE JOURNEY"
        title={
          <>
            More than <em>the keys.</em>
          </>
        }
        copy="A great car is just the beginning. Here is how we make every part of finding, financing and owning yours feel a little easier."
      />
      <div className="service-list">
        {services.map((service) => (
          <Link to={service.slug} className="service-row" key={service.slug}>
            <span className="service-number">{service.number}</span>
            <span className="service-icon">{service.icon}</span>
            <span className="service-copy">
              <strong>{service.title}</strong>
              <small>{service.copy}</small>
            </span>
            <ArrowUpRight className="service-arrow" />
          </Link>
        ))}
      </div>
      <div className="services-note">
        <Sparkles size={17} />
        <p>
          Not sure where to start?{" "}
          <Link to="/contact">Tell us what you have in mind.</Link> We will take
          it from there.
        </p>
      </div>
    </>
  );
}
function ServiceDetailPage() {
  const { serviceSlug } = useParams();
  const service = serviceDetails[serviceSlug ?? ""];
  if (!service) return <NotFoundPage />;
  return (
    <article className="service-detail">
      <Link to="/services" className="back-link">
        <ArrowLeft size={15} /> All services
      </Link>
      <Eyebrow>THE SAARTHI APPROACH</Eyebrow>
      <h1>{service.title}</h1>
      <p className="service-lead">{service.intro}</p>
      <div className="service-points">
        {service.items.map((item) => (
          <div key={item}>
            <Check size={16} />
            {item}
          </div>
        ))}
      </div>
      <div className="service-next">
        <div>
          <strong>Let’s make it happen.</strong>
          <p>One conversation is all it takes to get started.</p>
        </div>
        <Link className="button button-dark" to="/contact">
          Talk to our team <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div>
          <Eyebrow>WHO WE ARE</Eyebrow>
          <h1>
            Cars matter.
            <br />
            <em>People more.</em>
          </h1>
          <p>
            Saarthi began with a simple idea: buying a pre-owned car in India
            can be straightforward, transparent, and genuinely enjoyable.
          </p>
        </div>
        <img src={grandVitaraImage} alt="A beautifully detailed modern car" />
      </section>
      <section className="about-story">
        <div className="story-number">
          01 <span>— THE BEGINNING</span>
        </div>
        <div>
          <h2>
            Small collection.
            <br />
            Big on <em>care.</em>
          </h2>
          <p>
            We are an independent team of car people and good listeners. We
            believe you deserve the full story, time to think and a real human
            who picks up the phone. So that is how we do things.
          </p>
          <p>
            Every car is chosen with intention and checked by independent
            specialists. If it is on our floor, we would happily put a friend in
            it.
          </p>
          <Link to="/inventory" className="text-link">
            Meet the collection <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="values-strip">
        <div>
          <strong>01</strong>
          <h3>Good judgement</h3>
          <p>A tighter collection, chosen for all the right reasons.</p>
        </div>
        <div>
          <strong>02</strong>
          <h3>Open cards</h3>
          <p>Clear histories, honest answers and no awkward surprises.</p>
        </div>
        <div>
          <strong>03</strong>
          <h3>Real people</h3>
          <p>Helpful humans who care what happens after you leave.</p>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const { notify } = useContext(NoticeContext);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    interest: "",
    message: "",
  });
  const nameRef = useRef<HTMLInputElement>(null);
  // Validate the fields before showing the success message.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (values.name.trim().length < 2)
      nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      nextErrors.email = "Enter a valid email address.";
    if (values.message.trim().length < 12)
      nextErrors.message = "Tell us a little more (at least 12 characters).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      nameRef.current?.focus();
      return;
    }
    setSubmitted(true);
    notify("Your note is ready. Our team will be in touch shortly.");
  };
  return (
    <div className="contact-layout">
      <div className="contact-copy">
        <Eyebrow>COME ON IN</Eyebrow>
        <h1>
          Let’s talk
          <br />
          <em>cars.</em>
        </h1>
        <p>
          Have a question, a car in mind, or just want to say hello? We are good
          listeners.
        </p>
        <div className="contact-detail">
          <span>PHONE</span>
          <a href="tel:+919876543210">+91 98765 43210</a>
        </div>
        <div className="contact-detail">
          <span>VISIT</span>
          <p>
            7, North Main Road, Koregaon Park
            <br />
            Pune, Maharashtra 411001
          </p>
        </div>
        <div className="contact-detail">
          <span>HOURS</span>
          <p>
            Monday–Saturday, 10:00–19:00 IST
            <br />
            Sunday, by appointment
          </p>
        </div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        {submitted ? (
          <div className="success-panel">
            <span>
              <Check size={24} />
            </span>
            <Eyebrow>MESSAGE RECEIVED</Eyebrow>
            <h2>Thanks, {values.name.split(" ")[0]}.</h2>
            <p>
              A real person from our team will get back to you soon. In the
              meantime, the kettle is always on.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setSubmitted(false);
                setValues({ name: "", email: "", interest: "", message: "" });
              }}
            >
              Send another message <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <h2>What’s on your mind?</h2>
            <p className="form-subtitle">
              We usually reply within one working day.
            </p>
            <label>
              Your name
              <input
                ref={nameRef}
                value={values.name}
                onChange={(event) =>
                  setValues({ ...values, name: event.target.value })
                }
                placeholder="Aarav Sharma"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <small className="field-error">{errors.name}</small>
              )}
            </label>
            <label>
              Email address
              <input
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues({ ...values, email: event.target.value })
                }
                placeholder="aarav.sharma@example.in"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}
            </label>
            <label>
              I'm interested in
              <select
                value={values.interest}
                onChange={(event) =>
                  setValues({ ...values, interest: event.target.value })
                }
              >
                <option value="">Choose one (optional)</option>
                <option>A car in your collection</option>
                <option>Finding a specific car</option>
                <option>Finance options</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              A little more
              <textarea
                rows={4}
                value={values.message}
                onChange={(event) =>
                  setValues({ ...values, message: event.target.value })
                }
                placeholder="Tell us what you have in mind…"
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <small className="field-error">{errors.message}</small>
              )}
            </label>
            <button type="submit" className="button button-dark">
              Send your note <ArrowRight size={16} />
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function GaragePage({ vehicles }: { vehicles: Vehicle[] }) {
  const savedIds = useSelector((state: RootState) => state.garage.savedIds);
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useContext(NoticeContext);
  const saved = vehicles.filter((vehicle) => savedIds.includes(vehicle.id));
  return (
    <div className="route-frame garage-page">
      <PageIntro
        eyebrow="YOUR SAARTHI GARAGE"
        title={
          <>
            The <em>garage.</em>
          </>
        }
        copy="A little space for the cars that have caught your eye. Save a few, compare at your own pace, and pick up right where you left off."
      />
      {saved.length ? (
        <>
          <div className="garage-toolbar">
            <span>
              {saved.length} saved {saved.length === 1 ? "car" : "cars"}
            </span>
            <button
              className="text-link"
              onClick={() => {
                saved.forEach((vehicle) => dispatch(removeSaved(vehicle.id)));
                notify("Your garage has been cleared");
              }}
            >
              Clear garage <X size={14} />
            </button>
          </div>
          <div className="vehicle-grid inventory-grid">
            {saved.map((vehicle) => (
              <div key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
                <button
                  className="remove-saved"
                  onClick={() => {
                    dispatch(removeSaved(vehicle.id));
                    notify("Removed from your garage");
                  }}
                >
                  <Minus size={14} /> Remove from garage
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="garage-empty">
          <div className="garage-heart">
            <Heart size={24} />
          </div>
          <div className="garage-empty-copy">
            <h2>Your garage is ready.</h2>
            <p>
              Save cars you like from the collection. They will stay here while
              you compare.
            </p>
          </div>
          <Link to="/inventory" className="button button-dark">
            Browse inventory <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="empty-state not-found">
      <span className="not-found-number">404</span>
      <h2>This road ends here.</h2>
      <p>
        The page you were looking for has moved, but there are plenty of good
        roads ahead.
      </p>
      <Link to="/" className="button button-dark">
        Back to Saarthi Motors <ArrowRight size={15} />
      </Link>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </Provider>,
);
