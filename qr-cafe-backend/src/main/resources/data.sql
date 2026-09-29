-- Categories
INSERT INTO category (id, name, display_order) VALUES (1, 'Starters', 1);
INSERT INTO category (id, name, display_order) VALUES (2, 'Soups', 2);
INSERT INTO category (id, name, display_order) VALUES (3, 'Noodles', 3);
INSERT INTO category (id, name, display_order) VALUES (4, 'Rice', 4);
INSERT INTO category (id, name, display_order) VALUES (5, 'Main Course', 5);
INSERT INTO category (id, name, display_order) VALUES (6, 'Beverages', 6);

-- Starters
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Veg Spring Roll', 'Crispy rolls with mixed vegetables', 120.00, true, 1, '/images/spring-roll.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chicken Momos', 'Steamed dumplings with spicy chutney', 150.00, true, 1, '/images/momos.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Paneer Chilli', 'Spicy cottage cheese with peppers', 180.00, true, 1, '/images/paneer-chilli.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chicken 65', 'Deep fried spicy chicken with curry leaves', 200.00, true, 1, '/images/chicken-65.jpg');

-- Soups
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Veg Manchow Soup', 'Spicy soup with crispy noodles', 100.00, true, 2, '/images/manchow-soup.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Hot & Sour Soup', 'Classic tangy and spicy broth', 110.00, true, 2, '/images/hot-sour-soup.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Sweet Corn Chicken Soup', 'Creamy chicken soup with sweet corn', 120.00, true, 2, '/images/sweet-corn-soup.jpg');

-- Noodles
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Veg Hakka Noodles', 'Stir-fried noodles with crunchy vegetables', 160.00, true, 3, '/images/hakka-noodles.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chicken Chow Mein', 'Classic wok tossed chicken chow mein', 190.00, true, 3, '/images/chow-mein.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Schezwan Noodles', 'Spicy wok tossed schezwan style noodles', 170.00, true, 3, '/images/schezwan-noodles.jpg');

-- Rice
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Veg Fried Rice', 'Wok-tossed fragrant rice with vegetables', 150.00, true, 4, '/images/veg-fried-rice.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chicken Fried Rice', 'Fragrant fried rice with juicy chicken chunks', 180.00, true, 4, '/images/chicken-fried-rice.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Schezwan Fried Rice', 'Spicy wok tossed schezwan rice', 170.00, true, 4, '/images/schezwan-rice.jpg');

-- Main Course
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Veg Manchurian', 'Golden fried veg balls in rich manchurian sauce', 170.00, true, 5, '/images/veg-manchurian.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chicken Manchurian', 'Tender chicken pieces in manchurian gravy', 210.00, true, 5, '/images/chicken-manchurian.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Chilli Chicken', 'Dry spicy wok fried chicken with onions & capsicum', 220.00, true, 5, '/images/chilli-chicken.jpg');

-- Beverages
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Fresh Lime Soda', 'Refreshing lime soda sweet and salted', 60.00, true, 6, '/images/fresh-lime-soda.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Cold Coffee', 'Chilled blended coffee with cream', 90.00, true, 6, '/images/cold-coffee.jpg');
INSERT INTO menu_item (name, description, price, available, category_id, image_url)
VALUES ('Mango Lassi', 'Rich thick yogurt drink with mango pulp', 80.00, true, 6, '/images/mango-lassi.jpg');
