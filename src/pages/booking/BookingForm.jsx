// src/pages/booking/BookingForm.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../services/api";

// ─── STEP CONSTANTS ───────────────────────────────────────────────
const STEP_EVENT     = 1;
const STEP_DETAILS   = 2;
const STEP_SERVICES  = 3;
const STEP_REVIEW    = 4;

// ─── DATA ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: "wedding",      labelKey: "booking.eventWedding" },
  { id: "birthday",     labelKey: "booking.eventBirthday" },
  { id: "funeral",      labelKey: "booking.eventFuneral" },
  { id: "graduation",   labelKey: "booking.eventGraduation" },
  { id: "corporate",    labelKey: "booking.eventCorporate" },
];

const WEDDING_PARTS = [
  { id: "dote_part",   labelKey: "booking.weddingDote" },
  { id: "church",      labelKey: "booking.weddingChurch" },
  { id: "reception",   labelKey: "booking.weddingReception" },
  { id: "traditional", labelKey: "booking.weddingTraditional" },
];

// ─── WEDDING PACKAGES ───
const WEDDING_PACKAGES = [
  { id: "basic",    nameKey: "booking.packageBasic", descKey: "booking.packageBasicDesc", badgeKey: null },
  { id: "premium",  nameKey: "booking.packagePremium", descKey: "booking.packagePremiumDesc", badgeKey: "booking.badgePopular" },
  { id: "luxury",   nameKey: "booking.packageLuxury", descKey: "booking.packageLuxuryDesc", badgeKey: "booking.badgeBestValue" },
  { id: "full",     nameKey: "booking.packageFull", descKey: "booking.packageFullDesc", badgeKey: null },
];

// ─── STANDARD PACKAGES ───
const STANDARD_PACKAGES = [
  { id: "basic",    nameKey: "booking.packageBasic", descKey: "booking.packageStandardBasicDesc", badgeKey: null },
  { id: "standard", nameKey: "booking.packageStandard", descKey: "booking.packageStandardDesc", badgeKey: "booking.badgePopular" },
  { id: "premium",  nameKey: "booking.packagePremium", descKey: "booking.packageStandardPremiumDesc", badgeKey: null },
];

