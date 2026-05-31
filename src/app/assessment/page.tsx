"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface AssessmentData {
  fullName: string;
  currentStatus: string;
  education: string;
  skills: string[];
  interests: string[];
  workSetting: string;
  teamPreference: string;
  industries: string[];
  careerGoals: string;
  salaryExpectation: string;
}

const INITIAL_DATA: AssessmentData = {
  fullName: "",
  currentStatus: "Student",
  education: "Bachelor's Degree",
  skills: [],
  interests: [],
  workSetting: "Remote",
  teamPreference: "Medium-sized team",
  industries: [],
  careerGoals: "",
  salaryExpectation: "Medium",
};

const SUGGESTED_SKILLS = [
  "JavaScript", "Python", "React", "Data Analysis", "Project Management", 
  "UI/UX Design", "Content Writing", "Public Speaking", "Problem Solving", 
  "SQL", "Machine Learning", "Customer Support", "Digital Marketing", "Financial Modeling"
];

const SUGGESTED_INTERESTS = [
  "Coding & Building", "Visual Design", "Writing & Blogging", "Leading Teams",
  "Analyzing Data", "Helping People", "Scientific Research", "Marketing & Growth",
  "Business & Strategy", "Teaching & Coaching", "Product Ideation", "Gaming & Tech"
];

