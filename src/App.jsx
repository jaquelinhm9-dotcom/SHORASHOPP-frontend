import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

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

function App() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState(() => loadStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState(() =>
    loadStorage(FAVORITES_KEY, [])
  );

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todos" ||
        product.category === activeCategory;

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

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingCost =
    checkout.delivery === "express" && cart.length > 0 ? 99 : 0;

  const cartTotal = cartSubtotal + shippingCost;

  const addToCart = (product, openCart = true) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

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

    if (openCart) {
      setShowCart(true);
    }
  };

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
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
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];
    });
  };

  const startCheckout = (product = null) => {
    if (product) {
      addToCart(product, false);
    }

    if (cart.length === 0 && !product) {
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
      const message = error?.message || "";

      if (
        message
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
        setAuthMessage("Correo o contraseña incorrectos.");
      } else if (
        message.toLowerCase().includes("email not confirmed")
      ) {
        setAuthMessage(
          "Primero confirma tu correo electrónico."
        );
      } else {
        setAuthMessage(
          message || "No fue posible completar la operación."
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
        alert("Completa todos los datos de entrega.");
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
          background: #fff;
          color: #202020;
          font-family: Arial, Helvetica, sans-serif;
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

        /* =========================
           BARRA SUPERIOR
        ========================= */

        .top-header {
          position: sticky;
          top: 0;
          z-index: 80;
          background: rgba(255,255,255,.98);
          border-bottom: 1px solid #ededed;
          backdrop-filter: blur(12px);
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

        .brand {
          flex: 0 0 auto;
          text-decoration: none;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .menu-button {
          flex: 0 0 auto;
          width: 39px;
          height: 39px;
          border: 0;
          border-radius: 11px;
          color: white;
          background: linear-gradient(
            135deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          font-size: 20px;
          display: grid;
          place-items: center;
        }

        .search-box {
          flex: 1;
          height: 39px;
          min-width: 0;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          border: 1px solid #ddd;
          border-radius: 22px;
          overflow: hidden;
          background: #fff;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          padding: 0 14px;
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
          flex: 0 0 auto;
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
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .category-bar {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding: 0 0 8px;
          display: flex;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-bar::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          flex: 0 0 auto;
          border: 1px solid #e4e4e4;
          background: #fff;
          color: #444;
          border-radius: 18px;
          padding: 6px 12px;
          font-size: 11px;
          white-space: nowrap;
        }

        .category-pill.active,
        .category-pill:hover {
          color: white;
          border-color: transparent;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
        }

        /* =========================
           CONTENIDO CENTRAL
        ========================= */

        .page-content {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
        }

        .hero {
          margin: 14px 0;
          min-height: 185px;
          border-radius: 21px;
          padding: 28px 30px;
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
          overflow: hidden;
        }

        .hero h1 {
          margin: 0 0 8px;
          font-size: clamp(29px, 4vw, 45px);
          line-height: 1;
        }

        .hero p {
          margin: 0 0 15px;
          font-size: 13px;
          opacity: .96;
        }

        .hero-button {
          border: 0;
          border-radius: 20px;
          padding: 10px 18px;
          background: white;
          color: #b41bc1;
          font-size: 12px;
          font-weight: 800;
        }

        .hero-icon {
          font-size: 75px;
          margin-right: 25px;
        }

        /* =========================
           TARJETAS SUPERIORES
        ========================= */

        .top-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 12px 0 22px;
        }

        .top-card {
          height: 94px;
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid #eee;
          background: #f5f5f5;
          text-align: left;
          padding: 0;
        }

        .top-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .top-card-overlay {
          position: absolute;
          inset: 0;
          padding: 13px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: linear-gradient(
            transparent 15%,
            rgba(0,0,0,.65)
          );
          color: white;
        }

        .top-card-title {
          font-weight: 900;
          font-size: 14px;
        }

        .top-card-subtitle {
          font-size: 10px;
          margin-top: 2px;
        }

        /* =========================
           CATEGORÍAS
        ========================= */

        .section {
          margin: 20px 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 21px;
        }

        .gradient-text {
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 9px;
        }

        .category-card {
          padding: 0;
          overflow: hidden;
          border: 1px solid #eee;
          border-radius: 14px;
          background: white;
          text-align: center;
          transition: .2s;
        }

        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 22px rgba(0,0,0,.09);
        }

        .category-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }

        .category-name {
          display: block;
          padding: 8px 3px 9px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.15;
        }

        /* =========================
           PROMOCIÓN
        ========================= */

        .promo-card {
          min-height: 70px;
          border: 1px solid #eee;
          border-radius: 15px;
          padding: 13px 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          background: #fafafa;
        }

        .promo-card strong {
          display: block;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .promo-card span {
          color: #777;
          font-size: 10px;
        }

        .promo-button,
        .primary-button {
          border: 0;
          border-radius: 20px;
          padding: 10px 16px;
          color: white;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          font-weight: 800;
          font-size: 11px;
          white-space: nowrap;
        }

        /* =========================
           PRODUCTOS
        ========================= */

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #eee;
          border-radius: 15px;
          background: white;
          transition: .2s;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,.08);
        }

        .product-image-wrap {
          position: relative;
          background: #f5f5f5;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }

        .discount {
          position: absolute;
          top: 8px;
          left: 8px;
          border-radius: 7px;
          padding: 4px 6px;
          background: #ef233c;
          color: white;
          font-size: 9px;
          font-weight: 900;
        }

        .favorite {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.94);
          font-size: 16px;
        }

        .product-info {
          padding: 10px;
        }

        .product-name {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .rating {
          margin-bottom: 6px;
          color: #f39c12;
          font-size: 10px;
        }

        .price {
          font-size: 17px;
          font-weight: 900;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .old-price {
          margin-left: 5px;
          color: #999;
          font-size: 10px;
          text-decoration: line-through;
        }

        .product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 9px;
        }

        .product-actions button {
          border: 0;
          border-radius: 8px;
          padding: 8px 4px;
          font-size: 10px;
          font-weight: 800;
        }

        .details-button {
          background: #f2f2f2;
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

        /* =========================
           OVERLAYS
        ========================= */

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,.52);
          display: flex;
        }

        .center-overlay {
          align-items: center;
          justify-content: center;
          padding: 15px;
        }

        /* =========================
           MENÚ HAMBURGUESA
        ========================= */

        .menu-panel {
          width: min(360px, 88vw);
          height: 100%;
          background: white;
          box-shadow: 8px 0 30px rgba(0,0,0,.2);
          padding: 22px 18px;
          overflow-y: auto;
          animation: menuIn .2s ease-out;
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
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .menu-head h2 {
          margin: 0;
          font-size: 24px;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .close-button {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          background: #f1f1f1;
          font-size: 16px;
        }

        .menu-item {
          width: 100%;
          min-height: 48px;
          margin-bottom: 8px;
          border: 0;
          border-radius: 11px;
          background: #f7f7f8;
          text-align: left;
          padding: 0 15px;
          font-size: 13px;
          font-weight: 700;
          color: #333;
        }

        .menu-item:hover {
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9
          );
          color: white;
        }

        /* =========================
           CARRITO — PANEL COMPLETO
        ========================= */

        .cart-panel {
          width: min(520px, 100%);
          height: 100%;
          margin-left: auto;
          background: white;
          box-shadow: -8px 0 30px rgba(0,0,0,.18);
          display: flex;
          flex-direction: column;
          animation: cartIn .2s ease-out;
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
          min-height: 66px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
        }

        .cart-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 18px;
        }

        .cart-item {
          display: flex;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item img {
          width: 74px;
          height: 74px;
          object-fit: cover;
          border-radius: 10px;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-name {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
        }

        .quantity button {
          width: 27px;
          height: 27px;
          border: 0;
          border-radius: 7px;
          background: #eee;
        }

        .delete-button {
          margin-left: auto;
        }

        .cart-footer {
          border-top: 1px solid #eee;
          padding: 15px 18px 18px;
          background: white;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
          font-size: 12px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: 9px;
          margin-top: 8px;
          border-top: 1px solid #eee;
          font-size: 19px;
          font-weight: 900;
        }

        .checkout-button {
          width: 100%;
          margin-top: 13px;
          border: 0;
          border-radius: 12px;
          padding: 13px;
          color: white;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          font-weight: 900;
        }

        /* =========================
           MODALES
        ========================= */

        .modal {
          width: min(540px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          position: relative;
          padding: 22px;
          border-radius: 20px;
          background: white;
        }

        .modal h2 {
          margin: 0 0 17px;
          font-size: 22px;
        }

        .form {
          display: grid;
          gap: 10px;
        }

        .form input,
        .form textarea,
        .form select {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 11px;
          outline: 0;
          font-size: 13px;
        }

        .form textarea {
          min-height: 85px;
          resize: vertical;
        }

        .message {
          padding: 10px;
          border-radius: 9px;
          background: #fff0f4;
          color: #b21b43;
          font-size: 12px;
        }

        .auth-switch {
          border: 0;
          background: transparent;
          color: #b21bc3;
          font-size: 12px;
          font-weight: 800;
        }

        .detail-image {
          width: 100%;
          max-height: 430px;
          object-fit: cover;
          border-radius: 14px;
        }

        .detail-price {
          margin: 10px 0;
          font-size: 25px;
          font-weight: 900;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .specifications {
          padding-left: 20px;
          line-height: 1.8;
          font-size: 13px;
        }

        /* =========================
           CHECKOUT
        ========================= */

        .checkout-overlay {
          align-items: stretch;
          justify-content: center;
          background: #f7f7f9;
          overflow-y: auto;
        }

        .checkout-page {
          width: min(1050px, 100%);
          min-height: 100%;
          background: white;
          padding: 20px;
        }

        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .checkout-title {
          margin: 0;
          font-size: 25px;
          background: linear-gradient(
            90deg,
            #ef233c,
            #d414c9,
            #6d28d9
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .checkout-steps {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 7px;
          margin-bottom: 20px;
        }

        .checkout-step {
          height: 7px;
          border-radius: 10px;
          background: #e9e9e9;
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
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }

        .checkout-card {
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 12px;
        }

        .checkout-card h3 {
          margin: 0 0 13px;
          font-size: 17px;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .checkout-grid .full {
          grid-column: 1 / -1;
        }

        .checkout-input {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 9px;
          padding: 11px;
          outline: 0;
          font-size: 12px;
        }

        .delivery-option,
        .payment-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #ddd;
          border-radius: 11px;
          padding: 12px;
          margin-bottom: 8px;
          text-align: left;
          background: white;
        }

        .delivery-option.selected,
        .payment-option.selected {
          border-color: #d414c9;
          background: #fff7fd;
        }

        .order-summary {
          position: sticky;
          top: 15px;
          height: fit-content;
        }

        .checkout-product {
          display: flex;
          gap: 9px;
          margin-bottom: 10px;
        }

        .checkout-product img {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 8px;
        }

        .checkout-product-info {
          flex: 1;
          font-size: 11px;
        }

        .checkout-actions {
          display: flex;
          gap: 9px;
          margin-top: 15px;
        }

        .secondary-button {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 11px;
          background: white;
          padding: 12px;
          font-weight: 800;
          font-size: 11px;
        }

        .checkout-actions .primary-button {
          flex: 1;
        }

        .success-box {
          max-width: 570px;
          margin: 70px auto;
          text-align: center;
          padding: 30px;
          border-radius: 22px;
          border: 1px solid #eee;
        }

        .success-icon {
          font-size: 65px;
          margin-bottom: 10px;
        }

        .success-box h2 {
          margin: 0 0 8px;
        }

        .success-box p {
          color: #666;
          font-size: 13px;
          line-height: 1.6;
        }

        .empty {
          text-align: center;
          padding: 55px 20px;
          color: #777;
        }

        /* =========================
           RESPONSIVO
        ========================= */

        @media (max-width: 900px) {
          .categories-grid {
            grid-template-columns: repeat(4,1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3,1fr);
          }

          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .order-summary {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .header-main {
            min-height: 52px;
            flex-wrap: wrap;
          }

          .brand {
            font-size: 20px;
          }

          .menu-button,
          .header-action {
            width: 36px;
            height: 36px;
          }

          .search-box {
            order: 5;
            flex-basis: 100%;
            max-width: none;
          }

          .top-header {
            padding-bottom: 4px;
          }

          .hero {
            min-height: 165px;
            padding: 23px 20px;
            margin-top: 10px;
          }

          .hero-icon {
            display: none;
          }

          .top-cards {
            grid-template-columns: repeat(2,1fr);
          }

          .top-card {
            height: 82px;
          }

          .categories-grid {
            grid-template-columns: repeat(4,1fr);
            gap: 7px;
          }

          .category-name {
            font-size: 9px;
          }

          .products-grid {
            grid-template-columns: repeat(2,1fr);
            gap: 9px;
          }

          .promo-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-grid .full {
            grid-column: auto;
          }

          .checkout-page {
            padding: 13px;
          }
        }

        @media (max-width: 390px) {
          .brand {
            font-size: 18px;
          }

          .categories-grid {
            gap: 5px;
          }

          .category-name {
            font-size: 8px;
          }
        }
      `}</style>

      {/* =========================
          BARRA SUPERIOR
      ========================= */}

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
              title="Mi cuenta"
            >
              ✨
            </button>

            <button
              className="header-action"
              onClick={() => setShowCart(true)}
              title="Carrito"
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
        {/* HERO */}

        <section className="hero">
          <div>
            <h1>Todo en un solo lugar</h1>
            <p>
              Compra, vende y descubre productos de diferentes
              categorías.
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
              Comprar ahora
            </button>
          </div>

          <div className="hero-icon">🛍️</div>
        </section>

        {/* TARJETAS SUPERIORES */}

        <section className="top-cards">
          {topCards.map((card) => (
            <button
              className="top-card"
              key={card.title}
              onClick={() => {
                if (card.title === "Ofertas") {
                  setSearch("");
                  setActiveCategory("Todos");
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }

                if (card.title === "Novedades") {
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }

                if (card.title === "Vendedores") {
                  setShowPublish(true);
                }
              }}
            >
              <img src={card.image} alt={card.title} />

              <span className="top-card-overlay">
                <span className="top-card-title">
                  {card.title}
                </span>

                <span className="top-card-subtitle">
                  {card.subtitle}
                </span>
              </span>
            </button>
          ))}
        </section>

        {/* CATEGORÍAS */}

        <section className="section">
          <div className="section-title">
            <h2 className="gradient-text">
              Categorías
            </h2>
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
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <img
                  className="category-image"
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

        {/* REGISTRO */}

        <section className="section">
          <div className="promo-card">
            <div>
              <strong>
                ✨ Regístrate en VaniDaxi
              </strong>

              <span>
                Crea tu cuenta para disfrutar de todas
                las funciones.
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

        {/* PRODUCTOS */}

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
                onClick={() =>
                  setActiveCategory("Todos")
                }
              >
                Ver todos
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty">
              <h3>No encontramos productos</h3>
              <p>
                Prueba con otra búsqueda o categoría.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const favorite = favorites.some(
                  (item) => item.id === product.id
                );

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >
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
                        onClick={() =>
                          toggleFavorite(product)
                        }
                      >
                        {favorite ? "❤️" : "♡"}
                      </button>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">
                        {product.name}
                      </h3>

                      <div className="rating">
                        ★ {product.rating} ·{" "}
                        {product.reviews} reseñas
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
                          onClick={() =>
                            setSelectedProduct(product)
                          }
                        >
                          Ver producto
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

      {/* =========================
          MENÚ HAMBURGUESA
      ========================= */}

      {showMenu && (
        <div
          className="overlay"
          onClick={() => setShowMenu(false)}
        >
          <aside
            className="menu-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-head">
              <h2>VaniDaxi</h2>

              <button
                className="close-button"
                onClick={() => setShowMenu(false)}
              >
                ✕
              </button>
            </div>

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

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setAuthMode("login");
                setShowAuth(true);
              }}
            >
              👤 Perfil
            </button>

            <button
              className="menu-item"
              onClick={() =>
                alert(
                  "La configuración estará disponible aquí."
                )
              }
            >
              ⚙️ Configuración
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowCart(true);
              }}
            >
              📦 Mis pedidos
            </button>

            <button
              className="menu-item"
              onClick={() =>
                alert(
                  "El centro de mensajes estará disponible aquí."
                )
              }
            >
              💬 Mensajes
            </button>

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
              <button
                className="menu-item"
                onClick={logout}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}

      {/* =========================
          CARRITO COMPLETO
      ========================= */}

      {showCart && (
        <div
          className="overlay"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="cart-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <h2>🛒 Mi carrito</h2>

              <button
                className="close-button"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="empty">
                  <div style={{ fontSize: 55 }}>
                    🛒
                  </div>

                  <h3>Tu carrito está vacío</h3>

                  <p>
                    Agrega productos para comenzar tu
                    compra.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="cart-item-info">
                      <div className="cart-item-name">
                        {item.name}
                      </div>

                      <div>
                        {formatPrice(item.price)}
                      </div>

                      <div className="quantity">
                        <button
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
                          className="delete-button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>
                    {formatPrice(cartSubtotal)}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Envío</span>
                  <strong>
                    {shippingCost === 0
                      ? "Gratis"
                      : formatPrice(shippingCost)}
                  </strong>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <button
                  className="checkout-button"
                  onClick={() =>
                    startCheckout()
                  }
                >
                  Continuar al pago
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* =========================
          PRODUCTO
      ========================= */}

      {selectedProduct && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
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
                setSelectedProduct(null)
              }
            >
              ✕
            </button>

            <img
              className="detail-image"
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <h2 style={{ marginTop: 15 }}>
              {selectedProduct.name}
            </h2>

            <div className="rating">
              ★ {selectedProduct.rating} ·{" "}
              {selectedProduct.reviews} reseñas
            </div>

            <div className="detail-price">
              {formatPrice(
                selectedProduct.price
              )}
            </div>

            <p style={{ fontSize: 13 }}>
              {selectedProduct.description}
            </p>

            {selectedProduct.specifications
              ?.length > 0 && (
              <>
                <h3>Características</h3>

                <ul className="specifications">
                  {selectedProduct.specifications.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </>
            )}

            <button
              className="primary-button"
              style={{
                width: "100%",
                marginTop: 10,
              }}
              onClick={() =>
                startCheckout(
                  selectedProduct
                )
              }
            >
              Comprar ahora
            </button>

            <button
              className="secondary-button"
              style={{
                width: "100%",
                marginTop: 8,
              }}
              onClick={() => {
                addToCart(
                  selectedProduct,
                  false
                );
                setSelectedProduct(null);
                setShowCart(true);
              }}
            >
              🛒 Agregar al carrito
            </button>
          </div>
        </div>
      )}

      {/* =========================
          AUTENTICACIÓN
      ========================= */}

      {showAuth && (
        <div
          className="overlay center-overlay"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                right: 15,
                top: 15,
              }}
              onClick={() => setShowAuth(false)}
            >
              ✕
            </button>

            <h2>
              {authMode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </h2>

            <form
              className="form"
              onSubmit={handleAuth}
            >
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre"
                  value={authName}
                  onChange={(e) =>
                    setAuthName(e.target.value)
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={authEmail}
                onChange={(e) =>
                  setAuthEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={authPassword}
                onChange={(e) =>
                  setAuthPassword(
                    e.target.value
                  )
                }
                required
              />

              {authMessage && (
                <div className="message">
                  {authMessage}
                </div>
              )}

              <button
                className="primary-button"
                disabled={loading}
              >
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
                    authMode === "login"
                      ? "register"
                      : "login"
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

      {/* =========================
          PUBLICAR
      ========================= */}

      {showPublish && (
        <div
          className="overlay center-overlay"
          onClick={() =>
            setShowPublish(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
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

            <h2>Publicar producto</h2>

            <form
              className="form"
              onSubmit={handlePublish}
            >
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
                  <option
                    key={category.name}
                    value={category.name}
                  >
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
                value={
                  newProduct.description
                }
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description:
                      e.target.value,
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

      {/* =========================
          CHECKOUT / PAGO
      ========================= */}

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
                  onClick={
                    resetCheckout
                  }
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
                  correctamente. En el siguiente
                  paso se conectará el pago real
                  y el vendedor recibirá la
                  información correspondiente.
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
                  <div
                    className={`checkout-step ${
                      checkoutStep >= 1
                        ? "active"
                        : ""
                    }`}
                  />

                  <div
                    className={`checkout-step ${
                      checkoutStep >= 2
                        ? "active"
                        : ""
                    }`}
                  />

                  <div
                    className={`checkout-step ${
                      checkoutStep >= 3
                        ? "active"
                        : ""
                    }`}
                  />
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
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                name: e.target.value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Teléfono"
                            value={
                              checkout.phone
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                phone: e.target.value,
                              })
                            }
                          />

                          <input
                            className="checkout-input full"
                            placeholder="Calle y número"
                            value={
                              checkout.address
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                address:
                                  e.target.value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Ciudad"
                            value={
                              checkout.city
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                city: e.target.value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Estado"
                            value={
                              checkout.state
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                state: e.target.value,
                              })
                            }
                          />

                          <input
                            className="checkout-input"
                            placeholder="Código postal"
                            value={
                              checkout.zip
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                zip: e.target.value,
                              })
                            }
                          />

                          <textarea
                            className="checkout-input full"
                            placeholder="Notas para el vendedor o repartidor"
                            value={
                              checkout.notes
                            }
                            onChange={(e) =>
                              setCheckout({
                                ...checkout,
                                notes:
                                  e.target.value,
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

                        <button
                          className={`payment-option ${
                            checkout.payment ===
                            "card"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setCheckout({
                              ...checkout,
                              payment: "card",
                            })
                          }
                        >
                          <input
                            type="radio"
                            checked={
                              checkout.payment ===
                              "card"
                            }
                            readOnly
                          />

                          <span>
                            💳 Tarjeta
                            <br />
                            <small>
                              Visa, Mastercard y
                              otras tarjetas
                            </small>
                          </span>
                        </button>

                        <button
                          className={`payment-option ${
                            checkout.payment ===
                            "mercadopago"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setCheckout({
                              ...checkout,
                              payment:
                                "mercadopago",
                            })
                          }
                        >
                          <input
                            type="radio"
                            checked={
                              checkout.payment ===
                              "mercadopago"
                            }
                            readOnly
                          />

                          <span>
                            💙 Mercado Pago
                            <br />
                            <small>
                              Pago mediante
                              Mercado Pago
                            </small>
                          </span>
                        </button>

                        <button
                          className={`payment-option ${
                            checkout.payment ===
                            "cash"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setCheckout({
                              ...checkout,
                              payment: "cash",
                            })
                          }
                        >
                          <input
                            type="radio"
                            checked={
                              checkout.payment ===
                              "cash"
                            }
                            readOnly
                          />

                          <span>
                            💵 Pago disponible
                            según el vendedor
                          </span>
                        </button>
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
                            color: "#666",
                          }}
                        >
                          Revisa que los datos de
                          entrega, productos,
                          envío y método de pago
                          sean correctos antes de
                          confirmar.
                        </p>

                        <div
                          style={{
                            padding: 12,
                            background:
                              "#fafafa",
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
                          Tel.{" "}
                          {checkout.phone}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background:
                              "#fafafa",
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
                            checkoutStep ===
                            1
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

                  <aside className="checkout-card order-summary">
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
                        <span>
                          Envío
                        </span>

                        <strong>
                          {shippingCost ===
                          0
                            ? "Gratis"
                            : formatPrice(
                                shippingCost
                              )}
                        </strong>
                      </div>

                      <div className="summary-total">
                        <span>
                          Total
                        </span>

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
