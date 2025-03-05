"use strict";
import {
    fetchInternSubs,
    fetchExternSubs,
    fetchServiceDeskSubs,
    updateSubDescription,
    updateContactInfo,
    addIssueToFirestore,
    addNewSub,
    updateIssueDescription
} from './database.js';

let parentType;
let subs = [];
let currentSub = [];
let historyTrail = [];
let targetPage = 0;

// Event listener for buttons
document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    updateTrail("Renault Support BE")

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            const followHeader = document.querySelector('.followHeader'); // Get the full-width container

            followHeader.style.display = "block";

            

            targetPage = 1;
            parentType = button.dataset.type;

            updateTrail(parentType)
            
            renderSubs();
        });
    });
}

async function refetchData(){
    if (parentType === "supportIntern") {
        subs = await fetchInternSubs();        
    } else if (parentType === "supportExtern") {
        subs = await fetchExternSubs();    
    } else if (parentType === "supportServiceDesk") {
        subs = await fetchServiceDeskSubs();
    }
}

async function renderSubs() {
    const subsDiv = document.querySelector('.Subs');
    const descriptionDiv = document.querySelector('.subDescription');
    const buttonContainer = document.querySelector('.button-container');

    if (!subsDiv || !buttonContainer || !descriptionDiv) {
        console.error("Elements not found.");
        return;
    }

    // Hide buttons after selection
    buttonContainer.style.display = "none";
    descriptionDiv.innerHTML = ""; // Clear previous description

    try {

        await refetchData();

        subsDiv.innerHTML = ''; // Clear existing content

        subs.forEach(sub => {
            const subContainer = document.createElement('div');
            subContainer.classList.add('sub-item');
            subContainer.style.cursor = "pointer"; // Make it clear it's clickable
            subContainer.addEventListener('click', () => {
                targetPage = 2;
                currentSub = sub;
                updateTrail(currentSub.id)
                showDescription()
                showContacts();
                showIssues();
            });

            // Icon
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('icon-container');
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-file-alt');
            iconContainer.appendChild(icon);

            // Text
            const textContainer = document.createElement('div');
            textContainer.classList.add('text-container');
            const idElement = document.createElement('p');
            idElement.textContent = sub.id;
            idElement.classList.add('sub-id');

            // Trimmed description
            let descriptionText = sub.id || "No description available";
            if (descriptionText.length > 20) {
                descriptionText = descriptionText.substring(0, 20) + "...";
            }
            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = descriptionText;
            descriptionElement.classList.add('sub-description');

            // Append elements
            textContainer.appendChild(idElement);
            textContainer.appendChild(descriptionElement);
            subContainer.appendChild(iconContainer);
            subContainer.appendChild(textContainer);
            subsDiv.appendChild(subContainer);
        });

        // Add "+" button to add a new sub
        subsDiv.insertAdjacentHTML("beforeend", '<div class="addSubButton"><div class="icon-container">+</div></div>');

        const addSubButton = subsDiv.querySelector(".addSubButton");
        addSubButton.addEventListener("click", () => {
            
            // Prevent multiple input fields
            if (document.querySelector(".inputSubButton")) return;
        
            // Append the input field and buttons outside of addSubButton
            addSubButton.insertAdjacentHTML(
                "beforeend", 
                `<div class="inputSubButton">
                    <input type="text" id="newSubInput" placeholder="Enter sub name">
                    <button class="confirmSub">✔</button>
                    <button class="cancelSub">✖</button>
                </div>`
            );
        
            // Select elements after insertion
            const inputField = document.querySelector("#newSubInput");
            const confirmBtn = document.querySelector(".confirmSub");
            const cancelBtn = document.querySelector(".cancelSub");
        
            // Confirm button event listener
            confirmBtn.addEventListener("click", async (event) => {
                event.stopPropagation();
                if (inputField.value.trim() === "") {
                    alert("Sub name cannot be empty!");
                    return;
                }
        
                // Call the function to add the new sub
                await addNewSub(parentType, inputField.value.trim());
        
                // Remove the input form after confirming
                document.querySelector(".inputSubButton").remove();
        
                // Re-render subscriptions
                await renderSubs();
            });
        
            // Cancel button event listener
            cancelBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                // Remove the input form when cancel is clicked
                document.querySelector(".inputSubButton").remove();
               
            });
        });

    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        subsDiv.innerHTML = '<p>Error loading data.</p>';
    }
}


//ShowDescription
async function showDescription() {
    console.log(currentSub.description)
    const subsDiv = document.querySelector('.Subs');
    const descriptionDiv = document.querySelector('.subDescription');
    if (!subsDiv || !descriptionDiv) return;
 
    // Hide subs and show description
    subsDiv.style.display = "none";
    getDescription(currentSub.id);

    descriptionDiv.style.display = "block";

    // Add event listener to pencil icon for editing
    const editIcon = descriptionDiv.querySelector(".edit-icon");
    editIcon.addEventListener("click", () => enableEditing());

}


