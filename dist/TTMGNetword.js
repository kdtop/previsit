// --- TTMGNetwork.ts -----
import YDB from 'nodem'; // nodem's types are often inferred or provided by the module itself
const global_ydb = YDB.Ydb(); // Cast to our interface type
console.log(global_ydb.open());
console.log(global_ydb.version());
export class TTMGNetwork extends EventTarget {
    AProp1; // Add type declaration for instance property
    ydb; // Add type declaration for instance property
    constructor(input) {
        super();
        this.AProp1 = input;
        this.ydb = global_ydb;
    }
    setData(...argArray) {
        let data = this.ydb.set(...argArray);
        console.log("result of ydb set", data);
        return data;
    }
    getData(...argArray) {
        let data = this.ydb.get(...argArray);
        console.log("result of ydb get", data);
        return data;
    }
    close() {
        console.log("closing database");
        this.ydb.close();
    }
    mumpsFn(...argArray) {
        let data = this.ydb.function({
            function: argArray[0].function, // Assuming first arg is object with 'function' key
            arguments: argArray[0].arguments // Assuming first arg is object with 'arguments' key
        });
        return data;
    }
    /**
     * Calls a Mumps RPC.
     * @param {string} tag The tag name of the Mumps function to call (e.g., 'MYFN').
     * @param {string} rtn The routine name where the Mumps function is defined (e.g., 'MYROUTINE').
     * @param {Array<any>} args An array of arguments to pass to the Mumps function.
     * @param {function} [callback] Optional callback function `(error, result)` for asynchronous operation.
     * @returns {Promise<any>|undefined} A promise that resolves with an object containing final argument values,
     * or rejects with an error if the call fails. Returns undefined if a callback is provided.
     */
    // Note: Using `any` for arguments and return types of RPC for flexibility due to Mumps interaction
    RPC(tag, rtn, args = [], callback) {
        const ydb = this.ydb;
        const mumpsAPIFn = "NODEAPI^TMGNODE1";
        const hasCallback = typeof callback === 'function';
        const preparedMumpsArgs = args.map((arg, index) => {
            let valueToSend;
            let originalType;
            if (typeof arg === 'object' && arg !== null) {
                valueToSend = JSON.stringify(arg);
                originalType = Array.isArray(arg) ? 'json_array' : 'json_object';
            }
            else {
                valueToSend = arg;
                originalType = typeof arg === 'number' ? 'number' : 'string';
            }
            return {
                value: valueToSend,
                type: originalType,
            };
        });
        const finalJsonArgsForMumps = JSON.stringify(preparedMumpsArgs);
        const mumpsFnArgs = [tag, rtn, finalJsonArgsForMumps];
        const processResult = (nodemResult) => {
            if (!nodemResult || !nodemResult.ok) {
                const errorMessage = (nodemResult && nodemResult.errorMessage) || 'Unknown RPC error from nodem';
                const errorCode = (nodemResult && nodemResult.isError) ? nodemResult.errorCode : 'N/A'; // Assuming nodem.isError is available for specific errors
                throw new Error(`Mumps function 'NODEAPI^NODEAPI' failed: [Code: ${errorCode}] ${errorMessage}`);
            }
            try {
                const finalResults = JSON.parse(nodemResult.result);
                return finalResults;
            }
            catch (parseError) {
                throw new Error(`Failed to parse Mumps result as JSON. Result: '${nodemResult.result}'. Error: ${parseError.message}`);
            }
        };
        if (hasCallback) {
            try {
                this.ydb.function({
                    function: mumpsAPIFn,
                    arguments: mumpsFnArgs
                }, (error, nodemResult) => {
                    if (error) {
                        return callback(new Error(`RPC call failed before Mumps execution: ${error.message}`), null); // Pass null for result on error
                    }
                    try {
                        const finalResult = processResult(nodemResult);
                        callback(null, finalResult); // Pass null for error on success
                    }
                    catch (processingError) {
                        callback(processingError, null);
                    }
                });
            }
            catch (syncError) {
                callback(syncError, null);
            }
            return undefined;
        }
        else {
            return new Promise(async (resolve, reject) => {
                let nodemResult;
                try {
                    // Await the nodem.function call directly, as it returns a Promise
                    nodemResult = await this.ydb.function({
                        function: mumpsAPIFn,
                        arguments: mumpsFnArgs
                    });
                }
                catch (error) {
                    return reject(new Error(`RPC call failed before Mumps execution: ${error.message}`));
                }
                try {
                    const finalResult = processResult(nodemResult);
                    resolve(finalResult);
                }
                catch (processingError) {
                    reject(processingError);
                }
            });
        }
    }
    myFN1() {
        console.log(this.AProp1);
    }
    myFN2() {
        this.myFN1();
    }
}
// local, for testing only.
// sample from linux console:   npx nodemon TTMGNetwork.js
let tmgNetwork = new TTMGNetwork('hello');
tmgNetwork.myFN2();
//# sourceMappingURL=TTMGNetword.js.map