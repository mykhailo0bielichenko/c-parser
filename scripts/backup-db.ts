import * as dotenv from 'dotenv';
import * as path from 'path';
import { downloadDatabaseBackup } from '../lib/supabase';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runBackup() {
    try {
        const backupName = process.argv[2] || 'manual-backup';
        console.log(`Starting database backup: ${backupName}...`);

        const backupPath = await downloadDatabaseBackup(backupName);

        console.log(`✅ Backup completed successfully!`);
        console.log(`📁 Backup file: ${backupPath}`);
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

runBackup();
