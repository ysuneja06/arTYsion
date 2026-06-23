import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { artworks, getArtworkById, formatPrice } from "./data/artworks.js";
import { progressions, getProgressionById } from "./data/progressions.js";
import { siteConfig } from "./data/siteConfig.js";

function currentPath() {
  return window.location.pathname;
}

function Logo() {
  return (
    <a className="logo" href="/" aria-label="artYSion home">
      <span>art</span><strong>YS</strong><span>ion</span>
    </a>
  );
}

function Header({ active = "home" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { key: "home", label: "Home", href: "/" },
    { key: "gallery", label: "Gallery", href: "/gallery" },
    { key: "canvas", label: "Canvas to Creation", href: "/canvas-to-creation" },
    { key: "sessions", label: "Art Sessions", href: "/art-sessions" },
    { key: "books", label: "Books", href: "/#books" },
    { key: "commissions", label: "Commissions", href: "/#commissions" },
    { key: "about", label: "About", href: "/about" },
    { key: "payment", label: "Payment", href: "/payment" },
    { key: "contact", label: "Contact", href: "/contact" },
  ];
  return (
    <header className="site-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map((link) => <a key={link.key} className={active === link.key ? "active" : ""} href={link.href}>{link.label}</a>)}
      </nav>
      <button className={`menu-button ${menuOpen ? "open" : ""}`} aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span></span><span></span><span></span></button>
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation">
        {navLinks.map((link) => <a key={link.key} className={active === link.key ? "active" : ""} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="hero">
      <Header active="home" />
      <div className="hero-content">
        <h1>Every Painting<br />Has a Story.<br /><em>Find Yours.</em></h1>
        <div className="ornament" />
        <p>Original Artworks <span>•</span> Prints <span>•</span> Commissions</p>
        <a className="primary-button" href="/gallery">Explore Gallery <span>→</span></a>
      </div>
    </section>
  );
}

function SectionTitle({ title }) {
  return <div className="section-title"><h2>{title}</h2><div className="accent-line center" /></div>;
}

function Badges({ artwork }) {
  return (
    <div className="badge-row">
      <span className={`status-badge ${artwork.status}`}>{artwork.status}</span>
      {artwork.exclusive && <span className="status-badge exclusive">Exclusive</span>}
    </div>
  );
}


function useWeb3Form() {
  const [status, setStatus] = useState({ state: "idle", message: "" });

  async function submitForm(formType, payload) {
    setStatus({ state: "submitting", message: "Submitting..." });
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: siteConfig.web3FormsAccessKey,
          subject: `artYSion ${formType}`,
          from_name: "artYSion Website",
          form_type: formType,
          ...payload,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Form submission failed.");
      setStatus({ state: "success", message: "Thank you. Your request has been received." });
      return true;
    } catch (error) {
      setStatus({ state: "error", message: "Something went wrong. Please try again or email yaju@artysion.com." });
      return false;
    }
  }

  return { status, submitForm, setStatus };
}

function FormStatus({ status }) {
  if (!status || status.state === "idle" || status.state === "success") return null;
  if (status.state === "error") return <div className="form-status error">{status.message}</div>;
  return <div className="form-status">{status.message}</div>;
}

function SuccessPanel({ title, children, actions }) {
  return (
    <div className="success-panel" role="status" aria-live="polite">
      <div className="success-mark">✓</div>
      <h2>{title}</h2>
      <div className="success-copy">{children}</div>
      {actions && <div className="success-actions">{actions}</div>}
    </div>
  );
}

function formatPrintPrice(price) {
  return formatPrice(price);
}

function GalleryPreview() {
  const galleryImages = artworks.filter((a) => a.homeGallery).slice(0, 6);
  return (
    <section id="gallery" className="light-section gallery-preview">
      <SectionTitle title="From the Gallery" />
      <div className="gallery-grid">
        {galleryImages.map((item) => (
          <a className="gallery-tile" key={item.id} href={`/gallery/${item.id}`} aria-label={item.title}>
            <img src={item.images[0]} alt={item.title} />
          </a>
        ))}
      </div>
      <a className="text-link" href="/gallery">Explore Full Gallery <span>→</span></a>
    </section>
  );
}

function FeaturedArtworks() {
  const featured = artworks.filter((a) => a.featured);
  const [featuredStart, setFeaturedStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1700) setVisibleCount(5);
      else if (width >= 1350) setVisibleCount(4);
      else if (width >= 760) setVisibleCount(3);
      else if (width >= 520) setVisibleCount(2);
      else setVisibleCount(1);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const cardsToShow = Math.min(visibleCount, featured.length || 0);
  const visibleFeatured = featured.length <= cardsToShow
    ? featured
    : Array.from({ length: cardsToShow }, (_, offset) => featured[(featuredStart + offset) % featured.length]);
  const showControls = featured.length > cardsToShow;

  const previousFeatured = () => {
    if (!showControls) return;
    setFeaturedStart((current) => (current - 1 + featured.length) % featured.length);
  };

  const nextFeatured = () => {
    if (!showControls) return;
    setFeaturedStart((current) => (current + 1) % featured.length);
  };

  return (
    <section className="light-section split-section">
      <div className="featured-panel">
        <h2>Featured Artworks</h2><div className="accent-line" />
        {showControls && <button className="carousel-control left" onClick={previousFeatured} aria-label="Previous artwork">‹</button>}
        <div className="featured-grid" style={{ gridTemplateColumns: `repeat(${visibleFeatured.length || 1}, minmax(0, 1fr))` }}>
          {visibleFeatured.map((art) => (
            <a className="art-card" key={art.id} href={`/gallery/${art.id}`}>
              <img src={art.images[0]} alt={art.title} />
              <h3>{art.title}</h3>
              <p>{art.dimensions}</p>
              <p>{art.medium}</p>
              <strong>{formatPrice(art.price)}</strong>
            </a>
          ))}
        </div>
        {showControls && <button className="carousel-control right" onClick={nextFeatured} aria-label="Next artwork">›</button>}
        <a className="outline-button" href="/gallery">View All Artworks <span>→</span></a>
      </div>

      <div id="art-sessions" className="session-panel">
        <h2>Art Sessions</h2><div className="accent-line" />
        <div className="session-icon" aria-hidden="true">♙</div>
        <p>Explore painting techniques, composition, color harmony, creative process, and personalized artistic guidance through a one-on-one session.</p>
        <a className="primary-button" href={siteConfig.calendlyUrl} target="_blank" rel="noreferrer">Book a One-on-One Art Session <span>→</span></a>
      </div>
    </section>
  );
}

function CanvasToCreationHome() {
  const steps = progressions[0]?.stages || [];
  return (
    <section id="canvas-to-creation" className="process-section">
      <div className="process-top">
        <div className="process-intro">
          <h2>Canvas to Creation</h2><div className="accent-line" />
          <p>The step-by-step artistic progression of selected landscapes.</p>
          <a className="primary-button" href="/canvas-to-creation">Explore the Process <span>→</span></a>
        </div>
        <div className="process-steps">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <article className="process-card">
                <img src={step.image} alt={`${step.label} stage`} />
                <span>{index + 1}</span><p>{step.label}</p>
              </article>
              {index < steps.length - 1 && <span className="step-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="process-copy">
        <p>Painting landscapes isn’t just about capturing what you see — it’s about expressing what you feel.</p>
        <p>Step-by-step progressions is created as a reference to guide your hand in translating your feeling.</p>
        <p>Let the brush dance and let the colors surprise you.</p>
        <p>Grab a copy of <a href={siteConfig.amazonLinks.landscapeMadeEasy} target="_blank" rel="noreferrer"><em>Landscape Made Easy</em></a> for more guidance.</p>
      </div>
    </section>
  );
}

function BookAndCommission() {
  return (
    <section className="light-section book-commission">
      <div id="books" className="book-panel">
        <img className="book-cover" src="/images/brand/book-cover.jpg" alt="Landscape Made Easy book cover" />
        <div>
          <h2>Landscape Made Easy</h2>
          <div className="accent-line" />
          <p>Your artistic companion, whether painting for the first time or returning after years.</p>
          <a className="amazon-button amazon-image-button" href={siteConfig.amazonLinks.landscapeMadeEasy} target="_blank" rel="noreferrer" aria-label="View Landscape Made Easy on Amazon"><img src="/images/brand/amazon-button.png" alt="Order now at Amazon.com" /></a>
        </div>
      </div>
      <div id="commissions" className="commission-panel">
        <div><h2>Your Vision. My Brush.</h2><div className="accent-line" /><p>Custom oil, acrylic and mixed media artworks created uniquely for you.</p><a className="primary-button" href="/contact?topic=commission">Request a Commission <span>→</span></a></div>
        <img src="/images/brand/brushes.jpg" alt="Paint brushes and palette" />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-brand">
        <Logo />
        <p className="footer-tagline">{siteConfig.brandTagline}</p>
        <div className="socials" aria-label="Social links"><a href="/" aria-label="Instagram">◎</a><a href="/" aria-label="Facebook">f</a><a href="/" aria-label="Pinterest">p</a><a href="/" aria-label="YouTube">▶</a></div>
        <small>© 2025 artYSion. All Rights Reserved.</small>
      </div>
      <div><h3>Explore</h3><a href="/">Home</a><a href="/gallery">Gallery</a><a href="/canvas-to-creation">Canvas to Creation</a><a href="/art-sessions">Art Sessions</a><a href="/#books">Books</a><a href="/#commissions">Commissions</a></div>
      <div><h3>About</h3><a href="/about">Artist Story</a><a href="/about">Inspiration</a><a href="/canvas-to-creation">Process</a><a href="/contact">Contact</a></div>
      <div className="newsletter"><h3>Newsletter</h3><p>Inspiration, new artworks and stories in your inbox.</p><form><input type="email" placeholder="Your email address" aria-label="Email address" /><button type="submit">Subscribe</button></form></div>
      <div className="footer-bottom"><a href="/privacy-policy">Privacy Policy</a><a href="/shipping-returns">Shipping & Returns</a><a href="/terms">Terms & Conditions</a></div>
    </footer>
  );
}

function HomePage() {
  return <><Hero /><main><GalleryPreview /><FeaturedArtworks /><CanvasToCreationHome /><BookAndCommission /></main><Footer /></>;
}

function PageShell({ active, children }) {
  return <><Header active={active} /><main className="page-main">{children}</main><Footer /></>;
}

function GalleryLegend() {
  return (
    <div className="legend-cards">
      <article><span className="legend-dot available-dot"></span><h3>Available</h3><p>Original artwork available. Prints available.</p></article>
      <article><span className="legend-dot sold-dot"></span><h3>Sold</h3><p>Original artwork sold. Similar artwork may be reproduced on commission. Prints available.</p></article>
      <article><span className="legend-dot exclusive-dot"></span><h3>Exclusive</h3><p>Collector pieces that will not be reproduced on commission. Prints remain available unless otherwise noted.</p></article>
    </div>
  );
}

function GalleryPage() {
  const params = new URLSearchParams(window.location.search);
  const initialFilter = params.get("filter") || "all";
  const [filter, setFilter] = useState(initialFilter);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artworks.filter((a) => {
      const filterMatch =
        filter === "available" ? a.status === "available" :
        filter === "sold" ? a.status === "sold" :
        filter === "exclusive" ? a.exclusive : true;
      const searchText = `${a.title} ${a.medium} ${a.dimensions} ${a.story} ${a.status} ${a.exclusive ? "exclusive" : ""}`.toLowerCase();
      return filterMatch && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [filter, query]);
  const visible = filtered.slice(0, visibleCount);
  return (
    <PageShell active="gallery">
      <section className="page-hero small"><p>Gallery</p><h1>Every Painting Has a Story.<br /><em>Find Yours.</em></h1></section>
      <section className="gallery-page-section">
        <GalleryLegend />
        <div className="gallery-controls">
          <input className="search-input" value={query} onChange={(e) => { setQuery(e.target.value); setVisibleCount(24); }} placeholder="Search artwork..." />
          <div className="filter-bar">
            {["all", "available", "sold", "exclusive"].map((item) => <button key={item} onClick={() => { setFilter(item); setVisibleCount(24); }} className={filter === item ? "selected" : ""}>{item}</button>)}
          </div>
        </div>
        <div className="artwork-grid-page">
          {visible.map((art) => <a className="gallery-card" href={`/gallery/${art.id}`} key={art.id}><div className="image-wrap"><img src={art.images[0]} alt={art.title} /><Badges artwork={art} /></div><h3>{art.title}</h3><p>{art.dimensions}</p><p>{art.medium}</p><strong>{formatPrice(art.price)}</strong></a>)}
        </div>
        {visible.length === 0 && <p className="empty-gallery">No artworks match your search.</p>}
        {visibleCount < filtered.length && <button className="outline-button load-more" onClick={() => setVisibleCount((count) => count + 24)}>View More Artworks <span>→</span></button>}
      </section>
    </PageShell>
  );
}

function ArtworkPage({ id }) {
  const artwork = getArtworkById(id);
  const [index, setIndex] = useState(0);
  if (!artwork) return <PageShell active="gallery"><section className="not-found"><h1>Artwork not found</h1><a className="primary-button" href="/gallery">Back to Gallery</a></section></PageShell>;
  const next = () => setIndex((i) => (i + 1) % artwork.images.length);
  const prev = () => setIndex((i) => (i - 1 + artwork.images.length) % artwork.images.length);
  const showOriginalPurchase = artwork.status === "available";
  const showReproduction = artwork.status === "sold" && !artwork.exclusive;
  return (
    <PageShell active="gallery">
      <section className="artwork-detail">
        <div className="artwork-viewer protected-viewer"><div className="artwork-image-stage"><img src={artwork.images[index]} alt={artwork.title} draggable="false" /><span className="artysion-watermark">artYSion</span></div>{artwork.images.length > 1 && <><button className="viewer-arrow left" onClick={prev}>‹</button><button className="viewer-arrow right" onClick={next}>›</button><p>{index + 1} / {artwork.images.length}</p></>}</div>
        <aside className="artwork-info">
          <Badges artwork={artwork} />
          <h1>{artwork.title}</h1>
          <p>{artwork.medium}</p>
          <p>{artwork.dimensions}</p>
          <strong>{formatPrice(artwork.price)} + Shipping</strong>
          <div className="status-note"><StatusExplanation artwork={artwork} /></div>
          <div className="print-options-summary">
            <h2>Premium Giclée Canvas Prints Available</h2>
            <ul>{siteConfig.printOptions.map((option) => <li key={option.size}>{option.size} — {formatPrintPrice(option.price)}</li>)}</ul>
          </div>
          <PolicyNotes />
          <h2>Story</h2><p>{artwork.story}</p>
          <div className="artwork-action-row">
            <a className="primary-button" href={`/contact?artwork=${artwork.id}`}>Inquire About This Artwork <span>→</span></a>
            {showOriginalPurchase && <a className="outline-button" href={`/payment?artwork=${artwork.id}&type=original`}>Request Purchase <span>→</span></a>}
            {showReproduction && <a className="outline-button" href={`/payment?artwork=${artwork.id}&type=reproduction`}>Request Reproduction <span>→</span></a>}
            <a className="outline-button" href={`/payment?artwork=${artwork.id}&type=print`}>Purchase Print <span>→</span></a>
          </div>
          {artwork.status === "sold" && artwork.exclusive && <p className="purchase-note"><strong>Collector Piece:</strong> Reproduction is not available. Prints remain available unless otherwise noted.</p>}
        </aside>
      </section>
    </PageShell>
  );
}

function StatusExplanation({ artwork }) {
  if (artwork.exclusive) return <p><strong>Exclusive:</strong> Collector piece that will not be reproduced on commission. Prints remain available unless otherwise noted.</p>;
  if (artwork.status === "sold") return <p><strong>Sold:</strong> Original artwork sold. Similar artwork may be reproduced on commission. Prints available.</p>;
  return <p><strong>Available:</strong> Original artwork available. Prints available.</p>;
}

function PolicyNotes({ compact = false }) {
  return (
    <div className={`policy-notes ${compact ? "compact" : ""}`}>
      <p><strong>Artwork Note:</strong> Images are provided as a close representation of the artwork. Minor variations in color, texture, and fine details may exist in the original painting.</p>
      <p><strong>Sales Note:</strong> Original artworks are carefully handled and packaged. All original artwork sales are final once sold and shipped.</p>
    </div>
  );
}

function CanvasToCreationPage() {
  return <PageShell active="canvas"><section className="page-hero small"><p>Canvas to Creation</p><h1>The Step-by-Step <span className="red-accent">Artistic Progression</span><br />of Selected Landscapes.</h1></section><section className="progression-grid">{progressions.map((p) => <a className="progression-card" key={p.id} href={`/canvas-to-creation/${p.id}`}><img src={p.cover} alt={p.title} /><h3>{p.title}</h3><p>5 Stages: Sketch, Massing, Blocking In, Building Depth, Adding Details</p></a>)}</section></PageShell>;
}

function ProgressionPage({ id }) {
  const progression = getProgressionById(id);
  const [stage, setStage] = useState(0);
  if (!progression) return <PageShell active="canvas"><section className="not-found"><h1>Progression not found</h1><a className="primary-button" href="/canvas-to-creation">Back to Canvas to Creation</a></section></PageShell>;
  const current = progression.stages[stage];
  const currentIndex = progressions.findIndex((p) => p.id === id);
  const prevProgression = progressions[(currentIndex - 1 + progressions.length) % progressions.length];
  const nextProgression = progressions[(currentIndex + 1) % progressions.length];
  return <PageShell active="canvas"><section className="progression-detail"><h1>{progression.title}</h1><div className="stage-viewer protected-viewer"><div className="stage-image-stage"><img src={current.image} alt={current.label} draggable="false" /><span className="artysion-watermark">artYSion</span></div><div className="stage-meta"><p>Stage {stage + 1} of 5</p><h2>{current.label}</h2><div className="stage-actions"><button onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0}>← Previous Stage</button><button onClick={() => setStage(Math.min(progression.stages.length - 1, stage + 1))} disabled={stage === progression.stages.length - 1}>Next Stage →</button></div></div></div><div className="book-prompt">Grab a copy of <a href={siteConfig.amazonLinks.landscapeMadeEasy} target="_blank" rel="noreferrer">Landscape Made Easy</a> for more guidance.</div><div className="progression-nav"><a href={`/canvas-to-creation/${prevProgression.id}`}>← Previous Progression</a><a href="/canvas-to-creation">All Progressions</a><a href={`/canvas-to-creation/${nextProgression.id}`}>Next Progression →</a></div></section></PageShell>;
}

function ArtSessionsPage() {
  return <PageShell active="sessions"><section className="page-hero small"><p>Art Sessions</p><h1>Book a <span className="red-accent">One-on-One</span> Art Session</h1></section><section className="content-page narrow"><h2>Personalized Artistic Guidance</h2><p>Explore painting techniques, composition, color harmony, creative process, and feedback on your own artwork through a focused one-on-one conversation.</p><div className="session-price-card"><strong>{siteConfig.artSession.duration}</strong><span>{siteConfig.artSession.price}</span><p>{siteConfig.artSession.mode}</p></div><a className="primary-button" href={siteConfig.calendlyUrl} target="_blank" rel="noreferrer">Open Calendly <span>→</span></a></section></PageShell>;
}

function AboutPage() {
  return <PageShell active="about"><section className="page-hero about-hero"><p>About the Artist</p><h1>Every Painting Has a Story.<br /><em>Find Yours.</em></h1><p className="about-subtitle">Art, for me, is a way to connect—with nature, with people, and with the emotions that words cannot express.</p></section><section className="about-statement"><div><h2>Artist Statement</h2><p>Whether I’m painting a tranquil landscape, a delicate flower, a majestic animal, a thoughtful portrait, or a simple still life, my goal is not simply to recreate what I see, but to capture the emotion, atmosphere, and experience behind it.</p><p>I work primarily in oil and acrylic on canvas, and I also enjoy charcoal for its raw, expressive quality. My style is largely influenced by impressionism, with elements of realism—allowing me the freedom to balance mood with detail.</p><p>Every painting is a journey—one that begins with observation, grows through exploration, and comes alive through color, light, and texture.</p></div><img src="/images/artworks/chit-chat/Chit Chat - Main.jpg" alt="Chit Chat artwork" /></section><section className="mediums-section"><h2>Mediums & Styles</h2><div className="mediums-grid"><article><h3>Oil on Canvas</h3><p>Rich, vibrant, and timeless—bringing depth, mood, and atmosphere to life.</p></article><article><h3>Acrylic on Canvas</h3><p>Versatile and expressive, perfect for bold color, texture, and creative freedom.</p></article><article><h3>Charcoal Drawings</h3><p>Portraits, animals, and still life studies shaped through form, light, and emotion.</p></article><article><h3>Styles</h3><p>Impressionism, realism, expressive emotion, and nature-inspired storytelling.</p></article></div></section><section className="vision-section"><img src="/images/artworks/sun-beam/Sun Beam - Main.jpg" alt="Sun Beam artwork" /><div><h2>My Vision, My Brush</h2><p>I believe every subject—big or small—carries a story waiting to be discovered. My brush is simply the tool that helps me tell it.</p><p>Through my art, I aim to evoke a sense of calm, wonder, and connection. It is my hope that my paintings not only beautify spaces but also inspire hearts and spark conversations.</p></div></section><section className="beyond-canvas"><h2>Beyond the Canvas</h2><div className="beyond-grid"><a href={siteConfig.amazonLinks.landscapeMadeEasy} target="_blank" rel="noreferrer"><h3>Landscape Made Easy</h3><p>Your artistic companion, whether painting for the first time or returning after years. →</p></a><a href="/canvas-to-creation"><h3>Canvas to Creation</h3><p>Explore the progressions →</p></a><a href="/art-sessions"><h3>Art Sessions</h3><p>Book a One-on-One session →</p></a></div></section></PageShell>;
}

function ContactPage() {
  const params = new URLSearchParams(window.location.search);
  const artworkId = params.get("artwork");
  const topic = params.get("topic");
  const artwork = artworkId ? getArtworkById(artworkId) : null;
  const { status, submitForm } = useWeb3Form();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: topic === "commission" ? "Commission Request" : artwork ? `Inquiry about ${artwork.title}` : "", message: "" });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  async function handleSubmit(event) {
    event.preventDefault();
    const sent = await submitForm(artwork ? "Artwork Inquiry" : topic === "commission" ? "Commission Request" : "Contact", {
      ...form,
      artwork_title: artwork?.title || "",
      artwork_id: artwork?.id || "",
      artwork_price: artwork ? formatPrice(artwork.price) : "",
      page_url: window.location.href,
    });
    if (sent) setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }
  const heading = artwork ? "Artwork Inquiry" : topic === "commission" ? "Commission Request" : "Inquiry";
  const successTitle = artwork ? "Inquiry Received" : topic === "commission" ? "Commission Request Received" : "Message Received";
  return <PageShell active="contact"><section className="page-hero small"><p>Contact</p><h1>Start a Conversation</h1></section><section className="content-page narrow">{status.state === "success" ? <SuccessPanel title={successTitle} actions={<><a className="outline-button" href="/gallery">Return to Gallery <span>→</span></a><a className="primary-button" href="/">Continue Browsing <span>→</span></a></>}>{artwork && <p><strong>Artwork:</strong> {artwork.title}</p>}<p>Thank you. Your message has been sent to artYSion.</p><p>{topic === "commission" ? "We will review your commission request and contact you to discuss scope, timeline, and pricing." : "We will respond within 1–2 business days."}</p></SuccessPanel> : <><h2>{heading}</h2>{artwork && <div className="prefill-box"><strong>Artwork:</strong> {artwork.title}<br /><strong>Status:</strong> {artwork.status}{artwork.exclusive ? " · Exclusive" : ""}<br /><strong>Price:</strong> {formatPrice(artwork.price)}</div>}<form className="contact-form" onSubmit={handleSubmit}><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" /><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone optional" /><input required value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Subject" /><textarea required value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={artwork ? `I am interested in ${artwork.title}.` : "Message"}></textarea><button className="primary-button" type="submit" disabled={status.state === "submitting"}>Send Inquiry <span>→</span></button><FormStatus status={status} /></form></>}</section></PageShell>;
}

function validRequestTypesForArtwork(artwork) {
  if (!artwork) return ["print"];
  const types = ["print"];
  if (artwork.status === "available") types.unshift("original");
  if (artwork.status === "sold" && !artwork.exclusive) types.unshift("reproduction");
  return types;
}

function defaultRequestTypeForArtwork(artwork) {
  if (!artwork) return "print";
  if (artwork.status === "available") return "original";
  if (artwork.status === "sold" && !artwork.exclusive) return "reproduction";
  return "print";
}

function PaymentPage() {
  const params = new URLSearchParams(window.location.search);
  const initialArtworkId = params.get("artwork") || artworks.find((a) => a.status === "available")?.id || artworks[0]?.id;
  const initialArtwork = getArtworkById(initialArtworkId) || artworks[0];
  const requestedType = params.get("type");
  const initialType = validRequestTypesForArtwork(initialArtwork).includes(requestedType) ? requestedType : defaultRequestTypeForArtwork(initialArtwork);
  const [selectedId, setSelectedId] = useState(initialArtworkId);
  const [requestType, setRequestType] = useState(initialType);
  const [printSize, setPrintSize] = useState(siteConfig.printOptions[0]?.size || "");
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "", notes: "" });
  const { status, submitForm } = useWeb3Form();
  const artwork = getArtworkById(selectedId) || artworks[0];
  const validRequestTypes = validRequestTypesForArtwork(artwork);
  useEffect(() => {
    if (!validRequestTypes.includes(requestType)) {
      setRequestType(defaultRequestTypeForArtwork(artwork));
      setVerified(false);
    }
  }, [artwork?.id, requestType, validRequestTypes]);
  const selectedPrint = siteConfig.printOptions.find((option) => option.size === printSize) || siteConfig.printOptions[0];
  const requestLabel = requestType === "print" ? "Print Purchase Request" : requestType === "reproduction" ? "Reproduction Request" : "Original Artwork Purchase Request";
  const displayedPrice = requestType === "print" ? `${formatPrintPrice(selectedPrint.price)} + Shipping` : `${formatPrice(artwork.price)} + Shipping`;
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  async function handleSubmit(event) {
    event.preventDefault();
    if (!verified || !validRequestTypes.includes(requestType)) return;
    const sent = await submitForm(requestLabel, {
      artwork_title: artwork.title,
      artwork_id: artwork.id,
      artwork_status: artwork.status,
      artwork_exclusive: artwork.exclusive ? "Yes" : "No",
      request_type: requestType,
      price: displayedPrice,
      print_size: requestType === "print" ? printSize : "",
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      street_address: form.address,
      city: form.city,
      state: form.state,
      zip_postal_code: form.zip,
      country: form.country,
      notes: form.notes,
      confirmed_details: verified ? "Yes" : "No",
      page_url: window.location.href,
    });
    if (sent) {
      setVerified(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "", notes: "" });
    }
  }
  const successTitle = requestType === "print" ? "Print Request Received" : requestType === "reproduction" ? "Reproduction Request Received" : "Purchase Request Received";
  return (
    <PageShell active="payment">
      <section className="page-hero small"><p>Payment</p><h1>Request a Payment Link</h1></section>
      <section className="content-page purchase-page">
        {status.state === "success" ? (
          <SuccessPanel
            title={successTitle}
            actions={<><a className="outline-button" href={`/gallery/${artwork.id}`}>Return to Artwork <span>→</span></a><a className="primary-button" href="/gallery">Continue Browsing <span>→</span></a></>}
          >
            <p><strong>Artwork:</strong> {artwork.title}</p>
            <p><strong>Request:</strong> {requestLabel}</p>
            <p><strong>Estimated Price:</strong> {displayedPrice}</p>
            <p>Thank you. Availability and shipping will be verified, and a payment link including shipping charges will be sent within 24–48 hours.</p>
            <p>Your artwork or print is not reserved until payment is received. Orders are processed after payment is received.</p>
          </SuccessPanel>
        ) : (
          <div className="purchase-layout">
            <div className="purchase-card">
              <h2>Artwork Selection</h2>
              <label>Choose Artwork</label>
              <select value={selectedId} onChange={(e) => { const nextArtwork = getArtworkById(e.target.value); setSelectedId(e.target.value); setRequestType(defaultRequestTypeForArtwork(nextArtwork)); setVerified(false); }}>
                {artworks.map((art) => <option key={art.id} value={art.id}>{art.title} — {formatPrice(art.price)} — {art.status}{art.exclusive ? " / Exclusive" : ""}</option>)}
              </select>
              <label>Request Type</label>
              <select value={requestType} onChange={(e) => { setRequestType(e.target.value); setVerified(false); }}>
                <option value="original" disabled={artwork.status !== "available"}>Original Artwork Purchase</option>
                <option value="print">Premium Giclée Canvas Print</option>
                <option value="reproduction" disabled={artwork.exclusive || artwork.status !== "sold"}>Request Reproduction / Similar Artwork</option>
              </select>
              {requestType === "print" && <>
                <label>Print Size</label>
                <select value={printSize} onChange={(e) => setPrintSize(e.target.value)}>
                  {siteConfig.printOptions.map((option) => <option key={option.size} value={option.size}>{option.size} — {formatPrintPrice(option.price)}</option>)}
                </select>
              </>}
              {artwork && <div className="prefill-box"><strong>{artwork.title}</strong><br />{artwork.medium}<br />{artwork.dimensions}<br />{displayedPrice}<br />Status: {artwork.status}{artwork.exclusive ? " · Exclusive" : ""}</div>}
              <StatusExplanation artwork={artwork} />
              <p className="purchase-note">Final payment link will include shipping charges. Your artwork or print is not reserved until payment is received.</p>
              <PolicyNotes compact />
            </div>
            <div className="purchase-card">
              <h2>Buyer & Shipping Details</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="First name" />
                <input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Last name" />
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" />
                <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" />
                <input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street address" />
                <input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" />
                <input required value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State / Province" />
                <input required value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="ZIP / Postal code" />
                <input required value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Country" />
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Additional notes, framing preference, or questions"></textarea>
                <label className="verify-check"><input required type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> I confirm these contact and shipping details are correct. artYSion is not responsible for delays, delivery issues, or additional charges caused by incorrect information submitted by me.</label>
                <button className="primary-button" type="submit" disabled={!verified || !validRequestTypes.includes(requestType) || status.state === "submitting"}>Request Payment Link <span>→</span></button>
                <p className="purchase-note">Artwork availability will be verified and a payment link, including shipping charges, will be sent within 24–48 hours. Orders are processed after payment is received.</p>
                <FormStatus status={status} />
              </form>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default function App() {
  const path = currentPath();

  useEffect(() => {
    const blockImageActions = (event) => {
      if (event.target && event.target.tagName === "IMG") event.preventDefault();
    };
    document.addEventListener("contextmenu", blockImageActions);
    document.addEventListener("dragstart", blockImageActions);
    return () => {
      document.removeEventListener("contextmenu", blockImageActions);
      document.removeEventListener("dragstart", blockImageActions);
    };
  }, []);

  useEffect(() => {
    if (path === "/" && window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
    }
  }, [path]);

  if (path === "/gallery") return <GalleryPage />;
  if (path.startsWith("/gallery/")) return <ArtworkPage id={path.split("/").pop()} />;
  if (path === "/canvas-to-creation") return <CanvasToCreationPage />;
  if (path.startsWith("/canvas-to-creation/")) return <ProgressionPage id={path.split("/").pop()} />;
  if (path === "/art-sessions") return <ArtSessionsPage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/payment") return <PaymentPage />;
  if (path === "/contact") return <ContactPage />;
  return <HomePage />;
}
