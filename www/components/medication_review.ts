// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts

import TAppView, { EnhancedHTMLElement } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { AreTakingStatus, YesNoStatus, RefillLocation,
         UserMedicationAnswers, UserMedAnswersArray     } from '../utility/types.js';

interface MedReviewOptions {
    someOption : any;
}

export type MedReviewHTMLElement = EnhancedHTMLElement & {
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
    $medicationDisplayArea?: HTMLDivElement | null;
    $prevMedButton?: HTMLButtonElement | null;
    $nextMedButton?: HTMLButtonElement | null;
    $medProgressMessage?: HTMLSpanElement | null; // New: For "Medication X of Y" message
};

/**
 * Represents the medication_review component as a class, responsible for building and managing the patient history update form.
 */
export default class TMedReviewAppView extends TAppView<UserMedAnswersArray> {
    //NOTE: The generic type <UserMedAnswersArray> is used to represent the array of medication answers.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: MedReviewHTMLElement; // Use 'declare' to override the type of the inherited property

    private doneButton: HTMLButtonElement | null = null;
    private doneButtonMainText: HTMLSpanElement | null = null;
    private doneButtonSubText: HTMLSpanElement | null = null;

    //private medications: string[] = [];
    private currentMedIndex: number = 0;
    private medicationData: UserMedAnswersArray = [];

