// /opt/worldvista/EHR/web/previsit/www/controller.ts

import { LoginApiResponse } from './types.js';

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

	constructor(opts?: any){ // Keep opts for future use
		super();
	} // constructor
} // class