// ─── ADD-ON SERVICES ───
const SERVICES = [
  { id: "photography",  labelKey: "booking.servicePhotography" },
  { id: "sound",        labelKey: "booking.serviceSound" },
  { id: "decoration",   labelKey: "booking.serviceDecoration" },
  { id: "cake",         labelKey: "booking.serviceCake" },
  { id: "catering",     labelKey: "booking.serviceCatering" },
  { id: "mc",           labelKey: "booking.serviceMC" },
  { id: "streaming",    labelKey: "booking.serviceStreaming" },
  { id: "photobooth",   labelKey: "booking.servicePhotobooth" },
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
const toast = (msg, color = "#ffc107") => {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: "#111", color: "#fff", padding: "12px 20px",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)", borderLeft: `4px solid ${color}`,
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

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
  const { t } = useTranslation();
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
    return found ? t(found.nameKey) : pkg;
  };

  const getPackageDesc = (pkg) => {
    const found = getPackages().find(p => p.id === pkg);
    return found ? t(found.descKey) : "";
  };

  const getPackageBadge = (pkg) => {
    const found = getPackages().find(p => p.id === pkg);
    return found?.badgeKey ? t(found.badgeKey) : null;
  };

  const validate = () => {
    const e = {};
    if (step === STEP_EVENT) {
      if (!form.eventType) e.eventType = t('booking.errorEventType');
    }
    if (step === STEP_DETAILS) {
      if (!form.name.trim()) e.name = t('booking.errorName');
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = t('booking.errorEmail');
      if (!form.phone.trim()) e.phone = t('booking.errorPhone');
      if (!form.date) e.date = t('booking.errorDate');
      if (!form.location.trim()) e.location = t('booking.errorLocation');
    }
    if (step === STEP_SERVICES) {
      if (!form.package) e.package = t('booking.errorPackage');
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
        toast(t('booking.errorLoginRequired'), "#ef4444");
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
        toast(t('booking.successMessage'), "#22c55e");
        navigate("/booking/confirmation", { state: { booking: result.booking } });
      } else {
        toast(result.message || t('booking.errorFailed'), "#ef4444");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast(t('booking.errorNetwork'), "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    t('booking.stepEvent'),
    t('booking.stepDetails'),
    t('booking.stepServices'),
    t('booking.stepReview')
  ];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentPackages = getPackages();

  return (
    <div style={styles.container}>
      {/* BANNER */}
      <div style={styles.banner}>
        <p style={styles.bannerEyebrow}>NY Entertainment Rwanda</p>
        <h1 style={styles.bannerTitle}>{t('booking.title')}</h1>
        <p style={styles.bannerSub}>{t('booking.subtitle')}</p>
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
          <h2 style={styles.cardTitle}>{t('booking.eventType')}</h2>
          <p style={styles.cardSub}>{t('booking.eventTypeDesc')}</p>
          
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
                <div style={styles.eventLabel}>{t(et.labelKey)}</div>
              </div>
            ))}
          </div>
          
          <div style={styles.noteBox}>
            <p style={styles.noteText}>📌 {t('booking.note')}</p>
          </div>
          
          {errors.eventType && <p style={styles.errorMsg}>⚠ {errors.eventType}</p>}

          {form.eventType === "wedding" && (
            <>
              <p style={{ ...styles.label, marginTop: 20 }}>{t('booking.weddingParts')}</p>
              <p style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>{t('booking.weddingPartsDesc')}</p>
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
                    <span style={styles.partLabel}>{t(p.labelKey)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={styles.btnRow}>
            <button style={styles.btnNext} onClick={next}>{t('booking.continue')}</button>
          </div>
        </div>
      )}

      {/* STEP 2: CLIENT DETAILS */}
      {step === STEP_DETAILS && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{t('booking.yourDetails')}</h2>
          <p style={styles.cardSub}>{t('booking.yourDetailsDesc')}</p>

          <div style={styles.field}>
            <label style={styles.label}>{t('booking.fullName')}</label>
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
              <label style={styles.label}>{t('booking.email')}</label>
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
              <label style={styles.label}>{t('booking.phone')}</label>
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
            <label style={styles.label}>{t('booking.eventDate')}</label>
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
              <label style={styles.label}>{t('booking.startTime')}</label>
              <input
                style={styles.input}
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>{t('booking.endTime')}</label>
              <input
                style={styles.input}
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{t('booking.venue')}</label>
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
              <label style={styles.label}>{t('booking.district')}</label>
              <select
                style={styles.select}
                value={form.district}
                onChange={e => set("district", e.target.value)}
              >
                <option value="">{t('booking.selectDistrict')}</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>{t('booking.guests')}</label>
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
            <button style={styles.btnBack} onClick={back}>{t('booking.back')}</button>
            <button style={styles.btnNext} onClick={next}>{t('booking.continue')}</button>
          </div>
        </div>
      )}

      {/* STEP 3: PACKAGE & SERVICES */}
      {step === STEP_SERVICES && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{t('booking.package')}</h2>
          <p style={styles.cardSub}>{t('booking.packageDesc')}</p>

          <label style={styles.label}>{t('booking.selectPackage')}</label>
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

          <label style={styles.label}>{t('booking.addonServices')}</label>
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
                <span style={styles.serviceLabel}>{t(svc.labelKey)}</span>
              </div>
            ))}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{t('booking.additionalNotes')}</label>
            <textarea
              style={styles.textarea}
              placeholder={t('booking.notesPlaceholder')}
              value={form.message}
              onChange={e => set("message", e.target.value)}
            />
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>{t('booking.back')}</button>
            <button style={styles.btnNext} onClick={next}>{t('booking.continue')}</button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {step === STEP_REVIEW && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{t('booking.review')}</h2>
          <p style={styles.cardSub}>{t('booking.reviewDesc')}</p>

          <div style={styles.tip}>{t('booking.tip')}</div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>{t('booking.event')}</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.eventType')}</span>
              <span style={styles.reviewVal}>{EVENT_TYPES.find(e => e.id === form.eventType) ? t(EVENT_TYPES.find(e => e.id === form.eventType).labelKey) : "—"}</span>
            </div>
            {form.weddingParts.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>{t('booking.weddingParts')}</span>
                <div style={styles.reviewTags}>
                  {form.weddingParts.map(p => <span key={p} style={styles.tag}>{WEDDING_PARTS.find(wp => wp.id === p) ? t(WEDDING_PARTS.find(wp => wp.id === p).labelKey) : p}</span>)}
                </div>
              </div>
            )}
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.date')}</span>
              <span style={styles.reviewVal}>{form.date ? new Date(form.date).toLocaleDateString() : "—"}</span>
            </div>
            {(form.startTime || form.endTime) && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>{t('booking.time')}</span>
                <span style={styles.reviewVal}>{form.startTime || "?"} – {form.endTime || "?"}</span>
              </div>
            )}
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.location')}</span>
              <span style={styles.reviewVal}>{form.location}{form.district ? `, ${form.district}` : ""}</span>
            </div>
            {form.guests && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>{t('booking.guests')}</span>
                <span style={styles.reviewVal}>{Number(form.guests).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>{t('booking.client')}</div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>{t('booking.name')}</span><span style={styles.reviewVal}>{form.name}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>{t('booking.email')}</span><span style={styles.reviewVal}>{form.email}</span></div>
            <div style={styles.reviewRow}><span style={styles.reviewKey}>{t('booking.phone')}</span><span style={styles.reviewVal}>{form.phone}</span></div>
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>{t('booking.services')}</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.package')}</span>
              <span style={styles.reviewVal}>{getPackageName(form.package) || "—"}</span>
            </div>
            {form.services.length > 0 && (
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>{t('booking.addonServices')}</span>
                <div style={styles.reviewTags}>
                  {form.services.map(s => <span key={s} style={styles.tag}>{SERVICES.find(sv => sv.id === s) ? t(SERVICES.find(sv => sv.id === s).labelKey) : s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div style={styles.reviewSection}>
            <div style={styles.reviewSectionTitle}>{t('booking.payment')}</div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.status')}</span>
              <span style={{ ...styles.tag, background: "#fff3cd", color: "#856404" }}>{t('booking.pendingApproval')}</span>
            </div>
            <div style={styles.reviewRow}>
              <span style={styles.reviewKey}>{t('booking.pricing')}</span>
              <span style={{ ...styles.reviewVal, color: "#e6ac00" }}>{t('booking.negotiable')}</span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnBack} onClick={back}>{t('booking.back')}</button>
            <button style={styles.btnNext} onClick={handleSubmit} disabled={loading}>
              {loading ? t('booking.submitting') : t('booking.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}