// Function to enable editing mode
function enableEditing() {
    const descriptionDiv = document.querySelector('.subDescription');
    const descText = document.getElementById('descText');
    const editIcon = descriptionDiv.querySelector('.edit-icon'); // Get the pencil icon

    if (!descriptionDiv || !descText || !editIcon) return;

    // Store the current description, keeping HTML formatting
    const currentDescription = descText.innerHTML.trim();

    // Get the width and height of the description text
    const descriptionWidth = descText.offsetWidth;
    const descriptionHeight = descText.scrollHeight;

    // Remove existing TinyMCE instance before replacing the textarea
    if (tinymce.get('descInput')) {
        tinymce.get('descInput').remove();
    }

    // Replace the description with an input field (textarea)
    descriptionDiv.querySelector('.descriptionContent').innerHTML = `
        <textarea id="descInput" class="desc-input" style="width: ${descriptionWidth}px; height: ${descriptionHeight}px;">${currentDescription}</textarea>
    `;

    // Re-initialize TinyMCE on the new textarea
    tinymce.init({
        selector: '#descInput', // Apply TinyMCE to the textarea
        height: descriptionHeight + 350,
        width: descriptionWidth,
        menubar: false, // Optional: Hide the menu bar
        plugins: 'advlist autolink lists link image charmap print preview anchor',
        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
        setup: function (editor) {
            editor.on('change', function () {
                // Automatically update the content inside the textarea as the user types
                editor.save();
            });
        }
    });

    // Create and add a save button to the descriptionHeader
    const saveButton = document.createElement('button');
    saveButton.id = 'saveDesc';
    saveButton.classList.add('save-btn');
    saveButton.textContent = 'Save';

    // Insert the save button right after the pencil icon in the same container
    const descriptionHeader = descriptionDiv.querySelector('.descriptionHeader');
    descriptionHeader.appendChild(saveButton);

    // Hide the pencil icon and show the save button
    editIcon.style.display = 'none';
    saveButton.style.display = 'inline-block'; // Show the save button

    // Add event listener to save button
    saveButton.addEventListener("click", () => saveDescription(saveButton, editIcon));
}


// Function to save updated description
async function saveDescription(saveButton, editIcon) {
    const descriptionDiv = document.querySelector('.subDescription');
    let newDesc = document.getElementById('descInput').value;

    if (!descriptionDiv || !newDesc) return;

    // Determine parent type (intern, extern, servicedesk)
 
    // Call updateSubDescription to save the new description
    try {
        if(targetPage == 2 ){
            newDesc = newDesc.replace(
                /<a href="(.*?)">(.*?)<\/a>/g,
                '<a href="#" onclick="window.getDescription(\'$1\')\">$2</a>'
            );
            console.log(newDesc);
            currentSub.description = newDesc;
            await updateSubDescription(currentSub.id, newDesc, parentType);
        }
        if(targetPage == 3 ){

            for(let i = 0; i < currentSub.issues.length ; i++){

                if(currentSub.issues[i].name == historyTrail[3].trail){
                    newDesc = newDesc.replace(
                        /<a href="#">(.*?)<\/a>/g,
                        `<a href="#" onclick="getDescription(${currentSub.issues[i].name})">$1</a>`
                    );
                    currentSub.issues[i].solution = newDesc;
                
                }
            }
            showIssues()
          
            await updateIssueDescription(currentSub.id, newDesc, parentType, historyTrail[3].trail);
        }
        
        

        // Replace input field with updated description text
        descriptionDiv.querySelector('.descriptionContent').innerHTML = `
            <div id="descText">${newDesc}</div>
        `;

        // Hide the save button and show the pencil icon again
        saveButton.style.display = 'none';
        editIcon.style.display = 'inline-block'; // Show the pencil icon

    } catch (error) {
        console.error("Error saving description:", error);
    }
}



//ShowContacts
async function showContacts(){
    const contactDiv = document.querySelector('.subContact');
    const contactInfoDiv = document.querySelector('.subContactInfo');
    if (!contactDiv || !contactInfoDiv) return;
    // Fetch the contact information based on the subId
    contactInfoDiv.innerHTML = `
    <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p id="contactName">${currentSub.contactList.name || "No name available"}</p></div>
    <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p id="contactPerson">${currentSub.contactList.contactPerson || "No phone available"}</p></div>
    <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p id="contactEmail">${currentSub.contactList.contactPersonEmail || "No phone available"}</p></div>
    <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p id="contactBackup">${currentSub.contactList.contactPersonBackup || "No phone available"}</p></div>
    <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p id="assignmentGroup">${currentSub.contactList.assignmentGroup || "No email available"}</p></div>
    `;
    contactDiv.style.display = "block";

    // Add event listener to edit icon for contact info
    document.getElementById("editContactIcon").addEventListener("click", () => enableContactEditing());
}



