// /opt/worldvista/EHR/web/previsit/www/controller.ts
// ================================================================
//
// TCtrl  .. common app data, events, and methods.
//
//
//This is somewhat like model-view-controller, and this part is the model (business logic of app)
//This will be passed to visual elements
export class TCtrl extends EventTarget {
    loginData;
    patientFullName;
    patientDOB;
    items = []; // Now strongly typed to TAppView
    constructor(opts) {
        super();
    } // constructor
    getNamedItem(aName) {
        return this.items.find(item => item.name === aName);
    }
    registerItem(item) {
        this.items.push(item);
    }
    unregisterItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
} // class
//# sourceMappingURL=controller.js.map