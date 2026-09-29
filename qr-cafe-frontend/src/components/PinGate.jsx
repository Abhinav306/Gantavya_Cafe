import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verifyKitchenPin, verifyAdminPin } from '../api/api';
import styles from './PinGate.module.css';

export default function PinGate({ role = 'KITCHEN', title = 'Staff Section', children }) {
  const sessionKey = role === 'ADMIN' ? 'qr_cafe_admin_pin' : 'qr_cafe_kitchen_pin';
  const [authorized, setAuthorized] = useState(() => {
    return Boolean(sessionStorage.getItem(sessionKey));
  });

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already unlocked, admin unlocks kitchen too
    if (role === 'KITCHEN' && sessionStorage.getItem('qr_cafe_admin_pin')) {
      setAuthorized(true);
    }
  }, [role]);

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your 4-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let result;
      if (role === 'ADMIN') {
        result = await verifyAdminPin(pin);
      } else {
        result = await verifyKitchenPin(pin);
      }

      if (result && result.valid) {
        sessionStorage.setItem(sessionKey, pin);
        setAuthorized(true);
      } else {
        setError('Incorrect PIN. Access denied.');
        setPin('');
      }
    } catch (err) {
      console.error('PIN verification failed:', err);
      // Fallback offline validation against defaults if network glitch
      const isDefaultKitchen = role === 'KITCHEN' && (pin === '2244' || pin === '9988');
      const isDefaultAdmin = role === 'ADMIN' && pin === '9988';
      if (isDefaultKitchen || isDefaultAdmin) {
        sessionStorage.setItem(sessionKey, pin);
        setAuthorized(true);
      } else {
        setError('Incorrect PIN or server error.');
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(sessionKey);
    if (role === 'ADMIN') {
      sessionStorage.removeItem('qr_cafe_kitchen_pin');
    }
    setAuthorized(false);
    setPin('');
  };

  if (authorized) {
    return (
      <div className={styles.authorizedWrapper}>
        <div className={styles.staffControlStrip}>
          <div className={styles.staffInfo}>
            <span className={styles.lockStatusIcon}>🔓</span>
            <span className={styles.staffRoleText}>
              Authenticated as <strong>{role === 'ADMIN' ? 'Cafe Owner (Admin)' : 'Kitchen Staff'}</strong>
            </span>
          </div>

          <div className={styles.staffActions}>
            <Link to="/menu" className={styles.switchLink}>
              📱 View Customer Menu
            </Link>
            <button className={styles.lockBtn} onClick={handleLogout} title="Lock session">
              🔒 Lock & Exit
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.lockScreen}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <span className={styles.lockIcon}>🔐</span>
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>Protected staff area. Enter PIN to continue.</p>

        {/* PIN Display Dots */}
        <div className={styles.pinDisplay}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`${styles.pinDot} ${pin.length > idx ? styles.dotFilled : ''}`}
            />
          ))}
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* Keypad */}
        <div className={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className={styles.keyBtn}
              onClick={() => handleKeyPress(num.toString())}
              disabled={loading}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.keyBtn} ${styles.funcBtn}`}
            onClick={handleClear}
            disabled={loading}
          >
            C
          </button>
          <button
            type="button"
            className={styles.keyBtn}
            onClick={() => handleKeyPress('0')}
            disabled={loading}
          >
            0
          </button>
          <button
            type="button"
            className={`${styles.keyBtn} ${styles.funcBtn}`}
            onClick={handleBackspace}
            disabled={loading}
          >
            ⌫
          </button>
        </div>

        {/* Action Button */}
        <button
          className={styles.unlockBtn}
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
        >
          {loading ? 'Verifying...' : 'Unlock Section'}
        </button>

        {/* Helper Note for Owner */}
        <div className={styles.pinHintBox}>
          <span>💡 Default PIN: <strong>{role === 'ADMIN' ? '9988' : '2244'}</strong></span>
        </div>

        <div className={styles.footerLink}>
          <Link to="/menu" className={styles.backLink}>
            ← Back to Customer Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
