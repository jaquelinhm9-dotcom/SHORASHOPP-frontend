import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";

const demoProducts = [
  { id: 1, name: "Bolso urbano SHORA", price: 699, category: "Moda", emoji: "👜" },
  { id: 2, name: "Tenis casuales", price: 899, category: "Calzado", emoji: "👟" },
  { id: 3, name: "Audífonos inalámbricos", price: 549, category: "Tecnología", emoji: "🎧" },
  { id: 4, name: "Decoración para hogar", price: 399, category: "Hogar", emoji: "🏠" },
  { id: 5, name: "Accesorios para celular", price: 249, category: "Tecnología", emoji: "📱" },
  { id: 6, name: "Ropa para mujer", price: 599, category: "Moda", emoji: "👗" }
];

function Layout({ cartCount }) {
  return (
    <div className="app">
      <header className="header">
        <Link className="logo" to="/">SHORA<span>SHOPP</span></Link>
        <nav className="nav">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/catalogo">Comprar</NavLink>
          <NavLink to="/vender">Vender</NavLink>
        </nav>
        <div className="header-actions">
          <Link className="icon-btn" to="/carrito" aria-label="Carrito">🛒<b>{cartCount}</b></Link>
          <Link className="account" to="/cuenta">Mi cuenta</Link>
        </div>
      </header>
      <main><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<Product />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/vender" element={<Seller />} />
        <Route path="/admin" element={<Admin />} />
      </Routes></main>
      <footer className="footer">
        <div><strong>SHORASHOPP</strong><p>Compra y vende de todo en un solo lugar.</p></div>
        <div><Link to="/catalogo">Comprar</Link><Link to="/vender">Vender</Link><Link to="/cuenta">Mi cuenta</Link></div>
        <small>© 2026 SHORASHOPP. Todos los derechos reservados.</small>
      </footer>
    </div>
  );
}

function Home() {
  return <>
    <section className="hero">
      <div>
        <span className="pill">MARKETPLACE MEXICANO</span>
        <h1>Todo lo que buscas.<br/><em>Todo en SHORASHOPP.</em></h1>
        <p>Descubre productos de diferentes vendedores, compra de forma segura y encuentra nuevas ofertas cada día.</p>
        <Link className="primary" to="/catalogo">Explorar productos →</Link>
      </div>
      <div className="hero-art">🛍️</div>
    </section>
    <section className="section">
      <div className="section-title"><div><span>DESCUBRE</span><h2>Categorías populares</h2></div><Link to="/catalogo">Ver todo →</Link></div>
      <div className="categories">
        {["Moda","Tecnología","Hogar","Calzado","Belleza","Accesorios"].map((x,i)=><Link to="/catalogo" className="category" key={x}><div>{["👗","📱","🏠","👟","✨","👜"][i]}</div><strong>{x}</strong></Link>)}
      </div>
    </section>
    <section className="section">
      <div className="section-title"><div><span>SELECCIÓN SHORA</span><h2>Productos destacados</h2></div><Link to="/catalogo">Ver catálogo →</Link></div>
      <ProductGrid products={demoProducts.slice(0,4)} />
    </section>
  </>;
}

function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const products = useMemo(() => demoProducts.filter(p =>
    (category === "Todas" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [search, category]);

  return <section className="section catalog">
    <div className="catalog-head"><div><span>CATÁLOGO</span><h1>Encuentra lo que necesitas</h1></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos..." />
    </div>
    <div className="filters">
      {["Todas","Moda","Tecnología","Hogar","Calzado"].map(c=><button className={category===c?"filter active":"filter"} onClick={()=>setCategory(c)} key={c}>{c}</button>)}
    </div>
    <ProductGrid products={products} />
  </section>;
}

function ProductGrid({ products }) {
  const navigate = useNavigate();
  const add = (p) => {
    const cart = JSON.parse(localStorage.getItem("shora_cart") || "[]");
    cart.push(p); localStorage.setItem("shora_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartchange"));
  };
  return <div className="grid">{products.map(p=>
    <article className="card" key={p.id}>
      <button className="product-img" onClick={()=>navigate(`/producto/${p.id}`)}>{p.emoji}</button>
      <small>{p.category}</small><h3>{p.name}</h3><strong>${p.price.toLocaleString("es-MX")} MXN</strong>
      <button className="add" onClick={()=>add(p)}>Agregar al carrito</button>
    </article>
  )}</div>;
}

function Product() {
  const id = Number(location.pathname.split("/").pop());
  const p = demoProducts.find(x=>x.id===id) || demoProducts[0];
  return <section className="section product-page">
    <div className="product-big">{p.emoji}</div>
    <div><span>{p.category}</span><h1>{p.name}</h1><h2>${p.price.toLocaleString("es-MX")} MXN</h2>
      <p>Producto publicado en SHORASHOPP. La información, envío y disponibilidad se confirmarán durante el proceso de compra.</p>
      <button className="primary" onClick={()=>{const cart=JSON.parse(localStorage.getItem("shora_cart")||"[]");cart.push(p);localStorage.setItem("shora_cart",JSON.stringify(cart));window.dispatchEvent(new Event("cartchange"));}}>Agregar al carrito</button>
    </div>
  </section>;
}

function Cart() {
  const [items,setItems] = useState(()=>JSON.parse(localStorage.getItem("shora_cart")||"[]"));
  const total = items.reduce((s,p)=>s+p.price,0);
  return <section className="section">
    <span>CARRITO</span><h1>Tu carrito</h1>
    {!items.length ? <div className="empty"><div>🛒</div><h2>Tu carrito está vacío</h2><Link className="primary" to="/catalogo">Explorar productos</Link></div> :
      <div className="cart-layout"><div>{items.map((p,i)=><div className="cart-row" key={i}><div className="mini">{p.emoji}</div><div><strong>{p.name}</strong><small>{p.category}</small></div><b>${p.price.toLocaleString("es-MX")}</b></div>)}</div>
      <aside className="summary"><h2>Resumen</h2><p>Productos <b>${total.toLocaleString("es-MX")}</b></p><hr/><h3>Total <b>${total.toLocaleString("es-MX")} MXN</b></h3><button className="primary" onClick={()=>alert("El siguiente paso conectará este botón con Mercado Pago.")}>Continuar al pago</button><button className="text-btn" onClick={()=>{localStorage.removeItem("shora_cart");setItems([]);}}>Vaciar carrito</button></aside></div>}
