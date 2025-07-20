// /opt/worldvista/EHR/web/previsit/www/components/dashboard.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/components/dashboard.js
import TAppView from './appview.js';
// Hard-coded SVG icons
const svgIcons = {
    "ClipboardPlus": `
        <?xml version="1.0" encoding="utf-8"?>
        <svg width="24px" height="24px" viewBox="-2 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <g id="medical-record" transform="translate(-4 -2)">
                <path id="secondary" fill="#2ca9bc" d="M18,3H15V6a1,1,0,0,1-1,1H10A1,1,0,0,1,9,6V3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1H18a1,1,0,0,0,1-1V4A1,1,0,0,0,18,3Z"/>
                <path id="primary" d="M18,21H6a1,1,0,0,1-1-1V4A1,1,0,0,1,6,3H18a1,1,0,0,1,1,1V20A1,1,0,0,1,18,21ZM9,3h6V6a1,1,0,0,1-1,1H10A1,1,0,0,1,9,6Zm3,13V12m2,2H10" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </g>
        </svg>
    `,
    "CoughingIcon": `
        <?xml version="1.0" encoding="utf-8"?>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.83541 7.82918C8.46493 7.64394 8.01442 7.79411 7.82918 8.16459C7.64394 8.53507 7.79411 8.98558 8.16459 9.17082L9.37574 9.77639C9.56 9.86852 9.56 10.1315 9.37574 10.2236L8.16459 10.8292C7.79411 11.0144 7.64394 11.4649 7.82918 11.8354C8.01442 12.2059 8.46493 12.3561 8.83541 12.1708L10.0466 11.5652C11.3364 10.9203 11.3364 9.07967 10.0466 8.43475L8.83541 7.82918Z" fill="currentColor"/>
            <path d="M16.1646 7.82918C16.5351 7.64394 16.9856 7.79411 17.1708 8.16459C17.3561 8.53507 17.2059 8.98558 16.8354 9.17082L15.6243 9.77639C15.44 9.86852 15.44 10.1315 15.6243 10.2236L16.8354 10.8292C17.2059 11.0144 17.3561 11.4649 17.1708 11.8354C16.9856 12.2059 16.5351 12.3561 16.1646 12.1708L14.9534 11.5652C13.6636 10.9203 13.6636 9.07967 14.9534 8.43475L16.1646 7.82918Z" fill="currentColor"/>
            <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 12.7831 19.8875 13.5399 19.6777 14.2552C19.9015 14.2886 20.1158 14.3372 20.3208 14.401C20.7891 14.5467 21.1886 14.7703 21.5194 15.0716C21.8314 14.1038 22 13.0716 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8872 22 13.7475 21.8845 14.5665 21.6676C14.392 21.3891 14.2362 21.0778 14.0994 20.7337C14.0032 20.4919 13.8968 20.1811 13.7803 19.8012C13.2078 19.9313 12.6119 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="currentColor"/>
            <path d="M17.1285 21.6961C17.4704 21.7143 17.7552 21.6098 17.9828 21.3825C18.2104 21.1552 18.3153 20.8706 18.2976 20.5286C18.2798 20.1867 18.1447 19.8892 17.8921 19.6363C17.6855 19.4294 17.4138 19.2607 17.0769 19.1303C16.74 18.9998 16.1236 18.8309 15.2277 18.6235C15.4338 19.5197 15.6019 20.1363 15.7318 20.4734C15.8618 20.8104 16.0301 21.0824 16.2367 21.2894C16.4893 21.5423 16.7865 21.6778 17.1285 21.6961Z" fill="currentColor"/>
            <path d="M15.25 15.5C15.25 17.0188 14.0188 18.25 12.5 18.25C10.9812 18.25 9.75 17.0188 9.75 15.5C9.75 13.9812 10.9812 12.75 12.5 12.75C14.0188 12.75 15.25 13.9812 15.25 15.5Z" fill="currentColor"/>
            <path d="M20.5812 19.1961C21.0288 19.0522 21.343 18.7787 21.5238 18.3756C21.7045 17.9726 21.6999 17.5561 21.5097 17.1261C21.3195 16.696 21.0006 16.3806 20.5528 16.1797C20.1864 16.0154 19.7552 15.932 19.2591 15.9295C18.7631 15.9271 17.8896 16.0121 16.6387 16.1845C17.3418 17.2333 17.8592 17.9422 18.1909 18.311C18.5226 18.6799 18.8717 18.9464 19.2381 19.1108C19.6859 19.3116 20.1336 19.3401 20.5812 19.1961Z" fill="currentColor"/>
        </svg>
    `,
    "ClipboardCapsule": `
        <?xml version="1.0" encoding="utf-8"?>
        <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
        <svg width="800px" height="800px" viewBox="0 0 20.2 20.2" xmlns="http://www.w3.org/2000/svg">
          <g id="medical-receipt-left-3" transform="translate(-1.8 -2)">
            <rect id="secondary" fill="#2ca9bc" width="5" height="10.66" rx="2.5" transform="translate(1.964 14.503) rotate(-45)"/>
            <path id="primary" d="M11,8h6m-4,4h4m-5.73,4.73a2.52,2.52,0,0,1,0,3.54h0a2.52,2.52,0,0,1-3.54,0l-4-4a2.52,2.52,0,0,1,0-3.54h0a2.52,2.52,0,0,1,3.54,0ZM5.84,18.16l3.32-3.32" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <path id="primary-2" data-name="primary" d="M7,8V4A1,1,0,0,1,8,3H20a1,1,0,0,1,1,1V20a1,1,0,0,1-1,1H16" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </g>
        </svg>
    `,
    "TalkQuestionMark": `
        <?xml version="1.0" encoding="utf-8"?>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 20.5C6 12.4919 12.4919 6 20.5 6H27.5C35.5081 6 42 12.4919 42 20.5C42 28.5081 35.5081 35 27.5 35H26.8V42C26.8 42 6 38.5 6 20.5ZM27.6914 12.4815C28.7211 13.1664 29.4977 14.2754 29.4977 15.7611C29.4977 17.3398 28.8609 18.4998 27.8298 19.2103C27.4025 19.5047 26.9427 19.6971 26.5 19.8236V21.3559C26.5 22.1844 25.8284 22.8559 25 22.8559C24.1716 22.8559 23.5 22.1844 23.5 21.3559V18.5586C23.5 17.769 24.1121 17.1147 24.8999 17.062C25.4539 17.0249 25.8743 16.9146 26.1276 16.74C26.2342 16.6665 26.3107 16.5823 26.3681 16.4677C26.4278 16.3486 26.4977 16.1339 26.4977 15.7611C26.4977 15.4485 26.3747 15.2088 26.0299 14.9794C25.6378 14.7186 25.0078 14.5265 24.2513 14.5025C23.5028 14.4787 22.776 14.625 22.2418 14.884C21.7049 15.1443 21.5087 15.4358 21.4533 15.6513C21.2472 16.4537 20.4297 16.9371 19.6273 16.731C18.825 16.5249 18.3416 15.7074 18.5476 14.905C18.8921 13.5637 19.8955 12.6875 20.9331 12.1845C21.9733 11.6802 23.1959 11.4674 24.3467 11.504C25.4895 11.5403 26.7089 11.828 27.6914 12.4815ZM25 29C26.1046 29 27 28.1046 27 27C27 25.8954 26.1046 25 25 25C23.8954 25 23 25.8954 23 27C23 28.1046 23.8954 29 25 29Z" fill="currentColor"/>
        </svg>
    `,
    "Frown": `
        <?xml version="1.0" encoding="utf-8"?>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"/>
            <path d="M9.38651 8.25258C9.57501 7.98383 9.67394 7.69383 9.70409 7.53971L11.1762 7.82768C11.1093 8.16984 10.9338 8.65878 10.6146 9.11391C10.291 9.57526 9.78665 10.0461 9.05511 10.2421C8.32357 10.4381 7.65141 10.2825 7.1405 10.0448C6.63648 9.81024 6.24004 9.47454 6.01099 9.21169L7.14188 8.22625C7.24506 8.34465 7.47574 8.54632 7.77335 8.68482C8.06409 8.82011 8.3681 8.87325 8.66688 8.79319C8.96566 8.71314 9.20237 8.51511 9.38651 8.25258Z" fill="currentColor"/>
            <path d="M9.48688 12.8991C10.1517 12.4136 11.0039 12 12 12C12.9961 12 13.8483 12.4136 14.5131 12.8991C15.1782 13.3848 15.7189 13.9881 16.1124 14.4806C16.5464 15.0239 16.4156 15.687 16.0892 16.0747C15.767 16.4574 15.1549 16.6955 14.5528 16.3944L13.5528 15.8944C13.1132 15.6746 12.823 15.5844 12.6164 15.5431C12.4103 15.5019 12.2484 15.5 12 15.5C11.7516 15.5 11.5897 15.5019 11.3836 15.5431C11.177 15.5844 10.8868 15.6746 10.4472 15.8944L9.44721 16.3944C8.84506 16.6955 8.23297 16.4574 7.9108 16.0747C7.58445 15.687 7.45359 15.0239 7.88761 14.4806C8.28113 13.9881 8.82181 13.3848 9.48688 12.8991Z" fill="currentColor"/>
            <path d="M14.2973 7.53971C14.3274 7.69383 14.4264 7.98383 14.6149 8.25258C14.799 8.51511 15.0357 8.71314 15.3345 8.79319C15.6333 8.87325 15.9373 8.82011 16.228 8.68482C16.5256 8.54632 16.7563 8.34465 16.8595 8.22625L17.9904 9.21169C17.7613 9.47454 17.3649 9.81024 16.8609 10.0448C16.35 10.2825 15.6778 10.4381 14.9463 10.2421C14.2147 10.0461 13.7104 9.57526 13.3868 9.11391C13.0676 8.65878 12.8921 8.16984 12.8252 7.82768L14.2973 7.53971Z" fill="currentColor"/>
        </svg>

    `,
    "Certificate": `
        <?xml version="1.0" encoding="utf-8"?>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 7V37C10 38.6569 11.3431 40 13 40H26V36.4649C24.8044 35.7733 24 34.4806 24 33C24 30.7909 25.7909 29 28 29C30.2091 29 32 30.7909 32 33C32 34.4806 31.1956 35.7733 30 36.4649V40H35C36.6569 40 38 38.6569 38 37V7C38 5.34315 36.6569 4 35 4H13C11.3431 4 10 5.34315 10 7ZM28 35C29.1046 35 30 34.1046 30 33C30 31.8954 29.1046 31 28 31C26.8954 31 26 31.8954 26 33C26 34.1046 26.8954 35 28 35ZM18 11C18 10.4477 18.4477 10 19 10L29 10C29.5523 10 30 10.4477 30 11C30 11.5523 29.5523 12 29 12L19 12C18.4477 12 18 11.5523 18 11ZM15 16C14.4477 16 14 16.4477 14 17C14 17.5523 14.4477 18 15 18H33C33.5523 18 34 17.5523 34 17C34 16.4477 33.5523 16 33 16H15ZM14 21C14 20.4477 14.4477 20 15 20H33C33.5523 20 34 20.4477 34 21C34 21.5523 33.5523 22 33 22H15C14.4477 22 14 21.5523 14 21ZM15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26H33C33.5523 26 34 25.5523 34 25C34 24.4477 33.5523 24 33 24H15Z" fill="currentColor"/>
            <path d="M26 44V40H30V44L28 42.5L26 44Z" fill="currentColor"/>
        </svg>
    `,
    "HealthCurve": `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2V20C2 21.1046 2.89543 22 4 22H22V20H4V19H5.17877C6.14495 19 7.15879 18.9817 8.17714 18.8485C9.26237 18.7065 10.8525 18.4278 12.0312 17.8851C14.8102 16.6054 16.5215 15.1423 18.1176 12.3578C18.7638 11.2304 19.1289 10.134 19.3195 9.08968L20.4775 10.367L21.9592 9.02372L18.7767 5.51314L14.7497 8.01049L15.8038 9.71018L17.348 8.75251C17.1918 9.595 16.8969 10.4656 16.3824 11.3632C15.0069 13.7629 13.6219 14.9507 11.1946 16.0684C10.3118 16.4749 8.98335 16.726 7.91776 16.8654C7.0352 16.9808 6.1297 17 5.17877 17H4V2H2Z" fill="currentColor"/>
            <path d="M13 4.5H10.5V2H8.5V4.5H6V6.5H8.5V9H10.5V6.5H13V4.5Z" fill="currentColor"/>
        </svg>
    `,
    // Add more icons here as needed
    // "anotherIcon": `<svg>...</svg>`
    //Looke here: https://healthicons.org/ or here https://www.svgrepo.com/vectors/medical/ or here https://www.reshot.com/free-svg-icons/medical/
};
// ---------------------------------------------------
// Purpose: Represents the Dashboard component as a class.
//export default class DashboardAppView extends TAppView implements DashboardAppViewInstance {
export default class TDashboardAppView extends TAppView {
    constructor(aCtrl, opts) {
        super('dashboard', '/api/dashboard', aCtrl);
        this.formAutoSaves = false; //dashboard doesn't need to save off data
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getCSSContent() {
        let result = `
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
                    /* Adjust SVG size as needed */
                    width: 24px;
                    height: 24px;
                    margin-right: 10px; /* Space between icon and text */
                    vertical-align: middle;
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
        `;
        return result;
    }
    getHTMLTagContent() {
        let result = `
            <div class='container dashboard-container'>
                <h1>Welcome, <span class="patient-name"></span>!</h1>
                <div class="instructions">
                    <p>Please select a form to begin.</p>
                </div>
                <div class="forms-container"></div>
            </div>
        `;
        return result;
    }
    setupPatientNameDisplay() {
        //NOTE: This is a virtual method, to be overridden by descendant classes
        // Populate the patient's name from the shared controller
        if (this.htmlEl.$patientname) {
            this.htmlEl.$patientname.textContent = this.ctrl.patientFullName || "Valued Patient";
        }
    }
    gatherDataForServer = () => {
        //NOTE: There is no data to send back, but to be consistent with other forms,
        //      we'll still implement the method.  This will result in call to "save" an empty array
        let result = [];
        return result;
    };
    /** Renders the buttons for each form. */
    serverDataToForm = (forms) => {
        const container = this.htmlEl.$formscontainer;
        if (!container)
            return;
        container.innerHTML = ''; // Clear previous content
        forms.forEach((item) => {
            const displayName = item.text;
            const targetName = item.viewName;
            const iconName = item.iconName; // Get the icon name from the item
            if (!displayName || !targetName)
                return;
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
            button.onclick = (event) => {
                const clickedButton = event.currentTarget;
                const targetName = clickedButton.dataset.targetName;
                if (targetName === undefined)
                    return;
                event.preventDefault();
                this.triggerChangeView(targetName);
            };
            container.appendChild(button);
        });
    };
}
//# sourceMappingURL=dashboard.js.map