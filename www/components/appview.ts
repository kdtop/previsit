// /opt/worldvista/EHR/web/previsit/www/utility/el.ts

/*
Created by Adam Mitchel
Modified and Converted to TypeScript by K. Toppenberg 6/22/25
*/

import { TCtrl } from '../utility/controller.js';
import { ChangeViewEventDetail, ProgressData, KeyToStrBoolValueObj } from '../utility/types.js';

// --- Type Definitions ---

/**
 * Options for the EL constructor and properties functions.
 * Supports `innerHTML` and other dynamic properties.
 */
export interface AppViewOptions extends Record<string, any> {
    innerHTML?: string;
}

/**
 * Represents an instance created by the EL utility.
 * This is the object returned by `new EL(...)`.
 * It contains an `html` property which is the actual `HTMLDivElement`
 * enhanced with an attached Shadow DOM and dynamic shortcut properties (e.g., `el.html.$loginform`).
 */
export type EnhancedHTMLElement = HTMLDivElement & {
    dom: ShadowRoot;
    [key: string]: any; // Index signature for dynamic shortcut properties like $loginform
};

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
export function properties(el: EnhancedHTMLElement, opts?: AppViewOptions): void {
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
export function shorts(el: EnhancedHTMLElement): void {
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
 * A helper function that creates a base `div` element.
 * In the original `el.js`, this was a function constructor that returned the `div`.
 * This is not used by the default `EL` export but is kept for API compatibility.
 * @returns A basic HTMLDivElement.
 */
export function HTML_ELEMENT(): HTMLDivElement {
    return document.createElement('div');
}

/**
 * Creates a DocumentFragment from an HTML string.
 * @param opts Can be a string of HTML or an options object with an `innerHTML` property.
 * @returns A DocumentFragment.
 */
export function Fragment(opts?: string | AppViewOptions): DocumentFragment {
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
export default class TAppView<TServerData = any> {
    //implements AppViewInstance
    public htmlEl: EnhancedHTMLElement | null; // Allow htmlEl to be null initially
    public ctrl: TCtrl;
    protected sourceHTML: string;
    public name: string;
    public progressData: ProgressData  = {
        totalItems: 0, // Total number of items to be reviewed
        answeredItems: 0, // Number of items that have been answered completely
        unansweredItems : 0, // Number of items that have not been answered completely
        progressPercentage: 0 // Percentage of items completed (0-100)
    }; // Initialize progressData to an empty object
    public autosaveTimer: number | null = null;
    apiURL: string = '/invalid'; // Default API URL, will be set in the constructor

    constructor(aName : string, apiURL : string, aCtrl:  TCtrl)
    {
        this.ctrl = aCtrl;
        this.sourceHTML = ''; // Initialize sourceHTML to an empty string
        this.htmlEl = null;
        this.name = aName;
        this.ctrl.registerItem(this);
        this.apiURL = apiURL; // Set the API URL for this view
    }

    protected setHTMLEl(innerHTML : string, opts?: AppViewOptions): EnhancedHTMLElement
    {
        const el: EnhancedHTMLElement = document.createElement('div') as EnhancedHTMLElement;
        el.dom = el.attachShadow({ mode: 'open' });
        this.sourceHTML = innerHTML ?? '';
        el.dom.innerHTML = innerHTML ?? '';
        properties(el, opts); // properties function handles opts being undefined internally
        shorts(el); // shorts function does not depend on opts

        this.htmlEl = el;
        return el;
    };

    protected triggerChangeView(aRequestedView : string, aMessage? : string)
    {
        const eventInfo : ChangeViewEventDetail = {
            loginData: this.ctrl.loginData,
            requestedView : aRequestedView,
            message: aMessage ?? ''
        };
        const e = new CustomEvent('change_view', { detail: eventInfo });
        this.ctrl.dispatchEvent(e); // Dispatch the event on the controller
    }


    public async refresh() : Promise<void> {
        //virtual -- to be overridden by descendant classes
    }

    public updateProgressState = (): void => {
        //NOTE: This is a virtual method, to be overridden by descendant classes
        //AND, this needs to be an arrow function to bind `this` correctly.
        //    Otherwise, `this` will not refer to the instance in the overridden method.

        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;
    }

    public async prePopulateFromServer(): Promise<void>
    {
        // NEW: Try to prepopulate form from server data
        try {
            const sessionID = this.ctrl.loginData?.sessionID;
            if (!sessionID) return;       // No session, so nothing to do.
            const URL = this.apiURL + `?sessionID=${encodeURIComponent(sessionID)}`;
            const resp = await fetch(URL);
            if (!resp.ok) {
                   // Log the failure to fetch data. The form will just not be prepopulated.
                   console.warn(`Failed to fetch prepopulation data: ${resp.status} ${resp.statusText}`);
                   return;
            }
            const result = await resp.json();
            if (result.success && result.data) {
                   let data: TServerData = result.data as TServerData;
                   this.serverDataToForm(data);
                   // The serverDataToForm method is expected to update the UI elements
            }
        } catch (e) {
            console.warn("Could not prepopulate form from server data.", e);
        }
    }

    public gatherDataForServer = (): TServerData => {
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'gatherDataForServer' must be implemented by subclasses.");
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: TServerData ): void => {
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'serverDataToForm' must be implemented by subclasses.");
    }

    /**
     * Resets the 10-second autosave timer. If the timer fires, it saves the form data.
     */
    public resetAutosaveTimer = (): void => {
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
    }

    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */

      public gatherDataFromContainerForServer(): KeyToStrBoolValueObj {
      if (!this.htmlEl) return {};
      const form : HTMLFormElement | null = this.htmlEl.dom.querySelector<HTMLFormElement>('form.content-container');
      if (!form) {
          console.error("Form not found for data extraction.");
          return {};
      }
      const formData = new FormData(form);
      const data: KeyToStrBoolValueObj = {};
      for (const [key, value] of formData.entries()) {
        if (value === 'on') {
          data[key] = true; // Convert checkbox 'on' to boolean true
        } else if (value) { // Only include textareas/inputs if they have a value
          data[key] = value as string;
        }
      }
      console.log("Compiled form data:", data);
      return data;
    }

    /**
     * Sends the collected form data to the server via a POST request.
     * @param data The JSON object to send.
     */
    public async sendDataToServer (data: TServerData, progress : ProgressData): Promise<void>
    {
        const sessionID = this.ctrl.loginData?.sessionID;
        if (!sessionID) {
            console.error("No session ID found. Cannot save form data.");
            // Optionally, alert the user or attempt to re-authenticate.
            return;
        }
        const URL = this.apiURL + `?sessionID=${encodeURIComponent(sessionID)}`;
        try {
            const info =  {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send both sessionID and the form data in the body
                body: JSON.stringify({ sessionID,
                                       data: data,
                                       progress: progress
                                     })
            };

            const response = await fetch(URL,info);  //<-- This is the POST request to the server
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving form data:', errorData.message || response.statusText);
            } else {
                console.log("Form data successfully autosaved.");
            }
        } catch (error) {
            console.error('Network error while saving form data:', error);
        }
    }


    public updateDoneButtonState = (): void => {
        this.updateProgressState();  //updates this.progressData

        const unansweredCount = this.progressData.unansweredItems || 0;
        const totalQuestions = this.progressData.totalItems || 0;

        if (!this.htmlEl ) return;
        let doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        let doneButtonMainText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-main-text');
        let doneButtonSubText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-sub-text');
        if (!doneButton || !doneButtonMainText || !doneButtonSubText) return;

        // If no items, change text
        if (totalQuestions === 0) {
            doneButtonMainText.textContent = 'No Items to Review';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            //doneButton.disabled = true;
            doneButton.classList.remove('done-button-complete');
            doneButton.classList.add('done-button-incomplete'); // Visually indicate it's not "done" in the active sense
        } else if (unansweredCount === 0) {
            doneButtonMainText.textContent = 'Done';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            doneButton.classList.add('done-button-complete');
            doneButton.classList.remove('done-button-incomplete');
        } else {
            doneButtonMainText.textContent = 'Return';
            doneButtonSubText.textContent = `(declining to answer ${unansweredCount} items)`;
            doneButtonSubText.style.display = 'block';
            doneButton.classList.add('done-button-incomplete');
            doneButton.classList.remove('done-button-complete');
        }
    };


    /**
     * Handles the 'Done' button click. It performs a final save and navigates away.
     */
    public handleDoneClick = async (): Promise<void> => {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
            this.autosaveTimer = null;
        }
        console.log("Finalizing and saving form data...");
        const data : TServerData = this.gatherDataForServer();
        await this.sendDataToServer(data, this.progressData);

        console.log("Navigating to dashboard.");
        this.triggerChangeView("dashboard");
    }


    public resetProgressState = (): void => {
        // Reset progress data to default
        this.progressData.answeredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.unansweredItems = 1;  //in case this is tested separately, 0 would look like completed.
        this.progressData.progressPercentage = 0;
    }

}