// /opt/worldvista/EHR/web/previsit/www/components/rosupdate.ts
import TAppView from './appview.js';
import { createCategorySection, createHeading, createCheckboxList, createDetailsBox, addToggleVisibilityListener, serverDataToFormContainer } from './questcommon.js';
/**
 * Represents the RosUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class TRosUpdateAppView extends TAppView {
    // --- NEW: Properties for managing the dynamic "Done" button ---
    doneButton = null;
    doneButtonMainText = null;
    doneButtonSubText = null;
    constructor(aCtrl, opts) {
        super('rosupdate', '/api/rosupdate', aCtrl);
        { //temp scope for tempInnerHTML
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
        `; //end of innerHTML
            this.setHTMLEl(tempInnerHTML);
        } //end of scope
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    /**
     * Builds the entire ROS  update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    async loadForms() {
        this.setHTMLEl(this.sourceHTML); //restore initial html
        // NEW: Cache the done button elements for quick access
        this.doneButton = this.htmlEl.dom.querySelector('.done-button');
        this.doneButtonMainText = this.htmlEl.dom.querySelector('.done-button-main-text');
        this.doneButtonSubText = this.htmlEl.dom.querySelector('.done-button-sub-text');
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector('.patient-name');
        if (patientNameEl) {
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
        }
        const container = this.htmlEl.$formscontainer;
        if (!container) {
            console.error("Forms container not found!");
            return;
        }
        container.innerHTML = ''; // Clear any previous content.
        this.renderRos(container); // "Review of Systems"
        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();
        await this.prePopulateFromServer(); //evokes call to serverDataToForm()
        // If no data, set the initial state of the done button after the form is rendered
        this.updateDoneButtonState();
    }
    /** Renders the "Review of Systems" section. */
    renderRos(parent) {
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
    createRosSection(parent, prefix, text, list) {
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
        // Create the "NONE" checkbox and add it to the new container
        const noneLabel = document.createElement('label');
        noneLabel.className = 'none-option-label'; // Reusing class from createQuestionGroup
        const noneInput = document.createElement('input');
        noneInput.type = 'checkbox';
        noneInput.name = `${prefix}_none`;
        noneInput.className = 'sr-only none-toggle-checkbox'; // Important for red styling
        const checkboxListId = `${prefix}_checkbox_list`;
        const detailsBoxId = `${prefix}_details_box`;
        noneInput.dataset.hideTargetIds = `${checkboxListId},${detailsBoxId}`;
        const noneSpan = document.createElement('span');
        noneSpan.className = 'custom-checkbox-text none-checkbox-text'; // Important for red styling
        noneSpan.textContent = 'NONE';
        noneLabel.append(noneInput, noneSpan);
        buttonContainer.appendChild(noneLabel);
        // Create the list of other options and add it to the container
        const checkboxList = createCheckboxList(prefix, list);
        checkboxList.id = checkboxListId;
        // This makes the <li> elements inside the <ul> behave as direct children of the flex container
        checkboxList.style.display = 'contents';
        buttonContainer.appendChild(checkboxList);
        const detailsBox = createDetailsBox(prefix, "Other:");
        detailsBox.id = detailsBoxId; // Assign the unique ID
        section.appendChild(detailsBox);
        // Attach the toggle listener to the NONE checkbox
        addToggleVisibilityListener(this, noneInput);
        // Attach listener for mutual exclusion
        this.addMutualExclusionListeners(noneInput, checkboxList);
        return section; // Return the created section for further use if needed
    }
    addMutualExclusionListeners = (noneCheckbox, optionsContainer) => {
        // This listener ensures that if any regular option is checked, the "NONE" option is automatically unchecked.
        optionsContainer.addEventListener('change', (event) => {
            const target = event.target;
            // We only care about checkbox changes inside the container, and only when they are being checked.
            if (target.type === 'checkbox' && target.checked) {
                // If "NONE" is currently checked, uncheck it.
                if (noneCheckbox.checked) {
                    noneCheckbox.checked = false;
                    // Programmatically changing 'checked' does not fire a 'change' event.
                    // We need to dispatch it manually to trigger the logic in `addToggleVisibilityListener`
                    // which is responsible for showing the other elements.
                    const changeEvent = new Event('change', { bubbles: true });
                    noneCheckbox.dispatchEvent(changeEvent);
                }
            }
        });
    };
    // --- Data, Submission, and Autosave Logic ---
    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    setupFormEventListeners = () => {
        if (!this.htmlEl)
            return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form)
            return;
        // Autosave on any change or input
        const resetTimer = () => this.resetAutosaveTimer();
        form.addEventListener('change', resetTimer);
        form.addEventListener('input', resetTimer); // 'input' is better for textareas
        // NEW: Add listeners to update the done button state on any user interaction
        form.addEventListener('change', this.updateDoneButtonState);
        form.addEventListener('input', this.updateDoneButtonState);
        // 'Done' button listener
        const doneButton = this.htmlEl.dom.querySelector('.done-button');
        doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    };
    /**
     * Updates the state of progress
     */
    updateProgressState = () => {
        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;
        if (!this.htmlEl)
            return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form)
            return;
        const questions = form.querySelectorAll('.trackable-question');
        const totalQuestions = questions.length;
        let answeredCount = 0;
        questions.forEach(qSection => {
            // A section is considered "answered" if any of these conditions are met:
            // 1. A "none" checkbox is checked.
            const isNoneChecked = !!qSection.querySelector('input.none-toggle-checkbox:checked');
            // 2. Any other checkbox is checked.
            const isOtherCheckboxChecked = !!qSection.querySelector('input[type="checkbox"]:not(.none-toggle-checkbox):checked');
            // 3. Any textarea has a non-empty value.
            let isTextareaAnswered = false;
            qSection.querySelectorAll('textarea').forEach(ta => {
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
    };
    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    gatherDataForServer = () => {
        return this.gatherDataFromContainerForServer();
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    serverDataToForm = (data) => {
        serverDataToFormContainer(this, 'form.content-container', data);
        this.updateDoneButtonState();
    };
    async refresh() {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }
}
//# sourceMappingURL=rosupdate.js.map