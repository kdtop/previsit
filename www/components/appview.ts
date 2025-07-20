// /opt/worldvista/EHR/web/previsit/www/utility/el.ts

/*
Created by Adam Mitchel
Modified and Converted to TypeScript by K. Toppenberg 6/22/25
*/

import { TCtrl } from '../utility/controller.js';
import { ChangeViewEventDetail, ProgressData, KeyToStrBoolValueObj,
         EnhancedHTMLDivElement, AppViewOptions
       } from '../utility/types.js';
import { addShortcuts, properties } from '../utility/client_utils.js';



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
    public htmlEl: EnhancedHTMLDivElement | null = null;
    public ctrl: TCtrl;
    //protected sourceHTML: string;  //data stored into this inside newEnhancedHTMDivElement
    public name: string;
    public progressData: ProgressData  = {
        totalItems: 0, // Total number of items to be reviewed
        answeredItems: 0, // Number of items that have been answered completely
        unansweredItems : 0, // Number of items that have not been answered completely
        progressPercentage: 0 // Percentage of items completed (0-100)
    }; // Initialize progressData to an empty object
    public autosaveTimer: number | null = null;
    public formAutoSaves : boolean = true;

    apiURL: string = '/invalid'; // Default API URL, will be set in the constructor

    constructor(viewName : string, apiURL : string, aCtrl:  TCtrl)
    {
        this.ctrl = aCtrl;
        this.htmlEl = null; //this.newEnhancedHTMDivElement(this.getInnerHTML());
        this.name = viewName;
        this.ctrl.registerItem(this);
        this.apiURL = apiURL; // Set the API URL for this view
    }

    public getInnerHTML() : string
    {
      let result : string = this.getCSSContent() + this.getHTMLTagContent();
      return result;
    }

    public getCSSContent() : string
    //Can put anything here that applies to all descendant classes.
    {
        //this is top level, so no super to call.
        return `
            <style>
                /* General Body and Font Styles */
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                    background-color: #ffffff;
                    color: #333; /* A more neutral default color */
                }

                /* General Heading Styles */
                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                }
                h2 {
                    color: #003366;
                    text-align: center;
                  border-bottom: 2px solid #3498db;
                  padding-bottom: 5px;
                  margin-top: 30px;
                  margin-bottom: 15px;
                }
                h3 {
                    color: #2c3e50;
                    margin-top: 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                h4 {
                    color: #555;
                    margin-top: 20px;
                }

                p, .shaded-text {
                    background: #f7f4f2;
                    padding: 10px;
                    border-radius: 5px;
                }

                .shaded-text {margin-bottom: 10px;}

                ul {
                  list-style: none;
                  padding: 0;
                  margin-bottom: 20px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 10px;
                }
                li {
                  margin-bottom: 0;
                }


                /* General Label and Input Styles */
                label {
                    display: block;
                    margin-top: 10px;
                    font-weight: bold;
                }

                input[type="text"],
                input[type="date"],
                textarea {
                    padding: 8px;
                    margin-top: 5px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box; /* Ensure padding/border don't add to total width */
                    font-size: 1em; /* Standardize font size */
                }

                textarea {
                    width: 100%; /* Make textarea full width by default */
                    min-height: 50px; /* A reasonable default height */
                    resize: vertical; /* Allow vertical resizing */
                }


                /* General Table Styles */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    margin-bottom: 10px; /* Added for general table spacing */
                }
                table, th, td {
                    border: 1px solid #ccc;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }

                /* General Horizontal Rule */
                hr {
                    margin: 30px 0;
                    border: 0;
                    border-top: 1px solid #eee;
                }

                .submission-controls {
                    text-align: center;
                    margin-top: 30px;
                    /* NEW: Add significant padding to the bottom to create scrollable whitespace */
                    padding-bottom: 50vh;
                }

                .done-button {
                    /* Make button full width */
                    width: 100%;
                    padding: 12px 25px;
                    font-size: 1.1em;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    /* Use flexbox to manage internal text lines */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    line-height: 1.4;
                }

                /* Class for the incomplete state (red) */
                .done-button-incomplete {
                    background-color: #e74c3c;
                }

                /* Class for the complete state (green) */
                .done-button-complete {
                    background-color: #28a745;
                }
                /* Utility Class for Hiding Elements */
                .hidden {
                    display: none !important;
                }

                /* Responsive adjustments for all app views */
                @media (max-width: 768px) {
                    body {
                        margin: 15px; /* Smaller margins for smaller screens */
                    }
                }
            </style>
        `;
    }

    public getHTMLTagContent() : string
    //This should be overridden by descendant classes
    {
       return '';
    }

    protected newEnhancedHTMDivElement(innerHTML : string, opts?: AppViewOptions): EnhancedHTMLDivElement
    {
        const el: EnhancedHTMLDivElement = document.createElement('div') as EnhancedHTMLDivElement;
        el.dom = el.attachShadow({ mode: 'open' });
        el.dom.innerHTML = innerHTML ?? '';
        properties(el, opts); // properties function handles opts being undefined internally
        addShortcuts(el); // shorts function does not depend on opts

        //this.htmlEl = el;
        return el;
    };

    public camelCase(s : string) : string {  //not a true camel case.  Just first letter capitalized.
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

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
        if (!this.htmlEl) {
            await this.loadForm();
            await this.prePopulateFromServer(); //evokes call to serverDataToForm()
        }
        this.updatePageState(); //Set the initial state of the form (and done button) after the form is rendered
    }

    public clearForm() {
        this.clearCachedDOMElements();
        this.htmlEl = null;
    }

    /**
     * Builds the entire Questionainnaire form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    public async loadForm(): Promise<void>
    //NOTE: each form may have its own loadForm that will be called first, and they will call here via super.loadForm
    {
        this.htmlEl = this.newEnhancedHTMDivElement(this.getInnerHTML());
        this.setupPatientNameDisplay()
        this.cacheDOMElements();
        this.setupFormEventListeners();
    }

    public setupPatientNameDisplay() {
        //NOTE: This is a virtual method, to be overridden by descendant classes
    }

    public cacheDOMElements() {
        //NOTE: This is a virtual method, to be overridden by descendant classes

    }

    public clearCachedDOMElements() {
        //NOTE: This is a virtual method, to be overridden by descendant classes

    }

    public setupFormEventListeners(): void {
        //NOTE: This is a virtual method, to be overridden by descendant classes
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
        if (this.autosaveTimer !== null) return;
        if (this.formAutoSaves === false) return;

        this.autosaveTimer = window.setTimeout(async () => {
            console.log("Autosaving form data...");
            const data : TServerData = this.gatherDataForServer();
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

    public updatePageState(): void
    {
        this.resetAutosaveTimer();
        this.updateProgressState();  //updates this.progressData
        this.updateDoneButtonState();
    }

    public updateDoneButtonState(): void
    {
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

    /**
     * Smoothly scrolls to a target HTML element on the page.
     * @param targetElement The HTML element to scroll into view.
     */
    scrollToElementSmoothly(targetElement: HTMLElement): void {
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth', // Makes the scroll animation smooth
          block: 'start',     // Aligns the top of the element with the top of the scroll area
          inline: 'nearest'   // Aligns the element within the horizontal scroll area if needed
        });
      } else {
        console.warn("Target element not found for smooth scrolling.");
      }
    }

}