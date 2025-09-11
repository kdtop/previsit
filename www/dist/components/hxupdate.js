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
    getTitleText() {
        return "Update Your Medical History";
    }
    getHTMLMain() {
        let result = `
            <div class="instructions">
                <p>Please review and answer the questions below. This will help us prepare for your visit.</p>
            </div>
            <div class="forms-container"></div>
        `;
        return result;
    }
    getHTMLTagContent() {
        let result = this.getHTMLStructure();
        return result;
    }
    getQuestionnaireData() {
        let mainQuestGroup = {
            groupHeadingText: 'Welcome!',
            questionDefinition: [
                {
                    dataNamespace: 'hx_why_see',
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
            questionDefinition: [
                {
                    dataNamespace: 'hx_new_prob',
                    questionText: 'New medical problems?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    dataNamespace: 'hx_new_tests',
                    questionText: 'New medical tests?',
                    replyType: 'noneOrButtons',
                    replies: ['blood work', 'mammogram', 'xrays', 'MRI', 'CT scan', 'colon or stomach scope', 'ultrasound', 'echocardiogram', 'cardiac stress test', 'Holter monitor', 'ECG', 'bone density'],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    dataNamespace: 'hx_change_other_provider',
                    questionText: 'Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    dataNamespace: 'hx_change_surgery',
                    questionText: 'Had any new surgeries?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    dataNamespace: 'hx_change_social',
                    questionText: 'Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?',
                    replyType: 'noneOrButtons',
                    replies: [],
                    hasDetailsArea: true,
                    detailsAreaLabelText: 'Details:',
                },
                {
                    dataNamespace: 'hx_change_family',
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
//# sourceMappingURL=hxupdate.js.map