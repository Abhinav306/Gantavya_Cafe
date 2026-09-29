import React from 'react';
import MenuItemCard from './MenuItemCard';
import styles from './CategorySection.module.css';

export default function CategorySection({ category }) {
  if (!category.items || category.items.length === 0) return null;

  return (
    <section className={styles.section} id={`category-${category.id}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{category.name}</h2>
        <span className={styles.badge}>{category.items.length} items</span>
      </div>
      <div className={styles.itemList}>
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
