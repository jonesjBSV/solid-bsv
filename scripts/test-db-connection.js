const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('Testing Supabase database connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY // Using service role key
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.log('SUPABASE_SECRET_KEY:', !!supabaseKey)
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase.from('accounts').select('*').limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return
    }
    
    console.log('✅ Database connection successful')
    console.log('Found accounts table with', data ? data.length : 0, 'records')
    
    // Test other core tables
    const tables = ['users', 'sessions', 'verification_tokens', 'vault_item', 'context_entry']
    
    for (const table of tables) {
      try {
        console.log(`2. Testing ${table} table...`)
        const { data, error } = await supabase.from(table).select('*').limit(1)
        
        if (error) {
          console.error(`❌ Error with ${table}:`, error.message)
        } else {
          console.log(`✅ ${table} table accessible`)
        }
      } catch (err) {
        console.error(`❌ Exception testing ${table}:`, err.message)
      }
    }
    
    console.log('\n✅ Database schema test completed')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDatabaseConnection()