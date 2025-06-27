// /opt/worldvista/EHR/web/previsit/www/utility/client_utils.ts
/**
 * Pads a single-digit number string with a leading zero.
 * e.g., "7" becomes "07".
 * @param numStr The string to pad.
 * @returns The padded string or the original string if no padding is needed.
 */
export function padZero(numStr) {
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
//# sourceMappingURL=client_utils.js.map