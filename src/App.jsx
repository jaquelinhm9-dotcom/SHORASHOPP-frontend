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

const categories = [
  {
    name: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Belleza y Salud",
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
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80",
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
    type: "Producto",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
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
    type: "Producto",
    category: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
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
    type: "Producto",
    category: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
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
    type: "Producto",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
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

const formatPrice = (price) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => loadStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState(() =>
    loadStorage(FAVORITES_KEY, [])
  );
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [loading, setLoading] = useState(false);
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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todos" || product.category === activeCategory;

      const searchMatch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product) => {
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
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleFavorite = (product) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === product.id);

      if (exists) {
        return current.filter((item) => item.id !== product.id);
      }

      return [...current, product];
    });
  };

  const buyNow = (product) => {
    addToCart(product);
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthMessage("");

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
          setAuthMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
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
        setAuthMessage("");
      }
    } catch (error) {
      const message = error?.message || "";

      if (message.toLowerCase().includes("invalid login credentials")) {
        setAuthMessage("Correo o contraseña incorrectos.");
      } else if (message.toLowerCase().includes("email not confirmed")) {
        setAuthMessage("Primero confirma tu correo electrónico.");
      } else {
        setAuthMessage(message || "No fue posible completar la operación.");
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
      type: "Producto",
      category: newProduct.category,
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      description:
        newProduct.description || "Producto publicado en VaniDaxi.",
      specifications: [],
    };

    setProducts((current) => [product, ...current]);

    setNewProduct({
      name: "",
      price: "",
      category: "Ropa y Moda",
      image: "",
      description: "",
    });

    setShowPublish(false);
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
          font-family: Arial, Helvetica, sans-serif;
          background: #fff;
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

        .app {
          min-height: 100vh;
          background: #fff;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #eee;
          backdrop-filter: blur(10px);
        }

        .header-main {
          max-width: 1250px;
          margin: auto;
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 10px 20px;
        }

        .brand {
          text-decoration: none;
          font-weight: 900;
          font-size: 27px;
          letter-spacing: -1px;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          color: transparent;
          white-space: nowrap;
        }

        .menu-button {
          width: 45px;
          height: 45px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(135deg,#ef233c,#d414c9,#6d28d9);
          color: white;
          font-size: 23px;
          display: grid;
          place-items: center;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          max-width: 620px;
          margin: auto;
          border: 1px solid #ddd;
          border-radius: 30px;
          overflow: hidden;
          background: #fff;
        }

        .search-box input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 13px 17px;
          min-width: 0;
        }

        .search-box button {
          border: 0;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          color: white;
          width: 52px;
          height: 48px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .header-action {
          border: 0;
          background: #f7f7f7;
          border-radius: 12px;
          min-width: 44px;
          height: 44px;
          font-size: 20px;
        }

        .cart-button {
          position: relative;
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -4px;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          border-radius: 20px;
          background: #ef233c;
          color: #fff;
          font-size: 11px;
          display: grid;
          place-items: center;
          font-weight: bold;
        }

        .category-bar {
          max-width: 1250px;
          margin: auto;
          padding: 0 20px 12px;
          overflow-x: auto;
          display: flex;
          gap: 9px;
        }

        .category-bar::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          border: 1px solid #e5e5e5;
          background: white;
          padding: 8px 15px;
          border-radius: 22px;
          white-space: nowrap;
          font-size: 13px;
          transition: .2s;
        }

        .category-pill.active,
        .category-pill:hover {
          color: white;
          border-color: transparent;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .hero {
          max-width: 1250px;
          margin: 20px auto;
          padding: 45px 35px;
          border-radius: 27px;
          color: white;
          background: linear-gradient(110deg,#ef233c,#d414c9,#6d28d9);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          overflow: hidden;
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: clamp(32px,5vw,57px);
          line-height: 1;
        }

        .hero p {
          margin: 0 0 20px;
          font-size: 17px;
          opacity: .95;
        }

        .hero-button {
          border: 0;
          border-radius: 25px;
          padding: 13px 23px;
          background: white;
          color: #b21bc3;
          font-weight: bold;
        }

        .hero-icon {
          font-size: 100px;
          opacity: .95;
        }

        .section {
          max-width: 1250px;
          margin: 0 auto;
          padding: 15px 20px 35px;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 25px;
        }

        .gradient-text {
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          color: transparent;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8,1fr);
          gap: 12px;
        }

        .category-card {
          border: 1px solid #eee;
          background: white;
          border-radius: 17px;
          padding: 0;
          overflow: hidden;
          transition: transform .2s, box-shadow .2s;
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,.09);
        }

        .category-image {
          width: 100%;
          aspect-ratio: 1/1;
          display: block;
          object-fit: cover;
        }

        .category-name {
          display: block;
          padding: 11px 5px 13px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
        }

        .promo {
          max-width: 1250px;
          margin: 5px auto 20px;
          padding: 0 20px;
        }

        .promo-card {
          border-radius: 19px;
          padding: 20px 25px;
          background: #fafafa;
          border: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .promo-card strong {
          display: block;
          margin-bottom: 5px;
          font-size: 18px;
        }

        .promo-card span {
          font-size: 13px;
          color: #777;
        }

        .promo-button {
          border: 0;
          border-radius: 22px;
          padding: 11px 18px;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          font-weight: bold;
          white-space: nowrap;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 17px;
        }

        .product-card {
          border: 1px solid #eee;
          border-radius: 18px;
          overflow: hidden;
          background: white;
          transition: .2s;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 30px rgba(0,0,0,.09);
        }

        .product-image-wrap {
          position: relative;
          background: #f7f7f7;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          display: block;
        }

        .discount {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ef233c;
          color: white;
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: bold;
        }

        .favorite {
          position: absolute;
          top: 9px;
          right: 9px;
          border: 0;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          font-size: 18px;
        }

        .product-info {
          padding: 13px;
        }

        .product-name {
          margin: 0 0 7px;
          font-size: 15px;
          font-weight: 700;
        }

        .rating {
          font-size: 12px;
          color: #f39c12;
          margin-bottom: 8px;
        }

        .price {
          font-size: 20px;
          font-weight: 900;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          color: transparent;
        }

        .old-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
          margin-left: 7px;
        }

        .product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .product-actions button {
          border: 0;
          border-radius: 10px;
          padding: 10px 6px;
          font-size: 12px;
          font-weight: bold;
        }

        .details-button {
          background: #f3f3f3;
        }

        .add-button {
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .empty {
          text-align: center;
          padding: 50px 20px;
          color: #777;
        }

        .bottom-bar {
          max-width: 1250px;
          margin: 10px auto 0;
          padding: 18px 20px 30px;
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .bottom-button {
          border: 0;
          border-radius: 25px;
          padding: 12px 20px;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          font-weight: bold;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: min(520px,100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 22px;
          padding: 25px;
          position: relative;
        }

        .modal h2 {
          margin-top: 0;
        }

        .close {
          position: absolute;
          right: 15px;
          top: 15px;
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          background: #f2f2f2;
        }

        .menu-panel {
          position: fixed;
          z-index: 90;
          top: 0;
          left: 0;
          width: min(340px,88vw);
          height: 100vh;
          background: white;
          box-shadow: 5px 0 30px rgba(0,0,0,.15);
          padding: 25px 20px;
        }

        .menu-panel h2 {
          margin: 0 0 25px;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          color: transparent;
        }

        .menu-item {
          width: 100%;
          border: 0;
          background: #fafafa;
          margin-bottom: 9px;
          padding: 14px;
          border-radius: 12px;
          text-align: left;
          font-weight: 600;
        }

        .form {
          display: grid;
          gap: 12px;
        }

        .form input,
        .form textarea,
        .form select {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 11px;
          padding: 12px;
          outline: none;
        }

        .form textarea {
          min-height: 90px;
          resize: vertical;
        }

        .primary-button {
          border: 0;
          border-radius: 12px;
          padding: 13px;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          font-weight: bold;
        }

        .auth-switch {
          border: 0;
          background: none;
          color: #b51ac4;
          font-weight: bold;
          padding: 8px;
        }

        .message {
          background: #fff4f7;
          color: #b21b43;
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 10px;
        }

        .cart-item-info {
          flex: 1;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 7px;
        }

        .quantity button {
          width: 27px;
          height: 27px;
          border: 0;
          border-radius: 7px;
          background: #eee;
        }

        .cart-total {
          padding-top: 17px;
          font-size: 20px;
          font-weight: 900;
          text-align: right;
        }

        .detail-image {
          width: 100%;
          border-radius: 17px;
          max-height: 500px;
          object-fit: cover;
        }

        .specifications {
          padding-left: 20px;
          line-height: 1.8;
        }

        @media (max-width: 950px) {
          .categories-grid {
            grid-template-columns: repeat(4,1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3,1fr);
          }
        }

        @media (max-width: 700px) {
          .header-main {
            flex-wrap: wrap;
            padding: 9px 12px;
            gap: 8px;
          }

          .brand {
            order: 2;
            font-size: 23px;
          }

          .menu-button {
            order: 1;
          }

          .header-actions {
            order: 3;
            margin-left: auto;
          }

          .search-box {
            order: 4;
            flex-basis: 100%;
            max-width: none;
          }

          .category-bar {
            padding-left: 12px;
            padding-right: 12px;
          }

          .hero {
            margin: 12px;
            padding: 30px 23px;
            border-radius: 20px;
          }

          .hero-icon {
            display: none;
          }

          .section {
            padding-left: 12px;
            padding-right: 12px;
          }

          .categories-grid {
            grid-template-columns: repeat(4,1fr);
            gap: 8px;
          }

          .category-name {
            font-size: 10px;
            padding: 8px 3px 10px;
          }

          .products-grid {
            grid-template-columns: repeat(2,1fr);
            gap: 10px;
          }

          .product-info {
            padding: 10px;
          }

          .product-name {
            font-size: 13px;
          }

          .price {
            font-size: 17px;
          }

          .promo {
            padding: 0 12px;
          }

          .promo-card {
            padding: 17px;
          }
        }

        @media (max-width: 430px) {
          .categories-grid {
            grid-template-columns: repeat(4,1fr);
          }

          .category-name {
            font-size: 9px;
          }

          .products-grid {
            gap: 8px;
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

          <Link to="/" className="brand">
            VaniDaxi
          </Link>

          <div className="search-box">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
            />
            <button>⌕</button>
          </div>

          <div className="header-actions">
            <button
              className="header-action"
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
              }}
              title="Cuenta"
            >
              ✨
            </button>

            <button
              className="header-action cart-button"
              onClick={() => setShowCart(true)}
              title="Carrito"
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        <div className="category-bar">
          <button
            className={`category-pill ${
              activeCategory === "Todos" ? "active" : ""
            }`}
            onClick={() => setActiveCategory("Todos")}
          >
            Todo
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-pill ${
                activeCategory === category.name ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {showMenu && (
        <>
          <div
            className="overlay"
            style={{ background: "rgba(0,0,0,.28)" }}
            onClick={() => setShowMenu(false)}
          />

          <aside className="menu-panel">
            <button className="close" onClick={() => setShowMenu(false)}>
              ✕
            </button>

            <h2>VaniDaxi</h2>

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setAuthMode("login");
                setShowAuth(true);
              }}
            >
              ✨ Mi cuenta
            </button>

            <button className="menu-item">👤 Perfil</button>
            <button className="menu-item">⚙️ Configuración</button>
            <button className="menu-item">📦 Mis pedidos</button>
            <button className="menu-item">💬 Mensajes</button>

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowPublish(true);
              }}
            >
              ➕ Publicar producto
            </button>

            {user && (
              <button className="menu-item" onClick={logout}>
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </>
      )}

      <main>
        <section className="hero">
          <div>
            <h1>Todo en un solo lugar</h1>
            <p>
              Compra, vende y descubre productos de diferentes categorías.
            </p>
            <button
              className="hero-button"
              onClick={() =>
                document
                  .getElementById("productos")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Comprar ahora
            </button>
          </div>

          <div className="hero-icon">🛍️</div>
        </section>

        <section className="section">
          <div className="section-title">
            <h2 className="gradient-text">Categorías</h2>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className="category-card"
                onClick={() => {
                  setActiveCategory(category.name);
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img
                  className="category-image"
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />

                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="promo">
          <div className="promo-card">
            <div>
              <strong>✨ Regístrate en VaniDaxi</strong>
              <span>
                Crea tu cuenta para disfrutar de todas las funciones de la
                tienda.
              </span>
            </div>

            <button
              className="promo-button"
              onClick={() => {
                setAuthMode("register");
                setShowAuth(true);
              }}
            >
              Registrarme
            </button>
          </div>
        </section>

        <section className="section" id="productos">
          <div className="section-title">
            <h2 className="gradient-text">
              {activeCategory === "Todos"
                ? "Productos destacados"
                : activeCategory}
            </h2>

            {activeCategory !== "Todos" && (
              <button
                className="category-pill"
                onClick={() => setActiveCategory("Todos")}
              >
                Ver todos
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty">
              <h3>No encontramos productos</h3>
              <p>Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const isFavorite = favorites.some(
                  (item) => item.id === product.id
                );

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <img
                        className="product-image"
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
                        onClick={() => toggleFavorite(product)}
                        aria-label="Favorito"
                      >
                        {isFavorite ? "❤️" : "♡"}
                      </button>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>

                      <div className="rating">
                        ★ {product.rating} · {product.reviews} reseñas
                      </div>

                      <div>
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
                          className="details-button"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Ver producto
                        </button>

                        <button
                          className="add-button"
                          onClick={() => addToCart(product)}
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

        <div className="bottom-bar">
          <button
            className="bottom-button"
            onClick={() => setShowPublish(true)}
          >
            ➕ Vender en VaniDaxi
          </button>

          <button
            className="bottom-button"
            onClick={() => setShowCart(true)}
          >
            🛒 Mi carrito
          </button>
        </div>
      </main>

      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <img
              className="detail-image"
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <h2>{selectedProduct.name}</h2>

            <div className="rating">
              ★ {selectedProduct.rating} · {selectedProduct.reviews} reseñas
            </div>

            <div className="price">
              {formatPrice(selectedProduct.price)}
            </div>

            <p>{selectedProduct.description}</p>

            {selectedProduct.specifications?.length > 0 && (
              <>
                <h3>Características</h3>
                <ul className="specifications">
                  {selectedProduct.specifications.map((specification) => (
                    <li key={specification}>{specification}</li>
                  ))}
                </ul>
              </>
            )}

            <button
              className="primary-button"
              onClick={() => {
                buyNow(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAuth(false)}>
              ✕
            </button>

            <h2>
              {authMode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta en VaniDaxi"}
            </h2>

            <form className="form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />

              {authMessage && (
                <div className="message">{authMessage}</div>
              )}

              <button className="primary-button" disabled={loading}>
                {loading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Entrar"
                  : "Crear cuenta"}
              </button>

              <button
                type="button"
                className="auth-switch"
                onClick={() => {
                  setAuthMode(
                    authMode === "login" ? "register" : "login"
                  );
                  setAuthMessage("");
                }}
              >
                {authMode === "login"
                  ? "¿No tienes cuenta? Crear una"
                  : "¿Ya tienes cuenta? Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPublish && (
        <div className="overlay" onClick={() => setShowPublish(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowPublish(false)}>
              ✕
            </button>

            <h2>Publicar producto</h2>

            <form className="form" onSubmit={handlePublish}>
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Precio"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
                required
              />

              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="url"
                placeholder="URL de la imagen"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    image: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Descripción"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
              />

              <button className="primary-button">
                Publicar producto
              </button>
            </form>
          </div>
        </div>
      )}

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowCart(false)}>
              ✕
            </button>

            <h2>🛒 Mi carrito</h2>

            {cart.length === 0 ? (
              <div className="empty">
                <p>Tu carrito está vacío.</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cart-item-info">
                      <strong>{item.name}</strong>
                      <div>{formatPrice(item.price)}</div>

                      <div className="quantity">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            marginLeft: "auto",
                            background: "#ffe8ed",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="cart-total">
                  Total:{" "}
                  {formatPrice(
                    cart.reduce(
                      (total, item) =>
                        total + item.price * item.quantity,
                      0
                    )
                  )}
                </div>

                <button
                  className="primary-button"
                  style={{ marginTop: 15, width: "100%" }}
                  onClick={() =>
                    alert(
                      "El proceso de compra se conectará con el sistema de pagos."
                    )
                  }
                >
                  Continuar con la compra
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
