// /opt/worldvista/EHR/web/previsit/www/components/dialog_popup.ts

import { exit } from "process";
import { getAppColors } from "./appview.js";
import { resolve } from "path";

export enum FieldType { Str, Bool, Num,  Text }   // 0 .. 3
export type FieldResultType = string | boolean | number;
export enum ModalBtn { undef, OK, Cancel, Accept, Done, Yes, No }  // 0 .. 6
export type TModalButtons = ModalBtn[];
const BUTTON_NAMES: Record<ModalBtn, string> = {
  [ModalBtn.undef]: "??",
  [ModalBtn.OK]: "OK",
  [ModalBtn.Cancel]: "Cancel",
  [ModalBtn.Accept]: "Accept",
  [ModalBtn.Done]: "Done",
  [ModalBtn.Yes]: "Yes",
  [ModalBtn.No]: "No",
}  as const satisfies Record<ModalBtn, string>; // Explicit mapping: every enum member must have a value

export interface FieldDef {
  type: FieldType;
  placeholder?: string;
  label?: string;   // optional override for display text
}

export interface FieldDef {
  type: FieldType;
  placeholder?: string;
  label?: string;       // optional override for display text
  required?: boolean;  //Required fields will stay highlighted if left blank.
  defaultValue?: any;   //Defaults are used if the user doesn’t enter anything.
}

export type DlgResult = Record<FieldName, FieldResultType>;
export type DlgResultOrNull = DlgResult | null;
export type FieldName = string;
export type FieldEntry = Record<FieldName, FieldType | FieldDef>;

export interface DlgSchema {
  buttons : TModalButtons;
  title?: string;
  instructions?: string;
  Fields?: FieldEntry;
}


/* Example usage:

async function runForm() {

  const schema: DlgSchema = {
    buttons: [ModalBtn.OK, ModalBtn.Cancel]
    title: "Survey",
    instructions: "Please fill in all required fields",
    Fields: {
      Name: { type: FieldType.Str, required: true, placeholder: "Full Name" },
      Age: { type: FieldType.Num, required: true, placeholder: "Age in years" },
      Comments: { type: FieldType.Text, placeholder: "Additional notes..." },
      Subscribe: { type: FieldType.Bool, defaultValue: false, label: "Subscribe to newsletter" }
    }
  };

  const result = await showPopupDlg(schema, document.body);
  const modalResult = result.modalResult;
  if (modalResult == ModalBtn.Cancel) {
    console.log("Form was canceled");
  } else {
    console.log("User input:", result);
  }
}

*/

function getCSS(): string {
  return `

    :root {
      ${getAppColors()}
    }

    h2 {
        color:          var(--textColor);
        text-align:     center;
        border-bottom:  2px solid var(--niceBlue);
        padding-bottom: 5px;
        margin-top:     30px;
        margin-bottom:  15px;
    }
    h3 {
        color:          var(--textColor);
        margin-top:     10px;
        border-bottom:  1px solid var(--lightGray);
        padding-bottom: 5px;
    }

    input[type="checkbox"] {
      margin-left: 10px;
      margin-bottom: 2px;
      height: 2em;
      width:2em;
    }

    .dlg-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background-color: var(--darkShadowColor);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .dlg-modal {
      background: linen;
      padding: 24px;
      border-radius: 12px;
      min-width: 320px;
      max-width: 480px;
      width: 80%;
      box-shadow: 0 6px 20px var(--medShadowColor);
      font-family: Arial, sans-serif;
    }
    .dlg-title {
      margin: 0 0 16px 0;
      text-align: center;
      color: var(--textColor);
    }
    .dlg-subtitle {
      margin: 0 0 16px 0;
      text-align: center;
      color: var(--textColor);
    }
    .dlg-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .dlg-field {
      display: flex;
      flex-direction: column;
    }
    .dlg-field-row {
      flex-direction: row;
      align-items: center;
    }
    .dlg-label {
      margin-bottom: 4px;
      font-weight: bold;
      color: #2c3e50;
    }
    .dlg-input {
      padding: 8px;
      border: 1px solid var(--medGray);
      border-radius: 6px;
    }
    .dlg-textarea {
      resize: vertical;
      min-height: 60px;
    }
    .dlg-error-msg {
      color: var(--redish);
      font-size: 0.8em;
      margin-top: 2px;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    .dlg-error-msg.show {
      display: block;
      opacity: 1;
    }
    .dlg-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
    .dlg-reply-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    .dlg-reply-btn:hover {
      opacity: 0.9;
    }
    .dlg-reply-btn-ok {
      background: var(--gray);
      color: white;
    }
    .dlg-reply-btn-cancel {
      background: var(--gray);
      color: white;
    }
    .dlg-reply-btn-accept {
      background: var(--niceBlue);
      color: white;
    }
    .dlg-reply-btn-done {
      background: var(--gray);
      color: white;
    }
    .dlg-reply-btn-yes {
      background: var(--gray);
      color: white;
    }
    .dlg-reply-btn-no {
      background: var(--gray);
      color: white;
    }

  `;
}


