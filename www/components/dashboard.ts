// /opt/worldvista/EHR/web/previsit/www/components/dashboard.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/components/dashboard.js

import TAppView, {  } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import type { GetPatientFormsApiResponseArray, GetPatientFormsApiResponse,
              EnhancedHTMLDivElement
            } from '../utility/types.js';
import {svgIcons } from '../utility/globals.js';
import { showPopupDlg, DlgSchema, FieldType, FieldEntry, ModalBtn } from './dialog_popup.js';

// --- Type Definitions ---

export type DashboardHTMLElement = EnhancedHTMLDivElement & {
    // Extend the base EnhancedHTMLDivElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};


interface DashboardOptions {
    someOption : any;
}

/**
 * Defines the shape of the JSON response from the `/api/dashboard` endpoint.
 */
interface DashboardApiResponse {
    success: boolean;
    forms?: GetPatientFormsApiResponseArray;
    message?: string;
}


// ---------------------------------------------------
// Purpose: Represents the Dashboard component as a class.
//export default class DashboardAppView extends TAppView implements DashboardAppViewInstance {
export default class TDashboardAppView extends TAppView<GetPatientFormsApiResponseArray> {   // implements DashboardAppViewInstance
    declare htmlEl: DashboardHTMLElement | null; // Use 'declare' to override the type of the inherited property
    private formsHaveBeenSubmitted : boolean = false;

    constructor(aCtrl:  TCtrl,  opts?: DashboardOptions) {
        super('dashboard', '/api/dashboard', aCtrl);
        this.formAutoSaves = false;  //dashboard doesn't need to save off data
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    public async refresh() : Promise<void> {
        this.htmlEl = null;  //force reload of form.
        await super.refresh();
    }

    public getCSSContent(): string {
        let result : string = super.getCSSContent() + `
            <style>
                .content-container {
                    /* other values inherited from ancestor */
                    padding: 30px;
                    text-align: center;
                    min-height: 100vh;
                }
                .forms-container {
                    margin-top: 25px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .forms-container button {
                    padding: 12px 20px;
                    background-color: var(--niceBlue);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.05em;
                    text-align: left;
                    transition: background-color 0.3s ease, border-color 0.3s ease;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .forms-container button:hover {
                    background-color: var(--darkerNiceBlue);
                }
                .forms-container button.completed {
                    background-color: var(--okGreen);
                    border-color: var(--okGreen);
                }
                .forms-container button.completed:hover {
                    background-color: var(--darkerGreen);
                }
                .button-text {
                    flex-grow: 1;
                }
                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-left: 20px; /* Space between text and progress */
                }
                .progress-bar-container {
                    width: 120px; /* A fixed width for the bar */
                    height: 12px;
                    background-color: rgba(255, 255, 255, 0.3); /* Lighter background for the bar */
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }
                .progress-bar {
                    height: 100%;
                    background-color: #f1c40f; /* A distinct color for progress */
                    border-radius: 6px 0 0 6px; /* Keep left radius */
                    transition: width 0.4s ease-in-out;
                }

                @media (0 <= width <= 500px) {
                    .progress-bar-container {
                        width: 60px; /* A fixed width for the bar */
                    }
                }

                .progress-text {
                    font-size: 0.9em;
                    min-width: 45px; /* Prevents layout shift */
                    text-align: right;
                }
                .instructions {
                    background-color:rgb(236, 231, 231);
                    text-align: center;
                    color: #400909;
                }
            </style>
        `;
        return result;
    }

    public getTitleText() : string
    {
        return "Welcome!";
    }

    public getHTMLMain() : string {
        let result : string = `
            <div class="instructions">
                <p>Please select a form to begin.</p>
            </div>
            <div class="forms-container"></div>
        `;
        return result;
    }


    public getHTMLStructure() : string
    {
        let result : string = `
            <form class='container content-container'>
                ${this.getHTMLHeader()}
                ${this.getHTMLMain()}
                <hr>
                ${this.getHTMLFooter()}
            </form>
        `;
        return result;
    }

    public getHTMLTagContent(): string {
        return this.getHTMLStructure();
    }

    public getDoneIncompleteSVGIcon() : string
    {
        return svgIcons["CirclePending"];
    }

    public getDoneCompleteSVGIcon() : string
    {
        return svgIcons["CircleCheckmark"];
    }

    public gatherDataForServer = (): GetPatientFormsApiResponseArray => {
        //Typically there is no data to send back, but to be consistent with other forms,
        //  we'll implement the method.  This will normally result in call to "save" an empty array...
        let result : GetPatientFormsApiResponseArray = [];

        //...But if user has pressed button to submit forms, then will pass back a record with signal.
        if (this.formsHaveBeenSubmitted) {
            let signal : GetPatientFormsApiResponse =  {
                formsHaveBeenSubmitted: true,
            }
            result.push(signal);
        }
        return result;
    }


    /** Renders the buttons for each form. */
    public serverDataToForm = (data: GetPatientFormsApiResponseArray): void => {
        const container = this.htmlEl?.$formscontainer;
        if (!container) return;
        container.innerHTML = '';  // Clear previous content
        data.forEach((item : GetPatientFormsApiResponse) => {
            const displayName = item.text;
            const targetName = item.viewName;
            const iconName = item.iconName; // Get the icon name from the item

            if (!displayName || !targetName) return;

            const progress = item.progress;
            const button = document.createElement('button');
            button.dataset.targetName = targetName;

            // Add SVG icon if iconName is provided and exists in svgIcons
            if (iconName && svgIcons[iconName]) {
                const iconSpan = document.createElement('span');
                iconSpan.innerHTML = svgIcons[iconName]; // Insert the SVG directly as HTML
                button.appendChild(iconSpan);
            }

            const buttonText = document.createElement('span');
            buttonText.className = 'button-text';
            buttonText.textContent = displayName;
            button.appendChild(buttonText);

            // Create and append progress elements if progress data is available
            if (progress && typeof progress.progressPercentage === 'number') {
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress-container';

                const progressBarContainer = document.createElement('div');
                progressBarContainer.className = 'progress-bar-container';

                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.width = `${progress.progressPercentage}%`;

                progressBarContainer.appendChild(progressBar);

                const progressText = document.createElement('span');
                progressText.className = 'progress-text';
                progressText.textContent = `${progress.progressPercentage}%`;

                progressContainer.appendChild(progressBarContainer);
                progressContainer.appendChild(progressText);
                button.appendChild(progressContainer);

                if (progress.progressPercentage === 100) {
                    button.classList.add('completed');
                }
            }

            button.onclick = (event: MouseEvent) => {
                const clickedButton = event.currentTarget as HTMLButtonElement;
                const targetName = clickedButton.dataset.targetName;
                if (targetName === undefined) return;
                event.preventDefault();
                this.triggerChangeView(targetName);
            };
            container.appendChild(button);
        });
    }

    public updateProgressState = (): void => {

        let totalForms : number = 0;
        let completedForms : number = 0;

        // Reset progress data
        this.progressData.answeredItems = 0;
        this.progressData.unansweredItems = 0;
        this.progressData.totalItems = 0;
        this.progressData.progressPercentage = 0;

        //NOTE: This function uses serverData, which is last data downloaded from server.
        //      For this app, it should be up to date, because progress is not modified
        //      in this form (it is done in each separate form app)
        if (!this.serverData) return;

        this.serverData.forEach((item : GetPatientFormsApiResponse) => {
            totalForms++;
            const progress = item.progress;
            const pct : number = progress?.progressPercentage ?? 0;
            if (pct===100) completedForms++;
        });

        // Update progress data
        this.progressData.totalItems = totalForms;
        this.progressData.answeredItems = completedForms;
        this.progressData.unansweredItems = totalForms - completedForms;
        this.progressData.progressPercentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
    }


    public updateDoneButtonState(): void
    {
        const unansweredForms = this.progressData.unansweredItems || 0;
        const totalForms = this.progressData.totalItems || 0;

        if (!this.htmlEl ) return;
        let doneButton = this.htmlEl.dom.querySelector<HTMLButtonElement>('.done-button');
        let doneButtonMainText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-main-text');
        let doneButtonSubText = this.htmlEl.dom.querySelector<HTMLSpanElement>('.done-button-sub-text');

        if (!doneButton || !doneButtonMainText || !doneButtonSubText) return;

        // If no items, change text
        if (totalForms === 0) {
            doneButtonMainText.textContent = 'No Forms to Review';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            doneButton.classList.remove('done-button-complete');
            doneButton.classList.add('done-button-incomplete'); // Visually indicate it's not "done" in the active sense
        } else if (unansweredForms === 0) {
            doneButtonMainText.textContent = 'Submit -- All Forms Complete';
            doneButtonSubText.textContent = '';
            doneButtonSubText.style.display = 'none';
            doneButton.classList.add('done-button-complete');
            doneButton.classList.remove('done-button-incomplete');
        } else {
            doneButtonMainText.textContent = 'Submit Incomplete Information';
            doneButtonSubText.textContent = `(declining to complete ${unansweredForms} of ${totalForms} forms)`;
            doneButtonSubText.style.display = 'block';
            doneButton.classList.add('done-button-incomplete');
            doneButton.classList.remove('done-button-complete');
        }
        this.handleOnDoneButtonStateChange();
    };

    /**
     * Handles the 'Done' button click.
     * REPLACING function in appview class, as that one navigates here to dashboard
     */
    public handleDoneClick = async (): Promise<void> => {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
            this.autosaveTimer = null;
        }

        let submitConfirmed : boolean = await this.confirmSubmit();
        if (!submitConfirmed) return;

        this.formsHaveBeenSubmitted = true;

        const data : GetPatientFormsApiResponseArray = this.gatherDataForServer();
        await this.sendDataToServer(data, this.progressData);

        //Later, I will navigate to an ALL DONE page
        //console.log("Navigating to dashboard.");
        //this.triggerChangeView("dashboard");
    }

    public setupFormEventListeners(): void {
        if (this.htmlEl) {
            this.htmlEl.dom.querySelector('.done-button')?.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Done button clicked!");
                this.handleDoneClick();
            });
        }
    }

    public confirmSubmit = async () : Promise<boolean> => {
        this.updateProgressState();
        //let totalForms : number = this.progressData.totalItems || 0;
        //let completedForms : number = this.progressData.answeredItems || 0;
        let unansweredForms : number = this.progressData.unansweredItems || 0;
        let instructions : string = (unansweredForms > 0) ? `NOTE: ${unansweredForms} Forms are INCOMPLETE!`
                                                          : "All forms COMPLETED"

        const schema : DlgSchema = {
            buttons: [ModalBtn.OK, ModalBtn.Cancel],
            title: "Submit Forms to Medical Record?",
            instructions: instructions,
        };

        const popupResult = await showPopupDlg(schema, document.body);
        const modalResult = popupResult.modalResult;
        const result : boolean = (modalResult == ModalBtn.OK);
        return result;
    }

}