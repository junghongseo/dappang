const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
async function test() {
  const { data } = await supabase.from('target_accounts').select('bakery_name, instagram_id');
  console.log(data);
}
test();
