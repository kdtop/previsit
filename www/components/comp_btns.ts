// components.ts
/*
CONTENTS:

  export class ToggleButton extends HTMLElement

*/
// components.ts

export interface ToggleButtonOptions {
    id?: string;
    state ?: {
      checked ?: {
        color?: string;
        backgroundColor?: string;
        text?: string; // NEW: text option
      },
      unchecked ?: {
        color?: string;
        backgroundColor?: string;
        text?: string; // NEW: text option
      }
    }
    label?: string;
    name?: string;
    checkedBackgroundColor?: string;
    checkedColor?: string;
    checkedText?: string; // NEW: attribute option
    uncheckedBackgroundColor?: string;
    uncheckedColor?: string;
    uncheckedText?: string; // NEW: attribute option
    showChecked?: boolean;
}

export interface ReplyToggleButton extends ToggleButton {
    isRadio?: boolean;
    unitScore?: number;
}

export class ToggleButton extends HTMLElement {
  static get observedAttributes() {
    return [
        'checked',
        'disabled',
        'label',
        'name',
        'checked-background-color',
        'checked-color',
        'checked-text',       // NEW: Observe this attribute
        'unchecked-background-color',
        'unchecked-color',
        'unchecked-text',     // NEW: Observe this attribute
        'show-checked'
    ];
  }

  private dom: ShadowRoot;
  private input: HTMLInputElement | null = null;
  private span: HTMLSpanElement | null = null;
  private checkmarkSvg: SVGSVGElement | null = null;
  public labelText: string = 'Option'; // This will be the base label / fallback

  private _checkedBackgroundColor: string = '#3498db';
  private _checkedColor: string = 'white';
  private _uncheckedBackgroundColor: string = '#f0f0f0';
  private _uncheckedColor: string = '#555555';
  private _showChecked: boolean = false;
  private _checkedText: string = 'Checked'; // Default internal checked text
  private _uncheckedText: string = 'Unchecked'; // Default internal unchecked text

  // Flags to know if text attributes were explicitly set by the user
  private _hasCheckedTextAttribute: boolean = false;
  private _hasUncheckedTextAttribute: boolean = false;

  constructor(options: ToggleButtonOptions = {}) {
    super();

    this.dom = this.attachShadow({ mode: 'open' });

    // Capture initial innerHTML content before render() clears it.
    // This will be used as a fallback for the base labelText.
    const initialInnerHTML = this.textContent?.trim();
    if (initialInnerHTML === '') { // If innerHTML is just whitespace, treat as empty
        // In a real scenario, you might want to explicitly set a default here or let `labelText` handle it.
        // For now, we'll let `labelText` default to 'Toggle' if nothing else is provided.
    }


    // Initialize colors from options or defaults
    if (options.state) {
        if (options.state.checked) {
            this._checkedBackgroundColor = options.state.checked.backgroundColor || this._checkedBackgroundColor;
            this._checkedColor = options.state.checked.color || this._checkedColor;
            // NEW: Initialize _checkedText from options
            this._checkedText = options.state.checked.text || this._checkedText;
        }
        if (options.state.unchecked) {
            this._uncheckedBackgroundColor = options.state.unchecked.backgroundColor || this._uncheckedBackgroundColor;
            this._uncheckedColor = options.state.unchecked.color || this._uncheckedColor;
            // NEW: Initialize _uncheckedText from options
            this._uncheckedText = options.state.unchecked.text || this._uncheckedText;
        }
    }

    // Override with attributes (HTML creation/dynamic updates)
    this._checkedBackgroundColor = this.getAttribute('checked-background-color') || this._checkedBackgroundColor;
    this._checkedColor = this.getAttribute('checked-color') || this._checkedColor;
    this._uncheckedBackgroundColor = this.getAttribute('unchecked-background-color') || this._uncheckedBackgroundColor;
    this._uncheckedColor = this.getAttribute('unchecked-color') || this._uncheckedColor;

    // Initialize text properties from attributes and set flags
    this._hasCheckedTextAttribute = this.hasAttribute('checked-text');
    this._checkedText = this.getAttribute('checked-text') || this._checkedText;

    this._hasUncheckedTextAttribute = this.hasAttribute('unchecked-text');
    this._uncheckedText = this.getAttribute('unchecked-text') || this._uncheckedText;

    this._showChecked = options.showChecked || this.hasAttribute('show-checked');

    // Determine the base labelText: options.label > label attribute > innerHTML > default 'Toggle'
    this.labelText = options.label || this.getAttribute('label') || initialInnerHTML || 'Toggle';

    // If a name is provided in options, set it as an attribute on the custom element itself.
    if (options.name) {
        this.setAttribute('name', options.name);
    } else if (!this.hasAttribute('name')) {
        // If no name in options and no attribute, ensure input name is still handled by render.
        // This 'else if' block might not be strictly necessary if render() is robust,
        // but it highlights the intent to ensure the name attribute is present on 'this'.
    }

    this.render(); // Call render to apply initial styles and create elements
  }  //constructor

