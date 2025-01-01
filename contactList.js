"use strict";

let RenaultSupport = {
    contacts: [], // Internal storage for contacts

    initfield() {
        this.getContactList(); // Initialize by fetching contact data
    },

    // Fetch data from the server
    async getDATA() {
        let response = await fetch('http://localhost:3000/data');
        return await response.json();
    },

    // Fetch the contact list and display it
    async getContactList() {
        this.contacts = await this.getDATA(); // Store contacts in the array
        console.log("Fetched contacts:", this.contacts); // For testing
    
        let contactSection = document.getElementById("contactList");
        contactSection.innerHTML = ""; // Clear the existing list before rendering
    
        // Add the search bar, "Add New Contact", and "Delete" buttons at the top of the list
        const buttonsHTML = `
            <div id="contactButtons">
                <input type="text" id="searchBar" placeholder="Search contacts..." />
                <div>
                <button id="addContactBtn"><i class="fa-solid fa-arrow-down"></i> Add</button>
                <button id="deleteSelectedBtn"><i class="fa-solid fa-trash-can"></i> Delete</button>
                </div>
            </div>
        `;
        contactSection.insertAdjacentHTML("afterbegin", buttonsHTML);
    
        // Add event listener for the "Add New Contact" button
        document.getElementById('addContactBtn').addEventListener('click', () => {
            this.addNewContactForm(); // Call function to add new contact form
        });
    
        // Add event listener for the "Delete Selected Contacts" button
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.deleteSelectedContacts(); // Call function to delete selected contacts
        });
    
        // Add event listener for the search bar to filter contacts
        document.getElementById('searchBar').addEventListener('input', (e) => {
            this.filterContacts(e.target.value); // Call function to filter contacts based on search query
        });
    
        // Initially display all contacts
        this.displayContacts(this.contacts);
    },
    
// Function to filter contacts based on the search query
filterContacts(query) {
    // Convert query to lowercase for case-insensitive comparison
    const filteredContacts = this.contacts.filter(contact => 
        contact.title.toLowerCase().includes(query.toLowerCase())
    );

    // Display the filtered contacts
    this.displayContacts(filteredContacts);
},

  // Function to display contacts
