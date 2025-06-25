// minimal_nodem_test.ts
import YDB from 'nodem';
console.log('Starting minimal nodem test...');
let db = null;
try {
    db = YDB.Ydb(); // Cast if YDB.Ydb() isn't strictly typed
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
            }
            catch (e) {
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
            }
            catch (e) { /* ignore */ }
        }
    });
}
catch (e) {
    console.error('Error in minimal nodem test setup:', e.message);
    if (db) {
        try {
            db.close();
        }
        catch (closeError) {
            console.error("Error closing DB on failure:", closeError.message);
        }
    }
    process.exit(1);
}
//# sourceMappingURL=minimal_nodem_test.js.map