  private render(): void {
      this.dom.innerHTML = `
        <style>
          ${this.styleContent()}
        </style>
        <label>
            <input type="checkbox" class="sr-only">
            <span class="custom-checkbox-text">
                <span class="label-text-wrapper"></span> <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </span>
        </label>
      `;

      // Assign references to the elements AFTER they are in the Shadow DOM
      this.input = this.dom.querySelector('input[type="checkbox"]');
      this.span = this.dom.querySelector('.custom-checkbox-text');
      this.checkmarkSvg = this.dom.querySelector('.checkmark');

      // Now set properties that depend on these elements being available
      if (this.input) {
          this.input.name = this.getAttribute('name') || '';
          this.input.checked = this.hasAttribute('checked');
      }

      this.updateButtonText(); // NEW: Call to set initial button text

      this.addEventListeners(); // Add event listeners after elements are created and referenced
  }

  connectedCallback() {
      if (this.hasAttribute('disabled')) {
        if (this.input) {
            this.input.disabled = true;
        }
        this.toggleDisabledState(true);
      }
      // NEW: Ensure text is correctly set if 'checked' attribute was present on initial load
      this.updateButtonText();
  }

  private addEventListeners(): void {
    if (this.input) {
        this.input.addEventListener('change', () => {
          if (this.input) {
            this.checked = this.input.checked; // This setter will call updateButtonText()
            this.dispatchEvent(new CustomEvent('change', {
              detail: { checked: this.input.checked },
              bubbles: true,
              composed: true,
            }));
          }
        });
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'checked':
        if (this.input) {
          this.input.checked = this.hasAttribute('checked');
        }
        this.updateButtonText(); // NEW: Update text when checked state changes
        break;
      case 'disabled':
        const isDisabled = this.hasAttribute('disabled');
        if (this.input) {
          this.input.disabled = isDisabled;
        }
        this.toggleDisabledState(isDisabled);
        break;
      case 'label':
        this.labelText = newValue || 'Toggle';
        this.updateButtonText(); // NEW: Update text when base label changes
        break;
      case 'name':
        if (this.input) this.input.name = newValue || '';
        break;
      case 'checked-background-color':
        this._checkedBackgroundColor = newValue || '#3498db';
        this.updateStyles();
        break;
      case 'checked-color':
        this._checkedColor = newValue || 'white';
        this.updateStyles();
        break;
      case 'checked-text': // NEW: Handle checked-text attribute changes
        this._checkedText = newValue || 'Checked';
        this._hasCheckedTextAttribute = (newValue !== null); // Flag for explicit setting
        this.updateButtonText(); // Update text
        break;
      case 'unchecked-background-color':
        this._uncheckedBackgroundColor = newValue || '#f0f0f0';
        this.updateStyles();
        break;
      case 'unchecked-color':
        this._uncheckedColor = newValue || '#555555';
        this.updateStyles();
        break;
      case 'unchecked-text': // NEW: Handle unchecked-text attribute changes
        this._uncheckedText = newValue || 'Unchecked';
        this._hasUncheckedTextAttribute = (newValue !== null); // Flag for explicit setting
        this.updateButtonText(); // Update text
        break;
      case 'show-checked':
        this._showChecked = this.hasAttribute('show-checked');
        this.updateStyles(); // Re-render styles to reflect the new visibility rule for the checkmark
        break;
    }
  }

