const features = [
  { number: "01", title: "Calendario", description: "Organiza sesiones por día, semana y mes." },
  { number: "02", title: "Formaciones", description: "Controla cursos abiertos y para empresas." },
  { number: "03", title: "Equipo", description: "Consulta instructores y cuentas de reunión." },
  { number: "04", title: "Seguimiento", description: "Prepara asistencias, certificaciones e informes." },
];

export default function Home() {
  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Navegación principal">
        <a className="brand" href="/" aria-label="Inicio">
          <span className="brand-mark">AF</span>
          <span>Asistente <strong>Formaciones</strong></span>
        </a>
        <span className="private-label"><span className="status-dot" /> Espacio privado</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line" /> ORGANIZACIÓN · FORMACIÓN · CONTROL</div>
        <h1>Todas tus formaciones.<br /><span>En orden.</span></h1>
        <p className="hero-copy">Un espacio para planificar sesiones, coordinar instructores y llevar cada formación desde la programación hasta el cierre.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#modulos">Explorar el espacio <span aria-hidden="true">↘</span></a>
          <span className="setup-note">Versión inicial · Preparando el entorno</span>
        </div>
        <div className="hero-decoration" aria-hidden="true"><span>AF</span><i /><i /><i /></div>
      </section>

      <section id="modulos" className="modules-section">
        <div className="section-heading">
          <div><p className="section-kicker">EL ESPACIO DE TRABAJO</p><h2>Una visión clara del trabajo.</h2></div>
          <span className="module-count">04 MÓDULOS BASE</span>
        </div>
        <div className="module-grid">
          {features.map((feature) => (
            <article className="module-card" key={feature.number}>
              <div className="module-card-top"><span className="module-number">{feature.number}</span><span className="module-arrow" aria-hidden="true">↗</span></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="module-status">EN PREPARACIÓN</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer"><span>ASISTENTE PERSONAL DE FORMACIONES</span><span>Construido por fases, con seguridad desde el inicio.</span></footer>
    </main>
  );
}
