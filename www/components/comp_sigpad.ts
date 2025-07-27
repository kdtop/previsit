// comp_sigpad.ts


/*
CONTENTS:

  export class SignaturePadComponent extends HTMLElement

*/

//========================================================

import * as SignaturePadModule from 'signature_pad';

// Hard-coded SVG icons
const svgIcons: Record<string, string> = {
    "SignatureIcon": `
        <?xml version="1.0" encoding="utf-8"?>
            <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
            <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7 7.64848C8 5.40663 10.5 4.2217 12 7.64844C12.3571 8.46415 12.5547 9.27985 12.6158 10.0793M12.6158 10.0793C12.897 13.7579 10.2859 17.0925 7 18.5V14.4233C7 13.6278 7 13.23 7.12969 12.8876C7.24426 12.5852 7.43048 12.315 7.67238 12.1003C7.94619 11.8573 8.3179 11.7158 9.06133 11.4327L12.6158 10.0793ZM12.6158 10.0793L16 8.79077L15.5 12.2176H18M21 16H15M4 16H3"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
    `,
    "SignatureCancelIcon": `
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <svg
           width="800px"
           height="800px"
           viewBox="0 0 24 24"
           version="1.1"
           xmlns="http://www.w3.org/2000/svg">
          <path
             d="M7 7.64848C8 5.40663 10.5 4.2217 12 7.64844C12.3571 8.46415 12.5547 9.27985 12.6158 10.0793M12.6158 10.0793C12.897 13.7579 10.2859 17.0925 7 18.5V14.4233C7 13.6278 7 13.23 7.12969 12.8876C7.24426 12.5852 7.43048 12.315 7.67238 12.1003C7.94619 11.8573 8.3179 11.7158 9.06133 11.4327L12.6158 10.0793ZM12.6158 10.0793L16 8.79077L15.5 12.2176H18M21 16H15M4 16H3"
             stroke="#000000"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
             fill="none"  id="path10" />
          <ellipse
             style="fill:none;stroke:#d70000;stroke-width:1.99516;"
             id="path846"
             cx="11.983898"
             cy="12.338481"
             rx="10.750201"
             ry="10.332856" />
          <path
             style="fill:none;stroke:#d70000;stroke-width:2.1;stroke-linecap:butt;stroke-linejoin:miter;"
             d="M 19.560628,4.8625463 4.3940324,20.029142"
             id="path866" />
        </svg>
    `,
    // Add more icons here as needed
    // "anotherIcon": `<svg>...</svg>`
    //Looke here: https://healthicons.org/ or here https://www.svgrepo.com/vectors/medical/ or here https://www.reshot.com/free-svg-icons/medical/
};



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
    private _savedSigData : string = '';
    private _savedSigOptions : any = {};

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
                    touch-action: none;
                    width: 500px;
                    height: 100px;
                    display: block;
                    margin: 0 auto;
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
                    display: flex; /* Added for icon alignment */
                    align-items: center; /* Added for icon alignment */
                    gap: 8px; /* Space between icon and text */
                }
                .signature-buttons button svg { /* Style for the SVG icon */
                    height: 2em; /* Adjust size as needed, relative to font-size */
                    width: 2em;
                    fill: currentColor; /* Inherit button text color */
                }
                .signature-buttons button:hover {
                    transform: translateY(-1px);
                }
                .signature-buttons .clear-btn {
                    background-color: #3498db;
                    color: white;
                }
                .signature-buttons .clear-btn:hover {
                    background-color: #2980b9;
                }
                .hidden {
                    display: none;
                }

            </style>
            <div class="signature-area-wrapper">
                <canvas id="signature-canvas"></canvas>
                <div class="signature-buttons">
                    <button type="button" class="clear-btn hidden">
                        ${svgIcons["SignatureCancelIcon"]} Clear Signature
                    </button>
                </div>
            </div>
        `;

        this.signatureCanvas = this.dom.querySelector<HTMLCanvasElement>('#signature-canvas');
        this.clearSignatureBtn = this.dom.querySelector<HTMLButtonElement>('.clear-btn');
    }

    /*
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
                    touch-action: none;
                    width: 500px;
                    height: 100px;
                    display: block;
                    margin: 0 auto;
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
                    background-color: #3498db;
                    color: white;
                }
                .signature-buttons .clear-btn:hover {
                    background-color: #2980b9;
                }
                .hidden {
                    display: none;
                }

            </style>
            <div class="signature-area-wrapper">
                <canvas id="signature-canvas"></canvas>
                <div class="signature-buttons">
                    <button type="button" class="clear-btn hidden">Clear Signature</button>
                </div>
            </div>
        `;

        this.signatureCanvas = this.dom.querySelector<HTMLCanvasElement>('#signature-canvas');
        this.clearSignatureBtn = this.dom.querySelector<HTMLButtonElement>('.clear-btn');
    }
    */

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
            this.setClearButtonVisibility(false);
        });

        if (this.signaturePad) {
            this.signaturePad.addEventListener("endStroke", () => {
                this.dispatchEvent(new CustomEvent('signed'));
                this.setClearButtonVisibility(true);
              }
            );
        }
        window.addEventListener('resize', () => this._resizeSignatureCanvas());
    }

    private setClearButtonVisibilityForStatus() : void {
      if (!this.clearSignatureBtn) return;
      this.setClearButtonVisibility(!this.signaturePad.isEmpty());
    }

    private setClearButtonVisibility(visible : boolean) : void {
      if (!this.clearSignatureBtn) return;
      if (visible) {
        this.clearSignatureBtn.classList.remove('hidden');
      } else {
        this.clearSignatureBtn.classList.add('hidden');
      }
    }

    private _resizeSignatureCanvas(): void {
        if (this.signatureCanvas && this.signaturePad) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            this.signatureCanvas.width = this.signatureCanvas.offsetWidth * ratio;
            this.signatureCanvas.height = this.signatureCanvas.offsetHeight * ratio;
            this.signatureCanvas.getContext("2d")?.scale(ratio, ratio);
            this.signaturePad.clear(); // Clear the pad on resize as drawing coordinates change
            this.setSavedSigData();
        }
    }

    /**
     * Clears the signature pad.
     */
    public clear(): void {
        this.signaturePad?.clear();
        this._savedSigData = '';
        this.setClearButtonVisibilityForStatus();
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
        this._savedSigData = dataURL;
        this._savedSigOptions = options;
        this.setSavedSigData();
    }

    /**
     * Reloads an image onto the signature pad from saved data URL and options.
     */
    private setSavedSigData(): void {
        this.signaturePad?.fromDataURL(this._savedSigData, this._savedSigOptions);
        this.setClearButtonVisibilityForStatus();
    }

}

customElements.define('signature-pad-component', SignaturePadComponent);