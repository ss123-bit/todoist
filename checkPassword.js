// checkPassword.js
import { createClient } from 'npm:@supabase/supabase-js'

// Use environment variables or replace with your values (not recommended for production)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Check username/password against user_details table.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ok: boolean, reason?: string, user?: object}>}
 */
export async function checkCredentials(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return { ok: false, reason: 'username and password must be strings' }
  }

  // Query the row for the given username
  const { data, error, status } = await supabase
    .from('user_details')
    .select('id, username, spassword') // select only needed columns
    .eq('username', username)
    .limit(1)
    .maybeSingle()

  if (error && status !== 406) {
    // 406 may happen with maybeSingle when no rows; handle below
    console.error('Supabase error:', error)
    return { ok: false, reason: 'database error' }
  }

  if (!data) {
    return { ok: false, reason: 'user_not_found' }
  }

  // Direct string comparison
  if (password === data.spassword) {
    // Remove sensitive fields before returning
    const safeUser = { id: data.id, username: data.username }
    return { ok: true, user: safeUser }
  } else {
    return { ok: false, reason: 'invalid_password' }
  }
}

// Example usage when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const username = process.env.INPUT_USERNAME || process.argv[2]
  const password = process.env.INPUT_PASSWORD || process.argv[3]

  if (!username || !password) {
    console.error('Usage: node checkPassword.js <username> <password>  OR set INPUT_USERNAME and INPUT_PASSWORD env vars')
    process.exit(2)
  }

  checkCredentials(username, password).then(result => {
    console.log(result)
    process.exit(result.ok ? 0 : 1)
  })
}