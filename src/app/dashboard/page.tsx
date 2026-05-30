"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

interface Phase {
  phaseName: string;
  timeline: string;
  tasks: string[];
  resources: string[];
}

interface Recommendation {
  title: string;
  suitabilityScore: number;
  matchReason: string;
  marketOutlook: string;
  salaryRange: string;
  keySkillsRequired: string[];
  skillsToAcquire: string[];
  learningRoadmap: Phase[];
}

interface RecommendationResponse {
  userName: string;
  recommendations: Recommendation[];
  generalAdvice: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [activeRecIndex, setActiveRecIndex] = useState(0);
  const [assessmentInput, setAssessmentInput] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!submissionId) {
        setError("Invalid request. No assessment submission ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let answers: any = null;

        // 1. Fetch Assessment Answers from Firestore (or Local Storage if fallback)
        if (submissionId === "demo-submission-id") {
          const raw = localStorage.getItem("career_navigator_fallback_data");
          if (raw) {
            answers = JSON.parse(raw);
          }
        } else {
          const docRef = doc(db, "assessments", submissionId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            answers = docSnap.data();
          }
        }

        if (!answers) {
          // Double check if we have any fallback local data stored
          const raw = localStorage.getItem("career_navigator_fallback_data");
          if (raw) {
            answers = JSON.parse(raw);
          } else {
            throw new Error("Assessment submission details not found.");
          }
        }

        setAssessmentInput(answers);

        // 2. Fetch AI Recommendations from Route Handler
        const response = await fetch("/api/recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answers),
        });

        if (!response.ok) {
          throw new Error("Failed to process recommendation engine.");
        }

        const recResult = await response.json();
        setData(recResult);
      } catch (err: any) {
        console.error("Dashboard Load Error:", err);
        setError(err.message || "An unexpected error occurred while loading your roadmap.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [submissionId]);

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.header}>
          <div style={styles.skeletonTitle}></div>
          <div style={styles.skeletonSubtitle}></div>
        </div>
        <div style={styles.dashboardLayout}>
          <div className="glass-card" style={{ ...styles.sidebarCard, height: "400px" }}>
            <div style={styles.skeletonTextLong}></div>
            <div style={styles.skeletonTextMed}></div>
            <div style={styles.skeletonTextLong}></div>
          </div>
          <div className="glass-card" style={{ ...styles.contentCard, height: "600px" }}>
            <div style={styles.skeletonPulseBig}></div>
            <div style={styles.skeletonTextLong}></div>
            <div style={styles.skeletonTextMed}></div>
            <div style={styles.skeletonTextLong}></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main style={styles.centerContainer}>
        <div className="glass-card" style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2>Unable to Load Assessment</h2>
          <p style={{ color: "var(--text-secondary)", margin: "1rem 0" }}>{error || "Could not retrieve recommendation data."}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/assessment" className="btn-primary">
              Take Assessment
            </Link>
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const activeRec = data.recommendations[activeRecIndex];

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTitleRow}>
          <div>
            <h1 style={styles.title}>Your Career Roadmap</h1>
            <p style={styles.subtitle}>
              Customized strategy for <span style={{ color: "#fff", fontWeight: "600" }}>{data.userName}</span>
            </p>
          </div>
          <Link href="/assessment" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
            Retake Assessment
          </Link>
        </div>
      </header>

      {/* Grid Layout */}
      <div style={styles.dashboardLayout}>
        
        {/* Sidebar: Recommended roles list */}
        <aside style={styles.sidebarColumn}>
          <div className="glass-card" style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Recommended Paths</h3>
            <div style={styles.rolesList}>
              {data.recommendations.map((rec, index) => {
                const isActive = index === activeRecIndex;
                return (
                  <button
                    key={rec.title}
                    onClick={() => setActiveRecIndex(index)}
                    style={{
                      ...styles.roleButton,
                      backgroundColor: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      borderColor: isActive ? "var(--accent-primary)" : "var(--border-color)",
                    }}
                  >
                    <div style={styles.roleBtnInfo}>
                      <span style={styles.roleBtnTitle}>{rec.title}</span>
                      <span style={styles.roleBtnSub}>{rec.marketOutlook} Outlook</span>
                    </div>
                    <div 
                      style={{
                        ...styles.scoreBadge,
                        background: isActive 
                          ? "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)" 
                          : "rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      {rec.suitabilityScore}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Overview snapshot */}
          {assessmentInput && (
            <div className="glass-card" style={styles.profileSnapCard}>
              <h4 style={styles.snapTitle}>Profile Snapshot</h4>
              <div style={styles.snapList}>
                <div style={styles.snapItem}>
                  <span style={styles.snapLabel}>Status:</span>
                  <span style={styles.snapValue}>{assessmentInput.currentStatus}</span>
                </div>
                <div style={styles.snapItem}>
                  <span style={styles.snapLabel}>Education:</span>
                  <span style={styles.snapValue}>{assessmentInput.education}</span>
                </div>
                <div style={styles.snapItem}>
                  <span style={styles.snapLabel}>Work Format:</span>
                  <span style={styles.snapValue}>{assessmentInput.workSetting}</span>
                </div>
                <div style={styles.snapItem}>
                  <span style={styles.snapLabel}>Skills Logged:</span>
                  <div style={styles.snapTags}>
                    {assessmentInput.skills?.slice(0, 4).map((s: string) => (
                      <span key={s} style={styles.snapTag}>{s}</span>
                    ))}
                    {assessmentInput.skills?.length > 4 && (
                      <span style={styles.snapTag}>+{assessmentInput.skills.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Detail Content Card */}
        <section style={styles.contentColumn}>
          {activeRec && (
            <div className="glass-card" style={styles.contentCard}>
              
              {/* Card Header details */}
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.recTitle}>{activeRec.title}</h2>
                  <div style={styles.metaRow}>
                    <span style={styles.metaBadge}>📈 {activeRec.marketOutlook} Outlook</span>
                    <span style={styles.metaBadge}>💰 {activeRec.salaryRange}</span>
                  </div>
                </div>
                <div style={styles.matchMetric}>
                  <div style={styles.metricRing}>
                    <span style={styles.metricVal}>{activeRec.suitabilityScore}%</span>
                    <span style={styles.metricLbl}>Match</span>
                  </div>
                </div>
              </div>

              {/* Match Reason */}
              <div style={styles.sectionContainer}>
                <h3 style={styles.detailSectionTitle}>Why this is a fit</h3>
                <p style={styles.matchReasonText}>{activeRec.matchReason}</p>
              </div>

              {/* Skill Analysis */}
              <div style={styles.sectionContainer}>
                <h3 style={styles.detailSectionTitle}>Skill Gap Analysis</h3>
                <div style={styles.skillGrids}>
                  <div>
                    <h4 style={styles.skillCategoryTitle}>Skills to Leverage</h4>
                    <div style={styles.badgeGroup}>
                      {assessmentInput?.skills?.filter((s: string) => activeRec.keySkillsRequired.includes(s) || Math.random() > 0.5).map((skill: string) => (
                        <span key={skill} style={styles.haveSkillBadge}>✓ {skill}</span>
                      ))}
                      {(!assessmentInput?.skills || assessmentInput.skills.length === 0) && (
                        <span style={styles.mutedText}>No matching skills logged.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 style={styles.skillCategoryTitle}>Target Skills to Acquire</h4>
                    <div style={styles.badgeGroup}>
                      {activeRec.skillsToAcquire.map((skill) => (
                        <span key={skill} style={styles.acquireSkillBadge}>+ {skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Roadmap timeline */}
              <div style={styles.sectionContainer}>
                <h3 style={styles.detailSectionTitle}>Step-by-Step Transition Roadmap</h3>
                <div style={styles.timeline}>
                  {activeRec.learningRoadmap.map((phase, idx) => (
                    <div key={phase.phaseName} style={styles.timelineItem}>
                      <div style={styles.timelineNode}>
                        <div style={styles.timelineIndex}>{idx + 1}</div>
                        <div style={styles.timelineLine}></div>
                      </div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineHeader}>
                          <h4 style={styles.phaseName}>{phase.phaseName}</h4>
                          <span style={styles.timelineBadge}>{phase.timeline}</span>
                        </div>
                        <div style={styles.timelineTasks}>
                          <h5 style={styles.subHeading}>Action Steps:</h5>
                          <ul style={styles.taskList}>
                            {phase.tasks.map((t) => (
                              <li key={t} style={styles.taskItem}>{t}</li>
                            ))}
                          </ul>
                          {phase.resources && phase.resources.length > 0 && (
                            <div style={styles.resourcesSection}>
                              <span style={styles.resLabel}>Recommended Study Focus:</span>
                              <div style={styles.resContainer}>
                                {phase.resources.map((res) => (
                                  <span key={res} style={styles.resourceTag}>{res}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* General Career Advice */}
          <div className="glass-card" style={styles.adviceCard}>
            <div style={styles.adviceHeader}>
              <span style={{ fontSize: "1.5rem" }}>💡</span>
              <h3 style={styles.adviceTitle}>Strategic Advisory</h3>
            </div>
            <p style={styles.adviceText}>{data.generalAdvice}</p>
          </div>
        </section>

      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main style={styles.container}>
        <div style={styles.header}>
          <div style={styles.skeletonTitle}></div>
          <div style={styles.skeletonSubtitle}></div>
        </div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "3rem 1.5rem",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
  },
  centerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "2rem",
  },
  header: {
    marginBottom: "2.5rem",
  },
  headerTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, var(--text-primary) 30%, var(--accent-glow) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  dashboardLayout: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "2rem",
  },
  sidebarColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sidebarCard: {
    padding: "1.5rem",
    borderRadius: "16px",
  },
  sidebarTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "1.2rem",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  rolesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  roleButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "1rem 1.2rem",
    borderRadius: "12px",
    border: "1px solid",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  roleBtnInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    maxWidth: "80%",
  },
  roleBtnTitle: {
    fontWeight: "600",
    fontSize: "0.95rem",
    color: "var(--text-primary)",
  },
  roleBtnSub: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  scoreBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  profileSnapCard: {
    padding: "1.5rem",
    borderRadius: "16px",
  },
  snapTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  snapList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  snapItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    paddingBottom: "0.6rem",
  },
  snapLabel: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
  snapValue: {
    fontSize: "0.9rem",
    color: "var(--text-primary)",
    fontWeight: "600",
  },
  snapTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.2rem",
  },
  snapTag: {
    fontSize: "0.75rem",
    padding: "0.2rem 0.5rem",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  },
  contentColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  contentCard: {
    padding: "2.5rem",
    borderRadius: "16px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "1.8rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  recTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  metaRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.6rem",
  },
  metaBadge: {
    fontSize: "0.85rem",
    padding: "0.3rem 0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    color: "var(--text-secondary)",
  },
  matchMetric: {
    display: "flex",
    alignItems: "center",
  },
  metricRing: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    border: "3px solid var(--accent-primary)",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  metricVal: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  metricLbl: {
    fontSize: "0.65rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: "2.2rem",
  },
  detailSectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "1rem",
    borderLeft: "3px solid var(--accent-secondary)",
    paddingLeft: "0.75rem",
  },
  matchReasonText: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  skillGrids: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  skillCategoryTitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    fontWeight: "600",
    marginBottom: "0.8rem",
  },
  badgeGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
  },
  haveSkillBadge: {
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "8px",
    color: "#a7f3d0",
  },
  acquireSkillBadge: {
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "8px",
    color: "#fde68a",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    marginTop: "1.5rem",
  },
  timelineItem: {
    display: "flex",
    gap: "1.5rem",
  },
  timelineNode: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  timelineIndex: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-tertiary)",
    border: "2px solid var(--accent-primary)",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "700",
    zIndex: 2,
  },
  timelineLine: {
    width: "2px",
    flexGrow: 1,
    backgroundColor: "var(--border-color)",
    minHeight: "50px",
  },
  timelineContent: {
    flexGrow: 1,
    paddingBottom: "2rem",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "0.8rem",
  },
  phaseName: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  timelineBadge: {
    fontSize: "0.75rem",
    padding: "0.25rem 0.6rem",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    borderRadius: "6px",
    color: "var(--accent-glow)",
    fontWeight: "600",
  },
  timelineTasks: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    backgroundColor: "rgba(255,255,255,0.01)",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  subHeading: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  taskList: {
    listStyleType: "none",
    paddingLeft: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  taskItem: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    position: "relative",
    paddingLeft: "1.2rem",
    lineHeight: "1.4",
  },
  // We'll simulate bullet via custom styling
  // (In React list, we can just use normal margin & list style, or standard formatting)
  resourcesSection: {
    marginTop: "0.6rem",
    borderTop: "1px solid rgba(255,255,255,0.03)",
    paddingTop: "0.6rem",
  },
  resLabel: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  resContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.3rem",
  },
  resourceTag: {
    fontSize: "0.8rem",
    padding: "0.2rem 0.5rem",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "4px",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  },
  adviceCard: {
    padding: "2rem",
    borderRadius: "16px",
    borderLeft: "4px solid var(--accent-glow)",
  },
  adviceHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "0.8rem",
  },
  adviceTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  adviceText: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  errorCard: {
    padding: "3rem",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "500px",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
    display: "block",
  },
  mutedText: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  
  // Skeleton styles
  skeletonTitle: {
    width: "300px",
    height: "36px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  skeletonSubtitle: {
    width: "180px",
    height: "20px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "6px",
  },
  skeletonTextLong: {
    width: "90%",
    height: "16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "4px",
    marginBottom: "12px",
    animation: "pulse 1.5s infinite",
  },
  skeletonTextMed: {
    width: "60%",
    height: "16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "4px",
    marginBottom: "12px",
    animation: "pulse 1.5s infinite",
  },
  skeletonPulseBig: {
    width: "100%",
    height: "200px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "12px",
    marginBottom: "20px",
    animation: "pulse 1.5s infinite",
  },
};
