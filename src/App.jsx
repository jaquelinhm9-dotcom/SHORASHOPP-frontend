import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

export default function App() {
  const [showAccount, setShowAccount] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  /* PERFIL */
  const [profileName, setProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  /* PRODUCTOS */
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Moda");
  const [productDescription, setProductDescription] = useState("");
  const [productMessage, setProductMessage] = useState("");

  /* PEDIDOS */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState("");

  /*
   * CARGA INICIAL DE SESIÓN
   */
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (!mounted) return;

      const currentUser = data.session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setProfileName(
          currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            ""
        );

        await loadProducts(currentUser.id);
        await loadOrders(currentUser.id);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setProfileName(
          currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            ""
        );

        await loadProducts(currentUser.id);
        await loadOrders(currentUser.id);
      } else {
        setProfileName("");
        setProducts([]);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * ABRIR CUENTA
   */
  const openAccount = () => {
    setActivePanel(null);
    setShowAuth(false);
    setShowAccount(true);
  };

  /*
   * ABRIR AUTENTICACIÓN
   */
  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAccount(false);
    setActivePanel(null);
    setShowAuth(true);
  };

  /*
   * ABRIR PANEL
   */
  const openPanel = async (panel) => {
    setShowAccount(false);
    setShowAuth(false);
    setActivePanel(panel);

    if (panel === "products" && user) {
      await loadProducts(user.id);
    }

    if (panel === "orders" && user) {
      await loadOrders(user.id);
    }
  };

  /*
   * CERRAR TODO
   */
  const closePanels = () => {
    setShowAccount(false);
    setShowAuth(false);
    setActivePanel(null);
    setEditingProfile(false);
    setShowProductForm(false);
    setProfileSaved(false);
    setProductMessage("");
    setOrdersMessage("");
  };

  /*
   * AUTENTICACIÓN
   */
  const handleAuth = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setMessage(
        "La conexión con SHORASHOPP no está disponible en este momento."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setProfileName(fullName.trim());
        }

        setMessage(
          "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. ✨"
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage("¡Bienvenido a SHORASHOPP! ✨");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * CERRAR SESIÓN
   */
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setProfileName("");
    setProducts([]);
    setOrders([]);
    closePanels();
    setMessage("");
  };

  /*
   * PERFIL
   */
  const saveProfile = async () => {
    if (!supabase || !user) return;

    const cleanName = profileName.trim();

    if (!cleanName) {
      setProfileSaved(false);
      return;
    }

    setLoading(true);
    setProfileSaved(false);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
        },
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
      }

      setEditingProfile(false);
      setProfileSaved(true);
    } catch (error) {
      console.error(error);
      setProfileSaved(false);
    } finally {
      setLoading(false);
    }
  };

  /*
   * PRODUCTOS - CARGAR
   */
  const loadProducts = async (userId) => {
    if (!supabase || !userId) return;

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando productos:", error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * PRODUCTOS - LIMPIAR FORMULARIO
   */
  const resetProductForm = () => {
    setProductName("");
    setProductPrice("");
    setProductCategory("Moda");
    setProductDescription("");
    setProductMessage("");
    setShowProductForm(false);
  };

  /*
   * PRODUCTOS - CREAR
   */
  const createProduct = async (event) => {
    event.preventDefault();

    if (!supabase || !user) {
      setProductMessage(
        "Necesitas iniciar sesión para publicar productos."
      );
      return;
    }

    const cleanName = productName.trim();
    const cleanPrice = Number(productPrice);
    const cleanDescription =
      productDescription.trim() ||
      "Producto publicado en SHORASHOPP.";

    if (!cleanName || !productPrice || Number.isNaN(cleanPrice)) {
      setProductMessage("Completa correctamente los datos del producto.");
      return;
    }

    setLoading(true);
    setProductMessage("");

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            user_id: user.id,
            name: cleanName,
            price: cleanPrice,
            category: productCategory,
            description: cleanDescription,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProducts((current) => [data, ...current]);

      resetProductForm();
      setProductMessage("✓ Producto publicado correctamente.");
    } catch (error) {
      console.error(error);

      setProductMessage(
        error.message ||
          "No fue posible publicar el producto. Revisa la configuración de Supabase."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * PRODUCTOS - ELIMINAR
   */
  const deleteProduct = async (id) => {
    if (!supabase || !user) return;

    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error(error);

      setProductMessage(
        error.message || "No fue posible eliminar el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * PEDIDOS - CARGAR
   */
  const loadOrders = async (userId) => {
    if (!supabase || !userId) return;

    setOrdersLoading(true);
    setOrdersMessage("");

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando pedidos:", error);

        setOrders([]);
        setOrdersMessage(
          "Todavía no hay pedidos disponibles para esta cuenta."
        );

        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error(error);

      setOrders([]);
      setOrdersMessage(
        "No fue posible consultar los pedidos en este momento."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  /*
   * INFORMACIÓN DE PANELES
   */
  const panelData = {
    profile: {
      icon: "👤",
      title: "Mi perfil",
      subtitle: "Administra tu información personal.",
    },

    orders: {
      icon: "📦",
      title: "Mis pedidos",
      subtitle:
        "Consulta tus compras y el estado de tus pedidos.",
    },

    products: {
      icon: "🛍️",
      title: "Mis productos",
      subtitle:
        "Administra los productos que publiques.",
    },

    messages: {
      icon: "💬",
      title: "Mensajes",
      subtitle:
        "Comunícate con compradores y vendedores.",
    },

    favorites: {
      icon: "❤️",
      title: "Favoritos",
      subtitle:
        "Aquí aparecerán los productos que guardes.",
    },

    settings: {
      icon: "⚙️",
      title: "Configuración",
      subtitle:
        "Personaliza tu experiencia en SHORASHOPP.",
    },

    cart: {
      icon: "🛒",
      title: "Mi carrito",
      subtitle:
        "Aquí aparecerán los productos que agregues.",
    },
  };

  const currentPanel = activePanel
    ? panelData[activePanel]
    : null;

  /*
   * PERFIL
   */
  const renderProfile = () => {
    if (!user) {
      return (
        <div className="emptyFeature">
          <div className="emptyBig">👤</div>

          <h3>
            Inicia sesión para ver tu perfil
          </h3>

          <p>
            Necesitas una cuenta de SHORASHOPP para
            administrar tu información personal.
          </p>

          <button
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            className="featureSecondary"
            onClick={() => openAuth("register")}
          >
            Crear una cuenta
          </button>
        </div>
      );
    }

    return (
      <div className="profileContent">

        <div className="profileAvatarLarge">
          {profileName
            ? profileName.charAt(0).toUpperCase()
            : "✨"}
        </div>

        <div className="profileFields">

          <label>Nombre completo</label>

          {editingProfile ? (
            <input
              className="profileInput"
              value={profileName}
              onChange={(event) =>
                setProfileName(event.target.value)
              }
              placeholder="Tu nombre completo"
            />
          ) : (
            <div className="profileValue">
              {profileName || "Sin nombre"}
            </div>
          )}

          <label>Correo electrónico</label>

          <div className="profileValue profileEmail">
            {user.email}
          </div>

        </div>

        {editingProfile ? (
          <div className="profileButtons">

            <button
              className="featurePrimary"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              className="featureSecondary"
              onClick={() => {
                setEditingProfile(false);
                setProfileSaved(false);
              }}
            >
              Cancelar
            </button>

          </div>
        ) : (
          <button
            className="featurePrimary"
            onClick={() => {
              setEditingProfile(true);
              setProfileSaved(false);
            }}
          >
            Editar perfil
          </button>
        )}

        {profileSaved && (
          <div className="successMessage">
            ✓ Tu perfil fue actualizado correctamente.
          </div>
        )}

      </div>
    );
  };

  /*
   * PEDIDOS
   */
  const renderOrders = () => {
    if (!user) {
      return (
        <div className="emptyFeature">
          <div className="emptyBig">📦</div>

          <h3>
            Inicia sesión para ver tus pedidos
          </h3>

          <p>
            Aquí podrás consultar todas tus compras,
            estados y detalles de entrega.
          </p>

          <button
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            className="featureSecondary"
            onClick={() => openAuth("register")}
          >
            Crear una cuenta
          </button>
        </div>
      );
    }

    if (ordersLoading) {
      return (
        <div className="ordersContent">
          <div className="ordersEmptyIcon">
            📦
          </div>

          <h3>
            Cargando tus pedidos...
          </h3>

          <p>
            Estamos consultando tu historial de compras.
          </p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="ordersContent">

          <div className="ordersEmptyIcon">
            📦
          </div>

          <h3>
            Aún no tienes pedidos
          </h3>

          <p>
            Cuando realices una compra en SHORASHOPP,
            aparecerá aquí con toda su información.
          </p>

          {ordersMessage && (
            <div className="authMessage">
              {ordersMessage}
            </div>
          )}

          <button
            className="featurePrimary"
            onClick={() => {
              closePanels();

              setTimeout(() => {
                document
                  .getElementById("categorias")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }, 50);
            }}
          >
            Explorar productos
          </button>

        </div>
      );
    }

    return (
      <div className="ordersContent">

        <div className="ordersList">

          {orders.map((order) => (
            <article
              className="orderCard"
              key={order.id}
            >

              <div className="orderIcon">
                📦
              </div>

              <div className="orderInfo">

                <span>
                  PEDIDO
                </span>

                <h3>
                  #{String(order.id).slice(-8)}
                </h3>

                <p>
                  Estado:{" "}
                  <strong>
                    {order.status || "Pendiente"}
                  </strong>
                </p>

                {order.total !== undefined &&
                  order.total !== null && (
                    <strong>
                      ${Number(order.total).toFixed(2)} MXN
                    </strong>
                  )}

              </div>

            </article>
          ))}

        </div>

      </div>
    );
  };

  /*
   * PRODUCTOS
   */
  const renderProducts = () => {
    if (!user) {
      return (
        <div className="emptyFeature">

          <div className="emptyBig">
            🛍️
          </div>

          <h3>
            Inicia sesión para vender
          </h3>

          <p>
            Crea tu cuenta para comenzar a publicar
            productos en SHORASHOPP.
          </p>

          <button
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            className="featureSecondary"
            onClick={() => openAuth("register")}
          >
            Crear una cuenta
          </button>

        </div>
      );
    }

    return (
      <div className="productsContent">

        {!showProductForm && (
          <button
            className="featurePrimary addProductButton"
            onClick={() => {
              setProductMessage("");
              setShowProductForm(true);
            }}
          >
            ＋ Publicar un producto
          </button>
        )}

        {productMessage && (
          <div className="successMessage">
            {productMessage}
          </div>
        )}

        {showProductForm && (
          <form
            className="productForm"
            onSubmit={createProduct}
          >

            <h3>
              Nuevo producto
            </h3>

            <label>
              Nombre del producto
            </label>

            <input
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              placeholder="Ej. Bolsa de mano"
              required
            />

            <label>
              Precio
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={productPrice}
              onChange={(event) =>
                setProductPrice(event.target.value)
              }
              placeholder="Ej. 599"
              required
            />

            <label>
              Categoría
            </label>

            <select
              value={productCategory}
              onChange={(event) =>
                setProductCategory(event.target.value)
              }
            >
              <option>Moda</option>
              <option>Tecnología</option>
              <option>Hogar</option>
              <option>Belleza</option>
              <option>Entretenimiento</option>
              <option>Automóviles</option>
              <option>Otros</option>
            </select>

            <label>
              Descripción
            </label>

            <textarea
              value={productDescription}
              onChange={(event) =>
                setProductDescription(event.target.value)
              }
              placeholder="Describe tu producto..."
              rows="4"
            />

            <div className="productFormButtons">

              <button
                type="submit"
                className="featurePrimary"
                disabled={loading}
              >
                {loading
                  ? "Publicando..."
                  : "Publicar producto"}
              </button>

              <button
                type="button"
                className="featureSecondary"
                onClick={resetProductForm}
              >
                Cancelar
              </button>

            </div>

          </form>
        )}

        {!showProductForm &&
          products.length === 0 && (
            <div className="productsEmpty">

              <div className="emptyBig">
                🛍️
              </div>

              <h3>
                Aún no tienes productos
              </h3>

              <p>
                Publica tu primer producto y comienza
                a vender en SHORASHOPP.
              </p>

            </div>
          )}

        {products.length > 0 && (
          <div className="sellerProducts">

            <h3>
              Mis publicaciones
            </h3>

            {products.map((product) => (
              <article
                className="sellerProductCard"
                key={product.id}
              >

                <div className="sellerProductIcon">
                  🛍️
                </div>

                <div className="sellerProductInfo">

                  <span>
                    {product.category}
                  </span>

                  <h4>
                    {product.name}
                  </h4>

                  <strong>
                    $
                    {Number(product.price || 0).toFixed(2)}
                    {" "}MXN
                  </strong>

                  <p>
                    {product.description}
                  </p>

                </div>

                <button
                  className="deleteProduct"
                  onClick={() =>
                    deleteProduct(product.id)
                  }
                  aria-label="Eliminar producto"
                  disabled={loading}
                >
                  🗑️
                </button>

              </article>
            ))}

          </div>
        )}

      </div>
    );
  };

  /*
   * CONTENIDO DEL PANEL
   */
  const renderPanelContent = () => {
    switch (activePanel) {
      case "profile":
        return renderProfile();

      case "orders":
        return renderOrders();

      case "products":
        return renderProducts();

      default:
        return (
          <div className="emptyFeature">

            <div className="emptyBig">
              {currentPanel.icon}
            </div>

            <h3>
              Esta sección está lista para crecer
            </h3>

            <p>
              Aquí construiremos esta función de
              SHORASHOPP en el siguiente paso.
            </p>

            <button
              className="featurePrimary"
              onClick={closePanels}
            >
              Volver a SHORASHOPP
            </button>

          </div>
        );
    }
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <button
          className="logo logoButton"
          onClick={() => {
            closePanels();

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <span>SHORA</span>
          <strong>SHOPP</strong>
        </button>

        <div className="searchBox">

          <input
            type="text"
            placeholder="¿Qué estás buscando?"
          />

          <button aria-label="Buscar">
            ⌕
          </button>

        </div>

        <div className="headerActions">

          <button
            className="headerButton"
            onClick={() => openPanel("cart")}
            aria-label="Carrito"
          >
            🛒
          </button>

          <button
            className="headerButton accountButton"
            onClick={openAccount}
            aria-label="Cuenta"
          >
            ✨
          </button>

        </div>

      </header>

      {/* CONTENIDO */}

      <main>

        {/* HERO */}

        <section className="hero">

          <div className="heroContent">

            <div className="heroText">

              <div className="heroTag">
                ✦ TODO EN UN SOLO LUGAR
              </div>

              <h1>
                Compra.
                <br />
                Vende.
                <br />
                <span>Descubre.</span>
              </h1>

              <p>
                Encuentra productos increíbles,
                descubre nuevas oportunidades y
                compra directamente a vendedores
                de SHORASHOPP.
              </p>

              <div className="heroButtons">

                <button
                  className="primaryButton"
                  onClick={() =>
                    document
                      .getElementById("categorias")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  Explorar productos
                  <span>→</span>
                </button>

                <button
                  className="secondaryButton"
                  onClick={() =>
                    openPanel("products")
                  }
                >
                  Quiero vender
                </button>

              </div>

            </div>

            <div className="heroVisual">

              <div className="glow glowOne"></div>
              <div className="glow glowTwo"></div>

              <div className="mainCircle">

                <div className="circleContent">

                  <div className="shoppingBag">
                    🛍️
                  </div>

                  <div className="circleText">
                    SHORA
                    <strong>SHOPP</strong>
                  </div>

                </div>

              </div>

              <div className="floatingCard cardOne">

                <div className="floatingIcon">
                  👜
                </div>

                <div>
                  <strong>Moda</strong>
                  <small>Descubre más</small>
                </div>

              </div>

              <div className="floatingCard cardTwo">

                <div className="floatingIcon">
                  📱
                </div>

                <div>
                  <strong>Tecnología</strong>
                  <small>Lo más nuevo</small>
                </div>

              </div>

              <div className="floatingCard cardThree">

                <div className="floatingIcon">
                  🏠
                </div>

                <div>
                  <strong>Hogar</strong>
                  <small>Encuentra todo</small>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* CATEGORÍAS */}

        <section
          className="categories"
          id="categorias"
        >

          <div className="sectionTitle">

            <span>CATEGORÍAS</span>

            <h2>
              Explora lo que buscas
            </h2>

            <p>
              Todo lo que necesitas, en un solo lugar.
            </p>

          </div>

          <div className="categoryGrid">

            {[
              ["👗", "Moda"],
              ["📱", "Tecnología"],
              ["🏠", "Hogar"],
              ["💄", "Belleza"],
              ["🎮", "Entretenimiento"],
              ["🚗", "Automóviles"],
            ].map(([icon, name]) => (

              <button
                className="categoryCard"
                key={name}
                onClick={() =>
                  openPanel("cart")
                }
              >

                <div className="categoryIcon">
                  {icon}
                </div>

                <strong>
                  {name}
                </strong>

                <span>
                  Ver productos →
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* PRODUCTOS */}

        <section className="featured">

          <div className="featuredHeader">

            <div>

              <span>DESCUBRE</span>

              <h2>
                Productos destacados
              </h2>

              <p>
                Descubre productos que podrían gustarte.
              </p>

            </div>

            <button
              className="viewAll"
              onClick={() =>
                openPanel("cart")
              }
            >
              Ver todos →
            </button>

          </div>

          <div className="productGrid">

            <article className="productCard">

              <div className="productImage productPink">
                👜
              </div>

              <div className="productInfo">

                <span>MODA</span>

                <h3>
                  Nuevas tendencias
                </h3>

                <p>
                  Descubre productos de moda.
                </p>

                <button
                  className="productAction"
                  onClick={() =>
                    openPanel("cart")
                  }
                >
                  Ver producto →
                </button>

              </div>

            </article>

            <article className="productCard">

              <div className="productImage productPurple">
                📱
              </div>

              <div className="productInfo">

                <span>TECNOLOGÍA</span>

                <h3>
                  Tecnología
                </h3>

                <p>
                  Encuentra lo último.
                </p>

                <button
                  className="productAction"
                  onClick={() =>
                    openPanel("cart")
                  }
                >
                  Ver producto →
                </button>

              </div>

            </article>

            <article className="productCard">

              <div className="productImage productOrange">
                🏠
              </div>

              <div className="productInfo">

                <span>HOGAR</span>

                <h3>
                  Para tu hogar
                </h3>

                <p>
                  Todo para tu espacio.
                </p>

                <button
                  className="productAction"
                  onClick={() =>
                    openPanel("cart")
                  }
                >
                  Ver producto →
                </button>

              </div>

            </article>

          </div>

        </section>

        {/* VENDE */}

        <section className="sellerSection">

          <div className="sellerContent">

            <span>
              VENDE EN SHORASHOPP
            </span>

            <h2>
              Tu producto.
              <br />
              Tu oportunidad.
            </h2>

            <p>
              Publica tus productos y conecta
              con nuevos compradores.
            </p>

            <button
              onClick={() =>
                openPanel("products")
              }
            >
              Comenzar a vender →
            </button>

          </div>

          <div className="sellerVisual">
            🛍️
          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer>

        <div className="footerLogo">
          SHORA<strong>SHOPP</strong>
        </div>

        <p>
          Compra, vende y descubre.
        </p>

        <div className="footerLinks">

          <button
            onClick={() =>
              openPanel("messages")
            }
          >
            Ayuda
          </button>

          <button
            onClick={() =>
              openPanel("settings")
            }
          >
            Privacidad
          </button>

          <button
            onClick={() =>
              openPanel("settings")
            }
          >
            Términos
          </button>

          <button
            onClick={() =>
              openPanel("messages")
            }
          >
            Contacto
          </button>

        </div>

        <small>
          © 2026 SHORASHOPP. Todos los derechos reservados.
        </small>

      </footer>

      {/* PANEL DE CUENTA */}

      {showAccount && (

        <div
          className="accountOverlay"
          onClick={() =>
            setShowAccount(false)
          }
        >

          <aside
            className="accountPanel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="accountPanelHeader">

              <div className="accountIdentity">

                <div className="accountAvatar">
                  {profileName
                    ? profileName.charAt(0).toUpperCase()
                    : "✨"}
                </div>

                <div>

                  <strong>
                    {user
                      ? profileName || "Mi cuenta"
                      : "Bienvenido a SHORASHOPP"}
                  </strong>

                  <small>
                    {user
                      ? user.email
                      : "Inicia sesión para continuar"}
                  </small>

                </div>

              </div>

              <button
                className="panelClose"
                onClick={() =>
                  setShowAccount(false)
                }
              >
                ×
              </button>

            </div>

            {!user && (

              <div className="accountLoginBox">

                <p>
                  Accede a tu cuenta para disfrutar
                  de todas las funciones.
                </p>

                <button
                  className="panelPrimary"
                  onClick={() =>
                    openAuth("login")
                  }
                >
                  Iniciar sesión
                </button>

                <button
                  className="panelSecondary"
                  onClick={() =>
                    openAuth("register")
                  }
                >
                  Crear una cuenta
                </button>

              </div>

            )}

            <nav className="accountMenu">

              <button
                onClick={() =>
                  openPanel("profile")
                }
              >
                <span>👤</span>

                <div>
                  <strong>
                    Mi perfil
                  </strong>

                  <small>
                    Información personal
                  </small>
                </div>

                <b>›</b>
              </button>

              <button
                onClick={() =>
                  openPanel("orders")
                }
              >
                <span>📦</span>

                <div>
                  <strong>
                    Mis pedidos
                  </strong>

                  <small>
                    Consulta tus compras
                  </small>
                </div>

                <b>›</b>
              </button>

              <button
                onClick={() =>
                  openPanel("products")
                }
              >
                <span>🛍️</span>

                <div>
                  <strong>
                    Mis productos
                  </strong>

                  <small>
                    Administra tus publicaciones
                  </small>
                </div>

                <b>›</b>
              </button>

              <button
                onClick={() =>
                  openPanel("messages")
                }
              >
                <span>💬</span>

                <div>
                  <strong>
                    Mensajes
                  </strong>

                  <small>
                    Compradores y vendedores
                  </small>
                </div>

                <b>›</b>
              </button>

              <button
                onClick={() =>
                  openPanel("favorites")
                }
              >
                <span>❤️</span>

                <div>
                  <strong>
                    Favoritos
                  </strong>

                  <small>
                    Productos que guardaste
                  </small>
                </div>

                <b>›</b>
              </button>

              <button
                onClick={() =>
                  openPanel("settings")
                }
              >
                <span>⚙️</span>

                <div>
                  <strong>
                    Configuración
                  </strong>

                  <small>
                    Preferencias de tu cuenta
                  </small>
                </div>

                <b>›</b>
              </button>

            </nav>

            {user && (

              <button
                className="logoutButton"
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>

            )}

          </aside>

        </div>

      )}

      {/* VENTANAS INTERNAS */}

      {activePanel && currentPanel && (

        <div
          className="featureOverlay"
          onClick={closePanels}
        >

          <section
            className={`featureModal ${
              activePanel === "products"
                ? "productsModal"
                : ""
            }`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="featureClose"
              onClick={closePanels}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="featureIcon">
              {currentPanel.icon}
            </div>

            <h2>
              {currentPanel.title}
            </h2>

            <p className="featureSubtitle">
              {currentPanel.subtitle}
            </p>

            {renderPanelContent()}

          </section>

        </div>

      )}

      {/* AUTENTICACIÓN */}

      {showAuth && (

        <div
          className="authOverlay"
          onClick={() =>
            setShowAuth(false)
          }
        >

          <div
            className="authModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="authClose"
              onClick={() =>
                setShowAuth(false)
              }
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="authLogo">
              ✨
            </div>

            <h2>
              {authMode === "login"
                ? "Bienvenido a SHORASHOPP"
                : "Crea tu cuenta"}
            </h2>

            <p className="authSubtitle">
              {authMode === "login"
                ? "Inicia sesión para continuar."
                : "Regístrate y comienza a disfrutar SHORASHOPP."}
            </p>

            <form onSubmit={handleAuth}>

              {authMode === "register" && (

                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
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
                minLength="6"
                required
              />

              <button
                type="submit"
                className="authSubmit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>

              {message && (

                <p className="authMessage">
                  {message}
                </p>

              )}

              <button
                type="button"
                className="authSwitch"
                onClick={() => {
                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  );

                  setMessage("");
                }}
              >
                {authMode === "login"
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
