import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './MenuItemCard.module.css';

export default function MenuItemCard({ item }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const [imgError, setImgError] = useState(false);

  // Check veg / non-veg by name keyword
  const isNonVeg = /chicken|mutton|prawn|fish|egg|meat/i.test(item.name);

  // Placeholder generator for food if image missing or error
  const placeholderUrl = `https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className={`${styles.card} ${!item.available ? styles.disabled : ''}`}>
      <div className={styles.imageContainer}>
        <img
          src={!imgError && item.imageUrl ? item.imageUrl : placeholderUrl}
          alt={item.name}
          className={styles.image}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className={`${styles.typeBadge} ${isNonVeg ? styles.nonVeg : styles.veg}`}>
          <span className={styles.dot} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{item.name}</h3>
          <span className={styles.price}>₹{item.price.toFixed(2)}</span>
        </div>

        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}

        <div className={styles.footer}>
          {!item.available ? (
            <span className={styles.soldOut}>Sold Out</span>
          ) : quantity === 0 ? (
            <button
              className={styles.addBtn}
              onClick={() => addToCart(item)}
              aria-label={`Add ${item.name} to cart`}
            >
              <span className={styles.plusIcon}>+</span> ADD
            </button>
          ) : (
            <div className={styles.counter}>
              <button
                className={styles.counterBtn}
                onClick={() => updateQuantity(item.id, quantity - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className={styles.counterQty}>{quantity}</span>
              <button
                className={styles.counterBtn}
                onClick={() => updateQuantity(item.id, quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
