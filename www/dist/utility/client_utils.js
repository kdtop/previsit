// /opt/worldvista/EHR/web/previsit/www/utility/client_utils.ts
function isBoolean(value) {
    return typeof value === 'boolean';
}
export function camelCase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
export function toNumStrDef(s, defaultNumStr = '0') {
    if (!s)
        s = defaultNumStr;
    let floatVal = parseFloat(s);
    if (isNaN(floatVal))
        return defaultNumStr;
    return floatVal.toString();
}
export function strToNumDef(str, defaultNum) {
    if (str === undefined || str.trim() === "")
        return defaultNum; // reject empty or whitespace-only strings
    const n = Number(str);
    return Number.isFinite(n) ? n : defaultNum;
}
/**
 * Pads a single-digit number string with a leading zero.
 * e.g., "7" becomes "07".
 * @param numStr The string to pad.
 * @returns The padded string or the original string if no padding is needed.
 */
export function padZero(num) {
    const numStr = String(num); // convert number to string if needed
    const parsed = parseInt(numStr, 10);
    let result = numStr;
    if (!isNaN(parsed) && numStr.length === 1 && parsed >= 0 && parsed <= 9) {
        result = numStr.padStart(2, '0');
    }
    return result;
}
/**
 * Mimics the Mumps $PIECE function.
 * Extracts pieces from a string based on a delimiter.
 *
 * @param sourceString The input string. Can be null or undefined, in which case an empty string is returned.
 * @param delimiter The delimiter string. If an empty string (""), character-wise extraction is performed.
 * @param pieceNumber The 1-based index of the starting piece. If less than 1, it's treated as 1.
 * @param endPieceNumber Optional 1-based index of the ending piece.
 *                       - If omitted, only the 'pieceNumber'-th piece is returned.
 *                       - If 'endPieceNumber' is less than 'pieceNumber', only the 'pieceNumber'-th piece is returned.
 *                       - If 'endPieceNumber' exceeds the actual number of pieces, extraction goes up to the last available piece.
 * @returns The extracted piece or pieces. If multiple pieces are extracted (e.g., a range),
 *          they are joined by the original delimiter. Returns an empty string if 'pieceNumber'
 *          is out of bounds or if the source string is null, undefined, or empty.
 *
 * Example usage of the imported 'piece' function
   console.log(`Using piece function: piece("a^b^c", "^", 2) --> "${piece("a^b^c", "^", 2)}"`);
 */
export function piece(sourceString, 
// Allow numeric input, as Mumps can fluidly pass numbers where strings are expected.
// The function will explicitly convert it to a string internally.
delimiter, pieceNumber, endPieceNumber) {
    if (sourceString === null || sourceString === undefined) {
        return "";
    }
    // Mumps $PIECE treats pieceNumber < 1 as 1.
    const pFrom = Math.max(1, pieceNumber);
    let pTo;
    let extractSinglePieceDueToRange = false;
    if (endPieceNumber === undefined) {
        pTo = pFrom; // Only extracting a single piece
    }
    else {
        if (endPieceNumber < pFrom) {
            // If endPieceNumber is less than pieceNumber, Mumps returns the 'pieceNumber'-th piece.
            pTo = pFrom;
            extractSinglePieceDueToRange = true;
        }
        else {
            pTo = endPieceNumber;
        }
    }
    // Explicitly convert sourceString to a string.
    // This handles cases where sourceString might be a number (e.g., 0)
    // and ensures all subsequent string operations are performed on a string.
    const s = String(sourceString);
    if (s === "") { // After conversion, if it's an empty string, return empty.
        return "";
    }
    if (delimiter === "") {
        // Character-wise extraction
        if (pFrom > s.length) {
            return "";
        }
        const startIndex = pFrom - 1;
        if (extractSinglePieceDueToRange || endPieceNumber === undefined) {
            return s.charAt(startIndex);
        }
        const endIndexForSubstring = Math.min(pTo, s.length);
        return s.substring(startIndex, endIndexForSubstring);
    }
    // Piece-wise extraction
    const parts = s.split(delimiter);
    if (pFrom > parts.length) {
        return "";
    }
    if (extractSinglePieceDueToRange || endPieceNumber === undefined) {
        return parts[pFrom - 1];
    }
    const actualEndPieceArrayIndex = Math.min(pTo, parts.length);
    const selectedParts = parts.slice(pFrom - 1, actualEndPieceArrayIndex);
    return selectedParts.join(delimiter);
}
/**
 * Moves all child nodes from an element to a new DocumentFragment.
 * @param el The element to extract children from.
 * @returns A DocumentFragment containing the children of the element.
 */
