// /opt/worldvista/EHR/web/previsit/www/components/phq9.ts

import { TQuestionSchema, TQuestionGroupSchema, TQuestionnaireSchema, TReplyType } from '../utility/types.js';
import TQuestionnaireAppView from './questionnaire.js';
import { TCtrl } from '../utility/controller.js';


interface Phq9UpdateOptions {
    someOption : any;
}

/**
 * Represents the Phq9Update component as a class, responsible for building and managing the patient history update form.
 */
export default class TPhq9UpdateAppView extends TQuestionnaireAppView {

    constructor(aCtrl:  TCtrl,  opts?: Phq9UpdateOptions) {
        super('phq9Quest', '/api/phq9Quest', aCtrl);
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    public getQuestionnaireSchema() : TQuestionnaireSchema {
        const commonAnswers : string[] = ['Several days','More than half the days','Nearly every day'];

        let mainQuestGroup : TQuestionGroupSchema = {
            groupHeadingText : 'Questions',
            questionDefinition : [
                {
                    dataNamespace    : 'q1',
                    questionText : 'Little interest or pleasure in doing things',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q2',
                    questionText : 'Feeling down, depressed, or hopeless.',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q3',
                    questionText : 'Trouble falling or staying asleep, or sleeping too much',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q4',
                    questionText : 'Feeling tired or having little energy',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q5',
                    questionText : 'Poor appetite or overeating',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q6',
                    questionText : 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q7',
                    questionText : 'Trouble concentrating on things, such as reading the newspaper or watching television',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q8',
                    questionText : 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
                {
                    dataNamespace    : 'q9',
                    questionText : 'Thoughts that you would be better off dead, or of hurting yourself in some way',
                    replyType    : 'noneOrRadioButtons',
                    scoreMode    :  "1Indexed",
                    replies      : commonAnswers
                },
            ],
        }

        let impactQuestGroup : TQuestionGroupSchema = {
            groupHeadingText : 'Life Impact',
            questionDefinition : [
                {
                    dataNamespace    : 'q10',
                    questionText : 'If you checked any problems, how difficult have these problems made it for you to do your work, take care of things at home, or getting along with other people?',
                    replyType    : 'noneOrRadioButtons',
                    replies      : ['Somewhat difficult','Very difficult','Extremely difficult']
                },
            ]
        }

        let formData :  TQuestionnaireSchema = {
            instructionsText : 'Please answer the following questions. This will help us prepare for your visit.',
            questGroups : [mainQuestGroup, impactQuestGroup]
        };

        return formData;
    }

    public updateDoneButtonState(): void
    //overrides ancestor method
    {
        super.updateDoneButtonState();
        this.showPhq9Score();
    }

    private showPhq9Score(): void
    {
        console.log("Calculated PHQ-9 Score:", this.resultingTotalScore);
        let resultEl =  this.htmlEl.dom.querySelector<HTMLSpanElement>('.result-container');
        if (resultEl) {
            resultEl.textContent = 'Total score: ' + this.resultingTotalScore.toString();
        }
    }

}