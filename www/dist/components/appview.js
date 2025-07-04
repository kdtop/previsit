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
    progressData = {
        totalItems: 0, // Total number of items to be reviewed
        answeredItems: 0, // Number of items that have been answered completely
        unansweredItems: 0, // Number of items that have not been answered completely
        progressPercentage: 0 // Percentage of items completed (0-100)
    }; // Initialize progressData to an empty object
    autosaveTimer = null;
    apiURL = '/invalid'; // Default API URL, will be set in the constructor
    constructor(aName, apiURL, aCtrl) {
        this.ctrl = aCtrl;
        this.sourceHTML = ''; // Initialize sourceHTML to an empty string
        this.htmlEl = null;
        this.name = aName;
        this.ctrl.registerItem(this);
        this.apiURL = apiURL; // Set the API URL for this view
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
    updateProgressState = () => {
        //NOTE: This is a virtual method, to be overridden by descendant classes
        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;
    };
    gatherDataForServer = () => {
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'gatherDataForServer' must be implemented by subclasses.");
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    serverDataToForm = (data) => {
        // NOTE: This is a virtual method, to be overridden by descendant classes
    };
    /**
     * Resets the 10-second autosave timer. If the timer fires, it saves the form data.
     */
    resetAutosaveTimer = () => {
        // If a timer is already running, do nothing.
        // The current timer will fire after its 30 seconds, and then a new one can be started.
        if (this.autosaveTimer !== null) {
            return;
        }
        this.autosaveTimer = window.setTimeout(async () => {
            console.log("Autosaving form data...");
            const data = this.gatherDataForServer();
            await this.sendDataToServer(data, this.progressData);
            this.autosaveTimer = null; // Clear the timer so a new one can be set on next change
        }, 10000); // 10 seconds
    };
    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    gatherDataFromContainerForServer() {
        if (!this.htmlEl)
            return {};
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) {
            console.error("Form not found for data extraction.");
            return {};
        }
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            if (value === 'on') {
                data[key] = true; // Convert checkbox 'on' to boolean true
            }
            else if (value) { // Only include textareas/inputs if they have a value
                data[key] = value;
            }
        }
        console.log("Compiled form data:", data);
        return data;
    }
    /**
     * Sends the collected form data to the server via a POST request.
     * @param data The JSON object to send.
     */
    async sendDataToServer(data, progress) {
        const sessionID = this.ctrl.loginData?.sessionID;
        if (!sessionID) {
            console.error("No session ID found. Cannot save form data.");
            // Optionally, alert the user or attempt to re-authenticate.
            return;
        }
        try {
            const response = await fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send both sessionID and the form data in the body
                body: JSON.stringify({ sessionID,
                    formData: data,
                    progress: progress
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving form data:', errorData.message || response.statusText);
            }
            else {
                console.log("Form data successfully autosaved.");
            }
        }
        catch (error) {
            console.error('Network error while saving form data:', error);
        }
    }
    updateDoneButtonState() {
        this.updateProgressState(); //updates this.progressData
        const unansweredCount = this.progressData.unansweredItems || 0;
        const totalQuestions = this.progressData.totalItems || 0;
        if (!this.htmlEl)
            return;
        let doneButton = this.htmlEl.dom.querySelector('.done-button');
        let doneButtonMainText = this.htmlEl.dom.querySelector('.done-button-main-text');
        let doneButtonSubText = this.htmlEl.dom.querySelector('.done-button-sub-text');
        if (!doneButton || !doneButtonMainText || !doneButtonSubText)
            return;
        // If no items, change text
        if (totalQuestions === 0) {
            doneButtonMainText.textContent = 'No Items to Review';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            //doneButton.disabled = true;
            doneButton.classList.remove('done-button-complete');
            doneButton.classList.add('done-button-incomplete'); // Visually indicate it's not "done" in the active sense
        }
        else if (unansweredCount === 0) {
            doneButtonMainText.textContent = 'Done';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            doneButton.classList.add('done-button-complete');
            doneButton.classList.remove('done-button-incomplete');
        }
        else {
            doneButtonMainText.textContent = 'Return';
            doneButtonSubText.textContent = `(declining to answer ${unansweredCount} items)`;
            doneButtonSubText.style.display = 'block';
            doneButton.classList.add('done-button-incomplete');
            doneButton.classList.remove('done-button-complete');
        }
    }
    /**
     * Handles the 'Done' button click. It performs a final save and navigates away.
     */
    handleDoneClick = async () => {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
            this.autosaveTimer = null;
        }
        console.log("Finalizing and saving form data...");
        const data = this.gatherDataForServer();
        await this.sendDataToServer(data, this.progressData);
        console.log("Navigating to dashboard.");
        this.triggerChangeView("dashboard");
    };
}
//# sourceMappingURL=appview.js.map