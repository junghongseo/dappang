import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function check() {
  const { data } = await supabase.from('target_accounts').select('bakery_name, shopping_mall_url');
  console.log(data);
}
check();
