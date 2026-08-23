import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

/* =========================================================
   DATOS
========================================================= */

const categories = [
  ["👕", "Ropa y Moda"],
  ["📱", "Tecnología"],
  ["🏠", "Hogar y Vida"],
  ["💄", "Belleza y Salud"],
  ["🎧", "Accesorios"],
  ["🎮", "Juguetes y Más"],
  ["🚗", "Autos y Motos"],
  ["🍔", "Comida local"],
  ["🐶", "Mascotas"],
  ["⚽", "Deportes"],
];

const demoProducts = [
  {
    id: "demo-earbuds",
    name: "Audífonos Inalámbricos",
    price: 399,
    compare_at_price: 499,
    rating: "4.8",
    reviews: "120 ventas",
    discount: "-20%",
    category: "Tecnología",
    description:
      "Audífonos inalámbricos compactos con estuche de carga y conexión Bluetooth.",
    stock: 12,
    sku: "DEMO-EARBUDS",
    image_url: "",
    images: [],
    sellerName: "Tech Market",
    sellerRating: "4.9",
    shipping: "Envío gratis a partir de $499 MXN",
    delivery: "2 a 5 días",
    variants: ["Negro", "Blanco"],
    specifications: [
      ["Conectividad", "Bluetooth"],
      ["Autonomía", "Hasta 6 horas"],
      ["Estuche", "USB-C"],
      ["Garantía", "30 días"],
    ],
  },
  {
    id: "demo-bag",
    name: "Bolsa de Hombro Elegante",
    price: 599,
    compare_at_price: 799,
    rating: "4.9",
    reviews: "85 ventas",
    discount: "-25%",
    category: "Ropa y Moda",
    description:
      "Bolsa de hombro elegante para uso diario con compartimentos interiores.",
    stock: 8,
    sku: "DEMO-BAG",
    image_url: "",
    images: [],
    sellerName: "Tienda SHORA",
    sellerRating: "4.8",
    shipping: "Envío calculado al finalizar",
    delivery: "3 a 6 días",
    variants: ["Negro", "Rosa", "Beige"],
    specifications: [
      ["Material", "Sintético premium"],
      ["Cierre", "Cremallera"],
      ["Compartimentos", "3"],
      ["Uso", "Hombro"],
    ],
  },
  {
    id: "demo-watch",
    name: "Smartwatch Series 9",
    price: 1699,
    compare_at_price: 1999,
    rating: "4.7",
    reviews: "64 ventas",
    discount: "-15%",
    category: "Tecnología",
    description:
      "Smartwatch con pantalla táctil, notificaciones y seguimiento de actividad.",
    stock: 5,
    sku: "DEMO-WATCH",
    image_url: "",
    images: [],
    sellerName: "Tech Market",
    sellerRating: "4.9",
    shipping: "Envío gratis",
    delivery: "2 a 4 días",
    variants: ["Negro", "Azul"],
    specifications: [
      ["Pantalla", "Táctil"],
      ["Conectividad", "Bluetooth"],
      ["Funciones", "Actividad y notificaciones"],
      ["Carga", "Magnética"],
    ],
  },
  {
    id: "demo-blender",
    name: "Licuadora Profesional",
    price: 899,
    compare_at_price: null,
    rating: "4.6",
    reviews: "45 ventas",
    discount: "Nuevo",
    category: "Hogar y Vida",
    description:
      "Licuadora de alta potencia para preparar bebidas, salsas y alimentos.",
    stock: 7,
    sku: "DEMO-BLENDER",
    image_url: "",
    images: [],
    sellerName: "Casa Moderna",
    sellerRating: "4.7",
    shipping: "Envío calculado al finalizar",
    delivery: "3 a 7 días",
    variants: ["Negro"],
    specifications: [
      ["Potencia", "1000 W"],
      ["Vaso", "1.5 L"],
      ["Velocidades", "Variable"],
      ["Material", "Acero y plástico"],
    ],
  },
];

const demoReviews = [
  {
    name: "María",
    stars: 5,
    text: "Llegó rápido y tal como se describe.",
  },
  {
    name: "Carlos",
    stars: 4,
    text: "Buen producto, volvería a comprar.",
  },
  {
    name: "Ana",
    stars: 5,
    text: "Excelente atención del vendedor.",
  },
];

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || `product-${Date.now()}`,
  price: Number(product.price || 0),
  compare_at_price:
    product.compare_at_price === null ||
    product.compare_at_price === ""
      ? null
      : Number(product.compare_at_price),
  stock: Number(product.stock ?? 0),
  images: Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(product.images);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [],
  category:
    product.category ||
    product.category_name ||
    "Otros",
  description:
    product.description ||
    "Producto publicado en SHORASHOPP.",
  sellerName:
    product.sellerName ||
    product.seller_name ||
    "Vendedor SHORASHOPP",
  sellerRating:
    product.sellerRating ||
    product.seller_rating ||
    "4.8",
  shipping:
    product.shipping ||
    "Envío calculado al finalizar",
  delivery:
    product.delivery ||
    "Consulta la fecha disponible al comprar",
  reviews:
    product.reviews ||
    "Producto publicado",
  variants: Array.isArray(product.variants)
    ? product.variants
    : [],
});

const slugify = (text) =>
  String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* =========================================================
   APP