const SUGGESTED_INDUSTRIES = [
  "Technology", "Healthcare & Biotech", "Finance & Fintech", "Creative Arts & Design",
  "Education", "E-commerce", "Clean Energy & Sustainability", "Entertainment & Media"
];

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentData>(INITIAL_DATA);

  // Read query params on load to prefill values
  useEffect(() => {
    const prefillCareer = searchParams.get("prefill_career");
    const prefillSkillsRaw = searchParams.get("prefill_skills");

    if (prefillCareer || prefillSkillsRaw) {
      setFormData((prev) => {
        const nextData = { ...prev };
        if (prefillCareer) {
          nextData.careerGoals = `Target Career: ${prefillCareer}. I want to explore transition timeline, skill requirements, and resources for this position.`;
        }
        if (prefillSkillsRaw) {
          const parsedSkills = prefillSkillsRaw.split(",").filter(Boolean);
          nextData.skills = Array.from(new Set([...prev.skills, ...parsedSkills]));
        }
        return nextData;
      });
    }
  }, [searchParams]);
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1 && !formData.fullName.trim()) {
      setError("Please enter your name to proceed.");
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (key: "skills" | "interests" | "industries", item: string) => {
    setFormData((prev) => {
      const arr = prev[key];
      const index = arr.indexOf(item);
      const newArr = [...arr];
      if (index === -1) {
        newArr.push(item);
      } else {
        newArr.splice(index, 1);
      }
      return { ...prev, [key]: newArr };
    });
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      // 1. Generate unique session ID for the user
      const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 2. Save submission to Firestore
      const docRef = await addDoc(collection(db, "assessments"), {
        ...formData,
        sessionId,
        createdAt: serverTimestamp(),
      });

      // 3. Keep session ID in local storage to fetch recommendations
      localStorage.setItem("career_navigator_session", sessionId);
      localStorage.setItem("career_navigator_doc_id", docRef.id);

      // 4. Redirect to recommendations page
      router.push(`/dashboard?id=${docRef.id}`);
    } catch (err: any) {
      console.error("Error submitting assessment:", err);
      // Fallback for demo if Firebase configuration is not completed yet
      const fallbackId = "demo-submission-id";
      localStorage.setItem("career_navigator_session", "demo-session");
      localStorage.setItem("career_navigator_doc_id", fallbackId);
      localStorage.setItem("career_navigator_fallback_data", JSON.stringify(formData));
      
      router.push(`/dashboard?id=${fallbackId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.mainContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>Career Navigator</h1>
        <p style={styles.subtitle}>Unlock AI-driven career roadmaps tailored to your strengths.</p>
      </div>

      <div className="glass-card" style={styles.formCard}>
        {/* Progress Tracker */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBarBackground}>
            <div 
              style={{ 
                ...styles.progressBarFill, 
                width: `${(step / totalSteps) * 100}%` 
              }}
            />
          </div>
          <div style={styles.stepIndicator}>
            Step {step} of {totalSteps}
          </div>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Tell us about yourself</h2>
            <p style={styles.stepSubtitle}>Let's start with the basics to customize your profile.</p>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleTextChange}
                placeholder="e.g. Alex Mercer"
                className="input-text"
                required
              />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Status</label>
                <select
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleTextChange}
                  className="select-input"
                >
                  <option value="Student">Student</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Career Changer">Career Changer</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Education Level</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleTextChange}
                  className="select-input"
                >
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Ph.D.">Ph.D.</option>
                  <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills Selection */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What are your skills?</h2>
            <p style={styles.stepSubtitle}>Select your top skills or add custom ones.</p>

            <form onSubmit={addCustomSkill} style={styles.customInputGroup}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter"
                className="input-text"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-secondary" style={{ padding: "0.8rem 1.2rem" }}>
                Add
              </button>
            </form>

            <div style={styles.chipGrid}>
              {SUGGESTED_SKILLS.map((skill) => {
                const isSelected = formData.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleArrayItem("skills", skill)}
                    style={{
                      ...styles.chip,
                      backgroundColor: isSelected ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)",
                      borderColor: isSelected ? "var(--accent-glow)" : "var(--border-color)",
                      color: isSelected ? "#fff" : "var(--text-secondary)"
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {formData.skills.length > 0 && (
              <div style={styles.selectedContainer}>
                <h4 style={styles.selectedTitle}>Your Selected Skills ({formData.skills.length}):</h4>
                <div style={styles.selectedChips}>
                  {formData.skills.map((skill) => (
                    <span key={skill} style={styles.activeTag}>
                      {skill}
                      <button 
                        onClick={() => toggleArrayItem("skills", skill)} 
                        style={styles.removeTagBtn}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Interests & Preferred Industries */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What fires you up?</h2>
            <p style={styles.stepSubtitle}>Select your main interests and industry verticals of preference.</p>

            <h3 style={styles.sectionLabel}>Interests & Work Passions</h3>
            <div style={styles.chipGrid}>
              {SUGGESTED_INTERESTS.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleArrayItem("interests", interest)}
                    style={{
                      ...styles.chip,
                      backgroundColor: isSelected ? "var(--accent-secondary)" : "rgba(255, 255, 255, 0.05)",
                      borderColor: isSelected ? "var(--accent-glow)" : "var(--border-color)",
                      color: isSelected ? "#fff" : "var(--text-secondary)"
                    }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <h3 style={{ ...styles.sectionLabel, marginTop: "1.5rem" }}>Target Industries</h3>
            <div style={styles.chipGrid}>
              {SUGGESTED_INDUSTRIES.map((industry) => {
                const isSelected = formData.industries.includes(industry);
                return (
                  <button
                    key={industry}
                    onClick={() => toggleArrayItem("industries", industry)}
                    style={{
                      ...styles.chip,
                      backgroundColor: isSelected ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)",
                      borderColor: isSelected ? "var(--accent-glow)" : "var(--border-color)",
                      color: isSelected ? "#fff" : "var(--text-secondary)"
                    }}
                  >
                    {industry}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Environment & Career Aspirations */}
        {step === 4 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Work Environment & Career Goals</h2>
            <p style={styles.stepSubtitle}>Final step! Aligning your goals with optimal working formats.</p>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Work Setting</label>
                <select
                  name="workSetting"
                  value={formData.workSetting}
                  onChange={handleTextChange}
                  className="select-input"
                >
                  <option value="Remote">Fully Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site / Office</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ideal Team Size</label>
                <select
                  name="teamPreference"
                  value={formData.teamPreference}
                  onChange={handleTextChange}
                  className="select-input"
                >
                  <option value="Small startup (< 10 people)">Small startup (&lt; 10 people)</option>
                  <option value="Medium-sized team">Medium-sized company</option>
                  <option value="Large enterprise">Large Enterprise / Corporate</option>
                  <option value="Individual Contributor">Solopreneur / Independent</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Salary Target Tier</label>
              <select
                name="salaryExpectation"
                value={formData.salaryExpectation}
                onChange={handleTextChange}
                className="select-input"
              >
                <option value="Entry Tier">Entry Tier (Base security focus)</option>
                <option value="Medium">Mid Tier (Balanced workload and compensation)</option>
                <option value="High (Top percentile)">High Tier (Maximize compensation, high complexity)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Aspirations & Future Direction</label>
              <textarea
                name="careerGoals"
                value={formData.careerGoals}
                onChange={handleTextChange}
                placeholder="e.g. I want to build consumer products and transition to AI product management in the next 2 years..."
                rows={4}
                className="textarea-input"
              />
            </div>
          </div>
        )}

        {/* Wizard Action Controls */}
        <div style={styles.actionsContainer}>
          {step > 1 ? (
            <button onClick={handleBack} className="btn-secondary" style={styles.navBtn}>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button onClick={handleNext} className="btn-primary" style={styles.navBtn}>
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="btn-primary" 
              style={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving & Generating Roadmaps..." : "Generate AI Career Roadmap"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <main style={styles.mainContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Loading Assessment...</h1>
          <p style={styles.subtitle}>Setting up personalized questionnaire...</p>
        </div>
      </main>
    }>
      <AssessmentContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "3rem 1.5rem",
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, var(--text-primary) 30%, var(--accent-glow) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "var(--text-secondary)",
  },
  formCard: {
    padding: "2.5rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  progressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  progressBarBackground: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
    borderRadius: "3px",
    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  stepIndicator: {
    alignSelf: "flex-end",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-muted)",
  },
  errorBanner: {
    padding: "1rem",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "0.95rem",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  stepTitle: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  stepSubtitle: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    marginTop: "-1rem",
    marginBottom: "0.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  sectionLabel: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "0.5rem",
  },
  customInputGroup: {
    display: "flex",
    gap: "0.8rem",
  },
  chipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.8rem",
    marginTop: "0.5rem",
  },
  chip: {
    padding: "0.6rem 1.2rem",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  selectedContainer: {
    marginTop: "1rem",
    padding: "1.2rem",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "10px",
    border: "1px dashed var(--border-color)",
  },
  selectedTitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "0.8rem",
  },
  selectedChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
  },
  activeTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.4rem 0.8rem",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.4)",
    borderRadius: "15px",
    fontSize: "0.85rem",
    color: "var(--text-primary)",
  },
  removeTagBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    transition: "all 0.2s",
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
  },
  navBtn: {
    minWidth: "120px",
  },
  submitBtn: {
    minWidth: "200px",
  },
};
