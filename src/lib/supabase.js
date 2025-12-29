import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables tidak ditemukan!')
  console.log('VITE_SUPABASE_URL:', supabaseUrl)
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ?  'Ada' : 'Tidak ada')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')