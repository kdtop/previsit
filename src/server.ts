// --- main.ts --------

// Add these at the very top to catch any unhandled errors early
process.on('uncaughtException', (error) => {
  console.error('!!! UNCAUGHT EXCEPTION !!!');
  console.error(error);
  process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('!!! UNHANDLED PROMISE REJECTION !!!');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1); // Exit with a failure code
});


console.log("v0.3c");

import express from 'express';
import { piece, strToNumDef } from './utils.js'; // Import the functions, pointing to the expected .js output
import { TTMGNetwork } from './TTMGNetwork.js'; // Note: Keep .js in import path for ESM environments

let tmg: TTMGNetwork; // Declare tmg, will be initialized in the try block
const app: express.Application = express(); // Initialize app
const PORT: number = 3000; // Define PORT

//====================================================================================================

// Hndle login request
async function hndlLogin(req: express.Request, res: express.Response)
{
    console.log("Received login request from browser:", req.body);
    // Explicitly cast req.body to an expected shape for login
    const { lastName, firstName, dob } = req.body as { lastName: string; firstName: string, dob: string };

    if (!lastName || !firstName || !dob) {
        res.status(400).json({ success: false, message: 'Last name, First name, and DOB are required.' });
        return;
    }

    if (!tmg) {
      res.status(500).json({ success: false, message: 'Server error: TTMGNetwork not initialized.' });
      return;
    }

    try {
        // Define a type for the expected RPC result from Mumps
        interface MumpsLoginResult {
            args: (string | object)[]; // Arguments passed by reference, can be strings or parsed JSON objects/arrays
            return: string; // The scalar return value (e.g., "1" or "0" or an error message string)
        }

        let err = "";
        // Use await here as tmg.RPC is async
        const rpcResult: MumpsLoginResult = await tmg.RPC("USRLOGIN", "TMGNODE1", [lastName, firstName, dob, err]);

        console.log('RPC result from Mumps for login:', JSON.stringify(rpcResult));

        const sessionID : string = piece(rpcResult.return,'^',2);
        const mumpsResult: number = strToNumDef(piece(rpcResult.return,'^',1), 0);

        if (mumpsResult >= 1) {
            res.json({ success: true,
                       message: 'Authentication successful.',
                       sessionID: sessionID
                     });
        } else {
            const errorMessage = rpcResult.args[3] || mumpsResult || 'Invalid credentials';
            res.status(401).json({ success: false, message: `Authentication failed: ${errorMessage}` });
        }

    } catch (error: any) {
        console.error('Error during /api/login RPC to Mumps:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error during login: ${errorMessage}` });
    }
};

//====================================================================================================
/**
 * Handle request for dashboard forms.
 * This endpoint will provide the list of forms a patient needs to complete.
 */
async function hndlDashboard(req: express.Request, res: express.Response) {
    console.log("Received request for dashboard forms.", req.query);

    // Retrieve sessionID from query parameters.
    const { sessionID } = req.query;

    // It's good practice to validate that the sessionID was provided and is a string.
    if (typeof sessionID !== 'string' || !sessionID) {
        return res.status(400).json({ success: false, message: 'A valid Session ID is required.' });
    }

    console.log(`Dashboard request for sessionID: ${sessionID}`);

    try {
        // This is a placeholder for the Mumps RPC to populate.
        // It signals to your RPC wrapper that the first argument is an array.
        // Using an empty array is a clean way to represent an output parameter.
        const outForms: string[] = [];

        // Define the expected shape of the RPC result, similar to the login handler.
        interface MumpsFormsResult {
            args: [string[], string]; // Expecting [populated_forms, original_sessionID]
            return: string;
        }

        const formsResult: MumpsFormsResult = await tmg.RPC("GETPATFORMS", "TMGNODE1", [outForms, sessionID]);

        // The populated array of forms is returned as the first element of the 'args' property in the result.
        const populatedForms = formsResult.args[0];

        // It's good practice to validate the structure of the returned data.
        if (Array.isArray(populatedForms)) {
            res.json({ success: true, forms: populatedForms });
        } else {
            console.error("RPC for forms did not return an array as expected.", formsResult);
            res.status(500).json({ success: false, message: 'Server error: Invalid data format received for forms.' });
        }
    } catch (error) {
        console.error('Error during /api/dashboard request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================

function close(message: string): void { // Add type annotation for 'message' and return type
  console.log(`here in close() function. Message=${message}`);
  if (tmg) {
    try {
      tmg.close();
      console.log('TTMGNetwork closed successfully.');
    } catch (e) {
      console.error('Error during tmg.close():', e);
    }
  } else {
    console.log('TTMGNetwork instance (tmg) was not initialized, skipping close.');
  }
}

process.on('exit', (code: number) => { // Type 'code'
  close('from exit');
});

// It's good practice to ensure close is called before exiting on signals.
// The original SIGINT handler just called process.exit(0), which would then trigger the 'exit' event.
// This is fine, but making it explicit can sometimes be clearer.
// However, if close() itself becomes asynchronous, this needs more careful handling.
// For now, the existing structure is okay as long as close() is synchronous.

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  close('from SIGTERM');
  process.exit(0);
});

try {
  // Initialize TTMGNetwork
  tmg = new TTMGNetwork('hello');
  console.log("TTMGNetwork initialized successfully.");

  // Setup middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  /*
  This line, below, uses Express's built-in express.static() middleware. When a request comes in,
  this middleware looks for a file matching the requested path within the specified directory (www).
  By convention, when the root path (/) is requested, express.static() automatically serves index.html
  if it exists in the www directory.

  So, if you have an index.html file inside a directory named www relative to your main.js file,
  this middleware will serve it for requests to /.
  */
  app.use(express.static('www'));

  // Register route handlers
  app.post('/api/login',    hndlLogin as express.RequestHandler);  // register handler (endpoint) for login
  app.get('/api/dashboard', hndlDashboard as express.RequestHandler);     // Register handler for dashboard dashboard

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

} catch (error) {
  console.error("Error during application startup:", error);
  process.exit(1); // Exit if startup fails
}