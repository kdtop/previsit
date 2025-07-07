// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts

import TAppView, { EnhancedHTMLElement } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { createCategorySection, createHeading,
         createCheckboxList, createDetailsBox,
         createQuestionGroup, addToggleVisibilityListener,
         serverDataToFormContainer,
       } from './questcommon.js';
import { KeyToStrBoolValueObj } from '../utility/types.js';

interface HxUpdateOptions {
    someOption : any;
}

export type HxUpdateHTMLElement = EnhancedHTMLElement & {
    // Extend the base EnhancedHTMLElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Represents the HxUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class THxUpdateAppView extends TAppView<KeyToStrBoolValueObj> {
    //NOTE: The generic type <KeyToStrBoolValueObj> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: HxUpdateHTMLElement; // Use 'declare' to override the type of the inherited property

    // --- NEW: Properties for managing the dynamic "Done" button ---
    private doneButton: HTMLButtonElement | null = null;
    private doneButtonMainText: HTMLSpanElement | null = null;
    private doneButtonSubText: HTMLSpanElement | null = null;

    constructor(aCtrl:  TCtrl,  opts?: HxUpdateOptions) {
        super('hxupdate', '/api/hxupdate', aCtrl);
        {  //temp scope for tempInnerHTML
        const tempInnerHTML = `
            <style>
            .content-container {
              line-height: 1.6;
              padding: 0 100px;
              background-color: #ffffff;
              color:rgb(43, 42, 42);
            }

            h1 {
              text-align: center;
              color: #2c3e50;
              margin-bottom: 30px;
            }

            h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
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

            /* --- Custom Checkbox Styling --- */
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            }

            .custom-checkbox-text {
              display: inline-block;
              padding: 7px 12px;
              border-radius: 12px;
              background-color: #f0f0f0;
              color: #555;
              transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
              cursor: pointer;
              user-select: none;
            }
            label:hover .custom-checkbox-text {
              background-color: #e2e2e2;
            }

            input[type='checkbox']:checked + .custom-checkbox-text {
              background-color: #3498db; /* Default checked color (blue) */
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            /* Specific style for 'NONE' checkbox when checked */
            input.none-toggle-checkbox:checked + .none-checkbox-text {
              background-color: #e74c3c; /* Reddish color for NONE when checked */
              color: white;
            }

            /* Styles for general labels (like for custom checkboxes) */
            label {
              display: flex;
              align-items: center;
              width: fit-content;
            }

            /* --- Details Textarea Styling (General) --- */
            .details-input-group {
              /* This general style applies to sections where NONE is not used this way */
              margin-top: 15px;
              margin-bottom: 25px;
            }

            .details-input-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
              color: #444;
            }

            .details-input-group textarea {
              width: 100%;
              min-height: 50px;
              padding: 8px 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 1em;
              box-sizing: border-box;
              resize: none;
            }

            /* --- NEW: Specific Styling for 'Since your last visit' section --- */
            .question-group {
              margin-bottom: 25px; /* Space between each question group */
              padding-bottom: 25px;
              border-bottom: solid 2px #ececec;
            }

            .main-question-label { /* Style for the main question label */
              display: block; /* Ensures it's on its own line */
              margin-bottom: 10px; /* Space below the main question */
              font-weight: bold; /* Make the main question prominent */
              font-size: large;
              color: #333;
            }

            .details-options-row {
              display: flex; /* Use flexbox to align 'NONE' and 'Details:' side-by-side */
              align-items: center; /* Vertically align items */
              gap: 15px; /* Space between 'NONE' and 'Details:' */
              margin-bottom: 10px; /* Space above textarea */
            }

            .details-label { /* Style for the 'Details:' label in this specific context */
              font-weight: bold;
              color: #444;
              white-space: nowrap; /* Prevent 'Details:' from wrapping */
            }

            .details-textarea-container {
              margin-top: 5px; /* Space below the details/none row */
            }

            .details-textarea-container textarea {
              width: 100%;
              min-height: 30px;
              padding: 8px 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 1em;
              box-sizing: border-box;
              resize: none;
            }

            /* --- MODIFIED: Done Button and Submission Area --- */
            .submission-controls {
                text-align: center;
                margin-top: 30px;
                /* NEW: Add significant padding to the bottom to create scrollable whitespace */
                padding-bottom: 50vh;
            }

            .done-button {
                /* NEW: Make button full width */
                width: 100%;
                padding: 12px 25px;
                font-size: 1.1em;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                /* NEW: Use flexbox to manage internal text lines */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                line-height: 1.4;
            }

            /* NEW: Class for the incomplete state (red) */
            .done-button-incomplete {
                background-color: #e74c3c;
            }

            /* NEW: Class for the complete state (green) */
            .done-button-complete {
                background-color: #28a745;
            }

            /* Class to hide elements with JavaScript */
            .hidden {
              display: none !important; /* Use !important to ensure it overrides other display properties */
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
              body {
                margin: 15px;
              }
              ul {
                gap: 8px;
              }
              .custom-checkbox-text {
                padding: 6px 10px;
                font-size: 0.95em;
              }
              .details-options-row {
                flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
                align-items: flex-start;
                gap: 5px;
              }
            }
            </style>
            <form class='container content-container'>
                <h1>Update Your Medical History</h1>
                <p><b>Patient:</b> <span class="patient-name"></span></p>
                <div class="instructions">
                    <p>Please review and answer the questions below. This will help us prepare for your visit.</p>
                </div>
                <div class="forms-container"></div>
                <div class="submission-controls">
                    <button type="button" class="done-button">
                        <span class="done-button-main-text"></span>
                        <span class="done-button-sub-text" style="font-size: 0.8em; opacity: 0.9;"></span>
                    </button>
                </div>
            </form>
        `;  //end of innerHTML

        this.setHTMLEl(tempInnerHTML);
        }  //end of scope
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    /**
     * Builds the entire history update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    private async loadForms(): Promise<void>
    {
        this.setHTMLEl(this.sourceHTML);  //restore initial html

        this.doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        this.doneButtonMainText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-main-text');
        this.doneButtonSubText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-sub-text');

        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector<HTMLSpanElement>('.patient-name');
        if (patientNameEl) {
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
        }

        const container = this.htmlEl.$formscontainer;
        if (!container) {
            console.error("Forms container not found!");
            return;
        }
        container.innerHTML = ''; // Clear any previous content.

        this.renderWhySee(container);  // 1. "Why are you seeing the doctor today?"
        this.renderNewHx(container);   // 2. "Since your last visit..."

        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();

        await this.prePopulateFromServer(); //evokes call to serverDataToForm()
        /*
        // NEW: Try to prepopulate form from server data
        try {
            const sessionID = this.ctrl.loginData?.sessionID;
            if (sessionID) {
                const resp = await fetch(`/api/hxupdate?sessionID=${encodeURIComponent(sessionID)}`);
                if (resp.ok) {
                    const result = await resp.json();
                    if (result.success && result.data && Object.keys(result.data).length > 0) {
                        this.serverDataToForm(result.data);
                        return; // Done button state will be updated in serverDataToForm
                    }
                }
            }
        } catch (e) {
            console.warn("Could not prepopulate hxupdate form from server data.", e);
        }
        */
        // If no data, set the initial state of the done button after the form is rendered
        this.updateDoneButtonState();
    }

    /** Renders the "Why are you seeing the doctor today?" section. */
    private renderWhySee(parent: HTMLElement): void {
        const section = createCategorySection(parent);
        section.classList.add('trackable-question');
        section.appendChild(createHeading(2, "Why are you seeing the doctor today?"));
        const list = ["Physical", "Recheck", "Sick", "New Problem"];
        section.appendChild(createCheckboxList("visit_reason", list));
        section.appendChild(createDetailsBox("visit_reason", "Other:"));
    }

    /** Renders the "New History" section. */
    private renderNewHx(parent: HTMLElement): void {
        const section = createCategorySection(parent);
        section.appendChild(createHeading(2, "Since your last visit, have you had any of the following?"));

        createQuestionGroup(this, section, "hx_change_new_prob", "New medical problems?", addToggleVisibilityListener);
        createQuestionGroup(this, section, "hx_change_other_provider", "Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?", addToggleVisibilityListener);
        createQuestionGroup(this, section, "hx_change_surgery", "Had any new surgeries?", addToggleVisibilityListener);
        createQuestionGroup(this, section, "hx_change_social", "Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?", addToggleVisibilityListener);
        createQuestionGroup(this, section, "hx_change_family", "Any family members with new diseases (e.g. heart attack, diabetes, cancer etc)?", addToggleVisibilityListener);

        // --- COMBINED: Medical tests question with options and details, like ROS ---
        const testOptions = [
            "blood work", "mammogram", "xrays", "MRI", "CT scan", "colon or stomach scope", "ultrasound", "echocardiogram", "cardiac stress test", "Holter monitor", "ECG", "bone density"
        ];
    }

    // --- Data, Submission, and Autosave Logic ---

    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    private setupFormEventListeners = (): void => {
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Autosave on any change or input
        const resetTimer = () => this.resetAutosaveTimer();
        form.addEventListener('change', resetTimer);
        form.addEventListener('input', resetTimer); // 'input' is better for textareas

        // NEW: Add listeners to update the done button state on any user interaction
        form.addEventListener('change', this.updateDoneButtonState);
        form.addEventListener('input', this.updateDoneButtonState);

        // 'Done' button listener
        this.doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    }

    /**
     * NEW: Updates the state of progress
     */
    public updateProgressState = (): void => {

        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;

        if (!this.htmlEl) return;

        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        const questions = form.querySelectorAll<HTMLElement>('.trackable-question');
        const totalQuestions = questions.length;
        let answeredCount = 0;

        questions.forEach(qSection => {
            // A section is considered "answered" if any of these conditions are met:
            // 1. A "none" checkbox is checked.
            const isNoneChecked = !!qSection.querySelector<HTMLInputElement>('input.none-toggle-checkbox:checked');
            // 2. Any other checkbox is checked.
            const isOtherCheckboxChecked = !!qSection.querySelector<HTMLInputElement>('input[type="checkbox"]:not(.none-toggle-checkbox):checked');
            // 3. Any textarea has a non-empty value.
            let isTextareaAnswered = false;
            qSection.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(ta => {
                if (ta.value.trim() !== '') {
                    isTextareaAnswered = true;
                }
            });

            if (isNoneChecked || isOtherCheckboxChecked || isTextareaAnswered) {
                answeredCount++;
            }
        });

        const unansweredCount = totalQuestions - answeredCount;

        // Update progress data
        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = unansweredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }


    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    public gatherDataForServer = (): KeyToStrBoolValueObj => {
      return this.gatherDataFromContainerForServer();
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: KeyToStrBoolValueObj): void => {
      serverDataToFormContainer(this, 'form.content-container', data)

      // Update the done button state after loading the data
      this.updateDoneButtonState();
    }

    public async refresh() : Promise<void> {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }

}