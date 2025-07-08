// /opt/worldvista/EHR/web/previsit/www/components/sig_form.ts

// Inherits from TAppView, similar to medication_review.ts
import TAppView, { EnhancedHTMLElement } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { SigFormData } from '../utility/types.js';

// Import the SignaturePad library  -- source: https://github.com/szimek/signature_pad
import * as SignaturePadModule from 'signature_pad';

// Define the specific HTMLElement type for this form's custom elements
export type SigFormHTMLElement = EnhancedHTMLElement & {
    $signatureCanvas?: HTMLCanvasElement | null;
    $clearSignatureBtn?: HTMLButtonElement | null;
    // $saveSignatureBtn?: HTMLButtonElement | null; // Removed as per request
    $dontSignBtn?: HTMLButtonElement | null; // New button
};

/**
 * Represents the Signature Form component, responsible for displaying a consent
 * form with a graphical signature area.
 */
export default class TSigFormAppView extends TAppView<SigFormData> {
    declare htmlEl: SigFormHTMLElement;

    // FIX: Use 'any' for the type annotation of signaturePad
    // This tells TypeScript to temporarily relax type checking for this property,
    // as the underlying issue is likely with the module's type definition or tsconfig.
    private signaturePad: any | null = null; // Instance of SignaturePad

    constructor(aCtrl: TCtrl, opts?: any) {
        super('sig_form', '/api/sig1', aCtrl); // Unique ID, placeholder API URL, controller

        // Define the inner HTML for the component
        const tempInnerHTML = `
            <style>
                .sig-form-container {
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    color: #333;
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 25px;
                    font-size: 2em;
                }
                .content-section {
                    background-color: #f8f8f8;
                    padding: 25px;
                    border-radius: 5px;
                    border: 1px solid #eee;
                    margin-bottom: 25px;
                    line-height: 1.7;
                    font-size: 1.05em;
                }
                .signature-area {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px dashed #a0a0a0;
                    text-align: center;
                }
                .signature-area label {
                    display: block;
                    margin-bottom: 18px;
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #2c3e50;
                }
                canvas {
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    background-color: #fff;
                    touch-action: none; /* Crucial for touch devices to prevent scrolling/zooming */
                    width: 100%; /* Make canvas responsive */
                    height: 200px; /* Fixed height for signature area */
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
                /* Clear signature button is now blue */
                .signature-buttons .clear-btn {
                    background-color: #3498db; /* Blue */
                    color: white;
                }
                .signature-buttons .clear-btn:hover {
                    background-color: #2980b9;
                }
                /* Removed save-btn styles */
                .form-actions {
                    text-align: center;
                    margin-top: 40px;
                    display: flex; /* Added to align buttons */
                    justify-content: center; /* Center buttons */
                    gap: 15px; /* Space between buttons */
                }
                .form-actions button {
                    padding: 15px 30px;
                    font-size: 1.1em;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                }
                .form-actions button:hover {
                    transform: translateY(-1px);
                }
                /* Done button is green by default (when enabled) */
                .form-actions .done-button {
                    background-color: #2ecc71; /* Green */
                    color: white;
                }
                .form-actions .done-button:disabled {
                    background-color: #bdc3c7; /* A neutral gray */
                    cursor: not-allowed;
                }
                .form-actions .done-button:hover:not(:disabled) {
                    background-color: #27ae60;
                }
                /* New Don't Sign button is red */
                .form-actions .dont-sign-btn {
                    background-color: #e74c3c; /* Red */
                    color: white;
                }
                .form-actions .dont-sign-btn:hover {
                    background-color: #c0392b;
                }
            </style>
            <form class="sig-form-container">
                <h1>Patient Consent Form</h1>

                <div class="content-section">
                    <p>ZZZLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
                </div>

                <div class="signature-area">
                    <label for="signature-canvas">Please sign below to confirm your understanding and agreement:</label>
                    <canvas id="signature-canvas" width="400" height="200"></canvas>
                    <div class="signature-buttons">
                        <button type="button" class="clear-btn">Clear Signature</button>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="dont-sign-btn">Don't sign</button>
                    <button type="button" class="done-button">Submit Consent</button>
                </div>
            </form>
        `;
        this.setHTMLEl(tempInnerHTML);

        // Cache DOM elements for the signature pad after setting HTML
        this.htmlEl.$signatureCanvas = this.htmlEl.dom.querySelector<HTMLCanvasElement>('#signature-canvas');
        this.htmlEl.$clearSignatureBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.clear-btn');
        // Removed caching for save button: this.htmlEl.$saveSignatureBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.save-btn');
        this.htmlEl.$dontSignBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.dont-sign-btn'); // Cache new button
        this.htmlEl.$contentsection = this.htmlEl.dom.querySelector<HTMLDivElement>('.content-section'); // Cache content section

        this.initializeSignaturePad(); // Initialize the signature pad

        if (opts) {
            // Process any options passed to the constructor if needed
        }
    }

