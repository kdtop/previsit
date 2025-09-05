// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts
import TAppView from './appview.js';
/**
 * Represents the medication_review component as a class, responsible for building and managing the patient history update form.
 */
export default class TCommonMedReviewAppView extends TAppView {
    doneButton = null;
    doneButtonMainText = null;
    doneButtonSubText = null;
    currentMedIndex = 0;
    medicationData = [];
    inCardChangeAnimation = false;
    constructor(viewName, apiURL, aCtrl, opts) {
        super(viewName, apiURL, aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getCSSContent() {
        let result = super.getCSSContent() +
            `
            <style>

            p {  /* other properties defined in super */
              margin:  0px;
              padding: 0px;
            }

            h1 {
                /* other inherited properties defined in super */
                margin-top:     2px;
                margin-bottom:  5px
            }

            h2 {
                /* other inherited properties defined in super */
                margin-top:     15px;
            }
            ul {
                /* other inherited properties defined in super */
                gap:            7px;
            }
            li {
                /* other inherited properties defined in super */
            }

            .medreview-container {
                line-height:        1.6;
                padding:            0 100px; /* Kept for overall container padding */
                background-color:   var(--whiteColor);
                color:              var(--textColor);
                display:            flex;
                flex-direction:     column;
                min-height:         100vh;
            }

            .header-area {
                padding:            1px;
                background-color:   var(--lightLightGray);
                text-align:         center;
            }

            .footer-area {
                padding:            2x;
                text-align:         center;
                margin-top:         auto;
            }

            .main-content-area {
                flex-grow:          1;
                padding:            0px 0; /* Padding for top/bottom */
                overflow:           hidden;
                position:           relative;
                display:            flex; /* Use flex to center the medication card */
                flex-direction:     column; /* Stack card and nav buttons */
                align-items:        center; /* Horizontally center content */
                justify-content:    center; /* Vertically center content if space allows */
            }

            rx_generic {
              color:        var(--genericRxColor);
            }

            rx_brand {
              color:        var(--brandRxColor);
            }

            rx_mod {
              color:        var(--modRxColor);
            }

            rx_strength {
              color:        var(--strengthRxColor);
              font-size:    var(--smaller);
            }

            rx_units {
              color:        var(--unitsRxColor);
              font-size:    var(--smaller);
            }

            rx_form {
              color:        var(--formRxColor);
              font-size:    var(--smaller);
            }

            rx_sig {
              color:            var(--sigRxColor);
              font-size:        var(--smaller);
              font-weight:      normal;
              display:          block;
            }

            rx_note {
              color:            var(--noteRxColor);
              display:          block;
              font-size:        var(--smaller);
            }

            rx_otc {
              color:            var(--otcRxColor);
              font-size:        var(--tiny);
            }

            rx_preface {
              color:            var(--prefaceRxColor);
              font-size:        var(--smaller);
            }

            rx_unparsed {
              background-color: var(--unparsedRxColor);
              color:            var(--textColor);
              font-size:        var(--medium);
            }

            /* --- Custom Checkbox (now radio) Styling --- */
            .sr-only {
                position:       absolute;
                width:          1px;
                height:         1px;
                padding:        0;
                margin:         -1px;
                overflow:       hidden;
                clip:           rect(0, 0, 0, 0);
                white-space:    nowrap;
                border-width:   0;
            }

            .custom-checkbox-text {
                display:            inline-block;
                padding:            7px 12px;
                border-radius:      12px;
                background-color:   var(--lightLightGray);
                border: 1px solid var(--lightGray);
                color:              var(--textColor);
                transition:         background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
                cursor:             pointer;
                user-select:        none;
            }
            label:hover .custom-checkbox-text {
                background-color:   var(--lightGray);
            }

            /* Specific colors based on value for 'taking' question */
            input[name^='taking_'][value='yes']:checked + .custom-checkbox-text {
                background-color:   var(--okGreen);
                border:             1px solid var(--okGreen);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            input[name^='taking_'][value='no']:checked + .custom-checkbox-text {
                background-color:   var(--redish);
                border:             1px solid var(--redish);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            input[name^='taking_'][value='sometimes']:checked + .custom-checkbox-text {
                background-color:   var(--niceBlue);
                border:             1px solid var(--niceBlue);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            /* 'I don't know' for taking question */
            input[name^='taking_'][value='unknown']:checked + .custom-checkbox-text {
                background-color:   var(--lighterDarkGray);
                border:             1px solid var(--lighterDarkGray);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }

            /* Specific colors based on value for 'refill' question */
            input[name^='need_refill_'][value='yes']:checked + .custom-checkbox-text {
                background-color:   var(--niceBlue);
                border:             1px solid var(--niceBlue);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            input[name^='need_refill_'][value='no']:checked + .custom-checkbox-text {
                background-color:   var(--redish); /* Red for No */
                border:             1px solid var(--redish);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }

            /* Specific colors for 'refill_location' questions */
            input[name^='refill_location_']:checked + .custom-checkbox-text {
                background-color:   var(--niceBlue);
                border:             1px solid var(--niceBlue);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }

            /* Styles for general labels (like for custom checkboxes) */
            label {
                /* overriding inherited properties */
                display:            flex;
                align-items:        center;
                width:              fit-content;
                margin:             0px;
            }

            .details-input-group {
                margin-top:         0px;
                margin-bottom:      0px;
            }

            .details-input-group label {
                display:            block;
                margin-bottom:      5px;
                font-weight:        bold;
                color:              var(--textColor);
            }

            .details-input-group textarea {
                width:              100%;
                min-height:         50px;
                padding:            8px 10px;
                border:             1px solid var(--gray);
                border-radius:      4px;
                font-size:          1em;
                box-sizing:         border-box;
                resize:             none;
            }

            /* --- Specific Styling for Medication Card --- */
            .medication-display-area {
                display:            grid;
                place-items:        center; /* centers the content both horizontally and vertically */
                width:              100%;
                min-height:         350px; /* Base minimum height */
                flex-grow:          1; /* Make this take up available vertical space */
                overflow:           hidden; /* hide cards when they are off-screen */
                padding-top:        20px;
                padding-bottom:     10px;
                margin-bottom:      10px;
            }

            .medication-card {
                background-color:   var(--windowRxBackground);
                border:             1px solid var(--lightGray);
                border-radius:      8px;
                padding:            25px;
                padding-top:        5px;
                width:              80%;
                max-width:          900px;
                box-shadow:         10px 10px 5px var(--shadowColor);
                transition:         transform 0.25s ease-in-out, opacity 0.5s ease-in-out, background-color 0.5s ease;
                z-index:            10; /* Ensure new card is on top */
            }

            .medication-card.offscreen-right {
                transform:          translateX(150%);
                opacity:            0;
            }

            .medication-card.offscreen-left {
                transform:          translateX(-150%);
                opacity:            0;
            }

            .medication-card-incomplete {
                border:             5px solid var(--redish);
            }

            .medication-card-complete {
                border:             5px solid var(--okGreen);
            }

            .medication-header {
                display:            flex;
            }

            .medication-name {
                font-size:          1.8em;
                font-weight:        bold;
                color:              var(--textColor);
                margin-bottom:      5px;
                text-align:         center;
                border:             solid 1px var(--lightGray);
                padding:            10px;
            }

            .question-group {
                margin-bottom:      0px;
                padding-bottom:     0px;
                xborder-bottom:     solid 1px #ececec;
            }

            .question-group:last-child {
                border-bottom:      none;
                padding-bottom:     0;
            }

            .main-question-label {
                display:            block;
                margin-bottom:      10px;
                font-weight:        bold;
                font-size:          1.1em;
                color:              var(--textColor);
                text-align:         center;
            }

            .refill-question-label {
                display:            block;
                margin-bottom:      10px;
                font-weight:        bold;
                font-size:          1.1em;
                color:              var(--textColor);
                text-align:         center;
            }

            .refill-loc-question-label {
                display:            block;
                margin-bottom:      10px;
                margin-top:         15px;
                font-weight:        bold;
                font-size:          1.1em;
                color:              var(--textColor);
                text-align:         center;
            }
            .options-list {
                display:            flex;
                margin:             0px;
                margin-bottom:      10px;
                gap:                15px;
                flex-wrap:          wrap;
            }

            .details-input-group {
                margin-top:         15px;
            }

            .details-input-group label {
                margin-bottom:      5px;
            }

            .details-input-group textarea {
                min-height:         80px;
            }

            /* Navigation Buttons & Progress Message */
            .navigation-area { /* Container for buttons and message */
                display:            flex;
                justify-content:    space-between;
                align-items:        center;
                margin-top:         20px;
                padding:            0 100px; /* Match container padding */
                width:              100%;
                max-width:          800px;
                z-index:            20;
            }

            .navigation-area button {
                padding:            10px 20px;
                font-size:          1em;
                background-color:   var(--niceBlue);
                color:              var(--whiteColor);
                border:             none;
                border-radius:      5px;
                cursor:             pointer;
                height:             7vw;
                transition:         background-color 0.5s ease;
                flex-shrink:        0; /* Prevent buttons from shrinking */
            }

            .navigation-area button:hover:not(:disabled) {
                background-color:   var(--darkerNiceBlue);
            }

            .navigation-area button:disabled {
                background-color:   var(--gray);
                cursor:             not-allowed;
            }

            .nav-button {
                height: 200px;
            }

            .prev-med-button {
                background-color:   var(--niceBlue);
                color:              var(--whiteColor);
            }

            .prev-med-button:hover:not(:disabled) {
                background-color:   var(--darkerNiceBlue);
            }

            .next-med-button.incomplete {
                background-color:   var(--incompleteRed);
                color:              var(--textColor);
            }

            .next-med-button.incomplete:hover:not(:disabled) {
                background-color:   var(--incompleteRedDarker);
            }

            .next-med-button.complete {
                background-color:   var(--okGreen);
                color:              var(--whiteColor);
            }

            .next-med-button.complete:hover:not(:disabled) {
                background-color:   var(--darkerGreen);
            }

            .medication-progress-message {
                font-size:          1.1em;
                color:              var(--textColor);
                text-align:         center;
                flex-grow:          1; /* Allows message to take available space */
                margin:             0px; /* Space around the message */
            }

            .main-content-area {
                flex-grow:          1;
                padding-top:        1px;
                padding-bottom:     5px;
                overflow:           hidden; /* Keep overflow hidden for animations */
                position:           relative; /* Needed for absolute positioning of cards within it */
                display:            flex;
                flex-direction:     column; /* Stack card display and navigation vertically */
                align-items:        center; /* Horizontally center content */
            }

            .navigation-area { /* Container for buttons and message */
                display:            flex;
                justify-content:    space-between;
                align-items:        center;
                margin-top:         auto; /* Push navigation to the bottom of main-content-area */
                padding:            0 100px; /* Match container padding */
                width:              100%;
                max-width:          800px;
                z-index:            20; /* Ensure navigation is always on top of cards */
            }

            .medication-header {
                position:           relative;
                padding-top:        5px;
                --checkmark-size:   5vw; /* Size of the checkmark icon */
            }
            .medication-header .complete-indicator {
                position:           absolute;
                top:                calc(var(--checkmark-size) * -0.5); /* Move up by half its height */
                left:               calc(var(--checkmark-size) * -0.5); /* Move left by half its width */
                z-index:            30;
                opacity:            0; /* Initially invisible */
                transform:          scale(0.5); /* Initially smaller */
                transition:         opacity 0.5s ease-out, transform 0.5s ease-out; /* Animation */
            }
            .medication-header.completed .complete-indicator {
                opacity:            1;
                transform:          scale(1);
            }
            .medication-header .complete-indicator svg {
                width:              var(--checkmark-size);
                height:             var(--checkmark-size);
                stroke:             none;
            }

            .done-button {
                display:        flex;
                flex-direction: row;
            }


            /* Responsive adjustments */
            @media(max-width: 850px) {
                .medreview-container {
                    padding:                0 15px;
                }
                .medication-card {
                    /* Width is now handled by max-width and parent's centering */
                }
                .navigation-area {
                    padding:                0 0; /* Remove horizontal padding here, parent handles it */
                    flex-direction:         column; /* Stack buttons and message vertically */
                    gap:                    15px; /* Space between stacked items */
                }
                .navigation-area button {
                    width:                  100%; /* Full width when stacked */
                }
                .medication-progress-message {
                    order:                  -1; /* Move message to the top when stacked */
                    margin-top:             0px;
                    margin-bottom:          -15px;
                }
                .custom-checkbox-text {
                    padding:                6px 10px;
                    font-size:              0.95em;
                }
            }

            @media (0 <= width <= 720px) {
                .medication-name {
                    font-size:              5vw;
                    margin-bottom:          5px;
                }
                .main-question-label {
                    margin-bottom:          5px;
                    font-size:              5.5vw;
                }

                .refill-question-label {
                    margin-bottom:          5px;
                    font-size:              5.5vw;
                }

                .refill-loc-question-label {
                    margin-bottom:          5px;
                    margin-top:             15px;
                    font-size:              5.5vw;
                }
                .custom-checkbox-text {
                    font-size:              3.0vw;
                }

                ul.options-list {
                    margin:                 5px 0px
                }
            }
            </style>
        `;
        return result;
    }
    getTitleText() {
        return "Review Info Below";
    }
    getHTMLTagContent() {
        let result = `
            <form class='medreview-container'>
                <div class="header-area">
                    <h1>${this.getTitleText()}</h1>
                    <patient-name-area>
                      Patient: <span class="patient-name"></span>
                    </patient-name-area>
                </div>

                <div class="main-content-area">
                    <div class="medication-display-area">
                        </div>
                    <div class="navigation-area">
                        <button type="button" class="nav-button prev-med-button">&larr; Previous</button>
                        <span class="medication-progress-message"></span>
                        <button type="button" class="nav-button next-med-button">Next &rarr;</button>
                    </div>
                </div>

                <div class="footer-area">
                    <div class="submission-controls">
                        <button type="button" class="done-button">
                            <!-- Icon on the left -->
                            <span class="done-button-icon-area">
                                ${this.getDoneIncompleteSVGIcon()}
                                ${this.getDoneCompleteSVGIcon()}
                            </span>
                            <!-- Text container -->
                            <span class="done-button-text">
                              <span class="done-button-main-text">Main Text</span>
                              <span class="done-button-sub-text">Sub Text</span>
                            </span>
                        </button>
                    </div>
                </div>

            </form>
        `;
        return result;
    }
    cacheDOMElements() {
        super.cacheDOMElements();
        this.doneButton = this.htmlEl.dom.querySelector('.done-button');
        this.doneButtonMainText = this.htmlEl.dom.querySelector('.done-button-main-text');
        this.doneButtonSubText = this.htmlEl.dom.querySelector('.done-button-sub-text');
        this.htmlEl.medDisplayAreaEl = this.htmlEl.dom.querySelector('.medication-display-area');
        this.htmlEl.prevMedButtonEl = this.htmlEl.dom.querySelector('.prev-med-button');
        this.htmlEl.nextMedButtonEl = this.htmlEl.dom.querySelector('.next-med-button');
        this.htmlEl.medProgMessageEl = this.htmlEl.dom.querySelector('.medication-progress-message');
    }
    /*
    public clearCachedDOMElements() {
        this.doneButton = null;
        this.doneButtonMainText = null;
        this.doneButtonSubText = null;
        this.htmlEl.medDisplayAreaEl = null;
        this.htmlEl.prevMedButtonEl = null;
        this.htmlEl.nextMedButtonEl = null;
        this.htmlEl.medProgMessageEl = null;
    }
    */
    setupPatientNameDisplay() {
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector('.patient-name');
        if (patientNameEl)
            patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
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
            this.updatePageState();
            return;
        }
        // Create the new card
        const newCard = document.createElement('div');
        newCard.classList.add('medication-card', 'medication-card-incomplete'); // Start as incomplete
        newCard.innerHTML = `
            <div class="medication-header">
                <div class="complete-indicator">${completeCheckboxSVGIcon}</div>
                <div class="medication-name">${currentMedication.parsed}</div>
            </div>
            <div class="question-group">
                <label class="main-question-label">Are you currently taking or using this?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="sometimes" class="sr-only"><span class="custom-checkbox-text">Sometimes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentMedIndex}" value="unknown" class="sr-only"><span class="custom-checkbox-text">I don't know</span></label></li>
                </ul>
            </div>

            <div class="question-group refill-question-group hidden"> <label class="refill-question-label">Do you need a refill for this?</label>
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
                <label for="comment_${currentMedIndex}">Comments about this (if needed):</label>
                <textarea id="comment_${currentMedIndex}" name="comment_${currentMedIndex}" placeholder="Enter any additional comments here..."></textarea>
            </div>
        `;
        // Pre-fill answers from medicationAnswers array
        const currentMed = this.medicationData[currentMedIndex]; //currentMed is a reference to object stored in this.medicationAnswers array
        const currentIsOTC = (currentMed.otc == 1);
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
                if (currentIsOTC)
                    radio.checked = false; //if Rx is OTC then force NO REFILL NEEDED.
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
            // Initial state based on loaded data.  If Rx is OTC then force NO REFILL NEEDED.
            if (currentMed && (currentMed.areTaking === 'yes') && (currentIsOTC === false)) {
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
                        if ((target.value === 'yes') && target.checked && (currentIsOTC === false)) { //if OTC Rx, don't ask about refills.
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
        // Force a reflow to ensure the initial state is rendered
        //newCard.offsetWidth;
        // Apply animations
        if (oldCard && direction) {
            oldCard.classList.add(direction === 'next' ? 'offscreen-left' : 'offscreen-right'); // Animate the old card out.
            this.inCardChangeAnimation = true;
            // Listen for the old card's animation to finish.
            // NOTE: If new card is added before old card is removed, then parent will expand in size to 2 rows, causing screen weirdness
            oldCard.addEventListener('transitionend', () => {
                if (oldCard.parentNode)
                    oldCard.parentNode.removeChild(oldCard);
                if (!this?.htmlEl?.medDisplayAreaEl)
                    return;
                this.htmlEl.medDisplayAreaEl.appendChild(newCard);
                const initialPositionClass = direction === 'next' ? 'offscreen-right' : 'offscreen-left';
                newCard.classList.add(initialPositionClass); // Set the initial position of the new card
                newCard.offsetWidth; // Force a reflow to ensure the initial state is applied
                // Use setTimeout to trigger the transition to the final position (ensure messages have been processed)
                setTimeout(() => {
                    newCard.classList.remove(initialPositionClass); // Remove the initial position class to start the animation
                    newCard.addEventListener('transitionend', () => {
                        this.inCardChangeAnimation = false;
                    }, { once: true });
                }, 0);
                this.updateNavigationButtons();
                this.addCardEventListeners(newCard);
                this.updateCardCompletionState(newCard);
                this.updatePageState();
            }, { once: true });
        }
        else {
            // No animation on initial load
            this.htmlEl.medDisplayAreaEl.innerHTML = ''; // Clear previous content directly
            this.htmlEl.medDisplayAreaEl.appendChild(newCard);
            this.updateNavigationButtons();
            this.addCardEventListeners(newCard); // Removed medicationName parameter
            this.updateCardCompletionState(newCard); // Update card color, checkmark, and next button
            this.updatePageState(); // Update the done button state after rendering a new card
        }
    }
    /**
     * Adds event listeners to the currently displayed medication card for data capture.
     * @param cardEl The HTML element of the current medication card.
     */
    addCardEventListeners(cardEl) {
        cardEl.addEventListener('change', (e) => {
            this.captureMedicationAnswer(e.target);
            this.updateCardCompletionState(cardEl); // Update card color, checkmark, and next button on change
            this.updatePageState();
        });
        cardEl.addEventListener('input', (e) => {
            // For textareas, 'input' event captures changes more granularly
            const target = e.target;
            if (target.tagName === 'TEXTAREA') {
                this.captureMedicationAnswer(target);
                this.updatePageState();
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
        const currentIsOTC = (currentMed.otc == 1);
        if (!currentMed)
            return false;
        if ((currentMed.isComplete !== null) && (forceRecalc !== true)) {
            //Note: isComplete will be set to null when recalculation of state is needed.
            return currentMed.isComplete; // If already set, return the cached value
        }
        const takingAnswered = ((currentMed.areTaking !== null) && (currentMed.areTaking !== undefined));
        let result = takingAnswered;
        if (takingAnswered && (currentMed.areTaking === 'yes')) {
            // If user answer to 'areTaking' is 'yes', then refill questions are required, unless OTC Rx
            const needsRefillQuestIsAnswered = (currentMed.needsRefill !== null) && (currentMed.needsRefill !== undefined);
            if (needsRefillQuestIsAnswered) {
                let refillLocationAnswered;
                if (currentMed.needsRefill === 'yes') {
                    //Since user said they do need refill, have they also give a location for refill?
                    refillLocationAnswered = (currentMed.refillLocation !== null) && (currentMed.refillLocation !== undefined);
                    result = refillLocationAnswered;
                }
            }
            else {
                //here user has specified they ARE taking Rx, and have NOT answered if refill is needed
                result = false;
                if (currentIsOTC)
                    result = true; //refills not applicable for OTC Rx, so return TRUE
            }
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
                this.htmlEl.nextMedButtonEl.classList.remove('incomplete');
                this.htmlEl.nextMedButtonEl.classList.add('complete');
                this.htmlEl.nextMedButtonEl.innerHTML = 'Next &rarr;';
            }
        }
        else {
            cardEl.classList.remove('medication-card-complete');
            cardEl.classList.add('medication-card-incomplete');
            medicationHeader.classList.remove('completed'); // Hides the checkmark
            // Update Next button color if it exists
            if (this.htmlEl.nextMedButtonEl) {
                this.htmlEl.nextMedButtonEl.classList.remove('complete');
                this.htmlEl.nextMedButtonEl.classList.add('incomplete');
                this.htmlEl.nextMedButtonEl.innerHTML = 'Next (current med INCOMPLETE) &rarr;';
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
            //this.htmlEl.prevMedButtonEl.classList.add('hidden');
            this.htmlEl.prevMedButtonEl.disabled = true;
        }
        else {
            //this.htmlEl.prevMedButtonEl.classList.remove('hidden');
            this.htmlEl.prevMedButtonEl.disabled = false;
        }
        // Update Next button visibility
        if (this.currentMedIndex === totalMeds - 1) {
            //this.htmlEl.nextMedButtonEl.classList.add('hidden');
            this.htmlEl.nextMedButtonEl.disabled = true;
        }
        else {
            //this.htmlEl.nextMedButtonEl.classList.remove('hidden');
            this.htmlEl.nextMedButtonEl.disabled = false;
        }
        // If there are no medications at all, hide both buttons
        if (totalMeds === 0) {
            //this.htmlEl.prevMedButtonEl.classList.add('hidden');
            //this.htmlEl.nextMedButtonEl.classList.add('hidden');
            this.htmlEl.prevMedButtonEl.disabled = true;
            this.htmlEl.nextMedButtonEl.disabled = true;
        }
    }
    /**
     * Handles navigation to the previous medication.
     */
    handlePrevMed = () => {
        if (this.inCardChangeAnimation)
            return; //don't allow until prior animations done.
        if (this.currentMedIndex > 0) {
            this.currentMedIndex--;
            this.renderCurrentMedication(this.currentMedIndex, 'prev');
        }
    };
    /**
     * Handles navigation to the next medication.
     */
    handleNextMed = () => {
        if (this.inCardChangeAnimation)
            return; //don't allow until prior animations done.
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
        this.updatePageState(); // Update the done button state after loading the data
    };
    /**
     * Gathers all medication answers into a structured JSON object.
     * @returns A JSON object representing the current state of all medication answers.
     */
    gatherDataForServer = () => {
        return this.medicationData;
    };
}
//# sourceMappingURL=medication_common_review%20saved.js.map