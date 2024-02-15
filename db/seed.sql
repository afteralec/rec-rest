BEGIN;

DELETE FROM endorsements;
DELETE FROM restaurants;
DELETE FROM restaurant_configs;
DELETE FROM restaurants_reservation_windows;
DELETE FROM restaurants_endorsements;
DELETE FROM tables;
DELETE FROM diners;
DELETE FROM diners_endorsements;
DELETE FROM diners_reservations;

INSERT INTO endorsements (id, tag) VALUES (1, "Gluten Free Options");
INSERT INTO endorsements (id, tag) VALUES (2, "Vegetarian-Friendly");
INSERT INTO endorsements (id, tag) VALUES (3, "Vegan-Friendly");
INSERT INTO endorsements (id, tag) VALUES (4, "Paleo-Friendly");

-- Create Lardo
INSERT INTO restaurants (id, name) VALUES (1, "Lardo");
INSERT INTO restaurant_configs (restaurant_id) VALUES (1);
INSERT INTO restaurants_endorsements (restaurant_id, endorsement_id) VALUES (1, 1);
-- Four two-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 2, 1);
-- Two four-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 4, 1);
-- One six-top
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (1, 6, 3);

-- Create Panaderia Rosetta
INSERT INTO restaurants (id, name) VALUES (2, "Panaderia Rosetta");
INSERT INTO restaurant_configs (restaurant_id) VALUES (2);
INSERT INTO restaurants_endorsements (restaurant_id, endorsement_id) VALUES (2, 2);
INSERT INTO restaurants_endorsements (restaurant_id, endorsement_id) VALUES (2, 1);
-- Three two-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 2, 1);
-- Two four-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (2, 4, 1);

-- No six-tops

-- Create Tetetlán
INSERT INTO restaurants (id, name) VALUES (3, "Tetetlán");
INSERT INTO restaurant_configs (restaurant_id) VALUES (3);
INSERT INTO restaurants_endorsements (restaurant_id, endorsement_id) VALUES (3, 4);
INSERT INTO restaurants_endorsements (restaurant_id, endorsement_id) VALUES (3, 1);
-- Four two-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 2, 1);
-- Two four-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 4, 1);
-- One six-top
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (3, 6, 3);

-- Create Falling Piano Brewing Company
INSERT INTO restaurants (id, name) VALUES (4, "Falling Piano Brewing Company");
INSERT INTO restaurant_configs (restaurant_id) VALUES (4);
-- Five two-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 2, 1);
-- Five four-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 4, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 4, 1);
-- Five six-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 6, 3);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 6, 3);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 6, 3);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 6, 3);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (4, 6, 3);

-- Create u.to.pi.a
INSERT INTO restaurants (id, name) VALUES (5, "u.to.pi.a");
INSERT INTO restaurant_configs (restaurant_id) VALUES (5);
INSERT INTO restaurants_endorsements (id, restaurant_id, endorsement_id) VALUES (6, 5, 2);
INSERT INTO restaurants_endorsements (id, restaurant_id, endorsement_id) VALUES (7, 5, 3);
-- Two two-tops
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (5, 2, 1);
INSERT INTO tables (restaurant_id, capacity, minimum) VALUES (5, 2, 1);
-- No four-tops
-- No six-tops

-- Fill with default reservation windows
INSERT INTO restaurants_reservation_windows (restaurant_id, start_hour, end_hour) VALUES (1, 16, 21);
INSERT INTO restaurants_reservation_windows (restaurant_id, start_hour, end_hour) VALUES (2, 16, 21);
INSERT INTO restaurants_reservation_windows (restaurant_id, start_hour, end_hour) VALUES (3, 16, 21);
INSERT INTO restaurants_reservation_windows (restaurant_id, start_hour, end_hour) VALUES (4, 16, 21);
INSERT INTO restaurants_reservation_windows (restaurant_id, start_hour, end_hour) VALUES (5, 16, 21);

-- Create Michael
INSERT INTO diners (id, name) VALUES (1, "Michael");
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (1, 2);

-- Create George Michael
INSERT INTO diners (id, name) VALUES (2, "George Michael");
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (2, 2);
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (2, 1);

-- Create Lucile
INSERT INTO diners (id, name) VALUES (3, "Lucile");
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (3, 1);

-- Create Gob
INSERT INTO diners (id, name) VALUES (4, "Gob");
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (4, 4);

-- Create Tobias
INSERT INTO diners (id, name) VALUES (5, "Tobias");

-- Create Maeby
INSERT INTO diners (id, name) VALUES (6, "Maeby");
INSERT INTO diners_endorsements (diner_id, endorsement_id) VALUES (6, 3);

COMMIT;
