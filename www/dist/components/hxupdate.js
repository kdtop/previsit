// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts
//
// HxUpdateAppView
//     > has space for expand.. to scroll (for addresseses)
//     > but can have independantly scrolling windows
//     	(if display size big enough)
//
//import AppView, { AppViewInstance, EnhancedHTMLElement } from '../utility/appview.js';
import TAppView from './appview.js';
/**
 * Represents the HxUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class THxUpdateAppView extends TAppView {
    autosaveTimer = null;
    constructor(aCtrl, opts) {
        super('hxupdate', aCtrl);
        { //temp scope for tempInnerHTML
            const tempInnerHTML = `
            <style>
            .hxupdate-container {
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
            <form class='container hxupdate-container'>
                <h1>Update Your Medical History</h1>
                <p><b>Patient:</b> <span class="patient-name"></span></p>
                <div class="instructions">
                    <p>Please review and answer the questions below. This will help us prepare for your visit.</p>
                </div>
                <div class="forms-container"></div>
                <div class="submission-controls" style="text-align: center; margin-top: 30px;">
                    <button type="button" class="done-button" style="padding: 12px 25px; font-size: 1.1em; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Done</button>
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
     * Builds the entire history update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    async loadForms() {
        this.setHTMLEl(this.sourceHTML); //restore initial html
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
        this.renderWhySee(container); // 1. "Why are you seeing the doctor today?"
        this.renderNewHx(container); // 2. "Since your last visit..."
        this.renderRos(container); // 3. "Review of Systems"
        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();
    }
    /** Renders the "Why are you seeing the doctor today?" section. */
    renderWhySee(parent) {
        const section = this.createCategorySection(parent);
        section.appendChild(this.createHeading(2, "Why are you seeing the doctor today?"));
        const list = ["Physical", "Recheck", "Sick", "New Problem"];
        section.appendChild(this.createCheckboxList("visit_reason", list));
        section.appendChild(this.createDetailsBox("visit_reason", "Other:"));
    }
    /** Renders the "New History" section. */
    renderNewHx(parent) {
        const section = this.createCategorySection(parent);
        section.appendChild(this.createHeading(2, "Since your last visit, have you had any of the following?"));
        this.createQuestionGroup(section, "hx_change_new_prob", "New medical problems?");
        this.createQuestionGroup(section, "hx_change_other_provider", "Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?");
        this.createQuestionGroup(section, "hx_change_surgery", "Had any new surgeries?");
        this.createQuestionGroup(section, "hx_change_social", "Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?");
        this.createQuestionGroup(section, "hx_change_family", "Any family members with new diseases (e.g. heart attack, diabetes, cancer etc)?");
        this.createQuestionGroup(section, "hx_change_tests", "Have you had any recent medical tests elsewhere?");
        const testingListContainer = document.createElement('div');
        testingListContainer.id = 'testing_list_container';
        const testList = ["blood work", "mammogram", "xrays", "MRI", "CT scan", "colon or stomach scope", "ultrasound", "echocardiogram", "cardiac stress test", "Holter monitor", "ECG", "bone density"];
        testingListContainer.appendChild(this.createCheckboxList("testing", testList));
        testingListContainer.appendChild(this.createDetailsBox("testing", "Details about tests:"));
        section.appendChild(testingListContainer);
    }
    /** Renders the "Review of Systems" section. */
    renderRos(parent) {
        parent.appendChild(this.createHeading(1, "Review of Systems"));
        const rosData = [
            { section: "constitutional", list: "Chills^Fatigue^Fever^Weight gain^Weight loss" },
            { section: "heent", text: "HEAD, EARS, EYES, THROAT", list: "Hearing loss^Sinus pressure^Visual changes" },
            { section: "respiratory", list: "Cough^Shortness of breath^Wheezing" },
            { section: "cardiovascular", list: "Chest pain^Pain while walking^Edema^Palpitations" },
            { section: "gastrointestinal", list: "Abdominal pain^Blood in stool^Constipation^Diarrhea^Heartburn^Loss of appetite^Nausea^Vomiting" },
            { section: "genitourinary", list: "Painful urination (Dysuria)^Excessive amount of urine (Polyuria)^Urinary frequency" },
            { section: "metabolic", text: "METABOLIC/ENDOCRINE", list: "Cold intolerance^Heat intolerance^Excessive thirst (Polydipsia)^Excessive hunger (Polyphagia)" },
            { section: "neurological", list: "Dizziness^Extremity numbness^Extremity weakness^Headaches^Seizures^Tremors" },
            { section: "psychiatric", list: "Anxiety^Depression" },
            { section: "musculoskeletal", list: "Back pain^Joint pain^Joint swelling^Neck pain" },
            { section: "hematologic", list: "Easily bleeds^Easily bruises^Lymphedema^Issues with blood clots" },
            { section: "immunologic", list: "Food allergies^Seasonal allergies" },
        ];
        rosData.forEach(data => {
            const text = data.text || data.section.charAt(0).toUpperCase() + data.section.slice(1);
            this.createRosSection(parent, data.section, text, data.list.split('^'));
        });
    }
    // --- DOM Creation Helper Methods ---
    createCategorySection = (parent) => {
        const div = document.createElement('div');
        div.className = 'category-section';
        parent.appendChild(div);
        return div;
    };
    createHeading = (level, text) => {
        const h = document.createElement(`h${level}`);
        h.textContent = text;
        return h;
    };
    createCheckboxList = (prefix, items) => {
        const ul = document.createElement('ul');
        items.forEach(item => {
            const li = document.createElement('li');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `${prefix}_${item.toLowerCase().replace(/ /g, '_')}`;
            input.className = 'sr-only';
            const span = document.createElement('span');
            span.className = 'custom-checkbox-text';
            span.textContent = item;
            label.append(input, span);
            li.appendChild(label);
            ul.appendChild(li);
        });
        return ul;
    };
    createDetailsBox = (prefix, labelText) => {
        const div = document.createElement('div');
        div.className = 'details-input-group';
        const name = `${prefix}_details`;
        const label = document.createElement('label');
        label.htmlFor = name;
        label.textContent = labelText;
        const textarea = document.createElement('textarea');
        textarea.id = name;
        textarea.name = name;
        textarea.placeholder = 'Enter details (optional)...';
        div.append(label, textarea);
        return div;
    };
    createRosSection = (parent, prefix, text, list) => {
        const section = this.createCategorySection(parent);
        section.appendChild(this.createHeading(2, text));
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
        const checkboxList = this.createCheckboxList(prefix, list);
        checkboxList.id = checkboxListId;
        // This makes the <li> elements inside the <ul> behave as direct children of the flex container
        checkboxList.style.display = 'contents';
        buttonContainer.appendChild(checkboxList);
        const detailsBox = this.createDetailsBox(prefix, "Other:");
        detailsBox.id = detailsBoxId; // Assign the unique ID
        section.appendChild(detailsBox);
        // Attach the toggle listener to the NONE checkbox
        this.addToggleVisibilityListener(noneInput);
        // Attach listener for mutual exclusion
        this.addMutualExclusionListeners(noneInput, checkboxList);
    };
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
    createQuestionGroup = (parent, prefix, text) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'question-group';
        const mainLabel = document.createElement('label');
        mainLabel.className = 'main-question-label';
        mainLabel.textContent = text;
        const optionsRow = document.createElement('div');
        optionsRow.className = 'details-options-row';
        const noneLabel = document.createElement('label');
        noneLabel.className = 'none-option-label';
        const noneInput = document.createElement('input');
        noneInput.type = 'checkbox';
        noneInput.name = `${prefix}_none`;
        noneInput.className = 'sr-only none-toggle-checkbox';
        const detailsLabelId = `${prefix}_details_label`;
        const textareaContainerId = `${prefix}_textarea_container`;
        noneInput.dataset.hideTargetIds = `${detailsLabelId},${textareaContainerId}`;
        const noneSpan = document.createElement('span');
        noneSpan.className = 'custom-checkbox-text none-checkbox-text';
        noneSpan.textContent = 'NONE';
        noneLabel.append(noneInput, noneSpan);
        const detailsLabel = document.createElement('span');
        detailsLabel.className = 'details-label';
        detailsLabel.id = detailsLabelId;
        detailsLabel.textContent = 'Details:';
        optionsRow.append(noneLabel, detailsLabel);
        const textareaContainer = document.createElement('div');
        textareaContainer.className = 'details-textarea-container';
        textareaContainer.id = textareaContainerId;
        const textarea = document.createElement('textarea');
        textarea.id = prefix;
        textarea.name = prefix;
        textarea.placeholder = 'Enter details here (optional)...';
        textareaContainer.appendChild(textarea);
        groupDiv.append(mainLabel, optionsRow, textareaContainer);
        parent.appendChild(groupDiv);
        this.addToggleVisibilityListener(noneInput);
    };
    addToggleVisibilityListener = (checkbox) => {
        if (!this.htmlEl)
            return; // Guard against null element
        const shadowRoot = this.htmlEl.dom;
        const toggleVisibility = (isChecked) => {
            const targetIdsString = checkbox.dataset.hideTargetIds;
            if (!targetIdsString)
                return;
            const targetIds = targetIdsString.split(',');
            targetIds.forEach(id => {
                const targetElement = shadowRoot.getElementById(id.trim());
                if (targetElement) {
                    targetElement.classList.toggle('hidden', isChecked);
                    if (isChecked) {
                        targetElement.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                        const textarea = targetElement.querySelector('textarea');
                        if (textarea)
                            textarea.value = '';
                    }
                }
            });
        };
        checkbox.addEventListener('change', () => toggleVisibility(checkbox.checked));
        toggleVisibility(checkbox.checked); // Initial check
    };
    // --- Data, Submission, and Autosave Logic ---
    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    setupFormEventListeners = () => {
        if (!this.htmlEl)
            return;
        const form = this.htmlEl.dom.querySelector('form.hxupdate-container');
        if (!form)
            return;
        // Autosave on any change or input
        const resetTimer = () => this.resetAutosaveTimer();
        form.addEventListener('change', resetTimer);
        form.addEventListener('input', resetTimer); // 'input' is better for textareas
        // 'Done' button listener
        const doneButton = this.htmlEl.dom.querySelector('.done-button');
        doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    };
    /**
     * Resets the 30-second autosave timer. If the timer fires, it saves the form data.
     */
    resetAutosaveTimer = () => {
        // If a timer is already running, do nothing.
        // The current timer will fire after its 30 seconds, and then a new one can be started.
        if (this.autosaveTimer !== null) {
            return;
        }
        this.autosaveTimer = window.setTimeout(() => {
            console.log("Autosaving form data...");
            this.dataToServer();
            // Future: await this.sendDataToServer(data);
            this.autosaveTimer = null; // Clear the timer so a new one can be set on next change
        }, 30000); // 30 seconds
    };
    /**
     * Handles the 'Done' button click. It performs a final save and navigates away.
     */
    handleDoneClick = () => {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
            this.autosaveTimer = null;
        }
        console.log("Finalizing and saving form data...");
        this.dataToServer();
        // Future: await this.sendDataToServer(data);
        console.log("Navigating to dashboard.");
        this.triggerChangeView("dashboard");
    };
    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    dataToServer = () => {
        if (!this.htmlEl)
            return {};
        const form = this.htmlEl.dom.querySelector('form.hxupdate-container');
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
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    serverDataToForm = (data) => {
        if (!this.htmlEl)
            return;
        const form = this.htmlEl.dom.querySelector('form.hxupdate-container');
        if (!form)
            return;
        // 1. Get all relevant input elements (checkboxes and textareas)
        const allInputs = form.querySelectorAll('input[type="checkbox"], textarea');
        // 2. First, reset all inputs to their default state (unchecked/empty)
        allInputs.forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            }
            else if (element.tagName === 'TEXTAREA') {
                element.value = '';
            }
        });
        // 3. Then, apply the data received from the server
        for (const key in data) { // Iterate only over keys present in 'data'
            const element = form.querySelector(`[name="${key}"]`);
            if (element) { // Ensure the element exists in the form
                if (element.type === 'checkbox') {
                    element.checked = data[key] === true;
                }
                else if (element.tagName === 'TEXTAREA') {
                    element.value = data[key];
                }
            }
        }
        // 4. Finally, trigger change events for all relevant checkboxes to ensure UI consistency.
        // This is crucial because setting 'checked' programmatically does not fire 'change' events,
        // and our visibility/mutual exclusion logic relies on these events.
        // Start with 'none' toggles to handle section visibility and clearing.
        form.querySelectorAll('.none-toggle-checkbox').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        // Then, trigger for any other checkboxes that are now checked, to ensure mutual exclusion
        // (e.g., if a regular option was checked, it should uncheck 'NONE' if it was still checked).
        form.querySelectorAll('input[type="checkbox"]:not(.none-toggle-checkbox):checked').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    };
    // Example of an instance method
    about() {
        console.log("Dashboard Component instance");
    }
    ;
    async refresh() {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }
}
//# sourceMappingURL=hxupdate.js.map