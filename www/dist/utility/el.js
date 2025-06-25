// /opt/worldvista/EHR/web/previsit/www/utility/el.ts
// --- Utility Functions ---
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
 * Attaches a shadow root to an element and sets the `dom` property on it.
 * @param el The element to attach the shadow root to.
 */
export function shadowRoot(el) {
    // The constructor already does this, but this is kept for compatibility
    // if someone wants to compose their own element.
    if (!el.shadowRoot) {
        el.dom = el.attachShadow({ mode: 'open' });
    }
}
/**
 * Sets properties on an element's shadow DOM.
 * @param el The ELInstance.
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
 * For an element like `<div class="login-form">`, it creates `el.$loginform`.
 * @param el The ELInstance to add shortcuts to.
 */
export function shorts(el) {
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
 * A helper function that creates a base `div` element.
 * In the original `el.js`, this was a function constructor that returned the `div`.
 * This is not used by the default `EL` export but is kept for API compatibility.
 * @returns A basic HTMLDivElement.
 */
export function HTML_ELEMENT() {
    return document.createElement('div');
}
/**
 * Creates a DocumentFragment from an HTML string.
 * @param opts Can be a string of HTML or an options object with an `innerHTML` property.
 * @returns A DocumentFragment.
 */
export function Fragment(opts) {
    const el = HTML_ELEMENT();
    const innerHTML = (typeof opts === 'string') ? opts : opts?.innerHTML || '';
    el.innerHTML = innerHTML;
    return toFragment(el);
}
// --- Main "Constructor" Class ---
/**
 * The main factory class that creates an enhanced `div` element.
 * It's designed to be called with `new EL(...)` to maintain compatibility
 * with the original usage pattern.
 *
 * The constructor returns an `ELInstance` (an enhanced HTMLDivElement), not an
 * instance of the `EL` class itself. This matches the original library's behavior.
 *
 * @param opts Options, including `innerHTML` to populate the shadow DOM.
 */
export default class EL {
    constructor(opts) {
        const el = document.createElement('div');
        el.dom = el.attachShadow({ mode: 'open' });
        if (opts) {
            properties(el, opts);
            shorts(el);
        }
        // When a constructor returns an object, that object becomes the result
        // of the `new` expression. This preserves the original API.
        return el;
    }
}
//# sourceMappingURL=el.js.map