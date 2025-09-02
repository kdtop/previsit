// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts

import TAppView, {  } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { CardAnimationDirection,
         GenericUserAnswersArray,
         EnhancedHTMLDivElement
       } from '../utility/types.js';
import { showPopupDlg, DlgSchema, FieldType, FieldEntry } from './dialog_popup.js';


export interface ItemReviewOptions {
    someOption : any;
}

export type ItemReviewHTMLElement = EnhancedHTMLDivElement & {
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
    itemDisplayAreaEl?: HTMLDivElement | null;
    prevItemButtonEl?: HTMLButtonElement | null;
    nextItemButtonEl?: HTMLButtonElement | null;
    itemProgMessageEl?: HTMLSpanElement | null; // New: For "Item X of Y" message
    addItemButtonEL?: HTMLButtonElement | null;
};

/**
 * Represents the item_review component as a class, responsible for building and managing the patient history update form.
 */
export default class TItemCardReviewAppView<TServerData extends GenericUserAnswersArray> extends TAppView<TServerData> {
    //NOTE: The generic type <GenericUserAnswersArray> is used to represent the array of item answers.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: ItemReviewHTMLElement; // Use 'declare' to override the type of the inherited property

    public doneButton: HTMLButtonElement | null = null;
    public doneButtonMainText: HTMLSpanElement | null = null;
    public doneButtonSubText: HTMLSpanElement | null = null;

    public currentItemIndex: number = 0;
    public itemData: TServerData = [] as unknown as TServerData;

    public inCardChangeAnimation : boolean = false;

