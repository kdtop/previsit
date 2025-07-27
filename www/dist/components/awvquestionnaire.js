// /opt/worldvista/EHR/web/previsit/www/components/awvquestionnaire.ts
import TQuestionnaireAppView from './questionnaire.js';
/**
 * Represents the AwvUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class TAwvQuestionnaireAppView extends TQuestionnaireAppView {
    constructor(aCtrl, opts) {
        super('awvQuest', '/api/awvQuest', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getQuestionnaireData() {
        const commonAnswers = ['Several days', 'More than half the days', 'Nearly every day'];
        let num1QuestGroup = {
            groupHeadingText: 'Physical Activity',
            questionDefinition: [
                {
                    dataNamespace: 'pa1',
                    questionText: 'Do you exercise regularly?',
                    replyType: 'radioButtons',
                    replies: ['Yes', 'No, but I am active', 'No, due to physical limitations', 'No'],
                    hasDetailsArea: true,
                },
            ]
        };
        let num2QuestGroup = {
            groupHeadingText: 'Tobacco Use',
            questionDefinition: [
                {
                    dataNamespace: 'tobac1',
                    questionText: 'In the last 30 days, have you used tobacco (Smoked)?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'tobac2',
                    questionText: 'In the last 30 days, have you vaped or used an e-cigarette?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'tobac3',
                    questionText: 'In the last 30 days, have you used tobacco (Smokeless)',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'tobac4',
                    questionText: 'If Yes to any of the above 3 questions, Would you be interested in quitting tobacco use within the next month?',
                    replyType: 'radioButtons',
                    replies: ['Yes', 'No', 'N/A'],
                    hasDetailsArea: true,
                }
            ]
        };
        let num3QuestGroup = {
            groupHeadingText: 'Alcohol Use',
            questionDefinition: [
                {
                    dataNamespace: 'alcohol1',
                    questionText: 'In the past 7 days, on how many days did you drink alcohol?',
                    replyType: 'numeric',
                    minValue: 0,
                    maxValue: 7,
                    // placeholder  : '0',
                },
                {
                    dataNamespace: 'alcohol2',
                    questionText: 'On days when you drank alcohol, how often did you have (5 or more for men, 4 or more for women and those men and women 65 years old or over) alcoholic drinks on one occasion?',
                    replyType: 'noneOrRadioButtons',
                    replies: ['Never', 'Once during the week', '2-3 times during the week', 'More than 3 times during the week'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'N/A',
                },
                {
                    dataNamespace: 'alcohol3',
                    questionText: 'Do you ever drive after drinking, or ride with a driver who has been drinking?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
            ]
        };
        let num4QuestGroup = {
            groupHeadingText: 'Seat Belt Use',
            questionDefinition: [
                {
                    dataNamespace: 'seatBelt1',
                    questionText: 'Do you always fasten your seat belt when you are in a car?',
                    replyType: 'radioButtons',
                    replies: ['Yes', 'No']
                },
            ]
        };
        let num5QuestGroup = {
            groupHeadingText: 'Activities of Daily Living',
            questionDefinition: [
                {
                    dataNamespace: 'adl1',
                    questionText: 'In the past 7 days, did you need help from others to perform everyday activities such as eating, getting dressed, grooming, bathing, walking, or using the toilet?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
            ]
        };
        let num6QuestGroup = {
            groupHeadingText: 'Instrumental Activities of Daily Living',
            questionDefinition: [
                {
                    dataNamespace: 'iadl1',
                    questionText: 'In the past 7 days, did you need help from others to take care of things such as laundry and housekeeping, banking, shopping, using the telephone, food preparation, transportation, or taking your own medications?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
            ]
        };
        let num7QuestGroup = {
            groupHeadingText: 'Sleep',
            questionDefinition: [
                {
                    dataNamespace: 'sleep1',
                    questionText: 'Each night, how many hours of sleep do you usually get?',
                    replyType: 'numeric',
                    minValue: 0,
                    maxValue: 24,
                },
                {
                    dataNamespace: 'sleep2',
                    questionText: 'Do you snore or has anyone told you that you snore?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'sleep3',
                    questionText: 'In the past 7 days, how often have you felt sleepy during the daytime?',
                    replyType: 'noneOrRadioButtons',
                    replies: ['Rarely', 'Sometimes', 'Usually', 'Always', 'Yes, but benefiting from CPAP'],
                    noneButtonLabel: 'Never',
                    hasDetailsArea: true,
                },
            ],
        };
        let num8QuestGroup = {
            groupHeadingText: 'Fall Risk',
            questionDefinition: [
                {
                    dataNamespace: 'fallRisk1',
                    questionText: 'Have you had any falls in the past year?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'fallRisk2',
                    questionText: 'Do you have any worries about falling or feel unsteady when standing or walking?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'fallRisk3',
                    questionText: 'Do you have problems with your vision that affect your ability to safely walk?',
                    replyType: 'noneOrButtons',
                    replies: ['Yes'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'No',
                },
                {
                    dataNamespace: 'fallRisk4',
                    questionText: 'How would your friends or family honestly describe your walking',
                    replyType: 'noneOrRadioButtons',
                    replies: ['Mildly impaired', 'Moderately impaired', 'Non-ambulatory (Can\'t walk)'],
                    hasDetailsArea: true,
                    noneButtonLabel: 'Normal',
                },
                {
                    dataNamespace: 'fallRisk5',
                    questionText: 'Do you use any assistance devices? (Check all that apply)',
                    replyType: 'noneOrButtons',
                    replies: ['Cane', 'Walker', 'Rollator', 'Wheel Chair', 'Standby assist', 'Grab bar (bathroom)'],
                    hasDetailsArea: true,
                },
                {
                    dataNamespace: 'fallRisk6',
                    questionText: 'Have you reviewed your home for safety hazards (adequate lighting, loose rugs)?',
                    replyType: 'radioButtons',
                    replies: ['Yes', 'No']
                },
            ]
        };
        let num9QuestGroup = {
            groupHeadingText: 'Hearing',
            questionDefinition: [
                {
                    dataNamespace: 'hearing1',
                    questionText: 'Have you noticed any hearing difficulties?',
                    replyType: 'noneOrRadioButtons',
                    replies: ['Yes', 'Yes, but corrected with hearing aids.'],
                    noneButtonLabel: 'No',
                    hasDetailsArea: true,
                },
            ]
        };
        let num10QuestGroup = {
            groupHeadingText: 'Pain',
            questionDefinition: [
                {
                    dataNamespace: 'pain1',
                    questionText: ' Have you had significant pain in the last week?',
                    replyType: 'noneOrRadioButtons',
                    replies: ['Mild', 'Moderate', 'Severe'],
                    hasDetailsArea: true,
                },
            ]
        };
        let formData = {
            instructionsText: 'Please answer the following questions. This will help us prepare for your visit.',
            questGroups: [num1QuestGroup, num2QuestGroup, num3QuestGroup, num4QuestGroup, num5QuestGroup,
                num6QuestGroup, num7QuestGroup, num8QuestGroup, num9QuestGroup, num10QuestGroup]
        };
        return formData;
    }
}
//# sourceMappingURL=awvquestionnaire.js.map