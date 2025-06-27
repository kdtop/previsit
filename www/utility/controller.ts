// /opt/worldvista/EHR/web/previsit/www/controller.ts

import { LoginApiResponse } from './types.js';
import type TAppView from '../components/appview.js'; // Import TAppView as a type only

// ================================================================
//
// TCtrl  .. common app data, events, and methods.
//
//
//This is somewhat like model-view-controller, and this part is the model (business logic of app)
//This will be passed to visual elements

export class TCtrl extends EventTarget {
    public loginData?: LoginApiResponse;
    public patientFullName?: string;
    public patientDOB?: string;

    private items: TAppView[] = []; // Now strongly typed to TAppView

	constructor(opts?: any){ // Keep opts for future use
		super();
	} // constructor

    public getNamedItem(aName: string): TAppView | undefined {
        return this.items.find(item => item.name === aName);
    }

    public registerItem(item: TAppView): void { // Parameter is now TAppView
        this.items.push(item);
    }

    public unregisterItem(item: TAppView): void { // Parameter is now TAppView
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }


} // class