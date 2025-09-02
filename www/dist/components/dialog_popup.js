// /opt/worldvista/EHR/web/previsit/www/components/dialog_popup.ts
/* Example usage:
async function runForm() {
  const schema = {
    title: "User Info",
    Fields: {
      Name: "string",
      Age: "number",
      Subscribe: "boolean"
    }
  };

  const result = await showPopupDlg(schema, document.body);

  if (result) {
    console.log("User input:", result);
  } else {
    console.log("Form was canceled");
  }
}

*/
export function showPopupDlg(formDef, parent) {
    return new Promise((resolve) => {
        // Overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0,0,0,0.6)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";
        // Modal window
        const modal = document.createElement("div");
        modal.style.background = "linen";
        modal.style.padding = "24px";
        modal.style.borderRadius = "12px";
        modal.style.minWidth = "320px";
        modal.style.maxWidth = "480px";
        modal.style.width = "80%";
        modal.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
        modal.style.fontFamily = "Arial, sans-serif";
        // Title
        const title = document.createElement("h2");
        title.textContent = formDef.title;
        title.style.margin = "0 0 16px 0";
        title.style.textAlign = "center";
        title.style.fontSize = "20px";
        title.style.color = "#2c3e50";
        modal.appendChild(title);
        // Form
        const form = document.createElement("form");
        form.style.display = "flex";
        form.style.flexDirection = "column";
        form.style.gap = "14px";
        const inputs = {};
        for (const [fieldName, fieldType] of Object.entries(formDef.Fields)) {
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.flexDirection = "column";
            const label = document.createElement("label");
            label.textContent = fieldName;
            label.style.marginBottom = "4px";
            label.style.fontWeight = "bold";
            label.style.color = "#2c3e50";
            let input;
            if (fieldType === "boolean") {
                input = document.createElement("input");
                input.type = "checkbox";
                wrapper.style.flexDirection = "row";
                wrapper.style.alignItems = "center";
                label.style.marginRight = "8px";
                wrapper.appendChild(label);
                wrapper.appendChild(input);
            }
            else {
                input = document.createElement("input");
                input.type = fieldType === "number" ? "number" : "text";
                input.style.padding = "8px";
                input.style.border = "1px solid #ccc";
                input.style.borderRadius = "6px";
                wrapper.appendChild(label);
                wrapper.appendChild(input);
            }
            inputs[fieldName] = input;
            form.appendChild(wrapper);
        }
        modal.appendChild(form);
        // Buttons
        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.style.justifyContent = "flex-end";
        btnRow.style.gap = "12px";
        btnRow.style.marginTop = "20px";
        const makeButton = (text, bg, color) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = text;
            btn.style.padding = "8px 16px";
            btn.style.border = "none";
            btn.style.borderRadius = "6px";
            btn.style.background = bg;
            btn.style.color = color;
            btn.style.fontWeight = "bold";
            btn.style.cursor = "pointer";
            btn.onmouseover = () => (btn.style.opacity = "0.9");
            btn.onmouseleave = () => (btn.style.opacity = "1");
            return btn;
        };
        const cancelBtn = makeButton("Cancel", "#aaa", "white");
        cancelBtn.onclick = () => {
            parent.removeChild(overlay);
            resolve(null);
        };
        const acceptBtn = makeButton("Accept", "#3498db", "white");
        acceptBtn.onclick = () => {
            const result = {};
            for (const [fieldName, fieldType] of Object.entries(formDef.Fields)) {
                const input = inputs[fieldName];
                if (fieldType === "boolean") {
                    result[fieldName] = input.checked;
                }
                else if (fieldType === "number") {
                    result[fieldName] = input.value ? parseFloat(input.value) : null;
                }
                else {
                    result[fieldName] = input.value;
                }
            }
            parent.removeChild(overlay);
            resolve(result);
        };
        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(acceptBtn);
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        parent.appendChild(overlay);
    });
}
//# sourceMappingURL=dialog_popup.js.map