========================================================= */

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [toast, setToast] = useState("");

  const [products, setProducts] =
    useState(demoProducts);
  const [productsLoading, setProductsLoading] =
    useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [favorites, setFavorites] =
    useState([]);

  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] =
    useState([]);

  const [selectedVariant, setSelectedVariant] =
    useState("");

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] =
    useState([]);

  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] =
    useState("");

  const [orders, setOrders] = useState([
    {
      id: "SH-00001234",
      date: new Date().toLocaleDateString("es-MX"),
      total: 998,
      status: "En tránsito",
      items: [
        {
          ...demoProducts[0],
          quantity: 1,
        },
        {
          ...demoProducts[1],
          quantity: 1,
        },
      ],
    },
  ]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [sellerStore, setSellerStore] =
    useState(null);
  const [sellerLoading, setSellerLoading] =
    useState(false);
  const [publishLoading, setPublishLoading] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      reference: "",
    });

  const [paymentForm, setPaymentForm] =
    useState({
      card: "",
      name: "",
      expiration: "",
      cvv: "",
    });

  const [productForm, setProductForm] =
    useState({
      name: "",
      description: "",
      price: "",
      compare_at_price: "",
      stock: "1",
      sku: "",
      category: "Tecnología",
      image_url: "",
      images: "",
    });

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data } =
          await supabase.auth.getSession();

        if (mounted) {
          setSession(data?.session || null);
        }
      } catch {
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          setSession(currentSession);
          setAuthReady(true);
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     PRODUCTS
  ======================================================= */

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadSellerStore(session.user.id);
    } else {
      setSellerStore(null);
    }
  }, [session?.user?.id]);

  const loadProducts = async () => {
    setProductsLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (
        !error &&
        Array.isArray(data) &&
        data.length
      ) {
        setProducts(
          data.map(normalizeProduct),
        );
      } else {
        setProducts(
          demoProducts.map(normalizeProduct),
        );
      }
    } catch {
      setProducts(
        demoProducts.map(normalizeProduct),
      );
    } finally {
      setProductsLoading(false);
    }
  };

  const loadSellerStore = async (userId) => {
    setSellerLoading(true);

    try {
      const { data, error } =
        await supabase
          .from("seller_stores")
          .select("*")
          .eq("owner_id", userId)
          .limit(1)
          .maybeSingle();

      setSellerStore(!error ? data : null);
    } catch {
      setSellerStore(null);
    } finally {
      setSellerLoading(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openPage = (nextPage) => {
    setPage(nextPage);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setPage("home");
    setSelectedProduct(null);
    setSelectedCategory("");
    setSearchTerm("");
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const notify = (text) => {
    setToast(text);

    window.clearTimeout(
      window.__shorashoppToastTimer,
    );

    window.__shorashoppToastTimer =
      window.setTimeout(() => {
        setToast("");
      }, 2600);
  };

  /* =======================================================
     AUTH FUNCTIONS
  ======================================================= */

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
              },
            },
          });

        if (error) {
          throw error;
        }

        if (data?.session) {
          closeAuth();
        } else {
          setMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta.",
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email: email.trim(),
              password,
            },
          );

        if (error) {
          throw error;
        }

        closeAuth();
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "No se pudo completar la operación.",
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    goHome();
  };

  const openAccount = () => {
    if (session) {
      openPage("account");
    } else {
      openAuth("login");
    }
  };

  /* =======================================================
     PRODUCTS / CART
  ======================================================= */

  const openProduct = (item) => {
    const normalized =
      normalizeProduct(item);

    setSelectedProduct(normalized);
    setSelectedVariant(
      normalized.variants?.[0] || "",
    );
    setQuestions([]);
    setQuestionText("");

    openPage("product");
  };

  const productImage = (item) =>
    item?.image_url ||
    item?.images?.[0] ||
    "";

  const addToCart = (
    item,
    quantity = 1,
    variant = selectedVariant,
  ) => {
    const qty = Math.max(
      1,
      Math.min(
        Number(quantity) || 1,
        item.stock || 999,
      ),
    );

    const cartKey = `${item.id}-${
      variant || "default"
    }`;

    setCart((current) => {
      const existing = current.find(
        (x) => x.cartKey === cartKey,
      );

      if (existing) {
        return current.map((x) =>
          x.cartKey === cartKey
            ? {
                ...x,
                quantity: Math.min(
                  x.quantity + qty,
                  item.stock ||
                    x.quantity + qty,
                ),
              }
            : x,
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: qty,
          variant: variant || "",
          cartKey,
        },
      ];
    });

    notify("Producto agregado al carrito.");
  };

  const removeFromCart = (cartKey) => {
    setCart((current) =>
      current.filter(
        (item) => item.cartKey !== cartKey,
      ),
    );
  };

  const changeQuantity = (
    cartKey,
    quantity,
  ) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                item.stock || quantity,
              ),
            }
          : item,
      ),
    );
  };

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0,
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0,
  );

  const checkoutTotal = checkoutItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0,
  );

  const buyNow = (item) => {
    setCheckoutItems([
      {
        ...item,
        quantity: 1,
        variant:
          selectedVariant ||
          item.variants?.[0] ||
          "",
      },
    ]);

    openPage("checkout");
  };

  const checkoutCart = () => {
    if (!cart.length) {
      notify("Tu carrito está vacío.");
      return;
    }

    setCheckoutItems(cart);
    openPage("checkout");
  };

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  /* =======================================================
     SEARCH / CATEGORY
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return products.filter((item) => {
      const categoryMatches =
        !selectedCategory ||
        item.category === selectedCategory;

      const searchMatches =
        !query ||
        item.name
          .toLowerCase()
          .includes(query) ||
        item.description
          .toLowerCase()
          .includes(query) ||
        item.category
          .toLowerCase()
          .includes(query) ||
        String(item.sellerName || "")
          .toLowerCase()
          .includes(query);

      return (
        categoryMatches &&
        searchMatches
      );
    });
  }, [
    products,
    selectedCategory,
    searchTerm,
  ]);

  const favoriteProducts = products.filter(
    (item) =>
      favorites.includes(item.id),
  );

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    openPage("home");

    window.setTimeout(() => {
      document
        .querySelector(".products-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 80);
  };

  const handleSearch = () => {
    openPage("home");

    window.setTimeout(() => {
      document
        .querySelector(".products-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 80);
  };

  /* =======================================================
     ADDRESS / PAYMENTS
  ======================================================= */

  const saveAddress = (event) => {
    event.preventDefault();

    if (
      !addressForm.name ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.postalCode
    ) {
      notify(
        "Completa los campos principales.",
      );
      return;
    }

    setAddresses((current) => [
      ...current,
      {
        ...addressForm,
        id: Date.now(),
      },
    ]);

    setAddressForm({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      reference: "",
    });

    notify("Dirección guardada.");
  };

  const savePayment = (event) => {
    event.preventDefault();

    setPaymentMethods((current) => [
      ...current,
      {
        id: Date.now(),
        label:
          "Tarjeta terminación " +
          (
            paymentForm.card.replace(
              /\D/g,
              "",
            ) || "4242"
          ).slice(-4),
        detail:
          "Método de pago guardado",
      },
    ]);

    setPaymentForm({
      card: "",
      name: "",
      expiration: "",
      cvv: "",
    });

    notify("Método de pago agregado.");
  };

  /* =======================================================
     ORDERS
  ======================================================= */

  const placeOrder = () => {
    if (!checkoutItems.length) {
      notify("No hay productos para comprar.");
      return;
    }

    const order = {
      id: `SH-${Date.now()
        .toString()
        .slice(-8)}`,
      date:
        new Date().toLocaleDateString(
          "es-MX",
        ),
      total: checkoutTotal,
      status: "Confirmado",
      items: checkoutItems,
    };

    setOrders((current) => [
      order,
      ...current,
    ]);

    setSelectedOrder(order);
    setCart([]);
    setCheckoutItems([]);

    openPage("confirmation");
  };

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const addQuestion = (event) => {
    event.preventDefault();

    if (!questionText.trim()) {
      return;
    }

    setQuestions((current) => [
      ...current,
      {
        id: Date.now(),
        text: questionText.trim(),
        answer:
          "El vendedor responderá pronto.",
      },
    ]);

    setQuestionText("");
    notify("Pregunta enviada.");
  };

  /* =======================================================
     SELL
  ======================================================= */

  const publishProduct = async (event) => {
    event.preventDefault();

    if (!session) {
      openAuth("login");
      return;
    }

    if (!sellerStore?.id) {
      notify(
        "Primero necesitas una tienda de vendedor vinculada.",
      );
      return;
    }

    const price = Number(
      productForm.price,
    );
    const stock = Number(
      productForm.stock,
    );

    if (
      !productForm.name.trim() ||
      price <= 0 ||
      stock < 0
    ) {
      notify(
        "Completa nombre, precio y stock.",
      );
      return;
    }

    setPublishLoading(true);

    try {
      const imageList =
        productForm.images
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean);

      const payload = {
        seller_id: sellerStore.id,
        name: productForm.name.trim(),
        slug: `${slugify(
          productForm.name,
        )}-${Date.now()}`,
        description:
          productForm.description.trim(),
        price,
        compare_at_price:
          productForm.compare_at_price
            ? Number(
                productForm.compare_at_price,
              )
            : null,
        stock,
        sku:
          productForm.sku.trim() ||
          null,
        image_url:
          productForm.image_url.trim() ||
          null,
        images: imageList,
        category: productForm.category,
        status: "pending",
      };

      let result = await supabase
        .from("products")
        .insert(payload);

      if (result.error) {
        const fallback = {
          ...payload,
        };

        delete fallback.category;

        result = await supabase
          .from("products")
          .insert(fallback);
      }

      if (result.error) {
        throw result.error;
      }

      setProductForm({
        name: "",
        description: "",
        price: "",
        compare_at_price: "",
        stock: "1",
        sku: "",
        category: "Tecnología",
        image_url: "",
        images: "",
      });

      notify(
        "Producto enviado para aprobación.",
      );

      await loadProducts();
    } catch (error) {
      notify(
        error?.message ||
          "No se pudo publicar el producto.",
      );
    } finally {
      setPublishLoading(false);
    }
  };

  /* =======================================================
     STYLES
  ======================================================= */

  const primaryButton = {
    border: 0,
    borderRadius: 14,
    padding: "14px 18px",
    background:
      "linear-gradient(135deg,#ed174d,#7020d0)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  };

  const secondaryButton = {
    border:
      "1px solid #7020d0",
    borderRadius: 14,
    padding: "14px 18px",
    background: "#fff",
    color: "#7020d0",
    fontWeight: 800,
    cursor: "pointer",
  };

  const cardStyle = {
    background: "#fff",
    border:
      "1px solid #ece7f3",
    borderRadius: 18,
    padding: 18,
    boxShadow:
      "0 5px 18px rgba(50,16,74,.05)",
  };

  const menuStyle = {
    width: "100%",
    border: 0,
    borderRadius: 13,
    background: "#fff",
    color: "#24152f",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "left",
    padding: "14px 12px",
    cursor: "pointer",
  };

  const cardButtonStyle = {
    ...menuStyle,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    border:
      "1px solid #ece7f3",
    boxShadow:
      "0 5px 18px rgba(50,16,74,.05)",
  };

  /* =======================================================
     SIMPLE PAGE
  ======================================================= */

  const SimplePage = ({
    title,
    icon,
    text,
    back = "home",
    buttons = [],
  }) => (
    <PageShell
      title={title}
      onBack={() => openPage(back)}
    >
      <div style={cardStyle}>
        <div
          style={{ fontSize: 54 }}
        >
          {icon}
        </div>

        <h2>{title}</h2>

        <p
          style={{
            color: "#666",
            lineHeight: 1.7,
          }}
        >
          {text}
        </p>
      </div>

      {buttons.length > 0 && (
        <div
          className="stack-list"
          style={{ marginTop: 12 }}
        >
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              style={cardButtonStyle}
              onClick={button.onClick}
            >
              <span>
                {button.icon}{" "}
                {button.label}
              </span>

              <span>›</span>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (!authReady) {
    return (
      <div className="loading-screen">
        <strong>SHORASHOPP</strong>
        <p>Cargando tu cuenta...</p>
      </div>
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="app">
      {/* HEADER */}
      <header className="mobile-header">
        <button
          className="menu-button"
          type="button"
          onClick={() =>
            setMenuOpen(true)
          }
        >
          ☰
        </button>

        <button
          className="logo"
          type="button"
          onClick={goHome}
        >
          <strong>
            SHORA<span>SHOPP</span>
          </strong>

          <small>
            Compra. <b>Vende.</b> Descubre.
          </small>
        </button>

        <div className="header-icons">
          <button
            className="notification-button"
            type="button"
            onClick={() =>
              openPage(
                "notifications",
              )
            }
          >
            🔔<i>3</i>
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={() =>
              openPage("cart")
            }
          >
            🛒<i>{cartCount}</i>
          </button>
        </div>
      </header>

      {/* SEARCH */}
      <div className="search-container">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            type="button"
            onClick={handleSearch}
          >
            ⌕
          </button>
        </div>
      </div>

      {/* HOME */}
      {page === "home" && (
        <main className="home-main">
          <section className="quick-cards">
            <button
              className="quick-card sell-card"
              type="button"
              onClick={() =>
                session
                  ? openPage("sell")
                  : openAuth(
                      "register",
                    )
              }
            >
              <div className="quick-icon">
                ▣
              </div>

              <div className="quick-content">
                <strong>
                  Vende en
                  <br />
                  SHORASHOPP
                </strong>

                <span>
                  Publica tus productos y
                  comienza a vender.
                </span>
              </div>

              <b className="round-arrow">
                ›
              </b>
            </button>

            <button
              className="quick-card account-card"
              type="button"
              onClick={openAccount}
            >
              <div className="quick-icon">
                ✨
              </div>

              <div className="quick-content">
                <strong>
                  Mi cuenta
                </strong>

                <span>
                  {session
                    ? "Sesión iniciada"
                    : "Inicia sesión"}
                </span>

                <small>
                  Perfil, pedidos y
                  configuraciones
                </small>
              </div>

              <b className="round-arrow">
                ›
              </b>
            </button>
          </section>

          <section className="content-section">
            <div className="section-title-row">
              <h2>Categorías</h2>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "categories",
                  )
                }
              >
                Ver todas <span>›</span>
              </button>
            </div>

            <div className="categories-scroll">
              {categories
                .slice(0, 6)
                .map(
                  ([icon, title]) => (
                    <button
                      key={title}
                      className="category-item"
                      type="button"
                      onClick={() =>
                        selectCategory(
                          title,
                        )
                      }
                    >
                      <div className="category-icon">
                        {icon}
                      </div>

                      <span>
                        {title}
                      </span>
                    </button>
                  ),
                )}
            </div>
          </section>

          <section className="offer-section">
            <div className="offer-banner">
              <div className="offer-text">
                <strong>
                  OFERTAS
                  <br />
                  EXCLUSIVAS
                </strong>

                <span>
                  Descuentos increíbles
                  <br />
                  por tiempo limitado
                </span>

                <button
                  type="button"
                  onClick={() =>
                    openPage("offers")
                  }
                >
                  Ver ofertas <b>›</b>
                </button>
              </div>

              <div className="offer-products">
                <div>🛍️</div>
                <div>⌚</div>
                <div>👟</div>
                <div>%</div>
              </div>
            </div>
          </section>

          <section className="content-section products-section">
            <div className="section-title-row">
              <h2>
                {selectedCategory ||
                  "Productos destacados"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                }}
              >
                Ver todos <span>›</span>
              </button>
            </div>

            {productsLoading ? (
              <div className="empty-inline">
                Cargando productos...
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.length ? (
                  filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        favorite={favorites.includes(
                          product.id,
                        )}
                        onFavorite={
                          toggleFavorite
                        }
                        onClick={
                          openProduct
                        }
                      />
                    ),
                  )
                ) : (
                  <div className="empty-inline">
                    No hay productos con
                    esa búsqueda.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="trust-section">
            <div>
              <span>♢</span>
              <strong>
                Compra segura
              </strong>
              <small>
                Protegemos tus datos y
                compras
              </small>
            </div>

            <div>
              <span>♧</span>
              <strong>
                Envíos rápidos
              </strong>
              <small>
                Recibe tus productos
                rápidamente
              </small>
            </div>

            <div>
              <span>✿</span>
              <strong>
                Vendedores
                verificados
              </strong>
              <small>
                Más confianza para ti
              </small>
            </div>

            <div>
              <span>☏</span>
              <strong>
                Soporte 24/7
              </strong>
              <small>
                Estamos aquí para
                ayudarte
              </small>
            </div>
          </section>
        </main>
      )}

      {/* CATEGORIES */}
      {page === "categories" && (
        <PageShell
          title="Categorías"
          onBack={goHome}
        >
          <div className="category-page-grid">
            {categories.map(
              ([icon, title]) => (
                <button
                  key={title}
                  className="big-category-card"
                  type="button"
                  onClick={() =>
                    selectCategory(
                      title,
                    )
                  }
                >
                  <span className="big-category-icon">
                    {icon}
                  </span>

                  <strong>
                    {title}
                  </strong>

                  <small>
                    Explorar productos
                  </small>
                </button>
              ),
            )}
          </div>
        </PageShell>
      )}

      {/* OFFERS */}
      {page === "offers" && (
        <PageShell
          title="Ofertas"
          onBack={goHome}
        >
          <div className="offer-page-banner">
            <strong>
              OFERTAS EXCLUSIVAS
            </strong>

            <span>
              Descuentos especiales en
              productos seleccionados.
            </span>
          </div>

          <div className="products-grid">
            {products
              .filter(
                (item) =>
                  item.compare_at_price &&
                  item.price <
                    item.compare_at_price,
              )
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(
                    product.id,
                  )}
                  onFavorite={toggleFavorite}
                  onClick={openProduct}
                />
              ))}
          </div>
        </PageShell>
      )}

      {/* PRODUCT */}
      {page === "product" &&
        selectedProduct && (
          <PageShell
            title="Producto"
            onBack={goHome}
          >
            <div className="product-detail-grid">
              <div>
                <div className="product-main-image">
                  <span className="product-label">
                    {selectedProduct.discount ||
                      "Disponible"}
                  </span>

                  {productImage(
                    selectedProduct,
                  ) ? (
                    <img
                      src={productImage(
                        selectedProduct,
                      )}
                      alt={
                        selectedProduct.name
                      }
                    />
                  ) : (
                    <span className="product-placeholder-large">
                      🛍️
                    </span>
                  )}
                </div>

                <div className="thumb-row">
                  {[
                    selectedProduct.image_url,
                    ...(selectedProduct.images ||
                      []),
                  ]
                    .filter(Boolean)
                    .slice(0, 5)
                    .map(
                      (
                        src,
                        index,
                      ) => (
                        <button
                          key={`${src}-${index}`}
                          type="button"
                          className="thumb"
                        >
                          <img
                            src={src}
                            alt=""
                          />
                        </button>
                      ),
                    )}
                </div>
              </div>

              <div className="product-detail-copy">
                <div className="eyebrow">
                  {
                    selectedProduct.category
                  }
                </div>

                <h1>
                  {selectedProduct.name}
                </h1>

                <div className="rating-row big">
                  ★{" "}
                  {selectedProduct.rating ||
                    "Nuevo"}{" "}
                  <small>
                    •{" "}
                    {
                      selectedProduct.reviews
                    }
                  </small>
                </div>

                <div className="detail-price-row">
                  <strong>
                    {money(
                      selectedProduct.price,
                    )}
                  </strong>

                  {selectedProduct.compare_at_price && (
                    <del>
                      {money(
                        selectedProduct.compare_at_price,
                      )}
                    </del>
                  )}
                </div>

                {selectedProduct.compare_at_price && (
                  <div className="saving-pill">
                    Ahorras{" "}
                    {money(
                      selectedProduct.compare_at_price -
                        selectedProduct.price,
                    )}
                  </div>
                )}

                <p className="detail-description">
                  {
                    selectedProduct.description
                  }
                </p>

                {selectedProduct.variants
                  ?.length > 0 && (
                  <div className="variant-block">
                    <strong>
                      Elige una opción
                    </strong>

                    <div className="variant-row">
                      {selectedProduct.variants.map(
                        (option) => (
                          <button
                            key={option}
                            type="button"
                            className={`variant-button ${
                              selectedVariant ===
                              option
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedVariant(
                                option,
                              )
                            }
                          >
                            {option}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="buy-box">
                  <div>
                    <b>
                      Stock disponible:
                    </b>{" "}
                    {
                      selectedProduct.stock
                    }
                  </div>

                  <div>
                    <b>Envío:</b>{" "}
                    {
                      selectedProduct.shipping
                    }
                  </div>

                  <div>
                    <b>Entrega:</b>{" "}
                    {
                      selectedProduct.delivery
                    }
                  </div>

                  <div className="buy-actions">
                    <button
                      type="button"
                      style={
                        secondaryButton
                      }
                      onClick={() =>
                        addToCart(
                          selectedProduct,
                        )
                      }
                    >
                      🛒 Agregar al carrito
                    </button>

                    <button
                      type="button"
                      style={
                        primaryButton
                      }
                      onClick={() =>
                        buyNow(
                          selectedProduct,
                        )
                      }
                    >
                      Comprar ahora
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    ...cardStyle,
                    marginTop: 14,
                  }}
                >
                  <h2>Vendedor</h2>

                  <div className="seller-mini-card">
                    <div className="seller-avatar">
                      {selectedProduct.sellerName?.charAt(
                        0,
                      ) || "S"}
                    </div>

                    <div>
                      <strong>
                        {
                          selectedProduct.sellerName
                        }
                      </strong>

                      <div>
                        ⭐{" "}
                        {
                          selectedProduct.sellerRating
                        }{" "}
                        · Vendedor
                        destacado
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openPage(
                          "seller-store",
                        )
                      }
                    >
                      Ver tienda
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section-grid">
              <div style={cardStyle}>
                <h2>Descripción</h2>

                <p
                  style={{
                    color: "#666",
                    lineHeight: 1.8,
                  }}
                >
                  {
                    selectedProduct.description
                  }
                </p>

                <h2>
                  Características
                </h2>

                <div className="spec-list">
                  {(
                    selectedProduct.specifications ||
                    []
                  ).map(
                    ([label, value]) => (
                      <div key={label}>
                        <strong>
                          {label}
                        </strong>

                        <span>
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <h2>Opiniones</h2>

                {demoReviews.map(
                  (review) => (
                    <div
                      className="review-item"
                      key={review.name}
                    >
                      <strong>
                        {review.name}
                      </strong>

                      <div>
                        {"★".repeat(
                          review.stars,
                        )}
                      </div>

                      <p>
                        {review.text}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                marginTop: 14,
              }}
            >
              <h2>
                Preguntas sobre el
                producto
              </h2>

              <form
                className="inline-form"
                onSubmit={addQuestion}
              >
                <input
                  value={questionText}
                  onChange={(event) =>
                    setQuestionText(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Escribe tu pregunta"
                />

                <button
                  style={primaryButton}
                  type="submit"
                >
                  Preguntar
                </button>
              </form>

              {questions.map(
                (question) => (
                  <div
                    className="question-item"
                    key={question.id}
                  >
                    <strong>
                      Pregunta
                    </strong>

                    <p>
                      {question.text}
                    </p>

                    <small>
                      {question.answer}
                    </small>
                  </div>
                ),
              )}
            </div>

            <div
              style={{
                ...cardStyle,
                marginTop: 14,
              }}
            >
              <h2>
                Productos relacionados
              </h2>

              <div className="products-grid mini-grid">
                {products
                  .filter(
                    (item) =>
                      item.id !==
                        selectedProduct.id &&
                      item.category ===
                        selectedProduct.category,
                  )
                  .slice(0, 4)
                  .map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      favorite={favorites.includes(
                        item.id,
                      )}
                      onFavorite={
                        toggleFavorite
                      }
                      onClick={
                        openProduct
                      }
                    />
                  ))}
              </div>
            </div>
          </PageShell>
        )}

      {/* CART */}
      {page === "cart" && (
        <PageShell
          title="Carrito"
          onBack={goHome}
        >
          {!cart.length ? (
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 58,
                }}
              >
                🛒
              </div>

              <h2>
                Tu carrito está
                vacío
              </h2>

              <p
                style={{
                  color: "#666",
                }}
              >
                Agrega productos para
                comenzar tu compra.
              </p>

              <button
                style={primaryButton}
                type="button"
                onClick={goHome}
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="checkout-layout">
              <div style={cardStyle}>
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.cartKey}
                  >
                    <div className="cart-image">
                      {productImage(
                        item,
                      ) ? (
                        <img
                          src={productImage(
                            item,
                          )}
                          alt={item.name}
                        />
                      ) : (
                        <span>
                          🛍️
                        </span>
                      )}
                    </div>

                    <div className="cart-copy">
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.variant ||
                          item.category}
                      </small>

                      <div>
                        {money(item.price)}
                      </div>

                      <div className="qty-row">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.cartKey,
                              item.quantity -
                                1,
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.cartKey,
                              item.quantity +
                                1,
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            removeFromCart(
                              item.cartKey,
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <h2>Resumen</h2>

                <div className="summary-line">
                  <span>
                    Productos
                  </span>

                  <strong>
                    {money(cartTotal)}
                  </strong>
                </div>

                <div className="summary-line">
                  <span>Envío</span>
                  <span>
                    Se calcula al
                    finalizar
                  </span>
                </div>

                <hr />

                <div className="summary-line total">
                  <span>Total</span>

                  <strong>
                    {money(cartTotal)}
                  </strong>
                </div>

                <button
                  style={primaryButton}
                  type="button"
                  onClick={checkoutCart}
                >
                  Continuar compra
                </button>
              </div>
            </div>
          )}
        </PageShell>
      )}

      {/* CHECKOUT */}
      {page === "checkout" && (
        <PageShell
          title="Finalizar compra"
          onBack={() =>
            openPage("cart")
          }
        >
          <div className="checkout-layout">
            <div style={cardStyle}>
              <h2>
                1. Entrega
              </h2>

              {addresses.length ? (
                addresses.map(
                  (address) => (
                    <div
                      className="select-card"
                      key={address.id}
                    >
                      <strong>
                        {address.name}
                      </strong>

                      <span>
                        {
                          address.street
                        }
                        ,{" "}
                        {
                          address.city
                        }
                        ,{" "}
                        {
                          address.state
                        }{" "}
                        {
                          address.postalCode
                        }
                      </span>
                    </div>
                  ),
                )
              ) : (
                <div className="empty-inline">
                  <p>
                    No tienes una dirección
                    guardada.
                  </p>

                  <button
                    style={
                      secondaryButton
                    }
                    type="button"
                    onClick={() =>
                      openPage(
                        "addresses",
                      )
                    }
                  >
                    Agregar dirección
                  </button>
                </div>
              )}

              <h2>
                2. Método de pago
              </h2>

              {paymentMethods.length ? (
                paymentMethods.map(
                  (payment) => (
                    <div
                      className="select-card"
                      key={payment.id}
                    >
                      <strong>
                        💳{" "}
                        {payment.label}
                      </strong>

                      <span>
                        {
                          payment.detail
                        }
                      </span>
                    </div>
                  ),
                )
              ) : (
                <div className="empty-inline">
                  <p>
                    Agrega un método
                    de pago.
                  </p>

                  <button
                    style={
                      secondaryButton
                    }
                    type="button"
                    onClick={() =>
                      openPage(
                        "payments",
                      )
                    }
                  >
                    Administrar pagos
                  </button>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2>
                Resumen de compra
              </h2>

              {checkoutItems.map(
                (item) => (
                  <div
                    className="summary-product"
                    key={`${item.id}-${item.variant || "default"}`}
                  >
                    <span>
                      {item.quantity} ×{" "}
                      {item.name}
                    </span>

                    <strong>
                      {money(
                        item.price *
                          item.quantity,
                      )}
                    </strong>
                  </div>
                ),
              )}

              <hr />

              <div className="summary-line total">
                <span>Total</span>

                <strong>
                  {money(checkoutTotal)}
                </strong>
              </div>

              <button
                type="button"
                style={primaryButton}
                onClick={placeOrder}
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        </PageShell>
      )}

      {/* CONFIRMATION */}
      {page === "confirmation" && (
        <PageShell
          title="Compra confirmada"
          onBack={goHome}
        >
          <div className="success-card">
            <div className="success-icon">
              ✓
            </div>

            <h1>
              ¡Gracias por tu compra!
            </h1>

            <p>
              Tu pedido fue registrado
              en SHORASHOPP.
            </p>

            <strong>
              Pedido:{" "}
              {selectedOrder?.id}
            </strong>

            <div className="button-row">
              <button
                style={primaryButton}
                type="button"
                onClick={() =>
                  openPage("orders")
                }
              >
                Mis pedidos
              </button>

              <button
                style={secondaryButton}
                type="button"
                onClick={goHome}
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </PageShell>
      )}

      {/* ACCOUNT */}
      {page === "account" && (
        <PageShell
          title="Mi cuenta"
          onBack={goHome}
        >
          <div className="account-hero">
            <div className="account-avatar">
              {session?.user?.email
                ?.charAt(0)
                .toUpperCase() || "S"}
            </div>

            <div>
              <strong>
                {session?.user
                  ?.user_metadata
                  ?.full_name ||
                  "Usuario SHORASHOPP"}
              </strong>

              <span>
                {session?.user?.email ||
                  "Sesión iniciada"}
              </span>
            </div>
          </div>

          <div className="account-grid">
            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("profile")
              }
            >
              👤 Perfil
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("orders")
              }
            >
              📦 Mis pedidos
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("favorites")
              }
            >
              ❤️ Favoritos
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("addresses")
              }
            >
              📍 Direcciones
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("payments")
              }
            >
              💳 Métodos de pago
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("messages")
              }
            >
              💬 Mensajes
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage(
                  "notifications",
                )
              }
            >
              🔔 Notificaciones
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                session
                  ? openPage("sell")
                  : openAuth(
                      "register",
                    )
              }
            >
              🏪 Vender
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("credits")
              }
            >
              💰 Crédito SHORASHOPP
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("referrals")
              }
            >
              🎁 Referidos
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("settings")
              }
            >
              ⚙️ Configuración
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("privacy")
              }
            >
              🔐 Privacidad y seguridad
              <span>›</span>
            </button>

            <button
              style={{
                ...cardButtonStyle,
                color: "#d41452",
              }}
              type="button"
              onClick={logout}
            >
              🚪 Cerrar sesión
              <span>›</span>
            </button>
          </div>
        </PageShell>
      )}

      {/* PROFILE */}
      {page === "profile" && (
        <SimplePage
          title="Perfil"
          icon="👤"
          text="Administra tu información personal y los datos de tu cuenta."
          back="account"
          buttons={[
            {
              icon: "✏️",
              label:
                "Editar datos personales",
              onClick: () =>
                notify(
                  "La edición de datos se conectará con tu cuenta.",
                ),
            },
          ]}
        />
      )}

      {/* ORDERS */}
      {page === "orders" && (
        <PageShell
          title="Mis pedidos"
          onBack={() =>
            openPage("account")
          }
        >
          {selectedOrder ? (
            <div style={cardStyle}>
              <button
                style={
                  secondaryButton
                }
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null,
                  )
                }
              >
                ← Volver
              </button>

              <h2>
                Pedido{" "}
                {selectedOrder.id}
              </h2>

              <p>
                Fecha:{" "}
                {selectedOrder.date}
              </p>

              <p>
                Estado:{" "}
                <b>
                  {
                    selectedOrder.status
                  }
                </b>
              </p>

              {selectedOrder.items.map(
                (item) => (
                  <div
                    className="summary-product"
                    key={item.id}
                  >
                    <span>
                      {item.quantity} ×{" "}
                      {item.name}
                    </span>

                    <strong>
                      {money(
                        item.price *
                          item.quantity,
                      )}
                    </strong>
                  </div>
                ),
              )}

              <hr />

              <div className="summary-line total">
                <span>Total</span>

                <strong>
                  {money(
                    selectedOrder.total,
                  )}
                </strong>
              </div>

              <button
                style={primaryButton}
                type="button"
                onClick={() =>
                  openPage(
                    "tracking",
                  )
                }
              >
                Seguir pedido
              </button>
            </div>
          ) : (
            <div className="stack-list">
              {orders.map(
                (order) => (
                  <button
                    key={order.id}
                    style={
                      cardButtonStyle
                    }
                    type="button"
                    onClick={() =>
                      setSelectedOrder(
                        order,
                      )
                    }
                  >
                    📦{" "}
                    {order.id}
                    <span>›</span>
                  </button>
                ),
              )}
            </div>
          )}
        </PageShell>
      )}

      {/* TRACKING */}
      {page === "tracking" && (
        <SimplePage
          title="Seguimiento"
          icon="🚚"
          text="Consulta el avance de tus envíos y el estado actual de tus pedidos."
          back="orders"
          buttons={[
            {
              icon: "📦",
              label:
                "Pedido preparado",
              onClick: () =>
                notify(
                  "Pedido preparado.",
                ),
            },
            {
              icon: "🚚",
              label: "En camino",
              onClick: () =>
                notify(
                  "El pedido está en camino.",
                ),
            },
            {
              icon: "🏠",
              label:
                "Entrega estimada",
              onClick: () =>
                notify(
                  "Próxima entrega programada.",
                ),
            },
          ]}
        />
      )}

      {/* FAVORITES */}
      {page === "favorites" && (
        <PageShell
          title="Favoritos"
          onBack={() =>
            openPage("account")
          }
        >
          {favoriteProducts.length ? (
            <div className="products-grid">
              {favoriteProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite
                    onFavorite={
                      toggleFavorite
                    }
                    onClick={openProduct}
                  />
                ),
              )}
            </div>
          ) : (
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 52,
                }}
              >
                ❤️
              </div>

              <h2>
                No tienes favoritos
              </h2>

              <p
                style={{
                  color: "#666",
                }}
              >
                Toca el corazón de un
                producto para guardarlo.
              </p>
            </div>
          )}
        </PageShell>
      )}

      {/* ADDRESSES */}
      {page === "addresses" && (
        <PageShell
          title="Direcciones"
          onBack={() =>
            openPage("account")
          }
        >
          <form
            style={cardStyle}
            onSubmit={saveAddress}
          >
            <div className="form-grid">
              {[
                ["name", "Nombre"],
                ["phone", "Teléfono"],
                [
                  "street",
                  "Calle y número",
                ],
                ["city", "Ciudad"],
                ["state", "Estado"],
                [
                  "postalCode",
                  "Código postal",
                ],
                [
                  "reference",
                  "Referencia",
                ],
              ].map(
                ([field, label]) => (
                  <label key={field}>
                    {label}

                    <input
                      value={
                        addressForm[
                          field
                        ]
                      }
                      onChange={(event) =>
                        setAddressForm(
                          (current) => ({
                            ...current,
                            [field]:
                              event.target
                                .value,
                          }),
                        )
                      }
                    />
                  </label>
                ),
              )}
            </div>

            <button
              style={primaryButton}
              type="submit"
            >
              Guardar dirección
            </button>
          </form>

          <div
            className="stack-list"
            style={{
              marginTop: 12,
            }}
          >
            {addresses.map(
              (address) => (
                <div
                  style={cardStyle}
                  key={address.id}
                >
                  <strong>
                    {address.name}
                  </strong>

                  <p>
                    {address.street},{" "}
                    {address.city},{" "}
                    {address.state}{" "}
                    {
                      address.postalCode
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </PageShell>
      )}

      {/* PAYMENTS */}
      {page === "payments" && (
        <PageShell
          title="Métodos de pago"
          onBack={() =>
            openPage("account")
          }
        >
          <div style={cardStyle}>
            <h2>
              Agregar tarjeta
            </h2>

            <form
              className="form-grid"
              onSubmit={savePayment}
            >
              <label>
                Número de tarjeta

                <input
                  value={
                    paymentForm.card
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (current) => ({
                        ...current,
                        card: event
                          .target.value,
                      }),
                    )
                  }
                  placeholder="0000 0000 0000 0000"
                />
              </label>

              <label>
                Nombre en tarjeta

                <input
                  value={
                    paymentForm.name
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (current) => ({
                        ...current,
                        name: event
                          .target.value,
                      }),
                    )
                  }
                  placeholder="Nombre completo"
                />
              </label>

              <label>
                Vencimiento

                <input
                  value={
                    paymentForm.expiration
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (current) => ({
                        ...current,
                        expiration:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="MM/AA"
                />
              </label>

              <label>
                CVV

                <input
                  value={
                    paymentForm.cvv
                  }
                  onChange={(event) =>
                    setPaymentForm(
                      (current) => ({
                        ...current,
                        cvv: event.target
                          .value,
                      }),
                    )
                  }
                  placeholder="123"
                />
              </label>

              <button
                style={primaryButton}
                type="submit"
              >
                Guardar método
              </button>
            </form>
          </div>

          <div
            className="stack-list"
            style={{
              marginTop: 12,
            }}
          >
            {paymentMethods.map(
              (payment) => (
                <div
                  style={cardStyle}
                  key={payment.id}
                >
                  <strong>
                    💳{" "}
                    {payment.label}
                  </strong>

                  <p>
                    {payment.detail}
                  </p>
                </div>
              ),
            )}
          </div>
        </PageShell>
      )}

      {/* MESSAGES */}
      {page === "messages" && (
        <SimplePage
          title="Mensajes"
          icon="💬"
          text="Comunícate con vendedores y con el soporte de SHORASHOPP."
          back="account"
          buttons={[
            {
              icon: "🏪",
              label:
                "Vendedores",
              onClick: () =>
                notify(
                  "Conversaciones con vendedores preparadas.",
                ),
            },
            {
              icon: "🛟",
              label:
                "Soporte SHORASHOPP",
              onClick: () =>
                openPage(
                  "support",
                ),
            },
          ]}
        />
      )}

      {/* NOTIFICATIONS */}
      {page === "notifications" && (
        <PageShell
          title="Notificaciones"
          onBack={() =>
            openPage("account")
          }
        >
          <div className="stack-list">
            <div style={cardStyle}>
              <strong>
                🛍️ Ofertas
              </strong>

              <p>
                Nuevas promociones y
                descuentos disponibles.
              </p>
            </div>

            <div style={cardStyle}>
              <strong>
                📦 Pedidos
              </strong>

              <p>
                Actualizaciones de tus
                compras y envíos.
              </p>
            </div>

            <div style={cardStyle}>
              <strong>
                🔔 Cuenta
              </strong>

              <p>
                Avisos importantes de
                SHORASHOPP.
              </p>
            </div>
          </div>
        </PageShell>
      )}

      {/* SELL */}
      {page === "sell" && (
        <PageShell
          title="Vender en SHORASHOPP"
          onBack={() =>
            openPage("account")
          }
        >
          {sellerLoading ? (
            <div style={cardStyle}>
              Comprobando tu tienda...
            </div>
          ) : !sellerStore ? (
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 50,
                }}
              >
                🏪
              </div>

              <h2>
                Tienda de vendedor
              </h2>

              <p
                style={{
                  color: "#666",
                }}
              >
                Tu cuenta necesita una
                tienda vinculada en
                seller_stores para
                publicar productos reales.
              </p>

              <button
                type="button"
                style={primaryButton}
                onClick={() =>
                  notify(
                    "La creación de tiendas se conectará aquí.",
                  )
                }
              >
                Crear tienda
              </button>
            </div>
          ) : (
            <form
              style={cardStyle}
              onSubmit={publishProduct}
            >
              <h2>
                {
                  sellerStore.store_name
                }
              </h2>

              <div className="form-grid">
                <label>
                  Nombre del producto

                  <input
                    value={
                      productForm.name
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          name: event
                            .target.value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Precio

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.price
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          price:
                            event.target
                              .value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Precio anterior

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.compare_at_price
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          compare_at_price:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>

                <label>
                  Stock

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.stock
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          stock:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>

                <label>
                  SKU

                  <input
                    value={
                      productForm.sku
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          sku: event
                            .target.value,
                        }),
                      )
                    }
                  />
                </label>

                <label>
                  Imagen principal

                  <input
                    type="url"
                    value={
                      productForm.image_url
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          image_url:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>

                <label>
                  Categoría

                  <select
                    value={
                      productForm.category
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          category:
                            event.target
                              .value,
                        }),
                      )
                    }
                  >
                    {categories.map(
                      ([, title]) => (
                        <option
                          key={title}
                          value={title}
                        >
                          {title}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Imágenes adicionales

                  <textarea
                    rows="3"
                    value={
                      productForm.images
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          images:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>

                <label>
                  Descripción

                  <textarea
                    rows="5"
                    value={
                      productForm.description
                    }
                    onChange={(event) =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />
                </label>
              </div>

              <button
                style={primaryButton}
                type="submit"
                disabled={
                  publishLoading
                }
              >
                {publishLoading
                  ? "Publicando..."
                  : "Publicar producto"}
              </button>
            </form>
          )}
        </PageShell>
      )}

      {/* CREDITS */}
      {page === "credits" && (
        <SimplePage
          title="Crédito SHORASHOPP"
          icon="💰"
          text="Consulta y administra tu crédito para compras dentro de SHORASHOPP."
          back="account"
          buttons={[
            {
              icon: "📝",
              label:
                "Solicitar crédito",
              onClick: () =>
                notify(
                  "Solicitud de crédito preparada.",
                ),
            },
            {
              icon: "💳",
              label: "Ver pagos",
              onClick: () =>
                openPage("orders"),
            },
          ]}
        />
      )}

      {/* REFERRALS */}
      {page === "referrals" && (
        <SimplePage
          title="Referidos"
          icon="🎁"
          text="Comparte SHORASHOPP con otras personas y administra tus referencias."
          back="account"
          buttons={[
            {
              icon: "🔗",
              label:
                "Copiar código",
              onClick: async () => {
                const code =
                  "SHORA-2026";

                try {
                  await navigator.clipboard?.writeText(
                    code,
                  );
                } catch {
                  // El navegador puede bloquear clipboard.
                }

                notify(
                  "Código SHORA-2026 listo para compartir.",
                );
              },
            },
          ]}
        />
      )}

      {/* SUPPORT */}
      {page === "support" && (
        <SimplePage
          title="Soporte SHORASHOPP"
          icon="🛟"
          text="Encuentra ayuda sobre compras, ventas, pagos, envíos y seguridad."
          back="account"
          buttons={[
            {
              icon: "💬",
              label: "Abrir chat",
              onClick: () =>
                notify(
                  "Chat de soporte preparado.",
                ),
            },
            {
              icon: "❓",
              label:
                "Preguntas frecuentes",
              onClick: () =>
                openPage("faq"),
            },
          ]}
        />
      )}

      {/* FAQ */}
      {page === "faq" && (
        <SimplePage
          title="Preguntas frecuentes"
          icon="❓"
          text="Consulta respuestas sobre pedidos, pagos, envíos, vendedores y tu cuenta."
          back="support"
        />
      )}

      {/* TERMS */}
      {page === "terms" && (
        <SimplePage
          title="Términos y condiciones"
          icon="📄"
          text="Aquí estarán los términos y condiciones de SHORASHOPP para compradores y vendedores."
          back="privacy"
        />
      )}

      {/* RETURNS */}
      {page === "returns" && (
        <SimplePage
          title="Devoluciones y reembolsos"
          icon="↩️"
          text="Gestiona devoluciones, incidencias y solicitudes de reembolso según las condiciones aplicables."
          back="privacy"
        />
      )}

      {/* SELLER STORE */}
      {page === "seller-store" && (
        <SimplePage
          title="Tienda del vendedor"
          icon="🏪"
          text={
            selectedProduct
              ? `Conoce más sobre ${selectedProduct.sellerName}.`
              : "Perfil público del vendedor dentro de SHORASHOPP."
          }
          back="product"
        />
      )}

      {/* SETTINGS */}
      {page === "settings" && (
        <PageShell
          title="Configuración"
          onBack={() =>
            openPage("account")
          }
        >
          <div className="stack-list">
            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                notify(
                  "Notificaciones configuradas.",
                )
              }
            >
              🔔 Notificaciones
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                notify(
                  "Idioma: Español (México)",
                )
              }
            >
              🌐 Idioma
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("privacy")
              }
            >
              🔐 Privacidad
              <span>›</span>
            </button>
          </div>
        </PageShell>
      )}

      {/* PRIVACY */}
      {page === "privacy" && (
        <PageShell
          title="Privacidad y seguridad"
          onBack={() =>
            openPage("account")
          }
        >
          <div className="stack-list">
            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("sessions")
              }
            >
              📱 Sesiones activas
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("security")
              }
            >
              🛡️ Verificación de seguridad
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("terms")
              }
            >
              📄 Términos y condiciones
              <span>›</span>
            </button>

            <button
              style={cardButtonStyle}
              type="button"
              onClick={() =>
                openPage("returns")
              }
            >
              ↩️ Devoluciones y reembolsos
              <span>›</span>
            </button>
          </div>
        </PageShell>
      )}

      {/* SESSIONS */}
      {page === "sessions" && (
        <SimplePage
          title="Sesiones activas"
          icon="📱"
          text={`Sesión actual: ${
            session?.user?.email ||
            "No identificada"
          }`}
          back="privacy"
          buttons={[
            {
              icon: "🚪",
              label:
                "Cerrar sesión",
              onClick: logout,
            },
          ]}
        />
      )}

      {/* SECURITY */}
      {page === "security" && (
        <PageShell
          title="Verificación de seguridad"
          onBack={() =>
            openPage("privacy")
          }
        >
          <div className="stack-list">
            <div style={cardStyle}>
              <strong>
                🔑 Contraseña
              </strong>

              <p
                style={{
                  color: "#666",
                }}
              >
                Gestionada de forma
                segura mediante Supabase
                Auth.
              </p>
            </div>

            <div style={cardStyle}>
              <strong>
                ✉️ Correo
              </strong>

              <p
                style={{
                  color: "#666",
                }}
              >
                {session?.user?.email ||
                  "—"}
              </p>
            </div>
          </div>
        </PageShell>
      )}

      {/* DRAWER */}
      {menuOpen && (
        <div
          className="drawer-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setMenuOpen(false);
            }
          }}
        >
          <aside className="drawer">
            <div className="drawer-head">
              <strong>
                SHORASHOPP
              </strong>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                ×
              </button>
            </div>

            <div className="drawer-list">
              <button
                type="button"
                style={menuStyle}
                onClick={goHome}
              >
                ⌂ Inicio
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage(
                    "categories",
                  )
                }
              >
                ▦ Categorías
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={openAccount}
              >
                ✨ Mi cuenta
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("orders")
                }
              >
                📦 Mis pedidos
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("favorites")
                }
              >
                ❤️ Favoritos
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("messages")
                }
              >
                💬 Mensajes
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage(
                    "notifications",
                  )
                }
              >
                🔔 Notificaciones
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  session
                    ? openPage("sell")
                    : openAuth(
                        "register",
                      )
                }
              >
                🏪 Vender
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("cart")
                }
              >
                🛒 Carrito ({cartCount})
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("addresses")
                }
              >
                📍 Direcciones
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("payments")
                }
              >
                💳 Métodos de pago
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("privacy")
                }
              >
                🔐 Privacidad y seguridad
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("support")
                }
              >
                🛟 Soporte
              </button>

              <button
                type="button"
                style={menuStyle}
                onClick={() =>
                  openPage("terms")
                }
              >
                📄 Términos
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button
          className={
            page === "home"
              ? "bottom-item active"
              : "bottom-item"
          }
          type="button"
          onClick={goHome}
        >
          <span>⌂</span>
          <small>Inicio</small>
        </button>

        <button
          className={
            page === "categories"
              ? "bottom-item active"
              : "bottom-item"
          }
          type="button"
          onClick={() =>
            openPage(
              "categories",
            )
          }
        >
          <span>▦</span>
          <small>
            Categorías
          </small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={() =>
            session
              ? openPage("sell")
              : openAuth(
                  "register",
                )
          }
        >
          <span>▰</span>
          <small>Vender</small>
        </button>

        <button
          className={
            page === "cart"
              ? "bottom-item active"
              : "bottom-item"
          }
          type="button"
          onClick={() =>
            openPage("cart")
          }
        >
          <span>🛒</span>
          <small>
            Carrito
          </small>
        </button>

        <button
          className={
            page === "account"
              ? "bottom-item active"
              : "bottom-item"
          }
          type="button"
          onClick={openAccount}
        >
          <span>✨</span>
          <small>Cuenta</small>
        </button>
      </nav>

      {/* TOAST */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAuth();
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="auth-close"
              type="button"
              onClick={closeAuth}
            >
              ×
            </button>

            <div className="auth-logo">
              S
            </div>

            <h2>
              {authMode ===
              "login"
                ? "Bienvenido."
                : "Crea tu cuenta."}
            </h2>

            <p>
              {authMode ===
              "login"
                ? "Inicia sesión en SHORASHOPP."
                : "Únete a SHORASHOPP."}
            </p>

            <form
              onSubmit={handleAuth}
            >
              {authMode ===
                "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value,
                    )
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                minLength={6}
                required
              />

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode ===
                      "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </button>
            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <div className="auth-switch">
              {authMode ===
              "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "register",
                      );
                      setMessage("");
                    }}
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "login",
                      );
                      setMessage("");
                    }}
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({
  title,
  onBack,
  children,
}) {
  return (
    <section className="page-shell">
      <button
        className="back-button"
        type="button"
        onClick={onBack}
      >
        ← Volver
      </button>

      <div className="page-heading">
        <h1>{title}</h1>
        <div className="heading-line" />
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  favorite,
  onFavorite,
  onClick,
}) {
  const image =
    product.image_url ||
    product.images?.[0] ||
    "";

  return (
    <article
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={() =>
        onClick(product)
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          onClick(product);
        }
      }}
    >
      <div className="product-image">
        <span className="product-label">
          {product.discount ||
            (product.stock > 0
              ? "Disponible"
              : "Agotado")}
        </span>

        <button
          className="heart-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite(product.id);
          }}
        >
          {favorite ? "♥" : "♡"}
        </button>

        <div className="product-art">
          {image ? (
            <img
              src={image}
              alt={product.name}
            />
          ) : (
            <span>🛍️</span>
          )}
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="price-row">
          <strong>
            {money(product.price)}
          </strong>

          {product.compare_at_price && (
            <del>
              {money(
                product.compare_at_price,
              )}
            </del>
          )}
        </div>

        <div className="rating-row">
          <span>★</span>{" "}
          {product.rating ||
            "Nuevo"}

          <small>
            •{" "}
            {product.reviews ||
              "Producto"}
          </small>
        </div>
      </div>
    </article>
  );
}

export default App;
