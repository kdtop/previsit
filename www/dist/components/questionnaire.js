// /opt/worldvista/EHR/web/previsit/www/components/questionnaire.ts
import TAppView from './appview.js';
import { ToggleButton } from './components.js';
/**
 * Represents the generic Questionnaire component as a class, responsible for building and managing the questions on form.
 */
export default class TQuestionnaireAppView extends TAppView {
    resultingTotalScore = 0;
    scoring = false;
    loadingServerData = false; // Flag to indicate if data is currently being loaded into form
    constructor(aName, apiURL = '/api/questionnaireUpdate', aCtrl, opts) {
        super(aName, apiURL, aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getCSSContent() {
        let result = super.getCSSContent() +
            `
            <style>
                .content-container {
                  line-height: 1.6;
                  padding: 0 100px;
                  background-color: #ffffff;
                  color:rgb(43, 42, 42);
                }

                xh2 {
                  color: #2c3e50;
                  border-bottom: 2px solid #3498db;
                  padding-bottom: 5px;
                  margin-top: 30px;
                  margin-bottom: 15px;
                }
                xul {
                  list-style: none;
                  padding: 0;
                  margin-bottom: 20px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 10px;
                }
                xli {
                  margin-bottom: 0;
                }

                .numeric-input {
                    height: 30px;
                    width: 150px;
                    border-radius: 12px; /* Adjust the value to control the roundness */
                    text-align: center;
                }

                .numeric-input-has-value {
                    background-color: #3498db;
                }

                /* Specific style for 'NONE' checkbox when checked */
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

                .button-container {
                    display : flex;
                    flex-wrap : wrap;
                    gap : 10px;
                    align-items : center;
                    margin-bottom : 20px; /* Maintain spacing from the details box */
                }

                .free-text-input {
                  width: 100%;
                  padding: 8px 10px;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  font-size: 1em;
                  box-sizing: border-box;
                  margin-top: 10px; /* For spacing */
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                  ul {
                    gap: 8px;
                  }
                  .details-options-row {
                    flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
                    align-items: flex-start;
                    gap: 5px;
                  }
                }
            </style>
        `;
        return result;
    }
    getHTMLTagContent() {
        let result = `
            <form class='container content-container'>
                <h1>Tell Us About Your Symptoms</h1>
                <p><b>Patient:</b> <span class="patient-name"></span></p>
                <div class="instructions">
                    <p>Please answer the following questions. This will help us prepare for your visit.</p>
                </div>
                <div class="forms-container"></div>
                <div class="closing-instructions"></div>
                <div class="result-container"></div>
                <div class="submission-controls">
                    <button type="button" class="done-button">
                        <span class="done-button-main-text"></span>
                        <span class="done-button-sub-text" style="font-size: 0.8em; opacity: 0.9;"></span>
                    </button>
                </div>
            </form>
        `;
        return result;
    }
    setupPatientNameDisplay() {
        //NOTE: This is a virtual method, to be overridden by descendant classes
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector('.patient-name');
        if (patientNameEl)
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
    }
    /**
     * Builds the entire Questionainnaire form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    async loadForm() {
        super.loadForm();
        const container = this.htmlEl.$formscontainer;
        if (!container) {
            console.error("Forms container not found!");
            return;
        }
        container.innerHTML = ''; // Clear any previous content.
        await this.renderContent(container);
        this.setupFormEventListeners(); //call again after renderContent()
    }
    async renderContent(parent) {
        let formData = this.getQuestionnaireData();
        this.scoring = false; //default
        await this.renderQuestionnaire(parent, formData);
    }
    getQuestionnaireData() {
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'getQuestionnaireData' must be implemented by subclasses.");
    }
    async renderQuestionnaire(parent, aQuestionnaire) {
        /* TQuestionnaireData {
                instructionsText: string;
                questGroups : TQuestionGroup[];
                endingText?: string;
            }
        */
        //insert instructionText into DOM
        let instructionsDiv = null;
        let closingInstructionsDiv = null;
        if (aQuestionnaire.instructionsText) {
            instructionsDiv = this.htmlEl.dom.querySelector('.instructions');
            if (instructionsDiv)
                instructionsDiv.innerHTML = '<p>' + aQuestionnaire.instructionsText + '</p>';
        }
        if (aQuestionnaire.endingText) {
            closingInstructionsDiv = this.htmlEl.dom.querySelector('.closing-instructions');
            if (closingInstructionsDiv)
                closingInstructionsDiv.innerHTML = '<p>' + aQuestionnaire.endingText + '</p>';
        }
        aQuestionnaire.questGroups.forEach((aQuestGroup) => {
            this.renderAQuestionGroup(parent, aQuestGroup);
        });
    }
    renderAQuestionGroup(parent, aQuestGroup) {
        /* TQuestionGroup {
              groupHeadingText?: string;
              question: TQuestion[];
            }                                */
        if (!aQuestGroup)
            return;
        parent.appendChild(this.createHeading(1, aQuestGroup.groupHeadingText));
        aQuestGroup.question.forEach((aQuestion) => {
            const section = this.createAQuestionSection(parent, aQuestion);
        });
    }
    createAQuestionSection(parent, aQuestion) {
        const questionText = aQuestion.questionText || this.camelCase(aQuestion.dataNamespace);
        let namespace = aQuestion.dataNamespace;
        let replyType = aQuestion.replyType;
        let replyList = aQuestion.replies;
        let scoreMode = aQuestion.scoreMode ?? "none";
        let score0Index = (scoreMode.toLowerCase() === "0indexed");
        let score1Index = (scoreMode.toLowerCase() === "1indexed");
        let scoreCustom = (scoreMode.toLowerCase() === "custom");
        let repliesCustomScore = aQuestion.repliesCustomScore;
        if (scoreCustom && !repliesCustomScore)
            scoreCustom = false;
        this.scoring = this.scoring || (score0Index || score1Index || scoreCustom);
        const section = this.createCategorySection(parent);
        section.appendChild(this.createHeading(2, questionText));
        // Create a flex container to hold all buttons in a single row
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // flex container to hold all buttons in a single row
        section.appendChild(buttonContainer);
        const checkboxListId = `${namespace}_checkbox_list`;
        const detailsBoxId = `${namespace}_details_box`;
        let hasNoneButton = ((replyType === "noneOrButtons") || (replyType === "noneOrRadioButtons"));
        let noneToggleButton = undefined; // Initialize here
        if (hasNoneButton) {
            // Create the "NONE" ToggleButton and add it to the new container
            let toggleButtonOpts = {
                label: aQuestion.noneButtonLabel ?? 'NONE',
                state: { checked: { backgroundColor: '#e74c3c' } },
                name: `${namespace}_none`
            };
            noneToggleButton = new ToggleButton(toggleButtonOpts);
            noneToggleButton.classList.add('none-option-label');
            // Pass the target IDs to the toggle-button so its internal checkbox can control visibility
            noneToggleButton.dataset.hideTargetIds = `${checkboxListId},${detailsBoxId}`;
            if (this.scoring) {
                noneToggleButton.classList.add('scoring-item');
                noneToggleButton.unitScore = 0;
            }
            buttonContainer.appendChild(noneToggleButton);
        }
        // Create the list of other options using ToggleButton components
        const replyListContainer = document.createElement('ul'); // Keep <ul> for semantic grouping
        replyListContainer.id = checkboxListId;
        replyListContainer.style.display = 'contents'; // To make <li> elements behave as flex items of buttonContainer
        buttonContainer.appendChild(replyListContainer);
        const replyButtonClass = `${namespace}-std-reply-button`;
        if ((replyList) && (replyType !== 'freeText') && (replyType !== 'numeric')) {
            replyList.forEach((item, index) => {
                const li = document.createElement('li');
                const aReplyToggleButton = new ToggleButton({ label: item,
                    name: `${namespace}_${item.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
                });
                aReplyToggleButton.classList.add(replyButtonClass);
                aReplyToggleButton.isRadio = (replyType.toLowerCase().includes('radio'));
                //If button type is "radioButtons" or "noneOrRadioButtons", then cause any change to untoggle all other sister buttons.
                //     This is separate from the none button which is handled separately.  If none is toggled, these buttons won't even be accessible.
                if (aReplyToggleButton.isRadio) {
                    aReplyToggleButton.addEventListener('change', (event) => {
                        // Only perform radio button logic if not in a loading state
                        if (!this.loadingServerData) {
                            let questionReplyButtons = section.querySelectorAll(`.${replyButtonClass}`);
                            questionReplyButtons.forEach((btn) => {
                                if (btn === aReplyToggleButton)
                                    return;
                                btn.checked = false;
                            });
                        }
                    });
                }
                if (this.scoring) {
                    let scoreValue = 0; //default
                    if (score0Index) {
                        scoreValue = index;
                    }
                    else if (score1Index) {
                        scoreValue = index + 1;
                    }
                    else if (scoreCustom && repliesCustomScore) {
                        scoreValue = repliesCustomScore[index] || 0;
                    }
                    aReplyToggleButton.unitScore = scoreValue;
                    aReplyToggleButton.classList.add('scoring-item');
                }
                li.appendChild(aReplyToggleButton);
                replyListContainer.appendChild(li);
            });
        }
        else if (replyType === "freeText") {
            // Create a single-line text input for freeText replyType
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.name = `${namespace}_freeText`; // Unique name for data collection
            textInput.placeholder = 'Enter your response here...';
            textInput.classList.add('free-text-input'); // Add a class for potential styling and data reading
            section.appendChild(textInput);
            // Hide the button container for freeText as it's not relevant
            buttonContainer.classList.add('hidden');
        }
        else if (replyType === 'numeric') {
            const numericInput = document.createElement('input');
            numericInput.type = 'number';
            numericInput.name = namespace;
            numericInput.classList.add('numeric-input'); // Add a class for potential styling and data reading
            numericInput.placeholder = aQuestion.placeholder || "Enter a number";
            if (aQuestion.minValue !== undefined) {
                numericInput.min = String(aQuestion.minValue);
            }
            if (aQuestion.maxValue !== undefined) {
                numericInput.max = String(aQuestion.maxValue);
            }
            // Add the event listener here
            let j = 12;
            numericInput.addEventListener('input', function (event) {
                console.log(j);
                updateNumericInputClass(this); //this refers to element
            });
            section.appendChild(numericInput);
        }
        if (aQuestion.hasDetailsArea) {
            const labelText = aQuestion.detailsAreaLabelText ?? 'Other:';
            const detailsBox = this.createDetailsBox(namespace, labelText);
            detailsBox.id = detailsBoxId; // Assign the unique ID
            section.appendChild(detailsBox);
        }
        if (noneToggleButton) {
            noneToggleButton.addEventListener('change', (event) => {
                const customEvent = event;
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
                                targetEl.querySelectorAll('toggle-button').forEach(btn => btn.checked = false);
                                const textarea = targetEl.querySelector('textarea');
                                if (textarea)
                                    textarea.value = '';
                            }
                        }
                    });
                }
            });
            // Attach listener for mutual exclusion
            this.addMutualExclusionListeners(noneToggleButton, replyListContainer);
        }
        section.classList.add('trackable-question');
        return section; // Return the created section for further use if needed
    }
    addMutualExclusionListeners = (noneToggleButton, optionsContainer) => {
        // This listener ensures that if any regular replyButton is checked, the "NONE" option is automatically unchecked.
        optionsContainer.addEventListener('change', (event) => {
            // The change event from ToggleButton is a CustomEvent with detail.checked
            const target = event.target;
            // We only care about toggle-button changes inside the container, and only when they are being checked.
            // loadingServerData check here prevents mutual exclusion changes during data load
            if (target.tagName === 'TOGGLE-BUTTON' && target.checked && !this.loadingServerData) {
                // If "NONE" is currently checked, uncheck it.
                if (noneToggleButton.checked) {
                    noneToggleButton.checked = false; // Use the setter directly
                    // Dispatch a change event for the noneToggleButton to trigger visibility logic
                    // This dispatch should always happen if the 'NONE' button's state changes,
                    // regardless of loading, as it's part of applying the loaded state.
                    // The _isLoadingData flag only prevents *other* mutual exclusion on the options.
                    noneToggleButton.dispatchEvent(new CustomEvent('change', { detail: { checked: false }, bubbles: true, composed: true }));
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
        // Autosave on any change or input via updatePageState
        const updatePageFn = this.updatePageState.bind(this); // Permanently binds 'this' to the method
        // Listen for 'change' events from toggle-buttons (CustomEvent) and standard inputs/textareas
        form.addEventListener('change', updatePageFn);
        form.addEventListener('input', updatePageFn); // 'input' is better for textareas
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
            // 1. A "none" ToggleButton is checked.
            const isNoneChecked = !!qSection.querySelector('toggle-button[name$="_none"][checked]');
            // 2. Any other ToggleButton is checked.
            const isOtherCheckboxChecked = !!qSection.querySelector('toggle-button:not([name$="_none"])[checked]');
            // 3. Any textarea has a non-empty value.
            let isTextareaAnswered = false;
            qSection.querySelectorAll('textarea').forEach(ta => {
                if (ta.value.trim() !== '') {
                    isTextareaAnswered = true;
                }
            });
            // 4. Any free-text-input has a non-empty value
            let isFreeTextInputAnswered = false;
            qSection.querySelectorAll('input.free-text-input').forEach(input => {
                if (input.value.trim() !== '') {
                    isFreeTextInputAnswered = true;
                }
            });
            // 5. Any numeric-input has a non-empty value
            let isNumericInputAnswered = false;
            qSection.querySelectorAll('input.numeric-input').forEach(input => {
                //NOTE: .value of numeric input is string, e.g. "7", not numeric, e.g. 7
                if (input.value.trim() !== '') {
                    isNumericInputAnswered = true;
                }
            });
            if (isNoneChecked || isOtherCheckboxChecked || isTextareaAnswered || isFreeTextInputAnswered || isNumericInputAnswered) {
                answeredCount++;
            }
        });
        if (this.scoring) {
            this.resultingTotalScore = 0;
            const scoreItems = form.querySelectorAll('.scoring-item');
            scoreItems.forEach((item) => {
                if (item.checked)
                    this.resultingTotalScore += (item.unitScore || 0);
            });
        }
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
        // Need to override gatherDataFromContainerForServer from AppView
        // because form.elements (used by FormData) does not include custom elements' internal inputs.
        if (!this.htmlEl)
            return {};
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) {
            console.error("Form not found for data extraction.");
            return {};
        }
        const data = {};
        // Gather data from toggle-button components
        form.querySelectorAll('toggle-button').forEach(button => {
            // The name attribute on the toggle-button component corresponds to the input name
            const name = button.getAttribute('name');
            if (!name)
                return;
            const value = button.checked ? true : false;
            data[name] = value;
        });
        // Gather data from 'freeText'-area input elements (type="freeText")
        form.querySelectorAll('input.free-text-input').forEach(inputElement => {
            const name = inputElement.getAttribute('name');
            if (!name)
                return;
            const value = inputElement.value.trim();
            if (value === '')
                return;
            data[name] = value;
        });
        // Gather data from 'numeric'-area input elements (type="numeric")
        form.querySelectorAll('input.numeric-input').forEach(inputElement => {
            const name = inputElement.getAttribute('name');
            if (!name)
                return;
            const value = inputElement.value.trim();
            if (value === '')
                return;
            data[name] = value;
        });
        // Gather data from 'Details'-area textareas
        form.querySelectorAll('textarea').forEach(textarea => {
            const name = textarea.getAttribute('name');
            if (!name)
                return;
            const value = textarea.value.trim();
            if (value === '')
                return;
            data[name] = value;
        });
        console.log("Compiled form data:", data);
        return data;
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    serverDataToForm = (data) => {
        // This function needs to be aware of the custom elements.
        if (!this.htmlEl)
            return;
        let stored = {};
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form)
            return;
        // Set isLoadingData flag to true at the beginning of data loading
        this.loadingServerData = true;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                // Check if it's a toggle-button
                const toggleButton = form.querySelector(`toggle-button[name="${key}"]`);
                if (toggleButton) {
                    toggleButton.checked = (value === true || value === 'true');
                    // Manually dispatch change event to ensure visibility listeners are triggered
                    // This is still necessary, as programmatically setting 'checked' doesn't fire native 'change'.
                    // The _isLoadingData flag will prevent radio/mutual exclusion logic *listening* to this event from interfering.
                    toggleButton.dispatchEvent(new CustomEvent('change', { detail: { checked: toggleButton.checked }, bubbles: true, composed: true }));
                    stored[key] = value;
                    continue;
                }
                // Check if it's a free-text-input (an <input type="text"> element)
                const freeTextInput = form.querySelector(`input.free-text-input[name="${key}"]`);
                if (freeTextInput) {
                    freeTextInput.value = value;
                    stored[key] = value;
                    continue;
                }
                // Check if it's a numeric-input (an <input type="numeric"> element)
                const numericInput = form.querySelector(`input.numeric-input[name="${key}"]`);
                if (numericInput) {
                    numericInput.value = value;
                    updateNumericInputClass(numericInput);
                    stored[key] = value;
                    continue;
                }
                // Check if it's a textarea
                const textarea = form.querySelector(`textarea[name="${key}"]`);
                if (textarea) {
                    textarea.value = value;
                    stored[key] = value;
                    continue;
                }
            }
        }
        // Set isLoadingData flag back to false after all data is loaded
        this.loadingServerData = false;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                if (stored[key] === undefined) {
                    console.log("unexpected", { key, value });
                }
                else {
                    console.log("stored", { key, value });
                }
            }
        }
        this.updatePageState();
    };
    /**
     * Creates a category section div and appends it to the parent.
     */
    createCategorySection(parent) {
        const div = document.createElement('div');
        div.className = 'category-section';
        parent.appendChild(div);
        return div;
    }
    /**
     * Creates a heading element of the given level and text.
     */
    createHeading(level, text) {
        const h = document.createElement(`h${level}`);
        h.textContent = text;
        return h;
    }
    /**
     * Creates a list of checkboxes for the given prefix and items.
     */
    createCheckboxList(prefix, items) {
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
    }
    /**
     * Creates a details box (label + textarea) for the given prefix and label text.
     */
    createDetailsBox(prefix, labelText) {
        const div = document.createElement('div');
        div.className = 'details-input-group';
        const name = `${prefix}_details`;
        let label = null;
        let hasLabel = (labelText && labelText.trim() !== '');
        if (hasLabel) {
            label = document.createElement('label');
            label.htmlFor = name;
            label.textContent = labelText;
        }
        const textarea = document.createElement('textarea');
        textarea.id = name;
        textarea.name = name;
        textarea.placeholder = 'Enter details here (optional)...';
        if (hasLabel && label) {
            div.append(label, textarea);
        }
        else {
            div.append(textarea);
        }
        return div;
    }
    /**
     * Creates a question group with a main label, a 'NONE' checkbox, and a details textarea.
     * The toggleVisibilityHandler is called with the 'NONE' checkbox as argument to set up visibility logic.
     */
    createQuestionGroup(anAppView, parent, prefix, text, toggleVisibilityHandler) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'question-group trackable-question';
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
        toggleVisibilityHandler(anAppView, noneInput);
    }
    addToggleVisibilityListener(anAppView, checkbox) {
        if (!anAppView)
            return;
        if (!anAppView.htmlEl)
            return; // Guard against null element
        const shadowRoot = anAppView.htmlEl.dom;
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
    }
} //class
// Function to handle the class update logic
function updateNumericInputClass(inputElement) {
    if (inputElement.value !== '') {
        inputElement.classList.add('numeric-input-has-value');
    }
    else {
        inputElement.classList.remove('numeric-input-has-value');
    }
}
//# sourceMappingURL=questionnaire.js.map