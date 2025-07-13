// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts
import TAppView from './appview.js';
/**
 * Represents the medication_review component as a class, responsible for building and managing the patient history update form.
 */
export default class TMedReviewAppView extends TAppView {
    doneButton = null;
    doneButtonMainText = null;
    doneButtonSubText = null;
    //private medications: string[] = [];
    currentMedIndex = 0;
    medicationData = [];
    constructor(aCtrl, opts) {
        super('medication_review', '/api/medication_review', aCtrl);
        { //temp scope for tempInnerHTML
            const tempInnerHTML = `
            <style>

            p {
              margin-top: 0px;
              margin-bottom: 5px;
              xbackground-color:rgb(223, 8, 8);
            }
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
                margin-top: 25px;
                margin-bottom: -10px;
            }

            h2 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5px;
                margin-top: 15px;
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
            /* I don't know for taking question */
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
                margin-top: 0px;
                margin-bottom: 0px;
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

            /* --- Specific Styling for Medication Card --- */
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
                width: 80%;
                max-width: 900px;
                box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.53);
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
                margin-bottom: 5px;
                text-align: center;
                border: solid 1px rgb(214, 214, 214);
                padding: 10px;
            }

            .question-group {
                margin-bottom: 0px;
                padding-bottom: 0px;
                xborder-bottom: solid 1px #ececec;
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
                text-align: center;
            }

            .refill-question-label {
                display: block;
                margin-bottom: 10px;
                font-weight: bold;
                font-size: 1.1em;
                color: #333;
                text-align: center;
            }

            .refill-loc-question-label {
                display: block;
                margin-bottom: 10px;
                margin-top: 15px;
                font-weight: bold;
                font-size: 1.1em;
                color: #333;
                text-align: center;
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

            /* Navigation Buttons & Progress Message */
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
                height: 10vw;
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

            /* Navigation Buttons & Progress Message */
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
                --checkmark-size: 5vw; /* Size of the checkmark icon */
            }
            .medication-header .complete-indicator {
                position: absolute;
                top: calc(var(--checkmark-size) * -0.5); /* Move up by half its height */
                left: calc(var(--checkmark-size) * -0.5); /* Move left by half its width */
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


            /* Responsive adjustments   -- was 768 originally*/
            @media(max-width: 850px) {
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
                    margin-top: 25px;
                    margin-bottom: -15px;
                }
                .custom-checkbox-text {
                    padding: 6px 10px;
                    font-size: 0.95em;
                }
            }

            @media (0 <= width <= 720px) {
                .medication-name {
                    font-size: 5vw;
                    margin-bottom: 5px;
                }
                .main-question-label {
                    margin-bottom: 5px;
                    font-size: 5.5vw;
                }

                .refill-question-label {
                    margin-bottom: 5px;
                    font-size: 5.5vw;
                }

                .refill-loc-question-label {
                    margin-bottom: 5px;
                    margin-top: 15px;
                    font-size: 5.5vw;
                }
                .custom-checkbox-text {
                    font-size: 3.0vw;
                }

                ul.options-list {
                    margin: 5px 0px
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
                        <button type="button" class="next-med-button hidden">Next &rarr;</button>
                        <span class="medication-progress-message"></span>
                        <button type="button" class="prev-med-button hidden">&larr; Previous</button>
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
    async loadForms() {
        this.setHTMLEl(this.sourceHTML); //restore initial html
        // NEW: Cache the done button elements and new navigation elements
        this.doneButton = this.htmlEl.dom.querySelector('.done-button');
        this.doneButtonMainText = this.htmlEl.dom.querySelector('.done-button-main-text');
        this.doneButtonSubText = this.htmlEl.dom.querySelector('.done-button-sub-text');
        this.htmlEl.medDisplayAreaEl = this.htmlEl.dom.querySelector('.medication-display-area');
        this.htmlEl.prevMedButtonEl = this.htmlEl.dom.querySelector('.prev-med-button');
        this.htmlEl.nextMedButtonEl = this.htmlEl.dom.querySelector('.next-med-button');
        this.htmlEl.medProgMessageEl = this.htmlEl.dom.querySelector('.medication-progress-message');
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector('.patient-name');
        if (patientNameEl) {
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
        }
        this.setupFormEventListeners();
        await this.prePopulateFromServer(); //evokes call to serverDataToForm()
        this.updateDoneButtonState(); // Update initially
    }
    /**
     * Renders the current medication with its questions.
     * Handles the sliding animation.
     * @param direction 'next' or 'prev' for animation direction
     */
    renderCurrentMedication(currentMedIndex, direction = null) {
        if (!this.htmlEl.medDisplayAreaEl)
            return;
        const oldCard = this.htmlEl.medDisplayAreaEl.querySelector('.medication-card');
        const currentMedication = this.medicationData[currentMedIndex];
        // SVG Checkmark Icon
        const completeCheckboxSVGIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
            </svg>
        `;
        if (!currentMedication) {
            this.htmlEl.medDisplayAreaEl.innerHTML = '<p>No medications to display.</p>';
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

            <div class="question-group refill-question-group hidden"> <label class="refill-question-label">Do you need a refill for this medication?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="need_refill_${currentMedIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="need_refill_${currentMedIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                </ul>
                <div class="refill-sub-questions hidden">
                    <label class="refill-loc-question-label">Where would you like to pick up your refill?</label>
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
        const currentMed = this.medicationData[currentMedIndex]; //currentMed is a reference to object stored in this.medicationAnswers array
        if (currentMed) {
            // "Are you taking" radios
            const takingRadios = newCard.querySelectorAll(`input[name="taking_${currentMedIndex}"]`);
            takingRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.areTaking);
            });
            // "Needs refill" radios
            const refillRadios = newCard.querySelectorAll(`input[name="need_refill_${currentMedIndex}"]`);
            refillRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.needsRefill);
            });
            // "Refill location" radios
            const refillLocationRadios = newCard.querySelectorAll(`input[name="refill_location_${currentMedIndex}"]`);
            refillLocationRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.refillLocation);
            });
            // Comment textarea
            const commentTextarea = newCard.querySelector(`#comment_${currentMedIndex}`);
            if (commentTextarea && (currentMed.comment != null)) {
                commentTextarea.value = currentMed.comment;
            }
        }
        // Handle visibility of "Do you need a refill?" question group based on "Are you taking?" answer
        const refillQuestionGroup = newCard.querySelector('.refill-question-group');
        const takingRadios = newCard.querySelectorAll(`input[name="taking_${currentMedIndex}"]`);
        if (refillQuestionGroup && takingRadios.length > 0) {
            // Initial state based on loaded data
            if (currentMed && currentMed.areTaking === 'yes') {
                refillQuestionGroup.classList.remove('hidden');
            }
            else {
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
                    const target = e.target;
                    if (refillQuestionGroup) {
                        if (target.value === 'yes' && target.checked) {
                            refillQuestionGroup.classList.remove('hidden');
                        }
                        else {
                            refillQuestionGroup.classList.add('hidden');
                            // Clear refill answers when hiding the section
                            newCard.querySelectorAll(`input[name="need_refill_${currentMedIndex}"]`).forEach(r => r.checked = false);
                            newCard.querySelectorAll(`input[name="refill_location_${currentMedIndex}"]`).forEach(r => r.checked = false);
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
        const refillSubQuestions = newCard.querySelector('.refill-sub-questions');
        const refillYesRadio = newCard.querySelector(`input[name="need_refill_${currentMedIndex}"][value="yes"]`);
        if (refillYesRadio && refillSubQuestions) {
            // Initial state based on loaded data
            if (refillYesRadio.checked) {
                refillSubQuestions.classList.remove('hidden');
            }
            else {
                refillSubQuestions.classList.add('hidden');
                // Ensure refillLocation is cleared if "No" is selected
                if (currentMed && currentMed.needsRefill === 'no') {
                    currentMed.refillLocation = null;
                }
            }
            // Add change listener
            newCard.addEventListener('change', (e) => {
                const target = e.target;
                if (target.name === `need_refill_${currentMedIndex}` && refillSubQuestions) {
                    if (target.value === 'yes' && target.checked) {
                        refillSubQuestions.classList.remove('hidden');
                    }
                    else if (target.value === 'no' && target.checked) {
                        refillSubQuestions.classList.add('hidden');
                        // Clear sub-question answers if "No" is selected
                        newCard.querySelectorAll(`input[name="refill_location_${currentMedIndex}"]`).forEach(radio => radio.checked = false);
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
            this.htmlEl.medDisplayAreaEl.appendChild(newCard);
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
        }
        else {
            // No animation on initial load
            this.htmlEl.medDisplayAreaEl.innerHTML = ''; // Clear previous content directly
            this.htmlEl.medDisplayAreaEl.appendChild(newCard);
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
    addCardEventListeners(cardEl) {
        cardEl.addEventListener('change', (e) => {
            this.captureMedicationAnswer(e.target);
            this.updateCardCompletionState(cardEl); // Update card color, checkmark, and next button on change
            this.resetAutosaveTimer();
            this.updateDoneButtonState();
        });
        cardEl.addEventListener('input', (e) => {
            // For textareas, 'input' event captures changes more granularly
            const target = e.target;
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
    captureMedicationAnswer(target) {
        const currentMed = this.medicationData[this.currentMedIndex]; // Direct array access
        if (!currentMed)
            return;
        if (!target || !target.value)
            return; // Ensure target is valid
        let value = target.value.trim();
        if (target.name.startsWith('taking_')) {
            if (['yes', 'no', 'sometimes', 'unknown'].includes(target.value) == true) {
                currentMed.areTaking = value;
                if (currentMed.areTaking !== 'yes') {
                    currentMed.needsRefill = null;
                    currentMed.refillLocation = null;
                }
            }
        }
        else if (target.name.startsWith('need_refill_')) {
            if (['yes', 'no'].includes(target.value) == true) {
                currentMed.needsRefill = target.value;
                if (target.value === 'no') { // If refill is 'no', ensure refillLocation is nullified
                    currentMed.refillLocation = null;
                }
            }
        }
        else if (target.name.startsWith('refill_location_')) {
            if (['local', 'mail'].includes(target.value) == true) {
                currentMed.refillLocation = target.value;
            }
        }
        else if (target.name.startsWith('comment_')) {
            currentMed.comment = target.value.trim();
        }
    }
    /**
     * Checks if a given medication's questions are fully answered.
     * @param medicationIndex The index of the medication to check.
     * @returns True if all required questions are answered, false otherwise.
     */
    isMedicationAnsweredComplete(medicationIndex, forceRecalc = false) {
        const currentMed = this.medicationData[medicationIndex]; // currentMed is a reference to object stored in this.medicationAnswers array
        if (!currentMed)
            return false;
        if ((currentMed.isComplete !== null) && (forceRecalc !== true)) {
            //Note: isComplete will be set to null when recalculation of state is needed.
            return currentMed.isComplete; // If already set, return the cached value
        }
        const takingAnswered = ((currentMed.areTaking !== null) && (currentMed.areTaking !== undefined));
        let result = false; //default to false
        // If 'areTaking' is 'no', 'sometimes', or 'unknown', then refill questions are not applicable.
        if (currentMed.areTaking === 'no' || currentMed.areTaking === 'sometimes' || currentMed.areTaking === 'unknown') {
            result = takingAnswered; // Only 'areTaking' needs to be answered
        }
        else {
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
    updateCardCompletionState(cardEl) {
        const medicationHeader = cardEl.querySelector('.medication-header');
        if (!medicationHeader)
            return;
        if (this.isMedicationAnsweredComplete(this.currentMedIndex, true)) { // Use currentMedIndex, forcing recalculation
            cardEl.classList.remove('medication-card-incomplete');
            cardEl.classList.add('medication-card-complete');
            medicationHeader.classList.add('completed'); // Shows the checkmark
            // Update Next button color if it exists
            if (this.htmlEl.nextMedButtonEl) {
                this.htmlEl.nextMedButtonEl.classList.remove('next-button-incomplete');
                this.htmlEl.nextMedButtonEl.classList.add('next-button-complete');
            }
        }
        else {
            cardEl.classList.remove('medication-card-complete');
            cardEl.classList.add('medication-card-incomplete');
            medicationHeader.classList.remove('completed'); // Hides the checkmark
            // Update Next button color if it exists
            if (this.htmlEl.nextMedButtonEl) {
                this.htmlEl.nextMedButtonEl.classList.remove('next-button-complete');
                this.htmlEl.nextMedButtonEl.classList.add('next-button-incomplete');
            }
        }
    }
    /**
     * Updates the enabled/disabled state of the navigation buttons and the progress message.
     */
    updateNavigationButtons() {
        if (!this.htmlEl.prevMedButtonEl || !this.htmlEl.nextMedButtonEl || !this.htmlEl.medProgMessageEl)
            return;
        // Update progress message
        const totalMeds = this.medicationData.length;
        if (totalMeds > 0) {
            this.htmlEl.medProgMessageEl.textContent = `Medication ${this.currentMedIndex + 1} of ${totalMeds}`;
        }
        else {
            this.htmlEl.medProgMessageEl.textContent = 'No medications to review';
        }
        // Update Previous button visibility
        if (this.currentMedIndex === 0) {
            this.htmlEl.prevMedButtonEl.classList.add('hidden');
        }
        else {
            this.htmlEl.prevMedButtonEl.classList.remove('hidden');
        }
        // Update Next button visibility
        if (this.currentMedIndex === totalMeds - 1) {
            this.htmlEl.nextMedButtonEl.classList.add('hidden');
        }
        else {
            this.htmlEl.nextMedButtonEl.classList.remove('hidden');
        }
        // If there are no medications at all, hide both buttons
        if (totalMeds === 0) {
            this.htmlEl.prevMedButtonEl.classList.add('hidden');
            this.htmlEl.nextMedButtonEl.classList.add('hidden');
        }
    }
    /**
     * Handles navigation to the previous medication.
     */
    handlePrevMed = () => {
        if (this.currentMedIndex > 0) {
            this.currentMedIndex--;
            this.renderCurrentMedication(this.currentMedIndex, 'prev');
        }
    };
    /**
     * Handles navigation to the next medication.
     */
    handleNextMed = () => {
        if (this.currentMedIndex < this.medicationData.length - 1) {
            this.currentMedIndex++;
            this.renderCurrentMedication(this.currentMedIndex, 'next');
        }
    };
    // --- Data, Submission, and Autosave Logic ---
    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    setupFormEventListeners = () => {
        if (!this.htmlEl)
            return;
        // Navigation buttons
        this.htmlEl.prevMedButtonEl?.addEventListener('click', this.handlePrevMed);
        this.htmlEl.nextMedButtonEl?.addEventListener('click', this.handleNextMed);
        // 'Done' button listener
        this.doneButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDoneClick();
        });
    };
    /**
     * NEW: Updates the state of progress
     */
    updateProgressState = () => {
        let answeredCount = 0;
        this.medicationData.forEach((med, index) => {
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
    };
    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with data.
     */
    serverDataToForm = (data) => {
        this.medicationData = data; // Store the full list
        this.currentMedIndex = 0; // Start with the first medication
        this.renderCurrentMedication(this.currentMedIndex); // Render the first medication
        // Update the done button state after loading the data
        this.updateDoneButtonState();
    };
    /**
     * Gathers all medication answers into a structured JSON object.
     * @returns A JSON object representing the current state of all medication answers.
     */
    gatherDataForServer = () => {
        return this.medicationData;
    };
    async refresh() {
        await this.loadForms();
    }
}
//# sourceMappingURL=medication_review.js.map