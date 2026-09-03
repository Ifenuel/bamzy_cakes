-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- Defense-in-depth: even though our Express
-- backend handles auth, Supabase's PostgREST
-- exposes tables via REST API without RLS.
-- ============================================

-- Enable RLS on all public tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: Deny all PostgREST access
-- Targets Supabase's anon and authenticated
-- roles specifically. Our Express backend
-- connects via DATABASE_URL with full perms,
-- so RLS does not affect it.
-- ============================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users','products','product_categories','product_images',
    'orders','order_items','event_bookings','trainings',
    'training_registrations','payments','customer_addresses',
    'contact_messages','business_settings','reviews',
    'newsletter_subscribers','analytics_events',
    'email_verifications','password_resets','delivery_zones','migrations'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop old policy if exists
    EXECUTE format('DROP POLICY IF EXISTS "Deny all PostgREST access on %s" ON public.%I', t, t);
    
    -- Create deny policy for Supabase API roles
    EXECUTE format(
      'CREATE POLICY "Deny all PostgREST access on %s" ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      t, t
    );
    
    -- Revoke permissions from Supabase API roles
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', t);
    
    RAISE NOTICE 'Secured: %', t;
  END LOOP;
END $$;

-- ============================================
-- IMPORTANT: Our Express backend connects
-- directly to PostgreSQL via DATABASE_URL
-- with full permissions. RLS only affects
-- Supabase's PostgREST/Data API layer.
-- Our app will continue working perfectly.
-- ============================================
