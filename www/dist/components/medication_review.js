// /opt/worldvista/EHR/web/previsit/www/components/medciation_review.ts
import TCommonMedReviewAppView from './medication_common_review.js';
/**
 * Represents the medication_review component as a class, responsible for building and managing the update form.
 */
export default class TMedReviewAppView extends TCommonMedReviewAppView {
    constructor(aCtrl, opts) {
        super('medication_review', '/api/medication_review', aCtrl);
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    getTitleText() {
        return "Review Your Medication List";
    }
}
//# sourceMappingURL=medication_review.js.map