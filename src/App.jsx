import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

/* =========================================================
   DATOS
========================================================= */

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
   ICONOS
========================================================= */

function Icon({ name, size = 24, stroke = 2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    cart: (
      <>
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c.8-4.1 3.5-6 8-6s7.2 1.9 8 6" />
      </>
    ),

    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),

    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),

    heart: (
      <path d="M20.8 8.8c0 5.4-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.5Z" />
    ),

    store: (
      <>
        <path d="M4 10v10h16V10" />
        <path d="M3 10 5 4h14l2 6" />
        <path d="M3 10c1.7 2 3.5 2 5.2 0 1.7 2 3.5 2 5.2 0 1.7 2 3.5 2 5.2 0 1.7 2 3.5 2 5.2 0" />
        <path d="M9 20v-5h6v5" />
      </>
    ),

    arrow: <path d="m9 18 6-6-6-6" />,

    back: <path d="m15 18-6-6 6-6" />,

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),

    box: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),

    message: (
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.2-.6L4 20l1.5-4.1A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),

    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v6c0 5-3.3 8.3-8 10-4.7-1.7-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),

    truck: (
      <>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),

    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),

    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </>
    ),

    document: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h4" />
        <path d="M10 13h5" />
        <path d="M10 17h5" />
      </>
    ),

    key: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 8-8" />
        <path d="m16 5 3 3" />
        <path d="m14 7 3 3" />
      </>
    ),

    devices: (
      <>
        <rect x="3" y="4" width="13" height="16" rx="2" />
        <path d="M8 17h3" />
        <path d="M19 8h2v11a1 1 0 0 1-1 1h-7" />
      </>
    ),

    language: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [session, setSession] = useState(null);

  const [view, setView] = useState("home");
  const [previousView, setPreviousView] = useState("home");

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  /* =======================================================
     CONFIGURACIÓN
  ======================================================= */

  const [notificationSettings, setNotificationSettings] = useState({
    orders: true,
    promotions: true,
    messages: true,
    news: true,
  });

  const [country, setCountry] = useState("México");
  const [currency, setCurrency] = useState("MXN");
  const [language, setLanguage] = useState("Español");

  /* =======================================================
     SESIÓN
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSession(data?.session ?? null);
      }
    };

    loadSession();

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
     NAVEGACIÓN
  ======================================================= */

  const navigate = (newView) => {
    setPreviousView(view);
    setView(newView);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goBack = () => {
    setView(previousView || "home");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setView("home");
    setSelectedCategory("Todas");
    setSearch("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     AUTENTICACIÓN
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

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        setMessage(
          "Por favor, escribe tu correo electrónico."
        );
        return;
      }

      if (!password) {
        setMessage(
          "Por favor, escribe tu contraseña."
        );
        return;
      }

      if (password.length < 6) {
        setMessage(
          "La contraseña debe tener al menos 6 caracteres."
        );
        return;
      }

      if (authMode === "register") {
        const cleanName = name.trim();

        if (!cleanName) {
          setMessage(
            "Por favor, escribe tu nombre completo."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
              },
            },
          });

        if (error) {
          console.error(
            "Supabase signup error:",
            error
          );

          const errorMessage =
            error?.message ||
            error?.error_description ||
            error?.msg ||
            (typeof error === "string"
              ? error
              : "");

          setMessage(
            errorMessage ||
              "No se pudo crear la cuenta. Inténtalo nuevamente."
          );

          return;
        }

        if (data?.session) {
          setSession(data.session);
          closeAuth();
          navigate("account");
          return;
        }

        if (data?.user) {
          setMessage(
            "¡Cuenta creada correctamente! Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión."
          );

          setPassword("");
          return;
        }

        setMessage(
          "La cuenta fue procesada, pero Supabase no devolvió los datos esperados. Revisa tu correo e inténtalo nuevamente."
        );

        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        console.error(
          "Supabase login error:",
          error
        );

        const errorMessage =
          error?.message ||
          error?.error_description ||
          error?.msg ||
          (typeof error === "string"
            ? error
            : "");

        setMessage(
          errorMessage ||
            "No se pudo iniciar sesión. Revisa tu correo y contraseña."
        );

        return;
      }

      if (!data?.session) {
        setMessage(
          "No se pudo iniciar sesión porque Supabase no devolvió una sesión."
        );

        return;
      }

      setSession(data.session);
      closeAuth();
      navigate("account");

    } catch (error) {
      console.error(
        "SHORASHOPP authentication error:",
        error
      );

      const errorMessage =
        error?.message ||
        error?.error_description ||
        error?.msg ||
        (typeof error === "string"
          ? error
          : "");

      setMessage(
        errorMessage ||
          "Ocurrió un error inesperado al comunicarnos con Supabase. Inténtalo nuevamente."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("home");
  };

  /* =======================================================
     FAVORITOS
  ======================================================= */

  const toggleFavorite = (productName) => {
    setFavorites((current) =>
      current.includes(productName)
        ? current.filter((item) => item !== productName)
        : [...current, productName]
    );
  };

  /* =======================================================
     CARRITO
  ======================================================= */

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.name === product.name
      );

      if (existing) {
        return current.map((item) =>
          item.name === product.name
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
  };

  const changeCartQuantity = (
    productName,
    amount
  ) => {
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
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => {
      const price = Number(
        item.price
          .replace("$", "")
          .replace(",", "")
      );

      return (
        total +
        price * item.quantity
      );
    },
    0
  );

  /* =======================================================
     FILTROS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "Todas") {
      result = result.filter(
        (product) =>
          product.category ===
          selectedCategory
      );
    }

    if (search.trim()) {
      const query =
        search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.category
            .toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [
    selectedCategory,
    search,
  ]);

  /* =======================================================
     HEADER
  ======================================================= */

  const Header = () => (
    <header className="mobile-header">
      <button
        className="menu-button"
        type="button"
        onClick={() => navigate("menu")}
        aria-label="Menú"
      >
        <Icon
          name="menu"
          size={32}
          stroke={2}
        />
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
          <b>Compra.</b>{" "}
          <em>Vende.</em>{" "}
          <i>Descubre.</i>
        </small>
      </button>

      <div className="header-icons">
        <button
          type="button"
          className="header-icon-button"
          onClick={() =>
            navigate("notifications")
          }
        >
          <Icon
            name="bell"
            size={28}
          />
          <i>3</i>
        </button>

        <button
          type="button"
          className="header-icon-button"
          onClick={() =>
            navigate("cart")
          }
        >
          <Icon
            name="cart"
            size={29}
          />

          {cartCount > 0 && (
            <i>{cartCount}</i>
          )}
        </button>
      </div>
    </header>
  );

  /* =======================================================
     BÚSQUEDA
  ======================================================= */

  const SearchBar = () => (
    <div className="search-container">
      <div className="search-box">
        <Icon
          name="search"
          size={30}
        />

        <input
          type="text"
          placeholder="¿Qué estás buscando hoy?"
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value
            );

            if (view !== "search") {
              setView("search");
            }
          }}
        />

        <button
          type="button"
          onClick={() =>
            navigate("search")
          }
          aria-label="Buscar"
        >
          <Icon
            name="search"
            size={28}
          />
        </button>
      </div>
    </div>
  );

  /* =======================================================
     PAGE HEADER
  ======================================================= */

  const PageHeader = ({ title }) => (
    <div className="page-header">
      <button
        type="button"
        onClick={goBack}
        className="page-back"
      >
        <Icon
          name="back"
          size={28}
        />
      </button>

      <h1>{title}</h1>

      <button
        type="button"
        className="page-home"
        onClick={goHome}
      >
        <Icon
          name="home"
          size={23}
        />
      </button>
    </div>
  );

  /* =======================================================
     PRODUCT CARD
  ======================================================= */

  const ProductCard = ({
    product,
  }) => (
    <article className="product-card">
      <div
        className={`product-image ${product.type}`}
        onClick={() =>
          addToCart(product)
        }
      >
        <span className="product-label">
          {product.discount}
        </span>

        <button
          className={`heart-button ${
            favorites.includes(
              product.name
            )
              ? "favorite"
              : ""
          }`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(
              product.name
            );
          }}
        >
          <Icon
            name="heart"
            size={24}
            stroke={1.8}
          />
        </button>

        <div className="product-art">
          {product.type ===
            "earbuds" && (
            <div className="earbuds-art">
              <span>◖</span>
              <span>◗</span>
              <small>▱</small>
            </div>
          )}

          {product.type === "bag" && (
            <div className="bag-art">
              👜
            </div>
          )}

          {product.type ===
            "watch" && (
            <div className="watch-art">
              ⌚
            </div>
          )}

          {product.type ===
            "blender" && (
            <div className="blender-art">
              🥤
            </div>
          )}
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="price-row">
          <strong>
            {product.price}
          </strong>

          {product.oldPrice && (
            <del>
              {product.oldPrice}
            </del>
          )}
        </div>

        <div className="rating-row">
          <span>★</span>
          {product.rating}
          <small>
            • {product.reviews}
          </small>
        </div>

        <button
          className="add-cart-button"
          type="button"
          onClick={() =>
            addToCart(product)
          }
        >
          <Icon
            name="cart"
            size={18}
          />
          Agregar
        </button>
      </div>
    </article>
  );

  /* =======================================================
     QUICK CARD
  ======================================================= */

  const QuickCard = ({
    type,
    icon,
    title,
    text,
    onClick,
  }) => (
    <button
      className={`quick-card ${type}`}
      type="button"
      onClick={onClick}
    >
      <div className="quick-icon">
        {icon}
      </div>

      <div className="quick-content">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <b className="round-arrow">
        <Icon
          name="arrow"
          size={23}
        />
      </b>
    </button>
  );

  /* =======================================================
     HOME
  ======================================================= */

  const HomePage = () => (
    <>
      <SearchBar />

      <main>
        <section className="quick-cards">
          <QuickCard
            type="sell-card"
            icon={
              <Icon
                name="store"
                size={38}
              />
            }
            title={
              <>
                Vende en
                <br />
                SHORASHOPP
              </>
            }
            text={
              <>
                Únete y comienza a vender
                <br />
                tus productos hoy
              </>
            }
            onClick={() =>
              navigate("sell")
            }
          />

          <QuickCard
            type="account-card"
            icon={
              <Icon
                name="user"
                size={38}
              />
            }
            title="Mi cuenta"
            text={
              <>
                Inicia sesión
                <br />
                para ver tu perfil y pedidos
              </>
            }
            onClick={() =>
              session
                ? navigate("account")
                : openAuth("login")
            }
          />
        </section>

        <section className="content-section">
          <div className="section-title-row">
            <h2>Categorías</h2>

            <button
              type="button"
              onClick={() =>
                navigate("categories")
              }
            >
              Ver todas
              <Icon
                name="arrow"
                size={22}
              />
            </button>
          </div>

          <div className="categories-scroll">
            {categories.map(
              (category) => (
                <button
                  className="category-item"
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(
                      category.name
                    );
                    navigate("category");
                  }}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <span>
                    {category.name}
                  </span>
                </button>
              )
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
                  navigate("offers")
                }
              >
                Ver ofertas
                <Icon
                  name="arrow"
                  size={20}
                />
              </button>
            </div>

            <div className="offer-products">
              <div className="offer-decoration percent-one">
                %
              </div>

              <div className="offer-bag">
                🛍️
              </div>

              <div className="offer-headphones">
                🎧
              </div>

              <div className="offer-watch">
                ⌚
              </div>

              <div className="offer-shoe">
                👟
              </div>

              <div className="offer-decoration percent-two">
                %
              </div>
            </div>
          </div>

          <div className="offer-dots">
            <b></b>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </section>

        <section className="content-section products-section">
          <div className="section-title-row">
            <h2>
              Productos destacados
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate("products")
              }
            >
              Ver todos
              <Icon
                name="arrow"
                size={22}
              />
            </button>
          </div>

          <div className="products-grid">
            {products.map(
              (product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                />
              )
            )}
          </div>
        </section>

        <TrustSection />
      </main>
    </>
  );

  /* =======================================================
     CATEGORÍAS
  ======================================================= */

  const CategoriesPage = () => (
    <main className="page-content">
      <PageHeader title="Categorías" />

      <div className="page-intro">
        <span className="page-intro-icon">
          <Icon
            name="grid"
            size={30}
          />
        </span>

        <div>
          <strong>
            Explora por categoría
          </strong>

          <small>
            Encuentra exactamente lo que buscas.
          </small>
        </div>
      </div>

      <div className="all-categories">
        {categories.map(
          (category) => (
            <button
              className="category-page-card"
              key={category.name}
              type="button"
              onClick={() => {
                setSelectedCategory(
                  category.name
                );
                navigate("category");
              }}
            >
              <div className="category-icon">
                {category.icon}
              </div>

              <div>
                <strong>
                  {category.name}
                </strong>

                <span>
                  Explorar productos
                </span>
              </div>

              <Icon
                name="arrow"
                size={22}
              />
            </button>
          )
        )}
      </div>
    </main>
  );

  /* =======================================================
     CATEGORÍA
  ======================================================= */

  const CategoryPage = () => (
    <main className="page-content">
      <PageHeader
        title={selectedCategory}
      />

      <div className="category-heading">
        <div>
          <span>Categoría</span>
          <h2>
            {selectedCategory}
          </h2>
        </div>

        <b>
          {filteredProducts.length} productos
        </b>
      </div>

      <div className="products-grid">
        {filteredProducts.length >
        0 ? (
          filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.name}
                product={product}
              />
            )
          )
        ) : (
          <EmptyState
            icon="🔎"
            title="No hay productos"
            text="Todavía no hay productos en esta categoría."
          />
        )}
      </div>
    </main>
  );

  /* =======================================================
     PRODUCTOS
  ======================================================= */

  const ProductsPage = () => (
    <main className="page-content">
      <PageHeader
        title="Todos los productos"
      />

      <div className="page-intro">
        <span className="page-intro-icon">
          🛍️
        </span>

        <div>
          <strong>
            Descubre nuestros productos
          </strong>

          <small>
            Compra, compara y encuentra tus favoritos.
          </small>
        </div>
      </div>

      <div className="products-grid">
        {products.map(
          (product) => (
            <ProductCard
              key={product.name}
              product={product}
            />
          )
        )}
      </div>
    </main>
  );

  /* =======================================================
     OFERTAS
  ======================================================= */

  const OffersPage = () => (
    <main className="page-content">
      <PageHeader
        title="Ofertas exclusivas"
      />

      <div className="internal-offer-banner">
        <div>
          <span>OFERTAS</span>

          <strong>
            Precios especiales
          </strong>

          <small>
            Aprovecha antes de que terminen.
          </small>
        </div>

        <b>%</b>
      </div>

      <div className="products-grid">
        {products.map(
          (product) => (
            <ProductCard
              key={product.name}
              product={product}
            />
          )
        )}
      </div>
    </main>
  );

  /* =======================================================
     BÚSQUEDA
  ======================================================= */

  const SearchPage = () => (
    <main className="page-content">
      <PageHeader title="Buscar" />

      <div className="search-page-box">
        <Icon
          name="search"
          size={24}
        />

        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          autoFocus
        />
      </div>

      <div className="search-result-title">
        <div>
          <span>Resultados</span>

          <h2>
            {search
              ? `"${search}"`
              : "Todos los productos"}
          </h2>
        </div>

        <b>
          {filteredProducts.length}
        </b>
      </div>

      <div className="products-grid">
        {filteredProducts.length >
        0 ? (
          filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.name}
                product={product}
              />
            )
          )
        ) : (
          <EmptyState
            icon="🔎"
            title="No encontramos productos"
            text="Prueba con otra palabra."
          />
        )}
      </div>
    </main>
  );

  /* =======================================================
     CARRITO
  ======================================================= */

  const CartPage = () => (
    <main className="page-content">
      <PageHeader title="Mi carrito" />

      {cart.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Tu carrito está vacío"
          text="Agrega productos y aparecerán aquí."
          action="Explorar productos"
          onAction={() =>
            navigate("products")
          }
        />
      ) : (
        <>
          <div className="cart-page-list">
            {cart.map(
              (item) => (
                <div
                  className="cart-page-item"
                  key={item.name}
                >
                  <div
                    className={`cart-item-art ${item.type}`}
                  >
                    {item.type ===
                      "earbuds" &&
                      "🎧"}
                    {item.type ===
                      "bag" &&
                      "👜"}
                    {item.type ===
                      "watch" &&
                      "⌚"}
                    {item.type ===
                      "blender" &&
                      "🥤"}
                  </div>

                  <div className="cart-item-info">
                    <h3>
                      {item.name}
                    </h3>

                    <strong>
                      {item.price}
                    </strong>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          changeCartQuantity(
                            item.name,
                            -1
                          )
                        }
                      >
                        −
                      </button>

                      <b>
                        {item.quantity}
                      </b>

                      <button
                        type="button"
                        onClick={() =>
                          changeCartQuantity(
                            item.name,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="cart-summary">
            <div>
              <span>
                Productos
              </span>
              <b>
                {cartCount}
              </b>
            </div>

            <div className="cart-total">
              <span>Total</span>

              <strong>
                $
                {cartTotal.toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>
          </div>

          <button
            className="checkout-button"
            type="button"
            onClick={() =>
              navigate("checkout")
            }
          >
            Continuar compra
            <Icon
              name="arrow"
              size={22}
            />
          </button>
        </>
      )}
    </main>
  );

  /* =======================================================
     FAVORITOS
  ======================================================= */

  const FavoritesPage =
    () => {
      const favoriteProducts =
        products.filter(
          (product) =>
            favorites.includes(
              product.name
            )
        );

      return (
        <main className="page-content">
          <PageHeader
            title="Mis favoritos"
          />

          {favoriteProducts.length ===
          0 ? (
            <EmptyState
              icon="♡"
              title="No tienes favoritos"
              text="Toca el corazón de un producto para guardarlo."
              action="Ver productos"
              onAction={() =>
                navigate(
                  "products"
                )
              }
            />
          ) : (
            <div className="products-grid">
              {favoriteProducts.map(
                (product) => (
                  <ProductCard
                    key={product.name}
                    product={product}
                  />
                )
              )}
            </div>
          )}
        </main>
      );
    };

  /* =======================================================
     NOTIFICACIONES GENERALES
  ======================================================= */

  const NotificationsPage =
    () => (
      <main className="page-content">
        <PageHeader
          title="Notificaciones"
        />

        <div className="notification-list">
          <Notification
            icon="🎉"
            title="¡Bienvenido a SHORASHOPP!"
            text="Descubre productos increíbles."
          />

          <Notification
            icon="🔥"
            title="Nuevas ofertas disponibles"
            text="Revisa nuestras promociones."
          />

          <Notification
            icon="📦"
            title="Tus pedidos aparecerán aquí"
            text="Podrás consultar el estado de tus compras."
          />
        </div>
      </main>
    );

  /* =======================================================
     CUENTA
  ======================================================= */

  const AccountPage = () => (
    <main className="page-content">
      <PageHeader title="Mi cuenta" />

      <div className="account-page">
        <div className="account-avatar">
          <Icon
            name="user"
            size={46}
          />
        </div>

        <h2>Mi cuenta</h2>

        {session ? (
          <p>
            {session.user.email}
          </p>
        ) : (
          <p>
            Inicia sesión para acceder a tus funciones.
          </p>
        )}

        {!session ? (
          <>
            <button
              className="panel-primary-button"
              type="button"
              onClick={() =>
                openAuth("login")
              }
            >
              Iniciar sesión
            </button>

            <button
              className="panel-option"
              type="button"
              onClick={() =>
                openAuth("register")
              }
            >
              <span className="option-icon">
                ✨
              </span>

              <span>
                Crear una cuenta
              </span>

              <Icon
                name="arrow"
                size={21}
              />
            </button>
          </>
        ) : (
          <>
            <AccountOption
              icon={
                <Icon
                  name="box"
                  size={23}
                />
              }
              text="Mis pedidos"
              onClick={() =>
                navigate("orders")
              }
            />

            <AccountOption
              icon={
                <Icon
                  name="message"
                  size={23}
                />
              }
              text="Mensajes"
              onClick={() =>
                navigate("messages")
              }
            />

            <AccountOption
              icon={
                <Icon
                  name="settings"
                  size={23}
                />
              }
              text="Configuración"
              onClick={() =>
                navigate("settings")
              }
            />

            <button
              className="panel-primary-button logout-button"
              type="button"
              onClick={
                handleLogout
              }
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </main>
  );

  /* =======================================================
     PEDIDOS
  ======================================================= */

  const OrdersPage = () => (
    <main className="page-content">
      <PageHeader title="Mis pedidos" />

      <EmptyState
        icon="📦"
        title="Todavía no tienes pedidos"
        text="Cuando realices una compra podrás consultar aquí el estado de tu pedido."
        action="Comprar ahora"
        onAction={() =>
          navigate("products")
        }
      />
    </main>
  );

  /* =======================================================
     MENSAJES
  ======================================================= */

  const MessagesPage = () => (
    <main className="page-content">
      <PageHeader title="Mensajes" />

      <EmptyState
        icon="💬"
        title="No tienes mensajes"
        text="Aquí podrás comunicarte con vendedores y con el equipo de SHORASHOPP."
      />
    </main>
  );

  /* =======================================================
     CONFIGURACIÓN PRINCIPAL
  ======================================================= */

  const SettingsPage = () => (
    <main className="page-content">
      <PageHeader
        title="Configuración"
      />

      <div className="settings-list">
        <SettingsOption
          icon={
            <Icon
              name="bell"
              size={24}
            />
          }
          title="Notificaciones"
          description="Controla qué avisos quieres recibir"
          onClick={() =>
            navigate(
              "notification-settings"
            )
          }
        />

        <SettingsOption
          icon={
            <Icon
              name="lock"
              size={24}
            />
          }
          title="Privacidad y seguridad"
          description="Protege tu cuenta y administra tus sesiones"
          onClick={() =>
            navigate("privacy")
          }
        />

        <SettingsOption
          icon={
            <Icon
              name="globe"
              size={24}
            />
          }
          title="País y preferencias"
          description="Idioma, moneda y país"
          onClick={() =>
            navigate(
              "preferences"
            )
          }
        />

        <SettingsOption
          icon={
            <Icon
              name="document"
              size={24}
            />
          }
          title="Términos y condiciones"
          description="Conoce las reglas de SHORASHOPP"
          onClick={() =>
            navigate("terms")
          }
        />

        <SettingsOption
          icon={
            <Icon
              name="info"
              size={24}
            />
          }
          title="Acerca de SHORASHOPP"
          description="Información de la aplicación"
          onClick={() =>
            navigate("about")
          }
        />
      </div>
    </main>
  );

  /* =======================================================
     CONFIGURACIÓN - NOTIFICACIONES
  ======================================================= */

  const NotificationSettingsPage =
    () => (
      <main className="page-content">
        <PageHeader
          title="Notificaciones"
        />

        <div className="settings-page-intro">
          <div className="settings-large-icon">
            <Icon
              name="bell"
              size={33}
            />
          </div>

          <div>
            <strong>
              Administra tus avisos
            </strong>
            <small>
              Decide qué notificaciones quieres recibir.
            </small>
          </div>
        </div>

        <div className="settings-section-card">
          <SettingsToggle
            title="Pedidos"
            description="Actualizaciones sobre tus compras y entregas"
            value={
              notificationSettings.orders
            }
            onChange={() =>
              setNotificationSettings(
                (current) => ({
                  ...current,
                  orders:
                    !current.orders,
                })
              )
            }
          />

          <SettingsToggle
            title="Ofertas y promociones"
            description="Descuentos, promociones y oportunidades especiales"
            value={
              notificationSettings.promotions
            }
            onChange={() =>
              setNotificationSettings(
                (current) => ({
                  ...current,
                  promotions:
                    !current.promotions,
                })
              )
            }
          />

          <SettingsToggle
            title="Mensajes"
            description="Avisos cuando recibas mensajes"
            value={
              notificationSettings.messages
            }
            onChange={() =>
              setNotificationSettings(
                (current) => ({
                  ...current,
                  messages:
                    !current.messages,
                })
              )
            }
          />

          <SettingsToggle
            title="Novedades de SHORASHOPP"
            description="Noticias, novedades y nuevas funciones"
            value={
              notificationSettings.news
            }
            onChange={() =>
              setNotificationSettings(
                (current) => ({
                  ...current,
                  news:
                    !current.news,
                })
              )
            }
            last
          />
        </div>
      </main>
    );

  /* =======================================================
     CONFIGURACIÓN - PRIVACIDAD
  ======================================================= */

  const PrivacyPage = () => (
    <main className="page-content">
      <PageHeader
        title="Privacidad y seguridad"
      />

      <div className="settings-page-intro">
        <div className="settings-large-icon">
          <Icon
            name="shield"
            size={33}
          />
        </div>

        <div>
          <strong>
            Protege tu cuenta
          </strong>

          <small>
            Administra tu seguridad y privacidad.
          </small>
        </div>
      </div>

      <div className="settings-section-card">
        <SettingsAction
          icon={
            <Icon
              name="key"
              size={23}
            />
          }
          title="Cambiar contraseña"
          description="Actualiza tu contraseña de acceso"
          onClick={() =>
            setMessage(
              "La opción para cambiar contraseña se conectará aquí."
            )
          }
        />

        <SettingsAction
          icon={
            <Icon
              name="devices"
              size={23}
            />
          }
          title="Sesiones activas"
          description="Revisa dónde tienes abierta tu cuenta"
          onClick={() =>
            setMessage(
              "La administración de sesiones se conectará aquí."
            )
          }
        />

        <SettingsAction
          icon={
            <Icon
              name="shield"
              size={23}
            />
          }
          title="Verificación de seguridad"
          description="Revisa las medidas de protección de tu cuenta"
          onClick={() =>
            setMessage(
              "La verificación de seguridad se conectará aquí."
            )
          }
          last
        />
      </div>

      {message && (
        <div className="settings-feedback">
          {message}
        </div>
      )}
    </main>
  );

  /* =======================================================
     CONFIGURACIÓN - PAÍS Y PREFERENCIAS
  ======================================================= */

  const PreferencesPage =
    () => (
      <main className="page-content">
        <PageHeader
          title="País y preferencias"
        />

        <div className="settings-page-intro">
          <div className="settings-large-icon">
            <Icon
              name="globe"
              size={33}
            />
          </div>

          <div>
            <strong>
              Personaliza tu experiencia
            </strong>

            <small>
              Estas opciones afectan cómo ves SHORASHOPP.
            </small>
          </div>
        </div>

        <div className="settings-section-card">
          <div className="preference-row">
            <div className="preference-icon">
              <Icon
                name="globe"
                size={22}
              />
            </div>

            <div className="preference-content">
              <strong>País</strong>

              <select
                value={country}
                onChange={(event) =>
                  setCountry(
                    event.target.value
                  )
                }
              >
                <option>
                  México
                </option>
                <option>
                  Estados Unidos
                </option>
                <option>
                  Canadá
                </option>
                <option>
                  España
                </option>
              </select>
            </div>
          </div>

          <div className="preference-row">
            <div className="preference-icon">
              $
            </div>

            <div className="preference-content">
              <strong>
                Moneda
              </strong>

              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(
                    event.target.value
                  )
                }
              >
                <option value="MXN">
                  MXN — Peso mexicano
                </option>

                <option value="USD">
                  USD — Dólar estadounidense
                </option>

                <option value="CAD">
                  CAD — Dólar canadiense
                </option>

                <option value="EUR">
                  EUR — Euro
                </option>
              </select>
            </div>
          </div>

          <div className="preference-row last">
            <div className="preference-icon">
              <Icon
                name="language"
                size={22}
              />
            </div>

            <div className="preference-content">
              <strong>
                Idioma
              </strong>

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
              >
                <option>
                  Español
                </option>
                <option>
                  English
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="preference-summary">
          <span>
            Configuración actual
          </span>

          <strong>
            {country} · {currency} · {language}
          </strong>
        </div>
      </main>
    );

  /* =======================================================
     CONFIGURACIÓN - TÉRMINOS
  ======================================================= */

  const TermsPage = () => (
    <main className="page-content">
      <PageHeader
        title="Términos y condiciones"
      />

      <article className="legal-page">
        <div className="legal-header">
          <div className="legal-icon">
            <Icon
              name="document"
              size={32}
            />
          </div>

          <div>
            <strong>
              Términos y condiciones de SHORASHOPP
            </strong>

            <small>
              Información general para compradores y vendedores.
            </small>
          </div>
        </div>

        <LegalSection
          number="1"
          title="Uso de SHORASHOPP"
        >
          SHORASHOPP es una plataforma de comercio electrónico
          que permite a compradores y vendedores ofrecer,
          descubrir y adquirir productos dentro de la aplicación.
          Al utilizar la plataforma aceptas utilizarla de manera
          responsable y conforme a la legislación aplicable.
        </LegalSection>

        <LegalSection
          number="2"
          title="Cuentas"
        >
          Cada usuario es responsable de proporcionar información
          correcta y de mantener protegidos sus datos de acceso.
          No debes utilizar una cuenta de otra persona ni
          proporcionar información falsa.
        </LegalSection>

        <LegalSection
          number="3"
          title="Productos publicados"
        >
          Los vendedores son responsables de que sus publicaciones
          sean legítimas, completas y precisas. Los productos y
          servicios ofrecidos deben cumplir las normas de
          SHORASHOPP y las leyes aplicables.
        </LegalSection>

        <LegalSection
          number="4"
          title="Compras"
        >
          Los compradores deben revisar cuidadosamente la
          información del producto antes de confirmar una compra.
          Los precios, disponibilidad y condiciones pueden variar.
        </LegalSection>

        <LegalSection
          number="5"
          title="Pagos"
        >
          Los pagos se procesarán mediante los métodos habilitados
          en SHORASHOPP. La plataforma podrá mostrar información
          relacionada con el pago y el estado de la operación.
        </LegalSection>

        <LegalSection
          number="6"
          title="Envíos"
        >
          Las condiciones de envío pueden variar según el vendedor,
          el producto y la zona de entrega. El vendedor deberá
          proporcionar información correcta sobre la preparación y
          envío del pedido.
        </LegalSection>

        <LegalSection
          number="7"
          title="Conducta"
        >
          No está permitido utilizar SHORASHOPP para actividades
          fraudulentas, ilegales, engañosas o que puedan perjudicar
          a otros usuarios o a la plataforma.
        </LegalSection>

        <LegalSection
          number="8"
          title="Cambios"
        >
          SHORASHOPP podrá actualizar estos términos para reflejar
          cambios en sus servicios, funcionamiento o requisitos
          legales. Las nuevas versiones sustituirán a las
          anteriores cuando entren en vigor.
        </LegalSection>

        <div className="legal-note">
          <strong>
            Información importante
          </strong>

          <p>
            Este contenido es una base informativa para la aplicación.
            Antes del lanzamiento comercial de SHORASHOPP debe
            revisarse y adaptarse con asesoría legal a las leyes y
            condiciones específicas de operación.
          </p>
        </div>
      </article>
    </main>
  );

  /* =======================================================
     CONFIGURACIÓN - ACERCA
  ======================================================= */

  const AboutPage = () => (
    <main className="page-content">
      <PageHeader
        title="Acerca de SHORASHOPP"
      />

      <div className="about-page">
        <div className="about-logo">
          <strong>
            SHORA<span>SHOPP</span>
          </strong>

          <small>
            Compra. Vende. Descubre.
          </small>
        </div>

        <span className="about-badge">
          TU MARKETPLACE
        </span>

        <h2>
          Todo lo que buscas,
          <br />
          en un solo lugar.
        </h2>

        <p>
          SHORASHOPP es una plataforma pensada para conectar
          compradores y vendedores y facilitar una experiencia
          de compra sencilla, moderna y segura.
        </p>

        <div className="about-cards">
          <div className="about-card">
            <span>🛍️</span>
            <strong>Compra</strong>
            <small>
              Descubre productos y ofertas.
            </small>
          </div>

          <div className="about-card">
            <span>🏪</span>
            <strong>Vende</strong>
            <small>
              Publica y llega a compradores.
            </small>
          </div>

          <div className="about-card">
            <span>✨</span>
            <strong>Descubre</strong>
            <small>
              Encuentra nuevas oportunidades.
            </small>
          </div>
        </div>

        <div className="about-version">
          <span>
            Aplicación
          </span>
          <strong>
            SHORASHOPP
          </strong>
        </div>

        <div className="about-version">
          <span>
            Versión
          </span>
          <strong>
            1.0.0
          </strong>
        </div>

        <div className="about-version last">
          <span>
            Estado
          </span>
          <strong className="status-online">
            En desarrollo
          </strong>
        </div>
      </div>
    </main>
  );

  /* =======================================================
     VENDER
  ======================================================= */

  const SellPage = () => (
    <main className="page-content">
      <PageHeader
        title="Vende en SHORASHOPP"
      />

      <div className="sell-page">
        <div className="sell-hero-icon">
          <Icon
            name="store"
            size={55}
          />
        </div>

        <span className="sell-kicker">
          CONVIÉRTETE EN VENDEDOR
        </span>

        <h2>
          Comienza a vender
        </h2>

        <p>
          Publica tus productos y llega a nuevos
          compradores dentro de SHORASHOPP.
        </p>

        <button
          className="panel-primary-button"
          type="button"
          onClick={() =>
            openAuth("register")
          }
        >
          Crear cuenta de vendedor
        </button>

        <button
          className="panel-option"
          type="button"
          onClick={() =>
            openAuth("login")
          }
        >
          <span>
            Ya tengo una cuenta
          </span>

          <Icon
            name="arrow"
            size={20}
          />
        </button>
      </div>
    </main>
  );

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const CheckoutPage = () => (
    <main className="page-content">
      <PageHeader
        title="Finalizar compra"
      />

      <div className="checkout-page">
        <div className="checkout-icon">
          <Icon
            name="cart"
            size={45}
          />
        </div>

        <span className="checkout-kicker">
          RESUMEN
        </span>

        <h2>
          Tu compra
        </h2>

        <div className="checkout-row">
          <span>
            Productos
          </span>

          <strong>
            {cartCount}
          </strong>
        </div>

        <div className="checkout-row total">
          <span>
            Total
          </span>

          <strong>
            $
            {cartTotal.toLocaleString(
              "es-MX",
              {
                minimumFractionDigits: 2,
              }
            )}
          </strong>
        </div>

        <button
          className="panel-primary-button"
          type="button"
          onClick={() =>
            setMessage(
              "El sistema de pago se conectará aquí."
            )
          }
        >
          Continuar al pago
        </button>

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}
      </div>
    </main>
  );

  /* =======================================================
     MENÚ
  ======================================================= */

  const MenuPage = () => (
    <main className="page-content">
      <PageHeader title="Menú" />

      <div className="main-menu-page">
        <MenuOption
          icon={
            <Icon
              name="user"
              size={25}
            />
          }
          text="Mi cuenta"
          onClick={() =>
            session
              ? navigate("account")
              : openAuth("login")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="box"
              size={25}
            />
          }
          text="Mis pedidos"
          onClick={() =>
            navigate("orders")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="message"
              size={25}
            />
          }
          text="Mensajes"
          onClick={() =>
            navigate("messages")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="settings"
              size={25}
            />
          }
          text="Configuración"
          onClick={() =>
            navigate("settings")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="heart"
              size={25}
            />
          }
          text="Favoritos"
          onClick={() =>
            navigate("favorites")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="store"
              size={25}
            />
          }
          text="Vender en SHORASHOPP"
          onClick={() =>
            navigate("sell")
          }
        />

        <MenuOption
          icon={
            <Icon
              name="bell"
              size={25}
            />
          }
          text="Notificaciones"
          onClick={() =>
            navigate(
              "notifications"
            )
          }
        />

        {session && (
          <button
            className="menu-logout"
            type="button"
            onClick={
              handleLogout
            }
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </main>
  );

  /* =======================================================
     CONFIANZA
  ======================================================= */

  const TrustSection = () => (
    <section className="trust-section">
      <TrustItem
        icon={
          <Icon
            name="shield"
            size={34}
          />
        }
        title="Compra segura"
        text="Protegemos tus datos y compras"
      />

      <TrustItem
        icon={
          <Icon
            name="truck"
            size={34}
          />
        }
        title="Envíos rápidos"
        text="Recibe tus productos en tiempo récord"
      />

      <TrustItem
        icon="✓"
        title="Vendedores verificados"
        text="Más confianza para ti"
      />

      <TrustItem
        icon="💬"
        title="Soporte 24/7"
        text="Estamos aquí para ayudarte"
      />
    </section>
  );

  /* =======================================================
     BARRA INFERIOR
  ======================================================= */

  const BottomNav = () => (
    <nav className="bottom-nav">
      <button
        className={`bottom-item ${
          view === "home"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={goHome}
      >
        <Icon
          name="home"
          size={25}
        />
        <small>Inicio</small>
      </button>

      <button
        className={`bottom-item ${
          view === "categories" ||
          view === "category"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          navigate("categories")
        }
      >
        <Icon
          name="grid"
          size={25}
        />
        <small>
          Categorías
        </small>
      </button>

      <button
        className={`seller-button ${
          view === "sell"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          navigate("sell")
        }
      >
        <span className="seller-circle">
          <Icon
            name="store"
            size={29}
          />
        </span>

        <small>Vender</small>
      </button>

      <button
        className={`bottom-item ${
          view === "favorites"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          navigate("favorites")
        }
      >
        <Icon
          name="heart"
          size={26}
        />
        <small>
          Favoritos
        </small>
      </button>

      <button
        className={`bottom-item ${
          view === "account"
            ? "active"
            : ""
        }`}
        type="button"
        onClick={() =>
          session
            ? navigate("account")
            : openAuth("login")
        }
      >
        <Icon
          name="user"
          size={26}
        />
        <small>Cuenta</small>
      </button>
    </nav>
  );

  /* =======================================================
     HELPERS
  ======================================================= */

  const EmptyState = ({
    icon,
    title,
    text,
    action,
    onAction,
  }) => (
    <div className="empty-page">
      <div className="empty-icon">
        {icon}
      </div>

      <h2>{title}</h2>

      <p>{text}</p>

      {action && (
        <button
          className="panel-primary-button"
          type="button"
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  );

  const Notification = ({
    icon,
    title,
    text,
  }) => (
    <div className="notification-item">
      <span>{icon}</span>

      <div>
        <strong>
          {title}
        </strong>
        <small>
          {text}
        </small>
      </div>

      <Icon
        name="arrow"
        size={20}
      />
    </div>
  );

  const AccountOption = ({
    icon,
    text,
    onClick,
  }) => (
    <button
      className="panel-option"
      type="button"
      onClick={onClick}
    >
      <span className="option-icon">
        {icon}
      </span>

      <span>
        {text}
      </span>

      <Icon
        name="arrow"
        size={20}
      />
    </button>
  );

  const MenuOption = ({
    icon,
    text,
    onClick,
  }) => (
    <button
      className="menu-option"
      type="button"
      onClick={onClick}
    >
      <span className="menu-option-icon">
        {icon}
      </span>

      <span>
        {text}
      </span>

      <Icon
        name="arrow"
        size={21}
      />
    </button>
  );

  const TrustItem = ({
    icon,
    title,
    text,
  }) => (
    <div className="trust-item">
      <span className="trust-icon">
        {icon}
      </span>

      <div>
        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>
      </div>
    </div>
  );

  const SettingsOption = ({
    icon,
    title,
    description,
    onClick,
  }) => (
    <button
      type="button"
      className="settings-option"
      onClick={onClick}
    >
      <span className="settings-option-icon">
        {icon}
      </span>

      <span className="settings-option-content">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <Icon
        name="arrow"
        size={21}
      />
    </button>
  );

  const SettingsToggle = ({
    title,
    description,
    value,
    onChange,
    last = false,
  }) => (
    <div
      className={`settings-toggle ${
        last ? "last" : ""
      }`}
    >
      <div>
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </div>

      <button
        type="button"
        className={`toggle ${
          value ? "on" : ""
        }`}
        onClick={onChange}
        aria-pressed={value}
      >
        <span />
      </button>
    </div>
  );

  const SettingsAction = ({
    icon,
    title,
    description,
    onClick,
    last = false,
  }) => (
    <button
      type="button"
      className={`settings-action ${
        last ? "last" : ""
      }`}
      onClick={onClick}
    >
      <span className="settings-action-icon">
        {icon}
      </span>

      <span className="settings-action-content">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <Icon
        name="arrow"
        size={20}
      />
    </button>
  );

  const LegalSection = ({
    number,
    title,
    children,
  }) => (
    <section className="legal-section">
      <div className="legal-number">
        {number}
      </div>

      <div>
        <h3>
          {title}
        </h3>

        <p>
          {children}
        </p>
      </div>
    </section>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  const renderView = () => {
    switch (view) {
      case "categories":
        return <CategoriesPage />;

      case "category":
        return <CategoryPage />;

      case "products":
        return <ProductsPage />;

      case "offers":
        return <OffersPage />;

      case "search":
        return <SearchPage />;

      case "cart":
        return <CartPage />;

      case "favorites":
        return <FavoritesPage />;

      case "notifications":
        return (
          <NotificationsPage />
        );

      case "account":
        return <AccountPage />;

      case "orders":
        return <OrdersPage />;

      case "messages":
        return <MessagesPage />;

      case "settings":
        return <SettingsPage />;

      case "notification-settings":
        return (
          <NotificationSettingsPage />
        );

      case "privacy":
        return <PrivacyPage />;

      case "preferences":
        return <PreferencesPage />;

      case "terms":
        return <TermsPage />;

      case "about":
        return <AboutPage />;

      case "sell":
        return <SellPage />;

      case "checkout":
        return <CheckoutPage />;

      case "menu":
        return <MenuPage />;

      case "home":
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      <Header />

      {renderView()}

      <BottomNav />

      {/* ===================================================
          LOGIN / REGISTRO
      =================================================== */}

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
          <div
            className="auth-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="auth-close"
              type="button"
              onClick={closeAuth}
            >
              <Icon
                name="close"
                size={22}
              />
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
                onChange={(event) =>
                  setEmail(
                    event.target
                      .value
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
                      .value
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
                      setAuthMode(
                        "login"
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

export default App;
