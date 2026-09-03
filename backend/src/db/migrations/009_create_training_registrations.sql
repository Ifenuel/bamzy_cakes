-- 009: Training registrations
CREATE TABLE training_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID NOT NULL REFERENCES trainings(id),
  customer_id UUID REFERENCES users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  number_of_students INT NOT NULL DEFAULT 1 CHECK (number_of_students > 0),
  amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed', 'refunded')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_reg_training ON training_registrations(training_id);
CREATE INDEX idx_training_reg_customer ON training_registrations(customer_id);