    constructor(viewName : string, apiURL : string, aCtrl: TCtrl, opts?: ItemReviewOptions) {
        super(viewName, apiURL, aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor

    public getCSSContent() : string
    {
        let result : string = super.getCSSContent() +
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

            patient-name-area {
              font-size:        1em;
            }

            .itemreview-container {
                line-height:        1.6;
                padding:            0 10px; /* Kept for overall container padding */
                background-color:   var(--whiteColor);
                color:              var(--grayBlue);
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

            .add-button-text {
                display:        flex;
                flex-direction: column; /* stack main and sub text vertically */
            }
            .add-button-sub-text {
                font-size: 0.8em;
                opacity: 0.9;
            }


            .main-content-area {
                flex-grow:          1;
                padding:            0px 0; /* Padding for top/bottom */
                overflow:           hidden;
                position:           relative;
                display:            flex; /* Use flex to center the item card */
                flex-direction:     column; /* Stack card and nav buttons */
                align-items:        center; /* Horizontally center content */
                justify-content:    center; /* Vertically center content if space allows */
            }

            .add-item-area {
                margin-top:         10px;
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
                color:              var(--grayBlue);
                transition:         background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
                cursor:             pointer;
                user-select:        none;
            }
            label:hover .custom-checkbox-text {
                background-color:   var(--lightGray);
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
                color:              var(--grayBlue);
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

            /* --- Specific Styling for item Card --- */
            .item-display-area {
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

            .item-card {
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

            .item-card.offscreen-right {
                transform:          translateX(150%);
                opacity:            0;
            }

            .item-card.offscreen-left {
                transform:          translateX(-150%);
                opacity:            0;
            }

            .item-card-incomplete {
                border:             5px solid var(--redish);
            }

            .item-card-complete {
                border:             5px solid var(--okGreen);
            }

            .item-header {
                display:            flex;
            }

            .item-name {
                font-size:          1.8em;
                font-weight:        bold;
                color:              var(--grayBlue);
                margin-bottom:      5px;
                text-align:         center;
                border:             solid 1px var(--lightGray);
                padding:            10px;
            }

            .question-group {
                margin-bottom:      0px;
                padding-bottom:     0px;
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
                color:              var(--grayBlue);
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
            .item-progress-message {
                font-size:          1.1em;
                color:              var(--grayBlue);
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

            .item-header {
                position:           relative;
                padding-top:        5px;
                --checkmark-size:   5vw; /* Size of the checkmark icon */
            }
            .item-header .complete-indicator {
                position:           absolute;
                top:                calc(var(--checkmark-size) * -0.5); /* Move up by half its height */
                left:               calc(var(--checkmark-size) * -0.5); /* Move left by half its width */
                z-index:            30;
                opacity:            0; /* Initially invisible */
                transform:          scale(0.5); /* Initially smaller */
                transition:         opacity 0.5s ease-out, transform 0.5s ease-out; /* Animation */
            }
            .item-header.completed .complete-indicator {
                opacity:            1;
                transform:          scale(1);
            }
            .item-header .complete-indicator svg {
                width:              var(--checkmark-size);
                height:             var(--checkmark-size);
                stroke:             none;
            }

            .add-item-button {
                display:            flex;
                flex-direction:     row;
                width:              100%;
                align-content:      center;
                background:         var(--niceBlue);
                border-radius:      5px;
                border:             none;
                padding:            12px 25px;
                font-size:          1.1em;
                color:              var(--whiteColor);
                cursor:             pointer;
                line-height:        1.4;
                align-items:        center;
                justify-content:    center;
            }

            .done-button {
                display:        flex;
                flex-direction: row;
            }

            input {  /*default value for inputs */
                background-color:   var(--niceBlue);
                border:             1px solid var(--niceBlue);
                color:              var(--whiteColor);
                transform:          translateY(-1px);
                box-shadow:         0 2px 5px var(--shadowColor);
            }



            @media (0 <= width <= 720px) {
                .item-name {
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

    public getAddItemSVGIcon() : string
    //can be overridded by descendents
    {
        let v1= `
            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="icon add-button-icon">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z" fill="#1C274C"/>
            </svg>
        `;

        let v2= `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff" transform="rotate(0)" stroke-width="1.8" class="icon add-button-icon">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier"
              stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier" >
              <path fill-rule="evenodd" clip-rule="evenodd"
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2
              6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 9C12.75 8.58579 12.4142 8.25 12
              8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858
              8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858
              15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142
              12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
              fill="#ffef0eff">
              </path>
              </g>
            </svg>
        `;
        return v2;

    }
    public getAddItemText() : string
    {
        return "Add NEW Item";
    }

    public getHTMLNavArea() : string {
        let result : string = `
            <div class="navigation-area">
                <button type="button" class="nav-button prev-item-button">&larr; Previous</button>
                <span class="item-progress-message"></span>
                <button type="button" class="nav-button next-item-button">Next &rarr;</button>
            </div>
        `;
        return result;
    }

    public getHTMLAddArea() : string {
        let result : string = `
            <div class="add-item-area">
                <button type="button" class="add-item-button hidden">
                    <!-- Icon on the left -->
                    <span class="done-button-icon-area">
                        ${this.getAddItemSVGIcon()}
                    </span>
                    <!-- Text container -->
                    <span class="done-button-text">
                        <span class="add-button-main-text">${this.getAddItemText()}</span>
                        <span class="add-button-sub-text"></span>
                    </span>
                </button>
            </div>
        `;
        return result;
    }

    public getHTMLStructure() : string
    {
        let result : string = `
            <form class='itemreview-container'>
                ${this.getHTMLHeader()}
                ${this.getHTMLMain()}
                ${this.getHTMLNavArea()}
                ${this.getHTMLAddArea()}
                ${this.getHTMLFooter()}
            </form>
        `;
        return result;

    }

    public getHTMLTagContent() : string
    {
        let result = this.getHTMLStructure();
        /*
        let old_result : string = `
            <form class='itemreview-container'>
                <div class="header-area">
                    <h1>${this.getTitleText()}</h1>
                    <patient-name-area>
                      Patient: <span class="patient-name"></span>
                    </patient-name-area>
                </div>

                <div class="main-content-area">
                    <div class="item-display-area">
                        </div>
                    <div class="navigation-area">
                        <button type="button" class="nav-button prev-item-button">&larr; Previous</button>
                        <span class="item-progress-message"></span>
                        <button type="button" class="nav-button next-item-button">Next &rarr;</button>
                    </div>
                </div>

                <div class="add-item-area">
                    <button type="button" class="add-item-button hidden">
                        <!-- Icon on the left -->
                        <span class="done-button-icon-area">
                            ${this.getAddItemSVGIcon()}
                        </span>
                        <!-- Text container -->
                        <span class="done-button-text">
                            <span class="add-button-main-text">${this.getAddItemText()}</span>
                            <span class="add-button-sub-text"></span>
                        </span>
                    </button>
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
        */
        return result;
    }

    public cacheDOMElements() {
        this.doneButton               = this.htmlEl.dom.querySelector<HTMLButtonElement>( '.done-button');
        this.doneButtonMainText       = this.htmlEl.dom.querySelector<HTMLSpanElement>(   '.done-button-main-text');
        this.doneButtonSubText        = this.htmlEl.dom.querySelector<HTMLSpanElement>(   '.done-button-sub-text');
        this.htmlEl.itemDisplayAreaEl = this.htmlEl.dom.querySelector<HTMLDivElement>(    '.item-display-area');
        this.htmlEl.prevItemButtonEl  = this.htmlEl.dom.querySelector<HTMLButtonElement>( '.prev-item-button');
        this.htmlEl.nextItemButtonEl  = this.htmlEl.dom.querySelector<HTMLButtonElement>( '.next-item-button');
        this.htmlEl.itemProgMessageEl = this.htmlEl.dom.querySelector<HTMLSpanElement>(   '.item-progress-message');
        this.htmlEl.addItemButtonEL   = this.htmlEl.dom.querySelector<HTMLButtonElement>( '.add-item-button');
    }

    public clearCachedDOMElements() {
        this.doneButton = null;
        this.doneButtonMainText = null;
        this.doneButtonSubText = null;
        this.htmlEl.itemDisplayAreaEl = null;
        this.htmlEl.prevItemButtonEl = null;
        this.htmlEl.nextItemButtonEl = null;
        this.htmlEl.itemProgMessageEl = null;
    }

    public setupPatientNameDisplay() {
        // Populate patient name
        const patientNameEl = this.htmlEl.dom.querySelector<HTMLSpanElement>('.patient-name');
        if (patientNameEl) patientNameEl.textContent = this.ctrl.patientFullName || "Valued Patient";
    }


    /**
     * Renders the current item with its questions.
     * Handles the sliding animation.
     * @param direction 'next' or 'prev' for animation direction
     */
    public renderCurrentItem(currentItemIndex : number, direction: 'next' | 'prev' | null = null): void {
        //NOTE: virtual -- should be implemented in descendent classes
    }

    public animateCard(oldCard : HTMLElement | null, newCard: HTMLElement | null, direction: CardAnimationDirection = null) {
        // Apply animations
        if (!this?.htmlEl?.itemDisplayAreaEl) return;
        if (oldCard && direction) {
            oldCard.classList.add(direction === 'next' ? 'offscreen-left' : 'offscreen-right');  // Animate the old card out.
            this.inCardChangeAnimation = true;       // Listen for the old card's animation to finish.
            // NOTE: If new card is added before old card is removed, then parent will expand in size to 2 rows, causing screen weirdness
            oldCard.addEventListener('transitionend', () => {
                if (oldCard.parentNode) oldCard.parentNode.removeChild(oldCard);
                if (!this?.htmlEl?.itemDisplayAreaEl) return;
                if (newCard) {
                    this.htmlEl.itemDisplayAreaEl.appendChild(newCard);
                    const initialPositionClass = direction === 'next' ? 'offscreen-right' : 'offscreen-left';
                    newCard.classList.add(initialPositionClass);  // Set the initial position of the new card
                    newCard.offsetWidth;  // Force a reflow to ensure the initial state is applied
                    // Use setTimeout to trigger the transition to the final position (ensure messages have been processed)
                    setTimeout(() => {
                        newCard.classList.remove(initialPositionClass);  // Remove the initial position class to start the animation
                        newCard.addEventListener('transitionend', () => {
                          this.inCardChangeAnimation = false;
                        }, { once: true });
                    }, 0);
                }
                this.initializeCard(newCard);
            }, { once: true });
        }  else {
            // No animation on initial load
            this.htmlEl.itemDisplayAreaEl.innerHTML = ''; // Clear previous content directly
            if (newCard) this.htmlEl.itemDisplayAreaEl.appendChild(newCard);
            this.initializeCard(newCard);
        }
    }

    public initializeCard(cardEl : HTMLElement | null) : void {
        this.updateNavigationButtons();
        if (cardEl) {
            this.addCardEventListeners(cardEl);
            this.updateCardCompletionState(cardEl); // Update card color, checkmark, and next button
        }
        this.updatePageState(); // Update the done button state based on cardEl
    }

    /**
     * Adds event listeners to the currently displayed item card for data capture.
     * @param cardEl The HTML element of the current item card.
     */
    public addCardEventListeners(cardEl: HTMLElement): void {
        cardEl.addEventListener('change', (e) => {
            this.captureItemAnswer(e.target as HTMLInputElement | HTMLTextAreaElement);
            this.updateCardCompletionState(cardEl); // Update card color, checkmark, and next button on change
            this.updatePageState();
        });
        cardEl.addEventListener('input', (e) => {
            // For textareas, 'input' event captures changes more granularly
            const target = e.target as HTMLTextAreaElement;
            if (target.tagName === 'TEXTAREA') {
                this.captureItemAnswer(target);
                this.updatePageState();
            }
        });
    }

    /**
     * Captures the answer for the current item and updates the itemAnswers array.
     * @param target The input or textarea element that changed.
     */
    public captureItemAnswer(target: HTMLInputElement | HTMLTextAreaElement): void {
        //virtual -- should be implemented in descendent classes
    }

    /**
     * Checks if a given item's questions are fully answered.
     * @param itemIndex The index of the item to check.
     * @returns True if all required questions are answered, false otherwise.
     */
    public isItemAnsweredComplete(itemIndex: number, forceRecalc: boolean = false): boolean { // Changed parameter to itemIndex
        //virtual -- should be implemented in descendent classes
        return false;
    }

    /**
     * Updates the background color of the item card and the visibility of the checkmark.
     * Also updates the color of the Next button.
     * @param cardEl The HTML element of the current item card.
     * @param itemName The name of the item.
     */
    public updateCardCompletionState(cardEl: HTMLElement): void {
        const itemHeader = cardEl.querySelector('.item-header');
        if (!itemHeader) return;

        if (this.isItemAnsweredComplete(this.currentItemIndex, true)) { // Use currentItemIndex, forcing recalculation
            cardEl.classList.remove('item-card-incomplete');
            cardEl.classList.add('item-card-complete');
            itemHeader.classList.add('completed'); // Shows the checkmark

            // Update Next button color if it exists
            if (this.htmlEl.nextItemButtonEl) {
                this.htmlEl.nextItemButtonEl.classList.remove('incomplete');
                this.htmlEl.nextItemButtonEl.classList.add('complete');
                this.htmlEl.nextItemButtonEl.innerHTML = 'Next &rarr;';
            }
        } else {
            cardEl.classList.remove('item-card-complete');
            cardEl.classList.add('item-card-incomplete');
            itemHeader.classList.remove('completed'); // Hides the checkmark

            // Update Next button color if it exists
            if (this.htmlEl.nextItemButtonEl) {
                this.htmlEl.nextItemButtonEl.classList.remove('complete');
                this.htmlEl.nextItemButtonEl.classList.add('incomplete');
                this.htmlEl.nextItemButtonEl.innerHTML = 'Next (current med INCOMPLETE) &rarr;';
            }
        }
    }

    public getDataLength() : number
    {
        return this?.itemData?.length || 0;

    }

    public getProgressMessage() : string
    //This should be overrridden by descendent classes
    {
        return 'No items to review';
    }


    /**
     * Updates the enabled/disabled state of the navigation buttons and the progress message.
     */
    public updateNavigationButtons(): void {
        if (!this.htmlEl.prevItemButtonEl || !this.htmlEl.nextItemButtonEl || !this.htmlEl.itemProgMessageEl) return;

        // Update progress message
        const totalItems = this.getDataLength();
        this.htmlEl.itemProgMessageEl.textContent = this.getProgressMessage();

        // Update Previous button visibility
        if (this.currentItemIndex === 0) {
            //this.htmlEl.prevItemButtonEl.classList.add('hidden');
            this.htmlEl.prevItemButtonEl.disabled = true;
        } else {
            //this.htmlEl.prevItemButtonEl.classList.remove('hidden');
            this.htmlEl.prevItemButtonEl.disabled = false;
        }

        // Update Next button visibility
        if (this.currentItemIndex === totalItems - 1) {
            //this.htmlEl.nextItemButtonEl.classList.add('hidden');
            this.htmlEl.nextItemButtonEl.disabled = true;
        } else {
            //this.htmlEl.nextItemButtonEl.classList.remove('hidden');
            this.htmlEl.nextItemButtonEl.disabled = false;
        }

        // If there are no items at all, hide both buttons
        if (totalItems === 0) {
            //this.htmlEl.prevItemButtonEl.classList.add('hidden');
            //this.htmlEl.nextItemButtonEl.classList.add('hidden');
            this.htmlEl.prevItemButtonEl.disabled = true;
            this.htmlEl.nextItemButtonEl.disabled = true;
        }
    }

    /**
     * Handles navigation to the previous item.
     */
    public handlePrevItem = (): void => {
        if (this.inCardChangeAnimation) return;  //don't allow until prior animations done.
        if (this.currentItemIndex > 0) {
            this.currentItemIndex--;
            this.renderCurrentItem(this.currentItemIndex, 'prev');
        }
    }

    /**
     * Handles navigation to the next item.
     */
    public handleNextItem = (): void => {
        if (this.inCardChangeAnimation) return;  //don't allow until prior animations done.
        if (this.currentItemIndex < this.itemData.length - 1) {
            this.currentItemIndex++;
            this.renderCurrentItem(this.currentItemIndex, 'next');
        }
    }

    public handleAddItem = async () : Promise<void> => {
        const schema : DlgSchema = {
            title: "User Info",
            Fields: {
              Name: "string",
              Age: "number",
              Subscribe: "boolean"
            }
        };
        const result = await showPopupDlg(schema, document.body);

        if (result) {
          console.log("User input:", result);
        } else {
          console.log("Form was canceled");
        }
    }

    // --- Data, Submission, and Autosave Logic ---

    /**
     * Sets up event listeners for the form, including the autosave mechanism and the 'Done' button.
     */
    public setupFormEventListeners = (): void => {
        if (!this.htmlEl) return;
        // Navigation buttons
        this.htmlEl.prevItemButtonEl?.addEventListener('click', this.handlePrevItem);
        this.htmlEl.nextItemButtonEl?.addEventListener('click', this.handleNextItem);

        // Add Items buttons
        this.htmlEl.addItemButtonEL?.addEventListener( 'click', this.handleAddItem);

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
        this.itemData.forEach((med, index) => { // Iterate with index
            if (this.isItemAnsweredComplete(index)) {
                answeredCount++;
            }
        });

        const totalQuestions = this.itemData.length;
        const unansweredCount = totalQuestions - answeredCount;

        // Update progress data
        this.progressData.totalItems = totalQuestions;
        this.progressData.answeredItems = answeredCount;
        this.progressData.unansweredItems = unansweredCount;
        this.progressData.progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    }

    public updateAddButtonState() {
        let addButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.add-item-button');
        if (!addButton) return;

        const unansweredCount = this.progressData.unansweredItems || 0;
        const totalQuestions = this.progressData.totalItems || 0;

        //NOTE: below effects that add button only shows AFTER all other items have been reviewed.
        let shouldHide : boolean = !((totalQuestions == 0) || (unansweredCount == 0));
        if (shouldHide) {
            addButton.classList.add('hidden');
        } else {
            addButton.classList.remove('hidden');
        }
    }

    /**
     * Handles the pseudo-event for when the Done Button state changes.
     *   'pseduo' event, because system doesn't trigger, instead this is called at end of handler for Done Button state change.
     */
    public handleOnDoneButtonStateChange() {
        this.updateAddButtonState();
    }

    /**
     * Populates the form fields based on a JSON object from the server.
     * @param data A JSON object with data.
     */
    public serverDataToForm = (data: TServerData): void => {
        this.itemData = data; // Store the full list
        this.currentItemIndex = 0; // Start with the first item
        this.renderCurrentItem(this.currentItemIndex); // Render the first item
        this.updatePageState();    // Update the done button state after loading the data
    }


    /**
     * Gathers all item answers into a structured JSON object.
     * @returns A JSON object representing the current state of all item answers.
     */
    public gatherDataForServer = (): TServerData => {
        return this.itemData;
    }

}