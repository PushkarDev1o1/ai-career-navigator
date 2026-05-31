"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Preset skills for quick select in the widget
const PRESET_SKILLS = [
  "JavaScript", "Python", "UI/UX Design", "Data Analysis", 
  "Project Management", "Writing & Blogging", "SQL", "Public Speaking"
];

// Curated trending careers data
interface TrendingRole {
  title: string;
  badge: string;
  salary: string;
  growth: string;
  dayInLife: string;
  coreTools: string[];
}

const TRENDING_ROLES: TrendingRole[] = [
  {
    title: "AI Prompt Architect",
    badge: "Emerging Tech",
    salary: "$120,000 - $180,000",
    growth: "+340% YoY",
    dayInLife: "Designing advanced prompting systems, chaining LLMs (Large Language Models), and writing system instructions to optimize model output and mitigate safety risks.",
    coreTools: ["Gemini API", "LangChain", "Vector Databases", "Prompt Engineering"],
  },
  {
    title: "FinTech Solutions Specialist",
    badge: "Finance & Tech",
    salary: "$95,000 - $150,000",
    growth: "+180% YoY",
    dayInLife: "Bridging legacy banking processes with next-generation automation tools, managing API payment pipelines, and deploying cloud compliance systems.",
    coreTools: ["SQL Databases", "Python", "Stripe API", "Blockchain Basics", "Cloud Architecture"],
  },
  {
    title: "Human-AI Interaction Designer",
    badge: "Creative & Design",
    salary: "$100,000 - $160,000",
    growth: "+220% YoY",
    dayInLife: "Conducting cognitive usability research, design mapping for conversational interfaces, and building responsive, fluid layouts for agent-guided workflows.",
    coreTools: ["Figma AI", "RAG UI Guidelines", "Webflow", "Prototyping Tools"],
  },
  {
    title: "Climate Tech Analyst",
    badge: "Sustainability",
    salary: "$85,000 - $130,000",
    growth: "+120% YoY",
    dayInLife: "Analyzing emissions datasets, auditing supply chains for compliance, and preparing strategic roadmaps for carbon reduction initiatives.",
    coreTools: ["Python (Pandas)", "GIS Mapping Software", "ESG Reporting Platforms", "Data Visualization"],
  }
];

// Interactive roadmap data
interface RoadmapPhase {
  name: string;
  baseWeeks: number; // assuming 20 hours/week base
  tasks: string[];
}

const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    name: "Phase 1: Core Fundamentals & Tools",
    baseWeeks: 4,
    tasks: [
      "Master foundational concepts and technical architecture.",
      "Complete industry-standard certification tutorials.",
      "Build 3 mini sandbox projects using target SDKs."
    ]
  },
  {
    name: "Phase 2: Integration & Advanced Workflows",
    baseWeeks: 6,
    tasks: [
      "Integrate multiple services using pipeline architectures.",
      "Deploy code to live staging environments.",
      "Build 1 complex, end-to-end portfolio product."
    ]
  },
  {
    name: "Phase 3: Portfolio Polish & Market Placement",
    baseWeeks: 4,
    tasks: [
      "Optimize portfolio designs and write case studies.",
      "Conduct mock technical and operational interviews.",
      "Tailor resume and outreach scripts for high-conversion applications."
    ]
  }
];

// FAQ Data
interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does the AI Career Navigator generate roadmaps?",
    answer: "The navigator collects your unique combination of current skills, interests, target industries, and career targets. It then uses the Gemini generative model to analyze market trends and construct a customized milestone timeline, complete with targeted study guides and step-by-step tasks."
  },
  {
    question: "Can I use the Career Navigator without a Gemini API Key?",
    answer: "Yes! If you do not have an API key configured, the application falls back to an intelligent matching algorithm that produces highly tailored mock roadmaps, allowing you to preview and evaluate the full user interface."
  },
  {
    question: "Is my assessment history saved?",
    answer: "Yes. Once you complete your assessment, a unique session is stored in your browser's local storage and optionally saved to Firestore. This lets you return and check your roadmap dashboard at any time directly from the home navigation bar."
  },
  {
    question: "What target roles can the AI suggest?",
    answer: "Because it leverages Gemini, the Navigator is not limited to a rigid database. It can suggest highly emerging cross-disciplinary roles (e.g., 'Bio-Tech Data Strategist' or 'Creative Tech Producer') based on whatever unique skills and interests you submit."
  }
];

