// /opt/worldvista/EHR/web/previsit/www/utility/el.ts

/*
Created by Adam Mitchel
Modified and Converted to TypeScript by K. Toppenberg 6/22/25
*/

import { TCtrl } from '../utility/controller.js';
import { ChangeViewEventDetail, ProgressData, KeyToStrBoolValueObj,
         EnhancedHTMLDivElement, AppViewOptions
       } from '../utility/types.js';
import { addShortcuts, properties, debounce } from '../utility/client_utils.js';


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
    public needPrepopulateWithEachShow : boolean = false;

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

                :host {
                  --medium: 0.8em;
                  --smaller: 0.6em;
                  --tiny: 0.4em;

                  --okGreen:             #28a745;
                  --darkerGreen:         #228b22;
                  --niceBlue:            #3498db;
                  --darkerNiceBlue:      #2980b9;
                  --darkerBlue:          #0505aa;
                  --grayBlue:            #2c3e50;
                  --redish:              #e74c3c;
                  --red:                 #b70505;
                  --darkerRed:           #790e0e;
                  --incompleteRed:       #ffe0e0;
                  --incompleteRedDarker: #f0c0c0;
                  --darkGray:            #333333;
                  --lighterDarkGray:     #7c7c7cff;
                  --shadowColor:         rgba(0,0,0,0.2);
                  --gray:                #9d9d9d;
                  --lightGray:           #e2e2e2;
                  --lightLightGray:      #f0f0f0;
                  --whiteColor:          #fcfcfcff;
                  --lightYellow:         #ffe16e;

                  --windowRxBackground:  linen;
                  --genericRxColor:      var(--niceBlue);
                  --brandRxColor:        var(--darkerNiceBlue);
                  --strengthRxColor:     var(--darkerRed);
                  --unitsRxColor:        var(--darkGray);
                  --formRxColor:         var(--darkerRed);
                  --sigRxColor:          var(--gray);
                  --noteRxColor:         var(--darkerBlue);
                  --otcRxColor:          var(--red);
                  --prefaceRxColor:      var(--darkerBlue);
                  --unparsedRxColor:     var(--whiteColor);
                }

                /* General Body and Font Styles */
                body {
                    font-family:        Arial, sans-serif;
                    margin:             20px;
                    line-height:        1.6;
                    background-color:   var(--whiteColor);
                    color:              var(--grayBlue);
                }

                /* General Heading Styles */
                h1 {
                    color:          var(--grayBlue);
                    text-align:     center;
                    margin-bottom:  30px;
                    display:         flex;
                    flex-direction: column;
                }
                h2 {
                    color:          var(--grayBlue);
                    text-align:     center;
                    border-bottom:  2px solid var(--niceBlue);
                    padding-bottom: 5px;
                    margin-top:     30px;
                    margin-bottom:  15px;
                }
                h3 {
                    color:          var(--grayBlue);
                    margin-top:     10px;
                    border-bottom:  1px solid var(--lightGray);
                    padding-bottom: 5px;
                }

                h4 {
                    color:          var(--lighterDarkGray);
                    margin-top:     20px;
                }

                p, .shaded-text {
                    background:     var(--lightGray);
                    padding:        10px;
                    border-radius:  5px;
                }

                patient-name-area {
                  font-size:        0.8em;
                }

                .shaded-text {
                    margin-bottom:  10px;
                }

                ul {
                  list-style:       none;
                  padding:          0;
                  margin-bottom:    20px;
                  display:          flex;
                  flex-wrap:        wrap;
                  gap:              10px;
                }

                li {
                  margin-bottom:    0;
                }

                label {
                    display:        block;
                    margin-top:     10px;
                    font-weight:    bold;
                }

                input[type="text"],
                input[type="date"],
                textarea {
                    padding:        8px;
                    margin-top:     5px;
                    border:         1px solid var(--gray);
                    border-radius:  4px;
                    box-sizing:     border-box; /* Ensure padding/border don't add to total width */
                    font-size:      1em; /* Standardize font size */
                }

                textarea {
                    width:          100%; /* Make textarea full width by default */
                    min-height:     50px; /* A reasonable default height */
                    resize:         vertical; /* Allow vertical resizing */
                }


                /* General Table Styles */
                table {
                    width:          100%;
                    border-collapse: collapse;
                    margin-top:     10px;
                    margin-bottom:  10px; /* Added for general table spacing */
                }
                table, th, td {
                    border:         1px solid var(--gray);
                }
                th, td {
                    padding:        8px;
                    text-align:     left;
                }

                /* General Horizontal Rule */
                hr {
                    margin:         30px 0;
                    border:         0;
                    border-top:     1px solid var(--lightGray);
                }

                svg.icon  {
                    /* Adjust SVG size as needed */
                    width: 32px;
                    height: 32px;
                    margin-right: 10px; /* Space between icon and text */
                    vertical-align: middle;
                }

                .submission-controls {
                    text-align:     center;
                    margin-top:     10px;
                    padding-bottom: 50vh;
                }

                .done-button {
                    width:          100%;
                    padding:        12px 25px;
                    font-size:      1.1em;
                    color:          var(--whiteColor);
                    border:         none;
                    border-radius:  5px;
                    cursor:         pointer;
                    transition:     background-color 0.3s ease;
                    display:        flex;
                    flex-direction: row;
                    align-items:    center;
                    justify-content: center;
                    line-height:    1.4;
                }

                .done-button-text {
                    display:        flex;
                    flex-direction: column; /* stack main and sub text vertically */
                }

                .done-button-sub-text {
                    font-size: 0.8em;
                    opacity: 0.9;
                }

                .done-button-incomplete {
                    background-color: var(--redish);
                }
                .done-button.done-button-incomplete:hover:not(:disabled) {
                    background-color: var(--red);
                }

                .done-button-complete {
                    background-color: var(--okGreen);
                }

                .done-button.done-button-complete:hover:not(:disabled) {
                    background-color: var(--darkerGreen);
                }

                .done-button-icon-area {
                  margin-right: 10px;
                }

                .done-button-icon {
                    display: none;   /*default is to be hidden, overridden below */
                    width:32px;
                    height:32px;
                }

                .done-button.done-button-complete .complete-icon {
                    display: inline;
                }
                .done-button.done-button-incomplete .incomplete-icon {
                    display: inline;
                }

                .hidden {
                    display: none !important;
                }

                /* Responsive adjustments for all app views */
                @media (max-width: 768px) {
                    body {
                        margin: 15px; /* Smaller margins for smaller screens */
                    }
                }

            .navigation-area { /* Container for buttons and message */
                display:            flex;
                justify-content:    space-between;
                align-items:        center;
                padding:            0px 10px;
                width:              100%;
                z-index:            20;
            }

            .navigation-area button {
                padding:            10px 20px;
                font-size:          1em;
                background-color:   var(--niceBlue);
                color:              var(--whiteColor);
                border:             none;
                border-radius:      5px;
                cursor:             pointer;
                height:             7vw;
                transition:         background-color 0.5s ease;
                flex-shrink:        0; /* Prevent buttons from shrinking */
            }

            .navigation-area button:hover:not(:disabled) {
                background-color:   var(--darkerNiceBlue);
            }

            .navigation-area button:disabled {
                background-color:   var(--gray);
                cursor:             not-allowed;
            }

            .nav-button {
                height: 200px;
            }

            .prev-item-button {
                background-color:   var(--niceBlue);
                color:              var(--whiteColor);
            }

            .prev-item-button:hover:not(:disabled) {
                background-color:   var(--darkerNiceBlue);
            }

            .next-item-button.incomplete {
                background-color:   var(--incompleteRed);
                color:              var(--grayBlue);
            }

            .next-item-button.incomplete:hover:not(:disabled) {
                background-color:   var(--incompleteRedDarker);
            }

            .next-item-button.complete {
                background-color:   var(--okGreen);
                color:              var(--whiteColor);
            }

            .next-item-button.complete:hover:not(:disabled) {
                background-color:   var(--darkerGreen);
            }

            /* Responsive adjustments */
            @media(max-width: 850px) {
                .itemreview-container {
                    padding:                0 15px;
                }
                .item-card {
                    /* Width is now handled by max-width and parent's centering */
                }
                .navigation-area {
                    padding:                0 0; /* Remove horizontal padding here, parent handles it */
                    flex-direction:         column; /* Stack buttons and message vertically */
                    gap:                    15px; /* Space between stacked items */
                }
                .navigation-area button {
                    width:                  100%; /* Full width when stacked */
                }
                .item-progress-message {
                    order:                  -1; /* Move message to the top when stacked */
                    margin-top:             0px;
                    margin-bottom:          -15px;
                }
                .custom-checkbox-text {
                    padding:                6px 10px;
                    font-size:              0.95em;
                }
            }


            </style>
        `;
    }

    public getDoneIncompleteSVGIcon() : string
    //can be overridded by descendents
    {
        //red frowning face
        return `
            <?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
            <svg class="done-button-icon incomplete-icon" width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#b70505" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
            <path d="M31 18V19" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 18V19" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M31 30.9999C31 30.9999 29 26.9999 24 26.9999C19 26.9999 17 30.9999 17 30.9999" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
    }

    public getDoneCompleteSVGIcon() : string
    //can be overridded by descendents
    {
        //green happy face
        return `
            <?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
            <svg class="done-button-icon complete-icon" width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#28a745" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
            <path d="M31 18V19" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 18V19" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M31 31C31 31 29 35 24 35C19 35 17 31 17 31" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
    }

    public getTitleText() : string
    //Plan on overriding this for descendant classes.
    {
        return "Review Items Below";
    }

    public getHTMLHeader() : string {
        let result : string = `
        <div class="header-area">
            <h1>${this.getTitleText()}</h1>
            <patient-name-area>
              Patient: <span class="patient-name"></span>
            </patient-name-area>
        </div>
        `;
        return result;
    }

    public getHTMLMain() : string {
        let result : string = `
            <div class="main-content-area">
                <div class="item-display-area">
                </div>
            </div>
        `;
        return result;
    }

    public getHTMLFooter() : string {
        let result : string = `
                <div class="footer-area">
                    <div class="submission-controls">
                        <button type="button" class="done-button">
                            <!-- Icon on the left -->
                            <span class="done-button-icon-area">
                                ${this.getDoneIncompleteSVGIcon()}
                                ${this.getDoneCompleteSVGIcon()}
                            </span>
                            <!-- Text container -->
                            <span class="done-button-text">
                              <span class="done-button-main-text">Main Text</span>
                              <span class="done-button-sub-text">Sub Text</span>
                            </span>
                        </button>
                    </div>
                </div>
        `;
        return result;
    }


    public getHTMLStructure() : string
    //plan overriding this in descendent classs
    {
        let result : string = `
            <form class='itemreview-container'>
                ${this.getHTMLHeader()}
                ${this.getHTMLMain()}
                ${this.getHTMLFooter()}
            </form>
        `;
        return result;
    }

    public getHTMLTagContent() : string
    {
        let result = this.getHTMLStructure();
        return result;
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
        } else if (this.needPrepopulateWithEachShow) {
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

    private _updatePageState(): void
    {
        this.resetAutosaveTimer();
        this.updateProgressState();  //updates this.progressData
        this.updateDoneButtonState();
    }
    private debouncedUpdatePageState = debounce(this._updatePageState, 100);
    public updatePageState(): void
    {
        this.debouncedUpdatePageState();
    }

    public handleOnDoneButtonStateChange() {
        //virtual, can be implemented in descendant classes.
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
        this.handleOnDoneButtonStateChange();
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