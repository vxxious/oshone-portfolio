CREATE TABLE public.guestbook_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  signature_svg TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_message_length CHECK (char_length(message) BETWEEN 1 AND 1000),
  CONSTRAINT guestbook_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 100)
);

GRANT SELECT ON public.guestbook_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook_entries TO authenticated;
GRANT ALL ON public.guestbook_entries TO service_role;

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guestbook entries are viewable by everyone"
  ON public.guestbook_entries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create their own entries"
  ON public.guestbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.guestbook_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.guestbook_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX guestbook_entries_created_at_idx ON public.guestbook_entries (created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_guestbook_entries_updated_at
  BEFORE UPDATE ON public.guestbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();