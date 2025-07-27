// comp_quest.ts

import { ToggleButton, ReplyToggleButton, ToggleButtonOptions } from './comp_btns.js'; // Ensure .js extension for module import
import {camelCase, toNumStrDef  } from '../utility/client_utils.js'
import { TQuestion, TReplyType, TScoreMode, QuestionResults } from '../utility/types.js';

// Define the interface for the custom event detail when the answer changes
export interface QuestionAnswerChangeEventDetail {
    dataNamespace: string;
    value: string | number | null; // The combined value of the answer
}

// NEW: Define interface for None button toggle event
export interface NoneButtonToggleEventDetail {
    dataNamespace: string;
    isChecked: boolean;
}

export interface QACompOptions {
    id : string; // Assign a unique ID for easy lookup
    questionData :  TQuestion; // the question object
    groupIndex : number;
    questionIndex : number;
}

interface DetailsBoxElements {
  container: HTMLDivElement;
  textarea: HTMLTextAreaElement;
}

enum DataFlowMode {
    changesFromExternal,                //This is where user interacts with control in web page, or if external JS is making changes.
    changesFromInternal,                //This is when internal code is changing data or web elements.
    attributeChangeFromInternalFlag,    //This is where internal code calls setAttribute() and doesn't need to handle triggered callbacks.
    initalLoading,                      //This is when external code signals this component that it is doing initial loading.
}

enum CallbackType {
    attributeType,
    onButtonChangeType,
    onInputChangeType,
}

interface TPendingCallbackChangeRecord {
    callbackType : CallbackType;
    name : string;
    value ?: any;
}

export class QuestionAnswerComponent extends HTMLElement {
    // observedAttributes will be 'value' for setting/getting the overall answer
    // and 'disabled' for enabling/disabling the component
    static get observedAttributes() {
        return ['value',
                'details',
                'disabled',
               ];
    }

    private dom: ShadowRoot;
    private _value: string = '';   // The combined answer value of button labels.  If type = buttons, then, e.g. 'cane^walker^wheelchair' if those buttons were selected.
    private _details : string = ''; // The details value
    private toggleButtons: ToggleButton[] = [];
    private noneButton : ToggleButton | null = null;
    private noneButtonHideTargets : HTMLElement[] = [];
    private detailsTextArea : HTMLTextAreaElement | null = null;
    private _pendingCallbackRecs : TPendingCallbackChangeRecord[] = [];
    private replyButtonClass : string = 'reply-button';
    private buttonContainer : HTMLDivElement | null = null;
    private sectionContainer : HTMLDivElement | null = null;

    public scoring : boolean = false;
    public questionData: TQuestion | null = null; // Changed from private to public for external access (e.g., scoring)

    //NOTES ABOUT LOADING....    <----- NOTE: I'm not sure this was implemented....
    //If loading is TRUE,  then only data -> controls (but not controls -> data).
    //If loading is FALSE, then only controls -> data (but not data -> controls)
    //The exception is when changes are made via attributes.  These will always be put into data and controls updated UNLESS attributeChangeFromInternalFlag=true
    private _operationDataFlowMode : DataFlowMode = DataFlowMode.changesFromExternal;

    constructor(opts : QACompOptions) {
        super();
        this.dom = this.attachShadow({ mode: 'open' });
        // Initial render, actual buttons/inputs will be rendered by renderContent()
        this.dom.innerHTML = `<style>${this.styleContent()}</style><div class="container"></div>`;
        if (opts) {
            this.questionData = opts.questionData;
            this.id = opts.id;
            this.dataset.groupIndex = opts.groupIndex.toString();
            this.dataset.questionIndex = opts.questionIndex.toString();
        }
        this.dataset.namespace = opts.questionData.dataNamespace
        this.renderContent();
    }

    get loading() : boolean {
        return (this._operationDataFlowMode === DataFlowMode.initalLoading);
    }

    set loading(val : boolean) {
        if (val === true) {
            this._operationDataFlowMode = DataFlowMode.initalLoading;
        } else {
            this._operationDataFlowMode = DataFlowMode.changesFromExternal;
        }
    }

    /*
    // This method will be called when the component is connected to the DOM
    connectedCallback() {
        this.renderContent(); // Render the toggle buttons based on questionData
        this.updateButtonsFromValue(); // Set initial state of buttons if 'value' attribute is present
    }
    */

