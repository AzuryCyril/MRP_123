"use strict";
import { fetchInternSubs, fetchExternSubs, fetchServiceDeskSubs, fetchContactList } from './database.js';

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
    descriptionDiv.innerHTML = `<p>${description || "No description available"}</p>`;
    descriptionDiv.style.display = "block";  

    // Fetch the contact information based on the subId
    const contactList = await fetchContactList();
    const matchingContact = contactList.find(contact => contact.id === subId);

    if (matchingContact) {
        // Update only the inner subContactInfo div
        contactInfoDiv.innerHTML = `
            <p><strong>Name:</strong> ${matchingContact.test || "No name available"}</p>
            <p><strong>Contact Person:</strong> ${matchingContact.contactPerson || "No phone available"}</p>
            <p><strong>Contact Person Email:</strong> ${matchingContact.contactPersonEmail || "No phone available"}</p>
            <p><strong>Contact Person Backup:</strong> ${matchingContact.contactPersonBackup || "No phone available"}</p>
            <p><strong>Assigment Group:</strong> ${matchingContact.assignmentGroup || "No email available"}</p>
        `;
        contactDiv.style.display = "block";  
    } else {
        contactInfoDiv.innerHTML = "<p>No contact information available for this sub.</p>";
        contactDiv.style.display = "block";
    }

    // Add to follow history
    updateHistory(subId, parentType);
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

