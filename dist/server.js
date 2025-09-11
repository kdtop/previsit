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
// This type information is then used at the CALLING LOCATION.  So a retrograde typing -- strange but true
/* Per ChatGPT:
    In TypeScript, rpcResult is { return: string; args: any[] } is called a type predicate or type guard function.
    In programming language terms, it’s a refinement type: the function refines the type of a variable based on a runtime check.
    Another way to describe it: it’s flow-sensitive type narrowing — the compiler uses control flow to treat a variable as a more specific type in a certain branch.
*/
function rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn) {
    if (!rpcResult) {
        console.error('RPC call to Mumps returned undefined, indicating a failure before Mumps execution.');
        res.status(500).json({ success: false, message: `Server error: RPC call (${tag}^${rtn}) failed before Mumps execution.` });
        return false;
    }
    //console.log('RPC result:', JSON.stringify(rpcResult));
    const mumpsResult = strToNumDef(piece(rpcResult.return, '^', 1), 0);
    if (mumpsResult < 0) {
        let errorMessage = 'API failure'; //default
        let argLength = rpcResult?.args?.length || 0;
        if (errIndex >= argLength) {
            errorMessage = `API failure.  Expected at least ${errIndex + 1} return parameters, but got ${argLength}.`;
        }
        else {
            errorMessage = rpcResult?.args[errIndex] || 'API failure';
        }
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
            //NOTE: If user entered an incomplete last name, or an alias name, it might still be sufficient for finding unique patient
            //      So the RPC will pass back name and DOB as found on server.
            const fullName = piece(rpcResult.return, '^', 3);
            const lastName = piece(fullName, ',', 1);
            const firstName = piece(fullName, ',', 2);
            const aDOB = piece(rpcResult.return, '^', 4); //string external form of date.
            //json below should match LoginApiResponse
            res.json({ success: true,
                lastName: piece(fullName, ",", 1),
                firstName: piece(fullName, ",", 2), //may also include middle name or middle initial, e.g. 'BEATRICE L'
                message: 'Authentication successful.',
                fullName: firstName + ' ' + lastName,
                dob: aDOB,
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
 Handle request for dashboard forms --  provides the list of forms a patient needs to complete.
 GET only
*/
//====================================================================================================
async function hndlGetDashboard(req, res) {
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
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of Dashboard form data -- saves received form data from the client via RPC.
 POST
 */
async function hndlSaveDashboard(req, res) {
    //NOTE: We don't currently need to save anything for dashboard.  But due to OOP and form consistency, will implement
    //      something that can be called with empty data.
    res.status(200).json({ success: true, message: 'OK' });
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
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
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
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
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
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
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
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
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
async function hndlGetMedReviewDataCommon(req, res, mode = 0) {
    //This is A UNIFIED FUNCTION for OTC and/or regular Rx
    //console.log("Received request for Medication/OTC-Rx Review data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "GETMEDS";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err, mode]);
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
async function hndlSaveMedReviewDataCommon(req, res, mode = 0) {
    //This is A UNIFIED FUNCTION for OTC and/or regular Rx
    //console.log("Received request to save Medication Review data.", req.body)
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an array of UserMedicationAnswers
        const progress = req.body.progress; // Expecting progress to be of type ProgressData
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "SAVEMEDS";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err, mode]);
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
 Handle request for Medication (and/or OTC Rx) Review data
 GET
*/
async function hndlGetMedReviewData(req, res) {
    await hndlGetMedReviewDataCommon(req, res, 1); //1 is mode, meaning Rx only (no OTC)
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of Medication Review data
 POST
*/
async function hndlSaveMedReviewData(req, res) {
    await hndlSaveMedReviewDataCommon(req, res, 1); //1 is mode, meaning Rx only (no OTC)
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for OTC Medication Review data
 GET
*/
async function hndlGetOTCMedReviewData(req, res) {
    await hndlGetMedReviewDataCommon(req, res, 2); //2 is mode, meaning OTC only (no regular Rxs)
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of OTC Medication Review data
 POST
*/
async function hndlSaveOTCMedReviewData(req, res) {
    await hndlSaveMedReviewDataCommon(req, res, 2); //2 is mode, meaning OTC only (no regular Rxs)
}
//====================================================================================================
//====================================================================================================
/*
 Handle request for Rx Allergies Review data
 GET
*/
async function hndlGetRxAllergiesData(req, res) {
    //console.log("Received request for Allergy Review data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "GETALRGY";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.json({ success: true,
                data: rpcResult.args[0], //type: UserAllergyAnswersArray
                progress: rpcResult.args[1], //type progressData
            });
        }
    }
    catch (error) {
        console.error('Error during /api/rx_allergies_review GET:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of Rx Allergies Review data
 POST
*/
async function hndlSaveRxAllergiesData(req, res) {
    //console.log("Received request to save Allergies Review data.", req.body)
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an array of UserAllergyAnswersArray
        const progress = req.body.progress; // Expecting progress to be of type ProgressData
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "SAVEALRGY";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true,
                message: 'Allergy Review data saved successfully.'
            });
        }
    }
    catch (error) {
        console.error('Error during POST /api/rx_allergies_review:', error);
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
        let errIndex = 4; // Output parameter for errors from Mumps (1st param is #0)
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
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
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
        let outSig = ""; // output parmeter for encoded signature.  I am splitting this to try to avoid JSON parsing problems on server.
        let err = "";
        let errIndex = 4; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "GETCSNT";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [outData, outSig, outProgress, sessionID, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            let subData = rpcResult.args[0]; //type ConsentFormData
            outSig = rpcResult.args[1];
            let fullData = { ...subData,
                encodedSignature: outSig
            };
            res.json({
                success: true,
                data: fullData,
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
        let { encodedSignature = "", frozenFormHTML = "", ...subData } = req.body.data; //I am splitting this to try to avoid JSON parsing problems on server.
        const trimmedData = subData;
        //const data : ConsentFormData = req.body.data;
        let err = "";
        let errIndex = 5; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "SAVECSNT";
        let rtn = "TMGPRE01";
        //frozenFormHTML = '';  //temp!!  <--- if not set to '', the RPC fails, I think not in my code... May have to make separate call.
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, trimmedData, encodedSignature, frozenFormHTML, progress, err]);
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
/*
 Handle request for ROS data
 GET
*/
async function hndlGetPhq9QuestData(req, res) {
    //console.log("Received request for PHQ-9 data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "GETPHQ9DATA";
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
        console.error('Error during /api/phq9Quest GET:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of PHQ9 data
 POST
*/
async function hndlSavePhq9QuestData(req, res) {
    //console.log("Received request to save PHQ-9 data.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an object
        const progress = req.body.progress;
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "SAVEPHQ9DATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'ROS data saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/phq9Quest:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
}
//====================================================================================================
//====================================================================================================
//====================================================================================================
//====================================================================================================
/*
 Handle request for AWV data
 GET
*/
async function hndlGetAWVQuestData(req, res) {
    //console.log("Received request for PHQ-9 data.", req.query);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        let outData = {};
        let outProgress = {};
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "GETAWVDATA";
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
        console.error('Error during /api/awvQuest GET:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, data: {}, message: `Internal server error: ${errorMessage}` });
    }
}
//----------------------------------------------------------------------------------------------------
/*
 Handle saving of AWV data
 POST
*/
async function hndlSaveAWVQuestData(req, res) {
    //console.log("Received request to save PHQ-9 data.", req.body);
    if (!rpcPrecheckOK(req, res))
        return; //res output object will have already been set in rpcPrecheckOK
    try {
        const { sessionID } = req.query;
        const data = req.body.data; // Expecting data to be an object
        const progress = req.body.progress;
        let err = "";
        let errIndex = 3; // Output parameter for errors from Mumps (1st param is #0)
        let tag = "SAVEAWVDATA";
        let rtn = "TMGPRE01";
        const rpcResult = await tmg.RPC(tag, rtn, [sessionID, data, progress, err]);
        if (rpcErrorCheckOK(rpcResult, res, errIndex, tag, rtn)) {
            res.status(200).json({ success: true, message: 'ROS data saved successfully.' });
        }
    }
    catch (error) {
        console.error('Error during POST /api/awvQuest:', error);
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
    app.get('/api/dashboard', hndlGetDashboard); // Register handler for getting dashboard dashboard
    app.post('/api/dashboard', hndlSaveDashboard); // Register handler for saving dashboard dashboard
    app.get('/api/hxupdate', hndlGetHxUpdateData); // Register handler for getting hxupdate data
    app.post('/api/hxupdate', hndlSaveHxUpdate); // Register handler for saving history updates
    app.get('/api/rosupdate', hndlGetRosUpdateData); // Register handler for getting rosupdate data
    app.post('/api/rosupdate', hndlSaveRosUpdateData); // Register handler for saving rosupdate data
    app.get('/api/medication_review', hndlGetMedReviewData); // Register handler for getting medication review data
    app.post('/api/medication_review', hndlSaveMedReviewData); // Register handler for saving medication review data
    app.get('/api/otc_medication_review', hndlGetOTCMedReviewData); // Register handler for getting OTC medication review data
    app.post('/api/otc_medication_review', hndlSaveOTCMedReviewData); // Register handler for saving OTC medication review data
    app.get('/api/rx_allergies_review', hndlGetRxAllergiesData); // Register handler for getting Rx Allergies review data
    app.post('/api/rx_allergies_review', hndlSaveRxAllergiesData); // Register handler for saving Rx Allergies  review data
    app.get('/api/sig1', hndlGetSig1Data); // Register handler for getting signature
    app.post('/api/sig1', hndlSaveSig1Data); // Register handler for saving signature
    app.get('/api/patient_consent', hndlGetConsentData); // Register handler for getting patient consent form
    app.post('/api/patient_consent', hndlSaveConsentData); // Register handler for saving  patient consent form
    app.get('/api/phq9Quest', hndlGetPhq9QuestData); // Register handler for getting phq9Quest data
    app.post('/api/phq9Quest', hndlSavePhq9QuestData); // Register handler for saving phq9Quest data
    app.get('/api/awvQuest', hndlGetAWVQuestData); // Register handler for getting awvQuest data
    app.post('/api/awvQuest', hndlSaveAWVQuestData); // Register handler for saving awvQuest data
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