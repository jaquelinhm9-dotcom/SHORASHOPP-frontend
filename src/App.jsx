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

    document.body.classList.toggle(
      "dark-theme",
      settings.darkMode
    );
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
          go("/cuenta");
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
        go("/cuenta");
      }
    } catch (error) {
      const message = error?.message || "";

      if (
        normalizeText(message).includes(
          "invalid login credentials"
        )
      ) {
        setAuthMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        normalizeText(message).includes(
          "email not confirmed"
        )
      ) {
        setAuthMessage(
          "Debes confirmar tu correo antes de iniciar sesión."
        );
      } else if (
        normalizeText(message).includes(
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

    if (!newProduct.name.trim()) return;

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
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
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background: #ffffff;
          color: #202020;
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

        .app {
          min-height: 100vh;
          background: #fff;
        }

        .dark-theme {
          background: #121212;
          color: #f5f5f5;
        }

        .dark-theme .app,
        .dark-theme .page,
        .dark-theme .section,
        .dark-theme .product-card,
        .dark-theme .modal-card,
        .dark-theme .account-card,
        .dark-theme .checkout-card,
        .dark-theme .cart-card {
          background: #171717;
          color: #f5f5f5;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eeeeee;
        }

        .dark-theme .topbar {
          background: rgba(23,23,23,.97);
          border-color: #303030;
        }

        .header-inner {
          max-width: 1180px;
          margin: auto;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand {
          border: 0;
          background: transparent;
          font-weight: 900;
          font-size: 22px;
          letter-spacing: -.7px;
          background: linear-gradient(90deg,#ef233c,#d4148e,#7027c9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          white-space: nowrap;
        }

        .menu-btn,
        .icon-btn {
          border: 0;
          background: #f6f6f6;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .dark-theme .menu-btn,
        .dark-theme .icon-btn {
          background: #292929;
          color: white;
        }

        .menu-lines {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-lines span {
          width: 19px;
          height: 2px;
          border-radius: 4px;
          background: currentColor;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-box input {
          width: 100%;
          height: 42px;
          border: 1px solid #e4e4e4;
          border-radius: 14px;
          padding: 0 42px 0 15px;
          outline: none;
          background: #fafafa;
        }

        .search-box input:focus {
          border-color: #d4148e;
          box-shadow: 0 0 0 3px rgba(212,20,142,.1);
        }

        .dark-theme .search-box input {
          background: #242424;
          color: white;
          border-color: #3a3a3a;
        }

        .search-icon {
          position: absolute;
          right: 13px;
          top: 10px;
        }

        .cart-button {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#ef233c,#d4148e,#7027c9);
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .page {
          min-height: calc(100vh - 64px);
        }

        .hero {
          max-width: 1180px;
          margin: 0 auto;
          padding: 34px 16px 20px;
        }

        .hero-box {
          border-radius: 28px;
          padding: 35px;
          color: white;
          background: linear-gradient(120deg,#ef233c,#d4148e 52%,#7027c9);
          position: relative;
          overflow: hidden;
        }

        .hero-box::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          right: -70px;
          top: -80px;
          background: rgba(255,255,255,.12);
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: clamp(32px,6vw,58px);
          line-height: .98;
          max-width: 650px;
        }

        .hero p {
          margin: 0 0 22px;
          max-width: 580px;
          line-height: 1.6;
          opacity: .94;
        }

        .gradient-btn,
        .white-btn {
          border: 0;
          border-radius: 13px;
          padding: 12px 18px;
          font-weight: 800;
          transition: transform .18s ease, opacity .18s ease;
        }

        .gradient-btn:hover,
        .white-btn:hover,
        .category-card:hover,
        .product-card:hover {
          transform: translateY(-2px);
        }

        .gradient-btn {
          color: white;
          background: linear-gradient(90deg,#ef233c,#d4148e,#7027c9);
        }

        .white-btn {
          color: #a41491;
          background: white;
        }

        .section {
          max-width: 1180px;
          margin: auto;
          padding: 24px 16px;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 24px;
        }

        .section-title button {
          border: 0;
          background: transparent;
          color: #a41491;
          font-weight: 800;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 12px;
        }

        .category-card {
          position: relative;
          height: 112px;
          overflow: hidden;
          border-radius: 18px;
          border: 0;
          padding: 0;
          background: #ddd;
          transition: transform .18s ease;
        }

        .category-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent,rgba(0,0,0,.72));
        }

        .category-name {
          position: absolute;
          z-index: 2;
          left: 12px;
          right: 12px;
          bottom: 10px;
          color: white;
          font-weight: 850;
          font-size: 14px;
          text-align: left;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }

        .product-card {
          border: 1px solid #ededed;
          border-radius: 19px;
          overflow: hidden;
          background: white;
          transition: transform .18s ease;
          position: relative;
        }

        .dark-theme .product-card {
          border-color: #333;
        }

        .product-image-wrap {
          position: relative;
          height: 205px;
          background: #f6f6f6;
        }

        .product-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .discount {
          position: absolute;
          left: 10px;
          top: 10px;
          padding: 5px 8px;
          border-radius: 8px;
          background: #ef233c;
          color: white;
          font-size: 11px;
          font-weight: 900;
        }

        .favorite {
          position: absolute;
          right: 10px;
          top: 10px;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          font-size: 17px;
        }

        .product-info {
          padding: 13px;
        }

        .product-info h3 {
          margin: 0 0 6px;
          font-size: 15px;
        }

        .rating {
          font-size: 12px;
          margin-bottom: 7px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .price {
          font-size: 19px;
          font-weight: 900;
        }

        .old-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }

        .product-actions {
          display: flex;
          gap: 8px;
          margin-top: 11px;
        }

        .small-btn {
          flex: 1;
          min-height: 38px;
          border: 0;
          border-radius: 11px;
          font-weight: 800;
          font-size: 12px;
        }

        .details-btn {
          background: #f2f2f2;
        }

        .buy-btn {
          color: white;
          background: linear-gradient(90deg,#ef233c,#d4148e,#7027c9);
        }

        .promo {
          max-width: 1180px;
          margin: 5px auto 10px;
          padding: 0 16px;
        }

        .promo-box {
          border: 1px solid #f1d8ed;
          background: linear-gradient(135deg,#fff5fa,#faf3ff);
          border-radius: 20px;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .dark-theme .promo-box {
          background: #231b24;
          border-color: #432f42;
        }

        .promo-box strong {
          display: block;
          margin-bottom: 4px;
        }

        .promo-box span {
          font-size: 13px;
          color: #666;
        }

        .dark-theme .promo-box span {
          color: #bbb;
        }

        .empty {
          padding: 40px 20px;
          text-align: center;
          border: 1px dashed #ddd;
          border-radius: 18px;
          color: #777;
        }

        .floating-help {
          position: fixed;
          right: 17px;
          bottom: 18px;
          z-index: 120;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg,#ef233c,#d4148e,#7027c9);
          box-shadow: 0 10px 30px rgba(120,30,100,.3);
          font-size: 25px;
        }

        .back-btn {
          border: 0;
          background: #f3f3f3;
          border-radius: 12px;
          padding: 9px 13px;
          font-weight: 750;
          margin-bottom: 18px;
        }

        .dark-theme .back-btn {
          background: #292929;
          color: white;
        }

        .detail {
          max-width: 1100px;
          margin: auto;
          padding: 28px 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .detail-image {
          width: 100%;
          max-height: 550px;
          object-fit: cover;
          border-radius: 25px;
        }

        .detail h1 {
          font-size: clamp(28px,5vw,44px);
          margin: 0 0 10px;
        }

        .detail-description {
          line-height: 1.65;
          color: #666;
        }

        .dark-theme .detail-description {
          color: #bbb;
        }

        .specs {
          margin: 22px 0;
          padding: 0;
          list-style: none;
        }

        .specs li {
          padding: 9px 0;
          border-bottom: 1px solid #eee;
        }

        .dark-theme .specs li {
          border-color: #333;
        }

        .large-price {
          font-size: 32px;
          font-weight: 900;
          margin: 16px 0;
        }

        .auth-page,
        .account-page,
        .checkout-page,
        .cart-page {
          max-width: 900px;
          margin: auto;
          padding: 30px 16px;
        }

        .auth-card {
          max-width: 480px;
          margin: 20px auto;
          padding: 28px;
          border-radius: 25px;
          background: white;
          border: 1px solid #eee;
          box-shadow: 0 15px 45px rgba(0,0,0,.07);
        }

        .dark-theme .auth-card {
          background: #1d1d1d;
          border-color: #333;
        }

        .auth-logo {
          width: 62px;
          height: 62px;
          border-radius: 18px;
          margin-bottom: 15px;
          display: grid;
          place-items: center;
          color: white;
          font-size: 29px;
          font-weight: 900;
          background: linear-gradient(135deg,#ef233c,#d4148e,#7027c9);
        }

        .auth-card h1 {
          margin: 0 0 7px;
        }

        .auth-card p {
          color: #777;
          line-height: 1.5;
        }

        .dark-theme .auth-card p {
          color: #bbb;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .form-control {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 12px;
          min-height: 44px;
          padding: 10px 13px;
          outline: none;
          background: white;
          color: #222;
          -webkit-appearance: none;
          appearance: none;
          touch-action: manipulation;
        }

        .form-control:focus {
          border-color: #d4148e;
          box-shadow: 0 0 0 3px rgba(212,20,142,.1);
        }

        .dark-theme .form-control {
          background: #252525;
          color: white;
          border-color: #444;
        }

        textarea.form-control {
          min-height: 100px;
          resize: vertical;
        }

        .auth-submit {
          width: 100%;
          margin-top: 5px;
          min-height: 46px;
        }

        .message {
          margin: 12px 0;
          padding: 11px 13px;
          border-radius: 11px;
          background: #fff0f5;
          color: #a00055;
          font-size: 13px;
          line-height: 1.45;
        }

        .auth-switch {
          margin-top: 17px;
          text-align: center;
          font-size: 13px;
        }

        .auth-switch button {
          border: 0;
          background: transparent;
          color: #a41491;
          font-weight: 850;
        }

        .account-card,
        .checkout-card,
        .cart-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 22px;
          padding: 22px;
          margin-bottom: 15px;
        }

        .dark-theme .account-card,
        .dark-theme .checkout-card,
        .dark-theme .cart-card {
          border-color: #333;
        }

        .account-actions {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .account-action {
          border: 1px solid #eee;
          background: white;
          border-radius: 15px;
          padding: 17px;
          text-align: left;
        }

        .dark-theme .account-action {
          background: #222;
          color: white;
          border-color: #333;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 13px;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid #eee;
        }

        .dark-theme .cart-item {
          border-color: #333;
        }

        .cart-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 13px;
        }

        .qty {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qty button {
          width: 29px;
          height: 29px;
          border: 0;
          border-radius: 8px;
          background: #eee;
        }

        .dark-theme .qty button {
          background: #333;
          color: white;
        }

        .remove {
          border: 0;
          background: transparent;
          color: #e00055;
          font-size: 12px;
          font-weight: 800;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .summary.total {
          border-top: 1px solid #eee;
          margin-top: 8px;
          padding-top: 15px;
          font-size: 20px;
          font-weight: 900;
        }

        .dark-theme .summary.total {
          border-color: #333;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 18px;
        }

        .menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,.38);
        }

        .menu-panel {
          width: min(340px,88vw);
          height: 100%;
          background: white;
          padding: 22px;
          box-shadow: 12px 0 40px rgba(0,0,0,.2);
          overflow-y: auto;
        }

        .dark-theme .menu-panel {
          background: #181818;
          color: white;
        }

        .menu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .menu-head h2 {
          margin: 0;
        }

        .menu-close {
          border: 0;
          background: #f2f2f2;
          border-radius: 10px;
          width: 38px;
          height: 38px;
        }

        .menu-item {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 14px 8px;
          border-bottom: 1px solid #eee;
          text-align: left;
          font-weight: 750;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .dark-theme .menu-item {
          border-color: #333;
          color: white;
        }

        .category-nav {
          max-width: 1180px;
          margin: auto;
          padding: 8px 16px 4px;
          overflow-x: auto;
          display: flex;
          gap: 8px;
          scrollbar-width: none;
        }

        .category-nav::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          flex: 0 0 auto;
          border: 1px solid #e8e8e8;
          background: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 750;
        }

        .dark-theme .category-pill {
          background: #202020;
          color: white;
          border-color: #333;
        }

        .category-pill.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(90deg,#ef233c,#d4148e,#7027c9);
        }

        .footer {
          margin-top: 30px;
          padding: 35px 16px 100px;
          background: #171717;
          color: white;
          text-align: center;
        }

        .footer-brand {
          font-size: 25px;
          font-weight: 900;
          background: linear-gradient(90deg,#ef233c,#d4148e,#7027c9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .footer p {
          color: #aaa;
          font-size: 13px;
        }

        @media (max-width: 850px) {
          .products-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .categories {
            grid-template-columns: repeat(4,1fr);
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .header-inner {
            gap: 7px;
            padding: 8px 10px;
          }

          .brand {
            font-size: 17px;
          }

          .menu-btn,
          .icon-btn {
            width: 38px;
            height: 38px;
            border-radius: 11px;
          }

          .search-box input {
            height: 38px;
            padding-left: 11px;
            font-size: 13px;
          }

          .hero {
            padding-top: 18px;
          }

          .hero-box {
            padding: 26px 21px;
            border-radius: 22px;
          }

          .hero h1 {
            font-size: 35px;
          }

          .section {
            padding: 18px 11px;
          }

          .categories {
            grid-template-columns: repeat(2,1fr);
            gap: 9px;
          }

          .category-card {
            height: 92px;
            border-radius: 14px;
          }

          .products-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 9px;
          }

          .product-image-wrap {
            height: 155px;
          }

          .product-info {
            padding: 10px;
          }

          .product-info h3 {
            font-size: 13px;
          }

          .price {
            font-size: 16px;
          }

          .old-price {
            font-size: 10px;
          }

          .product-actions {
            flex-direction: column;
            gap: 5px;
          }

          .small-btn {
            min-height: 34px;
          }

          .promo-box {
            padding: 14px;
            border-radius: 16px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail {
            padding: 18px 12px;
          }

          .auth-card {
            margin: 10px auto;
            padding: 21px;
            border-radius: 20px;
          }

          .account-actions {
            grid-template-columns: 1fr;
          }

          .cart-item {
            grid-template-columns: 60px 1fr;
          }

          .cart-item > div:last-child {
            grid-column: 2;
          }

          .cart-item img {
            width: 60px;
            height: 60px;
          }

          .floating-help {
            width: 52px;
            height: 52px;
            right: 13px;
            bottom: 13px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="header-inner">
          <button
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
                  go("/productos");
                }
              }}
              placeholder="Buscar productos..."
              autoComplete="off"
              enterKeyHint="search"
            />
            <span className="search-icon">
              🔎
            </span>
          </div>

          <button
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
                  onClick={goProducts}
                >
                  Ver todas
                </button>
              </div>

              <div className="categories">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="category-card"
                    onClick={() =>
                      goCategory(
                        category.name
                      )
                    }
                  >
                    <img
                      src={category.image}
                      alt={category.name}
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
                      onFavorite={
                        toggleFavorite
                      }
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
                {filteredProducts.length}{" "}
                productos
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
                      onFavorite={
                        toggleFavorite
                      }
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
                  ⭐{" "}
                  {selectedProduct.rating} ·{" "}
                  {selectedProduct.reviews}{" "}
                  reseñas
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
                  .specifications
                  ?.length > 0 && (
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
                            ✓{" "}
                            {specification}
                          </li>
                        )
                      )}
                    </ul>
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
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
              autoComplete={
                authMode === "register"
                  ? "on"
                  : "on"
              }
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
                    spellCheck="false"
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
                  : authMode ===
                    "register"
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
                      authMode ===
                        "register"
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
                      className="account-action"
                      onClick={() =>
                        go(
                          "/publicar"
                        )
                      }
                    >
                      📦
                      <br />
                      Publicar producto
                    </button>

                    <button
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
                    className="back-btn"
                    style={{
                      marginTop: 18,
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
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="gradient-btn"
                      onClick={() =>
                        openAuth("login")
                      }
                    >
                      Iniciar sesión
                    </button>

                    <button
                      className="back-btn"
                      onClick={() =>
                        openAuth(
                          "register"
                        )
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
                    onFavorite={
                      toggleFavorite
                    }
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
                          Number(
                            item.price
                          ) *
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
                    className="gradient-btn"
                    style={{
                      width: "100%",
                      marginTop: 15,
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
                  />
                </div>

                <button
                  className="gradient-btn"
                  style={{
                    width: "100%",
                    marginTop: 8,
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
                      {item.name} ×{" "}
                      {item.quantity}
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

      {location.pathname === "/publicar" && (
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
                        name: event.target
                          .value,
                      })
                    )
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
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
                        price: event.target
                          .value,
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
                          event.target
                            .value,
                      })
                    )
                  }
                  autoComplete="url"
                  inputMode="url"
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
                          event.target
                            .value,
                      })
                    )
                  }
                  autoCorrect="off"
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

      {location.pathname === "/menu" && (
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
                className="menu-close"
                onClick={goHome}
              >
                ✕
              </button>
            </div>

            <button
              className="menu-item"
              onClick={() =>
                go("/cuenta")
              }
            >
              ✨ Mi cuenta
            </button>

            <button
              className="menu-item"
              onClick={() =>
                go("/favoritos")
              }
            >
              ❤️ Favoritos
            </button>

            <button
              className="menu-item"
              onClick={() =>
                go("/carrito")
              }
            >
              🛒 Carrito
            </button>

            <button
              className="menu-item"
              onClick={() =>
                go("/publicar")
              }
            >
              📦 Publicar producto
            </button>

            <button
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
                  className="menu-item"
                  onClick={() =>
                    openAuth("login")
                  }
                >
                  🔐 Iniciar sesión
                </button>

                <button
                  className="menu-item"
                  onClick={() =>
                    openAuth(
                      "register"
                    )
                  }
                >
                  ✨ Crear cuenta
                </button>
              </>
            )}

            {user && (
              <button
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
          ⭐ {product.rating} ·{" "}
          {product.reviews}
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
            className="small-btn details-btn"
            onClick={() =>
              onDetails(product)
            }
          >
            Ver detalles
          </button>

          <button
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
