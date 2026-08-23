import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";
const categories = [
  { icon: "👕", name: "Ropa y Moda" },
  { icon: "📱", name: "Tecnología" },
  { icon: "🏠", name: "Hogar y Vida" },
  { icon: "💄", name: "Belleza y Salud" },
  { icon: "🎧", name: "Accesorios" },
  { icon: "🎮", name: "Juguetes y Más" },
  { icon: "🚗", name: "Autos y Motos" },
  { icon: "🍔", name: "Comida local" },
  { icon: "🐶", name: "Mascotas" },
  { icon: "⚽", name: "Deportes" },
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
    sellerName: "Tech Market",
    sellerRating: "4.9",
    shipping: "Envío gratis a partir de $499 MXN",
    delivery: "Entrega estimada de 2 a 5 días",
    specifications: [
      ["Conectividad", "Bluetooth"],
      ["Autonomía", "Hasta 6 horas"],
      ["Estuche", "Carga USB-C"],
      ["Garantía", "30 días"],
    ],
    variants: ["Negro", "Blanco"],
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
      "Bolsa de hombro elegante para uso diario, con compartimentos interiores.",
    stock: 8,
    sku: "DEMO-BAG",
    image_url: "",
    images: [],
    status: "approved",
    demo: true,
    sellerName: "Tienda SHORA",
    sellerRating: "4.8",
    shipping: "Envío calculado al finalizar",
    delivery: "Entrega estimada de 3 a 6 días",
    specifications: [
      ["Material", "Sintético premium"],
      ["Cierre", "Cremallera"],
      ["Compartimentos", "3"],
      ["Uso", "Hombro"],
    ],
    variants: ["Negro", "Rosa", "Beige"],
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
    sellerName: "Tech Market",
    sellerRating: "4.9",
    shipping: "Envío gratis",
    delivery: "Entrega estimada de 2 a 4 días",
    specifications: [
      ["Pantalla", "Táctil"],
      ["Conectividad", "Bluetooth"],
      ["Funciones", "Actividad y notificaciones"],
      ["Carga", "Magnética"],
    ],
    variants: ["Negro", "Azul"],
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
    sellerName: "Casa Moderna",
    sellerRating: "4.7",
    shipping: "Envío calculado al finalizar",
    delivery: "Entrega estimada de 3 a 7 días",
    specifications: [
      ["Potencia", "1000 W"],
      ["Vaso", "1.5 L"],
      ["Velocidades", "Variable"],
      ["Material", "Acero y plástico"],
    ],
    variants: ["Negro"],
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
const normalizeProduct = (p) => ({
  ...p,
  id: p.id ?? crypto.randomUUID(),
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
  description:
    p.description || "Producto publicado en SHORASHOPP.",
  sellerName:
    p.sellerName ||
    p.seller_name ||
    "Vendedor SHORASHOPP",
  sellerRating:
    p.sellerRating ||
    p.seller_rating ||
    "4.8",
  shipping:
    p.shipping ||
    "Envío calculado al finalizar",
  delivery:
    p.delivery ||
    "Consulta la fecha disponible al comprar",
  reviews:
    p.reviews ||
    "Producto publicado",
});
const slugify = (text) =>
  text
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
  // Código de verificación enviado por correo
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationPending, setVerificationPending] =
    useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [products, setProducts] = useState(demoProducts);
  const [productsLoading, setProductsLoading] =
    useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [selectedVariant, setSelectedVariant] =
    useState("");
  const [sellerStore, setSellerStore] = useState(null);
  const [sellerLoading, setSellerLoading] =
    useState(false);
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
  const [publishLoading, setPublishLoading] =
    useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    reference: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] =
    useState([]);
  const [selectedOrder, setSelectedOrder] =
    useState(null);
  const [orderPlaced, setOrderPlaced] =
    useState(false);
  const [questionText, setQuestionText] =
    useState("");
  const [questions, setQuestions] =
    useState([]);
  useEffect(() => {
    let mounted = true;
    const initializeAuth = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();
        if (!mounted) return;
        if (!error) {
          setSession(data?.session ?? null);
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
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setAuthReady(true);
      }
    );
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
        .order("created_at", {
          ascending: false,
        });
      if (
        !error &&
        Array.isArray(data) &&
        data.length
      ) {
        setProducts(
          data.map(normalizeProduct)
        );
      } else {
        setProducts(
          demoProducts.map(normalizeProduct)
        );
      }
    } catch {
      setProducts(
        demoProducts.map(normalizeProduct)
      );
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
  const showActionMessage = (text) => {
    setActionMessage(text);
    window.clearTimeout(
      window.__shoraMessageTimer
    );
    window.__shoraMessageTimer =
      window.setTimeout(
        () => setActionMessage(""),
        2600
      );
  };
  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setVerificationPending(false);
    setVerificationCode("");
    setShowAuth(true);
  };
  const closeAuth = () => {
    setShowAuth(false);
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setVerificationPending(false);
  };
  const handleAccountAccess = () => {
    if (session) {
      openPage("account");
    } else {
      openAuth("login");
    }
  };  const handleAuth = async (event) => {
    event.preventDefault();
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setMessage(
        "Escribe tu correo electrónico y contraseña."
      );
      return;
    }
    setLoading(true);
    try {
      if (authMode === "register") {
        if (!name.trim()) {
          throw new Error(
            "Escribe tu nombre completo."
          );
        }
        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: name.trim(),
              },
            },
          });
        if (error) throw error;
        /*
          Si Supabase devuelve una sesión inmediatamente,
          el correo no necesita confirmación.
        */
        if (data?.session) {
          setMessage(
            "Tu cuenta fue creada correctamente."
          );
          closeAuth();
          openPage("account");
          return;
        }
        /*
          Si no hay sesión, esperamos el código
          que Supabase envió al correo.
        */
        setVerificationPending(true);
        setVerificationCode("");
        setMessage(
          "Te enviamos un código de verificación de 6 dígitos a tu correo electrónico."
        );
        return;
      }
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      if (error) throw error;
      if (data?.session) {
        closeAuth();
        openPage("account");
        showActionMessage(
          "Sesión iniciada correctamente."
        );
      }
    } catch (error) {
      console.error(
        "Error de autenticación:",
        error
      );
      setMessage(
        error?.message ||
          "No pudimos completar la operación."
      );
    } finally {
      setLoading(false);
    }
  };
  const verifySignupCode = async (event) => {
    event.preventDefault();
     const openSellerStore = async (sellerId, sellerName) => {
    setSellerLoading(true);
    try {
      let store = null;
      if (sellerId) {
        const { data, error } =
          await supabase
            .from("seller_stores")
            .select("*")
            .eq("owner_id", sellerId)
            .limit(1)
            .maybeSingle();
        if (!error) {
          store = data;
        }
      }
      setSellerStore(
        store || {
          owner_id: sellerId || "",
          store_name:
            sellerName ||
            "Tienda SHORASHOPP",
          description:
            "Tienda de vendedor dentro de SHORASHOPP.",
          rating: "4.8",
        }
      );
      openPage("seller-store");
    } catch (error) {
      console.error(
        "Error al abrir tienda:",
        error
      );
      setSellerStore({
        owner_id: sellerId || "",
        store_name:
          sellerName ||
          "Tienda SHORASHOPP",
        description:
          "Tienda de vendedor dentro de SHORASHOPP.",
        rating: "4.8",
      });
      openPage("seller-store");
    } finally {
      setSellerLoading(false);
    }
  };
  const saveAddress = () => {
    if (
      !addressForm.name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.street.trim() ||
      !addressForm.city.trim() ||
      !addressForm.postalCode.trim()
    ) {
      showActionMessage(
        "Completa los datos principales de la dirección."
      );
      return;
    }
    const newAddress = {
      id: crypto.randomUUID(),
      ...addressForm,
    };
    setAddresses((current) => [
      ...current,
      newAddress,
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
    showActionMessage(
      "Dirección guardada."
    );
  };
  const removeAddress = (id) => {
    setAddresses((current) =>
      current.filter(
        (address) =>
          address.id !== id
      )
    );
    showActionMessage(
      "Dirección eliminada."
    );
  };
  const savePaymentMethod = () => {
    const newPayment = {
      id: crypto.randomUUID(),
      type: "Tarjeta",
      last4: "0000",
      label: "Tarjeta terminada en 0000",
    };
    setPaymentMethods((current) => [
      ...current,
      newPayment,
    ]);
    showActionMessage(
      "Método de pago guardado."
    );
  };
  const removePaymentMethod = (id) => {
    setPaymentMethods((current) =>
      current.filter(
        (payment) =>
          payment.id !== id
      )
    );
    showActionMessage(
      "Método de pago eliminado."
    );
  };
  const submitQuestion = () => {
    if (!questionText.trim()) {
      showActionMessage(
        "Escribe tu pregunta."
      );
      return;
    }
    setQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text: questionText.trim(),
        createdAt:
          new Date().toISOString(),
      },
    ]);
    setQuestionText("");
    showActionMessage(
      "Pregunta enviada."
    );
  };
  const renderSimplePage = (
    title,
    icon,
    description,
    actions = []
  ) => (
    <PageShell
      title={title}
      onBack={() =>
        openPage("account")
      }
    >
      <div className="simple-page-card">
        <div className="simple-page-icon">
          {icon}
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        {actions.length > 0 && (
          <div className="simple-actions">
            {actions.map(
              (action, index) => (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  style={cardButtonStyle}
                  onClick={
                    action.onClick
                  }
                >
                   const renderCart = () => (
    <PageShell
      title="Mi carrito"
      onBack={goHome}
    >
      {!cart.length ? (
        <div className="empty-card">
          <div>🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>
            Agrega productos para comenzar tu
            compra.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={goHome}
          >
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cart.map((item) => (
              <div
                className="cart-item"
                key={`${item.id}-${item.variant || ""}`}
              >
                <div className="cart-item-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                    />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <small>
                    {item.sellerName}
                  </small>
                  {item.variant && (
                    <small>
                      Opción: {item.variant}
                    </small>
                  )}
                  <b>
                    {money(item.price)}
                  </b>
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          item.variant,
                          -1
                        )
                      }
                    >
                      −
                    </button>
                    <strong>
                      {item.quantity}
                    </strong>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          item.variant,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.variant
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
                <strong className="cart-item-total">
                  {money(
                    Number(item.price) *
                      Number(item.quantity)
                  )}
                </strong>
              </div>
            ))}
          </section>
          <aside className="cart-summary">
            <h2>
              Resumen de compra
            </h2>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>
                {money(cartTotal)}
              </strong>
            </div>
            <div className="summary-line">
              <span>Envío</span>
              <span>
                Se calcula al pagar
              </span>
            </div>
            <hr />
            <div className="summary-total">
              <span>Total</span>
              <strong>
                {money(cartTotal)}
              </strong>
            </div>
            <button
              type="button"
              className="primary-button full-button"
              onClick={startCheckout}
            >
              Continuar al pago
            </button>
            <p className="secure-text">
              🔒 Compra segura en
              SHORASHOPP
            </p>
          </aside>
        </div>
      )}
    </PageShell>
  );
  const renderCheckout = () => (
    <PageShell
      title="Finalizar compra"
      onBack={() => openPage("cart")}
    >
      {!checkoutItems.length ? (
        <div className="empty-card">
          <div>🛒</div>
          <h2>
            No hay productos para comprar
          </h2>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              openPage("cart")
            }
          >
            Regresar al carrito
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          <section className="checkout-main">
            <div className="checkout-card">
              <div className="checkout-step">
                <span>1</span>
                <div>
                  <h2>
                    Información de envío
                  </h2>
                  <p>
                    Selecciona o agrega la
                    dirección donde recibirás
                    tu pedido.
                  </p>
                </div>
              </div>
              {addresses.length > 0 && (
                <div className="saved-addresses">
                  {addresses.map(
                    (address) => (
                      <div
                        className="saved-address"
                        key={
                          address.id
                        }
                      >
                        <strong>
                          {address.name}
                        </strong>
                        <span>
                          {address.street},{" "}
                          {address.city},{" "}
                          {address.state}
                        </span>
                        <span>
                          CP{" "}
                          {
                            address.postalCode
                          }{" "}
                          ·{" "}
                          {address.phone}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
              <div className="address-form">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={
                    addressForm.name
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        name:
                          e.target.value,
                      })
                    )
                  }
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={
                    addressForm.phone
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        phone:
                          e.target.value,
                      })
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Calle y número"
                  value={
                    addressForm.street
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        street:
                          e.target.value,
                      })
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={
                    addressForm.city
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        city:
                          e.target.value,
                      })
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Estado"
                  value={
                    addressForm.state
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        state:
                          e.target.value,
                      })
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Código postal"
                  value={
                    addressForm.postalCode
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        postalCode:
                          e.target.value,
                      })
                    )
                  }
                />
                <textarea
                  placeholder="Referencia"
                  value={
                    addressForm.reference
                  }
                  onChange={(e) =>
                    setAddressForm(
                      (current) => ({
                        ...current,
                        reference:
                          e.target.value,
                      })
                    )
                  }
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    saveAddress
                  }
                >
                  Guardar dirección
                </button>
              </div>
            </div>
            <div className="checkout-card">
              <div className="checkout-step">
                <span>2</span>
                <div>
                  <h2>
                    Método de pago
                  </h2>
                  <p>
                    Selecciona cómo deseas
                    pagar tu compra.
                  </p>
                </div>
              </div>
              <div className="payment-options">
                <button
                  type="button"
                  className="payment-option active"
                  onClick={
                    savePaymentMethod
                  }
                >
                  <span>
                    💳
                  </span>
                  <div>
                    <strong>
                      Mercado Pago
                    </strong>
                    <small>
                      Pago seguro
                      para tu compra
                    </small>
                  </div>
                  <b>›</b>
                </button>
                {paymentMethods.map(
                  (payment) => (
                    <div
                      className="saved-payment"
                      key={
                        payment.id
                      }
                    >
                      <div>
                        <strong>
                          💳{" "}
                          {payment.label}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removePaymentMethod(
                            payment.id
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="checkout-card">
              <div className="checkout-step">
                <span>3</span>
                <div>
                  <h2>
                    Tus productos
                  </h2>
                  <p>
                    Revisa los artículos
                    antes de confirmar.
                  </p>
                </div>
              </div>
              <div className="checkout-items">
                {checkoutItems.map(
                  (item) => (
                    <div
                      className="checkout-item"
                      key={`${item.id}-${item.variant || ""}`}
                    >
                      <div className="checkout-item-image">
                        {item.image_url ? (
                          <img
                            src={
                              item.image_url
                            }
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          "🛍️"
                        )}
                      </div>
                      <div>
                        <strong>
                          {item.name}
                        </strong>
                        <small>
                          Cantidad:{" "}
                          {
                            item.quantity
                          }
                        </small>
                        {item.variant && (
                          <small>
                            Opción:{" "}
                            {
                              item.variant
                            }
                          </small>
                        )}
                      </div>
                      <b>
                        {money(
                          Number(
                            item.price
                          ) *
                            Number(
                              item.quantity
                            )
                        )}
                      </b>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
          <aside className="cart-summary checkout-summary">
            <h2>
              Resumen
            </h2>
            <div className="summary-line">
              <span>Productos</span>
              <strong>
                {money(
                  checkoutTotal
                )}
              </strong>
            </div>
            <div className="summary-line">
              <span>Envío</span>
              <span>
                Se calcula según
                vendedor
              </span>
            </div>
            <hr />
            <div className="summary-total">
              <span>Total</span>
              <strong>
                {money(
                  checkoutTotal
                )}
              </strong>
            </div>
            <button
              type="button"
              className="primary-button full-button"
              disabled={loading}
              onClick={
                placeOrder
              }
            >
              {loading
                ? "Procesando..."
                : "Confirmar compra"}
            </button>
            <p className="secure-text">
              🔒 Compra segura en
              SHORASHOPP
            </p>
          </aside>
        </div>
      )}
    </PageShell>
  );
  const renderConfirmation = () => (
    <PageShell
      title="Compra realizada"
      onBack={goHome}
    >
      <div className="confirmation-card">
        <div className="confirmation-icon">
          ✓
        </div>
        <h1>
          ¡Gracias por tu compra!
        </h1>
        <p>
          Tu pedido fue registrado
          correctamente.
        </p>
        {selectedOrder && (
          <div className="order-number">
            <span>
              Número de pedido
            </span>
            <strong>
              {selectedOrder.id}
            </strong>
          </div>
        )}
        <div className="confirmation-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              openPage("orders")
            }
          >
            Ver mis pedidos
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={goHome}
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </PageShell>
  );
  const renderAccount = () => {
    const userName =
      session?.user?.user_metadata
        ?.full_name ||
      session?.user?.email ||
      "Usuario SHORASHOPP";
    return (
      <PageShell
        title="Mi cuenta"
        onBack={goHome}
      >
        <div className="account-header">
          <div className="account-avatar">
            ✨
          </div>
          <div>
            <span>
              Hola,
            </span>
            <h2>
              {userName}
            </h2>
            <small>
              {session?.user?.email ||
                ""}
            </small>
          </div>
        </div>
        <div className="account-grid">
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("profile")
            }
          >
            <span>👤</span>
            <strong>Mi perfil</strong>
            <small>
              Datos personales
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("orders")
            }
          >
            <span>📦</span>
            <strong>Mis pedidos</strong>
            <small>
              Compras y entregas
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("favorites")
            }
          >
            <span>❤️</span>
            <strong>Favoritos</strong>
            <small>
              Productos guardados
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("addresses")
            }
          >
            <span>📍</span>
            <strong>Direcciones</strong>
            <small>
              Tus lugares de entrega
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("payments")
            }
          >
            <span>💳</span>
            <strong>Pagos</strong>
            <small>
              Métodos de pago
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("seller")
            }
          >
            <span>🏪</span>
            <strong>
              Mi tienda
            </strong>
            <small>
              Vende en SHORASHOPP
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("credit")
            }
          >
            <span>💰</span>
            <strong>
              Crédito SHORASHOPP
            </strong>
            <small>
              Solicita crédito para comprar
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("referrals")
            }
          >
            <span>🎁</span>
            <strong>
              Referidos
            </strong>
            <small>
              Invita y gana beneficios
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("settings")
            }
          >
            <span>⚙️</span>
            <strong>
              Configuración
            </strong>
            <small>
              Preferencias de tu cuenta
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("privacy")
            }
          >
            <span>🔐</span>
            <strong>
              Privacidad y seguridad
            </strong>
            <small>
              Protege tu cuenta
            </small>
          </button>
          <button
            type="button"
            className="account-card-option"
            onClick={() =>
              openPage("support")
            }
          >
            <span>💬</span>
            <strong>
              Ayuda y soporte
            </strong>
            <small>
              Estamos para ayudarte
            </small>
          </button>
        </div>
        <button
          type="button"
          className="logout-button"
          onClick={
            handleLogout
          }
          disabled={loading}
        >
          {loading
            ? "Cerrando..."
            : "Cerrar sesión"}
        </button>
      </PageShell>
    );
  };  const renderProfile = () => (
    <PageShell
      title="Mi perfil"
      onBack={() => openPage("account")}
    >
      <div className="settings-card">
        <div className="profile-large-avatar">
          ✨
        </div>
        <div className="profile-info">
          <label>Nombre</label>
          <strong>
            {session?.user?.user_metadata
              ?.full_name ||
              "Usuario SHORASHOPP"}
          </strong>
        </div>
        <div className="profile-info">
          <label>Correo electrónico</label>
          <strong>
            {session?.user?.email ||
              "No disponible"}
          </strong>
        </div>
        <div className="profile-info">
          <label>Cuenta</label>
          <strong>
            Cuenta de comprador y vendedor
          </strong>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            showActionMessage(
              "La edición del perfil se conectará aquí."
            )
          }
        >
          Editar perfil
        </button>
      </div>
    </PageShell>
  );
  const renderOrders = () => (
    <PageShell
      title="Mis pedidos"
      onBack={() => openPage("account")}
    >
      {selectedOrder ? (
        <div className="order-card">
          <div className="order-header">
            <div>
              <span>
                Pedido
              </span>
              <strong>
                {selectedOrder.id}
              </strong>
            </div>
            <span className="status-badge">
              Registrado
            </span>
          </div>
          <div className="order-items">
            {selectedOrder.items.map(
              (item) => (
                <div
                  className="order-item"
                  key={`${item.id}-${item.variant || ""}`}
                >
                  <span>
                    {item.name}
                  </span>
                  <strong>
                    {item.quantity} ×{" "}
                    {money(
                      item.price
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
          <div className="order-total">
            <span>Total</span>
            <strong>
              {money(
                selectedOrder.total
              )}
            </strong>
          </div>
        </div>
      ) : (
        <div className="empty-card">
          <div>📦</div>
          <h2>
            Todavía no tienes pedidos
          </h2>
          <p>
            Cuando hagas una compra,
            aparecerá aquí.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={goHome}
          >
            Comprar ahora
          </button>
        </div>
      )}
    </PageShell>
  );
  const renderFavorites = () => {
    const favoriteProducts =
      products.filter((product) =>
        favorites.includes(product.id)
      );
    return (
      <PageShell
        title="Mis favoritos"
        onBack={() => openPage("account")}
      >
        {!favoriteProducts.length ? (
          <div className="empty-card">
            <div>❤️</div>
            <h2>
              No tienes favoritos
            </h2>
            <p>
              Guarda los productos que te
              gusten para encontrarlos
              fácilmente.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={goHome}
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {favoriteProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite
                  onFavorite={() =>
                    toggleFavorite(
                      product.id
                    )
                  }
                  onClick={() =>
                    openProduct(
                      product
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </PageShell>
    );
  };
  const renderAddresses = () => (
    <PageShell
      title="Mis direcciones"
      onBack={() => openPage("account")}
    >
      <div className="settings-card">
        <h2>
          Agregar dirección
        </h2>
        <div className="address-form">
          <input
            type="text"
            placeholder="Nombre completo"
            value={addressForm.name}
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  name:
                    e.target.value,
                })
              )
            }
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={
              addressForm.phone
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  phone:
                    e.target.value,
                })
              )
            }
          />
          <input
            type="text"
            placeholder="Calle y número"
            value={
              addressForm.street
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  street:
                    e.target.value,
                })
              )
            }
          />
          <input
            type="text"
            placeholder="Ciudad"
            value={
              addressForm.city
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  city:
                    e.target.value,
                })
              )
            }
          />
          <input
            type="text"
            placeholder="Estado"
            value={
              addressForm.state
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  state:
                    e.target.value,
                })
              )
            }
          />
          <input
            type="text"
            placeholder="Código postal"
            value={
              addressForm.postalCode
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  postalCode:
                    e.target.value,
                })
              )
            }
          />
          <textarea
            placeholder="Referencia"
            value={
              addressForm.reference
            }
            onChange={(e) =>
              setAddressForm(
                (current) => ({
                  ...current,
                  reference:
                    e.target.value,
                })
              )
            }
          />
          <button
            type="button"
            className="primary-button"
            onClick={
              saveAddress
            }
          >
            Guardar dirección
          </button>
        </div>
      </div>
      {addresses.length > 0 && (
        <div className="saved-address-list">
          {addresses.map(
            (address) => (
              <div
                className="saved-address-card"
                key={address.id}
              >
                <div>
                  <strong>
                    📍{" "}
                    {address.name}
                  </strong>
                  <p>
                    {address.street},{" "}
                    {address.city},{" "}
                    {address.state}
                  </p>
                  <small>
                    CP{" "}
                    {
                      address.postalCode
                    }{" "}
                    ·{" "}
                    {address.phone}
                  </small>
                  {address.reference && (
                    <small>
                      Referencia:{" "}
                      {
                        address.reference
                      }
                    </small>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() =>
                    removeAddress(
                      address.id
                    )
                  }
                >
                  Eliminar
                </button>
              </div>
            )
          )}
        </div>
      )}
    </PageShell>
  );
  const renderPayments = () => (
    <PageShell
      title="Métodos de pago"
      onBack={() => openPage("account")}
    >
      <div className="settings-card">
        <div className="payment-intro">
          <span>💳</span>
          <div>
            <h2>
              Métodos de pago
            </h2>
            <p>
              Aquí podrás administrar
              tus formas de pago.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={
            savePaymentMethod
          }
        >
          Agregar método de pago
        </button>
      </div>
      {paymentMethods.length > 0 ? (
        <div className="saved-payment-list">
          {paymentMethods.map(
            (payment) => (
              <div
                className="saved-payment-card"
                key={payment.id}
              >
                <div>
                  <strong>
                    💳{" "}
                    {payment.label}
                  </strong>
                  <small>
                    Método guardado
                  </small>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() =>
                    removePaymentMethod(
                      payment.id
                    )
                  }
                >
                  Eliminar
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="empty-card">
          <div>💳</div>
          <h3>
            No tienes métodos guardados
          </h3>
          <p>
            Tus métodos de pago
            aparecerán aquí.
          </p>
        </div>
      )}
    </PageShell>
  );
  const renderSeller = () => (
    <PageShell
      title="Mi tienda"
      onBack={() => openPage("account")}
    >
      <div className="seller-dashboard">
        <div className="seller-dashboard-header">
          <div className="seller-store-avatar">
            🏪
          </div>
          <div>
            <span>
              Tu tienda
            </span>
            <h2>
              {sellerStore?.store_name ||
                session?.user?.user_metadata
                  ?.full_name ||
                "Mi tienda SHORASHOPP"}
            </h2>
            <p>
              {sellerStore?.description ||
                "Administra tus productos y empieza a vender."}
            </p>
          </div>
        </div>
        <div className="seller-stats">
          <div>
            <strong>
              {products.filter(
                (product) =>
                  product.seller_id ===
                  session?.user?.id
              ).length}
            </strong>
            <span>
              Productos
            </span>
          </div>
          <div>
            <strong>
              0
            </strong>
            <span>
              Ventas
            </span>
          </div>
          <div>
            <strong>
              4.8
            </strong>
            <span>
              Calificación
            </span>
          </div>
        </div>
        <div className="seller-actions">
          <button
            type="button"
            className="primary-button"
            onClick={
              startPublishing
            }
          >
            + Publicar producto
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              showActionMessage(
                "La administración de envíos se conectará aquí."
              )
            }
          >
            🚚 Mis envíos
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              showActionMessage(
                "Las estadísticas de ventas se conectarán aquí."
              )
            }
          >
            📊 Estadísticas
          </button>
        </div>
      </div>
    </PageShell>
  );
  const renderPublish = () => (
    <PageShell
      title="Publicar producto"
      onBack={() =>
        openPage("seller")
      }
    >
      <form
        className="publish-form"
        onSubmit={
          publishProduct
        }
      >
        <div className="publish-card">
          <div className="publish-heading">
            <span>🛍️</span>
            <div>
              <h2>
                Información del producto
              </h2>
              <p>
                Completa los datos de lo
                que quieres vender.
              </p>
            </div>
          </div>
          <label>
            Nombre del producto
            <input
              type="text"
              value={
                productForm.name
              }
              onChange={(e) =>
                updateProductForm(
                  "name",
                  e.target.value
                )
              }
              placeholder="Ej. Audífonos inalámbricos"
              required
            />
          </label>
          <label>
            Descripción
            <textarea
              value={
                productForm.description
              }
              onChange={(e) =>
                updateProductForm(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe tu producto..."
              rows={5}
            />
          </label>
          <div className="form-two-columns">
            <label>
              Precio
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  productForm.price
                }
                onChange={(e) =>
                  updateProductForm(
                    "price",
                    e.target.value
                  )
                }
                placeholder="0.00"
                required
              />
            </label>
            <label>
              Precio anterior
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  productForm.compare_at_price
                }
                onChange={(e) =>
                  updateProductForm(
                    "compare_at_price",
                    e.target.value
                  )
                }
                placeholder="Opcional"
              />
            </label>
          </div>
          <div className="form-two-columns">
            <label>
              Existencias
              <input
                type="number"
                min="1"
                value={
                  productForm.stock
                }
                onChange={(e) =>
                  updateProductForm(
                    "stock",
                    e.target.value
                  )
                }
              />
            </label>
            <label>
              SKU
              <input
                type="text"
                value={
                  productForm.sku
                }
                onChange={(e) =>
                  updateProductForm(
                    "sku",
                    e.target.value
                  )
                }
                placeholder="Opcional"
              />
            </label>
          </div>
          <label>
            Categoría
            <select
              value={
                productForm.category
              }
              onChange={(e) =>
                updateProductForm(
                  "category",
                  e.target.value
                )
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
                    {category.icon}{" "}
                    {category.name}
                  </option>
                )
              )}
            </select>
          </label>
          <label>
            Imagen principal
            <input
              type="url"
              value={
                productForm.image_url
              }
              onChange={(e) =>
                updateProductForm(
                  "image_url",
                  e.target.value
                )
              }
              placeholder="https://..."
            />
          </label>
          <label>
            Otras imágenes
            <input
              type="text"
              value={
                productForm.images
              }
              onChange={(e) =>
                updateProductForm(
                  "images",
                  e.target.value
                )
              }
              placeholder="Separa las URLs con comas"
            />
          </label>
        </div>
        <div className="publish-notice">
          <span>🔎</span>
          <div>
            <strong>
              Revisión de publicaciones
            </strong>
            <p>
              Las primeras publicaciones de
              nuevos vendedores pueden
              requerir revisión antes de
              aparecer en la tienda.
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="primary-button full-button"
          disabled={
            publishLoading
          }
        >
          {publishLoading
            ? "Enviando..."
            : "Enviar producto para revisión"}
        </button>
      </form>
    </PageShell>
  );
  const renderSellerStore = () => {
    const storeProducts =
      products.filter(
        (product) =>
          product.seller_id &&
          sellerStore?.owner_id &&
          product.seller_id ===
            sellerStore.owner_id
      );
    return (
      <PageShell
        title={
          sellerStore?.store_name ||
          "Tienda"
        }
        onBack={() =>
          selectedProduct
            ? openProduct(
                selectedProduct
              )
            : goHome()
        }
      >
        <div className="public-store-header">
          <div className="public-store-avatar">
            🏪
          </div>
          <div>
            <h1>
              {sellerStore?.store_name ||
                "Tienda SHORASHOPP"}
            </h1>
            <div>
              ⭐{" "}
              {sellerStore?.rating ||
                "4.8"}
            </div>
            <p>
              {sellerStore?.description ||
                "Conoce los productos de este vendedor."}
            </p>
          </div>
        </div>
        {storeProducts.length > 0 ? (
          <div className="product-grid">
            {storeProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={isFavorite(
                    product.id
                  )}
                  onFavorite={() =>
                    toggleFavorite(
                      product.id
                    )
                  }
                  onClick={() =>
                    openProduct(
                      product
                    )
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="empty-card">
            <div>🏪</div>
            <h2>
              Esta tienda aún no tiene
              productos publicados.
            </h2>
            <p>
              Vuelve pronto para ver
              nuevas publicaciones.
            </p>
          </div>
        )}
      </PageShell>
    );
  };  const renderAuthModal = () => {
    if (!authOpen) return null;

    return (
      <div
        className="modal-backdrop"
        onClick={() => {
          if (!loading) {
            closeAuth();
          }
        }}
      >
        <div
          className="auth-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className="modal-close"
            onClick={closeAuth}
            disabled={loading}
          >
            ×
          </button>

          <div className="auth-logo">
            S
          </div>

          {!verificationPending ? (
            <>
              <div className="auth-heading">
                <span>
                  {authMode === "login"
                    ? "Bienvenido de nuevo"
                    : "Crea tu cuenta"}
                </span>

                <h2>
                  {authMode === "login"
                    ? "Entra a SHORASHOPP"
                    : "Únete a SHORASHOPP"}
                </h2>

                <p>
                  {authMode === "login"
                    ? "Accede a tus compras, pedidos, favoritos y más."
                    : "Compra y vende todo lo que necesitas desde un solo lugar."}
                </p>
              </div>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={
                    authMode === "login"
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() =>
                    setAuthMode("login")
                  }
                >
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  className={
                    authMode === "register"
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() =>
                    setAuthMode("register")
                  }
                >
                  Crear cuenta
                </button>
              </div>

              <form
                className="auth-form"
                onSubmit={handleAuth}
              >
                {authMode === "register" && (
                  <label>
                    Nombre completo
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                  </label>
                )}

                <label>
                  Correo electrónico
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  Contraseña
                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Tu contraseña"
                    autoComplete={
                      authMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                </label>

                {authMode === "login" && (
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      openPage("recover")
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {message && (
                  <div
                    className={
                      message.toLowerCase().includes(
                        "correct"
                      )
                        ? "auth-message success"
                        : "auth-message"
                    }
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button full-button"
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : authMode === "login"
                    ? "Iniciar sesión"
                    : "Crear mi cuenta"}
                </button>
              </form>

              <div className="auth-footer">
                <span>
                  {authMode === "login"
                    ? "¿Todavía no tienes cuenta?"
                    : "¿Ya tienes una cuenta?"}
                </span>

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
            </>
          ) : (
            <form
              className="verification-form"
              onSubmit={
                verifySignupCode
              }
            >
              <div className="verification-icon">
                ✉️
              </div>

              <div className="auth-heading">
                <span>
                  Verificación
                </span>

                <h2>
                  Revisa tu correo
                </h2>

                <p>
                  Enviamos un código de 6
                  dígitos a:
                </p>

                <strong className="verification-email">
                  {email}
                </strong>
              </div>

              <label>
                Código de verificación
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    verificationCode
                  }
                  onChange={(event) =>
                    setVerificationCode(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </label>

              {message && (
                <div className="auth-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="primary-button full-button"
                disabled={loading}
              >
                {loading
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                className="resend-code-button"
                onClick={
                  resendVerificationCode
                }
                disabled={loading}
              >
                Reenviar código
              </button>

              <button
                type="button"
                className="back-auth-button"
                onClick={() => {
                  setVerificationPending(
                    false
                  );
                  setVerificationCode(
                    ""
                  );
                  setMessage("");
                }}
                disabled={loading}
              >
                ← Regresar
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderRecover = () => (
    <PageShell
      title="Recuperar contraseña"
      onBack={goHome}
    >
      <div className="recover-card">
        <div className="recover-icon">
          🔑
        </div>

        <h2>
          Recupera tu cuenta
        </h2>

        <p>
          Escribe el correo de tu cuenta
          SHORASHOPP y te enviaremos las
          instrucciones para recuperar el acceso.
        </p>

        <form
          className="recover-form"
          onSubmit={async (event) => {
            event.preventDefault();

            const cleanEmail =
              email.trim().toLowerCase();

            if (!cleanEmail) {
              setMessage(
                "Escribe tu correo electrónico."
              );
              return;
            }

            setLoading(true);
            setMessage("");

            try {
              const redirectUrl =
                `${window.location.origin}${window.location.pathname}`;

              const { error } =
                await supabase.auth.resetPasswordForEmail(
                  cleanEmail,
                  {
                    redirectTo:
                      redirectUrl,
                  }
                );

              if (error) {
                throw error;
              }

              setMessage(
                "Si el correo existe, recibirás las instrucciones para recuperar tu contraseña."
              );
            } catch (error) {
              console.error(
                "Error al recuperar contraseña:",
                error
              );

              setMessage(
                error?.message ||
                  "No pudimos enviar el correo de recuperación."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </label>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button full-button"
            disabled={loading}
          >
            {loading
              ? "Enviando..."
              : "Enviar instrucciones"}
          </button>
        </form>
      </div>
    </PageShell>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "categories":
        return renderCategories();

      case "product":
        return renderProduct();

      case "cart":
        return renderCart();

      case "checkout":
        return renderCheckout();

      case "confirmation":
        return renderConfirmation();

      case "account":
        return renderAccount();

      case "profile":
        return renderProfile();

      case "orders":
        return renderOrders();

      case "favorites":
        return renderFavorites();

      case "addresses":
        return renderAddresses();

      case "payments":
        return renderPayments();

      case "seller":
        return renderSeller();

      case "publish":
        return renderPublish();

      case "seller-store":
        return renderSellerStore();

      case "credit":
        return renderCredit();

      case "referrals":
        return renderReferrals();

      case "settings":
        return renderSettings();

      case "privacy":
        return renderPrivacy();

      case "active-sessions":
        return renderActiveSessions();

      case "security-verification":
        return renderSecurityVerification();

      case "support":
        return renderSupport();

      case "recover":
        return renderRecover();

      case "home":
      default:
        return renderHome();
    }
  };

  return (
    <div className="app">
      <header className="main-header">
        <div className="header-left">
          <button
            type="button"
            className="header-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>

          <button
            type="button"
            className="brand"
            onClick={goHome}
          >
            <span className="brand-mark">
              S
            </span>

            <span className="brand-name">
              SHORA
              <b>SHOPP</b>
            </span>
          </button>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-account-button"
            onClick={
              handleAccountAccess
            }
            aria-label="Mi cuenta"
          >
            ✨
          </button>

          <button
            type="button"
            className="header-cart-button"
            onClick={() =>
              openPage("cart")
            }
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
      </header>

      <div className="search-bar-wrapper">
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault();

            if (
              currentPage !== "home"
            ) {
              openPage("home");
            }

            setTimeout(() => {
              document
                .getElementById(
                  "featured-products"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }, 50);
          }}
        >
          <span>🔎</span>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="¿Qué estás buscando?"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="clear-search"
            >
              ×
            </button>
          )}
        </form>
      </div>

      <div className="category-nav">
        {categories
          .slice(0, 6)
          .map((category) => (
            <button
              key={category.name}
              type="button"
              className={
                selectedCategory ===
                category.name
                  ? "nav-category active"
                  : "nav-category"
              }
              onClick={() => {
                setSelectedCategory(
                  category.name
                );
                setCurrentPage("home");

                setTimeout(() => {
                  document
                    .getElementById(
                      "featured-products"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }, 50);
              }}
            >
              {category.icon}{" "}
              {category.name}
            </button>
          ))}
      </div>

      {renderPage()}

      <button
        type="button"
        className="floating-support-button"
        onClick={() =>
          openPage("support")
        }
        aria-label="Ayuda"
      >
        💬
      </button>

      {actionMessage && (
        <div className="toast-message">
          {actionMessage}
        </div>
      )}

      {menuOpen &&
        renderMenu()}

      {renderAuthModal()}
    </div>
  );
}

export default App;  const renderAuthModal = () => {
    if (!authOpen) return null;

    return (
      <div
        className="modal-backdrop"
        onClick={() => {
          if (!loading) {
            closeAuth();
          }
        }}
      >
        <div
          className="auth-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className="modal-close"
            onClick={closeAuth}
            disabled={loading}
          >
            ×
          </button>

          <div className="auth-logo">
            S
          </div>

          {!verificationPending ? (
            <>
              <div className="auth-heading">
                <span>
                  {authMode === "login"
                    ? "Bienvenido de nuevo"
                    : "Crea tu cuenta"}
                </span>

                <h2>
                  {authMode === "login"
                    ? "Entra a SHORASHOPP"
                    : "Únete a SHORASHOPP"}
                </h2>

                <p>
                  {authMode === "login"
                    ? "Accede a tus compras, pedidos, favoritos y más."
                    : "Compra y vende todo lo que necesitas desde un solo lugar."}
                </p>
              </div>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={
                    authMode === "login"
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() =>
                    setAuthMode("login")
                  }
                >
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  className={
                    authMode === "register"
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() =>
                    setAuthMode("register")
                  }
                >
                  Crear cuenta
                </button>
              </div>

              <form
                className="auth-form"
                onSubmit={handleAuth}
              >
                {authMode === "register" && (
                  <label>
                    Nombre completo
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                  </label>
                )}

                <label>
                  Correo electrónico
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  Contraseña
                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Tu contraseña"
                    autoComplete={
                      authMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                </label>

                {authMode === "login" && (
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      openPage("recover")
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {message && (
                  <div
                    className={
                      message.toLowerCase().includes(
                        "correct"
                      )
                        ? "auth-message success"
                        : "auth-message"
                    }
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button full-button"
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : authMode === "login"
                    ? "Iniciar sesión"
                    : "Crear mi cuenta"}
                </button>
              </form>

              <div className="auth-footer">
                <span>
                  {authMode === "login"
                    ? "¿Todavía no tienes cuenta?"
                    : "¿Ya tienes una cuenta?"}
                </span>

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
            </>
          ) : (
            <form
              className="verification-form"
              onSubmit={
                verifySignupCode
              }
            >
              <div className="verification-icon">
                ✉️
              </div>

              <div className="auth-heading">
                <span>
                  Verificación
                </span>

                <h2>
                  Revisa tu correo
                </h2>

                <p>
                  Enviamos un código de 6
                  dígitos a:
                </p>

                <strong className="verification-email">
                  {email}
                </strong>
              </div>

              <label>
                Código de verificación
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    verificationCode
                  }
                  onChange={(event) =>
                    setVerificationCode(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </label>

              {message && (
                <div className="auth-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="primary-button full-button"
                disabled={loading}
              >
                {loading
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                className="resend-code-button"
                onClick={
                  resendVerificationCode
                }
                disabled={loading}
              >
                Reenviar código
              </button>

              <button
                type="button"
                className="back-auth-button"
                onClick={() => {
                  setVerificationPending(
                    false
                  );
                  setVerificationCode(
                    ""
                  );
                  setMessage("");
                }}
                disabled={loading}
              >
                ← Regresar
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderRecover = () => (
    <PageShell
      title="Recuperar contraseña"
      onBack={goHome}
    >
      <div className="recover-card">
        <div className="recover-icon">
          🔑
        </div>

        <h2>
          Recupera tu cuenta
        </h2>

        <p>
          Escribe el correo de tu cuenta
          SHORASHOPP y te enviaremos las
          instrucciones para recuperar el acceso.
        </p>

        <form
          className="recover-form"
          onSubmit={async (event) => {
            event.preventDefault();

            const cleanEmail =
              email.trim().toLowerCase();

            if (!cleanEmail) {
              setMessage(
                "Escribe tu correo electrónico."
              );
              return;
            }

            setLoading(true);
            setMessage("");

            try {
              const redirectUrl =
                `${window.location.origin}${window.location.pathname}`;

              const { error } =
                await supabase.auth.resetPasswordForEmail(
                  cleanEmail,
                  {
                    redirectTo:
                      redirectUrl,
                  }
                );

              if (error) {
                throw error;
              }

              setMessage(
                "Si el correo existe, recibirás las instrucciones para recuperar tu contraseña."
              );
            } catch (error) {
              console.error(
                "Error al recuperar contraseña:",
                error
              );

              setMessage(
                error?.message ||
                  "No pudimos enviar el correo de recuperación."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </label>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button full-button"
            disabled={loading}
          >
            {loading
              ? "Enviando..."
              : "Enviar instrucciones"}
          </button>
        </form>
      </div>
    </PageShell>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "categories":
        return renderCategories();

      case "product":
        return renderProduct();

      case "cart":
        return renderCart();

      case "checkout":
        return renderCheckout();

      case "confirmation":
        return renderConfirmation();

      case "account":
        return renderAccount();

      case "profile":
        return renderProfile();

      case "orders":
        return renderOrders();

      case "favorites":
        return renderFavorites();

      case "addresses":
        return renderAddresses();

      case "payments":
        return renderPayments();

      case "seller":
        return renderSeller();

      case "publish":
        return renderPublish();

      case "seller-store":
        return renderSellerStore();

      case "credit":
        return renderCredit();

      case "referrals":
        return renderReferrals();

      case "settings":
        return renderSettings();

      case "privacy":
        return renderPrivacy();

      case "active-sessions":
        return renderActiveSessions();

      case "security-verification":
        return renderSecurityVerification();

      case "support":
        return renderSupport();

      case "recover":
        return renderRecover();

      case "home":
      default:
        return renderHome();
    }
  };

  return (
    <div className="app">
      <header className="main-header">
        <div className="header-left">
          <button
            type="button"
            className="header-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>

          <button
            type="button"
            className="brand"
            onClick={goHome}
          >
            <span className="brand-mark">
              S
            </span>

            <span className="brand-name">
              SHORA
              <b>SHOPP</b>
            </span>
          </button>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-account-button"
            onClick={
              handleAccountAccess
            }
            aria-label="Mi cuenta"
          >
            ✨
          </button>

          <button
            type="button"
            className="header-cart-button"
            onClick={() =>
              openPage("cart")
            }
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
      </header>

      <div className="search-bar-wrapper">
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault();

            if (
              currentPage !== "home"
            ) {
              openPage("home");
            }

            setTimeout(() => {
              document
                .getElementById(
                  "featured-products"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }, 50);
          }}
        >
          <span>🔎</span>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="¿Qué estás buscando?"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="clear-search"
            >
              ×
            </button>
          )}
        </form>
      </div>

      <div className="category-nav">
        {categories
          .slice(0, 6)
          .map((category) => (
            <button
              key={category.name}
              type="button"
              className={
                selectedCategory ===
                category.name
                  ? "nav-category active"
                  : "nav-category"
              }
              onClick={() => {
                setSelectedCategory(
                  category.name
                );
                setCurrentPage("home");

                setTimeout(() => {
                  document
                    .getElementById(
                      "featured-products"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }, 50);
              }}
            >
              {category.icon}{" "}
              {category.name}
            </button>
          ))}
      </div>

      {renderPage()}

      <button
        type="button"
        className="floating-support-button"
        onClick={() =>
          openPage("support")
        }
        aria-label="Ayuda"
      >
        💬
      </button>

      {actionMessage && (
        <div className="toast-message">
          {actionMessage}
        </div>
      )}

      {menuOpen &&
        renderMenu()}

      {renderAuthModal()}
    </div>
  );
}

export default App;
