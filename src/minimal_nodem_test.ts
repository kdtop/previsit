// minimal_nodem_test.ts
import YDB from 'nodem';

// Minimal type definitions (or import from your nodem.d.ts if easily accessible)
interface NodemResult<TData = any> {
  ok: boolean;
  errorMessage?: string;
  errorCode?: number;
  [key: string]: any;
}
interface YDBInstance {
  open(): NodemResult<{ pid: number, tid: number }>;
  close(): void;
  // Add other methods if you intend to test them, e.g., get()
}

console.log('Starting minimal nodem test...');
let db: YDBInstance | null = null;
try {
    db = (YDB as any).Ydb() as YDBInstance; // Cast if YDB.Ydb() isn't strictly typed
    const openResult = db.open();
    console.log('YDB open result:', JSON.stringify(openResult));

    if (!openResult || !openResult.ok) {
        console.error('Failed to open YDB connection:', openResult?.errorMessage);
        process.exit(1);
    }

    console.log('YDB connection opened. Process PID:', process.pid);
    console.log('Keeping process alive with setInterval. Press Ctrl+C to exit.');

    // Keep the process alive and log
    const keepAliveInterval = setInterval(() => {
        console.log(`Minimal test still alive at ${new Date().toISOString()}...`);
        // Optionally, you could try a very lightweight, non-mutating YDB operation here
        // to see if activity prevents the timeout. For example:
        // try {
        //   const data = db?.get('^%ZV', 'NODEM'); // Check if this is a valid, quick read
        //   console.log('Periodic YDB check:', data);
        // } catch (e: any) {
        //   console.error('Error during periodic YDB check:', e.message);
        // }
    }, 10000); // Log every 10 seconds

    process.on('SIGINT', () => {
        console.log('SIGINT received. Closing YDB and exiting.');
        clearInterval(keepAliveInterval);
        if (db) {
            try {
                db.close();
                console.log('YDB closed.');
            } catch (e: any) {
                console.error('Error closing YDB on SIGINT:', e.message);
            }
        }
        process.exit(0);
    });

    process.on('exit', (code) => {
        console.log(`Minimal nodem test is exiting with code: ${code}`);
        // Attempt to close DB if not already, though 'exit' handlers have limitations
        if (db) {
            try {
                // db.close(); // Synchronous close might be okay, but SIGINT is preferred for cleanup
            } catch (e) { /* ignore */ }
        }
    });

} catch (e: any) {
    console.error('Error in minimal nodem test setup:', e.message);
    if (db) {
        try { db.close(); } catch (closeError: any) { console.error("Error closing DB on failure:", closeError.message); }
    }
    process.exit(1);
}
