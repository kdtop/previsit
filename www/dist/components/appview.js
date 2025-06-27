// /opt/worldvista/EHR/web/previsit/www/utility/el.ts
/*
export interface AppViewInstance {
    // The actual HTMLDivElement, enhanced with its Shadow DOM and dynamic shortcut properties.
    html: EnhancedHTMLElement;
}
*/
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
 * This class now returns an instance of itself, which contains the HTML element.
 *
 * @param opts Options, including `innerHTML` to populate the shadow DOM.
 */
export default class TAppView {
    //implements AppViewInstance
    htmlEl; // Allow htmlEl to be null initially
    ctrl;
    sourceHTML;
    name;
    constructor(aName, aCtrl) {
        this.ctrl = aCtrl;
        this.sourceHTML = ''; // Initialize sourceHTML to an empty string
        this.htmlEl = null;
        this.name = aName;
        this.ctrl.registerItem(this);
    }
    setHTMLEl(innerHTML, opts) {
        const el = document.createElement('div');
        el.dom = el.attachShadow({ mode: 'open' });
        this.sourceHTML = innerHTML ?? '';
        el.dom.innerHTML = innerHTML ?? '';
        properties(el, opts); // properties function handles opts being undefined internally
        shorts(el); // shorts function does not depend on opts
        this.htmlEl = el;
        return el;
    }
    ;
    triggerChangeView(aRequestedView, aMessage) {
        const eventInfo = {
            loginData: this.ctrl.loginData,
            requestedView: aRequestedView,
            message: aMessage ?? ''
        };
        const e = new CustomEvent('change_view', { detail: eventInfo });
        this.ctrl.dispatchEvent(e); // Dispatch the event on the controller
    }
    async refresh() {
        //virtual -- to be overridden by descendant classes
    }
}
//# sourceMappingURL=appview.js.map