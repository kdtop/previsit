// /opt/worldvista/EHR/web/previsit/www/components/phq9.ts

import TAppView, { EnhancedHTMLElement } from './appview.js';
import { createCategorySection, createHeading,
         createDetailsBox,
        } from './questcommon.js';
import { KeyToStrBoolValueObj, TPhq9Answers } from '../utility/types.js';
import { TCtrl } from '../utility/controller.js';
import { ToggleButton, ToggleButtonOptions } from './components.js'; // Import the ToggleButton component

interface Phq9UpdateOptions {
    someOption : any;
}

export type Phq9UpdateHTMLElement = EnhancedHTMLElement & {
    // Extend the base EnhancedHTMLElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Represents the Phq9Update component as a class, responsible for building and managing the patient history update form.
 */
export default class TPhq9UpdateAppView extends TAppView<TPhq9Answers> {
    //NOTE: The generic type <TPhq9Answers> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: Phq9UpdateHTMLElement; // Use 'declare' to override the type of the inherited property

    private doneButton: HTMLButtonElement | null = null;
    private doneButtonMainText: HTMLSpanElement | null = null;
    private doneButtonSubText: HTMLSpanElement | null = null;
    private resultingTotal : number = 0;

    constructor(aCtrl:  TCtrl,  opts?: Phq9UpdateOptions) {
        super('phq9update', '/api/phq9update', aCtrl);
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

            .submission-controls {
                text-align: center;
                margin-top: 30px;
                /* Add significant padding to the bottom to create scrollable whitespace */
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
                <h1>PATIENT HEALTH QUESTIONNAIRE (PHQ-9)</h1>
                <p><b>Patient:</b> <span class="patient-name"></span></p>
                <div class="instructions">
                    <h2><strong>Over the last 2 weeks,</strong> how often have you been bothered by any of the following problems?</h2>
                </div>
                <div class="forms-container"></div>
                <div class="result-container"></div>
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
     * Builds the entire PHQ9 update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    private async loadForms(): Promise<void>
    {
        this.setHTMLEl(this.sourceHTML);  //restore initial html

        // Cache the done button elements for quick access
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
        this.renderPhq9(container);   // "PHQ-9"

        // Setup autosave and the "Done" button listener
        this.setupFormEventListeners();

        await this.prePopulateFromServer(); //evokes call to serverDataToForm()

        // If no data, set the initial state of the done button after the form is rendered
        this.updateDoneButtonState();

    }

    /** Renders the "Review of Systems" section. */
    private renderPhq9(parent: HTMLElement): void {
        parent.appendChild(createHeading(1, "Questions"));

        let phq9Questions = [
            { section: "q1", text: "Little interest or pleasure in doing things",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q2", text: "Feeing down, depressed, or hopeless.",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q3", text: "Trouble falling or staying asleep, or sleeping too much",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q4", text: "Feeling tired or having little energy",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q5", text: "Poor appetite or overeating",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q6", text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q7", text: "Trouble concentrating on things, such as reading the newspaper or watching television",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q8", text: "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
                             list: "Several days^More than half the days^Nearly every day" },
            { section: "q9", text: "Thoughts that you would be better off dead, or of hurting yourself in some way",
                             list: "Several days^More than half the days^Nearly every day" },
        ];

        phq9Questions.forEach(data => {
            const text = data.text || data.section.charAt(0).toUpperCase() + data.section.slice(1);
            const section = this.createPhq9Section(parent, data.section, text, data.list.split('^'));
            section.classList.add('trackable-question',"scorable-question");
        });

        parent.appendChild(createHeading(1, "Life Impact"));
        phq9Questions = [
            { section: "impact", text: "If you checked any problems, how difficult have these problems made it for you to do your work, take care of things at home, or getting along with other people?",
              list: "Somewhat difficult^Very difficult^Extremely difficult" }
        ];

        phq9Questions.forEach(data => {
            const text = data.text || data.section.charAt(0).toUpperCase() + data.section.slice(1);
            const section = this.createPhq9Section(parent, data.section, text, data.list.split('^'));
            section.classList.add('trackable-question');
        });

    }

    private createPhq9Section(parent: HTMLElement, prefix: string, text: string, list: string[]): HTMLDivElement
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
        let toggleButtonOpts : ToggleButtonOptions = {
          label : 'Not at all',
          state : { checked : { backgroundColor : '#e74c3c' }},
          name: `${prefix}_none`
        }
        const noneToggleButton = new ToggleButton(toggleButtonOpts);
        noneToggleButton.dataset.score = "0"; // ADDED: Score for "Not at all"

        noneToggleButton.classList.add('none-option-label');

        const checkboxListId = `${prefix}_checkbox_list`;
        const detailsBoxId = `${prefix}_details_box`;

        buttonContainer.appendChild(noneToggleButton);

        // Create the list of other options using ToggleButton components
        const optionsListContainer = document.createElement('ul');
        optionsListContainer.id = checkboxListId;
        optionsListContainer.style.display = 'contents';
        buttonContainer.appendChild(optionsListContainer);

        list.forEach((item, index) => { // ADDED 'index' to loop
            const li = document.createElement('li');
            const toggleButton = new ToggleButton(
              { label : item,
                name: `${prefix}_${item.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
              }
            );
            toggleButton.dataset.score = (index + 1).toString(); // ADDED: Score based on index
            li.appendChild(toggleButton);
            optionsListContainer.appendChild(li);
        });

        // The targetIds for the "NONE" button to hide the checkbox list and details box
        noneToggleButton.dataset.hideTargetIds = `${checkboxListId},${detailsBoxId}`;


        // Add a single event listener to the buttonContainer to manage mutual exclusivity
        buttonContainer.addEventListener('change', (event: Event) => {
            const changedToggleButton = event.target as ToggleButton;
            if (changedToggleButton.tagName !== 'TOGGLE-BUTTON') return;

            // Retrieve targetIds from the noneToggleButton's dataset
            const targetIds = noneToggleButton.dataset.hideTargetIds;

            // If the changed button is being checked
            if (changedToggleButton.checked) {
                // Uncheck all other toggle buttons in this section
                const allToggleButtons = Array.from(buttonContainer.querySelectorAll<ToggleButton>('toggle-button'));
                allToggleButtons.forEach(button => {
                    if (button !== changedToggleButton && button.checked) {
                        button.checked = false; // Uncheck the other button
                        // Manually dispatch change event for the unchecked button
                        button.dispatchEvent(new CustomEvent('change', { detail: { checked: false }, bubbles: true, composed: true }));
                    }
                });

                // Handle the visibility of other elements based on the "NONE" button's state
                if (changedToggleButton === noneToggleButton) {
                    // If "NONE" is checked, hide other options and clear their values
                    if (targetIds) {
                        targetIds.split(',').forEach(id => {
                            const targetEl = section.querySelector(`#${id}`);
                            if (targetEl) {
                                targetEl.classList.add('hidden');
                                targetEl.querySelectorAll<ToggleButton>('toggle-button').forEach(btn => btn.checked = false);
                                const textarea = targetEl.querySelector('textarea');
                                if (textarea) textarea.value = '';
                            }
                        });
                    }
                } else {
                    // If any other button is checked, ensure other options (if hidden by NONE) are visible
                    // and that NONE is unchecked (already handled by the loop above, but good to be explicit)
                    if (targetIds) {
                        targetIds.split(',').forEach(id => {
                            const targetEl = section.querySelector(`#${id}`);
                            if (targetEl) {
                                targetEl.classList.remove('hidden');
                            }
                        });
                    }
                }
            } else { // This block executes when a button is UNCHECKED
                // This means the user clicked a checked button to uncheck it,
                // or another button in the group was clicked, causing this one to be unchecked.

                // If the 'Not at all' button was just unchecked, we need to ensure the other options reappear.
                if (changedToggleButton === noneToggleButton && !changedToggleButton.checked) {
                    if (targetIds) {
                        targetIds.split(',').forEach(id => {
                            const targetEl = section.querySelector(`#${id}`);
                            if (targetEl) {
                                targetEl.classList.remove('hidden'); // Make them visible again
                            }
                        });
                    }
                }
                // For other buttons, when they are unchecked (because another was checked),
                // no specific visibility change is needed here, as the 'checked' block handles showing/hiding based on 'NONE'.
            }
        });


        return section;
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

        // Add listeners to update the done button state and score on any user interaction
        form.addEventListener('change', () => {
            this.updateDoneButtonState();
        });
        form.addEventListener('input', () => {
            this.updateDoneButtonState();
        });

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
        this.calculatePhq9Score();

        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;

        if (!this.htmlEl) return;

        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        const questions = form.querySelectorAll<HTMLElement>('.trackable-question');
        let totalQuestions = questions.length;
        //If questions 1-9 have score of 0, then 10th question (impact) doesn't need to be answered
        if (this.resultingTotal === 0) totalQuestions--;

        let answeredCount = 0;

        questions.forEach(qSection => {
            // A section is considered "answered" if any ToggleButton within it is checked.
            const isAnyToggleButtonChecked = !!qSection.querySelector<ToggleButton>('toggle-button[checked]');

            // If you still have textareas and they count towards "answered"
            let isTextareaAnswered = false;
            qSection.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(ta => {
                if (ta.value.trim() !== '') {
                    isTextareaAnswered = true;
                }
            });

            if (isAnyToggleButtonChecked || isTextareaAnswered) {
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
     * Calculates the PHQ-9 score based on selected scorable questions.
     */
    private calculatePhq9Score = (): void => {
        let totalScore = 0;
        this.resultingTotal = 0; // Initialize to 0

        if (!this.htmlEl) return;

        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Only consider questions that have the 'scorable-question' class
        form.querySelectorAll<HTMLElement>('.scorable-question').forEach(questionSection => {
            // Find the checked toggle button within this scorable section
            const checkedButton = questionSection.querySelector<ToggleButton>('toggle-button[checked]');
            if (checkedButton) {
                const scoreString = checkedButton.dataset.score;
                if (scoreString !== undefined) {
                    const score = parseInt(scoreString, 10);
                    if (!isNaN(score)) {
                        totalScore += score;
                    }
                }
            }
        });

        this.resultingTotal = totalScore;
        console.log("Calculated PHQ-9 Score:", totalScore);
        let resultEl =  this.htmlEl.dom.querySelector<HTMLSpanElement>('.result-container');
        if (resultEl) {
            resultEl.textContent = 'Total score: ' + totalScore.toString();
        }
    }


    /**
     * Gathers all form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    public gatherDataForServer = (): TPhq9Answers => {
      // Need to override gatherDataFromContainerForServer from AppView
      // because form.elements (used by FormData) does not include custom elements' internal inputs.
      const data: TPhq9Answers = {
        questions : {},
        resultingTotal : 0 // Initialize to 0, will be updated below
      };
      if (!this.htmlEl) return data;
      const form : HTMLFormElement | null = this.htmlEl.dom.querySelector<HTMLFormElement>('form.content-container');
      if (!form) {
          console.error("Form not found for data extraction.");
          return data;
      }

      // Gather data from toggle-button components
      form.querySelectorAll<ToggleButton>('toggle-button').forEach(button => {
          // The name attribute on the toggle-button component corresponds to the input name
          const name = button.getAttribute('name');
          if (name) {
              data.questions![name] = button.checked ? true : false;
          }
      });

      // Gather data from textareas
      form.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textarea => {
          const name = textarea.getAttribute('name');
          if (name && textarea.value.trim() !== '') {
              data.questions![name] = textarea.value.trim();
          }
      });

      // Calculate and assign the resultingTotal just before returning the data
      this.calculatePhq9Score();
      data.resultingTotal = this.resultingTotal;// Set the calculated score

      console.log("Compiled form data:", data);
      return data;
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: TPhq9Answers): void => {
        // This function needs to be aware of the custom elements.
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Ensure data.questions exists before iterating
        if (!data.questions) {
            console.warn("No 'questions' data found in server response for form population.");
            return;
        }

        for (const key in data.questions) {
            if (Object.prototype.hasOwnProperty.call(data.questions, key)) {
                const value = data.questions[key];

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