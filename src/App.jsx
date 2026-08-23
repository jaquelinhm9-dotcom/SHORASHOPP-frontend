import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

const categories = [
  { name: "Tecnología", icon: "💻" },
  { name: "Hogar", icon: "🏠" },
  { name: "Moda", icon: "👕" },
  { name: "Belleza", icon: "💄" },
  { name: "Deportes", icon: "⚽" },
  { name: "Accesorios", icon: "👜" },
  { name: "Videojuegos", icon: "🎮" },
  { name: "Otros", icon: "✨" },
];

const demoProducts = [
  {
    id: "demo-1",
    name: "Audífonos inalámbricos",
    description: "Audífonos Bluetooth con estuche de carga.",
    price: 599,
    oldPrice: 899,
    compare_at_price: 899,
    stock: 12,
    rating: 4.8,
    reviews: 128,
    category: "Tecnología",
    sellerName: "Tech Store",
    image_url: "",
    images: [],
    variants: ["Negro", "Blanco"],
  },
  {
    id: "demo-2",
    name: "Smartwatch Pro",
    description: "Reloj inteligente con monitoreo y notificaciones.",
    price: 899,
    oldPrice: 1299,
    compare_at_price: 1299,
    stock: 8,
    rating: 4.7,
    reviews: 94,
    category: "Tecnología",
    sellerName: "Digital MX",
    image_url: "",
    images: [],
    variants: ["Negro", "Plata"],
  },
  {
    id: "demo-3",
    name: "Tenis deportivos",
    description: "Tenis cómodos para entrenamiento y uso diario.",
    price: 749,
    oldPrice: 999,
    compare_at_price: 999,
    stock: 20,
    rating: 4.6,
    reviews: 76,
    category: "Deportes",
    sellerName: "Sport House",
    image_url: "",
    images: [],
    variants: ["25", "26", "27", "28"],
  },
  {
    id: "demo-4",
    name: "Bolsa casual",
    description: "Bolsa moderna para uso diario.",
    price: 449,
    oldPrice: 699,
    compare_at_price: 699,
    stock: 15,
    rating: 4.9,
    reviews: 51,
    category: "Moda",
    sellerName: "Style Shop",
    image_url: "",
    images: [],
    variants: ["Rosa", "Negro"],
  },
];

const normalizeProduct = (product) => ({
  ...product,
  price: Number(product.price || 0),
  oldPrice:
    product.oldPrice !== undefined && product.oldPrice !== null
      ? Number(product.oldPrice)
      : product.compare_at_price
      ? Number(product.compare_at_price)
      : null,
  compare_at_price:
    product.compare_at_price !== undefined && product.compare_at_price !== null
      ? Number(product.compare_at_price)
      : null,
  stock: Number(product.stock || 0),
  rating: Number(product.rating || 4.8),
  reviews: Number(product.reviews || 0),
  images: Array.isArray(product.images) ? product.images : [],
  variants: Array.isArray(product.variants) ? product.variants : [],
});

function ProductCard({ product, favorite, onFavorite, onClick }) {
  const image = product.image_url || product.images?.[0] || "";

  return (
    <article
      className="product-card"
      tabIndex="0"
      onClick={() => onClick(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onClick(product);
      }}
    >
      <div className="product-image">
        {product.oldPrice && product.price < product.oldPrice && (
          <span className="product-label">OFERTA</span>
        )}

        <button
          type="button"
          className="heart-button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite(product.id);
          }}
          aria-label="Favorito"
        >
          {favorite ? "♥" : "♡"}
        </button>

        <div className="product-art">
          {image ? (
            <img src={image} alt={product.name} />
          ) : (
            <span>🛍️</span>
          )}
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="price-row">
          <strong>${product.price.toLocaleString("es-MX")}</strong>

          {product.oldPrice && (
            <del>${product.oldPrice.toLocaleString("es-MX")}</del>
          )}
        </div>

        <div className="rating-row">
          <span>★</span> {product.rating}
          <small> • {product.reviews}</small>
        </div>
      </div>
    </article>
  );
}

