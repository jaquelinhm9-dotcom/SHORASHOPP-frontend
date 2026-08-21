import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const categories = [
  { icon: "👕", name: "Ropa y Moda" },
  { icon: "📱", name: "Tecnología" },
  { icon: "🏠", name: "Hogar y Vida" },
  { icon: "👩", name: "Belleza y Salud" },
  { icon: "🎧", name: "Accesorios" },
  { icon: "🎮", name: "Juguetes y Más" },
];

const products = [
  {
    name: "Audífonos Inalámbricos",
    price: "$399.00",
    oldPrice: "$499.00",
    rating: "4.8",
    reviews: "120 ventas",
    discount: "-20%",
    type: "earbuds",
    category: "Tecnología",
  },
  {
    name: "Bolsa de Hombro Elegante",
    price: "$599.00",
    oldPrice: "$799.00",
    rating: "4.9",
    reviews: "85 ventas",
    discount: "Nuevo",
    type: "bag",
    category: "Ropa y Moda",
  },
  {
    name: "Smartwatch Series 9",
    price: "$1,699.00",
    oldPrice: "$1,999.00",
    rating: "4.7",
    reviews: "64 ventas",
    discount: "-15%",
    type: "watch",
    category: "Tecnología",
  },
  {
    name: "Licuadora Profesional",
    price: "$899.00",
    oldPrice: "",
    rating: "4.6",
    reviews: "45 ventas",
    discount: "Nuevo",
    type: "blender",
    category: "Hogar y Vida",
  },
];

