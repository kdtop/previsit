// questcommon.ts - Common helpers for question/checkbox UI

import TAppView, { EnhancedHTMLElement } from './appview.js';

/**
 * Creates a category section div and appends it to the parent.
 */
export function createCategorySection(parent: HTMLElement): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'category-section';
    parent.appendChild(div);
    return div;
}

/**
 * Creates a heading element of the given level and text.
 */
export function createHeading(level: number, text: string): HTMLHeadingElement {
    const h = document.createElement(`h${level}`) as HTMLHeadingElement;
    h.textContent = text;
    return h;
}

/**
 * Creates a list of checkboxes for the given prefix and items.
 */
export function createCheckboxList(prefix: string, items: string[]): HTMLUListElement {
    const ul = document.createElement('ul');
    items.forEach(item => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `${prefix}_${item.toLowerCase().replace(/ /g, '_')}`;
        input.className = 'sr-only';
        const span = document.createElement('span');
        span.className = 'custom-checkbox-text';
        span.textContent = item;
        label.append(input, span);
        li.appendChild(label);
        ul.appendChild(li);
    });
    return ul;
}

/**
 * Creates a details box (label + textarea) for the given prefix and label text.
 */
export function createDetailsBox(prefix: string, labelText: string): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'details-input-group';
    const name = `${prefix}_details`;
    const label = document.createElement('label');
    label.htmlFor = name;
    label.textContent = labelText;
    const textarea = document.createElement('textarea');
    textarea.id = name;
    textarea.name = name;
    textarea.placeholder = 'Enter details (optional)...';
    div.append(label, textarea);
    return div;
}

/**
 * Creates a question group with a main label, a 'NONE' checkbox, and a details textarea.
 * The toggleVisibilityHandler is called with the 'NONE' checkbox as argument to set up visibility logic.
 */
export function createQuestionGroup(
    anAppView : TAppView,
    parent: HTMLElement,
    prefix: string,
    text: string,
    toggleVisibilityHandler: TToggleVisibilityListener
): void {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'question-group trackable-question';

    const mainLabel = document.createElement('label');
    mainLabel.className = 'main-question-label';
    mainLabel.textContent = text;

    const optionsRow = document.createElement('div');
    optionsRow.className = 'details-options-row';

    const noneLabel = document.createElement('label');
    noneLabel.className = 'none-option-label';
    const noneInput = document.createElement('input');
    noneInput.type = 'checkbox';
    noneInput.name = `${prefix}_none`;
    noneInput.className = 'sr-only none-toggle-checkbox';

    const detailsLabelId = `${prefix}_details_label`;
    const textareaContainerId = `${prefix}_textarea_container`;
    noneInput.dataset.hideTargetIds = `${detailsLabelId},${textareaContainerId}`;

    const noneSpan = document.createElement('span');
    noneSpan.className = 'custom-checkbox-text none-checkbox-text';
    noneSpan.textContent = 'NONE';
    noneLabel.append(noneInput, noneSpan);

    const detailsLabel = document.createElement('span');
    detailsLabel.className = 'details-label';
    detailsLabel.id = detailsLabelId;
    detailsLabel.textContent = 'Details:';

    optionsRow.append(noneLabel, detailsLabel);

    const textareaContainer = document.createElement('div');
    textareaContainer.className = 'details-textarea-container';
    textareaContainer.id = textareaContainerId;
    const textarea = document.createElement('textarea');
    textarea.id = prefix;
    textarea.name = prefix;
    textarea.placeholder = 'Enter details here (optional)...';
    textareaContainer.appendChild(textarea);

    groupDiv.append(mainLabel, optionsRow, textareaContainer);
    parent.appendChild(groupDiv);

    toggleVisibilityHandler(anAppView, noneInput);
}

export interface TToggleVisibilityListener {
    (anAppView : TAppView, checkbox: HTMLInputElement): void;
}

