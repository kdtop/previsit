// /opt/worldvista/EHR/web/previsit/www/components/questionnaire.ts

import TAppView, {  } from './appview.js';
import { KeyToStrBoolValueObj, TQuestion, TQuestionGroup, TQuestionnaireData,
         EnhancedHTMLDivElement,
         QuestionResults,
       } from '../utility/types.js';
import { TCtrl } from '../utility/controller.js';

import { QuestionAnswerComponent, QuestionAnswerChangeEventDetail, NoneButtonToggleEventDetail, QACompOptions } from './comp_quest.js'; // NEW: Import QuestionAnswerComponent
import { piece } from '../utility/client_utils.js';
import { argv } from 'process';

interface questionnaireUpdateOptions {
    someOption : any;
}

export type QuestionnaireHTMLElement = EnhancedHTMLDivElement & {
    // Extend the base EnhancedHTMLDivElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Represents the generic Questionnaire component as a class, responsible for building and managing the questions on form.
 */
export default class TQuestionnaireAppView extends TAppView<KeyToStrBoolValueObj> {
    //NOTE: The generic type <KeyToStrBoolValueObj> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: QuestionnaireHTMLElement; // Use 'declare' to override the type of the inherited property
    public resultingTotalScore : number = 0;
    public scoring : boolean = false;
    private loadingServerData: boolean = false; // Flag to indicate if data is currently being loaded into form
    private formData : TQuestionnaireData = {   instructionsText: '',
                                                questGroups : [],
                                            };

    constructor(aName : string, apiURL : string = '/api/questionnaireUpdate', aCtrl:  TCtrl,  opts?: questionnaireUpdateOptions) {
        super(aName, apiURL, aCtrl);
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    public getCSSContent() : string
    {
        let result : string = super.getCSSContent() +
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

                .details-options-row { /* This might be less relevant if comp_quest handles it */
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

                .free-text-input, .numeric-input { /* These styles should be moved to comp_quest.ts if internal to component */
                  width: 100%;
                  padding: 8px 10px;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  font-size: 1em;
                  box-sizing: border-box;
                  margin-top: 10px; /* For spacing */
                }

                .numeric-input { /* This style should be moved to comp_quest.ts if internal to component */
                    height: 30px;
                    width: 150px;
                    border-radius: 12px;
                    text-align: center;
                }

                .numeric-input-has-value { /* This style should be moved to comp_quest.ts if internal to component */
                    background-color: #3498db;
                }

                .hidden {
                    display: none !important;
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

    public getHTMLTagContent() : string
    {
        let result : string = `
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

    public setupPatientNameDisplay() {
        //NOTE: This is a virtual method, to be overridden by descendant classes
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector<HTMLSpanElement>('.patient-name');
        if (patientNameEl) patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
    }

    /**
     * Builds the entire Questionainnaire form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    public async loadForm(): Promise<void>
    {
        super.loadForm();
        const container = this.htmlEl.$formscontainer;
        if (!container) {
            console.error("Forms container not found!");
            return;
        }
        container.innerHTML = ''; // Clear any previous content.
        await this.renderContent(container);
        this.setupFormEventListeners();  //call again after renderContent()
    }

    public async renderContent(parent: HTMLElement) {
        this.formData = this.getQuestionnaireData();
        this.scoring = false;  //default
        await this.renderQuestionnaire(parent, this.formData);
    }

    public getQuestionnaireData() : TQuestionnaireData {
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'getQuestionnaireData' must be implemented by subclasses.");
    }

    private async renderQuestionnaire(parent: HTMLElement, aQuestionnaire: TQuestionnaireData) {
        /* TQuestionnaireData {
                instructionsText: string;
                questGroups : TQuestionGroup[];
                endingText?: string;
            }
        */
        //insert instructionText into DOM
        let instructionsDiv : HTMLDivElement | null = null;
        let closingInstructionsDiv : HTMLDivElement | null = null;

        if (aQuestionnaire.instructionsText) {
            instructionsDiv  = this.htmlEl.dom.querySelector<HTMLDivElement>('.instructions');
            if (instructionsDiv) instructionsDiv.innerHTML = '<p>' + aQuestionnaire.instructionsText + '</p>';
        }

        if (aQuestionnaire.endingText) {
            closingInstructionsDiv  = this.htmlEl.dom.querySelector<HTMLDivElement>('.closing-instructions');
            if (closingInstructionsDiv) closingInstructionsDiv.innerHTML = '<p>' + aQuestionnaire.endingText + '</p>';
        }

        aQuestionnaire.questGroups.forEach( (aQuestGroup : TQuestionGroup, groupIndex : number) => {
           this.renderAQuestionGroup(parent, aQuestGroup, groupIndex);
        });
    }

    private renderAQuestionGroup(parent: HTMLElement, aQuestGroup : TQuestionGroup, groupIndex : number) : void {
        /* TQuestionGroup {
              groupHeadingText?: string;
              question: TQuestion[];
            }                                */

        if (!aQuestGroup) return;
        parent.appendChild(this.createHeading(1, aQuestGroup.groupHeadingText));

        aQuestGroup.questionInstance = [];
        aQuestGroup.questionDefinition.forEach( (aQuestion : TQuestion, questionIndex : number) => {
            let qaComponent : QuestionAnswerComponent = this.createAQuestionSection(parent, aQuestion, groupIndex, questionIndex);
            if (!aQuestGroup.questionInstance) aQuestGroup.questionInstance = [];
            aQuestGroup.questionInstance.push(qaComponent);
        });
    }

    /*
        TQuestionnaireData {
            instructionsText?: string;
            questGroups : TQuestionGroup[]; <-- a single element of this is 'aQuestGroup'
                          TQuestionGroup {
                            groupHeadingText: string;
                            questionDefinition: TQuestion[];
                              TQuestion {
                               ... (defining items)
                              }
                            questionInstance: HTMLElement[];  //will really hold QuestionAnswerComponent (extended from HTMlElement) that implements TQuestion definition
                          }
            endingText?: string;
        }
    */

    private createAQuestionSection(parent: HTMLElement, aQuestion : TQuestion, groupIndex : number, questionIndex : number): QuestionAnswerComponent
    {
        let scoreMode : string = aQuestion.scoreMode?.toLowerCase() ?? '';
        this.scoring = this.scoring || scoreMode === "0indexed" || scoreMode === "1indexed" || scoreMode === "custom";

        const section = this.createCategorySection(parent);
        section.classList.add('trackable-question');

        // Create the new QuestionAnswerComponent
        const options : QACompOptions = {
            id : `qa-${aQuestion.dataNamespace}`, // Assign a unique ID for easy lookup
            questionData : aQuestion,
            groupIndex : groupIndex,
            questionIndex : questionIndex,
        }
        const qaComponent : QuestionAnswerComponent = new QuestionAnswerComponent(options);

        // Capture 'this' explicitly as 'self' to ensure correct context within callbacks
        const self = this;
        qaComponent.addEventListener('change', (event: Event) => {    // Add event listener for the main answer change
            self.updatePageState(); // Use 'self' here
        });

        section.appendChild(qaComponent);
        return qaComponent; // Return the created component for further use if needed
    }

    // --- Data, Submission, and Autosave Logic ---

    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    public setupFormEventListeners = (): void => {
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Autosave on any change or input via updatePageState
        const updatePageFn = this.updatePageState.bind(this); // Permanently binds 'this' to the method
        // Listen for 'change' events from question-answer-component (CustomEvent) and standard inputs/textareas
        form.addEventListener('change', updatePageFn);
        form.addEventListener('input', updatePageFn); // 'input' is better for textareas

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
            const qaComponent : QuestionAnswerComponent | null = qSection.querySelector<QuestionAnswerComponent>('question-answer-component');
            let isQuestionAnswered = false;

            if (qaComponent && qaComponent.value !== null && qaComponent.value !== '') {
                isQuestionAnswered = true;
            }
            // Add check for details textarea if it exists and is filled
            let isTextareaAnswered = false;
            qSection.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(ta => {
                if (ta.value.trim() !== '') {
                    isTextareaAnswered = true;
                }
            });

            if (isQuestionAnswered || isTextareaAnswered) {
                answeredCount++;
            }
        });

        if (this.scoring) {
            this.resultingTotalScore = 0;
            this.formData.questGroups.forEach( (qGroup: TQuestionGroup) => {
                if (qGroup.questionInstance) qGroup.questionInstance.forEach( (element: HTMLElement) => {
                    let aQuestInstance = element as QuestionAnswerComponent;
                    this.resultingTotalScore += aQuestInstance.getUnitScore();
                });
            });
        }

        /*
        if (this.scoring) {
            this.resultingTotalScore = 0;
            questions.forEach(qSection => {
                const qaComponent : QuestionAnswerComponent | null = qSection.querySelector<QuestionAnswerComponent>('question-answer-component');
                if (!qaComponent || !qaComponent.value) return;
                const questionData = qaComponent.questionData; // Access the original TQuestion data
                if (!questionData) return;
                const replyType = (questionData.replyType || '').toLowerCase();
                const scoreMode = (questionData.scoreMode || '').toLowerCase();

                if (replyType === 'numeric' && typeof qaComponent.value === 'number') {
                    // For numeric inputs, the score might be the value itself
                    if (scoreMode !== 'custom') {
                        this.resultingTotalScore += qaComponent.value as number;
                    }
                } else if (questionData.replies && replyType.includes('buttons')) {
                    const selectedReplies = qaComponent.value.toString().split('^');
                    selectedReplies.forEach( (selectedReply : string) : void => {
                        const index = questionData.replies!.indexOf(selectedReply);
                        if (index !== -1) {
                            let scoreValue: number = 0;
                            if (scoreMode === "0indexed") {
                                scoreValue = index;
                            } else if (scoreMode === "1indexed") {
                                scoreValue = index + 1;
                            } else if (scoreMode === "custom" && questionData.repliesCustomScore) {
                                scoreValue = questionData.repliesCustomScore[index] || 0;
                            }
                            this.resultingTotalScore += scoreValue;
                        } else if (questionData.noneButtonLabel && selectedReply === questionData.noneButtonLabel) {
                            // If "None" is selected, and it's a scoring item, its score is usually 0.
                            this.resultingTotalScore += 0;
                        }
                    });
                }
            });
        }
        */

        const unansweredCount = totalQuestions - answeredCount;

        // Update progress data
        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = unansweredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }

    public clear(): void {
      if (!this.htmlEl) return;
      const form : HTMLFormElement | null = this.htmlEl.dom.querySelector<HTMLFormElement>('form.content-container');
      if (!form) {
          console.error("Form not found for data extraction.");
          return;
      }

      // clear all question-answer-component elements
      form.querySelectorAll<QuestionAnswerComponent>('question-answer-component').forEach( (qaComp:QuestionAnswerComponent) => {
          qaComp.clear();
      });

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
      const resultData: KeyToStrBoolValueObj = {};

      // Gather data from question-answer-component elements
      form.querySelectorAll<QuestionAnswerComponent>('question-answer-component').forEach( (qaComp:QuestionAnswerComponent) => {
          const dataNamespace = qaComp.dataset.namespace;  //qaComp.getAttribute('data-namespace');
          const groupIndex = qaComp.dataset.groupIndex;
          const questionIndex = qaComp.dataset.questionIndex;
          if (!dataNamespace || !groupIndex || !questionIndex) return;
          let keyPrefix = `${groupIndex}.${questionIndex}:${dataNamespace}`;
          let values : QuestionResults = qaComp.getValues();
          resultData[keyPrefix+'^questionText'] = values.questionText;
          resultData[keyPrefix+'^value'] = values.value;
          if (values.details) resultData[keyPrefix+'^details'] = values.details;
      });

      console.log("Compiled form data:", resultData);
      return resultData;
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: KeyToStrBoolValueObj): void => {
        this.clear();
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Set isLoadingData flag to true at the beginning of data loading
        this.loadingServerData = true;

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let value : string = data[key].toString();
                let strippedKey = piece(key, '^', 1);
                let internalPart = piece(key, '^', 2);
                let aNamespace = piece(strippedKey, ':', 2);

                // Check if it's a question-answer-component
                const qaComponent = form.querySelector<QuestionAnswerComponent>(`question-answer-component[data-namespace="${aNamespace}"]`);
                if (!qaComponent) continue;
                if (internalPart === 'questionText') continue;
                if (internalPart === 'value') {
                    qaComponent.value = value;
                } else if (internalPart === 'details') {
                    qaComponent.details = value;
                }
            }
        }

        // Set isLoadingData flag back to false after all data is loaded
        this.loadingServerData = false;

        this.updatePageState();
    }

    /**
     * Creates a category section div and appends it to the parent.
     */
    createCategorySection(parent: HTMLElement): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'category-section';
        parent.appendChild(div);
        return div;
    }

    /**
     * Creates a heading element of the given level and text.
     */
    createHeading(level: number, text: string): HTMLHeadingElement {
        const h = document.createElement(`h${level}`) as HTMLHeadingElement;
        h.textContent = text;
        return h;
    }

    /**
     * Creates a details box (label + textarea) for the given prefix and label text.
     */
    /*
    createDetailsBox(prefix: string, labelText: string): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'details-input-group';
        const name = `${prefix}_details`;
        let label : HTMLLabelElement | null = null;
        let hasLabel = (labelText && labelText.trim() !== '');
        if (hasLabel)  {
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
        } else {
            div.append(textarea);
        }
        return div;
    }
    */

} //class
