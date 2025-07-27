// /opt/worldvista/EHR/web/previsit/www/components/consent_form.ts

import TAppView, {  } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { ToggleButton } from './comp_btns.js'; // Import both components
import { SignaturePadComponent } from './comp_sigpad.js'; // Import both components
import { ConsentFormData, TAuthorizedPersonsArray, EnhancedHTMLDivElement } from '../utility/types.js';

// Define the specific HTMLElement type for this form's custom elements
export type PatientConsentFormHTMLElement = EnhancedHTMLDivElement & {
    toggleButtons?: (ToggleButton | undefined | null)[];
    answeredSections?: number;
    signaturePadComponent?: SignaturePadComponent | null;
    repNameInputEl?: HTMLInputElement | null;
    relationshipInputEl?: HTMLInputElement | null;
    dontSignBtn?: HTMLButtonElement | null;
    doneBtn?: HTMLButtonElement | null;
    patientNameEls?: NodeListOf<HTMLSpanElement> | null;
    patientDOBEls?: NodeListOf<HTMLSpanElement> | null;
    signatureSection?: HTMLDivElement | null;
};

/**
 * Represents the Patient Consent Form component, a descendant of TAppView.
 */
export default class TPatientConsentFormAppView extends TAppView<ConsentFormData> {
    declare htmlEl: PatientConsentFormHTMLElement;

    constructor(aCtrl: TCtrl, opts?: any) {
        super('patient_consent_form', '/api/patient_consent', aCtrl); // Unique ID, API URL, controller
    }

    public getCSSContent() : string
    {
        let result : string = super.getCSSContent() +
        `
            <style>
                .patient-consent-form-container {
                    padding: 50px;
                    margin: 0px;
                    background-color: #ffffff;
                    color: #003366;
                }

                .authperson { width: 85%; }

                .authphone { width: 85%; }

                .fullwidth { width: 95%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;}

                .fullname {display: inline-block;  padding-left: 5px; font-weight: normal; }

                .patient-dob {margin-left: 10px;}

                ul {
                    background: #f7f4f2;
                    padding: 10px 10px 10px 30px;
                    border-radius: 5px;
                }

                #signature-section {
                    opacity: 1; /* Start fully visible */
                    background-color:rgb(231, 248, 232);
                    padding: 10px;
                    max-height: 100vh;
                    transition: opacity 1s ease, background-color 1s ease, max-height 1s ease;
                }

                #signature-section.unavailable {
                    opacity: 0; /* Fade out to completely transparent  */
                    background-color:rgb(223, 223, 223);
                    transition: opacity 1.5s ease, background-color 1s ease, max-height 1s ease;
                    max-height: 0px;
                    overflow: hidden;
                    cursor: not-allowed;
                }

                .form-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
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
                .signature-area {
                    margin-top: 3px;
                    padding-top: 10px;
                    text-align: center;
                }
                .signature-area label {
                    display: block;
                    margin-bottom: 18px;
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #2c3e50;
                }
            </style>
        `;
        return result;
    }