function getHTML(formDef: DlgSchema): string {
  let fieldsHTML = "";

  if (formDef.Fields) for (const [fieldName, fieldConfig] of Object.entries(formDef.Fields)) {
    let fieldDef: FieldDef;
    // If fieldConfig is already a FieldDef object, use it;
    // otherwise wrap the enum shorthand in a FieldDef object.
    if (fieldConfig && (typeof fieldConfig === "object")) {
      fieldDef = fieldConfig;
    } else {
      fieldDef = { type: fieldConfig };  // all the other key:values in FieldDef are optional
    }

    const label = fieldDef.label ?? fieldName;

    if (fieldDef.type === FieldType.Bool) {
      fieldsHTML += `
        <div class="dlg-field dlg-field-row">
          <label class="dlg-label">${label}</label>
          <input type="checkbox"name="${fieldName}" />
          <div class="dlg-error-msg"></div>
        </div>`;
    } else if (fieldDef.type === FieldType.Text) {
      fieldsHTML += `
        <div class="dlg-field">
          <label class="dlg-label">${label}</label>
          <textarea class="dlg-input dlg-textarea"
                    name="${fieldName}"
                    rows="4"
                    placeholder="${fieldDef.placeholder ?? ""}">${fieldDef.defaultValue ?? ""}</textarea>
          <div class="dlg-error-msg"></div>
        </div>`;
    } else {
      const inputType = (fieldDef.type === FieldType.Num) ? "number" : "text";
      fieldsHTML += `
        <div class="dlg-field">
          <label class="dlg-label">${label}</label>
          <input class="dlg-input"
                 type="${inputType}"
                 name="${fieldName}"
                 placeholder="${fieldDef.placeholder ?? ""}"
                 value="${fieldDef.defaultValue ?? ""}" />
          <div class="dlg-error-msg"></div>
        </div>`;
    }
  }

  let buttonsHTML = "";
  for (const aButton of formDef.buttons) {
    if (aButton === ModalBtn.undef) continue;
    const buttonName = BUTTON_NAMES[aButton];  //note: here aButton is a number (it's index in the enum)
    buttonsHTML += `<button class="dlg-reply-btn dlg-reply-btn-${buttonName.toLowerCase()}"
                            data-enumid="${aButton}">${buttonName}</button>`;
  }

  return `
    <div class="dlg-overlay">
      <div class="dlg-modal">
        <h2 class="dlg-title">${formDef.title}</h2>
        <h3 class="dlg-subtitle">${formDef.instructions}</h2>
        <form class="dlg-form">
          ${fieldsHTML}
          <div class="dlg-buttons">
            ${buttonsHTML}
          </div>
        </form>
      </div>
    </div>`;
}


export async function messageDlg(Msg : string, subMsg : string = "", parent: HTMLElement) {
  const schema : DlgSchema = {
      buttons: [ModalBtn.OK],
      title: Msg,
      instructions: subMsg,
  };
  await showPopupDlg(schema, parent);  //ignore results
}

