// /opt/worldvista/EHR/web/previsit/www/components/medciation_otc_review.ts

import TCommonMedReviewAppView, { MedReviewOptions } from './medication_common_review.js'
import { TCtrl } from '../utility/controller.js';

/**
 * Represents the otc_medication_review component as a class, responsible for building and managing the update form.
 */
export default class TOTCMedReviewAppView extends TCommonMedReviewAppView {

    constructor(aCtrl: TCtrl, opts?: MedReviewOptions) {
        super('otc_medication_review', '/api/otc_medication_review', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor

    public getTitleText() : string
    //This will get included from getHTMLTagContent() in ancestor flass
    {
        return "Review Your Over-The-Counter (OTC) Meds, Herbal Supplements, Vitamins, etc.";
    }

    public getAddItemText() : string
    {
        return "Add NEW OTC Medication (not prescription)";
    }

}