function HomePage({
  products,
  productsLoading,
  selectedCategory,
  session,
  favorites,
  onFavorite,
  onProduct,
  onSell,
  onAccount,
  onCategory,
  onCategories,
  onOffers,
  onAll,
}) {
  return (
    <main className="home-main">
      <section className="quick-cards">
        <button type="button" className="quick-card sell-card" onClick={onSell}>
          <div className="quick-icon">🛒</div>

          <div className="quick-content">
            <strong>Vende en SHORASHOPP</strong>
            <span>Publica tus productos y llega a más compradores.</span>
          </div>

          <span className="round-arrow">›</span>
        </button>

        <button
          type="button"
          className="quick-card account-card"
          onClick={onAccount}
        >
          <div className="quick-icon">👤</div>

          <div className="quick-content">
            <strong>
              {session ? "Mi cuenta" : "Únete a SHORASHOPP"}
            </strong>
            <span>
              {session
                ? "Consulta tus pedidos, favoritos y configuración."
                : "Crea tu cuenta y empieza a comprar."}
            </span>
          </div>

          <span className="round-arrow">›</span>
        </button>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <h2>Categorías</h2>

          <button type="button" onClick={onCategories}>
            Ver todas
          </button>
        </div>

        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className="category-item"
              onClick={() => onCategory(category.name)}
            >
              <div className="category-icon">{category.icon}</div>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="offer-section">
        <div className="offer-banner">
          <div className="offer-text">
            <strong>OFERTAS</strong>
            <span>Encuentra productos increíbles a precios especiales.</span>

            <button type="button" onClick={onOffers}>
              Ver ofertas
            </button>
          </div>

          <div className="offer-products" aria-hidden="true">
            <div>🎧</div>
            <div>⌚</div>
            <div>👟</div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <h2>
            {selectedCategory
              ? selectedCategory
              : "Productos destacados"}
          </h2>

          <button type="button" onClick={onAll}>
            Ver todos
          </button>
        </div>

        <div className="products-grid">
          {productsLoading ? (
            <div className="empty-inline">
              Cargando productos...
            </div>
          ) : products.length ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
                onClick={onProduct}
              />
            ))
          ) : (
            <div className="empty-inline">
              No encontramos productos con esa búsqueda.
            </div>
          )}
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-item">
          <span>🔐</span>
          <strong>Compra segura</strong>
          <small>Protegemos tus datos y compras</small>
        </div>

        <div className="trust-item">
          <span>⚡</span>
          <strong>Envíos rápidos</strong>
          <small>Recibe tus productos en tiempo récord</small>
        </div>

        <div className="trust-item">
          <span>✓</span>
          <strong>Vendedores verificados</strong>
          <small>Más confianza para ti</small>
        </div>

        <div className="trust-item">
          <span>💬</span>
          <strong>Soporte 24/7</strong>
          <small>Estamos aquí para ayudarte</small>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [currentPage, setCurrentPage] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const [headerHidden, setHeaderHidden] = useState(false);
  const homeScrollRef = useRef(null);

  const [products, setProducts] = useState(demoProducts);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("");

  const [sellerStore, setSellerStore] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSession(data?.session || null);
        setAuthReady(true);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
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

  useEffect(() => {
    if (currentPage !== "home") {
      setHeaderHidden(false);
      return;
    }

    const scrollArea = homeScrollRef.current;
    if (!scrollArea) return;

    let lastScrollTop = scrollArea.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = scrollArea.scrollTop;
      const delta = currentScrollTop - lastScrollTop;

      if (Math.abs(delta) >= 4) {
        if (delta > 0 && currentScrollTop > 24) {
          setHeaderHidden(true);
        } else if (delta < 0) {
          setHeaderHidden(false);
        }
      }

      if (currentScrollTop <= 24) {
        setHeaderHidden(false);
      }

      lastScrollTop = currentScrollTop;
    };

    scrollArea.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage]);

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
        setProducts(demoProducts.map(normalizeProduct));
      }
    } catch {
      setProducts(demoProducts.map(normalizeProduct));
    } finally {
      setProductsLoading(false);
    }
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
    } finally {
      setSellerLoading(false);
    }
  };

  const openPage = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    setHeaderHidden(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setCurrentPage("home");
    setSelectedProduct(null);
    setSelectedCategory("");
    setSearchTerm("");
    setMenuOpen(false);
    setHeaderHidden(false);

    requestAnimationFrame(() => {
      if (homeScrollRef.current) {
        homeScrollRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  };

  const showActionMessage = (text) => {
    setActionMessage(text);

    window.clearTimeout(window.__shoraMessageTimer);

    window.__shoraMessageTimer = window.setTimeout(
      () => setActionMessage(""),
      2600
    );
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
      setMessage(
        error?.message || "No se pudo completar la operación."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    goHome();
  };

  const openProduct = (product) => {
    const normalized = normalizeProduct(product);

    setSelectedProduct(normalized);
    setSelectedVariant(normalized.variants?.[0] || "");
    openPage("product");
  };

  const addToCart = (
    product,
    quantity = 1,
    variant = selectedVariant
  ) => {
    const qty = Math.max(
      1,
      Math.min(Number(quantity) || 1, product.stock || 999)
    );

    const key = `${product.id}-${variant || "default"}`;

    setCart((current) => {
      const existing = current.find(
        (item) => item.cartKey === key
      );

      if (existing) {
        return current.map((item) =>
          item.cartKey === key
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
          variant: variant || "",
          cartKey: key,
        },
      ];
    });

    showActionMessage("Producto agregado al carrito.");
  };

  const removeFromCart = (cartKey) => {
    setCart((current) =>
      current.filter((item) => item.cartKey !== cartKey)
    );
  };

  const updateCartQuantity = (cartKey, quantity) => {
    const q = Number(quantity);

    if (q <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: Math.min(q, item.stock || q),
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

  const buyNow = (product) => {
    setCheckoutItems([
      {
        ...product,
        quantity: 1,
        variant: selectedVariant,
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

  const toggleFavorite = (productId) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

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
        product.category.toLowerCase().includes(search) ||
        String(product.sellerName || "")
          .toLowerCase()
          .includes(search);

      return categoryMatches && searchMatches;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedCategory("");
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");

    if (currentPage !== "home") {
      goHome();
    }
  };

  const handleAccountAccess = () => {
    if (session) {
      openPage("account");
    } else {
      openAuth("login");
    }
  };

  const startPublishing = () => {
    if (!session) {
      openAuth("login");
      return;
    }

    openPage("sell");
  };

  const productImage = (product) =>
    product?.image_url || product?.images?.[0] || "";

  if (!authReady) {
    return (
      <div className="loading-screen">
        <strong>SHORASHOPP</strong>
        <p>Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div
      className={`app ${
        currentPage === "home" ? "home-screen" : ""
      }`}
    >
      <header
        className={`mobile-header ${
          currentPage === "home" && headerHidden
            ? "header-hidden"
            : ""
        }`}
      >
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
            onClick={() => openPage("notifications")}
          >
            🔔
            <i>3</i>
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={() => openPage("cart")}
          >
            🛒
            <i>{cartCount}</i>
          </button>
        </div>
      </header>

      {currentPage === "home" ? (
        <div
          className="home-scroll"
          ref={homeScrollRef}
        >
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
                onKeyDown={(event) =>
                  event.key === "Enter" && handleSearch()
                }
              />

              <button
                type="button"
                onClick={handleSearch}
              >
                ⌕
              </button>
            </div>
          </div>

          <HomePage
            products={filteredProducts}
            productsLoading={productsLoading}
            selectedCategory={selectedCategory}
            session={session}
            favorites={favorites}
            onFavorite={toggleFavorite}
            onProduct={openProduct}
            onSell={startPublishing}
            onAccount={handleAccountAccess}
            onCategory={handleCategoryClick}
            onCategories={() => openPage("categories")}
            onOffers={() => openPage("offers")}
            onAll={() => {
              setSelectedCategory("");
              setSearchTerm("");
            }}
          />
        </div>
      ) : (
        <div className="non-home-search">
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
                onKeyDown={(event) =>
                  event.key === "Enter" && handleSearch()
                }
              />

              <button
                type="button"
                onClick={handleSearch}
              >
                ⌕
              </button>
            </div>
          </div>
        </div>
      )}

      {currentPage === "categories" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="page-heading">
            <h1>Categorías</h1>
            <div className="heading-line" />
          </div>

          <div className="category-page-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className="big-category-card"
                type="button"
                onClick={() =>
                  handleCategoryClick(category.name)
                }
              >
                <span className="big-category-icon">
                  {category.icon}
                </span>

                <strong>{category.name}</strong>

                <small>Explorar productos</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentPage === "offers" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="offer-page-banner">
            <strong>OFERTAS EXCLUSIVAS</strong>
            <span>
              Descuentos especiales en productos seleccionados.
            </span>
          </div>

          <div className="products-grid">
            {products
              .filter(
                (product) =>
                  product.compare_at_price &&
                  product.price < product.compare_at_price
              )
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(product.id)}
                  onFavorite={toggleFavorite}
                  onClick={openProduct}
                />
              ))}
          </div>
        </div>
      )}

      {currentPage === "product" && selectedProduct && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="product-detail-grid">
            <div>
              <div className="product-main-image">
                {productImage(selectedProduct) ? (
                  <img
                    src={productImage(selectedProduct)}
                    alt={selectedProduct.name}
                  />
                ) : (
                  <div className="product-placeholder-large">
                    🛍️
                  </div>
                )}
              </div>
            </div>

            <div className="product-detail-copy">
              <span className="eyebrow">
                {selectedProduct.category}
              </span>

              <h1>{selectedProduct.name}</h1>

              <div className="rating-row big">
                ★ {selectedProduct.rating} ·{" "}
                {selectedProduct.reviews} opiniones
              </div>

              <div className="detail-price-row">
                <strong>
                  $
                  {selectedProduct.price.toLocaleString(
                    "es-MX"
                  )}
                </strong>

                {selectedProduct.oldPrice && (
                  <del>
                    $
                    {selectedProduct.oldPrice.toLocaleString(
                      "es-MX"
                    )}
                  </del>
                )}
              </div>

              {selectedProduct.oldPrice &&
                selectedProduct.price <
                  selectedProduct.oldPrice && (
                  <span className="saving-pill">
                    Oferta especial
                  </span>
                )}

              <p className="detail-description">
                {selectedProduct.description}
              </p>

              {selectedProduct.variants?.length > 0 && (
                <div className="variant-block">
                  <strong>Selecciona una opción</strong>

                  <div className="variant-row">
                    {selectedProduct.variants.map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        className={`variant-button ${
                          selectedVariant === variant
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedVariant(variant)
                        }
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="buy-box">
                <strong>
                  {selectedProduct.stock > 0
                    ? `Disponible · ${selectedProduct.stock} en stock`
                    : "Agotado"}
                </strong>

                <div className="buy-actions">
                  <button
                    type="button"
                    style={{
                      border: 0,
                      borderRadius: 14,
                      padding: "14px 18px",
                      background:
                        "linear-gradient(135deg,#ed174d,#7020d0)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                    disabled={!selectedProduct.stock}
                    onClick={() =>
                      addToCart(
                        selectedProduct,
                        1,
                        selectedVariant
                      )
                    }
                  >
                    Agregar al carrito
                  </button>

                  <button
                    type="button"
                    style={{
                      border: "1px solid #7020d0",
                      borderRadius: 14,
                      padding: "14px 18px",
                      background: "#fff",
                      color: "#7020d0",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                    disabled={!selectedProduct.stock}
                    onClick={() =>
                      buyNow(selectedProduct)
                    }
                  >
                    Comprar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === "cart" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="page-heading">
            <h1>Mi carrito</h1>
            <div className="heading-line" />
          </div>

          {!cart.length ? (
            <div className="empty-inline">
              Tu carrito está vacío.
            </div>
          ) : (
            <div className="checkout-layout">
              <div className="card">
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.cartKey}
                  >
                    <div className="cart-image">
                      {productImage(item) ? (
                        <img
                          src={productImage(item)}
                          alt={item.name}
                        />
                      ) : (
                        "🛍️"
                      )}
                    </div>

                    <div className="cart-copy">
                      <strong>{item.name}</strong>
                      <small>
                        {item.variant || "Producto"}
                      </small>

                      <div>
                        $
                        {item.price.toLocaleString(
                          "es-MX"
                        )}
                      </div>

                      <div className="qty-row">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.cartKey,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
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
                            removeFromCart(item.cartKey)
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="summary-line">
                  <span>Productos</span>
                  <strong>
                    ${cartTotal.toLocaleString("es-MX")}
                  </strong>
                </div>

                <div className="summary-line">
                  <span>Envío</span>
                  <strong>Calculado al finalizar</strong>
                </div>

                <div className="summary-line total">
                  <span>Total</span>
                  <strong>
                    ${cartTotal.toLocaleString("es-MX")}
                  </strong>
                </div>

                <button
                  type="button"
                  style={{
                    width: "100%",
                    border: 0,
                    borderRadius: 14,
                    padding: "15px",
                    background:
                      "linear-gradient(135deg,#ed174d,#7020d0)",
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                  onClick={checkoutCart}
                >
                  Continuar compra
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentPage === "account" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="account-hero">
            <div className="account-avatar">
              {(session?.user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>Mi cuenta</strong>
              <span>
                {session?.user?.email ||
                  "Administra tu cuenta"}
              </span>
            </div>
          </div>

          <div className="account-grid">
            <button
              type="button"
              className="big-category-card"
              onClick={() => openPage("orders")}
            >
              📦
              <strong>Mis pedidos</strong>
              <small>Consulta tus compras</small>
            </button>

            <button
              type="button"
              className="big-category-card"
              onClick={() =>
                showActionMessage(
                  "Sección de favoritos preparada."
                )
              }
            >
              ❤️
              <strong>Favoritos</strong>
              <small>Productos guardados</small>
            </button>

            <button
              type="button"
              className="big-category-card"
              onClick={() =>
                showActionMessage(
                  "Sección de direcciones preparada."
                )
              }
            >
              📍
              <strong>Direcciones</strong>
              <small>Administra tus entregas</small>
            </button>

            <button
              type="button"
              className="big-category-card"
              onClick={() =>
                showActionMessage(
                  "Configuración preparada."
                )
              }
            >
              ⚙️
              <strong>Configuración</strong>
              <small>Preferencias de tu cuenta</small>
            </button>
          </div>

          <button
            type="button"
            style={{
              marginTop: 14,
              width: "100%",
              border: 0,
              borderRadius: 14,
              padding: "14px",
              background: "#fff",
              color: "#ed174d",
              fontWeight: 900,
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {currentPage === "orders" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={() => openPage("account")}
          >
            ← Volver
          </button>

          <div className="page-heading">
            <h1>Mis pedidos</h1>
            <div className="heading-line" />
          </div>

          {selectedOrder ? (
            <div className="card">
              <div className="head">
                <strong>Pedido {selectedOrder.id}</strong>
                <span className="badge">
                  {selectedOrder.status}
                </span>
              </div>

              <p className="muted">
                {selectedOrder.date}
              </p>

              <div className="total">
                Total: $
                {selectedOrder.total.toLocaleString(
                  "es-MX"
                )}
              </div>
            </div>
          ) : (
            <div className="empty-inline">
              Aún no tienes pedidos registrados.
            </div>
          )}
        </div>
      )}

      {currentPage === "sell" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="page-heading">
            <h1>Vender en SHORASHOPP</h1>
            <div className="heading-line" />
          </div>

          <div className="card">
            <h2>Publica tus productos</h2>

            <p className="muted">
              Esta sección conservará el flujo de vendedor
              que ya existe en el proyecto.
            </p>

            <button
              type="button"
              style={{
                marginTop: 10,
                border: 0,
                borderRadius: 14,
                padding: "14px 18px",
                background:
                  "linear-gradient(135deg,#ed174d,#7020d0)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
              onClick={() =>
                showActionMessage(
                  "Módulo de publicación preparado."
                )
              }
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {currentPage === "notifications" && (
        <div className="page-shell">
          <button
            className="back-button"
            type="button"
            onClick={goHome}
          >
            ← Volver
          </button>

          <div className="page-heading">
            <h1>Notificaciones</h1>
            <div className="heading-line" />
          </div>

          <div className="notification-list">
            <div className="card">
              <strong>¡Bienvenido a SHORASHOPP!</strong>
              <p className="muted">
                Descubre productos y ofertas especiales.
              </p>
            </div>

            <div className="card">
              <strong>Envíos rápidos</strong>
              <p className="muted">
                Estamos trabajando para que tus compras
                lleguen lo más rápido posible.
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button
          className={
            currentPage === "home"
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
          className="bottom-item"
          type="button"
          onClick={() => openPage("categories")}
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
          onClick={() => showActionMessage("Favoritos preparados.")}
        >
          <span>♡</span>
          <small>Favoritos</small>
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
        <div className="toast">
          {actionMessage}
        </div>
      )}

      {showAuth && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <button
              className="auth-close"
              type="button"
              onClick={closeAuth}
            >
              ×
            </button>

            <div className="auth-logo">S</div>

            <h2>
              {authMode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </h2>

            <p>
              {authMode === "login"
                ? "Entra a tu cuenta de SHORASHOPP."
                : "Crea tu cuenta para comprar y vender."}
            </p>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
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
                  ? "Entrar"
                  : "Crear cuenta"}
              </button>
            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <div className="auth-switch">
              {authMode === "login"
                ? "¿No tienes cuenta? "
                : "¿Ya tienes cuenta? "}

              <button
                type="button"
                onClick={() =>
                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  )
                }
              >
                {authMode === "login"
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
