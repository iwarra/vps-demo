import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.ts';
import dotenv from 'dotenv';
dotenv.config();

export const supabase = createClient<Database>(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_SERVICE_KEY as string,
);
