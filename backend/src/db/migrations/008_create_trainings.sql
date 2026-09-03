-- 008: Trainings
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  capacity INT NOT NULL DEFAULT 0,
  available_spaces INT NOT NULL DEFAULT 0,
  what_you_will_learn JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainings_slug ON trainings(slug);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_trainings_date ON trainings(date);
