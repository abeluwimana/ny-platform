// src/pages/booking/BookingForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── STEP CONSTANTS ───────────────────────────────────────────────
const STEP_EVENT     = 1;
const STEP_DETAILS   = 2;
const STEP_SERVICES  = 3;
const STEP_REVIEW    = 4;

// ─── DATA ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: "wedding",      label: "Wedding" },
  { id: "birthday",     label: "Birthday Party" },
  { id: "funeral",      label: "Funeral Ceremony" },
  { id: "graduation",   label: "Graduation" },
  { id: "corporate",    label: "Corporate Event" },
];

const WEDDING_PARTS = [
  { id: "dote_part",   label: "DOTE Ceremony" },
  { id: "church",      label: "Church Wedding" },
  { id: "reception",   label: "Reception" },
  { id: "traditional", label: "Traditional Dance" },
];

// ─── WEDDING PACKAGES ───
const WEDDING_PACKAGES = [
  { id: "basic",    name: "Basic",    desc: "4-hour wedding coverage + highlight reel", badge: null },
  { id: "premium",  name: "Premium",  desc: "6-hour coverage + shots + same-day edit", badge: "Popular" },
  { id: "luxury",   name: "Luxury",   desc: "8-hour coverage + 2 editors + photo album", badge: "Best Value" },
  { id: "full",     name: "Full Wedding", desc: "Complete DOTE, Church & Reception + album", badge: null },
];

// ─── STANDARD PACKAGES (for Birthday, Funeral, Graduation, Corporate) ───
const STANDARD_PACKAGES = [
  { id: "basic",    name: "Basic",    desc: "2-hour event coverage + highlight reel", badge: null },
  { id: "standard", name: "Standard", desc: "3-hour coverage + edited video + raw footage", badge: "Popular" },
  { id: "premium",  name: "Premium",  desc: "4-hour coverage + multiple cameras + same-day edit", badge: null },
];

// ─── ADD-ON SERVICES (same for all events) ───
const SERVICES = [
  { id: "photography",  label: "Photography" },
  { id: "sound",        label: "Sound System" },
  { id: "decoration",   label: "Decoration" },
  { id: "cake",         label: "Cake Services" },
  { id: "catering",     label: "Catering / Guteka" },
  { id: "mc",           label: "MC & Protocol" },
  { id: "streaming",    label: "Live Streaming" },
  { id: "photobooth",   label: "Photo Booth" },
];

// ─── ALL 30 DISTRICTS OF RWANDA ───────────────────────────────────
const DISTRICTS = [
  "Gasabo", "Kicukiro", "Nyarugenge", "Bugesera", "Gatsibo", "Kayonza",
  "Kirehe", "Ngoma", "Nyagatare", "Rwamagana", "Burera", "Gakenke",
  "Gicumbi", "Musanze", "Rulindo", "Gisagara", "Huye", "Kamonyi",
  "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango", "Karongi",
  "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
];

