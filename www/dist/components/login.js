// /opt/worldvista/EHR/web/previsit/www/components/login.ts
//
// LoginComp
//     > has space for expand.. to scroll (for addresseses)
//     > but can have independantly scrolling windows
//     	(if display size big enough)
//
import EL from '../utility/el.js';
import { padZero } from '../utility/client_utils.js';
// ---------------------------------------------------
//Purpose return a visualization element.
export default function LoginComp(opts) {
    const { ctrl } = opts; //type TCtrl
    //note: ` is a quote that allows ${<evaluate js code>} syntax  And it allows newlines (continue string on subsequent line)
    let innerHTML = `
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

            /* this will get all tags 'button' that are desecendants of welcom-container  */
            & button{
                margin-top: 10px;
                margin-bottom: 10px;
            }

            & #logout-button {
            background-color:rgb(255, 8, 0);
            }
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
    // ----------------------------
    let self = new EL({ innerHTML }); //create new dom element, passing in html+css code
    self.className = 'login-comp';
    // --------------------------
    async function doLogin() {
        if (!self.$loginform) {
            console.error("Login form not found");
            return;
        }
        const formData = new FormData(self.$loginform); //FormData is a built-in DOM function to get data from forms.
        // Use formData.get() to be more explicit and avoid issues with editor tooling.
        let aLastName = formData.get('lastName') || '';
        let aFirstName = formData.get('firstName') || '';
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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqData)
            });
            const data = await response.json();
            console.log(data);
            if (response.ok && data.success) {
                if (self.$welcomename)
                    self.$welcomename.textContent = reqData.fullName;
                if (self.$body)
                    self.$body.classList.add('logged-in');
                ctrl.loginData = data; //pass login data back out via controller.
                ctrl.patientFullName = aFullName;
                ctrl.patientDOB = aDOB;
            }
            else {
                // Handle failed login from server (e.g., bad credentials)
                const errorMessage = data.message || 'Invalid credentials. Please try again.';
                const messageEl = self.dom.getElementById('login-message');
                if (messageEl) {
                    messageEl.textContent = errorMessage;
                    messageEl.className = 'message error'; // Apply error styling
                }
            }
        }
        catch (error) {
            console.error('Error during login fetch:', error);
            const messageEl = self.dom.getElementById('login-message');
            if (messageEl) {
                messageEl.textContent = 'A network error occurred. Please try again.';
                messageEl.className = 'message error'; // Apply error styling
            }
        }
    }
    const logoutButton = self.dom.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.onclick = function (event) {
            event.preventDefault(); // Prevent default form submission
            if (self.$body)
                self.$body.classList.remove('logged-in');
        };
    }
    const continueButton = self.dom.getElementById("continue-button");
    if (continueButton) {
        continueButton.onclick = function (event) {
            event.preventDefault();
            console.log('continue button clicked');
            const e = new CustomEvent('continue', {
                detail: { loginData: self.loginData,
                    message: "OK"
                }
            });
            self.dispatchEvent(e); //this will pass message back to main.js
        };
    }
    if (self.$loginbutton) {
        self.$loginbutton.onclick = function (event) {
            event.preventDefault();
            console.log('Login button clicked');
            doLogin();
        };
    }
    // --------------------------
    self.about = function () {
        //example of giving the dom element various methods if wanted.
    };
    return self;
}
//# sourceMappingURL=login.js.map