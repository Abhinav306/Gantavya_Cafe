import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <h4 className={styles.name}>{item.name}</h4>
        <div className={styles.meta}>
          <span className={styles.unitPrice}>₹{item.price.toFixed(2)} each</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.counter}>
          <button
            className={styles.counterBtn}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={styles.quantity}>{item.quantity}</span>
          <button
            className={styles.counterBtn}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div className={styles.subtotal}>
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>

        <button
          className={styles.removeBtn}
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
