// Supabase configuration
const SUPABASE_URL = 'https://niaxdddzdskqkhhmcjal.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PFUrx8fJvFNKE9PctemDSg_T7g-V7WY';

// Authenticate user against user_details table
async function authenticateUser(username, password) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/user_details?user_name=eq.${encodeURIComponent(username)}`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to authenticate');
        }

        const users = await response.json();

        if (users.length === 0) {
            return null;
        }

        const user = users[0];

        // Check password (plain text comparison)
        if (user.password === password) {
            return {
                user_name: user.user_name,
                table_name: user.table_name
            };
        }

        return null;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Fetch tasks from user's specific table
async function fetchTasksFromTable(tableName) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(tableName)}`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
}