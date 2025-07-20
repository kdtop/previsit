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
    iconName?: string; // The name of the icon to display
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
    totalItems?: number;       // Total number of items to be reviewed
    answeredItems?: number;    // Number of items that have been answered completely
    unansweredItems?: number;  // Number of items that have not been answered
    progressPercentage?: number; // Percentage of items completed (0-100)
}

//export type KeyToStrBoolValueObj = Record<string, string | boolean | string[] | null>; // Updated to include string[] and null
export type KeyToStrBoolValueObj = Record<string, string | boolean >;

export interface SigFormData {
    encodedSignature?: string; // Base64 encoded string of the signature image
    displayText?: string[];    // array of html text to be displayed
    progress?: ProgressData; // Progress data for the signature form
}

export type TAuthorizedPersonsArray = Array<{ name: string; rel: string; phone: string }>;

export interface ConsentFormData {
    encodedSignature?: string;    // Base64 encoded string of the signature image
    sectionsAgreed?: boolean[];  // 0=sectionA status, 1=sectionB status etc
    repName?: string;            // patient representative name
    relationship?: string;        // patient representative relationship
    authPersons?: TAuthorizedPersonsArray;
}

export type TPhq9Answers = {
    questions?: KeyToStrBoolValueObj;
    resultingTotal?: number;
}


//  TReplyType enum-like type
//    if 'freeText' then only free text area (no buttons)
//    if 'buttons' then 1+ buttons with multi choosable. No free text area.
//    if 'radioButtons' then 2+ buttons with only one choosable. No free text area.
//    if 'noneOrButtons' then multiple choice or none, and may have free text area
//    if 'noneOrRadioButtons' then either one radiobutton choice or none, and may have free text area
//    if 'numeric' then only a numeric input field
export type TReplyType = "freeText" | "buttons" | "radioButtons" | "noneOrButtons" | "noneOrRadioButtons" | "numeric";

//ScoreMode enum-like type
//  if not defined, or "none", then no scoring
//  if "custom" then repliesCustomScore[i] will contain score for replies[i].  If entry not found, defaults to 0 points.
//  if 0Index then reply[0] gets 0 points, reply[1] gets 1 point etc.
//  if 1Index then reply[0] gets 1 points, reply[1] gets 2 point etc.
export type TScoreMode = "none" | "custom" | "0Indexed" | "1Indexed";

export interface TQuestionnaireData {
    instructionsText?: string;
    questGroups : TQuestionGroup[];
    endingText?: string;
}

// Define the main interface for the JSON structure
export interface TQuestionGroup {
  groupHeadingText: string;
  question: TQuestion[];
}
// Define the interface for a single question object
export interface TQuestion {
  dataNamespace          : string;
  questionText          ?: string;
  replyType              : TReplyType;
  hasDetailsArea        ?: boolean;
  detailsAreaLabelText  ?: string;          //if set to '' then no label shown.  If not specified, default is "Other:".  Only applies if hasDetailsArea is true.
  replies               ?: string[];        // replies will be required if the replyType is oneButton, multiButtons, noneOrOne, or noneOrMulti
  scoreMode             ?: TScoreMode;      //NOTE: currently Values for numeric input are not included in scoring.
  repliesCustomScore    ?: number[];        //see definition of TScoreMode for details.
  placeholder           ?: string;          // Placeholder text for input fields
  minValue              ?: number;          // Minimum value for numeric input.  NOTE: currently Values for numeric input are not included in scoring.
  maxValue              ?: number;          // Maximum value for numeric input   NOTE: currently Values for numeric input are not included in scoring.
  noneButtonLabel       ?: string;          // if replyType mode includes none button, then this label will be for none button.  Default is 'NONE'
}

/**
 * Represents an instance created by the EL utility.
 * This is the object returned by `new EL(...)`.
 * It contains an `html` property which is the actual `HTMLDivElement`
 * enhanced with an attached Shadow DOM and dynamic shortcut properties (e.g., `el.html.$loginform`).
 */
export type EnhancedHTMLDivElement = HTMLDivElement & {
    dom: ShadowRoot;
    [key: string]: any; // Index signature for dynamic shortcut properties like $loginform
};

/**
 * Options for the EL constructor and properties functions.
 * Supports `innerHTML` and other dynamic properties.
 */
export interface AppViewOptions extends Record<string, any> {
    innerHTML?: string;
}
