CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 100)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    LEFT(
      COALESCE(
        NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'user_name', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'preferred_username', ''),
        NULLIF(split_part(NEW.email, '@', 1), ''),
        'Guest'
      ),
      100
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'picture', '')
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

  RETURN NEW;
END;
$$;

INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT
  id,
  LEFT(
    COALESCE(
      NULLIF(raw_user_meta_data ->> 'full_name', ''),
      NULLIF(raw_user_meta_data ->> 'name', ''),
      NULLIF(raw_user_meta_data ->> 'user_name', ''),
      NULLIF(raw_user_meta_data ->> 'preferred_username', ''),
      NULLIF(split_part(email, '@', 1), ''),
      'Guest'
    ),
    100
  ),
  COALESCE(
    NULLIF(raw_user_meta_data ->> 'avatar_url', ''),
    NULLIF(raw_user_meta_data ->> 'picture', '')
  )
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.guestbook_entries
  ADD COLUMN avatar_url TEXT;

ALTER TABLE public.guestbook_entries
  ADD CONSTRAINT guestbook_entries_signature_length
  CHECK (signature_svg IS NULL OR char_length(signature_svg) <= 20000);

DROP POLICY "Authenticated users can create their own entries" ON public.guestbook_entries;

CREATE POLICY "Authenticated users can create their own entries"
  ON public.guestbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND avatar_url IS NOT DISTINCT FROM (
      SELECT avatar_url FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE INDEX guestbook_entries_user_id_idx ON public.guestbook_entries (user_id);
