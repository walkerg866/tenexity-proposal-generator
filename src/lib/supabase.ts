import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    // This is a crude way to show error if React fails to mount
    setTimeout(() => {
        if (!document.getElementById('root')?.hasChildNodes()) {
            document.body.innerHTML = '<div style="color:red; padding: 20px;"><h1>Configuration Error</h1><p>Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.</p></div>'
        }
    }, 1000)
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')
