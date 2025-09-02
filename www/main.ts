// /opt/worldvista/EHR/web/previsit/www/main.ts
// Compiles to --> /opt/worldvista/EHR/web/previsit/www/dist/main.js
//
// main.ts
//

// Every visual element will have separate import element
import TAppView, {  }
    from './components/appview.js';
import TDashboardAppView
    from './components/dashboard.js';
import TLoginAppView
    from './components/login.js';
import THxUpdateAppView
    from './components/hxupdate.js';
import TRosUpdateAppView
    from './components/rosupdate.js';
import TPhq9UpdateAppView
    from './components/phq9.js';
import TAwvQuestionnaireAppView
    from './components/awvquestionnaire.js';
import TMedReviewAppView
    from './components/medication_review.js';
import TOTCMedReviewAppView
    from './components/medication_otc_review.js';
import TMedAllergiesReviewAppView
    from './components/medication_allergies_review.js';
import TSigFormAppView
    from './components/sig_form.js';
import TPatientConsentFormAppView
    from './components/consent_form.js';
import { TCtrl }
    from './utility/controller.js';
import { ChangeViewEventDetail, EnhancedHTMLDivElement }
    from './utility/types.js';
// ================================================================
//
// main  .. high level program process and user interface

// Define module-scoped variables that need to be accessible across functions
let dB: HTMLBodyElement; // document.body
let ctrl: TCtrl;

// Instantiate the various app views.
let dashboardAppView:          TDashboardAppView;
let loginAppView:              TLoginAppView;
let hxUpdateAppView:           THxUpdateAppView;
let rosUpdateAppView:          TRosUpdateAppView;
let medReviewAppView:          TMedReviewAppView;
let otcMedReviewAppView:       TOTCMedReviewAppView;
let medAllergiesReviewAppView: TMedAllergiesReviewAppView;
let sigformAppView:            TSigFormAppView;
let consentformAppView:        TPatientConsentFormAppView;
let phq9UpdateAppView:         TPhq9UpdateAppView;
let awvQuestAppView:           TAwvQuestionnaireAppView;

// --------------------------
// Named functions for core application logic
// --------------------------

// Handler for the 'change_view' event when emitted by AppView objects.
function handleSwitchingEvent(e: Event): void {
    const customEvent = e as CustomEvent<ChangeViewEventDetail>;
    const { detail: info } = customEvent;
    console.log(info);
    let aView = ctrl.getNamedItem(info.requestedView);
    if (aView) {
      switchTo(aView);
    }
}

// Function to switch between visual elements in the app.
async function switchTo(anAppView : TAppView): Promise<void>
{
    await anAppView.refresh();
    dB.innerHTML = '';
    if (anAppView.htmlEl) {
        dB.appendChild(anAppView.htmlEl);
        window.scrollTo(0, 0);
        setTimeout(async () => {
            await anAppView.refresh();  //<--- should be a loadData function that doesn't recreate .htmlEl
        }, 1000);
    }
}

// Main application initialization logic
async function initializeApp()
{
    dB = document.body as HTMLBodyElement; // This will be the 'main' variable
    ctrl = new TCtrl();
    ctrl.addEventListener("change_view", handleSwitchingEvent); // The main app listens on the controller

    loginAppView              = new TLoginAppView(ctrl);
    dashboardAppView          = new TDashboardAppView(ctrl);
    hxUpdateAppView           = new THxUpdateAppView(ctrl);
    rosUpdateAppView          = new TRosUpdateAppView(ctrl);
    medReviewAppView          = new TMedReviewAppView(ctrl);
    otcMedReviewAppView       = new TOTCMedReviewAppView(ctrl);
    medAllergiesReviewAppView = new TMedAllergiesReviewAppView(ctrl);
    sigformAppView            = new TSigFormAppView(ctrl);
    consentformAppView        = new TPatientConsentFormAppView(ctrl);
    phq9UpdateAppView         = new TPhq9UpdateAppView(ctrl);
    awvQuestAppView           = new TAwvQuestionnaireAppView(ctrl);

    await switchTo(loginAppView); // Pass the HTML element to switchTo
    // NOTE: when loginComp is done, it will dispatch a 'continue' event, handled above

}

// Function for running tests or post-initialization logic
async function runTests(): Promise<void> {
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