// /opt/worldvista/EHR/web/previsit/www/utility/client_utils.ts

import { EnhancedHTMLDivElement, AppViewOptions
       } from './types.js';


function isBoolean(value : any) {
  return typeof value === 'boolean';
}

export function camelCase(s : string) : string {  //not a true camel case.  Just first letter capitalized.
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function toNumStrDef(s : string | null | undefined, defaultNumStr = '0') : string
{
  if (!s) s = defaultNumStr;
  let floatVal = parseFloat(s);
  if (isNaN(floatVal)) return defaultNumStr;
  return floatVal.toString();
}

/**
 * Pads a single-digit number string with a leading zero.
 * e.g., "7" becomes "07".
 * @param numStr The string to pad.
 * @returns The padded string or the original string if no padding is needed.
 */
export function padZero(numStr: string): string {
    // Using a radix is a best practice for parseInt.
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && numStr.length === 1 && num >= 0 && num <= 9) {
        return String(num).padStart(2, '0');
    }
    return numStr;
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
export function piece(sourceString: string | number | null | undefined,
                        // Allow numeric input, as Mumps can fluidly pass numbers where strings are expected.
                        // The function will explicitly convert it to a string internally.
                      delimiter: string,
                      pieceNumber: number,
                      endPieceNumber?: number ): string {
  if (sourceString === null || sourceString === undefined) {
    return "";
  }

  // Mumps $PIECE treats pieceNumber < 1 as 1.
  const pFrom = Math.max(1, pieceNumber);
  let pTo: number;
  let extractSinglePieceDueToRange = false;

  if (endPieceNumber === undefined) {
    pTo = pFrom; // Only extracting a single piece
  } else {
    if (endPieceNumber < pFrom) {
      // If endPieceNumber is less than pieceNumber, Mumps returns the 'pieceNumber'-th piece.
      pTo = pFrom;
      extractSinglePieceDueToRange = true;
    } else {
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
export function toFragment(el: HTMLElement | null): DocumentFragment {
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
export function properties(el: EnhancedHTMLDivElement, opts?: AppViewOptions): void {
    if (!opts) return;
    for (const [key, value] of Object.entries(opts)) {
        // This is intentionally dynamic to match original behavior.
        (el.dom as any)[key] = value;
    }
}


/**
 * Creates shortcut properties on the ELInstance for elements with class names.
 * For an element like `<div class="login-form">`, it creates `el.$loginform` on the HTMLDivElement.
 * @param el The HTMLDivElement to add shortcuts to.
 */
export function addShortcuts(el: EnhancedHTMLDivElement): void {
    const allElements = el.dom.querySelectorAll<HTMLElement>('*');

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
export function Fragment(opts?: string | AppViewOptions): DocumentFragment {
    const el : HTMLDivElement = document.createElement('div');
    const innerHTML = (typeof opts === 'string') ? opts : opts?.innerHTML || '';
    el.innerHTML = innerHTML;
    return toFragment(el);
}



// -- debouncing functionality -----

// 1. Define a type for a generic procedure (a function that returns nothing).
//    This type represents any function that takes any number of arguments
//    of any type, and does not return a value.
export type Procedure = (...args: any[]) => void;

// 2. Now, let's redefine the type for the function that will be debounced.
//    The generic type 'T' must now extend our 'Procedure' type.
export type DebouncedFunction<T extends Procedure> = T;   //<-- shows that this new type 'T' is really the same as T (just with more definition)

// 3. Define the type for the function that the debounce wrapper will return.
//    It's a function that takes the exact same arguments as the original
//    function 'T' and returns nothing.
export type DebounceWrapper<T extends Procedure> = (...args: Parameters<T>) => void;

// 4. Finally, here's the function signature using these more explicit types.
export function debounce<T extends Procedure>(func: DebouncedFunction<T>, wait: number): DebounceWrapper<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context : ThisParameterType<T> = this;

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
    console.log('Debounced function called!');
    console.log('Arguments:', args);
    if (args[0] instanceof Event) {
        console.log('Event target (inside debounce):', (args[0] as Event).target);
    }
    // --- END DEBUG LOGS ---
    if (timeout) {
      clearTimeout(timeout);
    }
    //NOTICE!!! Below doesn't
    timeout = setTimeout(() => {
      func.apply(context, args);  //<--- try replacing args with myCopiedEvent
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