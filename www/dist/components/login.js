// /opt/worldvista/EHR/web/previsit/www/components/login.ts
//
// LoginAppView
//     > has space for expand.. to scroll (for addresseses)
//     > but can have independantly scrolling windows
//     	(if display size big enough)
//
//import AppView, { AppViewInstance, EnhancedHTMLElement } from '../utility/appview.js';
import TAppView from './appview.js';
import { padZero } from '../utility/client_utils.js';
// ---------------------------------------------------
//Purpose return a visualization element.
export default class TLoginAppView extends TAppView {
    loginData; // This was on the instance, so it should be a public property of the class
    constructor(aCtrl, opts) {
        // Define innerHTML here, before calling super()
        super('login', '/api/login', aCtrl);
        { //temp scope for tempInnerHTML
            const tempInnerHTML = `
                <style>
                /* Basic styling for the app container and welcome view */
                .body {
                    font-family: sans-serif;
                    margin: 0;
                    display: flex;
                    justify-content: center; /* Center horizontally */
                    align-items: center;     /* Center vertically */
                    min-height: 100vh;       /* Take full viewport height */
                    background-color: #f4f4f4; /* Light background for the page */
                    color:rgb(63, 58, 58);
                }
                #app {
                    width: 100%;
                    display: flex;
                    flex-direction: column; /* Stack children vertically */
                    align-items: center;    /* Center children horizontally */
                }
                .form-container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px; /* Limit width for popup effect */
                    text-align: center; /* Center content within the container */
                }
                .welcome-container { /* Style for the welcome message area */
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;

                }
                .welcome-container button {
                    margin-top: 10px;
                    margin-bottom: 10px;
                }

                #logout-button {
                    background-color: #e74c3c; /* red */
                }
                #logout-button:hover {
                    background-color: #c0392b; /* darker red */
                }

                h1 {
                    color: #333;
                    margin-bottom: 20px;
                }
                form {
                    margin-top: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    text-align: left; /* Align labels to the left */
                    color: #555;
                    font-weight: bold;
                }
                input[type="text"], input[type="password"] {
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    width: calc(100% - 22px); /* Full width minus padding/border */
                    box-sizing: border-box; /* Include padding/border in width */
                    font-size: 1em;
                }
                .dob-group {
                    display: flex; /* Use flexbox for DOB inputs */
                    justify-content: space-between; /* Distribute space between inputs */
                    margin-bottom: 15px;
                }
                .dob-group input {
                    width: calc(33% - 10px); /* Roughly 1/3rd width minus some margin */
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                    text-align: center; /* Center text in DOB inputs */
                    font-size: 1em;
                }
                .dob-group input:not(:last-child) {
                    margin-right: 10px; /* Space between inputs */
                }
                button {
                    padding: 12px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.1em;
                    width: 100%; /* Make button full width */
                    box-sizing: border-box;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #0056b3;
                }
                #message {
                    margin-top: 20px;
                    padding: 12px;
                    border-radius: 5px;
                    /*display: none;  Hidden by default */
                    font-weight: bold;
                    xtext-align: left; /* Align messages to the left */
                }
                #message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                #message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                /* . means class, # means ID
                   .class1.class2 means class1 AND class2
                   class1 <space> class2 means class2 is a decendant of a node with class 1
                 */
                .body.logged-in .hide-if-logged-in {
                    display: none;
                }
                .body:not(.logged-in) .hide-if-not-logged-in {
                    display: none;
                }

                </style>

                <div class="body">
                    <div id="app">
                        <div class="form-container hide-if-logged-in">
                            <h1>Login</h1>
                            <form class="login-form">
                                <div id="login-message" class="message"></div> <!-- Added for error/success messages -->
                                <label for="loginLastName">Last Name:</label>
                                <input type="text" id="loginLastName" name="lastName" required><br>
                                <label for="loginFirstName">First Name:</label>
                                <input type="text" id="loginFirstName" name="firstName" required><br>
                                <label>Date of Birth:</label>
                                <div class="dob-group">
                                    <input type="text" id="loginDobMonth" name="dobMonth" placeholder="MM" maxlength="2" required ref="dobMonthInput">
                                    <input type="text" id="loginDobDay" name="dobDay" placeholder="DD" maxlength="2" required ref="dobDayInput">
                                    <input type="text" id="loginDobYear" name="dobYear" placeholder="YYYY" maxlength="4" required>
                                </div><br>
                                <button class="login-button" type="submit">Login</button>
                            </form>
                        </div>

                       <div class="welcome-container hide-if-not-logged-in">
                            <div id="message">
                            <h1>Welcome, <span class="welcome-name"></span>!</h1>
                            <p>You have successfully logged in.</p>
                            <button id="continue-button">Continue</button>
                            <button id="logout-button">Logout</button>
                        </div>

                    </div>
                </div>
            `; //<-- note end backtick
            this.setHTMLEl(tempInnerHTML);
            const debug = true;
            if (debug == true) {
                const map = { "loginDobMonth": "06", "loginDobDay": "23", "loginDobYear": "1947", "loginFirstName": "Judith" };
                for (const [key, value] of Object.entries(map)) {
                    let input = this.htmlEl.dom.getElementById(key);
                    if (input) {
                        input.value = value; // Set the value of the input field
                    }
                }
            }
        }
        this.htmlEl = this.htmlEl; // typecast as relevent for this object.
        if (opts) {
            //process opts -- if any added later
        }
        // Attach event listeners in the constructor or a dedicated setup method
        this.setupEventListeners();
    } //constructor
    async doLogin() {
        if (!this.htmlEl.$loginform) {
            console.error("Login form not found");
            return;
        }
        function capitalizeFirstLetter(val) {
            let result = val.trim().toLowerCase();
            result = result.charAt(0).toUpperCase() + String(result).slice(1);
            return result;
        }
        const formData = new FormData(this.htmlEl.$loginform); //FormData is a built-in DOM function to get data from forms.
        // Use formData.get() to be more explicit and avoid issues with editor tooling.
        let aLastName = capitalizeFirstLetter(formData.get('lastName') || ''); // Ensure lastName is trimmed and capitalized
        let aFirstName = capitalizeFirstLetter(formData.get('firstName') || ''); // Ensure firstName is trimmed and capitalized
        let aFullName = `${aFirstName} ${aLastName}`;
        let aDOBMonth = formData.get('dobMonth') || '';
        let aDOBDay = formData.get('dobDay') || '';
        let aDOBYear = formData.get('dobYear') || '';
        let aDOB = `${padZero(aDOBMonth)}-${padZero(aDOBDay)}-${aDOBYear}`;
        const reqData = {
            lastName: aLastName,
            firstName: aFirstName,
            dob: aDOB,
            fullName: aFullName
        };
        console.log(reqData);
        try {
            const response = await fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqData)
            });
            const data = await response.json();
            console.log("Login API Response:", data);
            if (response.ok && data.success) {
                if (this.htmlEl.$welcomename)
                    this.htmlEl.$welcomename.textContent = reqData.fullName;
                if (this.htmlEl.$body)
                    this.htmlEl.$body.classList.add('logged-in');
                this.loginData = data; // Store login data on the component instance
                this.ctrl.loginData = data;
                this.ctrl.patientFullName = aFullName;
                this.ctrl.patientDOB = aDOB;
            }
            else {
                // Handle failed login from server (e.g., bad credentials)
                const errorMessage = data.message || 'Invalid credentials. Please try again.'; // Corrected typo: 'message'
                const messageEl = this.htmlEl.dom.getElementById('login-message');
                if (messageEl) {
                    messageEl.textContent = errorMessage;
                    messageEl.className = 'message error'; // Apply error styling
                }
            }
        }
        catch (error) {
            console.error('Error during login fetch:', error);
            const messageEl = this.htmlEl.dom.getElementById('login-message');
            if (messageEl) {
                messageEl.textContent = 'A network error occurred. Please try again.';
                messageEl.className = 'message error'; // Apply error styling
            }
        }
    } //doLogin
    setupEventListeners() {
        const logoutButton = this.htmlEl.dom.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.onclick = (event) => {
                event.preventDefault();
                if (this.htmlEl.$body)
                    this.htmlEl.$body.classList.remove('logged-in');
            };
        }
        const continueButton = this.htmlEl.dom.getElementById("continue-button");
        if (continueButton) {
            continueButton.onclick = (event) => {
                event.preventDefault();
                console.log('continue button clicked');
                this.triggerChangeView("dashboard");
            };
        }
        if (this.htmlEl.$loginbutton) {
            this.htmlEl.$loginbutton.onclick = (event) => {
                event.preventDefault();
                console.log('Login button clicked');
                this.doLogin();
            };
        }
    } //setupEventListeners
    async refresh() {
        //put any code needed to be executed prior to this class being displayed to user.
    }
}
//# sourceMappingURL=login.js.map