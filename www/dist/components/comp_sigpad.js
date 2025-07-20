// comp_sigpad.ts
/*
CONTENTS:

  export class SignaturePadComponent extends HTMLElement

*/
//========================================================
import * as SignaturePadModule from 'signature_pad';
export class SignaturePadComponent extends HTMLElement {
    dom;
    signatureCanvas = null;
    clearSignatureBtn = null;
    signaturePad = null; // SignaturePad instance
    _savedSigData = '';
    _savedSigOptions = {};
    static get observedAttributes() {
        return ['width', 'height'];
    }
    constructor(options = {}) {
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
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'width' || name === 'height') {
            if (this.signatureCanvas) {
                if (name === 'width') {
                    this.signatureCanvas.style.width = newValue || '100%';
                }
                else if (name === 'height') {
                    this.signatureCanvas.style.height = newValue || '200px';
                }
                this._resizeSignatureCanvas();
            }
        }
    }
    render(options) {
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
                    /*  width: ${canvasWidth};  Make canvas responsive */
                    width: 500px;
                    height: 100px;
                    /*  height: ${canvasHeight};  Fixed height for signature area */
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
        this.signatureCanvas = this.dom.querySelector('#signature-canvas');
        this.clearSignatureBtn = this.dom.querySelector('.clear-btn');
    }
    initializeSignaturePad(options) {
        if (this.signatureCanvas) {
            this.signaturePad = new SignaturePadModule.default(this.signatureCanvas, {
                minWidth: options.minWidth ?? 0.5,
                maxWidth: options.maxWidth ?? 2.5,
                penColor: options.penColor ?? 'rgb(0, 0, 0)',
                backgroundColor: options.backgroundColor ?? 'rgb(255, 255, 255)'
            });
        }
    }
    addEventListeners() {
        this.clearSignatureBtn?.addEventListener('click', () => {
            this.clear();
            this.dispatchEvent(new CustomEvent('cleared'));
            this.setClearButtonVisibility(false);
        });
        if (this.signaturePad) {
            this.signaturePad.addEventListener("endStroke", () => {
                this.dispatchEvent(new CustomEvent('signed'));
                this.setClearButtonVisibility(true);
            });
        }
        window.addEventListener('resize', () => this._resizeSignatureCanvas());
    }
    setClearButtonVisibilityForStatus() {
        if (!this.clearSignatureBtn)
            return;
        this.setClearButtonVisibility(!this.signaturePad.isEmpty());
    }
    setClearButtonVisibility(visible) {
        if (!this.clearSignatureBtn)
            return;
        if (visible) {
            this.clearSignatureBtn.classList.remove('hidden');
        }
        else {
            this.clearSignatureBtn.classList.add('hidden');
        }
    }
    _resizeSignatureCanvas() {
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
    clear() {
        this.signaturePad?.clear();
        this._savedSigData = '';
        this.setClearButtonVisibilityForStatus();
    }
    /**
     * Checks if the signature pad is empty.
     * @returns True if the pad is empty, false otherwise.
     */
    isEmpty() {
        return this.signaturePad?.isEmpty() ?? true;
    }
    /**
     * Exports the signature as a data URL.
     * @param imageType The image type (e.g., 'image/png').
     * @param quality The image quality (0 to 1).
     * @returns The data URL string.
     */
    toDataURL(imageType, quality) {
        return this.signaturePad?.toDataURL(imageType, quality) ?? '';
    }
    /**
     * Loads an image onto the signature pad from a data URL.
     * @param dataURL The data URL of the image.
     * @param options Options for loading the image.
     */
    fromDataURL(dataURL, options) {
        this._savedSigData = dataURL;
        this._savedSigOptions = options;
        this.setSavedSigData();
    }
    /**
     * Reloads an image onto the signature pad from saved data URL and options.
     */
    setSavedSigData() {
        this.signaturePad?.fromDataURL(this._savedSigData, this._savedSigOptions);
        this.setClearButtonVisibilityForStatus();
    }
}
customElements.define('signature-pad-component', SignaturePadComponent);
//# sourceMappingURL=comp_sigpad.js.map