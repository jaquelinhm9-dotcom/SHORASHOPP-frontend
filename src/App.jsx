import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const topCards = [
  {
    title: "Ofertas",
    subtitle: "Hasta 50% menos",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Novedades",
    subtitle: "Lo más reciente",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Vendedores",
    subtitle: "Descubre nuevos productos",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Envíos",
    subtitle: "Compra fácilmente",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=85",
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

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState(() => loadStorage(CART_KEY, []));
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

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  const [user, setUser] = useState(null);

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
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    document.body.classList.toggle("dark-theme", settings.darkMode);
  }, [settings]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (product) =>
        activeCategory === "Todos" ||
        product.category === activeCategory
    );

    const term = normalizeText(search);

    if (!term) return result;

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

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingCost =
    checkout.delivery === "express" && cart.length > 0 ? 99 : 0;

  const cartTotal = cartSubtotal + shippingCost;

  const goHome = () => {
    setShowMenu(false);
    setActiveCategory("Todos");
    setSearch("");
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthMessage("");
    setShowMenu(false);
    setShowMessages(false);
    setShowSettings(false);
    setShowAuth(true);
  };

  const addToCart = (product, openCart = true) => {
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

    if (openCart) setShowCart(true);
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
                item.quantity + amount
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

  const openProduct = (product) => {
    setSelectedProduct(product);
  };

  const startCheckout = (product = null) => {
    if (product) addToCart(product, false);

    if (!product && cart.length === 0) {
      setShowCart(true);
      return;
    }

    setShowCart(false);
    setSelectedProduct(null);
    setOrderComplete(false);
    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    setLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "register") {
        if (authPassword.length < 6) {
          setAuthMessage(
            "La contraseña debe tener al menos 6 caracteres."
          );
          return;
        }

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
          setAuthMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
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
      const message = error?.message?.toLowerCase() || "";

      if (
        message.includes("invalid login credentials")
      ) {
        setAuthMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        message.includes("email not confirmed")
      ) {
        setAuthMessage(
          "Primero confirma tu correo electrónico."
        );
      } else if (
        message.includes("already registered")
      ) {
        setAuthMessage(
          "Este correo ya tiene una cuenta. Intenta iniciar sesión."
        );
      } else {
        setAuthMessage(
          error?.message ||
            "No fue posible completar la operación."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  const handlePublish = (event) => {
    event.preventDefault();

    if (!newProduct.name || !newProduct.price) return;

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category: newProduct.category,
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
      description:
        newProduct.description ||
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

    setShowPublish(false);
  };

  const handleCheckoutNext = () => {
    if (checkoutStep === 1) {
      if (
        !checkout.name ||
        !checkout.phone ||
        !checkout.address ||
        !checkout.city ||
        !checkout.state ||
        !checkout.zip
      ) {
        alert(
          "Completa todos los datos de entrega."
        );
        return;
      }

      setCheckoutStep(2);
      return;
    }

    if (checkoutStep === 2) {
      setCheckoutStep(3);
      return;
    }

    setOrderComplete(true);
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setOrderComplete(false);
    setCheckoutStep(1);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      WHATSAPP_MESSAGE
    );

    const url = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openFavorites = () => {
    setActiveCategory("Todos");
    setSearch("");
    setShowMenu(false);

    if (favorites.length === 0) {
      alert(
        "Todavía no tienes productos guardados en favoritos."
      );
      return;
    }

    setProducts((current) => {
      const favoriteIds = favorites.map(
        (item) => item.id
      );

      return [
        ...current.filter((item) =>
          favoriteIds.includes(item.id)
        ),
        ...current.filter(
          (item) =>
            !favoriteIds.includes(item.id)
        ),
      ];
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

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
          background: #ffffff;
          color: #202020;
          font-family: Arial, Helvetica, sans-serif;
        }

        body.dark-theme {
          background: #111111;
          color: #ffffff;
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

        .app {
          min-height: 100vh;
          background: #ffffff;
          transition: .25s;
        }

        body.dark-theme .app {
          background: #111111;
          color: #ffffff;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 80;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #eeeeee;
          backdrop-filter: blur(12px);
        }

        body.dark-theme .top-header {
          background: rgba(17,17,17,.97);
          border-color: #292929;
        }

        .header-main {
          width: min(1180px, calc(100% - 24px));
          min-height: 58px;
          margin: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
        }

        .menu-button {
          width: 39px;
          height: 39px;
          border: 0;
          border-radius: 11px;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          font-size: 20px;
        }

        .brand {
          border: 0;
          background: transparent;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -1px;
          background-image: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .search-box {
          flex: 1;
          height: 39px;
          min-width: 100px;
          max-width: 540px;
          margin: 0 auto;
          display: flex;
          border: 1px solid #dddddd;
          border-radius: 22px;
          overflow: hidden;
          background: #ffffff;
        }

        body.dark-theme .search-box {
          background: #202020;
          border-color: #333333;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          padding: 0 14px;
          background: transparent;
          color: inherit;
          font-size: 13px;
        }

        .search-box button {
          width: 43px;
          border: 0;
          color: white;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .header-actions {
          display: flex;
          gap: 7px;
        }

        .header-action {
          width: 39px;
          height: 39px;
          border: 0;
          border-radius: 11px;
          background: #f5f5f7;
          font-size: 18px;
          position: relative;
        }

        body.dark-theme .header-action {
          background: #242424;
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          background: #ef233c;
          color: white;
          font-size: 10px;
          font-weight: 800;
        }

        .category-bar {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding: 0 0 8px;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-bar::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          flex: 0 0 auto;
          border: 1px solid #e4e4e4;
          background: #ffffff;
          color: #444444;
          border-radius: 16px;
          padding: 6px 11px;
          font-size: 10px;
          white-space: nowrap;
        }

        body.dark-theme .category-pill {
          background: #202020;
          border-color: #333333;
          color: #eeeeee;
        }

        .category-pill.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .page-content {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding-bottom: 50px;
        }

        .hero {
          margin: 13px 0;
          min-height: 190px;
          border-radius: 22px;
          padding: 28px;
          color: white;
          background: linear-gradient(
            110deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          overflow: hidden;
        }

        .hero h1 {
          margin: 0 0 9px;
          font-size: clamp(29px, 5vw, 48px);
          line-height: 1;
        }

        .hero p {
          margin: 0 0 16px;
          font-size: 14px;
          opacity: .95;
        }

        .hero-button,
        .primary-button {
          border: 0;
          border-radius: 14px;
          padding: 11px 18px;
          color: white;
          font-weight: 800;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .hero-button {
          background: white;
          color: #b41bc1;
        }

        .hero-icon {
          font-size: clamp(75px, 12vw, 145px);
          opacity: .9;
          transform: rotate(-7deg);
        }

        .top-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }

        .top-card {
          min-height: 130px;
          border: 0;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          text-align: left;
          color: white;
          padding: 14px;
          background-size: cover;
          background-position: center;
        }

        .top-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,.05),
            rgba(0,0,0,.68)
          );
        }

        .top-card span {
          position: relative;
          z-index: 1;
          display: block;
        }

        .top-card strong {
          font-size: 18px;
        }

        .top-card small {
          margin-top: 3px;
          font-size: 11px;
        }

        .section-title {
          margin: 22px 0 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 21px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 9px;
        }

        .category-card {
          border: 0;
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          background: #f5f5f5;
          text-align: left;
        }

        .category-card img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }

        .category-card span {
          display: block;
          padding: 7px;
          font-size: 10px;
          font-weight: 700;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .product-card {
          border: 1px solid #eeeeee;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
          transition: .2s;
        }

        body.dark-theme .product-card {
          background: #191919;
          border-color: #303030;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,.09);
        }

        .product-image {
          position: relative;
          cursor: pointer;
        }

        .product-image img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }

        .discount {
          position: absolute;
          top: 9px;
          left: 9px;
          padding: 5px 8px;
          border-radius: 10px;
          background: #ef233c;
          color: white;
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
          background: rgba(255,255,255,.92);
          font-size: 16px;
        }

        .product-info {
          padding: 12px;
        }

        .product-category {
          color: #a61ac3;
          font-size: 10px;
          font-weight: 700;
        }

        .product-name {
          margin: 5px 0 7px;
          font-size: 14px;
          line-height: 1.25;
          min-height: 35px;
        }

        .prices {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .price {
          font-size: 17px;
          font-weight: 900;
        }

        .old-price {
          color: #999;
          font-size: 11px;
          text-decoration: line-through;
        }

        .rating {
          margin: 8px 0;
          color: #666;
          font-size: 11px;
        }

        .product-actions {
          display: flex;
          gap: 7px;
        }

        .product-actions button {
          flex: 1;
          border: 0;
          border-radius: 10px;
          padding: 9px 7px;
          font-size: 11px;
          font-weight: 800;
        }

        .details-button {
          background: #f2f2f4;
        }

        body.dark-theme .details-button {
          background: #282828;
          color: white;
        }

        .add-button {
          color: white;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .empty-state {
          padding: 35px;
          text-align: center;
          border: 1px dashed #cccccc;
          border-radius: 18px;
          color: #777;
        }

        .floating-whatsapp {
          position: fixed;
          right: 18px;
          bottom: 20px;
          z-index: 120;
          width: 58px;
          height: 58px;
          border: 0;
          border-radius: 50%;
          color: white;
          font-size: 27px;
          box-shadow: 0 8px 25px rgba(0,0,0,.22);
          background: linear-gradient(
            135deg,
            #25d366,
            #18a957
          );
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,.48);
          backdrop-filter: blur(3px);
        }

        .side-menu {
          width: min(350px, 88vw);
          height: 100%;
          padding: 18px;
          overflow-y: auto;
          background: white;
          box-shadow: 10px 0 40px rgba(0,0,0,.18);
        }

        body.dark-theme .side-menu,
        body.dark-theme .modal {
          background: #181818;
          color: white;
        }

        .menu-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .close-button {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 10px;
          background: #f1f1f1;
          font-size: 17px;
        }

        body.dark-theme .close-button {
          background: #292929;
          color: white;
        }

        .account-box {
          padding: 15px;
          border-radius: 17px;
          margin-bottom: 16px;
          color: white;
          background: linear-gradient(
            135deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .account-box strong,
        .account-box small {
          display: block;
        }

        .account-box small {
          margin-top: 4px;
          opacity: .9;
        }

        .menu-item {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 13px 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          border-bottom: 1px solid #eeeeee;
          color: inherit;
        }

        body.dark-theme .menu-item {
          border-color: #2c2c2c;
        }

        .menu-item-icon {
          width: 34px;
          text-align: center;
          font-size: 20px;
        }

        .center-overlay {
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .modal {
          width: min(500px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border-radius: 22px;
          padding: 24px;
          background: white;
          box-shadow: 0 25px 70px rgba(0,0,0,.22);
        }

        .modal h2 {
          margin-top: 0;
        }

        .form {
          display: grid;
          gap: 11px;
        }

        .form input,
        .form textarea,
        .form select,
        .checkout-input {
          width: 100%;
          border: 1px solid #dddddd;
          border-radius: 11px;
          padding: 12px;
          outline: 0;
          background: transparent;
          color: inherit;
        }

        .form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .auth-switch {
          margin-top: 12px;
          text-align: center;
          font-size: 12px;
        }

        .text-button {
          border: 0;
          color: #b018be;
          background: transparent;
          font-weight: 800;
        }

        .auth-message {
          margin: 0;
          padding: 10px;
          border-radius: 10px;
          background: #f6eef8;
          color: #8d1998;
          font-size: 12px;
        }

        .cart-modal {
          width: min(650px, 100%);
        }

        .cart-item {
          display: flex;
          gap: 11px;
          padding: 11px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .cart-item img {
          width: 70px;
          height: 70px;
          border-radius: 12px;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
        }

        .cart-item-name {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .cart-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
        }

        .quantity-button {
          width: 27px;
          height: 27px;
          border: 0;
          border-radius: 8px;
          background: #f0f0f0;
        }

        .remove-button {
          margin-left: auto;
          border: 0;
          color: #ef233c;
          background: transparent;
        }

        .cart-total {
          margin-top: 18px;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 900;
        }

        .cart-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
        }

        .secondary-button {
          border: 1px solid #dddddd;
          border-radius: 14px;
          padding: 11px 16px;
          background: transparent;
          color: inherit;
          font-weight: 800;
        }

        .product-modal-image {
          width: 100%;
          max-height: 330px;
          border-radius: 16px;
          object-fit: cover;
        }

        .specifications {
          padding-left: 18px;
          color: #666;
          font-size: 13px;
          line-height: 1.8;
        }

        body.dark-theme .specifications {
          color: #cccccc;
        }

        .checkout-overlay {
          overflow-y: auto;
          padding: 20px;
        }

        .checkout-page {
          width: min(1000px, 100%);
          margin: 20px auto;
          padding: 22px;
          border-radius: 22px;
          background: white;
        }

        body.dark-theme .checkout-page {
          background: #181818;
        }

        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .checkout-title {
          margin: 0;
          font-size: 24px;
        }

        .checkout-steps {
          display: flex;
          gap: 8px;
          margin: 20px 0;
        }

        .checkout-step {
          flex: 1;
          height: 6px;
          border-radius: 10px;
          background: #e4e4e4;
        }

        .checkout-step.active {
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1.5fr .8fr;
          gap: 18px;
        }

        .checkout-card {
          padding: 18px;
          border: 1px solid #e7e7e7;
          border-radius: 18px;
        }

        body.dark-theme .checkout-card {
          border-color: #303030;
        }

        .checkout-card h3 {
          margin-top: 0;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .full {
          grid-column: 1 / -1;
        }

        .delivery-option,
        .payment-option {
          width: 100%;
          margin-top: 10px;
          padding: 13px;
          border: 1px solid #dddddd;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          background: transparent;
          color: inherit;
        }

        .delivery-option.selected,
        .payment-option.selected {
          border-color: #c91ac4;
          box-shadow: 0 0 0 2px rgba(201,26,196,.08);
        }

        .checkout-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 15px;
        }

        .checkout-product {
          display: flex;
          gap: 9px;
          margin-bottom: 11px;
        }

        .checkout-product img {
          width: 48px;
          height: 48px;
          border-radius: 9px;
          object-fit: cover;
        }

        .checkout-product-info {
          font-size: 11px;
        }

        .summary-row,
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 12px;
        }

        .summary-total {
          padding-top: 12px;
          border-top: 1px solid #e6e6e6;
          font-size: 16px;
          font-weight: 900;
        }

        .success-box {
          padding: 40px 15px;
          text-align: center;
        }

        .success-icon {
          font-size: 60px;
        }

        .settings-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eeeeee;
        }

        body.dark-theme .settings-option {
          border-color: #303030;
        }

        .settings-option strong,
        .settings-option small {
          display: block;
        }

        .settings-option small {
          margin-top: 4px;
          color: #777;
        }

        .switch {
          position: relative;
          width: 48px;
          height: 27px;
          border: 0;
          border-radius: 30px;
          background: #cccccc;
          transition: .2s;
        }

        .switch.active {
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        .switch::after {
          content: "";
          position: absolute;
          width: 21px;
          height: 21px;
          top: 3px;
          left: 3px;
          border-radius: 50%;
          background: white;
          transition: .2s;
        }

        .switch.active::after {
          left: 24px;
        }

        @media (max-width: 900px) {
          .top-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .brand {
            font-size: 18px;
          }

          .hero {
            min-height: 180px;
            padding: 22px;
          }

          .hero-icon {
            display: none;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 9px;
          }

          .product-info {
            padding: 9px;
          }

          .product-name {
            font-size: 12px;
          }

          .cart-buttons {
            grid-template-columns: 1fr;
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .full {
            grid-column: auto;
          }

          .header-action.account-action {
            display: none;
          }
        }
      `}</style>

      <header className="top-header">
        <div className="header-main">
          <button
            className="menu-button"
            onClick={() => setShowMenu(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <button
            className="brand"
            onClick={goHome}
          >
            VaniDaxi
          </button>

          <div className="search-box">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar productos..."
            />

            <button
              onClick={() =>
                document
                  .getElementById("productos")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              🔍
            </button>
          </div>

          <div className="header-actions">
            <button
              className="header-action account-action"
              onClick={() =>
                user
                  ? setShowMenu(true)
                  : openAuth("login")
              }
            >
              ✨
            </button>

            <button
              className="header-action"
              onClick={() => setShowCart(true)}
            >
              🛒

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="category-bar">
          <button
            className={`category-pill ${
              activeCategory === "Todos"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveCategory("Todos")
            }
          >
            Todos
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-pill ${
                activeCategory === category.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory(category.name)
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <main className="page-content">
        <section className="hero">
          <div>
            <h1>
              Todo lo que buscas,
              <br />
              en un solo lugar.
            </h1>

            <p>
              Compra, vende y descubre productos
              increíbles en VaniDaxi.
            </p>

            <button
              className="hero-button"
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
          </div>

          <div className="hero-icon">🛍️</div>
        </section>

        <section className="top-cards">
          {topCards.map((card) => (
            <button
              key={card.title}
              className="top-card"
              style={{
                backgroundImage: `url(${card.image})`,
              }}
              onClick={() =>
                document
                  .getElementById("productos")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <span>
                <strong>{card.title}</strong>
                <small>{card.subtitle}</small>
              </span>
            </button>
          ))}
        </section>

        <section>
          <div className="section-title">
            <h2>Categorías</h2>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button
                className="category-card"
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);

                  setTimeout(() => {
                    document
                      .getElementById("productos")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }, 50);
                }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                />

                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="productos">
          <div className="section-title">
            <h2>
              {search
                ? "Resultados de búsqueda"
                : activeCategory === "Todos"
                ? "Productos destacados"
                : activeCategory}
            </h2>

            {user && (
              <button
                className="primary-button"
                onClick={() =>
                  setShowPublish(true)
                }
              >
                + Publicar
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              No encontramos productos con esa
              búsqueda.
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const isFavorite =
                  favorites.some(
                    (item) =>
                      item.id === product.id
                  );

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() =>
                          openProduct(product)
                        }
                      />

                      {product.discount > 0 && (
                        <span className="discount">
                          -{product.discount}%
                        </span>
                      )}

                      <button
                        className="favorite-button"
                        onClick={() =>
                          toggleFavorite(product)
                        }
                      >
                        {isFavorite ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <div className="product-info">
                      <div className="product-category">
                        {product.category}
                      </div>

                      <h3 className="product-name">
                        {product.name}
                      </h3>

                      <div className="prices">
                        <span className="price">
                          {formatPrice(
                            product.price
                          )}
                        </span>

                        {product.oldPrice && (
                          <span className="old-price">
                            {formatPrice(
                              product.oldPrice
                            )}
                          </span>
                        )}
                      </div>

                      <div className="rating">
                        ⭐ {product.rating} ·{" "}
                        {product.reviews} opiniones
                      </div>

                      <div className="product-actions">
                        <button
                          className="details-button"
                          onClick={() =>
                            openProduct(product)
                          }
                        >
                          Ver
                        </button>

                        <button
                          className="add-button"
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          🛒 Agregar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <button
        className="floating-whatsapp"
        onClick={openWhatsApp}
        aria-label="Atención por WhatsApp"
        title="Atención al cliente"
      >
        ☎
      </button>

      {showMenu && (
        <div
          className="overlay"
          onClick={() =>
            setShowMenu(false)
          }
        >
          <aside
            className="side-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="menu-top">
              <strong>VaniDaxi</strong>

              <button
                className="close-button"
                onClick={() =>
                  setShowMenu(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="account-box">
              {user ? (
                <>
                  <strong>
                    {user.user_metadata
                      ?.full_name ||
                      "Mi cuenta"}
                  </strong>

                  <small>{user.email}</small>
                </>
              ) : (
                <>
                  <strong>
                    ¡Hola! 👋
                  </strong>

                  <small>
                    Inicia sesión para disfrutar
                    todas las funciones.
                  </small>
                </>
              )}
            </div>

            {!user ? (
              <>
                <button
                  className="menu-item"
                  onClick={() =>
                    openAuth("login")
                  }
                >
                  <span className="menu-item-icon">
                    ✨
                  </span>
                  <span>
                    <strong>
                      Iniciar sesión
                    </strong>
                  </span>
                </button>

                <button
                  className="menu-item"
                  onClick={() =>
                    openAuth("register")
                  }
                >
                  <span className="menu-item-icon">
                    📝
                  </span>
                  <span>
                    <strong>
                      Crear cuenta
                    </strong>
                  </span>
                </button>
              </>
            ) : (
              <button
                className="menu-item"
                onClick={() =>
                  setShowPublish(true)
                }
              >
                <span className="menu-item-icon">
                  ➕
                </span>
                <span>
                  <strong>
                    Publicar producto
                  </strong>
                </span>
              </button>
            )}

            <button
              className="menu-item"
              onClick={goHome}
            >
              <span className="menu-item-icon">
                🏠
              </span>

              <span>
                <strong>Inicio</strong>
              </span>
            </button>

            <button
              className="menu-item"
              onClick={openFavorites}
            >
              <span className="menu-item-icon">
                ❤️
              </span>

              <span>
                <strong>Favoritos</strong>
              </span>
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowMessages(true);
              }}
            >
              <span className="menu-item-icon">
                💬
              </span>

              <span>
                <strong>Mensajes</strong>
              </span>
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowSettings(true);
              }}
            >
              <span className="menu-item-icon">
                ⚙️
              </span>

              <span>
                <strong>
                  Configuración
                </strong>
              </span>
            </button>

            <button
              className="menu-item"
              onClick={openWhatsApp}
            >
              <span className="menu-item-icon">
                🟢
              </span>

              <span>
                <strong>
                  Atención al cliente
                </strong>
              </span>
            </button>

            {user && (
              <button
                className="menu-item"
                onClick={logout}
              >
                <span className="menu-item-icon">
                  🚪
                </span>

                <span>
                  <strong>
                    Cerrar sesión
                  </strong>
                </span>
              </button>
            )}
          </aside>
        </div>
      )}

      {showAuth && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowAuth(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() =>
                setShowAuth(false)
              }
            >
              ✕
            </button>

            <h2>
              {authMode === "login"
                ? "✨ Bienvenido de nuevo"
                : "🚀 Crea tu cuenta"}
            </h2>

            <p
              style={{
                color: "#777",
                fontSize: 12,
                marginTop: -5,
              }}
            >
              {authMode === "login"
                ? "Inicia sesión para comprar, vender y administrar tu cuenta."
                : "Únete a VaniDaxi y comienza a comprar o vender fácilmente."}
            </p>

            <form
              className="form"
              onSubmit={handleAuth}
            >
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={authName}
                  onChange={(event) =>
                    setAuthName(
                      event.target.value
                    )
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={authEmail}
                onChange={(event) =>
                  setAuthEmail(
                    event.target.value
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={authPassword}
                onChange={(event) =>
                  setAuthPassword(
                    event.target.value
                  )
                }
                required
              />

              {authMessage && (
                <p className="auth-message">
                  {authMessage}
                </p>
              )}

              <button
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Iniciar sesión"
                  : "Crear mi cuenta"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "login" ? (
                <>
                  ¿Aún no tienes cuenta?{" "}

                  <button
                    className="text-button"
                    onClick={() => {
                      setAuthMode(
                        "register"
                      );
                      setAuthMessage("");
                    }}
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}

                  <button
                    className="text-button"
                    onClick={() => {
                      setAuthMode(
                        "login"
                      );
                      setAuthMessage("");
                    }}
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
                zIndex: 2,
              }}
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ✕
            </button>

            <img
              className="product-modal-image"
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <h2>
              {selectedProduct.name}
            </h2>

            <div className="product-category">
              {selectedProduct.category}
            </div>

            <p>
              {selectedProduct.description}
            </p>

            <div className="price">
              {formatPrice(
                selectedProduct.price
              )}
            </div>

            {selectedProduct.specifications
              ?.length > 0 && (
              <>
                <h3>Especificaciones</h3>

                <ul className="specifications">
                  {selectedProduct.specifications.map(
                    (specification) => (
                      <li
                        key={specification}
                      >
                        {specification}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                className="secondary-button"
                onClick={() =>
                  addToCart(
                    selectedProduct
                  )
                }
              >
                🛒 Agregar
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  startCheckout(
                    selectedProduct
                  )
                }
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowCart(false)
          }
        >
          <div
            className="modal cart-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() =>
                setShowCart(false)
              }
            >
              ✕
            </button>

            <h2>🛒 Mi carrito</h2>

            {cart.length === 0 ? (
              <div className="empty-state">
                Tu carrito está vacío.
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="cart-item-info">
                      <h3 className="cart-item-name">
                        {item.name}
                      </h3>

                      <strong>
                        {formatPrice(
                          item.price
                        )}
                      </strong>

                      <div className="cart-controls">
                        <button
                          className="quantity-button"
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
                          className="quantity-button"
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
                          className="remove-button"
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
                  </div>
                ))}

                <div className="cart-total">
                  <span>Total</span>

                  <span>
                    {formatPrice(
                      cartSubtotal
                    )}
                  </span>
                </div>

                <div className="cart-buttons">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setShowCart(false)
                    }
                  >
                    Seguir comprando
                  </button>

                  <button
                    className="primary-button"
                    onClick={() =>
                      startCheckout()
                    }
                  >
                    Finalizar compra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showMessages && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowMessages(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() =>
                setShowMessages(false)
              }
            >
              ✕
            </button>

            <h2>💬 Mensajes</h2>

            <p
              style={{
                color: "#777",
                fontSize: 13,
              }}
            >
              Aquí podrás consultar tus
              conversaciones relacionadas con
              compras y ventas.
            </p>

            <button
              className="primary-button"
              style={{
                width: "100%",
                marginTop: 12,
              }}
              onClick={openWhatsApp}
            >
              🟢 Contactar atención al cliente
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowSettings(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() =>
                setShowSettings(false)
              }
            >
              ✕
            </button>

            <h2>⚙️ Configuración</h2>

            <div className="settings-option">
              <div>
                <strong>
                  Notificaciones
                </strong>

                <small>
                  Recibe avisos sobre tu cuenta,
                  compras y ventas.
                </small>
              </div>

              <button
                className={`switch ${
                  settings.notifications
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSettings(
                    (current) => ({
                      ...current,
                      notifications:
                        !current.notifications,
                    })
                  )
                }
              />
            </div>

            <div className="settings-option">
              <div>
                <strong>
                  Promociones
                </strong>

                <small>
                  Recibe información sobre
                  ofertas y novedades.
                </small>
              </div>

              <button
                className={`switch ${
                  settings.promotions
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSettings(
                    (current) => ({
                      ...current,
                      promotions:
                        !current.promotions,
                    })
                  )
                }
              />
            </div>

            <div className="settings-option">
              <div>
                <strong>
                  Modo oscuro
                </strong>

                <small>
                  Cambia la apariencia de
                  VaniDaxi.
                </small>
              </div>

              <button
                className={`switch ${
                  settings.darkMode
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSettings(
                    (current) => ({
                      ...current,
                      darkMode:
                        !current.darkMode,
                    })
                  )
                }
              />
            </div>

            <button
              className="secondary-button"
              style={{
                width: "100%",
                marginTop: 18,
              }}
              onClick={openWhatsApp}
            >
              🟢 Ayuda y atención al cliente
            </button>
          </div>
        </div>
      )}

      {showPublish && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowPublish(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() =>
                setShowPublish(false)
              }
            >
              ✕
            </button>

            <h2>➕ Publicar producto</h2>

            <p
              style={{
                color: "#777",
                fontSize: 12,
              }}
            >
              Agrega tu producto y comienza a
              vender en VaniDaxi.
            </p>

            <form
              className="form"
              onSubmit={handlePublish}
            >
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    name: event.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Precio en MXN"
                min="1"
                value={newProduct.price}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    price: event.target.value,
                  })
                }
                required
              />

              <select
                value={newProduct.category}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    category:
                      event.target.value,
                  })
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

              <input
                type="url"
                placeholder="URL de la imagen"
                value={newProduct.image}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    image: event.target.value,
                  })
                }
              />

              <textarea
                placeholder="Describe tu producto..."
                value={
                  newProduct.description
                }
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    description:
                      event.target.value,
                  })
                }
              />

              <button className="primary-button">
                🚀 Publicar producto
              </button>
            </form>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="overlay checkout-overlay">
          <div className="checkout-page">
            <div className="checkout-header">
              <h1 className="checkout-title">
                VaniDaxi · Finalizar compra
              </h1>

              {!orderComplete && (
                <button
                  className="close-button"
                  onClick={resetCheckout}
                >
                  ✕
                </button>
              )}
            </div>

            {orderComplete ? (
              <div className="success-box">
                <div className="success-icon">
                  ✅
                </div>

                <h2>
                  ¡Pedido realizado!
                </h2>

                <p>
                  Tu pedido fue registrado
                  correctamente.
                </p>

                <p>
                  <strong>
                    Total del pedido:
                  </strong>{" "}
                  {formatPrice(cartTotal)}
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCart([]);
                    resetCheckout();
                  }}
                >
                  Volver a VaniDaxi
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-steps">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`checkout-step ${
                        checkoutStep >= step
                          ? "active"
                          : ""
                      }`}
                    />
                  ))}
                </div>

                <div className="checkout-layout">
                  <div>
                    {checkoutStep === 1 && (
                      <div className="checkout-card">
                        <h3>
                          📍 Datos de entrega
                        </h3>

                        <div className="checkout-grid">
                          <input
                            className="checkout-input"
                            placeholder="Nombre completo"
                            value={
                              checkout.name
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                name:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Teléfono"
                            value={
                              checkout.phone
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                phone:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <input
                            className="checkout-input full"
                            placeholder="Calle y número"
                            value={
                              checkout.address
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                address:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Ciudad"
                            value={
                              checkout.city
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                city:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Estado"
                            value={
                              checkout.state
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                state:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Código postal"
                            value={
                              checkout.zip
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                zip:
                                  event.target
                                    .value,
                              })
                            }
                          />

                          <textarea
                            className="checkout-input full"
                            placeholder="Notas para el vendedor o repartidor"
                            value={
                              checkout.notes
                            }
                            onChange={(event) =>
                              setCheckout({
                                ...checkout,
                                notes:
                                  event.target
                                    .value,
                              })
                            }
                          />
                        </div>

                        <h3
                          style={{
                            marginTop: 20,
                          }}
                        >
                          🚚 Tipo de entrega
                        </h3>

                        <button
                          className={`delivery-option ${
                            checkout.delivery ===
                            "standard"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setCheckout({
                              ...checkout,
                              delivery:
                                "standard",
                            })
                          }
                        >
                          <input
                            type="radio"
                            checked={
                              checkout.delivery ===
                              "standard"
                            }
                            readOnly
                          />

                          <span>
                            <strong>
                              Envío estándar
                            </strong>
                            <br />
                            <small>
                              Envío gratis
                            </small>
                          </span>
                        </button>

                        <button
                          className={`delivery-option ${
                            checkout.delivery ===
                            "express"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setCheckout({
                              ...checkout,
                              delivery:
                                "express",
                            })
                          }
                        >
                          <input
                            type="radio"
                            checked={
                              checkout.delivery ===
                              "express"
                            }
                            readOnly
                          />

                          <span>
                            <strong>
                              Envío express
                            </strong>
                            <br />
                            <small>
                              + $99 MXN
                            </small>
                          </span>
                        </button>
                      </div>
                    )}

                    {checkoutStep === 2 && (
                      <div className="checkout-card">
                        <h3>
                          💳 Método de pago
                        </h3>

                        {[
                          {
                            id: "card",
                            title:
                              "💳 Tarjeta",
                            text:
                              "Visa, Mastercard y otras tarjetas",
                          },
                          {
                            id:
                              "mercadopago",
                            title:
                              "💙 Mercado Pago",
                            text:
                              "Pago mediante Mercado Pago",
                          },
                          {
                            id: "cash",
                            title:
                              "💵 Pago disponible según el vendedor",
                            text: "",
                          },
                        ].map(
                          (option) => (
                            <button
                              key={option.id}
                              className={`payment-option ${
                                checkout.payment ===
                                option.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setCheckout({
                                  ...checkout,
                                  payment:
                                    option.id,
                                })
                              }
                            >
                              <input
                                type="radio"
                                checked={
                                  checkout.payment ===
                                  option.id
                                }
                                readOnly
                              />

                              <span>
                                <strong>
                                  {option.title}
                                </strong>

                                {option.text && (
                                  <>
                                    <br />

                                    <small>
                                      {
                                        option.text
                                      }
                                    </small>
                                  </>
                                )}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {checkoutStep === 3 && (
                      <div className="checkout-card">
                        <h3>
                          🧾 Confirmar pedido
                        </h3>

                        <p
                          style={{
                            fontSize: 12,
                            color: "#777",
                          }}
                        >
                          Revisa que los datos
                          de entrega, productos,
                          envío y método de pago
                          sean correctos.
                        </p>

                        <div
                          style={{
                            padding: 12,
                            background:
                              "rgba(150,150,150,.08)",
                            borderRadius: 10,
                            fontSize: 12,
                            lineHeight: 1.7,
                          }}
                        >
                          <strong>
                            Entrega
                          </strong>
                          <br />

                          {checkout.name}
                          <br />

                          {checkout.address}
                          <br />

                          {checkout.city},{" "}
                          {checkout.state}{" "}
                          {checkout.zip}
                          <br />

                          Tel. {checkout.phone}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background:
                              "rgba(150,150,150,.08)",
                            borderRadius: 10,
                            fontSize: 12,
                          }}
                        >
                          <strong>
                            Pago:
                          </strong>{" "}
                          {checkout.payment ===
                          "card"
                            ? "Tarjeta"
                            : checkout.payment ===
                              "mercadopago"
                            ? "Mercado Pago"
                            : "Pago disponible según vendedor"}
                        </div>
                      </div>
                    )}

                    <div className="checkout-actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          if (
                            checkoutStep === 1
                          ) {
                            resetCheckout();
                          } else {
                            setCheckoutStep(
                              checkoutStep - 1
                            );
                          }
                        }}
                      >
                        {checkoutStep === 1
                          ? "Cancelar"
                          : "Regresar"}
                      </button>

                      <button
                        className="primary-button"
                        onClick={
                          handleCheckoutNext
                        }
                      >
                        {checkoutStep === 3
                          ? "Confirmar pedido"
                          : "Continuar"}
                      </button>
                    </div>
                  </div>

                  <aside className="checkout-card">
                    <h3>
                      Resumen de compra
                    </h3>

                    {cart.map((item) => (
                      <div
                        className="checkout-product"
                        key={item.id}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                        />

                        <div className="checkout-product-info">
                          <strong>
                            {item.name}
                          </strong>

                          <div>
                            {item.quantity} ×{" "}
                            {formatPrice(
                              item.price
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div
                      style={{
                        marginTop: 15,
                      }}
                    >
                      <div className="summary-row">
                        <span>
                          Subtotal
                        </span>

                        <strong>
                          {formatPrice(
                            cartSubtotal
                          )}
                        </strong>
                      </div>

                      <div className="summary-row">
                        <span>Envío</span>

                        <strong>
                          {shippingCost === 0
                            ? "Gratis"
                            : formatPrice(
                                shippingCost
                              )}
                        </strong>
                      </div>

                      <div className="summary-total">
                        <span>Total</span>

                        <span>
                          {formatPrice(
                            cartTotal
                          )}
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
