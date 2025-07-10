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
console.log("v0.9");
import express from 'express';
import { piece, strToNumDef } from './utils.js'; // Import the functions, pointing to the expected .js output
import { TTMGNetwork } from './TTMGNetwork.js'; // Note: Keep .js in import path for ESM environments
let tmg; // Declare tmg, will be initialized in the try block
const app = express(); // Initialize app
const PORT = 3000; // Define PORT
//====================================================================================================
// By returning `rpcResult is { return: string; args: any[] }`, we create a type guard.
// This tells TypeScript that if this function returns `true`, `rpcResult` is not null/undefined
// and has at least a `return` property (string) and an `args` property (array).
function rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn) {
    if (!rpcResult) {
        console.error('RPC call to Mumps returned undefined, indicating a failure before Mumps execution.');
        res.status(500).json({ success: false, message: `Server error: RPC call (${tag}^${rtn}) failed before Mumps execution.` });
        return false;
    }
    //console.log('RPC result:', JSON.stringify(rpcResult));
    const mumpsResult = strToNumDef(piece(rpcResult.return, '^', 1), 0);
    if (mumpsResult < 0) {
        const errorMessage = rpcResult.args[errIndex] || 'API failure';
        res.status(401).json({ success: false, message: `API call to (${tag}^${rtn}) failed. Mumps code message: ${errorMessage}` });
        return false;
    }
    return true;
}
function rpcPrecheckOK(req, res) {
    let result = true;
    const { sessionID } = req.query; // get sessionID from query parameters.
    // Validate that the sessionID was provided and is a string.
    if (typeof sessionID !== 'string' || !sessionID) {
        res.status(400).json({ success: false, message: 'A valid Session ID is required.' });
        result = false;
    }
    //console.log(`Request sessionID: ${sessionID}`);
    return result;
}
//====================================================================================================
// Handle login request
// POST only
//====================================================================================================
async function hndlLogin(req, res) {
    //console.log("Received login request from browser:", req.body);
    // Explicitly cast req.body to an expected shape for login
    const { lastName, firstName, dob } = req.body;
    if (!lastName || !firstName || !dob) {
        res.status(400).json({ success: false, message: 'Last name, First name, and DOB are required.' });
        return;
    }
    if (!tmg) {
        res.status(500).json({ success: false, message: 'Server error: TTMGNetwork not initialized.' });
        return;
    }
    try {
        let err = "";
        let errIndex = 3;
        let tag = "USRLOGIN";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [lastName, firstName, dob, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            const sessionID = piece(rpcResult.return, '^', 2);
            res.json({ success: true,
                message: 'Authentication successful.',
                sessionID: sessionID
            });
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
//====================================================================================================
/*
 Handle request for dashboard forms --  provideS the list of forms a patient needs to complete.
 GET only
*/
//====================================================================================================
async function hndlDashboard(req, res) {
    //console.log("Received request for dashboard forms.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const outForms = []; // Output parameter
        let err = "";
        let errIndex = 2;
        let tag = "GETPATFORMS";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outForms, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({ success: true,
                data: rpcResult.args[0], // type: GetPatientFormsApiResponseArray
            });
        }
    }
    catch (error) {
        console.error('Error during /api/dashboard request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for HxUpdate forms -- provideS saving form data for a patient (if any).
 GET
*/
async function hndlGetHxUpdateData(req, res) {
    //console.log("Received request for HxUpdate data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {}; // The output parameter for the data (should be an object/array)
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "GETHXDATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({ success: true,
                data: rpcResult.args[0],
                progress: rpcResult.args[1],
            });
        }
    }
    catch (error) {
        console.error('Error during /api/hxupdate request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of HxUpdate form data -- saves received form data from the client via RPC.
 POST
 */
async function hndlSaveHxUpdate(req, res) {
    //console.log("Received request to save HxUpdate data.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an object
        const progress = req.body.progress;
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "SAVEHXDATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'History data saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/hxupdate request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for ROS data
 GET
*/
async function hndlGetRosUpdateData(req, res) {
    //console.log("Received request for ROS data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "GETROSDATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({ success: true,
                data: rpcResult.args[0],
                progress: rpcResult.args[1], // type: ProgressData
            });
        }
    }
    catch (error) {
        console.error('Error during /api/rosupdate GET:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of ROS data
 POST
*/
async function hndlSaveRosUpdateData(req, res) {
    //console.log("Received request to save ROS data.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an object
        const progress = req.body.progress;
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "SAVEROSDATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'ROS data saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/rosupdate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for Medication Review data
 GET
*/
async function hndlGetMedReviewData(req, res) {
    //console.log("Received request for Medication Review data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "GETMEDS";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({ success: true,
                data: rpcResult.args[0], //type: UserMedAnswersArray
                progress: rpcResult.args[1], //type progressData
            });
        }
    }
    catch (error) {
        console.error('Error during /api/rosupdate GET:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of Medication Review data
 POST
*/
async function hndlSaveMedReviewData(req, res) {
    //console.log("Received request to save Medication Review data.", req.body)
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an array of UserMedicationAnswers
        const progress = req.body.progress; // Expecting progress to be of type ProgressData
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "SAVEMEDS";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true,
                message: 'Medication Review data saved successfully.'
            });
        }
    }
    catch (error) {
        console.error('Error during POST /api/medication_review:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for signature data
 GET
*/
async function hndlGetSig1Data(req, res) {
    //console.log("Received request for signature data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outSignature = ""; // Output parameter for the Base64 signature string
        let outProgress = {}; // output parameter for progress object
        let outText = []; // output parameter for display text
        let err = "";
        let errIndex = 4; // Output parameter for errors from Mumps
        let tag = "GETSIG1";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outSignature, outProgress, outText, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({
                success: true,
                data: { encodedSignature: rpcResult.args[0], // Base64 string
                    displayText: rpcResult.args[2], // text to view for consent.
                },
                progress: rpcResult.args[1], //type progressData
                message: 'Signature retrieved successfully.'
            });
        }
    }
    catch (error) {
        console.error('Error during GET /api/sig1:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, signature: "", message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of signature data -- receives the Base64 signature data from the client and saves it via RPC.
 POST
 */
async function hndlSaveSig1Data(req, res) {
    //console.log("Received request to save signature.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const progress = req.body.progress; // Expecting progress to be of type ProgressData
        const data = req.body.data.encodedSignature; // The base64 string for signature data representing the image of the signature
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "SAVESIG1";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'Signature saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/save-signature request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//
//====================================================================================================
//====================================================================================================
/*
 Handle request for consent data
 GET
*/
async function hndlGetConsentData(req, res) {
    //console.log("Received request for patient consent data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {}; // Output parameter
        let outProgress = {}; // output parameter for progress object
        let err = "";
        let errIndex = 4; // Output parameter for errors from Mumps
        let tag = "GETCSNT";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({
                success: true,
                data: rpcResult.args[0], //type ConsentFormData
                progress: rpcResult.args[1], //type progressData
                message: 'Consent data retrieved successfully.'
            });
        }
    }
    catch (error) {
        console.error('Error during GET /api/sig1:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, signature: "", message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of consent data -- receives data from the client and saves it via RPC.
 POST
 */
async function hndlSaveConsentData(req, res) {
    //console.log("Received request to save consent.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const progress = req.body.progress;
        const data = req.body.data;
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps
        let tag = "SAVECSNT";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'Consent data saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/patient_consent request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
function close(message) {
    console.log(`here in close() function. Message=${message}`);
    if (tmg) {
        try {
            tmg.close();
            console.log('TTMGNetwork closed successfully.');
        }
        catch (e) {
            console.error('Error during tmg.close():', e);
        }
    }
    else {
        console.log('TTMGNetwork instance (tmg) was not initialized, skipping close.');
    }
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
    app.post('/api/login', hndlLogin); // register handler (endpoint) for login
    app.get('/api/dashboard', hndlDashboard); // Register handler for dashboard dashboard
    app.get('/api/hxupdate', hndlGetHxUpdateData); // Register handler for getting hxupdate data
    app.post('/api/hxupdate', hndlSaveHxUpdate); // Register handler for saving history updates
    app.get('/api/rosupdate', hndlGetRosUpdateData); // Register handler for getting rosupdate data
    app.post('/api/rosupdate', hndlSaveRosUpdateData); // Register handler for saving rosupdate data
    app.get('/api/medication_review', hndlGetMedReviewData); // Register handler for getting medication review data
    app.post('/api/medication_review', hndlSaveMedReviewData); // Register handler for saving medication review data
    app.get('/api/sig1', hndlGetSig1Data); // Register handler for getting signature
    app.post('/api/sig1', hndlSaveSig1Data); // Register handler for saving signature
    app.get('/api/patient_consent', hndlGetConsentData); // Register handler for getting patient consent form
    app.post('/api/patient_consent', hndlSaveConsentData); // Register handler for saving  patient consent form
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
catch (error) {
    console.error("Error during application startup:", error);
    process.exit(1); // Exit if startup fails
}
//# sourceMappingURL=server.js.map