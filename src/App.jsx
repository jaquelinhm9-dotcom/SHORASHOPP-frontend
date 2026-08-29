import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

const WHATSAPP_NUMBER = "5210000000000";

/* =========================================================
   CATEGORÍAS
   ========================================================= */

const categories = [
  {
    name: "Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Hogar",
    image:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=85",
  },
];

/* =========================================================
   PRODUCTOS DE DEMOSTRACIÓN
   ========================================================= */

const initialProducts = [
  {
    id: "1",
    name: "Smartwatch Pro",
    price: 899,
    oldPrice: 1299,
    rating: 4.8,
    reviews: 124,
    discount: 31,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    description:
      "Smartwatch moderno con pantalla táctil, monitoreo de actividad y diseño elegante.",
    specifications: [
      "Pantalla táctil",
      "Monitoreo de actividad",
      "Bluetooth",
      "Resistente a salpicaduras",
    ],
  },
  {
    id: "2",
    name: "Licuadora Profesional",
    price: 749,
    oldPrice: 999,
    rating: 4.7,
    reviews: 86,
    discount: 25,
    category: "Hogar",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=90",
    description:
      "Licuadora de alta potencia ideal para preparar bebidas, salsas y alimentos.",
    specifications: [
      "Alta potencia",
      "Vaso de gran capacidad",
      "Cuchillas de acero",
      "Varias velocidades",
    ],
  },
  {
    id: "3",
    name: "Tenis Urbanos",
    price: 599,
    oldPrice: 799,
    rating: 4.9,
    reviews: 213,
    discount: 25,
    category: "Moda",
    type: "Popular",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=90",
    description:
      "Tenis urbanos cómodos y versátiles para uso diario.",
    specifications: [
      "Diseño urbano",
      "Suela antiderrapante",
      "Material ligero",
      "Uso diario",
    ],
  },
  {
    id: "4",
    name: "Audífonos Bluetooth",
    price: 449,
    oldPrice: 699,
    rating: 4.8,
    reviews: 176,
    discount: 36,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90",
    description:
      "Audífonos inalámbricos con sonido envolvente y batería de larga duración.",
    specifications: [
      "Bluetooth",
      "Micrófono integrado",
      "Batería de larga duración",
      "Estuche de carga",
    ],
  },
];

/* =========================================================
   UTILIDADES
   ========================================================= */

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // No bloquear la aplicación si localStorage no está disponible.
  }
}

/* =========================================================
   ICONOS
   ========================================================= */