// Function to display contacts
displayContacts(contactsToDisplay) {
    const contactSection = document.getElementById("contactList");

    // Clear the existing contact list
    contactSection.querySelectorAll('.c1').forEach(contact => contact.remove());

    // Loop through each contact and create HTML
    contactsToDisplay.forEach((contact, index) => {
        let contactHTML = `
            <article class='c1' data-id="${contact.title}">
                <div class='c2'>
                <div class='c2Title'>
                    <input type="checkbox" class="delete-checkbox" data-id="${contact.title}" />
                    <h1>${contact.title}</h1>
                </div>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${contact.title}"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="arrowButton"><i class=" arrow fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
                <div class='c3 hidden'>
        `;

        const sortedContactInfo = contact.contact.sort((a, b) => {
            if (a.Link) return 1;
            if (b.Link) return -1;
            return 0; // Otherwise, keep the original order
        });

        // Loop through each key in the sorted contact info
        sortedContactInfo.forEach(item => {
            for (let key in item) {
                let value = item[key];
                // If the key is 'Link', make the value a clickable link
                if (key === "Link" && value) {
                    value = `<a href="${value}" target="_blank">${value}</a>`;
                }

                // Append each field to the contactHTML
                contactHTML += `
                    <p class="editable-text" data-key="${key}">
                        <strong>${key}:</strong> ${value}
                    </p>
                `;
            }
        });

        contactHTML += `</div></article>`;
        contactSection.insertAdjacentHTML("beforeend", contactHTML);
    });

    // Set up edit button actions and arrow toggle
    const c2Elements = contactSection.querySelectorAll('.c2');
    c2Elements.forEach((c2, index) => {
        const arrow = c2.querySelector('.arrow');
        const editButton = c2.querySelector('.edit-btn');

        // Toggle the visibility of c3 and rotate the arrow
        c2.addEventListener('click', () => {
            const c3 = contactSection.querySelectorAll('.c3')[index];
            c3.classList.toggle('active');
            arrow.classList.toggle('rotated');
        });

        // Prevent arrow functionality when "Edit" button is clicked
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggle when editing
            const contactTitle = editButton.dataset.id;
            this.openEditModal(contactTitle); // Open modal to edit values
        });
    });
},

    async deleteSelectedContacts() {
        // Get all checked checkboxes
        const checkboxes = document.querySelectorAll('.delete-checkbox:checked');
        
        // If no checkboxes are selected, show an alert
        if (checkboxes.length === 0) {
            alert("Please select at least one contact to delete.");
            return;
        }
    
        // Create an array to hold the titles of the selected contacts to delete
        const contactsToDelete = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
    
        // Filter out the contacts that are checked from the `contacts` array
        this.contacts = this.contacts.filter(contact => !contactsToDelete.includes(contact.title));
    
        // Send updated data to the server
        try {
            const response = await fetch('http://localhost:3000/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.contacts),
            });
    
            if (response.ok) {
                console.log("Selected contacts deleted successfully.");
                this.getContactList(); // Re-render the contact list
            } else {
                console.error("Failed to delete contacts.");
            }
        } catch (error) {
            console.error("Error while deleting contacts:", error);
        }
    },
    
    

    addNewContactForm() {
        // Get the contact list section where the new contact form will appear
        const contactSection = document.getElementById("contactList");
    
        // Create a new contact form HTML
        const newContactFormHTML = `
            <article class='c1 new-contact'>
                <div class='c2'>
                    <h1>
                        <input type="text" id="newContactTitle" placeholder="Enter contact title" required />
                    </h1>
                    <div class="action-buttons">
                        <button id="saveNewContactBtn"><i class="fa-solid fa-check"></i></button>
                        <button id="cancelNewContactBtn"><i class="fa-solid fa-times"></i></button>
                    </div>
                </div>
            </article>
        `;
    
        // Insert the new contact form at the bottom of the contact list
        contactSection.insertAdjacentHTML("beforeend", newContactFormHTML);
    
        // Add event listeners to handle save and cancel
        document.getElementById('saveNewContactBtn').addEventListener('click', () => {
            this.saveNewContact();
        });
    
        document.getElementById('cancelNewContactBtn').addEventListener('click', () => {
            this.cancelNewContact();
        });
    },

    async saveNewContact() {
        const titleInput = document.getElementById("newContactTitle");
        const contactSection = document.getElementById("contactList");
    
        // Validate input
        if (!titleInput.value.trim()) {
            alert("Please enter a contact title.");
            return;
        }
    
        const newContact = {
            title: titleInput.value,
            contact: []
        };
    
        // Get the new contact information from the form fields
        const fields = contactSection.querySelectorAll(".editable-field");
        fields.forEach(field => {
            const select = field.querySelector('select');
            const input = field.querySelector('input');
            const key = select ? select.value : field.dataset.key;
            const value = input ? input.value : '';
    
            if (key && value) {
                newContact.contact.push({ [key]: value });
            }
        });
    
        // Add the new contact to the contacts array
        this.contacts.push(newContact);
    
        // Send updated data to the server
        try {
            const response = await fetch('http://localhost:3000/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.contacts),
            });
    
            if (response.ok) {
                console.log("New contact added successfully.");
                this.getContactList(); // Re-render the contact list
            } else {
                console.error("Failed to update contacts.");
            }
        } catch (error) {
            console.error("Error while updating contacts:", error);
        }
    },
    
    cancelNewContact() {
        const contactSection = document.getElementById("contactList");
        const newContactForm = contactSection.querySelector(".new-contact");
        if (newContactForm) {
            newContactForm.remove();
        }
    },
    


    // Open the edit modal and populate it with the contact's data
    openEditModal(contactTitle) {
        const modal = document.getElementById("editModal");
        const modalContent = document.getElementById("modalContent");
        modalContent.innerHTML = ""; // Clear previous content in the modal

        // Find the contact to edit
        const contact = this.contacts.find(c => c.title === contactTitle);
        if (!contact) {
            console.error("Contact not found");
            return;
        }

        // Populate the modal with existing keys and values
        contact.contact.forEach(item => {
            for (let key in item) {
                modalContent.innerHTML += `
                    <div class="editable-field" data-key="${key}">
                        <label for="${key}">${key}</label>
                        <div class="input-container">
                            <input type="text" id="${key}" name="${key}" value="${item[key]}" />
                            <button type="button" class="remove-btn">✖</button>
                        </div>
                    </div>
                `;
            }
        });

        // Add "Add New Key" button to modal
        modalContent.innerHTML += `
            <button type="button" id="addNewKeyBtn">Add New Key</button>
        `;

        // Add "Save Changes" button
        modalContent.innerHTML += `<button type="button" id="saveChangesBtn">Save Changes</button>`;
        modal.style.display = "block"; // Show the modal

        // Add event listeners for adding a new key and saving changes
        document.getElementById("addNewKeyBtn").addEventListener('click', () => {
            this.addNewKeyField(modalContent); // Call function to add a new key-value input
        });

        document.getElementById("saveChangesBtn").addEventListener('click', () => {
            this.saveModalChanges(contactTitle);
        });

        // Add remove button functionality
        this.addRemoveButtonListeners(modalContent);
    },


    // Function to add a new key-value field in the modal (with a dropdown for the key)
    addNewKeyField(modalContent) {
        const newFieldHTML = document.createElement('div');
        newFieldHTML.classList.add('editable-field'); // Ensuring it's in the same class
        newFieldHTML.dataset.key = "new-key";

        newFieldHTML.innerHTML = `
            <select id="new-key" name="new-key">
                <option value="Link">Link</option>
                <option value="Contact person">Contact person</option>
                <option value="Contact person email">Contact person email</option>
                <option value="Contact person backup">Contact person backup</option>
                <option value="Assignment group">Assignment group</option>
            </select>
            <div class="input-container">
                <input type="text" id="new-value" name="new-value" placeholder="Enter value" />
                <button type="button" class="remove-btn">✖</button>
            </div>
        `;

        // Add event listener for the dropdown change
        newFieldHTML.querySelector('select').addEventListener('change', (e) => {
            const selectedKey = e.target.value;
            const inputContainer = newFieldHTML.querySelector('.input-container');
            inputContainer.innerHTML = ''; // Clear current input


            // Render normal input field
            inputContainer.innerHTML = `
                    <input type="text" id="new-value" name="new-value" placeholder="Enter value" />
                    <button type="button" class="remove-btn">✖</button>
                `;

        });

        // Find the "Save Changes" button
        const saveButton = modalContent.querySelector('#saveChangesBtn');
        if (saveButton) {
            // Insert the new field just before the "Save Changes" button
            saveButton.parentNode.insertBefore(newFieldHTML, saveButton);
        }
    },

    // Save the changes made in the modal
    // Save the changes made in the modal
    // Save the changes made in the modal
    async saveModalChanges(contactTitle) {
        const modalContent = document.getElementById("modalContent");
        const fields = modalContent.querySelectorAll(".editable-field");
    
        // Find the contact to update
        const contact = this.contacts.find(c => c.title === contactTitle);
        if (!contact) {
            console.error("Contact not found");
            return;
        }
    
        // Update the contact array with new values
        contact.contact = []; // Clear the old contact data
        let validLink = true; // Flag to track link validation
    
        fields.forEach(field => {
            const select = field.querySelector('select');
            const input = field.querySelector('input');
            const key = select ? select.value : field.dataset.key; // Get key from dropdown or dataset
            let value = input ? input.value : '';
    
            if (key === "Link" && value) {
                // Validate the URL format
                const isValidURL = /^https?:\/\//.test(value);
                if (!isValidURL) {
                    validLink = false; // Mark as invalid if URL is not valid
                }
            }
    
            if (key && value) {
                contact.contact.push({
                    [key]: value
                }); // Add updated key-value pair
            }
        });
    
        // If link is invalid, show a prompt and don't save
        if (!validLink) {
            alert("Please provide a valid URL for the 'Link' field (e.g., http:// or https://).");
            return; // Prevent saving changes
        }
    
        // Send updated data to the server
        try {
            const response = await fetch('http://localhost:3000/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.contacts), // Send the updated contacts array
            });
    
            if (response.ok) {
                console.log("Data successfully updated on the server.");
                this.closeModal(); // Close the modal after saving the changes
            } else {
                console.error("Failed to update data on the server.");
            }
        } catch (error) {
            console.error("Error while updating data on the server:", error);
        }
    },
    
    // Function to close the modal
    closeModal() {
        const modal = document.getElementById("editModal");
        modal.style.display = "none"; // Hide the modal
        document.getElementById("modalContent").innerHTML = ""; // Clear the modal content
    },
    


    // Add remove button functionality
    addRemoveButtonListeners(modalContent) {
        modalContent.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('remove-btn')) {
                const parentField = e.target.closest('.editable-field');
                if (parentField) {
                    parentField.remove(); // Remove the field from modal
                }
            }
        });
    }
};

RenaultSupport.initfield();