// ─── INLINE STYLES ────────────────────────────────────────────────
const styles = {
  container: { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f7f7f5", minHeight: "100vh", paddingBottom: "80px" },
  banner: { background: "#1a1a1a", padding: "36px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" },
  bannerEyebrow: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffc107", marginBottom: "10px" },
  bannerTitle: { fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: "#fff", marginBottom: "8px" },
  bannerSub: { fontSize: "13px", color: "#888" },
  progressBar: { height: "3px", background: "#e8e8e8", position: "relative" },
  progressFill: { height: "100%", background: "#ffc107", transition: "width 0.4s ease" },
  stepper: { display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px 0", maxWidth: "600px", margin: "0 auto" },
  stepContainer: { display: "flex", alignItems: "center", flex: 1 },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "none" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #e8e8e8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#888" },
  stepCircleDone: { background: "#ffc107", borderColor: "#ffc107", color: "#1a1a1a" },
  stepCircleActive: { background: "#1a1a1a", borderColor: "#1a1a1a", color: "#ffc107" },
  stepLabel: { fontSize: "10px", fontWeight: 500, color: "#888", textAlign: "center" },
  stepLabelActive: { color: "#1a1a1a", fontWeight: 600 },
  stepLine: { flex: 1, height: "2px", background: "#e8e8e8", marginBottom: "16px" },
  stepLineDone: { background: "#ffc107" },
  card: { background: "#fff", borderRadius: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "24px", margin: "20px 16px 0", maxWidth: "680px", marginLeft: "auto", marginRight: "auto" },
  cardTitle: { fontSize: "18px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" },
  cardSub: { fontSize: "13px", color: "#888", marginBottom: "20px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", color: "#444", marginBottom: "7px", textTransform: "uppercase" },
  input: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
  select: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", cursor: "pointer" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  errorMsg: { fontSize: "12px", color: "#ef4444", marginTop: "5px" },
  eventGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "4px" },
  eventCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "14px 8px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.2s" },
  eventCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  eventLabel: { fontSize: "13px", fontWeight: 600, color: "#444" },
  noteBox: { background: "#e8f4fd", borderRadius: "10px", padding: "12px", marginTop: "15px", textAlign: "center" },
  noteText: { fontSize: "12px", color: "#004085", margin: 0 },
  partsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "4px" },
  partCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  partCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  partLabel: { fontSize: "13px", fontWeight: 500, color: "#444" },
  packageGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "4px" },
  packageCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "16px", cursor: "pointer", background: "#fff", position: "relative", transition: "all 0.2s" },
  packageCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  packageBadge: { position: "absolute", top: "-10px", right: "12px", background: "#ffc107", color: "#1a1a1a", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px" },
  packageName: { fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "5px" },
  packageDesc: { fontSize: "12px", color: "#888", lineHeight: "1.5" },
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  serviceCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  serviceCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  serviceCheckbox: { width: "20px", height: "20px", border: "2px solid #e8e8e8", borderRadius: "6px", marginRight: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  serviceCheckboxActive: { background: "#ffc107", borderColor: "#ffc107" },
  serviceLabel: { fontSize: "14px", fontWeight: 500, color: "#444" },
  btnRow: { display: "flex", gap: "10px", marginTop: "24px" },
  btnBack: { padding: "14px 20px", border: "1.5px solid #e8e8e8", borderRadius: "10px", background: "#fff", color: "#888", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  btnNext: { flex: 1, padding: "14px", border: "none", borderRadius: "10px", background: "#ffc107", color: "#1a1a1a", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  tip: { background: "#fff8e1", borderLeft: "3px solid #ffc107", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: "12px", color: "#444", marginBottom: "16px", lineHeight: "1.5" },
  reviewSection: { marginBottom: "18px" },
  reviewSectionTitle: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #e8e8e8" },
  reviewRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", gap: "12px" },
  reviewKey: { fontSize: "13px", color: "#888" },
  reviewVal: { fontSize: "13px", fontWeight: 600, color: "#1a1a1a", textAlign: "right" },
  reviewTags: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  tag: { background: "#fff8e1", border: "1px solid #f0d060", color: "#1a1a1a", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" },
};

export default function BookingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_EVENT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    eventType: "",
    weddingParts: [],
    name: "", email: "", phone: "",
    date: "", startTime: "", endTime: "",
    location: "", district: "", guests: "",
    package: "", services: [],
    message: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (key, val) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  // Get packages based on event type
  const getPackages = () => {
    if (form.eventType === "wedding") {
      return WEDDING_PACKAGES;
    }
    return STANDARD_PACKAGES;
  };

  const validate = () => {
    const e = {};
    if (step === STEP_EVENT) {
      if (!form.eventType) e.eventType = "Please select an event type";
    }
    if (step === STEP_DETAILS) {
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      if (!form.date) e.date = "Event date is required";
      if (!form.location.trim()) e.location = "Location is required";
    }
    if (step === STEP_SERVICES) {
      if (!form.package) e.package = "Please select a package";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);

    const existing = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const userName = localStorage.getItem("user_name");
    const userRole = localStorage.getItem("user_role");

    const newBooking = {
      id: Date.now(),
      ...form,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      userId: userEmail,
      clientName: userName || form.name,
      clientRole: userRole || "guest",
    };

    localStorage.setItem("wedding_bookings", JSON.stringify([...existing, newBooking]));

    setTimeout(() => {
      setLoading(false);
      navigate("/booking/confirmation", { state: { booking: newBooking } });
    }, 1200);
  };

  const STEPS = ["Event", "Details", "Services", "Review"];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentPackages = getPackages();

  return (
    <div style={styles.container}>
      {/* BANNER */}
      <div style={styles.banner}>
        <p style={styles.bannerEyebrow}>NY Entertainment Rwanda</p>
        <h1 style={styles.bannerTitle}>Book Your Event</h1>
        <p style={styles.bannerSub}>Professional coverage across Rwanda — Pay only after admin approval</p>
      </div>

      {/* PROGRESS */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* STEPPER */}
      <div style={styles.stepper}>
        {STEPS.map((label, i) => {
          const num = i + 1;
          const isDone = step > num;
          const isActive = step === num;
          return (
            <div key={label} style={styles.stepContainer}>
              <div style={styles.step}>
                <div style={{
                  ...styles.stepCircle,
                  ...(isDone && styles.stepCircleDone),
                  ...(isActive && styles.stepCircleActive)
                }}>
                  {isDone ? "✓" : num}
                </div>
                <span style={{
                  ...styles.stepLabel,
                  ...(isActive && styles.stepLabelActive)
                }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  ...styles.stepLine,
                  ...(isDone && styles.stepLineDone)
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1: EVENT TYPE */}
      {step === STEP_EVENT && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>What's the occasion?</h2>
          <p style={styles.cardSub}>Select the type of event you want covered</p>
          
          <div style={styles.eventGrid}>
            {EVENT_TYPES.map(et => (
              <div
                key={et.id}
                onClick={() => set("eventType", et.id)}
                style={{
                  ...styles.eventCard,
                  ...(form.eventType === et.id && styles.eventCardActive)
                }}
              >
                <div style={styles.eventLabel}>{et.label}</div>
              </div>
            ))}
          </div>
          
          {/* Note: Only one event per booking */}
          <div style={styles.noteBox}>
            <p style={styles.noteText}>📌 Note: You can book only ONE event per submission. For multiple events, please submit separate bookings.</p>
          </div>
          
          {errors.eventType && <p style={styles.errorMsg}>⚠ {errors.eventType}</p>}

          {/* Wedding parts - only for wedding */}
          {form.eventType === "wedding" && (
            <>
              <p style={{ ...styles.label, marginTop: 20 }}>Wedding Parts</p>
              <p style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>Select which parts of the wedding you want covered</p>
              <div style={styles.partsGrid}>
                {WEDDING_PARTS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => toggle("weddingParts", p.id)}
                    style={{
                      ...styles.partCard,
                      ...(form.weddingParts.includes(p.id) && styles.partCardActive)
                    }}
                  >
                    <span style={styles.partLabel}>{p.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={styles.btnRow}>
            <button style={styles.btnNext} onClick={next}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 2: CLIENT DETAILS */}
      {step === STEP_DETAILS && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Your Details</h2>
          <p style={styles.cardSub}>Tell us about yourself and the event</p>

          <div style={styles.field}>
            <label style={styles.label}>Full Name *</label>
            <input
              style={{ ...styles.input, ...(errors.name && { borderColor: "#ef4444" }) }}
              type="text"
              placeholder="e.g. Amina Kagabo"
              value={form.name}
              onChange={e => set("name", e.target.value)}
            />
            {errors.name && <p style={styles.errorMsg}>⚠ {errors.name}</p>}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email *</label>
              <input
                style={{ ...styles.input, ...(errors.email && { borderColor: "#ef4444" }) }}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
              {errors.email && <p style={styles.errorMsg}>⚠ {errors.email}</p>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone *</label>
              <input
                style={{ ...styles.input, ...(errors.phone && { borderColor: "#ef4444" }) }}
                type="tel"
                placeholder="+250 7XX XXX XXX"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
              />
              {errors.phone && <p style={styles.errorMsg}>⚠ {errors.phone}</p>}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Event Date *</label>
            <input
              style={{ ...styles.input, ...(errors.date && { borderColor: "#ef4444" }) }}
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => set("date", e.target.value)}
            />
            {errors.date && <p style={styles.errorMsg}>⚠ {errors.date}</p>}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Start Time</label>
              <input
                style={styles.input}
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>End Time</label>
              <input
                style={styles.input}
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Venue / Location *</label>
            <input
              style={{ ...styles.input, ...(errors.location && { borderColor: "#ef4444" }) }}
              type="text"
              placeholder="e.g. Kigali Serena Hotel"
              value={form.location}
              onChange={e => set("location", e.target.value)}
            />
            {errors.location && <p style={styles.errorMsg}>⚠ {errors.location}</p>}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>District *</label>
              <select
                style={styles.select}
                value={form.district}
                onChange={e => set("district", e.target.value)}
              >
                <option value="">Select your district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>No. of Guests</label>
              <input
                style={styles.input}
                type="number"
                placeholder="e.g. 200"
                value={form.guests}
                onChange={e => set("guests", e.target.value)}
              />
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>← Back</button>
            <button style={styles.btnNext} onClick={next}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 3: PACKAGE & SERVICES */}
      {step === STEP_SERVICES && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Package & Services</h2>
          <p style={styles.cardSub}>Choose a package and add-on services</p>

          <label style={styles.label}>Select Package *</label>
          <div style={styles.packageGrid}>
            {currentPackages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => set("package", pkg.id)}
                style={{
                  ...styles.packageCard,
                  ...(form.package === pkg.id && styles.packageCardActive)
                }}
              >
                {pkg.badge && <span style={styles.packageBadge}>{pkg.badge}</span>}
                <div style={styles.packageName}>{pkg.name}</div>
                <div style={styles.packageDesc}>{pkg.desc}</div>
              </div>
            ))}
          </div>
          {errors.package && <p style={{ ...styles.errorMsg, marginTop: -14, marginBottom: 14 }}>⚠ {errors.package}</p>}

          <label style={styles.label}>Add-on Services</label>
          <div style={styles.servicesGrid}>
            {SERVICES.map(svc => (
              <div
                key={svc.id}
                onClick={() => toggle("services", svc.id)}
                style={{
                  ...styles.serviceCard,
                  ...(form.services.includes(svc.id) && styles.serviceCardActive)
                }}
              >
                <div style={{
                  ...styles.serviceCheckbox,
                  ...(form.services.includes(svc.id) && styles.serviceCheckboxActive)
                }}>
                  {form.services.includes(svc.id) && <span style={{ color: "#1a1a1a", fontSize: "12px", fontWeight: "bold" }}>✓</span>}
                </div>
                <span style={styles.serviceLabel}>{svc.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              style={styles.textarea}
              placeholder="Special moments, requests, or anything we should know…"
              value={form.message}
              onChange={e => set("message", e.target.value)}
            />
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>← Back</button>
            <button style={styles.btnNext} onClick={next}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {step === STEP_REVIEW && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Review & Confirm</h2>
          <p style={styles.cardSub}>Please review your booking before submitting</p>

          <div style={styles.tip}>
            After submitting, our team will review your request within 24 hours. We'll contact you with pricing (negotiable) and payment instructions once approved.
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Event</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Type</span>
              <span style={styles.reviewVal}>{EVENT_TYPES.find(e => e.id === form.eventType)?.label || "—"}</span>
            </div>
            {form.weddingParts.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Parts</span>
                <div style={styles.reviewTags}>
                  {form.weddingParts.map(p => <span key={p} style={styles.tag}>{WEDDING_PARTS.find(wp => wp.id === p)?.label}</span>)}
                </div>
              </div>
            )}
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Date</span>
              <span style={styles.reviewVal}>{form.date ? new Date(form.date).toLocaleDateString() : "—"}</span>
            </div>
            {(form.startTime || form.endTime) && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Time</span>
                <span style={styles.reviewVal}>{form.startTime || "?"} – {form.endTime || "?"}</span>
              </div>
            )}
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Location</span>
              <span style={styles.reviewVal}>{form.location}{form.district ? `, ${form.district}` : ""}</span>
            </div>
            {form.guests && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Guests</span>
                <span style={styles.reviewVal}>{Number(form.guests).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Client</div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Name</span><span style={styles.reviewVal}>{form.name}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Email</span><span style={styles.reviewVal}>{form.email}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Phone</span><span style={styles.reviewVal}>{form.phone}</span></div>
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Services</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Package</span>
              <span style={styles.reviewVal}>{currentPackages.find(p => p.id === form.package)?.name || "—"}</span>
            </div>
            {form.services.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Add-ons</span>
                <div style={styles.reviewTags}>
                  {form.services.map(s => <span key={s} style={styles.tag}>{SERVICES.find(sv => sv.id === s)?.label}</span>)}
                </div>
              </div>
            )}
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Payment</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Status</span>
              <span style={{ ...styles.tag, background: "#fff3cd", color: "#856404" }}>Pending Admin Approval</span>
            </div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Pricing</span>
              <span style={{ ...styles.reviewVal, color: "#e6ac00" }}>Negotiable (quoted after approval)</span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>← Back</button>
            <button style={styles.btnNext} onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting…" : "Submit Booking Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}