export function addToggleVisibilityListener (anAppView : TAppView, checkbox: HTMLInputElement): void
{
    if (!anAppView) return;
    if (!anAppView.htmlEl) return; // Guard against null element
    const shadowRoot = anAppView.htmlEl.dom;
    const toggleVisibility = (isChecked: boolean) => {
        const targetIdsString = checkbox.dataset.hideTargetIds;
        if (!targetIdsString) return;
        const targetIds = targetIdsString.split(',');
        targetIds.forEach(id => {
            const targetElement  : HTMLElement | null = shadowRoot.getElementById(id.trim());
            if (targetElement) {
                targetElement.classList.toggle('hidden', isChecked);
                if (isChecked) {
                    targetElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => cb.checked = false);
                    const textarea = targetElement.querySelector('textarea');
                    if (textarea) textarea.value = '';
                }
            }
        });
    };
    checkbox.addEventListener('change', () => toggleVisibility(checkbox.checked));
    toggleVisibility(checkbox.checked); // Initial check
}

/**
 * Sends the collected form data to the server via a POST request.
 * @param data The JSON object to send.
 */
export async function sendDataToServerAPI (anAppView : TAppView, apiURL : string, data: Record<string, string | boolean>): Promise<void>
{
    const sessionID = anAppView.ctrl.loginData?.sessionID;
    if (!sessionID) {
        console.error("No session ID found. Cannot save form data.");
        // Optionally, alert the user or attempt to re-authenticate.
        return;
    }
    try {
        const response = await fetch('/api/hxupdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send both sessionID and the form data in the body
            body: JSON.stringify({ sessionID, formData: data })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error saving form data:', errorData.message || response.statusText);
        } else {
            console.log("Form data successfully autosaved.");
        }
    } catch (error) {
        console.error('Network error while saving form data:', error);
    }
}

/**
 * Gathers all form data into a structured JSON object.
 * @returns A JSON object representing the current state of the form.
 */
export function gatherDataFromContainerForServer(anAppView : TAppView, containerName : string): Record<string, string | boolean>
{
  if (!anAppView) return {};
  if (!anAppView.htmlEl) return {};
  const form : HTMLFormElement | null = anAppView.htmlEl.dom.querySelector<HTMLFormElement>(containerName);
  if (!form) {
      console.error("Form not found for data extraction.");
      return {};
  }
  const formData = new FormData(form);
  const data: Record<string, string | boolean> = {};
  for (const [key, value] of formData.entries()) {
    if (value === 'on') {
      data[key] = true; // Convert checkbox 'on' to boolean true
    } else if (value) { // Only include textareas/inputs if they have a value
      data[key] = value as string;
    }
  }
 console.log("Compiled form data:", data);
  return data;
}


/**
 * Populates the form fields based on a JSON object from the server.
 * @param data A JSON object with form data.
 */
export function serverDataToFormContainer(anAppView : TAppView, containerName : string, data: Record<string, string | boolean>): void
{
    if (!anAppView) return;
    if (!anAppView.htmlEl) return;
    const form : Element | null = anAppView.htmlEl.dom.querySelector(containerName);
    if (!form) return;

    // 1. Get all relevant input elements (checkboxes and textareas)
    let allInputs : NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
    allInputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="checkbox"], textarea');

    // 2. First, reset all inputs to their default state (unchecked/empty)
    allInputs.forEach(element => {
        if (element.type === 'checkbox') {
            (element as HTMLInputElement).checked = false;
        } else if (element.tagName === 'TEXTAREA') {
            (element as HTMLTextAreaElement).value = '';
        }
    });

    // 3. Then, apply the data received from the server
    for (const key in data) { // Iterate only over keys present in 'data'
        const element = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`);
        if (element) { // Ensure the element exists in the form
            if (element.type === 'checkbox') {
                (element as HTMLInputElement).checked = data[key] === true;
            } else if (element.tagName === 'TEXTAREA') {
                (element as HTMLTextAreaElement).value = data[key] as string;
            }
        }
    }
    // 4. Finally, trigger change events for all relevant checkboxes to ensure UI consistency.
    // This is crucial because setting 'checked' programmatically does not fire 'change' events,
    // and our visibility/mutual exclusion logic relies on these events.
    // Start with 'none' toggles to handle section visibility and clearing.
    form.querySelectorAll<HTMLInputElement>('.none-toggle-checkbox').forEach(cb => {
        cb.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Then, trigger for any other checkboxes that are now checked, to ensure mutual exclusion
    // (e.g., if a regular option was checked, it should uncheck 'NONE' if it was still checked).
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not(.none-toggle-checkbox):checked').forEach(cb => {
        cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
}
