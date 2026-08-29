import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";
const SETTINGS_KEY = "vanidaxi_settings";

const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE =
  "Hola, necesito ayuda con VaniDaxi.";

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

  const [products, setProducts] =
    useState(initialProducts);

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

  const [authMode, setAuthMode] =
    useState("login");
  const [authEmail, setAuthEmail] =
    useState("");
  const [authPassword, setAuthPassword] =
    useState("");
  const [authName, setAuthName] =
    useState("");
  const [authMessage, setAuthMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

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

  const [newProduct, setNewProduct] =
    useState({
      name: "",
      price: "",
      category: "Ropa y Moda",
      image: "",
      description: "",
    });

  useEffect(() => {
    const getUser = async () => {
      const { data } =
        await supabase.auth.getUser();

      setUser(data?.user || null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () =>
      subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );
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
      settings.darkMode
    );
  }, [settings]);

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
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
    checkout.delivery === "express" &&
    cart.length > 0
      ? 99
      : 0;

  const cartTotal =
    cartSubtotal + shippingCost;

  const activeCategory =
    location.pathname.startsWith(
      "/categoria/"
    )
      ? decodeURIComponent(
          location.pathname.replace(
            "/categoria/",
            ""
          )
        )
      : "Todos";

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (
      activeCategory !== "Todos"
    ) {
      result = result.filter(
        (product) =>
          product.category ===
          activeCategory
      );
    }

    const term = normalizeText(search);

    if (!term) return result;

    return result.filter((product) => {
      const searchable =
        normalizeText(
          [
            product.name,
            product.category,
            product.description,
            ...(product.specifications ||
              []),
          ].join(" ")
        );

      return searchable.includes(term);
    });
  }, [
    products,
    activeCategory,
    search,
  ]);

  const currentProductId =
    location.pathname.startsWith(
      "/producto/"
    )
      ? location.pathname.replace(
          "/producto/",
          ""
        )
      : null;

  const selectedProduct =
    currentProductId
      ? products.find(
          (product) =>
            String(product.id) ===
            String(currentProductId)
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
    go(
      `/categoria/${encodeURIComponent(
        category
      )}`
    );
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

  const addToCart = (
    product,
    redirect = true
  ) => {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(
                    item.quantity || 0
                  ) + 1,
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
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  const changeQuantity = (
    id,
    amount
  ) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Number(
                  item.quantity || 1
                ) + amount
              ),
            }
          : item
      )
    );
  };

  const toggleFavorite = (product) => {
    setFavorites((current) => {
      const exists = current.some(
        (item) =>
          item.id === product.id
      );

      return exists
        ? current.filter(
            (item) =>
              item.id !== product.id
          )
        : [...current, product];
    });
  };

  const startCheckout = (
    product = null
  ) => {
    if (product) {
      addToCart(product, false);
    }

    if (
      !product &&
      cart.length === 0
    ) {
      go("/carrito");
      return;
    }

    go("/checkout/entrega");
  };

  const handleAuth = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setAuthMessage("");

    try {
      if (
        authMode === "register"
      ) {
        if (
          authPassword.length < 6
        ) {
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
          await supabase.auth.signInWithPassword(
            {
              email: authEmail,
              password:
                authPassword,
            }
          );

        if (error) throw error;

        setUser(data.user);
        go("/cuenta");
      }
    } catch (error) {
      const message =
        error?.message || "";

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

    if (
      !newProduct.name.trim() ||
      !newProduct.price
    ) {
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      price: Number(
        newProduct.price
      ),
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category:
        newProduct.category,
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",
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

    go(`/producto/${product.id}`);
  };

  const updateCheckout = (
    field,
    value
  ) => {
    setCheckout((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateNewProduct = (
    field,
    value
  ) => {
    setNewProduct((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const whatsappUrl =
    WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          WHATSAPP_MESSAGE
        )}`
      : "#";

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
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #fff;
          color: #222;
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
          background: #fff;
        }

        .gradient-text {
          background:
            linear-gradient(
              90deg,
              #ef233c,
              #d41472,
              #6a11cb
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #eee;
        }

        .topbar-inner {
          width: min(1180px, calc(100% - 28px));
          margin: auto;
          min-height: 68px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand {
          border: 0;
          background: transparent;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -.8px;
          padding: 4px;
          white-space: nowrap;
        }

        .search-wrap {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          height: 44px;
          border: 1px solid #ddd;
          border-radius: 13px;
          padding: 0 15px;
          outline: none;
          background: #fafafa;
          transition: .2s;
        }

        .search-input:focus {
          border-color: #c3299b;
          background: #fff;
          box-shadow:
            0 0 0 3px
            rgba(195,41,155,.10);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .icon-btn {
          width: 42px;
          height: 42px;
          border: 1px solid #e5e5e5;
          background: #fff;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 19px;
          position: relative;
        }

        .cart-badge {
          position: absolute;
          right: -3px;
          top: -5px;
          min-width: 18px;
          height: 18px;
          border-radius: 99px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #ef233c,
              #d41472,
              #6a11cb
            );
        }

        .main {
          width: min(1180px, calc(100% - 28px));
          margin: auto;
          padding: 18px 0 95px;
        }

        .hero {
          border-radius: 24px;
          padding: 30px;
          min-height: 260px;
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(
              135deg,
              #ef233c,
              #d41472 52%,
              #6a11cb
            );
          color: #fff;
        }

        .hero-content {
          max-width: 650px;
          position: relative;
          z-index: 2;
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: clamp(34px, 6vw, 58px);
          line-height: .98;
        }

        .hero p {
          margin: 0 0 20px;
          font-size: 17px;
          opacity: .94;
        }

        .hero-btn {
          border: 0;
          border-radius: 12px;
          background: #fff;
          color: #a31d86;
          font-weight: 800;
          padding: 12px 18px;
        }

        .section {
          margin-top: 26px;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 13px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 23px;
        }

        .section-link {
          border: 0;
          background: transparent;
          font-weight: 700;
          color: #9b208e;
        }

        .top-cards {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 12px;
        }

        .top-card {
          min-height: 130px;
          border: 0;
          border-radius: 17px;
          overflow: hidden;
          position: relative;
          background: #222;
          color: #fff;
          text-align: left;
        }

        .top-card img {
          width: 100%;
          height: 100%;
          min-height: 130px;
          object-fit: cover;
          opacity: .66;
          display: block;
        }

        .top-card-content {
          position: absolute;
          inset: auto 12px 12px;
        }

        .top-card-title {
          font-weight: 900;
          font-size: 18px;
        }

        .top-card-subtitle {
          font-size: 12px;
          margin-top: 2px;
        }

        .categories {
          display: grid;
          grid-template-columns:
            repeat(8, minmax(0,1fr));
          gap: 9px;
        }

        .category-card {
          border: 1px solid #eee;
          background: #fff;
          border-radius: 14px;
          padding: 7px;
          min-width: 0;
          transition: .2s;
        }

        .category-card:hover {
          transform: translateY(-2px);
          border-color: #d52c9e;
        }

        .category-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          object-fit: cover;
          display: block;
        }

        .category-name {
          display: block;
          text-align: center;
          font-size: 11px;
          line-height: 1.15;
          font-weight: 800;
          margin: 6px 1px 2px;
          color: #762078;
        }

        .products {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 14px;
        }

        .product-card {
          border: 1px solid #eee;
          border-radius: 17px;
          overflow: hidden;
          background: #fff;
          min-width: 0;
        }

        .product-image-wrap {
          position: relative;
          background: #f7f7f7;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1 / .88;
          object-fit: cover;
          display: block;
        }

        .favorite {
          position: absolute;
          right: 9px;
          top: 9px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          font-size: 18px;
        }

        .discount {
          position: absolute;
          left: 9px;
          top: 9px;
          background:
            linear-gradient(
              135deg,
              #ef233c,
              #d41472
            );
          color: #fff;
          padding: 5px 7px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 900;
        }

        .product-info {
          padding: 12px;
        }

        .product-name {
          font-weight: 800;
          margin-bottom: 6px;
          min-height: 38px;
        }

        .rating {
          font-size: 12px;
          color: #777;
          margin-bottom: 7px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
          flex-wrap: wrap;
        }

        .price {
          font-size: 21px;
          font-weight: 900;
        }

        .old-price {
          color: #999;
          text-decoration: line-through;
          font-size: 12px;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 7px;
          margin-top: 10px;
        }

        .primary-btn {
          border: 0;
          border-radius: 11px;
          padding: 10px 12px;
          color: #fff;
          font-weight: 800;
          background:
            linear-gradient(
              90deg,
              #ef233c,
              #d41472,
              #6a11cb
            );
        }

        .secondary-btn {
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 11px;
          padding: 10px 12px;
          font-weight: 800;
        }

        .empty {
          padding: 40px 15px;
          border: 1px dashed #ddd;
          border-radius: 18px;
          text-align: center;
          color: #777;
        }

        .page {
          max-width: 900px;
          margin: auto;
        }

        .back {
          border: 0;
          background: transparent;
          padding: 5px 0;
          color: #8b218d;
          font-weight: 800;
          margin-bottom: 15px;
        }

        .product-detail {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);
          gap: 25px;
        }

        .detail-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 22px;
        }

        .detail-content h1 {
          margin: 0 0 9px;
          font-size: clamp(28px,5vw,44px);
        }

        .detail-description {
          color: #666;
          line-height: 1.6;
        }

        .specs {
          margin: 18px 0;
          padding: 0;
          list-style: none;
        }

        .specs li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .auth-box,
        .checkout-box,
        .cart-box,
        .account-box,
        .publish-box {
          max-width: 560px;
          margin: 25px auto;
          padding: 24px;
          border: 1px solid #eee;
          border-radius: 22px;
          background: #fff;
          box-shadow:
            0 12px 35px
            rgba(0,0,0,.06);
        }

        .auth-logo {
          text-align: center;
          margin-bottom: 18px;
        }

        .auth-logo strong {
          display: block;
          font-size: 34px;
          font-weight: 950;
        }

        .auth-logo span {
          color: #777;
          font-size: 13px;
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
          font-size: 13px;
          font-weight: 800;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 11px;
          padding: 12px;
          outline: none;
          background: #fff;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #c3299b;
          box-shadow:
            0 0 0 3px
            rgba(195,41,155,.08);
        }

        .field textarea {
          min-height: 95px;
          resize: vertical;
        }

        .auth-switch {
          border: 0;
          background: transparent;
          color: #92218d;
          font-weight: 800;
          padding: 5px;
        }

        .message {
          padding: 10px 12px;
          border-radius: 10px;
          background: #fff3f7;
          color: #b0175b;
          font-size: 13px;
        }

        .cart-item {
          display: grid;
          grid-template-columns:
            75px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item img {
          width: 75px;
          height: 75px;
          object-fit: cover;
          border-radius: 12px;
        }

        .qty {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .qty button {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 8px;
        }

        .summary {
          margin-top: 18px;
          display: grid;
          gap: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .summary-total {
          padding-top: 12px;
          margin-top: 4px;
          border-top: 1px solid #ddd;
          font-size: 21px;
          font-weight: 900;
        }

        .bottom-nav {
          position: fixed;
          z-index: 40;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: min(520px, calc(100% - 24px));
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          padding: 7px;
          gap: 5px;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border: 1px solid #e8e8e8;
          border-radius: 19px;
          box-shadow:
            0 10px 35px
            rgba(0,0,0,.12);
        }

        .bottom-nav button {
          border: 0;
          background: transparent;
          padding: 7px 4px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .bottom-nav button.active {
          background: #f8eaf8;
          color: #8e208d;
        }

        .support {
          position: fixed;
          z-index: 45;
          right: 16px;
          bottom: 82px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 0;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 24px;
          text-decoration: none;
          background:
            linear-gradient(
              135deg,
              #25d366,
              #128c7e
            );
          box-shadow:
            0 8px 25px
            rgba(18,140,126,.28);
        }

        .menu {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.38);
        }

        .menu-panel {
          width: min(350px, 88%);
          height: 100%;
          background: #fff;
          padding: 22px;
          box-shadow:
            10px 0 40px
            rgba(0,0,0,.16);
        }

        .menu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .menu-list {
          display: grid;
          gap: 7px;
        }

        .menu-list button {
          text-align: left;
          border: 0;
          background: #fafafa;
          padding: 13px;
          border-radius: 12px;
          font-weight: 750;
        }

        .settings-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .switch {
          width: 45px;
          height: 25px;
          border: 0;
          border-radius: 99px;
          background: #ddd;
          padding: 3px;
        }

        .switch span {
          display: block;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: #fff;
          transition: .2s;
        }

        .switch.on {
          background:
            linear-gradient(
              90deg,
              #ef233c,
              #6a11cb
            );
        }

        .switch.on span {
          transform: translateX(20px);
        }

        @media (max-width: 850px) {
          .topbar-inner {
            flex-wrap: wrap;
            padding: 8px 0;
          }

          .brand {
            order: 1;
          }

          .header-actions {
            order: 2;
            margin-left: auto;
          }

          .search-wrap {
            order: 3;
            flex-basis: 100%;
          }

          .topbar-inner {
            min-height: 116px;
          }

          .top-cards {
            grid-template-columns:
              repeat(2,1fr);
          }

          .categories {
            grid-template-columns:
              repeat(4,1fr);
          }

          .products {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media (max-width: 600px) {
          .main {
            width: min(
              100% - 20px,
              1180px
            );
            padding-top: 10px;
          }

          .hero {
            padding: 23px 18px;
            min-height: 230px;
            border-radius: 20px;
          }

          .hero h1 {
            font-size: 38px;
          }

          .top-cards {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .top-cards::-webkit-scrollbar {
            display: none;
          }

          .top-card {
            flex: 0 0 155px;
          }

          .categories {
            grid-template-columns:
              repeat(4, minmax(0,1fr));
            gap: 7px;
          }

          .category-card {
            padding: 5px;
            border-radius: 11px;
          }

          .category-name {
            font-size: 9px;
            margin-top: 4px;
          }

          .products {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 9px;
          }

          .product-info {
            padding: 9px;
          }

          .product-name {
            font-size: 13px;
            min-height: 32px;
          }

          .price {
            font-size: 18px;
          }

          .card-actions {
            grid-template-columns: 1fr;
          }

          .secondary-btn {
            display: none;
          }

          .product-detail {
            grid-template-columns: 1fr;
          }

          .auth-box,
          .checkout-box,
          .cart-box,
          .account-box,
          .publish-box {
            padding: 18px;
            border-radius: 18px;
          }

          .cart-item {
            grid-template-columns:
              60px 1fr;
          }

          .cart-item > :last-child {
            grid-column: 2;
          }

          .cart-item img {
            width: 60px;
            height: 60px;
          }

          .support {
            right: 12px;
            bottom: 79px;
          }
        }

        .dark-theme {
          background: #111;
          color: #eee;
        }

        .dark-theme .app,
        .dark-theme .topbar,
        .dark-theme .bottom-nav,
        .dark-theme .auth-box,
        .dark-theme .checkout-box,
        .dark-theme .cart-box,
        .dark-theme .account-box,
        .dark-theme .publish-box,
        .dark-theme .product-card,
        .dark-theme .category-card,
        .dark-theme .secondary-btn,
        .dark-theme .icon-btn {
          background: #171717;
          color: #eee;
          border-color: #303030;
        }

        .dark-theme .search-input,
        .dark-theme .field input,
        .dark-theme .field textarea,
        .dark-theme .field select {
          background: #202020;
          color: #eee;
          border-color: #383838;
        }

        .dark-theme .menu-panel {
          background: #171717;
          color: #eee;
        }

        .dark-theme .menu-list button {
          background: #222;
          color: #eee;
        }

        .dark-theme .detail-description,
        .dark-theme .rating,
        .dark-theme .old-price {
          color: #aaa;
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="brand gradient-text"
            onClick={goHome}
          >
            VaniDaxi
          </button>

          <div className="search-wrap">
            <input
              className="search-input"
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  goProducts();
                }
              }}
              placeholder="¿Qué estás buscando?"
              autoComplete="off"
              inputMode="search"
            />
          </div>

          <div className="header-actions">
            <button
              className="icon-btn"
              aria-label="Cuenta"
              onClick={() =>
                openAuth(
                  user
                    ? "account"
                    : "login"
                )
              }
            >
              ✨
            </button>

            <button
              className="icon-btn"
              aria-label="Carrito"
              onClick={() =>
                go("/carrito")
              }
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="icon-btn"
              aria-label="Menú"
              onClick={() =>
                go("/menu")
              }
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {location.pathname === "/" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <h1>
                  Todo en un solo lugar.
                </h1>
                <p>
                  Compra, descubre y vende
                  productos fácilmente en
                  VaniDaxi.
                </p>
                <button
                  className="hero-btn"
                  onClick={goProducts}
                >
                  Explorar productos
                </button>
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <h2>
                  Descubre VaniDaxi
                </h2>
              </div>

              <div className="top-cards">
                {[
                  {
                    title: "Ofertas",
                    subtitle:
                      "Hasta 50% menos",
                    image:
                      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=700&q=85",
                  },
                  {
                    title: "Novedades",
                    subtitle:
                      "Lo más reciente",
                    image:
                      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85",
                  },
                  {
                    title: "Vendedores",
                    subtitle:
                      "Descubre nuevos productos",
                    image:
                      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=700&q=85",
                  },
                  {
                    title: "Envíos",
                    subtitle:
                      "Compra fácilmente",
                    image:
                      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=85",
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    className="top-card"
                    onClick={
                      goProducts
                    }
                  >
                    <img
                      src={card.image}
                      alt=""
                    />
                    <div className="top-card-content">
                      <div className="top-card-title">
                        {card.title}
                      </div>
                      <div className="top-card-subtitle">
                        {card.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <h2>
                  Categorías
                </h2>
              </div>

              <div className="categories">
                {categories.map(
                  (category) => (
                    <button
                      className="category-card"
                      key={
                        category.name
                      }
                      onClick={() =>
                        goCategory(
                          category.name
                        )
                      }
                    >
                      <img
                        className="category-image"
                        src={
                          category.image
                        }
                        alt={
                          category.name
                        }
                      />
                      <span className="category-name">
                        {
                          category.name
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <h2>
                  Productos destacados
                </h2>
                <button
                  className="section-link"
                  onClick={
                    goProducts
                  }
                >
                  Ver todos
                </button>
              </div>

              <ProductGrid
                products={
                  products.slice(0, 4)
                }
                onOpen={(product) =>
                  go(
                    `/producto/${product.id}`
                  )
                }
                onCart={addToCart}
                onFavorite={
                  toggleFavorite
                }
                favorites={
                  favorites
                }
              />
            </section>
          </>
        )}

        {location.pathname ===
          "/productos" && (
          <section>
            <div className="section-title">
              <h2 className="gradient-text">
                Todos los productos
              </h2>
              <span>
                {filteredProducts.length}{" "}
                productos
              </span>
            </div>

            <ProductGrid
              products={
                filteredProducts
              }
              onOpen={(product) =>
                go(
                  `/producto/${product.id}`
                )
              }
              onCart={addToCart}
              onFavorite={
                toggleFavorite
              }
              favorites={favorites}
            />
          </section>
        )}

        {location.pathname.startsWith(
          "/categoria/"
        ) && (
          <section>
            <button
              className="back"
              onClick={goHome}
            >
              ← Inicio
            </button>

            <div className="section-title">
              <h2 className="gradient-text">
                {activeCategory}
              </h2>
            </div>

            <ProductGrid
              products={
                filteredProducts
              }
              onOpen={(product) =>
                go(
                  `/producto/${product.id}`
                )
              }
              onCart={addToCart}
              onFavorite={
                toggleFavorite
              }
              favorites={favorites}
            />
          </section>
        )}

        {selectedProduct && (
          <section className="page">
            <button
              className="back"
              onClick={goProducts}
            >
              ← Volver a productos
            </button>

            <div className="product-detail">
              <img
                className="detail-image"
                src={
                  selectedProduct.image
                }
                alt={
                  selectedProduct.name
                }
              />

              <div className="detail-content">
                <h1>
                  {
                    selectedProduct.name
                  }
                </h1>

                <div className="rating">
                  ⭐{" "}
                  {
                    selectedProduct.rating
                  }{" "}
                  ·{" "}
                  {
                    selectedProduct.reviews
                  }{" "}
                  reseñas
                </div>

                <div className="price-row">
                  <span className="price">
                    {formatPrice(
                      selectedProduct.price
                    )}
                  </span>

                  {selectedProduct.oldPrice && (
                    <span className="old-price">
                      {formatPrice(
                        selectedProduct.oldPrice
                      )}
                    </span>
                  )}
                </div>

                <p className="detail-description">
                  {
                    selectedProduct.description
                  }
                </p>

                <ul className="specs">
                  {(
                    selectedProduct.specifications ||
                    []
                  ).map(
                    (specification) => (
                      <li
                        key={
                          specification
                        }
                      >
                        ✓{" "}
                        {
                          specification
                        }
                      </li>
                    )
                  )}
                </ul>

                <div className="form">
                  <button
                    className="primary-btn"
                    onClick={() =>
                      addToCart(
                        selectedProduct
                      )
                    }
                  >
                    Agregar al carrito
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      startCheckout(
                        selectedProduct
                      )
                    }
                  >
                    Comprar ahora
                  </button>

                  <button
                    className="secondary-btn"
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
                      ? "♥ En favoritos"
                      : "♡ Agregar a favoritos"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {location.pathname ===
          "/carrito" && (
          <section className="page">
            <button
              className="back"
              onClick={goHome}
            >
              ← Seguir comprando
            </button>

            <div className="cart-box">
              <h2>Mi carrito</h2>

              {cart.length === 0 ? (
                <div className="empty">
                  <div
                    style={{
                      fontSize: 40,
                      marginBottom: 8,
                    }}
                  >
                    🛒
                  </div>
                  Tu carrito está vacío.
                  <br />
                  <button
                    className="primary-btn"
                    style={{
                      marginTop: 15,
                    }}
                    onClick={
                      goProducts
                    }
                  >
                    Explorar productos
                  </button>
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

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <div>
                          {formatPrice(
                            item.price
                          )}
                        </div>

                        <div className="qty">
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

                          <span>
                            {
                              item.quantity
                            }
                          </span>

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
                        </div>
                      </div>

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}

                  <div className="summary">
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
                      <span>
                        Envío
                      </span>
                      <strong>
                        {shippingCost
                          ? formatPrice(
                              shippingCost
                            )
                          : "Gratis"}
                      </strong>
                    </div>

                    <div className="summary-row summary-total">
                      <span>
                        Total
                      </span>
                      <strong>
                        {formatPrice(
                          cartTotal
                        )}
                      </strong>
                    </div>

                    <button
                      className="primary-btn"
                      onClick={() =>
                        startCheckout()
                      }
                    >
                      Continuar al pago
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {(location.pathname ===
          "/cuenta/iniciar" ||
          location.pathname ===
            "/cuenta/crear") && (
          <section className="page">
            <div className="auth-box">
              <div className="auth-logo">
                <strong className="gradient-text">
                  VaniDaxi
                </strong>
                <span>
                  Todo en un solo lugar
                </span>
              </div>

              <h2>
                {authMode ===
                "register"
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
              </h2>

              <form
                className="form"
                onSubmit={
                  handleAuth
                }
              >
                {authMode ===
                  "register" && (
                  <div className="field">
                    <label>
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={
                        authName
                      }
                      onChange={(e) =>
                        setAuthName(
                          e.target.value
                        )
                      }
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                <div className="field">
                  <label>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={
                      authEmail
                    }
                    onChange={(e) =>
                      setAuthEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={
                      authPassword
                    }
                    onChange={(e) =>
                      setAuthPassword(
                        e.target.value
                      )
                    }
                    autoComplete={
                      authMode ===
                      "register"
                        ? "new-password"
                        : "current-password"
                    }
                    required
                  />
                </div>

                {authMessage && (
                  <div className="message">
                    {authMessage}
                  </div>
                )}

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : authMode ===
                      "register"
                    ? "Crear mi cuenta"
                    : "Iniciar sesión"}
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 14,
                }}
              >
                {authMode ===
                "register"
                  ? "¿Ya tienes cuenta?"
                  : "¿Aún no tienes cuenta?"}

                <br />

                <button
                  type="button"
                  className="auth-switch"
                  onClick={() =>
                    openAuth(
                      authMode ===
                        "register"
                        ? "login"
                        : "register"
                    )
                  }
                >
                  {authMode ===
                  "register"
                    ? "Iniciar sesión"
                    : "Crear una cuenta"}
                </button>
              </div>
            </div>
          </section>
        )}

        {location.pathname ===
          "/cuenta" && (
          <section className="page">
            <div className="account-box">
              <h2>
                Mi cuenta
              </h2>

              {user ? (
                <>
                  <p>
                    Has iniciado sesión
                    como:
                  </p>

                  <strong>
                    {user.email}
                  </strong>

                  <div
                    className="form"
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <button
                      className="primary-btn"
                      onClick={() =>
                        go(
                          "/publicar"
                        )
                      }
                    >
                      Publicar producto
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        go(
                          "/favoritos"
                        )
                      }
                    >
                      Mis favoritos
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={
                        handleLogout
                      }
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Inicia sesión para
                    acceder a tu cuenta.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      openAuth(
                        "login"
                      )
                    }
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {location.pathname ===
          "/favoritos" && (
          <section className="page">
            <button
              className="back"
              onClick={goHome}
            >
              ← Inicio
            </button>

            <h2>
              Mis favoritos
            </h2>

            {favorites.length ===
            0 ? (
              <div className="empty">
                Aún no tienes productos
                favoritos.
              </div>
            ) : (
              <ProductGrid
                products={
                  favorites
                }
                onOpen={(product) =>
                  go(
                    `/producto/${product.id}`
                  )
                }
                onCart={addToCart}
                onFavorite={
                  toggleFavorite
                }
                favorites={
                  favorites
                }
              />
            )}
          </section>
        )}

        {location.pathname ===
          "/publicar" && (
          <section className="page">
            <div className="publish-box">
              <h2>
                Publicar producto
              </h2>

              {!user ? (
                <>
                  <p>
                    Necesitas iniciar
                    sesión para publicar.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      openAuth(
                        "login"
                      )
                    }
                  >
                    Iniciar sesión
                  </button>
                </>
              ) : (
                <form
                  className="form"
                  onSubmit={
                    handlePublish
                  }
                >
                  <div className="field">
                    <label>
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      value={
                        newProduct.name
                      }
                      onChange={(e) =>
                        updateNewProduct(
                          "name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Precio
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        newProduct.price
                      }
                      onChange={(e) =>
                        updateNewProduct(
                          "price",
                          e.target.value
                        )
                      }
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Categoría
                    </label>
                    <select
                      value={
                        newProduct.category
                      }
                      onChange={(e) =>
                        updateNewProduct(
                          "category",
                          e.target.value
                        )
                      }
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.name
                            }
                            value={
                              category.name
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>
                      Imagen
                    </label>
                    <input
                      type="url"
                      value={
                        newProduct.image
                      }
                      onChange={(e) =>
                        updateNewProduct(
                          "image",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                      inputMode="url"
                    />
                  </div>

                  <div className="field">
                    <label>
                      Descripción
                    </label>
                    <textarea
                      value={
                        newProduct.description
                      }
                      onChange={(e) =>
                        updateNewProduct(
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    className="primary-btn"
                    type="submit"
                  >
                    Publicar producto
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {location.pathname ===
          "/checkout/entrega" && (
          <section className="page">
            <div className="checkout-box">
              <button
                className="back"
                onClick={() =>
                  go("/carrito")
                }
              >
                ← Carrito
              </button>

              <h2>
                Datos de entrega
              </h2>

              <form
                className="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  go(
                    "/checkout/confirmar"
                  );
                }}
              >
                <div className="field">
                  <label>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={
                      checkout.name
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "name",
                        e.target.value
                      )
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={
                      checkout.phone
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "phone",
                        e.target.value
                      )
                    }
                    autoComplete="tel"
                    inputMode="tel"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={
                      checkout.address
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "address",
                        e.target.value
                      )
                    }
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={
                      checkout.city
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "city",
                        e.target.value
                      )
                    }
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={
                      checkout.state
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "state",
                        e.target.value
                      )
                    }
                    autoComplete="address-level1"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Código postal
                  </label>
                  <input
                    type="text"
                    value={
                      checkout.zip
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "zip",
                        e.target.value
                      )
                    }
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Tipo de envío
                  </label>
                  <select
                    value={
                      checkout.delivery
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "delivery",
                        e.target.value
                      )
                    }
                  >
                    <option value="standard">
                      Envío estándar
                    </option>
                    <option value="express">
                      Envío express · $99
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    Notas
                  </label>
                  <textarea
                    value={
                      checkout.notes
                    }
                    onChange={(e) =>
                      updateCheckout(
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder="Indicaciones para la entrega"
                  />
                </div>

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Continuar
                </button>
              </form>
            </div>
          </section>
        )}

        {location.pathname ===
          "/checkout/confirmar" && (
          <section className="page">
            <div className="checkout-box">
              <button
                className="back"
                onClick={() =>
                  go(
                    "/checkout/entrega"
                  )
                }
              >
                ← Datos de entrega
              </button>

              <h2>
                Confirmar pedido
              </h2>

              <div className="summary">
                <div className="summary-row">
                  <span>
                    Productos
                  </span>
                  <strong>
                    {formatPrice(
                      cartSubtotal
                    )}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>
                    Envío
                  </span>
                  <strong>
                    {shippingCost
                      ? formatPrice(
                          shippingCost
                        )
                      : "Gratis"}
                  </strong>
                </div>

                <div className="summary-row summary-total">
                  <span>
                    Total
                  </span>
                  <strong>
                    {formatPrice(
                      cartTotal
                    )}
                  </strong>
                </div>

                <button
                  className="primary-btn"
                  onClick={() =>
                    go(
                      "/pedido/realizado"
                    )
                  }
                >
                  Confirmar pedido
                </button>
              </div>
            </div>
          </section>
        )}

        {location.pathname ===
          "/pedido/realizado" && (
          <section className="page">
            <div className="checkout-box"
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 55,
                }}
              >
                ✓
              </div>

              <h2>
                ¡Pedido recibido!
              </h2>

              <p>
                Gracias por comprar en
                VaniDaxi.
              </p>

              <button
                className="primary-btn"
                onClick={goHome}
              >
                Volver al inicio
              </button>
            </div>
          </section>
        )}

        {location.pathname ===
          "/menu" && (
          <section className="page">
            <div className="account-box">
              <h2>
                Menú
              </h2>

              <div className="menu-list">
                <button
                  onClick={() =>
                    openAuth(
                      user
                        ? "account"
                        : "login"
                    )
                  }
                >
                  ✨{" "}
                  {user
                    ? "Mi cuenta"
                    : "Iniciar sesión"}
                </button>

                <button
                  onClick={() =>
                    go("/favoritos")
                  }
                >
                  ♡ Mis favoritos
                </button>

                <button
                  onClick={() =>
                    go("/carrito")
                  }
                >
                  🛒 Mi carrito
                </button>

                <button
                  onClick={() =>
                    go("/publicar")
                  }
                >
                  ＋ Publicar producto
                </button>

                <button
                  onClick={() =>
                    go("/configuracion")
                  }
                >
                  ⚙ Configuración
                </button>
              </div>
            </div>
          </section>
        )}

        {location.pathname ===
          "/configuracion" && (
          <section className="page">
            <div className="account-box">
              <button
                className="back"
                onClick={() =>
                  go("/menu")
                }
              >
                ← Menú
              </button>

              <h2>
                Configuración
              </h2>

              <div className="settings-row">
                <div>
                  <strong>
                    Notificaciones
                  </strong>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    Recibir avisos de VaniDaxi
                  </div>
                </div>

                <button
                  className={`switch ${
                    settings.notifications
                      ? "on"
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
                >
                  <span />
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <strong>
                    Promociones
                  </strong>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    Ofertas y novedades
                  </div>
                </div>

                <button
                  className={`switch ${
                    settings.promotions
                      ? "on"
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
                >
                  <span />
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <strong>
                    Modo oscuro
                  </strong>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    Cambiar apariencia
                  </div>
                </div>

                <button
                  className={`switch ${
                    settings.darkMode
                      ? "on"
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
                >
                  <span />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {WHATSAPP_NUMBER && (
        <a
          className="support"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Atención al cliente"
        >
          💬
        </a>
      )}

      <nav className="bottom-nav">
        <button
          className={
            location.pathname === "/"
              ? "active"
              : ""
          }
          onClick={goHome}
        >
          🏠
          <br />
          Inicio
        </button>

        <button
          className={
            location.pathname ===
            "/productos"
              ? "active"
              : ""
          }
          onClick={
            goProducts
          }
        >
          🔎
          <br />
          Explorar
        </button>

        <button
          className={
            location.pathname ===
            "/favoritos"
              ? "active"
              : ""
          }
          onClick={() =>
            go("/favoritos")
          }
        >
          ♡
          <br />
          Favoritos
        </button>

        <button
          className={
            location.pathname ===
              "/cuenta" ||
            location.pathname ===
              "/cuenta/iniciar" ||
            location.pathname ===
              "/cuenta/crear"
              ? "active"
              : ""
          }
          onClick={() =>
            openAuth(
              user
                ? "account"
                : "login"
            )
          }
        >
          ✨
          <br />
          Cuenta
        </button>
      </nav>
    </div>
  );
}

function ProductGrid({
  products,
  onOpen,
  onCart,
  onFavorite,
  favorites,
}) {
  if (!products.length) {
    return (
      <div className="empty">
        No encontramos productos
        para esta búsqueda.
      </div>
    );
  }

  return (
    <div className="products">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpen}
          onCart={onCart}
          onFavorite={onFavorite}
          favorite={favorites.some(
            (item) =>
              item.id === product.id
          )}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
  onCart,
  onFavorite,
  favorite,
}) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <button
          type="button"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            background: "transparent",
            zIndex: 1,
          }}
          aria-label={`Ver ${product.name}`}
          onClick={() =>
            onOpen(product)
          }
        />

        <img
          className="product-image"
          src={product.image}
          alt={product.name}
        />

        {product.discount > 0 && (
          <span className="discount">
            -{product.discount}%
          </span>
        )}

        <button
          className="favorite"
          style={{
            zIndex: 2,
          }}
          type="button"
          onClick={() =>
            onFavorite(product)
          }
          aria-label="Favorito"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <div className="product-name">
          {product.name}
        </div>

        <div className="rating">
          ⭐ {product.rating} ·{" "}
          {product.reviews} reseñas
        </div>

        <div className="price-row">
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

        <div className="card-actions">
          <button
            className="primary-btn"
            type="button"
            onClick={() =>
              onCart(product)
            }
          >
            Agregar
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={() =>
              onOpen(product)
            }
          >
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}

export default App;