    /**
     * Resizes the signature canvas to fit its container and adjusts for device pixel ratio.
     * Clears the signature after resizing.
     */
    private _resizeSignatureCanvas(): void {
        if (this.htmlEl.$signatureCanvas && this.signaturePad) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            this.htmlEl.$signatureCanvas.width = this.htmlEl.$signatureCanvas.offsetWidth * ratio;
            this.htmlEl.$signatureCanvas.height = this.htmlEl.$signatureCanvas.offsetHeight * ratio;
            this.htmlEl.$signatureCanvas.getContext("2d")?.scale(ratio, ratio);
            this.signaturePad.clear(); // Clear the pad on resize as drawing coordinates change
        }
    }

    /**
     * Initializes the SignaturePad instance on the canvas.
     */
    private initializeSignaturePad(): void {
        if (this.htmlEl.$signatureCanvas) {
            // FIX: Cast SignaturePadModule.default to 'any' when constructing.
            // This forces TypeScript to accept it as a constructable function at compile time.
            this.signaturePad = new (SignaturePadModule.default as any)(this.htmlEl.$signatureCanvas, {
                minWidth: 0.5,
                maxWidth: 2.5,
                penColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255, 255, 255)'
            });

            // Add event listeners for the clear button
            this.htmlEl.$clearSignatureBtn?.addEventListener('click', () => {
                this.signaturePad?.clear();
                this.updateDoneButtonState();
                console.log("Signature cleared.");
            });

            // Add event listener for window resize to maintain responsiveness
            window.addEventListener('resize', () => this._resizeSignatureCanvas());
            // Initial resize will be handled in loadForms() after DOM is ready
        }
    }

    /**
     * Loads the form content and initializes dynamic elements like the signature pad.
     */
    private async loadForms(): Promise<void> {
        // Restore initial HTML (if the refresh mechanism resets the DOM)
        this.setHTMLEl(this.sourceHTML);

        // Re-cache DOM elements after the HTML has potentially been reset/re-rendered.
        this.htmlEl.$signatureCanvas = this.htmlEl.dom.querySelector<HTMLCanvasElement>('#signature-canvas');
        this.htmlEl.$clearSignatureBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.clear-btn');
        // Removed caching for save button: this.htmlEl.$saveSignatureBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.save-btn');
        this.htmlEl.$dontSignBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.dont-sign-btn'); // Re-cache new button

        this.initializeSignaturePad(); // Re-initialize the signature pad (event listeners will be re-added but this is fine)

        this.setupFormEventListeners(); // Set up any general form event listeners

        await this.prePopulateFromServer(); //evokes call to serverDataToForm()

        // Crucial fix: Defer initial resize until after the browser has had a chance to render the canvas
        setTimeout(() => this._resizeSignatureCanvas(), 0);

        console.log("Signature Form loaded successfully.");
    }

    /**
     * Sets up general event listeners for the form (e.g., form submission).
     */
    private setupFormEventListeners(): void {
        // Add a click listener for the done button
        this.htmlEl.dom.querySelector('.done-button')?.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default form submission
            console.log("Done button clicked!");
            this.handleDoneClick();
        });

        // Add event listener for the new 'Don't sign' button
        this.htmlEl.$dontSignBtn?.addEventListener('click', () => {
            console.log("Don't sign button clicked!");
            this.signaturePad.clear();
            this.updateDoneButtonState();
            this.handleDoneClick();  //this will effect saving an empty signature, removing any prior saved one
        });

        this.signaturePad.addEventListener("endStroke", () => {
          console.log("Signature started");
          this.updateDoneButtonState();
        });

    }

    /**
     * Updates the state of progress
     */
    public updateProgressState = (): void => {
        //NOTE: this overrides ancestor method.

        this.resetProgressState; // Reset progress data to default

        if (!this.htmlEl) return;
        if (!this.signaturePad) return;

        let totalQuestions : number = 1;
        let answeredCount : number = this.signaturePad.isEmpty() ? 0 : 1;

        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = totalQuestions - answeredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }


    public updateDoneButtonState = (): void => {
        //NOTE: this overrides ancestor method.
        this.updateProgressState();  //updates this.progressData

        if (!this.htmlEl ) return;
        let doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        if (!doneButton) return;

        const unansweredCount = this.progressData.unansweredItems || 0;
        // The button is active (not disabled) only when all items are answered.
        doneButton.disabled = (unansweredCount !== 0);
    };



    /**
     * Populates the signature image based on a JSON object from the server.
     * @param data A JSON object with data.
     */
    public serverDataToForm = (data : SigFormData): void => {
        //to do: put data.encodedSignature into the signature pad if available
        if (data.encodedSignature) {
            // Also display in the "Previously Saved Signature" image tag
            if (this.htmlEl.$loadedSignatureImg) {
                this.htmlEl.$loadedSignatureImg.src = data.encodedSignature;
                this.htmlEl.$loadedSignatureImg.style.display = 'block';
            }
            if (this.signaturePad) {
                this.signaturePad.fromDataURL(data.encodedSignature);
                console.log("Signature loaded into pad and display image.");
            }
        } else {
            console.log("No encoded signature found in server data or signature pad not initialized.");
            if (this.htmlEl.$loadedSignatureImg) {
                this.htmlEl.$loadedSignatureImg.style.display = 'none';
                this.htmlEl.$loadedSignatureImg.src = '';
            }
        }
        if (data.displayText && this.htmlEl.$contentsection) {
            this.htmlEl.$contentsection.innerHTML = data.displayText.join('');
        }
        // Update the done button state after loading the data
        this.updateDoneButtonState();
    }

    /**
     * Gathers all medication answers into a structured JSON object.
     * @returns A string representing the signature data in base64 format.
     */
    public gatherDataForServer = (): SigFormData => {
        let encodedSignature = '';
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            encodedSignature = this.signaturePad.toDataURL('image/png');
        }

        let result: SigFormData = {
            encodedSignature: encodedSignature,
            progress: {} // Progress data for the signature form (as per your type)
        }
        console.log("Gathered signature data for server.");

        return result;
    }

    /**
     * Placeholder for the 'about' method.
     */
    public about(): void {
        console.log("Signature Form Component instance initialized.");
    }

    /**
     * Refresh method, typically called when the view needs to be re-rendered or data reloaded.
     */
    public async refresh(): Promise<void> {
        await this.loadForms();
    }
}