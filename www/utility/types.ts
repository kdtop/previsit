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

// Define a more specific type for the event detail
export interface ChangeViewEventDetail {
    loginData?: LoginApiResponse;
    requestedView : string;
    message: string;
}
