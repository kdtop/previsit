// /opt/worldvista/EHR/web/previsit/www/types.ts

/** Shape of the data sent in the login API request. */
export interface LoginRequestData {
    lastName: string;
    firstName: string;
    dob: string;
    fullName: string;
}

/** Shape of the data received from the login API. */
export interface LoginApiResponse {
    success: boolean;
    message?: string;
    sessionID?: string;
}

/** Shape of the data received from the Get Patient Forms API. */
export interface GetPatientFormsApiResponse {
    text?: string; // The display name of the form
    viewName?: string; // The name of the view to switch to
    progress?: ProgressData
}

export type GetPatientFormsApiResponseArray = GetPatientFormsApiResponse[];

// Define a more specific type for the event detail
export interface ChangeViewEventDetail {
    loginData?: LoginApiResponse;
    requestedView : string;
    message: string;
}

export type AreTakingStatus = 'yes' | 'no' | 'sometimes' | 'unknown' | null;
export type YesNoStatus = 'yes' | 'no' | null;
export type RefillLocation = 'local' | 'mail' | null;

export interface UserMedicationAnswers {
    text: string | null; // The original medication name as entered by the user
    areTaking: AreTakingStatus; // 'yes', 'no', 'sometimes', 'unknown'
    needsRefill: YesNoStatus; // 'yes', 'no', or null (conditional)
    refillLocation: RefillLocation; // 'local', 'mail' (conditional)
    comment: string | null; // Any additional comments or notes about the medication
    isComplete: boolean | null; // Indicates if the medication review is complete
}

export type UserMedAnswersArray = UserMedicationAnswers[];

export interface ProgressData {
    totalItems?: number;          // Total number of items to be reviewed
    answeredItems?: number;       // Number of items that have been answered completely
    unansweredItems?: number;     // Number of items that have not been answered
    progressPercentage?: number;  // Percentage of items completed (0-100)
};

export type KeyToStrBoolValueObj = Record<string, string | boolean>;

export interface SigFormData {
    encodedSignature?: string; // Base64 encoded string of the signature image
    displayText?: string[];    // array of html text to be displayed
    progress?: ProgressData; // Progress data for the signature form
}