  /**
   * NEW: Determines and sets the correct text content for the button based on its state.
   */
  private updateButtonText(): void {
    const labelTextWrapper = this.dom.querySelector('.label-text-wrapper');
    if (!labelTextWrapper) return;

    let displayText = this.labelText; // Start with the base label

    if (this.checked) {
        // If checked, prioritize _checkedText if explicitly provided or different from its default
        if (this._hasCheckedTextAttribute || this._checkedText !== 'Checked') {
            displayText = this._checkedText;
        }
    } else {
        // If unchecked, prioritize _uncheckedText if explicitly provided or different from its default
        if (this._hasUncheckedTextAttribute || this._uncheckedText !== 'Unchecked') {
            displayText = this._uncheckedText;
        }
    }
    labelTextWrapper.textContent = displayText;
  }

  private styleContent() : string {
    let result : string = `
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
        display: flex; /* Use flexbox for alignment of text and checkmark */
        align-items: center; /* Vertically center content */
        justify-content: center; /* Center horizontally (adjust as needed) */
        gap: 8px; /* Space between text and checkmark */
        padding: 7px 12px;
        border-radius: 12px;
        background-color: ${this._uncheckedBackgroundColor};
        color: ${this._uncheckedColor};
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
        cursor: pointer;
        user-select: none;
      }
      input[type='checkbox']:checked + .custom-checkbox-text {
        background-color: ${this._checkedBackgroundColor};
        color: ${this._checkedColor};
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      .custom-checkbox-text.disabled {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
      }

      .label-text-wrapper {
        word-break: normal;
        overflow-wrap: normal; /* Modern equivalent of word-wrap */
        white-space: nowrap; /* Ensure text doesn't wrap unless explicitly told to */
      }

      /* Styles for the checkmark SVG */
      .checkmark {
        width: 1.5em; /* Adjust size as needed, e.g., based on font-size */
        height: 1.5em;
        stroke: currentColor; /* Inherit color from parent (.custom-checkbox-text) */
        transition: opacity 0.2s ease, transform 0.2s ease;
        flex-shrink: 0; /* Prevent it from shrinking */

        /* Initially hidden */
        opacity: 0;
        transform: scale(0.5); /* Start smaller */
      }

      /* Show checkmark only when input is checked AND _showChecked is true */
      input[type='checkbox']:checked + .custom-checkbox-text .checkmark {
          ${this._showChecked ? 'opacity: 1; transform: scale(1);' : 'opacity: 0; transform: scale(0.5);'}
      }
    `;
    return result;
  }

  private updateStyles(): void {
      if (this.dom) {
          const styleTag = this.dom.querySelector('style');
          if (styleTag) {
              styleTag.textContent = this.styleContent();
          }
      }
  }

  private toggleDisabledState(disabled: boolean) {
    if (disabled) {
      if (this.span) {
        this.span.classList.add('disabled');
      }
      this.setAttribute('aria-disabled', 'true');
    } else {
      if (this.span) {
        this.span.classList.remove('disabled');
      }
      this.removeAttribute('aria-disabled');
    }
  }

  get checked(): boolean {
    return this.input?.checked ?? false;
  }

  set checked(val: boolean) {
    //console.log(`ToggleButton: Setting checked for name="${this.getAttribute('name') || 'N/A'}" to value: ${val}`);
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    // The attributeChangedCallback for 'checked' will call updateButtonText()
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get showChecked(): boolean {
    return this._showChecked;
  }

  set showChecked(val: boolean) {
    if (val) {
      this.setAttribute('show-checked', '');
    } else {
      this.removeAttribute('show-checked');
    }
  }

  // NEW: Getters/Setters for checkedText and uncheckedText (optional, but good practice)
  get checkedText(): string {
    return this._checkedText;
  }

  set checkedText(val: string) {
    this.setAttribute('checked-text', val);
  }

  get uncheckedText(): string {
    return this._uncheckedText;
  }

  set uncheckedText(val: string) {
    this.setAttribute('unchecked-text', val);
  }
}

customElements.define('toggle-button', ToggleButton);
