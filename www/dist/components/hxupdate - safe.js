// /opt/worldvista/EHR/web/previsit/www/components/hxupdate.ts
//
// HxUpdateAppView
//     > has space for expand.. to scroll (for addresseses)
//     > but can have independantly scrolling windows
//     	(if display size big enough)
//
//import AppView, { AppViewInstance, EnhancedHTMLElement } from '../utility/appview.js';
import TAppView from './appview.js';
// ---------------------------------------------------
// Purpose: Represents the HxUpdate component as a class.
export default class THxUpdateAppView extends TAppView {
    scriptHTML = "";
    constructor(aCtrl, opts) {
        super('hxupdate', aCtrl);
        const tempInnerHTML = `
            <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px auto;
              max-width: 800px;
              padding: 0 15px;
              color: #333;
            }
                    h1 {
              text-align: center;
              color: #2c3e50;
              margin-bottom: 30px;
            }
                    h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
                    ul {
              list-style: none;
              padding: 0;
              margin-bottom: 20px;
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
                    li {
              margin-bottom: 0;
            }
                    /* --- Custom Checkbox Styling --- */
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            }
                    .custom-checkbox-text {
              display: inline-block;
              padding: 7px 12px;
              border-radius: 12px;
              background-color: #f0f0f0;
              color: #555;
              transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
              cursor: pointer;
              user-select: none;
            }
                    label:hover .custom-checkbox-text {
              background-color: #e2e2e2;
            }
                    input[type='checkbox']:checked + .custom-checkbox-text {
              background-color: #3498db; /* Default checked color (blue) */
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
                    /* Specific style for 'NONE' checkbox when checked */
            input.none-toggle-checkbox:checked + .none-checkbox-text {
              background-color: #e74c3c; /* Reddish color for NONE when checked */
              color: white;
            }
                    /* Styles for general labels (like for custom checkboxes) */
            label {
              display: flex;
              align-items: center;
              width: fit-content;
            }
                    /* --- Details Textarea Styling (General) --- */
            .details-input-group {
              /* This general style applies to sections where NONE is not used this way */
              margin-top: 15px;
              margin-bottom: 25px;
            }
                    .details-input-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
              color: #444;
            }
                    .details-input-group textarea {
              width: 100%;
              min-height: 30px;
              padding: 8px 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 1em;
              box-sizing: border-box;
              resize: vertical;
            }
                    /* --- NEW: Specific Styling for 'Since your last visit' section --- */
            .question-group {
              margin-bottom: 25px; /* Space between each question group */
            }
                    .main-question-label { /* Style for the main question label */
              display: block; /* Ensures it's on its own line */
              margin-bottom: 10px; /* Space below the main question */
              font-weight: bold; /* Make the main question prominent */
              color: #333;
            }
                    .details-options-row {
              display: flex; /* Use flexbox to align 'NONE' and 'Details:' side-by-side */
              align-items: center; /* Vertically align items */
              gap: 15px; /* Space between 'NONE' and 'Details:' */
              margin-bottom: 10px; /* Space above textarea */
            }
                    .details-label { /* Style for the 'Details:' label in this specific context */
                font-weight: bold;
                color: #444;
                white-space: nowrap; /* Prevent 'Details:' from wrapping */
              }
                      .details-textarea-container {
                margin-top: 5px; /* Space below the details/none row */
              }
                      .details-textarea-container textarea {
                width: 100%;
                min-height: 30px;
                padding: 8px 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1em;
                box-sizing: border-box;
                resize: vertical;
              }
                      /* Class to hide elements with JavaScript */
              .hidden {
                display: none !important; /* Use !important to ensure it overrides other display properties */
              }
                      /* Responsive adjustments */
              @media (max-width: 768px) {
                body {
                  margin: 15px;
                }
                ul {
                  gap: 8px;
                }
                .custom-checkbox-text {
                  padding: 6px 10px;
                  font-size: 0.95em;
                }
                .details-options-row {
                  flex-direction: column; /* Stack 'NONE' and 'Details:' vertically on small screens */
                  align-items: flex-start;
                  gap: 5px;
                }
              }
            </style>
            <div class='container hxupdate-container'>
                <h1>Welcome, <span class="patient-name"></span>!</h1>
                <div class="instructions">
                    <p>Please update your information.</p>
                </div>
                <div class="forms-container"></div>
            </div>
        `; //end of innerHTML
        this.setHTMLEl(tempInnerHTML);
        //this.htmlEl.className = 'hxupdate';
        if (opts) {
            //process opts -- if any added later
        }
    } //constructor
    async loadForms() {
        const sessionID = this.ctrl.loginData?.sessionID;
        if (!sessionID) {
            console.error("No session ID found. Cannot load forms."); // Corrected typo: 'sessionID'
            if (this.htmlEl.$formscontainer)
                this.htmlEl.$formscontainer.textContent = "No session ID found. Cannot load forms.";
            return;
        }
        const params = new URLSearchParams({ sessionID });
        const URL = `/api/hxupdate?${params.toString()}`;
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            //NOTE: data.html is returned from the server as a complete html document, complete with <html> tag.
            //      So we will need to extract the parts we need.
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.html, 'text/html');
            const tempEl = document.createElement('div');
            const styleNode = doc.querySelector("style");
            if (styleNode) {
                tempEl.appendChild(styleNode.cloneNode(true));
            }
            const bodyNode = doc.querySelector("body");
            if (bodyNode) {
                tempEl.append(...bodyNode.children);
            }
            // setup code for page.
            const checkboxes = tempEl.querySelectorAll('.none-toggle-checkbox');
            checkboxes.forEach(checkbox => {
                const htmlCheckbox = checkbox; // Cast checkbox to HTMLInputElement to access .dataset and .checked properties
                function toggleVisibility(isChecked) {
                    // Get the comma-separated string of IDs to hide/show
                    const targetIdsString = htmlCheckbox.dataset.hideTargetIds;
                    if (!targetIdsString)
                        return;
                    const targetIds = targetIdsString.split(','); // Split into an array of IDs
                    targetIds.forEach((id) => {
                        const targetElement = document.getElementById(id.trim()); // Trim whitespace
                        if (targetElement) {
                            if (isChecked) {
                                targetElement.classList.add('hidden'); // Hide the element
                                // If the element contains checkboxes or a textarea, clear/uncheck them
                                const checkboxesInTarget = targetElement.querySelectorAll('input[type=\'checkbox\']');
                                checkboxesInTarget.forEach((cb) => {
                                    cb.checked = false; // Uncheck all checkboxes within the hidden section
                                });
                                const textareaInTarget = targetElement.querySelector('textarea');
                                if (textareaInTarget) {
                                    textareaInTarget.value = ''; // Clear textarea
                                }
                            }
                            else {
                                targetElement.classList.remove('hidden'); // Show the element
                            }
                        }
                    });
                }
                ; //toggleVisibility
                // Add event listener for changes
                htmlCheckbox.addEventListener('change', function () {
                    toggleVisibility(this.checked);
                });
                toggleVisibility(htmlCheckbox.checked); // Initial check on page load in case checkboxes are pre-checked by browser
            }); //checkboxes.forEach(c)
            this.setHTMLEl(tempEl.innerHTML);
        }
        else {
            console.error("Failed to load from from server:", data.message);
            if (this.htmlEl.$formscontainer)
                this.htmlEl.$formscontainer.textContent = "Could not load forms.";
        }
    }
    // Example of an instance method
    about() {
        console.log("Dashboard Component instance");
    }
    ;
    async refresh() {
        //put any code needed to be executed prior to this class being displayed to user.
        await this.loadForms();
    }
}
function whySee() {
}
/*
TESTGQ ;
  NEW OUT DO GETQUEST(74592,.OUT)   ;"DFN for ZZTEST,BABY test patient.
  NEW DIR SET DIR=$$GETDIRNM^TMGIOUTL("Select output directory","/mnt/")
  DO ARR2HFS^TMGIOUT3("OUT",DIR,"index.html")
  QUIT
  ;
GETQUEST(TMGDFN,OUT)  ;"Get patient questionaire.
  NEW TMP DO PREPDATA(TMGDFN,.TMP)
  NEW INFO MERGE INFO("DATA","BODY")=TMP
  DO HTMT2DOC^TMGHTM3("OUT","PTQUESTMPL","TMGPRE01",.INFO)  ;"Combine template with INFO data
  QUIT
  ;
PREPDATA(TMGDFN,OUT)  ;
  ;"TO DO... ADD PATIENT NAME....
  NEW IDX,INDENT SET INDENT=1
  DO ADDLN(.OUT,.IDX,.INDENT,"<h1>Family Physicians of Greeneville</h1>")
  DO ADDLN(.OUT,.IDX,.INDENT,"<p><b>Patient:</b> "_$$GETNAME(TMGDFN)_"<br></p>")
  DO WHYSEE(.OUT,.IDX,.INDENT)  ;"Why seeing doctor?
  DO NEWHX(.OUT,.IDX,.INDENT)  ;"Any new history?
  DO ADDLN(.OUT,.IDX,.INDENT,"<h1>Review of Systems</h1>")
  DO ROS(.OUT,.IDX,.INDENT)  ;"Review of system.
  QUIT
  ;
WHYSEE(OUT,IDX,INDENT) ;"Why are you seeing doctor today?
  DO STARTCATEGORY(.OUT,.IDX,.INDENT) ;"Start Category section
  DO ADDLN(.OUT,.IDX,.INDENT,"<h2>Why are you seeing the doctor today?</h2>")
  NEW LST SET LST="Physical^Recheck^Sick^New Problem"
  NEW PREFIX SET PREFIX="visit_reason"
  DO ADDCBLST(.OUT,.IDX,.INDENT,PREFIX,LST)
  DO ADDDETAILS(.OUT,.IDX,.INDENT,PREFIX) ;"Add Details box
  DO ENDDIV(.OUT,.IDX,.INDENT) ;"End Category section
  QUIT
  ;
NEWHX(OUT,IDX,INDENT)  ;"Any new history?
  DO STARTCATEGORY(.OUT,.IDX,.INDENT) ;"Start Category section
  DO ADDLN(.OUT,.IDX,.INDENT,"<h2>Since your last visit, have you had any of the following?</h2>")
  NEW PRE SET PRE="hx_change_"
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"new_prob","New medical problems?")  ;"Add question group
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"other_provider","Seen any other doctors (e.g. specialists, ER doctor, chiropracter, others etc)?")  ;"Add question group
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"surgery","Had any new surgeries?")  ;"Add question group
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"social","Any change in use of tobacco or alcohol? Any significant changes in social support / employment / living arrangements?")  ;"Add question group
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"family","Any family members with new diseases (e.g. heart attack, diabetes, cancer etc)?")  ;"Add question group
  ;
  DO ADDQSTGRP(.OUT,.IDX,.INDENT,PRE_"tests","Have you had any recent medical tests elsewhere?")  ;"Add question group
  DO ADDLN(.OUT,.IDX,.INDENT,"<div id='testing_list_container'>") SET INDENT=INDENT+1
  NEW LST SET LST="blood work^mammogram^xrays^MRI^CT scan^colon or stomach scope^ultrasound^echocardiogram^cardiac stress test^Holter monitor^ECG^bone density"
  DO ADDCBLST(.OUT,.IDX,.INDENT,"testing",LST)  ;"Add checkbox list.
  DO ADDDETAILS(.OUT,.IDX,.INDENT,"testing") ;"Add Details box
  DO ENDDIV(.OUT,.IDX,.INDENT) ;"End <div id='testing_list_container'>
  DO ENDDIV(.OUT,.IDX,.INDENT) ;"End category section
  QUIT
  ;
ROS(OUT,IDX,INDENT) ;"Review of Systems
  NEW ROS,JDX SET JDX=0
  ;
  SET ROS($I(JDX),"section")="constitutional"
  SET ROS(JDX,"LST")="Chills^Fatigue^Fever^Weight gain^Weight loss"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="heent"
  SET ROS(JDX,"TEXT")="HEAD, EARS, EYES, THROAT"
  SET ROS(JDX,"LST")="Hearing loss^Sinus pressure^Visual changes"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="respiratory"
  SET ROS(JDX,"LST")="Cough^Shortness of breath^Wheezing"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="cardiovascular"
  SET ROS(JDX,"LST")="Chest pain^Pain while walking^Edema^Palpitations"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="gastrointestinal"
  SET ROS(JDX,"LST")="Abdominal pain^Blood in stool^Constipation^Diarrhea^Heartburn^Loss of appetite^Nausea^Vomiting"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="genitourinary"
  SET ROS(JDX,"LST")="Painful urination (Dysuria)^Excessive amount of urine (Polyuria)^Urinary frequency"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="metabolic"
  SET ROS(JDX,"TEXT")="METABOLIC/ENDOCRINE"
  SET ROS(JDX,"LST")="Cold intolerance^Heat intolerance^Excessive thirst (Polydipsia)^Excessive hunger (Polyphagia)"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="neurological"
  SET ROS(JDX,"LST")="Dizziness^Extremity numbness^Extremity weakness^Headaches^Seizures^Tremors"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="psychiatric"
  SET ROS(JDX,"LST")="Anxiety^Depression"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="musculoskeletal"
  SET ROS(JDX,"LST")="Back pain^Joint pain^Joint swelling^Neck pain"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="hematologic"
  SET ROS(JDX,"LST")="Easily bleeds^Easily bruises^Lymphedema^Issues with blood clots"  ;//ADD MORE LATER
  ;
  SET ROS($I(JDX),"section")="immunologic"
  SET ROS(JDX,"LST")="Food allergies^Seasonal allergies"  ;//ADD MORE LATER
  ;
  SET JDX=0
  FOR  SET JDX=$ORDER(ROS(JDX)) QUIT:JDX'>0  DO
  . NEW SECT SET SECT=$GET(ROS(JDX,"section")) QUIT:SECT=""
  . NEW LST SET LST=$GET(ROS(JDX,"LST")) QUIT:LST=""
  . NEW TXT SET TXT=$GET(ROS(JDX,"TEXT")) IF TXT="" SET TXT=$$UP^XLFSTR(SECT)
  . DO ADDROSSECT(.OUT,.IDX,.INDENT,SECT,TXT,LST)
  ;
  QUIT
  ;
STARTCATEGORY(OUT,IDX,INDENT) ;"Start Category section
  DO ADDLN(.OUT,.IDX,.INDENT,"<div class='category-section'>")
  SET INDENT=INDENT+1
  QUIT
  ;
ENDDIV(OUT,IDX,INDENT) ;"End DIV
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")
  QUIT
  ;
CLOSETAG(OUT,IDX,INDENT,TAG) ;"CLOSE TAG
  SET INDENT=INDENT-1
  DO ADDLN(.OUT,.IDX,.INDENT,"</"_TAG_">")
  QUIT
  ;
ADDCBLST(OUT,IDX,INDENT,PREFIX,LST)  ;"Add a checkbox list, from LST
  ;"LST format:  item^item^item^....
  DO ADDLN(.OUT,.IDX,.INDENT,"<ul>") SET INDENT=INDENT+1
  NEW JDX FOR JDX=1:1:$LENGTH(LST,"^") DO
  . NEW ITEM SET ITEM=$PIECE(LST,"^",JDX) QUIT:ITEM=""
  . NEW LCITEM SET LCITEM=$$LOW^XLFSTR(ITEM)
  . SET LCITEM=$TRANSLATE(LCITEM," ","_")
  . NEW NAME SET NAME=PREFIX_"_"_LCITEM
  . NEW STR SET STR="<li><label><input type='checkbox' name='"_NAME_"' class='sr-only'><span class='custom-checkbox-text'>"_ITEM_"</span></label></li>"
  . DO ADDLN(.OUT,.IDX,.INDENT,STR)
  DO CLOSETAG(.OUT,.IDX,.INDENT,"ul")
  QUIT
  ;
ADDDETAILS(OUT,IDX,INDENT,PREFIX) ;"Add Details box
  DO ADDLN(.OUT,.IDX,.INDENT,"<div class='details-input-group'>") SET INDENT=INDENT+1
  NEW NAME SET NAME=PREFIX_"_details"
  DO ADDLN(.OUT,.IDX,.INDENT,"<label for='"_NAME_"'>Other -- Enter Details (if needed):</label>")
  DO ADDLN(.OUT,.IDX,.INDENT,"<textarea id='"_NAME_"' name='"_NAME_"'></textarea>")
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")
  QUIT
  ;
ADDROSSECT(OUT,IDX,INDENT,PREFIX,TEXT,LST) ;
  DO STARTCATEGORY(.OUT,.IDX,.INDENT) ;"Start Category section
  DO ADDLN(.OUT,.IDX,.INDENT,"<h2>"_TEXT_"</h2>")
  DO ADDCBLST(.OUT,.IDX,.INDENT,PREFIX,LST)  ;"Add a checkbox list, from LST
  DO ADDDETAILS(.OUT,.IDX,.INDENT,PREFIX) ;"Add Details box
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")  ;"close category section
  QUIT
  ;
ADDQSTGRP(OUT,IDX,INDENT,PREFIX,TEXT)  ;"Add question group
  DO ADDLN(.OUT,.IDX,.INDENT,"<div class='question-group'>") SET INDENT=INDENT+1
  DO ADDLN(.OUT,.IDX,.INDENT,"<label class='main-question-label'>"_TEXT_"</label>")
  DO ADDLN(.OUT,.IDX,.INDENT,"<div class='details-options-row'>") SET INDENT=INDENT+1
  DO ADDLN(.OUT,.IDX,.INDENT,"<label class='none-option-label'>") SET INDENT=INDENT+1
  DO ADDLN(.OUT,.IDX,.INDENT,"<input type='checkbox' name='"_PREFIX_"_none' class='sr-only none-toggle-checkbox ")
  DO ADDLN(.OUT,.IDX,INDENT+1,"data-hide-target-ids='"_PREFIX_"_details_label,"_PREFIX_"_textarea_container'>")
  DO ADDLN(.OUT,.IDX,.INDENT,"<span class='custom-checkbox-text none-checkbox-text'>NONE</span>")
  DO CLOSETAG(.OUT,.IDX,.INDENT,"label")
  ;
  DO ADDLN(.OUT,.IDX,.INDENT,"<span class='details-label' id='"_PREFIX_"_details_label'>Details:</span>")
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")
  DO ADDLN(.OUT,.IDX,.INDENT,"<div class='details-textarea-container' id='"_PREFIX_"_textarea_container'>") SET INDENT=INDENT+1
  DO ADDLN(.OUT,.IDX,.INDENT,"<textarea id='"_PREFIX_"' name='"_PREFIX_"'></textarea>")
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")
  DO CLOSETAG(.OUT,.IDX,.INDENT,"div")
  QUIT
  ;
ADDLN(ARR,IDX,INDENT,STR) ;
  IF $GET(IDX)'>0 SET IDX=$ORDER(ARR(""),-1)
  SET IDX=IDX+1
  SET INDENT=$GET(INDENT)
  NEW LEN SET LEN=$LENGTH(STR)+(INDENT*2)
  NEW TMP SET TMP=$$RJ^XLFSTR(STR,LEN," ")
  SET ARR(IDX)=TMP
  QUIT
  ;
GETNAME(TMGDFN) ;
  QUIT "test,name"
  ;



*/ 
//# sourceMappingURL=hxupdate%20-%20safe.js.map