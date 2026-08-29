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

const categories = [
  {
    name: "Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Hogar",
    image:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80",
  },
];

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
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
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
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=85",
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
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
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
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
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
    // Ignorar errores de almacenamiento.
  }
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
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
        setUser(data?.session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
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
        product.category.toLowerCase() === activeCategory.toLowerCase();

      const searchMatch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setShowCart(true);
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(1, item.quantity + amount),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );
  }

  function buyNow(product) {
    addToCart(product);
  }

  async function handleAuth(event) {
    event.preventDefault();

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;

        setUser(data.user);
        setShowAuth(false);
      }
    } catch (error) {
      alert(error?.message || "No fue posible completar la operación.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  }

  async function handlePublish(event) {
    event.preventDefault();

    if (!newProduct.name || !newProduct.price) {
      alert("Completa el nombre y el precio del producto.");
      return;
    }

    const product = {
      id: `local-${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category: newProduct.category,
      type: "Nuevo",
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
      description:
        newProduct.description || "Producto publicado en VaniDaxi.",
      specifications: [],
    };

    setProducts((current) => [product, ...current]);

    setNewProduct({
      name: "",
      price: "",
      category: "Moda",
      image: "",
      description: "",
    });

    setShowPublish(false);
    navigate("/");
  }

  function handleCategory(category) {
    setActiveCategory(category);
    setSearch("");

    if (location.pathname !== "/") {
      navigate("/");
    }
  }

  function whatsappCheckout() {
    if (!cart.length) return;

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
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <div className="app-shell">
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
          color: #222;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input,
        select,
        textarea {
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

        .top-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #eeeeee;
          backdrop-filter: blur(12px);
        }

        .header-inner {
          width: min(1180px, calc(100% - 28px));
          margin: 0 auto;
          min-height: 72px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: max-content;
        }

        .brand-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 21px;
          font-weight: 900;
          background: linear-gradient(135deg, #ff2d55, #e50087 52%, #6d25d9);
          box-shadow: 0 5px 15px rgba(211, 0, 112, .20);
        }

        .brand-name {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(90deg, #ed174d, #d60089, #6b29d8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .search-box {
          flex: 1;
          max-width: 560px;
          height: 44px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid #e5e5e5;
          border-radius: 23px;
          background: #f8f8f9;
          display: flex;
          align-items: center;
          padding: 0 15px;
          gap: 8px;
        }

        .search-box span {
          color: #8a8a8a;
          font-size: 18px;
        }

        .search-box input {
          border: 0;
          outline: 0;
          width: 100%;
          background: transparent;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .icon-button {
          position: relative;
          width: 42px;
          height: 42px;
          border: 1px solid #eeeeee;
          border-radius: 50%;
          background: #fff;
          display: grid;
          place-items: center;
          font-size: 19px;
        }

        .cart-badge {
          position: absolute;
          top: -3px;
          right: -2px;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          border-radius: 10px;
          background: #e6007e;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: grid;
          place-items: center;
        }

        .menu-button {
          border: 0;
          background: transparent;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          font-size: 24px;
        }

        .category-bar {
          border-bottom: 1px solid #eeeeee;
          background: #fff;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-bar::-webkit-scrollbar {
          display: none;
        }

        .category-inner {
          width: min(1180px, calc(100% - 28px));
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 26px;
          height: 45px;
          white-space: nowrap;
        }

        .category-link {
          border: 0;
          background: transparent;
          color: #555;
          font-size: 13px;
          font-weight: 600;
          padding: 0;
          height: 45px;
          position: relative;
        }

        .category-link.active {
          color: #b4007c;
          font-weight: 800;
        }

        .category-link.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(90deg, #ef2456, #d40088, #6d2bd9);
        }

        .page {
          width: min(1180px, calc(100% - 28px));
          margin: 0 auto;
        }

        .hero {
          margin-top: 20px;
          min-height: 280px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(90deg, rgba(44,8,55,.80), rgba(102,10,78,.34)),
            url("https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1800&q=85")
            center/cover;
          display: flex;
          align-items: center;
        }

        .hero-content {
          width: min(570px, 100%);
          padding: 42px;
          color: #fff;
        }

        .hero-kicker {
          display: inline-flex;
          padding: 7px 13px;
          border-radius: 20px;
          background: rgba(255,255,255,.16);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .hero h1 {
          margin: 0 0 12px;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.02;
          letter-spacing: -1.8px;
        }

        .hero p {
          margin: 0 0 22px;
          font-size: 15px;
          line-height: 1.55;
          opacity: .92;
          max-width: 470px;
        }

        .primary-button {
          border: 0;
          min-height: 43px;
          padding: 0 20px;
          border-radius: 22px;
          color: #fff;
          font-weight: 800;
          background: linear-gradient(90deg, #f02455, #d6008a, #6d29d7);
          box-shadow: 0 7px 18px rgba(197, 0, 116, .22);
        }

        .secondary-button {
          min-height: 42px;
          padding: 0 18px;
          border-radius: 22px;
          border: 1px solid #e3e3e3;
          background: #fff;
          font-weight: 700;
        }

        .section {
          padding: 28px 0 0;
        }

        .section-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-title {
          margin: 0;
          font-size: 22px;
          letter-spacing: -.6px;
        }

        .section-subtitle {
          color: #888;
          font-size: 12px;
          margin: 5px 0 0;
        }

        .see-all {
          border: 0;
          background: transparent;
          color: #b6007d;
          font-size: 13px;
          font-weight: 800;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 12px;
        }

        .category-card {
          border: 1px solid #eeeeee;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          padding: 0;
          min-width: 0;
          box-shadow: 0 3px 12px rgba(0,0,0,.035);
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,.08);
        }

        .category-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: block;
          object-fit: cover;
        }

        .category-name {
          display: block;
          padding: 9px 5px 11px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          color: #333;
        }

        .promo {
          margin-top: 26px;
          border-radius: 18px;
          min-height: 112px;
          padding: 20px 24px;
          background: linear-gradient(90deg, #fff1f7, #faf1ff);
          border: 1px solid #f4deeb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .promo h3 {
          margin: 0 0 6px;
          font-size: 19px;
        }

        .promo p {
          margin: 0;
          color: #777;
          font-size: 13px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          padding-bottom: 50px;
        }

        .product-card {
          border: 1px solid #eeeeee;
          border-radius: 17px;
          overflow: hidden;
          background: #fff;
          position: relative;
          box-shadow: 0 3px 12px rgba(0,0,0,.035);
        }

        .product-image-wrap {
          position: relative;
          background: #f6f6f6;
          aspect-ratio: 1 / .92;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          border-radius: 13px;
          background: #e90073;
          color: #fff;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 900;
        }

        .favorite-button {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 33px;
          height: 33px;
          border-radius: 50%;
          border: 0;
          background: rgba(255,255,255,.94);
          font-size: 17px;
        }

        .product-body {
          padding: 13px;
        }

        .product-category {
          color: #999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .6px;
          font-weight: 800;
        }

        .product-name {
          margin: 5px 0 8px;
          font-size: 14px;
          line-height: 1.3;
          min-height: 36px;
        }

        .rating {
          font-size: 11px;
          color: #e79a00;
          margin-bottom: 9px;
        }

        .rating span {
          color: #999;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .price {
          font-size: 18px;
          font-weight: 900;
        }

        .old-price {
          font-size: 11px;
          color: #aaa;
          text-decoration: line-through;
        }

        .card-actions {
          display: flex;
          gap: 7px;
          margin-top: 12px;
        }

        .add-button {
          flex: 1;
          min-height: 38px;
          border: 0;
          border-radius: 11px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          background: linear-gradient(90deg, #ef2858, #d30088, #6b2bd7);
        }

        .details-button {
          width: 40px;
          border: 1px solid #e8e8e8;
          background: #fff;
          border-radius: 11px;
          font-size: 16px;
        }

        .floating-cart {
          position: fixed;
          left: 18px;
          bottom: 22px;
          z-index: 80;
          width: 55px;
          height: 55px;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #f12658, #d1008b, #6828d7);
          box-shadow: 0 10px 26px rgba(144,0,116,.28);
          font-size: 22px;
        }

        .floating-support {
          position: fixed;
          right: 18px;
          bottom: 22px;
          z-index: 80;
          width: 55px;
          height: 55px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #eee;
          box-shadow: 0 8px 24px rgba(0,0,0,.12);
          font-size: 22px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.38);
          z-index: 100;
          display: flex;
        }

        .side-menu {
          width: min(340px, 88vw);
          height: 100%;
          background: #fff;
          padding: 22px;
          box-shadow: 8px 0 30px rgba(0,0,0,.15);
          animation: slideIn .2s ease;
        }

        @keyframes slideIn {
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
          margin-bottom: 25px;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #eee;
          background: #fff;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 50px;
          border: 0;
          border-bottom: 1px solid #f0f0f0;
          background: transparent;
          text-align: left;
          font-weight: 700;
        }

        .modal-card {
          width: min(480px, calc(100% - 28px));
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          margin: auto;
          border-radius: 22px;
          background: #fff;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,.22);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .form {
          display: grid;
          gap: 13px;
        }

        .form label {
          font-size: 12px;
          font-weight: 800;
          color: #555;
        }

        .form input,
        .form select,
        .form textarea {
          width: 100%;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          padding: 12px;
          outline: 0;
          background: #fafafa;
        }

        .form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .cart-panel {
          margin-left: auto;
          width: min(440px, 94vw);
          height: 100%;
          background: #fff;
          padding: 22px;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(0,0,0,.14);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          display: grid;
          align-content: start;
          gap: 12px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 65px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 9px;
          border: 1px solid #eee;
          border-radius: 14px;
        }

        .cart-item img {
          width: 65px;
          height: 65px;
          border-radius: 10px;
          object-fit: cover;
        }

        .cart-item h4 {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .cart-item p {
          margin: 0;
          font-size: 12px;
          font-weight: 800;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }

        .quantity button {
          width: 25px;
          height: 25px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 7px;
        }

        .remove {
          border: 0;
          background: transparent;
          color: #c70069;
          font-size: 11px;
        }

        .cart-footer {
          border-top: 1px solid #eee;
          padding-top: 16px;
          margin-top: 15px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 17px;
          font-weight: 900;
          margin-bottom: 13px;
        }

        .product-page {
          padding: 25px 0 70px;
        }

        .back-button {
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 18px;
          font-weight: 800;
          color: #777;
        }

        .product-detail {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 34px;
        }

        .detail-image {
          width: 100%;
          aspect-ratio: 1 / .9;
          border-radius: 22px;
          object-fit: cover;
          background: #f6f6f6;
        }

        .detail-category {
          color: #b30079;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .detail-title {
          margin: 7px 0 13px;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.05;
        }

        .detail-description {
          color: #666;
          line-height: 1.6;
          font-size: 14px;
        }

        .specifications {
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }

        .specifications li {
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8f8f8;
          font-size: 13px;
        }

        .empty-state {
          padding: 45px 15px;
          text-align: center;
          color: #888;
          grid-column: 1 / -1;
        }

        .footer {
          border-top: 1px solid #eee;
          padding: 35px 0 80px;
          color: #777;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .header-inner {
            min-height: 65px;
          }

          .search-box {
            max-width: none;
          }

          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .product-detail {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .header-inner {
            gap: 7px;
          }

          .brand-name {
            font-size: 18px;
          }

          .brand-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }

          .search-box {
            order: 5;
            width: 100%;
            flex-basis: 100%;
            margin: 0;
          }

          .header-inner {
            flex-wrap: wrap;
            padding: 10px 0;
          }

          .top-header {
            position: relative;
          }

          .header-actions {
            margin-left: auto;
          }

          .category-inner {
            gap: 20px;
          }

          .hero {
            min-height: 360px;
            border-radius: 18px;
          }

          .hero-content {
            padding: 27px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .category-card {
            border-radius: 12px;
          }

          .category-name {
            font-size: 9px;
            padding: 7px 2px 9px;
          }

          .promo {
            align-items: flex-start;
            flex-direction: column;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .product-body {
            padding: 10px;
          }

          .product-name {
            font-size: 12px;
          }

          .price {
            font-size: 16px;
          }

          .add-button {
            font-size: 10px;
          }

          .floating-cart,
          .floating-support {
            width: 50px;
            height: 50px;
            bottom: 16px;
          }

          .floating-cart {
            left: 13px;
          }

          .floating-support {
            right: 13px;
          }
        }

        @media (max-width: 390px) {
          .page,
          .header-inner,
          .category-inner {
            width: min(100% - 20px, 1180px);
          }

          .categories-grid {
            gap: 6px;
          }

          .products-grid {
            gap: 8px;
          }

          .hero-content {
            padding: 22px;
          }

          .hero h1 {
            font-size: 30px;
          }
        }
      `}</style>

      <header className="top-header">
        <div className="header-inner">
          <Link className="brand" to="/" onClick={() => setActiveCategory("Todos")}>
            <div className="brand-icon">S</div>
            <div className="brand-name">VaniDaxi</div>
          </Link>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="¿Qué estás buscando?"
            />
          </div>

          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Favoritos"
              onClick={() => {
                if (favorites.length) {
                  setActiveCategory("Todos");
                  setSearch("");
                }
              }}
            >
              ♡
            </button>

            <button
              className="icon-button"
              type="button"
              aria-label="Carrito"
              onClick={() => setShowCart(true)}
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>

            <button
              className="menu-button"
              type="button"
              aria-label="Menú"
              onClick={() => setShowMenu(true)}
            >
              ☰
            </button>
          </div>
        </div>

        <nav className="category-bar">
          <div className="category-inner">
            {["Todos", ...categories.map((category) => category.name)].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-link ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleCategory(category)}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <main className="page">
                <section className="hero">
                  <div className="hero-content">
                    <span className="hero-kicker">
                      ✨ Todo en un solo lugar
                    </span>

                    <h1>Compra, vende y descubre.</h1>

                    <p>
                      Encuentra productos, ofertas y servicios de diferentes
                      vendedores en un solo lugar.
                    </p>

                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => {
                        document
                          .getElementById("productos")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Explorar productos
                    </button>
                  </div>
                </section>

                <section className="section">
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">Categorías</h2>
                      <p className="section-subtitle">
                        Encuentra exactamente lo que necesitas
                      </p>
                    </div>

                    <button
                      className="see-all"
                      type="button"
                      onClick={() => handleCategory("Todos")}
                    >
                      Ver todo
                    </button>
                  </div>

                  <div className="categories-grid">
                    {categories.map((category) => (
                      <button
                        type="button"
                        className="category-card"
                        key={category.name}
                        onClick={() => handleCategory(category.name)}
                      >
                        <img
                          className="category-image"
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

                <section className="promo">
                  <div>
                    <h3>¿Quieres vender en VaniDaxi?</h3>
                    <p>
                      Publica tus productos y llega a nuevos clientes.
                    </p>
                  </div>

                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setAuthMode("login");
                        setShowAuth(true);
                      } else {
                        setShowPublish(true);
                      }
                    }}
                  >
                    Publicar producto
                  </button>
                </section>

                <section className="section" id="productos">
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">
                        {activeCategory === "Todos"
                          ? "Productos destacados"
                          : activeCategory}
                      </h2>

                      <p className="section-subtitle">
                        {filteredProducts.length} productos disponibles
                      </p>
                    </div>
                  </div>

                  <div className="products-grid">
                    {filteredProducts.length ? (
                      filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          favorite={favorites.includes(product.id)}
                          onFavorite={() => toggleFavorite(product.id)}
                          onAdd={() => addToCart(product)}
                          onDetails={() =>
                            navigate(`/producto/${product.id}`)
                          }
                        />
                      ))
                    ) : (
                      <div className="empty-state">
                        No encontramos productos con esa búsqueda.
                      </div>
                    )}
                  </div>
                </section>
              </main>

              <footer className="footer">
                VaniDaxi · Todo en un solo lugar
              </footer>
            </>
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProductPage
              products={products}
              onAdd={addToCart}
              onBuy={buyNow}
              favoriteIds={favorites}
              onFavorite={toggleFavorite}
            />
          }
        />
      </Routes>

      <button
        className="floating-cart"
        type="button"
        aria-label="Abrir carrito"
        onClick={() => setShowCart(true)}
      >
        🛒
        {cartCount > 0 && (
          <span className="cart-badge">{cartCount}</span>
        )}
      </button>

      <button
        className="floating-support"
        type="button"
        aria-label="Soporte"
        onClick={() =>
          window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Hola, necesito ayuda con VaniDaxi."
            )}`,
            "_blank"
          )
        }
      >
        💬
      </button>

      {showMenu && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMenu(false);
            }
          }}
        >
          <aside className="side-menu">
            <div className="menu-header">
              <div className="brand">
                <div className="brand-icon">S</div>
                <div className="brand-name">VaniDaxi</div>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={() => setShowMenu(false)}
              >
                ✕
              </button>
            </div>

            <button
              className="menu-item"
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowAuth(true);
                setAuthMode("login");
              }}
            >
              ✨ {user ? "Mi cuenta" : "Iniciar sesión"}
            </button>

            <button
              className="menu-item"
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowCart(true);
              }}
            >
              🛒 Mi carrito
            </button>

            <button
              className="menu-item"
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowPublish(true);
              }}
            >
              📦 Publicar producto
            </button>

            <button
              className="menu-item"
              type="button"
              onClick={() => {
                setShowMenu(false);
                alert("La sección de pedidos estará disponible próximamente.");
              }}
            >
              🧾 Mis pedidos
            </button>

            <button
              className="menu-item"
              type="button"
              onClick={() => {
                setShowMenu(false);
                alert("La mensajería estará disponible próximamente.");
              }}
            >
              💬 Mensajes
            </button>

            {user && (
              <button className="menu-item" type="button" onClick={handleLogout}>
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}

      {showCart && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCart(false);
            }
          }}
        >
          <aside className="cart-panel">
            <div className="modal-header">
              <h2>Mi carrito</h2>

              <button
                className="close-button"
                type="button"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>

            <div className="cart-items">
              {cart.length ? (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div>
                      <h4>{item.name}</h4>
                      <p>{formatPrice(item.price)}</p>

                      <div className="quantity">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove"
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div style={{ fontSize: 38, marginBottom: 10 }}>🛒</div>
                  Tu carrito está vacío.
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="total-row">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <button
                  className="primary-button"
                  type="button"
                  style={{ width: "100%" }}
                  onClick={whatsappCheckout}
                >
                  Continuar compra
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {showAuth && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAuth(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h2>
                {authMode === "login"
                  ? "Bienvenido a VaniDaxi"
                  : "Crear cuenta"}
              </h2>

              <button
                className="close-button"
                type="button"
                onClick={() => setShowAuth(false)}
              >
                ✕
              </button>
            </div>

            <form className="form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <>
                  <label htmlFor="auth-name">Nombre</label>
                  <input
                    id="auth-name"
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </>
              )}

              <label htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />

              <label htmlFor="auth-password">Contraseña</label>
              <input
                id="auth-password"
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />

              <button className="primary-button" type="submit">
                {authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  setAuthMode((current) =>
                    current === "login" ? "register" : "login"
                  )
                }
              >
                {authMode === "login"
                  ? "Crear una cuenta"
                  : "Ya tengo una cuenta"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPublish && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowPublish(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h2>Publicar producto</h2>

              <button
                className="close-button"
                type="button"
                onClick={() => setShowPublish(false)}
              >
                ✕
              </button>
            </div>

            <form className="form" onSubmit={handlePublish}>
              <label htmlFor="product-name">Nombre del producto</label>
              <input
                id="product-name"
                value={newProduct.name}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ej. Bolsa de mano"
                required
              />

              <label htmlFor="product-price">Precio</label>
              <input
                id="product-price"
                type="number"
                min="1"
                value={newProduct.price}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="599"
                required
              />

              <label htmlFor="product-category">Categoría</label>
              <select
                id="product-category"
                value={newProduct.category}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <label htmlFor="product-image">URL de imagen</label>
              <input
                id="product-image"
                value={newProduct.image}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
                placeholder="https://..."
              />

              <label htmlFor="product-description">Descripción</label>
              <textarea
                id="product-description"
                value={newProduct.description}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe tu producto..."
              />

              <button className="primary-button" type="submit">
                Publicar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
  onDetails,
}) {
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
          className="favorite-button"
          type="button"
          aria-label="Favorito"
          onClick={onFavorite}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-body">
        <div className="product-category">{product.category}</div>

        <h3 className="product-name">{product.name}</h3>

        <div className="rating">
          ★ {product.rating}{" "}
          <span>({product.reviews})</span>
        </div>

        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>

          {product.oldPrice && (
            <span className="old-price">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="card-actions">
          <button
            className="add-button"
            type="button"
            onClick={onAdd}
          >
            Agregar al carrito
          </button>

          <button
            className="details-button"
            type="button"
            aria-label="Ver producto"
            onClick={onDetails}
          >
            →
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductPage({
  products,
  onAdd,
  onBuy,
  favoriteIds,
  onFavorite,
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <main className="page product-page">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Regresar
        </button>

        <div className="empty-state">
          <h2>Producto no encontrado</h2>
        </div>
      </main>
    );
  }

  const favorite = favoriteIds.includes(product.id);

  return (
    <main className="page product-page">
      <button
        className="back-button"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Regresar
      </button>

      <div className="product-detail">
        <div>
          <img
            className="detail-image"
            src={product.image}
            alt={product.name}
          />
        </div>

        <div>
          <div className="detail-category">{product.category}</div>

          <h1 className="detail-title">{product.name}</h1>

          <div className="rating">
            ★ {product.rating}{" "}
            <span>({product.reviews} reseñas)</span>
          </div>

          <div className="price-row" style={{ margin: "18px 0" }}>
            <span className="price" style={{ fontSize: 30 }}>
              {formatPrice(product.price)}
            </span>

            {product.oldPrice && (
              <span className="old-price" style={{ fontSize: 14 }}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          {product.specifications?.length > 0 && (
            <>
              <h3 style={{ marginTop: 25 }}>Características</h3>

              <ul className="specifications">
                {product.specifications.map((specification) => (
                  <li key={specification}>{specification}</li>
                ))}
              </ul>
            </>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 22,
              flexWrap: "wrap",
            }}
          >
            <button
              className="primary-button"
              type="button"
              onClick={() => onBuy(product)}
            >
              Comprar ahora
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() => onAdd(product)}
            >
              Agregar al carrito
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() => onFavorite(product.id)}
            >
              {favorite ? "♥ Guardado" : "♡ Favorito"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