export function showPopupDlg(formDef: DlgSchema, parent: HTMLElement): Promise<DlgResult> {
  return new Promise((resolve) => {
    // Container for CSS + HTML
    const container = document.createElement("div");

    // Inject CSS once per dialog instance
    const style = document.createElement("style");
    style.textContent = getCSS();
    container.appendChild(style);

    // Inject HTML
    container.innerHTML += getHTML(formDef);

    const form = container.querySelector("form") as HTMLFormElement;

    const overlay = container.querySelector(".dlg-overlay") as HTMLElement;
    overlay.onclick = (event) => {      // Outside click
      if (event.target === overlay) {
        doCancelResolve();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {    // Escape key
      if (event.key === "Escape") {
        doCancelResolve();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const handleBtnClick = (event: Event) => {
      const aButtonEl = event.target as HTMLButtonElement;
      if (!aButtonEl) return;
      const buttonType : ModalBtn = parseInt(aButtonEl.dataset.enumid ?? "0", 10) as ModalBtn;
      if (buttonType === ModalBtn.undef) return;
      let result : DlgResultOrNull = extractFormData();  //will return null is form has invalid data.
      if (result) {
        result["modalResult"] = buttonType as number;
        cleanup();
        resolve(result);
      } else { //this branch is for if form data was invalid and result == null
        if (buttonType == ModalBtn.Cancel) {
          //All buttons will cause form to exit, providing data is valid
          //  However, Cancel allows one to leave form, even if data was invalid.
          result = {};
          result["modalResult"] = buttonType as number;
          cleanup();
          resolve(result);
        } else {
          return;
        }
      }
    }

    const replyBtns = form.querySelectorAll(".dlg-reply-btn");
    for (const aButtonEl of replyBtns) {
      aButtonEl.addEventListener("click", handleBtnClick);
    }

    /*
    // Cancel button
    const cancelBtn = form.querySelector(".dlg-reply-btn-cancel") as HTMLButtonElement;
    cancelBtn.onclick = () => {
      cleanup();
      resolve(null);
    };


    // Accept button
    const acceptBtn = form.querySelector(".dlg-reply-btn-accept") as HTMLButtonElement;

    acceptBtn.onclick = () => {
      const result = extractFormData();
      cleanup();
      resolve(result);
    };
    */

    const extractFormData = () : DlgResultOrNull => {
      const result: DlgResult = {};
      let valid = true;

      if (formDef.Fields) for (const [fieldName, fieldConfig] of Object.entries(formDef.Fields)) {
        let fieldDef: FieldDef;
        // If fieldConfig is already a FieldDef object, use it;
        // otherwise wrap the enum shorthand in a FieldDef object.
        if (fieldConfig && (typeof fieldConfig === "object")) {
          fieldDef = fieldConfig;
        } else {
          fieldDef = { type: fieldConfig };  // all the other key:values in FieldDef are optional
        }

        const input = form.querySelector(
          `[name="${fieldName}"]`
        ) as HTMLInputElement | HTMLTextAreaElement;

        const errorDiv = (input.parentElement as HTMLElement).querySelector(".dlg-error-msg") as HTMLElement;

        let value: any;

        if (fieldDef.type === FieldType.Bool) {
          value = (input as HTMLInputElement).checked;
        } else if (fieldDef.type === FieldType.Num) {
          value = input.value ? parseFloat(input.value) : fieldDef.defaultValue ?? null;
        } else {
          // Str or Text
          value = input.value || fieldDef.defaultValue || "";
        }

        // Validation for required fields
        if (fieldDef.required) {
          if (
            (fieldDef.type === FieldType.Num && (value === null || isNaN(value))) ||
            (fieldDef.type !== FieldType.Num && !value.trim())
          ) {
            valid = false;
            errorDiv.textContent = "This field is required";
            errorDiv.classList.add("show");
          } else {
            errorDiv.textContent = "";
            errorDiv.classList.remove("show");
          }
        } else {
          errorDiv.textContent = "";
          errorDiv.classList.remove("show");
        }
        result[fieldName] = value;
      }

      if (!valid) {
        return null; // prevent closing if any required field is invalid
      } else {
        return result;
      }
    }  //extractFormData

    const doCancelResolve = () => {
      const result : DlgResult = {};
      result["modalResult"] = ModalBtn.Cancel as number;
      cleanup();
      resolve(result);
    }

    function cleanup() {
      parent.removeChild(container);
      if (parent.contains(container)) {
        parent.removeChild(container);
      }
      document.removeEventListener("keydown", onKeyDown);
    }

    parent.appendChild(container);
  });  //return new Promise((resolve)
}  //showPopupDlg()
