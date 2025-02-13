"use strict";
import { fetchContactList, updateContactInFirebase, fetchContactById } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
    const contactContainer = document.getElementById("contactList");

    // Fetch the contact list from Firebase
    const contactList = await fetchContactList();
    console.log(contactList);
    
    // Loop through each document and create a div
    contactList.forEach(contact => {
        let contactHTML = `
            <article class='c1' data-id="${contact.id}">
                <div class='c2'>
                    <div class='c2Title'>
                        <input type="checkbox" class="delete-checkbox" data-id="${contact.id}" />
                        <h1>${contact.id}</h1>
                    </div>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${contact.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="arrowButton"><i class=" arrow fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
                <div class='c3 hidden' id="contact-info-${contact.id}">
                    <!-- Additional info will go here -->
                </div>
            </article>
        `;
        contactContainer.insertAdjacentHTML("beforeend", contactHTML);
    });

    const c2Elements = contactContainer.querySelectorAll('.c2');
    c2Elements.forEach((c2, index) => {
        const arrow = c2.querySelector('.arrow');
        const editButton = c2.querySelector('.edit-btn');
        const contactId = c2.querySelector('h1').textContent; // Get the contact id

        // Toggle the visibility of c3 and rotate the arrow when the row is clicked
        c2.addEventListener('click', async () => {
            const c3 = document.getElementById(`contact-info-${contactId}`);
            c3.classList.toggle('hidden');
            arrow.classList.toggle('rotated');

            // Only populate the c3 content when it's expanded (optional)
            if (!c3.classList.contains('populated')) {
                const contact = contactList.find(contact => contact.id === contactId); // Find the correct contact
                const additionalInfo = getContactAdditionalInfo(contact); // Get additional info
                c3.innerHTML = additionalInfo; // Populate c3 with additional info
                c3.classList.add('populated'); // Mark this as populated to avoid overwriting
            }
        });

        // Prevent arrow functionality when "Edit" button is clicked
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggle when editing
            openEditModal(contactId); // Open modal to edit values
        });
    });
});

// Helper function to extract additional information from the contact
function getContactAdditionalInfo(contact) {
    let additionalInfoHTML = '<ul>';
    
    // Loop through the additional fields (adjust as necessary based on your data structure)
    Object.keys(contact).forEach(key => {
        if (key !== "id") { // Exclude the document ID from being displayed
            additionalInfoHTML += `<li><strong>${key}:</strong> ${contact[key]}</li>`;
        }
    });

    additionalInfoHTML += '</ul>';
    return additionalInfoHTML;
}

async function openEditModal(contactId) {
    // Fetch the contact details based on the contact ID
    const contact = await fetchContactById(contactId);
    console.log('Editing contact:', contact);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Create the modal
    const modal = document.createElement('div');
    modal.classList.add('edit-modal');

    let modalHTML = `
        <div class="modal-body">
            <div class="modal-header">
                <h2>Edit Contact</h2>
                <button class="close-btn">X</button>
            </div>
            <div id="fields-container">
    `;

    // Generate input fields for existing fields
    Object.keys(contact).forEach(key => {
        if (key !== "id") { 
            modalHTML += `
                <div class="field-group" id="field-${key}">
                    <label for="${key}">${key}:</label>
                    <input type="text" id="${key}" value="${contact[key]}" />
                    <button class="remove-field-btn" data-field-id="field-${key}">❌</button>
                </div>
            `;
        }
    });

    modalHTML += `
            </div>
               <div id="add-field-container" class="hidden">
                <select id="new-key-select">
                    <option value="" selected disabled>Select a new field</option>
                    <option value="contactPerson">Contact person</option>
                    <option value="contactPersonEmail">Contact person email</option>
                    <option value="contactPersonBackup">Contact person backup</option>
                    <option value="assignmentGroup">Assignment group</option>
                </select>
            </div>
            <button id="show-add-field-btn">Add New Field</button>
         
            <button class="save-btn">Save</button>
        </div>
    `;

    modal.innerHTML = modalHTML;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const fieldsContainer = modal.querySelector("#fields-container");
    const addFieldContainer = modal.querySelector("#add-field-container");
    const addFieldButton = modal.querySelector("#show-add-field-btn");

    // Show dropdown only when "Add New Field" is clicked
    addFieldButton.addEventListener("click", () => {
        addFieldContainer.classList.toggle("hidden");
    });

    // Handle new field selection
    const newKeySelect = modal.querySelector("#new-key-select");
    newKeySelect.addEventListener("change", () => {
        const selectedKey = newKeySelect.value;
        if (selectedKey) {
            const uniqueId = `${selectedKey}-${Date.now()}`;
            const newFieldHTML = `
                <div class="field-group" id="field-${uniqueId}">
                    <label for="${uniqueId}">${selectedKey}:</label>
                    <input type="text" id="${uniqueId}" />
                    <button class="remove-field-btn" data-field-id="field-${uniqueId}">❌</button>
                </div>
            `;
            fieldsContainer.insertAdjacentHTML("beforeend", newFieldHTML);
            newKeySelect.value = "";
            addFieldContainer.classList.add("hidden");
        }
    });

    // Remove field when ❌ is clicked
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-field-btn")) {
            const fieldId = e.target.getAttribute("data-field-id");
            document.getElementById(fieldId)?.remove();
        }
    });

    // Close modal and overlay
    function closeModal() {
        modal.remove();
        overlay.remove();
    }

    modal.querySelector('.close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Save functionality
    modal.querySelector('.save-btn').addEventListener('click', async () => {
        const updatedContact = { id: contact.id };
        fieldsContainer.querySelectorAll("input").forEach(input => {
            updatedContact[input.id] = input.value;
        });

        try {
            await updateContactInFirebase(updatedContact);
            console.log('Contact updated successfully:', updatedContact);
            closeModal();
            location.reload();
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    });
}





