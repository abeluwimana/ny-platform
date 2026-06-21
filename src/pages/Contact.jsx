// src/pages/Contact.jsx
import emailjs from '@emailjs/browser';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

// EmailJS Configuration - using environment variables (add to .env file)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_gcvnehd";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_52il3x4";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "VIDMuTVCjadb2ZJa9";

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weddingDate: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
  }, []);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('contact.errorName');
    if (!formData.email.trim()) newErrors.email = t('contact.errorEmail');
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('contact.errorEmailInvalid');
    if (!formData.phone.trim()) newErrors.phone = t('contact.errorPhone');
    if (!formData.subject) newErrors.subject = t('contact.errorSubject');
    if (!formData.message.trim()) newErrors.message = t('contact.errorMessage');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Save to localStorage
    const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
    const newMessage = {
      id: Date.now(),
      ...formData,
      status: "unread",
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem("contact_messages", JSON.stringify(messages));
    
    // Send email via EmailJS
    try {
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: "nyentertainmentrwanda@gmail.com",
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          wedding_date: formData.weddingDate || t('contact.notSpecified'),
          subject: formData.subject,
          message: formData.message
        },
        EMAILJS_PUBLIC_KEY
      );
      console.log("Email sent successfully!", result);
    } catch (error) {
      console.log("Email error:", error);
      console.log("Error details:", error.text);
    }
    
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        weddingDate: "",
        subject: "",
        message: ""
      });
    }, 1000);
  };

  const businessInfo = {
    name: "NY Entertainment Rwanda",
    phone: "+250 780 145 562",
    email: "nyentertainment@gmail.com",
    address: "Kamonyi, Rwanda"
  };

  const faqs = [
    { qKey: "faq1q", aKey: "faq1a" },
    { qKey: "faq2q", aKey: "faq2a" },
    { qKey: "faq3q", aKey: "faq3a" },
    { qKey: "faq4q", aKey: "faq4a" },
    { qKey: "faq5q", aKey: "faq5a" }
  ];

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#ddd";

  const customStyles = {
    container: { minHeight: "100vh", background: bgColor, transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: "#ffc107", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: `linear-gradient(135deg, ${darkMode ? "#000" : "#000"} 0%, #1a1a1a 100%)`, color: "#fff", padding: "60px 20px", textAlign: "center" },
    heroTitle: { fontSize: "clamp(28px, 5vw, 42px)", marginBottom: "15px", fontWeight: "bold", color: "#ffffff" },
    heroSubtitle: { fontSize: "clamp(14px, 4vw, 18px)", opacity: 0.9, color: "#ffffff" },
    mainLayout: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", flexWrap: "wrap" },
    leftSection: { flex: "2", minWidth: "300px" },
    rightSection: { flex: "1", minWidth: "280px" },
    successBox: { background: "#d4edda", color: "#155724", padding: "15px 20px", borderRadius: "12px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "15px" },
    successIcon: { fontSize: "24px" },
    successTitle: { margin: 0, fontSize: "16px" },
    successText: { margin: 0, fontSize: "13px", opacity: 0.9 },
    formCard: { background: cardBg, borderRadius: "20px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    formTitle: { fontSize: "24px", marginBottom: "25px", color: textColor },
    formRow: { display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
    formGroup: { flex: "1", minWidth: "200px" },
    label: { display: "block", marginBottom: "8px", fontWeight: "500", color: textColor },
    input: { width: "100%", padding: "12px", border: `1px solid ${borderColor}`, borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", background: darkMode ? "#333" : "#fff", color: textColor },
    textarea: { width: "100%", padding: "12px", border: `1px solid ${borderColor}`, borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: darkMode ? "#333" : "#fff", color: textColor },
    inputError: { borderColor: "#dc3545" },
    errorText: { color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" },
    formButtons: { display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" },
    submitBtn: { flex: "1", padding: "14px", background: "#ffc107", color: "#000", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
    resetBtn: { padding: "14px 25px", background: darkMode ? "#333" : "#f0f0f0", color: textColor, border: `1px solid ${borderColor}`, borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
    infoCard: { background: cardBg, borderRadius: "16px", padding: "25px", marginBottom: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    socialCard: { background: cardBg, borderRadius: "16px", padding: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    infoTitle: { fontSize: "20px", marginBottom: "20px", color: textColor, borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
    infoItem: { display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-start" },
    infoIcon: { fontSize: "20px", color: "#ffc107", marginTop: "3px" },
    socialLinks: { display: "flex", flexDirection: "column", gap: "12px" },
    socialLink: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: darkMode ? "#333" : "#f8f9fa", borderRadius: "8px", textDecoration: "none", color: textColor, transition: "transform 0.3s", border: `1px solid ${borderColor}` },
    faqSection: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 60px" },
    faqTitle: { fontSize: "clamp(24px, 5vw, 32px)", textAlign: "center", marginBottom: "40px", color: textColor },
    faqGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" },
    faqCard: { background: cardBg, padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    faqQuestion: { fontSize: "16px", marginBottom: "10px", color: textColor },
    faqAnswer: { fontSize: "14px", color: textMuted, lineHeight: "1.6" },
    whatsappFloat: { position: "fixed", bottom: "20px", left: "20px", background: "#25D366", width: "55px", height: "55px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1000, transition: "transform 0.3s, box-shadow 0.3s", animation: "pulse 2s ease-in-out infinite" },
    whatsappIcon: { fontSize: "30px", color: "#fff" }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.08);
            opacity: 0.9;
          }
        }
        .card-animate { animation: fadeIn 0.3s ease both; }
        .social-link:hover { transform: translateY(-2px); background: #ffc107 !important; color: #000 !important; }
        @media (max-width: 768px) {
          .faq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={customStyles.container}>
        
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} style={customStyles.darkModeBtn}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div style={customStyles.hero}>
          <h1 style={customStyles.heroTitle}>{t('contact.title')}</h1>
          <p style={customStyles.heroSubtitle}>{t('contact.subtitle')}</p>
        </div>

        <div style={customStyles.mainLayout}>
          <div style={customStyles.leftSection}>
            {submitted && (
              <div style={customStyles.successBox} className="card-animate">
                <FaCheckCircle style={customStyles.successIcon} />
                <div>
                  <h3 style={customStyles.successTitle}>{t('contact.successTitle')}</h3>
                  <p style={customStyles.successText}>{t('contact.successText')}</p>
                </div>
              </div>
            )}

            <div style={customStyles.formCard} className="card-animate">
              <h2 style={customStyles.formTitle}>{t('contact.formTitle')}</h2>
              <form onSubmit={handleSubmit}>
                <div style={customStyles.formRow}>
                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>{t('contact.fullName')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contact.fullNamePlaceholder')}
                      style={{ ...customStyles.input, ...(errors.name ? customStyles.inputError : {}) }}
                    />
                    {errors.name && <span style={customStyles.errorText}>{errors.name}</span>}
                  </div>

                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>{t('contact.email')} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contact.emailPlaceholder')}
                      style={{ ...customStyles.input, ...(errors.email ? customStyles.inputError : {}) }}
                    />
                    {errors.email && <span style={customStyles.errorText}>{errors.email}</span>}
                  </div>
                </div>

                <div style={customStyles.formRow}>
                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>{t('contact.phone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contact.phonePlaceholder')}
                      style={{ ...customStyles.input, ...(errors.phone ? customStyles.inputError : {}) }}
                    />
                    {errors.phone && <span style={customStyles.errorText}>{errors.phone}</span>}
                  </div>

                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>{t('contact.eventDate')}</label>
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleChange}
                      style={customStyles.input}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div style={customStyles.formGroup}>
                  <label style={customStyles.label}>{t('contact.subject')} *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{ ...customStyles.input, ...(errors.subject ? customStyles.inputError : {}) }}
                  >
                    <option value="">{t('contact.selectSubject')}</option>
                    <option value="Booking Inquiry">{t('contact.subjectBooking')}</option>
                    <option value="General Question">{t('contact.subjectGeneral')}</option>
                    <option value="Partnership">{t('contact.subjectPartnership')}</option>
                    <option value="Support">{t('contact.subjectSupport')}</option>
                    <option value="Other">{t('contact.subjectOther')}</option>
                  </select>
                  {errors.subject && <span style={customStyles.errorText}>{errors.subject}</span>}
                </div>

                <div style={customStyles.formGroup}>
                  <label style={customStyles.label}>{t('contact.message')} *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows="5"
                    style={{ ...customStyles.textarea, ...(errors.message ? customStyles.inputError : {}) }}
                  />
                  {errors.message && <span style={customStyles.errorText}>{errors.message}</span>}
                </div>

                <div style={customStyles.formButtons}>
                  <button type="submit" disabled={loading} style={customStyles.submitBtn}>
                    {loading ? t('contact.sending') : t('contact.sendMessage')}
                  </button>
                  <button type="reset" onClick={() => setFormData({ name: "", email: "", phone: "", weddingDate: "", subject: "", message: "" })} style={customStyles.resetBtn}>
                    {t('contact.resetForm')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div style={customStyles.rightSection}>
            <div style={customStyles.infoCard} className="card-animate">
              <h3 style={customStyles.infoTitle}>{t('contact.businessInfo')}</h3>
              <div style={customStyles.infoItem}>
                <FaMapMarkerAlt style={customStyles.infoIcon} />
                <div>
                  <strong>{t('contact.location')}</strong>
                  <p>{businessInfo.address}</p>
                </div>
              </div>
              <div style={customStyles.infoItem}>
                <FaPhone style={customStyles.infoIcon} />
                <div>
                  <strong>{t('contact.phone')}</strong>
                  <p>{businessInfo.phone}</p>
                </div>
              </div>
              <div style={customStyles.infoItem}>
                <FaEnvelope style={customStyles.infoIcon} />
                <div>
                  <strong>{t('contact.email')}</strong>
                  <p>{businessInfo.email}</p>
                </div>
              </div>
            </div>

            <div style={customStyles.socialCard} className="card-animate">
              <h3 style={customStyles.infoTitle}>{t('contact.followUs')}</h3>
              <div style={customStyles.socialLinks}>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaInstagram /> Instagram</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaYoutube /> YouTube</a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaTiktok /> TikTok</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaFacebook /> Facebook</a>
                <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer" className="social-link" style={{ ...customStyles.socialLink, background: "#25D366", color: "#fff", border: "none" }}><FaWhatsapp /> {t('contact.whatsappChat')}</a>
              </div>
            </div>
          </div>
        </div>

        <div style={customStyles.faqSection}>
          <h2 style={customStyles.faqTitle}>{t('contact.faqTitle')}</h2>
          <div className="faq-grid" style={customStyles.faqGrid}>
            {faqs.map((faq, index) => (
              <div key={index} style={customStyles.faqCard} className="card-animate">
                <h3 style={customStyles.faqQuestion}>{t(`contact.${faq.qKey}`)}</h3>
                <p style={customStyles.faqAnswer}>{t(`contact.${faq.aKey}`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating WhatsApp with slow motion animation */}
        <a
          href="https://wa.me/250780145562?text=Hello%20NY%20Entertainment%2C%20I%20have%20a%20question%20about%20wedding%20videography"
          target="_blank"
          rel="noreferrer"
          style={customStyles.whatsappFloat}
          onMouseEnter={e => { e.currentTarget.style.animation = "none"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.animation = "pulse 2s ease-in-out infinite"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <FaWhatsapp style={customStyles.whatsappIcon} />
        </a>
      </div>
    </>
  );
}

export default Contact;