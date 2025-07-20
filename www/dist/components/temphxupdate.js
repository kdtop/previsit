// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts
import TQuestionnaireAppView from './questionnaire.js';
/**
 * Represents the HxUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class THxUpdateAppView extends TQuestionnaireAppView {
    // --- NEW: Properties for managing the dynamic "Done" button ---
    doneButton = null;
    constructor(aCtrl, opts) {
        super('hxupdate', '/api/hxupdate', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getCSSContent() {
        let result = super.getCSSContent() +
            `
        <style>
          .content-container {
            line-height: 1.6;
            padding: 0 100px;
            background-color: #ffffff;
            color:rgb(43, 42, 42);
          }

          h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
          }

          h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
            margin-top: 30px;
            margin-bottom: 15px;
          }
                  ul {
            list-style: none;
            padding: 0;
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }

          li {
            margin-bottom: 0;
          }

          /* --- Custom Checkbox Styling --- */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }

          .custom-checkbox-text {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 12px;
            background-color: #f0f0f0;
            color: #555;
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
            cursor: pointer;
            user-select: none;
          }

          label:hover .custom-checkbox-text {
            background-color: #e2e2e2;
          }

          input[type='checkbox']:checked + .custom-checkbox-text {
            background-color: #3498db; /* Default checked color (blue) */
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }

          /* Specific style for 'NONE' checkbox when checked */
          input.none-toggle-checkbox:checked + .none-checkbox-text {
            background-color: #e74c3c; /* Reddish color for NONE when checked */
            color: white;
          }

          /* Styles for general labels (like for custom checkboxes) */
          label {
            display: flex;
            align-items: center;
            width: fit-content;
          }

          /* --- Details Textarea Styling (General) --- */
          .details-input-group {
            /* This general style applies to sections where NONE is not used this way */
            margin-top: 15px;
            margin-bottom: 25px;
          }

          .details-input-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #444;
          }

          .details-input-group textarea {
            width: 100%;
            min-height: 50px;
            padding: 8px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1em;
            box-sizing: border-box;
            resize: none;
          }

          /* --- NEW: Specific Styling for 'Since your last visit' section --- */
          .question-group {
            margin-bottom: 25px; /* Space between each question group */
            padding-bottom: 25px;
            border-bottom: solid 2px #ececec;
          }

          .main-question-label { /* Style for the main question label */
            display: block; /* Ensures it's on its own line */
            margin-bottom: 10px; /* Space below the main question */
            font-weight: bold; /* Make the main question prominent */
            font-size: large;
            color: #333;
          }

          .details-options-row {
            display: flex; /* Use flexbox to align 'NONE' and 'Details:' side-by-side */
            align-items: center; /* Vertically align items */
            gap: 15px; /* Space between 'NONE' and 'Details:' */
            margin-bottom: 10px; /* Space above textarea */
          }

          .details-label { /* Style for the 'Details:' label in this specific context */
            font-weight: bold;
            color: #444;
            white-space: nowrap; /* Prevent 'Details:' from wrapping */
          }

          .details-textarea-container {
            margin-top: 5px; /* Space below the details/none row */
          }

          .details-textarea-container textarea {
            width: 100%;
            min-height: 30px;
            padding: 8px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1em;
            box-sizing: border-box;
            resize: none;
          }

          /* --- MODIFIED: Done Button and Submission Area --- */
          .submission-controls {
              text-align: center;
              margin-top: 30px;
              /* NEW: Add significant padding to the bottom to create scrollable whitespace */
              padding-bottom: 50vh;
          }

          .done-button {
              /* NEW: Make button full width */
              width: 100%;
              padding: 12px 25px;
              font-size: 1.1em;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s ease;
              /* NEW: Use flexbox to manage internal text lines */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              line-height: 1.4;
          }

          /* NEW: Class for the incomplete state (red) */
          .done-button-incomplete {
              background-color: #e74c3c;
          }

          /* NEW: Class for the complete state (green) */
          .done-button-complete {
              background-color: #28a745;
          }

          /* Class to hide elements with JavaScript */
          .hidden {
            display: none !important; /* Use !important to ensure it overrides other display properties */
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            body {
              margin: 15px;
            }
            ul {
              gap: 8px;
            }
            .custom-checkbox-text {
              padding: 6px 10px;
              font-size: 0.95em;
            }
            .details-options-row {
              flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
              align-items: flex-start;
              gap: 5px;
            }
          }
        </style>
      `;
        return result;
    }
    getHTMLTagContent() {
        let result = `
          <form class='container content-container'>
              <h1>Update Your Medical History</h1>
              <p><b>Patient:</b> <span class="patient-name"></span></p>
              <div class="instructions">
                  <p>Please review and answer the questions below. This will help us prepare for your visit.</p>
              </div>
              <div class="forms-container"></div>
              <div class="submission-controls">
                  <button type="button" class="done-button">
                      <span class="done-button-main-text"></span>
                      <span class="done-button-sub-text" style="font-size: 0.8em; opacity: 0.9;"></span>
                  </button>
              </div>
          </form>
      `;
        return result;
    }
    getQuestionnaireData() {
        let mainQuestGroup = {
            groupHeadingText: 'Welcome!',
            question: [
                {
                    namespace: 'hx_why_see',
                    questionText: 'Why are you seeing the doctor today?',
                    replyType: 'buttons',
                    replies: ['Physical', 'Recheck', 'Sick', 'New Problem'],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details/Other:',
                },
            ]
        };
        let hxUpdateGroup = {
            groupHeadingText: 'Since your last visit, have you had any of the following?',
            question: [
                {
                    namespace: 'hx_new_prob',
                    questionText: 'New medical problems?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    namespace: 'hx_new_tests',
                    questionText: 'New medical tests?',
                    replyType: 'noneOrButtons',
                    replies: ['blood work', 'mammogram', 'xrays', 'MRI', 'CT scan', 'colon or stomach scope', 'ultrasound', 'echocardiogram', 'cardiac stress test', 'Holter monitor', 'ECG', 'bone density'],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    namespace: 'hx_change_other_provider',
                    questionText: 'Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    namespace: 'hx_change_surgery',
                    questionText: 'Had any new surgeries?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    namespace: 'hx_change_social',
                    questionText: 'Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    namespace: 'hx_change_family',
                    questionText: 'Any family members with new diseases (e.g. heart attack, diabetes, cancer etc)?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
            ]
        };
        let formData = {
            instructionsText: 'Please answer the following questions. This will help us prepare for your visit.',
            questGroups: [mainQuestGroup, hxUpdateGroup]
        };
        return formData;
    }
}
//# sourceMappingURL=temphxupdate.js.map