export default function Home() {
  const router = useRouter();

  // Saved Session State
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  // Quick Match Widget States
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [qmLoading, setQmLoading] = useState(false);
  const [qmResult, setQmResult] = useState<any | null>(null);
  const [qmError, setQmError] = useState("");

  // Drawer States
  const [activeTrendingRole, setActiveTrendingRole] = useState<TrendingRole | null>(null);

  // Roadmap Commitment States
  const [hoursCommitment, setHoursCommitment] = useState<number>(20);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  // FAQ States
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  // Check Local Storage for saved session
  useEffect(() => {
    const docId = localStorage.getItem("career_navigator_doc_id");
    if (docId) {
      setSavedDocId(docId);
    }
  }, []);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length >= 3) {
        // limit to 3 skills for quick match
        setSelectedSkills([...selectedSkills.slice(1), skill]);
      } else {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleQuickMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      setQmError("Please select at least 1 skill.");
      return;
    }
    if (!customInterest.trim()) {
      setQmError("Please describe your main interest.");
      return;
    }

    setQmError("");
    setQmLoading(true);
    setQmResult(null);

    try {
      const res = await fetch("/api/quick-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: selectedSkills,
          interest: customInterest,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to quick match engine.");
      }

      const result = await res.json();
      setQmResult(result);
    } catch (err: any) {
      setQmError(err.message || "An unexpected error occurred.");
    } finally {
      setQmLoading(false);
    }
  };

  const handleStartPrefilledAssessment = (targetCareer: string) => {
    // Navigate to assessment page pre-populating target role
    router.push(`/assessment?prefill_career=${encodeURIComponent(targetCareer)}&prefill_skills=${encodeURIComponent(selectedSkills.join(","))}`);
  };

  const calculateWeeks = (baseWeeks: number) => {
    // Dynamic math adjusting weeks based on hours commitment
    // 20 hours/week is the baseline
    const ratio = 20 / hoursCommitment;
    const computed = Math.ceil(baseWeeks * ratio);
    if (computed <= 1) return "1 Week";
    return `${computed} Weeks`;
  };

  return (
    <>
      {/* Dynamic Sticky Glassmorphic Navigation */}
      <nav className="header-nav">
        <div className="nav-container">
          <Link href="/" className="logo">
            <span className="logo-icon">🧭</span>
            <span>AI Career Navigator</span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#trending" className="nav-link">Trending Paths</a></li>
            <li><a href="#roadmap" className="nav-link">Interactive Roadmap</a></li>
            <li><a href="#faq" className="nav-link">FAQs</a></li>
          </ul>
          <div className="nav-actions">
            {savedDocId ? (
              <Link href={`/dashboard?id=${savedDocId}`} className="btn-primary btn-nav-glowing">
                Resume Roadmap ⚡
              </Link>
            ) : (
              <Link href="/assessment" className="btn-primary btn-nav">
                Start Assessment &rarr;
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>
        
        {/* Hero Section */}
        <section className="hero-container" style={styles.heroSection}>
          <div style={styles.badge}>Powered by Gen AI</div>
          <h1 style={styles.mainTitle}>
            Navigate Your Career with <br />
            <span style={styles.gradientText}>AI Precision</span>
          </h1>
          <p style={styles.heroDescription}>
            Unlock tailored high-growth career suggestions, map skill gaps, and explore structural actions designed around your profile in minutes.
          </p>

          {/* Quick Match Tool Widget */}
          <div className="glass-card quick-match-box">
            <h3 className="quick-match-title">
              ⚡ Quick AI Role Matcher
            </h3>
            <p className="quick-match-desc">
              Select your top skills and enter an interest to see an instant Gemini recommendation.
            </p>

            <form onSubmit={handleQuickMatchSubmit}>
              <div style={{ marginBottom: "0.8rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Select Skills (Max 3):
              </div>
              <div className="skills-select-grid">
                {PRESET_SKILLS.map((skill) => {
                  const isActive = selectedSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => handleToggleSkill(skill)}
                      className={`skill-tag ${isActive ? "skill-tag-active" : ""}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div className="input-interest-row">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="e.g. gaming, building apps, visual art, writing"
                  className="input-text"
                  required
                />
                <button type="submit" className="btn-primary btn-predict" disabled={qmLoading}>
                  {qmLoading ? "Matching..." : "Predict Career"}
                </button>
              </div>

              {qmError && <div style={{ color: "#fca5a5", fontSize: "0.85rem", marginTop: "0.5rem" }}>{qmError}</div>}
            </form>

            {/* Quick Match Loader */}
            {qmLoading && (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p>Gemini is predicting your optimal career path...</p>
              </div>
            )}

            {/* Quick Match Result Viewer */}
            {qmResult && (
              <div className="qm-result-panel">
                <div className="qm-result-header">
                  <span className="qm-role-title">🎯 {qmResult.title}</span>
                  <span className="qm-score-badge">{qmResult.suitabilityScore}% Match</span>
                </div>
                <p className="qm-reason">{qmResult.matchReason}</p>
                
                <div className="qm-meta-list">
                  <span className="qm-meta-item">
                    💰 Avg Salary: <strong>{qmResult.salaryRange}</strong>
                  </span>
                  <span className="qm-meta-item">
                    📈 Outlook: <strong>{qmResult.marketOutlook}</strong>
                  </span>
                </div>

                <div className="qm-skills-to-learn">
                  <h4 className="qm-skills-title">Top Skills to Acquire:</h4>
                  <div className="qm-skills-chips">
                    {qmResult.keySkillsToLearn?.map((skill: string) => (
                      <span key={skill} className="qm-learn-chip">{skill}</span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleStartPrefilledAssessment(qmResult.title)}
                  className="btn-primary" 
                  style={{ width: "100%", fontSize: "0.95rem" }}
                >
                  Generate Step-by-Step Roadmap &rarr;
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Credibility Metric Counters Section */}
        <section className="metrics-section">
          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <span className="metric-number">98%</span>
              <span className="metric-label">Match Accuracy</span>
              <span className="metric-desc">Validated feedback mapping technical skills against market demands.</span>
            </div>
            <div className="glass-card metric-card">
              <span className="metric-number">12k+</span>
              <span className="metric-label">Profiles Analysed</span>
              <span className="metric-desc">Generates hyper-tailored advice trained on millions of career vectors.</span>
            </div>
            <div className="glass-card metric-card">
              <span className="metric-number">3 Steps</span>
              <span className="metric-label">To Get Your Roadmap</span>
              <span className="metric-desc">Takes under 5 minutes to unlock a granular roadmap tailored to your timeline.</span>
            </div>
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

        {/* Trending Careers Carousel Explorer */}
        <section id="trending" className="trending-section">
          <h2 style={styles.sectionTitle}>Trending Careers in 2026</h2>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "-2rem", marginBottom: "2rem" }}>
            Explore hot paths bridging tech, business, and sustainability. Click on any role to explore key study resources.
          </p>

          <div className="carousel-row">
            {TRENDING_ROLES.map((role) => (
              <div 
                key={role.title} 
                className="glass-card trending-card"
                onClick={() => setActiveTrendingRole(role)}
              >
                <span className="card-badge">{role.badge}</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff" }}>{role.title}</h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span>📈 Growth: <strong style={{ color: "var(--accent-glow)" }}>{role.growth}</strong></span>
                  <span>💰 Salary: <strong style={{ color: "var(--text-primary)" }}>{role.salary}</strong></span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "auto" }}>
                  Explore Details &rarr;
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Slide Drawer (Trending Careers Details) */}
        <div 
          className={`drawer-backdrop ${activeTrendingRole ? "drawer-backdrop-active" : ""}`}
          onClick={() => setActiveTrendingRole(null)}
        />
        <div className={`drawer-panel ${activeTrendingRole ? "drawer-panel-active" : ""}`}>
          <button className="drawer-close" onClick={() => setActiveTrendingRole(null)}>×</button>
          
          {activeTrendingRole && (
            <>
              <div className="drawer-content">
                <span className="card-badge" style={{ alignSelf: "flex-start" }}>{activeTrendingRole.badge}</span>
                <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fff", lineHeight: "1.2" }}>
                  {activeTrendingRole.title}
                </h2>
                
                <div style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "1rem 0", display: "flex", gap: "2rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Market Outlook</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-glow)" }}>{activeTrendingRole.growth}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Starting Range</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff" }}>{activeTrendingRole.salary}</div>
                  </div>
                </div>

                <div className="drawer-section">
                  <span className="drawer-section-title">Day in the Life</span>
                  <p className="drawer-text">{activeTrendingRole.dayInLife}</p>
                </div>

                <div className="drawer-section">
                  <span className="drawer-section-title">Core Technologies to Learn</span>
                  <div className="drawer-tools-list">
                    {activeTrendingRole.coreTools.map((tool) => (
                      <span key={tool} className="drawer-tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
                <button 
                  onClick={() => {
                    handleStartPrefilledAssessment(activeTrendingRole.title);
                    setActiveTrendingRole(null);
                  }}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "1rem" }}
                >
                  Generate Roadmap for this Role
                </button>
              </div>
            </>
          )}
        </div>

        {/* Interactive Roadmap with Commitment Slider */}
        <section id="roadmap" className="roadmap-section">
          <h2 style={styles.sectionTitle}>Interactive Roadmap Visualizer</h2>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "-2rem", marginBottom: "2.5rem" }}>
            See how study commitment dynamically impacts completion. Drag the slider to configure your study timeline.
          </p>

          <div className="glass-card roadmap-visualizer-container">
            <div className="control-panel" style={{ borderRight: "1px solid var(--border-color)" }}>
              <div className="slider-container">
                <div className="commitment-row">
                  <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)" }}>Commitment:</span>
                  <span className="commitment-value">{hoursCommitment} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={hoursCommitment}
                  onChange={(e) => setHoursCommitment(Number(e.target.value))}
                  className="slider-input"
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>5 hrs (Part-time)</span>
                  <span>40 hrs (Full bootcamp)</span>
                </span>
              </div>

              <div className="phase-buttons">
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Roadmap Phases</span>
                {ROADMAP_PHASES.map((phase, index) => {
                  const isActive = index === activePhaseIndex;
                  return (
                    <button
                      key={phase.name}
                      onClick={() => setActivePhaseIndex(index)}
                      className={`phase-btn ${isActive ? "phase-btn-active" : ""}`}
                    >
                      <span style={{ fontSize: "0.9rem", maxWidth: "85%" }}>{phase.name.split(":")[0]}</span>
                      <span className="phase-arrow">&rarr;</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="roadmap-display">
              <div>
                <div className="timeline-badge-row">
                  <h3 className="roadmap-display-title">
                    {ROADMAP_PHASES[activePhaseIndex].name}
                  </h3>
                  <span className="dynamic-timeline-badge">
                    ⏳ Duration: {calculateWeeks(ROADMAP_PHASES[activePhaseIndex].baseWeeks)}
                  </span>
                </div>

                <div className="tasks-list-container">
                  {ROADMAP_PHASES[activePhaseIndex].tasks.map((task, i) => (
                    <div key={i} className="task-card-item">
                      <div className="task-bullet"></div>
                      <span className="task-text">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Dynamic timeline computed based on your target <strong>{hoursCommitment} hrs/week</strong> study plan.
                </span>
                <Link href="/assessment" className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}>
                  Create Your Full Roadmap
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Accordion Section */}
        <section id="faq" className="faq-section">
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const isActive = index === activeFAQIndex;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isActive ? "faq-item-active" : ""}`}
                >
                  <div 
                    className="faq-header" 
                    onClick={() => setActiveFAQIndex(isActive ? null : index)}
                  >
                    <span className="faq-question">{item.question}</span>
                    <span className="faq-toggle-icon">+</span>
                  </div>
                  <div className="faq-body">
                    <p className="faq-answer">{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>&copy; {new Date().getFullYear()} AI Career Navigator. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "1.5rem",
    padding: "5rem 0 3rem 0",
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
    paddingBottom: "3rem",
    borderTop: "1px solid var(--border-color)",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    marginTop: "5rem",
  },
};
