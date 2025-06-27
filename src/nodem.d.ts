// src/nodem.d.ts

/**
 * The main 'nodem' module export.
 * Provides the Ydb() function to get a YDBInstance.
 */
declare module 'nodem' {
    // The namespace will serve as the container for both types and functions.
    namespace YDB {
        /**
         * Interface for the result object returned by most nodem operations.
         *
         * @template TData The type of the 'data' field, if applicable (e.g., for 'get').
         */
        export interface NodemResult<TData = any> {
            ok: boolean;
            errorMessage?: string;
            errorCode?: number; // Or string, depending on nodem's actual error codes
            return?: string;    // Explicitly add 'return' property for Mumps function results
            data?: TData;       // For 'get', 'order', etc.
            defined?: boolean;  // For 'get', 'data'
            // Other properties specific to certain operations, e.g., 'pid', 'tid' for open
            [key: string]: any; // Allow for other arbitrary properties
        }

        /**
         * Interface for the options object passed to nodem's 'function' and 'procedure' APIs.
         */
        export interface MRoutineCallOptions {
            function: string; // The tag name of the M function/procedure
            autoRelink? : (boolean | null | undefined);
            arguments: (string | number | boolean | object | null)[]; // Arguments to pass to the M routine
            // Additional options might exist, e.g., 'callinTable' or 'routinesPath' if needed
        }

        /**
         * Type definition for the callback function used in asynchronous nodem operations.
         *
         * @template T The type of the data in the result object.
         */
        export type NodemCallback<T = any> = (error: Error | null, result?: NodemResult<T>) => void;

        /**
         * Interface for the YDB (YottaDB) connection instance returned by nodem.Ydb().
         */
        export interface YDBInstance {
            /**
             * Opens a connection to YottaDB.
             * Returns an object like { ok: true, pid: number, tid: number }.
             */
            open(): NodemResult<{ pid: number, tid: number }>;

            /**
             * Returns the version string of the nodem module.
             */
            version(): string;

            /**
             * Synchronously sets a global variable node or a local variable node.
             * Returns a NodemResult indicating success or failure.
             */
            set(globalName: string, ...subscriptsAndValue: (string | number | boolean | object | null | undefined)[]): NodemResult<boolean>;

            /**
             * Synchronously retrieves the value of a global variable node or a local variable node.
             * Returns a NodemResult containing the data and defined status.
             */
            get(globalName: string, ...subscripts: (string | number)[]): NodemResult<any>;

            /**
             * Invokes a M routine (function or procedure) via the Call-in interface.
             * The `options` object specifies the routine tag and arguments.
             * NOTE: This one IS asynchronous and returns a Promise or takes a callback.
             * This is the only one in YDBInstance that is truly asynchronous as per the docs
             * when not using a callback.
             *
             * @param options Configuration for the M routine call.
             * @param callback Optional callback for asynchronous operation: `(error, result) => void`.
             * `error` will be an Error object if nodem encounters an issue before M execution.
             * `result` will be a NodemResult containing the M routine's return value in `result.result`.
             * @returns A Promise<NodemResult<string>> for async/await, or undefined if a callback is provided.
             *
             * Note: The nodem documentation implies the result of M 'function' is in `result.result` (a string).
             */
            function(
                options: MRoutineCallOptions,
                callback?: NodemCallback<string>
            ): Promise<NodemResult<string>> | undefined;

            // A separate interface/signature for procedure if it behaves differently from function.
            // procedure(options: MRoutineCallOptions, callback?: (error: Error | null, result?: NodemResult<string>) => void): Promise<NodemResult<string>> | undefined;


            /**
             * Closes the connection to YottaDB.
             */
            close(): void; // Documentation implies this is a synchronous void function

            // Add other nodem APIs as needed based on your usage:
            // data(...args: any[]): NodemResult<number>; // Checks if a node is defined
            // kill(...args: any[]): NodemResult<boolean>; // Deletes a node
            // order(...args: any[]): NodemResult<string>; // Gets the next subscript in order
            // previous(...args: any[]): NodemResult<string>; // Gets the previous subscript
            // increment(...args: any[]): NodemResult<number>; // Increments a numeric value
            // lock(...args: any[]): NodemResult<boolean>; // Locks a global
            // unlock(...args: any[]): NodemResult<boolean>; // Unlocks a global
        }

        /**
         * Creates and returns a YDBInstance. Corresponds to `require('nodem').Ydb()`.
         */
        export function Ydb(): YDBInstance;
    }
    export = YDB; // Use export = for CommonJS style module export, as nodem seems to behave.
}