    private addCallbackRecord(type : CallbackType, name : string, value : any) : void
    {
        this._pendingCallbackRecs.push({callbackType: type, name: name, value: value});
    }

    private callbackRecordFound(type : CallbackType, name : string, value : any) : boolean
    //Returns TRUE if record found.  Also removes any matching record.
    {
        const matchingIndex = this._pendingCallbackRecs.findIndex( (record : TPendingCallbackChangeRecord) : boolean =>
            { return (record.callbackType === type &&
                      record.name === name &&
                      record.value === value
                     );
            }
        );

        let result : boolean = (matchingIndex !== -1);

        if (result) {
            // Remove the matched record from the pending list ---
            this._pendingCallbackRecs.splice(matchingIndex, 1);
            console.log(`  MATCHED and REMOVED internal change for type: ${type}; '${name}' = '${value}'`);
        }
        return result;
    }
    /*


        */

    // This method will be called when observed attributes change
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        oldValue = oldValue || '';
        newValue = newValue || '';
        let isInternalCallback = this.callbackRecordFound(CallbackType.attributeType, name, newValue);

        if (oldValue !== newValue) {
            switch (name) {
                case 'value':
                    this._value = newValue;
                    if (!isInternalCallback) this.updateButtonsFromValues();
                    break;
                case 'details':
                    this._details = newValue;
                    if (!isInternalCallback) this.updateDetailsAreaFromValues();
                    break;
                case 'disabled':
                    if (!isInternalCallback) this.setDisabledState(this.hasAttribute('disabled'));
                    break;
            }
        }

