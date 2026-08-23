import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const categories = [
  { icon: "👕", name: "Ropa y Moda" },
  { icon: "📱", name: "Tecnología" },
  { icon: "🏠", name: "Hogar y Vida" },
  { icon: "💄", name: "Belleza y Salud" },
  { icon: "🎧", name: "Accesorios" },
  { icon: "🎮", name: "Juguetes y Más" },
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
    status: "approved",
    demo: true,
    specifications: [
      ["Conectividad", "Bluetooth"],
      ["Autonomía", "Hasta 6 horas"],
      ["Estuche", "Carga USB-C"],
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
    discount: "Nuevo",
    category: "Ropa y Moda",
    description:
      "Bolsa de hombro elegante para uso diario, con compartimentos interiores.",
    stock: 8,
    sku: "DEMO-BAG",
    image_url: "",
    images: [],
    status: "approved",
    demo: true,
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
    status: "approved",
    demo: true,
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
    status: "approved",
    demo: true,
    specifications: [
      ["Potencia", "1000 W"],
      ["Vaso", "1.5 L"],
      ["Velocidades", "Variable"],
      ["Material", "Acero y plástico"],
    ],
  },
];

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));

const normalizeProduct = (p) => ({
  ...p,
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
            const parsed = JSON.parse(p.images);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [],
  category: p.category || p.category_name || "Otros",
  description: p.description || "Producto publicado en SHORASHOPP.",
});

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [currentPage, setCurrentPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [sellerStore, setSellerStore] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const [productForm, setProductForm] = useState({
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

  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!error) {
        setSession(data?.session ?? null);
      }

      setAuthReady(true);
    };

    initializeAuth();

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

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      setProducts(data.map(normalizeProduct));
    } else {
      setProducts([]);
    }

    setProductsLoading(false);
  };

  const loadSellerStore = async (userId) => {
    setSellerLoading(true);

    const { data, error } = await supabase
      .from("seller_stores")
      .select("*")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();

    setSellerStore(!error ? data : null);
    setSellerLoading(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    openPage("home");
  };

  const showActionMessage = (text) => {
    setActionMessage(text);

    window.clearTimeout(window.__shoraMessageTimer);

    window.__shoraMessageTimer = window.setTimeout(() => {
      setActionMessage("");
    }, 2200);
  };

  const openPage = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setCurrentPage("home");
    setSelectedProduct(null);
    setSelectedCategory("");
    setSearchTerm("");
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAccountAccess = () => {
    if (session) {
      openPage("account");
    } else {
      openAuth("login");
    }
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(
      1,
      Math.min(Number(quantity) || 1, product.stock || 999)
    );

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + qty,
                  product.stock || item.quantity + qty
                ),
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: qty,
        },
      ];
    });

    showActionMessage("Producto agregado al carrito.");
  };

  const removeFromCart = (productId) => {
    setCart((current) =>
      current.filter((item) => item.id !== productId)
    );
  };

  const updateCartQuantity = (productId, quantity) => {
    const safeQuantity = Number(quantity);

    if (safeQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.min(
                safeQuantity,
                item.stock || safeQuantity
              ),
            }
          : item
      )
    );
  };

  const buyNow = (product) => {
    setCheckoutItems([
      {
        ...product,
        quantity: 1,
      },
    ]);

    openPage("checkout");
  };

  const checkoutCart = () => {
    if (!cart.length) {
      showActionMessage("Tu carrito está vacío.");
      return;
    }

    setCheckoutItems(cart);
    openPage("checkout");
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const checkoutTotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        !selectedCategory ||
        product.category === selectedCategory;

      const searchMatches =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      return categoryMatches && searchMatches;
    });
  }, [products, selectedCategory, searchTerm]);

  const toggleFavorite = (productId) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchTerm("");
    openPage("home");

    window.setTimeout(() => {
      document.querySelector(".products-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleSearch = () => {
    openPage("home");

    window.setTimeout(() => {
      document.querySelector(".products-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const startPublishing = () => {
    if (!session) {
      openAuth("login");
      return;
    }

    openPage("publish");
  };

  const handleProductFormChange = (field, value) => {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const publishProduct = async (event) => {
    event.preventDefault();

    if (!session?.user?.id) {
      openAuth("login");
      return;
    }

    if (!sellerStore?.id) {
      showActionMessage(
        "Primero necesitas una tienda de vendedor vinculada a tu cuenta."
      );
      return;
    }

    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (
      !productForm.name.trim() ||
      !price ||
      price < 0 ||
      stock < 0
    ) {
      showActionMessage(
        "Completa nombre, precio y stock correctamente."
      );
      return;
    }

    setPublishLoading(true);

    try {
      const imageList = productForm.images
        .split(/\n|,/)
        .map((url) => url.trim())
        .filter(Boolean);

      const { error } = await supabase.from("products").insert({
        seller_id: sellerStore.id,
        name: productForm.name.trim(),
        slug:
          productForm.name
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
          "-" +
          Date.now(),
        description: productForm.description.trim(),
        price,
        compare_at_price: productForm.compare_at_price
          ? Number(productForm.compare_at_price)
          : null,
        stock,
        sku: productForm.sku.trim() || null,
        image_url: productForm.image_url.trim() || null,
        images: imageList,
        status: "pending",
      });

      if (error) throw error;

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

      showActionMessage(
        "Producto enviado para aprobación."
      );

      await loadProducts();
    } catch (error) {
      showActionMessage(
        error?.message || "No se pudo publicar el producto."
      );
    } finally {
      setPublishLoading(false);
    }
  };

  const productImage = (product) =>
    product?.image_url ||
    (Array.isArray(product?.images)
      ? product.images[0]
      : "") ||
    "";

  const goToCategories = () => {
    openPage("home");

    window.setTimeout(() => {
      document.querySelector(".content-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const goToProducts = () => {
    openPage("home");

    window.setTimeout(() => {
      document.querySelector(".products-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #ece7f3",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 5px 18px rgba(50,16,74,.05)",
  };

  const primaryButton = {
    border: 0,
    borderRadius: 14,
    padding: "14px 18px",
    background: "linear-gradient(135deg,#ed174d,#7020d0)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  };

  const secondaryButton = {
    border: "1px solid #7020d0",
    borderRadius: 14,
    padding: "14px 18px",
    background: "#fff",
    color: "#7020d0",
    fontWeight: 800,
    cursor: "pointer",
  };

  const pageTitle = {
    fontSize: 28,
    margin: "12px 0 6px",
    color: "#24152f",
  };

  if (!authReady) {
    return (
      <div
        className="app"
        style={{
          minHeight: "100vh",
          padding: 30,
        }}
      >
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
            type="button"
            className="notification-button"
            onClick={() => openPage("notifications")}
          >
            🔔<i>3</i>
          </button>

          <button
            type="button"
            className="cart-button"
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
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
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

      {currentPage !== "home" && (
        <section
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "18px 16px 120px",
          }}
        >
          <button
            type="button"
            onClick={goHome}
            style={{
              border: 0,
              background: "transparent",
              color: "#7020d0",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>

          {currentPage === "product" &&
            selectedProduct && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    ...cardStyle,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      minHeight: 260,
                      borderRadius: 16,
                      background: "#f6f2fa",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                    }}
                  >
                    {productImage(selectedProduct) ? (
                      <img
                        src={productImage(selectedProduct)}
                        alt={selectedProduct.name}
                        style={{
                          width: "100%",
                          height: 300,
                          objectFit: "contain",
                          borderRadius: 16,
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 92 }}>
                        {selectedProduct.category ===
                        "Tecnología"
                          ? "📱"
                          : selectedProduct.category ===
                            "Ropa y Moda"
                            ? "👜"
                            : selectedProduct.category ===
                              "Hogar y Vida"
                              ? "🏠"
                              : "🛍️"}
                      </div>
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        background: "#ed174d",
                        color: "#fff",
                        borderRadius: 20,
                        padding: "7px 11px",
                        fontWeight: 800,
                      }}
                    >
                      {selectedProduct.discount ||
                        (selectedProduct.stock > 0
                          ? "Disponible"
                          : "Agotado")}
                    </span>
                  </div>

                  <div style={{ paddingTop: 20 }}>
                    <div
                      style={{
                        color: "#7020d0",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {selectedProduct.category}
                    </div>

                    <h1 style={pageTitle}>
                      {selectedProduct.name}
                    </h1>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 28,
                          color: "#24152f",
                        }}
                      >
                        {money(selectedProduct.price)}
                      </strong>

                      {selectedProduct.compare_at_price && (
                        <del style={{ color: "#999" }}>
                          {money(
                            selectedProduct.compare_at_price
                          )}
                        </del>
                      )}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      ⭐ {selectedProduct.rating || "Nuevo"}{" "}
                      <span style={{ color: "#777" }}>
                        •{" "}
                        {selectedProduct.reviews ||
                          "Producto publicado"}
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#555",
                        lineHeight: 1.7,
                      }}
                    >
                      {selectedProduct.description}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        margin: "18px 0",
                      }}
                    >
                      <button
                        type="button"
                        style={secondaryButton}
                        disabled={!selectedProduct.stock}
                        onClick={() =>
                          addToCart(selectedProduct)
                        }
                      >
                        🛒 Añadir al carrito
                      </button>

                      <button
                        type="button"
                        style={primaryButton}
                        disabled={!selectedProduct.stock}
                        onClick={() =>
                          buyNow(selectedProduct)
                        }
                      >
                        Comprar ahora
                      </button>
                    </div>

                    <div
                      style={{
                        ...cardStyle,
                        marginTop: 14,
                      }}
                    >
                      <h2 style={{ marginTop: 0 }}>
                        Especificaciones
                      </h2>

                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        {(
                          selectedProduct.specifications || [
                            [
                              "SKU",
                              selectedProduct.sku ||
                                "No especificado",
                            ],
                            [
                              "Stock",
                              String(
                                selectedProduct.stock
                              ),
                            ],
                            [
                              "Categoría",
                              selectedProduct.category,
                            ],
                            [
                              "Estado",
                              "Producto aprobado",
                            ],
                          ]
                        ).map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: 16,
                              borderBottom:
                                "1px solid #eee",
                              paddingBottom: 9,
                            }}
                          >
                            <strong>{label}</strong>

                            <span
                              style={{
                                color: "#666",
                                textAlign: "right",
                              }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {currentPage === "cart" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>Tu carrito</h1>

              {!cart.length ? (
                <div style={cardStyle}>
                  <div style={{ fontSize: 48 }}>
                    🛒
                  </div>

                  <h2>Tu carrito está vacío</h2>

                  <p style={{ color: "#666" }}>
                    Agrega productos desde sus páginas
                    para comenzar tu compra.
                  </p>

                  <button
                    type="button"
                    style={primaryButton}
                    onClick={goToProducts}
                  >
                    Ver productos
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          ...cardStyle,
                          display: "grid",
                          gridTemplateColumns:
                            "80px 1fr",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 14,
                            background: "#f6f2fa",
                            display: "grid",
                            placeItems: "center",
                            overflow: "hidden",
                          }}
                        >
                          {productImage(item) ? (
                            <img
                              src={productImage(item)}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 34,
                              }}
                            >
                              🛍️
                            </span>
                          )}
                        </div>

                        <div>
                          <strong>{item.name}</strong>

                          <div
                            style={{
                              color: "#7020d0",
                              fontWeight: 800,
                            }}
                          >
                            {money(item.price)}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              marginTop: 8,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  item.id,
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
                                updateCartQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(item.id)
                              }
                              style={{
                                marginLeft: "auto",
                                border: 0,
                                background:
                                  "transparent",
                                color: "#d41452",
                                fontWeight: 700,
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      ...cardStyle,
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        fontSize: 20,
                        marginBottom: 14,
                      }}
                    >
                      <strong>Total</strong>
                      <strong>
                        {money(cartTotal)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      style={primaryButton}
                      onClick={checkoutCart}
                    >
                      Continuar compra
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {currentPage === "checkout" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Comprar ahora
              </h1>

              <p style={{ color: "#666" }}>
                Revisa tu compra antes de continuar al
                pago.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    style={cardStyle}
                  >
                    <strong>{item.name}</strong>

                    <div style={{ color: "#666" }}>
                      {item.quantity} ×{" "}
                      {money(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  ...cardStyle,
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: 22,
                  }}
                >
                  <strong>Total</strong>

                  <strong>
                    {money(checkoutTotal)}
                  </strong>
                </div>

                <p
                  style={{
                    color: "#777",
                    lineHeight: 1.5,
                  }}
                >
                  El siguiente paso será conectar el
                  método de pago y la creación del pedido.
                  No se realiza ningún cargo desde esta
                  pantalla.
                </p>

                <button
                  type="button"
                  style={primaryButton}
                  onClick={() =>
                    showActionMessage(
                      "Flujo de pago preparado."
                    )
                  }
                >
                  Continuar al pago
                </button>
              </div>
            </div>
          )}

          {currentPage === "publish" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Publicar producto
              </h1>

              <p style={{ color: "#666" }}>
                Agrega un producto real a tu tienda.
                Quedará como <b>pendiente</b> hasta que
                sea aprobado.
              </p>

              {sellerLoading ? (
                <div style={cardStyle}>
                  Comprobando tu tienda de vendedor...
                </div>
              ) : !sellerStore ? (
                <div style={cardStyle}>
                  <div style={{ fontSize: 44 }}>
                    🏪
                  </div>

                  <h2>
                    No hay una tienda vinculada
                  </h2>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: 1.6,
                    }}
                  >
                    Tu cuenta debe tener un registro en{" "}
                    <code>seller_stores</code> cuyo{" "}
                    <code>owner_id</code> sea tu usuario
                    actual.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={publishProduct}
                  style={{
                    ...cardStyle,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong>Tienda</strong>

                    <div
                      style={{
                        color: "#7020d0",
                        fontWeight: 800,
                      }}
                    >
                      {sellerStore.store_name}
                    </div>
                  </div>

                  {[
                    [
                      "name",
                      "Nombre del producto",
                      "text",
                    ],
                    ["price", "Precio", "number"],
                    [
                      "compare_at_price",
                      "Precio anterior (opcional)",
                      "number",
                    ],
                    ["stock", "Stock", "number"],
                    [
                      "sku",
                      "SKU (opcional)",
                      "text",
                    ],
                    [
                      "image_url",
                      "URL de imagen principal (opcional)",
                      "url",
                    ],
                    [
                      "images",
                      "URLs de imágenes adicionales, una por línea",
                      "text",
                    ],
                  ].map(([field, label, type]) => (
                    <label
                      key={field}
                      style={{
                        display: "grid",
                        gap: 6,
                        fontWeight: 700,
                      }}
                    >
                      {label}

                      {field === "images" ? (
                        <textarea
                          value={productForm[field]}
                          onChange={(e) =>
                            handleProductFormChange(
                              field,
                              e.target.value
                            )
                          }
                          rows={3}
                          style={inputStyle}
                        />
                      ) : (
                        <input
                          type={type}
                          value={productForm[field]}
                          min={
                            type === "number"
                              ? "0"
                              : undefined
                          }
                          onChange={(e) =>
                            handleProductFormChange(
                              field,
                              e.target.value
                            )
                          }
                          style={inputStyle}
                          required={[
                            "name",
                            "price",
                            "stock",
                          ].includes(field)}
                        />
                      )}
                    </label>
                  ))}

                  <label
                    style={{
                      display: "grid",
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    Categoría

                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        handleProductFormChange(
                          "category",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      {categories.map((category) => (
                        <option key={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    style={{
                      display: "grid",
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    Descripción

                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        handleProductFormChange(
                          "description",
                          e.target.value
                        )
                      }
                      rows={5}
                      style={inputStyle}
                    />
                  </label>

                  <button
                    type="submit"
                    style={primaryButton}
                    disabled={publishLoading}
                  >
                    {publishLoading
                      ? "Publicando..."
                      : "Publicar producto"}
                  </button>
                </form>
              )}
            </div>
          )}

          {currentPage === "account" && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg,#ed174d,#7020d0)",
                  color: "#fff",
                  borderRadius: 22,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  SHORASHOPP
                </div>

                <h1 style={{ margin: "6px 0" }}>
                  Mi cuenta
                </h1>

                <p
                  style={{
                    margin: 0,
                    opacity: 0.9,
                  }}
                >
                  {session?.user?.email ||
                    "Sesión iniciada"}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("orders")
                  }
                >
                  📦 Tus pedidos <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("messages")
                  }
                >
                  💬 Mensajes <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={startPublishing}
                >
                  🏪 Publicar productos{" "}
                  <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("notifications")
                  }
                >
                  🔔 Notificaciones{" "}
                  <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("privacy")
                  }
                >
                  🔐 Privacidad y seguridad{" "}
                  <span>›</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    ...cardButtonStyle,
                    color: "#d41452",
                  }}
                >
                  🚪 Cerrar sesión <span>›</span>
                </button>
              </div>
            </div>
          )}

          {currentPage === "orders" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Tus pedidos
              </h1>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("my-orders")
                  }
                >
                  📦 Tus pedidos <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("tracking")
                  }
                >
                  🚚 Seguimiento <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("confirmations")
                  }
                >
                  ✅ Confirmaciones{" "}
                  <span>›</span>
                </button>
              </div>
            </div>
          )}

          {[
            "my-orders",
            "tracking",
            "confirmations",
          ].includes(currentPage) && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                {currentPage === "my-orders"
                  ? "Tus pedidos"
                  : currentPage === "tracking"
                    ? "Seguimiento"
                    : "Confirmaciones"}
              </h1>

              <div style={cardStyle}>
                <div style={{ fontSize: 48 }}>
                  {currentPage === "my-orders"
                    ? "📦"
                    : currentPage === "tracking"
                      ? "🚚"
                      : "✅"}
                </div>

                <h2>
                  {currentPage === "my-orders"
                    ? "Aquí aparecerán tus compras"
                    : currentPage === "tracking"
                      ? "Aquí podrás seguir tus envíos"
                      : "Aquí estarán las confirmaciones de tus pedidos"}
                </h2>

                <p
                  style={{
                    color: "#666",
                    lineHeight: 1.6,
                  }}
                >
                  La pantalla ya está preparada para
                  conectarse con la tabla de pedidos cuando
                  ese flujo se active.
                </p>
              </div>
            </div>
          )}

          {currentPage === "messages" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Mensajes
              </h1>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {[
                  [
                    "Vendedores",
                    "Habla directamente con los vendedores.",
                  ],
                  [
                    "Soporte SHORA SHOP",
                    "Obtén ayuda con tu cuenta y compras.",
                  ],
                  [
                    "Conversaciones",
                    "Consulta tus conversaciones recientes.",
                  ],
                ].map(([title, text]) => (
                  <button
                    key={title}
                    type="button"
                    style={{
                      ...cardButtonStyle,
                      display: "grid",
                      gap: 5,
                    }}
                    onClick={() =>
                      showActionMessage(
                        `${title}: próximamente conectado.`
                      )
                    }
                  >
                    <strong>
                      💬 {title}
                    </strong>

                    <span
                      style={{
                        color: "#777",
                        fontWeight: 500,
                      }}
                    >
                      {text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentPage === "notifications" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Notificaciones
              </h1>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {[
                  [
                    "🛍️ Ofertas",
                    "Nuevas ofertas y promociones.",
                  ],
                  [
                    "📦 Pedidos",
                    "Actualizaciones de tus pedidos.",
                  ],
                  [
                    "🔔 Cuenta",
                    "Avisos importantes de SHORASHOPP.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    style={cardStyle}
                  >
                    <strong>{title}</strong>

                    <p
                      style={{
                        marginBottom: 0,
                        color: "#666",
                      }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === "privacy" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Privacidad y seguridad
              </h1>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("sessions")
                  }
                >
                  📱 Sesiones activas{" "}
                  <span>›</span>
                </button>

                <button
                  style={cardButtonStyle}
                  type="button"
                  onClick={() =>
                    openPage("security")
                  }
                >
                  🛡️ Verificación de seguridad{" "}
                  <span>›</span>
                </button>
              </div>
            </div>
          )}

          {currentPage === "sessions" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Sesiones activas
              </h1>

              <div style={cardStyle}>
                <p style={{ color: "#666" }}>
                  Sesión actual:{" "}
                  {session?.user?.email ||
                    "No identificada"}
                </p>

                <button
                  type="button"
                  style={primaryButton}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {currentPage === "security" && (
            <div style={{ marginTop: 14 }}>
              <h1 style={pageTitle}>
                Verificación de seguridad
              </h1>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={cardStyle}>
                  <strong>
                    🔑 Contraseña
                  </strong>

                  <p style={{ color: "#666" }}>
                    Gestionada de forma segura por
                    Supabase Auth.
                  </p>
                </div>

                <div style={cardStyle}>
                  <strong>
                    ✉️ Correo
                  </strong>

                  <p style={{ color: "#666" }}>
                    {session?.user?.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {currentPage === "home" && (
        <main>
          <section className="quick-cards">
            <button
              className="quick-card sell-card"
              type="button"
              onClick={startPublishing}
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
                  Publica tus productos y comienza a
                  vender.
                </span>
              </div>

              <b className="round-arrow">
                ›
              </b>
            </button>

            <button
              className="quick-card account-card"
              type="button"
              onClick={handleAccountAccess}
            >
              <div className="quick-icon">
                ♙
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
                  setSelectedCategory("")
                }
              >
                Ver todas <span>›</span>
              </button>
            </div>

            <div className="categories-scroll">
              {categories.map((category) => (
                <button
                  className="category-item"
                  key={category.name}
                  type="button"
                  onClick={() =>
                    handleCategoryClick(
                      category.name
                    )
                  }
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <span>
                    {category.name}
                  </span>
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
                  onClick={goToProducts}
                >
                  Ver ofertas <b>›</b>
                </button>
              </div>

              <div className="offer-products">
                <div className="offer-bag">
                  🛍️
                </div>

                <div className="offer-watch">
                  ⌚
                </div>

                <div className="offer-shoe">
                  👟
                </div>

                <div className="offer-percent">
                  %
                </div>
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
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                }}
              >
                Cargando productos...
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(
                    (product) => (
                      <article
                        className="product-card"
                        key={product.id}
                        onClick={() =>
                          openProduct(product)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            openProduct(product);
                          }
                        }}
                      >
                        <div className="product-image">
                          <span className="product-label">
                            {product.compare_at_price &&
                            product.price <
                              product.compare_at_price
                              ? `${Math.round(
                                  ((product.compare_at_price -
                                    product.price) /
                                    product.compare_at_price) *
                                    100
                                )}% OFF`
                              : product.stock > 0
                                ? "Disponible"
                                : "Agotado"}
                          </span>

                          <button
                            className="heart-button"
                            type="button"
                            aria-label="Favorito"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavorite(
                                product.id
                              );
                            }}
                          >
                            {favorites.includes(
                              product.id
                            )
                              ? "♥"
                              : "♡"}
                          </button>

                          <div className="product-art">
                            {productImage(product) ? (
                              <img
                                src={productImage(
                                  product
                                )}
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  borderRadius: 14,
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: 60,
                                }}
                              >
                                🛍️
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="product-info">
                          <h3>
                            {product.name}
                          </h3>

                          <div className="price-row">
                            <strong>
                              {money(
                                product.price
                              )}
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
                            <span>★</span>

                            {product.rating ||
                              "Nuevo"}

                            <small>
                              • {product.stock} disponibles
                            </small>
                          </div>
                        </div>
                      </article>
                    )
                  )
                ) : (
                  <div
                    style={{
                      padding: 30,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    No hay productos aprobados con
                    esa búsqueda.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="trust-section">
            <div className="trust-item">
              <span>♢</span>
              <strong>Compra segura</strong>
              <small>
                Protegemos tus datos y compras
              </small>
            </div>

            <div className="trust-item">
              <span>♧</span>
              <strong>Envíos rápidos</strong>
              <small>
                Recibe tus productos en tiempo récord
              </small>
            </div>

            <div className="trust-item">
              <span>✿</span>
              <strong>
                Vendedores verificados
              </strong>
              <small>
                Más confianza para ti
              </small>
            </div>

            <div className="trust-item">
              <span>☏</span>
              <strong>Soporte 24/7</strong>
              <small>
                Estamos aquí para ayudarte
              </small>
            </div>
          </section>
        </main>
      )}

      {menuOpen && (
        <div
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setMenuOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            zIndex: 10000,
          }}
        >
          <aside
            style={{
              width: "min(330px, 88vw)",
              height: "100%",
              background: "#fff",
              padding: 20,
              boxShadow:
                "8px 0 30px rgba(0,0,0,.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <strong
                style={{ fontSize: 23 }}
              >
                SHORASHOPP
              </strong>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
                style={{
                  border: 0,
                  background: "#f5f5f7",
                  borderRadius: 12,
                  width: 40,
                  height: 40,
                  fontSize: 22,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={goHome}
                style={menuButtonStyle}
              >
                ⌂ Inicio
              </button>

              <button
                type="button"
                onClick={handleAccountAccess}
                style={menuButtonStyle}
              >
                ✨ Mi cuenta
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage("orders")
                }
                style={menuButtonStyle}
              >
                📦 Tus pedidos
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage("messages")
                }
                style={menuButtonStyle}
              >
                💬 Mensajes
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage("notifications")
                }
                style={menuButtonStyle}
              >
                🔔 Notificaciones
              </button>

              <button
                type="button"
                onClick={startPublishing}
                style={menuButtonStyle}
              >
                🏪 Publicar producto
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage("cart")
                }
                style={menuButtonStyle}
              >
                🛒 Carrito ({cartCount})
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage("privacy")
                }
                style={menuButtonStyle}
              >
                🔐 Privacidad y seguridad
              </button>
            </div>
          </aside>
        </div>
      )}

      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          display: "grid",
          gridTemplateColumns:
            "repeat(5,1fr)",
          background: "#fff",
          borderTop: "1px solid #eee",
          padding:
            "7px 5px calc(7px + env(safe-area-inset-bottom))",
        }}
      >
        <button
          className="bottom-item active"
          type="button"
          onClick={goHome}
        >
          <span>⌂</span>
          <small>Inicio</small>
        </button>

        <button
          className="bottom-item"
          type="button"
          onClick={goToCategories}
        >
          <span>▦</span>
          <small>Categorías</small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={startPublishing}
        >
          <span>▰</span>
          <small>Vender</small>
        </button>

        <button
          className="bottom-item"
          type="button"
          onClick={() =>
            openPage("cart")
          }
        >
          <span>🛒</span>
          <small>Carrito</small>
        </button>

        <button
          className="bottom-item"
          type="button"
          onClick={handleAccountAccess}
        >
          <span>♙</span>
          <small>Cuenta</small>
        </button>
      </nav>

      {actionMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform:
              "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 20,
            zIndex: 11000,
            fontSize: 13,
            textAlign: "center",
            maxWidth: "90vw",
          }}
        >
          {actionMessage}
        </div>
      )}

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
              {authMode === "login"
                ? "Bienvenido."
                : "Crea tu cuenta."}
            </h2>

            <p>
              {authMode === "login"
                ? "Inicia sesión en SHORASHOPP."
                : "Únete a SHORASHOPP."}
            </p>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
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
                    event.target.value
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
                    event.target.value
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
              {authMode === "login" ? (
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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "12px 13px",
  fontSize: 15,
  background: "#fff",
};

const cardButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: 16,
  border: "1px solid #ece7f3",
  borderRadius: 16,
  background: "#fff",
  color: "#24152f",
  fontWeight: 800,
  textAlign: "left",
  cursor: "pointer",
  boxShadow:
    "0 5px 18px rgba(50,16,74,.05)",
};

const menuButtonStyle = {
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

export default App;
