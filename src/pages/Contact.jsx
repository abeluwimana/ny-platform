// src/pages/Contact.jsx
import emailjs from '@emailjs/browser';
import { useEffect, useState } from "react";
import { FaCheckCircle, FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_gcvnehd";
const EMAILJS_TEMPLATE_ID = "template_52il3x4";
const EMAILJS_PUBLIC_KEY = "VIDMuTVCjadb2ZJa9";

function Contact() {
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

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
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
          to_email: "nyentertainmentrwanda@gmail.com",
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          wedding_date: formData.weddingDate || "Not specified",
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
    { q: "How do I book a wedding videography session?", a: "Simply fill out the booking form on our Book page, select your package, choose your date, and submit. You'll receive a confirmation within 24 hours." },
    { q: "What are your wedding packages?", a: "We offer Traditional Wedding (DOTE), Church Wedding, Reception Coverage, and Full Wedding Package." },
    { q: "What is Abamararungu Traditional Dancer?", a: "Abamararungu is a traditional Rwandan cultural dancer who performs at weddings. You can add this option when booking." },
    { q: "Do you travel outside Kamonyi?", a: "Yes, we cover weddings across all districts of Rwanda. Travel fees may apply." },
    { q: "How long does video editing take?", a: "Editing typically takes 2-4 weeks after the wedding date." }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📞 Contact Us</h1>
        <p style={styles.heroSubtitle}>Get in touch with NY Entertainment Rwanda</p>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.leftSection}>
          {submitted && (
            <div style={styles.successBox}>
              <FaCheckCircle style={styles.successIcon} />
              <div>
                <h3 style={styles.successTitle}>Message Sent Successfully!</h3>
                <p style={styles.successText}>We'll get back to you within 24 hours.</p>
              </div>
            </div>
          )}

          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
                  />
                  {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250 788 123 456"
                    style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                  />
                  {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Wedding Date (Optional)</label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    style={styles.input}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.subject ? styles.inputError : {}) }}
                >
                  <option value="">Select a subject</option>
                  <option value="Booking Inquiry">Booking Inquiry</option>
                  <option value="General Question">General Question</option>
                  <option value="Partnership">Partnership / Collaboration</option>
                  <option value="Support">Customer Support</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && <span style={styles.errorText}>{errors.subject}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  style={{ ...styles.textarea, ...(errors.message ? styles.inputError : {}) }}
                />
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </div>

              <div style={styles.formButtons}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
                <button type="reset" onClick={() => setFormData({ name: "", email: "", phone: "", weddingDate: "", subject: "", message: "" })} style={styles.resetBtn}>
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={styles.rightSection}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📌 Business Info</h3>
            <div style={styles.infoItem}>
              <FaMapMarkerAlt style={styles.infoIcon} />
              <div>
                <strong>Location</strong>
                <p>{businessInfo.address}</p>
              </div>
            </div>
            <div style={styles.infoItem}>
              <FaPhone style={styles.infoIcon} />
              <div>
                <strong>Phone</strong>
                <p>{businessInfo.phone}</p>
              </div>
            </div>
            <div style={styles.infoItem}>
              <FaEnvelope style={styles.infoIcon} />
              <div>
                <strong>Email</strong>
                <p>{businessInfo.email}</p>
              </div>
            </div>
          </div>

          <div style={styles.socialCard}>
            <h3 style={styles.infoTitle}>📱 Follow Us</h3>
            <div style={styles.socialLinks}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialLink}><FaInstagram /> Instagram</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" style={styles.socialLink}><FaYoutube /> YouTube</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" style={styles.socialLink}><FaTiktok /> TikTok</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialLink}><FaFacebook /> Facebook</a>
              <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer" style={{ ...styles.socialLink, background: "#25D366", color: "#fff" }}><FaWhatsapp /> WhatsApp Chat</a>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.faqSection}>
        <h2 style={styles.faqTitle}>❓ Frequently Asked Questions</h2>
        <div style={styles.faqGrid}>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqCard}>
              <h3 style={styles.faqQuestion}>{faq.q}</h3>
              <p style={styles.faqAnswer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="https://wa.me/250780145562?text=Hello%20NY%20Entertainment%2C%20I%20have%20a%20question%20about%20wedding%20videography"
        target="_blank"
        rel="noreferrer"
        style={styles.whatsappFloat}
      >
        <FaWhatsapp style={styles.whatsappIcon} />
      </a>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  hero: { background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff", padding: "60px 20px", textAlign: "center" },
  heroTitle: { fontSize: "42px", marginBottom: "15px", fontWeight: "bold" },
  heroSubtitle: { fontSize: "18px", opacity: 0.9 },
  mainLayout: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", flexWrap: "wrap" },
  leftSection: { flex: "2", minWidth: "300px" },
  rightSection: { flex: "1", minWidth: "280px" },
  successBox: { background: "#d4edda", color: "#155724", padding: "15px 20px", borderRadius: "12px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "15px" },
  successIcon: { fontSize: "24px" },
  successTitle: { margin: 0, fontSize: "16px" },
  successText: { margin: 0, fontSize: "13px", opacity: 0.9 },
  formCard: { background: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  formTitle: { fontSize: "24px", marginBottom: "25px", color: "#333" },
  formRow: { display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
  formGroup: { flex: "1", minWidth: "200px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" },
  input: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  inputError: { borderColor: "#dc3545" },
  errorText: { color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" },
  formButtons: { display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" },
  submitBtn: { flex: "1", padding: "14px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  resetBtn: { padding: "14px 25px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
  infoCard: { background: "#fff", borderRadius: "16px", padding: "25px", marginBottom: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  socialCard: { background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  infoTitle: { fontSize: "20px", marginBottom: "20px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  infoItem: { display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-start" },
  infoIcon: { fontSize: "20px", color: "#ffc107", marginTop: "3px" },
  socialLinks: { display: "flex", flexDirection: "column", gap: "12px" },
  socialLink: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", textDecoration: "none", color: "#333", transition: "transform 0.3s" },
  faqSection: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 60px" },
  faqTitle: { fontSize: "32px", textAlign: "center", marginBottom: "40px", color: "#333" },
  faqGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" },
  faqCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  faqQuestion: { fontSize: "16px", marginBottom: "10px", color: "#333" },
  faqAnswer: { fontSize: "14px", color: "#666", lineHeight: "1.6" },
  whatsappFloat: { position: "fixed", bottom: "20px", right: "20px", background: "#25D366", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1000, transition: "transform 0.3s" },
  whatsappIcon: { fontSize: "32px", color: "#fff" }
};

export default Contact;