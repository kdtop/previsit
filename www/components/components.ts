// components.ts

export class ToggleButton extends HTMLElement {
  static get observedAttributes() {
    return ['checked'];
  }

  private dom: ShadowRoot;
  private input: HTMLInputElement;
  private span: HTMLSpanElement;
  private labelText: string = 'Option';

  constructor() {
    super();

    this.dom = this.attachShadow({ mode: 'open' });

    this.labelText = this.getAttribute('label') || 'Option';

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
          background-color: #f0f0f0;
          color: #555;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
          cursor: pointer;
          user-select: none;
        }

        input[type='checkbox']:checked + .custom-checkbox-text {
          background-color: #3498db;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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

    this.input.addEventListener('change', () => {
      this.setAttribute('checked', this.input.checked ? '' : null);
      this.dispatchEvent(new CustomEvent('change', {
        detail: { checked: this.input.checked },
        bubbles: true,
        composed: true,
      }));
    });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === 'checked') {
      this.input.checked = this.hasAttribute('checked');
    }
  }

  get checked(): boolean {
    return this.input?.checked;
  }

  set checked(val: boolean) {
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
  }
}

customElements.define('toggle-button', ToggleButton);
