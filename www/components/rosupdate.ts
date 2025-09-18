// /opt/worldvista/EHR/web/previsit/www/components/rosupdate.ts

import { TCtrl } from '../utility/controller.js';
import { TQuestionSchema, TQuestionGroupSchema, TQuestionnaireSchema, TReplyType } from '../utility/types.js';
import TQuestionnaireAppView from './questionnaire.js';


interface RosUpdateOptions {
    someOption : any;
}


/**
 * Represents the RosUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class TRosUpdateAppView extends TQuestionnaireAppView {

    constructor(aCtrl:  TCtrl,  opts?: RosUpdateOptions) {
        super('rosupdate', '/api/rosupdate', aCtrl, opts);
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    public getQuestionnaireSchema() : TQuestionnaireSchema {

        let testQuestGroup : TQuestionGroupSchema = {
            groupHeadingText : 'Review of Systems',
            questionDefinition : [
                {
                    dataNamespace    : 'constitutional',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Fever', 'Chills', 'Unusual weight gain', 'Unusual weight loss']
                },
                {
                    dataNamespace    : 'eye',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Blindness', 'Blurred vision', 'Double vision', 'Any eye problems']
                },
                {
                    dataNamespace    : 'entm',
                    questionText : 'Ear, Nose, Throat, Mouth',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Difficulty hearing', 'Ear problems', 'Nose problems', 'Throat problems', 'Mouth problems']
                },
                {
                    dataNamespace    : 'cardiovascular',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Chest pain', 'Ankle swelling', 'Strokes', 'Leg cramps']
                },
                {
                    dataNamespace    : 'respiratory',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Shortness of breath', 'Wheezing', 'Inability to lay flat']
                },
                {
                    dataNamespace    : 'gastrointestinal',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Blood from bowels', 'Bad indigestion', 'Abdominal Pain']
                },
                {
                    dataNamespace    : 'genitourinary',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Urine Pain', 'Urine leakage', 'Female problems', 'Sexual problems']
                },
                {
                    dataNamespace    : 'musculoskeletal',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Joint or muscle pain', 'Arthritis', 'Sprains', 'Ligament injury']
                  },
                  {
                    dataNamespace    : 'skin',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Worrisome skin lesions', 'Lumps in breast', 'Skin problems']
                },
                {
                    dataNamespace    : 'neurologic',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Numbness', 'Tingling', 'Confusion', 'Seizures', 'Chronic pain']
                },
                {
                    dataNamespace    : 'psychiatric',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Anxiety', 'Depression', 'Obsessions']
                },
                {
                    dataNamespace    : 'endocrine',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Problems with thyroid','Diabetes']
                },
                {
                    dataNamespace    : 'hematologic',
                    questionText : 'Hematologic/Lymphatic',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Bleeding','Blood problems','Worrisome lymph nodes']
                },
                {
                    dataNamespace    : 'immunologic',
                    questionText : 'Allergic/Immunologic',
                    replyType    : 'noneOrButtons',
                    hasDetailsArea : true,
                    replies      : ['Allergies','Immunity problems','Medication reactions']
                },
                {
                    dataNamespace    : 'fall',
                    questionText : 'Fall Risk',
                    replyType    : 'noneOrRadioButtons',
                    hasDetailsArea : true,
                    replies      : ['2 or more falls in the past year','Any fall with injury in past year']
                },
            ],
        }
        let formData :  TQuestionnaireSchema = {
            instructionsText : 'Please answer the following questions. This will help us prepare for your visit.',
            questGroups : [testQuestGroup]
        };

        return formData;
    }


}