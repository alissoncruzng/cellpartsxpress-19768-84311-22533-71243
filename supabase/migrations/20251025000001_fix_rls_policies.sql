-- Fix RLS policies for profiles table
-- Allow public read access for authentication checks

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view driver profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can view driver profiles" ON profiles FOR SELECT USING (role = 'driver');
CREATE POLICY "Allow auth checks" ON profiles FOR SELECT USING (true);

-- Also allow anonymous users to check if profiles exist for auth flow
CREATE POLICY "Anonymous users can check profile existence" ON profiles FOR SELECT
USING (
  -- Allow checking if a user profile exists during login/registration
  id = auth.uid() OR
  -- Allow viewing driver profiles for public access
  role = 'driver'
);

-- Grant necessary permissions
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
