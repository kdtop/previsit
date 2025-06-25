// --- main.ts --------
console.log("v0.3a");
import express from 'express';
import { piece, strToNumDef } from './utils.js'; // Import the functions, pointing to the expected .js output
import { TTMGNetwork } from './TTMGNetwork.js'; // Note: Keep .js in import path for ESM environments
let tmg = new TTMGNetwork('hello');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('www'));
//====================================================================================================
// Handle form submission
async function hndlSubmit(req, res) {
    // Explicitly cast req.body to an expected shape
    const { firstName, lastName } = req.body;
    const key = req.query.key; // req.query can be string | string[] | undefined
    console.log(firstName, lastName);
    let data = tmg.setData('^v4wTest', 0, 2, 0, 'name=' + lastName + ', ' + firstName);
    res.send("posted to ydb");
}
;
// Hndle login request
async function hndlLogin(req, res) {
    console.log("Received login request from browser:", req.body);
    // Explicitly cast req.body to an expected shape for login
    const { lastName, firstName, dob } = req.body;
    if (!lastName || !firstName || !dob) {
        return res.status(400).json({ success: false, message: 'Last name, First name, and DOB are required.' });
    }
    try {
        let err = "";
        // Use await here as tmg.RPC is async
        const rpcResult = await tmg.RPC("USRLOGIN", "TMGNODE1", [lastName, firstName, dob, err]);
        console.log('RPC result from Mumps for login:', JSON.stringify(rpcResult));
        const sessionID = piece(rpcResult.return, '^', 2);
        const mumpsResult = strToNumDef(piece(rpcResult.return, '^', 1), 0);
        if (mumpsResult >= 1) {
            res.json({ success: true,
                message: 'Authentication successful.',
                sessionID: sessionID
            });
        }
        else {
            const errorMessage = rpcResult.args[3] || mumpsResult || 'Invalid credentials';
            res.status(401).json({ success: false, message: `Authentication failed: ${errorMessage}` });
        }
    }
    catch (error) {
        console.error('Error during /api/login RPC to Mumps:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error during login: ${errorMessage}` });
    }
}
;
//====================================================================================================
app.post('/submit', hndlSubmit); // register handler for submit
app.post('/api/login', hndlLogin); // register handler (endpoint) for login
//====================================================================================================
function close(message) {
    console.log(`here in close() function. Message=${message}`);
    tmg.close();
}
process.on('exit', (code) => {
    close('from exit');
});
process.on('SIGINT', () => {
    process.exit(0);
});
process.on('SIGTERM', () => {
    close('from SIGTERM');
    process.exit(0);
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=main.js.map