// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts
import TItemCardReviewAppView from './item_card_review.js';
import { showPopupDlg, messageDlg, FieldType, ModalBtn } from './dialog_popup.js';
/**
 * Represents the medication_review component as a class, responsible for building and managing the patient history update form.
 */
export default class TCommonMedReviewAppView extends TItemCardReviewAppView {
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

            /* --- Specific Styling for item Card --- */

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

            @media (0 <= width <= 500px) {
                .refill-question-label {
                    margin-bottom:          5px;
                    font-size:              5.5vw;
                }

                .refill-loc-question-label {
                    margin-bottom:          5px;
                    margin-top:             15px;
                    font-size:              5.5vw;
                }
            }
            </style>
        `;
        return result;
    }
    getTitleText() {
        return "Review Info Below";
    }
    /**
     * Renders the current medication with its questions.
     * Handles the sliding animation.
     * @param direction 'next' or 'prev' for animation direction
     */
    renderCurrentItem(currentItemIndex, direction = null) {
        if (!this.htmlEl.itemDisplayAreaEl)
            return;
        const oldCard = this.htmlEl.itemDisplayAreaEl.querySelector('.item-card');
        const currentMedication = this.itemData[currentItemIndex];
        // SVG Checkmark Icon
        const completeCheckboxSVGIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
            </svg>
        `;
        if (!currentMedication) {
            this.htmlEl.itemDisplayAreaEl.innerHTML = '<p>No medications to display.</p>';
            this.updateNavigationButtons();
            this.updatePageState();
            return;
        }
        // Create the new card
        const newCard = document.createElement('div');
        newCard.classList.add('item-card', 'item-card-incomplete'); // Start as incomplete
        newCard.innerHTML = `
            <div class="item-header">
                <div class="complete-indicator">${completeCheckboxSVGIcon}</div>
                <div class="item-name">${currentMedication.parsed}</div>
            </div>
            <div class="question-group">
                <label class="main-question-label">Are you currently taking or using this?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="taking_${currentItemIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentItemIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                    <li><label><input type="radio" name="taking_${currentItemIndex}" value="sometimes" class="sr-only"><span class="custom-checkbox-text">Sometimes</span></label></li>
                    <li><label><input type="radio" name="taking_${currentItemIndex}" value="unknown" class="sr-only"><span class="custom-checkbox-text">I don't know</span></label></li>
                </ul>
            </div>

            <div class="question-group refill-question-group hidden"> <label class="refill-question-label">Do you need a refill for this?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="need_refill_${currentItemIndex}" value="yes" class="sr-only"><span class="custom-checkbox-text">Yes</span></label></li>
                    <li><label><input type="radio" name="need_refill_${currentItemIndex}" value="no" class="sr-only"><span class="custom-checkbox-text">No</span></label></li>
                </ul>
                <div class="refill-sub-questions hidden">
                    <label class="refill-loc-question-label">Where would you like to pick up your refill?</label>
                    <ul class="options-list">
                        <li><label><input type="radio" name="refill_location_${currentItemIndex}" value="local" class="sr-only"><span class="custom-checkbox-text">Local Pharmacy</span></label></li>
                        <li><label><input type="radio" name="refill_location_${currentItemIndex}" value="mail" class="sr-only"><span class="custom-checkbox-text">Mail Order Pharmacy</span></label></li>
                    </ul>
                </div>
            </div>

            <div class="details-input-group">
                <label for="comment_${currentItemIndex}">Comments about this (if needed):</label>
                <textarea id="comment_${currentItemIndex}" name="comment_${currentItemIndex}" placeholder="Enter any additional comments here..."></textarea>
            </div>
        `;
        // Pre-fill answers from medicationAnswers array
        const currentMed = this.itemData[currentItemIndex]; //currentMed is a reference to object stored in this.medicationAnswers array
        const currentIsOTC = (currentMed.otc == 1);
        if (currentMed) {
            // "Are you taking" radios
            const takingRadios = newCard.querySelectorAll(`input[name="taking_${currentItemIndex}"]`);
            takingRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.areTaking);
            });
            // "Needs refill" radios
            const refillRadios = newCard.querySelectorAll(`input[name="need_refill_${currentItemIndex}"]`);
            refillRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.needsRefill);
                if (currentIsOTC)
                    radio.checked = false; //if Rx is OTC then force NO REFILL NEEDED.
            });
            // "Refill location" radios
            const refillLocationRadios = newCard.querySelectorAll(`input[name="refill_location_${currentItemIndex}"]`);
            refillLocationRadios.forEach(radio => {
                radio.checked = (radio.value === currentMed.refillLocation);
            });
            // Comment textarea
            const commentTextarea = newCard.querySelector(`#comment_${currentItemIndex}`);
            if (commentTextarea && (currentMed.comment != null)) {
                commentTextarea.value = currentMed.comment;
            }
        }
        // Handle visibility of "Do you need a refill?" question group based on "Are you taking?" answer
        const refillQuestionGroup = newCard.querySelector('.refill-question-group');
        const takingRadios = newCard.querySelectorAll(`input[name="taking_${currentItemIndex}"]`);
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
                            newCard.querySelectorAll(`input[name="need_refill_${currentItemIndex}"]`).forEach(r => r.checked = false);
                            newCard.querySelectorAll(`input[name="refill_location_${currentItemIndex}"]`).forEach(r => r.checked = false);
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
        const refillYesRadio = newCard.querySelector(`input[name="need_refill_${currentItemIndex}"][value="yes"]`);
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
                if (target.name === `need_refill_${currentItemIndex}` && refillSubQuestions) {
                    if (target.value === 'yes' && target.checked) {
                        refillSubQuestions.classList.remove('hidden');
                    }
                    else if (target.value === 'no' && target.checked) {
                        refillSubQuestions.classList.add('hidden');
                        // Clear sub-question answers if "No" is selected
                        newCard.querySelectorAll(`input[name="refill_location_${currentItemIndex}"]`).forEach(radio => radio.checked = false);
                        if (currentMed) {
                            currentMed.refillLocation = null; // Direct array access
                        }
                    }
                }
            });
        }
        // Apply animations
        this.animateCard(oldCard, newCard, direction);
    }
    /**
     * Captures the answer for the current medication and updates the medicationAnswers array.
     * @param target The input or textarea element that changed.
     */
    captureItemAnswer(target) {
        const currentMed = this.itemData[this.currentItemIndex]; // Direct array access
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
     * @param itemIndex The index of the medication to check.
     * @returns True if all required questions are answered, false otherwise.
     */
    isItemAnsweredComplete(itemIndex, forceRecalc = false) {
        const currentMed = this.itemData[itemIndex]; // currentMed is a reference to object stored in this.medicationAnswers array
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
    getProgressMessage() {
        let result;
        const totalMeds = this.getDataLength();
        if (totalMeds > 0) {
            result = `Medication ${this.currentItemIndex + 1} of ${totalMeds}`;
        }
        else {
            result = 'No medications to review';
        }
        return result;
    }
    handleAddItem = async () => {
        const schema = {
            buttons: [ModalBtn.OK, ModalBtn.Cancel],
            title: "Add New Medication",
            instructions: "Enter New Medicine",
            Fields: {
                rxName: { type: FieldType.Str, required: true, label: "Medicine Name", placeholder: "Med Name (e.g. 'Lisinopril')" },
                rxDose: { type: FieldType.Str, required: false, label: "Dose", placeholder: "Dose (e.g. '10 mg')" },
                rxFreq: { type: FieldType.Str, required: false, label: "Frequency", placeholder: "How Often (e.g. 'Twice a day')" },
                rxOTC: { type: FieldType.Bool, required: false, label: "Is this over the counter (OTC), no prescription needed)?" },
                rxComment: { type: FieldType.Text, required: false, label: "Comments", placeholder: "Enter any additional comments here..." },
            }
        };
        const result = await showPopupDlg(schema, document.body);
        const modalResult = result.modalResult;
        if (modalResult == ModalBtn.OK) {
            let rxName = (typeof result.rxName === 'string') ? result.rxName : '';
            let rxDose = (typeof result.rxDose === 'string') ? result.rxDose : '';
            let rxFreq = (typeof result.rxFreq === 'string') ? result.rxFreq : '';
            let boolOTC = (typeof result.rxOTC === 'boolean') ? result.rxOTC : false;
            let rxOTC = (boolOTC) ? 1 : 0;
            let rxComment = (typeof result.rxComment === 'string') ? result.rxComment : '';
            let compositeRxName = rxName + ' ' + rxDose + ' ' + rxFreq;
            let newRx = {
                text: compositeRxName,
                otc: rxOTC,
                areTaking: 'yes',
                needsRefill: null,
                refillLocation: null,
                comment: rxComment,
                parsed: compositeRxName,
                isComplete: true,
            };
            this.itemData.push(newRx);
            this.currentItemIndex = this.itemData.length - 1;
            this.renderCurrentItem(this.currentItemIndex);
            await messageDlg("Medication Added", "Now Finish Questions for New Medication", document.body);
        }
        else {
            console.log("Form was canceled");
        }
    };
}
//# sourceMappingURL=medication_common_review.js.map