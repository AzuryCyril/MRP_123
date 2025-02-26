"use strict";
import { fetchInternSubs, fetchExternSubs, fetchServiceDeskSubs, fetchContactList, updateSubDescription  } from './database.js';

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

async function showDescription(subId, description, parentType) {
    const subsDiv = document.querySelector('.Subs');
    const descriptionDiv = document.querySelector('.subDescription');
    const contactDiv = document.querySelector('.subContact'); 
    const contactInfoDiv = document.querySelector('.subContactInfo'); 

    if (!subsDiv || !descriptionDiv || !contactDiv || !contactInfoDiv) return;

    // Hide subs and show description
    subsDiv.style.display = "none";

    descriptionDiv.innerHTML = `
        <div class="descriptionHeader">
            <h2 class="subTitle">${subId}</h2>
            <i class="fas fa-pencil-alt edit-icon"></i>
        </div>
        <div class="descriptionContent">
            <p id="descText">${description || "No description available"}</p>
        </div>
    `;
    
    descriptionDiv.style.display = "block";  

    // Fetch the contact information based on the subId
    const contactList = await fetchContactList();
    const matchingContact = contactList.find(contact => contact.id === subId);

    if (matchingContact) {
        // Update only the inner subContactInfo div
        contactInfoDiv.innerHTML = `
            <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p> ${matchingContact.test || "No name available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p> ${matchingContact.contactPerson || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p> ${matchingContact.contactPersonEmail || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p> ${matchingContact.contactPersonBackup || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p> ${matchingContact.assignmentGroup || "No email available"}</p></div>
        `;
        contactDiv.style.display = "block";  
    } else {
        contactInfoDiv.innerHTML = "<p>No contact information available for this sub.</p>";
        contactDiv.style.display = "block";
    }

    // Add event listener to pencil icon for editing
    const editIcon = descriptionDiv.querySelector(".edit-icon");
    editIcon.addEventListener("click", () => enableEditing(subId));

    // Add to follow history
    updateHistory(subId, parentType);
}

// Function to enable editing mode
// Function to enable editing mode
function enableEditing(subId) {
    const descriptionDiv = document.querySelector('.subDescription');
    const descText = document.getElementById('descText');

    if (!descriptionDiv || !descText) return;

    // Store the current description, keeping HTML formatting
    const currentDescription = descText.innerHTML.trim();

    // Get the width and height of the description text
    const descriptionWidth = descText.offsetWidth;
    const descriptionHeight = descText.scrollHeight;

    // Replace the description with an input field (textarea)
    descriptionDiv.querySelector('.descriptionContent').innerHTML = `
        <textarea id="descInput" class="desc-input" style="width: ${descriptionWidth}px; height: ${descriptionHeight}px;">${currentDescription}</textarea>
        <button id="saveDesc" class="save-btn">Save</button>
    `;



    // Add event listener to save button
    document.getElementById("saveDesc").addEventListener("click", () => saveDescription(subId));
}

// Function to save updated description
async function saveDescription(subId) {
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
            subContainer.addEventListener('click', () => showDescription(sub.id, sub.description, type));

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
            let descriptionText = sub.description || "No description available";
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


