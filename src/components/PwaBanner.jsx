import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export default function PwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Guide for iOS Safari or Chrome
      alert('To install on your phone:\n\n👉 On iPhone: Tap the Share button below, then tap "Add to Home Screen".\n👉 On Android: Tap Chrome 3 dots menu -> "Install App" or "Add to Home Screen".');
    }
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="pwa-banner" id="pwa-install-banner">
      <div className="pwa-text">
        <Smartphone size={18} color="#D97706" />
        <span>Install Society App on your phone home screen</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button 
          id="btn-pwa-install"
          className="pwa-install-btn" 
          onClick={handleInstallClick}
        >
          <Download size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
          Install
        </button>
        <button 
          onClick={() => setShowBanner(false)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', padding: '4px' }}
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
