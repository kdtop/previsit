// comp_quest.ts

import { ToggleButton } from './comp_btns';
import { TReplyType, TQuestion } from '../utility/types.js';

// Define the interface for the custom event detail when the answer changes
export interface QuestionAnswerChangeEventDetail {
    dataNamespace: string;
    value: string | number | null; // The combined value of the answer
}

export class QuestionAnswerComponent extends HTMLElement {
    // observedAttributes will be 'value' for setting/getting the overall answer
    // and 'disabled' for enabling/disabling the component
    static get observedAttributes() {
        return ['value', 'disabled'];
    }

    private dom: ShadowRoot;
    private questionData: TQuestion | null = null;
    private _value: string | number | null = null; // The combined answer value
    private toggleButtons: ToggleButton[] = [];

    constructor() {
        super();
        this.dom = this.attachShadow({ mode: 'open' });
        this.render();
    }

    // This method will be called when the component is connected to the DOM
    connectedCallback() {
        this.renderButtons(); // Render the toggle buttons based on questionData
        this.updateButtonsFromValue(); // Set initial state of buttons if 'value' attribute is present
    }

    // This method will be called when observed attributes change
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'value':
                this._value = newValue;
                this.updateButtonsFromValue();
                break;
            case 'disabled':
                const isDisabled = this.hasAttribute('disabled');
                this.toggleButtons.forEach(button => {
                    button.disabled = isDisabled;
                });
                break;
        }
    }

    /**
     * Sets the question data for the component. This should be called once the component
     * is connected and before setting the initial value.
     * @param data The TQuestion object containing question details.
     */
    public setQuestionData(data: TQuestion): void {
        this.questionData = data;
        this.renderButtons(); // Re-render buttons if data changes
        this.updateButtonsFromValue(); // Apply current value to new buttons
    }

    /**
     * Renders the appropriate input elements (toggle buttons or numeric input)
     * based on the `questionData`.
     */
    private renderButtons(): void {
        if (!this.questionData) {
            this.dom.innerHTML = `<style>${this.styleContent()}</style><p>No question data provided.</p>`;
            return;
        }

        const { replyType, replies, placeholder, minValue, maxValue } : TQuestion = this.questionData;
        let innerHtmlContent = `<style>${this.styleContent()}</style>`;

        // Clear existing buttons before rendering new ones
        this.toggleButtons = [];

        switch (replyType) {
            case 'buttons':
            case 'radioButtons':
            case 'noneOrButtons':
            case 'noneOrRadioButtons':
                if (replies && replies.length > 0) {
                    innerHtmlContent += `<div class="buttons-container">`;
                    replies.forEach((replyText, index) => {
                        const buttonId = `toggle-${this.questionData?.dataNamespace}-${index}`;
                        innerHtmlContent += `<toggle-button id="${buttonId}" label="${replyText}" data-index="${index}"></toggle-button>`;
                    });

                    // Add 'None' button if applicable
                    if (replyType === 'noneOrButtons' || replyType === 'noneOrRadioButtons') {
                        const noneButtonLabel = this.questionData.noneButtonLabel || 'NONE';
                        innerHtmlContent += `<toggle-button id="toggle-none-${this.questionData?.dataNamespace}" label="${noneButtonLabel}" data-none="true"></toggle-button>`;
                    }
                    innerHtmlContent += `</div>`;
                } else {
                    innerHtmlContent += `<p>No replies defined for this question type.</p>`;
                }
                break;
            case 'freeText':
                innerHtmlContent += `<input type="text" class="free-text-input" placeholder="${placeholder || ''}">`;
                break;
            case 'numeric':
                innerHtmlContent += `<input type="number" class="numeric-input" placeholder="${placeholder || ''}" min="${minValue !== undefined ? minValue : ''}" max="${maxValue !== undefined ? maxValue : ''}">`;
                break;
            default:
                innerHtmlContent += `<p>Unsupported reply type: ${replyType}</p>`;
                break;
        }

        this.dom.innerHTML = innerHtmlContent;

        // After rendering, query and store references to toggle buttons
        if (replyType === 'buttons' || replyType === 'radioButtons' || replyType === 'noneOrButtons' || replyType === 'noneOrRadioButtons') {
            this.toggleButtons = Array.from(this.dom.querySelectorAll('toggle-button')) as ToggleButton[];
            this.addEventListenersToButtons();
        } else if (replyType === 'freeText') {
            const input = this.dom.querySelector('.free-text-input') as HTMLInputElement;
            if (input) {
                input.value = this._value as string || '';
                input.addEventListener('input', () => this.handleFreeTextInputChange(input.value));
            }
        } else if (replyType === 'numeric') {
            const input = this.dom.querySelector('.numeric-input') as HTMLInputElement;
            if (input) {
                input.value = this._value as string || ''; // Numeric values might be stored as string attributes
                input.addEventListener('input', () => this.handleNumericInputChange(parseFloat(input.value)));
            }
        }
    }

    /**
     * Adds event listeners to the toggle buttons.
     * This needs to be called after buttons are rendered.
     */
    private addEventListenersToButtons(): void {
        this.toggleButtons.forEach(button => {
            button.removeEventListener('change', this.handleButtonClick); // Remove existing to prevent duplicates
            button.addEventListener('change', this.handleButtonClick.bind(this));
        });
    }

    /**
     * Handles the 'change' event from individual ToggleButtons.
     */
    private handleButtonClick(event: Event): void {
        const changedButton = event.target as ToggleButton;
        const isChecked = changedButton.checked;
        const dataIndex = changedButton.dataset.index;
        const isNoneButton = changedButton.dataset.none === 'true';

        if (!this.questionData) return;

        const { replyType, replies } = this.questionData;

        if (replyType === 'radioButtons' || replyType === 'noneOrRadioButtons') {
            // For single-selection types (radio buttons), uncheck others
            this.toggleButtons.forEach(button => {
                if (button !== changedButton) {
                    button.checked = false;
                }
            });

            // If 'None' is checked, uncheck all others.
            // If another option is checked, uncheck 'None'.
            if (isNoneButton && isChecked) {
                this.toggleButtons.forEach(button => {
                    if (button !== changedButton && button.dataset.none !== 'true') {
                        button.checked = false;
                    }
                });
            } else if (!isNoneButton && isChecked) {
                const noneButton = this.toggleButtons.find(b => b.dataset.none === 'true');
                if (noneButton) noneButton.checked = false;
            }

        } else if (replyType === 'noneOrButtons') {
            // For multi-selection with 'None' option
            if (isNoneButton && isChecked) {
                // If 'None' is checked, uncheck all other options
                this.toggleButtons.forEach(button => {
                    if (button !== changedButton && button.dataset.none !== 'true') {
                        button.checked = false;
                    }
                });
            } else if (!isNoneButton && isChecked) {
                // If any other option is checked, uncheck 'None'
                const noneButton = this.toggleButtons.find(b => b.dataset.none === 'true');
                if (noneButton) noneButton.checked = false;
            }
        }

        this.updateValueFromButtons(); // Update the component's internal _value
        this.dispatchChangeEvent();
    }

    private handleFreeTextInputChange(value: string): void {
        this._value = value;
        this.dispatchChangeEvent();
    }

    private handleNumericInputChange(value: number): void {
        this._value = value;
        this.dispatchChangeEvent();
    }

    /**
     * Updates the component's internal `_value` based on the current state of the buttons.
     */
    private updateValueFromButtons(): void {
        if (!this.questionData || !this.questionData.replies) {
            this._value = null;
            return;
        }

        const selectedReplies: string[] = [];
        let hasSelection = false;

        this.toggleButtons.forEach(button => {
            if (button.checked) {
                const isNoneButton = button.dataset.none === 'true';
                if (isNoneButton) {
                    selectedReplies.push(this.questionData!.noneButtonLabel || 'NONE');
                } else {
                    const index = parseInt(button.dataset.index || '-1', 10);
                    if (index !== -1 && this.questionData!.replies![index]) {
                        selectedReplies.push(this.questionData!.replies![index]);
                    }
                }
                hasSelection = true;
            }
        });

        if (hasSelection) {
            this._value = selectedReplies.join('^');
        } else {
            this._value = null; // If nothing is selected, the value is null
        }

        // Set the attribute so external observers can react
        if (this._value !== null) {
            this.setAttribute('value', this._value.toString());
        } else {
            this.removeAttribute('value');
        }
    }

    /**
     * Updates the checked state of the ToggleButtons based on the component's `_value`.
     */
    private updateButtonsFromValue(): void {
        if (!this.questionData || !this.questionData.replies || this.toggleButtons.length === 0) {
            return;
        }

        const currentValues = this._value ? this._value.toString().split('^') : [];

        // For text/numeric inputs, set their value directly
        if (this.questionData.replyType === 'freeText') {
            const input = this.dom.querySelector('.free-text-input') as HTMLInputElement;
            if (input) input.value = this._value as string || '';
            return;
        } else if (this.questionData.replyType === 'numeric') {
            const input = this.dom.querySelector('.numeric-input') as HTMLInputElement;
            if (input) input.value = this._value as string || '';
            return;
        }


        this.toggleButtons.forEach(button => {
            const isNoneButton = button.dataset.none === 'true';
            const buttonLabel = isNoneButton ? (this.questionData!.noneButtonLabel || 'NONE') : this.questionData!.replies![parseInt(button.dataset.index || '-1', 10)];

            if (buttonLabel && currentValues.includes(buttonLabel)) {
                button.checked = true;
            } else {
                button.checked = false;
            }
        });
    }

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

    private render(): void {
        // Initial render, actual buttons will be rendered by renderButtons()
        this.dom.innerHTML = `<style>${this.styleContent()}</style><div class="container"></div>`;
    }

    private styleContent(): string {
        return `
            .container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 10px 0;
            }
            toggle-button {
                /* Add any specific styling for the toggle buttons within the component */
            }
            .free-text-input, .numeric-input {
                width: 100%;
                padding: 8px;
                margin-top: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box; /* Include padding and border in the element's total width and height */
            }
        `;
    }

    /**
     * Public getter for the component's value.
     */
    get value(): string | number | null {
        return this._value;
    }

    /**
     * Public setter for the component's value.
     */
    set value(val: string | number | null) {
        if (this._value !== val) {
            this._value = val;
            if (val !== null) {
                this.setAttribute('value', val.toString());
            } else {
                this.removeAttribute('value');
            }
            this.updateButtonsFromValue();
        }
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
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
        this.toggleButtons.forEach(button => {
            button.disabled = val;
        });
    }
}

customElements.define('question-answer-component', QuestionAnswerComponent);