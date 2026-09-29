import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderByNumber } from '../api/api';
import { useWebSocket } from '../hooks/useWebSocket';
import Header from '../components/Header';
import styles from './OrderConfirmPage.module.css';

export default function OrderConfirmPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderByNumber(orderNumber);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Could not locate this order. Please verify order number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  // Real-time update from WebSocket if kitchen advances status
  useWebSocket((updatedOrder) => {
    if (updatedOrder && updatedOrder.orderNumber === orderNumber) {
      setOrder(updatedOrder);
    }
  });

  // Calculate step progress for stepper
  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 1;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.container}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Fetching your order status...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <Link to="/menu" className={styles.homeBtn}>
              Back to Menu
            </Link>
          </div>
        ) : (
          <div className={styles.confirmationCard}>
            {/* Header / Celebration */}
            <div className={styles.header}>
              <div className={styles.successIcon}>🎉</div>
              <h1 className={styles.title}>Order Received!</h1>
              <p className={styles.subtitle}>The chef has received your order in the kitchen.</p>

              <div className={styles.numberBox}>
                <span className={styles.numberLabel}>Order Number</span>
                <span className={styles.numberValue}>{order.orderNumber}</span>
                <span className={styles.tableBadge}>Table #{order.tableNumber}</span>
              </div>
            </div>

            {/* Live Progress Stepper */}
            <div className={styles.stepperWrapper}>
              <div className={styles.stepperHeader}>
                <span className={styles.stepperTitle}>Live Order Status</span>
                <span className={`${styles.statusPill} ${styles['status_' + order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.stepper}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
                  <div className={styles.stepCircle}>1</div>
                  <span className={styles.stepLabel}>Placed</span>
                </div>
                <div className={`${styles.stepLine} ${currentStep >= 2 ? styles.lineActive : ''}`} />
                <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
                  <div className={styles.stepCircle}>2</div>
                  <span className={styles.stepLabel}>Cooking</span>
                </div>
                <div className={`${styles.stepLine} ${currentStep >= 3 ? styles.lineActive : ''}`} />
                <div className={`${styles.step} ${currentStep >= 3 ? styles.stepActive : ''}`}>
                  <div className={styles.stepCircle}>3</div>
                  <span className={styles.stepLabel}>Ready</span>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Ordered Items</h3>
              <div className={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemQuantity}>{item.quantity}x</div>
                    <div className={styles.itemName}>{item.menuItemName}</div>
                    <div className={styles.itemTotal}>₹{item.subtotal.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.totalRow}>
                <span>Total Payable:</span>
                <span className={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment instruction notice */}
            <div className={styles.payNotice}>
              <span className={styles.payIcon}>💵</span>
              <div>
                <strong>Payment at Counter:</strong>
                <p>Please pay ₹{order.totalAmount.toFixed(2)} at the receptionist counter once your meal is completed.</p>
              </div>
            </div>

            {/* Return action */}
            <div className={styles.actions}>
              <Link to={`/menu?table=${order.tableNumber}`} className={styles.orderMoreBtn}>
                🍜 Order More Dishes
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
