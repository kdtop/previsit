// /opt/worldvista/EHR/web/previsit/www/components/questionnaire.ts

import TAppView, {  } from './appview.js';
import { KeyToStrBoolValueObj, TQuestionSchema, TQuestionGroupSchema, TQuestionnaireSchema, TQuestionnaireUserData,
         EnhancedHTMLDivElement,
         TQuestionResults,
         TQuestionGroupResults,
       } from '../utility/types.js';
import { strToNumDef,
         padZero, camelCase,
} from '../utility/client_utils.js';
import { TCtrl } from '../utility/controller.js';

import { QuestionAnswerComponent, QACompOptions,
         QuestionAnswerChangeEventDetail, ButtonToggleEventDetail } from './comp_quest.js'; // NEW: Import QuestionAnswerComponent
import { piece, debounce } from '../utility/client_utils.js';

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
//export default class TQuestionnaireAppView extends TAppView<KeyToStrBoolValueObj> {
export default class TQuestionnaireAppView extends TAppView<TQuestionnaireUserData> {
    //NOTE: The generic type <TQuestionnaireUserData> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: QuestionnaireHTMLElement; // Use 'declare' to override the type of the inherited property
    public resultingTotalScore : number = 0;
    public scoring : boolean = false;
    private loadingServerData: boolean = false; // Flag to indicate if data is currently being loaded into form
    private formSchema : TQuestionnaireSchema = {   instructionsText: '',
                                                    questGroups : [],
                                                };
    private formUserData : TQuestionnaireUserData = { questGroupsResults : [], scoring: false, totalScore: 0, instructionsText: '', endingText: '' };

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
                  /* other values inherited from ancestor */
                  line-height:      1.6;
                  padding:          0 100px;
                }

                /* --- Details Textarea Styling (General) --- */
                .details-input-group {
                  /* This general style applies to sections where NONE is not used this way */
                  margin-top:       15px;
                  margin-bottom:    25px;
                }

                .details-input-group label {
                  display:          block;
                  margin-bottom:    5px;
                  font-weight:      bold;
                  color:            var(--textColor);
                }

                .details-input-group textarea {
                  width:            100%;
                  min-height:       50px;
                  padding:          8px 10px;
                  border:           1px solid var(--lightGray);
                  border-radius:    4px;
                  font-size:        1em;
                  box-sizing:       border-box;
                  resize:           none;
                }

                .question-group {
                  margin-bottom:    25px; /* Space between each question group */
                  padding-bottom:   25px;
                  border-bottom:    solid 2px var(--lightLightGray);
                }

                .main-question-label { /* Style for the main question label */
                  display:          block; /* Ensures it's on its own line */
                  margin-bottom:    10px; /* Space below the main question */
                  font-weight:      bold; /* Make the main question prominent */
                  font-size:        large;
                  color:            var(--textColor);
                }

                .details-options-row { /* This might be less relevant if comp_quest handles it */
                  display:          flex; /* Use flexbox to align 'NONE' and 'Details:' side-by-side */
                  align-items:      center; /* Vertically align items */
                  gap:              15px; /* Space between 'NONE' and 'Details:' */
                  margin-bottom:    10px; /* Space above textarea */
                }

                .details-label { /* Style for the 'Details:' label in this specific context */
                  font-weight:      bold;
                  color:            var(--textColor);
                  white-space:      nowrap; /* Prevent 'Details:' from wrapping */
                }

                .details-textarea-container {
                  margin-top:       5px; /* Space below the details/none row */
                }

                .details-textarea-container textarea {
                  width:            100%;
                  min-height:       30px;
                  padding:          8px 10px;
                  border:           1px solid #ccc;
                  border-radius:    4px;
                  font-size:        1em;
                  box-sizing:       border-box;
                  resize:           none;
                }

                .button-container {
                  display :         flex;
                  flex-wrap :       wrap;
                  gap :             10px;
                  align-items :     center;
                  margin-bottom :   20px; /* Maintain spacing from the details box */
                }

                .free-text-input, .numeric-input { /* These styles should be moved to comp_quest.ts if internal to component */
                  width:            100%;
                  padding:          8px 10px;
                  border:           1px solid var(--gray);
                  border-radius:    4px;
                  font-size:        1em;
                  box-sizing:       border-box;
                  margin-top:       10px; /* For spacing */
                }

                .numeric-input { /* This style should be moved to comp_quest.ts if internal to component */
                    height:         30px;
                    width:          150px;
                    border-radius:  12px;
                    text-align:     center;
                }

                .numeric-input-has-value {
                    background-color: var(--niceBlue);
                }

                /* Responsive adjustments */
                @media (max-width: 500px) {
                  ul {
                    gap:            8px;
                  }
                  .details-options-row {
                    flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
                    align-items:    flex-start;
                    gap:            5px;
                  }
                }
            </style>
        `;
        return result;
    }

    public getTitleText() : string
    //Plan on overriding this for descendant classes.
    {
        return "Tell Us About Your Symptoms";
    }

    public getHTMLMain() : string {
        let result : string = `
            <div class="instructions">
                <p>Please answer the following questions. This will help us prepare for your visit.</p>
            </div>
            <div class="forms-container"></div>
            <div class="closing-instructions"></div>
            <div class="result-container"></div>
        `;
        return result;
    }

    public getHTMLStructure() : string
    {
        let result : string = `
            <form class='container content-container'>
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
        this.formSchema = this.getQuestionnaireSchema();
        this.scoring = false;  //default
        await this.renderQuestionnaire(parent, this.formSchema);
    }

    public getQuestionnaireSchema() : TQuestionnaireSchema {
        // Get the definition of the questionaire (i.e. all the questions and components etc)
        // NOTE: This is a virtual method, to be overridden by descendant classes
        throw new Error("Method 'getQuestionnaireSchema' must be implemented by subclasses.");
    }

    private ensureUserDataDefined(aQuestionnaireSchema: TQuestionnaireSchema, userData : TQuestionnaireUserData): void {
        if (!userData.questGroupsResults) {
            userData.questGroupsResults = [];  //initialize array if was undefined
        }
        aQuestionnaireSchema.questGroups.forEach( (aQuestGroupSchema : TQuestionGroupSchema, groupIndex : number) => {
            if (!userData.questGroupsResults[groupIndex]) {
                userData.questGroupsResults[groupIndex] = { questionResults: [], groupHeadingText: '' };
            }
            aQuestGroupSchema.questionDefinition.forEach( (aQuestionSchema : TQuestionSchema, questionIndex : number) => {
                if (!userData.questGroupsResults[groupIndex].questionResults[questionIndex]) {
                    userData.questGroupsResults[groupIndex].questionResults[questionIndex] = { questionText : '', value : '', details: ''}
                }
            });
        });
    }

    private partialSchemaToUserData(aQuestionnaireSchema: TQuestionnaireSchema, userData : TQuestionnaireUserData): void {
        //this.formUserData is for storing user replies as separate data from schema.
        //But this is the data sent to the server, and there needs to be context there for generating documention.
        //   I.e. an answer of "NONE" is only meaningful if the related question is also present.
        //So will ensure the relevent parts of the schema are copied here.
        this.ensureUserDataDefined(aQuestionnaireSchema, userData); //Make sure all the elements are not undefined.

        this.formUserData.instructionsText = aQuestionnaireSchema.instructionsText;
        this.formUserData.endingText = aQuestionnaireSchema.endingText;
        this.formUserData.scoring = this.scoring;
        aQuestionnaireSchema.questGroups.forEach( (aQuestGroupSchema : TQuestionGroupSchema, groupIndex : number) => {
            this.formUserData.questGroupsResults[groupIndex].groupHeadingText = aQuestGroupSchema.groupHeadingText;
            aQuestGroupSchema.questionDefinition.forEach( (aQuestionSchema : TQuestionSchema, questionIndex : number) => {
                let text : string = aQuestionSchema.questionText || '';
                if (text ==='') text = camelCase(aQuestionSchema.dataNamespace);
                this.formUserData.questGroupsResults[groupIndex].questionResults[questionIndex].questionText = text;
            });
        });
    }

    private async renderQuestionnaire(parent: HTMLElement, aQuestionnaireSchema: TQuestionnaireSchema) {
    /*  TQuestionnaireSchema {
            instructionsText?: string;
            questGroups : TQuestionGroupSchema[];
                          TQuestionGroupSchema {
                            groupHeadingText: string;
                            questionDefinition: TQuestionSchema[];
                              TQuestionSchema {
                               ... (defining items)
                              }
                            questionInstance: QuestionAnswerComponent[];  //holds QuestionAnswerComponent elements (extended from HTMlElement) that implement TQuestionSchema definitions
                          }
            endingText?: string;
        }
    */
        this.partialSchemaToUserData(aQuestionnaireSchema, this.formUserData);

        let instructionsDiv : HTMLDivElement | null = null;
        let closingInstructionsDiv : HTMLDivElement | null = null;

        if (aQuestionnaireSchema.instructionsText) {
            instructionsDiv  = this.htmlEl.dom.querySelector<HTMLDivElement>('.instructions');
            if (instructionsDiv) instructionsDiv.innerHTML = '<p>' + aQuestionnaireSchema.instructionsText + '</p>';
        }

        if (aQuestionnaireSchema.endingText) {
            closingInstructionsDiv  = this.htmlEl.dom.querySelector<HTMLDivElement>('.closing-instructions');
            if (closingInstructionsDiv) closingInstructionsDiv.innerHTML = '<p>' + aQuestionnaireSchema.endingText + '</p>';
        }

        aQuestionnaireSchema.questGroups.forEach( (aQuestGroup : TQuestionGroupSchema, groupIndex : number) => {
           this.renderAQuestionGroup(parent, aQuestGroup, groupIndex);
        });

    }

    private renderAQuestionGroup(parent: HTMLElement, aQuestGroupSchema : TQuestionGroupSchema, groupIndex : number) : void {
        /* TQuestionGroupSchema {
              groupHeadingText?: string;
              question: TQuestionSchema[];
            }                                */

        if (!aQuestGroupSchema) return;

        let questGroupDivElem = document.createElement('div') as HTMLDivElement;
        aQuestGroupSchema.groupContainerDiv = questGroupDivElem;
        questGroupDivElem.classList.add('question-group');
        questGroupDivElem.dataset.groupIdx = groupIndex.toString();
        parent.appendChild(questGroupDivElem);

        questGroupDivElem.appendChild(this.createHeading(1, aQuestGroupSchema.groupHeadingText));
        aQuestGroupSchema.questionInstance = [];  //type HTMLElement[]
        aQuestGroupSchema.questionDefinition.forEach( (aQuestSchema : TQuestionSchema, questionIndex : number) => {
            let qaComponent : QuestionAnswerComponent = this.createAQuestionSection(questGroupDivElem, aQuestSchema, groupIndex, questionIndex);
            aQuestGroupSchema.questionInstance![questionIndex]=qaComponent;
        });
    }

    private createAQuestionSection(parentDiv: HTMLDivElement, aQuestSchema : TQuestionSchema, groupIndex : number, questionIndex : number): QuestionAnswerComponent
    /*  interface TQuestionSchema {
          dataNamespace          : string;
          questionText          ?: string;
          replyType              : TReplyType;
          hasDetailsArea        ?: boolean;
          detailsAreaLabelText  ?: string;          //if set to '' then no label shown.  If not specified, default is "Other:".  Only applies if hasDetailsArea is true.
          replies               ?: string[];        // replies will be required if the replyType is oneButton, multiButtons, noneOrOne, or noneOrMulti
          scoreMode             ?: TScoreMode;      //NOTE: currently Values for numeric input are not included in scoring.
          repliesCustomScore    ?: number[];        //see definition of TScoreMode for details.
          placeholder           ?: string;          // Placeholder text for input fields
          minValue              ?: number;          // Minimum value for numeric input.  NOTE: currently Values for numeric input are not included in scoring.
          maxValue              ?: number;          // Maximum value for numeric input   NOTE: currently Values for numeric input are not included in scoring.
          noneButtonLabel       ?: string;          // if replyType mode includes none button, then this label will be for none button.  Default is 'NONE'
        }
    */
    {
        let scoreMode : string = aQuestSchema.scoreMode?.toLowerCase() ?? '';
        this.scoring = this.scoring || scoreMode === "0indexed" || scoreMode === "1indexed" || scoreMode === "custom";

        const section = this.createCategorySection(parentDiv);
        section.classList.add('trackable-question');

        // Create the new QuestionAnswerComponent
        const options : QACompOptions = {
            id : `qa-${aQuestSchema.dataNamespace}`, // Assign a unique ID for easy lookup
            questionData : aQuestSchema,
            groupIndex : groupIndex,
            questionIndex : questionIndex,
        }
        const qaComponent : QuestionAnswerComponent = new QuestionAnswerComponent(options);
        //NOTE: This will be saved into aQuestGroupSchema.questionInstance in caller of this function.

        qaComponent.addEventListener('change', this.handleQuestionOnChange.bind(this));
        section.appendChild(qaComponent);
        return qaComponent; // Return the created component for further use if needed
    }

    private setFormValueToData(groupIndex: number, questionIndex: number, value: TQuestionResults) {
        this.formUserData.questGroupsResults[groupIndex].questionResults[questionIndex] = value;
    }

    private _handleQuestOnChange(event: Event) : void {
        if (event instanceof CustomEvent) {
            let custEvent = event as CustomEvent;
            if (custEvent.detail) {
                let details : QuestionAnswerChangeEventDetail | ButtonToggleEventDetail | null = null;
                if (custEvent.detail.type === "QAAnswerChange") {
                    details = custEvent.detail as QuestionAnswerChangeEventDetail;
                } else if (custEvent.detail.type === "ButtonToggle") {
                    details = custEvent.detail as ButtonToggleEventDetail;
                }
                if (details) {
                    //save data to model
                    const qaComponent : QuestionAnswerComponent = details.target;
                    const groupIndex : number = Number(qaComponent.dataset.groupIndex);
                    const questionIndex : number = Number(qaComponent.dataset.questionIndex);
                    let values : TQuestionResults = qaComponent.getValues();
                    this.setFormValueToData(groupIndex, questionIndex, values);
                }
            }
        }
        this.updatePageState();  //<-- will call this.updateProgressState(), which changes resultingTotalScore is scoring, or 0 if default
        this.formUserData.totalScore = this.resultingTotalScore;
    }
    private debouncedHandleQuestOnChange = debounce(this._handleQuestOnChange.bind(this), 100);
    public handleQuestionOnChange(event: Event) : void {
        //this.debouncedHandleQuestOnChange(event);
        if (event instanceof CustomEvent) {
            const clonedEvent = new CustomEvent(event.type, {
                detail: { ...event.detail },
                bubbles: event.bubbles,
                cancelable: event.cancelable,
            });
            this.debouncedHandleQuestOnChange(clonedEvent);
        }
    }

    // --- Data, Submission, and Autosave Logic ---

    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    public setupFormEventListeners = (): void => {
        //NOTE: Form listeners are also attached to the various question components during rendering of the form
        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Autosave on any change or input via updatePageState
        const updatePageFn = this.updatePageState.bind(this); // Permanently binds 'this' to the method
        // Listen for 'change' events from question-answer-component (CustomEvent) and standard inputs/textareas
        //form.addEventListener('change', updatePageFn);
        //form.addEventListener('input', updatePageFn); // 'input' is better for textareas

        // 'Done' button listener
        const doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.group("Done button clicked");
            console.log("Stack trace at event dispatch:");
            console.trace(); // <-- captures stack from where *dispatchEvent* was called
            console.groupEnd();
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
            if (qaComponent && !isTextareaAnswered && qaComponent.details.trim() !== '') {
                isTextareaAnswered = true;
            }

            if (isQuestionAnswered || isTextareaAnswered) {
                answeredCount++;
            }
        });

        if (this.scoring) {
            this.resultingTotalScore = 0;
            this.formSchema.questGroups.forEach( (qGroup: TQuestionGroupSchema) => {
                if (qGroup.questionInstance) qGroup.questionInstance.forEach( (element: HTMLElement) => {
                    let aQuestInstance = element as QuestionAnswerComponent;
                    this.resultingTotalScore += aQuestInstance.getUnitScore();
                });
            });
        }

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
    public gatherDataForServer = (): TQuestionnaireUserData => {
        return this.formUserData;
    }

    /*
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

        let instructionsText : string = this.formSchema?.instructionsText || '';
        let endingText : string = this.formSchema?.endingText || '';
        resultData["QUESTIONAIRE:INSTRUCTION-TEXT"]=instructionsText;
        resultData["QUESTIONAIRE:ENDING-TEXT"]=endingText;
        if (this.scoring) resultData["QUESTIONAIRE:TOTAL-SCORE"]=this.resultingTotalScore.toString();

        this.formSchema.questGroups.forEach( (aQuestGroup:TQuestionGroupSchema, index : number) => {
          this.gatherQuestionGroupData(aQuestGroup, index, resultData);
        });

        //form.querySelectorAll<HTMLDivElement>('.question-group').forEach( (groupDiv:HTMLDivElement) => {
        //  //let groupIndex = strToNumDef(groupDiv.dataset.groupIdx, -1);
        //  let grpIndexStr = groupDiv.dataset?.groupIdx || '-1';
        //  const heading = groupDiv.querySelector<HTMLHeadingElement>('.question-group-heading');
        //  if (heading) {
        //      let groupHeadingText = heading.innerText;
        //      let key = `${padZero(grpIndexStr)}:GROUP-TITLE`;
        //      resultData[key]=groupHeadingText;
        //  }
        //  // Gather data from question-answer-component elements
        //  groupDiv.querySelectorAll<QuestionAnswerComponent>('question-answer-component').forEach( (qaComp:QuestionAnswerComponent) => {
        //      const dataNamespace = qaComp.dataset.namespace;  //qaComp.getAttribute('data-namespace');
        //      const groupIndex = qaComp.dataset.groupIndex;
        //      const questionIndex = qaComp.dataset.questionIndex;
        //      if (!dataNamespace || !groupIndex || !questionIndex) return;
        //      let keyPrefix = `${padZero(groupIndex)}.${padZero(questionIndex)}:${dataNamespace}`;
        //      let values : TQuestionResults = qaComp.getValues();
        //      resultData[keyPrefix+'^questionText'] = values.questionText;
        //      resultData[keyPrefix+'^value'] = values.value;
        //      if (values.details) resultData[keyPrefix+'^details'] = values.details;
        //  });
        //});

        console.log("Compiled form data:", resultData);
        return resultData;
    }

    public gatherQuestionGroupData(aQuestGroup:TQuestionGroupSchema, groupIndex: number, outResultData: KeyToStrBoolValueObj) {
        let key = `${padZero(groupIndex)}:GROUP-TITLE`;
        outResultData[key]=aQuestGroup.groupHeadingText;

        aQuestGroup.questionInstance?.forEach( (aQuestionEl : QuestionAnswerComponent, questIndex : number) => {
            let aQuestionDef : TQuestionSchema = aQuestGroup.questionDefinition[questIndex];
            this.gatherQuestionData(aQuestionDef, aQuestionEl, groupIndex, questIndex, outResultData);
        });
    }

    public gatherQuestionData(aQuestionDef: TQuestionSchema, aQuestionEl: QuestionAnswerComponent, groupIndex: number, questIndex: number, outResultData: KeyToStrBoolValueObj) {
        let keyPrefix = `${padZero(groupIndex)}.${padZero(questIndex)}:${aQuestionDef.dataNamespace}`;
        outResultData[keyPrefix+'^questionText'] =  aQuestionDef.questionText || '';
        let values : TQuestionResults = aQuestionEl.getValues();
        outResultData[keyPrefix+'^value'] = values.value;
        if (values.details) outResultData[keyPrefix+'^details'] = values.details;
    }
    */

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with form data.
     */
    public serverDataToForm = (data: TQuestionnaireUserData): void => {
        this.clear();
        this.formUserData = data;
        this.partialSchemaToUserData(this.formSchema, this.formUserData); //If data from server was missing some questions etc, this will ensure added.

        if (!this.htmlEl) return;
        const form = this.htmlEl.dom.querySelector('form.content-container');
        if (!form) return;

        // Set isLoadingData flag to true at the beginning of data loading
        this.loadingServerData = true;

        data.questGroupsResults.forEach( (aGroupResults : TQuestionGroupResults, groupIndex : number) => {
            aGroupResults.questionResults.forEach( (aQuestionResults : TQuestionResults, questionIndex : number) => {
                const qaComponent : QuestionAnswerComponent = this.formSchema.questGroups[groupIndex].questionInstance![questionIndex];
                qaComponent.value = aQuestionResults.value;
                qaComponent.details = aQuestionResults.details || '';
            });
        });

        this.loadingServerData = false;  // Set isLoadingData flag back to false after all data is loaded

        this.updatePageState();
    }

    /*
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
    */

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
        h.classList.add('question-group-heading');
        return h;
    }

} //class
