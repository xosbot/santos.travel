-- Sample seed data for development
BEGIN;

INSERT INTO vendors (id, name, type, contact_name, contact_phone, commission_pct) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Grand Hyatt Kochi', 'hotel', 'Rajesh Kumar', '+91-9847000001', 10.00),
  ('a0000000-0000-0000-0000-000000000002', 'Thekkady Jungle Resort', 'hotel', 'Anil George', '+91-9847000002', 12.00),
  ('a0000000-0000-0000-0000-000000000003', 'Kerala Luxury Cruises', 'activity', 'Sara Nair', '+91-9847000003', 15.00),
  ('a0000000-0000-0000-0000-000000000004', 'Cochin Executive Cabs', 'transport', 'Faisal Khan', '+91-9847000004', 8.00),
  ('a0000000-0000-0000-0000-000000000005', 'Spice Garden Tours', 'guide', 'Mohan Das', '+91-9847000005', 10.00);

INSERT INTO vendor_products (id, vendor_id, name, category, description, base_price, pricing_unit, valid_from, valid_until) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Deluxe Room - Grand Hyatt', 'accommodation', '5-star deluxe room with breakfast', 8500.00, 'per_room', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Suite - Grand Hyatt', 'accommodation', 'Executive suite with harbor view', 15000.00, 'per_room', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Standard Room - Thekkady Jungle', 'accommodation', 'Jungle-view cottage with meals', 4500.00, 'per_room', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Backwater Sunset Cruise', 'activity', '2-hour houseboat cruise with dinner', 2500.00, 'per_person', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Airport Transfer - Sedan', 'transfer', 'Kochi airport to city hotel', 1200.00, 'per_vehicle', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Full Day Rental - SUV', 'transfer', '8-hour SUV with driver, up to 6 pax', 3500.00, 'per_vehicle', '2025-01-01', '2026-12-31'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'Half-Day Guided Tour - Fort Kochi', 'guide', 'English-speaking guide, 4 hours', 2000.00, 'per_person', '2025-01-01', '2026-12-31');

COMMIT;
