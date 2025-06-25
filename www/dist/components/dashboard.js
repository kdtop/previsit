// /opt/worldvista/EHR/web/previsit/www/components/dashboard.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/components/dashboard.js
import EL from '../utility/el.js';
// ---------------------------------------------------
// Purpose: Return a visualization element for the dashboard screen.
export default function DashboardComp(opts) {
    const ctrl = opts.ctrl;
    const innerHTML = `
        <style>
            .dashboard-container {
                padding: 30px;
                text-align: center;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 500px;
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
                transition: background-color 0.3s ease;
            }
            .forms-container button:hover {
                background-color: #0056b3;
            }
            .instructions {
                background-color:rgb(236, 231, 231);
                text-align: center;
                color: #400909;
            }
        </style>

        <div class='container dashboard-container'>
            <h1>Welcome, <span class="patient-name"></span>!</h1>
            <div class="instructions>"
                <p>Please select a form to begin.</p>
            </div>
            <div class="forms-container"></div>
        </div>
    `;
    // Create the component instance using the EL utility
    const self = new EL({ innerHTML });
    // Populate the patient's name from the shared controller
    if (self.$patientname) {
        self.$patientname.textContent = ctrl.patientFullName || "Valued Patient";
    }
    /** Fetches the list of required forms from the server. */
    async function loadForms(ctrl) {
        // Ensure we have a session ID before making the request.
        const sessionID = ctrl.loginData?.sessionID;
        if (!sessionID) {
            console.error("No session ID found. Cannot load forms.");
            if (self.$formscontainer)
                self.$formscontainer.textContent = "Authentication error. Cannot load forms.";
            return;
        }
        try {
            const params = new URLSearchParams({ sessionID });
            const URL = `/api/dashboard?${params.toString()}`;
            const response = await fetch(URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.forms)) {
                renderFormButtons(data.forms);
            }
            else {
                console.error("Failed to load forms:", data.message);
                if (self.$formscontainer)
                    self.$formscontainer.textContent = "Could not load forms.";
            }
        }
        catch (error) {
            console.error("Error fetching forms:", error);
            if (self.$formscontainer)
                self.$formscontainer.textContent = "Error loading forms. Please try again later.";
        }
    }
    /** Renders the buttons for each form. */
    function renderFormButtons(forms) {
        const container = self.$formscontainer;
        if (!container)
            return;
        container.innerHTML = ''; // Clear previous content
        forms.forEach(formName => {
            const button = document.createElement('button');
            button.textContent = formName; // Set the button's text content
            button.onclick = (event) => {
                const clickedButton = event.currentTarget; // Get the button element
                console.log(`Clicked on form: ${formName}`);
                console.log(`The clicked button's text was: ${clickedButton.textContent}`);
                // You can now do something with 'clickedButton'
            };
            container.appendChild(button);
        });
    }
    // Load the forms when the component is initialized.
    loadForms(ctrl);
    // Example of an instance method
    self.about = function () {
        console.log("Dashboard Component instance");
    };
    return self;
}
//# sourceMappingURL=dashboard.js.map