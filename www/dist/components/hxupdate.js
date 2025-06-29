// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts
import TAppView from './appview.js';
import { createCategorySection, createHeading, createCheckboxList, createDetailsBox, createQuestionGroup, addToggleVisibilityListener, sendDataToServerAPI, serverDataToFormContainer, gatherDataFromContainerForServer, } from './questcommon.js';
/**
 * Represents the HxUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class THxUpdateAppView extends TAppView {
    autosaveTimer = null;
    // --- NEW: Properties for managing the dynamic "Done" button ---
    doneButton = null;
    doneButtonMainText = null;
    doneButtonSubText = null;
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
            <form class='container hxupdate-container'>
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
        this.renderWhySee(container); // 1. "Why are you seeing the doctor today?"
        this.renderNewHx(container); // 2. "Since your last visit..."
        // this.renderRos(container);   // REMOVED: ROS is now in rosupdate.ts
        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();
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
        }
        catch (e) {
            console.warn("Could not prepopulate hxupdate form from server data.", e);
        }
        // If no data, set the initial state of the done button after the form is rendered
        this.updateDoneButtonState();
    }
    /** Renders the "Why are you seeing the doctor today?" section. */
    renderWhySee(parent) {
        const section = createCategorySection(parent);
        section.classList.add('trackable-question');
        section.appendChild(createHeading(2, "Why are you seeing the doctor today?"));
        const list = ["Physical", "Recheck", "Sick", "New Problem"];
        section.appendChild(createCheckboxList("visit_reason", list));
        section.appendChild(createDetailsBox("visit_reason", "Other:"));
    }
    /** Renders the "New History" section. */
    renderNewHx(parent) {
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
        /*
        this.createRosSection(
            section,
            "testing",
            "Have you had any recent medical tests elsewhere?",
            testOptions
        );
        */
    }
    // --- DOM Creation Helper Methods ---
    /*
    private createCategorySection = createCategorySection;
    private createHeading = createHeading;
    private createCheckboxList = createCheckboxList;
    private createDetailsBox = createDetailsBox;

    private createRosSection = (parent: HTMLElement, prefix: string, text: string, list: string[]): void => {
        const section = this.createCategorySection(parent);
        // NEW: Add tracking class for each ROS section
        section.classList.add('trackable-question');
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
    }

    private addMutualExclusionListeners = (noneCheckbox: HTMLInputElement, optionsContainer: HTMLElement): void => {
        // This listener ensures that if any regular option is checked, the "NONE" option is automatically unchecked.
        optionsContainer.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;

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
    }

    private addToggleVisibilityListener = (checkbox: HTMLInputElement): void => {
        if (!this.htmlEl) return; // Guard against null element
        const shadowRoot = this.htmlEl.dom;

        const toggleVisibility = (isChecked: boolean) => {
            const targetIdsString = checkbox.dataset.hideTargetIds;
            if (!targetIdsString) return;
            const targetIds = targetIdsString.split(',');
            targetIds.forEach(id => {
                const targetElement : HTMLElement | null = shadowRoot.getElementById(id.trim());
                if (targetElement) {
                    targetElement.classList.toggle('hidden', isChecked);
                    if (isChecked) {
                        targetElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => cb.checked = false);
                        const textarea = targetElement.querySelector('textarea');
                        if (textarea) textarea.value = '';
                    }
                }
            });
        };
        checkbox.addEventListener('change', () => toggleVisibility(checkbox.checked));
        toggleVisibility(checkbox.checked); // Initial check
    }
    */
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
        // NEW: Add listeners to update the done button state on any user interaction
        form.addEventListener('change', this.updateDoneButtonState);
        form.addEventListener('input', this.updateDoneButtonState);
        // 'Done' button listener
        this.doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    };
    /**
     * NEW: Updates the state, color, and text of the "Done" button based on form completion.
     */
    updateDoneButtonState = () => {
        if (!this.htmlEl || !this.doneButton || !this.doneButtonMainText || !this.doneButtonSubText)
            return;
        const form = this.htmlEl.dom.querySelector('form.hxupdate-container');
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
        if (unansweredCount === 0) {
            this.doneButtonMainText.textContent = 'Done';
            this.doneButtonSubText.textContent = '';
            this.doneButtonSubText.style.display = 'none';
            this.doneButton.classList.add('done-button-complete');
            this.doneButton.classList.remove('done-button-incomplete');
        }
        else {
            this.doneButtonMainText.textContent = 'Return';
            this.doneButtonSubText.textContent = `(declining to answer ${unansweredCount} questions)`;
            this.doneButtonSubText.style.display = 'block';
            this.doneButton.classList.add('done-button-incomplete');
            this.doneButton.classList.remove('done-button-complete');
        }
    };
    /**
     * Resets the 10-second autosave timer. If the timer fires, it saves the form data.
     */
    resetAutosaveTimer = () => {
        // If a timer is already running, do nothing.
        // The current timer will fire after its 30 seconds, and then a new one can be set on next change.
        if (this.autosaveTimer !== null) {
            return;
        }
        this.autosaveTimer = window.setTimeout(async () => {
            console.log("Autosaving form data...");
            const data = this.gatherDataForServer();
            await this.sendDataToServer(data);
            this.autosaveTimer = null; // Clear the timer so a new one can be set on next change
        }, 10000); // 10 seconds
    };
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
        await this.sendDataToServer(data);
        console.log("Navigating to dashboard.");
        this.triggerChangeView("dashboard");
    };
    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    gatherDataForServer = () => {
        return gatherDataFromContainerForServer(this, 'form.rosupdate-container');
        /*
        if (!this.htmlEl) return {};
        const form = this.htmlEl.dom.querySelector<HTMLFormElement>('form.hxupdate-container');
        if (!form) {
            console.error("Form not found for data extraction.");
            return {};
        }
        const formData = new FormData(form);
        const data: Record<string, string | boolean> = {};
        for (const [key, value] of formData.entries()) {
          if (value === 'on') {
            data[key] = true; // Convert checkbox 'on' to boolean true
          } else if (value) { // Only include textareas/inputs if they have a value
            data[key] = value as string;
          }
        }
        console.log("Compiled form data:", data);
        return data;
        */
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    serverDataToForm = (data) => {
        serverDataToFormContainer(this, 'form.hxupdate-container', data);
        /*
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.hxupdate-container');
        if (!form) return;
        // 1. Get all relevant input elements (checkboxes and textareas)
        let allInputs : NodeListOf<HTMLInputElement | HTMLTextAreaElement>
        allInputs= form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="checkbox"], textarea');
        // 2. First, reset all inputs to their default state (unchecked/empty)
        allInputs.forEach(element => {
            if (element.type === 'checkbox') {
                (element as HTMLInputElement).checked = false;
            } else if (element.tagName === 'TEXTAREA') {
                (element as HTMLTextAreaElement).value = '';
            }
        });
        // 3. Then, apply the data received from the server
        for (const key in data) { // Iterate only over keys present in 'data'
            const element = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`);
            if (element) { // Ensure the element exists in the form
                if (element.type === 'checkbox') {
                  (element as HTMLInputElement).checked = data[key] === true;
                } else if (element.tagName === 'TEXTAREA') {
                  (element as HTMLTextAreaElement).value = data[key] as string;
                }
            }
        }
        // 4. Finally, trigger change events for all relevant checkboxes to ensure UI consistency.
        // This is crucial because setting 'checked' programmatically does not fire 'change' events,
        // and our visibility/mutual exclusion logic relies on these events.
        // Start with 'none' toggles to handle section visibility and clearing.
        form.querySelectorAll<HTMLInputElement>('.none-toggle-checkbox').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        // Then, trigger for any other checkboxes that are now checked, to ensure mutual exclusion
        // (e.g., if a regular option was checked, it should uncheck 'NONE' if it was still checked).
        form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not(.none-toggle-checkbox):checked').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
        */
        // Update the done button state after loading the data
        this.updateDoneButtonState();
    };
    /**
     * Sends the collected form data to the server via a POST request.
     * @param data The JSON object to send.
     */
    sendDataToServer = async (data) => {
        return sendDataToServerAPI(this, '/api/hxupdate', data);
        /*
          const sessionID = this.ctrl.loginData?.sessionID;
          if (!sessionID) {
              console.error("No session ID found. Cannot save form data.");
              // Optionally, alert the user or attempt to re-authenticate.
              return;
          }
  
          try {
              const response = await fetch('/api/hxupdate', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  // Send both sessionID and the form data in the body
                  body: JSON.stringify({ sessionID, formData: data })
              });
  
              if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Error saving form data:', errorData.message || response.statusText);
              } else {
                  console.log("Form data successfully autosaved.");
              }
          } catch (error) {
              console.error('Network error while saving form data:', error);
          }
        */
    };
    // Example of an instance method
    about() {
        console.log("Hx Update Component instance");
    }
    ;
    async refresh() {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }
}
//# sourceMappingURL=hxupdate.js.map