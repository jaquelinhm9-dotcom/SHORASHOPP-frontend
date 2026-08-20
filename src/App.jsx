import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

const categories = [
  { name: "Moda y ropa", icon: "👗" },
  { name: "Tecnología", icon: "📱" },
  { name: "Hogar y vida", icon: "🏠" },
  { name: "Belleza y salud", icon: "💄" },
  { name: "Accesorios", icon: "👜" },
  { name: "Juguetería", icon: "🧸" },
];

const demoProducts = [
  {
    id: "demo-1",
    name: "Bolsa de mano",
    price: 599,
    category: "Moda y ropa",
    icon: "👜",
  },
  {
    id: "demo-2",
    name: "Audífonos inalámbricos",
    price: 899,
    category: "Tecnología",
    icon: "🎧",
  },
  {
    id: "demo-3",
    name: "Reloj moderno",
    price: 749,
    category: "Accesorios",
    icon: "⌚",
  },
  {
    id: "demo-4",
    name: "Set para el hogar",
    price: 429,
    category: "Hogar y vida",
    icon: "🏠",
  },
];

const panelConfig = {
  messages: {
    icon: "💬",
    title: "Ayuda y mensajes",
    subtitle: "Estamos aquí para ayudarte.",
  },
  settings: {
    icon: "⚙️",
    title: "Configuración",
    subtitle: "Administra las opciones de tu cuenta.",
  },
  profile: {
    icon: "👤",
    title: "Mi perfil",
    subtitle: "Administra tu información personal.",
  },
  orders: {
    icon: "📦",
    title: "Mis pedidos",
    subtitle: "Consulta tus compras y pedidos.",
  },
  products: {
    icon: "🛍️",
    title: "Mis productos",
    subtitle: "Publica y administra tus productos.",
  },
  favorites: {
    icon: "❤️",
    title: "Favoritos",
    subtitle: "Productos que guardaste.",
  },
  cart: {
    icon: "🛒",
    title: "Carrito",
    subtitle: "Revisa los productos que agregaste.",
  },
};

