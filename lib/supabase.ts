import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

// Create a single supabase client for the entire server-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with admin privileges (for server components and API routes)
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey
);

// Download database backup function
export const downloadDatabaseBackup = async function (
    backupName?: string
): Promise<string> {
    const execPromise = util.promisify(exec);

    // Create the dump directory if it doesn't exist
    const dumpDir = path.resolve(process.cwd(), 'dump');
    if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = backupName
        ? `${backupName}-${timestamp}.sql`
        : `backup-${timestamp}.sql`;
    const backupPath = path.join(dumpDir, filename);

    // Get database connection info from environment variables
    const dbHost = process.env.SUPABASE_DB_HOST;
    const dbPort = process.env.SUPABASE_DB_PORT || '5432';
    const dbName = process.env.SUPABASE_DB_NAME;
    const dbUser = process.env.SUPABASE_DB_USER;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    if (!dbHost || !dbName || !dbUser || !dbPassword) {
        throw new Error(
            'Database connection information is incomplete in environment variables'
        );
    }

    try {
        // Use pg_dump to create a database backup
        const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p > "${backupPath}"`;
        await execPromise(command);

        console.log(`Database backup saved to: ${backupPath}`);
        return backupPath;
    } catch (error) {
        console.error('Error creating database backup:', error);
        throw error;
    }
};
