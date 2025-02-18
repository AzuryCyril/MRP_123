"use strict";
import { fetchContactList, updateContactInFirebase, fetchContactById } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
    const contactContainer = document.getElementById("contactList");
    const searchBar = document.getElementById("contactSearch");

    // Fetch contact list from Firebase
    const contactList = await fetchContactList();

    // Function to render contacts
    function renderContacts(filteredContacts) {
        contactContainer.innerHTML = ""; // Clear previous contacts
        filteredContacts.forEach(contact => {
            let contactHTML = `
                <article class='c1' data-id="${contact.id}">
                    <div class='c2'>
                        <div class='c2Title'>
                            <input type="checkbox" class="delete-checkbox" data-id="${contact.id}" />
                            <h1>${contact.id}</h1>
                        </div>
                        <div class="action-buttons">
                            <button class="edit-btn" data-id="${contact.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="arrowButton"><i class="arrow fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                    <div class='c3' id="contact-info-${contact.id}">
                        <!-- Additional info will go here -->
                    </div>
                </article>
            `;
            contactContainer.insertAdjacentHTML("beforeend", contactHTML);
        });

        attachEventListeners();
    }

    // Attach event listeners to the rendered contacts
    function attachEventListeners() {
        const c2Elements = contactContainer.querySelectorAll('.c2');
        c2Elements.forEach((c2) => {
            const arrow = c2.querySelector('.arrow');
            const editButton = c2.querySelector('.edit-btn');
            const contactId = c2.querySelector('h1').textContent;

            c2.addEventListener('click', async () => {
                const c3 = document.getElementById(`contact-info-${contactId}`);
                c3.classList.toggle('active');
                arrow.classList.toggle('rotated');

                if (!c3.classList.contains('populated')) {
                    const contact = contactList.find(contact => contact.id === contactId);
                    const additionalInfo = getContactAdditionalInfo(contact);
                    c3.innerHTML = additionalInfo;
                    c3.classList.add('populated');
                }
            });

            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(contactId);
            });
        });
    }

    // Initial render
    renderContacts(contactList);

    // Search functionality
    searchBar.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        const filteredContacts = contactList.filter(contact => contact.id.toLowerCase().includes(query));
        renderContacts(filteredContacts);
    });
});

// Helper function to extract additional information from the contact
function getContactAdditionalInfo(contact) {
    let additionalInfoHTML = '<ul>';

    // Define the order of fields
    const fieldOrder = ['contactPerson', 'contactPersonEmail', 'contactPersonBackup', 'assignmentGroup', 'urlLink'];


    fieldOrder.forEach(order =>{
        Object.keys(contact).forEach(key => {
        let trimmedKey = key.replace(/-\d+$/, "");
        // Skip fields that have already been displayed in the fieldOrder
        
        
        if (order.includes(trimmedKey) && key !== "id" && trimmedKey !== "urlLink") {
            let fieldLabel = formatFieldLabel(key); // Trim field name
            additionalInfoHTML += `<li><strong>${fieldLabel}:</strong> ${contact[key]}</li>`;
        }else if (order.includes(trimmedKey) && trimmedKey == "urlLink"){
            let fieldLabel = formatFieldLabel(key); // Trim field name
            additionalInfoHTML += `<li><strong>${fieldLabel}:</strong> <a href="${contact[key]}">${contact[key]}</a></li>`;
        }
    });
    });

    additionalInfoHTML += '</ul>';
    return additionalInfoHTML;
}

// Helper function to format field labels for display
function formatFieldLabel(key) {
    // Remove the numbering like "-1", "-2", etc.
    const baseKey = key.replace(/-\d+$/, "");
    // Converts camelCase to readable format
    return baseKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}


