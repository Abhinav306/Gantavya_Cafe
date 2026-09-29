import React from 'react';
import styles from './OrderCard.module.css';

export default function OrderCard({ order, onUpdateStatus }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PLACED':
        return styles.statusPlaced;
      case 'PREPARING':
        return styles.statusPreparing;
      case 'READY':
        return styles.statusReady;
      case 'COMPLETED':
        return styles.statusCompleted;
      default:
        return '';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`${styles.card} ${getStatusClass(order.status)}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.orderNumber}>{order.orderNumber}</span>
          <span className={styles.tableBadge}>Table {order.tableNumber}</span>
        </div>
        <div className={styles.metaGroup}>
          <span className={styles.time}>{formatTime(order.createdAt)}</span>
          <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className={styles.itemsList}>
        {order.items &&
          order.items.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
              <div className={styles.itemQuantity}>{item.quantity}x</div>
              <div className={styles.itemName}>{item.menuItemName}</div>
              <div className={styles.itemPrice}>₹{item.subtotal.toFixed(2)}</div>
            </div>
          ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalValue}>₹{order.totalAmount.toFixed(2)}</span>
        </div>

        <div className={styles.actions}>
          {order.status === 'PLACED' && (
            <button
              className={`${styles.actionBtn} ${styles.btnPreparing}`}
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            >
              🔥 Start Cooking
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              className={`${styles.actionBtn} ${styles.btnReady}`}
              onClick={() => onUpdateStatus(order.id, 'READY')}
            >
              ✅ Food Ready
            </button>
          )}

          {order.status === 'READY' && (
            <button
              className={`${styles.actionBtn} ${styles.btnCompleted}`}
              onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            >
              🎉 Mark Served
            </button>
          )}

          {order.status === 'COMPLETED' && (
            <span className={styles.completedTag}>Done & Served</span>
          )}
        </div>
      </div>
    </div>
  );
}
