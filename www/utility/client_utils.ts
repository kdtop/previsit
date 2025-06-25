// /opt/worldvista/EHR/web/previsit/www/utility/client_utils.ts

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