    constructor(aCtrl: TCtrl, opts?: MedReviewOptions) {
        super('medication_review', '/api/medication_review', aCtrl);
        {   //temp scope for tempInnerHTML
            const tempInnerHTML = `
            <style>
            .medreview-container {
                line-height: 1.6;
                padding: 0 100px; /* Kept for overall container padding */
                background-color: #ffffff;
                color:rgb(43, 42, 42);
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            .header-area {
                padding: 1px;
                background-color: #f8f8f8;
                border-bottom: 1px solid #eee;
                text-align: center;
            }

            .footer-area {
                padding: 15px;
                background-color: #f8f8f8;
                border-top: 1px solid #eee;
                text-align: center;
                margin-top: auto;
            }

            .main-content-area {
                flex-grow: 1;
                padding: 0px 0; /* Padding for top/bottom */
                overflow: hidden;
                position: relative;
                display: flex; /* Use flex to center the medication card */
                flex-direction: column; /* Stack card and nav buttons */
                align-items: center; /* Horizontally center content */
                justify-content: center; /* Vertically center content if space allows */
            }

            h1 {
                text-align: center;
                color: #2c3e50;
                margin-bottom: 30px;
            }

            h2 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5px;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            ul {
                list-style: none;
                padding: 0;
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            li {
                margin-bottom: 0;
            }

            /* --- Custom Checkbox (now radio) Styling --- */
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

            .custom-checkbox-text { /* Renamed from custom-checkbox-text for general use with radios */
                display: inline-block;
                padding: 7px 12px;
                border-radius: 12px;
                background-color: #f0f0f0;
                color: #555;
                transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
                cursor: pointer;
                user-select: none;
            }
            label:hover .custom-checkbox-text {
                background-color: #e2e2e2;
            }

            /* Specific colors based on value for 'taking' question */
            input[name^='taking_'][value='yes']:checked + .custom-checkbox-text {
                background-color: #28a745; /* Green for Yes */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            input[name^='taking_'][value='no']:checked + .custom-checkbox-text {
                background-color: #e74c3c; /* Red for No */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            input[name^='taking_'][value='sometimes']:checked + .custom-checkbox-text {
                background-color: #3498db; /* Blue for Sometimes */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            /* New: I don't know for taking question */
            input[name^='taking_'][value='unknown']:checked + .custom-checkbox-text {
                background-color: #6c757d; /* Dark grey for "I don't know" */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }


            /* Specific colors based on value for 'refill' question */
            input[name^='need_refill_'][value='yes']:checked + .custom-checkbox-text {
                background-color: #3498db; /* Blue for Yes */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            input[name^='need_refill_'][value='no']:checked + .custom-checkbox-text {
                background-color: #e74c3c; /* Red for No */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            /* Specific colors for 'refill_location' questions */
            input[name^='refill_location_']:checked + .custom-checkbox-text {
                background-color: #3498db; /* Blue for refill locations */
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            /* Styles for general labels (like for custom checkboxes) */
            label {
                display: flex;
                align-items: center;
                width: fit-content;
            }

            .details-input-group {
                margin-top: 15px;
                margin-bottom: 25px;
            }

            .details-input-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #444;
            }

            .details-input-group textarea {
                width: 100%;
                min-height: 50px;
                padding: 8px 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1em;
                box-sizing: border-box;
                resize: none;
            }

            /* --- NEW: Specific Styling for Medication Card --- */
            .medication-display-area {
                width: 100%;
                position: relative;
                min-height: 350px; /* Base minimum height */
                display: flex; /* Helps center the absolute card within its own expanded space */
                justify-content: center; /* Horizontally center the absolute card */
                align-items: center;  /* Vertically center the absolute card within its expanded space */
                flex-grow: 1; /* NEW: Make this take up available vertical space */
                padding: 20px 0; /* Add some internal padding to avoid card touching top/bottom of this area */
            }

            .medication-card {
                background-color: #ffffff;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 25px;
                width: 100%;
                max-width: 600px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                position: absolute; /* Keep absolute for transitions */
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%); /* Centers it within .medication-display-area */
                transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out, background-color 0.5s ease; /* Added background-color transition */
                z-index: 10; /* Ensure new card is on top */
            }

            .medication-card-incomplete {
                background-color: #ffe0e0; /* Very light red */
            }

            .medication-card-complete {
                background-color: #e0ffe0; /* Very light green */
            }

            .medication-card.slide-out-left,
            .medication-card.slide-out-right {
                opacity: 0;
                z-index: 5; /* Lower z-index for the card that's flying out */
            }

           .medication-card.slide-out-left {
                transform: translate(-150%, -50%); /* Moves far left */
            }

            .medication-card.slide-out-right {
                transform: translate(50%, -50%); /* Moves far right */
            }

            .medication-card.slide-in-right,
            .medication-card.slide-in-left {
                transform: translate(-50%, -50%);
                opacity: 1;
                z-index: 10; /* Ensure the incoming card is always on top */
            }

            .medication-name {
                font-size: 1.8em;
                font-weight: bold;
                color: #34495e;
                margin-bottom: 20px;
                text-align: center;
            }

            .question-group {
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: solid 1px #ececec;
            }

            .question-group:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .main-question-label {
                display: block;
                margin-bottom: 10px;
                font-weight: bold;
                font-size: 1.1em;
                color: #333;
            }

            .options-list {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }

            .details-input-group {
                margin-top: 15px;
            }

            .details-input-group label {
                margin-bottom: 5px;
            }

            .details-input-group textarea {
                min-height: 80px;
            }

            /* NEW: Navigation Buttons & Progress Message */
            .navigation-area { /* Container for buttons and message */
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;  /* Adjusted: Explicit margin-top instead of auto for consistent gap */
                padding: 0 100px; /* Match container padding */
                width: 100%; /* Take full width of main-content-area */
                max-width: 800px; /* Adjust as needed */
                z-index: 20;
            }

            .navigation-area button {
                padding: 10px 20px;
                font-size: 1em;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.5s ease;
                flex-shrink: 0; /* Prevent buttons from shrinking */
            }

            .navigation-area button:hover:not(:disabled) {
                background-color: #2980b9;
            }

            .navigation-area button:disabled {
                background-color: #cccccc;
                cursor: not-allowed;
            }

            /* New: Next button incomplete/complete states */
            .next-med-button.next-button-incomplete {
                background-color: #ffe0e0; /* Light red */
                color: #333; /* Darker text for contrast */
            }
            .next-med-button.next-button-incomplete:hover:not(:disabled) {
                background-color: #f0c0c0; /* Darker light red on hover */
            }

            .next-med-button.next-button-complete {
                background-color: #28a745; /* Full green */
                color: white;
            }
            .next-med-button.next-button-complete:hover:not(:disabled) {
                background-color: #228b22; /* Darker green on hover */
            }

            .medication-progress-message {
                font-size: 1.1em;
                font-weight: bold;
                color: #555;
                text-align: center;
                flex-grow: 1; /* Allows message to take available space */
                margin: 0 15px; /* Space around the message */
            }

            .done-button {
                width: 100%;
                padding: 12px 25px;
                font-size: 1.1em;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.5s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                line-height: 1.4;
            }

            .done-button-incomplete {
                background-color: #e74c3c;
            }

            .done-button-complete {
                background-color: #28a745;
            }

            .hidden {
                display: none !important;
            }

            .main-content-area {
                flex-grow: 1;
                padding-top: 50px;
                padding-bottom: 20px;
                overflow: hidden; /* Keep overflow hidden for animations */
                position: relative; /* Needed for absolute positioning of cards within it */
                display: flex;
                flex-direction: column; /* Stack card display and navigation vertically */
                align-items: center; /* Horizontally center content */
            }

            /* NEW: Navigation Buttons & Progress Message */
            .navigation-area { /* Container for buttons and message */
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: auto; /* Push navigation to the bottom of main-content-area */
                padding: 0 100px; /* Match container padding */
                width: 100%;
                max-width: 800px;
                z-index: 20; /* Ensure navigation is always on top of cards */
            }

            .medication-header {
                position: relative;
                --checkmark-size: 64px; /* Size of the checkmark icon */
            }
            .medication-header .complete-indicator {
                position: absolute;
                top: calc(var(--checkmark-size) * -0.75); /* Move up by half its height */
                left: calc(var(--checkmark-size) * -0.75); /* Move left by half its width */
                z-index: 30;
                opacity: 0; /* Initially invisible */
                transform: scale(0.5); /* Initially smaller */
                transition: opacity 0.5s ease-out, transform 0.5s ease-out; /* Animation */
            }
            .medication-header.completed .complete-indicator {
                opacity: 1;
                transform: scale(1);
            }
            .medication-header .complete-indicator svg {
                width: var(--checkmark-size);
                height: var(--checkmark-size);
                stroke: none;
            }


            /* Responsive adjustments */
            @media (max-width: 768px) {
                .medreview-container {
                    padding: 0 15px;
                }
                .medication-card {
                    /* Width is now handled by max-width and parent's centering */
                }
                .navigation-area {
                    padding: 0 0; /* Remove horizontal padding here, parent handles it */
                    flex-direction: column; /* Stack buttons and message vertically */
                    gap: 15px; /* Space between stacked items */
                }
                .navigation-area button {
                    width: 100%; /* Full width when stacked */
                }
                .medication-progress-message {
                    order: -1; /* Move message to the top when stacked */
                    margin-bottom: 10px;
                }
                .custom-checkbox-text {
                    padding: 6px 10px;
                    font-size: 0.95em;
                }
            }
            </style>
            <form class='medreview-container'>
                <div class="header-area">
                    <h1>Review Your Medication List</h1>
                    <p><b>Patient:</b> <span class="patient-name"></span></p>
                </div>

                <div class="main-content-area">
                    <div class="medication-display-area">
                        </div>
                    <div class="navigation-area">
                        <button type="button" class="prev-med-button hidden">&larr; Previous</button>
                        <span class="medication-progress-message"></span>
                        <button type="button" class="next-med-button hidden">Next &rarr;</button>
                    </div>
                </div>

                <div class="footer-area">
                    <div class="submission-controls">
                        <button type="button" class="done-button">
                            <span class="done-button-main-text"></span>
                            <span class="done-button-sub-text" style="font-size: 0.8em; opacity: 0.9;"></span>
                        </button>
                    </div>
                </div>
            </form>
            `; //end of innerHTML

            this.setHTMLEl(tempInnerHTML);
        } //end of scope
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor

    /**
     * Builds the entire history update form dynamically within the component.
     * This method is called on refresh and can be adapted later to pre-fill data.
     */
    private async loadForms(): Promise<void> {
        this.setHTMLEl(this.sourceHTML); //restore initial html

        // NEW: Cache the done button elements and new navigation elements
        this.doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        this.doneButtonMainText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-main-text');
        this.doneButtonSubText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-sub-text');
        this.htmlEl.$medicationDisplayArea = this.htmlEl.dom.querySelector<HTMLDivElement>('.medication-display-area');
        this.htmlEl.$prevMedButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.prev-med-button');
        this.htmlEl.$nextMedButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.next-med-button');
        this.htmlEl.$medProgressMessage = this.htmlEl.dom.querySelector<HTMLSpanElement>('.medication-progress-message');

        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector<HTMLSpanElement>('.patient-name');
        if (patientNameEl) {
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
        }

        // Fetch and display medication list
        try {
            const sessionID = this.ctrl.loginData?.sessionID;
            if (sessionID) {
                const resp = await fetch(`/api/medication_review?sessionID=${encodeURIComponent(sessionID)}`);
                if (resp.ok) {
                    const result = await resp.json();
                    if (result.success && result.data && Array.isArray(result.data)) {
                        this.medicationData = result.data; // Store the full list
                        /*
                        this.medications = []; // Clear previous medications
                        result.data.forEach((oneMed: UserMedicationAnswers) => {
                            if (!oneMed.text) oneMed.text = "??";  // Ensure .text is always defined                    }
                            this.medications.push(oneMed.text); // Store only the original text
                        });
                        */
                        //this.medications = result.data; // Store the full list
                        this.currentMedIndex = 0; // Start with the first medication
                        //this.initializeMedicationAnswers(this.medications); // Initialize answer storage
                        this.renderCurrentMedication(this.currentMedIndex); // Render the first medication
                    } else {
                        if (this.htmlEl.$medicationDisplayArea) {
                            this.htmlEl.$medicationDisplayArea.innerHTML = '<p>No medication data found or data is not in expected format.</p>';
                        }
                    }
                } else {
                    if (this.htmlEl.$medicationDisplayArea) {
                        this.htmlEl.$medicationDisplayArea.innerHTML = `<p>Error fetching medication data: ${resp.status} ${resp.statusText}</p>`;
                    }
                }
            } else {
                if (this.htmlEl.$medicationDisplayArea) {
                    this.htmlEl.$medicationDisplayArea.innerHTML = '<p>Session ID not found. Cannot retrieve medication list.</p>';
                }
            }
        } catch (e) {
            console.error("Failed to fetch or display medication list.", e);
            if (this.htmlEl.$medicationDisplayArea) {
                this.htmlEl.$medicationDisplayArea.innerHTML = '<p>An error occurred while loading your medication list.</p>';
            }
        }

        this.setupFormEventListeners();
        this.updateDoneButtonState(); // Update initially
    }

    /**
     * Renders the current medication with its questions.
     * Handles the sliding animation.
     * @param direction 'next' or 'prev' for animation direction
     */
    private renderCurrentMedication(currentMedIndex : number, direction: 'next' | 'prev' | null = null): void {
        if (!this.htmlEl.$medicationDisplayArea) return;

        const oldCard = this.htmlEl.$medicationDisplayArea.querySelector('.medication-card');
        const currentMedication = this.medicationData[currentMedIndex];

        // SVG Checkmark Icon
        const completeCheckboxSVGIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
            </svg>
        `;

        if (!currentMedication) {
            this.htmlEl.$medicationDisplayArea.innerHTML = '<p>No medications to display.</p>';
            this.updateNavigationButtons();
            this.updateDoneButtonState();
            return;
        }

        // Create the new card
        const newCard = document.createElement('div');
        newCard.classList.add('medication-card', 'medication-card-incomplete'); // Start as incomplete
        newCard.innerHTML = `
            <div class="medication-header">
                <div class="complete-indicator">${completeCheckboxSVGIcon}</div>
                <div class="medication-name">${currentMedication.text}</div>
            </div>
            <div class="question-group">
                <label class="main-question-label">Are you currently taking this medication?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="sometimes" class="sr-only"><span class="custom-checkbox-text">Sometimes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="unknown" class="sr-only"><span class="custom-checkbox-text">I don't know</span></label></li>
                </ul>
            </div>

            <div class="question-group refill-question-group hidden"> <label class="main-question-label">Do you need a refill for this medication?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="need_refill_${currentMedIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="need_refill_${currentMedIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                </ul>
                <div class="refill-sub-questions hidden">
                    <label class="main-question-label" style="margin-top: 15px;">Where would you like to pick up your refill?</label>
                    <ul class="options-list">
                        <li><label><input type="radio" name="refill_location_${currentMedIndex}" value="local" class="sr-only"><span class="custom-checkbox-text">Local Pharmacy</span></label></li>
                        <li><label><input type="radio" name="refill_location_${currentMedIndex}" value="mail" class="sr-only"><span class="custom-checkbox-text">Mail Order Pharmacy</span></label></li>
                    </ul>
                </div>
            </div>

            <div class="details-input-group">
                <label for="comment_${currentMedIndex}">Comments about this medication:</label>
                <textarea id="comment_${currentMedIndex}" name="comment_${currentMedIndex}" placeholder="Enter any additional comments here..."></textarea>
            </div>
        `;

        // Pre-fill answers from medicationAnswers array
        const currentMed : UserMedicationAnswers = this.medicationData[currentMedIndex];  //currentMed is a reference to object stored in this.medicationAnswers array
        if (currentMed) {
            // "Are you taking" radios
            const takingRadios = newCard.querySelectorAll<HTMLInputElement>(`input[name="taking_${currentMedIndex}"]`);
            takingRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.areTaking);
            });

            // "Needs refill" radios
            const refillRadios = newCard.querySelectorAll<HTMLInputElement>(`input[name="need_refill_${currentMedIndex}"]`);
            refillRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.needsRefill)
            });

            // "Refill location" radios
            const refillLocationRadios = newCard.querySelectorAll<HTMLInputElement>(`input[name="refill_location_${currentMedIndex}"]`);
            refillLocationRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.refillLocation)
            });

            // Comment textarea
            const commentTextarea = newCard.querySelector<HTMLTextAreaElement>(`#comment_${currentMedIndex}`);
            if (commentTextarea && (currentMed.comment != null)) {
                commentTextarea.value = currentMed.comment;
            }
        }

        // Handle visibility of "Do you need a refill?" question group based on "Are you taking?" answer
        const refillQuestionGroup = newCard.querySelector<HTMLDivElement>('.refill-question-group');
        const takingRadios = newCard.querySelectorAll<HTMLInputElement>(`input[name="taking_${currentMedIndex}"]`);

        if (refillQuestionGroup && takingRadios.length > 0) {
            // Initial state based on loaded data
            if (currentMed && currentMed.areTaking === 'yes') {
                refillQuestionGroup.classList.remove('hidden');
            } else {
                refillQuestionGroup.classList.add('hidden');
                // Clear refill answers if "No" or "Sometimes" or "Unknown" is selected for "areTaking"
                if (currentMed && (currentMed.areTaking === 'no' || currentMed.areTaking === 'sometimes' || currentMed.areTaking === 'unknown')) {
                    currentMed.needsRefill = null; // Direct array access
                    currentMed.refillLocation = null; // Direct array access
                }
            }

            // Add change listener for "Are you taking" radios
            takingRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    if (refillQuestionGroup) {
                        if (target.value === 'yes' && target.checked) {
                            refillQuestionGroup.classList.remove('hidden');
                        } else {
                            refillQuestionGroup.classList.add('hidden');
                            // Clear refill answers when hiding the section
                            newCard.querySelectorAll<HTMLInputElement>(`input[name="need_refill_${currentMedIndex}"]`).forEach(r => r.checked = false);
                            newCard.querySelectorAll<HTMLInputElement>(`input[name="refill_location_${currentMedIndex}"]`).forEach(r => r.checked = false);
                            if (currentMed) { // Direct array access
                                currentMed.needsRefill = null; // Direct array access
                                currentMed.refillLocation = null; // Direct array access
                            }
                        }
                    }
                });
            });
        }

        // Handle visibility of refill sub-questions (local/mail order)
        const refillSubQuestions = newCard.querySelector<HTMLDivElement>('.refill-sub-questions');
        const refillYesRadio = newCard.querySelector<HTMLInputElement>(`input[name="need_refill_${currentMedIndex}"][value="yes"]`);

        if (refillYesRadio && refillSubQuestions) {
            // Initial state based on loaded data
            if (refillYesRadio.checked) {
                refillSubQuestions.classList.remove('hidden');
            } else {
                refillSubQuestions.classList.add('hidden');
                // Ensure refillLocation is cleared if "No" is selected
                if (currentMed && currentMed.needsRefill === 'no') {
                     currentMed.refillLocation = null;
                }
            }
            // Add change listener
            newCard.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.name === `need_refill_${currentMedIndex}` && refillSubQuestions) {
                    if (target.value === 'yes' && target.checked) {
                        refillSubQuestions.classList.remove('hidden');
                    } else if (target.value === 'no' && target.checked) {
                        refillSubQuestions.classList.add('hidden');
                        // Clear sub-question answers if "No" is selected
                        newCard.querySelectorAll<HTMLInputElement>(`input[name="refill_location_${currentMedIndex}"]`).forEach(radio => radio.checked = false);
                        if (currentMed) {
                            currentMed.refillLocation = null; // Direct array access
                        }
                    }
                }
            });
        }

        // Apply animations
        if (oldCard && direction) {
            // Animate the old card out
            oldCard.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
            oldCard.addEventListener('transitionend', () => {
                if (oldCard.parentNode) {
                    oldCard.parentNode.removeChild(oldCard);
                }
            }, { once: true });

            // Animate the new card in
            // Set initial state for the new card before appending
            newCard.style.transform = direction === 'next' ? 'translate(150%, -50%)' : 'translate(-150%, -50%)'; // Start off-screen
            newCard.style.opacity = '0';
            this.htmlEl.$medicationDisplayArea.appendChild(newCard);

            // Force reflow to ensure the initial state is applied before transition
            newCard.offsetWidth; // Trigger reflow

            // Apply the final state for the transition
            newCard.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
            // Remove the specific transform and opacity styles applied initially to let classes take over
            newCard.style.transform = '';
            newCard.style.opacity = '';
            newCard.addEventListener('transitionend', () => {
                if (newCard) {
                    newCard.classList.remove('slide-in-right', 'slide-in-left'); // Clean up class after transition
                }
            }, { once: true });


        } else {
            // No animation on initial load
            this.htmlEl.$medicationDisplayArea.innerHTML = ''; // Clear previous content directly
            this.htmlEl.$medicationDisplayArea.appendChild(newCard);
        }

        this.updateNavigationButtons();
        this.addCardEventListeners(newCard); // Removed medicationName parameter
        this.updateCardCompletionState(newCard); // Update card color, checkmark, and next button
        this.updateDoneButtonState(); // Update the done button state after rendering a new card
    }

    /**
     * Adds event listeners to the currently displayed medication card for data capture.
     * @param cardEl The HTML element of the current medication card.
     */
    private addCardEventListeners(cardEl: HTMLElement): void {
        cardEl.addEventListener('change', (e) => {
            this.captureMedicationAnswer(e.target as HTMLInputElement | HTMLTextAreaElement);
            this.updateCardCompletionState(cardEl); // Update card color, checkmark, and next button on change
            this.resetAutosaveTimer();
            this.updateDoneButtonState();
        });
        cardEl.addEventListener('input', (e) => {
            // For textareas, 'input' event captures changes more granularly
            const target = e.target as HTMLTextAreaElement;
            if (target.tagName === 'TEXTAREA') {
                this.captureMedicationAnswer(target);
                this.resetAutosaveTimer();
                this.updateDoneButtonState();
            }
        });
    }

    /**
     * Captures the answer for the current medication and updates the medicationAnswers array.
     * @param medicationName The name of the medication (used for consistency in function signature, but not for lookup here).
     * @param target The input or textarea element that changed.
     */
    private captureMedicationAnswer(target: HTMLInputElement | HTMLTextAreaElement): void {
        const currentMed : UserMedicationAnswers = this.medicationData[this.currentMedIndex]; // Direct array access
        if (!currentMed) return;
        if (!target || !target.value) return; // Ensure target is valid
        let value = target.value.trim();

        if (target.name.startsWith('taking_')) {
            if (['yes', 'no', 'sometimes', 'unknown'].includes(target.value) == true) {
                currentMed.areTaking = value as AreTakingStatus;
                if (currentMed.areTaking !== 'yes') {
                    currentMed.needsRefill = null;
                    currentMed.refillLocation = null;
                }
            }
        } else if (target.name.startsWith('need_refill_')) {
            if (['yes', 'no'].includes(target.value) == true) {
                currentMed.needsRefill = target.value as YesNoStatus;
                if (target.value === 'no') {  // If refill is 'no', ensure refillLocation is nullified
                    currentMed.refillLocation = null;
                }
            }
        } else if (target.name.startsWith('refill_location_')) {
            if (['local', 'mail'].includes(target.value) == true) {
                currentMed.refillLocation = target.value as RefillLocation;
            }
        } else if (target.name.startsWith('comment_')) {
            currentMed.comment = (target as HTMLTextAreaElement).value.trim();
        }
    }

    /**
     * Checks if a given medication's questions are fully answered.
     * @param medicationIndex The index of the medication to check.
     * @returns True if all required questions are answered, false otherwise.
     */
    private isMedicationAnsweredComplete(medicationIndex: number, forceRecalc: boolean = false): boolean { // Changed parameter to medicationIndex
        const currentMed = this.medicationData[medicationIndex]; // currentMed is a reference to object stored in this.medicationAnswers array
        if (!currentMed) return false;
        if ((currentMed.isComplete !== null) && (forceRecalc !== true)) {
            //Note: isComplete will be set to null when recalculation of state is needed.
            return currentMed.isComplete; // If already set, return the cached value
        }

        const takingAnswered = ((currentMed.areTaking !== null) && (currentMed.areTaking !== undefined));
        let result : boolean = false;  //default to false

        // If 'areTaking' is 'no', 'sometimes', or 'unknown', then refill questions are not applicable.
        if (currentMed.areTaking === 'no' || currentMed.areTaking === 'sometimes' || currentMed.areTaking === 'unknown') {
            result = takingAnswered; // Only 'areTaking' needs to be answered
        } else {
            // If 'areTaking' is 'yes', then refill questions are required.
            const needsRefillAnswered = (currentMed.needsRefill !== null) && (currentMed.needsRefill !== undefined);
            let refillLocationAnswered = true; // Assume true unless 'yes' to refill

            if (currentMed.needsRefill === 'yes') {
                refillLocationAnswered = (currentMed.refillLocation !== null) && (currentMed.refillLocation !== undefined);
            }
            result = takingAnswered && needsRefillAnswered && refillLocationAnswered;
        }
        currentMed.isComplete = result; // Cache the result in the current medication object
        return result;
    }

    /**
     * Updates the background color of the medication card and the visibility of the checkmark.
     * Also updates the color of the Next button.
     * @param cardEl The HTML element of the current medication card.
     * @param medicationName The name of the medication.
     */
    private updateCardCompletionState(cardEl: HTMLElement): void {
        const medicationHeader = cardEl.querySelector('.medication-header');
        if (!medicationHeader) return;

        if (this.isMedicationAnsweredComplete(this.currentMedIndex, true)) { // Use currentMedIndex, forcing recalculation
            cardEl.classList.remove('medication-card-incomplete');
            cardEl.classList.add('medication-card-complete');
            medicationHeader.classList.add('completed'); // Shows the checkmark

            // Update Next button color if it exists
            if (this.htmlEl.$nextMedButton) {
                this.htmlEl.$nextMedButton.classList.remove('next-button-incomplete');
                this.htmlEl.$nextMedButton.classList.add('next-button-complete');
            }
        } else {
            cardEl.classList.remove('medication-card-complete');
            cardEl.classList.add('medication-card-incomplete');
            medicationHeader.classList.remove('completed'); // Hides the checkmark

            // Update Next button color if it exists
            if (this.htmlEl.$nextMedButton) {
                this.htmlEl.$nextMedButton.classList.remove('next-button-complete');
                this.htmlEl.$nextMedButton.classList.add('next-button-incomplete');
            }
        }
    }


    /**
     * Updates the enabled/disabled state of the navigation buttons and the progress message.
     */
    private updateNavigationButtons(): void {
        if (!this.htmlEl.$prevMedButton || !this.htmlEl.$nextMedButton || !this.htmlEl.$medProgressMessage) return;

        // Update progress message
        const totalMeds = this.medicationData.length;
        if (totalMeds > 0) {
            this.htmlEl.$medProgressMessage.textContent = `Medication ${this.currentMedIndex + 1} of ${totalMeds}`;
        } else {
            this.htmlEl.$medProgressMessage.textContent = 'No medications to review';
        }

        // Update Previous button visibility
        if (this.currentMedIndex === 0) {
            this.htmlEl.$prevMedButton.classList.add('hidden');
        } else {
            this.htmlEl.$prevMedButton.classList.remove('hidden');
        }

        // Update Next button visibility
        if (this.currentMedIndex === totalMeds - 1) {
            this.htmlEl.$nextMedButton.classList.add('hidden');
        } else {
            this.htmlEl.$nextMedButton.classList.remove('hidden');
        }

        // If there are no medications at all, hide both buttons
        if (totalMeds === 0) {
            this.htmlEl.$prevMedButton.classList.add('hidden');
            this.htmlEl.$nextMedButton.classList.add('hidden');
        }
    }

    /**
     * Handles navigation to the previous medication.
     */
    private handlePrevMed = (): void => {
        if (this.currentMedIndex > 0) {
            this.currentMedIndex--;
            this.renderCurrentMedication(this.currentMedIndex, 'prev');
        }
    }

    /**
     * Handles navigation to the next medication.
     */
    private handleNextMed = (): void => {
        if (this.currentMedIndex < this.medicationData.length - 1) {
            this.currentMedIndex++;
            this.renderCurrentMedication(this.currentMedIndex, 'next');
        }
    }

    // --- Data, Submission, and Autosave Logic ---

    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    private setupFormEventListeners = (): void => {
        if (!this.htmlEl) return;
        // Navigation buttons
        this.htmlEl.$prevMedButton?.addEventListener('click', this.handlePrevMed);
        this.htmlEl.$nextMedButton?.addEventListener('click', this.handleNextMed);

        // 'Done' button listener
        this.doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    }

    /**
     * NEW: Updates the state of progress
     */
    public updateProgressState = (): void => {
        let answeredCount = 0;
        this.medicationData.forEach((med, index) => { // Iterate with index
            if (this.isMedicationAnsweredComplete(index)) {
                answeredCount++;
            }
        });

        const totalQuestions = this.medicationData.length;
        const unansweredCount = totalQuestions - answeredCount;

        // Update progress data
        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = unansweredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }


    /**
     * Gathers all medication answers into a structured JSON object.
     * @returns A JSON object representing the current state of all medication answers.
     */
    public gatherDataForServer = (): UserMedAnswersArray => {
        return this.medicationData;
    }

    public async refresh(): Promise<void> {
        await this.loadForms();
    }

}