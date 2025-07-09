// components.ts
/*
  USAGE NOTE:
    if element is instantiated via this --> const myToggleButton = document.createElement('toggle-button') as ToggleButton;
         then one cannot pass in creation options.
    if element is instantiated via this --> const myToggleButton = new ToggleButton({label : 'NONE', backgroundColor : '#e74c3c' });
        then one CAN pass in initialization options.
*/
export class ToggleButton extends HTMLElement {
    static get observedAttributes() {
        return ['checked'];
    }
    dom;
    input;
    span;
    labelText = 'Option';
    constructor(options = {}) {
        super();
        this.dom = this.attachShadow({ mode: 'open' });
        let { id, colors, label, name } = options;
        let checkedBackgroundColor = '#3498db'; //default color blue.
        let checkedColor = 'white'; //default color;
        let uncheckedBackgroundColor = '#f0f0f0'; //default color gray
        let uncheckedColor = '#555555'; //default color dark gray;
        if (colors) {
            if (colors.checked) {
                if (colors.checked.backgroundColor)
                    checkedBackgroundColor = colors.checked.backgroundColor;
                if (colors.checked.color)
                    checkedColor = colors.checked.color;
            }
            if (colors.unchecked) {
                if (colors.unchecked.backgroundColor)
                    uncheckedBackgroundColor = colors.unchecked.backgroundColor;
                if (colors.unchecked.color)
                    uncheckedColor = colors.unchecked.color;
            }
        }
        this.labelText = label || this.getAttribute('label') || 'Toggle';
        this.dom.innerHTML = `
      <style>
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
          background-color: ${uncheckedBackgroundColor};
          color: ${uncheckedColor};
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
          cursor: pointer;
          user-select: none;
        }

        input[type='checkbox']:checked + .custom-checkbox-text {
          /* background-color: #3498db; */
          background-color: ${checkedBackgroundColor};
          color: ${checkedColor};
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .custom-checkbox-text.disabled {
          opacity: 0.5;
          pointer-events: none;
          cursor: not-allowed;
        }

      </style>
    `;
        const wrapper = document.createElement('label');
        this.input = document.createElement('input');
        this.input.type = 'checkbox';
        this.input.className = 'sr-only';
        this.input.name = this.getAttribute('name') || '';
        this.input.checked = this.hasAttribute('checked');
        this.span = document.createElement('span');
        this.span.className = 'custom-checkbox-text';
        this.span.textContent = this.labelText;
        wrapper.append(this.input, this.span);
        this.dom.append(wrapper);
        if (id)
            this.setAttribute('id', id);
        if (name)
            this.input.name = name;
        this.input.addEventListener('change', () => {
            this.checked = this.input.checked; // This correctly toggles the attribute based on the input's state
            this.dispatchEvent(new CustomEvent('change', {
                detail: { checked: this.input.checked },
                bubbles: true,
                composed: true,
            }));
        });
        // Initialize disabled state if present
        if (this.hasAttribute('disabled')) {
            this.input.disabled = true;
            this.toggleDisabledState(true);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'checked') {
            this.input.checked = this.hasAttribute('checked');
        }
        if (name === 'disabled') {
            const isDisabled = this.hasAttribute('disabled');
            this.input.disabled = isDisabled;
            this.toggleDisabledState(isDisabled);
        }
    }
    toggleDisabledState(disabled) {
        if (disabled) {
            this.span.classList.add('disabled');
            this.setAttribute('aria-disabled', 'true');
        }
        else {
            this.span.classList.remove('disabled');
            this.removeAttribute('aria-disabled');
        }
    }
    get checked() {
        return this.input?.checked;
    }
    set checked(val) {
        if (val) {
            this.setAttribute('checked', ''); // Sets the attribute (e.g., <toggle-button checked>)
        }
        else {
            this.removeAttribute('checked'); // Removes the attribute
        }
    }
    get disabled() {
        return this.hasAttribute('disabled');
    }
    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        }
        else {
            this.removeAttribute('disabled');
        }
    }
}
customElements.define('toggle-button', ToggleButton);
//# sourceMappingURL=components.js.map