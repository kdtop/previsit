// /opt/worldvista/EHR/web/previsit/www/components/medciation_allergies_review.ts
import TItemCardReviewAppView from './item_card_review.js';
/**
 * Represents the medication_allergy_review component as a class, responsible for building and managing the update form.
 */
export default class TMedAllergiesReviewAppView extends TItemCardReviewAppView {
    constructor(aCtrl, opts) {
        super('medication_allergy_review', '/api/rx_allergies_review', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getCSSContent() {
        let result = super.getCSSContent() + `
        <style>
            .rx-reaction {
              background: var(--lightYellow);
              border: 1px solid var(--lightGray);
              margin-bottom: 10px;
              text-align: center;
            }

            .item-name {
              padding: 0px;
            }

            .item-header {
              flex-direction: column;
            }

            /* --- Custom Checkbox (now radio) Styling --- */
            /* Specific colors based on value for 'allergic' question */
            input[name^='allergic_'][value='yes']:checked + .custom-checkbox-text {
                background-color:   var(--okGreen);
                border:             1px solid var(--okGreen);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            input[name^='allergic_'][value='no']:checked + .custom-checkbox-text {
                background-color:   var(--redish);
                border:             1px solid var(--redish);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }
            /* 'I don't know' for taking question */
            input[name^='allergic_'][value='unknown']:checked + .custom-checkbox-text {
                background-color:   var(--lighterDarkGray);
                border:             1px solid var(--lighterDarkGray);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }

        </style>
        `;
        return result;
    }
    getTitleText() {
        return "Review Medication/Substance Allergies";
    }
    getAddItemText() {
        return "Add NEW Allergy";
    }
    /**
     * Renders the current allergy item with its questions.
     * Handles the sliding animation.
     * @param direction 'next' or 'prev' for animation direction
     */
    renderCurrentItem(currentItemIndex, direction = null) {
        if (!this.htmlEl.itemDisplayAreaEl)
            return;
        const oldCard = this.htmlEl.itemDisplayAreaEl.querySelector('.item-card');
        const currentAllergy = this.itemData[currentItemIndex];
        // SVG Checkmark Icon
        const completeCheckboxSVGIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
            </svg>
        `;
        if (!currentAllergy) {
            this.htmlEl.itemDisplayAreaEl.innerHTML = '<p>No medication allergies to display.</p>';
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
                <div class="item-name">${currentAllergy.text}</div>
                <div class="rx-reaction">${currentAllergy.reaction}</div>
            </div>
            <div class="question-group">
                <label class="main-question-label">Are you still allergic or intolerant to this?</label>
                <ul class="options-list">
                    <li><label><input type="radio" name="allergic_${currentItemIndex}" value="yes"     class="sr-only"><span class="custom-checkbox-text">Yes         </span></label></li>
                    <li><label><input type="radio" name="allergic_${currentItemIndex}" value="no"      class="sr-only"><span class="custom-checkbox-text">No          </span></label></li>
                    <li><label><input type="radio" name="allergic_${currentItemIndex}" value="unknown" class="sr-only"><span class="custom-checkbox-text">I don't know</span></label></li>
                </ul>
            </div>

            <div class="details-input-group">
                <label for="comment_${currentItemIndex}">Comments about this (if needed):</label>
                <textarea id="comment_${currentItemIndex}" name="comment_${currentItemIndex}" placeholder="Enter any additional comments here..."></textarea>
            </div>
        `;
        // Pre-fill answers from allergyAnswers array
        // "Are you allergic?" radios
        const replayRadios = newCard.querySelectorAll(`input[name="allergic_${currentItemIndex}"]`);
        replayRadios.forEach(radio => {
            radio.checked = (radio.value === currentAllergy.patientResponse);
        });
        // Comment textarea
        const commentTextarea = newCard.querySelector(`#comment_${currentItemIndex}`);
        if (commentTextarea && (currentAllergy.comment != null)) {
            commentTextarea.value = currentAllergy.comment;
        }
        // Apply animations
        this.animateCard(oldCard, newCard, direction);
    }
    /**
     * Captures the answer for the current allergy and updates the allergyAnswers array.
     * @param target The input or textarea element that changed.
     */
    captureItemAnswer(target) {
        const currentAllergy = this.itemData[this.currentItemIndex];
        if (!currentAllergy)
            return;
        if (!target || !target.value)
            return; // Ensure target is valid
        let value = target.value.trim();
        if (target.name.startsWith('allergic_')) {
            if (['yes', 'no', 'unknown'].includes(target.value) == true) {
                currentAllergy.patientResponse = value;
            }
        }
        else if (target.name.startsWith('comment_')) {
            currentAllergy.comment = target.value.trim();
        }
    }
    /**
     * Checks if a given allergy's questions are fully answered.
     * @param itemIndex The index of the allergy to check.
     * @returns True if required questions are answered, false otherwise.
     */
    isItemAnsweredComplete(itemIndex, forceRecalc = false) {
        const currentAllergy = this.itemData[itemIndex]; // currentMed is a reference to object stored in this.medicationAnswers array
        if (!currentAllergy)
            return false;
        if ((currentAllergy.isComplete !== null) && (forceRecalc !== true)) {
            //Note: isComplete will be set to null when recalculation of state is needed.
            return currentAllergy.isComplete; // If already set, return the cached value
        }
        const stillAllergicAnswered = ((currentAllergy.patientResponse !== null) && (currentAllergy.patientResponse !== undefined));
        currentAllergy.isComplete = stillAllergicAnswered; // Cache the result in the current Allergy object
        return stillAllergicAnswered;
    }
}
//# sourceMappingURL=medication_allergies_review.js.map