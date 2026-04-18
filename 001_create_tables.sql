-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Classes RLS Policies
CREATE POLICY "Users can view their own classes" ON classes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON classes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON classes
  FOR DELETE USING (auth.uid() = user_id);

-- Assignments RLS Policies
CREATE POLICY "Users can view their own assignments" ON assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments" ON assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments" ON assignments
  FOR DELETE USING (auth.uid() = user_id);
