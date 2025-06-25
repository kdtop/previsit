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