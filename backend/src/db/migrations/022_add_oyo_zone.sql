-- 022_add_oyo_zone.sql
-- Oyo state previously had no zone of its own: the resolver always fell back
-- to the "Within Ibadan" zone, so a fee configured for Oyo could never apply.
-- This seeds a dedicated Oyo zone (a DEFAULT — edit its fee in Admin →
-- Delivery Zones like any other zone). Existing Ibadan zone is untouched:
-- customers with city "Ibadan" still match the Ibadan zone first.

INSERT INTO delivery_zones (zone_name, zone_slug, delivery_fee, estimated_hours_min, estimated_hours_max)
VALUES ('Oyo State (outside Ibadan)', 'oyo', 3500, 24, 48)
ON CONFLICT (zone_slug) DO NOTHING;
