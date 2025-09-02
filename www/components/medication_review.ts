// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts

import TCommonMedReviewAppView, { MedReviewOptions } from './medication_common_review.js'
import { TCtrl } from '../utility/controller.js';

/**
 * Represents the medication_review component as a class, responsible for building and managing the update form.
 */
export default class TMedReviewAppView extends TCommonMedReviewAppView {

    constructor(aCtrl: TCtrl, opts?: MedReviewOptions) {
        super('medication_review', '/api/medication_review', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor


    public getTitleText() : string
    //This will get included from getHTMLTagContent() in ancestor flass
    {
        return "Review Your Medication List";
    }

    public getAddItemText() : string
    {
        return "Add NEW Prescription Medication (not OTC)";
    }



}
