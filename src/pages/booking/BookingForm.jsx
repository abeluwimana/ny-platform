// src/pages/booking/BookingForm.jsx
// SHINECONNECT - Booking Form
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../services/api";

// ─── STEP CONSTANTS ───────────────────────────────────────────────
const STEP_EVENT     = 1;
const STEP_DETAILS   = 2;
const STEP_SERVICES  = 3;
const STEP_REVIEW    = 4;

// ─── DATA ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: "wedding",      label: "Wedding" },
  { id: "birthday",     label: "Birthday" },
  { id: "funeral",      label: "Funeral" },
  { id: "graduation",   label: "Graduation" },
  { id: "corporate",    label: "Corporate" },
];

const WEDDING_PARTS = [
  { id: "dote_part",   label: "DOTE Ceremony" },
  { id: "church",      label: "Church Ceremony" },
  { id: "reception",   label: "Reception" },
  { id: "traditional", label: "Traditional Ceremony" },
];

// ─── WEDDING PACKAGES ───
const WEDDING_PACKAGES = [
  { id: "basic",    name: "Basic", desc: "Essential coverage for your special day", badge: null },
  { id: "premium",  name: "Premium", desc: "Professional coverage with cinematic quality", badge: "Popular" },
  { id: "luxury",   name: "Luxury", desc: "Full luxury experience with all extras", badge: "Best Value" },
  { id: "full",     name: "Full", desc: "Complete coverage with drone and highlights", badge: null },
];

// ─── STANDARD PACKAGES ───
const STANDARD_PACKAGES = [
  { id: "basic",    name: "Basic", desc: "Essential coverage for your event", badge: null },
  { id: "standard", name: "Standard", desc: "Professional coverage with highlights", badge: "Popular" },
  { id: "premium",  name: "Premium", desc: "Premium coverage with all extras", badge: null },
];