async function enableContactEditing() {
    const contactInfoDiv = document.querySelector('.subContactInfo');
    const editIcon = document.getElementById('editContactIcon'); // Get the pencil icon
    const contactHeader = document.querySelector('.contactHeader'); // Get the container of the pencil icon

    if (!contactInfoDiv || !contactHeader) return;

    // Store current values
    const name = document.getElementById("contactName").textContent.trim();
    const person = document.getElementById("contactPerson").textContent.trim();
    const email = document.getElementById("contactEmail").textContent.trim();
    const backup = document.getElementById("contactBackup").textContent.trim();
    const group = document.getElementById("assignmentGroup").textContent.trim();

    // Replace text with input fields
    contactInfoDiv.innerHTML = `
        <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><input id="editContactName" type="text" value="${name}"></div>
        <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><input id="editContactPerson" type="text" value="${person}"></div>
        <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><input id="editContactEmail" type="email" value="${email}"></div>
        <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><input id="editContactBackup" type="text" value="${backup}"></div>
        <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><input id="editAssignmentGroup" type="text" value="${group}"></div>
    `;

    // Create and add a save button
    const saveButton = document.createElement('button'); // Create the save button
    saveButton.id = "saveContact";
    saveButton.classList.add("save-btn");
    saveButton.textContent = "Save";

    // Insert the save button right after the pencil icon in the same container
    contactHeader.appendChild(saveButton);

    // Hide the pencil icon and show the save button
    editIcon.style.display = 'none'; // Hide the pencil icon
    saveButton.style.display = 'inline-block'; // Show the save button

    // Add event listener for saving changes
    saveButton.addEventListener("click", () => saveContactInfo(saveButton, editIcon));
}


async function saveContactInfo(saveButton, editIcon) {
    const newName = document.getElementById("editContactName").value.trim();
    const newPerson = document.getElementById("editContactPerson").value.trim();
    const newEmail = document.getElementById("editContactEmail").value.trim();
    const newBackup = document.getElementById("editContactBackup").value.trim();
    const newGroup = document.getElementById("editAssignmentGroup").value.trim();

    // Create an object with the updated data
    const updatedContactInfo = {
        name: newName,
        contactPerson: newPerson,
        contactPersonEmail: newEmail,
        contactPersonBackup: newBackup,
        assignmentGroup: newGroup
    };

    try {
        await updateContactInfo(currentSub.id, updatedContactInfo, parentType); // Calls the update function (presumably a database operation)

        // Replace input fields back with text
        const contactInfoDiv = document.querySelector('.subContactInfo');
        contactInfoDiv.innerHTML = `
            <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p id="contactName">${newName}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p id="contactPerson">${newPerson}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p id="contactEmail">${newEmail}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p id="contactBackup">${newBackup}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p id="assignmentGroup">${newGroup}</p></div>
        `;

        // After saving, hide the save button and show the pencil icon again
        saveButton.style.display = 'none';
        editIcon.style.display = 'inline-block'; // Show the pencil icon

    } catch (error) {
        console.error("Error updating contact info:", error);
    }
}


async function showIssues() {
  
    // Display possible issues
    const issuesDiv = document.querySelector('.possibleIssues'); // Select the issues div
    const issuesContainer = document.querySelector('.subIssues');

    if (!issuesDiv) return;
    issuesContainer.style.display = "block";
    const issueArray = Object.values(currentSub.issues); // Convert object to array
    issuesDiv.innerHTML = "";
    if (issueArray.length > 0) {
        issuesDiv.innerHTML = issueArray
            .map(issue => {
                let solutionText = issue.solution;

                // Limit characters to roughly 2 lines (adjust as needed)
                const maxLength = 120; // Adjust based on font and layout
                if (solutionText.length > maxLength) {
                    solutionText = solutionText.substring(0, maxLength) + "...";
                }

                return `<div class="issueItem" data-solution='${issue.solution}' data-name="${issue.name}">
                     <div class="icon-container"><i class="fa-solid fa-book-open"></i></i></div>
                     <div class="preview__text">
                         <h4>${issue.name}:</h4> 
                         <p>Category: ${currentSub.id}</p></br>
                         <p>${solutionText}</p>
                     </div>
                 </div>`;
            })
            .join('');
    } else {
        issuesDiv.innerHTML = "<p>No known issues for this sub.</p>";
    }

    

    // Add "Add Issue" button at the bottom
    const addIssueButton = document.createElement("button");
    addIssueButton.textContent = "+ Add Issue";
    addIssueButton.classList.add("add-issue-btn");
    addIssueButton.addEventListener("click", () => showIssueInput());

    issuesDiv.appendChild(addIssueButton);

    document.querySelectorAll(".issueItem").forEach(item => {
        item.addEventListener("click", () => {
            const issueId = item.getAttribute("data-solution");
            const issueName = item.getAttribute("data-name");

            targetPage = 3;
            
            if(historyTrail.length > 3){historyTrail.splice(3); updateTrail(issueName)}else{updateTrail(issueName)}
            
            console.log(`Clicked issue: ${issueId}`);
            const descriptionDiv = document.querySelector('.subDescription');
            
            getDescription(issueName)

        const editIcon = descriptionDiv.querySelector(".edit-icon");
        editIcon.addEventListener("click", () => enableEditing());
           
        });
    });

}


