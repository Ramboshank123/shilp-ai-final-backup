import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  BadgeCheck,
  Bell,
  BookOpen,
  Box,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Edit3,
  Eye,
  FileText,
  Gem,
  Globe2,
  Hammer,
  Heart,
  Home,
  ImagePlus,
  IndianRupee,
  Layers3,
  Leaf,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Package,
  Palette,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  Shirt,
  Sparkles,
  Sprout,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { useAuth, signInAsDemo, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth";
import {
  ensureProfile,
  getDashboardStats,
  getMyProfile,
  listCategories,
  listEnquiries,
  listMyProducts,
  listPublishedProducts,
  createEnquiry,
  createProduct,
  deleteProduct,
  incrementViews,
  updateArtisanProfile,
  updateEnquiryStatus,
  updateProduct,
  saveLocalProduct,
  getLocalProducts,
  updateProductStatus,
  updateProfile,
} from "@/lib/db";
import {
  generateCatalogue,
  recommendPrice,
  translateProduct,
  generateBusinessAdvice,
} from "@/lib/ai.functions";
import { enhanceProductImage, blobToDataUrl } from "@/lib/image-studio";
import { uploadProductImage, resolveImageUrl } from "@/lib/storage";
import { LANGUAGES, hasStoredLanguage, useI18n, type TranslationKey } from "@/lib/i18n";
import type {
  ArtisanProfile,
  BuyerEnquiry,
  CatalogueDraft,
  Category,
  EnquiryStatus,
  LanguageCode,
  MarketplaceProduct,
  PriceRecommendation,
  Product,
  Profile,
} from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

type View =
  | "splash"
  | "language"
  | "auth"
  | "profile-setup"
  | "dashboard"
  | "add"
  | "camera"
  | "studio"
  | "voice"
  | "catalogue"
  | "pricing"
  | "preview"
  | "success"
  | "marketplace"
  | "details"
  | "enquiry"
  | "messages"
  | "products"
  | "profile";

type MainView = "dashboard" | "products" | "marketplace" | "messages" | "profile";

interface AppProfile {
  profile: Profile | null;
  artisan: ArtisanProfile | null;
}

interface ProductDraft extends CatalogueDraft {
  imageUrl: string | null;
  originalImageUrl: string | null;
  imageBlob: Blob | null;
  originalBlob: Blob | null;
  transcript: string;
  price: number;
  categoryId: string | null;
  pricing: Omit<PriceRecommendation, "id" | "product_id"> | null;
  existingProductId: string | null;
}

interface EnquiryCard extends BuyerEnquiry {
  products: { name: string } | null;
}

const categoryIcons: Record<string, typeof Box> = {
  Bamboo: Leaf,
  Pottery: Palette,
  Textiles: Shirt,
  Handloom: Layers3,
  Woodwork: Hammer,
  Jewellery: Gem,
  "Home Décor": Home,
};

const categoriesFallback: Category[] = [
  "All",
  "Pottery",
  "Textiles",
  "Bamboo",
  "Woodwork",
  "Jewellery",
  "Home Décor",
  "Handloom",
].map((name, index) => ({
  id: `category-${index}`,
  name,
  description: null,
  icon: null,
}));

const demoProducts: MarketplaceProduct[] = [
  {
    id: "demo-basket",
    artisan_id: "demo-artisan",
    category_id: "demo-bamboo",
    name: "Handcrafted Bamboo Storage Basket",
    description:
      "A sturdy handwoven basket made from locally sourced bamboo. Each basket is shaped by hand over three days, making it ideal for storing grains, linen or everyday household items.",
    description_hindi:
      "स्थानीय बांस से हाथ से बुनी हुई मजबूत टोकरी। हर टोकरी तीन दिनों में हाथ से तैयार की जाती है।",
    material: "Bamboo",
    colour: "Natural brown",
    size: "30 × 30 × 25 cm",
    craft_type: "Bamboo weaving",
    production_time: "3 days",
    price: 749,
    currency: "INR",
    status: "published",
    views: 124,
    created_at: "2026-08-21T08:00:00.000Z",
    updated_at: "2026-08-21T08:00:00.000Z",
    image_url: "/demo/bamboo-basket.jpg",
    artisan_name: "Meera Devi",
    artisan_location: "Barpeta, Assam",
    category_name: "Bamboo",
  },
  {
    id: "demo-diyas",
    artisan_id: "demo-potter",
    category_id: "demo-pottery",
    name: "Terracotta Diya Set",
    description:
      "A set of twelve hand-thrown terracotta diyas finished with natural polish and a warm earthen glow.",
    description_hindi:
      "बारह हस्तनिर्मित टेराकोटा दीयों का सेट, पारंपरिक भट्टी में धीमी आंच पर पकाया गया।",
    material: "Terracotta clay",
    colour: "Earthen red",
    size: "6 cm each",
    craft_type: "Wheel pottery",
    production_time: "2 days",
    price: 349,
    currency: "INR",
    status: "published",
    views: 210,
    created_at: "2026-08-20T08:00:00.000Z",
    updated_at: "2026-08-20T08:00:00.000Z",
    image_url: "/demo/terracotta-diya.jpg",
    artisan_name: "Rakesh Kumhar",
    artisan_location: "Khurja, Uttar Pradesh",
    category_name: "Pottery",
  },
  {
    id: "demo-scarf",
    artisan_id: "demo-weaver",
    category_id: "demo-handloom",
    name: "Handwoven Cotton Scarf",
    description:
      "A lightweight handloom cotton scarf woven with natural dyes. Breathable, soft and finished with hand-knotted tassels.",
    description_hindi: "प्राकृतिक रंगों से हथकरघे पर बुना हल्का सूती दुपट्टा।",
    material: "Handloom cotton",
    colour: "Indigo and ivory",
    size: "180 × 60 cm",
    craft_type: "Handloom weaving",
    production_time: "4 days",
    price: 899,
    currency: "INR",
    status: "published",
    views: 96,
    created_at: "2026-08-19T08:00:00.000Z",
    updated_at: "2026-08-19T08:00:00.000Z",
    image_url: "/demo/cotton-scarf.jpg",
    artisan_name: "Lakshmi Bai",
    artisan_location: "Chanderi, Madhya Pradesh",
    category_name: "Handloom",
  },
  {
    id: "demo-box",
    artisan_id: "demo-artisan",
    category_id: "demo-wood",
    name: "Wooden Decorative Box",
    description:
      "A hand-carved sheesham wood box with traditional floral motifs and a natural beeswax polish.",
    description_hindi: "पारंपरिक फूलों की नक्काशी वाला हस्तनिर्मित शीशम लकड़ी का बक्सा।",
    material: "Sheesham wood",
    colour: "Deep walnut",
    size: "20 × 14 × 8 cm",
    craft_type: "Wood carving",
    production_time: "5 days",
    price: 1249,
    currency: "INR",
    status: "published",
    views: 58,
    created_at: "2026-08-18T08:00:00.000Z",
    updated_at: "2026-08-18T08:00:00.000Z",
    image_url: "/demo/wooden-box.jpg",
    artisan_name: "Meera Devi",
    artisan_location: "Barpeta, Assam",
    category_name: "Woodwork",
  },
  {
    id: "demo-vase",
    artisan_id: "demo-potter",
    category_id: "demo-pottery",
    name: "Handcrafted Pottery Vase",
    description:
      "A tall studio pottery vase shaped on a hand wheel and glazed in a matte earth tone.",
    description_hindi: "हाथ के चाक पर बना लंबा मिट्टी का फूलदान, मैट अर्थ टोन में।",
    material: "Stoneware clay",
    colour: "Matte sand",
    size: "32 cm height",
    craft_type: "Wheel pottery",
    production_time: "4 days",
    price: 1099,
    currency: "INR",
    status: "published",
    views: 143,
    created_at: "2026-08-17T08:00:00.000Z",
    updated_at: "2026-08-17T08:00:00.000Z",
    image_url: "/demo/pottery-vase.jpg",
    artisan_name: "Rakesh Kumhar",
    artisan_location: "Khurja, Uttar Pradesh",
    category_name: "Pottery",
  },
];

const initialDraft = (): ProductDraft => ({
  name: "",
  category: "Bamboo",
  material: "",
  colour: "",
  size: "",
  craft_type: "Bamboo",
  production_time: "",
  description: "",
  description_hindi: "",
  key_features: [],
  ai_generated: false,
  imageUrl: null,
  originalImageUrl: null,
  imageBlob: null,
  originalBlob: null,
  transcript: "",
  price: 0,
  categoryId: null,
  pricing: null,
  existingProductId: null,
});

const localProfile: AppProfile = {
  profile: {
    id: "demo-user",
    email: "demo.artisan@shilp.ai",
    full_name: "Meera Devi",
    role: "artisan",
    preferred_language: "en",
    avatar_url: null,
    created_at: "2026-08-01T08:00:00.000Z",
    updated_at: "2026-08-01T08:00:00.000Z",
  },
  artisan: {
    id: "demo-artisan",
    user_id: "demo-user",
    craft_type: "Bamboo",
    location: "Barpeta, Assam",
    years_of_experience: 18,
    bio: "Third generation bamboo weaver crafting baskets and storage for everyday village life.",
    languages: ["en", "hi"],
    created_at: "2026-08-01T08:00:00.000Z",
    updated_at: "2026-08-01T08:00:00.000Z",
  },
};

const localEnquiries: EnquiryCard[] = [
  {
    id: "demo-enquiry",
    product_id: "demo-basket",
    artisan_id: "demo-artisan",
    buyer_id: null,
    buyer_name: "Ananya Shah",
    buyer_contact: "ananya@example.com",
    message: "Hi, I am interested in this product. Is this available in a larger size?",
    status: "new",
    created_at: "2026-08-30T10:00:00.000Z",
    products: { name: "Handcrafted Bamboo Storage Basket" },
  },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatPrice(value: number | null | undefined) {
  return currency.format(value ?? 0);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Field({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  min,
  multiline = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  name?: string;
  type?: string;
  placeholder?: string;
  min?: number;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-md border border-[#e5ded2] bg-white/80 px-4 py-3.5 text-[15px] text-[#29251f] outline-none transition focus:border-[#bb6547] focus:ring-4 focus:ring-[#bb6547]/10";
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          className={cn(className, "min-h-28 resize-y")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          className={className}
          value={value}
          type={type}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[#b85f42] text-white shadow-[0_8px_20px_rgba(184,95,66,.2)] hover:bg-[#a85338]",
        variant === "secondary" &&
          "border border-[#ded3c5] bg-white text-[#3c352d] hover:bg-[#f8f1e7]",
        variant === "ghost" && "text-[#756e63] hover:bg-[#f3ece2] hover:text-[#3c352d]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#b85f42]">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold leading-tight text-[#302a23] sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-[15px] leading-7 text-[#766e63]">{description}</p>}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-[#b85f42] text-white shadow-[0_7px_18px_rgba(184,95,66,.25)]">
        <Sprout size={20} strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#d6a348]" />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-[#342c24]">SHILP AI</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b9184]">
            Craft to customer
          </p>
        </div>
      )}
    </div>
  );
}

function ImageBox({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => {
    if (!src) return null;
    if (src.startsWith("/") || src.startsWith("http") || src.startsWith("data:")) return src;
    return null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    if (!src) {
      setResolvedSrc(null);
      return;
    }
    if (src.startsWith("/") || src.startsWith("http") || src.startsWith("data:")) {
      setResolvedSrc(src);
      return;
    }
    void resolveImageUrl(src).then((url) => {
      if (alive && url) setResolvedSrc(url);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  return resolvedSrc && !failed ? (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#eee5d8] text-[#b5a895]",
        className,
      )}
    >
      <ImagePlus size={34} strokeWidth={1.5} />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Box;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-[#f4e7da] text-[#b85f42]">
        <Icon size={28} strokeWidth={1.7} />
      </div>
      <h3 className="text-xl font-semibold text-[#382f27]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#7a7268]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ProductCard({ product, onClick }: { product: MarketplaceProduct; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group overflow-hidden rounded-lg border border-[#e8dfd3] bg-white text-left shadow-[0_6px_20px_rgba(65,47,29,.05)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(65,47,29,.1)]"
    >
      <div className="relative aspect-[1.06] overflow-hidden bg-[#eee5d8]">
        <ImageBox
          src={product.image_url}
          alt={product.name}
          className="transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#685f53] backdrop-blur">
          {product.category_name ?? product.craft_type ?? "Handmade"}
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-[#342c24]/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {formatPrice(product.price)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-lg font-semibold text-[#382f27]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#82796d]">
          <UserRound size={13} />
          <span className="line-clamp-1">{product.artisan_name ?? "Artisan"}</span>
          <span className="text-[#c7bbae]">·</span>
          <span className="line-clamp-1">{product.artisan_location ?? "India"}</span>
        </div>
      </div>
    </motion.button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Box;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="surface-card flex items-start gap-3 p-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", accent)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#352e27]">{value}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#887f73]">
          {label}
        </p>
      </div>
    </div>
  );
}

function navItems(
  t: (key: "nav.home" | "nav.products" | "nav.market" | "nav.messages" | "nav.profile") => string,
): { id: MainView; label: string; icon: typeof Home }[] {
  return [
    { id: "dashboard", label: t("nav.home"), icon: Home },
    { id: "products", label: t("nav.products"), icon: Package },
    { id: "marketplace", label: t("nav.market"), icon: Store },
    { id: "messages", label: t("nav.messages"), icon: MessageCircle },
    { id: "profile", label: t("nav.profile"), icon: UserRound },
  ];
}

export function ShilpApp() {
  const { user, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [view, setView] = useState<View>("splash");
  const [demoMode, setDemoMode] = useState(false);
  const [profile, setProfile] = useState<AppProfile>({ profile: null, artisan: null });
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [marketProducts, setMarketProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>(categoriesFallback);
  const [enquiries, setEnquiries] = useState<EnquiryCard[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, views: 0, enquiries: 0 });
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedTab, setSelectedTab] = useState<"draft" | "published" | "archived">("published");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [toast, setToast] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  const go = useCallback((next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (authLoading) return;
      if (user) go("dashboard");
      else if (hasStoredLanguage()) go("auth");
      else go("language");
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [authLoading, go, user]);

  useEffect(() => {
    if (user && !demoMode) {
      void loadRemoteProfile(user.id);
    }
    // The profile is loaded only when the authenticated user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, demoMode]);

  useEffect(() => {
    if (view === "marketplace" && !demoMode && user) void loadMarketplace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function loadRemoteProfile(userId: string) {
    setLoadingData(true);
    try {
      let result = await getMyProfile(userId);
      if (!result.profile || !result.artisan) {
        const metaName = user?.user_metadata
          ? (user.user_metadata["full_name"] as string | undefined)
          : undefined;
        const fallbackName =
          metaName || (user?.email ? (user.email.split("@")[0] ?? "Artisan") : "Artisan");
        const ensured = await ensureProfile(userId, user?.email ?? null, fallbackName, language);
        result = { profile: ensured.profile, artisan: ensured.artisan };
      }
      const nextProfile = { profile: result.profile, artisan: result.artisan };
      setProfile(nextProfile);
      if (result.profile?.preferred_language)
        setLanguage(result.profile.preferred_language as typeof language);
      if (result.artisan) {
        const [dashboardStatsRes, ownProductsRes, ownEnquiriesRes] = await Promise.allSettled([
          getDashboardStats(result.artisan.id),
          listMyProducts(result.artisan.id),
          listEnquiries(result.artisan.id),
        ]);
        const dashboardStats =
          dashboardStatsRes.status === "fulfilled"
            ? dashboardStatsRes.value
            : { total: 0, published: 0, views: 0, enquiries: 0 };
        const ownProducts = ownProductsRes.status === "fulfilled" ? ownProductsRes.value : [];
        const ownEnquiries = ownEnquiriesRes.status === "fulfilled" ? ownEnquiriesRes.value : [];

        const resolvedProducts = await resolveProducts(ownProducts);
        setStats(dashboardStats);
        setProducts(resolvedProducts);
        setEnquiries(ownEnquiries);

        if (ownProductsRes.status === "rejected") {
          console.error("Failed to load products from cloud:", ownProductsRes.reason);
        }
      }
    } catch (error) {
      console.error("Failed to load remote profile:", error);
      notify("Your account is ready, but cloud data could not be loaded yet.");
    } finally {
      setLoadingData(false);
    }
  }

  async function loadMarketplace() {
    try {
      const remote = await listPublishedProducts();
      setMarketProducts(await resolveProducts(remote));
    } catch (error) {
      console.error(error);
      notify("Showing the demo marketplace while cloud data reconnects.");
      setMarketProducts(demoProducts);
    }
  }

  async function resolveProducts(items: MarketplaceProduct[]) {
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        image_url: await resolveImageUrl(item.image_url),
      })),
    );
  }

  function enterDemo() {
    setDemoMode(true);
    setProfile(localProfile);
    setProducts(demoProducts.filter((item) => item.artisan_id === "demo-artisan"));
    setMarketProducts(demoProducts);
    setEnquiries(localEnquiries);
    setStats({ total: 2, published: 2, views: 182, enquiries: 1 });
    window.localStorage.setItem("shilp.demo", "true");
    go("dashboard");
  }

  async function handleDemoLogin() {
    try {
      const result = await signInAsDemo();
      if (!result.error) {
        enterDemo();
        notify("Demo account connected.");
        return;
      }
    } catch (error) {
      console.warn("Demo account unavailable, using local demo mode.", error);
    }
    enterDemo();
    notify("Browsing as a demo artisan.");
  }

  async function handleSignOut() {
    window.localStorage.removeItem("shilp.demo");
    setDemoMode(false);
    setProfile({ profile: null, artisan: null });
    setProducts([]);
    setEnquiries([]);
    setStats({ total: 0, published: 0, views: 0, enquiries: 0 });
    setSelectedProduct(null);
    setDraft(initialDraft());
    await supabase.auth.signOut();
    notify("You have been signed out.");
    go("auth");
  }

  async function handleAuthSubmit(
    event: React.FormEvent<HTMLFormElement>,
    mode: "login" | "signup",
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();
    const fullName = String(data.get("fullName") ?? "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      notify("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (password.length < 6) {
      notify("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) {
          const errorMsg = result.error.message.toLowerCase();
          if (errorMsg.includes("invalid login credentials")) {
            notify("Invalid email or password. Please verify your credentials and try again.");
          } else if (errorMsg.includes("email not confirmed")) {
            notify(
              "Your email address is not verified yet. Please check your inbox for the confirmation link.",
            );
          } else {
            notify(result.error.message);
          }
          return;
        }

        setDemoMode(false);
        window.localStorage.removeItem("shilp.demo");
        notify("Welcome back! Loading your artisan dashboard...");
        go("dashboard");
        return;
      }

      // Signup mode
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || email.split("@")[0] },
        },
      });

      if (result.error) {
        const errorMsg = result.error.message.toLowerCase();
        if (errorMsg.includes("already registered") || errorMsg.includes("already exists")) {
          notify("An account with this email already exists. Please log in instead.");
        } else {
          notify(result.error.message);
        }
        return;
      }

      setDemoMode(false);
      window.localStorage.removeItem("shilp.demo");

      if (result.data.session && result.data.user) {
        try {
          await ensureProfile(
            result.data.user.id,
            email,
            fullName || (email.split("@")[0] ?? "Artisan"),
            language,
          );
        } catch (profileErr) {
          console.warn("Profile pre-creation notice:", profileErr);
        }
        notify("Account created successfully! Let's set up your artisan profile.");
        go("profile-setup");
      } else if (result.data.user) {
        notify(
          "Account created! Please check your email to verify your account before logging in.",
        );
      }
    } catch (error) {
      console.error("Authentication error:", error);
      notify("An authentication error occurred. Please try again.");
    }
  }

  async function saveProfile(values: {
    fullName: string;
    craft: string;
    location: string;
    experience: string;
    bio: string;
  }) {
    if (user && !demoMode) {
      try {
        await ensureProfile(user.id, user.email ?? null, values.fullName, language);
        await Promise.all([
          updateProfile(user.id, { full_name: values.fullName, preferred_language: language }),
          updateArtisanProfile(user.id, {
            craft_type: values.craft,
            location: values.location,
            years_of_experience: Number(values.experience) || 0,
            bio: values.bio,
            languages: [language, ...(language === "en" ? ["hi"] : ["en"])],
          }),
        ]);
        await loadRemoteProfile(user.id);
        notify("Profile saved. Your workshop is ready.");
        go("dashboard");
        return;
      } catch (error) {
        console.error("Failed to save profile to database:", error);
        notify("Could not save profile to cloud database. Please try again.");
        return;
      }
    }

    // Demo Mode
    const next = {
      profile: {
        id: "demo-artisan",
        email: "demo@shilp.ai",
        full_name: values.fullName,
        role: "artisan" as const,
        preferred_language: language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: null,
      },
      artisan: {
        id: "demo-artisan",
        user_id: "demo-artisan",
        craft_type: values.craft,
        location: values.location,
        years_of_experience: Number(values.experience) || 0,
        bio: values.bio,
        languages: [language, ...(language === "en" ? ["hi"] : ["en"])],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    setProfile(next);
    notify("Demo profile updated.");
    go("dashboard");
  }

  function startProduct() {
    setDraft({
      ...initialDraft(),
      craft_type: profile.artisan?.craft_type ?? "Bamboo",
      category: profile.artisan?.craft_type ?? "Bamboo",
    });
    go("add");
  }

  function localCatalogue(transcript: string): CatalogueDraft {
    const craft = profile.artisan?.craft_type ?? "Bamboo";
    const isBamboo = /bamboo|basket|cane/i.test(`${transcript} ${craft}`);
    return {
      name: isBamboo ? "Handcrafted Bamboo Storage Basket" : `Handcrafted ${craft} Product`,
      category: isBamboo ? "Bamboo" : craft,
      material: isBamboo ? "Locally sourced bamboo" : "Handmade natural materials",
      colour: "Natural",
      size: "Standard",
      craft_type: craft,
      production_time: "3 days",
      description: `${transcript.trim()} This piece is made entirely by hand by an Indian artisan, with small natural variations that make every item unique.`,
      description_hindi: "यह उत्पाद भारतीय कारीगर द्वारा पूरी तरह हाथ से बनाया गया है।",
      key_features: [
        "Completely handmade",
        "Locally sourced materials",
        "Supports an artisan family",
      ],
      ai_generated: false,
    };
  }

  async function generateDraft(transcript = draft.transcript) {
    setAiBusy(true);
    try {
      const result = await generateCatalogue({
        data: {
          transcript: transcript || "A handmade product created with care by an Indian artisan.",
          language,
          craftHint: profile.artisan?.craft_type ?? draft.craft_type,
        },
      });
      setDraft((current) => ({ ...current, ...result, transcript }));
    } catch (error) {
      console.warn("Catalogue generation fell back to the local demo.", error);
      setDraft((current) => ({ ...current, ...localCatalogue(transcript), transcript }));
    } finally {
      setAiBusy(false);
    }
  }

  function useVoiceDescription(transcript: string) {
    setDraft((current) => ({ ...current, transcript }));
    go("catalogue");
    void generateDraft(transcript);
  }

  async function handleImage(file: File) {
    if (!file.type.startsWith("image/")) {
      notify("Please choose an image file.");
      return;
    }
    try {
      const originalUrl = await blobToDataUrl(file);
      setDraft((current) => ({
        ...current,
        originalBlob: file,
        imageBlob: file,
        originalImageUrl: originalUrl,
        imageUrl: originalUrl,
      }));
      go("studio");
    } catch {
      notify("This image could not be opened. Please try another.");
    }
  }

  async function saveProduct(status: "draft" | "published") {
    if (!draft.name.trim() || !draft.description.trim()) {
      notify("Add a product name and description before saving.");
      go("catalogue");
      return;
    }
    setLoadingData(true);
    try {
      let imageUrl = draft.imageUrl;
      let originalImageUrl = draft.originalImageUrl;

      if (!imageUrl && !originalImageUrl) {
        const categoryFallback: Record<string, string> = {
          Bamboo: "/demo/bamboo-basket.jpg",
          Pottery: "/demo/pottery-vase.jpg",
          Handloom: "/demo/cotton-scarf.jpg",
          Textiles: "/demo/cotton-scarf.jpg",
          Woodwork: "/demo/wooden-box.jpg",
          Jewellery: "/demo/wooden-box.jpg",
          Other: "/demo/terracotta-diya.jpg",
        };
        imageUrl = categoryFallback[draft.category] ?? "/demo/bamboo-basket.jpg";
        originalImageUrl = imageUrl;
      }

      if (user && !demoMode && profile.artisan && draft.imageBlob) {
        const productKey = draft.existingProductId ?? crypto.randomUUID();
        const [processedPath, originalPath] = await Promise.all([
          uploadProductImage(user.id, productKey, "processed", draft.imageBlob),
          draft.originalBlob
            ? uploadProductImage(user.id, productKey, "original", draft.originalBlob)
            : Promise.resolve(null),
        ]);
        imageUrl = processedPath;
        originalImageUrl = originalPath;
      }

      if (draft.existingProductId) {
        if (user && !demoMode && !draft.existingProductId.startsWith("local-")) {
          try {
            await updateProduct(draft.existingProductId, {
              name: draft.name,
              category_id: draft.categoryId,
              description: draft.description,
              description_hindi: draft.description_hindi,
              material: draft.material,
              colour: draft.colour,
              size: draft.size,
              craft_type: draft.craft_type,
              production_time: draft.production_time,
              price: draft.price,
              status,
            });
          } catch (updateErr) {
            console.error("Failed to update product in database:", updateErr);
          }
        }
        const updatedProduct: MarketplaceProduct = {
          id: draft.existingProductId,
          artisan_id: profile.artisan?.id ?? "demo-artisan",
          category_id: draft.categoryId,
          name: draft.name,
          description: draft.description,
          description_hindi: draft.description_hindi,
          material: draft.material,
          colour: draft.colour,
          size: draft.size,
          craft_type: draft.craft_type,
          production_time: draft.production_time,
          price: draft.price,
          currency: "INR",
          status,
          views: products.find((item) => item.id === draft.existingProductId)?.views ?? 0,
          created_at:
            products.find((item) => item.id === draft.existingProductId)?.created_at ??
            new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_url: imageUrl,
          artisan_name: profile.profile?.full_name ?? "You",
          artisan_location: profile.artisan?.location ?? "India",
          category_name: draft.category,
        };
        saveLocalProduct(updatedProduct);
        setProducts((current) =>
          current.map((item) => (item.id === draft.existingProductId ? updatedProduct : item)),
        );
        setMarketProducts((current) =>
          current.map((item) => (item.id === draft.existingProductId ? updatedProduct : item)),
        );
        if (status === "published") setSelectedProduct(updatedProduct);
        notify(status === "published" ? "Product published." : "Draft updated.");
        if (status === "published") go("success");
        else go("products");
        return;
      }

      let productId = `local-${Date.now()}`;
      if (user && !demoMode && profile.artisan) {
        try {
          const created = await createProduct({
            artisanId: profile.artisan.id,
            artisanName: profile.profile?.full_name ?? "You",
            artisanLocation: profile.artisan?.location ?? "India",
            categoryName: draft.category,
            categoryId: draft.categoryId,
            name: draft.name,
            description: draft.description,
            descriptionHindi: draft.description_hindi,
            material: draft.material,
            colour: draft.colour,
            size: draft.size,
            craftType: draft.craft_type,
            productionTime: draft.production_time,
            price: draft.price,
            status,
            keyFeatures: draft.key_features,
            imageUrl,
            originalImageUrl,
            sourceLanguage: language,
            pricing: draft.pricing,
          });
          productId = created.id;
          setDraft((current) => ({ ...current, existingProductId: created.id }));
        } catch (createErr) {
          console.error("Failed to create product in database:", createErr);
          notify("Product saved locally while cloud permissions are synchronizing.");
        }
      }

      const localItem: MarketplaceProduct = {
        id: productId,
        artisan_id: profile.artisan?.id ?? "demo-artisan",
        category_id: draft.categoryId,
        name: draft.name,
        description: draft.description,
        description_hindi: draft.description_hindi,
        material: draft.material,
        colour: draft.colour,
        size: draft.size,
        craft_type: draft.craft_type,
        production_time: draft.production_time,
        price: draft.price,
        currency: "INR",
        status,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: imageUrl,
        artisan_name: profile.profile?.full_name ?? "You",
        artisan_location: profile.artisan?.location ?? "India",
        category_name: draft.category,
      };
      saveLocalProduct(localItem);
      setProducts((current) => [localItem, ...current]);
      setMarketProducts((current) => (status === "published" ? [localItem, ...current] : current));
      if (status === "published") setSelectedProduct(localItem);
      setStats((current) => ({
        ...current,
        total: current.total + 1,
        published: current.published + (status === "published" ? 1 : 0),
      }));
      notify(
        status === "published"
          ? "Your product is now visible to buyers."
          : "Draft saved to My Products.",
      );
      go(status === "published" ? "success" : "products");
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Could not save the product. Try again.");
    } finally {
      setLoadingData(false);
    }
  }

  function editProduct(product: MarketplaceProduct) {
    if (user && !demoMode && profile.artisan && product.artisan_id !== profile.artisan.id) {
      notify("You can only edit your own products.");
      return;
    }
    setDraft({
      ...initialDraft(),
      name: product.name,
      category: product.category_name ?? "Other",
      material: product.material ?? "",
      colour: product.colour ?? "",
      size: product.size ?? "",
      craft_type: product.craft_type ?? "",
      production_time: product.production_time ?? "",
      description: product.description ?? "",
      description_hindi: product.description_hindi ?? "",
      imageUrl: product.image_url,
      price: product.price ?? 0,
      categoryId: product.category_id,
      existingProductId: product.id,
      key_features: [],
      ai_generated: true,
    });
    go("catalogue");
  }

  async function removeProduct(product: MarketplaceProduct) {
    if (user && !demoMode && profile.artisan && product.artisan_id !== profile.artisan.id) {
      notify("You can only delete your own products.");
      return;
    }
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMarketProducts((current) => current.filter((item) => item.id !== product.id));
      setStats((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        published:
          product.status === "published" ? Math.max(0, current.published - 1) : current.published,
      }));
      notify(`Product “${product.name}” deleted.`);
    } catch (error) {
      console.error(error);
      notify("Could not delete this product.");
    }
  }

  async function archiveProduct(product: MarketplaceProduct) {
    if (user && !demoMode && profile.artisan && product.artisan_id !== profile.artisan.id) {
      notify("You can only archive your own products.");
      return;
    }
    try {
      await updateProductStatus(product.id, "archived");
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, status: "archived" } : item)),
      );
      setMarketProducts((current) => current.filter((item) => item.id !== product.id));
      setStats((current) => ({
        ...current,
        published: Math.max(0, current.published - 1),
      }));
      notify("Product moved to archived.");
    } catch {
      notify("Could not archive this product.");
    }
  }

  async function submitEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;
    const data = new FormData(event.currentTarget);
    const buyerName = String(data.get("buyerName") ?? "").trim();
    const buyerContact = String(data.get("buyerContact") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!buyerName || !buyerContact || !message) {
      notify("Please complete all enquiry fields.");
      return;
    }
    try {
      await createEnquiry({
        productId: selectedProduct.id,
        artisanId: selectedProduct.artisan_id,
        buyerId: user?.id ?? null,
        buyerName,
        buyerContact,
        message,
      });
      if (profile.artisan && profile.artisan.id === selectedProduct.artisan_id) {
        setEnquiries((current) => [
          {
            id: `enquiry-${Date.now()}`,
            product_id: selectedProduct.id,
            artisan_id: selectedProduct.artisan_id,
            buyer_id: user?.id ?? null,
            buyer_name: buyerName,
            buyer_contact: buyerContact,
            message,
            status: "new",
            created_at: new Date().toISOString(),
            products: { name: selectedProduct.name },
          },
          ...current,
        ]);
        setStats((current) => ({ ...current, enquiries: current.enquiries + 1 }));
      }
      notify("Enquiry sent to the artisan.");
      go("marketplace");
    } catch {
      notify("Your enquiry could not be sent. Please try again.");
    }
  }

  async function markEnquiry(enquiry: EnquiryCard, status: EnquiryStatus) {
    try {
      if (user && !demoMode && !enquiry.id.startsWith("local-"))
        await updateEnquiryStatus(enquiry.id, status);
      setEnquiries((current) =>
        current.map((item) => (item.id === enquiry.id ? { ...item, status } : item)),
      );
      notify(status === "contacted" ? "Marked as contacted." : "Enquiry updated.");
    } catch {
      notify("Could not update this enquiry.");
    }
  }

  async function openProduct(product: MarketplaceProduct) {
    setSelectedProduct(product);
    if (!demoMode && user && product.status === "published") {
      await incrementViews(product.id);
    }
    if (product.artisan_id === profile.artisan?.id || demoMode) {
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, views: item.views + 1 } : item)),
      );
    }
    go("details");
  }

  const filteredMarket = useMemo(() => {
    const query = search.toLowerCase().trim();
    return marketProducts.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.name,
          product.description,
          product.artisan_name,
          product.craft_type,
          product.category_name,
        ].some((value) => value?.toLowerCase().includes(query));
      const matchesCategory =
        categoryFilter === "All" ||
        product.category_name === categoryFilter ||
        product.craft_type === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, marketProducts, search]);

  const shellViews = new Set<View>(["dashboard", "products", "marketplace", "messages", "profile"]);

  if (view === "splash") {
    return (
      <div className="craft-pattern flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf7ef] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-lg bg-[#b85f42] text-white shadow-[0_20px_40px_rgba(184,95,66,.24)]"
          >
            <Sprout size={45} strokeWidth={1.6} />
          </motion.div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-[#302a23]">
            SHILP AI
          </h1>
          <p className="mt-3 text-base font-semibold text-[#b85f42]">From craft to customer</p>
          <p className="mt-2 text-sm text-[#887f73]">Your AI-powered digital business assistant</p>
          <div className="mx-auto mt-12 h-1 w-24 overflow-hidden rounded-full bg-[#eadfd2]">
            <motion.div
              className="h-full rounded-full bg-[#b85f42]"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "language") {
    return (
      <LanguageScreen language={language} setLanguage={setLanguage} onContinue={() => go("auth")} />
    );
  }

  if (view === "auth") {
    return <AuthScreen onDemo={handleDemoLogin} onSubmit={handleAuthSubmit} />;
  }

  if (view === "profile-setup") {
    return (
      <ProfileSetup
        profile={profile}
        language={language}
        onSave={saveProfile}
        onBack={() => go("auth")}
      />
    );
  }

  const primaryContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        {view === "dashboard" && (
          <Dashboard
            profile={profile}
            stats={stats}
            products={products}
            enquiries={enquiries}
            loading={loadingData}
            onAdd={startProduct}
            onNavigate={go}
          />
        )}
        {view === "products" && (
          <MyProducts
            products={products}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            onEdit={editProduct}
            onView={openProduct}
            onDelete={removeProduct}
            onArchive={archiveProduct}
            onAdd={startProduct}
          />
        )}
        {view === "marketplace" && (
          <Marketplace
            products={filteredMarket}
            allProducts={marketProducts}
            search={search}
            setSearch={setSearch}
            category={categoryFilter}
            setCategory={setCategoryFilter}
            onOpen={openProduct}
            onRefresh={loadMarketplace}
          />
        )}
        {view === "messages" && <Messages enquiries={enquiries} onMark={markEnquiry} />}
        {view === "profile" && (
          <ProfileScreen
            profile={profile}
            language={language}
            setLanguage={setLanguage}
            onSave={saveProfile}
            onSignOut={handleSignOut}
            demoMode={demoMode}
          />
        )}
        {view === "add" && (
          <AddProduct
            onTakePhoto={() => go("camera")}
            onUploadPhoto={handleImage}
            onVoice={() => {
              setDraft((current) => ({ ...current, transcript: "" }));
              go("voice");
            }}
            onManual={() => {
              setDraft(initialDraft());
              go("catalogue");
            }}
            onBack={() => go("dashboard")}
          />
        )}
        {view === "camera" && <CameraScreen onImage={handleImage} onBack={() => go("add")} />}
        {view === "studio" && (
          <Studio
            draft={draft}
            onUse={(processed, url) => {
              setDraft((current) => ({ ...current, imageBlob: processed, imageUrl: url }));
              go("catalogue");
              if (!draft.name || !draft.description) {
                void generateDraft(
                  draft.transcript || `${draft.craft_type || "Handmade"} craft item`,
                );
              }
            }}
            onRetake={() => go("camera")}
          />
        )}
        {view === "voice" && (
          <VoiceDescription draft={draft} onUse={useVoiceDescription} onBack={() => go("add")} />
        )}
        {view === "catalogue" && (
          <Catalogue
            draft={draft}
            setDraft={setDraft}
            onGenerate={() => void generateDraft()}
            onContinue={() => go("pricing")}
            onBack={() => go("add")}
            generating={aiBusy}
            onUploadPhoto={handleImage}
            notify={notify}
          />
        )}
        {view === "pricing" && (
          <Pricing
            draft={draft}
            setDraft={setDraft}
            onContinue={() => go("preview")}
            onBack={() => go("catalogue")}
            generating={aiBusy}
          />
        )}
        {view === "preview" && (
          <Preview
            draft={draft}
            profile={profile}
            onEditCatalogue={() => go("catalogue")}
            onEditPricing={() => go("pricing")}
            onSaveDraft={() => void saveProduct("draft")}
            onPublish={() => void saveProduct("published")}
            saving={loadingData}
          />
        )}
        {view === "success" && (
          <Success
            product={draft}
            onView={() => go("details")}
            onMarket={() => go("marketplace")}
            onDashboard={() => go("dashboard")}
          />
        )}
        {view === "details" && (
          <Details
            product={selectedProduct}
            onContact={() => go("enquiry")}
            onBack={() => go("marketplace")}
          />
        )}
        {view === "enquiry" && (
          <Enquiry
            product={selectedProduct}
            onSubmit={submitEnquiry}
            onBack={() => go("details")}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#fbf7ef] text-[#302a23]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        {shellViews.has(view) && <DesktopSidebar view={view as MainView} onNavigate={go} t={t} />}
        <main className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-8">
          <Topbar
            view={view}
            demoMode={demoMode}
            profile={profile}
            onBack={() => go(view === "details" ? "marketplace" : "dashboard")}
            onNavigate={go}
            unreadCount={(enquiries || []).filter((e) => e.status === "new").length}
          />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-8 sm:py-9">
            {primaryContent}
          </div>
          {shellViews.has(view) && <BottomNav view={view as MainView} onNavigate={go} t={t} />}
        </main>
      </div>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-md bg-[#342c24] px-4 py-3 text-sm font-semibold text-white shadow-xl lg:bottom-7"
        >
          <BadgeCheck size={18} className="text-[#e3aa68]" />
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function LanguageScreen({
  language,
  setLanguage,
  onContinue,
}: {
  language: string;
  setLanguage: (code: LanguageCode) => void;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="craft-pattern min-h-screen bg-[#fbf7ef] px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center">
        <Logo />
        <PageTitle
          eyebrow={t("lang.eyebrow")}
          title={t("lang.title")}
          description={t("lang.subtitle")}
        />
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={cn(
                "rounded-md border p-4 text-left transition",
                language === item.code
                  ? "border-[#b85f42] bg-[#fff7ef] shadow-[0_8px_20px_rgba(184,95,66,.1)]"
                  : "border-[#e8dfd3] bg-white/70 hover:border-[#d2b39d]",
              )}
            >
              <span className="block text-base font-bold text-[#3b332b]">{item.native}</span>
              <span className="mt-1 block text-xs text-[#898075]">{item.label}</span>
              {!item.complete && (
                <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#a69b8d]">
                  Coming soon
                </span>
              )}
              {language === item.code && (
                <span className="mt-3 flex items-center gap-1 text-xs font-bold text-[#b85f42]">
                  <Check size={13} /> {t("common.selected")}
                </span>
              )}
            </button>
          ))}
        </div>
        <PrimaryButton className="mt-8 w-full" onClick={onContinue}>
          {t("common.continue")} <ArrowRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );
}

function AuthScreen({
  onDemo,
  onSubmit,
}: {
  onDemo: () => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    mode: "login" | "signup",
  ) => Promise<void> | void;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(event, mode);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="craft-pattern min-h-screen bg-[#fbf7ef] px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Logo />
        <div className="mt-10">
          <PageTitle
            title={mode === "login" ? t("auth.welcome") : t("auth.signup")}
            description={t("auth.sub")}
          />
          <div className="mt-7 flex rounded-md bg-[#eee6db] p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setValidationError(null);
                }}
                className={cn(
                  "flex-1 rounded-sm py-3 text-sm font-bold transition",
                  mode === item ? "bg-white text-[#3d332b] shadow-sm" : "text-[#887f73]",
                )}
              >
                {item === "login" ? t("auth.login") : t("auth.signup")}
              </button>
            ))}
          </div>

          {validationError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {validationError}
            </div>
          )}

          <form className="mt-7 space-y-4" onSubmit={handleFormSubmit}>
            {mode === "signup" && (
              <Field
                name="fullName"
                label={t("profile.fullName")}
                value={fullName}
                onChange={setFullName}
                placeholder="Your full name (e.g. Ramesh Kumar)"
              />
            )}
            <Field
              name="email"
              label={t("auth.email")}
              value={email}
              onChange={(val) => {
                setEmail(val);
                if (validationError) setValidationError(null);
              }}
              placeholder="you@example.com"
            />
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
                {t("auth.password")}
              </span>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-md border border-[#e5ded2] bg-white/80 px-4 py-3.5 text-[15px] outline-none focus:border-[#bb6547] focus:ring-4 focus:ring-[#bb6547]/10"
                placeholder="At least 6 characters"
              />
            </label>
            <div className="flex items-center justify-between text-xs text-[#887f73]">
              <span>
                {mode === "login" ? t("auth.dontHaveAccount") : t("auth.alreadyHaveAccount")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setValidationError(null);
                }}
                className="font-semibold text-[#b85f42] hover:underline"
              >
                {mode === "login" ? t("auth.signup") : t("auth.login")}
              </button>
            </div>
            <PrimaryButton type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  {mode === "login" ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? t("auth.login") : t("auth.signup")} <ArrowRight size={17} />
                </>
              )}
            </PrimaryButton>
          </form>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
                setValidationError(null);
              }}
              className="mt-3 w-full text-center text-xs font-medium text-[#b85f42] hover:underline"
            >
              Fill demo credentials ({DEMO_EMAIL})
            </button>
          )}
          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#a69b8d]">
            <span className="h-px flex-1 bg-[#e2d8cc]" />
            or
            <span className="h-px flex-1 bg-[#e2d8cc]" />
          </div>
          <PrimaryButton variant="secondary" className="w-full" onClick={onDemo}>
            <Sparkles size={17} className="text-[#b85f42]" /> {t("auth.demo")}
          </PrimaryButton>
          <p className="mt-4 text-center text-xs leading-5 text-[#8d8376]">
            Demo mode lets you explore the complete artisan-to-marketplace journey without setup.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSetup({
  profile,
  language,
  onSave,
  onBack,
}: {
  profile: AppProfile;
  language: string;
  onSave: (values: {
    fullName: string;
    craft: string;
    location: string;
    experience: string;
    bio: string;
  }) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState(profile.profile?.full_name ?? "");
  const [craft, setCraft] = useState(profile.artisan?.craft_type ?? "Bamboo");
  const [location, setLocation] = useState(profile.artisan?.location ?? "");
  const [experience, setExperience] = useState(String(profile.artisan?.years_of_experience ?? ""));
  const [bio, setBio] = useState(profile.artisan?.bio ?? "");
  const crafts = [
    "Pottery",
    "Textiles",
    "Handloom",
    "Bamboo",
    "Woodwork",
    "Jewellery",
    "Embroidery",
    "Painting",
    "Metal craft",
    "Other",
  ];
  const langLabel = LANGUAGES.find((l) => l.code === language)?.native || language;
  return (
    <div className="min-h-screen bg-[#fbf7ef] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm font-bold text-[#756e63]"
        >
          <ArrowLeft size={16} /> {t("common.back")}
        </button>
        <PageTitle
          eyebrow={t("nav.story")}
          title={t("profile.title")}
          description={t("profile.subtitle")}
        />
        <div className="mt-8 space-y-5 rounded-lg border border-[#e8dfd3] bg-white/70 p-5 shadow-[0_8px_24px_rgba(65,47,29,.05)] sm:p-8">
          <Field
            label={t("profile.fullName")}
            value={fullName}
            onChange={setFullName}
            placeholder="Your name"
          />
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
              {t("profile.craft")}
            </span>
            <div className="flex flex-wrap gap-2">
              {crafts.map((item) => (
                <button
                  key={item}
                  onClick={() => setCraft(item)}
                  className={cn(
                    "rounded-md border px-4 py-2.5 text-sm font-semibold transition",
                    craft === item
                      ? "border-[#b85f42] bg-[#b85f42] text-white"
                      : "border-[#e3d9cb] bg-white text-[#645b50] hover:border-[#c89e89]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("profile.location")}
              value={location}
              onChange={setLocation}
              placeholder="Village, state"
            />
            <Field
              label={t("profile.experience")}
              value={experience}
              onChange={setExperience}
              type="number"
              min={0}
              placeholder="0"
            />
          </div>
          <Field label={t("profile.language")} value={langLabel} onChange={() => {}} />
          <Field
            label={t("profile.bio")}
            value={bio}
            onChange={setBio}
            multiline
            placeholder="Tell buyers what makes your craft special..."
          />
          <PrimaryButton
            className="w-full"
            onClick={() =>
              onSave({
                fullName: fullName || "Artisan",
                craft,
                location: location || "India",
                experience,
                bio: bio || "A dedicated artisan preserving handmade traditions.",
              })
            }
          >
            {t("common.continue")} <ArrowRight size={17} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Topbar({
  view,
  demoMode,
  profile,
  onBack,
  onNavigate,
  unreadCount = 0,
}: {
  view: View;
  demoMode: boolean;
  profile?: AppProfile | null;
  onBack: () => void;
  onNavigate?: (view: View) => void;
  unreadCount?: number;
}) {
  const isMain = ["dashboard", "products", "marketplace", "messages", "profile"].includes(view);
  const { language, setLanguage, t } = useI18n();
  const initials = useMemo(() => {
    const fullName = profile?.profile?.full_name?.trim();
    if (!fullName) return "MD";
    const parts = fullName.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [profile?.profile?.full_name]);
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#eee5d9]/80 bg-[#fbf7ef]/90 px-4 backdrop-blur-xl sm:px-8 lg:static lg:border-0 lg:bg-transparent">
      <div className="flex items-center gap-3 lg:hidden">
        {isMain ? (
          <Logo compact />
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[#756e63]"
          >
            <ArrowLeft size={17} /> {t("common.back")}
          </button>
        )}
      </div>
      <div className="hidden lg:block">
        {demoMode && (
          <span className="rounded-md bg-[#f3e5d6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a2553a]">
            {t("common.demo")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        <div className="flex items-center gap-1.5 rounded-md border border-[#e5ded2] bg-white px-2.5 py-1.5 text-xs font-bold text-[#675d50] shadow-sm">
          <Globe2 size={15} className="text-[#b85f42]" />
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            className="cursor-pointer bg-transparent text-xs font-bold text-[#4c4235] outline-none"
            aria-label={t("lang.changeLanguage")}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.native}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("messages")}
          aria-label={t("nav.messages")}
          title={t("nav.messages")}
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-white text-[#71685d] shadow-sm transition hover:bg-[#faf7f2] hover:text-[#b85f42] active:scale-95 active:opacity-80"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-[#b85f42] ring-2 ring-white" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onNavigate?.("profile")}
          aria-label={t("nav.profile")}
          title={t("nav.profile")}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#d7eadb] text-sm font-bold text-[#44694d] shadow-sm transition hover:opacity-90 active:scale-95"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}

function DesktopSidebar({
  view,
  onNavigate,
  t,
}: {
  view: MainView;
  onNavigate: (view: View) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#eee5d9] px-5 py-8 lg:flex">
      <Logo />
      <div className="mt-14 space-y-1">
        {navItems(t).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold transition",
              view === id
                ? "bg-[#f3e5d6] text-[#a2553a]"
                : "text-[#7d7468] hover:bg-white hover:text-[#443a31]",
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-auto rounded-lg bg-[#34483c] p-5 text-white">
        <Sparkles size={19} className="text-[#e8b06c]" />
        <p className="mt-4 font-display text-lg">{t("nav.story")}</p>
        <p className="mt-2 text-xs leading-5 text-white/65">{t("app.subtitle")}</p>
      </div>
    </aside>
  );
}

function BottomNav({
  view,
  onNavigate,
  t,
}: {
  view: MainView;
  onNavigate: (view: View) => void;
  t: (key: TranslationKey) => string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setVisible(scrollY > 25);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [view]);

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-[#e9dfd3] bg-[#fffdf9]/95 px-2 py-2 shadow-[0_-8px_20px_-6px_rgba(48,42,35,0.12)] backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none",
      )}
    >
      <div className="mx-auto flex max-w-lg justify-around">
        {navItems(t).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "flex min-w-[58px] flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-bold transition",
              view === id ? "bg-[#f3e5d6] text-[#a2553a]" : "text-[#93887b]",
            )}
          >
            <Icon size={19} strokeWidth={view === id ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Dashboard({
  profile,
  stats,
  products = [],
  enquiries = [],
  loading,
  onAdd,
  onNavigate,
}: {
  profile: AppProfile;
  stats: { total: number; published: number; views: number; enquiries: number };
  products?: MarketplaceProduct[];
  enquiries?: EnquiryCard[];
  loading: boolean;
  onAdd: () => void;
  onNavigate: (view: View) => void;
}) {
  const { t } = useI18n();
  const safeProducts = useMemo(() => products || [], [products]);
  const safeEnquiries = useMemo(() => enquiries || [], [enquiries]);
  const [tips, setTips] = useState([
    "Add a clear, well-lit photograph — buyers trust listings they can see properly.",
    "Mention exact dimensions so buyers know what to expect.",
    "Publish at least three products so buyers can see the range of your craft.",
  ]);
  useEffect(() => {
    const artisan = profile.artisan;
    if (!artisan) return;
    void generateBusinessAdvice({
      data: {
        craftType: artisan.craft_type ?? "Handicraft",
        productCount: stats.total,
        publishedCount: stats.published,
        views: stats.views,
        enquiries: stats.enquiries,
        sampleProducts: safeProducts.slice(0, 3).map((item) => item.name),
      },
    })
      .then((result) => {
        if (result?.tips && Array.isArray(result.tips)) {
          setTips(result.tips);
        }
      })
      .catch(() => {});
  }, [profile.artisan, safeProducts, stats]);
  const name = profile.profile?.full_name?.split(" ")[0] ?? "Artisan";
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#b85f42]">
            {t("dash.greeting")}, {name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#302a23] sm:mt-2 sm:text-4xl">
            {t("dash.tagline")}
          </h1>
          <p className="mt-1 text-sm text-[#81786c] sm:mt-2">{t("dash.subtitle")}</p>
        </div>
        <PrimaryButton onClick={onAdd}>
          <Plus size={18} /> {t("dash.addProduct")}
        </PrimaryButton>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label={t("dash.total")}
          value={stats.total}
          accent="bg-[#f3e5d6] text-[#b85f42]"
        />
        <StatCard
          icon={BadgeCheck}
          label={t("dash.published")}
          value={stats.published}
          accent="bg-[#dcebdc] text-[#4c7954]"
        />
        <StatCard
          icon={Eye}
          label={t("dash.views")}
          value={stats.views}
          accent="bg-[#e2ebef] text-[#53788a]"
        />
        <StatCard
          icon={MessageCircle}
          label={t("dash.enquiries")}
          value={stats.enquiries}
          accent="bg-[#eee0ed] text-[#8c5b85]"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <section className="warm-gradient relative overflow-hidden rounded-lg p-6 text-white shadow-[0_12px_30px_rgba(184,95,66,.18)] sm:p-8">
          <div className="relative z-10 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              <Sparkles size={13} /> {t("dash.journey")}
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">
              {t("dash.journeyTitle")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">{t("dash.journeySubtitle")}</p>
            <PrimaryButton
              variant="secondary"
              className="mt-6 border-0 bg-white/15 text-white hover:bg-white/25"
              onClick={onAdd}
            >
              {t("dash.createListing")} <ArrowRight size={16} />
            </PrimaryButton>
          </div>
          <div className="absolute -bottom-16 -right-8 h-52 w-52 rounded-full border-[25px] border-white/10" />
          <div className="absolute -right-10 top-8 h-28 w-28 rounded-full bg-[#e5ad72]/35 blur-2xl" />
        </section>
        <section className="surface-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b85f42]">
                {t("dash.coach")}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#3a3027]">
                {t("dash.coachSubtitle")}
              </h2>
            </div>
            <div className="rounded-md bg-[#f3e5d6] p-3 text-[#b85f42]">
              <WandSparkles size={20} />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {(tips || []).slice(0, 2).map((tip) => (
              <div
                key={tip}
                className="flex gap-3 rounded-md bg-[#fbf7ef] p-3 text-xs leading-5 text-[#70675b]"
              >
                <Check size={15} className="mt-0.5 shrink-0 text-[#5e8a64]" />
                {tip}
              </div>
            ))}
          </div>
        </section>
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">{t("dash.recentProducts")}</h2>
          <button
            onClick={() => onNavigate("products")}
            className="flex items-center gap-1 text-sm font-bold text-[#b85f42]"
          >
            {t("dash.viewAll")} <ChevronRight size={15} />
          </button>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-64 animate-pulse rounded-lg bg-[#eee5d8]" />
            <div className="h-64 animate-pulse rounded-lg bg-[#eee5d8]" />
          </div>
        ) : safeProducts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {safeProducts.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onNavigate("products")}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title={t("dash.emptyTitle")}
            description={t("dash.emptyDesc")}
            action={
              <PrimaryButton onClick={onAdd}>
                <Plus size={16} /> {t("dash.addProduct")}
              </PrimaryButton>
            }
          />
        )}
      </section>
      <section className="surface-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#dcebdc] text-[#4c7954]">
            <MessageCircle size={21} />
          </div>
          <div>
            <p className="font-semibold">{t("dash.messages")}</p>
            <p className="mt-1 text-sm text-[#81786c]">
              {safeEnquiries.filter((item) => item.status === "new").length}{" "}
              {t("dash.messagesWaiting")}
            </p>
          </div>
        </div>
        <PrimaryButton variant="secondary" onClick={() => onNavigate("messages")}>
          {t("dash.openMessages")} <ArrowRight size={16} />
        </PrimaryButton>
      </section>
    </div>
  );
}

function AddProduct({
  onTakePhoto,
  onUploadPhoto,
  onVoice,
  onManual,
  onBack,
}: {
  onTakePhoto: () => void;
  onUploadPhoto: (file: File) => void;
  onVoice: () => void;
  onManual: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const uploadRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("nav.dashboard")}
      </button>
      <PageTitle
        eyebrow={t("add.eyebrow")}
        title={t("add.title")}
        description={t("add.subtitle")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={onTakePhoto}
          className="group surface-card relative min-h-44 overflow-hidden p-6 text-left transition hover:-translate-y-1 hover:border-[#c9937f]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#f3e5d6] text-[#b85f42]">
            <Camera size={23} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("add.takePhoto")}</h3>
          <p className="mt-1 text-sm text-[#83796d]">{t("add.takePhotoDesc")}</p>
          <ChevronRight className="absolute bottom-6 right-6 text-[#b85f42]" />
        </button>
        <button
          onClick={() => uploadRef.current?.click()}
          className="group surface-card min-h-44 p-6 text-left transition hover:-translate-y-1 hover:border-[#c9937f]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e1ece1] text-[#4c7954]">
            <Upload size={23} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("add.uploadPhoto")}</h3>
          <p className="mt-1 text-sm text-[#83796d]">{t("add.uploadPhotoDesc")}</p>
          <ChevronRight className="float-right text-[#4c7954]" />
        </button>
        <button
          onClick={onVoice}
          className="surface-card relative min-h-44 border-[#d9b59f] bg-[#fff8f1] p-6 text-left transition hover:-translate-y-1"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#b85f42] text-white">
            <Mic size={23} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("add.voice")}</h3>
          <p className="mt-1 text-sm text-[#83796d]">{t("add.voiceDesc")}</p>
          <span className="absolute right-5 top-5 rounded-md bg-[#f1dfd0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#a2553a]">
            {t("add.easyStart")}
          </span>
        </button>
        <button
          onClick={onManual}
          className="surface-card min-h-44 p-6 text-left transition hover:-translate-y-1"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e8e5ef] text-[#6e628d]">
            <FileText size={23} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("add.manual")}</h3>
          <p className="mt-1 text-sm text-[#83796d]">{t("add.manualDesc")}</p>
          <ChevronRight className="float-right text-[#6e628d]" />
        </button>
      </div>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onUploadPhoto(file);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}

function CameraScreen({ onImage, onBack }: { onImage: (file: File) => void; onBack: () => void }) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setStreamActive(true);
          }
        })
        .catch((err) => {
          console.warn("Live camera access unavailable:", err);
          setCameraError(t("camera.error"));
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [t]);

  function captureSnapshot() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
          onImage(file);
        }
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <PageTitle
        eyebrow={t("camera.eyebrow")}
        title={t("camera.title")}
        description={t("camera.desc")}
      />
      <div className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-lg bg-[#342c24] text-center text-white shadow-xl">
        {streamActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-8 rounded-md border border-dashed border-white/40" />
            <div className="absolute bottom-6 flex items-center gap-4">
              <button
                type="button"
                onClick={captureSnapshot}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#b85f42] text-white shadow-lg transition hover:scale-105 active:scale-95"
                title={t("camera.capture")}
              >
                <Camera size={26} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center p-8">
            <div className="pointer-events-none absolute inset-8 rounded-md border border-dashed border-white/35" />
            <Camera size={44} strokeWidth={1.3} className="text-[#e5ad72]" />
            <p className="relative mt-5 font-display text-2xl">{t("camera.ready")}</p>
            <p className="relative mt-2 max-w-xs text-sm leading-6 text-white/60">
              {cameraError || t("camera.hint")}
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <PrimaryButton
                className="bg-white text-[#342c24] hover:bg-[#fff6ec]"
                onClick={() => inputRef.current?.click()}
              >
                <Camera size={17} /> {t("camera.openGallery")}
              </PrimaryButton>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onImage(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <p className="text-center text-xs text-[#8b8175]">{t("camera.hint")}</p>
    </div>
  );
}

function Studio({
  draft,
  onUse,
  onRetake,
}: {
  draft: ProductDraft;
  onUse: (processed: Blob, url: string) => void;
  onRetake: () => void;
}) {
  const { t } = useI18n();
  const [processing, setProcessing] = useState(true);
  const [phase, setPhase] = useState(0);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(draft.imageBlob);
  const [processedUrl, setProcessedUrl] = useState<string | null>(
    draft.imageUrl ?? draft.originalImageUrl,
  );
  const phases = [
    t("studio.phase0"),
    t("studio.phase1"),
    t("studio.phase2"),
    t("studio.phase3"),
    t("studio.phase4"),
  ];

  useEffect(() => {
    const interval = window.setInterval(
      () => setPhase((current) => Math.min(current + 1, phases.length - 1)),
      500,
    );
    let alive = true;
    if (draft.originalBlob) {
      void enhanceProductImage(draft.originalBlob)
        .then(async (blob) => {
          if (!alive) return;
          const url = await blobToDataUrl(blob);
          setProcessedBlob(blob);
          setProcessedUrl(url);
          setProcessing(false);
        })
        .catch(() => {
          if (alive) {
            setProcessedBlob(draft.originalBlob);
            setProcessedUrl(draft.originalImageUrl);
            setProcessing(false);
          }
        });
    } else {
      window.setTimeout(() => {
        if (alive) {
          setProcessedBlob(draft.imageBlob);
          setProcessedUrl(draft.imageUrl ?? draft.originalImageUrl);
          setProcessing(false);
        }
      }, 1200);
    }
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageTitle
        eyebrow={t("studio.eyebrow")}
        title={t("studio.title")}
        description={t("studio.desc")}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#847a6d]">
            {t("studio.original")}
          </p>
          <div className="aspect-square overflow-hidden rounded-lg bg-[#eee5d8]">
            <ImageBox src={draft.originalImageUrl} alt="Original product" />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#b85f42]">
            {t("studio.enhanced")}
          </p>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eee5d8]">
            <ImageBox src={processedUrl ?? draft.originalImageUrl} alt="Enhanced product" />
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#342c24]/80 p-6 text-center text-white backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <WandSparkles size={30} />
                </motion.div>
                <p className="mt-5 text-sm font-bold">{phases[phase]}</p>
                <div className="mt-4 h-1 w-36 overflow-hidden rounded bg-white/20">
                  <motion.div
                    className="h-full bg-[#e5ad72]"
                    animate={{ width: `${(phase + 1) * 20}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <PrimaryButton variant="secondary" onClick={onRetake}>
          <Camera size={17} /> {t("studio.retake")}
        </PrimaryButton>
        <PrimaryButton
          disabled={processing}
          onClick={() => {
            const blob = processedBlob ?? draft.originalBlob;
            const url = processedUrl ?? draft.originalImageUrl ?? "";
            if (blob && url) {
              onUse(blob, url);
            } else if (url) {
              fetch(url)
                .then((r) => r.blob())
                .then((b) => onUse(b, url))
                .catch(() => onUse(new Blob(), url));
            }
          }}
        >
          {t("studio.use")} <ArrowRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );
}

function VoiceDescription({
  draft,
  onUse,
  onBack,
}: {
  draft: ProductDraft;
  onUse: (transcript: string) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState(
    draft.transcript ||
      "Handcrafted bamboo storage basket woven with natural cane finish. Sturdy handles, ideal for fruit or laundry.",
  );
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
  } | null>(null);

  const samplePrompts = [
    "Handcrafted bamboo basket with sturdy handle and cane weave. Takes 3 days to make.",
    "Handwoven Chanderi cotton scarf in indigo and ivory, soft natural dye with tassels.",
    "Terracotta clay diya set of 12 pieces with traditional hand-thrown earthen finish.",
    "Hand-carved sheesham wood jewelry box with brass floral inlay and velvet lining.",
  ];

  function toggleRecording() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const speechWindow = window as unknown as {
      SpeechRecognition?: new () => typeof recognitionRef.current;
      webkitSpeechRecognition?: new () => typeof recognitionRef.current;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      if (!recognition) return;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ");
        setText(transcript);
      };
      recognition.onend = () => setListening(false);
      recognition.onerror = () => {
        setListening(false);
        setSupported(false);
      };
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setSupported(false);
      setListening(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <PageTitle
        eyebrow={t("voice.eyebrow")}
        title={t("voice.title")}
        description={t("voice.desc")}
      />
      <div className="surface-card flex flex-col items-center px-6 py-8 text-center sm:px-12">
        <motion.button
          animate={
            listening
              ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(184,95,66,.3)",
                    "0 0 0 18px rgba(184,95,66,0)",
                    "0 0 0 0 rgba(184,95,66,0)",
                  ],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.6 }}
          onClick={toggleRecording}
          className={cn(
            "flex h-28 w-28 items-center justify-center rounded-full text-white shadow-[0_15px_28px_rgba(184,95,66,.2)] transition hover:brightness-105",
            listening ? "bg-[#a34432]" : "bg-[#b85f42]",
          )}
        >
          <Mic size={40} strokeWidth={1.5} />
        </motion.button>
        <p className="mt-5 font-semibold text-[#45392e]">
          {listening
            ? t("voice.listening")
            : supported
              ? t("voice.tapToSpeak")
              : t("voice.unavailable")}
        </p>

        <div className="mt-4 w-full text-left">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#867b6f] mb-2">
            {t("voice.quickSamples")}
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setText(prompt)}
                className="rounded-md border border-[#e5ded2] bg-[#f8f5ee] px-3 py-1.5 text-xs text-[#5f5548] hover:bg-[#ebdccb] text-left transition"
              >
                {prompt.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 w-full text-left">
          <Field label={t("voice.recognizedDesc")} value={text} onChange={setText} multiline />
        </div>
        <div className="mt-5 flex w-full flex-col gap-3 sm:flex-row">
          <PrimaryButton variant="secondary" className="flex-1" onClick={() => setText("")}>
            <Mic size={17} /> {t("voice.clear")}
          </PrimaryButton>
          <PrimaryButton className="flex-1" onClick={() => onUse(text)} disabled={!text.trim()}>
            {t("voice.use")} <ArrowRight size={17} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Catalogue({
  draft,
  setDraft,
  onGenerate,
  onContinue,
  onBack,
  generating,
  onUploadPhoto,
  notify,
}: {
  draft: ProductDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProductDraft>>;
  onGenerate: () => void;
  onContinue: () => void;
  onBack: () => void;
  generating: boolean;
  onUploadPhoto?: (file: File) => void;
  notify?: (message: string) => void;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"en" | "hi">("en");
  const [newFeature, setNewFeature] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof ProductDraft, value: string | number) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const categoryNames = [
    "Pottery",
    "Textiles",
    "Handloom",
    "Bamboo",
    "Woodwork",
    "Jewellery",
    "Embroidery",
    "Painting",
    "Metal craft",
    "Home Décor",
    "Other",
  ];

  const sampleImages = [
    { label: "Bamboo Basket", url: "/demo/bamboo-basket.jpg", cat: "Bamboo" },
    { label: "Cotton Scarf", url: "/demo/cotton-scarf.jpg", cat: "Handloom" },
    { label: "Terracotta Diya", url: "/demo/terracotta-diya.jpg", cat: "Other" },
    { label: "Pottery Vase", url: "/demo/pottery-vase.jpg", cat: "Pottery" },
    { label: "Wooden Box", url: "/demo/wooden-box.jpg", cat: "Woodwork" },
  ];

  function addFeature() {
    if (!newFeature.trim()) return;
    setDraft((current) => ({
      ...current,
      key_features: [...current.key_features, newFeature.trim()],
    }));
    setNewFeature("");
  }

  function handleContinue() {
    if (!draft.name.trim()) {
      if (notify) notify(t("cat.nameRequired"));
      return;
    }
    onContinue();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageTitle eyebrow={t("cat.eyebrow")} title={t("cat.title")} description={t("cat.desc")} />
        <PrimaryButton variant="secondary" onClick={onGenerate} disabled={generating}>
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}{" "}
          {t("cat.regenerate")}
        </PrimaryButton>
      </div>

      <div className="surface-card overflow-hidden p-5 sm:p-8">
        {generating && (
          <div className="mb-6 flex items-center gap-3 rounded-md bg-[#f3e5d6] p-4 text-sm font-semibold text-[#9b553c]">
            <Loader2 className="animate-spin" size={18} /> {t("cat.loading")}
          </div>
        )}

        {/* Image selector / thumbnail preview */}
        <div className="mb-7 rounded-md border border-[#e8dfd2] bg-[#fbf9f5] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md bg-[#eee5d8] border border-[#dfd5c7] flex-shrink-0">
                <ImageBox
                  src={draft.imageUrl ?? draft.originalImageUrl}
                  alt={draft.name || "Product image"}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#867a6e]">
                  {t("cat.productImage")}
                </p>
                <p className="text-sm font-semibold text-[#3b3228]">
                  {draft.imageUrl || draft.originalImageUrl
                    ? t("cat.photoAttached")
                    : t("cat.noPhoto")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && onUploadPhoto) onUploadPhoto(file);
                  event.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md border border-[#d6caba] bg-white px-3 py-2 text-xs font-bold text-[#625647] hover:bg-[#f6eee4]"
              >
                <Camera size={14} /> {t("cat.uploadPhoto")}
              </button>
            </div>
          </div>
          {!draft.imageUrl && !draft.originalImageUrl && (
            <div className="mt-3 pt-3 border-t border-[#eee5d9]">
              <p className="text-xs text-[#8c8274] mb-2 font-medium">{t("cat.pickMatching")}</p>
              <div className="flex flex-wrap gap-2">
                {sampleImages.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        imageUrl: sample.url,
                        originalImageUrl: sample.url,
                        category: sample.cat,
                      }))
                    }
                    className="flex items-center gap-1.5 rounded-md border border-[#e4d9cb] bg-white px-2.5 py-1 text-xs text-[#6e6355] hover:bg-[#f3ece0]"
                  >
                    <Sparkles size={11} className="text-[#b85f42]" />
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 flex gap-2 rounded-md bg-[#f4eee6] p-1">
          <button
            onClick={() => setTab("en")}
            className={cn(
              "flex-1 rounded-sm py-2.5 text-sm font-bold",
              tab === "en" ? "bg-white text-[#3f342b] shadow-sm" : "text-[#8e8478]",
            )}
          >
            English
          </button>
          <button
            onClick={() => setTab("hi")}
            className={cn(
              "flex-1 rounded-sm py-2.5 text-sm font-bold",
              tab === "hi" ? "bg-white text-[#3f342b] shadow-sm" : "text-[#8e8478]",
            )}
          >
            हिन्दी
          </button>
        </div>

        {tab === "en" ? (
          <div className="space-y-5">
            <Field
              label={t("cat.nameLabel")}
              value={draft.name}
              onChange={(value) => update("name", value)}
              placeholder="Handcrafted Bamboo Storage Basket"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
                  {t("cat.categoryLabel")}
                </span>
                <select
                  value={draft.category}
                  onChange={(event) => update("category", event.target.value)}
                  className="w-full rounded-md border border-[#e5ded2] bg-white/80 px-4 py-3.5 text-sm outline-none focus:border-[#bb6547]"
                >
                  {categoryNames.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <Field
                label={t("cat.craftTypeLabel")}
                value={draft.craft_type}
                onChange={(value) => update("craft_type", value)}
                placeholder="Bamboo weave"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label={t("cat.materialLabel")}
                value={draft.material}
                onChange={(value) => update("material", value)}
                placeholder="Natural bamboo cane"
              />
              <Field
                label={t("cat.colourLabel")}
                value={draft.colour}
                onChange={(value) => update("colour", value)}
                placeholder="Golden honey"
              />
              <Field
                label={t("cat.sizeLabel")}
                value={draft.size}
                onChange={(value) => update("size", value)}
                placeholder="28 cm dia x 22 cm"
              />
            </div>
            <Field
              label={t("cat.timeLabel")}
              value={draft.production_time}
              onChange={(value) => update("production_time", value)}
              placeholder="3 days"
            />
            <Field
              label={t("cat.descLabel")}
              value={draft.description}
              onChange={(value) => update("description", value)}
              multiline
              placeholder="A tight, durable weave shaped from locally harvested bamboo..."
            />

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
                {t("cat.keyFeatures")}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.key_features.map((feature, index) => (
                  <span
                    key={`${feature}-${index}`}
                    className="flex items-center gap-2 rounded-md bg-[#e1ece1] px-3 py-2 text-xs font-semibold text-[#4b7151]"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          key_features: current.key_features.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex max-w-sm gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="e.g. 100% Biodegradable"
                  className="flex-1 rounded-md border border-[#e5ded2] bg-white px-3 py-2 text-xs outline-none focus:border-[#bb6547]"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="rounded-md bg-[#b85f42] px-3 py-2 text-xs font-bold text-white hover:bg-[#a25137]"
                >
                  {t("cat.addFeature")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Field
              label={t("cat.nameInHindi")}
              value={draft.name}
              onChange={(value) => update("name", value)}
            />
            <Field
              label={t("cat.descInHindi")}
              value={draft.description_hindi}
              onChange={(value) => update("description_hindi", value)}
              multiline
            />
            <div className="rounded-md bg-[#fbf7ef] p-4 text-sm leading-6 text-[#756e63]">
              <Globe2 size={17} className="mb-2 text-[#b85f42]" />
              {t("cat.hindiNote")}
            </div>
            <PrimaryButton
              variant="secondary"
              onClick={async () => {
                if (draft.description) {
                  const result = await translateProduct({
                    data: {
                      text: draft.description,
                      target: "Hindi",
                    },
                  });
                  setDraft((current) => ({ ...current, description_hindi: result.text }));
                }
              }}
            >
              {t("cat.translateFromEn")} <Globe2 size={16} />
            </PrimaryButton>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <PrimaryButton onClick={handleContinue}>
            {t("cat.continueToPricing")} <ArrowRight size={17} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Pricing({
  draft,
  setDraft,
  onContinue,
  onBack,
  generating,
}: {
  draft: ProductDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProductDraft>>;
  onContinue: () => void;
  onBack: () => void;
  generating: boolean;
}) {
  const { t } = useI18n();
  const [costs, setCosts] = useState({ material: 250, labour: 250, packaging: 40, other: 30 });
  const [result, setResult] = useState<PriceRecommendation | null>(
    draft.pricing as PriceRecommendation | null,
  );
  const base = costs.material + costs.labour + costs.packaging + costs.other;
  async function calculate() {
    let response;
    try {
      response = await recommendPrice({
        data: {
          productName: draft.name,
          craftType: draft.craft_type,
          ...costs,
          productionTime: draft.production_time,
        },
      });
    } catch (error) {
      console.warn("Price recommendation fell back to the local demo.", error);
      const centre = base * 1.3;
      response = {
        base_cost: base,
        recommended_min: Math.max(1, Math.round((centre * 0.95) / 10) * 10 - 1),
        recommended_max: Math.max(1, Math.round((centre * 1.1) / 10) * 10 - 1),
        margin_percentage: 30,
        market_adjustment: 1,
        reasoning: `Your production cost of ₹${base} covers materials, labour and packaging. A 30% margin keeps the price competitive with comparable handmade listings.`,
        ai_generated: false,
      };
    }
    const next = {
      ...response,
      material_cost: costs.material,
      labour_cost: costs.labour,
      packaging_cost: costs.packaging,
      other_cost: costs.other,
    };
    setResult(next);
    setDraft((current) => ({
      ...current,
      pricing: next,
      price: current.price && current.price > 0 ? current.price : response.recommended_min,
    }));
  }
  useEffect(() => {
    if (!result) void calculate();
    // Calculate once for a fresh catalogue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReview() {
    if (!draft.price || draft.price <= 0) {
      const fallbackPrice = result?.recommended_min || Math.round(base * 1.3);
      setDraft((current) => ({ ...current, price: fallbackPrice }));
    }
    onContinue();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("cat.backToCat")}
      </button>
      <PageTitle
        eyebrow={t("price.eyebrow")}
        title={t("price.title")}
        description={t("price.desc")}
      />
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="surface-card space-y-4 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b85f42]">
            {t("price.yourCosts")}
          </p>
          <Field
            label={t("price.material")}
            value={costs.material}
            onChange={(value) =>
              setCosts((current) => ({ ...current, material: Number(value) || 0 }))
            }
            type="number"
            min={0}
          />
          <Field
            label={t("price.labour")}
            value={costs.labour}
            onChange={(value) =>
              setCosts((current) => ({ ...current, labour: Number(value) || 0 }))
            }
            type="number"
            min={0}
          />
          <Field
            label={t("price.packaging")}
            value={costs.packaging}
            onChange={(value) =>
              setCosts((current) => ({ ...current, packaging: Number(value) || 0 }))
            }
            type="number"
            min={0}
          />
          <Field
            label={t("price.other")}
            value={costs.other}
            onChange={(value) => setCosts((current) => ({ ...current, other: Number(value) || 0 }))}
            type="number"
            min={0}
          />
          <div className="flex items-center justify-between border-t border-[#eee5d9] pt-4 text-sm font-bold">
            <span>{t("price.baseCost")}</span>
            <span>{formatPrice(base)}</span>
          </div>
          <PrimaryButton
            variant="secondary"
            className="w-full"
            onClick={() => void calculate()}
            disabled={generating}
          >
            {generating ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={17} />}{" "}
            {t("price.recalculate")}
          </PrimaryButton>
        </div>
        <div className="warm-gradient flex min-h-[330px] flex-col rounded-lg p-6 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
                {t("price.suggestedRange")}
              </p>
              <p className="mt-3 font-display text-4xl font-semibold">
                {result
                  ? `${formatPrice(result.recommended_min)} – ${formatPrice(result.recommended_max)}`
                  : t("common.loading")}
              </p>
            </div>
            <div className="rounded-md bg-white/15 p-3">
              <IndianRupee size={23} />
            </div>
          </div>
          {result && (
            <div className="mt-7 space-y-3 text-sm text-white/80">
              <div className="flex justify-between">
                <span>{t("price.prodCost")}</span>
                <b className="text-white">{formatPrice(result.base_cost)}</b>
              </div>
              <div className="flex justify-between">
                <span>{t("price.margin")}</span>
                <b className="text-white">{Math.round(result.margin_percentage)}%</b>
              </div>
              <div className="flex justify-between">
                <span>{t("price.marketAdj")}</span>
                <b className="text-white">{result.market_adjustment.toFixed(2)}×</b>
              </div>
            </div>
          )}
          <div className="mt-auto rounded-md bg-white/10 p-4 text-xs leading-5 text-white/75">
            <CircleHelp size={15} className="mb-1 text-[#f0c685]" />
            {result?.reasoning ?? t("price.desc")}
          </div>
        </div>
      </div>
      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{t("price.finalPrice")}</p>
          <p className="mt-1 text-sm text-[#82796e]">{t("price.finalPriceDesc")}</p>
        </div>
        <div className="flex items-center rounded-md border border-[#e5ded2] bg-white px-3">
          <span className="text-[#8e8376]">₹</span>
          <input
            value={draft.price || ""}
            onChange={(event) =>
              setDraft((current) => ({ ...current, price: Number(event.target.value) || 0 }))
            }
            type="number"
            min={0}
            className="w-28 bg-transparent px-2 py-3 text-right text-lg font-bold outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={handleReview}>
          {t("price.reviewBtn")} <ArrowRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );
}

function Preview({
  draft,
  profile,
  onEditCatalogue,
  onEditPricing,
  onSaveDraft,
  onPublish,
  saving,
}: {
  draft: ProductDraft;
  profile: AppProfile;
  onEditCatalogue: () => void;
  onEditPricing: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  saving: boolean;
}) {
  const { t } = useI18n();
  const categoryFallback: Record<string, string> = {
    Bamboo: "/demo/bamboo-basket.jpg",
    Pottery: "/demo/pottery-vase.jpg",
    Handloom: "/demo/cotton-scarf.jpg",
    Textiles: "/demo/cotton-scarf.jpg",
    Woodwork: "/demo/wooden-box.jpg",
    Jewellery: "/demo/wooden-box.jpg",
    Other: "/demo/terracotta-diya.jpg",
  };
  const previewImage =
    draft.imageUrl ??
    draft.originalImageUrl ??
    categoryFallback[draft.category] ??
    "/demo/bamboo-basket.jpg";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageTitle
        eyebrow={t("preview.eyebrow")}
        title={t("preview.title")}
        description={t("preview.desc")}
      />
      <div className="overflow-hidden rounded-lg border border-[#e4d9cc] bg-white shadow-[0_12px_32px_rgba(65,47,29,.08)]">
        <div className="grid md:grid-cols-[.9fr_1.1fr]">
          <div className="aspect-square bg-[#eee5d8] md:aspect-auto">
            <ImageBox src={previewImage} alt={draft.name || "Product preview"} />
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-[#f3e5d6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#a2553a]">
                  {draft.category || "Handmade"}
                </span>
                <h2 className="mt-4 font-display text-3xl font-semibold text-[#342c24]">
                  {draft.name || "Untitled product"}
                </h2>
              </div>
              <button
                onClick={onEditCatalogue}
                className="rounded-md p-2 text-[#a2553a] hover:bg-[#f7eee5]"
                title={t("preview.editCatalogue")}
              >
                <Edit3 size={17} />
              </button>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6f665b]">
              {draft.description || "Add a short description to help buyers understand your work."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.material")}</p>
                <p className="mt-1 font-semibold">{draft.material || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.size")}</p>
                <p className="mt-1 font-semibold">{draft.size || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("preview.madeIn")}</p>
                <p className="mt-1 font-semibold">{profile.artisan?.location || "India"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.time")}</p>
                <p className="mt-1 font-semibold">{draft.production_time || "—"}</p>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-[#eee5d9] pt-5">
              <div>
                <p className="text-xs text-[#988e82]">{t("preview.yourPrice")}</p>
                <p className="mt-1 text-2xl font-bold text-[#b85f42]">{formatPrice(draft.price)}</p>
              </div>
              <button onClick={onEditPricing} className="text-xs font-bold text-[#b85f42]">
                {t("preview.changePrice")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <PrimaryButton variant="secondary" onClick={onSaveDraft} disabled={saving}>
          <FileText size={17} /> {t("preview.saveDraft")}
        </PrimaryButton>
        <PrimaryButton onClick={onPublish} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={17} /> : <Store size={17} />}{" "}
          {t("preview.publish")}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Success({
  product,
  onView,
  onMarket,
  onDashboard,
}: {
  product: ProductDraft;
  onView: () => void;
  onMarket: () => void;
  onDashboard: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.45 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-[#dcebdc] text-[#4c7954]"
      >
        <Check size={45} strokeWidth={2.2} />
      </motion.div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#4c7954]">
        {t("success.eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl font-semibold">{t("success.title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#7c7367]">{t("success.desc")}</p>
      <div className="mt-8 w-full overflow-hidden rounded-lg border border-[#e4d9cc] bg-white text-left shadow-sm">
        <div className="flex gap-4 p-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[#eee5d8]">
            <ImageBox src={product.imageUrl ?? product.originalImageUrl} alt={product.name} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#b85f42]">
              {product.category}
            </p>
            <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold">{product.name}</h3>
            <p className="mt-2 font-bold text-[#b85f42]">{formatPrice(product.price)}</p>
          </div>
        </div>
      </div>
      <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row">
        <PrimaryButton variant="secondary" className="flex-1" onClick={onView}>
          {t("success.view")}
        </PrimaryButton>
        <PrimaryButton className="flex-1" onClick={onMarket}>
          {t("success.marketplace")} <ArrowRight size={16} />
        </PrimaryButton>
      </div>
      <button onClick={onDashboard} className="mt-6 text-sm font-bold text-[#83796e]">
        {t("success.dashboard")}
      </button>
    </div>
  );
}

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function Marketplace({
  products,
  allProducts,
  search,
  setSearch,
  category,
  setCategory,
  onOpen,
  onRefresh,
}: {
  products: MarketplaceProduct[];
  allProducts: MarketplaceProduct[];
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  onOpen: (product: MarketplaceProduct) => void;
  onRefresh: () => void;
}) {
  const { language, t } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass =
      (
        window as unknown as {
          SpeechRecognition?: new () => BrowserSpeechRecognition;
          webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: new () => BrowserSpeechRecognition;
          webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceStatus(
        language === "hi"
          ? "इस ब्राउज़र में वॉइस सर्च समर्थित नहीं है।"
          : "Voice search is not supported in this browser.",
      );
      setTimeout(() => setVoiceStatus(null), 4000);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        te: "te-IN",
        ta: "ta-IN",
        kn: "kn-IN",
        mr: "mr-IN",
      };
      recognition.lang = langMap[language] || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus(language === "hi" ? "सुन रहा हूँ... बोलिए" : "Listening... Speak now");
      };

      recognition.onresult = (event) => {
        const results = event.results;
        if (results && results.length > 0) {
          const transcript = results[0][0]?.transcript || "";
          if (transcript) {
            setSearch(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceStatus(
            language === "hi"
              ? "माइक्रोफ़ोन की अनुमति अस्वीकृत है।"
              : "Microphone permission was denied. Please allow microphone access.",
          );
        } else if (event.error === "no-speech") {
          setVoiceStatus(
            language === "hi"
              ? "कोई आवाज़ नहीं सुनाई दी।"
              : "No speech detected. Please try again.",
          );
        } else if (event.error !== "aborted") {
          setVoiceStatus(
            language === "hi" ? "वॉइस सर्च विफल हुआ।" : "Voice search error. Please try again.",
          );
        }
        setTimeout(() => setVoiceStatus(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        setTimeout(() => {
          setVoiceStatus((prev) =>
            prev?.startsWith("Listening") || prev?.startsWith("सुन रहा") ? null : prev,
          );
        }, 800);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      setVoiceStatus(
        language === "hi"
          ? "वॉइस सर्च शुरू नहीं हो सका।"
          : "Could not start voice search. Please try typing.",
      );
      setTimeout(() => setVoiceStatus(null), 4000);
    }
  }, [isListening, language, setSearch, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const cats = [
    "All",
    ...Array.from(
      new Set(allProducts.map((product) => product.category_name).filter(Boolean) as string[]),
    ),
  ];
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageTitle
          eyebrow={t("app.tagline")}
          title={t("market.title")}
          description={t("app.subtitle")}
        />
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 self-start rounded-md px-3 py-2 text-sm font-bold text-[#83796e] hover:bg-white"
        >
          <Compass size={16} /> {t("common.retry")}
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9082]" size={19} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("market.search")}
              className="w-full rounded-md border border-[#e5ded2] bg-white px-12 py-4 text-sm outline-none shadow-sm focus:border-[#bb6547] focus:ring-4 focus:ring-[#bb6547]/10"
            />
          </div>
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? "Stop voice search" : "Voice search"}
            title={isListening ? "Stop voice search" : "Voice search"}
            className={cn(
              "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-md border shadow-sm transition",
              isListening
                ? "border-[#bb6547] bg-[#fbf2eb] text-[#bb6547] ring-4 ring-[#bb6547]/15 animate-pulse"
                : "border-[#e5ded2] bg-white text-[#83796e] hover:border-[#bb6547] hover:text-[#bb6547]",
            )}
          >
            <Mic size={20} className={cn(isListening && "animate-bounce text-[#bb6547]")} />
          </button>
        </div>
        {voiceStatus && (
          <div
            role="status"
            className="flex items-center gap-2 px-1 text-xs font-medium text-[#a2553a]"
          >
            {isListening && <span className="h-2 w-2 animate-ping rounded-full bg-[#bb6547]" />}
            <span>{voiceStatus}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cats.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2.5 text-xs font-bold transition",
              category === item
                ? "bg-[#342c24] text-white"
                : "bg-white text-[#766c60] hover:bg-[#f3e5d6]",
            )}
          >
            {item === "All" ? t("market.all") : item}
          </button>
        ))}
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => onOpen(product)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title={t("market.noProducts")}
          description={t("dash.emptyDesc")}
          action={
            <PrimaryButton
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              {t("common.cancel")}
            </PrimaryButton>
          }
        />
      )}
    </div>
  );
}

function Details({
  product,
  onContact,
  onBack,
}: {
  product: MarketplaceProduct | null;
  onContact: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  if (!product)
    return (
      <EmptyState
        icon={Package}
        title={t("market.noProducts")}
        description={t("common.error")}
        action={<PrimaryButton onClick={onBack}>{t("common.back")}</PrimaryButton>}
      />
    );
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <div className="overflow-hidden rounded-lg border border-[#e4d9cc] bg-white shadow-sm">
        <div className="grid md:grid-cols-[1.05fr_.95fr]">
          <div className="aspect-square bg-[#eee5d8] md:aspect-auto">
            <ImageBox src={product.image_url} alt={product.name} />
          </div>
          <div className="p-6 sm:p-10">
            <span className="rounded-md bg-[#f3e5d6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#a2553a]">
              {product.category_name ?? product.craft_type}
            </span>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-[#b85f42]">{formatPrice(product.price)}</p>
            <p className="mt-6 text-sm leading-7 text-[#70675b]">{product.description}</p>
            <div className="mt-7 grid grid-cols-2 gap-5 border-y border-[#eee5d9] py-5 text-sm">
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.material")}</p>
                <p className="mt-1 font-semibold">{product.material || "Handmade materials"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.size")}</p>
                <p className="mt-1 font-semibold">{product.size || "Made to order"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.location")}</p>
                <p className="mt-1 font-semibold">{product.artisan_location ?? "India"}</p>
              </div>
              <div>
                <p className="text-xs text-[#988e82]">{t("detail.time")}</p>
                <p className="mt-1 font-semibold">{product.production_time || "—"}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcebdc] font-bold text-[#4c7954]">
                {product.artisan_name?.slice(0, 1) ?? "A"}
              </div>
              <div>
                <p className="font-semibold">{product.artisan_name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#82796e]">
                  <MapPin size={12} /> {product.artisan_location ?? "India"}
                </p>
              </div>
            </div>
            <div className="mt-7 flex gap-3">
              <PrimaryButton className="flex-1" onClick={onContact}>
                <MessageCircle size={17} /> {t("detail.contact")}
              </PrimaryButton>
              <PrimaryButton
                variant="secondary"
                className="px-4"
                onClick={() => {
                  void navigator.clipboard?.writeText(window.location.href);
                }}
              >
                <Share2 size={17} />
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Enquiry({
  product,
  onSubmit,
  onBack,
}: {
  product: MarketplaceProduct | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [buyerName, setBuyerName] = useState("");
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#756e63]">
        <ArrowLeft size={16} /> {t("common.back")}
      </button>
      <PageTitle
        eyebrow={t("app.name")}
        title={t("enquiry.title")}
        description={
          product ? `${product.name} · ${product.artisan_name ?? "Artisan"}` : t("enquiry.sub")
        }
      />
      <form onSubmit={onSubmit} className="surface-card space-y-5 p-6 sm:p-8">
        <Field
          name="buyerName"
          label={t("enquiry.name")}
          value={buyerName}
          onChange={setBuyerName}
          placeholder={t("enquiry.name")}
        />
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
            {t("enquiry.contact")}
          </span>
          <input
            name="buyerContact"
            required
            className="w-full rounded-md border border-[#e5ded2] bg-white/80 px-4 py-3.5 text-sm outline-none focus:border-[#bb6547]"
            placeholder={t("enquiry.contact")}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
            {t("enquiry.message")}
          </span>
          <textarea
            name="message"
            required
            defaultValue={t("enquiry.default")}
            className="min-h-32 w-full resize-y rounded-md border border-[#e5ded2] bg-white/80 px-4 py-3.5 text-sm outline-none focus:border-[#bb6547]"
          />
        </label>
        <PrimaryButton type="submit" className="w-full">
          <Send size={17} /> {t("enquiry.send")}
        </PrimaryButton>
      </form>
    </div>
  );
}

function Messages({
  enquiries,
  onMark,
}: {
  enquiries: EnquiryCard[];
  onMark: (enquiry: EnquiryCard, status: EnquiryStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-7">
      <PageTitle
        eyebrow={t("app.name")}
        title={t("messages.title")}
        description={t("dash.subtitle")}
      />
      {enquiries.length ? (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="surface-card p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#eee0ed] text-[#8c5b85]">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{enquiry.buyer_name}</p>
                    <p className="mt-1 text-xs text-[#887e72]">
                      {enquiry.products?.name ?? t("messages.title")} ·{" "}
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "self-start rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                    enquiry.status === "new"
                      ? "bg-[#f3e5d6] text-[#a2553a]"
                      : "bg-[#dcebdc] text-[#4c7954]",
                  )}
                >
                  {enquiry.status === "new" ? t("messages.new") : t("messages.contacted")}
                </span>
              </div>
              <p className="mt-5 rounded-md bg-[#fbf7ef] p-4 text-sm leading-6 text-[#685f53]">
                “{enquiry.message}”
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${enquiry.buyer_contact}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e3d9cb] px-3 text-xs font-bold text-[#665c50]"
                >
                  <Mail size={14} /> {enquiry.buyer_contact}
                </a>
                {enquiry.status === "new" && (
                  <PrimaryButton
                    className="min-h-10 rounded-md px-3 text-xs"
                    onClick={() => onMark(enquiry, "contacted")}
                  >
                    <Check size={14} /> {t("messages.markContacted")}
                  </PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title={t("messages.title")}
          description={t("messages.empty")}
        />
      )}
    </div>
  );
}

function MyProducts({
  products,
  selectedTab,
  setSelectedTab,
  onEdit,
  onView,
  onDelete,
  onArchive,
  onAdd,
}: {
  products: MarketplaceProduct[];
  selectedTab: "draft" | "published" | "archived";
  setSelectedTab: (tab: "draft" | "published" | "archived") => void;
  onEdit: (product: MarketplaceProduct) => void;
  onView: (product: MarketplaceProduct) => void;
  onDelete: (product: MarketplaceProduct) => void;
  onArchive: (product: MarketplaceProduct) => void;
  onAdd: () => void;
}) {
  const { t } = useI18n();
  const visible = products.filter((product) => product.status === selectedTab);
  const tabLabel = (tab: "draft" | "published" | "archived") => {
    if (tab === "draft") return t("products.drafts");
    if (tab === "published") return t("products.published");
    return t("products.archived");
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageTitle
          eyebrow={t("dash.journey")}
          title={t("products.title")}
          description={t("dash.subtitle")}
        />
        <PrimaryButton onClick={onAdd}>
          <Plus size={17} /> {t("dash.addProduct")}
        </PrimaryButton>
      </div>
      <div className="flex gap-2 rounded-md bg-[#eee6db] p-1">
        {(["draft", "published", "archived"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              "flex-1 rounded-sm py-3 text-xs font-bold capitalize",
              selectedTab === tab ? "bg-white text-[#3e342b] shadow-sm" : "text-[#887e72]",
            )}
          >
            {tabLabel(tab)}{" "}
            <span className="ml-1 text-[#a79b8c]">
              ({products.filter((product) => product.status === tab).length})
            </span>
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="space-y-3">
          {visible.map((product) => (
            <div
              key={product.id}
              className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[#eee5d8]">
                <ImageBox src={product.image_url} alt={product.name} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold">{product.name}</h3>
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                      product.status === "published"
                        ? "bg-[#dcebdc] text-[#4c7954]"
                        : product.status === "archived"
                          ? "bg-[#eee9e3] text-[#81776b]"
                          : "bg-[#f3e5d6] text-[#a2553a]",
                    )}
                  >
                    {product.status === "published"
                      ? t("products.published")
                      : product.status === "archived"
                        ? t("products.archived")
                        : t("products.drafts")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#81786c]">
                  {formatPrice(product.price)} · {product.views} {t("dash.views")} ·{" "}
                  {product.category_name ?? product.craft_type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e4d9cc] text-[#756b60] hover:bg-[#f7eee5]"
                  title={t("common.edit")}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onView(product)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e4d9cc] text-[#756b60] hover:bg-[#f7eee5]"
                  title={t("success.view")}
                >
                  <Eye size={16} />
                </button>
                {product.status !== "archived" && (
                  <button
                    onClick={() => onArchive(product)}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e4d9cc] text-[#756b60] hover:bg-[#f7eee5]"
                    title={t("products.archived")}
                  >
                    <Archive size={16} />
                  </button>
                )}
                <button
                  onClick={() => void onDelete(product)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e4d9cc] text-[#a85e4d] hover:bg-[#faece7]"
                  title={t("common.delete")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={t("products.empty")}
          description={t("dash.emptyDesc")}
          action={
            <PrimaryButton onClick={onAdd}>
              <Plus size={16} /> {t("dash.addProduct")}
            </PrimaryButton>
          }
        />
      )}
    </div>
  );
}

function ProfileScreen({
  profile,
  language,
  setLanguage,
  onSave,
  onSignOut,
  demoMode,
}: {
  profile: AppProfile;
  language: string;
  setLanguage: (code: LanguageCode) => void;
  onSave: (values: {
    fullName: string;
    craft: string;
    location: string;
    experience: string;
    bio: string;
  }) => void;
  onSignOut: () => void;
  demoMode?: boolean;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.profile?.full_name ?? "Artisan");
  const [craft, setCraft] = useState(profile.artisan?.craft_type ?? "Bamboo");
  const [location, setLocation] = useState(profile.artisan?.location ?? "India");
  const [experience, setExperience] = useState(String(profile.artisan?.years_of_experience ?? 0));
  const [bio, setBio] = useState(profile.artisan?.bio ?? "");

  useEffect(() => {
    if (profile.profile?.full_name) setFullName(profile.profile.full_name);
    if (profile.artisan?.craft_type) setCraft(profile.artisan.craft_type);
    if (profile.artisan?.location) setLocation(profile.artisan.location);
    if (profile.artisan?.years_of_experience !== undefined)
      setExperience(String(profile.artisan.years_of_experience));
    if (profile.artisan?.bio) setBio(profile.artisan.bio);
  }, [profile]);
  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <PageTitle
          eyebrow={t("nav.story")}
          title={t("profile.title")}
          description={t("profile.subtitle")}
        />
        <button
          onClick={() => setEditing((value) => !value)}
          className="flex h-11 items-center gap-2 rounded-md border border-[#e1d6ca] bg-white px-4 text-sm font-bold text-[#6d6357]"
        >
          <Edit3 size={16} /> {editing ? t("common.close") : t("common.edit")}
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <div className="warm-gradient flex flex-col items-center rounded-lg p-8 text-center text-white">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-display font-semibold">
            {fullName.slice(0, 1)}
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold">{fullName}</h2>
          <p className="mt-1 text-sm text-white/70">{craft}</p>
          <div className="mt-7 flex items-center gap-2 text-xs text-white/70">
            <MapPin size={14} /> {location}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
            <Clock3 size={14} /> {experience} {t("profile.experience")}
          </div>
        </div>
        <div className="surface-card p-6 sm:p-8">
          {editing ? (
            <div className="space-y-5">
              <Field label={t("profile.fullName")} value={fullName} onChange={setFullName} />
              <Field label={t("profile.craft")} value={craft} onChange={setCraft} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("profile.location")} value={location} onChange={setLocation} />
                <Field
                  label={t("profile.experience")}
                  value={experience}
                  onChange={setExperience}
                  type="number"
                />
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#736c61]">
                  {t("profile.language")}
                </span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                  className="w-full rounded-md border border-[#e5ded2] bg-white px-4 py-3.5 text-sm"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.native} ({item.label})
                    </option>
                  ))}
                </select>
              </label>
              <Field label={t("profile.bio")} value={bio} onChange={setBio} multiline />
              <PrimaryButton
                className="w-full"
                onClick={() => {
                  onSave({ fullName, craft, location, experience, bio });
                  setEditing(false);
                }}
              >
                {t("profile.save")} <Check size={16} />
              </PrimaryButton>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#b85f42]">
                  {t("profile.title")}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#6f665b]">
                  {bio || t("profile.subtitle")}
                </p>
              </div>
              <div className="mt-8 grid gap-5 border-t border-[#eee5d9] pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#988e82]">{t("profile.language")}</p>
                  <p className="mt-1 font-semibold">
                    {LANGUAGES.find((l) => l.code === language)?.native ?? "English"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#988e82]">{t("auth.email")}</p>
                  <p className="mt-1 break-all font-semibold">
                    {profile.profile?.email ?? (demoMode ? "Demo account" : "—")}
                  </p>
                </div>
              </div>
            </>
          )}
          <button
            onClick={onSignOut}
            className="mt-8 flex items-center gap-2 text-sm font-bold text-[#a85e4d]"
          >
            <LogOut size={16} /> {t("profile.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
