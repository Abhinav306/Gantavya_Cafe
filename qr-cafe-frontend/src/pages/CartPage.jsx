import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/api';
import Header from '../components/Header';
import CartItem from '../components/CartItem';
import styles from './CartPage.module.css';

export default function CartPage() {
  const {
    cartItems,
    tableNumber,
    setTableNumber,
    totalAmount,
    totalCount,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customTable, setCustomTable] = useState(tableNumber || '');

  const handlePlaceOrder = async () => {
    setError('');

    const finalTable = Number(customTable || tableNumber);
    if (!finalTable || finalTable <= 0) {
      setError('Please specify a valid Table Number to place your order.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    try {
      setSubmitting(true);
      setTableNumber(finalTable);

      const payload = {
        tableNumber: finalTable,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const result = await createOrder(payload);
      clearCart();
      navigate(`/order-confirm/${result.orderNumber}`);
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(
        err.response?.data?.message ||
          'Failed to place your order. Please check the network or ask staff.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.container}>
        <div className={styles.topBar}>
          <Link to={tableNumber ? `/menu?table=${tableNumber}` : '/menu'} className={styles.backLink}>
            ← Back to Menu
          </Link>
          <h1 className={styles.heading}>Your Order Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <span className={styles.emptyIcon}>🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any Chinese delicacies yet.</p>
            <Link to={tableNumber ? `/menu?table=${tableNumber}` : '/menu'} className={styles.browseBtn}>
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className={styles.cartContent}>
            {/* Table Number Card */}
            <div className={styles.tableCard}>
              <div className={styles.tableCardHeader}>
                <span className={styles.tableCardIcon}>🪑</span>
                <div>
                  <h3 className={styles.tableCardTitle}>Table Assignment</h3>
                  <p className={styles.tableCardSub}>Food will be served to this table</p>
                </div>
              </div>

              <div className={styles.tableInputRow}>
                <label htmlFor="table-num" className={styles.tableInputLabel}>Table #</label>
                <input
                  id="table-num"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="e.g. 5"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                  className={styles.tableInput}
                />
              </div>
            </div>

            {/* Items List */}
            <div className={styles.itemsSection}>
              <h2 className={styles.sectionTitle}>Selected Items ({totalCount})</h2>
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className={styles.billCard}>
              <h2 className={styles.billTitle}>Bill Details</h2>
              <div className={styles.billRow}>
                <span>Item Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className={styles.billRow}>
                <span>Taxes & Restaurant Charges</span>
                <span className={styles.freeTag}>Included</span>
              </div>
              <div className={styles.divider}></div>
              <div className={`${styles.billRow} ${styles.grandTotal}`}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className={styles.paymentNotice}>
                <span>ℹ️</span>
                <p>No payment is required right now. Please pay <strong>₹{totalAmount.toFixed(2)}</strong> at the reception or counter after your meal.</p>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* Submit Button */}
            <div className={styles.submitContainer}>
              <button
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span className={styles.btnAmount}>• ₹{totalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