export default function App() {
  const [showAccount, setShowAccount] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [profileName, setProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Moda y ropa");
  const [productDescription, setProductDescription] = useState("");
  const [productMessage, setProductMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState("");

  const [offerSlide, setOfferSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  // FIX PRINCIPAL:
  // Antes currentPanel no existía.
  const currentPanel = useMemo(() => {
    return activePanel ? panelConfig[activePanel] : null;
  }, [activePanel]);

  /*
   * CARGA INICIAL
   */
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error obteniendo sesión:", error);
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
   * CARRUSEL
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferSlide((current) => (current + 1) % 3);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  /*
   * CUENTA
   */
  const openAccount = () => {
    setMenuOpen(false);
    setActivePanel(null);
    setShowAuth(false);
    setShowAccount(true);
  };

  /*
   * AUTENTICACIÓN
   */
  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAccount(false);
    setActivePanel(null);
    setMenuOpen(false);
    setShowAuth(true);
  };

  /*
   * PANELES
   */
  const openPanel = async (panel) => {
    setShowAccount(false);
    setShowAuth(false);
    setMenuOpen(false);
    setActivePanel(panel);

    if (panel === "products" && user) {
      await loadProducts(user.id);
    }

    if (panel === "orders" && user) {
      await loadOrders(user.id);
    }
  };

  /*
   * CERRAR
   */
  const closePanels = () => {
    setShowAccount(false);
    setShowAuth(false);
    setActivePanel(null);
    setMenuOpen(false);
    setEditingProfile(false);
    setShowProductForm(false);
    setProfileSaved(false);
    setProductMessage("");
    setOrdersMessage("");
  };

  /*
   * LOGIN / REGISTRO
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
        if (!fullName.trim()) {
          setMessage("Escribe tu nombre completo.");
          return;
        }

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
      setMessage(error?.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }

    setUser(null);
    setProfileName("");
    setProducts([]);
    setOrders([]);
    setFavorites([]);
    setCart([]);

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
        setProducts([]);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  };

  /*
   * PRODUCTOS - RESET
   */
  const resetProductForm = () => {
    setProductName("");
    setProductPrice("");
    setProductCategory("Moda y ropa");
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

    if (
      !cleanName ||
      productPrice === "" ||
      Number.isNaN(cleanPrice) ||
      cleanPrice < 0
    ) {
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

      setProductName("");
      setProductPrice("");
      setProductCategory("Moda y ropa");
      setProductDescription("");
      setShowProductForm(false);
      setProductMessage("✓ Producto publicado correctamente.");
    } catch (error) {
      console.error(error);

      setProductMessage(
        error?.message ||
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
        error?.message || "No fue posible eliminar el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * PEDIDOS
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
   * FAVORITOS
   */
  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  /*
   * CARRITO
   */
  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  /*
   * BUSCADOR
   */
  const searchProducts = useMemo(() => {
    const allProducts = products.length > 0 ? products : demoProducts;

    const term = search.trim().toLowerCase();

    if (!term) return allProducts;

    return allProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return (
        name.includes(term) ||
        category.includes(term) ||
        description.includes(term)
      );
    });
  }, [products, search]);

  /*
   * SCROLL
   */
  const goTo = (id) => {
    closePanels();

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  /*
   * TARJETA PRODUCTO
   */
  const renderProductCard = (product) => {
    const isFavorite = favorites.includes(product.id);

    return (
      <article className="shopProductCard" key={product.id}>
        <div className="shopProductImage">
          <span>{product.icon || "🛍️"}</span>

          <button
            type="button"
            className={`favoriteProductButton ${
              isFavorite ? "isFavorite" : ""
            }`}
            onClick={() => toggleFavorite(product.id)}
            aria-label={
              isFavorite
                ? "Quitar de favoritos"
                : "Agregar a favoritos"
            }
          >
            {isFavorite ? "♥" : "♡"}
          </button>

          <span className="productOfferBadge">OFERTA</span>
        </div>

        <div className="shopProductInfo">
          <small>{product.category || "Productos"}</small>

          <h3>{product.name}</h3>

          <strong>
            ${Number(product.price || 0).toLocaleString("es-MX")}
            <span> MXN</span>
          </strong>

          <button
            type="button"
            className="addCartButton"
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    );
  };

  /*
   * PERFIL
   */
  const renderProfile = () => {
    if (!user) {
      return (
        <div className="emptyFeature">
          <div className="emptyBig">👤</div>

          <h3>Inicia sesión para ver tu perfil</h3>

          <p>
            Necesitas una cuenta de SHORASHOPP para administrar
            tu información personal.
          </p>

          <button
            type="button"
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
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
              type="button"
              className="featurePrimary"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
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
            type="button"
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

        <button
          type="button"
          className="logoutButton"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
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

          <h3>Inicia sesión para ver tus pedidos</h3>

          <p>
            Aquí podrás consultar todas tus compras, estados
            y detalles de entrega.
          </p>

          <button
            type="button"
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
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
          <div className="ordersEmptyIcon">📦</div>

          <h3>Cargando tus pedidos...</h3>

          <p>
            Estamos consultando tu historial de compras.
          </p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="ordersContent">
          <div className="ordersEmptyIcon">📦</div>

          <h3>Aún no tienes pedidos</h3>

          <p>
            Cuando realices una compra en SHORASHOPP,
            aparecerá aquí con toda su información.
          </p>

          {ordersMessage && (
            <div className="authMessage">{ordersMessage}</div>
          )}

          <button
            type="button"
            className="featurePrimary"
            onClick={() => goTo("productos")}
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
            <article className="orderCard" key={order.id}>
              <div className="orderIcon">📦</div>

              <div className="orderInfo">
                <span>PEDIDO</span>

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
                      ${Number(order.total).toLocaleString("es-MX")} MXN
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
   * PRODUCTOS DEL VENDEDOR
   */
  const renderProducts = () => {
    if (!user) {
      return (
        <div className="emptyFeature">
          <div className="emptyBig">🛍️</div>

          <h3>Inicia sesión para vender</h3>

          <p>
            Crea tu cuenta para comenzar a publicar productos
            en SHORASHOPP.
          </p>

          <button
            type="button"
            className="featurePrimary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
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
            type="button"
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
            <h3>Nuevo producto</h3>

            <label>Nombre del producto</label>

            <input
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              placeholder="Ej. Bolsa de mano"
              required
            />

            <label>Precio</label>

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

            <label>Categoría</label>

            <select
              value={productCategory}
              onChange={(event) =>
                setProductCategory(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category.name}>
                  {category.name}
                </option>
              ))}

              <option>Entretenimiento</option>
              <option>Automóviles</option>
              <option>Otros</option>
            </select>

            <label>Descripción</label>

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

        {products.length > 0 && (
          <div className="sellerProductList">
            {products.map((product) => (
              <article
                className="sellerProductCard"
                key={product.id}
              >
                <div>
                  <strong>{product.name}</strong>

                  <span>
                    ${Number(product.price).toLocaleString("es-MX")} MXN
                  </span>

                  <small>{product.category}</small>
                </div>

                <button
                  type="button"
                  className="deleteProductButton"
                  onClick={() => deleteProduct(product.id)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  };

  /*
   * PANEL
   */
  const renderActivePanel = () => {
    if (!activePanel) return null;

    if (activePanel === "profile") {
      return renderProfile();
    }

    if (activePanel === "orders") {
      return renderOrders();
    }

    if (activePanel === "products") {
      return renderProducts();
    }

    if (activePanel === "favorites") {
      const favoriteProducts = searchProducts.filter((product) =>
        favorites.includes(product.id)
      );

      return favoriteProducts.length ? (
        <div className="panelProductGrid">
          {favoriteProducts.map(renderProductCard)}
        </div>
      ) : (
        <div className="emptyFeature">
          <div className="emptyBig">♡</div>

          <h3>Aún no tienes favoritos</h3>

          <p>
            Guarda los productos que más te gusten y
            aparecerán aquí.
          </p>

          <button
            type="button"
            className="featurePrimary"
            onClick={() => goTo("productos")}
          >
            Ver productos
          </button>
        </div>
      );
    }

    if (activePanel === "cart") {
      if (!cart.length) {
        return (
          <div className="emptyFeature">
            <div className="emptyBig">🛒</div>

            <h3>Tu carrito está vacío</h3>

            <p>
              Agrega productos y aparecerán aquí.
            </p>

            <button
              type="button"
              className="featurePrimary"
              onClick={() => goTo("productos")}
            >
              Ver productos
            </button>
          </div>
        );
      }

      const cartTotal = cart.reduce(
        (total, item) => total + Number(item.price || 0),
        0
      );

      return (
        <div className="cartPanel">
          {cart.map((item, index) => (
            <div
              className="cartItem"
              key={`${item.id}-${index}`}
            >
              <span>{item.icon || "🛍️"}</span>

              <div>
                <strong>{item.name}</strong>

                <small>
                  ${Number(item.price).toLocaleString("es-MX")} MXN
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCart((current) =>
                    current.filter((_, i) => i !== index)
                  )
                }
                aria-label="Eliminar producto"
              >
                ×
              </button>
            </div>
          ))}

          <div className="cartTotal">
            <strong>Total</strong>
            <strong>
              ${cartTotal.toLocaleString("es-MX")} MXN
            </strong>
          </div>

          <button
            type="button"
            className="featurePrimary"
            onClick={() =>
              alert("El proceso de compra estará disponible próximamente.")
            }
          >
            Continuar con la compra
          </button>
        </div>
      );
    }

    return (
      <div className="emptyFeature">
        <div className="emptyBig">
          {currentPanel?.icon || "⚙️"}
        </div>

        <h3>{currentPanel?.title || "SHORASHOPP"}</h3>

        <p>
          {currentPanel?.subtitle ||
            "Esta sección estará disponible próximamente."}
        </p>

        <button
          type="button"
          className="featurePrimary"
          onClick={closePanels}
        >
          Volver a SHORASHOPP
        </button>
      </div>
    );
  };

  return (
    <div className="shoraApp">
      <style>{`
        .shoraApp {
          --shora-red: #f43f5e;
          --shora-pink: #ec4899;
          --shora-purple: #8b5cf6;
          --shora-text: #26232b;
          --shora-muted: #77727d;
          --shora-border: #eeeaf1;
          min-height: 100vh;
          background: #fff;
          color: var(--shora-text);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding-bottom: 92px;
        }

        .shoraHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #f0edf2;
        }

        .headerTop {
          height: 92px;
          max-width: 1180px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 10px 22px;
        }

        .headerSide {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .headerSide.right {
          justify-content: flex-end;
        }

        .iconHeaderButton {
          width: 42px;
          height: 42px;
          border: 0;
          background: #fff;
          border-radius: 14px;
          font-size: 21px;
          cursor: pointer;
        }

        .iconHeaderButton:hover {
          background: #f8f5f9;
        }

        .brand {
          text-align: center;
          line-height: 1;
          cursor: pointer;
        }

        .brandName {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 900;
          letter-spacing: -2px;
        }

        .brandShora {
          color: var(--shora-red);
        }

        .brandShop {
          color: var(--shora-purple);
        }

        .brandTagline {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .tagBuy {
          color: var(--shora-red);
        }

        .tagSell {
          color: var(--shora-purple);
        }

        .tagDiscover {
          color: #88838c;
        }

        .mainHome {
          max-width: 1180px;
          margin: auto;
          padding: 18px 20px 40px;
        }

        .searchBox {
          height: 58px;
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: 20px;
          background: linear-gradient(90deg, #f43f5e, #ec4899, #8b5cf6);
          margin-bottom: 16px;
        }

        .searchInner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 17px;
          padding: 0 18px;
        }

        .searchInner input {
          flex: 1;
          border: 0;
          outline: 0;
          font-size: 16px;
          color: #333;
          background: transparent;
        }

        .searchIcon {
          font-size: 22px;
        }

        .quickCards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .quickCard {
          border: 1px solid var(--shora-border);
          background: #fff;
          border-radius: 20px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 92px;
          cursor: pointer;
          box-shadow: 0 5px 20px rgba(40,20,50,.04);
        }

        .quickCard:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(40,20,50,.07);
        }

        .quickCardLeft {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quickIcon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #fff4f7;
          font-size: 28px;
        }

        .quickCard h3 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .quickCard p {
          margin: 0;
          font-size: 12px;
          color: var(--shora-muted);
        }

        .quickArrow {
          font-size: 24px;
          color: #777;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 28px 0 13px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: 20px;
        }

        .sectionHeader button {
          border: 0;
          background: transparent;
          color: var(--shora-purple);
          font-weight: 800;
          cursor: pointer;
        }

        .categoryRow {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .categoryCard {
          min-width: 0;
          border: 1px solid var(--shora-border);
          border-radius: 17px;
          background: #fff;
          padding: 14px 8px;
          text-align: center;
          cursor: pointer;
        }

        .categoryCard:hover {
          border-color: #dfd4e8;
        }

        .categoryEmoji {
          display: block;
          font-size: 27px;
          margin-bottom: 7px;
        }

        .categoryCard span:last-child {
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
        }

        .offerCarousel {
          overflow: hidden;
          position: relative;
          border-radius: 24px;
          background: linear-gradient(110deg, #f43f5e, #ec4899 55%, #8b5cf6);
          min-height: 185px;
          color: white;
          margin-top: 24px;
        }

        .offerContent {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 185px;
          padding: 25px 30px;
        }

        .offerText {
          max-width: 58%;
        }

        .offerText h2 {
          margin: 0 0 8px;
          font-size: 25px;
        }

        .offerText p {
          margin: 0 0 16px;
          opacity: .95;
        }

        .offerButton {
          border: 0;
          border-radius: 12px;
          background: white;
          color: #8b3e8f;
          font-weight: 800;
          padding: 11px 18px;
          cursor: pointer;
        }

        .offerVisual {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 45px;
          transform: rotate(-3deg);
        }

        .offerPercent {
          background: white;
          color: var(--shora-red);
          border-radius: 50%;
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          font-size: 16px;
          font-weight: 900;
        }

        .dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 0;
          padding: 0;
          background: rgba(255,255,255,.45);
          cursor: pointer;
        }

        .dot.active {
          width: 20px;
          border-radius: 10px;
          background: white;
        }

        .productGrid,
        .panelProductGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .shopProductCard {
          background: #fff;
          border: 1px solid var(--shora-border);
          border-radius: 19px;
          overflow: hidden;
          min-width: 0;
        }

        .shopProductImage {
          position: relative;
          height: 170px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #fff4f7, #f7f2ff);
        }

        .shopProductImage > span:first-child {
          font-size: 65px;
        }

        .favoriteProductButton {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 0;
          background: rgba(255,255,255,.9);
          font-size: 21px;
          color: #777;
          cursor: pointer;
        }

        .favoriteProductButton.isFavorite {
          color: var(--shora-red);
        }

        .productOfferBadge {
          position: absolute;
          left: 9px;
          top: 9px;
          padding: 5px 8px;
          border-radius: 8px;
          background: #fff;
          color: var(--shora-red);
          font-size: 9px;
          font-weight: 900;
        }

        .shopProductInfo {
          padding: 13px;
        }

        .shopProductInfo small {
          color: #999;
          font-size: 10px;
        }

        .shopProductInfo h3 {
          margin: 5px 0 7px;
          font-size: 14px;
        }

        .shopProductInfo strong {
          font-size: 17px;
        }

        .shopProductInfo strong span {
          font-size: 10px;
          color: #777;
        }

        .addCartButton {
          width: 100%;
          margin-top: 10px;
          border: 1px solid #eadfeb;
          background: #fff;
          border-radius: 10px;
          padding: 9px;
          font-size: 12px;
          font-weight: 800;
          color: #7c4a91;
          cursor: pointer;
        }

        .trustStrip {
          margin-top: 30px;
          border: 1px solid var(--shora-border);
          border-radius: 20px;
          padding: 20px 15px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          background: #fff;
        }

        .trustItem {
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .trustItem span {
          display: block;
          font-size: 23px;
          margin-bottom: 6px;
        }

        .supportButton {
          position: fixed;
          right: 18px;
          bottom: 92px;
          z-index: 70;
          border: 0;
          border-radius: 50px;
          padding: 13px 17px;
          background: linear-gradient(135deg, #f43f5e, #8b5cf6);
          color: white;
          box-shadow: 0 10px 25px rgba(139,92,246,.28);
          font-weight: 800;
          cursor: pointer;
        }

        .bottomNav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 60;
          height: 76px;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid #eeeaf1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .bottomNav button {
          border: 0;
          background: transparent;
          min-width: 72px;
          height: 58px;
          border-radius: 15px;
          color: #777;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .bottomNav button span {
          display: block;
          font-size: 20px;
          margin-bottom: 3px;
        }

        .bottomNav .sellButton {
          min-width: 82px;
          height: 64px;
          color: white;
          background: linear-gradient(135deg, #f43f5e, #8b5cf6);
          box-shadow: 0 7px 18px rgba(139,92,246,.22);
          transform: translateY(-4px);
        }

        .bottomNav .sellButton span {
          font-size: 23px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(28,20,32,.42);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .panel {
          width: min(680px, 100%);
          max-height: 88vh;
          overflow-y: auto;
          background: white;
          border-radius: 28px 28px 0 0;
          padding: 22px;
          box-shadow: 0 -15px 50px rgba(0,0,0,.15);
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .panelTitle {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .panelTitleIcon {
          font-size: 27px;
        }

        .panelTitle h2 {
          margin: 0;
          font-size: 21px;
        }

        .panelTitle p {
          margin: 3px 0 0;
          color: #888;
          font-size: 12px;
        }

        .closeButton {
          border: 0;
          background: #f5f2f6;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
        }

        .authBox {
          max-width: 450px;
          margin: auto;
        }

        .authBox h2 {
          text-align: center;
          margin-bottom: 8px;
        }

        .authBox > p {
          text-align: center;
          color: #888;
          font-size: 13px;
        }

        .authForm {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        .authForm label,
        .productForm label,
        .profileFields label {
          font-size: 12px;
          font-weight: 800;
          color: #555;
        }

        .authForm input,
        .productForm input,
        .productForm select,
        .productForm textarea,
        .profileInput {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e7e1ea;
          border-radius: 12px;
          padding: 12px;
          outline: none;
          font-size: 14px;
        }

        .authForm input:focus,
        .productForm input:focus,
        .productForm textarea:focus,
        .profileInput:focus {
          border-color: #c78adf;
        }

        .featurePrimary,
        .featureSecondary {
          border: 0;
          border-radius: 12px;
          padding: 12px 17px;
          font-weight: 800;
          cursor: pointer;
        }

        .featurePrimary {
          background: linear-gradient(135deg, #f43f5e, #8b5cf6);
          color: white;
        }

        .featurePrimary:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .featureSecondary {
          background: #f6f2f7;
          color: #5e5264;
        }

        .authSwitch {
          border: 0;
          background: transparent;
          color: #8b5cf6;
          font-weight: 800;
          cursor: pointer;
        }

        .authMessage,
        .successMessage {
          padding: 12px;
          border-radius: 12px;
          background: #f8f3fb;
          color: #6b4d78;
          margin-top: 12px;
          font-size: 13px;
        }

        .emptyFeature,
        .ordersContent {
          text-align: center;
          padding: 30px 15px;
        }

        .emptyBig,
        .ordersEmptyIcon {
          font-size: 55px;
          margin-bottom: 10px;
        }

        .emptyFeature h3,
        .ordersContent h3 {
          margin: 8px 0;
        }

        .emptyFeature p,
        .ordersContent p {
          color: #888;
          font-size: 13px;
          max-width: 420px;
          margin: 0 auto 18px;
          line-height: 1.6;
        }

        .emptyFeature button {
          margin: 4px;
        }

        .profileContent {
          max-width: 470px;
          margin: auto;
          text-align: center;
        }

        .profileAvatarLarge {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          margin: 0 auto 20px;
          border-radius: 50%;
          color: white;
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, #f43f5e, #8b5cf6);
        }

        .profileFields {
          display: grid;
          gap: 8px;
          text-align: left;
        }

        .profileValue {
          padding: 13px;
          border-radius: 12px;
          background: #f8f6f9;
          margin-bottom: 10px;
        }

        .profileButtons {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .profileButtons button {
          flex: 1;
        }

        .logoutButton {
          margin-top: 15px;
          border: 0;
          background: transparent;
          color: #e54861;
          font-weight: 800;
          cursor: pointer;
        }

        .ordersList {
          display: grid;
          gap: 10px;
          text-align: left;
        }

        .orderCard,
        .sellerProductCard,
        .cartItem {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #eee9f0;
          border-radius: 15px;
          padding: 13px;
        }

        .orderIcon {
          font-size: 30px;
        }

        .orderInfo span {
          font-size: 9px;
          color: #999;
        }

        .orderInfo h3 {
          margin: 3px 0;
        }

        .orderInfo p {
          margin: 0;
        }

        .productForm {
          display: grid;
          gap: 8px;
        }

        .productForm h3 {
          margin-bottom: 5px;
        }

        .productFormButtons {
          display: flex;
          gap: 8px;
          margin-top: 7px;
        }

        .productFormButtons button {
          flex: 1;
        }

        .sellerProductList {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .sellerProductCard {
          justify-content: space-between;
        }

        .sellerProductCard div {
          display: grid;
          gap: 4px;
        }

        .sellerProductCard span,
        .sellerProductCard small {
          color: #888;
        }

        .deleteProductButton {
          border: 0;
          background: #fff0f2;
          color: #d94359;
          padding: 8px 10px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .deleteProductButton:disabled {
          opacity: .5;
        }

        .panelProductGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        .cartPanel {
          display: grid;
          gap: 10px;
        }

        .cartItem > span {
          font-size: 32px;
        }

        .cartItem div {
          flex: 1;
          display: grid;
          gap: 4px;
        }

        .cartItem small {
          color: #888;
        }

        .cartItem > button {
          border: 0;
          background: #f5f2f6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
        }

        .cartTotal {
          display: flex;
          justify-content: space-between;
          padding: 14px 2px;
          border-top: 1px solid #eee9f0;
          margin-top: 5px;
        }

        .menuDrawer {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(30,20,35,.35);
        }

        .menuContent {
          width: min(330px, 88%);
          height: 100%;
          background: white;
          padding: 25px 20px;
          box-shadow: 10px 0 35px rgba(0,0,0,.12);
        }

        .menuContent h2 {
          margin-top: 10px;
        }

        .menuItem {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          background: transparent;
          padding: 14px 8px;
          border-radius: 12px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .menuItem:hover {
          background: #f8f5f9;
        }

        @media (max-width: 800px) {
          .categoryRow {
            grid-template-columns: repeat(3, 1fr);
          }

          .productGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .headerTop {
            height: 82px;
            padding: 8px 10px;
          }

          .brandName {
            font-size: 27px;
          }

          .brandTagline {
            font-size: 9px;
          }

          .iconHeaderButton {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }

          .mainHome {
            padding: 12px 12px 30px;
          }

          .quickCards {
            grid-template-columns: 1fr;
          }

          .categoryRow {
            display: flex;
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .categoryCard {
            min-width: 105px;
          }

          .offerText {
            max-width: 72%;
          }

          .offerText h2 {
            font-size: 20px;
          }

          .offerVisual {
            position: absolute;
            right: 12px;
            opacity: .35;
            font-size: 34px;
          }

          .productGrid,
          .panelProductGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .shopProductImage {
            height: 135px;
          }

          .shopProductImage > span:first-child {
            font-size: 52px;
          }

          .trustStrip {
            grid-template-columns: 1fr;
          }

          .bottomNav button {
            min-width: 59px;
          }

          .bottomNav .sellButton {
            min-width: 67px;
          }

          .supportButton {
            right: 12px;
            bottom: 87px;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <header className="shoraHeader">
        <div className="headerTop">
          <div className="headerSide">
            <button
              type="button"
              className="iconHeaderButton"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </div>

          <div
            className="brand"
            onClick={() => goTo("inicio")}
          >
            <div className="brandName">
              <span className="brandShora">Shora</span>{" "}
              <span className="brandShop">Shop</span>
            </div>

            <div className="brandTagline">
              <span className="tagBuy">Compra</span>,{" "}
              <span className="tagSell">Vende</span> y{" "}
              <span className="tagDiscover">Descubre</span>
            </div>
          </div>

          <div className="headerSide right">
            <button
              type="button"
              className="iconHeaderButton"
              onClick={() => openPanel("messages")}
              aria-label="Ayuda y mensajes"
            >
              🔔
            </button>

            <button
              type="button"
              className="iconHeaderButton"
              onClick={() => openPanel("cart")}
              aria-label="Carrito"
            >
              🛒
            </button>
          </div>
        </div>
      </header>

      {/* INICIO */}
      <main id="inicio" className="mainHome">
        <div className="searchBox">
          <div className="searchInner">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="¿Qué estás pensando comprar hoy?"
            />

            <span className="searchIcon">🔍</span>
          </div>
        </div>

        <div className="quickCards">
          <button
            type="button"
            className="quickCard"
            onClick={() => openPanel("products")}
          >
            <div className="quickCardLeft">
              <div className="quickIcon">🏪</div>

              <div>
                <h3>Vende en ShoraShop</h3>
                <p>Vende tus productos de forma fácil</p>
              </div>
            </div>

            <span className="quickArrow">→</span>
          </button>

          <button
            type="button"
            className="quickCard"
            onClick={openAccount}
          >
            <div className="quickCardLeft">
              <div className="quickIcon">👤</div>

              <div>
                <h3>Mi cuenta</h3>

                <p>
                  {user
                    ? `Hola, ${profileName || "usuario"}`
                    : "Hola, crea tu cuenta"}
                </p>
              </div>
            </div>

            <span className="quickArrow">→</span>
          </button>
        </div>

        <section id="categorias">
          <div className="sectionHeader">
            <h2>Categorías</h2>

            <button
              type="button"
              onClick={() => setSearch("")}
            >
              Ver todas →
            </button>
          </div>

          <div className="categoryRow">
            {categories.map((category) => (
              <button
                type="button"
                className="categoryCard"
                key={category.name}
                onClick={() => {
                  setSearch(category.name);
                  setTimeout(() => {
                    document
                      .getElementById("productos")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }, 50);
                }}
              >
                <span className="categoryEmoji">
                  {category.icon}
                </span>

                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="offerCarousel">
            <div className="offerContent">
              <div className="offerText">
                <h2>
                  {offerSlide === 0 &&
                    "Ofertas exclusivas"}
                  {offerSlide === 1 &&
                    "Descuentos increíbles"}
                  {offerSlide === 2 &&
                    "Encuentra lo que buscas"}
                </h2>

                <p>
                  {offerSlide === 0 &&
                    "Productos que valen la pena, precios que te van a sorprender."}
                  {offerSlide === 1 &&
                    "Aprovecha nuestras promociones antes de que cambien."}
                  {offerSlide === 2 &&
                    "Compra, descubre y encuentra nuevos productos cada día."}
                </p>

                <button
                  type="button"
                  className="offerButton"
                  onClick={() => goTo("productos")}
                >
                  Ver ofertas
                </button>
              </div>

              <div className="offerVisual">
                🛍️ 🎧 ⌚
                <span className="offerPercent">-50%</span>
              </div>
            </div>

            <div className="dots">
              {[0, 1, 2].map((dot) => (
                <button
                  type="button"
                  key={dot}
                  className={`dot ${
                    offerSlide === dot ? "active" : ""
                  }`}
                  onClick={() => setOfferSlide(dot)}
                  aria-label={`Oferta ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="productos">
          <div className="sectionHeader">
            <h2>Productos destacados</h2>

            <button
              type="button"
              onClick={() => setSearch("")}
            >
              Ver todos →
            </button>
          </div>

          <div className="productGrid">
            {searchProducts.slice(0, 4).map(renderProductCard)}
          </div>

          {searchProducts.length === 0 && (
            <div className="emptyFeature">
              <div className="emptyBig">🔎</div>

              <h3>No encontramos productos</h3>

              <p>
                Intenta buscar con otro nombre o categoría.
              </p>

              <button
                type="button"
                className="featurePrimary"
                onClick={() => setSearch("")}
              >
                Ver todos
              </button>
            </div>
          )}
        </section>

        <section className="trustStrip">
          <div className="trustItem">
            <span>🔒</span>
            Protegemos tus datos y compras
          </div>

          <div className="trustItem">
            <span>🚚</span>
            Envíos rápidos en tiempo récord
          </div>

          <div className="trustItem">
            <span>🤝</span>
            Vendedores y compradores 24/7
          </div>
        </section>
      </main>

      {/* SOPORTE */}
      <button
        type="button"
        className="supportButton"
        onClick={() => openPanel("messages")}
      >
        💬 Ayuda
      </button>

      {/* BARRA INFERIOR */}
      <nav className="bottomNav">
        <button
          type="button"
          onClick={() => goTo("inicio")}
        >
          <span>⌂</span>
          Inicio
        </button>

        <button
          type="button"
          onClick={() => goTo("categorias")}
        >
          <span>▦</span>
          Categorías
        </button>

        <button
          type="button"
          className="sellButton"
          onClick={() => openPanel("products")}
        >
          <span>🏪</span>
          Vender
        </button>

        <button
          type="button"
          onClick={() => openPanel("favorites")}
        >
          <span>♡</span>
          Favoritos
        </button>

        <button
          type="button"
          onClick={openAccount}
        >
          <span>♙</span>
          Cuenta
        </button>
      </nav>

      {/* MENÚ */}
      {menuOpen && (
        <div
          className="menuDrawer"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="menuContent"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="closeButton"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>

            <h2>Menú</h2>

            <button
              type="button"
              className="menuItem"
              onClick={() => goTo("inicio")}
            >
              🏠 Inicio
            </button>

            <button
              type="button"
              className="menuItem"
              onClick={() => goTo("categorias")}
            >
              🗂️ Categorías
            </button>

            <button
              type="button"
              className="menuItem"
              onClick={() => openPanel("orders")}
            >
              📦 Mis pedidos
            </button>

            <button
              type="button"
              className="menuItem"
              onClick={() => openPanel("products")}
            >
              🛍️ Mis productos
            </button>

            <button
              type="button"
              className="menuItem"
              onClick={() => openPanel("favorites")}
            >
              ❤️ Favoritos
            </button>

            <button
              type="button"
              className="menuItem"
              onClick={() => openPanel("settings")}
            >
              ⚙️ Configuración
            </button>

            {!user && (
              <button
                type="button"
                className="menuItem"
                onClick={() => openAuth("login")}
              >
                🔐 Iniciar sesión
              </button>
            )}

            {user && (
              <button
                type="button"
                className="menuItem"
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}

      {/* CUENTA */}
      {showAccount && (
        <div
          className="overlay"
          onClick={closePanels}
        >
          <div
            className="panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panelHeader">
              <div className="panelTitle">
                <span className="panelTitleIcon">👤</span>

                <div>
                  <h2>Mi cuenta</h2>

                  <p>
                    {user
                      ? `Hola, ${profileName || "usuario"}`
                      : "Entra a tu cuenta de SHORASHOPP"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={closePanels}
              >
                ×
              </button>
            </div>

            {user ? (
              <div className="accountMenu">
                <button
                  type="button"
                  className="menuItem"
                  onClick={() => openPanel("profile")}
                >
                  👤 Mi perfil
                </button>

                <button
                  type="button"
                  className="menuItem"
                  onClick={() => openPanel("orders")}
                >
                  📦 Mis pedidos
                </button>

                <button
                  type="button"
                  className="menuItem"
                  onClick={() => openPanel("products")}
                >
                  🛍️ Mis productos
                </button>

                <button
                  type="button"
                  className="menuItem"
                  onClick={() => openPanel("favorites")}
                >
                  ❤️ Favoritos
                </button>

                <button
                  type="button"
                  className="menuItem"
                  onClick={() => openPanel("settings")}
                >
                  ⚙️ Configuración
                </button>

                <button
                  type="button"
                  className="logoutButton"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="emptyFeature">
                <div className="emptyBig">👋</div>

                <h3>¡Bienvenido a SHORASHOPP!</h3>

                <p>
                  Compra, vende y descubre productos.
                  Puedes explorar la tienda antes de crear
                  tu cuenta.
                </p>

                <button
                  type="button"
                  className="featurePrimary"
                  onClick={() => openAuth("register")}
                >
                  Crear una cuenta
                </button>

                <button
                  type="button"
                  className="featureSecondary"
                  onClick={() => openAuth("login")}
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTENTICACIÓN */}
      {showAuth && (
        <div
          className="overlay"
          onClick={closePanels}
        >
          <div
            className="panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panelHeader">
              <div className="panelTitle">
                <span className="panelTitleIcon">✨</span>

                <div>
                  <h2>
                    {authMode === "login"
                      ? "Iniciar sesión"
                      : "Crear tu cuenta"}
                  </h2>

                  <p>Tu espacio en SHORASHOPP</p>
                </div>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={closePanels}
              >
                ×
              </button>
            </div>

            <div className="authBox">
              <form
                className="authForm"
                onSubmit={handleAuth}
              >
                {authMode === "register" && (
                  <>
                    <label>Nombre completo</label>

                    <input
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="Tu nombre"
                      required
                    />
                  </>
                )}

                <label>Correo electrónico</label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  required
                />

                <label>Contraseña</label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Tu contraseña"
                  required
                  minLength={6}
                />

                <button
                  type="submit"
                  className="featurePrimary"
                  disabled={loading}
                >
                  {loading
                    ? "Espera..."
                    : authMode === "login"
                    ? "Entrar a SHORASHOPP"
                    : "Crear mi cuenta"}
                </button>
              </form>

              {message && (
                <div className="authMessage">
                  {message}
                </div>
              )}

              <p
                style={{
                  textAlign: "center",
                  marginTop: 18,
                }}
              >
                {authMode === "login"
                  ? "¿Todavía no tienes cuenta? "
                  : "¿Ya tienes una cuenta? "}

                <button
                  type="button"
                  className="authSwitch"
                  onClick={() => {
                    setMessage("");

                    setAuthMode(
                      authMode === "login"
                        ? "register"
                        : "login"
                    );
                  }}
                >
                  {authMode === "login"
                    ? "Crear cuenta"
                    : "Iniciar sesión"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PANEL GENERAL */}
      {activePanel && (
        <div
          className="overlay"
          onClick={closePanels}
        >
          <div
            className="panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panelHeader">
              <div className="panelTitle">
                <span className="panelTitleIcon">
                  {currentPanel?.icon || "✨"}
                </span>

                <div>
                  <h2>
                    {currentPanel?.title ||
                      "SHORASHOPP"}
                  </h2>

                  <p>
                    {currentPanel?.subtitle ||
                      "Compra, vende y descubre."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={closePanels}
              >
                ×
              </button>
            </div>

            {renderActivePanel()}
          </div>
        </div>
      )}
    </div>
  );
}