function App() {
  const [session, setSession] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const [activeCategory, setActiveCategory] = useState("Todas");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSession(data?.session ?? null);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAuth(true);
    setShowMenu(false);
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
    setShowMenu(false);
    setActivePanel(null);
  };

  const goHome = () => {
    setActiveCategory("Todas");
    setSearch("");
    setShowAllCategories(false);
    setShowAllProducts(false);
    setShowFavorites(false);
    setActivePanel(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleFavorite = (productName) => {
    setFavorites((current) =>
      current.includes(productName)
        ? current.filter((item) => item !== productName)
        : [...current, productName]
    );
  };

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.name === product.name
      );

      if (existing) {
        return current.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
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

    setShowCart(true);
  };

  const changeCartQuantity = (productName, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.name === productName
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce((total, item) => {
    const numericPrice = Number(
      item.price.replace("$", "").replace(",", "")
    );

    return total + numericPrice * item.quantity;
  }, 0);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "Todas") {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    if (showFavorites) {
      result = result.filter((product) =>
        favorites.includes(product.name)
      );
    }

    if (!showAllProducts && !search.trim()) {
      result = result.slice(0, 4);
    }

    return result;
  }, [
    activeCategory,
    search,
    showFavorites,
    favorites,
    showAllProducts,
  ]);

  const selectCategory = (categoryName) => {
    setActiveCategory(categoryName);
    setShowFavorites(false);
    setShowAllProducts(true);
    setActivePanel(null);

    setTimeout(() => {
      document
        .querySelector(".products-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const openMenuPanel = (panel) => {
    setShowMenu(false);
    setShowNotifications(false);
    setShowCart(false);
    setShowFavorites(false);
    setActivePanel(panel);
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="mobile-header">

        <button
          className="menu-button"
          type="button"
          onClick={() => {
            setShowMenu((value) => !value);
            setShowNotifications(false);
            setShowCart(false);
          }}
          aria-label="Abrir menú"
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
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowMenu(false);
              setShowCart(false);
            }}
            aria-label="Notificaciones"
          >
            ♧
            <i>3</i>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => {
              setShowCart((value) => !value);
              setShowNotifications(false);
              setShowMenu(false);
            }}
            aria-label="Carrito"
          >
            🛒
            {cartCount > 0 && <i>{cartCount}</i>}
          </button>

        </div>
      </header>

      {/* MENU */}
      {showMenu && (
        <div
          className="floating-menu"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMenu(false);
            }
          }}
        >
          <div className="menu-panel">

            <div className="menu-header">
              <strong>
                {session ? "Mi SHORASHOPP" : "Hola, Jacqueline"}
              </strong>

              <button
                type="button"
                onClick={() => setShowMenu(false)}
              >
                ×
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                session
                  ? openMenuPanel("profile")
                  : openAuth("login")
              }
            >
              ✨ <span>Mi cuenta / Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => openMenuPanel("orders")}
            >
              📦 <span>Mis pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => openMenuPanel("messages")}
            >
              💬 <span>Mensajes</span>
            </button>

            <button
              type="button"
              onClick={() => openMenuPanel("settings")}
            >
              ⚙️ <span>Configuración</span>
            </button>

            <button
              type="button"
              onClick={() => openMenuPanel("help")}
            >
              💬 <span>Ayuda y soporte</span>
            </button>

            <button
              type="button"
              onClick={() =>
                session ? handleLogout() : openAuth("login")
              }
              className="menu-logout"
            >
              {session ? "↪️ Cerrar sesión" : "🔐 Iniciar sesión"}
            </button>

          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {showNotifications && (
        <div className="floating-panel notification-panel">

          <div className="panel-header">
            <strong>Notificaciones</strong>

            <button
              type="button"
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </div>

          <div className="notification-item">
            <span>🎉</span>
            <div>
              <strong>¡Bienvenido a SHORASHOPP!</strong>
              <small>Descubre nuestras ofertas.</small>
            </div>
          </div>

          <div className="notification-item">
            <span>🔥</span>
            <div>
              <strong>Ofertas exclusivas</strong>
              <small>Hay descuentos disponibles.</small>
            </div>
          </div>

          <div className="notification-item">
            <span>📦</span>
            <div>
              <strong>Tu carrito te espera</strong>
              <small>Revisa tus productos.</small>
            </div>
          </div>

        </div>
      )}

      {/* CART */}
      {showCart && (
        <div className="floating-panel cart-panel">

          <div className="panel-header">
            <strong>Mi carrito</strong>

            <button
              type="button"
              onClick={() => setShowCart(false)}
            >
              ×
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="empty-panel">
              <span>🛒</span>
              <strong>Tu carrito está vacío</strong>
              <small>Agrega productos para comenzar.</small>
            </div>
          ) : (
            <>
              <div className="cart-items">

                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.name}
                  >
                    <div className="cart-item-art">
                      {item.type === "earbuds" && "🎧"}
                      {item.type === "bag" && "👜"}
                      {item.type === "watch" && "⌚"}
                      {item.type === "blender" && "🥤"}
                    </div>

                    <div className="cart-item-info">
                      <strong>{item.name}</strong>
                      <span>{item.price}</span>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            changeCartQuantity(item.name, -1)
                          }
                        >
                          −
                        </button>

                        <b>{item.quantity}</b>

                        <button
                          type="button"
                          onClick={() =>
                            changeCartQuantity(item.name, 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              </div>

              <div className="cart-total">
                <span>Total</span>
                <strong>
                  ${cartTotal.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </div>

              <button
                className="checkout-button"
                type="button"
                onClick={() => openMenuPanel("checkout")}
              >
                Continuar compra
              </button>
            </>
          )}

        </div>
      )}

      {/* SEARCH */}
      <div className="search-container">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowFavorites(false);
              setShowAllProducts(true);
            }}
          />

          <button
            type="button"
            onClick={() => {
              setShowAllProducts(true);

              document
                .querySelector(".products-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
            aria-label="Buscar"
          >
            ⌕
          </button>

        </div>

      </div>

      <main>

        {/* QUICK CARDS */}
        <section className="quick-cards">

          <button
            className="quick-card sell-card"
            type="button"
            onClick={() => openAuth("register")}
          >
            <div className="quick-icon">▣</div>

            <div className="quick-content">
              <strong>
                Vende en
                <br />
                SHORASHOPP
              </strong>

              <span>
                Únete y comienza a vender
                <br />
                tus productos hoy
              </span>
            </div>

            <b className="round-arrow">›</b>
          </button>

          <button
            className="quick-card account-card"
            type="button"
            onClick={() =>
              session ? openMenuPanel("profile") : openAuth("login")
            }
          >
            <div className="quick-icon">✨</div>

            <div className="quick-content">
              <strong>Mi cuenta</strong>

              <span>
                {session
                  ? "Sesión iniciada"
                  : "Hola, Jacqueline"}
              </span>

              <small>
                {session
                  ? "Ver mi perfil"
                  : "Ver perfil, pedidos y configuraciones"}
              </small>
            </div>

            <b className="round-arrow">›</b>
          </button>

        </section>

        {/* CATEGORIES */}
        <section className="content-section">

          <div className="section-title-row">
            <h2>Categorías</h2>

            <button
              type="button"
              onClick={() => {
                setShowAllCategories((value) => !value);
                setActiveCategory("Todas");
              }}
            >
              {showAllCategories ? "Ver menos" : "Ver todas"}
              <span>›</span>
            </button>
          </div>

          <div className="categories-scroll">

            {categories
              .slice(
                0,
                showAllCategories
                  ? categories.length
                  : 4
              )
              .map((category) => (
                <button
                  className={`category-item ${
                    activeCategory === category.name
                      ? "selected"
                      : ""
                  }`}
                  key={category.name}
                  type="button"
                  onClick={() =>
                    selectCategory(category.name)
                  }
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <span>{category.name}</span>
                </button>
              ))}

          </div>

        </section>

        {/* OFFER BANNER */}
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
                onClick={() => {
                  setActiveCategory("Todas");
                  setShowFavorites(false);
                  setShowAllProducts(true);

                  document
                    .querySelector(".products-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Ver ofertas <b>›</b>
              </button>

            </div>

            <div className="offer-products">
              <div className="offer-bag">🛍️</div>
              <div className="offer-watch">⌚</div>
              <div className="offer-shoe">👟</div>
              <div className="offer-percent">%</div>
            </div>

          </div>

        </section>

        {/* PRODUCTS */}
        <section className="content-section products-section">

          <div className="section-title-row">

            <h2>
              {showFavorites
                ? "Mis favoritos"
                : activeCategory !== "Todas"
                ? activeCategory
                : "Productos destacados"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowAllProducts((value) => !value);
                setShowFavorites(false);
              }}
            >
              {showAllProducts ? "Ver menos" : "Ver todos"}
              <span>›</span>
            </button>

          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <span>🔎</span>
              <strong>No encontramos productos.</strong>
              <small>
                Intenta con otra búsqueda o categoría.
              </small>
            </div>
          ) : (
            <div className="products-grid">

              {filteredProducts.map((product) => (
                <article
                  className="product-card"
                  key={product.name}
                >

                  <div
                    className="product-image"
                    onClick={() => addToCart(product)}
                  >

                    <span className="product-label">
                      {product.discount}
                    </span>

                    <button
                      className="heart-button"
                      type="button"
                      aria-label="Favorito"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(product.name);
                      }}
                    >
                      {favorites.includes(product.name)
                        ? "♥"
                        : "♡"}
                    </button>

                    <div
                      className={`product-art ${product.type}`}
                    >
                      {product.type === "earbuds" && "🎧"}
                      {product.type === "bag" && "👜"}
                      {product.type === "watch" && "⌚"}
                      {product.type === "blender" && "🥤"}
                    </div>

                  </div>

                  <div className="product-info">

                    <h3>{product.name}</h3>

                    <div className="price-row">
                      <strong>{product.price}</strong>

                      {product.oldPrice && (
                        <del>{product.oldPrice}</del>
                      )}
                    </div>

                    <div className="rating-row">
                      <span>★</span>
                      {product.rating}
                      <small>• {product.reviews}</small>
                    </div>

                    <button
                      className="add-cart-button"
                      type="button"
                      onClick={() => addToCart(product)}
                    >
                      🛒 Agregar al carrito
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

        {/* TRUST */}
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
            <strong>Vendedores verificados</strong>
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

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">

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
          onClick={() => {
            setShowAllCategories(true);
            window.scrollTo({
              top: 350,
              behavior: "smooth",
            });
          }}
        >
          <span>▦</span>
          <small>Categorías</small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={() => openAuth("register")}
        >
          <span>▰</span>
          <small>Vender</small>
        </button>

        <button
          className="bottom-item"
          type="button"
          onClick={() => {
            setShowFavorites(true);
            setShowAllProducts(true);

            document
              .querySelector(".products-section")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          <span>
            {favorites.length > 0 ? "♥" : "♡"}
          </span>
          <small>Favoritos</small>
        </button>

        <button
          className="bottom-item"
          type="button"
          onClick={() =>
            session
              ? openMenuPanel("profile")
              : openAuth("login")
          }
        >
          <span>✨</span>
          <small>Cuenta</small>
        </button>

      </nav>

      {/* GENERAL PANELS */}
      {activePanel && (
        <div
          className="panel-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActivePanel(null);
            }
          }}
        >
          <div className="large-panel">

            <button
              className="panel-close"
              type="button"
              onClick={() => setActivePanel(null)}
            >
              ×
            </button>

            {activePanel === "profile" && (
              <>
                <div className="panel-icon">✨</div>
                <h2>Mi cuenta</h2>

                <p>
                  {session
                    ? session.user.email
                    : "Inicia sesión para acceder a tu cuenta."}
                </p>

                {!session && (
                  <button
                    className="panel-primary-button"
                    type="button"
                    onClick={() => {
                      setActivePanel(null);
                      openAuth("login");
                    }}
                  >
                    Iniciar sesión
                  </button>
                )}

                {session && (
                  <button
                    className="panel-primary-button"
                    type="button"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                )}
              </>
            )}

            {activePanel === "orders" && (
              <>
                <div className="panel-icon">📦</div>
                <h2>Mis pedidos</h2>
                <p>
                  Aquí aparecerán tus pedidos realizados en
                  SHORASHOPP.
                </p>
                <div className="panel-empty">
                  Todavía no tienes pedidos.
                </div>
              </>
            )}

            {activePanel === "messages" && (
              <>
                <div className="panel-icon">💬</div>
                <h2>Mensajes</h2>
                <p>
                  Aquí podrás comunicarte con vendedores y
                  recibir atención de SHORASHOPP.
                </p>
                <div className="panel-empty">
                  No tienes mensajes nuevos.
                </div>
              </>
            )}

            {activePanel === "settings" && (
              <>
                <div className="panel-icon">⚙️</div>
                <h2>Configuración</h2>

                <button
                  className="panel-option"
                  type="button"
                >
                  🔔 Notificaciones
                </button>

                <button
                  className="panel-option"
                  type="button"
                >
                  🔐 Privacidad y seguridad
                </button>

                <button
                  className="panel-option"
                  type="button"
                >
                  🌎 País y preferencias
                </button>
              </>
            )}

            {activePanel === "help" && (
              <>
                <div className="panel-icon">💬</div>
                <h2>Ayuda y soporte</h2>
                <p>
                  Nuestro equipo está aquí para ayudarte.
                </p>

                <button
                  className="panel-primary-button"
                  type="button"
                >
                  Contactar soporte
                </button>
              </>
            )}

            {activePanel === "checkout" && (
              <>
                <div className="panel-icon">🛒</div>
                <h2>Finalizar compra</h2>

                <p>
                  Tu carrito tiene {cartCount} producto
                  {cartCount === 1 ? "" : "s"}.
                </p>

                <div className="checkout-summary">
                  <span>Total</span>
                  <strong>
                    ${cartTotal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <button
                  className="panel-primary-button"
                  type="button"
                  onClick={() => {
                    setMessage(
                      "El checkout se conectará con el sistema de pagos de SHORASHOPP."
                    );
                  }}
                >
                  Continuar
                </button>

                {message && (
                  <div className="auth-message">
                    {message}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

      {/* AUTH */}
      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
                      setAuthMode("register");
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

export default App;
