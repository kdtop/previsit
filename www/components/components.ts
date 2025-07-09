// components.ts

export interface ToggleButtonOptions {
    id?: string;
    colors ?: {
      checked ?: {
        color?: string;
        backgroundColor?: string;
      },
      unchecked ?: {
        color?: string;
        backgroundColor?: string;
      }
    }
    label?: string;
    name?: string;
}

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

  private dom: ShadowRoot;
  private input: HTMLInputElement;
  private span: HTMLSpanElement;
  private labelText: string = 'Option';

  constructor(options: ToggleButtonOptions = {}) {
    super();

    this.dom = this.attachShadow({ mode: 'open' });

    let { id,
          colors,
          label,
          name
        } = options;

    let checkedBackgroundColor= '#3498db';  //default color blue.
    let checkedColor= 'white';              //default color;

    let uncheckedBackgroundColor= '#f0f0f0';  //default color gray
    let uncheckedColor= '#555555';            //default color dark gray;

    if (colors) {
      if (colors.checked) {
        if (colors.checked.backgroundColor) checkedBackgroundColor = colors.checked.backgroundColor;
        if (colors.checked.color) checkedColor = colors.checked.color;
      }
      if (colors.unchecked) {
        if (colors.unchecked.backgroundColor) uncheckedBackgroundColor = colors.unchecked.backgroundColor;
        if (colors.unchecked.color) uncheckedColor = colors.unchecked.color;
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

    if (id) this.setAttribute('id', id);
    if (name) this.input.name = name;

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

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === 'checked') {
      this.input.checked = this.hasAttribute('checked');
    }
    if (name === 'disabled') {
      const isDisabled = this.hasAttribute('disabled');
      this.input.disabled = isDisabled;
      this.toggleDisabledState(isDisabled);
    }

  }

  private toggleDisabledState(disabled: boolean) {
    if (disabled) {
      this.span.classList.add('disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.span.classList.remove('disabled');
      this.removeAttribute('aria-disabled');
    }
  }

  get checked(): boolean {
    return this.input?.checked;
  }

  set checked(val: boolean) {
    if (val) {
      this.setAttribute('checked', ''); // Sets the attribute (e.g., <toggle-button checked>)
    } else {
      this.removeAttribute('checked'); // Removes the attribute
    }
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

}

customElements.define('toggle-button', ToggleButton);


//========================================================


import * as SignaturePadModule from 'signature_pad';

/**
 * Options for the SignaturePadComponent constructor.
 */
export interface SignaturePadOptions {
    width?: string;
    height?: string;
    minWidth?: number;
    maxWidth?: number;
    penColor?: string;
    backgroundColor?: string;
}

export class SignaturePadComponent extends HTMLElement {
    private dom: ShadowRoot;
    private signatureCanvas: HTMLCanvasElement | null = null;
    private clearSignatureBtn: HTMLButtonElement | null = null;
    private signaturePad: any | null = null; // SignaturePad instance

    static get observedAttributes() {
        return ['width', 'height'];
    }

    constructor(options: SignaturePadOptions = {}) {
        super();
        this.dom = this.attachShadow({ mode: 'open' });
        this.render(options);
        this.initializeSignaturePad(options);
        this.addEventListeners();
    }

    connectedCallback() {
        // Ensure initial resize and clear when component is added to the DOM
        this._resizeSignatureCanvas();
        // Defer initial resize until after the browser has had a chance to render the canvas
        setTimeout(() => this._resizeSignatureCanvas(), 0);
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (name === 'width' || name === 'height') {
            if (this.signatureCanvas) {
                if (name === 'width') {
                    this.signatureCanvas.style.width = newValue || '100%';
                } else if (name === 'height') {
                    this.signatureCanvas.style.height = newValue || '200px';
                }
                this._resizeSignatureCanvas();
            }
        }
    }

    private render(options: SignaturePadOptions): void {
        const canvasWidth = options.width || this.getAttribute('width') || '100%';
        const canvasHeight = options.height || this.getAttribute('height') || '200px';

        this.dom.innerHTML = `
            <style>
                .signature-area-wrapper {
                    text-align: center;
                }
                canvas {
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    background-color: #fff;
                    touch-action: none; /* Crucial for touch devices to prevent scrolling/zooming */
                    width: ${canvasWidth}; /* Make canvas responsive */
                    height: ${canvasHeight}; /* Fixed height for signature area */
                    display: block; /* Remove extra space below canvas */
                    margin: 0 auto; /* Center the canvas */
                }
                .signature-buttons {
                    margin-top: 15px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                .signature-buttons button {
                    padding: 10px 25px;
                    font-size: 1em;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                }
                .signature-buttons button:hover {
                    transform: translateY(-1px);
                }
                .signature-buttons .clear-btn {
                    background-color: #3498db; /* Blue */
                    color: white;
                }
                .signature-buttons .clear-btn:hover {
                    background-color: #2980b9;
                }
            </style>
            <div class="signature-area-wrapper">
                <canvas id="signature-canvas"></canvas>
                <div class="signature-buttons">
                    <button type="button" class="clear-btn">Clear Signature</button>
                </div>
            </div>
        `;

        this.signatureCanvas = this.dom.querySelector<HTMLCanvasElement>('#signature-canvas');
        this.clearSignatureBtn = this.dom.querySelector<HTMLButtonElement>('.clear-btn');
    }

    private initializeSignaturePad(options: SignaturePadOptions): void {
        if (this.signatureCanvas) {
            this.signaturePad = new (SignaturePadModule.default as any)(this.signatureCanvas, {
                minWidth: options.minWidth ?? 0.5,
                maxWidth: options.maxWidth ?? 2.5,
                penColor: options.penColor ?? 'rgb(0, 0, 0)',
                backgroundColor: options.backgroundColor ?? 'rgb(255, 255, 255)'
            });
        }
    }

    private addEventListeners(): void {
        this.clearSignatureBtn?.addEventListener('click', () => {
            this.clear();
            this.dispatchEvent(new CustomEvent('cleared'));
        });

        if (this.signaturePad) {
            this.signaturePad.addEventListener("endStroke", () => {
                this.dispatchEvent(new CustomEvent('signed'));
            });
        }

        window.addEventListener('resize', () => this._resizeSignatureCanvas());
    }

    private _resizeSignatureCanvas(): void {
        if (this.signatureCanvas && this.signaturePad) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            this.signatureCanvas.width = this.signatureCanvas.offsetWidth * ratio;
            this.signatureCanvas.height = this.signatureCanvas.offsetHeight * ratio;
            this.signatureCanvas.getContext("2d")?.scale(ratio, ratio);
            this.signaturePad.clear(); // Clear the pad on resize as drawing coordinates change
        }
    }

    /**
     * Clears the signature pad.
     */
    public clear(): void {
        this.signaturePad?.clear();
    }

    /**
     * Checks if the signature pad is empty.
     * @returns True if the pad is empty, false otherwise.
     */
    public isEmpty(): boolean {
        return this.signaturePad?.isEmpty() ?? true;
    }

    /**
     * Exports the signature as a data URL.
     * @param imageType The image type (e.g., 'image/png').
     * @param quality The image quality (0 to 1).
     * @returns The data URL string.
     */
    public toDataURL(imageType?: string, quality?: number): string {
        return this.signaturePad?.toDataURL(imageType, quality) ?? '';
    }

    /**
     * Loads an image onto the signature pad from a data URL.
     * @param dataURL The data URL of the image.
     * @param options Options for loading the image.
     */
    public fromDataURL(dataURL: string, options?: any): void {
        this.signaturePad?.fromDataURL(dataURL, options);
    }
}

customElements.define('signature-pad-component', SignaturePadComponent);