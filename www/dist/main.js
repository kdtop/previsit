// /opt/worldvista/EHR/web/previsit/www/main.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/main.js
//
// main.ts
//
// Every visual element will have separate import element
import TDashboardAppView from './components/dashboard.js';
import TLoginAppView from './components/login.js';
import THxUpdateAppView from './components/hxupdate.js';
import TRosUpdateAppView from './components/rosupdate.js';
import TMedReviewAppView from './components/medication_review.js';
import TSigFormAppView from './components/sig_form.js';
import { TCtrl } from './utility/controller.js';
// ================================================================
//
// main  .. high level program process and user interface
//
//
//Master controller of program.  It coordinates visuals, and interacting with browser
//
// Define module-scoped variables that need to be accessible across functions
let dB; // document.body
let ctrl;
let dashboardAppView;
let loginAppView;
let hxUpdateAppView;
let rosUpdateAppView;
let medReviewAppView;
let sigformAppView;
// --------------------------
// Named functions for core application logic
// --------------------------
// Handler for the 'change_view' event when emitted by AppView objects.
function handleSwitchingEvent(e) {
    const customEvent = e;
    const { detail: info } = customEvent;
    console.log(info);
    let aView = ctrl.getNamedItem(info.requestedView);
    if (aView) {
        switchTo(aView);
    }
}
// Function to switch between visual elements in the app.
async function switchTo(anAppView) {
    await anAppView.refresh();
    dB.innerHTML = '';
    if (anAppView.htmlEl) {
        dB.appendChild(anAppView.htmlEl);
    }
}
// Main application initialization logic
async function initializeApp() {
    // The type assertion `as HTMLBodyElement` is used here to resolve a potential
    // conflict in the project's type definitions. In some environments, TypeScript
    // may incorrectly infer `document.body` as a generic `HTMLElement`.
    // This assertion correctly enforces the more specific `HTMLBodyElement` type.
    dB = document.body; // This will be the 'main' variable
    ctrl = new TCtrl();
    ctrl.addEventListener("change_view", handleSwitchingEvent); // The main app listens on the controller
    loginAppView = new TLoginAppView(ctrl);
    dashboardAppView = new TDashboardAppView(ctrl);
    hxUpdateAppView = new THxUpdateAppView(ctrl);
    rosUpdateAppView = new TRosUpdateAppView(ctrl);
    medReviewAppView = new TMedReviewAppView(ctrl);
    sigformAppView = new TSigFormAppView(ctrl);
    //await switchTo(rosUpdateAppView); // Pass the HTML element to switchTo
    await switchTo(loginAppView); // Pass the HTML element to switchTo
    // NOTE: when loginComp is done, it will dispatch a 'continue' event, handled above
}
// Function for running tests or post-initialization logic
async function runTests() {
    console.log("Tests (if any) are running.");
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
await initializeApp();
await runTests();
// At this point, execution should return to the main message loop of the browser.
//# sourceMappingURL=main.js.map