// /opt/worldvista/EHR/web/previsit/www/components/medciation_otc_review.ts
import TCommonMedReviewAppView from './medication_common_review.js';
/**
 * Represents the otc_medication_review component as a class, responsible for building and managing the update form.
 */
export default class TOTCMedReviewAppView extends TCommonMedReviewAppView {
    constructor(aCtrl, opts) {
        super('otc_medication_review', '/api/otc_medication_review', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getTitleText() {
        return "Review Your Over-The-Counter (OTC) Meds, Herbal Supplements, Vitamins, etc.";
    }
    getAddItemText() {
        return "Add NEW OTC Medication (not prescription)";
    }
}
//# sourceMappingURL=medication_otc_review.js.map