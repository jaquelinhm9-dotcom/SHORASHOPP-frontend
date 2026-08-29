import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";
const SETTINGS_KEY = "vanidaxi_settings";

const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Hola, necesito ayuda con VaniDaxi.";

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

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState(initialProducts);

  const [cart, setCart] = useState(() =>
    loadStorage(CART_KEY, [])
  );

  const [favorites, setFavorites] = useState(() =>
    loadStorage(FAVORITES_KEY, [])
  );

  const [settings, setSettings] = useState(() =>
    loadStorage(SETTINGS_KEY, {
      notifications: true,
      promotions: true,
      darkMode: false,
    })
  );

  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");

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
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    document.body.classList.toggle(
      "dark-theme",
      settings.darkMode
    );
  }, [settings]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0
  );

  const shippingCost =
    checkout.delivery === "express" &&
    cart.length > 0
      ? 99
      : 0;

  const cartTotal =
    cartSubtotal + shippingCost;

  const getCategoryFromPath = () => {
    if (!location.pathname.startsWith("/categoria/")) {
      return "Todos";
    }

    try {
      return decodeURIComponent(
        location.pathname.replace(
          "/categoria/",
          ""
        )
      );
    } catch {
      return "Todos";
    }
  };

  const activeCategory = getCategoryFromPath();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (
      activeCategory &&
      activeCategory !== "Todos"
    ) {
      result = result.filter(
        (product) =>
          product.category === activeCategory
      );
    }

    const term = normalizeText(search);

    if (!term) return result;

    return result.filter((product) => {
      const searchable = normalizeText(
        [
          product.name,
          product.category,
          product.description,
          ...(product.specifications || []),
        ].join(" ")
      );

      return searchable.includes(term);
    });
  }, [
    products,
    activeCategory,
    search,
  ]);

  const currentProductId = location.pathname.startsWith(
    "/producto/"
  )
    ? location.pathname.replace(
        "/producto/",
        ""
      )
    : null;

  const selectedProduct = currentProductId
    ? products.find(
        (product) =>
          String(product.id) ===
          String(currentProductId)
      )
    : null;

  const go = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setSearch("");
    go("/");
  };

  const goProducts = () => {
    setSearch("");
    go("/productos");
  };

  const goCategory = (categoryName) => {
    setSearch("");
    go(
      `/categoria/${encodeURIComponent(
        categoryName
      )}`
    );
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthMessage("");
    go(
      mode === "register"
        ? "/cuenta/crear"
        : "/cuenta/iniciar"
    );
  };

  const addToCart = (
    product,
    redirectToCart = true
  ) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
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

    if (redirectToCart) {
      go("/carrito");
    }
  };

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  const changeQuantity = (
    id,
    amount
  ) => {
    setCart((current) =>
      current.map((item) =>
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
        ? current.filter(
            (item) => item.id !== product.id
          )
        : [...current, product];
    });
  };

  const startCheckout = (
    product = null
  ) => {
    if (product) {
      addToCart(product, false);
    }

    if (
      !product &&
      cart.length === 0
    ) {
      go("/carrito");
      return;
    }

    go("/checkout/entrega");
  };

  const handleAuth = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "register") {
        if (
          authPassword.length < 6
        ) {
          setAuthMessage(
            "La contraseña debe tener al menos 6 caracteres."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
            options: {
              data: {
                full_name:
                  authName,
              },
            },
          });

        if (error) throw error;

        if (data?.session) {
          setUser(data.user);
          go("/cuenta");
        } else {
          setAuthMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword(
            {
              email: authEmail,
              password: authPassword,
            }
          );

        if (error) throw error;

        setUser(data.user);
        go("/cuenta");
      }
    } catch (error) {
      const message =
        error?.message?.toLowerCase() ||
        "";

      if (
        message.includes(
          "invalid login credentials"
        )
      ) {
        setAuthMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        message.includes(
          "email not confirmed"
        )
      ) {
        setAuthMessage(
          "Primero confirma tu correo electrónico."
        );
      } else if (
        message.includes(
          "already registered"
        )
      ) {
        setAuthMessage(
          "Este correo ya tiene una cuenta. Intenta iniciar sesión."
        );
      } else {
        setAuthMessage(
          error?.message ||
            "No fue posible completar la operación."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    go("/");
  };

  const handlePublish = (event) => {
    event.preventDefault();

    if (
      !newProduct.name ||
      !newProduct.price
    ) {
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(
        newProduct.price
      ),
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category:
        newProduct.category,
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
      description:
        newProduct.description ||
        "Producto publicado en VaniDaxi.",
      specifications: [],
    };

    setProducts((current) => [
      product,
      ...current,
    ]);

    setNewProduct({
      name: "",
      price: "",
      category: "Ropa y Moda",
      image: "",
      description: "",
    });

    go(`/producto/${product.id}`);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      WHATSAPP_MESSAGE
    );

    const url = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCheckoutNext = () => {
    if (
      location.pathname ===
      "/checkout/entrega"
    ) {
      if (
        !checkout.name ||
        !checkout.phone ||
        !checkout.address ||
        !checkout.city ||
        !checkout.state ||
        !checkout.zip
      ) {
        alert(
          "Completa todos los datos de entrega."
        );
        return;
      }

      go("/checkout/pago");
      return;
    }

    if (
      location.pathname ===
      "/checkout/pago"
    ) {
      go("/checkout/confirmacion");
      return;
    }

    if (
      location.pathname ===
      "/checkout/confirmacion"
    ) {
      go("/pedido/confirmado");
    }
  };

  const Header = () => (
    <header className="top-header">
      <div className="header-main">
        <button
          className="menu-button"
          onClick={() => go("/menu")}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <button
          className="brand"
          onClick={goHome}
        >
          VaniDaxi
        </button>

        <div className="search-box">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="¿Qué estás buscando?"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                goProducts();
              }
            }}
          />

          <button
            onClick={goProducts}
            aria-label="Buscar"
          >
            🔍
          </button>
        </div>

        <div className="header-actions">
          <button
            className="header-action"
            onClick={() =>
              user
                ? go("/cuenta")
                : go("/cuenta/iniciar")
            }
            aria-label="Mi cuenta"
          >
            ✨
          </button>

          <button
            className="header-action"
            onClick={() => go("/carrito")}
            aria-label="Carrito"
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
            activeCategory === "Todos"
              ? "active"
              : ""
          }`}
          onClick={() =>
            goProducts()
          }
        >
          Todo
        </button>

        {categories.map(
          (category) => (
            <button
              key={category.name}
              className={`category-pill ${
                activeCategory ===
                category.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                goCategory(
                  category.name
                )
              }
            >
              {category.name}
            </button>
          )
        )}
      </div>
    </header>
  );

  const BottomNav = () => (
    <nav className="bottom-nav">
      <button
        onClick={goHome}
      >
        <span>🏠</span>
        <small>Inicio</small>
      </button>

      <button
        onClick={() =>
          go("/favoritos")
        }
      >
        <span>❤️</span>
        <small>Favoritos</small>
      </button>

      <button
        onClick={() =>
          go("/productos")
        }
      >
        <span>🛍️</span>
        <small>Explorar</small>
      </button>

      <button
        onClick={() =>
          go("/cuenta")
        }
      >
        <span>✨</span>
        <small>Cuenta</small>
      </button>
    </nav>
  );

  const PageShell = ({
    children,
    title = "",
    back = true,
  }) => (
    <>
      <Header />

      <main className="page-content inner-page">
        {back && (
          <button
            className="back-button"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Atrás
          </button>
        )}

        {title && (
          <div className="page-title">
            <h1>{title}</h1>
          </div>
        )}

        {children}
      </main>

      <BottomNav />
    </>
  );

  const HomePage = () => (
    <>
      <Header />

      <main className="page-content">
        <section className="hero">
          <div>
            <div className="hero-kicker">
              VaniDaxi
            </div>

            <h1>
              Todo en un solo lugar
            </h1>

            <p>
              Compra, vende y descubre
              productos de diferentes
              categorías.
            </p>

            <button
              className="hero-button"
              onClick={goProducts}
            >
              Comprar ahora
            </button>
          </div>

          <div className="hero-icon">
            🛍️
          </div>
        </section>

        <section className="top-cards">
          {topCards.map(
            (card) => (
              <button
                key={card.title}
                className="top-card"
                style={{
                  backgroundImage: `url(${card.image})`,
                }}
                onClick={() => {
                  if (
                    card.title ===
                    "Vendedores"
                  ) {
                    go("/publicar");
                    return;
                  }

                  if (
                    card.title ===
                    "Envíos"
                  ) {
                    go(
                      "/mensajes/envios"
                    );
                    return;
                  }

                  goProducts();
                }}
              >
                <span>
                  <strong>
                    {card.title}
                  </strong>

                  <small>
                    {card.subtitle}
                  </small>
                </span>
              </button>
            )
          )}
        </section>

        <section>
          <div className="section-title">
            <h2>Categorías</h2>

            <button
              className="link-button"
              onClick={goProducts}
            >
              Ver todo
            </button>
          </div>

          <div className="categories-grid">
            {categories.map(
              (category) => (
                <button
                  className="category-card"
                  key={
                    category.name
                  }
                  onClick={() =>
                    goCategory(
                      category.name
                    )
                  }
                >
                  <img
                    src={
                      category.image
                    }
                    alt={
                      category.name
                    }
                  />

                  <span>
                    {category.name}
                  </span>
                </button>
              )
            )}
          </div>
        </section>

        <section className="join-card">
          <div>
            <strong>
              ✨ Únete a VaniDaxi
            </strong>

            <p>
              Compra, vende y disfruta
              de más funciones con tu
              cuenta.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              go(
                "/cuenta/crear"
              )
            }
          >
            Crear cuenta
          </button>
        </section>

        <section>
          <div className="section-title">
            <h2>
              Productos destacados
            </h2>

            <button
              className="link-button"
              onClick={goProducts}
            >
              Ver todos
            </button>
          </div>

          <ProductGrid
            items={products}
          />
        </section>
      </main>

      <WhatsAppButton />
      <BottomNav />
    </>
  );

  const ProductGrid = ({
    items,
  }) => (
    <div className="products-grid">
      {items.length === 0 ? (
        <div className="empty-state">
          No encontramos productos.
        </div>
      ) : (
        items.map((product) => {
          const favorite =
            favorites.some(
              (item) =>
                item.id ===
                product.id
            );

          return (
            <article
              className="product-card"
              key={product.id}
            >
              <div
                className="product-image"
                onClick={() =>
                  go(
                    `/producto/${product.id}`
                  )
                }
              >
                <img
                  src={product.image}
                  alt={product.name}
                />

                {product.discount >
                  0 && (
                  <span className="discount">
                    -
                    {
                      product.discount
                    }
                    %
                  </span>
                )}

                <button
                  className="favorite-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(
                      product
                    );
                  }}
                >
                  {favorite
                    ? "❤️"
                    : "♡"}
                </button>
              </div>

              <div className="product-info">
                <div className="product-category">
                  {product.category}
                </div>

                <h3 className="product-name">
                  {product.name}
                </h3>

                <div className="prices">
                  <strong className="price">
                    {formatPrice(
                      product.price
                    )}
                  </strong>

                  {product.oldPrice && (
                    <span className="old-price">
                      {formatPrice(
                        product.oldPrice
                      )}
                    </span>
                  )}
                </div>

                <div className="rating">
                  ⭐{" "}
                  {product.rating}{" "}
                  ·{" "}
                  {product.reviews}{" "}
                  opiniones
                </div>

                <div className="product-actions">
                  <button
                    className="details-button"
                    onClick={() =>
                      go(
                        `/producto/${product.id}`
                      )
                    }
                  >
                    Ver
                  </button>

                  <button
                    className="add-button"
                    onClick={() =>
                      addToCart(
                        product
                      )
                    }
                  >
                    🛒 Agregar
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );

  const WhatsAppButton = () => (
    <button
      className="floating-whatsapp"
      onClick={openWhatsApp}
      aria-label="Atención al cliente por WhatsApp"
      title="Atención al cliente"
    >
      ☎
    </button>
  );

  const MenuPage = () => (
    <PageShell title="Menú">
      <div className="menu-list-page">
        {user ? (
          <div className="account-box">
            <strong>
              {user.user_metadata
                ?.full_name ||
                "Mi cuenta"}
            </strong>

            <small>
              {user.email}
            </small>
          </div>
        ) : (
          <div className="account-box">
            <strong>
              ¡Hola! 👋
            </strong>

            <small>
              Inicia sesión para
              acceder a tu cuenta.
            </small>
          </div>
        )}

        <MenuLink
          icon="🏠"
          title="Inicio"
          onClick={goHome}
        />

        <MenuLink
          icon="✨"
          title="Mi cuenta"
          onClick={() =>
            go("/cuenta")
          }
        />

        <MenuLink
          icon="👤"
          title="Perfil"
          onClick={() =>
            go("/perfil")
          }
        />

        <MenuLink
          icon="❤️"
          title="Favoritos"
          onClick={() =>
            go("/favoritos")
          }
        />

        <MenuLink
          icon="💬"
          title="Centro de mensajes"
          onClick={() =>
            go("/mensajes")
          }
        />

        <MenuLink
          icon="➕"
          title="Publicar producto"
          onClick={() =>
            go("/publicar")
          }
        />

        <MenuLink
          icon="🛒"
          title="Mi carrito"
          suffix={
            cartCount > 0
              ? `(${cartCount})`
              : ""
          }
          onClick={() =>
            go("/carrito")
          }
        />

        <MenuLink
          icon="🛍️"
          title="Explorar productos"
          onClick={() =>
            go("/productos")
          }
        />

        <MenuLink
          icon="⚙️"
          title="Configuración"
          onClick={() =>
            go("/configuracion")
          }
        />

        <MenuLink
          icon="🟢"
          title="Atención al cliente"
          onClick={() =>
            go("/mensajes/atencion")
          }
        />

        {user ? (
          <MenuLink
            icon="🚪"
            title="Cerrar sesión"
            onClick={logout}
          />
        ) : null}
      </div>
    </PageShell>
  );

  const MenuLink = ({
    icon,
    title,
    suffix = "",
    onClick,
  }) => (
    <button
      className="menu-link"
      onClick={onClick}
    >
      <span className="menu-link-icon">
        {icon}
      </span>

      <strong>{title}</strong>

      {suffix && (
        <span className="menu-link-suffix">
          {suffix}
        </span>
      )}

      <span className="menu-arrow">
        →
      </span>
    </button>
  );

  const AccountPage = () => (
    <PageShell title="Mi cuenta">
      <div className="account-page-card">
        <div className="account-page-icon">
          ✨
        </div>

        {user ? (
          <>
            <h2>
              Bienvenido,
              <br />
              {user.user_metadata
                ?.full_name ||
                "a VaniDaxi"}
            </h2>

            <p>
              {user.email}
            </p>

            <div className="account-grid">
              <button
                className="account-option"
                onClick={() =>
                  go("/perfil")
                }
              >
                <span>
                  👤
                </span>

                <strong>
                  Perfil
                </strong>
              </button>

              <button
                className="account-option"
                onClick={() =>
                  go(
                    "/mensajes/pedidos"
                  )
                }
              >
                <span>
                  📦
                </span>

                <strong>
                  Mis pedidos
                </strong>
              </button>

              <button
                className="account-option"
                onClick={() =>
                  go(
                    "/mensajes/ventas"
                  )
                }
              >
                <span>
                  🏪
                </span>

                <strong>
                  Mis ventas
                </strong>
              </button>

              <button
                className="account-option"
                onClick={() =>
                  go(
                    "/configuracion"
                  )
                }
              >
                <span>
                  ⚙️
                </span>

                <strong>
                  Configuración
                </strong>
              </button>
            </div>

            <button
              className="secondary-button full-width"
              onClick={logout}
            >
              🚪 Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <h2>
              Entra a VaniDaxi
            </h2>

            <p>
              Accede a tu cuenta o
              crea una nueva para
              disfrutar de todas las
              funciones.
            </p>

            <div className="account-buttons">
              <button
                className="primary-button"
                onClick={() =>
                  go(
                    "/cuenta/iniciar"
                  )
                }
              >
                ✨ Iniciar sesión
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  go(
                    "/cuenta/crear"
                  )
                }
              >
                🚀 Crear cuenta
              </button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );

  const AuthPage = ({
    register = false,
  }) => {
    useEffect(() => {
      setAuthMode(
        register
          ? "register"
          : "login"
      );
    }, [register]);

    return (
      <PageShell
        title={
          register
            ? "Crear cuenta"
            : "Iniciar sesión"
        }
      >
        <div className="auth-page">
          <div className="auth-visual-page">
            <div className="auth-logo">
              🛍️
            </div>

            <h2>
              {register
                ? "Únete a VaniDaxi"
                : "Bienvenido de nuevo"}
            </h2>

            <p>
              {register
                ? "Crea tu cuenta para comprar, vender y descubrir más."
                : "Inicia sesión para continuar disfrutando de VaniDaxi."}
            </p>
          </div>

          <div className="auth-form-page">
            <form
              className="form"
              onSubmit={
                handleAuth
              }
            >
              {register && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={authName}
                  onChange={(
                    event
                  ) =>
                    setAuthName(
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
                value={authEmail}
                onChange={(
                  event
                ) =>
                  setAuthEmail(
                    event.target
                      .value
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={
                  authPassword
                }
                onChange={(
                  event
                ) =>
                  setAuthPassword(
                    event.target
                      .value
                  )
                }
                required
              />

              {authMessage && (
                <div className="auth-message">
                  {authMessage}
                </div>
              )}

              <button
                className="primary-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Procesando..."
                  : register
                  ? "🚀 Crear mi cuenta"
                  : "✨ Entrar a mi cuenta"}
              </button>
            </form>

            <div className="switch-page">
              {register
                ? "¿Ya tienes una cuenta?"
                : "¿Todavía no tienes una cuenta?"}

              <button
                className="text-button"
                onClick={() =>
                  go(
                    register
                      ? "/cuenta/iniciar"
                      : "/cuenta/crear"
                  )
                }
              >
                {register
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  };

  const ProfilePage = () => (
    <PageShell title="Perfil">
      <div className="profile-page-card">
        {user ? (
          <>
            <div className="profile-avatar">
              {(
                user.user_metadata
                  ?.full_name ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2>
              {user.user_metadata
                ?.full_name ||
                "Usuario VaniDaxi"}
            </h2>

            <p>
              {user.email}
            </p>

            <div className="profile-options">
              <button
                onClick={() =>
                  go(
                    "/perfil/datos"
                  )
                }
              >
                🪪 Mis datos
                <span>→</span>
              </button>

              <button
                onClick={() =>
                  go(
                    "/mensajes/pedidos"
                  )
                }
              >
                📦 Mis pedidos
                <span>→</span>
              </button>

              <button
                onClick={() =>
                  go(
                    "/mensajes/ventas"
                  )
                }
              >
                🏪 Mis ventas
                <span>→</span>
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              👤
            </div>

            <h3>
              Inicia sesión
            </h3>

            <p>
              Necesitas una cuenta
              para ver tu perfil.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                go(
                  "/cuenta/iniciar"
                )
              }
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );

  const FavoritesPage = () => (
    <PageShell title="Favoritos">
      {favorites.length === 0 ? (
        <div className="empty-state large-empty">
          <div className="empty-icon">
            ❤️
          </div>

          <h3>
            Todavía no tienes
            favoritos
          </h3>

          <p>
            Guarda productos para
            encontrarlos fácilmente
            después.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              go("/productos")
            }
          >
            Explorar productos
          </button>
        </div>
      ) : (
        <ProductGrid
          items={favorites}
        />
      )}
    </PageShell>
  );

  const ProductsPage = () => (
    <PageShell title="Explorar productos">
      <div className="search-banner">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Buscar productos..."
        />
      </div>

      <div className="mini-category-grid">
        <button
          className={
            activeCategory ===
            "Todos"
              ? "active"
              : ""
          }
          onClick={goProducts}
        >
          Todo
        </button>

        {categories.map(
          (category) => (
            <button
              key={category.name}
              className={
                activeCategory ===
                category.name
                  ? "active"
                  : ""
              }
              onClick={() =>
                goCategory(
                  category.name
                )
              }
            >
              {category.name}
            </button>
          )
        )}
      </div>

      <ProductGrid
        items={
          filteredProducts
        }
      />
    </PageShell>
  );

  const CategoryPage = () => {
    const category =
      activeCategory;

    return (
      <PageShell
        title={category}
      >
        <div className="category-page-hero">
          <img
            src={
              categories.find(
                (item) =>
                  item.name ===
                  category
              )?.image
            }
            alt={category}
          />

          <div>
            <span>
              Categoría
            </span>

            <h2>
              {category}
            </h2>

            <p>
              Explora productos de
              esta categoría.
            </p>
          </div>
        </div>

        <ProductGrid
          items={
            filteredProducts
          }
        />
      </PageShell>
    );
  };

  const ProductPage = () => {
    if (!selectedProduct) {
      return (
        <PageShell title="Producto">
          <div className="empty-state">
            <div className="empty-icon">
              🔎
            </div>

            <h3>
              Producto no encontrado
            </h3>

            <button
              className="primary-button"
              onClick={goProducts}
            >
              Volver a productos
            </button>
          </div>
        </PageShell>
      );
    }

    const favorite =
      favorites.some(
        (item) =>
          item.id ===
          selectedProduct.id
      );

    return (
      <PageShell
        title={
          selectedProduct.name
        }
      >
        <div className="product-detail-page">
          <div className="product-detail-image">
            <img
              src={
                selectedProduct.image
              }
              alt={
                selectedProduct.name
              }
            />

            {selectedProduct.discount >
              0 && (
              <span className="discount large-discount">
                -
                {
                  selectedProduct.discount
                }
                %
              </span>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-category">
              {
                selectedProduct.category
              }
            </div>

            <h2>
              {
                selectedProduct.name
              }
            </h2>

            <div className="rating big-rating">
              ⭐{" "}
              {
                selectedProduct.rating
              }{" "}
              ·{" "}
              {
                selectedProduct.reviews
              }{" "}
              opiniones
            </div>

            <div className="detail-price">
              {formatPrice(
                selectedProduct.price
              )}
            </div>

            {selectedProduct.oldPrice && (
              <div className="detail-old-price">
                {formatPrice(
                  selectedProduct.oldPrice
                )}
              </div>
            )}

            <p className="detail-description">
              {
                selectedProduct.description
              }
            </p>

            {selectedProduct
              .specifications
              ?.length > 0 && (
              <>
                <h3>
                  Características
                </h3>

                <ul className="specifications">
                  {selectedProduct.specifications.map(
                    (specification) => (
                      <li
                        key={
                          specification
                        }
                      >
                        {
                          specification
                        }
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            <button
              className={`favorite-detail ${
                favorite
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleFavorite(
                  selectedProduct
                )
              }
            >
              {favorite
                ? "❤️ Guardado en favoritos"
                : "♡ Agregar a favoritos"}
            </button>

            <div className="detail-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  addToCart(
                    selectedProduct
                  )
                }
              >
                🛒 Agregar al carrito
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  startCheckout(
                    selectedProduct
                  )
                }
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  };

  const CartPage = () => (
    <PageShell title="Mi carrito">
      {cart.length === 0 ? (
        <div className="empty-state large-empty">
          <div className="empty-icon">
            🛒
          </div>

          <h3>
            Tu carrito está vacío
          </h3>

          <p>
            Agrega productos para
            comenzar tu compra.
          </p>

          <button
            className="primary-button"
            onClick={goProducts}
          >
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="cart-page">
          <div className="cart-items">
            {cart.map((item) => (
              <article
                className="cart-item"
                key={item.id}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() =>
                    go(
                      `/producto/${item.id}`
                    )
                  }
                />

                <div className="cart-item-info">
                  <div className="product-category">
                    {item.category}
                  </div>

                  <h3>
                    {item.name}
                  </h3>

                  <strong>
                    {formatPrice(
                      item.price
                    )}
                  </strong>

                  <div className="cart-controls">
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

                    <span>
                      {item.quantity}
                    </span>

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
                      className="remove-cart"
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
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>
              Resumen de compra
            </h3>

            <div className="summary-row">
              <span>
                Productos
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
                {shippingCost === 0
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

              <strong>
                {formatPrice(
                  cartTotal
                )}
              </strong>
            </div>

            <button
              className="primary-button full-width"
              onClick={() =>
                go(
                  "/checkout/entrega"
                )
              }
            >
              Continuar al pago
            </button>
          </aside>
        </div>
      )}
    </PageShell>
  );

  const CheckoutPage = ({
    step,
  }) => {
    const titles = {
      entrega:
        "Datos de entrega",
      pago:
        "Método de pago",
      confirmacion:
        "Confirmar pedido",
    };

    const path =
      location.pathname;

    return (
      <PageShell
        title={
          titles[step]
        }
      >
        <div className="checkout-page">
          <div className="checkout-progress">
            <div
              className={
                step === "entrega"
                  ? "active"
                  : ""
              }
            >
              1
            </div>

            <span />

            <div
              className={
                step === "pago" ||
                step ===
                  "confirmacion"
                  ? "active"
                  : ""
              }
            >
              2
            </div>

            <span />

            <div
              className={
                step ===
                "confirmacion"
                  ? "active"
                  : ""
              }
            >
              3
            </div>
          </div>

          {step ===
            "entrega" && (
            <div className="checkout-layout">
              <div className="checkout-card-main">
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
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        name:
                          event.target
                            .value,
                      })
                    }
                  />

                  <input
                    className="checkout-input"
                    placeholder="Teléfono"
                    value={
                      checkout.phone
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        phone:
                          event.target
                            .value,
                      })
                    }
                  />

                  <input
                    className="checkout-input full"
                    placeholder="Calle y número"
                    value={
                      checkout.address
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        address:
                          event.target
                            .value,
                      })
                    }
                  />

                  <input
                    className="checkout-input"
                    placeholder="Ciudad"
                    value={
                      checkout.city
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        city:
                          event.target
                            .value,
                      })
                    }
                  />

                  <input
                    className="checkout-input"
                    placeholder="Estado"
                    value={
                      checkout.state
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        state:
                          event.target
                            .value,
                      })
                    }
                  />

                  <input
                    className="checkout-input"
                    placeholder="Código postal"
                    value={
                      checkout.zip
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        zip:
                          event.target
                            .value,
                      })
                    }
                  />

                  <textarea
                    className="checkout-input full"
                    placeholder="Notas para el vendedor o repartidor"
                    value={
                      checkout.notes
                    }
                    onChange={(
                      event
                    ) =>
                      setCheckout({
                        ...checkout,
                        notes:
                          event.target
                            .value,
                      })
                    }
                  />
                </div>

                <h3 className="checkout-section-title">
                  🚚 Tipo de entrega
                </h3>

                <button
                  className={`choice-card ${
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

                    <small>
                      Envío gratis
                    </small>
                  </span>
                </button>

                <button
                  className={`choice-card ${
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

                    <small>
                      + $99 MXN
                    </small>
                  </span>
                </button>
              </div>

              <CheckoutSummary />
            </div>
          )}

          {step ===
            "pago" && (
            <div className="checkout-layout">
              <div className="checkout-card-main">
                <h3>
                  💳 Método de pago
                </h3>

                {[
                  {
                    id: "card",
                    title:
                      "💳 Tarjeta",
                    text:
                      "Visa, Mastercard y otras tarjetas",
                  },
                  {
                    id:
                      "mercadopago",
                    title:
                      "💙 Mercado Pago",
                    text:
                      "Pago mediante Mercado Pago",
                  },
                  {
                    id: "cash",
                    title:
                      "💵 Pago disponible según el vendedor",
                    text:
                      "La disponibilidad dependerá del vendedor.",
                  },
                ].map(
                  (option) => (
                    <button
                      key={
                        option.id
                      }
                      className={`choice-card ${
                        checkout.payment ===
                        option.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setCheckout({
                          ...checkout,
                          payment:
                            option.id,
                        })
                      }
                    >
                      <input
                        type="radio"
                        checked={
                          checkout.payment ===
                          option.id
                        }
                        readOnly
                      />

                      <span>
                        <strong>
                          {
                            option.title
                          }
                        </strong>

                        <small>
                          {
                            option.text
                          }
                        </small>
                      </span>
                    </button>
                  )
                )}

                <div className="checkout-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      navigate(
                        -1
                      )
                    }
                  >
                    Regresar
                  </button>

                  <button
                    className="primary-button"
                    onClick={() =>
                      go(
                        "/checkout/confirmacion"
                      )
                    }
                  >
                    Continuar
                  </button>
                </div>
              </div>

              <CheckoutSummary />
            </div>
          )}

          {step ===
            "confirmacion" && (
            <div className="checkout-layout">
              <div className="checkout-card-main">
                <h3>
                  🧾 Confirmar pedido
                </h3>

                <div className="review-box">
                  <strong>
                    Entrega
                  </strong>

                  <p>
                    {checkout.name}
                    <br />
                    {
                      checkout.address
                    }
                    <br />
                    {
                      checkout.city
                    }
                    ,{" "}
                    {
                      checkout.state
                    }{" "}
                    {
                      checkout.zip
                    }
                    <br />
                    Tel.{" "}
                    {
                      checkout.phone
                    }
                  </p>
                </div>

                <div className="review-box">
                  <strong>
                    Pago
                  </strong>

                  <p>
                    {checkout.payment ===
                    "card"
                      ? "Tarjeta"
                      : checkout.payment ===
                        "mercadopago"
                      ? "Mercado Pago"
                      : "Pago disponible según vendedor"}
                  </p>
                </div>

                <div className="review-box">
                  <strong>
                    Entrega seleccionada
                  </strong>

                  <p>
                    {checkout.delivery ===
                    "express"
                      ? "Envío express · $99 MXN"
                      : "Envío estándar · Gratis"}
                  </p>
                </div>

                <div className="checkout-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      navigate(
                        -1
                      )
                    }
                  >
                    Regresar
                  </button>

                  <button
                    className="primary-button"
                    onClick={() =>
                      go(
                        "/pedido/confirmado"
                      )
                    }
                  >
                    Confirmar pedido
                  </button>
                </div>
              </div>

              <CheckoutSummary />
            </div>
          )}
        </div>
      </PageShell>
    );
  };

  const CheckoutSummary = () => (
    <aside className="checkout-summary">
      <h3>
        Resumen de compra
      </h3>

      {cart.map((item) => (
        <div
          className="summary-product"
          key={item.id}
        >
          <img
            src={item.image}
            alt={item.name}
          />

          <div>
            <strong>
              {item.name}
            </strong>

            <small>
              {item.quantity} ×{" "}
              {formatPrice(
                item.price
              )}
            </small>
          </div>
        </div>
      ))}

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
          {shippingCost === 0
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

        <strong>
          {formatPrice(
            cartTotal
          )}
        </strong>
      </div>
    </aside>
  );

  const OrderCompletePage = () => (
    <PageShell
      title="Pedido confirmado"
    >
      <div className="success-page">
        <div className="success-icon">
          ✅
        </div>

        <h2>
          ¡Pedido realizado!
        </h2>

        <p>
          Tu pedido fue registrado
          correctamente.
        </p>

        <strong className="success-total">
          Total:{" "}
          {formatPrice(
            cartTotal
          )}
        </strong>

        <div className="success-actions">
          <button
            className="primary-button"
            onClick={() => {
              setCart([]);
              goHome();
            }}
          >
            Volver a VaniDaxi
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              go(
                "/mensajes/pedidos"
              )
            }
          >
            📦 Ver mis pedidos
          </button>
        </div>
      </div>
    </PageShell>
  );

  const MessagesPage = () => (
    <PageShell title="Centro de mensajes">
      <div className="message-list">
        <button
          className="message-card"
          onClick={() =>
            go(
              "/mensajes/atencion"
            )
          }
        >
          <span>🟢</span>

          <div>
            <strong>
              Atención al cliente
            </strong>

            <small>
              Habla con nosotros.
            </small>
          </div>

          <b>→</b>
        </button>

        <button
          className="message-card"
          onClick={() =>
            go(
              "/mensajes/pedidos"
            )
          }
        >
          <span>📦</span>

          <div>
            <strong>
              Mis pedidos
            </strong>

            <small>
              Consulta tus pedidos.
            </small>
          </div>

          <b>→</b>
        </button>

        <button
          className="message-card"
          onClick={() =>
            go(
              "/mensajes/ventas"
            )
          }
        >
          <span>🏪</span>

          <div>
            <strong>
              Mis ventas
            </strong>

            <small>
              Accede a tu espacio de vendedor.
            </small>
          </div>

          <b>→</b>
        </button>

        <button
          className="message-card"
          onClick={() =>
            go(
              "/mensajes/envios"
            )
          }
        >
          <span>🚚</span>

          <div>
            <strong>
              Envíos
            </strong>

            <small>
              Información sobre entregas.
            </small>
          </div>

          <b>→</b>
        </button>
      </div>
    </PageShell>
  );

  const SubMessagePage = ({
    type,
  }) => {
    const content = {
      atencion: {
        title:
          "Atención al cliente",
        icon: "🟢",
        text:
          "Nuestro canal de atención está disponible para ayudarte con compras, ventas y dudas.",
        button:
          "Abrir WhatsApp",
        action:
          openWhatsApp,
      },

      pedidos: {
        title:
          "Mis pedidos",
        icon: "📦",
        text:
          user
            ? "Aquí podrás consultar el historial y estado de tus pedidos."
            : "Inicia sesión para consultar tus pedidos.",
        button:
          user
            ? "Volver a mi cuenta"
            : "Iniciar sesión",
        action: () =>
          go(
            user
              ? "/cuenta"
              : "/cuenta/iniciar"
          ),
      },

      ventas: {
        title:
          "Mis ventas",
        icon: "🏪",
        text:
          user
            ? "Aquí podrás consultar tus productos publicados y tus ventas."
            : "Inicia sesión para acceder a tu espacio de vendedor.",
        button:
          user
            ? "Publicar producto"
            : "Iniciar sesión",
        action: () =>
          go(
            user
              ? "/publicar"
              : "/cuenta/iniciar"
          ),
      },

      envios: {
        title:
          "Envíos",
        icon: "🚚",
        text:
          "Consulta información general sobre las modalidades de entrega de VaniDaxi.",
        button:
          "Ir a configuración",
        action: () =>
          go(
            "/configuracion/envios"
          ),
      },
    };

    const current =
      content[type] ||
      content.atencion;

    return (
      <PageShell
        title={current.title}
      >
        <div className="simple-detail-page">
          <div className="simple-detail-icon">
            {current.icon}
          </div>

          <h2>
            {current.title}
          </h2>

          <p>
            {current.text}
          </p>

          <button
            className="primary-button"
            onClick={current.action}
          >
            {current.button}
          </button>
        </div>
      </PageShell>
    );
  };

  const SettingsPage = () => (
    <PageShell title="Configuración">
      <div className="settings-list-page">
        <SettingsLink
          icon="🔔"
          title="Notificaciones"
          text="Gestiona los avisos de VaniDaxi."
          onClick={() =>
            go(
              "/configuracion/notificaciones"
            )
          }
        />

        <SettingsLink
          icon="🎁"
          title="Promociones"
          text="Controla las novedades y ofertas."
          onClick={() =>
            go(
              "/configuracion/promociones"
            )
          }
        />

        <SettingsLink
          icon="🎨"
          title="Apariencia"
          text="Personaliza el aspecto de la aplicación."
          onClick={() =>
            go(
              "/configuracion/apariencia"
            )
          }
        />

        <SettingsLink
          icon="🚚"
          title="Envíos"
          text="Consulta las modalidades de entrega."
          onClick={() =>
            go(
              "/configuracion/envios"
            )
          }
        />

        <SettingsLink
          icon="💬"
          title="Atención al cliente"
          text="Obtén ayuda directamente."
          onClick={() =>
            go(
              "/mensajes/atencion"
            )
          }
        />
      </div>
    </PageShell>
  );

  const SettingsLink = ({
    icon,
    title,
    text,
    onClick,
  }) => (
    <button
      className="settings-card"
      onClick={onClick}
    >
      <span className="settings-icon">
        {icon}
      </span>

      <span className="settings-copy">
        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>
      </span>

      <span>→</span>
    </button>
  );

  const SettingsSubPage = ({
    type,
  }) => {
    const definitions = {
      notificaciones: {
        title:
          "Notificaciones",
        icon: "🔔",
        main:
          "Recibe avisos relacionados con tu cuenta, compras y ventas.",
      },

      promociones: {
        title:
          "Promociones",
        icon: "🎁",
        main:
          "Decide si quieres recibir información sobre ofertas y novedades.",
      },

      apariencia: {
        title:
          "Apariencia",
        icon: "🎨",
        main:
          "Elige cómo quieres ver VaniDaxi.",
      },

      envios: {
        title:
          "Envíos",
        icon: "🚚",
        main:
          "Consulta las opciones de entrega disponibles.",
      },
    };

    const definition =
      definitions[type] ||
      definitions.apariencia;

    if (type === "envios") {
      return (
        <PageShell
          title={
            definition.title
          }
        >
          <div className="simple-detail-page">
            <div className="simple-detail-icon">
              🚚
            </div>

            <h2>
              Modalidades de entrega
            </h2>

            <div className="delivery-info-card">
              <strong>
                Envío estándar
              </strong>

              <p>
                Envío gratis.
              </p>
            </div>

            <div className="delivery-info-card">
              <strong>
                Envío express
              </strong>

              <p>
                Costo adicional de
                $99 MXN.
              </p>
            </div>
          </div>
        </PageShell>
      );
    }

    return (
      <PageShell
        title={
          definition.title
        }
      >
        <div className="settings-detail-page">
          <div className="settings-detail-top">
            <span>
              {
                definition.icon
              }
            </span>

            <div>
              <h2>
                {
                  definition.title
                }
              </h2>

              <p>
                {
                  definition.main
                }
              </p>
            </div>
          </div>

          {type ===
            "notificaciones" && (
            <SettingSwitch
              title="Notificaciones"
              text="Avisos sobre actividad de tu cuenta."
              value={
                settings.notifications
              }
              onChange={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    notifications:
                      !current.notifications,
                  })
                )
              }
            />
          )}

          {type ===
            "promociones" && (
            <SettingSwitch
              title="Promociones"
              text="Ofertas, descuentos y novedades."
              value={
                settings.promotions
              }
              onChange={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    promotions:
                      !current.promotions,
                  })
                )
              }
            />
          )}

          {type ===
            "apariencia" && (
            <SettingSwitch
              title="Modo oscuro"
              text="Activa una apariencia oscura."
              value={
                settings.darkMode
              }
              onChange={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    darkMode:
                      !current.darkMode,
                  })
                )
              }
            />
          )}
        </div>
      </PageShell>
    );
  };

  const SettingSwitch = ({
    title,
    text,
    value,
    onChange,
  }) => (
    <div className="setting-switch-row">
      <div>
        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>
      </div>

      <button
        className={`switch ${
          value ? "active" : ""
        }`}
        onClick={onChange}
        aria-label={title}
      />
    </div>
  );

  const PublishPage = () => (
    <PageShell
      title="Publicar producto"
    >
      {!user ? (
        <div className="empty-state large-empty">
          <div className="empty-icon">
            🔐
          </div>

          <h3>
            Necesitas una cuenta
          </h3>

          <p>
            Inicia sesión para
            publicar productos.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              go(
                "/cuenta/iniciar"
              )
            }
          >
            Iniciar sesión
          </button>
        </div>
      ) : (
        <div className="publish-page-card">
          <div className="publish-intro">
            <span>
              🏪
            </span>

            <div>
              <strong>
                Comienza a vender
              </strong>

              <p>
                Agrega la información
                de tu producto.
              </p>
            </div>
          </div>

          <form
            className="form"
            onSubmit={
              handlePublish
            }
          >
            <input
              type="text"
              placeholder="Nombre del producto"
              value={
                newProduct.name
              }
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  name:
                    event.target
                      .value,
                })
              }
              required
            />

            <input
              type="number"
              min="1"
              placeholder="Precio en MXN"
              value={
                newProduct.price
              }
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  price:
                    event.target
                      .value,
                })
              }
              required
            />

            <select
              value={
                newProduct.category
              }
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  category:
                    event.target
                      .value,
                })
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={
                      category.name
                    }
                    value={
                      category.name
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>

            <input
              type="url"
              placeholder="URL de la imagen"
              value={
                newProduct.image
              }
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  image:
                    event.target
                      .value,
                })
              }
            />

            <textarea
              placeholder="Describe tu producto..."
              value={
                newProduct.description
              }
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  description:
                    event.target
                      .value,
                })
              }
            />

            <button className="primary-button">
              🚀 Publicar producto
            </button>
          </form>
        </div>
      )}
    </PageShell>
  );

  const ProfileDataPage = () => (
    <PageShell title="Mis datos">
      {!user ? (
        <div className="empty-state">
          Inicia sesión para ver
          tus datos.
        </div>
      ) : (
        <div className="data-page">
          <DataRow
            label="Nombre"
            value={
              user.user_metadata
                ?.full_name ||
              "No especificado"
            }
          />

          <DataRow
            label="Correo"
            value={
              user.email ||
              "No disponible"
            }
          />

          <div className="info-note">
            Tus datos de acceso se
            administran mediante
            Supabase.
          </div>
        </div>
      )}
    </PageShell>
  );

  const DataRow = ({
    label,
    value,
  }) => (
    <div className="data-row">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );

  const NotFoundPage = () => (
    <PageShell title="Página no encontrada">
      <div className="empty-state large-empty">
        <div className="empty-icon">
          🔎
        </div>

        <h3>
          No encontramos esta
          sección.
        </h3>

        <button
          className="primary-button"
          onClick={goHome}
        >
          Volver al inicio
        </button>
      </div>
    </PageShell>
  );

  const path =
    location.pathname;

  const renderPage = () => {
    if (
      path === "/" ||
      path === ""
    ) {
      return <HomePage />;
    }

    if (path === "/menu") {
      return <MenuPage />;
    }

    if (path === "/cuenta") {
      return <AccountPage />;
    }

    if (
      path ===
      "/cuenta/iniciar"
    ) {
      return (
        <AuthPage
          register={false}
        />
      );
    }

    if (
      path ===
      "/cuenta/crear"
    ) {
      return (
        <AuthPage
          register={true}
        />
      );
    }

    if (path === "/perfil") {
      return <ProfilePage />;
    }

    if (
      path ===
      "/perfil/datos"
    ) {
      return <ProfileDataPage />;
    }

    if (
      path ===
      "/favoritos"
    ) {
      return (
        <FavoritesPage />
      );
    }

    if (
      path ===
      "/productos"
    ) {
      return <ProductsPage />;
    }

    if (
      path.startsWith(
        "/categoria/"
      )
    ) {
      return <CategoryPage />;
    }

    if (
      path.startsWith(
        "/producto/"
      )
    ) {
      return (
        <ProductPage />
      );
    }

    if (path === "/carrito") {
      return <CartPage />;
    }

    if (
      path ===
      "/checkout/entrega"
    ) {
      return (
        <CheckoutPage
          step="entrega"
        />
      );
    }

    if (
      path ===
      "/checkout/pago"
    ) {
      return (
        <CheckoutPage
          step="pago"
        />
      );
    }

    if (
      path ===
      "/checkout/confirmacion"
    ) {
      return (
        <CheckoutPage
          step="confirmacion"
        />
      );
    }

    if (
      path ===
      "/pedido/confirmado"
    ) {
      return (
        <OrderCompletePage />
      );
    }

    if (
      path === "/mensajes"
    ) {
      return (
        <MessagesPage />
      );
    }

    if (
      path ===
      "/mensajes/atencion"
    ) {
      return (
        <SubMessagePage
          type="atencion"
        />
      );
    }

    if (
      path ===
      "/mensajes/pedidos"
    ) {
      return (
        <SubMessagePage
          type="pedidos"
        />
      );
    }

    if (
      path ===
      "/mensajes/ventas"
    ) {
      return (
        <SubMessagePage
          type="ventas"
        />
      );
    }

    if (
      path ===
      "/mensajes/envios"
    ) {
      return (
        <SubMessagePage
          type="envios"
        />
      );
    }

    if (
      path ===
      "/configuracion"
    ) {
      return (
        <SettingsPage />
      );
    }

    if (
      path ===
      "/configuracion/notificaciones"
    ) {
      return (
        <SettingsSubPage
          type="notificaciones"
        />
      );
    }

    if (
      path ===
      "/configuracion/promociones"
    ) {
      return (
        <SettingsSubPage
          type="promociones"
        />
      );
    }

    if (
      path ===
      "/configuracion/apariencia"
    ) {
      return (
        <SettingsSubPage
          type="apariencia"
        />
      );
    }

    if (
      path ===
      "/configuracion/envios"
    ) {
      return (
        <SettingsSubPage
          type="envios"
        />
      );
    }

    if (path === "/publicar") {
      return (
        <PublishPage />
      );
    }

    return <NotFoundPage />;
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
          background: #ffffff;
          color: #202020;
          font-family: Arial, Helvetica, sans-serif;
        }

        body.dark-theme {
          background: #111111;
          color: #ffffff;
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
          background: #ffffff;
          padding-bottom: 75px;
        }

        body.dark-theme .app {
          background: #111111;
          color: #ffffff;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 80;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #eeeeee;
          backdrop-filter: blur(12px);
        }

        body.dark-theme .top-header {
          background: rgba(17,17,17,.97);
          border-color: #292929;
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

        .menu-button {
          flex: 0 0 auto;
          width: 39px;
          height: 39px;
          border: 0;
          border-radius: 11px;
          color: white;
          background: linear-gradient(135deg,#ef233c,#d414c9,#6d28d9);
          font-size: 20px;
        }

        .brand {
          flex: 0 0 auto;
          border: 0;
          background: transparent;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -1px;
          background-image: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .search-box {
          flex: 1;
          max-width: 540px;
          height: 39px;
          margin: 0 auto;
          display: flex;
          overflow: hidden;
          border: 1px solid #dddddd;
          border-radius: 22px;
          background: #ffffff;
        }

        body.dark-theme .search-box {
          background: #202020;
          border-color: #333333;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          padding: 0 14px;
          border: 0;
          outline: 0;
          background: transparent;
          color: inherit;
        }

        .search-box button {
          width: 43px;
          border: 0;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .header-actions {
          display: flex;
          gap: 7px;
        }

        .header-action {
          position: relative;
          width: 39px;
          height: 39px;
          border: 0;
          border-radius: 11px;
          background: #f5f5f7;
          font-size: 18px;
        }

        body.dark-theme .header-action {
          background: #242424;
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
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
        }

        .category-bar {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
          padding: 0 0 8px;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-bar::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          flex: 0 0 auto;
          padding: 6px 11px;
          border: 1px solid #e4e4e4;
          border-radius: 16px;
          background: white;
          color: #444;
          font-size: 10px;
          white-space: nowrap;
        }

        body.dark-theme .category-pill {
          background: #202020;
          border-color: #333333;
          color: #eeeeee;
        }

        .category-pill.active {
          border-color: transparent;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .page-content {
          width: min(1180px, calc(100% - 24px));
          margin: auto;
        }

        .inner-page {
          padding-top: 16px;
          padding-bottom: 35px;
        }

        .back-button {
          margin-bottom: 12px;
          padding: 8px 12px;
          border: 0;
          border-radius: 10px;
          background: #f3f3f4;
          color: #444;
          font-size: 11px;
          font-weight: 700;
        }

        body.dark-theme .back-button {
          background: #292929;
          color: white;
        }

        .hero {
          min-height: 190px;
          margin: 13px 0 18px;
          padding: 28px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          overflow: hidden;
          color: white;
          background: linear-gradient(110deg,#ef233c,#d414c9,#6d28d9);
        }

        .hero-kicker {
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 800;
          opacity: .9;
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: clamp(30px,5vw,50px);
          line-height: .98;
        }

        .hero p {
          max-width: 570px;
          margin: 0 0 17px;
          font-size: 14px;
          line-height: 1.5;
        }

        .hero-button {
          padding: 11px 18px;
          border: 0;
          border-radius: 14px;
          background: white;
          color: #b41bc1;
          font-weight: 900;
        }

        .hero-icon {
          font-size: clamp(80px,12vw,150px);
          transform: rotate(-7deg);
          opacity: .92;
        }

        .top-cards {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 10px;
          margin-bottom: 24px;
        }

        .top-card {
          min-height: 125px;
          padding: 14px;
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 17px;
          background-position: center;
          background-size: cover;
          color: white;
          text-align: left;
        }

        .top-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.7));
        }

        .top-card span {
          position: relative;
          z-index: 1;
          display: block;
        }

        .top-card strong {
          display: block;
          font-size: 17px;
        }

        .top-card small {
          display: block;
          margin-top: 3px;
          font-size: 10px;
        }

        .section-title,
        .page-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 20px 0 12px;
        }

        .section-title h2,
        .page-title h1 {
          margin: 0;
        }

        .page-title h1 {
          font-size: 26px;
        }

        .link-button,
        .text-button {
          border: 0;
          background: transparent;
          color: #a91cbb;
          font-weight: 800;
          font-size: 11px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(8,1fr);
          gap: 8px;
        }

        .category-card {
          padding: 0;
          overflow: hidden;
          border: 0;
          border-radius: 14px;
          background: #f5f5f6;
          text-align: left;
          color: inherit;
        }

        .category-card img {
          width: 100%;
          aspect-ratio: 1;
          display: block;
          object-fit: cover;
        }

        .category-card span {
          display: block;
          padding: 7px;
          font-size: 9px;
          font-weight: 800;
          line-height: 1.2;
        }

        .join-card {
          margin: 25px 0;
          padding: 17px;
          border: 1px solid #eeeeee;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          background: #fafafa;
        }

        body.dark-theme .join-card {
          background: #191919;
          border-color: #303030;
        }

        .join-card strong {
          font-size: 15px;
        }

        .join-card p {
          margin: 5px 0 0;
          color: #777;
          font-size: 11px;
        }

        .primary-button,
        .secondary-button {
          min-height: 42px;
          padding: 10px 16px;
          border-radius: 13px;
          font-size: 11px;
          font-weight: 900;
        }

        .primary-button {
          border: 0;
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .secondary-button {
          border: 1px solid #dddddd;
          background: transparent;
          color: inherit;
        }

        .full-width {
          width: 100%;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 13px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #eeeeee;
          border-radius: 17px;
          background: white;
        }

        body.dark-theme .product-card {
          background: #191919;
          border-color: #303030;
        }

        .product-image {
          position: relative;
          cursor: pointer;
        }

        .product-image img {
          width: 100%;
          aspect-ratio: 1;
          display: block;
          object-fit: cover;
        }

        .discount {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 5px 7px;
          border-radius: 8px;
          background: #ef233c;
          color: white;
          font-size: 9px;
          font-weight: 900;
        }

        .favorite-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.93);
          font-size: 16px;
        }

        .product-info {
          padding: 11px;
        }

        .product-category {
          color: #a91cbb;
          font-size: 9px;
          font-weight: 800;
        }

        .product-name {
          min-height: 36px;
          margin: 5px 0 7px;
          font-size: 13px;
          line-height: 1.3;
        }

        .prices {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .price {
          font-size: 17px;
          font-weight: 900;
        }

        .old-price {
          color: #999;
          font-size: 10px;
          text-decoration: line-through;
        }

        .rating {
          margin: 8px 0;
          color: #666;
          font-size: 10px;
        }

        .product-actions {
          display: flex;
          gap: 6px;
        }

        .product-actions button {
          flex: 1;
          padding: 9px 6px;
          border: 0;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 900;
        }

        .details-button {
          background: #f2f2f4;
          color: #333;
        }

        body.dark-theme .details-button {
          background: #292929;
          color: white;
        }

        .add-button {
          color: white;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .floating-whatsapp {
          position: fixed;
          right: 16px;
          bottom: 79px;
          z-index: 110;
          width: 54px;
          height: 54px;
          border: 0;
          border-radius: 50%;
          color: white;
          background: #25d366;
          box-shadow: 0 8px 24px rgba(0,0,0,.2);
          font-size: 24px;
        }

        .bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 0;
          z-index: 100;
          width: min(650px,100%);
          height: 62px;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: repeat(4,1fr);
          border-top: 1px solid #e8e8e8;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(12px);
        }

        body.dark-theme .bottom-nav {
          background: rgba(17,17,17,.97);
          border-color: #2b2b2b;
        }

        .bottom-nav button {
          border: 0;
          background: transparent;
          color: inherit;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 2px;
        }

        .bottom-nav span {
          font-size: 18px;
        }

        .bottom-nav small {
          font-size: 9px;
          font-weight: 700;
        }

        .menu-list-page,
        .settings-list-page,
        .message-list,
        .profile-options {
          display: grid;
          gap: 9px;
        }

        .account-box {
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 17px;
          color: white;
          background: linear-gradient(135deg,#ef233c,#d414c9,#6d28d9);
        }

        .account-box strong,
        .account-box small {
          display: block;
        }

        .account-box small {
          margin-top: 4px;
          opacity: .92;
        }

        .menu-link,
        .settings-card,
        .message-card,
        .profile-options button {
          width: 100%;
          min-height: 60px;
          border: 1px solid #ededed;
          border-radius: 14px;
          background: white;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          text-align: left;
        }

        body.dark-theme .menu-link,
        body.dark-theme .settings-card,
        body.dark-theme .message-card,
        body.dark-theme .profile-options button {
          background: #191919;
          border-color: #303030;
        }

        .menu-link-icon,
        .settings-icon,
        .message-card > span:first-child {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          background: #f5ebff;
          font-size: 18px;
        }

        .menu-link-suffix {
          color: #777;
        }

        .menu-arrow,
        .settings-card > span:last-child,
        .message-card > b {
          margin-left: auto;
        }

        .account-page-card,
        .profile-page-card,
        .publish-page-card,
        .data-page,
        .settings-detail-page,
        .simple-detail-page,
        .success-page {
          max-width: 780px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #ededed;
          border-radius: 21px;
          background: white;
        }

        body.dark-theme .account-page-card,
        body.dark-theme .profile-page-card,
        body.dark-theme .publish-page-card,
        body.dark-theme .data-page,
        body.dark-theme .settings-detail-page,
        body.dark-theme .simple-detail-page,
        body.dark-theme .success-page {
          background: #191919;
          border-color: #303030;
        }

        .account-page-card {
          text-align: center;
        }

        .account-page-icon,
        .profile-avatar,
        .auth-logo,
        .simple-detail-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 15px;
          display: grid;
          place-items: center;
          border-radius: 21px;
          color: white;
          background: linear-gradient(135deg,#ef233c,#d414c9,#6d28d9);
          font-size: 31px;
          font-weight: 900;
        }

        .account-page-card h2,
        .profile-page-card h2 {
          margin: 0 0 8px;
        }

        .account-page-card p,
        .profile-page-card p {
          color: #777;
          font-size: 12px;
        }

        .account-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 10px;
          margin: 20px 0;
        }

        .account-option {
          min-height: 85px;
          border: 1px solid #ededed;
          border-radius: 15px;
          background: transparent;
          color: inherit;
          display: grid;
          place-items: center;
          gap: 5px;
          padding: 13px;
        }

        .account-option span {
          font-size: 24px;
        }

        .account-option strong {
          font-size: 11px;
        }

        .account-buttons {
          display: grid;
          gap: 9px;
          margin-top: 18px;
        }

        .auth-page {
          max-width: 850px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          overflow: hidden;
          border-radius: 22px;
          background: white;
          box-shadow: 0 20px 60px rgba(0,0,0,.1);
        }

        body.dark-theme .auth-page {
          background: #191919;
        }

        .auth-visual-page {
          padding: 30px;
          color: white;
          background: linear-gradient(145deg,#ef233c,#d414c9,#6d28d9);
        }

        .auth-logo {
          margin: 0 0 22px;
          width: 55px;
          height: 55px;
          border-radius: 16px;
          background: rgba(255,255,255,.18);
        }

        .auth-visual-page h2 {
          margin: 0 0 9px;
          font-size: 28px;
        }

        .auth-visual-page p {
          margin: 0;
          line-height: 1.6;
          font-size: 12px;
        }

        .auth-form-page {
          padding: 30px;
        }

        .form {
          display: grid;
          gap: 11px;
        }

        .form input,
        .form textarea,
        .form select,
        .search-banner input,
        .checkout-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          outline: 0;
          background: transparent;
          color: inherit;
        }

        .form textarea {
          min-height: 110px;
          resize: vertical;
        }

        .auth-message {
          padding: 10px;
          border-radius: 10px;
          background: #fff0f4;
          color: #9f1d4d;
          font-size: 11px;
        }

        .switch-page {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eeeeee;
          text-align: center;
          color: #777;
          font-size: 11px;
        }

        .profile-avatar {
          border-radius: 50%;
          font-size: 26px;
        }

        .profile-options {
          margin-top: 20px;
        }

        .profile-options button span {
          margin-left: auto;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 14px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .data-row span {
          color: #777;
        }

        .info-note {
          margin-top: 18px;
          padding: 12px;
          border-radius: 11px;
          background: #faf7ff;
          color: #777;
          font-size: 11px;
        }

        .large-empty {
          margin-top: 10px;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #777;
        }

        .empty-icon {
          margin-bottom: 12px;
          font-size: 52px;
        }

        .search-banner {
          margin-bottom: 12px;
        }

        .mini-category-grid {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }

        .mini-category-grid::-webkit-scrollbar {
          display: none;
        }

        .mini-category-grid button {
          flex: 0 0 auto;
          padding: 7px 10px;
          border: 1px solid #dddddd;
          border-radius: 15px;
          background: transparent;
          color: inherit;
          font-size: 10px;
        }

        .mini-category-grid button.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .category-page-hero {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 15px;
          align-items: center;
          margin-bottom: 20px;
          padding: 14px;
          border: 1px solid #ededed;
          border-radius: 18px;
        }

        .category-page-hero img {
          width: 180px;
          height: 120px;
          border-radius: 14px;
          object-fit: cover;
        }

        .category-page-hero span {
          color: #a91cbb;
          font-size: 10px;
          font-weight: 800;
        }

        .category-page-hero h2 {
          margin: 5px 0;
        }

        .category-page-hero p {
          margin: 0;
          color: #777;
          font-size: 11px;
        }

        .product-detail-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          align-items: start;
        }

        .product-detail-image {
          position: relative;
        }

        .product-detail-image img {
          width: 100%;
          border-radius: 18px;
          aspect-ratio: 1;
          object-fit: cover;
        }

        .large-discount {
          font-size: 12px;
        }

        .product-detail-info {
          padding: 5px 0;
        }

        .product-detail-info h2 {
          margin: 7px 0;
          font-size: 30px;
        }

        .big-rating {
          font-size: 12px;
        }

        .detail-price {
          margin-top: 12px;
          font-size: 30px;
          font-weight: 900;
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .detail-old-price {
          color: #999;
          text-decoration: line-through;
        }

        .detail-description {
          color: #666;
          line-height: 1.65;
          font-size: 13px;
        }

        .specifications {
          color: #666;
          padding-left: 18px;
          line-height: 1.8;
          font-size: 12px;
        }

        body.dark-theme .specifications {
          color: #ccc;
        }

        .favorite-detail {
          width: 100%;
          margin: 14px 0;
          padding: 12px;
          border: 1px solid #dddddd;
          border-radius: 12px;
          background: transparent;
          color: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .favorite-detail.selected {
          border-color: #d414c9;
          background: #fff5ff;
        }

        body.dark-theme .favorite-detail.selected {
          background: #241526;
        }

        .detail-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .cart-page {
          display: grid;
          grid-template-columns: 1.5fr .8fr;
          gap: 18px;
          align-items: start;
        }

        .cart-items {
          display: grid;
          gap: 9px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 11px;
          border: 1px solid #eeeeee;
          border-radius: 15px;
          background: white;
        }

        body.dark-theme .cart-item {
          background: #191919;
          border-color: #303030;
        }

        .cart-item img {
          width: 85px;
          height: 85px;
          border-radius: 12px;
          object-fit: cover;
          cursor: pointer;
        }

        .cart-item-info {
          flex: 1;
        }

        .cart-item-info h3 {
          margin: 4px 0 7px;
          font-size: 14px;
        }

        .cart-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
        }

        .cart-controls button {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 8px;
          background: #eeeeef;
          color: inherit;
        }

        .cart-controls span {
          min-width: 24px;
          text-align: center;
          font-weight: 800;
        }

        .cart-controls .remove-cart {
          width: auto;
          padding: 0 9px;
          margin-left: auto;
          color: #ef233c;
          background: transparent;
        }

        .cart-summary,
        .checkout-summary {
          position: sticky;
          top: 78px;
          padding: 17px;
          border: 1px solid #eeeeee;
          border-radius: 16px;
          background: white;
        }

        body.dark-theme .cart-summary,
        body.dark-theme .checkout-summary {
          background: #191919;
          border-color: #303030;
        }

        .cart-summary h3,
        .checkout-summary h3 {
          margin-top: 0;
        }

        .summary-row,
        .summary-total {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 10px;
          font-size: 12px;
        }

        .summary-total {
          padding-top: 12px;
          border-top: 1px solid #eeeeee;
          font-size: 18px;
          font-weight: 900;
        }

        .checkout-progress {
          display: grid;
          grid-template-columns: 34px 1fr 34px 1fr 34px;
          gap: 7px;
          align-items: center;
          max-width: 600px;
          margin-bottom: 20px;
        }

        .checkout-progress div {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e9e9ea;
          color: #666;
          font-size: 11px;
          font-weight: 900;
        }

        .checkout-progress div.active {
          color: white;
          background: linear-gradient(135deg,#ef233c,#d414c9,#6d28d9);
        }

        .checkout-progress span {
          height: 3px;
          border-radius: 5px;
          background: #e9e9ea;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1.35fr .8fr;
          gap: 18px;
          align-items: start;
        }

        .checkout-card-main {
          padding: 18px;
          border: 1px solid #eeeeee;
          border-radius: 17px;
          background: white;
        }

        body.dark-theme .checkout-card-main {
          background: #191919;
          border-color: #303030;
        }

        .checkout-card-main h3 {
          margin-top: 0;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .checkout-input.full {
          grid-column: 1 / -1;
        }

        .checkout-section-title {
          margin-top: 20px !important;
        }

        .choice-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 9px;
          padding: 13px;
          border: 1px solid #dddddd;
          border-radius: 13px;
          background: transparent;
          color: inherit;
          text-align: left;
        }

        .choice-card.selected {
          border-color: #d414c9;
          box-shadow: 0 0 0 2px rgba(212,20,201,.08);
        }

        .choice-card span {
          display: grid;
          gap: 3px;
        }

        .choice-card small {
          color: #777;
        }

        .checkout-actions {
          display: flex;
          gap: 8px;
          margin-top: 18px;
        }

        .checkout-actions button {
          flex: 1;
        }

        .summary-product {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .summary-product img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .summary-product div {
          display: grid;
          gap: 3px;
          font-size: 11px;
        }

        .summary-product small {
          color: #777;
        }

        .review-box {
          padding: 13px;
          margin-top: 10px;
          border-radius: 11px;
          background: #fafafa;
        }

        body.dark-theme .review-box {
          background: #242424;
        }

        .review-box p {
          margin: 5px 0 0;
          color: #777;
          font-size: 12px;
          line-height: 1.6;
        }

        .message-card {
          min-height: 74px;
        }

        .message-card div {
          display: grid;
          gap: 3px;
        }

        .message-card small {
          color: #777;
          font-size: 10px;
        }

        .simple-detail-page {
          text-align: center;
        }

        .simple-detail-icon {
          margin-bottom: 12px;
        }

        .simple-detail-page p {
          max-width: 600px;
          margin: 0 auto 18px;
          color: #777;
          line-height: 1.6;
          font-size: 12px;
        }

        .delivery-info-card {
          text-align: left;
          padding: 14px;
          margin-top: 10px;
          border-radius: 13px;
          border: 1px solid #eeeeee;
        }

        .delivery-info-card p {
          margin: 4px 0 0;
          max-width: none;
        }

        .settings-card {
          min-height: 75px;
        }

        .settings-copy {
          display: grid;
          gap: 4px;
        }

        .settings-copy small {
          color: #777;
          font-size: 10px;
        }

        .settings-detail-top {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .settings-detail-top > span {
          width: 55px;
          height: 55px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          background: #f5ebff;
          font-size: 25px;
        }

        .settings-detail-top h2 {
          margin: 0 0 5px;
        }

        .settings-detail-top p {
          margin: 0;
          color: #777;
          font-size: 11px;
        }

        .setting-switch-row {
          min-height: 70px;
          padding: 12px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #eeeeee;
        }

        .setting-switch-row div {
          display: grid;
          gap: 4px;
        }

        .setting-switch-row small {
          color: #777;
          font-size: 10px;
        }

        .switch {
          position: relative;
          width: 48px;
          height: 27px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 25px;
          background: #cccccc;
        }

        .switch.active {
          background: linear-gradient(90deg,#ef233c,#d414c9,#6d28d9);
        }

        .switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          background: white;
          transition: .2s;
        }

        .switch.active::after {
          left: 24px;
        }

        .publish-intro {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .publish-intro > span {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #f6eaff;
          font-size: 24px;
        }

        .publish-intro strong {
          display: block;
        }

        .publish-intro p {
          margin: 4px 0 0;
          color: #777;
          font-size: 11px;
        }

        .success-page {
          max-width: 640px;
          text-align: center;
          margin: 20px auto;
        }

        .success-page .success-icon {
          margin-bottom: 10px;
          font-size: 68px;
        }

        .success-page h2 {
          margin: 0 0 8px;
        }

        .success-page p {
          color: #777;
        }

        .success-total {
          display: block;
          margin: 15px 0;
          font-size: 18px;
        }

        .success-actions {
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .categories-grid {
            grid-template-columns: repeat(4,1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3,1fr);
          }

          .top-cards {
            grid-template-columns: repeat(2,1fr);
          }

          .cart-page,
          .checkout-layout,
          .product-detail-page {
            grid-template-columns: 1fr;
          }

          .cart-summary,
          .checkout-summary {
            position: static;
          }

          .auth-page {
            grid-template-columns: 1fr;
          }

          .auth-visual-page {
            min-height: 210px;
          }
        }

        @media (max-width: 640px) {
          .header-main {
            flex-wrap: wrap;
          }

          .brand {
            font-size: 19px;
          }

          .search-box {
            order: 5;
            flex-basis: 100%;
            max-width: none;
          }

          .hero {
            min-height: 180px;
            padding: 22px;
          }

          .hero-icon {
            display: none;
          }

          .categories-grid {
            grid-template-columns: repeat(4,1fr);
            gap: 5px;
          }

          .category-card {
            border-radius: 9px;
          }

          .category-card span {
            padding: 5px 4px;
            font-size: 7px;
          }

          .products-grid {
            grid-template-columns: repeat(2,1fr);
            gap: 8px;
          }

          .top-card {
            min-height: 95px;
          }

          .join-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .join-card .primary-button {
            width: 100%;
          }

          .account-grid,
          .detail-actions {
            grid-template-columns: 1fr;
          }

          .category-page-hero {
            grid-template-columns: 1fr;
          }

          .category-page-hero img {
            width: 100%;
            height: 150px;
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-input.full {
            grid-column: auto;
          }

          .checkout-actions {
            flex-direction: column;
          }

          .auth-visual-page,
          .auth-form-page,
          .account-page-card,
          .profile-page-card,
          .publish-page-card,
          .data-page,
          .settings-detail-page,
          .simple-detail-page,
          .success-page {
            padding: 20px;
          }
        }
      `}</style>

      {renderPage()}

      <WhatsAppButton />
    </div>
  );
}

export default App;
