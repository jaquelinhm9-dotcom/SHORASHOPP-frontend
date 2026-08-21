// App.jsx

import { useEffect, useState } from "react";
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

/* =========================================================
   PÁGINAS DISPONIBLES
========================================================= */

const VALID_PAGES = [
  "home",
  "account",
  "privacy",
  "sessions",
  "security",
  "categories",
  "favorites",
  "offers",
  "notifications",
  "notification-offers",
  "notification-orders",
  "notification-messages",
];

/* =========================================================
   HISTORIAL
========================================================= */

function getPageFromUrl() {
  const hash = window.location.hash.replace("#", "");

  if (VALID_PAGES.includes(hash)) {
    return hash;
  }

  return "home";
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [session, setSession] = useState(null);

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

  const [currentPage, setCurrentPage] =
    useState(getPageFromUrl);

  const [menuOpen, setMenuOpen] = useState(false);

  /* =======================================================
     SESIÓN
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data } =
        await supabase.auth.getSession();

      if (mounted) {
        setSession(data?.session ?? null);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     HISTORIAL DEL TELÉFONO
  ======================================================= */

  useEffect(() => {
    const initialPage =
      getPageFromUrl();

    window.history.replaceState(
      { shorashoppPage: initialPage },
      "",
      initialPage === "home"
        ? window.location.pathname
        : `#${initialPage}`
    );

    const handlePopState = () => {
      const page =
        getPageFromUrl();

      setCurrentPage(page);
      setMenuOpen(false);
      setSelectedCategory("");

      if (
        page !== "favorites"
      ) {
        setSearchTerm("");
      }

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  /* =======================================================
     ABRIR PÁGINA
  ======================================================= */

  const openPage = (page) => {
    if (!VALID_PAGES.includes(page)) {
      return;
    }

    if (page === currentPage) {
      setMenuOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    window.history.pushState(
      { shorashoppPage: page },
      "",
      page === "home"
        ? window.location.pathname
        : `#${page}`
    );

    setCurrentPage(page);
    setMenuOpen(false);
    setSelectedCategory("");

    if (
      page !== "favorites"
    ) {
      setSearchTerm("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     ATRÁS INTERNO
  ======================================================= */

  const goBack = () => {
    if (
      window.history.length > 1
    ) {
      window.history.back();
      return;
    }

    openPage("home");
  };

  /* =======================================================
     AUTENTICACIÓN
  ======================================================= */

  const openAuth = (
    mode = "login"
  ) => {
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

  const handleAuth = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (
        authMode === "register"
      ) {
        const {
          data,
          error,
        } =
          await supabase.auth.signUp({
            email:
              email.trim(),
            password,
            options: {
              data: {
                full_name:
                  name.trim(),
              },
            },
          });

        if (error) {
          throw error;
        }

        if (data?.session) {
          closeAuth();
          openPage("account");
        } else {
          setMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email:
                email.trim(),
              password,
            }
          );

        if (error) {
          throw error;
        }

        closeAuth();
        openPage("account");
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "Ocurrió un error."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout =
    async () => {
      await supabase.auth.signOut();

      setSession(null);

      openPage("home");
    };

  /* =======================================================
     MENSAJES
  ======================================================= */

  const showActionMessage = (
    text
  ) => {
    setActionMessage(text);

    window.setTimeout(() => {
      setActionMessage("");
    }, 2000);
  };

  /* =======================================================
     NAVEGACIÓN GENERAL
  ======================================================= */

  const goHome = () => {
    setSelectedCategory("");
    setSearchTerm("");

    if (
      currentPage === "home"
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    openPage("home");
  };

  const goHomePage = () => {
    openPage("home");
  };

  const goToCategories = () => {
    openPage("categories");
  };

  const handleAccountAccess = () => {
    if (session) {
      openPage("account");
    } else {
      openAuth("login");
    }
  };

  /* =======================================================
     CATEGORÍAS
  ======================================================= */

  const handleCategoryClick = (
    categoryName
  ) => {
    setSelectedCategory(
      categoryName
    );
    setSearchTerm("");

    openPage("categories");
  };

  const handleShowAllCategories =
    () => {
      setSelectedCategory("");
      setSearchTerm("");

      openPage("categories");
    };

  /* =======================================================
     BÚSQUEDA
  ======================================================= */

  const handleSearch = () => {
    const cleanSearch =
      searchTerm.trim();

    if (!cleanSearch) {
      setSelectedCategory("");
      return;
    }

    setSelectedCategory("");

    if (
      currentPage !== "home"
    ) {
      openPage("home");
    }

    window.setTimeout(() => {
      const element =
        document.querySelector(
          ".products-section"
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  const handleSearchKeyDown =
    (event) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    };

  /* =======================================================
     FAVORITOS
  ======================================================= */

  const toggleFavorite = (
    productName
  ) => {
    setFavorites(
      (currentFavorites) => {
        if (
          currentFavorites.includes(
            productName
          )
        ) {
          showActionMessage(
            "Producto eliminado de favoritos."
          );

          return currentFavorites.filter(
            (name) =>
              name !== productName
          );
        }

        showActionMessage(
          "Producto agregado a favoritos."
        );

        return [
          ...currentFavorites,
          productName,
        ];
      }
    );
  };

  const handleProductClick = (
    product
  ) => {
    showActionMessage(
      `Seleccionaste: ${product.name}`
    );
  };

  /* =======================================================
     OFERTAS
  ======================================================= */

  const handleOffers = () => {
    setSelectedCategory("");
    setSearchTerm("");

    openPage("offers");
  };

  /* =======================================================
     PRODUCTOS FILTRADOS
  ======================================================= */

  const filteredProducts =
    products.filter(
      (product) => {
        const matchesCategory =
          !selectedCategory ||
          product.category ===
            selectedCategory;

        const search =
          searchTerm
            .trim()
            .toLowerCase();

        const matchesSearch =
          !search ||
          product.name
            .toLowerCase()
            .includes(search);

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );

  const favoriteProducts =
    products.filter(
      (product) =>
        favorites.includes(
          product.name
        )
    );

  /* =======================================================
     ESTILOS
  ======================================================= */

  const accountPageButtonStyle =
    {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
      padding: "16px",
      border:
        "1px solid #ece7f3",
      borderRadius: 16,
      background: "white",
      color: "#24152f",
      fontWeight: 800,
      textAlign: "left",
      cursor: "pointer",
      boxShadow:
        "0 5px 18px rgba(50,16,74,.05)",
    };

  const securityPageButtonStyle =
    {
      width: "100%",
      display: "grid",
      gap: 6,
      padding: "18px",
      border:
        "1px solid #ece7f3",
      borderRadius: 17,
      background: "white",
      color: "#24152f",
      textAlign: "left",
      cursor: "pointer",
      boxShadow:
        "0 5px 18px rgba(50,16,74,.05)",
    };

  const infoCardStyle = {
    background: "white",
    border:
      "1px solid #ece7f3",
    borderRadius: 18,
    padding: "22px",
    boxShadow:
      "0 5px 18px rgba(50,16,74,.05)",
  };

  const menuButtonStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 12px",
    border: 0,
    borderRadius: 13,
    background: "white",
    color: "#24152f",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "left",
    cursor: "pointer",
  };

  /* =======================================================
     CUENTA
  ======================================================= */

  const renderAccountPage = () => (
    <div
      style={{
        marginTop: 14,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#ed174d,#7020d0)",
          color: "white",
          borderRadius: 22,
          padding: "24px",
          marginBottom: 16,
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

        <h1
          style={{
            margin: "6px 0",
            fontSize: 28,
          }}
        >
          Mi cuenta
        </h1>

        <p
          style={{
            margin: 0,
            opacity: 0.92,
          }}
        >
          Gestiona tu perfil,
          pedidos y seguridad.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() =>
            showActionMessage(
              "Perfil próximamente."
            )
          }
          style={
            accountPageButtonStyle
          }
        >
          👤 Perfil
          <span>›</span>
        </button>

        <button
          type="button"
          onClick={() =>
            showActionMessage(
              "Tus pedidos se conectarán aquí."
            )
          }
          style={
            accountPageButtonStyle
          }
        >
          📦 Mis pedidos
          <span>›</span>
        </button>

        <button
          type="button"
          onClick={() =>
            showActionMessage(
              "Tus direcciones se conectarán aquí."
            )
          }
          style={
            accountPageButtonStyle
          }
        >
          📍 Direcciones
          <span>›</span>
        </button>

        <button
          type="button"
          onClick={() =>
            openPage("privacy")
          }
          style={
            accountPageButtonStyle
          }
        >
          🔐 Privacidad y
          seguridad
          <span>›</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            ...accountPageButtonStyle,
            color: "#d41452",
          }}
        >
          🚪 Cerrar sesión
          <span>›</span>
        </button>
      </div>
    </div>
  );

  /* =======================================================
     PRIVACIDAD
  ======================================================= */

  const renderPrivacyPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Privacidad y
          seguridad
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 0,
          }}
        >
          Administra las
          opciones relacionadas
          con la protección de
          tu cuenta.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={() =>
              openPage("sessions")
            }
            style={
              securityPageButtonStyle
            }
          >
            <strong>
              📱 Sesiones activas
            </strong>

            <span>
              Revisa las sesiones
              de tu cuenta y su
              administración. ›
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              openPage("security")
            }
            style={
              securityPageButtonStyle
            }
          >
            <strong>
              🛡️ Verificación de
              seguridad
            </strong>

            <span>
              Consulta el estado
              de seguridad de tu
              cuenta. ›
            </span>
          </button>
        </div>
      </div>
    );

  /* =======================================================
     SESIONES
  ======================================================= */

  const renderSessionsPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Sesiones activas
        </h1>

        <p
          style={{
            color: "#666",
          }}
        >
          Administra los
          dispositivos y
          sesiones asociados a
          tu cuenta.
        </p>

        <div
          style={
            infoCardStyle
          }
        >
          <div
            style={{
              fontSize: 34,
            }}
          >
            📱
          </div>

          <h2
            style={{
              margin:
                "10px 0 6px",
            }}
          >
            Sesiones de tu
            cuenta
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            La administración
            de sesiones se
            conectará aquí.
          </p>
        </div>
      </div>
    );

  /* =======================================================
     SEGURIDAD
  ======================================================= */

  const renderSecurityPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Verificación de
          seguridad
        </h1>

        <p
          style={{
            color: "#666",
          }}
        >
          Revisa las medidas
          básicas de protección
          de tu cuenta
          SHORASHOPP.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 18,
          }}
        >
          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              🔑 Contraseña
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Tu contraseña se
              gestiona de forma
              segura mediante
              Supabase.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              ✉️ Correo electrónico
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              La cuenta utiliza
              tu correo electrónico
              para la autenticación.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              🛡️ Estado de
              seguridad
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              No se han agregado
              cambios que alteren
              tu flujo actual de
              inicio de sesión,
              registro o
              recuperación.
            </p>
          </div>
        </div>
      </div>
    );

  /* =======================================================
     CATEGORÍAS
  ======================================================= */

  const renderCategoriesPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Categorías
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 0,
          }}
        >
          Explora productos
          por categoría.
        </p>

        <div
          className="categories-scroll"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          {categories.map(
            (category) => (
              <button
                className="category-item"
                key={
                  category.name
                }
                type="button"
                onClick={() =>
                  handleCategoryClick(
                    category.name
                  )
                }
                style={{
                  border:
                    "1px solid #ece7f3",
                  borderRadius: 18,
                  background:
                    "white",
                  padding: 18,
                  cursor:
                    "pointer",
                }}
              >
                <div
                  className="category-icon"
                  style={{
                    fontSize: 34,
                  }}
                >
                  {
                    category.icon
                  }
                </div>

                <span>
                  {
                    category.name
                  }
                </span>
              </button>
            )
          )}
        </div>

        {selectedCategory && (
          <div
            style={{
              marginTop: 28,
            }}
          >
            <h2>
              {selectedCategory}
            </h2>

            <div className="products-grid">
              {filteredProducts.length >
              0 ? (
                filteredProducts.map(
                  (product) => (
                    <article
                      className="product-card"
                      key={
                        product.name
                      }
                      onClick={() =>
                        handleProductClick(
                          product
                        )
                      }
                    >
                      <div className="product-image">
                        <span className="product-label">
                          {
                            product.discount
                          }
                        </span>

                        <button
                          className="heart-button"
                          type="button"
                          aria-label="Favorito"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            toggleFavorite(
                              product.name
                            );
                          }}
                        >
                          {favorites.includes(
                            product.name
                          )
                            ? "♥"
                            : "♡"}
                        </button>

                        <div
                          className={`product-art ${product.type}`}
                        >
                          {product.type ===
                            "earbuds" &&
                            "🎧"}

                          {product.type ===
                            "bag" &&
                            "👜"}

                          {product.type ===
                            "watch" &&
                            "⌚"}

                          {product.type ===
                            "blender" &&
                            "🥤"}
                        </div>
                      </div>

                      <div className="product-info">
                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <div className="price-row">
                          <strong>
                            {
                              product.price
                            }
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {
                                product.oldPrice
                              }
                            </del>
                          )}
                        </div>

                        <div className="rating-row">
                          <span>
                            ★
                          </span>

                          {
                            product.rating
                          }

                          <small>
                            •{" "}
                            {
                              product.reviews
                            }
                          </small>
                        </div>
                      </div>
                    </article>
                  )
                )
              ) : (
                <div
                  style={{
                    width:
                      "100%",
                    textAlign:
                      "center",
                    padding:
                      "30px",
                  }}
                >
                  No encontramos
                  productos con
                  esa búsqueda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );

  /* =======================================================
     FAVORITOS
  ======================================================= */

  const renderFavoritesPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Favoritos
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 0,
          }}
        >
          Aquí encontrarás
          los productos que
          hayas guardado.
        </p>

        {favoriteProducts.length >
        0 ? (
          <div
            className="products-grid"
            style={{
              marginTop: 20,
            }}
          >
            {favoriteProducts.map(
              (product) => (
                <article
                  className="product-card"
                  key={
                    product.name
                  }
                  onClick={() =>
                    handleProductClick(
                      product
                    )
                  }
                >
                  <div className="product-image">
                    <span className="product-label">
                      {
                        product.discount
                      }
                    </span>

                    <button
                      className="heart-button"
                      type="button"
                      aria-label="Eliminar favorito"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        toggleFavorite(
                          product.name
                        );
                      }}
                    >
                      ♥
                    </button>

                    <div
                      className={`product-art ${product.type}`}
                    >
                      {product.type ===
                        "earbuds" &&
                        "🎧"}

                      {product.type ===
                        "bag" &&
                        "👜"}

                      {product.type ===
                        "watch" &&
                        "⌚"}

                      {product.type ===
                        "blender" &&
                        "🥤"}
                    </div>
                  </div>

                  <div className="product-info">
                    <h3>
                      {
                        product.name
                      }
                    </h3>

                    <div className="price-row">
                      <strong>
                        {
                          product.price
                        }
                      </strong>

                      {product.oldPrice && (
                        <del>
                          {
                            product.oldPrice
                          }
                        </del>
                      )}
                    </div>

                    <div className="rating-row">
                      <span>
                        ★
                      </span>

                      {
                        product.rating
                      }

                      <small>
                        •{" "}
                        {
                          product.reviews
                        }
                      </small>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div
            style={{
              background:
                "white",
              border:
                "1px solid #ece7f3",
              borderRadius: 18,
              padding: 30,
              marginTop: 20,
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: 42,
              }}
            >
              ♡
            </div>

            <h2>
              Aún no tienes
              favoritos
            </h2>

            <p
              style={{
                color: "#666",
              }}
            >
              Guarda productos
              tocando el corazón
              para encontrarlos
              fácilmente aquí.
            </p>

            <button
              type="button"
              onClick={goHome}
              style={{
                border: 0,
                borderRadius: 12,
                padding:
                  "12px 20px",
                background:
                  "linear-gradient(90deg,#ed174d,#7020d0)",
                color: "white",
                fontWeight: 800,
                cursor:
                  "pointer",
              }}
            >
              Explorar productos
            </button>
          </div>
        )}
      </div>
    );

  /* =======================================================
     OFERTAS
  ======================================================= */

  const renderOffersPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg,#ed174d,#7020d0)",
            color: "white",
            borderRadius: 22,
            padding: 24,
            marginBottom: 20,
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

          <h1
            style={{
              margin: "6px 0",
              fontSize: 30,
            }}
          >
            Ofertas
            exclusivas
          </h1>

          <p
            style={{
              margin: 0,
            }}
          >
            Descuentos increíbles
            por tiempo limitado.
          </p>
        </div>

        <div className="products-grid">
          {products.map(
            (product) => (
              <article
                className="product-card"
                key={
                  product.name
                }
                onClick={() =>
                  handleProductClick(
                    product
                  )
                }
              >
                <div className="product-image">
                  <span className="product-label">
                    {
                      product.discount
                    }
                  </span>

                  <button
                    className="heart-button"
                    type="button"
                    aria-label="Favorito"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      toggleFavorite(
                        product.name
                      );
                    }}
                  >
                    {favorites.includes(
                      product.name
                    )
                      ? "♥"
                      : "♡"}
                  </button>

                  <div
                    className={`product-art ${product.type}`}
                  >
                    {product.type ===
                      "earbuds" &&
                      "🎧"}

                    {product.type ===
                      "bag" &&
                      "👜"}

                    {product.type ===
                      "watch" &&
                      "⌚"}

                    {product.type ===
                      "blender" &&
                      "🥤"}
                  </div>
                </div>

                <div className="product-info">
                  <h3>
                    {product.name}
                  </h3>

                  <div className="price-row">
                    <strong>
                      {product.price}
                    </strong>

                    {product.oldPrice && (
                      <del>
                        {
                          product.oldPrice
                        }
                      </del>
                    )}
                  </div>

                  <div className="rating-row">
                    <span>
                      ★
                    </span>

                    {
                      product.rating
                    }

                    <small>
                      •{" "}
                      {
                        product.reviews
                      }
                    </small>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      </div>
    );

  /* =======================================================
     NOTIFICACIONES
  ======================================================= */

  const renderNotificationsPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <h1
          style={{
            marginBottom: 6,
          }}
        >
          Notificaciones
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 0,
          }}
        >
          Aquí encontrarás
          las novedades y avisos
          de SHORASHOPP.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 20,
          }}
        >

          <button
            type="button"
            onClick={() =>
              openPage(
                "notification-offers"
              )
            }
            style={{
              ...securityPageButtonStyle,
              cursor: "pointer",
            }}
          >
            <strong>
              🔥 Nuevas ofertas disponibles
            </strong>

            <span>
              Revisa nuestras
              promociones y
              descuentos especiales.
              ›
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              openPage(
                "notification-orders"
              )
            }
            style={{
              ...securityPageButtonStyle,
              cursor: "pointer",
            }}
          >
            <strong>
              📦 Tus pedidos
            </strong>

            <span>
              Consulta información
              y actualizaciones sobre
              tus compras. ›
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              openPage(
                "notification-messages"
              )
            }
            style={{
              ...securityPageButtonStyle,
              cursor: "pointer",
            }}
          >
            <strong>
              💬 Mensajes
            </strong>

            <span>
              Consulta mensajes de
              vendedores y del equipo
              de SHORASHOPP. ›
            </span>
          </button>

        </div>
      </div>
    );

  /* =======================================================
     NOTIFICACIÓN: OFERTAS
  ======================================================= */

  const renderNotificationOffersPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg,#ed174d,#7020d0)",
            color: "white",
            borderRadius: 22,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 34,
            }}
          >
            🔥
          </div>

          <h1
            style={{
              margin:
                "10px 0 6px",
            }}
          >
            Nuevas ofertas
            disponibles
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.92,
            }}
          >
            Descubre promociones
            especiales y productos
            con descuentos.
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
          }}
        >
          {products.map(
            (product) => (
              <button
                key={
                  product.name
                }
                type="button"
                onClick={() =>
                  handleProductClick(
                    product
                  )
                }
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 14,
                  width:
                    "100%",
                  padding: 14,
                  border:
                    "1px solid #ece7f3",
                  borderRadius:
                    16,
                  background:
                    "white",
                  cursor:
                    "pointer",
                  textAlign:
                    "left",
                }}
              >
                <span
                  style={{
                    fontSize: 34,
                  }}
                >
                  {product.type ===
                    "earbuds" &&
                    "🎧"}

                  {product.type ===
                    "bag" &&
                    "👜"}

                  {product.type ===
                    "watch" &&
                    "⌚"}

                  {product.type ===
                    "blender" &&
                    "🥤"}
                </span>

                <span
                  style={{
                    display:
                      "grid",
                    gap: 4,
                  }}
                >
                  <strong>
                    {
                      product.name
                    }
                  </strong>

                  <span
                    style={{
                      color:
                        "#7020d0",
                      fontWeight:
                        800,
                    }}
                  >
                    {
                      product.price
                    }{" "}
                    ·{" "}
                    {
                      product.discount
                    }
                  </span>
                </span>
              </button>
            )
          )}
        </div>
      </div>
    );

  /* =======================================================
     NOTIFICACIÓN: PEDIDOS
  ======================================================= */

  const renderNotificationOrdersPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <div
          style={
            infoCardStyle
          }
        >
          <div
            style={{
              fontSize: 36,
            }}
          >
            📦
          </div>

          <h1
            style={{
              margin:
                "10px 0 6px",
            }}
          >
            Tus pedidos
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              lineHeight:
                1.6,
            }}
          >
            Aquí podrás consultar
            el estado de tus
            compras, entregas y
            actualizaciones de
            pedidos.
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              📦 Tus pedidos
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Cuando realices una
              compra, aquí
              aparecerá su estado.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              🚚 Seguimiento
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Podrás consultar el
              progreso de tus
              entregas.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              ✅ Confirmaciones
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Recibirás avisos
              relacionados con tus
              pedidos.
            </p>
          </div>
        </div>
      </div>
    );

  /* =======================================================
     NOTIFICACIÓN: MENSAJES
  ======================================================= */

  const renderNotificationMessagesPage =
    () => (
      <div
        style={{
          marginTop: 14,
        }}
      >
        <div
          style={
            infoCardStyle
          }
        >
          <div
            style={{
              fontSize: 36,
            }}
          >
            💬
          </div>

          <h1
            style={{
              margin:
                "10px 0 6px",
            }}
          >
            Mensajes
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              lineHeight:
                1.6,
            }}
          >
            Aquí podrás consultar
            mensajes de vendedores
            y del equipo de
            SHORASHOPP.
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              💬 Conversaciones
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Tus conversaciones
              aparecerán aquí.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              🏪 Vendedores
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              Podrás comunicarte
              con vendedores sobre
              tus compras.
            </p>
          </div>

          <div
            style={
              infoCardStyle
            }
          >
            <strong>
              🛟 Soporte SHORASHOPP
            </strong>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#666",
              }}
            >
              El equipo de
              SHORASHOPP también
              podrá comunicarse
              contigo aquí.
            </p>
          </div>
        </div>
      </div>
    );

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

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
            SHORA
            <span>
              SHOPP
            </span>
          </strong>

          <small>
            Compra.{" "}
            <b>Vende.</b>{" "}
            Descubre.
          </small>
        </button>

        <div className="header-icons">

          <button
            type="button"
            className="notification-button"
            onClick={() =>
              openPage(
                "notifications"
              )
            }
          >
            ♧
            <i>3</i>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() =>
              showActionMessage(
                "Tu carrito está listo."
              )
            }
          >
            🛒
            <i>2</i>
          </button>

        </div>
      </header>

      {/* =================================================
          BÚSQUEDA
      ================================================= */}

      <div className="search-container">
        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
          />

          <button
            type="button"
            onClick={
              handleSearch
            }
          >
            ⌕
          </button>

        </div>
      </div>

      {/* =================================================
          PANTALLAS SECUNDARIAS
      ================================================= */}

      {currentPage !==
        "home" && (
        <section
          style={{
            maxWidth:
              "760px",
            margin:
              "0 auto",
            padding:
              "22px 16px 120px",
          }}
        >

          <button
            type="button"
            onClick={
              goBack
            }
            style={{
              border: 0,
              background:
                "transparent",
              color:
                "#7020d0",
              fontWeight:
                800,
              padding:
                "8px 0",
              cursor:
                "pointer",
            }}
          >
            ← Volver
          </button>

          {currentPage ===
            "account" &&
            renderAccountPage()}

          {currentPage ===
            "privacy" &&
            renderPrivacyPage()}

          {currentPage ===
            "sessions" &&
            renderSessionsPage()}

          {currentPage ===
            "security" &&
            renderSecurityPage()}

          {currentPage ===
            "categories" &&
            renderCategoriesPage()}

          {currentPage ===
            "favorites" &&
            renderFavoritesPage()}

          {currentPage ===
            "offers" &&
            renderOffersPage()}

          {currentPage ===
            "notifications" &&
            renderNotificationsPage()}

          {currentPage ===
            "notification-offers" &&
            renderNotificationOffersPage()}

          {currentPage ===
            "notification-orders" &&
            renderNotificationOrdersPage()}

          {currentPage ===
            "notification-messages" &&
            renderNotificationMessagesPage()}

        </section>
      )}

      {/* =================================================
          INICIO
      ================================================= */}

      {currentPage ===
        "home" && (
        <main>

          {/* SELL / ACCOUNT */}

          <section className="quick-cards">

            <button
              className="quick-card sell-card"
              type="button"
              onClick={() =>
                openAuth(
                  "register"
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
                  Únete y comienza a
                  vender
                  <br />
                  tus productos hoy
                </span>

              </div>

              <b className="round-arrow">
                ›
              </b>
            </button>

            <button
              className="quick-card account-card"
              type="button"
              onClick={
                handleAccountAccess
              }
            >

              <div className="quick-icon">
                ♟
              </div>

              <div className="quick-content">

                <strong>
                  Mi cuenta
                </strong>

                <span>
                  {session
                    ? "Sesión iniciada"
                    : "Hola, Jacqueline"}
                </span>

                <small>
                  {session
                    ? "Cerrar sesión"
                    : "Ver perfil, pedidos y configuraciones"}
                </small>

              </div>

              <b className="round-arrow">
                ›
              </b>

            </button>

          </section>

          {/* CATEGORÍAS */}

          <section className="content-section">

            <div className="section-title-row">

              <h2>
                Categorías
              </h2>

              <button
                type="button"
                onClick={
                  handleShowAllCategories
                }
              >
                Ver todas{" "}
                <span>›</span>
              </button>

            </div>

            <div className="categories-scroll">

              {categories.map(
                (category) => (
                  <button
                    className="category-item"
                    key={
                      category.name
                    }
                    type="button"
                    onClick={() =>
                      handleCategoryClick(
                        category.name
                      )
                    }
                  >
                    <div className="category-icon">
                      {
                        category.icon
                      }
                    </div>

                    <span>
                      {
                        category.name
                      }
                    </span>
                  </button>
                )
              )}

            </div>

          </section>

          {/* OFERTAS */}

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
                  onClick={
                    handleOffers
                  }
                >
                  Ver ofertas{" "}
                  <b>›</b>
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

          {/* PRODUCTOS */}

          <section className="content-section products-section">

            <div className="section-title-row">

              <h2>
                {selectedCategory
                  ? selectedCategory
                  : "Productos destacados"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(
                    ""
                  );

                  setSearchTerm(
                    ""
                  );
                }}
              >
                Ver todos{" "}
                <span>›</span>
              </button>

            </div>

            <div className="products-grid">

              {filteredProducts.length >
              0 ? (
                filteredProducts.map(
                  (product) => (
                    <article
                      className="product-card"
                      key={
                        product.name
                      }
                      onClick={() =>
                        handleProductClick(
                          product
                        )
                      }
                    >

                      <div className="product-image">

                        <span className="product-label">
                          {
                            product.discount
                          }
                        </span>

                        <button
                          className="heart-button"
                          type="button"
                          aria-label="Favorito"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            toggleFavorite(
                              product.name
                            );
                          }}
                        >
                          {favorites.includes(
                            product.name
                          )
                            ? "♥"
                            : "♡"}
                        </button>

                        <div
                          className={`product-art ${product.type}`}
                        >

                          {product.type ===
                            "earbuds" &&
                            "🎧"}

                          {product.type ===
                            "bag" &&
                            "👜"}

                          {product.type ===
                            "watch" &&
                            "⌚"}

                          {product.type ===
                            "blender" &&
                            "🥤"}

                        </div>

                      </div>

                      <div className="product-info">

                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <div className="price-row">

                          <strong>
                            {
                              product.price
                            }
                          </strong>

                          {product.oldPrice && (
                            <del>
                              {
                                product.oldPrice
                              }
                            </del>
                          )}

                        </div>

                        <div className="rating-row">

                          <span>
                            ★
                          </span>

                          {
                            product.rating
                          }

                          <small>
                            •{" "}
                            {
                              product.reviews
                            }
                          </small>

                        </div>

                      </div>

                    </article>
                  )
                )
              ) : (
                <div
                  style={{
                    width:
                      "100%",
                    textAlign:
                      "center",
                    padding:
                      "30px",
                  }}
                >
                  No encontramos
                  productos con
                  esa búsqueda.
                </div>
              )}

            </div>

          </section>

          {/* CONFIANZA */}

          <section className="trust-section">

            <div className="trust-item">
              <span>♢</span>

              <strong>
                Compra segura
              </strong>

              <small>
                Protegemos tus datos
                y compras
              </small>
            </div>

            <div className="trust-item">
              <span>♧</span>

              <strong>
                Envíos rápidos
              </strong>

              <small>
                Recibe tus productos
                en tiempo récord
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

      {/* =================================================
          MENÚ LATERAL
      ================================================= */}

      {menuOpen && (
        <div
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setMenuOpen(
                false
              );
            }
          }}
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.35)",
            zIndex: 10000,
          }}
        >

          <aside
            style={{
              width:
                "min(330px, 88vw)",
              height:
                "100%",
              background:
                "white",
              padding:
                "22px 18px",
              boxShadow:
                "8px 0 30px rgba(0,0,0,.15)",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  22,
              }}
            >

              <strong
                style={{
                  fontSize:
                    23,
                  background:
                    "linear-gradient(90deg,#ed174d,#7020d0)",
                  WebkitBackgroundClip:
                    "text",
                  color:
                    "transparent",
                }}
              >
                SHORASHOPP
              </strong>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
                style={{
                  border: 0,
                  background:
                    "#f5f5f7",
                  borderRadius:
                    12,
                  width:
                    40,
                  height:
                    40,
                  fontSize:
                    22,
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

            </div>

            <div
              style={{
                display:
                  "grid",
                gap: 8,
              }}
            >

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "home"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                ⌂
                <span>
                  Inicio
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleAccountAccess
                }
                style={
                  menuButtonStyle
                }
              >
                ✨
                <span>
                  Mi cuenta
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "categories"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                ▦
                <span>
                  Categorías
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "favorites"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                ♡
                <span>
                  Favoritos
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "offers"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                🏷️
                <span>
                  Ofertas
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "notifications"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                🔔
                <span>
                  Notificaciones
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openPage(
                    "privacy"
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                🔐
                <span>
                  Privacidad y
                  seguridad
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showActionMessage(
                    "Tus pedidos se conectarán aquí."
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                📦
                <span>
                  Mis pedidos
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showActionMessage(
                    "Tus mensajes se conectarán aquí."
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                💬
                <span>
                  Mensajes
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showActionMessage(
                    "Configuración próximamente."
                  )
                }
                style={
                  menuButtonStyle
                }
              >
                ⚙️
                <span>
                  Configuración
                </span>
              </button>

            </div>
          </aside>
        </div>
      )}

      {/* =================================================
          BARRA INFERIOR
      ================================================= */}

      <nav className="bottom-nav">

        <button
          className={`bottom-item ${
            currentPage ===
            "home"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            openPage("home")
          }
        >
          <span>
            ⌂
          </span>

          <small>
            Inicio
          </small>
        </button>

        <button
          className={`bottom-item ${
            currentPage ===
              "categories"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            openPage(
              "categories"
            )
          }
        >
          <span>
            ▦
          </span>

          <small>
            Categorías
          </small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={() =>
            openAuth(
              "register"
            )
          }
        >
          <span>
            ▰
          </span>

          <small>
            Vender
          </small>
        </button>

        <button
          className={`bottom-item ${
            currentPage ===
              "favorites"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            openPage(
              "favorites"
            )
          }
        >
          <span>
            ♡
          </span>

          <small>
            Favoritos
          </small>
        </button>

        <button
          className={`bottom-item ${
            currentPage ===
              "account"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={
            handleAccountAccess
          }
        >
          <span>
            ♙
          </span>

          <small>
            Cuenta
          </small>
        </button>

      </nav>

      {/* =================================================
          MENSAJE
      ================================================= */}

      {actionMessage && (
        <div
          style={{
            position:
              "fixed",
            bottom:
              "90px",
            left: "50%",
            transform:
              "translateX(-50%)",
            background:
              "#222",
            color: "#fff",
            padding:
              "10px 18px",
            borderRadius:
              "20px",
            zIndex:
              9999,
            fontSize:
              "13px",
            textAlign:
              "center",
          }}
        >
          {
            actionMessage
          }
        </div>
      )}

      {/* =================================================
          AUTENTICACIÓN
      ================================================= */}

      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(
            event
          ) => {
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
              onClick={
                closeAuth
              }
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
              onSubmit={
                handleAuth
              }
            >

              {authMode ===
                "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event
                        .target
                        .value
                    )
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(
                  event
                ) =>
                  setEmail(
                    event
                      .target
                      .value
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event
                      .target
                      .value
                  )
                }
                minLength={6}
                required
              />

              <button
                className="auth-submit"
                type="submit"
                disabled={
                  loading
                }
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
                  ¿No tienes
                  cuenta?{" "}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "register"
                      );
                      setMessage(
                        ""
                      );
                    }}
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes
                  cuenta?{" "}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(
                        "login"
                      );
                      setMessage(
                        ""
                      );
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