        // Any common logic for attribute changes regardless of origin
        // ...

    }

    setDisabledState(isDisabled: boolean) : void
    {
        this.toggleButtons.forEach(button => {
            button.disabled = isDisabled;
        });

        // Also disable free text/numeric inputs if they exist
        const input = this.dom.querySelector<HTMLInputElement>('.free-text-input, .numeric-input');
        if (input) {
            input.disabled = isDisabled;
        }

        // Also disable Details textarea.
        if (this.detailsTextArea) this.detailsTextArea.disabled = isDisabled;

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
     * Renders the appropriate input elements (toggle buttons or numeric input)
     * based on the `questionData`.
     */
    private renderContent(): void {
        let aQuestion : TQuestion | null = this.questionData;

        if (!aQuestion) {
            this.dom.innerHTML = `<style>${this.styleContent()}</style><p>No question data provided.</p>`;
            return;
        }
        this.dom.innerHTML = `<style>${this.styleContent()}</style>`;

        const questionText : string = aQuestion.questionText || camelCase(aQuestion.dataNamespace);
        let namespace : string = aQuestion.dataNamespace;
        let replyType: TReplyType = aQuestion.replyType;
        let replyList: string[] | undefined = aQuestion.replies;
        let scoreMode: TScoreMode = aQuestion.scoreMode ?? "none";
        let score0Index : boolean = (scoreMode.toLowerCase() === "0indexed");
        let score1Index : boolean = (scoreMode.toLowerCase() === "1indexed");
        let scoreCustom : boolean = (scoreMode.toLowerCase() === "custom");
        let repliesCustomScore : number[] | undefined = aQuestion.repliesCustomScore;
        if (scoreCustom && !repliesCustomScore) scoreCustom = false;
        this.scoring = this.scoring || ( score0Index || score1Index || scoreCustom );

        /*   EXAMPLE OF OUTPUT
        <div class="qa-container">                                                                                          <---- qaContainer.
          <div class="category-section trackable-question">                                                                 <---- sectionContainer
            <h2>Constitutional</h2>                                                                                         <---- heading
            <div class="button-container">                                                                                  <---- buttonContainer
                <ul>                                                                                                        <--- replyULContainer
                    <toggle-button name="constitutional_none" class="none-option-label" data-reply-name="NONE"></toggle-button> <---- noneButton
                    <li><toggle-button name="constitutional_fever" data-reply-name="Fever" class="reply-button"></toggle-button></li>
                    <li><toggle-button name="constitutional_chills" data-reply-name="Chills" class="reply-button"></toggle-button></li>
                    <li><toggle-button name="constitutional_unusual_weight_gain" data-reply-name="Unusual weight gain" class="reply-button"></toggle-button></li>
                    <li><toggle-button name="constitutional_unusual_weight_loss" data-reply-name="Unusual weight loss" class="reply-button"></toggle-button></li>
                </ul>
            </div>
            <div class="details-input-group">
                <label for="constitutional_details">Other:</label>
                <textarea id="constitutional_details" name="constitutional_details" placeholder="Enter details here (optional)..."></textarea>
            </div>
        </div>
        */

        const qaContainer = document.createElement('div');
        this.dom.appendChild(qaContainer);
        qaContainer.classList.add('qa-container');

        this.sectionContainer = this.createCategorySection(qaContainer);
        this.sectionContainer.appendChild(this.createHeading(2, questionText));

        // Create a flex container to hold all buttons in a single row
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.classList.add('button-container'); // flex container to hold all buttons in a single row
        this.sectionContainer.appendChild(this.buttonContainer);

        // Create the list of options using ToggleButton components
        const replyULContainer : HTMLElement = document.createElement('ul'); // Keep <ul> for semantic grouping

        let hasNoneButton = ((replyType ===  "noneOrButtons") || (replyType === "noneOrRadioButtons"));
        let noneToggleButton: ReplyToggleButton | undefined = undefined; // Initialize here

        if (hasNoneButton) {
            // Create the "NONE" ToggleButton and add it to the new container
            let btnLabel : string = aQuestion.noneButtonLabel ?? 'NONE';
            let toggleButtonOpts : ToggleButtonOptions = {
              label : btnLabel,
              state : { checked : { backgroundColor : '#e74c3c' }},
              name: `${namespace}_none`
            }
            noneToggleButton  = new ToggleButton(toggleButtonOpts);
            noneToggleButton.classList.add('none-option-label');
            noneToggleButton.dataset.replyName = btnLabel;
            noneToggleButton.addEventListener('change', this.handleButtonChange.bind(this));
            this.noneButton = noneToggleButton;

            // Pass the target IDs to the toggle-button so its internal checkbox can control visibility
            if (this.scoring) {
                noneToggleButton.classList.add('scoring-item');
                noneToggleButton.unitScore = 0;
            }

            //this.buttonContainer.appendChild(noneToggleButton);
            this.toggleButtons.push(noneToggleButton);
        }

        this.buttonContainer.appendChild(replyULContainer);

        if ((replyList) && (replyType !== 'freeText') && (replyType !== 'numeric')) {
            if (noneToggleButton) replyULContainer.appendChild(noneToggleButton);
            replyList.forEach( (item : string, index : number) => {
                const li = document.createElement('li');
                let toggleButtonOpts : ToggleButtonOptions = {
                    label : item,
                    name: `${namespace}_${item.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
                }
                const aReplyToggleButton : ReplyToggleButton = new ToggleButton(toggleButtonOpts);
                aReplyToggleButton.dataset.replyName = item;
                aReplyToggleButton.addEventListener('change', this.handleButtonChange.bind(this));
                this.toggleButtons.push(aReplyToggleButton);
                aReplyToggleButton.classList.add(this.replyButtonClass);
                aReplyToggleButton.isRadio = (replyType.toLowerCase().includes('radio'));
                this.noneButtonHideTargets.push(aReplyToggleButton);

                if (this.scoring) {
                    let scoreValue : number = 0;  //default
                    if (score0Index) {
                        scoreValue = index;
                    } else if (score1Index) {
                        scoreValue = index + 1;
                    } else if (scoreCustom && repliesCustomScore) {
                        scoreValue = repliesCustomScore[index] || 0;
                    }
                    aReplyToggleButton.unitScore = scoreValue;
                    aReplyToggleButton.classList.add('scoring-item');
                } else {
                    aReplyToggleButton.unitScore = 0;
                }
                li.appendChild(aReplyToggleButton);
                replyULContainer.appendChild(li);
            });
        } else if (replyType === "freeText") {
            // Create a single-line text input for freeText replyType
            const textInput : HTMLInputElement = document.createElement('input');
            textInput.addEventListener('change', this.handleFreeTextInputChange.bind(this));
            textInput.type = 'text';
            textInput.name = `${namespace}_freeText`; // Unique name for data collection
            textInput.placeholder = 'Enter your response here...';
            textInput.classList.add('free-text-input'); // Add a class for potential styling and data reading
            this.sectionContainer.appendChild(textInput);

            // Hide the button container for freeText as it's not relevant
            this.buttonContainer.classList.add('hidden');
        } else if (replyType === 'numeric') {
            const numericInput : HTMLInputElement = document.createElement('input');
            numericInput.addEventListener('change', this.handleNumericInputChange.bind(this));
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
            numericInput.addEventListener('input', function(event : Event) {
                updateNumericInputClass(this as HTMLInputElement);  //this refers to element
            });

            this.sectionContainer.appendChild(numericInput);
        }

        if (aQuestion.hasDetailsArea) {
            const labelText = aQuestion.detailsAreaLabelText ?? 'Other:';
            const infoObj : DetailsBoxElements = this.createDetailsBox(namespace, labelText);
            const detailsBox = infoObj.container;
            const actualTextArea = infoObj.textarea;
            //detailsBox.id = detailsBoxId; // Assign the unique ID
            this.sectionContainer.appendChild(detailsBox);
            actualTextArea.addEventListener('change', this.handleDetailsTextAreaChange.bind(this));
            this.detailsTextArea = actualTextArea;
            this.noneButtonHideTargets.push(detailsBox);
        }

        this.sectionContainer.classList.add('trackable-question');

        return;

    }


    /**
     * Creates a details box (label + textarea) for the given prefix and label text.
     */
    createDetailsBox(prefix: string, labelText: string): DetailsBoxElements {
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
        return { container: div, textarea: textarea };
    }

    /**
     * Creates a heading element of the given level and text.
     */
    createHeading(level: number, text: string): HTMLHeadingElement {
        const h = document.createElement(`h${level}`) as HTMLHeadingElement;
        h.textContent = text;
        return h;
    }

    /*
    private addMutualExclusionListeners = (noneToggleButton: ToggleButton, optionsContainer: HTMLElement): void => {
            // This listener ensures that if any regular replyButton is checked, the "NONE" option is automatically unchecked.
            optionsContainer.addEventListener('change', (event) => {
                // The change event from ToggleButton is a CustomEvent with detail.checked
                const target = event.target as ToggleButton;

                // We only care about toggle-button changes inside the container, and only when they are being checked.
                if (target.tagName === 'TOGGLE-BUTTON' && target.checked) {
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
        }
    */

    private uncheckOtherButtons(instigatorButton : ToggleButton) : void
    //Since radio button, turn OFF all other buttons.
    {
        if (!instigatorButton) return;
        //let questionReplyButtons = this.dom.querySelectorAll<ReplyToggleButton>(`.${this.replyButtonClass}`);
        this.toggleButtons.forEach( (aToggleButton : ReplyToggleButton, index : number) => {
            //console.log(index, aToggleButton.dataset.replyName);
            if (aToggleButton === instigatorButton)  return;  //ignore this one.
            if (aToggleButton.checked) {
                aToggleButton.checked = false;  //doesn't trigger change event.
                console.log('Turned off button:', aToggleButton.dataset.replyName);
                if (aToggleButton == this.noneButton) {
                    // Create and dispatch a 'change' event
                    const changeEvent = new Event('change', {
                        bubbles: true, // Allows the event to bubble up the DOM tree
                        cancelable: true // Allows the event to be canceled
                    });
                    this.noneButton.dispatchEvent(changeEvent);  //dispatch a change event for the NONE button, so it handles hiding.
                }
            }
        });
    }

    /**
     * Handles the 'change' event from individual ToggleButtons.
     */
    private handleButtonChange(event: Event): void {
        const changedButton = event.target as ToggleButton;
        if (!changedButton) return;

        let isInternalCallback = this.callbackRecordFound(CallbackType.onButtonChangeType, '', changedButton);  //allow ignore signal if needed
        if (isInternalCallback) return;

        const replyType = this?.questionData?.replyType || 'buttons';

        if (changedButton === this.noneButton) {  //handle NONE button check.
            this._value = this.noneButton.labelText;
            this.setHideStatePerNoneButton();
            /*
            const isChecked = this.noneButton.checked;
            this.noneButtonHideTargets.forEach( (target : HTMLElement) => {
                target.classList.toggle('hidden', isChecked);
            });
            if (isChecked) {
                // If "NONE" is checked, other sections should be hidden.  So uncheck any checkboxes and clear any textareas within those hidden sections.
                this.uncheckOtherButtons(this.noneButton);
                if (this.detailsTextArea) this.detailsTextArea.value = '';
            }
            */

        } else if (replyType.toLowerCase().includes('radio')) {
            this.uncheckOtherButtons(changedButton);
        } else if (replyType == 'noneOrButtons') {
            //NOTE: We know that changedButton is NOT this.noneButton, because that would have matched if () statement above.
            if (this.noneButton?.checked) {  //<--- actually should never occur, because if checked, then other buttons would be hidden and unclickable.
                this.noneButton.checked = false;  //doesn't trigger change event.
                // Create and dispatch a 'change' event
                const changeEvent = new Event('change', {
                    bubbles: true, // Allows the event to bubble up the DOM tree
                    cancelable: true // Allows the event to be canceled
                });
                this.noneButton.dispatchEvent(changeEvent);  //dispatch a change event for the NONE button, so it handles hiding.
            }
        }
        this.updateValuesFromButtons(); // Update the component's internal _value
        this.dispatchChangeEvent();
    }

    //private debouncedhandleDetailsTextAreaChange = debounce(this.handleDetailsTextAreaChange, 500);
    private handleDetailsTextAreaChange(event: Event): void {
        const changedDetailsTextArea = event.target as HTMLTextAreaElement;
        if (!changedDetailsTextArea) return;
        const value = changedDetailsTextArea.value;
        this._details = value;
        this.dispatchChangeEvent();
    }

    //private debouncedHandleFreeTextInputChange = debounce(this.handleFreeTextInputChange, 500);
    private handleFreeTextInputChange(event: Event): void {
        const changedTextInput = event.target as HTMLInputElement;
        if (!changedTextInput) return;
        let isInternalCallback = this.callbackRecordFound(CallbackType.onInputChangeType, '', changedTextInput);  //allow internal ignore signal if needed
        if (isInternalCallback) return;

        const value = changedTextInput.value;
        this._value = value;
        this.dispatchChangeEvent();
    }

    //private debouncedHandleNumericInputChange = debounce(this.handleNumericInputChange, 500);
    private handleNumericInputChange(event: Event): void {
        const changedNumericInput = event.target as HTMLInputElement
        if (!changedNumericInput) return;
        let isInternalCallback = this.callbackRecordFound(CallbackType.onInputChangeType, '', changedNumericInput);  //allow internal ignore signal if needed
        if (isInternalCallback) return;
        const value = changedNumericInput.value;
        this._value = value;
        this.dispatchChangeEvent();
    }

    private setHideStatePerNoneButton() {
        if (!this.noneButton) return;
        let isChecked = this.noneButton.checked;
        this.noneButtonHideTargets.forEach( (target : HTMLElement) => {
            target.classList.toggle('hidden', isChecked);
        });
        if (isChecked) {
            // If "NONE" is checked, other sections should be hidden.  So uncheck any checkboxes and clear any textareas within those hidden sections.
            this.uncheckOtherButtons(this.noneButton);
            if (this.detailsTextArea) this.detailsTextArea.value = '';
        }

    }

    /*
    private handleNoneButtonChange(event: Event) : void {
        const noneToggleButton = event.target as ToggleButton;
        if (!noneToggleButton) return;
        let isInternalCallback = this.callbackRecordFound(CallbackType.attributeType, '', noneToggleButton);   //allow internal ignore signal if needed
        if (isInternalCallback) return;

        this._value = noneToggleButton.labelText;
        const section = noneToggleButton.parentElement?.parentElement;
        if (!section) return;
        const isChecked = noneToggleButton.checked;
        const targetIds = noneToggleButton.dataset.hideTargetIds;
        if (!targetIds) return;
        targetIds.split(',').forEach(id => {
            const targetEl = section.querySelector(`#${id}`); // Search within the current section
            if (!targetEl) return;
            // Toggle visibility
            targetEl.classList.toggle('hidden', isChecked);

            // If "NONE" is checked (meaning other sections are hidden),
            // uncheck any checkboxes and clear any textareas within those hidden sections.
            if (isChecked) {
                targetEl.querySelectorAll<ToggleButton>('toggle-button').forEach( (toggleBtn : ToggleButton) => {
                    toggleBtn.checked = false
                });
                let textArea = this.detailsTextArea;
                if (!textArea) textArea = targetEl.querySelector('textarea');
                if (textArea) textArea.value = '';
            }
        });
        this.dispatchChangeEvent();
    }
    */

    /**
     * Updates the component's internal `_value` based on the current state of the buttons.
     */
    private updateValuesFromComponents(): void {
        this.updateValuesFromButtons();
        this.updateValuesFromDetailsArea();
    }

    /**
     * Updates the component's internal `_value` based on the current state of the buttons.
     */
    private updateValuesFromButtons(): void {
        this._value = '';
        if (!this.questionData) return;

        // Handle text/numeric inputs separately as their value is direct
        if (this.questionData.replyType === 'freeText') {
            const input = this.dom.querySelector('.free-text-input') as HTMLInputElement;
            this._value = input ? input.value : '';
        } else if (this.questionData.replyType === 'numeric') {
            const input = this.dom.querySelector('.numeric-input') as HTMLInputElement;
            this._value = toNumStrDef(input.value, '0');
        } else { // For button types
            const selectedReplies: string[] = [];
            this.toggleButtons.forEach( (aToggleButton : ToggleButton) => {
                if (aToggleButton.checked !== true) return;
                let aReply = aToggleButton.dataset.replyName;
                if (aReply) selectedReplies.push(aReply);
            });
            this._value = selectedReplies.join('^');
        }

        // Set the attribute so external observers can react
        this.internalSetAttribute('value', this._value);
    }

    private internalSetAttribute(aProperty : string, aValue : any) {
        this.addCallbackRecord(CallbackType.attributeType,aProperty, aValue);  //setup signal
        this.setAttribute(aProperty, aValue);
    }

    private internalRemoveAttribute(aProperty : string) {
        this.addCallbackRecord(CallbackType.attributeType,aProperty, null);  //setup signal
        this.removeAttribute(aProperty);
    }

    /**
     * Updates the component's internal '_details' based on the current state of the buttons.
     */
    private updateValuesFromDetailsArea(): void {
        this._details = '';
        if (this?.questionData?.hasDetailsArea) {
            let textArea = this.detailsTextArea;
            if (!textArea) this.dom.querySelector<HTMLTextAreaElement>('.details-input-group textarea');
            this._details = textArea ? textArea.value || '' : '';
        }
        // Set the attribute so external observers can react
        this.internalSetAttribute('details', this._details);
    }

    /**
     * Updates the checked state of the ToggleButtons or value of inputs based on the component's `_value` and _details.
     */
    private updateComponentsFromValues(): void {
        this.updateButtonsFromValues();
        this.updateDetailsAreaFromValues();
    }
    /**
     * Updates the checked state of the ToggleButtons of inputs based on the component's `_value`
     */
    private updateDetailsAreaFromValues(): void {
        if (this?.questionData?.hasDetailsArea) {
            let textArea = this.detailsTextArea;
            if (!textArea) this.dom.querySelector<HTMLTextAreaElement>('.details-input-group textarea');
            if (textArea) textArea.value = this._details;
        }
    }

    /**
     * Updates the checked state of the ToggleButtons of inputs based on the component's `_value`
     */
    private updateButtonsFromValues(): void {
        if (!this.questionData) return;

        // For text/numeric inputs, set their value directly
        if (this.questionData.replyType === 'freeText') {
            const input = this.dom.querySelector('.free-text-input') as HTMLInputElement;
            if (!input) return;
            if (input.value === this._value) return;
            input.value = this._value;  //shouldn't trigger change event.
            return;
        } else if (this.questionData.replyType === 'numeric') {
            const input = this.dom.querySelector('.numeric-input') as HTMLInputElement;
            if (!input) return;
            let newVal = toNumStrDef(this._value, '0');
            if (input.value === newVal) return;
            input.value = newVal;  //shouldn't trigger change event.
            return;
        } else if (this.questionData.replyType.toLowerCase().includes('buttons')) {
            const currentValues = this._value ? this._value.toString().split('^') : [];
            this.toggleButtons.forEach( (aToggleButton : ToggleButton) => {
                let buttonLabel : string = '';
                buttonLabel = aToggleButton.dataset.replyName || '';
                let newValue = (currentValues.includes(buttonLabel));
                if (aToggleButton.checked === newValue) return;
                aToggleButton.checked = newValue; //shouldn't trigger change event.
                if (aToggleButton === this.noneButton) this.setHideStatePerNoneButton();
            });
        } //if buttonType
    } //updateButtonsFromValues

    private dispatchChangeEvent(): void {
        this.dispatchEvent(new CustomEvent<QuestionAnswerChangeEventDetail>('change', {
            detail: {
                dataNamespace: this.questionData?.dataNamespace || '',
                value: this._value
            },
            bubbles: true,
            composed: true,
        }));
    }

    private styleContent(): string {
        return `
            .container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 10px 0;
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

            /* Utility Class for Hiding Elements */
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

        `;
    }

    /**
     * Public getter for the component's value.
     */
    get details(): string {
        // Ensure the value is up-to-date from the internal inputs/buttons before returning
        //should be already updated via event handlers --> this.updateValuesFromDetailsArea();
        return this._details
    }

    /**
     * Public setter for the component's value.
     */
    set details(val: string) {
        // Do not update if value is same and no actual change is needed, to prevent loop
        val = val ?? '';
        if (this._details == val) return
        this._details = val;
        let savedMode : DataFlowMode = this._operationDataFlowMode;
        this._operationDataFlowMode = DataFlowMode.changesFromExternal;
        if (val !== '') {
            this.internalSetAttribute('details', val);
            this.updateDetailsAreaFromValues();
        } else {
            this.internalRemoveAttribute('details');
            this.updateDetailsAreaFromValues();
        }
        this._operationDataFlowMode = savedMode;
    }

    /**
     * Public getter for the component's value.
     */
    get value(): string {
        // Ensure the value is up-to-date from the internal inputs/buttons before returning
        //should be already updated via event handlers --> this.updateValuesFromButtons();
        return this._value;
    }

    /**
     * Public setter for the component's value.
     */
    set value(val: string) {
        val = val ?? '';
        // Do not update if value is same and no actual change is needed, to prevent loop
        if (this._value == val) return;
        this._value = val;
        let savedMode : DataFlowMode = this._operationDataFlowMode;
        this._operationDataFlowMode = DataFlowMode.changesFromExternal;
        if (val !== '') {
            this.internalSetAttribute('value', val);
        } else {
            this.internalRemoveAttribute('value');
        }
        this.updateButtonsFromValues();
        this._operationDataFlowMode = savedMode;
    }

    /**
     * Public getter for the disabled state.
     */
    get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    /**
     * Public setter for the disabled state.
     */
    set disabled(val: boolean) {
        let savedMode : DataFlowMode = this._operationDataFlowMode;
        this._operationDataFlowMode = DataFlowMode.changesFromExternal;
        if (val) {
            this.internalSetAttribute('disabled', '');
        } else {
            this.internalRemoveAttribute('disabled');
        }
        this.setDisabledState(val);
        this._operationDataFlowMode = savedMode;
    }

    public getUnitScore() : number {
        let result : number = 0;
        this.toggleButtons.forEach( (aToggleButton : ReplyToggleButton) : void => {
            if (aToggleButton.checked) result += (aToggleButton?.unitScore || 0);
        });
        return result;
    }

    public getValues() : QuestionResults
    {
        //should be already updated via event handlers --> this.updateValuesFromComponents();
        let result : QuestionResults = {
            questionText : this.questionData?.questionText ?? '',
            value : this._value,
            details : this._details
        }
        return result;
    }

    public clear() : void
    {
        this.value = '';
        this.details = '';
        this.updateComponentsFromValues();
    }

}

customElements.define('question-answer-component', QuestionAnswerComponent);

// Function to handle the class update logic
function updateNumericInputClass(inputElement : HTMLInputElement): void {
    if (inputElement.value !== '') {
        inputElement.classList.add('numeric-input-has-value');
    } else {
        inputElement.classList.remove('numeric-input-has-value');
    }
}
