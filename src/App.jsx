import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

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

const reviews = [
  ["María", 5, "Llegó rápido y tal como se describe."],
  ["Carlos", 4, "Buen producto, volvería a comprar."],
  ["Ana", 5, "Excelente atención del vendedor."],
];

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));

const normalizeProduct = (p) => ({
  ...p,
  id: p.id || `product-${Date.now()}-${Math.random()}`,
  price: Number(p.price || 0),
  compare_at_price:
    p.compare_at_price === null || p.compare_at_price === ""
      ? null
      : Number(p.compare_at_price),
  stock: Number(p.stock ?? 0),
  images: Array.isArray(p.images)
    ? p.images
    : typeof p.images === "string"
      ? (() => {
          try {
            const x = JSON.parse(p.images);
            return Array.isArray(x) ? x : [];
          } catch {
            return [];
          }
        })()
      : [],
  category: p.category || p.category_name || "Otros",
  description: p.description || "Producto publicado en SHORASHOPP.",
  sellerName: p.sellerName || p.seller_name || "Vendedor SHORASHOPP",
  sellerRating: p.sellerRating || p.seller_rating || "4.8",
  shipping: p.shipping || "Envío calculado al finalizar",
  delivery: p.delivery || "Consulta la fecha disponible al comprar",
  reviews: p.reviews || "Producto publicado",
  variants:
    Array.isArray(p.variants) && p.variants.length
      ? p.variants
      : [],
});

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [toast, setToast] = useState("");

  const [products, setProducts] = useState(demoProducts);
  const [productsLoading, setProductsLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const [sellerStore, setSellerStore] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const [variant, setVariant] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    reference: "",
  });

  const [publish, setPublish] = useState({
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

  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");

  const [orders, setOrders] = useState([
    {
      id: "SH-00001234",
      date: new Date().toLocaleDateString("es-MX"),
      total: 1298,
      status: "En tránsito",
      items: [
        { ...demoProducts[0], quantity: 1 },
        { ...demoProducts[1], quantity: 1 },
      ],
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data?.session || null);
        setAuthReady(true);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length) {
        setProducts(data.map(normalizeProduct));
      } else {
        setProducts(demoProducts);
      }
    } catch {
      setProducts(demoProducts);
    }

    setProductsLoading(false);
  };

  const loadSellerStore = async (userId) => {
    setSellerLoading(true);

    try {
      const { data, error } = await supabase
        .from("seller_stores")
        .select("*")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      setSellerStore(!error ? data : null);
    } catch {
      setSellerStore(null);
    }

    setSellerLoading(false);
  };

  const notify = (text) => {
    setToast(text);
    clearTimeout(window.__shoraToast);
    window.__shoraToast = setTimeout(() => setToast(""), 2500);
  };

  const openPage = (next) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setPage("home");
    setProduct(null);
    setCategory("");
    setSearch("");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          closeAuth();
        } else {
          setMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        closeAuth();
      }
    } catch (error) {
      setMessage(error?.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    goHome();
  };

  const openProduct = (item) => {
    const normalized = normalizeProduct(item);
    setProduct(normalized);
    setVariant(normalized.variants?.[0] || "");
    setQuestions([]);
    setQuestion("");
    openPage("product");
  };

  const imageOf = (item) =>
    item?.image_url || item?.images?.[0] || "";

  const addCart = (item, quantity = 1) => {
    const selectedVariant = variant || item.variants?.[0] || "";
    const key = `${item.id}-${selectedVariant || "default"}`;
    const qty = Math.max(
      1,
      Math.min(
        Number(quantity) || 1,
        item.stock || 999
      )
    );

    setCart((current) => {
      const found = current.find((x) => x.cartKey === key);

      if (found) {
        return current.map((x) =>
          x.cartKey === key
            ? {
                ...x,
                quantity: Math.min(
                  x.quantity + qty,
                  item.stock || x.quantity + qty
                ),
              }
            : x
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: qty,
          variant: selectedVariant,
          cartKey: key,
        },
      ];
    });

    notify("Producto agregado al carrito.");
  };

  const removeCart = (cartKey) => {
    setCart((current) =>
      current.filter((item) => item.cartKey !== cartKey)
    );
  };

  const changeQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeCart(cartKey);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                item.stock || quantity
              ),
            }
          : item
      )
    );
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const buyNow = (item) => {
    setCheckoutItems([
      {
        ...item,
        quantity: 1,
        variant: variant || item.variants?.[0] || "",
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
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((item) => {
      const byCategory =
        !category || item.category === category;

      const bySearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        String(item.sellerName || "")
          .toLowerCase()
          .includes(q);

      return byCategory && bySearch;
    });
  }, [products, category, search]);

  const favoriteProducts = products.filter((item) =>
    favorites.includes(item.id)
  );

  const goCategory = (name) => {
    setCategory(name);
    setSearch("");
    openPage("home");

    setTimeout(() => {
      document
        .querySelector(".products-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 80);
  };

  const saveAddress = (event) => {
    event.preventDefault();

    if (
      !address.name ||
      !address.street ||
      !address.city ||
      !address.postalCode
    ) {
      notify("Completa los campos principales.");
      return;
    }

    setAddresses((current) => [
      ...current,
      {
        ...address,
        id: Date.now(),
      },
    ]);

    setAddress({
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

    setPayments((current) => [
      ...current,
      {
        id: Date.now(),
        label: "Tarjeta terminación 4242",
        detail: "Método de pago guardado",
      },
    ]);

    notify("Método de pago agregado.");
  };

  const publishProduct = async (event) => {
    event.preventDefault();

    if (!session) {
      openAuth("login");
      return;
    }

    if (!sellerStore?.id) {
      notify(
        "Primero necesitas una tienda de vendedor vinculada."
      );
      return;
    }

    const price = Number(publish.price);
    const stock = Number(publish.stock);

    if (
      !publish.name.trim() ||
      price <= 0 ||
      stock < 0
    ) {
      notify("Completa nombre, precio y stock.");
      return;
    }

    setPublishLoading(true);

    try {
      const images = publish.images
        .split(/\n|,/)
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        seller_id: sellerStore.id,
        name: publish.name.trim(),
        slug: `${slugify(publish.name)}-${Date.now()}`,
        description: publish.description.trim(),
        price,
        compare_at_price:
          publish.compare_at_price
            ? Number(publish.compare_at_price)
            : null,
        stock,
        sku: publish.sku.trim() || null,
        image_url:
          publish.image_url.trim() || null,
        images,
        category: publish.category,
        status: "pending",
      };

      let result = await supabase
        .from("products")
        .insert(payload);

      if (result.error) {
        const fallback = { ...payload };
        delete fallback.category;

        result = await supabase
          .from("products")
          .insert(fallback);
      }

      if (result.error) throw result.error;

      setPublish({
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
        "Producto enviado para aprobación."
      );

      await loadProducts();
    } catch (error) {
      notify(
        error?.message ||
          "No se pudo publicar el producto."
      );
    } finally {
      setPublishLoading(false);
    }
  };

  const askQuestion = (event) => {
    event.preventDefault();

    if (!question.trim()) return;

    setQuestions((current) => [
      ...current,
      {
        id: Date.now(),
        question: question.trim(),
        answer:
          "El vendedor responderá próximamente.",
      },
    ]);

    setQuestion("");
    notify("Pregunta enviada.");
  };

  const placeOrder = () => {
    if (!checkoutItems.length) {
      notify("No hay productos para comprar.");
      return;
    }

    const order = {
      id: `SH-${Date.now()
        .toString()
        .slice(-8)}`,
      date: new Date().toLocaleDateString("es-MX"),
      total: checkoutTotal,
      status: "Confirmado",
      items: checkoutItems,
    };

    setOrders((current) => [
      order,
      ...current,
    ]);

    setCart([]);
    setCheckoutItems([]);
    setSelectedOrder(order);

    openPage("confirmation");
  };

  const styles = {
    primary: {
      border: 0,
      borderRadius: 14,
      padding: "14px 18px",
      background:
        "linear-gradient(135deg,#ed174d,#7020d0)",
      color: "#fff",
      fontWeight: 800,
      cursor: "pointer",
    },
    secondary: {
      border: "1px solid #7020d0",
      borderRadius: 14,
      padding: "14px 18px",
      background: "#fff",
      color: "#7020d0",
      fontWeight: 800,
      cursor: "pointer",
    },
    card: {
      background: "#fff",
      border: "1px solid #ece7f3",
      borderRadius: 18,
      padding: 18,
      boxShadow:
        "0 5px 18px rgba(50,16,74,.05)",
    },
    menu: {
      width: "100%",
      border: 0,
      borderRadius: 13,
      background: "#fff",
      color: "#24152f",
      fontSize: 16,
      fontWeight: 700,
      textAlign: "left",
      padding: "14px 12px",
    },
  };

  if (!authReady) {
    return (
      <div className="loading-screen">
        <strong>SHORASHOPP</strong>
        <p>Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="mobile-header">
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen(true)}
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
              openPage("notifications")
            }
          >
            🔔<i>3</i>
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={() => openPage("cart")}
          >
            🛒<i>{cartCount}</i>
          </button>
        </div>
      </header>

      <div className="search-container">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              openPage("home")
            }
          />

          <button
            type="button"
            onClick={() =>
              openPage("home")
            }
          >
            ⌕
          </button>
        </div>
      </div>

      {page === "home" && (
        <main className="home-main">
          <section className="quick-cards">
            <button
              className="quick-card sell-card"
              type="button"
              onClick={() =>
                session
                  ? openPage("sell")
                  : openAuth("register")
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
                  Publica tus productos y comienza
                  a vender.
                </span>
              </div>

              <b className="round-arrow">›</b>
            </button>

            <button
              className="quick-card account-card"
              type="button"
              onClick={() =>
                session
                  ? openPage("account")
                  : openAuth("login")
              }
            >
              <div className="quick-icon">
                ✨
              </div>

              <div className="quick-content">
                <strong>Mi cuenta</strong>

                <span>
                  {session
                    ? "Sesión iniciada"
                    : "Inicia sesión"}
                </span>

                <small>
                  Perfil, pedidos y configuraciones
                </small>
              </div>

              <b className="round-arrow">›</b>
            </button>
          </section>

          <section className="content-section">
            <div className="section-title-row">
              <h2>Categorías</h2>

              <button
                type="button"
                onClick={() =>
                  openPage("categories")
                }
              >
                Ver todas <span>›</span>
              </button>
            </div>

            <div className="categories-scroll">
              {categories
                .slice(0, 6)
                .map(([icon, name]) => (
                  <button
                    key={name}
                    className="category-item"
                    type="button"
                    onClick={() =>
                      goCategory(name)
                    }
                  >
                    <div className="category-icon">
                      {icon}
                    </div>
                    <span>{name}</span>
                  </button>
                ))}
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
                {category ||
                  "Productos destacados"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  setSearch("");
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
                    (item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        favorite={favorites.includes(
                          item.id
                        )}
                        onFavorite={
                          toggleFavorite
                        }
                        onClick={openProduct}
                      />
                    )
                  )
                ) : (
                  <div className="empty-inline">
                    No hay productos con esa
                    búsqueda.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="trust-section">
            <div>
              <span>♢</span>
              <strong>Compra segura</strong>
              <small>
                Protegemos tus datos y compras
              </small>
            </div>

            <div>
              <span>♧</span>
              <strong>Envíos rápidos</strong>
              <small>
                Recibe tus productos rápidamente
              </small>
            </div>

            <div>
              <span>✿</span>
              <strong>
                Vendedores verificados
              </strong>
              <small>
                Más confianza para ti
              </small>
            </div>

            <div>
              <span>☏</span>
              <strong>Soporte 24/7</strong>
              <small>
                Estamos aquí para ayudarte
              </small>
            </div>
          </section>
        </main>
      )}

      {page === "categories" && (
        <PageShell
          title="Categorías"
          onBack={goHome}
        >
          <div className="category-page-grid">
            {categories.map(([icon, name]) => (
              <button
                key={name}
                className="big-category-card"
                type="button"
                onClick={() =>
                  goCategory(name)
                }
              >
                <span className="big-category-icon">
                  {icon}
                </span>

                <strong>{name}</strong>
                <small>
                  Explorar productos
                </small>
              </button>
            ))}
          </div>
        </PageShell>
      )}

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
                (p) =>
                  p.compare_at_price &&
                  p.price <
                    p.compare_at_price
              )
              .map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  favorite={favorites.includes(
                    item.id
                  )}
                  onFavorite={
                    toggleFavorite
                  }
                  onClick={openProduct}
                />
              ))}
          </div>
        </PageShell>
      )}

      {page === "product" &&
        product && (
          <PageShell
            title="Producto"
            onBack={() => openPage("home")}
          >
            <div className="product-detail-grid">
              <div>
                <div className="product-main-image">
                  <span className="product-label">
                    {product.discount ||
                      "Disponible"}
                  </span>

                  {imageOf(product) ? (
                    <img
                      src={imageOf(product)}
                      alt={product.name}
                    />
                  ) : (
                    <span className="product-placeholder-large">
                      🛍️
                    </span>
                  )}
                </div>

                <div className="thumb-row">
                  {[product.image_url, ...(product.images || [])]
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((src, index) => (
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
                    ))}
                </div>
              </div>

              <div className="product-detail-copy">
                <div className="eyebrow">
                  {product.category}
                </div>

                <h1>{product.name}</h1>

                <div className="rating-row big">
                  ★ {product.rating || "Nuevo"}{" "}
                  <small>
                    • {product.reviews}
                  </small>
                </div>

                <div className="detail-price-row">
                  <strong>
                    {money(product.price)}
                  </strong>

                  {product.compare_at_price && (
                    <del>
                      {money(
                        product.compare_at_price
                      )}
                    </del>
                  )}
                </div>

                {product.compare_at_price && (
                  <div className="saving-pill">
                    Ahorras{" "}
                    {money(
                      product.compare_at_price -
                        product.price
                    )}
                  </div>
                )}

                <p className="detail-description">
                  {product.description}
                </p>

                {product.variants?.length > 0 && (
                  <div className="variant-block">
                    <strong>
                      Elige una opción
                    </strong>

                    <div className="variant-row">
                      {product.variants.map(
                        (item) => (
                          <button
                            key={item}
                            type="button"
                            className={`variant-button ${
                              variant === item
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setVariant(item)
                            }
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="buy-box">
                  <div>
                    <b>
                      Stock disponible:
                    </b>{" "}
                    {product.stock}
                  </div>

                  <div>
                    <b>Envío:</b>{" "}
                    {product.shipping}
                  </div>

                  <div>
                    <b>Entrega:</b>{" "}
                    {product.delivery}
                  </div>

                  <div className="buy-actions">
                    <button
                      type="button"
                      style={styles.secondary}
                      onClick={() =>
                        addCart(product)
                      }
                    >
                      🛒 Agregar al carrito
                    </button>

                    <button
                      type="button"
                      style={styles.primary}
                      onClick={() =>
                        buyNow(product)
                      }
                    >
                      Comprar ahora
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.card,
                    marginTop: 14,
                  }}
                >
                  <h2>Vendedor</h2>

                  <div className="seller-mini-card">
                    <div className="seller-avatar">
                      {product.sellerName?.charAt(
                        0
                      ) || "S"}
                    </div>

                    <div>
                      <strong>
                        {product.sellerName}
                      </strong>
                      <div>
                        ⭐{" "}
                        {product.sellerRating}
                        {" · "}Vendedor destacado
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openPage(
                          "seller-store"
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
              <div style={styles.card}>
                <h2>Descripción</h2>

                <p
                  style={{
                    color: "#666",
                    lineHeight: 1.8,
                  }}
                >
                  {product.description}
                </p>

                <h2>Características</h2>

                <div className="spec-list">
                  {(product.specifications ||
                    []).map(
                    ([label, value]) => (
                      <div key={label}>
                        <strong>
                          {label}
                        </strong>

                        <span>{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div style={styles.card}>
                <h2>Opiniones</h2>

                {reviews.map(
                  ([name, stars, text]) => (
                    <div
                      className="review-item"
                      key={name}
                    >
                      <strong>{name}</strong>

                      <div>
                        {"★".repeat(stars)}
                      </div>

                      <p>{text}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                marginTop: 14,
              }}
            >
              <h2>
                Preguntas sobre el producto
              </h2>

              <form
                className="inline-form"
                onSubmit={askQuestion}
              >
                <input
                  value={question}
                  onChange={(e) =>
                    setQuestion(
                      e.target.value
                    )
                  }
                  placeholder="Escribe tu pregunta"
                />

                <button
                  style={styles.primary}
                  type="submit"
                >
                  Preguntar
                </button>
              </form>

              {questions.map((item) => (
                <div
                  className="question-item"
                  key={item.id}
                >
                  <strong>
                    Pregunta
                  </strong>

                  <p>{item.question}</p>

                  <small>
                    {item.answer}
                  </small>
                </div>
              ))}
            </div>

            <div
              style={{
                ...styles.card,
                marginTop: 14,
              }}
            >
              <h2>
                Productos relacionados
              </h2>

              <div className="products-grid mini-grid">
                {products
                  .filter(
                    (x) =>
                      x.id !== product.id &&
                      x.category ===
                        product.category
                  )
                  .slice(0, 4)
                  .map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      favorite={favorites.includes(
                        item.id
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

      {page === "cart" && (
        <PageShell
          title="Carrito"
          onBack={goHome}
        >
          {!cart.length ? (
            <div style={styles.card}>
              <div style={{ fontSize: 58 }}>
                🛒
              </div>

              <h2>
                Tu carrito está vacío
              </h2>

              <p style={{ color: "#666" }}>
                Agrega productos para comenzar
                tu compra.
              </p>

              <button
                style={styles.primary}
                type="button"
                onClick={goHome}
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="checkout-layout">
              <div style={styles.card}>
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.cartKey}
                  >
                    <div className="cart-image">
                      {imageOf(item) ? (
                        <img
                          src={imageOf(item)}
                          alt={item.name}
                        />
                      ) : (
                        <span>🛍️</span>
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
                              item.quantity - 1
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
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            removeCart(
                              item.cartKey
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

              <div style={styles.card}>
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
                    Se calcula al comprar
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
                  style={styles.primary}
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

      {page === "checkout" && (
        <PageShell
          title="Finalizar compra"
          onBack={() => openPage("cart")}
        >
          <div className="checkout-layout">
            <div style={styles.card}>
              <h2>Entrega</h2>

              {addresses.length ? (
                addresses.map((item) => (
                  <div
                    className="select-card"
                    key={item.id}
                  >
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.street},{" "}
                      {item.city},{" "}
                      {item.state}{" "}
                      {item.postalCode}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-inline">
                  <p>
                    No tienes una dirección
                    guardada.
                  </p>

                  <button
                    style={styles.secondary}
                    type="button"
                    onClick={() =>
                      openPage("addresses")
                    }
                  >
                    Agregar dirección
                  </button>
                </div>
              )}

              <h2>Método de pago</h2>

              {payments.length ? (
                payments.map((item) => (
                  <div
                    className="select-card"
                    key={item.id}
                  >
                    <strong>
                      💳 {item.label}
                    </strong>

                    <span>
                      {item.detail}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-inline">
                  <p>
                    Agrega un método de pago.
                  </p>

                  <button
                    style={styles.secondary}
                    type="button"
                    onClick={() =>
                      openPage("payments")
                    }
                  >
                    Administrar pagos
                  </button>
                </div>
              )}

              <p className="checkout-note">
                🔒 Tus datos están
                protegidos.
              </p>
            </div>

            <div style={styles.card}>
              <h2>
                Resumen de compra
              </h2>

              {checkoutItems.map((item) => (
                <div
                  className="summary-product"
                  key={item.cartKey || item.id}
                >
                  <span>
                    {item.quantity} ×{" "}
                    {item.name}
                  </span>

                  <strong>
                    {money(
                      item.price *
                        item.quantity
                    )}
                  </strong>
                </div>
              ))}

              <hr />

              <div className="summary-line total">
                <span>Total</span>
                <strong>
                  {money(checkoutTotal)}
                </strong>
              </div>

              <button
                style={styles.primary}
                type="button"
                onClick={placeOrder}
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        </PageShell>
      )}

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
              Tu pedido fue registrado en
              SHORASHOPP.
            </p>

            <strong>
              Pedido:{" "}
              {selectedOrder?.id}
            </strong>

            <div className="button-row">
              <button
                style={styles.primary}
                type="button"
                onClick={() =>
                  openPage("orders")
                }
              >
                Mis pedidos
              </button>

              <button
                style={styles.secondary}
                type="button"
                onClick={goHome}
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </PageShell>
      )}

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
            {[
              ["👤", "Perfil", "profile"],
              ["📦", "Mis pedidos", "orders"],
              ["❤️", "Favoritos", "favorites"],
              ["📍", "Direcciones", "addresses"],
              ["💳", "Métodos de pago", "payments"],
              ["💬", "Mensajes", "messages"],
              ["🔔", "Notificaciones", "notifications"],
              ["🏪", "Vender", "sell"],
              ["💰", "Crédito SHORASHOPP", "credit"],
              ["🎁", "Referidos", "referrals"],
              ["⚙️", "Configuración", "settings"],
              ["🔐", "Privacidad y seguridad", "privacy"],
            ].map(([icon, title, target]) => (
              <button
                key={target}
                style={styles.menu}
                type="button"
                onClick={() =>
                  openPage(target)
                }
              >
                {icon} {title} <span>›</span>
              </button>
            ))}

            <button
              style={{
                ...styles.menu,
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

      {page === "profile" &&
        <SimplePage
          title="Perfil"
          icon="👤"
          text="Administra la información personal de tu cuenta."
          back={() => openPage("account")}
        />}

      {page === "orders" && (
        <PageShell
          title="Mis pedidos"
          onBack={() => openPage("account")}
        >
          {selectedOrder ? (
            <div style={styles.card}>
              <button
                style={styles.secondary}
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ← Volver a pedidos
              </button>

              <h2>
                Pedido {selectedOrder.id}
              </h2>

              <p>
                Fecha:{" "}
                {selectedOrder.date}
              </p>

              <p>
                Estado:{" "}
                <b>
                  {selectedOrder.status}
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
                          item.quantity
                      )}
                    </strong>
                  </div>
                )
              )}

              <hr />

              <div className="summary-line total">
                <span>Total</span>

                <strong>
                  {money(
                    selectedOrder.total
                  )}
                </strong>
              </div>

              <button
                style={styles.primary}
                type="button"
                onClick={() =>
                  openPage("tracking")
                }
              >
                Seguir pedido
              </button>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => (
                <button
                  style={styles.menu}
                  type="button"
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(
                      order
                    )
                  }
                >
                  📦 {order.id}
                  <span>›</span>
                </button>
              ))}
            </div>
          )}
        </PageShell>
      )}

      {page === "tracking" &&
        <SimplePage
          title="Seguimiento"
          icon="🚚"
          text="Consulta el estado de tus envíos y pedidos."
          back={() => openPage("orders")}
        />}

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
                (item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    favorite
                    onFavorite={
                      toggleFavorite
                    }
                    onClick={
                      openProduct
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <div
                style={{ fontSize: 52 }}
              >
                ❤️
              </div>

              <h2>
                No tienes favoritos
              </h2>

              <p
                style={{ color: "#666" }}
              >
                Toca el corazón de un
                producto para guardarlo.
              </p>
            </div>
          )}
        </PageShell>
      )}

      {page === "addresses" && (
        <PageShell
          title="Direcciones"
          onBack={() =>
            openPage("account")
          }
        >
          <form
            style={styles.card}
            onSubmit={saveAddress}
          >
            <div className="form-grid">
              {[
                ["name", "Nombre"],
                ["phone", "Teléfono"],
                ["street", "Calle y número"],
                ["city", "Ciudad"],
                ["state", "Estado"],
                ["postalCode", "Código postal"],
                ["reference", "Referencia"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}

                  <input
                    value={address[field]}
                    onChange={(e) =>
                      setAddress(
                        (current) => ({
                          ...current,
                          [field]:
                            e.target.value,
                        })
                      )
                    }
                    required={[
                      "name",
                      "street",
                      "city",
                      "postalCode",
                    ].includes(field)}
                  />
                </label>
              ))}
            </div>

            <button
              style={styles.primary}
              type="submit"
            >
              Guardar dirección
            </button>
          </form>

          <div
            className="stack-list"
            style={{ marginTop: 12 }}
          >
            {addresses.map((item) => (
              <div
                style={styles.card}
                key={item.id}
              >
                <strong>
                  {item.name}
                </strong>

                <p>
                  {item.street},{" "}
                  {item.city},{" "}
                  {item.state}{" "}
                  {item.postalCode}
                </p>
              </div>
            ))}
          </div>
        </PageShell>
      )}

      {page === "payments" && (
        <PageShell
          title="Métodos de pago"
          onBack={() =>
            openPage("account")
          }
        >
          <div style={styles.card}>
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
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                />
              </label>

              <label>
                Nombre en tarjeta
                <input
                  placeholder="Nombre completo"
                />
              </label>

              <label>
                Vencimiento
                <input placeholder="MM/AA" />
              </label>

              <label>
                CVV
                <input
                  placeholder="123"
                />
              </label>

              <button
                style={styles.primary}
                type="submit"
              >
                Guardar método
              </button>
            </form>
          </div>
        </PageShell>
      )}

      {page === "messages" &&
        <SimplePage
          title="Mensajes"
          icon="💬"
          text="Comunícate con vendedores y con el soporte de SHORASHOPP."
          back={() => openPage("account")}
        />}

      {page === "notifications" &&
        <SimplePage
          title="Notificaciones"
          icon="🔔"
          text="Aquí aparecerán ofertas, pedidos, avisos y novedades de tu cuenta."
          back={() => openPage("account")}
        />}

      {page === "credit" &&
        <SimplePage
          title="Crédito SHORASHOPP"
          icon="💰"
          text="Solicita y administra crédito para realizar compras dentro de SHORASHOPP."
          back={() => openPage("account")}
        />}

      {page === "referrals" &&
        <SimplePage
          title="Referidos"
          icon="🎁"
          text="Invita personas a SHORASHOPP y administra tus referencias."
          back={() => openPage("account")}
        />}

{page === "settings" && (
  <PageShell
    title="Configuración"
    onBack={() => openPage("account")}
  >
    <div className="stack-list">
      <button
        style={styles.menu}
        type="button"
        onClick={() =>
          notify("Notificaciones configuradas.")
        }
      >
        🔔 Notificaciones
        <span>›</span>
      </button>

      <button
        style={styles.menu}
        type="button"
        onClick={() =>
          notify("Idioma: Español (México)")
        }
      >
        🌐 Idioma
        <span>›</span>
      </button>

      <button
        style={styles.menu}
        type="button"
        onClick={() => openPage("privacy")}
      >
        🔐 Privacidad
        <span>›</span>
      </button>
    </div>
  </PageShell>
)}

      {page === "privacy" && (
        <PageShell
          title="Privacidad y seguridad"
          onBack={() =>
            openPage("account")
          }
        >
          <div className="stack-list">
            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                openPage("sessions")
              }
            >
              📱 Sesiones activas
              <span>›</span>
            </button>

            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                openPage("security")
              }
            >
              🛡️ Verificación de seguridad
              <span>›</span>
            </button>

            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                openPage("terms")
              }
            >
              📄 Términos y condiciones
              <span>›</span>
            </button>

            <button
              style={styles.menu}
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

      {page === "sessions" &&
        <SimplePage
          title="Sesiones activas"
          icon="📱"
          text={`Sesión actual: ${
            session?.user?.email ||
            "No identificada"
          }`}
          back={() =>
            openPage("privacy")
          }
        />}

      {page === "security" &&
        <SimplePage
          title="Verificación de seguridad"
          icon="🛡️"
          text="La autenticación y las credenciales se administran mediante Supabase Auth."
          back={() =>
            openPage("privacy")
          }
        />}

      {page === "terms" &&
        <SimplePage
          title="Términos y condiciones"
          icon="📄"
          text="SHORASHOPP es un marketplace que conecta compradores y vendedores. Los productos, disponibilidad, condiciones y envíos pueden variar según cada vendedor."
          back={() =>
            openPage("privacy")
          }
        />}

      {page === "returns" &&
        <SimplePage
          title="Devoluciones y reembolsos"
          icon="↩️"
          text="Consulta las condiciones aplicables al producto y al vendedor. SHORASHOPP podrá mostrar el estado correspondiente del proceso."
          back={() =>
            openPage("privacy")
          }
        />}

      {page === "support" &&
        <PageShell
          title="Soporte"
          onBack={goHome}
        >
          <div className="stack-list">
            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                notify(
                  "Asistente de soporte preparado."
                )
              }
            >
              🤖 Asistente SHORASHOPP
              <span>›</span>
            </button>

            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                notify(
                  "Centro de ayuda preparado."
                )
              }
            >
              ❓ Preguntas frecuentes
              <span>›</span>
            </button>

            <button
              style={styles.menu}
              type="button"
              onClick={() =>
                notify(
                  "Soporte conectado."
                )
              }
            >
              💬 Contactar soporte
              <span>›</span>
            </button>
          </div>
        </PageShell>
      )}

      {page === "sell" && (
        <PageShell
          title="Vender en SHORASHOPP"
          onBack={() =>
            openPage("account")
          }
        >
          {sellerLoading ? (
            <div style={styles.card}>
              Comprobando tu tienda...
            </div>
          ) : !sellerStore ? (
            <div style={styles.card}>
              <div
                style={{ fontSize: 50 }}
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
                Necesitas una tienda
                vinculada en
                seller_stores para
                publicar productos reales.
              </p>
            </div>
          ) : (
            <form
              style={styles.card}
              onSubmit={publishProduct}
            >
              <h2>
                {sellerStore.store_name}
              </h2>

              <div className="form-grid">
                <label>
                  Nombre del producto
                  <input
                    value={publish.name}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          name: e.target
                            .value,
                        })
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
                    value={publish.price}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          price: e.target
                            .value,
                        })
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
                      publish.compare_at_price
                    }
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          compare_at_price:
                            e.target.value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={publish.stock}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          stock: e.target
                            .value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label>
                  SKU
                  <input
                    value={publish.sku}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          sku: e.target
                            .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Imagen principal
                  <input
                    type="url"
                    value={publish.image_url}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          image_url:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Categoría
                  <select
                    value={publish.category}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          category:
                            e.target
                              .value,
                        })
                      )
                    }
                  >
                    {categories.map(
                      ([, name]) => (
                        <option key={name}>
                          {name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Imágenes adicionales
                  <textarea
                    rows="3"
                    value={publish.images}
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          images:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Descripción
                  <textarea
                    rows="5"
                    value={
                      publish.description
                    }
                    onChange={(e) =>
                      setPublish(
                        (c) => ({
                          ...c,
                          description:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </label>
              </div>

              <button
                style={styles.primary}
                disabled={publishLoading}
              >
                {publishLoading
                  ? "Publicando..."
                  : "Publicar producto"}
              </button>
            </form>
          )}
        </PageShell>
      )}

      {page === "seller-store" &&
        <SimplePage
          title={
            product?.sellerName ||
            "Tienda SHORASHOPP"
          }
          icon="🏪"
          text="Aquí aparecerán los productos, reputación y datos públicos del vendedor."
          back={() =>
            openPage("product")
          }
        />}

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
              {[
                ["⌂", "Inicio", "home"],
                ["▦", "Categorías", "categories"],
                ["✨", "Mi cuenta", "account"],
                ["📦", "Mis pedidos", "orders"],
                ["❤️", "Favoritos", "favorites"],
                ["💬", "Mensajes", "messages"],
                ["🔔", "Notificaciones", "notifications"],
                ["🏪", "Vender", "sell"],
                ["📍", "Direcciones", "addresses"],
                ["💳", "Métodos de pago", "payments"],
                ["💰", "Crédito SHORASHOPP", "credit"],
                ["🎁", "Referidos", "referrals"],
                ["⚙️", "Configuración", "settings"],
                ["🔐", "Privacidad y seguridad", "privacy"],
                ["🛟", "Soporte", "support"],
              ].map(([icon, label, target]) => (
                <button
                  key={target}
                  type="button"
                  style={styles.menu}
                  onClick={() =>
                    target === "account" &&
                    !session
                      ? openAuth("login")
                      : openPage(target)
                  }
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

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
            openPage("categories")
          }
        >
          <span>▦</span>
          <small>Categorías</small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={() =>
            session
              ? openPage("sell")
              : openAuth("register")
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
          <small>Carrito</small>
        </button>

        <button
          className={
            page === "account"
              ? "bottom-item active"
              : "bottom-item"
          }
          type="button"
          onClick={() =>
            session
              ? openPage("account")
              : openAuth("login")
          }
        >
          <span>✨</span>
          <small>Cuenta</small>
        </button>
      </nav>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
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
              {authMode === "login"
                ? "Bienvenido."
                : "Crea tu cuenta."}
            </h2>

            <p>
              {authMode === "login"
                ? "Inicia sesión en SHORASHOPP."
                : "Únete a SHORASHOPP."}
            </p>

            <form
              onSubmit={handleAuth}
            >
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
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
                  : authMode === "login"
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
                        "register"
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
                      setAuthMode("login");
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

function SimplePage({
  title,
  icon,
  text,
  back,
}) {
  return (
    <PageShell
      title={title}
      onBack={back}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece7f3",
          borderRadius: 18,
          padding: 20,
          boxShadow:
            "0 5px 18px rgba(50,16,74,.05)",
        }}
      >
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
    </PageShell>
  );
}

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
      onKeyDown={(e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
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
          onClick={(e) => {
            e.stopPropagation();
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
                product.compare_at_price
              )}
            </del>
          )}
        </div>

        <div className="rating-row">
          <span>★</span>{" "}
          {product.rating || "Nuevo"}

          <small>
            • {product.reviews || "Producto"}
          </small>
        </div>
      </div>
    </article>
  );
}

function money(value) {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    }
  ).format(Number(value || 0));
}

export default App;
