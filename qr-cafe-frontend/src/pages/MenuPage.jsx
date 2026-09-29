import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchMenu } from '../api/api';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import CategorySection from '../components/CategorySection';
import styles from './MenuPage.module.css';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const { tableNumber, setTableNumber, totalCount, totalAmount } = useCart();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTablePicker, setShowTablePicker] = useState(false);

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMenu();
      setCategories(data);
      if (data.length > 0) {
        setActiveCategory(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Unable to load menu. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      const headerOffset = 130;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Filter categories and their items based on search query
  const filteredCategories = categories.map((cat) => {
    if (!searchQuery.trim()) return cat;
    const query = searchQuery.toLowerCase();
    const matchingItems = cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
    return { ...cat, items: matchingItems };
  }).filter((cat) => cat.items && cat.items.length > 0);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.mainContainer}>
        {/* Table Selector Banner if direct URL opened */}
        {!tableNumber ? (
          <div className={styles.tableNoticeBanner}>
            <div className={styles.tableNoticeContent}>
              <span className={styles.tableNoticeIcon}>🪑</span>
              <div>
                <strong>Direct URL Visit:</strong>
                <p>Please select your table number to place orders.</p>
              </div>
            </div>
            <div className={styles.tablePickerRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                <button
                  key={t}
                  className={styles.tablePickBtn}
                  onClick={() => setTableNumber(t.toString())}
                >
                  Table {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.tableActiveBar}>
            <span>Seated at <strong>Table #{tableNumber}</strong></span>
            <button
              className={styles.changeTableBtn}
              onClick={() => setTableNumber(null)}
              title="Change table"
            >
              Change
            </button>
          </div>
        )}

        {/* Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerHeading}>Authentic Asian Delights</h1>
            <p className={styles.bannerSub}>Fresh wok tossed Chinese delicacies & specials</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search noodles, momos, soups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        {!searchQuery && categories.length > 0 && (
          <nav className={styles.categoryNav}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`${styles.catPill} ${
                  activeCategory === cat.id ? styles.activeCatPill : ''
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        )}

        {/* Content list */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading tasty menu...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMsg}>{error}</p>
            <button className={styles.retryBtn} onClick={loadMenu}>
              Retry
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>🥢</span>
            <p>No dishes found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className={styles.menuList}>
            {filteredCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCount > 0 && (
        <div className={styles.floatingCartBar}>
          <div className={styles.cartBarContent}>
            <div className={styles.cartBarInfo}>
              <div className={styles.itemCountBadge}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </div>
              <div className={styles.cartTotal}>₹{totalAmount.toFixed(2)}</div>
            </div>

            <Link to="/cart" className={styles.viewCartBtn}>
              <span>View Cart</span>
              <span className={styles.cartArrow}>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
