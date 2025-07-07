// /opt/worldvista/EHR/web/previsit/www/components/dashboard.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/components/dashboard.js

import TAppView, { EnhancedHTMLElement } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import type { GetPatientFormsApiResponseArray, GetPatientFormsApiResponse } from '../utility/types.js'; // Import types for type safety

// --- Type Definitions ---

export type DashboardHTMLElement = EnhancedHTMLElement & {
    // Extend the base EnhancedHTMLElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Extends the base AppViewInstance to add properties and shortcuts
 * specific to this dashboard component.
 * The specific DOM elements are now properties of the `html` member.
 */
/*
export interface DashboardAppViewInstance extends AppViewInstance { // BaseELInstance is now the EL class instance
    html: DashboardHTMLElement; // Extended from base html property with specific DOM elements
    about: () => void;
}
*/

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
    declare htmlEl: DashboardHTMLElement; // Use 'declare' to override the type of the inherited property

    constructor(aCtrl:  TCtrl,  opts?: DashboardOptions) {
        super('dashboard', '/api/dashboard', aCtrl);
        { //temp scope for tempInnerHTML
            const tempInnerHTML = `
                <style>
                    .dashboard-container {
                        padding: 30px;
                        text-align: center;
                        background-color: #ffffff;
                        xborder-radius: 8px;
                        xbox-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        xwidth: 100%;
                        xmax-width: 500px;
                        min-height: 100vh;
                    }
                    .dashboard-container h1 {
                        color: #333;
                        margin-top: 15px;
                    }
                    .dashboard-container svg {
                        width: 48px;
                        height: 48px;
                        stroke: #007bff;
                    }
                    .forms-container {
                        margin-top: 25px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .forms-container button {
                        padding: 12px 20px;
                        background-color: #007bff;
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
                        background-color: #0056b3;
                    }
                    .forms-container button.completed {
                        background-color: #28a745; /* Green for completed */
                        border-color: #218838;
                    }
                    .forms-container button.completed:hover {
                        background-color: #218838;
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

                <div class='container dashboard-container'>
                    <h1>Welcome, <span class="patient-name"></span>!</h1>
                    <div class="instructions">
                        <p>Please select a form to begin.</p>
                    </div>
                    <div class="forms-container"></div>
                </div>
            `;  //end of innerHTML
            this.setHTMLEl(tempInnerHTML);
        }  //end of temp scope for tempInnerHTML
        if (opts) {
          //process opts -- if any added later
        }

    }  //constructor

    /** Fetches the list of required forms from the server. */
    private async loadForms(): Promise<void>
    {
        const sessionID = this.ctrl.loginData?.sessionID;
        if (!sessionID) {
            console.error("No session ID found. Cannot load forms."); // Corrected typo: 'sessionID'
            if (this.htmlEl.$formscontainer) this.htmlEl.$formscontainer.textContent = "No session ID found. Cannot load forms.";
            return;
        }

        this.setHTMLEl(this.sourceHTML);  //This is initial HTML.  Patient-specific parts will be inserted below
        // Populate the patient's name from the shared controller
        if (this.htmlEl.$patientname) {
            this.htmlEl.$patientname.textContent = this.ctrl.patientFullName || "Valued Patient";
        }

        await this.prePopulateFromServer(); //evokes call to serverDataToForm()
        /*
        try {
            const params = new URLSearchParams({ sessionID });
            const URL = `/api/dashboard?${params.toString()}`;
            const response = await fetch(URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: DashboardApiResponse = await response.json();

            if (data.success && Array.isArray(data.forms)) {
                this.renderForm(data.forms);
            } else {
                console.error("Failed to load forms:", data.message);
                if (this.htmlEl.$formscontainer) this.htmlEl.$formscontainer.textContent = "Could not load forms.";
            }
        } catch (error) {
            console.error("Error fetching forms:", error);
            if (this.htmlEl.$formscontainer) this.htmlEl.$formscontainer.textContent = "Error loading forms. Please try again later.";
        }
        */
    }  //loadForms

    /** Renders the buttons for each form. */
    public serverDataToForm = (forms: GetPatientFormsApiResponseArray): void => {
        const container = this.htmlEl.$formscontainer;
        if (!container) return;
        container.innerHTML = '';  // Clear previous content
        forms.forEach((item : GetPatientFormsApiResponse) => {
            const displayName = item.text;
            const targetName = item.viewName;
            if (!displayName || !targetName) return;

            const progress = item.progress;
            const button = document.createElement('button');
            button.dataset.targetName = targetName;

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

    public async refresh() : Promise<void> {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }

}