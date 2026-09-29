import React, { useState, useEffect } from 'react';
import { fetchMenu, fetchCategories, createMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } from '../api/api';
import Header from '../components/Header';
import PinGate from '../components/PinGate';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('MENU'); // 'MENU' or 'QR'
  const [categories, setCategories] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableCount, setTableCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState(() => window.location.origin);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    available: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, catsData] = await Promise.all([
        fetchMenu(),
        fetchCategories(),
      ]);
      setCategories(menuData);
      setCategoryList(catsData);
      if (catsData.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: catsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: categoryList.length > 0 ? categoryList[0].id : '',
      available: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item, catId) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || '',
      categoryId: catId || (categoryList.length > 0 ? categoryList[0].id : ''),
      available: item.available,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleToggleStock = async (item) => {
    try {
      const updated = await toggleItemAvailability(item.id);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((i) => (i.id === item.id ? { ...i, available: updated.available } : i)),
        }))
      );
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
      alert('Could not update item stock status.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteMenuItem(id);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.filter((i) => i.id !== id),
        }))
      );
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter a dish name.');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price in ₹.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a category.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        imageUrl: formData.imageUrl.trim() || null,
        categoryId: Number(formData.categoryId),
        available: formData.available,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setFormError('Failed to save. Please verify server connection.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintQr = () => {
    window.print();
  };

  return (
    <PinGate role="ADMIN" title="Admin & Menu Control Panel">
      <div className={styles.page}>
        <Header />

      <main className={styles.container}>
        {/* Admin Navigation */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Cafe Admin Management</h1>
            <p className={styles.subtitle}>Manage menu items, toggle sold out dishes, and generate table QR codes</p>
          </div>

          <div className={styles.tabNav}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'MENU' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('MENU')}
            >
              📋 Menu & Stock
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'QR' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('QR')}
            >
              📱 Table QR Codes
            </button>
          </div>
        </div>

        {/* TAB 1: MENU & STOCK MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div className={styles.menuTab}>
            <div className={styles.actionsBar}>
              <button className={styles.addBtn} onClick={handleOpenAdd}>
                ➕ Add New Dish
              </button>
              <button className={styles.refreshBtn} onClick={loadData}>
                🔄 Refresh Menu
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading menu items...</p>
              </div>
            ) : (
              <div className={styles.categoryGroups}>
                {categories.map((cat) => (
                  <div key={cat.id} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <h2>{cat.name}</h2>
                      <span className={styles.itemCountBadge}>{cat.items.length} items</span>
                    </div>

                    <div className={styles.itemsTable}>
                      {cat.items.map((item) => (
                        <div key={item.id} className={`${styles.itemRow} ${!item.available ? styles.soldOutRow : ''}`}>
                          <div className={styles.itemMain}>
                            <div className={styles.itemTitleRow}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemPrice}>₹{item.price.toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className={styles.itemDesc}>{item.description}</p>
                            )}
                          </div>

                          <div className={styles.itemActions}>
                            {/* Stock Toggle Switch */}
                            <button
                              className={`${styles.stockToggle} ${item.available ? styles.inStock : styles.outOfStock}`}
                              onClick={() => handleToggleStock(item)}
                              title={item.available ? 'Click to mark Sold Out' : 'Click to mark In Stock'}
                            >
                              {item.available ? '✅ In Stock' : '🚫 Sold Out'}
                            </button>

                            {/* Edit Button */}
                            <button
                              className={styles.editBtn}
                              onClick={() => handleOpenEdit(item, cat.id)}
                              title="Edit item details"
                            >
                              ✏️ Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(item.id, item.name)}
                              title="Delete item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE QR CODE GENERATOR */}
        {activeTab === 'QR' && (
          <div className={styles.qrTab}>
            <div className={styles.qrControlCard}>
              <h2>Printable Table QR Codes</h2>
              <p>Generate QR cards for your tables. Print and place them on each cafe table.</p>

              <div className={styles.qrInputs}>
                <div className={styles.inputGroup}>
                  <label>Total Tables in Cafe:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCount}
                    onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className={styles.numberInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Base URL:</label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className={styles.urlInput}
                    placeholder="https://your-cafe.vercel.app"
                  />
                </div>

                <button className={styles.printBtn} onClick={handlePrintQr}>
                  🖨️ Print All {tableCount} Table Cards
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className={styles.printableGrid}>
              {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNum) => {
                const targetUrl = `${baseUrl}/menu?table=${tableNum}`;
                const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(targetUrl)}`;

                return (
                  <div key={tableNum} className={styles.tableCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cafeLogo}>🥢</span>
                      <h3 className={styles.cafeName}>Golden Wok Cafe</h3>
                      <p className={styles.cafeTagline}>Scan & Order Food</p>
                    </div>

                    <div className={styles.qrFrame}>
                      <img
                        src={qrImgSrc}
                        alt={`QR code for Table ${tableNum}`}
                        className={styles.qrImage}
                        loading="lazy"
                      />
                    </div>

                    <div className={styles.tableTag}>
                      <span>TABLE</span>
                      <span className={styles.largeTableNum}>{tableNum}</span>
                    </div>

                    <div className={styles.instructions}>
                      <p>1. Open Camera / Google Lens</p>
                      <p>2. Scan QR to view Menu</p>
                      <p>3. Select dishes & Order</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.urlSnippet}>{targetUrl}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT DISH */}
        {modalOpen && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingItem ? 'Edit Dish' : 'Add New Dish'}</h2>
                <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveItem} className={styles.modalForm}>
                {formError && <div className={styles.errorAlert}>{formError}</div>}

                <div className={styles.formField}>
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schezwan Crispy Chicken"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label>Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      {categoryList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      placeholder="180"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label>Description</label>
                  <textarea
                    rows="2"
                    placeholder="Brief ingredients or flavor profile"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label>Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="/images/spring-roll.jpg or web URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                <div className={styles.formCheckbox}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <span>Available / In Stock</span>
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={saving}>
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Dish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
    </PinGate>
  );
}
