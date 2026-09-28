"use client";

import React from "react";
import "./AboutLookbookPrint.scss";

export default function AboutLookbookPrint() {
  return (
    <div id="dod-lookbook-printable" className="lookbook-print-container">
      {/* ── Page 1: Cover Page ── */}
      <section className="print-page print-page--cover">
        <div className="page-border">
          <div className="cover-content">
            <div className="cover-medallion">
              <span className="medallion-brand">DESIGNS OF DREAMS</span>
            </div>

            <h1 className="cover-title">THE LOOKBOOK</h1>
            <p className="cover-tagline">Crafted Traditions. Timeless Style.</p>

            <div className="flourish-divider">
              <span>❧ ❦ ☙</span>
            </div>

            <p className="cover-motto">
              &ldquo;Where every thread tells a story,<br />
              and every design becomes a dream.&rdquo;
            </p>

            <div className="cover-categories">
              <span>SAREES</span>
              <span className="dot">•</span>
              <span>DRESS MATERIALS</span>
              <span className="dot">•</span>
              <span>DUPATTAS</span>
              <span className="dot">•</span>
              <span>BLOUSES</span>
              <span className="dot">•</span>
              <span>TASSEL DETAILS</span>
              <span className="dot">•</span>
              <span>FINE CRAFTSMANSHIP</span>
            </div>

            <div className="cover-footer">
              <p>Premium elegance rooted in traditional Indian craftsmanship</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page 2: Our Story ── */}
      <section className="print-page print-page--story">
        <div className="page-border">
          <div className="story-content">
            <h2 className="section-heading">OUR STORY</h2>
            <p className="section-subheading">Crafting dreams. Supporting artisans.</p>

            <div className="story-paragraphs">
              <p>
                <strong>Designs of Dreams</strong> began in <strong>late 2025</strong> with a purpose:
                to create sustainable employment opportunities for local artisans, especially rural women,
                whose skills and traditional embroidery deserve recognition.
              </p>
              <p>
                We believe every handcrafted piece carries more than colour, texture and design.
                It carries patience, heritage, identity and the story of the hands that created it.
              </p>
              <p>
                Our aim is to support artisans with dignified work, financial independence and a platform
                where their craft can reach homes, celebrations and wardrobes across generations.
              </p>
            </div>

            <div className="story-pillars-box">
              <div className="pillar-item">
                <span className="pillar-title">TRADITIONAL CRAFT</span>
              </div>
              <span className="pillar-sep">|</span>
              <div className="pillar-item">
                <span className="pillar-title">CONTEMPORARY GRACE</span>
              </div>
              <span className="pillar-sep">|</span>
              <div className="pillar-item">
                <span className="pillar-title">MADE WITH PURPOSE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page 3: Saree Collection ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>DRAPES THAT TELL STORIES</span>
              <span>WEAR • CELEBRATE • SUPPORT • SUSTAIN</span>
            </div>
            <h2 className="collection-title">Saree Collection</h2>
            <span className="lookbook-badge">LOOKBOOK</span>
            <div className="sub-tag">TRADITION | CRAFTSMANSHIP | TIMELESS ELEGANCE</div>
          </div>

          <div className="items-grid-8">
            <div className="grid-card">
              <h4>Royal Red</h4>
              <p>Bold. Beautiful. Traditional.</p>
            </div>
            <div className="grid-card">
              <h4>Vibrant Red</h4>
              <p>Heritage in every thread.</p>
            </div>
            <div className="grid-card">
              <h4>Elegant Grey</h4>
              <p>Subtle hues, striking details.</p>
            </div>
            <div className="grid-card">
              <h4>Classic Blue</h4>
              <p>Art in every weave.</p>
            </div>
            <div className="grid-card">
              <h4>Together in Colour</h4>
              <p>Sisterhood in every drape.</p>
            </div>
            <div className="grid-card">
              <h4>Festive White</h4>
              <p>Grace for every celebration.</p>
            </div>
            <div className="grid-card">
              <h4>Friends & Forever</h4>
              <p>Traditions that bring us together.</p>
            </div>
            <div className="grid-card">
              <h4>Pure Elegance</h4>
              <p>Always in style.</p>
            </div>
          </div>

          <div className="collection-footer">
            <p className="cursive-tag">Sarees for every story</p>
            <div className="footer-values">
              <span>✦ Empowering Artisans</span>
              <span>✦ Sustainable Fashion</span>
              <span>✦ Timeless Pieces</span>
            </div>
            <p className="footer-quote">More than fashion, A brighter tomorrow ♡</p>
          </div>
        </div>
      </section>

      {/* ── Page 4: Dress Material Collection ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>THREADS || TRADITIONS || PEOPLE || STORIES</span>
            </div>
            <h2 className="collection-title">Dress Material Collection</h2>
            <p className="collection-desc">Handcrafted details, timeless expression.</p>
          </div>

          <div className="items-list-box">
            <div className="list-feature">
              <h4>Bespoke Yoke & Neckline Embroidery</h4>
              <p>Fine needlework in floral, geometric, and peacock motifs, meticulously hand-done on breathable premium fabrics.</p>
            </div>
            <div className="list-feature">
              <h4>Artisanal Chikankari & Zardozi</h4>
              <p>Every set carries months of patience and artistry by rural women artisans, keeping age-old traditions thriving.</p>
            </div>
            <div className="list-feature">
              <h4>Vibrant & Natural Dyes</h4>
              <p>From royal purples and forest greens to cheerful pastels and heritage indigos.</p>
            </div>
          </div>

          <div className="bottom-motto-strip">
            <span>Traditional Craft | Contemporary Grace | Made with Purpose</span>
            <strong>MORE THAN FABRIC, A FEELING</strong>
          </div>
        </div>
      </section>

      {/* ── Page 5: Dupatta Collection ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>DETAILS THAT MAKE YOU UNIQUE</span>
            </div>
            <h2 className="collection-title">Duppatta Collection</h2>
            <div className="sub-tag">HERITAGE | HANDCRAFTED | TIMELESS</div>
          </div>

          <div className="features-grid-6">
            <div className="feat-box">
              <span className="feat-num">01</span>
              <h4>PLAYFUL TRIM</h4>
              <p>Vibrant tassels that add movement and charm.</p>
            </div>
            <div className="feat-box">
              <span className="feat-num">02</span>
              <h4>ELEGANT DRAPE</h4>
              <p>Traditional patterns for a contemporary look.</p>
            </div>
            <div className="feat-box">
              <span className="feat-num">03</span>
              <h4>ARTISANAL BEAUTY</h4>
              <p>Intricate embroidery that tells a story.</p>
            </div>
            <div className="feat-box">
              <span className="feat-num">04</span>
              <h4>ROYAL DETAIL</h4>
              <p>Rich embellishments for a regal touch.</p>
            </div>
            <div className="feat-box">
              <span className="feat-num">05</span>
              <h4>MINIMAL CHARM</h4>
              <p>Subtle embroidery with timeless appeal.</p>
            </div>
            <div className="feat-box">
              <span className="feat-num">06</span>
              <h4>IKAT ELEGANCE</h4>
              <p>Bold weaves, vibrant traditions.</p>
            </div>
          </div>

          <div className="collection-footer">
            <p className="cursive-tag">Drape Your Story ♡</p>
          </div>
        </div>
      </section>

      {/* ── Page 6: Blouse Tassels Collection ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>TRADITIONAL DETAILS || MODERN APPEAL</span>
            </div>
            <h2 className="collection-title">Blouse Tassels Collection</h2>
            <div className="sub-tag">DETAIL | DRAPE | DESIGN | DELIGHT</div>
            <p className="collection-desc">Every tassel tells a story. Add the perfect finish to your blouse.</p>
          </div>

          <div className="features-grid-9">
            <div className="feat-box-sm"><span>01</span> Teal Coin Charm</div>
            <div className="feat-box-sm"><span>02</span> Emerald Elegance</div>
            <div className="feat-box-sm"><span>03</span> Graceful Clusters</div>
            <div className="feat-box-sm"><span>04</span> Traditional Jhumkas</div>
            <div className="feat-box-sm"><span>05</span> Elegant Drop Detail</div>
            <div className="feat-box-sm"><span>06</span> Regal Tassel Line</div>
            <div className="feat-box-sm"><span>07</span> Vibrant Fringe</div>
            <div className="feat-box-sm"><span>08</span> Festive Hangings</div>
            <div className="feat-box-sm"><span>09</span> Royal Latkan</div>
          </div>

          <div className="collection-footer">
            <p className="cursive-tag">Tassels Complete The Look ♡</p>
          </div>
        </div>
      </section>

      {/* ── Page 7: Unstitched Blouses Collection ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>TRADITION IN EVERY STITCH</span>
            </div>
            <h2 className="collection-title">Unstitched Blouses Collection</h2>
            <div className="sub-tag">EMBROIDER | CUSTOMISE | REIMAGINE</div>
            <p className="collection-desc">Blouse pieces for endless possibilities. Stitch your story.</p>
          </div>

          <div className="features-grid-9">
            <div className="feat-box-sm"><span>01</span> Ruby Radiance</div>
            <div className="feat-box-sm"><span>02</span> Fresh Fusion</div>
            <div className="feat-box-sm"><span>03</span> Colour Cascade</div>
            <div className="feat-box-sm"><span>04</span> Mirror Muse</div>
            <div className="feat-box-sm"><span>05</span> Floral Whispers</div>
            <div className="feat-box-sm"><span>06</span> Royal Blue Bloom</div>
            <div className="feat-box-sm"><span>07</span> Festive Flair</div>
            <div className="feat-box-sm"><span>08</span> Peacock Garden</div>
            <div className="feat-box-sm"><span>09</span> Regal Geometry</div>
          </div>

          <div className="collection-footer">
            <p className="cursive-tag">Unstitched today, Infinite tomorrows ♡</p>
          </div>
        </div>
      </section>

      {/* ── Page 8: Fine Craftsmanship ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <h2 className="collection-title">FINE CRAFTSMANSHIP</h2>
            <p className="section-subheading">The art of embroidery, expressed through every stitch</p>
            <div className="sub-tag">Intricate threadwork • Handcrafted texture • Timeless detail</div>
          </div>

          <div className="craft-list">
            <div className="craft-item">
              <span className="craft-num">01</span>
              <div>
                <strong>EMBROIDERED SAREE:</strong>
                <span> A richly detailed canvas of colour and tradition.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">02</span>
              <div>
                <strong>TEXTURED THREADWORK:</strong>
                <span> Layered motifs that celebrate textile artistry.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">03</span>
              <div>
                <strong>ORNAMENTAL MOTIF:</strong>
                <span> Fine threads, reflective accents and symmetry.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">04</span>
              <div>
                <strong>FOLK FLORAL CRAFT:</strong>
                <span> Handworked petals shaped with warmth and character.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">05</span>
              <div>
                <strong>BOTANICAL EMBROIDERY:</strong>
                <span> Delicate rosework with graceful tonal depth.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">06</span>
              <div>
                <strong>CONTEMPORARY THREAD ART:</strong>
                <span> Bold colour balanced with refined detailing.</span>
              </div>
            </div>
            <div className="craft-item">
              <span className="craft-num">07</span>
              <div>
                <strong>FLORAL FINISHING DETAIL:</strong>
                <span> A complete ensemble brought alive by embroidery.</span>
              </div>
            </div>
          </div>

          <div className="collection-footer">
            <div className="sub-tag">TRADITION | PRECISION | ARTISANSHIP</div>
            <p className="footer-quote">
              Designs of Dreams • Where every thread tells a story, and every design becomes a dream.
            </p>
          </div>
        </div>
      </section>

      {/* ── Page 9: Local Artisans ── */}
      <section className="print-page">
        <div className="page-border">
          <div className="collection-header">
            <div className="header-meta">
              <span>PEOPLE || CRAFT || CULTURE || SUSTAINABLE FUTURES</span>
            </div>
            <h2 className="collection-title">Local Artisans</h2>
            <p className="section-subheading">Real People. Real Craft. Real Impact.</p>
            <div className="sub-tag">TRADITION | EMPOWERMENT | TOGETHER</div>
          </div>

          <div className="artisans-box">
            <h3>We Create Opportunities</h3>
            <p>
              At Designs of Dreams, we work closely with skilled local artisans who keep alive India&apos;s rich textile and embroidery heritage. Our pieces are a result of their talent, dedication and years of practice passed down through generations.
            </p>
            <p>
              By creating sustainable employment opportunities, we aim to support artisan communities, preserve traditional crafts and bring their beautiful work to a wider platform.
            </p>
          </div>

          <div className="artisan-pillars-grid">
            <div className="art-pill">✦ SUPPORTING LOCAL TALENT</div>
            <div className="art-pill">✦ SUSTAINABLE LIVELIHOODS</div>
            <div className="art-pill">✦ PRESERVING TRADITIONAL CRAFTS</div>
            <div className="art-pill">✦ BEAUTIFUL HANDMADE CREATIONS</div>
          </div>

          <div className="collection-footer">
            <p className="footer-motto">
              CRAFTING A KINDER, BRIGHTER TOMORROW — ONE STITCH AT A TIME ♡
            </p>
          </div>
        </div>
      </section>

      {/* ── Page 10: Thank You & Connect ── */}
      <section className="print-page print-page--thankyou">
        <div className="page-border">
          <h2 className="thankyou-title">THANK YOU</h2>
          <p className="thankyou-sub">FOR BEING A PART OF OUR JOURNEY</p>

          <div className="flourish-divider">
            <span>❧ ❦ ☙</span>
          </div>

          <p className="thankyou-body">
            Together, we celebrate tradition, empower artisans and keep the beauty of handcrafted fashion alive.
          </p>

          <div className="thankyou-values">
            <span>EMPOWERING ARTISANS</span>
            <span>•</span>
            <span>SUSTAINABLE FASHION</span>
            <span>•</span>
            <span>TIMELESS PIECES</span>
            <span>•</span>
            <span>A BRIGHTER TOMORROW</span>
          </div>

          <div className="contact-box-print">
            <h4>STAY CONNECTED</h4>
            <p className="insta-handle">@DESIGNS.OF.DREAMS</p>
            <p className="phone-line">Call / WhatsApp: <strong>7600074585</strong></p>
          </div>

          <div className="collection-footer">
            <p className="cursive-tag">More than fashion, A brighter tomorrow ♡</p>
          </div>
        </div>
      </section>
    </div>
  );
}
