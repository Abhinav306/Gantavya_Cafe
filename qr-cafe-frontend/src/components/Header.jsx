import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { tableNumber, totalCount } = useCart();
  const location = useLocation();
  const isKitchen = location.pathname.startsWith('/kitchen');
  const isAdmin = location.pathname.startsWith('/admin');
  const isStaffArea = isKitchen || isAdmin;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={tableNumber ? `/menu?table=${tableNumber}` : '/menu'} className={styles.brand}>
          <span className={styles.logoIcon}>🥢</span>
          <div className={styles.brandText}>
            <span className={styles.title}>Golden Wok</span>
            <span className={styles.subtitle}>Asian Kitchen & Cafe</span>
          </div>
        </Link>

        {/* Staff Area Navigation: ONLY shown when in /kitchen or /admin */}
        {isStaffArea && (
          <nav className={styles.navLinks}>
            <Link
              to="/kitchen"
              className={`${styles.navItem} ${isKitchen ? styles.activeNav : ''}`}
            >
              👨‍🍳 Kitchen
            </Link>
            <Link
              to="/admin"
              className={`${styles.navItem} ${isAdmin ? styles.activeNav : ''}`}
            >
              ⚙️ Admin
            </Link>
          </nav>
        )}

        <div className={styles.actions}>
          {tableNumber && !isStaffArea && (
            <div className={styles.tableBadge}>
              <span className={styles.tableLabel}>Table</span>
              <span className={styles.tableNumber}>{tableNumber}</span>
            </div>
          )}

          {!isStaffArea && (
            <Link to="/cart" className={styles.cartBtn} aria-label="View Cart">
              <span className={styles.cartIcon}>🛒</span>
              {totalCount > 0 && <span className={styles.cartBadge}>{totalCount}</span>}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