async function openEditModal(contactId) {
    const contact = await fetchContactById(contactId);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Create modal
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

    // Order the fields
    const fieldOrder = ['contactPerson', 'contactPersonEmail', 'contactPersonBackup', 'assignmentGroup', 'urlLink'];

    // Track the highest number used for each field type and store already used fields
    let fieldCounts = {};
    let existingFields = new Set();

    // **Validate URL function**
    function isValidURL(url) {
        const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;
        return urlPattern.test(url);
    }

    // Extract existing field names and determine numbering
    fieldOrder.forEach((order) => {
     
        Object.keys(contact).forEach((fieldKey) => {
           
            let trimmedKey = fieldKey.replace(/-\d+$/, "");
            if (order.includes(trimmedKey) && fieldKey !== "id") {
                existingFields.add(fieldKey); // Mark this field as already processed
                    const baseKey = fieldKey.replace(/-\d+$/, ""); // Remove existing numbering
                    fieldCounts[baseKey] = (fieldCounts[baseKey] || 0) + 1;
                    const fieldNumber = fieldCounts[baseKey];
                    console.log(fieldNumber)
                    // Check if it's a URL field and validate immediately
                    const isURLField = baseKey === "urlLink";
                    const invalidClass = isURLField && contact[fieldKey] && !isValidURL(contact[fieldKey]) ? "invalid-url" : "";
    
                    modalHTML += `
                        <div class="field-group" id="field-${fieldKey}">
                            <label for="${fieldKey}">${baseKey} ${fieldNumber}:</label>
                            <input type="text" id="${fieldKey}" value="${contact[fieldKey]}" class="${isURLField ? 'url-input' : ''} ${invalidClass}" />
                            <button class="remove-field-btn" data-field-id="field-${fieldKey}">❌</button>
                        </div>
                    `;
            }
        });
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
                    <option value="urlLink">URL Link</option> <!-- New option -->
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
            fieldCounts[selectedKey] = (fieldCounts[selectedKey] || 0) + 1;
            const fieldNumber = fieldCounts[selectedKey];

            const newFieldHTML = `
                <div class="field-group" id="field-${selectedKey}-${fieldNumber}">
                    <label for="${selectedKey}-${fieldNumber}">${selectedKey} ${fieldNumber}:</label>
                    <input type="text" id="${selectedKey}-${fieldNumber}" class="${selectedKey === 'urlLink' ? 'url-input' : ''}" />
                    <button class="remove-field-btn" data-field-id="field-${selectedKey}-${fieldNumber}">❌</button>
                </div>
            `;
            fieldsContainer.insertAdjacentHTML("beforeend", newFieldHTML);
            newKeySelect.value = ""; // Reset dropdown
            addFieldContainer.classList.add("hidden"); // Hide dropdown after adding a field
        }
    });

    // **Real-time URL validation**
    modal.addEventListener("input", (e) => {
        if (e.target.classList.contains("url-input")) {
            if (!isValidURL(e.target.value)) {
                e.target.classList.add("invalid-url");
            } else {
                e.target.classList.remove("invalid-url");
            }
        }
    });

    // Remove field when ❌ is clicked
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-field-btn")) {
            const fieldId = e.target.getAttribute("data-field-id");
            document.getElementById(fieldId)?.remove();
            existingFields.delete(fieldId); // Remove from existing fields set when removed
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
    let hasInvalidURL = false;
    let hasEmptyField = false;

    fieldsContainer.querySelectorAll("input").forEach(input => {
        const value = input.value.trim();

        // Check for empty fields
        if (value === "") {
            hasEmptyField = true;
            input.classList.add("empty-field"); // Add a red border for visibility
        } else {
            input.classList.remove("empty-field");
        }

        // Validate URL fields
        if (input.classList.contains("url-input") && value !== "") {
            if (!isValidURL(value)) {
                hasInvalidURL = true;
                input.classList.add("invalid-url");
            } else {
                input.classList.remove("invalid-url");
            }
        }

        updatedContact[input.id] = value;
    });

    if (hasEmptyField) {
        alert("All fields must be filled before saving.");
        return;
    }

    if (hasInvalidURL) {
        alert("Please enter a valid URL before saving.");
        return;
    }

    try {
        await updateContactInFirebase(updatedContact);
        console.log('Contact updated successfully:', updatedContact);
        closeModal();
      
    } catch (error) {
        console.error('Error updating contact:', error);
    }
});

}





