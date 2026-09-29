import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchOrders, updateOrderStatus } from '../api/api';
import { useWebSocket } from '../hooks/useWebSocket';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import PinGate from '../components/PinGate';
import styles from './KitchenDashboard.module.css';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ACTIVE'); // ACTIVE, PLACED, PREPARING, READY, COMPLETED, ALL
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [notificationGranted, setNotificationGranted] = useState(false);

  const soundEnabledRef = useRef(soundEnabled);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Request desktop notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') setNotificationGranted(true);
        });
      }
    }
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Unlock AudioContext on user gesture
  const unlockAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setAudioUnlocked(true);
      playChime();
    } catch (e) {
      console.warn('Audio unlock error:', e);
    }
  }, []);

  // Multi-tone chime for loud, clear restaurant kitchen alert
  const playChime = useCallback(() => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Tone 1 (D5 - 587.33Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2 (A5 - 880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.15);
      gain2.gain.setValueAtTime(0.45, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);

      // Tone 3 (D6 - 1174.66Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1174.66, now + 0.3);
      gain3.gain.setValueAtTime(0.5, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.85);
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders for kitchen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time updates via WebSocket
  useWebSocket((updatedOrder) => {
    if (!updatedOrder) return;

    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updatedOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      } else {
        // Brand new order!
        playChime();

        // Browser desktop notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 New Order #${updatedOrder.orderNumber}!`, {
            body: `Table ${updatedOrder.tableNumber} • ₹${updatedOrder.totalAmount} • ${updatedOrder.items?.length || 0} items`,
            icon: '/icons/icon.svg',
          });
        }

        return [updatedOrder, ...prev];
      }
    });
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const placedCount = orders.filter((o) => o.status === 'PLACED').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ACTIVE') return order.status === 'PLACED' || order.status === 'PREPARING';
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  return (
    <PinGate role="KITCHEN" title="Kitchen & Reception Dashboard">
      <div className={styles.page}>
        <Header />

      {/* Audio Unlock Banner */}
      {!audioUnlocked && (
        <div className={styles.audioBanner} onClick={unlockAudio}>
          <span>🔔 <strong>Tap here to enable Kitchen Audio Chime</strong> (required by browser for loud order sound)</span>
          <button className={styles.unlockBtn}>Enable Sound</button>
        </div>
      )}

      <main className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.topControl}>
          <div>
            <h1 className={styles.title}>Kitchen & Reception Board</h1>
            <p className={styles.subtitle}>Real-time incoming orders & status controller</p>
          </div>

          <div className={styles.controlActions}>
            {installPrompt && (
              <button className={styles.installBtn} onClick={handleInstallApp}>
                📲 Install App
              </button>
            )}

            <button
              className={styles.testSoundBtn}
              onClick={() => {
                unlockAudio();
                playChime();
              }}
              title="Test the order alert bell"
            >
              🔊 Test Sound
            </button>

            <button
              className={`${styles.soundBtn} ${soundEnabled ? styles.soundActive : ''}`}
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) unlockAudio();
              }}
            >
              {soundEnabled ? '🔔 Alert: ON' : '🔕 Alert: OFF'}
            </button>

            <button className={styles.refreshBtn} onClick={loadOrders} title="Refresh orders">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className={styles.metricsGrid}>
          <div
            className={`${styles.metricCard} ${filter === 'PLACED' ? styles.metricActive : ''}`}
            onClick={() => setFilter('PLACED')}
          >
            <span className={styles.metricLabel}>New Orders</span>
            <span className={`${styles.metricValue} ${styles.valPlaced}`}>{placedCount}</span>
            <span className={styles.metricIcon}>🔔</span>
          </div>

          <div
            className={`${styles.metricCard} ${filter === 'PREPARING' ? styles.metricActive : ''}`}
            onClick={() => setFilter('PREPARING')}
          >
            <span className={styles.metricLabel}>In Wok</span>
            <span className={`${styles.metricValue} ${styles.valPreparing}`}>{preparingCount}</span>
            <span className={styles.metricIcon}>🍳</span>
          </div>

          <div
            className={`${styles.metricCard} ${filter === 'READY' ? styles.metricActive : ''}`}
            onClick={() => setFilter('READY')}
          >
            <span className={styles.metricLabel}>Ready to Serve</span>
            <span className={`${styles.metricValue} ${styles.valReady}`}>{readyCount}</span>
            <span className={styles.metricIcon}>🥡</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Today's Value</span>
            <span className={`${styles.metricValue} ${styles.valRevenue}`}>₹{totalRevenue.toFixed(0)}</span>
            <span className={styles.metricIcon}>💰</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className={styles.tabsWrapper}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${filter === 'ACTIVE' ? styles.tabActive : ''}`}
              onClick={() => setFilter('ACTIVE')}
            >
              Active ({placedCount + preparingCount})
            </button>
            <button
              className={`${styles.tabBtn} ${filter === 'PLACED' ? styles.tabActive : ''}`}
              onClick={() => setFilter('PLACED')}
            >
              New Placed ({placedCount})
            </button>
            <button
              className={`${styles.tabBtn} ${filter === 'PREPARING' ? styles.tabActive : ''}`}
              onClick={() => setFilter('PREPARING')}
            >
              Cooking ({preparingCount})
            </button>
            <button
              className={`${styles.tabBtn} ${filter === 'READY' ? styles.tabActive : ''}`}
              onClick={() => setFilter('READY')}
            >
              Ready ({readyCount})
            </button>
            <button
              className={`${styles.tabBtn} ${filter === 'COMPLETED' ? styles.tabActive : ''}`}
              onClick={() => setFilter('COMPLETED')}
            >
              Completed ({completedCount})
            </button>
            <button
              className={`${styles.tabBtn} ${filter === 'ALL' ? styles.tabActive : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({orders.length})
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {loading && orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.spinner}></div>
            <p>Syncing kitchen board...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🥢</span>
            <h3>No orders in this category</h3>
            <p>New orders will appear here automatically with loud real-time sound.</p>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
    </PinGate>
  );
}
