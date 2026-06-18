// src/pages/Register.jsx
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { register, sendWelcomeEmail } from '../services/api';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    emailAddress: '',
    phoneNumber: '',
    userPassword: '',
    confirmUserPassword: '',
    role: 'client',
    district: '',
    bio: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
    whatsapp: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Clear any previous session data on mount
  useEffect(() => {
    const sessionKeys = [
      'user_logged_in', 'admin_logged_in', 'couple_logged_in', 
      'creator_logged_in', 'client_logged_in', 'user_email', 
      'user_role', 'user_name', 'user_username', 'user_phone', 
      'user_bio', 'user_district', 'user_profile_image', 
      'user_cover_image', 'user_social_links', 'user_notifications',
      'creator_profile', 'creator_profile_image', 'couple_name', 
      'creator_name', 'client_name', 'token'
    ];
    sessionKeys.forEach(key => localStorage.removeItem(key));
    
    setFormData({
      fullname: '',
      username: '',
      emailAddress: '',
      phoneNumber: '',
      userPassword: '',
      confirmUserPassword: '',
      role: 'client',
      district: '',
      bio: '',
      instagram: '',
      tiktok: '',
      youtube: '',
      facebook: '',
      whatsapp: ''
    });
    setProfileImage(null);
    setProfileImagePreview(null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'userPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return t('register.passwordWeak');
    if (passwordStrength <= 3) return t('register.passwordFair');
    if (passwordStrength <= 4) return t('register.passwordGood');
    return t('register.passwordStrong');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#dc3545';
    if (passwordStrength <= 3) return '#ffc107';
    if (passwordStrength <= 4) return '#17a2b8';
    return '#28a745';
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError(t('register.imageTooLarge'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t('register.imageTypeError'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.fullname.trim()) {
      setError(t('register.fullNameRequired'));
      setLoading(false);
      return;
    }
    if (!formData.username.trim()) {
      setError(t('register.usernameRequired'));
      setLoading(false);
      return;
    }
    if (!formData.emailAddress.trim()) {
      setError(t('register.emailRequired'));
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      setError(t('register.emailInvalid'));
      setLoading(false);
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError(t('register.phoneRequired'));
      setLoading(false);
      return;
    }
    if (!formData.userPassword) {
      setError(t('register.passwordRequired'));
      setLoading(false);
      return;
    }
    if (formData.userPassword !== formData.confirmUserPassword) {
      setError(t('register.passwordMismatch'));
      setLoading(false);
      return;
    }
    if (formData.userPassword.length < 6) {
      setError(t('register.passwordLength'));
      setLoading(false);
      return;
    }

    try {
      // Register with backend
      const result = await register({
        name: formData.fullname,
        email: formData.emailAddress,
        password: formData.userPassword,
        phone: formData.phoneNumber,
        role: formData.role
      });

      if (result.success) {
        // Save token and user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('user_email', result.user.email);
        localStorage.setItem('user_role', result.user.role);
        localStorage.setItem('user_name', result.user.name);
        localStorage.setItem('user_phone', result.user.phone || '');
        localStorage.setItem('user_logged_in', 'true');
        
        // Store additional profile data in localStorage for frontend use
        localStorage.setItem('user_username', formData.username);
        localStorage.setItem('user_bio', formData.bio);
        localStorage.setItem('user_district', formData.district);
        if (profileImage) {
          localStorage.setItem('user_profile_image', profileImage);
        }
        
        // Store social links
        localStorage.setItem('user_social_links', JSON.stringify({
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          facebook: formData.facebook,
          whatsapp: formData.whatsapp
        }));

        // Set role-specific flags
        if (formData.role === 'couple') {
          localStorage.setItem('couple_logged_in', 'true');
          localStorage.setItem('couple_name', formData.fullname);
        } else if (formData.role === 'creator') {
          localStorage.setItem('creator_logged_in', 'true');
          localStorage.setItem('creator_name', formData.fullname);
        } else {
          localStorage.setItem('client_logged_in', 'true');
          localStorage.setItem('client_name', formData.fullname);
        }

        // Send welcome email
        try {
          await sendWelcomeEmail(formData.emailAddress, formData.fullname);
        } catch (emailError) {
          console.log('Email sending failed but registration successful');
        }

        // Add welcome notification
        const notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
        notifications.unshift({
          id: Date.now(),
          title: t('register.welcomeNotificationTitle'),
          message: t('register.welcomeNotificationMessage', { name: formData.fullname }),
          type: 'welcome',
          read: false,
          date: new Date().toLocaleDateString()
        });
        localStorage.setItem('user_notifications', JSON.stringify(notifications.slice(0, 50)));

        // Redirect based on role
        if (formData.role === 'couple') {
          navigate('/couple/dashboard');
        } else if (formData.role === 'creator') {
          navigate('/creator/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || t('register.registerError'));
      }
    } catch (err) {
      setError(t('register.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const districts = [
    'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza',
    'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke',
    'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara', 'Huye', 'Kamonyi',
    'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango', 'Karongi',
    'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'
  ];

  const isMobileView = window.innerWidth <= 768;
  
  const styles = {
    container: {
      minHeight: "100vh",
      background: "#f0f2f5",
      padding: isMobileView ? "20px 16px" : "60px 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      width: "100%",
      maxWidth: isMobileView ? "100%" : "750px",
      background: "#ffffff",
      padding: isMobileView ? "24px 16px" : "40px",
      borderRadius: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    icon: { 
      fontSize: isMobileView ? "36px" : "48px", 
      textAlign: "center", 
      marginBottom: "16px" 
    },
    title: { 
      textAlign: "center", 
      marginBottom: "8px", 
      fontSize: isMobileView ? "24px" : "28px", 
      fontWeight: "700", 
      color: "#333" 
    },
    subtitle: { 
      textAlign: "center", 
      marginBottom: "24px", 
      fontSize: isMobileView ? "13px" : "14px", 
      color: "#666" 
    },
    errorBox: { 
      background: "#f8d7da", 
      color: "#721c24", 
      padding: "12px", 
      borderRadius: "10px", 
      marginBottom: "20px", 
      textAlign: "center",
      fontSize: isMobileView ? "13px" : "14px"
    },
    profileImageSection: { 
      textAlign: "center", 
      marginBottom: "20px" 
    },
    avatarContainer: { 
      display: "inline-block", 
      cursor: "pointer" 
    },
    avatarPreview: { 
      width: isMobileView ? "70px" : "80px", 
      height: isMobileView ? "70px" : "80px", 
      borderRadius: "50%", 
      objectFit: "cover", 
      border: "3px solid #ffc107" 
    },
    avatarPlaceholder: { 
      width: isMobileView ? "70px" : "80px", 
      height: isMobileView ? "70px" : "80px", 
      borderRadius: "50%", 
      background: "#f0f0f0", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      border: "3px dashed #ccc", 
      cursor: "pointer" 
    },
    avatarText: { 
      fontSize: "10px", 
      color: "#999", 
      marginTop: "5px" 
    },
    avatarHint: { 
      fontSize: "11px", 
      color: "#999", 
      marginTop: "5px", 
      textAlign: "center" 
    },
    row: { 
      display: "grid", 
      gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", 
      gap: "15px", 
      marginBottom: "15px" 
    },
    inputGroup: { 
      marginBottom: "15px" 
    },
    label: { 
      display: "block", 
      marginBottom: "8px", 
      fontWeight: "600", 
      color: "#333", 
      fontSize: "13px" 
    },
    input: { 
      width: "100%", 
      padding: "12px", 
      border: "1px solid #ddd", 
      borderRadius: "10px", 
      fontSize: isMobileView ? "16px" : "14px", 
      boxSizing: "border-box", 
      outline: "none", 
      transition: "border-color 0.2s",
      WebkitAppearance: "none"
    },
    textarea: { 
      width: "100%", 
      padding: "12px", 
      border: "1px solid #ddd", 
      borderRadius: "10px", 
      fontSize: "14px", 
      boxSizing: "border-box", 
      resize: "vertical", 
      fontFamily: "inherit", 
      outline: "none" 
    },
    passwordContainer: { 
      display: "flex", 
      alignItems: "center", 
      gap: "10px" 
    },
    passwordInput: { 
      flex: 1, 
      padding: "12px", 
      border: "1px solid #ddd", 
      borderRadius: "10px", 
      fontSize: "16px", 
      outline: "none" 
    },
    passwordToggle: { 
      padding: "10px 12px", 
      background: "#f0f0f0", 
      border: "none", 
      borderRadius: "10px", 
      cursor: "pointer" 
    },
    strengthContainer: { 
      marginTop: "8px", 
      display: "flex", 
      alignItems: "center", 
      gap: "10px" 
    },
    strengthBar: { 
      height: "4px", 
      borderRadius: "2px", 
      transition: "width 0.3s" 
    },
    strengthText: { 
      fontSize: "11px", 
      fontWeight: "500" 
    },
    socialSection: { 
      marginTop: "20px", 
      paddingTop: "15px", 
      borderTop: "1px solid #eee" 
    },
    socialTitle: { 
      fontSize: "14px", 
      marginBottom: "15px", 
      color: "#555" 
    },
    button: { 
      width: "100%", 
      padding: "14px", 
      background: "#000", 
      color: "#fff", 
      border: "none", 
      borderRadius: "10px", 
      fontSize: isMobileView ? "16px" : "16px", 
      fontWeight: "bold", 
      cursor: "pointer", 
      marginTop: "20px",
      transition: "opacity 0.2s"
    },
    footer: { 
      marginTop: "20px", 
      textAlign: "center", 
      fontSize: "14px", 
      color: "#666" 
    },
    link: { 
      color: "#ffc107", 
      textDecoration: "none", 
      fontWeight: "600" 
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📝</div>
        <h1 style={styles.title}>{t('register.title')}</h1>
        <p style={styles.subtitle}>{t('register.subtitle')}</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Honeypot fields to trick browsers */}
          <input type="text" name="fakeusername" style={{ display: 'none' }} />
          <input type="password" name="fakepassword" style={{ display: 'none' }} />
          
          <div style={styles.profileImageSection}>
            <div style={styles.avatarContainer} onClick={() => fileInputRef.current.click()}>
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" style={styles.avatarPreview} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <span>📷</span>
                  <span style={styles.avatarText}>{t('register.uploadPhoto')}</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfileImageUpload} />
            </div>
            <p style={styles.avatarHint}>{t('register.photoHint')}</p>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.fullName')} *</label>
              <input 
                type="text" 
                name="fullname" 
                value={formData.fullname} 
                onChange={handleChange} 
                placeholder={t('register.fullNamePlaceholder')}
                autoComplete="off"
                data-lpignore="true"
                required 
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.username')} *</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder={t('register.usernamePlaceholder')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                required 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.email')} *</label>
              <input 
                type="email" 
                name="emailAddress" 
                value={formData.emailAddress} 
                onChange={handleChange} 
                placeholder={t('register.emailPlaceholder')}
                autoComplete="off"
                data-lpignore="true"
                required 
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.phone')} *</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder={t('register.phonePlaceholder')}
                autoComplete="off"
                data-lpignore="true"
                required 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.password')} *</label>
              <div style={styles.passwordContainer}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="userPassword" 
                  value={formData.userPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  autoComplete="new-password"
                  data-lpignore="true"
                  required 
                  style={styles.passwordInput} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
              {formData.userPassword && (
                <div style={styles.strengthContainer}>
                  <div style={{ ...styles.strengthBar, width: `${(passwordStrength / 5) * 100}%`, background: getPasswordStrengthColor() }}></div>
                  <span style={{ ...styles.strengthText, color: getPasswordStrengthColor() }}>{getPasswordStrengthText()}</span>
                </div>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.confirmPassword')} *</label>
              <div style={styles.passwordContainer}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmUserPassword" 
                  value={formData.confirmUserPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  autoComplete="off"
                  data-lpignore="true"
                  required 
                  style={styles.passwordInput} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>{showConfirmPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('register.accountType')} *</label>
            <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
              <option value="client">👤 {t('register.accountClient')}</option>
              <option value="couple">💑 {t('register.accountCouple')}</option>
              <option value="creator">🎬 {t('register.accountCreator')}</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('register.district')}</label>
              <select name="district" value={formData.district} onChange={handleChange} style={styles.input}>
                <option value="">{t('register.selectDistrict')}</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('register.bio')}</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder={t('register.bioPlaceholder')} style={styles.textarea} />
          </div>

          <div style={styles.socialSection}>
            <h4 style={styles.socialTitle}>{t('register.socialLinks')}</h4>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Instagram</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/username" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>TikTok</label>
                <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@username" style={styles.input} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>YouTube</label>
                <input type="text" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/@username" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Facebook</label>
                <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/username" style={styles.input} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp</label>
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+250 7XX XXX XXX" style={styles.input} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? t('common.loading') : t('register.register')}
          </button>
        </form>

        <div style={styles.footer}>
          {t('register.haveAccount')} <Link to="/login" style={styles.link}>{t('register.loginHere')}</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;