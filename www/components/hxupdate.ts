// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts

import {  } from './appview.js';
import { TCtrl } from '../utility/controller.js';
import { TQuestion, TQuestionGroup, TQuestionnaireData,
         TReplyType, EnhancedHTMLDivElement
       } from '../utility/types.js';
import TQuestionnaireAppView from './questionnaire.js';

interface HxUpdateOptions {
    someOption : any;
}

export type HxUpdateHTMLElement = EnhancedHTMLDivElement & {
    // Extend the base EnhancedHTMLDivElement html property with specific DOM elements
    $patientname?: HTMLSpanElement;
    $formscontainer?: HTMLDivElement;
};

/**
 * Represents the HxUpdate component as a class, responsible for building and managing the patient history update form.
 */
export default class THxUpdateAppView extends TQuestionnaireAppView  {
    //NOTE: The generic type <KeyToStrBoolValueObj> is used to represent this view's data structure.
    //      In the ancestor class, it will be represented at TServerData
    //      This the type of data that will be sent to the server when the form is submitted.
    //      other AppViews will use different data types when sending data to the server.

    declare htmlEl: HxUpdateHTMLElement; // Use 'declare' to override the type of the inherited property

    // --- NEW: Properties for managing the dynamic "Done" button ---
    private doneButton: HTMLButtonElement | null = null;

    constructor(aCtrl:  TCtrl,  opts?: HxUpdateOptions) {
        super('hxupdate', '/api/hxupdate', aCtrl);
        if (opts) {
          //process opts -- if any added later
        }
    }  //constructor

    public getHTMLTagContent() : string
    {
      let result : string = `
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

    public getQuestionnaireData() : TQuestionnaireData {
        let mainQuestGroup : TQuestionGroup = {
            groupHeadingText : 'Welcome!',
            question : [
                {
                    dataNamespace    : 'hx_why_see',
                    questionText : 'Why are you seeing the doctor today?',
                    replyType    : 'buttons',
                    replies      :  ['Physical', 'Recheck', 'Sick', 'New Problem'],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details/Other:',
                },
            ]
        }

        let hxUpdateGroup : TQuestionGroup = {
            groupHeadingText : 'Since your last visit, have you had any of the following?',
            question : [
                {
                    dataNamespace    : 'hx_new_prob',
                    questionText : 'New medical problems?',
                    replyType    : 'noneOrButtons',
                    replies      :  [],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
                {
                    dataNamespace    : 'hx_new_tests',
                    questionText : 'New medical tests?',
                    replyType    : 'noneOrButtons',
                    replies      :  ['blood work', 'mammogram', 'xrays', 'MRI', 'CT scan', 'colon or stomach scope', 'ultrasound', 'echocardiogram', 'cardiac stress test', 'Holter monitor', 'ECG', 'bone density'],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
                {
                    dataNamespace    : 'hx_change_other_provider',
                    questionText : 'Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?',
                    replyType    : 'noneOrButtons',
                    replies      :  [],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
                {
                    dataNamespace    : 'hx_change_surgery',
                    questionText : 'Had any new surgeries?',
                    replyType    : 'noneOrButtons',
                    replies      :  [],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
                {
                    dataNamespace    : 'hx_change_social',
                    questionText : 'Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?',
                    replyType    : 'noneOrButtons',
                    replies      :  [],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
                {
                    dataNamespace    : 'hx_change_family',
                    questionText : 'Any family members with new diseases (e.g. heart attack, diabetes, cancer etc)?',
                    replyType    : 'noneOrButtons',
                    replies      :  [],
                    hasDetailsArea : true,
                    detailsAreaLabelText : 'Details:',
                },
            ]
        }
        let formData :  TQuestionnaireData = {
            instructionsText : 'Please answer the following questions. This will help us prepare for your visit.',
            questGroups : [mainQuestGroup, hxUpdateGroup]
        };

        return formData;
    }


}