async function showIssueInput() {
    const issuesDiv = document.querySelector('.possibleIssues');

    // Remove existing input if any
    const existingInput = document.getElementById("newIssueInput");
    if (existingInput) return; // Prevent multiple inputs

    // Create input field
    issuesDiv.insertAdjacentHTML('afterend',`<div id="newIssueDiv">
        <input type = "text" class="issue-input" placeholder = "Enter issue name...">
        <button class="confirm-btn">Confirm</button>
        <button class="cancel-btn">Cancel</button>
        </div>`)

    document.querySelector(".confirm-btn").addEventListener("click", async () => {
        if (document.querySelector(".issue-input").value.trim() === "") {
            alert("Please enter a name")
            return;
        }
        await addIssueToFirestore(currentSub.id, document.querySelector(".issue-input").value.trim(), parentType);

        document.getElementById("newIssueDiv").remove()

        await refetchData()
        subs.forEach(sub => {
            if (sub.id == currentSub.id) {
                currentSub = sub
            }
        })
        
         await showIssues()
    });

    // Create cancel button
    document.querySelector(".cancel-btn").addEventListener("click", () => {
        document.getElementById("newIssueDiv").remove()
    });
}




async function updateTrail(trail){
    historyTrail.push({trail})
    // Render history as clickable links
    await updateHistory()
}

async function updateHistory() {

    const historyDiv = document.querySelector('.followHistory');
    historyDiv.innerHTML = '';
    for(let i = 0; i< historyTrail.length; i++ ){
        historyDiv.insertAdjacentHTML('beforeend',`<span class="history-link" data-id ="${i}">${historyTrail[i].trail}</span> ` + "\u00A0>\u00A0")
    }
    // historyTrail.forEach((entry) => {
        

    // });
    document.querySelectorAll(".history-link").forEach(item => {
        item.addEventListener("click", async () => {
            let targetIndex = parseInt(item.getAttribute("data-id"));
            console.log(targetPage)
            console.log(targetIndex)
            // Remove all items after the clicked index
            if(targetIndex != targetPage ){historyTrail.splice(targetIndex + 1); targetPage--}
            
            if(targetIndex == 0){
                document.querySelector('.button-container').style.display = "flex";
                document.querySelector('.Subs').innerHTML ='';
                document.querySelector('.Subs').style.display = "block";
                document.querySelector('.subDescription').style.display = "none";
                document.querySelector('.subContact').style.display = "none";
                document.querySelector('.subIssues').style.display = "none";
                document.querySelector('.followHeader').style.display = "none";
            }

            if(targetIndex == 1){
                document.querySelector('.Subs').style.display = "block";
                document.querySelector('.subDescription').style.display = "none";
                document.querySelector('.subContact').style.display = "none";
                document.querySelector('.subIssues').style.display = "none";
            }
            
           if(targetIndex == 2){
            showDescription();
           }
            
            await updateHistory()
          
            // Re-render the updated trail
            
        })
    })
    
}

window.getDescription = async function(id) {
    subs.forEach(sub => {
        if(sub.id == id){
            const descriptionDiv = document.querySelector('.subDescription');
            descriptionDiv.innerHTML = `
                <div class="descriptionHeader">
                    <h2 class="subTitle">${sub.id}</h2>
                    <i class="fas fa-pencil-alt edit-icon"></i>
                </div>
                <div class="descriptionContent">
                    <div id="descText">${sub.description || "No description available"}</div>
                </div>
            `;
        } else {
            for(let i = 0; i < sub.issues.length; i++) {
                if(sub.issues[i].name == id){
                    const descriptionDiv = document.querySelector('.subDescription');
                    descriptionDiv.innerHTML = `
                        <div class="descriptionHeader">
                            <h2 class="subTitle">${sub.issues[i].name}</h2>
                            <i class="fas fa-pencil-alt edit-icon"></i>
                        </div>
                        <div class="descriptionContent">
                            <div id="descText">${sub.issues[i].solution || "No description available"}</div>
                        </div>
                    `;
                }
            }
        }
    });
};