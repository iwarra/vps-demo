import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ifaaholhwubrmjjfqibb.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYWFob2xod3Vicm1qamZxaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDEwNTksImV4cCI6MjA3MjgxNzA1OX0._1UGTPUG7EwuRCwUWufCiGGHK0f6kpU7Jnfpw30OuTM';
export const supabase = createClient(supabaseUrl, supabaseKey);