    public getHTMLTagContent() : string
    {
        let result : string = `
            <form class="patient-consent-form-container">
                <h2>Patient Consent to Use and Disclose Protected Health Information</h2>

                <h4>Patient: <div class="fullname"><span class="patient-full-name"></span><span class="patient-dob"></span></div> </h4>

                <div class="form-section">
                    <div class="form-section-header">
                        <h3>Section A: Consent for Treatment, Payment, and Healthcare Operations</h3>
                    </div>
                    <p>
                        Family Physicians of Greeneville's <strong></strong>Notice of Privacy Practices</strong> may be found <a href="https://www.familyphysiciansofgreeneville.com/_files/ugd/bd7ca0_69a0b3bae5c14551b7ffba431d2bac3b.pdf" target="_blank">by clicking here.</a>
                        It provides information about how FPG may use and disclose protected health information (PHI) about you. You have the right to, and should, review our
                        Notice before signing this consent. The terms of our Notice may change, and if so, you may obtain a
                        revised copy by contacting the HIPAA Privacy Officer.
                    </p>
                    <p>
                        You have the right to request in writing that we restrict how PHI about you is used or disclosed for
                        treatment, payment, or healthcare operations, though we are not necessarily required to agree to such restrictions.
                    </p>
                    <div class="shaded-text">
                        By signing this form:
                        <ul>
                            <li>You acknowledge that you have received and reviewed our <a href="https://www.familyphysiciansofgreeneville.com/_files/ugd/bd7ca0_69a0b3bae5c14551b7ffba431d2bac3b.pdf" target="_blank" style="margin-right: 2px;"><strong>Notice of Privacy Practices</strong></a>.</li>
                            <li>You consent to our use and disclosure of your PHI for the purposes of treatment, payment, and healthcare operations.</li>
                        </ul>
                    </div>
                    <div class="shaded-text">
                        NOTES:
                        <ul>
                            <li>You have the right to revoke this consent in writing at any time, except to the extent we have already relied on it.</li>
                            <li>You are entitled to receive a copy of this signed consent form upon request.</li>
                            <li>Our HIPAA Privacy Officer is Eddie Hagood (423) 787-7000 x4</li>
                        </ul>
                    </div>
                    <toggle-button id="sectionA-toggle"
                                    label="I agree"
                                    checked-text="I agree"
                                    unchecked-text="Click to Agree"
                                    checked-background-color="#2ecc71"
                                    checked-color="white"
                                    unchecked-background-color="#709bb8"
                                    show-checked="true"
                                    unchecked-color="white"             ></toggle-button>
                </div>
                <hr>

                <div class="form-section">
                    <div class="form-section-header">
                        <h3>Section B: Special Consent Regarding Sensitive Information</h3>
                    </div>
                    <div class="shaded-text">I understand that my protected health information (PHI) used or disclosed may include sensitive information, such as:
                        <ul>
                            <li>Psychotherapy notes</li>
                            <li>Venereal disease(s)</li>
                            <li>Substance abuse treatment</li>
                            <li>HIV/AIDS-related information</li>
                        </ul>
                    </div>
                    <div class="shaded-text">I consent to Family Physicians of Greeneville (FPG) using or disclosing such
                        sensitive information to carry out treatment, payment, or healthcare operations, including:
                        <ul>
                            <li>Use by the mental health provider who created the notes</li>
                            <li>Use in supervised training programs</li>
                            <li>Disclosure to defend a legal proceeding</li>
                        </ul>
                    </div>
                </div>
                <toggle-button id="sectionB-toggle"
                                label="I agree"
                                checked-text="I agree"
                                unchecked-text="Click to Agree"
                                checked-background-color="#2ecc71"
                                checked-color="white"
                                unchecked-background-color="#709bb8"
                                show-checked="true"
                                unchecked-color="white"             ></toggle-button>
                <hr>

                <div class="form-section">
                    <div class="form-section-header">
                        <h3>Section C: How we (FPG) will contact you for appointments, test results, etc.</h3>
                    </div>
                    <div class="shaded-text">I understand that by signing this, I am giving Family Physicians of Greeneville permission to contact me:
                        <ul>
                            <li>By phone (either directly or by leaving a message)</li>
                            <li>By mail (this gives us permission to mail records to you via the address we have on file)</li>
                        </ul>
                    </div>
                    <toggle-button id="sectionC-toggle"
                                    label="I agree"
                                    checked-text="I agree"
                                    unchecked-text="Click to Agree"
                                    checked-background-color="#2ecc71"
                                    checked-color="white"
                                    unchecked-background-color="#709bb8"
                                    show-checked="true"
                                    unchecked-color="white"             ></toggle-button>
                </div>
                <hr>

                <div class="form-section">
                    <div class="form-section-header">
                        <h3>Section D: Authorized Individuals</h3>
                    </div>
                    <p>Please let us (FPG) know with whom we may share your protected health information (PHI).
                        For example, if you would like us to be able to discuss your medical case with a relative or caregiver, we need
                        permission to do so. By listing persons below, you will give us such authorization. </p>
                    <table>
                        <thead>
                            <tr><th>Person Authorized to Access PHI</th><th>Relationship to Patient</th><th>Phone Number</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><input class="authperson" type="text" name="authName1" /></td><td><input class="authperson" type="text" name="authRel1" /></td><td><input class="authphone" type="text" name="authPhone1" /></td></tr>
                            <tr><td><input class="authperson" type="text" name="authRel2" /></td><td><input class="authperson" type="text" name="authRel2" /></td><td><input class="authphone" type="text" name="authPhone2" /></td></tr>
                            <tr><td><input class="authperson" type="text" name="authName3" /></td><td><input class="authperson" type="text" name="authRel3" /></td><td><input class="authphone" type="text" name="authPhone3" /></td></tr>
                        </tbody>
                    </table>
                </div>
                <toggle-button id="sectionD-toggle"
                                label="OK (even if none listed)"
                                checked-text="Above is OK"
                                unchecked-text="Click if OK (even if none listed)"
                                checked-background-color="#2ecc71"
                                unchecked-background-color="#709bb8"
                                show-checked="true"
                                unchecked-color="white"             ></toggle-button>
                <hr>

                <div class="form-section signature-section" id="signature-section">
                    <h3>Signature</h3>
                    <h4>Patient: <div class="fullname"><span class="patient-full-name"></span><span class="patient-dob"></span></div> </h4>

                    <p>By signing below I am authorizing and signing each of the sections (A to D) above. </p>
                    <label for="signature">Signature of patient (or patient's representative):</label>
                    <div class="signature-area">
                        <signature-pad-component id="patient-consent-signature-pad"></signature-pad-component>
                        </div>

                    <label for="repName">If signature is of representative, enter representative's printed name:</label>
                    <input class="fullwidth" type="text" id="repName" name="repName" />

                    <label for="relationship">Representative's relationship to patient:</label>
                    <input class="fullwidth" type="text" id="relationship" name="relationship" />

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
        this.htmlEl.toggleButtons = [];
        this.htmlEl.toggleButtons?.push(this.htmlEl.dom.querySelector<ToggleButton>('#sectionA-toggle'));
        this.htmlEl.toggleButtons?.push(this.htmlEl.dom.querySelector<ToggleButton>('#sectionB-toggle'));
        this.htmlEl.toggleButtons?.push(this.htmlEl.dom.querySelector<ToggleButton>('#sectionC-toggle'));
        this.htmlEl.toggleButtons?.push(this.htmlEl.dom.querySelector<ToggleButton>('#sectionD-toggle'));

        this.htmlEl.signaturePadComponent = this.htmlEl.dom.querySelector<SignaturePadComponent>('#patient-consent-signature-pad');
        this.htmlEl.repNameInputEl = this.htmlEl.dom.querySelector<HTMLInputElement>('#repName');
        this.htmlEl.relationshipInputEl = this.htmlEl.dom.querySelector<HTMLInputElement>('#relationship');
        this.htmlEl.dontSignBtn = this.htmlEl.dom.querySelector<HTMLButtonElement>('.dont-sign-btn');
        this.htmlEl.patientNameEls = this.htmlEl.dom.querySelectorAll<HTMLSpanElement>('.patient-full-name');
        this.htmlEl.patientDOBEls = this.htmlEl.dom.querySelectorAll<HTMLSpanElement>('.patient-dob');
        this.htmlEl.signatureSection = this.htmlEl.dom.querySelector<HTMLDivElement>('#signature-section');
    }

    public clearCachedDOMElements() {
        this.htmlEl.toggleButtons = [];
        this.htmlEl.signaturePadComponent = null;
        this.htmlEl.repNameInputEl = null;
        this.htmlEl.relationshipInputEl = null;
        this.htmlEl.dontSignBtn = null;
        this.htmlEl.patientNameEls = null;
        this.htmlEl.patientDOBEls = null;
        this.htmlEl.signatureSection = null;
    }

    public setupPatientNameDisplay() {
        if (this.htmlEl.patientNameEls) this.htmlEl.patientNameEls.forEach(el => el.textContent = this.ctrl.patientFullName || "zz");
        if (this.htmlEl.patientDOBEls) this.htmlEl.patientDOBEls.forEach(el => el.textContent = this.ctrl.patientDOB || "zz");
    }


    public setupFormEventListeners(): void {
        if (this.htmlEl.toggleButtons) this.htmlEl.toggleButtons.forEach(button => {
            button?.addEventListener('change', () => { // ToggleButton dispatches 'change' event
                console.log(`${button?.id} changed to: ${button?.checked}`);
                this.updateSigAreaVisibility();
            });
        });

        this.htmlEl.signaturePadComponent?.addEventListener('signed', () => {
            console.log("Signature started/updated");
            this.updateSigAreaVisibility();
        });

        this.htmlEl.signaturePadComponent?.addEventListener('cleared', () => {
            console.log("Signature cleared.");
            this.updateSigAreaVisibility();
        });

        this.htmlEl.repNameInputEl?.addEventListener('input', () => {
            this.updateSigAreaVisibility();
        });

        this.htmlEl.relationshipInputEl?.addEventListener('input', () => {
            this.updateSigAreaVisibility();
        });

        this.htmlEl.dom.querySelector('.done-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Done button clicked!");
            this.handleDoneClick();
        });

        this.htmlEl.dontSignBtn?.addEventListener('click', () => {
            this.htmlEl.signaturePadComponent?.clear();
            this.updateProgressState();
            this.handleDoneClick(); // This will effect saving an empty signature, removing any prior saved one
        });

        // Event listeners for authperson and authphone inputs to trigger autosave
        this.htmlEl.dom.querySelectorAll('.authperson, .authphone').forEach(input => {
            input.addEventListener('input', () => {
                this.resetAutosaveTimer();
            });
        });

    }

    /**
     * Updates the state of progress based on the consent form sections and signature.
     */
    public updateProgressState = (): void => {
        this.resetProgressState(); // Reset progress data to default

        if (!this.htmlEl) return;

        let totalSections = this.htmlEl?.toggleButtons?.length ?? 0;
        //let totalSections = this.htmlEl. sectionCount ?? 4; // A, B, C, D
        totalSections++; // Account for the signature as a required "item"

        let answeredSections = 0;
        // Check if each toggle button is checked
        if (this.htmlEl.toggleButtons) this.htmlEl.toggleButtons.forEach(button => {
            if (button?.checked) answeredSections++;
        });
        this.htmlEl.answeredSections = answeredSections;  //For use elsewhere.

        let totalAnswered = answeredSections;
        // Add signature to the "totalAnswered" count if present
        if (this.htmlEl.signaturePadComponent && !this.htmlEl.signaturePadComponent.isEmpty()) {
            totalAnswered++;
        }

        this.progressData.totalItems = totalSections;  //this is count of sections AND signature
        this.progressData.answeredItems = totalAnswered;  //sections AND signature
        this.progressData.unansweredItems = totalSections - totalAnswered;
        this.progressData.progressPercentage = totalSections > 0 ? Math.round((totalAnswered / totalSections) * 100) : 0;
    }

    public updateSigAreaVisibility = () : void => {
        //Signature area is visible to allow finishing.  So FinishState really is visibility state of signature area.
        this.resetAutosaveTimer();
        this.updateProgressState();  //updates this.progressData

        if (this.htmlEl.signatureSection) {
            let totalSections = this.htmlEl?.toggleButtons?.length ?? 0;
            let answeredSections = this.htmlEl.answeredSections ?? 0;
            this.setSigAreaVisibility(answeredSections === totalSections);
        }
        this.updatePageState();
    }

    private setSigAreaVisibility(visible : boolean) {
        if (!this.htmlEl.signatureSection) return;
        let currentlyAvailable = !this.htmlEl.signatureSection.classList.contains('unavailable');
        if (visible === currentlyAvailable) return;
        if (visible) {  //THIS IS CODE FOR FADING IN BLOCK
            this.htmlEl.signatureSection.classList.remove('unavailable');
            let self=this;
            this.htmlEl.signatureSection.addEventListener('transitionend', function handler(event) {
                if (!self.htmlEl?.signatureSection) return;
                if (event.propertyName === 'max-height') {  //every transition will run through this temporarily.
                    if (self.htmlEl.signatureSection) self.scrollToElementSmoothly(self.htmlEl.signatureSection);
                    self.htmlEl.signatureSection.removeEventListener('transitionend', handler); // Clean up listener
                }
            });
        } else {  //THIS IS CODE TO FADE OUT BLOCK
            const self=this;
            this.htmlEl.signatureSection.classList.add('unavailable');  //this will trigger a transition and handler above.
        }
    }

    public updateDoneButtonState(): void
    {
        //NOTE: This function overrides ancestor method

        let unansweredCount = this.progressData.unansweredItems || 0;

        if (!this.htmlEl ) return;
        let doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        if (!doneButton) return;

        let signed : boolean = false;
        if (this.htmlEl.signaturePadComponent) signed = !this.htmlEl.signaturePadComponent.isEmpty();

        // If no items, change text
        if (unansweredCount === 0) {
            doneButton.textContent = 'Done';
            doneButton.disabled = false;
        } else if ((unansweredCount === 1) && (!signed)) {
            doneButton.textContent = `Missing Signature`;
            doneButton.disabled = true;
        } else {
            //doneButton.textContent = `Missing ${unansweredCount} items`;
            doneButton.textContent = `Missing ${unansweredCount} item${unansweredCount > 1 ? 's' : ''}`;
            doneButton.disabled = true;
        }
    };


    /**
     * Populates the form fields based on a JSON object from the server.
     * @param serverData A JSON object with data.
     */
    public serverDataToForm = (serverData: ConsentFormData): void => {
        if (serverData.encodedSignature && this.htmlEl.signaturePadComponent) {
            this.htmlEl.signaturePadComponent.fromDataURL(serverData.encodedSignature);
            console.log("Signature loaded into pad and display image.");
        } else {
            console.log("No encoded signature found or signature pad not initialized.");
            this.htmlEl.signaturePadComponent?.clear(); // Ensure pad is clear if no data
        }

        // Set toggle button states
        if (serverData.sectionsAgreed) serverData.sectionsAgreed.forEach((status, index) => {
            if (this.htmlEl.toggleButtons && this.htmlEl.toggleButtons[index]) {
                this.htmlEl.toggleButtons[index].checked = status;
            }
        });

        // Set text inputs
        if (this.htmlEl.repNameInputEl) this.htmlEl.repNameInputEl.value = serverData?.repName ?? '';
        if (this.htmlEl.relationshipInputEl) this.htmlEl.relationshipInputEl.value = serverData?.relationship ?? '';

        // Populate authorized persons table
        if (serverData?.authPersons) {
            const authPersonRows = this.htmlEl.dom.querySelectorAll<HTMLTableRowElement>('table tbody tr');
            serverData?.authPersons.forEach((person, index) => {
                if (authPersonRows[index]) {
                    const nameInput = authPersonRows[index].querySelector<HTMLInputElement>('.authperson[name^="authName"]');
                    const relInput = authPersonRows[index].querySelector<HTMLInputElement>('.authperson[name^="authRel"]');
                    const phoneInput = authPersonRows[index].querySelector<HTMLInputElement>('.authphone[name^="authPhone"]');
                    if (nameInput) nameInput.value = person.name;
                    if (relInput) relInput.value = person.rel;
                    if (phoneInput) phoneInput.value = person.phone;
                }
            });
        }
        this.updateSigAreaVisibility(); // Update finish state (including done button state) after loading data
    }

    /**
     * Gathers all consent form data into a structured JSON object.
     * @returns A JSON object representing the current state of the form.
     */
    public gatherDataForServer = (): ConsentFormData => {
        let encodedSignature = '';
        if (this.htmlEl.signaturePadComponent && !this.htmlEl.signaturePadComponent.isEmpty()) {
            encodedSignature = this.htmlEl.signaturePadComponent.toDataURL('image/png');
        }

        const authPersonsArr: TAuthorizedPersonsArray = [];
        const authPersonRows = this.htmlEl.dom.querySelectorAll<HTMLTableRowElement>('table tbody tr');
        authPersonRows.forEach( (row : HTMLTableRowElement) => {
            const nameInput : HTMLInputElement | null = row.querySelector<HTMLInputElement>('.authperson[name^="authName"]');
            const relInput : HTMLInputElement | null = row.querySelector<HTMLInputElement>('.authperson[name^="authRel"]');
            const phoneInput : HTMLInputElement | null = row.querySelector<HTMLInputElement>('.authphone[name^="authPhone"]');

            const name = nameInput?.value || '';
            const rel = relInput?.value || '';
            const phone = phoneInput?.value || '';

            // Only add if at least one field is filled
            if (name || rel || phone) {
                authPersonsArr.push({ name, rel, phone });
            }
        });

        let sectionsClicked : boolean[] = [];
        if (this.htmlEl.toggleButtons) this.htmlEl.toggleButtons.forEach(button => {
            sectionsClicked.push(button?.checked || false);
        });

        let result: ConsentFormData = {
            encodedSignature: encodedSignature,
            sectionsAgreed : sectionsClicked,
            repName: this.htmlEl.repNameInputEl?.value ?? '',
            relationship: this.htmlEl.relationshipInputEl?.value ?? '',
            authPersons: authPersonsArr
        };
        console.log("Gathered patient consent data for server.");
        return result;
    }

    public about(): void {
        console.log("Patient Consent Form Component instance initialized.");
    }

}