// ─── ADD-ON SERVICES ───
const SERVICES = [
  { id: "photography",  label: "Photography" },
  { id: "sound",        label: "Sound System" },
  { id: "decoration",   label: "Decoration" },
  { id: "cake",         label: "Cake Services" },
  { id: "catering",     label: "Catering" },
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

// ─── INLINE TOAST ────────────────────────────────────────────────
const toast = (msg, color = "#FFD700") => {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: "#000", color: "#fff", padding: "12px 20px",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)", borderLeft: `4px solid ${color}`,
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ─── INLINE STYLES ────────────────────────────────────────────────
const styles = {
  container: { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#ffffff", minHeight: "100vh", paddingBottom: "80px" },
  banner: { background: "#000000", padding: "36px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" },
  bannerEyebrow: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFD700", marginBottom: "10px" },
  bannerTitle: { fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: "#fff", marginBottom: "8px" },
  bannerSub: { fontSize: "13px", color: "#888" },
  progressBar: { height: "3px", background: "#e8e8e8", position: "relative" },
  progressFill: { height: "100%", background: "#FFD700", transition: "width 0.4s ease" },
  stepper: { display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px 0", maxWidth: "600px", margin: "0 auto" },
  stepContainer: { display: "flex", alignItems: "center", flex: 1 },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "none" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #e8e8e8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#888" },
  stepCircleDone: { background: "#FFD700", borderColor: "#FFD700", color: "#000" },
  stepCircleActive: { background: "#000", borderColor: "#000", color: "#FFD700" },
  stepLabel: { fontSize: "10px", fontWeight: 500, color: "#888", textAlign: "center" },
  stepLabelActive: { color: "#000", fontWeight: 600 },
  stepLine: { flex: 1, height: "2px", background: "#e8e8e8", marginBottom: "16px" },
  stepLineDone: { background: "#FFD700" },
  card: { background: "#fff", borderRadius: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "24px", margin: "20px 16px 0", maxWidth: "680px", marginLeft: "auto", marginRight: "auto", border: "1px solid #f0f0f0" },
  cardTitle: { fontSize: "18px", fontWeight: 700, color: "#000", marginBottom: "4px" },
  cardSub: { fontSize: "13px", color: "#888", marginBottom: "20px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", color: "#444", marginBottom: "7px", textTransform: "uppercase" },
  input: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#000", background: "#fafafa", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  textarea: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#000", background: "#fafafa", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" },
  select: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#000", background: "#fafafa", outline: "none", cursor: "pointer" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  errorMsg: { fontSize: "12px", color: "#ef4444", marginTop: "5px" },
  eventGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "4px" },
  eventCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "14px 8px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.2s" },
  eventCardActive: { borderColor: "#FFD700", background: "#fefce8" },
  eventLabel: { fontSize: "13px", fontWeight: 600, color: "#444" },
  noteBox: { background: "#fefce8", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px", marginTop: "15px", textAlign: "center" },
  noteText: { fontSize: "12px", color: "#78350f", margin: 0 },
  partsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "4px" },
  partCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  partCardActive: { borderColor: "#FFD700", background: "#fefce8" },
  partLabel: { fontSize: "13px", fontWeight: 500, color: "#444" },
  packageGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "4px" },
  packageCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "16px", cursor: "pointer", background: "#fff", position: "relative", transition: "all 0.2s" },
  packageCardActive: { borderColor: "#FFD700", background: "#fefce8" },
  packageBadge: { position: "absolute", top: "-10px", right: "12px", background: "#FFD700", color: "#000", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px" },
  packageName: { fontSize: "15px", fontWeight: 700, color: "#000", marginBottom: "5px" },
  packageDesc: { fontSize: "12px", color: "#888", lineHeight: "1.5" },
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  serviceCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  serviceCardActive: { borderColor: "#FFD700", background: "#fefce8" },
  serviceCheckbox: { width: "20px", height: "20px", border: "2px solid #e8e8e8", borderRadius: "6px", marginRight: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  serviceCheckboxActive: { background: "#FFD700", borderColor: "#FFD700" },
  serviceLabel: { fontSize: "14px", fontWeight: 500, color: "#444" },
  btnRow: { display: "flex", gap: "10px", marginTop: "24px" },
  btnBack: { padding: "14px 20px", border: "1.5px solid #e8e8e8", borderRadius: "10px", background: "#fff", color: "#888", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnNext: { flex: 1, padding: "14px", border: "none", borderRadius: "10px", background: "#000", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" },
  tip: { background: "#fefce8", borderLeft: "3px solid #FFD700", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: "12px", color: "#444", marginBottom: "16px", lineHeight: "1.5" },
  reviewSection: { marginBottom: "18px" },
  reviewSectionTitle: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #e8e8e8" },
  reviewRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", gap: "12px" },
  reviewKey: { fontSize: "13px", color: "#888" },
  reviewVal: { fontSize: "13px", fontWeight: 600, color: "#000", textAlign: "right" },
  reviewTags: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  tag: { background: "#fefce8", border: "1px solid #fde68a", color: "#000", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" },
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

  const getPackageName = (pkg) => {
    const found = getPackages().find(p => p.id === pkg);
    return found ? found.name : pkg;
  };

  const getPackageDesc = (pkg) => {
    const found = getPackages().find(p => p.id === pkg);
    return found ? found.desc : "";
  };

  const getPackageBadge = (pkg) => {
    const found = getPackages().find(p => p.id === pkg);
    return found?.badge || null;
  };

  const validate = () => {
    const e = {};
    if (step === STEP_EVENT) {
      if (!form.eventType) e.eventType = 'Please select an event type';
    }
    if (step === STEP_DETAILS) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
      if (!form.date) e.date = 'Please select an event date';
      if (!form.location.trim()) e.location = 'Venue location is required';
    }
    if (step === STEP_SERVICES) {
      if (!form.package) e.package = 'Please select a package';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast('Please log in to book services', "#ef4444");
        navigate("/login");
        return;
      }

      const bookingData = {
        eventType: form.eventType,
        eventDate: form.date,
        eventLocation: form.location,
        guestCount: form.guests ? parseInt(form.guests) : null,
        package: form.package,
        notes: form.message,
        weddingParts: form.weddingParts,
        startTime: form.startTime,
        endTime: form.endTime,
        district: form.district,
        services: form.services,
        name: form.name,
        email: form.email,
        phone: form.phone
      };

      console.log('📤 Sending booking data:', bookingData);

      const result = await createBooking(bookingData);

      if (result.success) {
        toast('Booking confirmed! 🎉', "#10b981");
        navigate("/booking/confirmation", { state: { booking: result.booking } });
      } else {
        toast(result.message || 'Booking failed. Please try again.', "#ef4444");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast('Network error. Please check your connection.', "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    'Event Type',
    'Your Details',
    'Services',
    'Review'
  ];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentPackages = getPackages();

  return (
    <div style={styles.container}>
      {/* BANNER */}
      <div style={styles.banner}>
        <p style={styles.bannerEyebrow}>✨ SHINECONNECT</p>
        <h1 style={styles.bannerTitle}>Book Your Event</h1>
        <p style={styles.bannerSub}>Professional coverage for your special moments across Rwanda</p>
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
          <h2 style={styles.cardTitle}>What's Your Event?</h2>
          <p style={styles.cardSub}>Select the type of event you'd like us to cover</p>
          
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
          
          <div style={styles.noteBox}>
            <p style={styles.noteText}>📌 We cover all events across all 30 districts of Rwanda</p>
          </div>
          
          {errors.eventType && <p style={styles.errorMsg}>⚠ {errors.eventType}</p>}

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
          <p style={styles.cardSub}>Tell us who you are and when your event is</p>

          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
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
              <label style={styles.label}>Email</label>
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
              <label style={styles.label}>Phone</label>
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
            <label style={styles.label}>Event Date</label>
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
            <label style={styles.label}>Venue</label>
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
              <label style={styles.label}>District</label>
              <select
                style={styles.select}
                value={form.district}
                onChange={e => set("district", e.target.value)}
              >
                <option value="">Select District</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Number of Guests</label>
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
          <h2 style={styles.cardTitle}>Select Package & Services</h2>
          <p style={styles.cardSub}>Choose the package that fits your needs</p>

          <label style={styles.label}>Package</label>
          <div style={styles.packageGrid}>
            {currentPackages.map(pkg => {
              const badge = getPackageBadge(pkg.id);
              return (
                <div
                  key={pkg.id}
                  onClick={() => set("package", pkg.id)}
                  style={{
                    ...styles.packageCard,
                    ...(form.package === pkg.id && styles.packageCardActive)
                  }}
                >
                  {badge && <span style={styles.packageBadge}>{badge}</span>}
                  <div style={styles.packageName}>{getPackageName(pkg.id)}</div>
                  <div style={styles.packageDesc}>{getPackageDesc(pkg.id)}</div>
                </div>
              );
            })}
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
                  {form.services.includes(svc.id) && <span style={{ color: "#000", fontSize: "12px", fontWeight: "bold" }}>✓</span>}
                </div>
                <span style={styles.serviceLabel}>{svc.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              style={styles.textarea}
              placeholder="Any special requests or additional information..."
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
          <h2 style={styles.cardTitle}>Review Your Booking</h2>
          <p style={styles.cardSub}>Please review all details before submitting</p>

          <div style={styles.tip}>💡 <strong>Tip:</strong> Double-check your email and phone number so we can reach you.</div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Event Details</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Event Type</span>
              <span style={styles.reviewVal}>{EVENT_TYPES.find(e => e.id === form.eventType)?.label || "—"}</span>
            </div>
            {form.weddingParts.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Wedding Parts</span>
                <div style={styles.reviewTags}>
                  {form.weddingParts.map(p => <span key={p} style={styles.tag}>{WEDDING_PARTS.find(wp => wp.id === p)?.label || p}</span>)}
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
            <div style={styles.reviewSectionTitle}>Your Information</div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Name</span><span style={styles.reviewVal}>{form.name}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Email</span><span style={styles.reviewVal}>{form.email}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>Phone</span><span style={styles.reviewVal}>{form.phone}</span></div>
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Services</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Package</span>
              <span style={styles.reviewVal}>{getPackageName(form.package) || "—"}</span>
            </div>
            {form.services.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Add-on Services</span>
                <div style={styles.reviewTags}>
                  {form.services.map(s => <span key={s} style={styles.tag}>{SERVICES.find(sv => sv.id === s)?.label || s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>Payment</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Status</span>
              <span style={{ ...styles.tag, background: "#fefce8", color: "#78350f" }}>Pending Approval</span>
            </div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>Pricing</span>
              <span style={{ ...styles.reviewVal, color: "#FFD700" }}>Negotiable</span>
            </div>
          </div>

          {form.message && (
            <div style={styles.reviewSection}>
              <div style={styles.reviewSectionTitle}>Notes</div>
              <div style={styles.reviewRow}>
                <span style={{ ...styles.reviewVal, textAlign: "left", fontWeight: 400 }}>{form.message}</span>
              </div>
            </div>
          )}

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>← Back</button>
            <button style={styles.btnNext} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}