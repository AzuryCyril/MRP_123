"use strict";
import { fetchInternSubs, fetchExternSubs, fetchServiceDeskSubs, fetchContactList, updateSubDescription, updateContactInfo  } from './database.js';

let historyTrail = []; // Start with an empty history

function updateHistory(selection, type) {
    const historyDiv = document.querySelector('.followHistory');
    const followHeader = document.querySelector('.followHeader'); // Get the full-width container

    if (!historyDiv || !followHeader) return;

    if (historyTrail.length === 0) {
        historyTrail.push({ label: "Renault Support BE", type: null }); // Add only once
    }

    // Prevent duplicate entries when clicking the same item
    if (historyTrail[historyTrail.length - 1].label !== selection) {
        historyTrail.push({ label: selection, type });
    }

    // Show the followHeader when history is added
    followHeader.style.display = "block";

    // Render history as clickable links
    historyDiv.innerHTML = '';
    historyTrail.forEach((entry, index) => {
        const historyLink = document.createElement('span');
        historyLink.textContent = entry.label;
        historyLink.classList.add('history-link');

        if (index < historyTrail.length - 1) {
            historyLink.style.cursor = 'pointer';
            historyLink.style.color = 'blue';
            historyLink.addEventListener('click', () => restoreState(index));
        }

        historyDiv.appendChild(historyLink);
        if (index < historyTrail.length - 1) {
            historyDiv.appendChild(document.createTextNode("\u00A0>\u00A0"));
        }
    });
}


function restoreState(index) {
    const subsDiv = document.querySelector('.Subs');
    const descriptionDiv = document.querySelector('.subDescription');
    const contactDiv = document.querySelector('.subContact'); // Get the subContact div
    const buttonContainer = document.querySelector('.button-container');
    const followHeader = document.querySelector('.followHeader');

    // Trim history to the selected point
    historyTrail = historyTrail.slice(0, index + 1);
    updateHistory(historyTrail[index].label, historyTrail[index].type);

    if (index === 0) {
        // If clicking "Renault Support BE", show buttons, hide everything else
        buttonContainer.style.display = "flex";
        subsDiv.innerHTML = ''; 
        descriptionDiv.innerHTML = ''; 
        descriptionDiv.style.display = "none"; // Hide description on reset
        subsDiv.style.display = "block"; // Show subs
        contactDiv.style.display = "none"; // Hide contact info when going back to the main page
        historyTrail = [];
        document.querySelector('.followHistory').innerHTML = ''; 
        followHeader.style.display = "none"; // Hide the header when history is cleared
    } else if (historyTrail[index].type) {
        // If clicking back to any category (like Intern), render the list again
        descriptionDiv.style.display = "none"; 
        subsDiv.style.display = "block"; 
        contactDiv.style.display = "none"; // Hide the contact div when we're on the sub list
        renderSubs(historyTrail[index].type, false); // Fetch and show the selected type
    }
}

async function showDescription(subId, description, issues, parentType) {
    const subsDiv = document.querySelector('.Subs');
    const descriptionDiv = document.querySelector('.subDescription');
    const contactDiv = document.querySelector('.subContact'); 
    const contactInfoDiv = document.querySelector('.subContactInfo'); 
    const issuesDiv = document.querySelector('.possibleIssues'); // Select the issues div

    if (!subsDiv || !descriptionDiv || !contactDiv || !contactInfoDiv || !issuesDiv) return;

    // Hide subs and show description
    subsDiv.style.display = "none";

    descriptionDiv.innerHTML = `
        <div class="descriptionHeader">
            <h2 class="subTitle">${subId}</h2>
            <i class="fas fa-pencil-alt edit-icon"></i>
        </div>
        <div class="descriptionContent">
            <div id="descText">${description || "No description available"}</div>
        </div>
    `;
    
    descriptionDiv.style.display = "block";  

    // Fetch the contact information based on the subId
    const contactList = await fetchContactList();
    const matchingContact = contactList.find(contact => contact.id === subId);

    if (matchingContact) {
        contactInfoDiv.innerHTML = `
            <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p id="contactName">${matchingContact.test || "No name available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p id="contactPerson">${matchingContact.contactPerson || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p id="contactEmail">${matchingContact.contactPersonEmail || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p id="contactBackup">${matchingContact.contactPersonBackup || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p id="assignmentGroup">${matchingContact.assignmentGroup || "No email available"}</p></div>
        `;
        contactDiv.style.display = "block";  
    
        // Add event listener to edit icon for contact info
        document.getElementById("editContactIcon").addEventListener("click", () => enableContactEditing(subId));
    } else {
        contactInfoDiv.innerHTML = "<p>No contact information available for this sub.</p>";
        contactDiv.style.display = "block";
    }

    // Display possible issues
    console.log(issues)
    if (issues.length > 0) {
        issuesDiv.innerHTML = `<p class="issueItem">${issues.test.pokemon}</p>`;
    } else {
        issuesDiv.innerHTML = "<p>No known issues for this sub.</p>";
    }

    // Add event listener to pencil icon for editing
    const editIcon = descriptionDiv.querySelector(".edit-icon");
    editIcon.addEventListener("click", () => enableEditing(subId));

    // Add to follow history
    updateHistory(subId, parentType);
}


