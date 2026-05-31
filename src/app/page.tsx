import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <main style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.badge}>Powered by Gen AI</div>
        <h1 style={styles.mainTitle}>
          Navigate Your Career with <br />
          <span style={styles.gradientText}>AI Precision</span>
        </h1>
        <p style={styles.heroDescription}>
          Discover tailored career paths, identify and bridge skill gaps, and explore structural action roadmaps designed around your unique profile.
        </p>

        <div style={styles.ctaGroup}>
          <Link href="/assessment" className="btn-primary" style={styles.heroCta}>
            Start Assessment &rarr;
          </Link>
          <a href="#features" className="btn-secondary" style={styles.heroCta}>
            Learn More
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>What the Navigator Offers</h2>
        <div style={styles.grid}>
          <div className="glass-card" style={styles.featureCard}>
            <div style={{ ...styles.iconBg, background: "rgba(99, 102, 241, 0.15)" }}>🧭</div>
            <h3 style={styles.cardTitle}>Dynamic Assessment</h3>
            <p style={styles.cardDesc}>
              A comprehensive multi-dimensional self-evaluation capturing skills, personal interests, work styles, and salary goals.
            </p>
          </div>

          <div className="glass-card" style={styles.featureCard}>
            <div style={{ ...styles.iconBg, background: "rgba(168, 85, 247, 0.15)" }}>🤖</div>
            <h3 style={styles.cardTitle}>Gemini AI Brain</h3>
            <p style={styles.cardDesc}>
              Generates granular, real-time career matching, complete with exact positions, transition difficulty, and industry outlook.
            </p>
          </div>

          <div className="glass-card" style={styles.featureCard}>
            <div style={{ ...styles.iconBg, background: "rgba(6, 182, 212, 0.15)" }}>📈</div>
            <h3 style={styles.cardTitle}>Structured Roadmaps</h3>
            <p style={styles.cardDesc}>
              Provides actionable learning plans, recommended technologies to learn, and step-by-step milestones to land your dream job.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} AI Career Navigator. All rights reserved.</p>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "4rem 2rem 2rem 2rem",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "1.5rem",
    padding: "6rem 0",
  },
  badge: {
    padding: "0.5rem 1rem",
    borderRadius: "30px",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--accent-glow)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  mainTitle: {
    fontSize: "4.2rem",
    fontWeight: "800",
    lineHeight: "1.1",
    letterSpacing: "-1.5px",
    color: "var(--text-primary)",
  },
  gradientText: {
    background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-glow) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDescription: {
    fontSize: "1.25rem",
    color: "var(--text-secondary)",
    maxWidth: "680px",
    lineHeight: "1.6",
  },
  ctaGroup: {
    display: "flex",
    gap: "1.2rem",
    marginTop: "1.5rem",
  },
  heroCta: {
    minWidth: "160px",
    fontSize: "1.05rem",
    padding: "0.9rem 1.8rem",
  },
  featuresSection: {
    padding: "5rem 0",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "3rem",
    background: "linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  featureCard: {
    padding: "2.5rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    textAlign: "left",
  },
  iconBg: {
    fontSize: "2.2rem",
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  cardDesc: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
  },
  footer: {
    textAlign: "center",
    paddingTop: "4rem",
    borderTop: "1px solid var(--border-color)",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
  },
};

\




git commit -m "Update background to premium OLED black"
git push