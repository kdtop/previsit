// /opt/worldvista/EHR/web/previsit/www/components/rosupdate.ts

import TAppView, { EnhancedHTMLElement } from './appview.js';
import { createCategorySection, createHeading,
         // createCheckboxList, // No longer directly used for individual checkboxes
         createDetailsBox,
         // addToggleVisibilityListener, // REMOVED: No longer used directly with ToggleButton
         serverDataToFormContainer
        } from './questcommon.js';
import { KeyToStrBoolValueObj } from '../utility/types.js';
import { TCtrl } from '../utility/controller.js';
import { ToggleButton, ToggleButtonOptions } from './components.js'; // Import the ToggleButton component

interface RosUpdateOptions {
    someOption : any;
}

export type RosUpdateHTMLElement = EnhancedHTMLElement & {
    // Extend the base EnhancedHTMLElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Represents the RosUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class TRosUpdateAppView extends TAppView<KeyToStrBoolValueObj> {
    //NOTE: The generic type <KeyToStrBoolValueObj> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: RosUpdateHTMLElement; // Use 'declare' to override the type of the inherited property

    // --- NEW: Properties for managing the dynamic "Done" button ---
    private doneButton: HTMLButtonElement | null = null;
    private doneButtonMainText: HTMLSpanElement | null = null;
    private doneButtonSubText: HTMLSpanElement | null = null;

    constructor(aCtrl:  TCtrl,  opts?: RosUpdateOptions) {
        super('rosupdate', '/api/rosupdate', aCtrl);
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

            /* Specific style for 'NONE' checkbox when checked */
            /* This can still apply if toggle-button exposes a way to apply this class or if we target toggle-button[name$='_none'][checked] */
            toggle-button[name$='_none'][checked] {
              --toggle-button-background-checked: #e74c3c; /* Custom property for NONE button's checked state */
            }


            /* Styles for general labels (like for custom checkboxes) - Can be removed if not used for other elements directly */
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
              /*
              .custom-checkbox-text {
                padding: 6px 10px;
                font-size: 0.95em;
              }
              */
              .details-options-row {
                flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
                align-items: flex-start;
                gap: 5px;
              }
            }
            </style>
            <form class='container content-container'>
                <h1>Tell Us About Your Symptoms</h1>
                <p><b>Patient:</b> <span class="patient-name"></span></p>
                <div class="instructions">
                    <p>Please tell us if you have NEW problems in parts of your body. This will help us prepare for your visit.</p>
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
     * Builds the entire ROS  update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    private async loadForms(): Promise<void>
    {
        this.setHTMLEl(this.sourceHTML);  //restore initial html

        // NEW: Cache the done button elements for quick access
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
        this.renderRos(container);   // "Review of Systems"

        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();

        await this.prePopulateFromServer(); //evokes call to serverDataToForm()

        // If no data, set the initial state of the done button after the form is rendered
        this.updateDoneButtonState();

    }

    /** Renders the "Review of Systems" section. */
    private renderRos(parent: HTMLElement): void {
        parent.appendChild(createHeading(1, "Review of Systems"));

        const rosData = [
            { section: "constitutional", list: "Fever^Chills^Unusual weight gain^Unusual weight loss" },
            { section: "eye", list: "Blindness^Blurred vision^Double vision^Any eye problems" },
            { section: "entm", text: "Ears, Nose, Throat, Mouth", list: "Difficulty hearing^Ear problems^Nose problems^Throat problems^Mouth problems" },
            { section: "cardiovascular", list: "Chest pain^Ankle swelling^Strokes^Leg cramps" },
            { section: "respiratory", list: "Shortness of breath^Wheezing^Inability to lay flat" },
            { section: "gastrointestinal", list: "Blood from bowels^Bad indigestion^Abdominal Pain" },
            { section: "genitourinary", list: "Urine Pain^Urine leakage^Female problems^Sexual problems" },
            { section: "musculoskeletal", list: "Joint or muscle pain^Arthritis^Sprains^Ligament injury" },
            { section: "skin", text: "Skin or breast", list: "Worrisome skin lesions^Lumps in breast^Skin problems" },
            { section: "neurologic", list: "Numbness^Tingling^Confusion^Seizures^Chronic pain" },
            { section: "psychiatric", list: "Anxiety^Depression^Obsessions" },
            { section: "endocrine", list: "Problems with thyroid^Diabetes" },
            { section: "hematologic", text: "Hematologic/Lymphatic", list: "Bleeding^Blood problems^Worrisome lymph nodes" },
            { section: "immunologic", text: "Allergic/Immunologic", list: "Allergies^Immunity problems^Medication reactions" },
            { section: "fall", text: "Fall Risk", list: "2 or more falls in the past year^Any fall with injury in past year" }

        ];

        rosData.forEach(data => {
            const text = data.text || data.section.charAt(0).toUpperCase() + data.section.slice(1);
            const section = this.createRosSection(parent, data.section, text, data.list.split('^'));
            section.classList.add('trackable-question');
        });
    }

    private createRosSection(parent: HTMLElement, prefix: string, text: string, list: string[]): HTMLDivElement
    {
        const section = createCategorySection(parent);
        section.appendChild(createHeading(2, text));

        // Create a flex container to hold all buttons in a single row
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.marginBottom = '20px'; // Maintain spacing from the details box
        section.appendChild(buttonContainer);

        // Create the "NONE" ToggleButton and add it to the new container
        //const noneToggleButton = document.createElement('toggle-button') as ToggleButton;
        let toggleButtonOpts : ToggleButtonOptions = {
          label : 'NONE',
          colors : { checked : { backgroundColor : '#e74c3c' }},
          name: `${prefix}_none`
        }
        const noneToggleButton = new ToggleButton(toggleButtonOpts);

        //noneToggleButton.setAttribute('name', `${prefix}_none`);
        // We can still add a class for custom styling if needed, though toggle-button handles most of it
        noneToggleButton.classList.add('none-option-label'); // Keep for consistency if questcommon relies on it

        const checkboxListId = `${prefix}_checkbox_list`;
        const detailsBoxId = `${prefix}_details_box`;
        // Pass the target IDs to the toggle-button so its internal checkbox can control visibility
        noneToggleButton.dataset.hideTargetIds = `${checkboxListId},${detailsBoxId}`;

        buttonContainer.appendChild(noneToggleButton);

        // Create the list of other options using ToggleButton components
        const optionsListContainer = document.createElement('ul'); // Keep <ul> for semantic grouping
        optionsListContainer.id = checkboxListId;
        optionsListContainer.style.display = 'contents'; // To make <li> elements behave as flex items of buttonContainer
        buttonContainer.appendChild(optionsListContainer);

        list.forEach(item => {
            const li = document.createElement('li');
            //const toggleButton = document.createElement('toggle-button') as ToggleButton;
            const toggleButton = new ToggleButton(
              { label : item,
                name: `${prefix}_${item.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
              }
            );

            //toggleButton.setAttribute('label', item);
            //toggleButton.setAttribute('name', `${prefix}_${item.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`);
            li.appendChild(toggleButton);
            optionsListContainer.appendChild(li);
        });

        const detailsBox = createDetailsBox(prefix, "Other:");
        detailsBox.id = detailsBoxId; // Assign the unique ID
        section.appendChild(detailsBox);

        // --- Attach the toggle listener directly to the NONE toggle button
        noneToggleButton.addEventListener('change', (event: Event) => {
            const customEvent = event as CustomEvent;
            const isChecked = customEvent.detail.checked;
            const targetIds = noneToggleButton.dataset.hideTargetIds;

            if (targetIds) {
                targetIds.split(',').forEach(id => {
                    const targetEl = section.querySelector(`#${id}`); // Search within the current section
                    if (targetEl) {
                        // Toggle visibility
                        targetEl.classList.toggle('hidden', isChecked);

                        // If "NONE" is checked (meaning other sections are hidden),
                        // uncheck any checkboxes and clear any textareas within those hidden sections.
                        if (isChecked) {
                            targetEl.querySelectorAll<ToggleButton>('toggle-button').forEach(btn => btn.checked = false);
                            const textarea = targetEl.querySelector('textarea');
                            if (textarea) textarea.value = '';
                        }
                    }
                });
            }
        });

        // Attach listener for mutual exclusion
        this.addMutualExclusionListeners(noneToggleButton, optionsListContainer);

        return section; // Return the created section for further use if needed
    }

    // MODIFIED: addMutualExclusionListeners to accept ToggleButton
    private addMutualExclusionListeners = (noneToggleButton: ToggleButton, optionsContainer: HTMLElement): void => {
        // This listener ensures that if any regular option is checked, the "NONE" option is automatically unchecked.
        optionsContainer.addEventListener('change', (event) => {
            // The change event from ToggleButton is a CustomEvent with detail.checked
            const target = event.target as ToggleButton;

            // We only care about toggle-button changes inside the container, and only when they are being checked.
            if (target.tagName === 'TOGGLE-BUTTON' && target.checked) {
                // If "NONE" is currently checked, uncheck it.
                if (noneToggleButton.checked) {
                    noneToggleButton.checked = false; // Use the setter directly
                    // Dispatch a change event for the noneToggleButton to trigger visibility logic
                    noneToggleButton.dispatchEvent(new CustomEvent('change', { detail: { checked: false }, bubbles: true, composed: true }));
                }
            }
        });
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
        // Listen for 'change' events from toggle-buttons (CustomEvent) and standard inputs/textareas
        form.addEventListener('change', resetTimer);
        form.addEventListener('input', resetTimer); // 'input' is better for textareas

        // NEW: Add listeners to update the done button state on any user interaction
        form.addEventListener('change', this.updateDoneButtonState);
        form.addEventListener('input', this.updateDoneButtonState);

        // 'Done' button listener
        const doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    }

    /**
     * Updates the state of progress
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
            // 1. A "none" ToggleButton is checked.
            const isNoneChecked = !!qSection.querySelector<ToggleButton>('toggle-button[name$="_none"][checked]');
            // 2. Any other ToggleButton is checked.
            const isOtherCheckboxChecked = !!qSection.querySelector<ToggleButton>('toggle-button:not([name$="_none"])[checked]');
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
      // Need to override gatherDataFromContainerForServer from AppView
      // because form.elements (used by FormData) does not include custom elements' internal inputs.
      if (!this.htmlEl) return {};
      const form : HTMLFormElement | null = this.htmlEl.dom.querySelector<HTMLFormElement>('form.content-container');
      if (!form) {
          console.error("Form not found for data extraction.");
          return {};
      }
      const data: KeyToStrBoolValueObj = {};

      // Gather data from toggle-button components
      form.querySelectorAll<ToggleButton>('toggle-button').forEach(button => {
          // The name attribute on the toggle-button component corresponds to the input name
          const name = button.getAttribute('name');
          if (name) {
              data[name] = button.checked ? true : false;
          }
      });

      // Gather data from textareas
      form.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textarea => {
          const name = textarea.getAttribute('name');
          if (name && textarea.value.trim() !== '') {
              data[name] = textarea.value.trim();
          }
      });

      console.log("Compiled form data:", data);
      return data;
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: KeyToStrBoolValueObj): void => {
        // This function needs to be aware of the custom elements.
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                // Check if it's a toggle-button
                const toggleButton = form.querySelector<ToggleButton>(`toggle-button[name="${key}"]`);
                if (toggleButton) {
                    toggleButton.checked = (value === true || value === 'true');
                    // Manually dispatch change event to ensure visibility listeners are triggered
                    toggleButton.dispatchEvent(new CustomEvent('change', { detail: { checked: toggleButton.checked }, bubbles: true, composed: true }));
                    continue;
                }

                // Check if it's a textarea
                const textarea = form.querySelector<HTMLTextAreaElement>(`textarea[name="${key}"]`);
                if (textarea) {
                    textarea.value = value as string;
                    continue;
                }
            }
        }
        this.updateDoneButtonState();
    }

    public async refresh() : Promise<void> {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }

}