function Icon({ name, size = 21, stroke = 2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    settings: (
      <>
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-1.9 1.9-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.7v.2h-2.7v-.2a1.8 1.8 0 0 0-1.1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1L7 17.1l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1.1h-.2v-2.7h.2a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.4-2L7 8l1.9-1.9.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.7v-.2h2.7v.2a1.8 1.8 0 0 0 1.1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1L19.9 8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1.1h.2v2.7h-.2a1.8 1.8 0 0 0-1.7 1.1Z" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M5 7h14" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 7V4h6v3" />
        <path d="m7 7 1 14h8l1-14" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.7-2.3 2-2.3 3.4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.help}</svg>;
}

/* =========================================================
   APP PRINCIPAL
   ========================================================= */

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState(initialProducts);

  const [cart, setCart] = useState(() =>
    readStorage(CART_KEY, [])
  );

  const [favorites, setFavorites] = useState(() =>
    readStorage(FAVORITES_KEY, [])
  );

  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Moda",
    image: "",
    description: "",
  });

  useEffect(() => {
    saveStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    saveStorage(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data?.session?.user || null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todos" ||
        product.category.toLowerCase() ===
          activeCategory.toLowerCase();

      const searchMatch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setShowCart(true);
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity + amount
              ),
            }
          : item
      )
    );
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter(
            (favoriteId) => favoriteId !== id
          )
        : [...current, id]
    );
  }

  function handleCategory(category) {
    setActiveCategory(category);
    setSearch("");
    setShowMenu(false);

    if (location.pathname !== "/") {
      navigate("/");
    }
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setShowAuth(true);
    setShowMenu(false);
  }

  async function handleAuth(event) {
    event.preventDefault();

    try {
      if (authMode === "register") {
        const { data, error } =
          await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
            options: {
              data: {
                full_name: authName,
              },
            },
          });

        if (error) throw error;

        if (data?.session) {
          setUser(data.user);
          setShowAuth(false);
        } else {
          alert(
            "Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          });

        if (error) throw error;

        setUser(data.user);
        setShowAuth(false);
      }
    } catch (error) {
      alert(
        error?.message ||
          "No fue posible completar la operación."
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    navigate("/");
  }

  function handlePublishChange(event) {
    const { name, value } = event.target;

    setNewProduct((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePublish(event) {
    event.preventDefault();

    if (!newProduct.name.trim() || !newProduct.price) {
      alert(
        "Completa por lo menos el nombre y el precio."
      );
      return;
    }

    const product = {
      id: `local-${Date.now()}`,
      name: newProduct.name.trim(),
      price: Number(newProduct.price),
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category: newProduct.category,
      type: "Nuevo",
      image:
        newProduct.image.trim() ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
      description:
        newProduct.description.trim() ||
        "Producto publicado en VaniDaxi.",
      specifications: [],
    };

    setProducts((current) => [
      product,
      ...current,
    ]);

    setNewProduct({
      name: "",
      price: "",
      category: "Moda",
      image: "",
      description: "",
    });

    setShowPublish(false);
    navigate(`/producto/${product.id}`);
  }

  function whatsappCheckout() {
    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const lines = cart.map(
      (item) =>
        `${item.quantity} x ${item.name} — ${formatPrice(
          item.price * item.quantity
        )}`
    );

    const message = [
      "Hola, quiero realizar una compra en VaniDaxi:",
      "",
      ...lines,
      "",
      `Total: ${formatPrice(cartTotal)}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  }

  return (
    <>
      <style>{`
        :root {
          --red: #c9184a;
          --pink: #b20a68;
          --purple: #57218c;
          --dark: #202020;
          --muted: #707070;
          --soft: #f7f7f8;
          --border: #ececef;
          --gradient: linear-gradient(
            135deg,
            #c9184a 0%,
            #b20a68 52%,
            #57218c 100%
          );
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fff;
          color: var(--dark);
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .app-shell {
          min-height: 100vh;
          background: #fff;
        }

        .page {
          width: min(1200px, calc(100% - 28px));
          margin: 0 auto;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }

        .header-inner {
          width: min(1200px, calc(100% - 28px));
          min-height: 72px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
        }

        .brand-symbol {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--gradient);
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 7px 18px rgba(130, 10, 75, .19);
        }

        .brand-symbol::before {
          content: "";
          width: 21px;
          height: 18px;
          border: 2px solid white;
          border-top: 0;
          border-radius: 3px 3px 6px 6px;
          position: absolute;
          top: 14px;
        }

        .brand-symbol::after {
          content: "";
          width: 10px;
          height: 7px;
          border: 2px solid white;
          border-bottom: 0;
          border-radius: 8px 8px 0 0;
          position: absolute;
          top: 8px;
        }

        .brand-name {
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -1px;
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .search-box {
          flex: 1;
          max-width: 570px;
          height: 44px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 15px;
          border: 1px solid #e5e5e8;
          border-radius: 24px;
          background: #f8f8f9;
        }

        .search-box svg {
          color: #777;
          flex-shrink: 0;
        }

        .search-box input {
          border: 0;
          outline: 0;
          background: transparent;
          width: 100%;
          color: #222;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .icon-button {
          position: relative;
          width: 42px;
          height: 42px;
          border: 0;
          background: transparent;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #333;
          transition: .18s ease;
        }

        .icon-button:hover {
          background: #f4f2f5;
        }

        .count {
          position: absolute;
          top: 2px;
          right: 1px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 10px;
          background: var(--red);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: grid;
          place-items: center;
        }

        .desktop-nav {
          border-top: 1px solid #f1f1f2;
        }

        .nav-scroll {
          width: min(1200px, calc(100% - 28px));
          margin: auto;
          display: flex;
          align-items: center;
          gap: 7px;
          overflow-x: auto;
          padding: 8px 0;
          scrollbar-width: none;
        }

        .nav-scroll::-webkit-scrollbar {
          display: none;
        }

        .nav-link {
          white-space: nowrap;
          padding: 7px 13px;
          border-radius: 18px;
          font-size: 13px;
          font-weight: 650;
          color: #666;
        }

        .nav-link.active {
          color: #fff;
          background: var(--gradient);
        }

        .hero {
          margin-top: 18px;
          min-height: 260px;
          border-radius: 28px;
          padding: 34px;
          overflow: hidden;
          position: relative;
          background: var(--gradient);
          color: #fff;
          display: flex;
          align-items: center;
          box-shadow: 0 14px 35px rgba(102, 15, 83, .17);
        }

        .hero::after {
          content: "";
          width: 280px;
          height: 280px;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 50%;
          position: absolute;
          right: -80px;
          top: -90px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .hero small {
          display: inline-block;
          margin-bottom: 9px;
          padding: 6px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,.13);
          font-size: 12px;
          font-weight: 700;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 50px);
          line-height: 1.02;
          letter-spacing: -2px;
        }

        .hero p {
          margin: 14px 0 0;
          max-width: 560px;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,.88);
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 21px;
        }

        .primary-button,
        .secondary-button {
          min-height: 43px;
          border-radius: 13px;
          padding: 0 17px;
          font-weight: 750;
          border: 0;
        }

        .primary-button {
          background: #fff;
          color: #6b1a63;
        }

        .secondary-button {
          background: rgba(255,255,255,.13);
          color: #fff;
          border: 1px solid rgba(255,255,255,.25);
        }

        .section {
          padding: 30px 0 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 15px;
        }

        .section-title {
          margin: 0;
          font-size: 21px;
          letter-spacing: -.5px;
        }

        .section-link {
          color: var(--purple);
          font-size: 13px;
          font-weight: 750;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 11px;
        }

        .category-card {
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 17px;
          padding: 8px 7px 10px;
          transition: transform .18s ease, box-shadow .18s ease;
          cursor: pointer;
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 24px rgba(30,30,30,.08);
        }

        .category-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
          border-radius: 13px;
        }

        .category-name {
          margin-top: 8px;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 700;
          color: #414141;
        }

        .promo {
          margin-top: 26px;
          padding: 22px;
          border-radius: 21px;
          background: #faf5f8;
          border: 1px solid #f0e1eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .promo h3 {
          margin: 0;
          font-size: 18px;
        }

        .promo p {
          margin: 5px 0 0;
          color: #737373;
          font-size: 13px;
        }

        .gradient-button {
          border: 0;
          border-radius: 12px;
          min-height: 42px;
          padding: 0 16px;
          color: #fff;
          font-weight: 750;
          background: var(--gradient);
          white-space: nowrap;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .product-card {
          position: relative;
          border: 1px solid var(--border);
          border-radius: 19px;
          background: #fff;
          overflow: hidden;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 11px 28px rgba(20,20,20,.09);
        }

        .product-image-wrap {
          position: relative;
          background: #f5f5f6;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: block;
          object-fit: cover;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 8px;
          border-radius: 9px;
          background: var(--red);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .favorite-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.93);
          color: #666;
          display: grid;
          place-items: center;
        }

        .favorite-button.active {
          color: var(--red);
        }

        .product-body {
          padding: 12px;
        }

        .product-category {
          font-size: 10px;
          font-weight: 700;
          color: #8a8a8a;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .product-name {
          display: block;
          margin-top: 4px;
          font-size: 14px;
          font-weight: 760;
          line-height: 1.3;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 7px;
          color: #777;
          font-size: 11px;
        }

        .rating svg {
          color: #e6a600;
          fill: currentColor;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-top: 8px;
        }

        .price {
          font-size: 18px;
          font-weight: 900;
        }

        .old-price {
          color: #a0a0a0;
          text-decoration: line-through;
          font-size: 11px;
        }

        .product-actions {
          display: flex;
          gap: 7px;
          margin-top: 11px;
        }

        .add-button {
          flex: 1;
          min-height: 38px;
          border: 0;
          border-radius: 11px;
          background: var(--gradient);
          color: #fff;
          font-size: 12px;
          font-weight: 750;
        }

        .detail-button {
          width: 39px;
          min-height: 38px;
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 11px;
          display: grid;
          place-items: center;
        }

        .empty-state {
          padding: 50px 20px;
          text-align: center;
          border: 1px dashed #ddd;
          border-radius: 18px;
          color: #777;
        }

        .page-content {
          padding: 30px 0 70px;
        }

        .page-heading {
          margin-bottom: 20px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #777;
          font-size: 13px;
          font-weight: 650;
          margin-bottom: 13px;
        }

        .page-heading h1 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .page-heading p {
          margin: 7px 0 0;
          color: #777;
          font-size: 14px;
        }

        .detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
          gap: 30px;
        }

        .detail-image {
          width: 100%;
          max-height: 600px;
          object-fit: cover;
          border-radius: 24px;
          background: #f5f5f5;
        }

        .detail-info {
          padding: 8px 0;
        }

        .detail-info h1 {
          margin: 6px 0 10px;
          font-size: clamp(27px, 4vw, 39px);
          letter-spacing: -1.3px;
        }

        .detail-description {
          color: #666;
          line-height: 1.7;
          font-size: 14px;
        }

        .detail-price {
          margin: 18px 0;
          font-size: 30px;
          font-weight: 900;
        }

        .specifications {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }

        .specifications h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .specifications div {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 0;
          color: #555;
          font-size: 13px;
        }

        .specifications svg {
          color: #7b287d;
        }

        .detail-actions {
          display: flex;
          gap: 9px;
          margin-top: 20px;
        }

        .detail-actions .gradient-button {
          flex: 1;
        }

        .outline-button {
          min-height: 44px;
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 12px;
          padding: 0 16px;
          font-weight: 750;
        }

        .profile-card,
        .content-card {
          border: 1px solid var(--border);
          border-radius: 21px;
          background: #fff;
          padding: 22px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: var(--gradient);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 23px;
          font-weight: 850;
        }

        .profile-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .profile-header p {
          margin: 4px 0 0;
          color: #777;
          font-size: 13px;
        }

        .menu-overlay,
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(20, 15, 22, .42);
          backdrop-filter: blur(3px);
        }

        .side-menu {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: min(370px, 91vw);
          background: #fff;
          padding: 20px;
          overflow-y: auto;
          box-shadow: 15px 0 35px rgba(0,0,0,.12);
          animation: menuIn .2s ease;
        }

        @keyframes menuIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 17px;
          border-bottom: 1px solid var(--border);
        }

        .menu-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 850;
        }

        .menu-list {
          margin-top: 15px;
          display: grid;
          gap: 5px;
        }

        .menu-item {
          width: 100%;
          min-height: 47px;
          border: 0;
          background: transparent;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          text-align: left;
          color: #444;
          font-weight: 650;
          font-size: 14px;
        }

        .menu-item:hover {
          background: #f7f4f7;
          color: var(--purple);
        }

        .menu-item svg {
          color: var(--purple);
        }

        .menu-divider {
          height: 1px;
          background: var(--border);
          margin: 11px 0;
        }

        .modal-center {
          min-height: 100%;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .modal {
          width: min(520px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 25px 70px rgba(0,0,0,.18);
          padding: 22px;
        }

        .modal.large {
          width: min(700px, 100%);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .form {
          display: grid;
          gap: 12px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field label {
          font-size: 12px;
          font-weight: 750;
          color: #555;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #dddde2;
          border-radius: 12px;
          min-height: 44px;
          padding: 10px 12px;
          outline: none;
          background: #fff;
        }

        .field textarea {
          min-height: 95px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #a83a83;
          box-shadow: 0 0 0 3px rgba(168,58,131,.08);
        }

        .auth-switch {
          margin-top: 15px;
          text-align: center;
          color: #777;
          font-size: 13px;
        }

        .text-button {
          border: 0;
          background: transparent;
          color: var(--purple);
          font-weight: 750;
          padding: 0;
        }

        .cart-panel {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: min(450px, 94vw);
          background: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: -15px 0 35px rgba(0,0,0,.12);
          animation: cartIn .2s ease;
        }

        @keyframes cartIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .cart-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 68px 1fr auto;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .cart-item img {
          width: 68px;
          height: 68px;
          object-fit: cover;
          border-radius: 11px;
        }

        .cart-item-name {
          font-size: 13px;
          font-weight: 750;
        }

        .cart-item-price {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 850;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .quantity button {
          width: 27px;
          height: 27px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #fff;
        }

        .remove-button {
          border: 0;
          background: transparent;
          color: #999;
          align-self: start;
        }

        .cart-footer {
          padding: 17px;
          border-top: 1px solid var(--border);
          background: #fff;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 17px;
          font-weight: 850;
        }

        .cart-footer .gradient-button {
          width: 100%;
        }

        .footer {
          margin-top: 60px;
          padding: 35px 0 25px;
          border-top: 1px solid var(--border);
          color: #777;
        }

        .footer-inner {
          width: min(1200px, calc(100% - 28px));
          margin: auto;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .footer-brand {
          color: #444;
          font-weight: 850;
        }

        .footer p {
          margin: 5px 0 0;
          font-size: 12px;
        }

        .bottom-bar {
          display: none;
        }

        .fab {
          position: fixed;
          right: 18px;
          bottom: 18px;
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: 50%;
          background: var(--gradient);
          color: #fff;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 25px rgba(90, 19, 90, .24);
          z-index: 80;
        }

        .category-page-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .feature-card {
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 21px;
          background: #fff;
        }

        .feature-card-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #fff;
          background: var(--gradient);
          margin-bottom: 13px;
        }

        .feature-card h3 {
          margin: 0;
          font-size: 16px;
        }

        .feature-card p {
          margin: 7px 0 0;
          color: #777;
          font-size: 13px;
          line-height: 1.55;
        }

        @media (max-width: 980px) {
          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .category-page-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .desktop-nav {
            display: block;
          }
        }

        @media (max-width: 720px) {
          .header-inner {
            min-height: 64px;
            gap: 7px;
          }

          .brand-name {
            font-size: 18px;
          }

          .brand-symbol {
            width: 38px;
            height: 38px;
            border-radius: 12px;
          }

          .search-box {
            order: 5;
            width: 100%;
            max-width: none;
            flex-basis: 100%;
            margin: 0;
          }

          .header-inner {
            flex-wrap: wrap;
            padding: 8px 0;
          }

          .header-actions {
            margin-left: auto;
          }

          .desktop-nav {
            display: none;
          }

          .hero {
            margin-top: 12px;
            min-height: 270px;
            padding: 25px;
            border-radius: 23px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .category-card {
            border-radius: 14px;
            padding: 5px 5px 8px;
          }

          .category-image {
            border-radius: 10px;
          }

          .category-name {
            font-size: 9.5px;
            margin-top: 6px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 9px;
          }

          .product-card {
            border-radius: 15px;
          }

          .product-body {
            padding: 9px;
          }

          .product-name {
            font-size: 12px;
          }

          .price {
            font-size: 16px;
          }

          .product-actions {
            margin-top: 8px;
          }

          .add-button {
            min-height: 35px;
            font-size: 11px;
          }

          .detail-layout {
            grid-template-columns: 1fr;
          }

          .detail-image {
            max-height: 430px;
          }

          .category-page-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .promo {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer {
            padding-bottom: 85px;
          }

          .footer-inner {
            flex-direction: column;
          }

          .bottom-bar {
            position: fixed;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 90;
            min-height: 65px;
            background: rgba(255,255,255,.97);
            backdrop-filter: blur(14px);
            border-top: 1px solid var(--border);
          }

          .bottom-item {
            display: grid;
            place-items: center;
            align-content: center;
            gap: 3px;
            color: #777;
            font-size: 9px;
            font-weight: 700;
          }

          .bottom-item.active {
            color: var(--purple);
          }

          .bottom-item svg {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 420px) {
          .page,
          .header-inner,
          .nav-scroll,
          .footer-inner {
            width: min(100% - 20px, 1200px);
          }

          .brand-name {
            display: none;
          }

          .header-actions .user-button {
            display: none;
          }

          .categories-grid {
            gap: 6px;
          }

          .category-name {
            font-size: 8.5px;
          }

          .section {
            padding-top: 24px;
          }

          .section-title {
            font-size: 18px;
          }
        }
      `}</style>

      <Header
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        user={user}
        onMenu={() => setShowMenu(true)}
        onCart={() => setShowCart(true)}
        onAuth={() => openAuth("login")}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              categories={categories}
              products={filteredProducts}
              favorites={favorites}
              onCategory={handleCategory}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onPublish={() => setShowPublish(true)}
              onAuth={() => openAuth("register")}
            />
          }
        />

        <Route
          path="/categoria/:categoryName"
          element={
            <CategoryPage
              categories={categories}
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onCategory={handleCategory}
            />
          }
        />

        <Route
          path="/producto/:productId"
          element={
            <ProductPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/favoritos"
          element={
            <FavoritesPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/cuenta"
          element={
            <AccountPage
              user={user}
              onLogin={() => openAuth("login")}
              onRegister={() => openAuth("register")}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/perfil"
          element={
            <ProfilePage
              user={user}
              onLogin={() => openAuth("login")}
            />
          }
        />

        <Route
          path="/pedidos"
          element={<OrdersPage user={user} />}
        />

        <Route
          path="/mensajes"
          element={<MessagesPage user={user} />}
        />

        <Route
          path="/configuracion"
          element={<SettingsPage />}
        />

        <Route
          path="/publicar"
          element={
            <PublishPage
              product={newProduct}
              onChange={handlePublishChange}
              onSubmit={handlePublish}
            />
          }
        />

        <Route
          path="/promociones"
          element={<PromotionsPage products={products} />}
        />

        <Route
          path="/ayuda"
          element={<HelpPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>

      <Footer />

      <button
        className="fab"
        type="button"
        aria-label="Ayuda"
        onClick={() => navigate("/ayuda")}
      >
        <Icon name="help" size={23} />
      </button>

      <MobileBottomBar
        location={location}
        cartCount={cartCount}
        onCart={() => setShowCart(true)}
      />

      {showMenu && (
        <Menu
          user={user}
          onClose={() => setShowMenu(false)}
          onAuth={openAuth}
          onLogout={handleLogout}
        />
      )}

      {showCart && (
        <CartPanel
          cart={cart}
          cartTotal={cartTotal}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onQuantity={changeQuantity}
          onCheckout={whatsappCheckout}
        />
      )}

      {showAuth && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          email={authEmail}
          password={authPassword}
          name={authName}
          setEmail={setAuthEmail}
          setPassword={setAuthPassword}
          setName={setAuthName}
          onSubmit={handleAuth}
          onClose={() => setShowAuth(false)}
        />
      )}

      {showPublish && (
        <PublishModal
          product={newProduct}
          onChange={handlePublishChange}
          onSubmit={handlePublish}
          onClose={() => setShowPublish(false)}
        />
      )}
    </>
  );
}

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  search,
  setSearch,
  cartCount,
  user,
  onMenu,
  onCart,
  onAuth,
}) {
  const navigate = useNavigate();

  return (
    <header className="top-header">
      <div className="header-inner">
        <button
          className="icon-button"
          type="button"
          onClick={onMenu}
          aria-label="Abrir menú"
        >
          <Icon name="menu" />
        </button>

        <button
          className="brand"
          type="button"
          onClick={() => navigate("/")}
          style={{
            border: 0,
            background: "transparent",
            padding: 0,
          }}
        >
          <span className="brand-symbol" />
          <span className="brand-name">
            VaniDaxi
          </span>
        </button>

        <div className="search-box">
          <Icon name="search" size={19} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
          />
        </div>

        <div className="header-actions">
          <button
            className="icon-button user-button"
            type="button"
            onClick={() =>
              user ? navigate("/cuenta") : onAuth()
            }
            aria-label="Cuenta"
          >
            <Icon name="user" />
          </button>

          <button
            className="icon-button"
            type="button"
            onClick={onCart}
            aria-label="Carrito"
          >
            <Icon name="cart" />
            {cartCount > 0 && (
              <span className="count">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="desktop-nav">
        <div className="nav-scroll">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/categoria/Moda"
            className="nav-link"
          >
            Moda
          </NavLink>

          <NavLink
            to="/categoria/Tecnología"
            className="nav-link"
          >
            Tecnología
          </NavLink>

          <NavLink
            to="/categoria/Hogar"
            className="nav-link"
          >
            Hogar
          </NavLink>

          <NavLink
            to="/promociones"
            className="nav-link"
          >
            Promociones
          </NavLink>

          <NavLink
            to="/publicar"
            className="nav-link"
          >
            Vender
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function HomePage({
  categories,
  products,
  favorites,
  onCategory,
  onFavorite,
  onAdd,
  onPublish,
  onAuth,
}) {
  const navigate = useNavigate();

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-content">
          <small>
            Todo en un solo lugar
          </small>

          <h1>
            Compra lo que quieras.
            <br />
            Véndelo también.
          </h1>

          <p>
            Descubre productos, encuentra grandes
            oportunidades y disfruta una experiencia
            sencilla dentro de VaniDaxi.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() =>
                document
                  .getElementById("productos")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explorar productos
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={onPublish}
            >
              Publicar producto
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            Categorías
          </h2>

          <button
            className="section-link"
            type="button"
            onClick={() =>
              document
                .getElementById("categorias")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            style={{
              border: 0,
              background: "transparent",
            }}
          >
            Ver todas
          </button>
        </div>

        <div
          id="categorias"
          className="categories-grid"
        >
          {categories.map((category) => (
            <button
              className="category-card"
              key={category.name}
              type="button"
              onClick={() =>
                navigate(
                  `/categoria/${encodeURIComponent(
                    category.name
                  )}`
                )
              }
            >
              <img
                className="category-image"
                src={category.image}
                alt={category.name}
              />

              <div className="category-name">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="promo">
        <div>
          <h3>
            ¿Tienes algo que vender?
          </h3>
          <p>
            Publica tu producto y comienza a mostrarlo
            dentro de VaniDaxi.
          </p>
        </div>

        <button
          className="gradient-button"
          type="button"
          onClick={onPublish}
        >
          Publicar ahora
        </button>
      </section>

      <section
        className="section"
        id="productos"
      >
        <div className="section-header">
          <h2 className="section-title">
            Productos destacados
          </h2>

          <button
            className="section-link"
            type="button"
            onClick={() =>
              navigate("/promociones")
            }
            style={{
              border: 0,
              background: "transparent",
            }}
          >
            Ver más
          </button>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(
                  product.id
                )}
                onFavorite={onFavorite}
                onAdd={onAdd}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No encontramos productos con esa búsqueda.
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            ¿Por qué VaniDaxi?
          </h2>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon="bag"
            title="Todo en un solo lugar"
            text="Explora diferentes categorías y productos desde una sola experiencia."
          />

          <FeatureCard
            icon="cart"
            title="Compra fácilmente"
            text="Agrega productos a tu carrito y organiza tus compras de manera sencilla."
          />

          <FeatureCard
            icon="message"
            title="Atención y ayuda"
            text="Encuentra tus opciones de soporte y comunicación directamente desde la aplicación."
          />
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   TARJETA PRODUCTO
   ========================================================= */

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
}) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
        />

        {product.discount > 0 && (
          <span className="discount-badge">
            -{product.discount}%
          </span>
        )}

        <button
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          type="button"
          onClick={() =>
            onFavorite(product.id)
          }
          aria-label="Agregar a favoritos"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      <div className="product-body">
        <div className="product-category">
          {product.category}
        </div>

        <button
          className="product-name"
          type="button"
          onClick={() =>
            navigate(
              `/producto/${product.id}`
            )
          }
          style={{
            border: 0,
            background: "transparent",
            padding: 0,
            textAlign: "left",
            width: "100%",
          }}
        >
          {product.name}
        </button>

        <div className="rating">
          <Icon name="star" size={12} />
          <strong>{product.rating}</strong>
          <span>
            ({product.reviews})
          </span>
        </div>

        <div className="price-row">
          <span className="price">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice && (
            <span className="old-price">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-button"
            type="button"
            onClick={() => onAdd(product)}
          >
            Agregar al carrito
          </button>

          <button
            className="detail-button"
            type="button"
            onClick={() =>
              navigate(
                `/producto/${product.id}`
              )
            }
            aria-label="Ver producto"
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CATEGORÍA
   ========================================================= */

function CategoryPage({
  categories,
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const { categoryName } = useParams();

  const decodedName = decodeURIComponent(
    categoryName || ""
  );

  const category = categories.find(
    (item) =>
      item.name.toLowerCase() ===
      decodedName.toLowerCase()
  );

  const categoryProducts = products.filter(
    (product) =>
      product.category.toLowerCase() ===
      decodedName.toLowerCase()
  );

  return (
    <main className="page page-content">
      <div className="page-heading">
        <Link className="back-link" to="/">
          <Icon name="back" size={17} />
          Volver al inicio
        </Link>

        <h1>{decodedName}</h1>

        <p>
          Descubre productos de {decodedName}.
        </p>
      </div>

      {category && (
        <div style={{ marginBottom: 22 }}>
          <img
            src={category.image}
            alt={category.name}
            style={{
              width: "100%",
              height: 190,
              objectFit: "cover",
              borderRadius: 22,
            }}
          />
        </div>
      )}

      {categoryProducts.length ? (
        <div className="category-page-grid">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(
                product.id
              )}
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Todavía no hay productos publicados
          en esta categoría.
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCTO
   ========================================================= */

function ProductPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (item) => item.id === productId
  );

  if (!product) {
    return <NotFoundPage />;
  }

  const favorite = favorites.includes(
    product.id
  );

  return (
    <main className="page page-content">
      <Link className="back-link" to="/">
        <Icon name="back" size={17} />
        Volver
      </Link>

      <div className="detail-layout">
        <div>
          <img
            className="detail-image"
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="detail-info">
          <div className="product-category">
            {product.category}
          </div>

          <h1>{product.name}</h1>

          <div className="rating">
            <Icon name="star" size={15} />
            <strong>{product.rating}</strong>
            <span>
              {product.reviews} reseñas
            </span>
          </div>

          <div className="detail-price">
            {formatPrice(product.price)}
          </div>

          {product.oldPrice && (
            <div
              style={{
                color: "#999",
                textDecoration: "line-through",
                marginTop: -13,
              }}
            >
              {formatPrice(product.oldPrice)}
            </div>
          )}

          <p className="detail-description">
            {product.description}
          </p>

          <div className="detail-actions">
            <button
              className="gradient-button"
              type="button"
              onClick={() => onAdd(product)}
            >
              Agregar al carrito
            </button>

            <button
              className="outline-button"
              type="button"
              onClick={() =>
                onFavorite(product.id)
              }
            >
              <Icon
                name="heart"
                size={18}
              />{" "}
              {favorite
                ? "Guardado"
                : "Favorito"}
            </button>
          </div>

          <div className="specifications">
            <h3>
              Características
            </h3>

            {product.specifications?.length ? (
              product.specifications.map(
                (specification) => (
                  <div
                    key={specification}
                  >
                    <Icon
                      name="check"
                      size={16}
                    />
                    {specification}
                  </div>
                )
              )
            ) : (
              <div>
                <Icon
                  name="check"
                  size={16}
                />
                Información del producto
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            También puede interesarte
          </h2>
        </div>

        <div className="products-grid">
          {products
            .filter(
              (item) =>
                item.id !== product.id
            )
            .slice(0, 4)
            .map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                favorite={favorites.includes(
                  item.id
                )}
                onFavorite={onFavorite}
                onAdd={onAdd}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function FavoritesPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const favoriteProducts = products.filter(
    (product) =>
      favorites.includes(product.id)
  );

  return (
    <main className="page page-content">
      <div className="page-heading">
        <Link className="back-link" to="/">
          <Icon name="back" size={17} />
          Volver
        </Link>

        <h1>Mis favoritos</h1>

        <p>
          Aquí aparecerán los productos que guardes.
        </p>
      </div>

      {favoriteProducts.length ? (
        <div className="category-page-grid">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="heart" size={30} />
          <h3>
            Todavía no tienes favoritos
          </h3>
          <p>
            Guarda productos para encontrarlos
            rápidamente aquí.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   CUENTA
   ========================================================= */

function AccountPage({
  user,
  onLogin,
  onRegister,
  onLogout,
}) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="page page-content">
        <div className="content-card">
          <div
            style={{
              textAlign: "center",
              padding: 25,
            }}
          >
            <div className="avatar" style={{ margin: "0 auto 15px" }}>
              ✨
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 27,
              }}
            >
              Bienvenido a VaniDaxi
            </h1>

            <p
              style={{
                color: "#777",
                lineHeight: 1.6,
              }}
            >
              Inicia sesión o crea tu cuenta para
              acceder a todas tus opciones.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 9,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <button
                className="gradient-button"
                onClick={onLogin}
              >
                Iniciar sesión
              </button>

              <button
                className="outline-button"
                onClick={onRegister}
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuario";

  return (
    <main className="page page-content">
      <div className="page-heading">
        <h1>Mi cuenta</h1>
        <p>
          Administra tu experiencia en VaniDaxi.
        </p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="feature-grid">
          <AccountOption
            icon="user"
            title="Mi perfil"
            text="Consulta y administra tu información."
            onClick={() =>
              navigate("/perfil")
            }
          />

          <AccountOption
            icon="bag"
            title="Mis pedidos"
            text="Consulta tus compras y pedidos."
            onClick={() =>
              navigate("/pedidos")
            }
          />

          <AccountOption
            icon="heart"
            title="Favoritos"
            text="Consulta tus productos guardados."
            onClick={() =>
              navigate("/favoritos")
            }
          />

          <AccountOption
            icon="message"
            title="Mensajes"
            text="Consulta tus conversaciones."
            onClick={() =>
              navigate("/mensajes")
            }
          />

          <AccountOption
            icon="settings"
            title="Configuración"
            text="Personaliza las opciones de tu cuenta."
            onClick={() =>
              navigate("/configuracion")
            }
          />

          <AccountOption
            icon="plus"
            title="Publicar producto"
            text="Comienza a vender dentro de VaniDaxi."
            onClick={() =>
              navigate("/publicar")
            }
          />
        </div>
      </section>

      <button
        className="outline-button"
        onClick={onLogout}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

/* =========================================================
   PERFIL
   ========================================================= */

function ProfilePage({ user, onLogin }) {
  if (!user) {
    return (
      <main className="page page-content">
        <div className="empty-state">
          <h2>Necesitas iniciar sesión</h2>
          <button
            className="gradient-button"
            onClick={onLogin}
          >
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuario";

  return (
    <main className="page page-content">
      <Link className="back-link" to="/cuenta">
        <Icon name="back" size={17} />
        Cuenta
      </Link>

      <div className="page-heading">
        <h1>Mi perfil</h1>
        <p>
          Información de tu cuenta.
        </p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PEDIDOS
   ========================================================= */

function OrdersPage({ user }) {
  if (!user) {
    return (
      <SimplePage
        title="Mis pedidos"
        text="Inicia sesión para consultar tus pedidos."
        icon="bag"
      />
    );
  }

  return (
    <main className="page page-content">
      <Link className="back-link" to="/cuenta">
        <Icon name="back" size={17} />
        Cuenta
      </Link>

      <div className="page-heading">
        <h1>Mis pedidos</h1>
        <p>
          Consulta el estado de tus compras.
        </p>
      </div>

      <div className="empty-state">
        <Icon name="bag" size={31} />
        <h3>
          Aún no tienes pedidos
        </h3>
        <p>
          Tus compras aparecerán aquí.
        </p>
        <Link
          to="/"
          className="gradient-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          Explorar productos
        </Link>
      </div>
    </main>
  );
}

/* =========================================================
   MENSAJES
   ========================================================= */

function MessagesPage({ user }) {
  return (
    <main className="page page-content">
      <Link className="back-link" to="/cuenta">
        <Icon name="back" size={17} />
        Cuenta
      </Link>

      <div className="page-heading">
        <h1>Mensajes</h1>
        <p>
          Tus conversaciones estarán disponibles aquí.
        </p>
      </div>

      <div className="content-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <div className="feature-card-icon">
            <Icon name="message" />
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              Centro de mensajes
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#777",
                fontSize: 13,
              }}
            >
              {user
                ? "Aquí podrás consultar tus conversaciones."
                : "Inicia sesión para utilizar esta sección."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function SettingsPage() {
  const [notifications, setNotifications] =
    useState(true);

  return (
    <main className="page page-content">
      <Link className="back-link" to="/cuenta">
        <Icon name="back" size={17} />
        Cuenta
      </Link>

      <div className="page-heading">
        <h1>Configuración</h1>
        <p>
          Personaliza las opciones de VaniDaxi.
        </p>
      </div>

      <div className="content-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            padding: "12px 0",
          }}
        >
          <div>
            <strong>
              Notificaciones
            </strong>
            <p
              style={{
                margin: "4px 0 0",
                color: "#777",
                fontSize: 12,
              }}
            >
              Recibir novedades y avisos.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotifications(
                !notifications
              )
            }
            style={{
              border: 0,
              borderRadius: 20,
              padding: "8px 13px",
              color: "#fff",
              fontWeight: 750,
              background: notifications
                ? "var(--gradient)"
                : "#999",
            }}
          >
            {notifications
              ? "Activadas"
              : "Desactivadas"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PUBLICAR
   ========================================================= */

function PublishPage({
  product,
  onChange,
  onSubmit,
}) {
  return (
    <main className="page page-content">
      <Link className="back-link" to="/">
        <Icon name="back" size={17} />
        Inicio
      </Link>

      <div className="page-heading">
        <h1>Publicar producto</h1>
        <p>
          Agrega tu producto para comenzar a vender.
        </p>
      </div>

      <div className="content-card">
        <form
          className="form"
          onSubmit={onSubmit}
        >
          <PublishFields
            product={product}
            onChange={onChange}
          />

          <button
            className="gradient-button"
            type="submit"
          >
            Publicar producto
          </button>
        </form>
      </div>
    </main>
  );
}

function PublishModal({
  product,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-center">
        <div className="modal large">
          <div className="modal-header">
            <h2>
              Publicar producto
            </h2>

            <button
              className="icon-button"
              onClick={onClose}
              type="button"
            >
              <Icon name="close" />
            </button>
          </div>

          <form
            className="form"
            onSubmit={onSubmit}
          >
            <PublishFields
              product={product}
              onChange={onChange}
            />

            <button
              className="gradient-button"
              type="submit"
            >
              Publicar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PublishFields({
  product,
  onChange,
}) {
  return (
    <>
      <div className="field">
        <label>
          Nombre del producto
        </label>
        <input
          name="name"
          value={product.name}
          onChange={onChange}
          placeholder="Ej. Bolsa elegante"
          required
        />
      </div>

      <div className="field">
        <label>
          Precio
        </label>
        <input
          name="price"
          type="number"
          min="1"
          value={product.price}
          onChange={onChange}
          placeholder="Ej. 599"
          required
        />
      </div>

      <div className="field">
        <label>
          Categoría
        </label>

        <select
          name="category"
          value={product.category}
          onChange={onChange}
        >
          {categories.map((category) => (
            <option
              key={category.name}
              value={category.name}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>
          Imagen del producto
        </label>

        <input
          name="image"
          value={product.image}
          onChange={onChange}
          placeholder="URL de la imagen"
        />
      </div>

      <div className="field">
        <label>
          Descripción
        </label>

        <textarea
          name="description"
          value={product.description}
          onChange={onChange}
          placeholder="Describe tu producto..."
        />
      </div>
    </>
  );
}

/* =========================================================
   PROMOCIONES
   ========================================================= */

function PromotionsPage({ products }) {
  const promotions = products.filter(
    (product) => product.discount > 0
  );

  return (
    <main className="page page-content">
      <div className="page-heading">
        <h1>Promociones</h1>
        <p>
          Encuentra productos con precios especiales.
        </p>
      </div>

      {promotions.length ? (
        <div className="category-page-grid">
          {promotions.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={false}
              onFavorite={() => {}}
              onAdd={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No hay promociones disponibles.
        </div>
      )}
    </main>
  );
}

/* =========================================================
   AYUDA
   ========================================================= */

function HelpPage() {
  const [open, setOpen] = useState(null);

  const questions = [
    {
      title: "¿Cómo comprar?",
      text: "Busca un producto, abre su página, agrégalo al carrito y continúa con las opciones disponibles.",
    },
    {
      title: "¿Cómo vender?",
      text: "Utiliza la opción Publicar producto para agregar la información de lo que deseas vender.",
    },
    {
      title: "¿Dónde veo mis pedidos?",
      text: "Entra a Cuenta y selecciona Mis pedidos.",
    },
    {
      title: "¿Dónde están mis favoritos?",
      text: "Puedes acceder a Favoritos desde tu cuenta o desde el menú.",
    },
  ];

  return (
    <main className="page page-content">
      <div className="page-heading">
        <h1>Ayuda</h1>
        <p>
          Encuentra respuestas a las preguntas más comunes.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 9,
        }}
      >
        {questions.map((question, index) => (
          <div
            className="content-card"
            key={question.title}
            style={{ padding: 0 }}
          >
            <button
              type="button"
              onClick={() =>
                setOpen(
                  open === index ? null : index
                )
              }
              style={{
                width: "100%",
                minHeight: 58,
                padding: "0 17px",
                border: 0,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
                fontWeight: 750,
              }}
            >
              {question.title}
              <Icon
                name="arrow"
                size={17}
              />
            </button>

            {open === index && (
              <div
                style={{
                  padding:
                    "0 17px 17px",
                  color: "#777",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {question.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   MENÚ LATERAL
   ========================================================= */

function Menu({
  user,
  onClose,
  onAuth,
  onLogout,
}) {
  const navigate = useNavigate();

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <div
      className="menu-overlay"
      onClick={onClose}
    >
      <aside
        className="side-menu"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="menu-header">
          <div className="menu-brand">
            <span
              className="brand-symbol"
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
              }}
            />
            <span>VaniDaxi</span>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        {user ? (
          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/cuenta")
            }
          >
            <Icon name="user" />
            <span>
              Mi cuenta
            </span>
          </button>
        ) : (
          <button
            className="menu-item"
            type="button"
            onClick={() => {
              onClose();
              onAuth("login");
            }}
          >
            <Icon name="user" />
            <span>
              Iniciar sesión
            </span>
          </button>
        )}

        <div className="menu-list">
          <button
            className="menu-item"
            type="button"
            onClick={() => go("/")}
          >
            <Icon name="home" />
            Inicio
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/favoritos")
            }
          >
            <Icon name="heart" />
            Favoritos
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/pedidos")
            }
          >
            <Icon name="bag" />
            Mis pedidos
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/mensajes")
            }
          >
            <Icon name="message" />
            Mensajes
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/publicar")
            }
          >
            <Icon name="plus" />
            Publicar producto
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/promociones")
            }
          >
            <Icon name="star" />
            Promociones
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/configuracion")
            }
          >
            <Icon name="settings" />
            Configuración
          </button>

          <button
            className="menu-item"
            type="button"
            onClick={() =>
              go("/ayuda")
            }
          >
            <Icon name="help" />
            Ayuda
          </button>
        </div>

        <div className="menu-divider" />

        {user && (
          <button
            className="menu-item"
            type="button"
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        )}
      </aside>
    </div>
  );
}

/* =========================================================
   CARRITO
   ========================================================= */

function CartPanel({
  cart,
  cartTotal,
  onClose,
  onRemove,
  onQuantity,
  onCheckout,
}) {
  return (
    <div
      className="menu-overlay"
      onClick={onClose}
    >
      <aside
        className="cart-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="cart-header">
          <h2>
            Mi carrito
          </h2>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="cart-items">
          {cart.length ? (
            cart.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >
                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <div className="cart-item-name">
                    {item.name}
                  </div>

                  <div className="cart-item-price">
                    {formatPrice(item.price)}
                  </div>

                  <div className="quantity">
                    <button
                      type="button"
                      onClick={() =>
                        onQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        onQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="remove-button"
                  type="button"
                  onClick={() =>
                    onRemove(item.id)
                  }
                  aria-label="Eliminar"
                >
                  <Icon
                    name="trash"
                    size={17}
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Icon
                name="cart"
                size={31}
              />
              <h3>
                Tu carrito está vacío
              </h3>
              <p>
                Agrega productos para comenzar.
              </p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>
                {formatPrice(cartTotal)}
              </span>
            </div>

            <button
              className="gradient-button"
              type="button"
              onClick={onCheckout}
            >
              Continuar compra
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* =========================================================
   AUTENTICACIÓN
   ========================================================= */

function AuthModal({
  mode,
  setMode,
  email,
  password,
  name,
  setEmail,
  setPassword,
  setName,
  onSubmit,
  onClose,
}) {
  const register =
    mode === "register";

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div className="modal-center">
        <div
          className="modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="modal-header">
            <h2>
              {register
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </h2>

            <button
              className="icon-button"
              type="button"
              onClick={onClose}
            >
              <Icon name="close" />
            </button>
          </div>

          <form
            className="form"
            onSubmit={onSubmit}
          >
            {register && (
              <div className="field">
                <label>
                  Nombre
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="field">
              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label>
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Tu contraseña"
                autoComplete={
                  register
                    ? "new-password"
                    : "current-password"
                }
                required
              />
            </div>

            <button
              className="gradient-button"
              type="submit"
            >
              {register
                ? "Crear cuenta"
                : "Entrar"}
            </button>
          </form>

          <div className="auth-switch">
            {register
              ? "¿Ya tienes una cuenta? "
              : "¿No tienes una cuenta? "}

            <button
              className="text-button"
              type="button"
              onClick={() =>
                setMode(
                  register
                    ? "login"
                    : "register"
                )
              }
            >
              {register
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTES AUXILIARES
   ========================================================= */

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="feature-card">
      <div className="feature-card-icon">
        <Icon name={icon} />
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

function AccountOption({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="feature-card"
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div className="feature-card-icon">
        <Icon name={icon} />
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </button>
  );
}

function SimplePage({
  title,
  text,
  icon,
}) {
  return (
    <main className="page page-content">
      <div className="empty-state">
        <Icon name={icon} size={32} />

        <h2>{title}</h2>

        <p>{text}</p>

        <Link
          to="/"
          className="gradient-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <SimplePage
      title="Página no encontrada"
      text="La sección que buscas no existe."
      icon="help"
    />
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            VaniDaxi
          </div>

          <p>
            Todo en un solo lugar.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            fontSize: 12,
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate("/ayuda")
            }
            style={{
              border: 0,
              background: "transparent",
              color: "#777",
            }}
          >
            Ayuda
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/configuracion")
            }
            style={{
              border: 0,
              background: "transparent",
              color: "#777",
            }}
          >
            Configuración
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/publicar")
            }
            style={{
              border: 0,
              background: "transparent",
              color: "#777",
            }}
          >
            Vender
          </button>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   BARRA MÓVIL
   ========================================================= */

function MobileBottomBar({
  location,
  cartCount,
  onCart,
}) {
  const navigate = useNavigate();

  return (
    <nav className="bottom-bar">
      <button
        className={`bottom-item ${
          location.pathname === "/"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() => navigate("/")}
      >
        <Icon name="home" />
        Inicio
      </button>

      <button
        className={`bottom-item ${
          location.pathname === "/favoritos"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          navigate("/favoritos")
        }
      >
        <Icon name="heart" />
        Favoritos
      </button>

      <button
        className="bottom-item"
        type="button"
        onClick={onCart}
      >
        <span
          style={{
            position: "relative",
            display: "grid",
          }}
        >
          <Icon name="cart" />

          {cartCount > 0 && (
            <span
              className="count"
              style={{
                top: -7,
                right: -8,
              }}
            >
              {cartCount}
            </span>
          )}
        </span>

        Carrito
      </button>

      <button
        className={`bottom-item ${
          location.pathname === "/cuenta"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          navigate("/cuenta")
        }
      >
        <Icon name="user" />
        Cuenta
      </button>
    </nav>
  );
}

export default App;
