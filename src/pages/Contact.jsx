// src/pages/Contact.jsx
// SHINECONNECT - Contact Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import emailjs from '@emailjs/browser';
import { useEffect, useState } from "react";
import { FaCheckCircle, FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_gcvnehd";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_52il3x4";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "VIDMuTVCjadb2ZJa9";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
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
    document.body.style.background = newMode ? "#111" : "#ffffff";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.subject) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) newErrors.message = "Message is required";
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
          to_email: "shineconnect@nyentertainment.com",
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          event_date: formData.eventDate || "Not specified",
          subject: formData.subject,
          message: formData.message
        },
        EMAILJS_PUBLIC_KEY
      );
      console.log("Email sent successfully!", result);
    } catch (error) {
      console.log("Email error:", error);
    }
    
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventDate: "",
        subject: "",
        message: ""
      });
    }, 1000);
  };

  const businessInfo = {
    name: "SHINECONNECT",
    phone: "+250 780 145 562",
    email: "shineconnect@nyentertainment.com",
    address: "Kamonyi, Rwanda"
  };

  const faqs = [
    { 
      q: "How do I book your services?", 
      a: "You can book directly through our booking page, call us at +250 780 145 562, or send us an email. We'll respond within 24 hours." 
    },
    { 
      q: "What is the price range for your services?", 
      a: "Our packages range from 550,000 RWF for standard coverage to 1,500,000 RWF for our executive package. We also offer custom quotes for specific needs." 
    },
    { 
      q: "How long does it take to get my video?", 
      a: "We deliver highlight videos within 48 hours and full ceremony edits within 2 weeks, depending on the package selected." 
    },
    { 
      q: "Do you offer drone coverage?", 
      a: "Yes! Drone coverage is available for outdoor events and is included in our Premium and Executive packages." 
    },
    { 
      q: "Do you cover events outside Kigali?", 
      a: "Yes! We cover events across all 30 districts of Rwanda. Travel arrangements can be made based on the location." 
    }
  ];

  const bgColor = darkMode ? "#111" : "#ffffff";
  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const textColor = darkMode ? "#fff" : "#000000";
  const textMuted = darkMode ? "#aaa" : "#6b7280";
  const borderColor = darkMode ? "#333" : "#f0f0f0";
  const Y = "#FFD700";

  const customStyles = {
    container: { minHeight: "100vh", background: bgColor, transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", color: "#fff", padding: "80px 20px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroBadge: { display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "30px", padding: "6px 18px", marginBottom: "20px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.15em", textTransform: "uppercase", color: Y },
    heroTitle: { fontSize: "clamp(36px, 6vw, 56px)", marginBottom: "16px", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em" },
    heroSubtitle: { fontSize: "clamp(16px, 4vw, 20px)", opacity: 0.8, color: "#fff", maxWidth: "700px", margin: "0 auto" },
    heroLine: { width: "60px", height: "3px", background: Y, margin: "20px auto 0", borderRadius: "2px" },
    mainLayout: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", flexWrap: "wrap" },
    leftSection: { flex: "2", minWidth: "300px" },
    rightSection: { flex: "1", minWidth: "280px" },
    successBox: { background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46", padding: "16px 20px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "14px" },
    successIcon: { fontSize: "24px", color: "#10b981" },
    successTitle: { margin: 0, fontSize: "16px", fontWeight: "700" },
    successText: { margin: 0, fontSize: "13px", opacity: 0.9 },
    formCard: { background: cardBg, borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    formTitle: { fontSize: "22px", marginBottom: "24px", color: textColor, fontWeight: "700" },
    formRow: { display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" },
    formGroup: { flex: "1", minWidth: "200px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", color: textColor, fontSize: "13px" },
    input: { width: "100%", padding: "12px 14px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", background: darkMode ? "#2a2a2a" : "#fafafa", color: textColor, outline: "none", transition: "border-color 0.2s" },
    textarea: { width: "100%", padding: "12px 14px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: darkMode ? "#2a2a2a" : "#fafafa", color: textColor, outline: "none", transition: "border-color 0.2s" },
    inputError: { borderColor: "#ef4444" },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" },
    formButtons: { display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" },
    submitBtn: { flex: "1", padding: "14px", background: "#000000", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s", minWidth: "150px" },
    resetBtn: { padding: "14px 24px", background: "transparent", color: textColor, border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "background 0.2s" },
    infoCard: { background: cardBg, borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    socialCard: { background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    infoTitle: { fontSize: "18px", marginBottom: "18px", color: textColor, fontWeight: "700", borderLeft: `3px solid ${Y}`, paddingLeft: "12px" },
    infoItem: { display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" },
    infoIcon: { fontSize: "18px", color: Y, marginTop: "2px", minWidth: "20px" },
    socialLinks: { display: "flex", flexDirection: "column", gap: "10px" },
    socialLink: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: "10px", textDecoration: "none", color: textColor, transition: "all 0.3s", border: `1px solid ${borderColor}` },
    faqSection: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 60px" },
    faqTitle: { fontSize: "clamp(28px, 5vw, 36px)", textAlign: "center", marginBottom: "12px", color: textColor, fontWeight: "800" },
    faqSubtitle: { textAlign: "center", fontSize: "16px", color: textMuted, marginBottom: "40px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" },
    faqGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" },
    faqCard: { background: cardBg, padding: "20px", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    faqQuestion: { fontSize: "15px", marginBottom: "8px", color: textColor, fontWeight: "700" },
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
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        .card-animate { animation: fadeIn 0.4s ease both; }
        .social-link:hover { transform: translateY(-2px); background: #FFD700 !important; color: #000 !important; border-color: #FFD700 !important; }
        .faq-card:hover { transform: translateY(-4px); transition: transform 0.3s; }
        input:focus, textarea:focus, select:focus { border-color: #FFD700 !important; box-shadow: 0 0 0 3px rgba(255,215,0,0.1) !important; outline: none; }
        @media (max-width: 768px) {
          .faq-grid { grid-template-columns: 1fr !important; }
          .main-layout { flex-direction: column !important; }
        }
      `}</style>
      <div style={customStyles.container}>
        
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} style={customStyles.darkModeBtn}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Hero Section */}
        <div style={customStyles.hero}>
          <div style={customStyles.heroBadge}>✨ SHINECONNECT</div>
          <h1 style={customStyles.heroTitle}>Contact Us</h1>
          <p style={customStyles.heroSubtitle}>Get in touch with us for inquiries, bookings, or any questions about our services.</p>
          <div style={customStyles.heroLine}></div>
        </div>

        <div className="main-layout" style={customStyles.mainLayout}>
          <div style={customStyles.leftSection}>
            {submitted && (
              <div style={customStyles.successBox} className="card-animate">
                <FaCheckCircle style={customStyles.successIcon} />
                <div>
                  <h3 style={customStyles.successTitle}>Message Sent Successfully! 🎉</h3>
                  <p style={customStyles.successText}>Thank you for contacting SHINECONNECT. We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            <div style={customStyles.formCard} className="card-animate">
              <h2 style={customStyles.formTitle}>Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div style={customStyles.formRow}>
                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      style={{ ...customStyles.input, ...(errors.name ? customStyles.inputError : {}) }}
                    />
                    {errors.name && <span style={customStyles.errorText}>{errors.name}</span>}
                  </div>

                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      style={{ ...customStyles.input, ...(errors.email ? customStyles.inputError : {}) }}
                    />
                    {errors.email && <span style={customStyles.errorText}>{errors.email}</span>}
                  </div>
                </div>

                <div style={customStyles.formRow}>
                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+250 780 000 000"
                      style={{ ...customStyles.input, ...(errors.phone ? customStyles.inputError : {}) }}
                    />
                    {errors.phone && <span style={customStyles.errorText}>{errors.phone}</span>}
                  </div>

                  <div style={customStyles.formGroup}>
                    <label style={customStyles.label}>Event Date</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      style={customStyles.input}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div style={customStyles.formGroup}>
                  <label style={customStyles.label}>Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{ ...customStyles.input, ...(errors.subject ? customStyles.inputError : {}) }}
                  >
                    <option value="">Select a subject</option>
                    <option value="Booking Inquiry">Booking Inquiry</option>
                    <option value="General Question">General Question</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Support">Support</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.subject && <span style={customStyles.errorText}>{errors.subject}</span>}
                </div>

                <div style={customStyles.formGroup}>
                  <label style={customStyles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your event or inquiry..."
                    rows="5"
                    style={{ ...customStyles.textarea, ...(errors.message ? customStyles.inputError : {}) }}
                  />
                  {errors.message && <span style={customStyles.errorText}>{errors.message}</span>}
                </div>

                <div style={customStyles.formButtons}>
                  <button type="submit" disabled={loading} style={customStyles.submitBtn}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button 
                    type="reset" 
                    onClick={() => setFormData({ name: "", email: "", phone: "", eventDate: "", subject: "", message: "" })} 
                    style={customStyles.resetBtn}
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div style={customStyles.rightSection}>
            <div style={customStyles.infoCard} className="card-animate">
              <h3 style={customStyles.infoTitle}>Contact Information</h3>
              <div style={customStyles.infoItem}>
                <FaMapMarkerAlt style={customStyles.infoIcon} />
                <div>
                  <strong style={{ color: textColor }}>Location</strong>
                  <p style={{ color: textMuted, margin: "2px 0 0" }}>{businessInfo.address}</p>
                </div>
              </div>
              <div style={customStyles.infoItem}>
                <FaPhone style={customStyles.infoIcon} />
                <div>
                  <strong style={{ color: textColor }}>Phone</strong>
                  <p style={{ color: textMuted, margin: "2px 0 0" }}>{businessInfo.phone}</p>
                </div>
              </div>
              <div style={customStyles.infoItem}>
                <FaEnvelope style={customStyles.infoIcon} />
                <div>
                  <strong style={{ color: textColor }}>Email</strong>
                  <p style={{ color: textMuted, margin: "2px 0 0" }}>{businessInfo.email}</p>
                </div>
              </div>
              <div style={{ ...customStyles.infoItem, marginBottom: 0 }}>
                <div style={{ ...customStyles.infoIcon, fontSize: "14px" }}>🕐</div>
                <div>
                  <strong style={{ color: textColor }}>Working Hours</strong>
                  <p style={{ color: textMuted, margin: "2px 0 0" }}>Mon-Fri: 9am-6pm, Sat: 10am-4pm</p>
                </div>
              </div>
            </div>

            <div style={customStyles.socialCard} className="card-animate">
              <h3 style={customStyles.infoTitle}>Follow Us</h3>
              <div style={customStyles.socialLinks}>
                <a href="https://instagram.com/shineconnect" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaInstagram /> Instagram</a>
                <a href="https://youtube.com/shineconnect" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaYoutube /> YouTube</a>
                <a href="https://tiktok.com/@shineconnect" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaTiktok /> TikTok</a>
                <a href="https://facebook.com/shineconnect" target="_blank" rel="noreferrer" className="social-link" style={customStyles.socialLink}><FaFacebook /> Facebook</a>
                <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer" className="social-link" style={{ ...customStyles.socialLink, background: "#25D366", color: "#fff", border: "none" }}><FaWhatsapp /> WhatsApp Chat</a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={customStyles.faqSection}>
          <h2 style={customStyles.faqTitle}>Frequently Asked Questions</h2>
          <p style={customStyles.faqSubtitle}>Find answers to common questions about our services</p>
          <div className="faq-grid" style={customStyles.faqGrid}>
            {faqs.map((faq, index) => (
              <div key={index} style={customStyles.faqCard} className="card-animate">
                <h3 style={customStyles.faqQuestion}>{faq.q}</h3>
                <p style={customStyles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating WhatsApp */}
        <a
          href="https://wa.me/250780145562?text=Hello%20SHINECONNECT%2C%20I%20have%20a%20question%20about%20your%20services"
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