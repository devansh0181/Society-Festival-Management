import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Key
} from 'lucide-react';

export default function AuthPage() {
  const { login, signup, forgotPassword, verifyAccount, resetPasswordWithPin } = useMandal();

  // Active tab: 'login' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState('login');

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup states
  const [signupSocietyName, setSignupSocietyName] = useState('');
  const [signupAdminName, setSignupAdminName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password states
  const [forgotInput, setForgotInput] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = find account, 2 = set new password with Admin PIN
  const [foundAccount, setFoundAccount] = useState(null);
  const [resetPin, setResetPin] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setForgotSuccessMessage('');
  };

  // Switch tab helper
  const handleSwitchTab = (tab) => {
    clearMessages();
    setActiveTab(tab);
    if (tab === 'forgot') {
      setResetStep(1);
      setFoundAccount(null);
      setResetPin('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number or email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!signupSocietyName.trim()) {
      setErrorMessage('Please enter your Society / Mandal name.');
      return;
    }
    const cleanMobile = signupMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address (required for password recovery).');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        societyName: signupSocietyName.trim(),
        adminName: signupAdminName.trim() || 'Society Secretary',
        mobile: cleanMobile,
        email: signupEmail.trim(),
        password: signupPassword
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 1 of Password Reset: Find Account
  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!forgotInput.trim()) {
      setErrorMessage('Please enter your registered mobile number or email address.');
      return;
    }

    setIsLoading(true);
    try {
      const acc = await verifyAccount(forgotInput.trim());
      setFoundAccount(acc);
      setResetStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'No registered society account found for this mobile/email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2 of Password Reset: Set New Password via Admin PIN
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!resetPin.trim()) {
      setErrorMessage('Please enter your 4-digit Admin PIN.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithPin({
        identifier: forgotInput.trim(),
        adminPin: resetPin.trim(),
        newPassword: resetNewPassword
      });
      setForgotSuccessMessage(res.message || 'Password reset successfully! Please login.');
      setLoginIdentifier(forgotInput.trim());
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password. Please check your 4-digit Admin PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Try sending Email Link if available
  const handleSendEmailLink = async () => {
    clearMessages();
    if (!forgotInput.trim()) {
      setErrorMessage('Please enter your registered mobile or email first.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await forgotPassword(forgotInput.trim());
      setForgotSuccessMessage(res.message || `Password reset email dispatched to ${res.email}!`);
    } catch (err) {
      setErrorMessage(err.message || 'Cloud email service not activated on this project. Please use the Admin PIN reset above.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" id="society-auth-screen">
      {/* Background ambient accents */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span style={{ fontSize: '24px' }}>🚩</span>
          </div>
          <h1 className="auth-title">Society Festival & Treasury</h1>
          <p className="auth-subtitle">
            Centralized Financial Transparency & Audited Festival Records for Residential Societies & Mandals
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="auth-tabs-strip">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('login')}
            id="tab-btn-login"
          >
            <KeyRound size={14} />
            <span>Login</span>
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('signup')}
            id="tab-btn-signup"
          >
            <Building2 size={14} />
            <span>New Society</span>
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'forgot' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('forgot')}
            id="tab-btn-forgot"
          >
            <RotateCcw size={14} />
            <span>Reset Password</span>
          </button>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="auth-alert error" id="auth-error-alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '12.5px' }}>{errorMessage}</div>
          </div>
        )}

        {/* Success Callout */}
        {forgotSuccessMessage && (
          <div className="auth-alert success" id="auth-success-alert">
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '12.5px' }}>{forgotSuccessMessage}</div>
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form" id="form-society-login">
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={13} /> Mobile Number or Email
                </span>
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-input"
                  id="login-input-identifier"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. 9328171008 or secretary@society.org"
                  required
                  autoFocus
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter your registered 10-digit mobile number or email
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={13} /> Password
                  </span>
                </label>
                <button
                  type="button"
                  className="link-text-btn"
                  onClick={() => {
                    if (loginIdentifier.trim()) setForgotInput(loginIdentifier.trim());
                    handleSwitchTab('forgot');
                  }}
                  style={{ fontSize: '11.5px', color: 'var(--saffron-900)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  id="login-input-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              id="btn-login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Logging In...</span>
              ) : (
                <>
                  <span>Login to Society Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12.5px', color: 'var(--text-body)' }}>
              Want to register a new society?{' '}
              <button
                type="button"
                className="link-text-btn"
                onClick={() => handleSwitchTab('signup')}
                style={{ fontWeight: 700, color: 'var(--saffron-900)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Register Here
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP TAB */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="auth-form" id="form-society-signup">
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--saffron-900)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.45 }}>
                <strong>Independent Society Portal:</strong> Each registered organization gets private financial books, member records, and festival balance sheets.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Building2 size={13} /> Society / Organization Name
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                id="signup-input-society-name"
                value={signupSocietyName}
                onChange={(e) => setSignupSocietyName(e.target.value)}
                placeholder="e.g. Gokul Heights Welfare Association"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} /> Admin / Secretary Name
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                id="signup-input-admin-name"
                value={signupAdminName}
                onChange={(e) => setSignupAdminName(e.target.value)}
                placeholder="e.g. Rajesh Patel (Treasurer / Secretary)"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={13} /> Mobile Number
                  </span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  id="signup-input-mobile"
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Used as direct login ID</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} /> Email Address
                  </span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  id="signup-input-email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. rajesh@gmail.com"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>For password reset</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={13} /> Password
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="form-input"
                    id="signup-input-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                    style={{ paddingRight: '34px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={13} /> Confirm Password
                  </span>
                </label>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  className="form-input"
                  id="signup-input-confirm-password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              id="btn-signup-submit"
              disabled={isLoading}
              style={{ marginTop: '10px' }}
            >
              {isLoading ? (
                <span>Registering Society...</span>
              ) : (
                <>
                  <span>Create Society & Open Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: 'var(--text-body)' }}>
              Already registered?{' '}
              <button
                type="button"
                className="link-text-btn"
                onClick={() => handleSwitchTab('login')}
                style={{ fontWeight: 700, color: 'var(--saffron-900)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Login to Society
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT / RESET PASSWORD TAB */}
        {activeTab === 'forgot' && (
          <div className="auth-form" id="form-society-forgot">
            {resetStep === 1 ? (
              // Step 1: Identify Registered Account
              <form onSubmit={handleVerifyAccount}>
                <div style={{ marginBottom: '14px', fontSize: '12.5px', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  Enter your registered <strong>10-Digit Mobile Number</strong> or <strong>Email Address</strong> to find your society account and reset your password.
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} /> Registered Mobile or Email
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    id="forgot-input-target"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="e.g. 9328171008 or secretary@society.org"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  id="btn-forgot-verify"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Verifying Account...</span>
                  ) : (
                    <>
                      <span>Find Account & Reset Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="link-text-btn"
                    onClick={() => handleSwitchTab('login')}
                    style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ← Back to Login
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmailLink}
                    style={{ fontSize: '11px', color: 'var(--saffron-900)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Send Email Link
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Set New Password via Admin PIN Verification
              <form onSubmit={handleResetPasswordSubmit}>
                {foundAccount && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>
                      ACCOUNT VERIFIED
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532D', marginTop: '2px' }}>
                      {foundAccount.societyName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                      Admin: {foundAccount.adminName} • Mobile: {foundAccount.mobile}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Key size={13} /> 4-Digit Admin PIN
                    </span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    id="reset-input-pin"
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 1234)"
                    maxLength={4}
                    required
                    autoFocus
                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                  />
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    Enter society 4-digit PIN to authenticate identity (Default: 1234)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Lock size={13} /> New Password
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      className="form-input"
                      id="reset-input-new-password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                      style={{ paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showResetPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Lock size={13} /> Confirm New Password
                    </span>
                  </label>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    className="form-input"
                    id="reset-input-confirm-password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  id="btn-reset-password-save"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <span>Set New Password & Return to Login</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="link-text-btn"
                    onClick={() => setResetStep(1)}
                    style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ← Check another mobile/email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
