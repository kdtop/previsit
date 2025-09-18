// /opt/worldvista/EHR/web/previsit/www/components/sig_form.ts

// Inherits from TAppView, similar to medication_review.ts
import TAppView, {  } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { SigFormData, EnhancedHTMLDivElement } from '../utility/types.js';
import { SignaturePadComponent } from './comp_sigpad.js'; // Import both components

// Define the specific HTMLElement type for this form's custom elements
export type SigFormHTMLElement = EnhancedHTMLDivElement & {
    signaturePadComponent?: SignaturePadComponent | null; // Use the new component type
    dontSignBtn?: HTMLButtonElement | null;
    contentSection?: HTMLDivElement | null;
};

/**
 * Represents the Signature Form component, responsible for displaying a consent
 * form with a graphical signature area.
 */
export default class TSigFormAppView extends TAppView<SigFormData> {
    declare htmlEl: SigFormHTMLElement;

    constructor(aCtrl: TCtrl, opts?: any) {
        super('sig_form', '/api/sig1', aCtrl); // Unique ID, placeholder API URL, controller

        if (opts) {
            // Process any options passed to the constructor if needed
        }

        this.needPrepopulateWithEachShow = true;

        //Below is to force the page to load the file, so that when encountered in innerHTML, it will have component to match.
        let forceLoad = new SignaturePadComponent();
    }

    public getCSSContent() : string
    {
        let result : string = super.getCSSContent() +
        `
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
                img.loaded-signature-img {
                    max-width: 100%;
                    height: auto;
                    border: 1px solid #ccc;
                    margin-top: 20px;
                    display: none; /* Hidden by default */
                }
                .form-actions {
                    text-align: center;
                    margin-top: 40px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
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
                .form-actions .done-button {
                    background-color: #2ecc71;
                    color: white;
                }
                .form-actions .done-button:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }
                .form-actions .done-button:hover:not(:disabled) {
                    background-color: #27ae60;
                }
                .form-actions .dont-sign-btn {
                    background-color: #e74c3c;
                    color: white;
                }
                .form-actions .dont-sign-btn:hover {
                    background-color: #c0392b;
                }
            </style>
        `;
        return result;
    }

    public getHTMLTagContent() : string
    {
        let result : string = `
            <form class="sig-form-container">
                <h1>Patient Consent Form</h1>

                <div class="content-section">
                    <p>Blank text here</p>
                </div>

                <div class="signature-area">
                    <label for="signature-canvas">Please sign below to confirm your understanding and agreement:</label>
                    <signature-pad-component id="sigPad1"></signature-pad-component>
                    <!--
                    <img class="loaded-signature-img" src="" alt="Previously Saved Signature" style="display: none;">
                    -->
                </div>

                <div class="form-actions">
                    <button type="button" class="dont-sign-btn">Don't sign</button>
                    <button type="button" class="done-button">Submit Consent</button>
                </div>
            </form>
        `;
        return result;
    }

    public cacheDOMElements() {
        super.cacheDOMElements();
        this.htmlEl.signaturePadComponent = this.htmlEl.dom.querySelector<SignaturePadComponent>('#sigPad1');
        this.htmlEl.dontSignBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.dont-sign-btn');
        this.htmlEl.contentSection = this.htmlEl.dom.querySelector<HTMLDivElement>('.content-section');
    }

    /*
    public clearCachedDOMElements() {
        this.htmlEl.signaturePadComponent = null;
        this.htmlEl.dontSignBtn = null;
        this.htmlEl.contentSection = null;
    }
    */

    /**
     * Sets up general event listeners for the form (e.g., form submission).
     */
    public setupFormEventListeners(): void {
        // Add a click listener for the done button
        this.htmlEl.dom.querySelector('.done-button')?.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default form submission
            console.log("Done button clicked!");
            this.handleDoneClick();
        });

        // Add event listener for the new 'Don't sign' button
        this.htmlEl.dontSignBtn?.addEventListener('click', (e) => {
            console.log("Don't sign button clicked!");
            this.htmlEl.signaturePadComponent?.clear();
            this.updatePageState();
            this.handleDoneClick();  //this will effect saving an empty signature, removing any prior saved one
        });

        // Listen for custom events from the signature pad component
        this.htmlEl.signaturePadComponent?.addEventListener('signed', () => {
            console.log("Signature started/updated");
            this.updatePageState();
        });

        this.htmlEl.signaturePadComponent?.addEventListener('cleared', () => {
            console.log("Signature cleared.");
            this.updatePageState();
        });
    }

    /**
     * Updates the state of progress
     */
    public updateProgressState = (): void => {
        //NOTE: this overrides ancestor method.

        this.resetProgressState(); // Reset progress data to default

        if (!this.htmlEl || !this.htmlEl.signaturePadComponent) return;

        let totalQuestions: number = 1;
        let answeredCount: number = this.htmlEl.signaturePadComponent.isEmpty() ? 0 : 1;

        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = totalQuestions - answeredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }

    /*
    public updatePageState(): void
    {
        super.updatePageState(); //will effect call to this.updateProgressState() and this.updateDoneButtonState
    }
    */

    public updateDoneButtonState(): void
    {
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
    public serverDataToForm = (data: SigFormData): void => {
        if (data.encodedSignature) {
            this.htmlEl.signaturePadComponent?.fromDataURL(data.encodedSignature);
            console.log("Signature loaded into pad and display image.");
        } else {
            console.log("No encoded signature found in server data or signature pad not initialized.");
            this.htmlEl.signaturePadComponent?.clear(); // Ensure pad is clear if no data
        }
        if (data.displayText && this.htmlEl.contentSection) {
            this.htmlEl.contentSection.innerHTML = data.displayText.join('');
        }
        this.updatePageState();  // Update the done button state after loading the data
    }

    /**
     * Gathers all medication answers into a structured JSON object.
     * @returns A string representing the signature data in base64 format.
     */
    public gatherDataForServer = (): SigFormData => {
        let encodedSignature = '';
        if (this.htmlEl.signaturePadComponent && !this.htmlEl.signaturePadComponent.isEmpty()) {
            encodedSignature = this.htmlEl.signaturePadComponent.toDataURL('image/png');
        }

        let result: SigFormData = {
            encodedSignature: encodedSignature,
            progress: this.progressData // Pass the progress data
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

}