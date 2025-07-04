// --- TTMGNetwork.ts -----

import YDB, { MRoutineCallOptions } from 'nodem'; // Default import for 'export =' modules with esModuleInterop

const global_ydb: YDB.YDBInstance = YDB.Ydb(); // Access Ydb() method from the imported namespace

console.log(global_ydb.open());
console.log(global_ydb.version());

export class TTMGNetwork extends EventTarget {
  AProp1: string; // Add type declaration for instance property
  ydb: YDB.YDBInstance; // Add type declaration for instance property

  constructor(input: string) { // Add type annotation for 'input'
    super();
    this.AProp1 = input;
    this.ydb = global_ydb;
  }

  // setData now returns NodemResult<boolean> directly, and is NOT async
  setData(globalName: string, ...subscriptsAndValue: (string | number | boolean | object | null | undefined)[]): YDB.NodemResult<boolean> {
    const result = this.ydb.set(globalName, ...subscriptsAndValue); // No await, as it's synchronous
    console.log("result of ydb set", result);
    return result; // Return the NodemResult object directly
  }

  // getData now returns NodemResult<any> directly, and is NOT async
  getData(globalName: string, ...subscripts: (string | number)[]): YDB.NodemResult<any> {
    const result = this.ydb.get(globalName, ...subscripts); // No await, as it's synchronous
    console.log("result of ydb get", result);
    return result; // Return the NodemResult object directly
  }

  close(): void { // Add return type
    console.log("closing database");
    this.ydb.close();
  }

  mumpsFn(...argArray: any[]): any { // Use `any[]` for variadic args, add return type
    let data: any = this.ydb.function({
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
  RPC<T = any>(tag: string, rtn: string, args: any[] = [], callback?: (error: Error | null, result?: T) => void): Promise<T> | undefined
  {
    const ydb = this.ydb;
    const mumpsAPIFn = "NODEAPI^TMGNODE1";
    const hasCallback = typeof callback === 'function';

    const preparedMumpsArgs = args.map((arg) => {
        let originalType: string;

        if (typeof arg === 'object' && arg !== null) {
            originalType = Array.isArray(arg) ? 'json_array' : 'json_object';
        } else {
            originalType = typeof arg === 'number' ? 'number' : 'string';
        }

        // The value is the argument itself. The outer JSON.stringify will handle converting it.
        return { value: arg, type: originalType };
    });

    const finalJsonArgsForMumps = JSON.stringify(preparedMumpsArgs);
    const mumpsFnArgs = [tag, rtn, finalJsonArgsForMumps];
    let callOptions : MRoutineCallOptions = {
      function: mumpsAPIFn,
      autoRelink : false,
      arguments: mumpsFnArgs
    };

    const processResultFn = function(nodemResult: any): T { // nodemResult type is complex, using any for simplicity
      if (!nodemResult || !nodemResult.ok) {
          const errorMessage = (nodemResult && nodemResult.errorMessage) || 'Unknown RPC error from nodem';
          const errorCode = (nodemResult && nodemResult.isError) ? nodemResult.errorCode : 'N/A'; // Assuming nodem.isError is available for specific errors
          throw new Error(`Mumps function 'NODEAPI^NODEAPI' failed: [Code: ${errorCode}] ${errorMessage}`);
      }

      try {
        const finalResults = JSON.parse(nodemResult.result);
        return finalResults as T;
      } catch (parseError: any) {
        throw new Error(`Failed to parse Mumps result as JSON. Result: '${nodemResult.result}'. Error: ${parseError.message}`);
      }
    };

    if (hasCallback) {
      const hndlCallback: YDB.NodemCallback<string> = function(error, nodemResult) {
        if (error) {
          // Handle initial nodem error. No result is passed on error.
          callback(new Error(`RPC call failed before Mumps execution: ${error.message}`));
        } else {
          // Process the successful nodem result
          try {
            const finalResult = processResultFn(nodemResult);
            callback(null, finalResult); // Pass null for error on success
          } catch (processingError: any) {
            callback(processingError);
          }
        }
      };

      try {
        this.ydb.function(callOptions, hndlCallback);  //<--- make RPC call to mumps server.
      } catch (syncError: any) {
        callback(syncError);
      }
      return undefined;
    } else {
      // For the promise-based path, we use an async IIFE (Immediately Invoked Function Expression)
      // to leverage async/await syntax without the Promise constructor anti-pattern.
      return (async (): Promise<T> => {
        let nodemResult: any;
        try {
          // Await the nodem.function call directly. It returns a promise when no callback is provided.
          nodemResult = await this.ydb.function({
            function: mumpsAPIFn,
            arguments: mumpsFnArgs
          });
        } catch (error: any) {
          // This catch handles transport-level errors (e.g., network, nodem internal).
          throw new Error(`RPC call failed before Mumps execution: ${error.message}`);
        }
        // processResultFn handles Mumps-level errors and JSON parsing errors by throwing.
        // Any exception here will be automatically caught and will cause the promise to reject.
        return processResultFn(nodemResult);
      })();
    }
  }

  myFN1(): void {
    console.log(this.AProp1);
  }

  myFN2(): void {
    this.myFN1();
  }
}

/*
// Define expected request body shapes for type safety
interface SubmitBody {
    firstName: string;
    lastName: string;
}

// Handle form submission
async function hndlSubmit(req: express.Request, res: express.Response) {
    const { firstName, lastName } = req.body as SubmitBody;
    console.log(firstName, lastName);
    if (!tmg) {
      return res.status(500).json({ success: false, message: 'Server error: TTMGNetwork not initialized.' });
    }
    let data = tmg.setData('^v4wTest', 0, 2, 0, 'name=' + lastName + ', ' + firstName);
    res.send("posted to ydb");
};

*/

// local, for testing only.
// sample from linux console:   npx nodemon TTMGNetwork.js

let tmgNetwork = new TTMGNetwork('hello');
tmgNetwork.myFN2();