function enableContactEditing(subId) {
    const contactInfoDiv = document.querySelector('.subContactInfo');
    const editIcon = document.getElementById('editContactIcon');  // Get the pencil icon
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
    editIcon.style.display = 'none';  // Hide the pencil icon
    saveButton.style.display = 'inline-block'; // Show the save button

    // Add event listener for saving changes
    saveButton.addEventListener("click", () => saveContactInfo(subId, saveButton, editIcon));
}



async function saveContactInfo(subId, saveButton, editIcon) {
    const newName = document.getElementById("editContactName").value.trim();
    const newPerson = document.getElementById("editContactPerson").value.trim();
    const newEmail = document.getElementById("editContactEmail").value.trim();
    const newBackup = document.getElementById("editContactBackup").value.trim();
    const newGroup = document.getElementById("editAssignmentGroup").value.trim();

    // Create an object with the updated data
    const updatedContactInfo = {
        test: newName,
        contactPerson: newPerson,
        contactPersonEmail: newEmail,
        contactPersonBackup: newBackup,
        assignmentGroup: newGroup
    };

    try {
        await updateContactInfo(subId, updatedContactInfo); // Calls the update function (presumably a database operation)

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



// Function to enable editing mode
function enableEditing(subId) {
    const descriptionDiv = document.querySelector('.subDescription');
    const descText = document.getElementById('descText');
    const editIcon = descriptionDiv.querySelector('.edit-icon');  // Get the pencil icon

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
    saveButton.addEventListener("click", () => saveDescription(subId, saveButton, editIcon));
}


// Function to save updated description
async function saveDescription(subId, saveButton, editIcon) {
    const descriptionDiv = document.querySelector('.subDescription');
    const newDesc = document.getElementById('descInput').value;

    if (!descriptionDiv || !newDesc) return;

    // Determine parent type (intern, extern, servicedesk)
    const parentType = historyTrail.length > 1 ? historyTrail[1].type : null;
    if (!parentType) {
        console.error("Parent type not found!");
        return;
    }

    // Call updateSubDescription to save the new description
    try {
        await updateSubDescription(subId, newDesc, parentType);

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




async function renderSubs(type, addToHistory = true) {
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
        let subs = [];
        let label = "";

        if (type === "intern") {
            subs = await fetchInternSubs();
            label = "Intern";
        } else if (type === "extern") {
            subs = await fetchExternSubs();
            label = "Extern";
        } else if (type === "servicedesk") {
            subs = await fetchServiceDeskSubs();
            label = "ServiceDesk";
        }

        if (addToHistory) {
            updateHistory(label, type);
        }

        subsDiv.innerHTML = ''; // Clear existing content

        subs.forEach(sub => {
            const subContainer = document.createElement('div');
            subContainer.classList.add('sub-item');
            subContainer.style.cursor = "pointer"; // Make it clear it's clickable
            // Click event to show description and add to history
            subContainer.addEventListener('click', () => showDescription(sub.id, sub.description, sub.issues, type));

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

    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        subsDiv.innerHTML = '<p>Error loading data.</p>';
    }
}

// Event listener for buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            renderSubs(type);
        });
    });
});