export function toFragment(el) {
    const f = document.createDocumentFragment();
    if (el) {
        while (el.firstChild) {
            f.appendChild(el.firstChild);
        }
    }
    return f;
}
/**
 * Sets properties on an element's shadow DOM.
 * @param el The HTMLDivElement (which now contains the shadow DOM).
 * @param opts The properties to set, e.g., { innerHTML: '...' }.
 */
export function properties(el, opts) {
    if (!opts)
        return;
    for (const [key, value] of Object.entries(opts)) {
        // This is intentionally dynamic to match original behavior.
        el.dom[key] = value;
    }
}
/**
 * Creates shortcut properties on the ELInstance for elements with class names.
 * For an element like `<div class="login-form">`, it creates `el.$loginform` on the HTMLDivElement.
 * @param el The HTMLDivElement to add shortcuts to.
 */
export function addShortcuts(el) {
    const allElements = el.dom.querySelectorAll('*');
    for (const element of allElements) {
        // The original logic uses the first class name.
        if (element.className && typeof element.className === 'string') {
            const firstClassName = element.className.split(/\s+/g)[0];
            if (firstClassName) {
                const shortcutName = '$' + firstClassName.replace(/[^a-z0-9]/gi, '').toLowerCase();
                // The index signature on ELInstance allows this.
                el[shortcutName] = element;
            }
        }
    }
}
/**
 * Creates a DocumentFragment from an HTML string.
 * @param opts Can be a string of HTML or an options object with an `innerHTML` property.
 * @returns A DocumentFragment.
 */
export function Fragment(opts) {
    const el = document.createElement('div');
    const innerHTML = (typeof opts === 'string') ? opts : opts?.innerHTML || '';
    el.innerHTML = innerHTML;
    return toFragment(el);
}
// 4. Finally, here's the function signature using these more explicit types.
export function debounce(func, wait) {
    let timeout = null;
    return function (...args) {
        const context = this;
        /*
        //-------------------------------------------------------
        //NOTE: If I come back to this, try this code:
        const myCopiedEvent = { ...event }
                  // call(...args) --> same as call(args[0], arg[1], args[2])
    
        function defCall(...args) {     //<-- if called like this  defCall(a,b,c,d), then args[0]=a, args[1]=b etc...
           ... ==> args
           args ==> ...
        }
        */
        //-------------------------------------------------------
        // --- ADD THESE DEBUG LOGS ---
        //console.log('Debounced function called!');
        //console.log('Arguments:', args);
        //if (args[0] instanceof Event) {
        //    console.log('Event target (inside debounce):', (args[0] as Event).target);
        //}
        // --- END DEBUG LOGS ---
        if (timeout) {
            clearTimeout(timeout);
        }
        //NOTICE!!! Below doesn't
        timeout = setTimeout(() => {
            func.apply(context, args); //<--- try replacing args with myCopiedEvent
        }, wait);
    };
}
// Example debounce usage:
/*
  const myUpdateFunction = (value: string, id: number) => {
    console.log(`Updating value: ${value} for ID: ${id}`);
  };

  const debouncedMyUpdateFunction = debounce(myUpdateFunction, 500);

  // These calls will be debounced
  debouncedMyUpdateFunction('hello', 1);
  debouncedMyUpdateFunction('world', 2); // This will cancel the 'hello' call
  debouncedMyUpdateFunction('typescript', 3); // This will cancel the 'world' call

  // Only 'Updating value: typescript for ID: 3' will log after 500ms pause
  setTimeout(() => {
    debouncedMyUpdateFunction('final update', 4);
  }, 600); // After the previous debounce has likely fired

*/
//---------------------------------------------------------------
//# sourceMappingURL=client_utils.js.map