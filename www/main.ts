// /opt/worldvista/EHR/web/previsit/www/main.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/main.js
//
// main.ts
//

// Every visual element will have separate import element
import DashboardComp, { DashboardELInstance } from './components/dashboard.js';
import LoginComp, { LoginELInstance } from './components/login.js';
import { TCtrl } from './controller.js';
import { LoginApiResponse } from './types.js';


// ================================================================
//
// main  .. high level program process and user interface
//
//
//Master controller of program.  It coordinates visuals, and interacting with browser
//

// Define module-scoped variables that need to be accessible across functions
let dB: HTMLBodyElement; // document.body
let appEventTarget: EventTarget; // Renamed from 'result' for clarity
let ctrl: TCtrl;
let dashboardComp: DashboardELInstance;
let loginComp: LoginELInstance;

// Define a more specific type for the event detail
interface ContinueEventDetail {
    loginData?: LoginApiResponse;
    message: string;
}

// --------------------------
// Named functions for core application logic
// --------------------------

// Handler for the 'continue' event, currently emitted by login.js
function handleCompContinue(e: Event): void {
    const customEvent = e as CustomEvent<ContinueEventDetail>;
    const { detail: info } = customEvent;
    console.log(info);
    // Create anew each time, so that it is up to date.
    dashboardComp = DashboardComp({ ctrl });
    switchTo(dashboardComp);
}

// Function to switch between visual elements in the app.
function switchTo(n: HTMLElement): void {
    dB.innerHTML = '';
    dB.appendChild(n);
}

// Main application initialization logic
async function initializeApp(): Promise<EventTarget> {
    // The type assertion `as HTMLBodyElement` is used here to resolve a potential
    // conflict in the project's type definitions. In some environments, TypeScript
    // may incorrectly infer `document.body` as a generic `HTMLElement`.
    // This assertion correctly enforces the more specific `HTMLBodyElement` type.
    dB = document.body as HTMLBodyElement;
    appEventTarget = new EventTarget(); // This will be the 'main' variable
    ctrl = new TCtrl();

    loginComp = LoginComp({ ctrl });
    loginComp.addEventListener("continue", handleCompContinue);

    switchTo(loginComp); // Execute the change to the specified view
    // NOTE: when loginComp is done, it will dispatch a 'continue' event, handled above

    return appEventTarget; // Will be stored in 'main' in global scope.
}

// Function for running tests or post-initialization logic
async function runTests(): Promise<void> {
    console.log("Tests are running.");
    // This is run as soon as main.js is run. Could use for debugging.
    // Because initializeApp is an asynchronous function, that will finish before this function is called.
    // You can access appEventTarget or other module-scoped variables here if needed.
}

// ================================================================
//
// Top-level execution flow
//
// ================================================================

// Use top-level await to run the initialization and tests
// This is allowed in ES Modules (which main.js is likely compiled to)
let main = await initializeApp();
await runTests();

// At this point, execution should return to the main message loop of the browser.