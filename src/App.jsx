import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";
const SETTINGS_KEY = "vanidaxi_settings";

const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Hola, necesito ayuda con VaniDaxi.";

const categories = [
  {
    name: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Belleza y Salud",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=85",
  },
];

const initialProducts = [
  {
    id: 1,
    name: "Smartwatch Pro",
    price: 899,
    oldPrice: 1299,
    rating: 4.8,
    reviews: 124,
    discount: 31,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    description:
      "Smartwatch moderno con funciones inteligentes para todos los días.",
    specifications: [
      "Pantalla táctil",
      "Monitor de actividad",
      "Resistente al agua",
      "Batería de larga duración",
    ],
  },
  {
    id: 2,
    name: "Licuadora Profesional",
    price: 749,
    oldPrice: 999,
    rating: 4.7,
    reviews: 89,
    discount: 25,
    category: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=85",
    description:
      "Licuadora potente ideal para preparar bebidas, salsas y alimentos.",
    specifications: [
      "Motor de alta potencia",
      "Vaso de gran capacidad",
      "Varias velocidades",
      "Cuchillas de acero",
    ],
  },
  {
    id: 3,
    name: "Tenis Urbanos",
    price: 599,
    oldPrice: 799,
    rating: 4.9,
    reviews: 156,
    discount: 25,
    category: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    description:
      "Tenis cómodos y modernos para complementar cualquier estilo.",
    specifications: [
      "Diseño urbano",
      "Suela antiderrapante",
      "Material resistente",
      "Disponible en varias tallas",
    ],
  },
  {
    id: 4,
    name: "Audífonos Bluetooth",
    price: 499,
    oldPrice: 699,
    rating: 4.6,
    reviews: 203,
    discount: 29,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    description:
      "Audífonos inalámbricos con sonido envolvente y batería de larga duración.",
    specifications: [
      "Bluetooth",
      "Micrófono integrado",
      "Controles táctiles",
      "Estuche de carga",
    ],
  },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState(initialProducts);

  const [cart, setCart] = useState(() =>
    loadStorage(CART_KEY, [])
  );

  const [favorites, setFavorites] = useState(() =>
    loadStorage(FAVORITES_KEY, [])
  );

  const [settings, setSettings] = useState(() =>
    loadStorage(SETTINGS_KEY, {
      notifications: true,
      promotions: true,
      darkMode: false,
    })
  );

  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkout, setCheckout] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
    delivery: "standard",
    payment: "card",
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Ropa y Moda",
    image: "",
    description: "",
  });

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (mounted) {
        setUser(data?.user || null);
      }
    };

    getUser();

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

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    document.body.classList.toggle(
      "dark-theme",
      Boolean(settings.darkMode)
    );

    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, [settings]);

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartSubtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shippingCost =
    checkout.delivery === "express" && cart.length > 0
      ? 99
      : 0;

  const cartTotal = cartSubtotal + shippingCost;

  const activeCategory = location.pathname.startsWith(
    "/categoria/"
  )
    ? decodeURIComponent(
        location.pathname.replace("/categoria/", "")
      )
    : "Todos";

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "Todos") {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    const term = normalizeText(search);

    if (!term) {
      return result;
    }

    return result.filter((product) => {
      const searchable = normalizeText(
        [
          product.name,
          product.category,
          product.description,
          ...(product.specifications || []),
        ].join(" ")
      );

      return searchable.includes(term);
    });
  }, [products, activeCategory, search]);

  const currentProductId = location.pathname.startsWith(
    "/producto/"
  )
    ? location.pathname.replace("/producto/", "")
    : null;

  const selectedProduct = currentProductId
    ? products.find(
        (product) =>
          String(product.id) === String(currentProductId)
      )
    : null;

  const go = (path) => {
    if (location.pathname === path) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    navigate(path);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setSearch("");
    go("/");
  };

  const goProducts = () => {
    setSearch("");
    go("/productos");
  };

  const goCategory = (category) => {
    setSearch("");
    go(`/categoria/${encodeURIComponent(category)}`);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthMessage("");

    go(
      mode === "register"
        ? "/cuenta/crear"
        : "/cuenta/iniciar"
    );
  };

  const addToCart = (product, redirect = true) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1,
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

    if (redirect) {
      go("/carrito");
    }
  };

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Number(item.quantity || 1) + amount
              ),
            }
          : item
      )
    );
  };

  const toggleFavorite = (product) => {
    setFavorites((current) => {
      const exists = current.some(
        (item) => item.id === product.id
      );

      return exists
        ? current.filter(
            (item) => item.id !== product.id
          )
        : [...current, product];
    });
  };

  const startCheckout = (product = null) => {
    if (product) {
      addToCart(product, false);
    }

    if (!product && cart.length === 0) {
      go("/carrito");
      return;
    }

    go("/checkout/entrega");
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setAuthMessage("");

    try {
      const email = authEmail.trim();

      if (!email) {
        setAuthMessage(
          "Escribe tu correo electrónico."
        );
        return;
      }

      if (!authPassword) {
        setAuthMessage("Escribe tu contraseña.");
        return;
      }

      if (authMode === "register") {
        if (authPassword.length < 6) {
          setAuthMessage(
            "La contraseña debe tener al menos 6 caracteres."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email,
            password: authPassword,
            options: {
              data: {
                full_name: authName.trim(),
              },
            },
          });

        if (error) throw error;

        if (data?.session) {
          setUser(data.user);
          go("/cuenta");
        } else {
          setAuthMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password: authPassword,
          });

        if (error) throw error;

        setUser(data.user);
        go("/cuenta");
      }
    } catch (error) {
      const message = error?.message || "";
      const normalizedMessage = normalizeText(message);

      if (
        normalizedMessage.includes(
          "invalid login credentials"
        )
      ) {
        setAuthMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        normalizedMessage.includes(
          "email not confirmed"
        )
      ) {
        setAuthMessage(
          "Debes confirmar tu correo antes de iniciar sesión."
        );
      } else if (
        normalizedMessage.includes(
          "user already registered"
        )
      ) {
        setAuthMessage(
          "Este correo ya tiene una cuenta. Intenta iniciar sesión."
        );
      } else {
        setAuthMessage(
          message ||
            "No fue posible completar la operación."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    go("/");
  };

  const handlePublish = (event) => {
    event.preventDefault();

    const name = newProduct.name.trim();

    if (!name) return;

    const product = {
      id: Date.now(),
      name,
      price: Number(newProduct.price) || 0,
      oldPrice: 0,
      rating: 5,
      reviews: 0,
      discount: 0,
      category: newProduct.category,
      image:
        newProduct.image.trim() ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
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
      category: "Ropa y Moda",
      image: "",
      description: "",
    });

    go("/productos");
  };

  const updateCheckout = (field, value) => {
    setCheckout((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      go("/carrito");
      return;
    }

    alert(
      "¡Pedido recibido! Esta es una demostración del proceso de compra."
    );

    setCart([]);
    go("/");
  };

  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        WHATSAPP_MESSAGE
      )}`
    : `https://wa.me/?text=${encodeURIComponent(
        WHATSAPP_MESSAGE
      )}`;

  const isHome =
    location.pathname === "/" ||
    location.pathname === "";

  const isProducts =
    location.pathname === "/productos";

  const isAccount =
    location.pathname === "/cuenta";

  const isAuth =
    location.pathname === "/cuenta/iniciar" ||
    location.pathname === "/cuenta/crear";

  const isCart =
    location.pathname === "/carrito";

  const isCheckout =
    location.pathname === "/checkout/entrega";

  const isFavorites =
    location.pathname === "/favoritos";

  const isPublish =
    location.pathname === "/publicar";

  const isMenu =
    location.pathname === "/menu";

  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #ffffff;
          color: #25212a;
        }

        body.dark-theme {
          background: #111014;
          color: #f7f4f8;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        input,
        textarea,
        select {
          -webkit-tap-highlight-color: transparent;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .app {
          min-height: 100vh;
          background: #fff;
        }

        .dark-theme .app {
          background: #111014;
          color: #f7f4f8;
        }

        /* =========================
           ENCABEZADO
        ========================= */

        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #f0e8f0;
        }

        .dark-theme .topbar {
          background: rgba(22,20,24,.97);
          border-color: #302b32;
        }

        .header-inner {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding: 9px 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .brand {
          border: 0;
          background: transparent;
          padding: 3px 0;
          font-weight: 950;
          font-size: 23px;
          letter-spacing: -1.3px;
          white-space: nowrap;
          background: linear-gradient(
            90deg,
            #e9274f 0%,
            #d52287 48%,
            #7528c6 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .menu-btn,
        .icon-btn {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border: 0;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #fff;
          color: #7628bf;
          box-shadow: 0 5px 16px rgba(92,27,105,.09);
        }

        .dark-theme .menu-btn,
        .dark-theme .icon-btn {
          background: #28232a;
          color: #fff;
        }

        .menu-lines {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-lines span {
          width: 18px;
          height: 2px;
          border-radius: 5px;
          background: currentColor;
        }

        .search-box {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .search-box input {
          width: 100%;
          height: 40px;
          border: 1px solid #eadfea;
          border-radius: 15px;
          outline: none;
          padding: 0 42px 0 14px;
          background: #fff;
          color: #222;
          appearance: none;
          -webkit-appearance: none;
        }

        .search-box input:focus {
          border-color: #d52287;
          box-shadow: 0 0 0 3px rgba(213,34,135,.09);
        }

        .dark-theme .search-box input {
          background: #211e23;
          color: #fff;
          border-color: #3a343d;
        }

        .search-icon {
          position: absolute;
          right: 13px;
          top: 9px;
          pointer-events: none;
          font-size: 18px;
        }

        .cart-button {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          border-radius: 99px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #ed2850,
            #d31d8a,
            #7528c6
          );
          border: 2px solid #fff;
          font-size: 10px;
          font-weight: 900;
        }

        /* =========================
           CATEGORÍAS SUPERIORES
        ========================= */

        .category-nav {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding: 4px 0 8px;
          display: flex;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-nav::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          flex: 0 0 auto;
          border: 1px solid #eee4f0;
          background: #fff;
          color: #514953;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 11px;
          font-weight: 800;
        }

        .dark-theme .category-pill {
          background: #211e23;
          color: #eee;
          border-color: #39333c;
        }

        .category-pill.active {
          border-color: transparent;
          color: #fff;
          background: linear-gradient(
            90deg,
            #e9274f,
            #d52287,
            #7528c6
          );
        }

        /* =========================
           HERO
        ========================= */

        .page {
          min-height: calc(100vh - 100px);
        }

        .hero {
          width: min(1180px, calc(100% - 24px));
          margin: 14px auto 0;
        }

        .hero-box {
          min-height: 285px;
          padding: 31px 27px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(
              circle at 92% 15%,
              rgba(255,255,255,.16),
              transparent 30%
            ),
            linear-gradient(
              120deg,
              #e9274f,
              #d52287 53%,
              #7528c6
            );
          box-shadow: 0 15px 38px rgba(137,31,108,.15);
        }

        .hero-box::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 270px;
          border-radius: 50%;
          right: -115px;
          bottom: -150px;
          background: rgba(255,255,255,.10);
        }

        .hero h1 {
          position: relative;
          z-index: 2;
          max-width: 650px;
          margin: 0 0 12px;
          font-size: clamp(32px, 7vw, 55px);
          line-height: .99;
          letter-spacing: -2.3px;
        }

        .hero p {
          position: relative;
          z-index: 2;
          max-width: 540px;
          margin: 0 0 21px;
          font-size: 14px;
          line-height: 1.5;
          opacity: .95;
        }

        .gradient-btn,
        .white-btn {
          border: 0;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 12px;
          font-weight: 850;
          transition:
            transform .18s ease,
            opacity .18s ease;
        }

        .gradient-btn:hover,
        .white-btn:hover,
        .category-card:hover,
        .product-card:hover {
          transform: translateY(-2px);
        }

        .gradient-btn {
          color: #fff;
          background: linear-gradient(
            100deg,
            #e9274f,
            #d52287,
            #7528c6
          );
          box-shadow: 0 8px 20px rgba(115,25,111,.16);
        }

        .gradient-btn:disabled {
          opacity: .65;
          cursor: wait;
          transform: none;
        }

        .white-btn {
          color: #a62291;
          background: #fff;
        }

        /* =========================
           PROMOCIÓN
        ========================= */

        .promo {
          width: min(1180px, calc(100% - 24px));
          margin: 13px auto 0;
        }

        .promo-box {
          min-height: 76px;
          padding: 13px 15px;
          border: 1px solid #f1dce9;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 13px;
          background: linear-gradient(
            135deg,
            #fff6f9,
            #fbf4ff
          );
        }

        .dark-theme .promo-box {
          background: #211b22;
          border-color: #40303e;
        }

        .promo-box strong {
          display: block;
          margin-bottom: 3px;
          font-size: 13px;
        }

        .promo-box span {
          display: block;
          color: #746d76;
          font-size: 11px;
          line-height: 1.35;
        }

        .dark-theme .promo-box span {
          color: #bbb;
        }

        /* =========================
           SECCIONES
        ========================= */

        .section {
          width: min(1180px, calc(100% - 24px));
          margin: 31px auto;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 13px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 21px;
          letter-spacing: -.5px;
        }

        .section-title button {
          border: 0;
          background: transparent;
          color: #8127b9;
          font-size: 12px;
          font-weight: 850;
        }

        /* =========================
           TARJETAS DE CATEGORÍA
           ========================= */

        .categories {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .category-card {
          position: relative;
          height: 96px;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #eee4f0;
          border-radius: 16px;
          padding: 0;
          background: #eee;
          transition: transform .18s ease;
          box-shadow: 0 5px 15px rgba(92,25,105,.055);
        }

        .category-card img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .category-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            transparent 25%,
            rgba(20,8,22,.72)
          );
        }

        .category-name {
          position: absolute;
          z-index: 2;
          left: 7px;
          right: 7px;
          bottom: 8px;
          color: #fff;
          font-size: 10px;
          line-height: 1.1;
          text-align: center;
          font-weight: 900;
        }

        /* =========================
           PRODUCTOS
        ========================= */

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .product-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #eee6ef;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 5px 16px rgba(66,23,75,.045);
          transition: transform .18s ease;
        }

        .dark-theme .product-card {
          background: #19171b;
          border-color: #332d35;
        }

        .product-image-wrap {
          position: relative;
          height: 185px;
          background: #f5f3f5;
        }

        .product-image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .discount {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 4px 7px;
          border-radius: 8px;
          color: #fff;
          background: #e9274f;
          font-size: 9px;
          font-weight: 900;
        }

        .favorite {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.94);
          color: #a01b86;
          font-size: 17px;
        }

        .product-info {
          padding: 10px;
        }

        .product-info h3 {
          min-height: 32px;
          margin: 0 0 5px;
          font-size: 13px;
          line-height: 1.25;
        }

        .rating {
          margin-bottom: 5px;
          font-size: 10px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
        }

        .price {
          font-size: 17px;
          font-weight: 950;
        }

        .old-price {
          color: #999;
          font-size: 10px;
          text-decoration: line-through;
        }

        .product-actions {
          display: flex;
          gap: 6px;
          margin-top: 9px;
        }

        .small-btn {
          flex: 1;
          min-height: 35px;
          border: 0;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 850;
        }

        .details-btn {
          color: #4d4850;
          background: #f1eef2;
        }

        .dark-theme .details-btn {
          color: #fff;
          background: #2b272d;
        }

        .buy-btn {
          color: #fff;
          background: linear-gradient(
            100deg,
            #e9274f,
            #d52287,
            #7528c6
          );
        }

        /* =========================
           DETALLE
        ========================= */

        .detail {
          width: min(1100px, calc(100% - 24px));
          margin: auto;
          padding: 26px 0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 27px;
        }

        .detail-image {
          width: 100%;
          max-height: 550px;
          display: block;
          object-fit: cover;
          border-radius: 22px;
        }

        .detail h1 {
          margin: 0 0 9px;
          font-size: clamp(28px, 5vw, 44px);
          line-height: 1;
          letter-spacing: -1.4px;
        }

        .detail-description {
          color: #6d6870;
          line-height: 1.6;
          font-size: 14px;
        }

        .dark-theme .detail-description {
          color: #bbb;
        }

        .specs {
          margin: 19px 0;
          padding: 0;
          list-style: none;
        }

        .specs li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }

        .dark-theme .specs li {
          border-color: #333;
        }

        .large-price {
          margin: 14px 0;
          font-size: 30px;
          font-weight: 950;
        }

        .back-btn {
          border: 0;
          background: #f1eef2;
          color: #302b31;
          border-radius: 11px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .dark-theme .back-btn {
          background: #2b272d;
          color: #fff;
        }

        /* =========================
           CUENTA / LOGIN / CHECKOUT
        ========================= */

        .auth-page,
        .account-page,
        .checkout-page,
        .cart-page {
          width: min(900px, calc(100% - 24px));
          margin: auto;
          padding: 26px 0;
        }

        .auth-card {
          max-width: 470px;
          margin: 10px auto;
          padding: 25px;
          border: 1px solid #eee4ef;
          border-radius: 21px;
          background: #fff;
          box-shadow: 0 13px 40px rgba(0,0,0,.055);
        }

        .dark-theme .auth-card {
          background: #1a181c;
          border-color: #353036;
        }

        .auth-logo {
          width: 58px;
          height: 58px;
          margin-bottom: 13px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: #fff;
          font-size: 27px;
          font-weight: 950;
          background: linear-gradient(
            135deg,
            #e9274f,
            #d52287,
            #7528c6
          );
        }

        .auth-card h1 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .auth-card p {
          color: #777;
          line-height: 1.45;
          font-size: 13px;
        }

        .dark-theme .auth-card p {
          color: #bbb;
        }

        .form-group {
          margin-bottom: 13px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 850;
        }

        .form-control {
          width: 100%;
          min-height: 43px;
          padding: 9px 12px;
          border: 1px solid #ded8df;
          border-radius: 11px;
          outline: none;
          background: #fff;
          color: #222;
          appearance: none;
          -webkit-appearance: none;
          touch-action: manipulation;
          user-select: text;
          -webkit-user-select: text;
        }

        .form-control:focus {
          border-color: #d52287;
          box-shadow: 0 0 0 3px rgba(213,34,135,.09);
        }

        .dark-theme .form-control {
          background: #252228;
          color: #fff;
          border-color: #454047;
        }

        textarea.form-control {
          min-height: 100px;
          resize: vertical;
        }

        .auth-submit {
          width: 100%;
          margin-top: 5px;
        }

        .message {
          margin: 11px 0;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fff0f5;
          color: #a00055;
          font-size: 12px;
          line-height: 1.4;
        }

        .auth-switch {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
        }

        .auth-switch button {
          border: 0;
          background: transparent;
          color: #9022ad;
          font-weight: 900;
        }

        .account-card,
        .checkout-card,
        .cart-card {
          margin-bottom: 14px;
          padding: 20px;
          border: 1px solid #eee4ef;
          border-radius: 20px;
          background: #fff;
        }

        .dark-theme .account-card,
        .dark-theme .checkout-card,
        .dark-theme .cart-card {
          background: #19171b;
          border-color: #353036;
        }

        .account-actions {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 10px;
          margin-top: 15px;
        }

        .account-action {
          padding: 15px;
          border: 1px solid #eee4ef;
          border-radius: 14px;
          background: #fff;
          color: inherit;
          text-align: left;
          font-weight: 750;
        }

        .dark-theme .account-action {
          background: #252228;
          border-color: #353036;
        }

        /* =========================
           CARRITO
        ========================= */

        .cart-item {
          display: grid;
          grid-template-columns: 70px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .dark-theme .cart-item {
          border-color: #333;
        }

        .cart-item img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 12px;
        }

        .qty {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .qty button {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 8px;
          background: #eee;
        }

        .dark-theme .qty button {
          background: #333;
          color: #fff;
        }

        .remove {
          border: 0;
          background: transparent;
          color: #dc0759;
          font-size: 11px;
          font-weight: 850;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 7px 0;
          font-size: 13px;
        }

        .summary.total {
          margin-top: 7px;
          padding-top: 14px;
          border-top: 1px solid #eee;
          font-size: 19px;
          font-weight: 950;
        }

        .dark-theme .summary.total {
          border-color: #333;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 16px;
        }

        /* =========================
           MENÚ
        ========================= */

        .menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(15,8,17,.40);
        }

        .menu-panel {
          width: min(310px, 86vw);
          height: 100%;
          padding: 20px;
          overflow-y: auto;
          background: #fff;
          color: #262128;
          box-shadow: 10px 0 35px rgba(0,0,0,.18);
          animation: menuIn .18s ease-out;
        }

        .dark-theme .menu-panel {
          background: #19171b;
          color: #fff;
        }

        @keyframes menuIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .menu-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .menu-head h2 {
          margin: 0;
          font-size: 22px;
        }

        .menu-close {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f1eef2;
        }

        .dark-theme .menu-close {
          background: #2b272d;
          color: #fff;
        }

        .menu-item {
          width: 100%;
          min-height: 45px;
          padding: 11px 7px;
          border: 0;
          border-bottom: 1px solid #eee;
          background: transparent;
          color: inherit;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .dark-theme .menu-item {
          border-color: #333;
        }

        /* =========================
           VACÍO / FOOTER / AYUDA
        ========================= */

        .empty {
          padding: 38px 18px;
          border: 1px dashed #ddd;
          border-radius: 17px;
          text-align: center;
          color: #777;
          font-size: 13px;
        }

        .dark-theme .empty {
          border-color: #444;
          color: #aaa;
        }

        .floating-help {
          position: fixed;
          right: 15px;
          bottom: 15px;
          z-index: 120;
          width: 53px;
          height: 53px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #e9274f,
            #d52287,
            #7528c6
          );
          box-shadow: 0 10px 27px rgba(119,27,107,.28);
          font-size: 23px;
        }

        .footer {
          margin-top: 25px;
          padding: 32px 16px 90px;
          background: #171419;
          color: #fff;
          text-align: center;
        }

        .footer-brand {
          font-size: 24px;
          font-weight: 950;
          background: linear-gradient(
            90deg,
            #e9274f,
            #d52287,
            #7528c6
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .footer p {
          color: #aaa;
          font-size: 12px;
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .products-grid {
            grid-template-columns: repeat(3,minmax(0,1fr));
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =========================
           MÓVIL
        ========================= */

        @media (max-width: 650px) {
          .header-inner {
            width: calc(100% - 16px);
            gap: 6px;
            padding: 7px 0;
          }

          .menu-btn,
          .icon-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            border-radius: 11px;
          }

          .brand {
            font-size: 19px;
            letter-spacing: -1px;
          }

          .search-box input {
            height: 36px;
            border-radius: 13px;
            padding-left: 10px;
            font-size: 12px;
          }

          .search-icon {
            top: 8px;
            right: 10px;
            font-size: 15px;
          }

          .category-nav {
            width: calc(100% - 16px);
            padding-top: 2px;
            padding-bottom: 7px;
          }

          .category-pill {
            padding: 6px 9px;
            font-size: 10px;
          }

          .hero {
            width: calc(100% - 16px);
            margin-top: 10px;
          }

          .hero-box {
            min-height: 255px;
            padding: 25px 19px;
            border-radius: 20px;
          }

          .hero h1 {
            font-size: 34px;
            letter-spacing: -1.7px;
          }

          .hero p {
            max-width: 330px;
            font-size: 13px;
          }

          .promo {
            width: calc(100% - 16px);
          }

          .promo-box {
            padding: 11px;
            border-radius: 15px;
          }

          .promo-box span {
            font-size: 9px;
          }

          .promo-box .gradient-btn {
            min-height: 36px;
            padding: 0 10px;
            font-size: 10px;
          }

          .section {
            width: calc(100% - 16px);
            margin: 26px auto;
          }

          .section-title h2 {
            font-size: 18px;
          }

          .categories {
            grid-template-columns: repeat(4,minmax(0,1fr));
            gap: 7px;
          }

          .category-card {
            height: 80px;
            border-radius: 12px;
          }

          .category-name {
            font-size: 8px;
            left: 3px;
            right: 3px;
            bottom: 6px;
          }

          .products-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 8px;
          }

          .product-image-wrap {
            height: 145px;
          }

          .product-info {
            padding: 8px;
          }

          .product-info h3 {
            font-size: 12px;
            min-height: 30px;
          }

          .rating {
            font-size: 9px;
          }

          .price {
            font-size: 15px;
          }

          .old-price {
            font-size: 9px;
          }

          .product-actions {
            gap: 4px;
          }

          .small-btn {
            min-height: 33px;
            font-size: 9px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail {
            width: calc(100% - 16px);
            padding-top: 18px;
          }

          .detail-image {
            max-height: 420px;
            border-radius: 18px;
          }

          .auth-page,
          .account-page,
          .checkout-page,
          .cart-page {
            width: calc(100% - 16px);
            padding-top: 18px;
          }

          .auth-card {
            padding: 20px;
            border-radius: 18px;
          }

          .account-actions {
            grid-template-columns: 1fr;
          }

          .cart-item {
            grid-template-columns: 58px 1fr;
          }

          .cart-item img {
            width: 58px;
            height: 58px;
          }

          .cart-item > strong {
            grid-column: 2;
          }

          .floating-help {
            width: 50px;
            height: 50px;
            right: 11px;
            bottom: 11px;
          }
        }

        @media (max-width: 390px) {
          .brand {
            font-size: 17px;
          }

          .categories {
            gap: 5px;
          }

          .category-card {
            height: 76px;
          }

          .product-image-wrap {
            height: 132px;
          }

          .product-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="header-inner">
          <button
            type="button"
            className="menu-btn"
            onClick={() => go("/menu")}
            aria-label="Abrir menú"
          >
            <span className="menu-lines">
              <span />
              <span />
              <span />
            </span>
          </button>

          <button
            type="button"
            className="brand"
            onClick={goHome}
          >
            VaniDaxi
          </button>

          <div className="search-box">
            <input
              type="search"
              inputMode="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  go("/productos");
                }
              }}
              placeholder="Buscar productos..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="search"
            />

            <span className="search-icon">
              🔎
            </span>
          </div>

          <button
            type="button"
            className="icon-btn cart-button"
            onClick={() => go("/carrito")}
            aria-label="Carrito"
          >
            🛒

            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="category-nav">
          <button
            type="button"
            className={`category-pill ${
              activeCategory === "Todos" &&
              isProducts
                ? "active"
                : ""
            }`}
            onClick={goProducts}
          >
            Todos
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className={`category-pill ${
                activeCategory === category.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                goCategory(category.name)
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {isHome && (
        <>
          <main className="page">
            <section className="hero">
              <div className="hero-box">
                <h1>
                  Todo lo que buscas,
                  <br />
                  en un solo lugar.
                </h1>

                <p>
                  Compra, descubre y encuentra
                  productos de diferentes
                  vendedores en VaniDaxi.
                </p>

                <button
                  type="button"
                  className="white-btn"
                  onClick={goProducts}
                >
                  Explorar productos
                </button>
              </div>
            </section>

            <section className="promo">
              <div className="promo-box">
                <div>
                  <strong>
                    ✨ Crea tu cuenta gratis
                  </strong>

                  <span>
                    Guarda favoritos, administra
                    pedidos y disfruta una mejor
                    experiencia.
                  </span>
                </div>

                <button
                  type="button"
                  className="gradient-btn"
                  onClick={() =>
                    openAuth("register")
                  }
                >
                  Crear cuenta
                </button>
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <h2>Categorías</h2>

                <button
                  type="button"
                  onClick={goProducts}
                >
                  Ver todas
                </button>
              </div>

              <div className="categories">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.name}
                    className="category-card"
                    onClick={() =>
                      goCategory(category.name)
                    }
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                    />

                    <span className="category-name">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <h2>
                  Productos destacados
                </h2>

                <button
                  type="button"
                  onClick={goProducts}
                >
                  Ver todos
                </button>
              </div>

              <div className="products-grid">
                {products
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      favorites={favorites}
                      onFavorite={toggleFavorite}
                      onDetails={(item) =>
                        go(
                          `/producto/${item.id}`
                        )
                      }
                      onBuy={startCheckout}
                    />
                  ))}
              </div>
            </section>
          </main>

          <footer className="footer">
            <div className="footer-brand">
              VaniDaxi
            </div>

            <p>
              Todo lo que buscas, en un solo
              lugar.
            </p>
          </footer>
        </>
      )}

      {(isProducts ||
        location.pathname.startsWith(
          "/categoria/"
        )) && (
        <main className="page">
          <section className="section">
            <div className="section-title">
              <h2>
                {activeCategory === "Todos"
                  ? "Todos los productos"
                  : activeCategory}
              </h2>

              <span>
                {filteredProducts.length} productos
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty">
                No encontramos productos
                para tu búsqueda.
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      favorites={favorites}
                      onFavorite={toggleFavorite}
                      onDetails={(item) =>
                        go(
                          `/producto/${item.id}`
                        )
                      }
                      onBuy={startCheckout}
                    />
                  )
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {selectedProduct && (
        <main className="page">
          <section className="detail">
            <button
              type="button"
              className="back-btn"
              onClick={() =>
                window.history.back()
              }
            >
              ← Volver
            </button>

            <div className="detail-grid">
              <div>
                <img
                  className="detail-image"
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                />
              </div>

              <div>
                <h1>
                  {selectedProduct.name}
                </h1>

                <div className="rating">
                  ⭐ {selectedProduct.rating} ·{" "}
                  {selectedProduct.reviews} reseñas
                </div>

                <div className="large-price">
                  {formatPrice(
                    selectedProduct.price
                  )}
                </div>

                {selectedProduct.oldPrice >
                  selectedProduct.price && (
                  <div className="old-price">
                    {formatPrice(
                      selectedProduct.oldPrice
                    )}
                  </div>
                )}

                <p className="detail-description">
                  {
                    selectedProduct.description
                  }
                </p>

                {selectedProduct
                  .specifications?.length > 0 && (
                  <>
                    <h3>
                      Características
                    </h3>

                    <ul className="specs">
                      {selectedProduct.specifications.map(
                        (specification) => (
                          <li
                            key={
                              specification
                            }
                          >
                            ✓ {specification}
                          </li>
                        )
                      )}
                    </ul>
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="gradient-btn"
                    onClick={() =>
                      startCheckout(
                        selectedProduct
                      )
                    }
                  >
                    Comprar ahora
                  </button>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() =>
                      addToCart(
                        selectedProduct,
                        false
                      )
                    }
                  >
                    🛒 Agregar al carrito
                  </button>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() =>
                      toggleFavorite(
                        selectedProduct
                      )
                    }
                  >
                    {favorites.some(
                      (item) =>
                        item.id ===
                        selectedProduct.id
                    )
                      ? "♥ Favorito"
                      : "♡ Favorito"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {isAuth && (
        <main className="page">
          <section className="auth-page">
            <form
              className="auth-card"
              onSubmit={handleAuth}
              autoComplete="on"
            >
              <div className="auth-logo">
                V
              </div>

              <h1>
                {authMode === "register"
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
              </h1>

              <p>
                {authMode === "register"
                  ? "Crea tu cuenta para disfrutar de VaniDaxi."
                  : "Entra a tu cuenta para continuar."}
              </p>

              {authMode === "register" && (
                <div className="form-group">
                  <label htmlFor="auth-name">
                    Nombre
                  </label>

                  <input
                    id="auth-name"
                    className="form-control"
                    type="text"
                    name="name"
                    value={authName}
                    onChange={(event) =>
                      setAuthName(
                        event.target.value
                      )
                    }
                    autoComplete="name"
                    autoCorrect="off"
                    autoCapitalize="words"
                    spellCheck="false"
                    inputMode="text"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">
                  Correo electrónico
                </label>

                <input
                  id="auth-email"
                  className="form-control"
                  type="email"
                  name="email"
                  value={authEmail}
                  onChange={(event) =>
                    setAuthEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">
                  Contraseña
                </label>

                <input
                  id="auth-password"
                  className="form-control"
                  type="password"
                  name="password"
                  value={authPassword}
                  onChange={(event) =>
                    setAuthPassword(
                      event.target.value
                    )
                  }
                  autoComplete={
                    authMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              {authMessage && (
                <div className="message">
                  {authMessage}
                </div>
              )}

              <button
                className="gradient-btn auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode === "register"
                  ? "Crear cuenta"
                  : "Entrar"}
              </button>

              <div className="auth-switch">
                {authMode === "register"
                  ? "¿Ya tienes una cuenta? "
                  : "¿No tienes una cuenta? "}

                <button
                  type="button"
                  onClick={() =>
                    openAuth(
                      authMode === "register"
                        ? "login"
                        : "register"
                    )
                  }
                >
                  {authMode === "register"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
                </button>
              </div>
            </form>
          </section>
        </main>
      )}

      {isAccount && (
        <main className="page">
          <section className="account-page">
            <div className="account-card">
              <h1>Mi cuenta</h1>

              {user ? (
                <>
                  <p>
                    Sesión iniciada como{" "}
                    <strong>
                      {user.email}
                    </strong>
                  </p>

                  <div className="account-actions">
                    <button
                      type="button"
                      className="account-action"
                      onClick={() =>
                        go("/favoritos")
                      }
                    >
                      ❤️
                      <br />
                      Favoritos
                    </button>

                    <button
                      type="button"
                      className="account-action"
                      onClick={() =>
                        go("/publicar")
                      }
                    >
                      📦
                      <br />
                      Publicar producto
                    </button>

                    <button
                      type="button"
                      className="account-action"
                      onClick={() =>
                        go("/carrito")
                      }
                    >
                      🛒
                      <br />
                      Mi carrito
                    </button>

                    <button
                      type="button"
                      className="account-action"
                      onClick={() =>
                        setSettings(
                          (current) => ({
                            ...current,
                            darkMode:
                              !current.darkMode,
                          })
                        )
                      }
                    >
                      ⚙️
                      <br />
                      {settings.darkMode
                        ? "Modo claro"
                        : "Modo oscuro"}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="back-btn"
                    style={{
                      marginTop: 17,
                    }}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <p>
                    Inicia sesión o crea tu
                    cuenta para continuar.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 9,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="gradient-btn"
                      onClick={() =>
                        openAuth("login")
                      }
                    >
                      Iniciar sesión
                    </button>

                    <button
                      type="button"
                      className="back-btn"
                      onClick={() =>
                        openAuth("register")
                      }
                    >
                      Crear cuenta
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      )}

      {isFavorites && (
        <main className="page">
          <section className="section">
            <div className="section-title">
              <h2>Mis favoritos</h2>
            </div>

            {favorites.length === 0 ? (
              <div className="empty">
                Aún no tienes productos
                favoritos.
              </div>
            ) : (
              <div className="products-grid">
                {favorites.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorites={favorites}
                    onFavorite={toggleFavorite}
                    onDetails={(item) =>
                      go(
                        `/producto/${item.id}`
                      )
                    }
                    onBuy={startCheckout}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {isCart && (
        <main className="page">
          <section className="cart-page">
            <div className="section-title">
              <h2>Mi carrito</h2>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                Tu carrito está vacío.
                <br />

                <button
                  type="button"
                  className="gradient-btn"
                  style={{
                    marginTop: 15,
                  }}
                  onClick={goProducts}
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <>
                <div className="cart-card">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <div
                          style={{
                            marginTop: 5,
                          }}
                        >
                          {formatPrice(
                            item.price
                          )}
                        </div>

                        <div
                          className="qty"
                          style={{
                            marginTop: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
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
                              changeQuantity(
                                item.id,
                                1
                              )
                            }
                          >
                            +
                          </button>

                          <button
                            className="remove"
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.price) *
                            Number(
                              item.quantity
                            )
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="cart-card">
                  <div className="summary">
                    <span>Subtotal</span>

                    <strong>
                      {formatPrice(
                        cartSubtotal
                      )}
                    </strong>
                  </div>

                  <div className="summary">
                    <span>Envío</span>

                    <strong>
                      {shippingCost === 0
                        ? "Gratis"
                        : formatPrice(
                            shippingCost
                          )}
                    </strong>
                  </div>

                  <div className="summary total">
                    <span>Total</span>

                    <strong>
                      {formatPrice(cartTotal)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="gradient-btn"
                    style={{
                      width: "100%",
                      marginTop: 14,
                    }}
                    onClick={() =>
                      startCheckout()
                    }
                  >
                    Continuar con la compra
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      )}

      {isCheckout && (
        <main className="page">
          <section className="checkout-page">
            <div className="section-title">
              <h2>Datos de entrega</h2>
            </div>

            <div className="checkout-grid">
              <form
                className="checkout-card"
                onSubmit={submitOrder}
              >
                <div className="form-group">
                  <label htmlFor="checkout-name">
                    Nombre completo
                  </label>

                  <input
                    id="checkout-name"
                    className="form-control"
                    type="text"
                    name="checkout-name"
                    value={checkout.name}
                    onChange={(event) =>
                      updateCheckout(
                        "name",
                        event.target.value
                      )
                    }
                    autoComplete="name"
                    autoCorrect="off"
                    inputMode="text"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-phone">
                    Teléfono
                  </label>

                  <input
                    id="checkout-phone"
                    className="form-control"
                    type="tel"
                    name="checkout-phone"
                    value={checkout.phone}
                    onChange={(event) =>
                      updateCheckout(
                        "phone",
                        event.target.value
                      )
                    }
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-address">
                    Dirección
                  </label>

                  <input
                    id="checkout-address"
                    className="form-control"
                    type="text"
                    name="checkout-address"
                    value={checkout.address}
                    onChange={(event) =>
                      updateCheckout(
                        "address",
                        event.target.value
                      )
                    }
                    autoComplete="street-address"
                    autoCorrect="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-city">
                    Ciudad
                  </label>

                  <input
                    id="checkout-city"
                    className="form-control"
                    type="text"
                    name="checkout-city"
                    value={checkout.city}
                    onChange={(event) =>
                      updateCheckout(
                        "city",
                        event.target.value
                      )
                    }
                    autoComplete="address-level2"
                    autoCorrect="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-state">
                    Estado
                  </label>

                  <input
                    id="checkout-state"
                    className="form-control"
                    type="text"
                    name="checkout-state"
                    value={checkout.state}
                    onChange={(event) =>
                      updateCheckout(
                        "state",
                        event.target.value
                      )
                    }
                    autoComplete="address-level1"
                    autoCorrect="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-zip">
                    Código postal
                  </label>

                  <input
                    id="checkout-zip"
                    className="form-control"
                    type="text"
                    name="checkout-zip"
                    value={checkout.zip}
                    onChange={(event) =>
                      updateCheckout(
                        "zip",
                        event.target.value
                      )
                    }
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-delivery">
                    Tipo de envío
                  </label>

                  <select
                    id="checkout-delivery"
                    className="form-control"
                    name="delivery"
                    value={checkout.delivery}
                    onChange={(event) =>
                      updateCheckout(
                        "delivery",
                        event.target.value
                      )
                    }
                  >
                    <option value="standard">
                      Envío estándar — Gratis
                    </option>

                    <option value="express">
                      Envío express — $99
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-payment">
                    Método de pago
                  </label>

                  <select
                    id="checkout-payment"
                    className="form-control"
                    name="payment"
                    value={checkout.payment}
                    onChange={(event) =>
                      updateCheckout(
                        "payment",
                        event.target.value
                      )
                    }
                  >
                    <option value="card">
                      Tarjeta
                    </option>

                    <option value="transfer">
                      Transferencia
                    </option>

                    <option value="cash">
                      Pago contra entrega
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-notes">
                    Notas
                  </label>

                  <textarea
                    id="checkout-notes"
                    className="form-control"
                    name="notes"
                    value={checkout.notes}
                    onChange={(event) =>
                      updateCheckout(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Indicaciones para la entrega..."
                    autoCorrect="off"
                  />
                </div>

                <button
                  className="gradient-btn"
                  style={{
                    width: "100%",
                    marginTop: 7,
                  }}
                  type="submit"
                >
                  Confirmar pedido
                </button>
              </form>

              <div className="checkout-card">
                <h3>
                  Resumen del pedido
                </h3>

                {cart.map((item) => (
                  <div
                    className="summary"
                    key={item.id}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <strong>
                      {formatPrice(
                        Number(item.price) *
                          Number(
                            item.quantity
                          )
                      )}
                    </strong>
                  </div>
                ))}

                <div className="summary">
                  <span>Envío</span>

                  <strong>
                    {shippingCost === 0
                      ? "Gratis"
                      : formatPrice(
                          shippingCost
                        )}
                  </strong>
                </div>

                <div className="summary total">
                  <span>Total</span>

                  <strong>
                    {formatPrice(cartTotal)}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {isPublish && (
        <main className="page">
          <section className="auth-page">
            <form
              className="auth-card"
              onSubmit={handlePublish}
            >
              <div className="auth-logo">
                📦
              </div>

              <h1>
                Publicar producto
              </h1>

              <p>
                Agrega un producto a VaniDaxi.
              </p>

              <div className="form-group">
                <label htmlFor="product-name">
                  Nombre del producto
                </label>

                <input
                  id="product-name"
                  className="form-control"
                  type="text"
                  name="product-name"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        name:
                          event.target.value,
                      })
                    )
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-price">
                  Precio
                </label>

                <input
                  id="product-price"
                  className="form-control"
                  type="number"
                  name="product-price"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        price:
                          event.target.value,
                      })
                    )
                  }
                  inputMode="decimal"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-category">
                  Categoría
                </label>

                <select
                  id="product-category"
                  className="form-control"
                  name="product-category"
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        category:
                          event.target.value,
                      })
                    )
                  }
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category.name}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="product-image">
                  Imagen
                </label>

                <input
                  id="product-image"
                  className="form-control"
                  type="url"
                  name="product-image"
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        image:
                          event.target.value,
                      })
                    )
                  }
                  autoComplete="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-description">
                  Descripción
                </label>

                <textarea
                  id="product-description"
                  className="form-control"
                  name="product-description"
                  value={
                    newProduct.description
                  }
                  onChange={(event) =>
                    setNewProduct(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      })
                    )
                  }
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <button
                className="gradient-btn"
                style={{
                  width: "100%",
                }}
                type="submit"
              >
                Publicar producto
              </button>
            </form>
          </section>
        </main>
      )}

      {isMenu && (
        <div
          className="menu-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              goHome();
            }
          }}
        >
          <aside className="menu-panel">
            <div className="menu-head">
              <h2>Menú</h2>

              <button
                type="button"
                className="menu-close"
                onClick={goHome}
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                go("/cuenta")
              }
            >
              ✨ Mi cuenta
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                go("/favoritos")
              }
            >
              ❤️ Favoritos
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                go("/carrito")
              }
            >
              🛒 Carrito
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                go("/publicar")
              }
            >
              📦 Publicar producto
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    notifications:
                      !current.notifications,
                  })
                )
              }
            >
              🔔{" "}
              {settings.notifications
                ? "Notificaciones activadas"
                : "Notificaciones desactivadas"}
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    promotions:
                      !current.promotions,
                  })
                )
              }
            >
              🎁{" "}
              {settings.promotions
                ? "Promociones activadas"
                : "Promociones desactivadas"}
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    darkMode:
                      !current.darkMode,
                  })
                )
              }
            >
              🌓{" "}
              {settings.darkMode
                ? "Modo claro"
                : "Modo oscuro"}
            </button>

            {!user && (
              <>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() =>
                    openAuth("login")
                  }
                >
                  🔐 Iniciar sesión
                </button>

                <button
                  type="button"
                  className="menu-item"
                  onClick={() =>
                    openAuth("register")
                  }
                >
                  ✨ Crear cuenta
                </button>
              </>
            )}

            {user && (
              <button
                type="button"
                className="menu-item"
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}

      <a
        className="floating-help"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Atención al cliente"
      >
        💬
      </a>
    </div>
  );
}

function ProductCard({
  product,
  favorites,
  onFavorite,
  onDetails,
  onBuy,
}) {
  const isFavorite = favorites.some(
    (item) => item.id === product.id
  );

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        {product.discount > 0 && (
          <span className="discount">
            -{product.discount}%
          </span>
        )}

        <button
          type="button"
          className="favorite"
          onClick={() =>
            onFavorite(product)
          }
          aria-label={
            isFavorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"
          }
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="rating">
          ⭐ {product.rating} · {product.reviews}
        </div>

        <div className="price-row">
          <span className="price">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice >
            product.price && (
            <span className="old-price">
              {formatPrice(
                product.oldPrice
              )}
            </span>
          )}
        </div>

        <div className="product-actions">
          <button
            type="button"
            className="small-btn details-btn"
            onClick={() =>
              onDetails(product)
            }
          >
            Ver detalles
          </button>

          <button
            type="button"
            className="small-btn buy-btn"
            onClick={() =>
              onBuy(product)
            }
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}

export default App;
