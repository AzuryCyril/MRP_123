import { fetchPersonnel } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
    await fetchTable();
});

// Store added columns so they persist after updates
let addedColumns = [];

async function fetchTable() {
    try {
        // Fetch data from Firebase
        const data = await fetchPersonnel();
        if (!data || data.length === 0) return;

        const table = document.getElementById("userTable");
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        // Reset table content
        thead.innerHTML = "";
        tbody.innerHTML = "";

        // Default headers (excluding 'moreInfo')
        let headers = ["userIPN", "userFirstName", "userLastName", "userEmail", "computerID", "dotationCheck"];

        // Append any previously added columns
        headers = [...headers, ...addedColumns];

        // Generate table headers
        const headerRow = document.createElement("tr");
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;

            // Add sorting functionality
            const sortIcon = document.createElement("i");
            sortIcon.classList.add("fa-solid", "fa-arrows-up-down", "sort-icon");
            th.appendChild(sortIcon);

            th.addEventListener("click", () => sortTableByColumn(data, header, tbody, headers));

            headerRow.appendChild(th);
        });

        // Add "+" button to the last header
        const addButton = createAddColumnButton(data);
        headerRow.lastElementChild.appendChild(addButton);

        thead.appendChild(headerRow);

        // Populate table rows
        populateTable(data, headers, tbody);

    } catch (error) {
        console.error("Error fetching personnel data:", error);
    }
}

function populateTable(data, headers, tbody) {
    data.forEach(userData => {
        const row = document.createElement('tr');

        headers.forEach(header => {
            const cell = document.createElement('td');

            // Special case for UserIPN to make it clickable
            if (header === "userIPN") {
                const link = document.createElement('a');
                link.textContent = userData[header] || 'N/A';
                link.href = '#';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    openUserInfoModal(userData);  // Open the modal with full user info
                });
                cell.appendChild(link);
            } else if (header === "dotationCheck") {
                // Handle checkbox for "dotationCheck"
                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.checked = userData[header] || false;
                checkbox.disabled = true;  // Make it read-only in table
                cell.appendChild(checkbox);
            } else {
                // Check if the header exists in the userData or inside moreInfo
                if (header in userData) {
                    cell.textContent = userData[header] || 'N/A';
                } else if (userData.moreInfo && userData.moreInfo[header] !== undefined) {
                    cell.textContent = userData.moreInfo[header] || 'N/A';
                } else {
                    cell.textContent = 'N/A'; // Default to 'N/A' if no data exists
                }
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


import { updateUserInFirebase } from "./database.js"; // Import Firebase function

function openUserInfoModal(userData) {
    const modal = document.createElement('div');
    modal.classList.add("user-info-modal-overlay");

    const modalContent = document.createElement('div');
    modalContent.classList.add("user-info-modal-content");

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = "Close";
    closeButton.classList.add("user-info-modal-close");
    closeButton.addEventListener("click", () => {
        modal.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(modal), 300);
    });

    // Edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("user-info-modal-edit");

    // Save button (hidden initially)
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("user-info-modal-save");
    saveButton.style.display = "none";

    // Container for user information
    const userInfo = document.createElement('div');
    userInfo.classList.add('user-info');

    // Define order of fields
    const fieldOrder = ["userIPN", "userFirstName", "userLastName", "userEmail", "computerID", "dotationCheck"];

    // Store input fields for reference when saving
    const inputFields = {};

    fieldOrder.forEach(key => {
        const fieldContainer = document.createElement('div');
        fieldContainer.classList.add("user-info-field");
    
        const label = document.createElement('label');
        label.textContent = `${key}:`;
    
        if (key === "userIPN") {
            // Display UserIPN as non-editable text
            const textSpan = document.createElement('span');
            textSpan.textContent = userData[key] || "N/A";
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(textSpan);
        } else if (key === "dotationCheck") {
            // For dotationCheck, create a checkbox
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = userData[key] || false;
            checkbox.disabled = true;  // Optionally, make it non-editable initially
            inputFields[key] = checkbox;
    
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(checkbox);
        } else {
            // Editable fields
            const input = document.createElement('input');
            input.type = "text";
            input.value = userData[key] || "";
            input.disabled = true;
            inputFields[key] = input;
    
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
        }
    
        userInfo.appendChild(fieldContainer);
    });

    // Handle "moreInfo" fields
    if (userData.moreInfo && typeof userData.moreInfo === 'object') {
        const moreInfoSection = document.createElement('div');
        moreInfoSection.classList.add('more-info');

        const moreInfoOrder = ["Entité", "Localisation", "Direction", "Status", "Sociétés", "Manager", "PhoneNumber", "materials"];
        
        moreInfoOrder.forEach(moreInfoKey => {
            const fieldContainer = document.createElement('div');
            fieldContainer.classList.add("user-info-field");

            const label = document.createElement('label');
            label.textContent = `${moreInfoKey}:`;

            if (moreInfoKey === "materials") {
                // Handle checkboxes for materials
                const materialsContainer = document.createElement('div');
                materialsContainer.classList.add("materials-container");

                const icons = {
                    "phone": "📱",
                    "charger": "🔌",
                    "token": "🔑",
                    "headset": "🎧"
                };

                userData.moreInfo.materials && Object.keys(icons).forEach(material => {
                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.innerHTML = `${icons[material]} `;

                    const checkbox = document.createElement('input');
                    checkbox.type = "checkbox";
                    checkbox.checked = userData.moreInfo.materials[material] || false;
                    checkbox.disabled = true;

                    checkboxLabel.appendChild(checkbox);
                    materialsContainer.appendChild(checkboxLabel);
                    
                    inputFields[moreInfoKey] = inputFields[moreInfoKey] || {};
                    inputFields[moreInfoKey][material] = checkbox;
                });

                fieldContainer.appendChild(label);
                fieldContainer.appendChild(materialsContainer);
            } else {
                const input = document.createElement('input');
                input.type = "text";
                input.value = userData.moreInfo[moreInfoKey] || "";
                input.disabled = true;
                inputFields[moreInfoKey] = input;

                fieldContainer.appendChild(label);
                fieldContainer.appendChild(input);
            }

            moreInfoSection.appendChild(fieldContainer);
        });

        userInfo.appendChild(moreInfoSection);
    }

    // Enable editing (except for UserIPN)
    editButton.addEventListener("click", () => {
        Object.keys(inputFields).forEach(key => {
            if (typeof inputFields[key] === 'object' && !inputFields[key].type) {
                Object.values(inputFields[key]).forEach(subField => subField.disabled = false);
            } else {
                inputFields[key].disabled = false;
            }
        });
        editButton.style.display = "none";
        saveButton.style.display = "inline-block";
    });

    saveButton.addEventListener("click", async () => {
        const updatedUserData = { moreInfo: {} };
    
        // Loop through each input field to collect updated values
        Object.keys(inputFields).forEach(key => {
            if (key === "userIPN") {
                // UserIPN should not be editable, so skip updating it
                return;
            }
            
            if (userData.hasOwnProperty(key)) {
                // If it's a direct user field (not in "moreInfo"), update it directly
                updatedUserData[key] = inputFields[key].value;
            } else if (userData.moreInfo && userData.moreInfo.hasOwnProperty(key)) {
                // If it's a "moreInfo" field, update it under moreInfo
                updatedUserData.moreInfo[key] = inputFields[key].value;
            }
        });
    
        // Handle "dotationCheck" checkbox separately (if it's in the modal)
        if (inputFields["dotationCheck"]) {
            updatedUserData["dotationCheck"] = inputFields["dotationCheck"].checked;
        }
    
        // Handle "materials" checkbox separately
        updatedUserData.moreInfo.materials = {};
        if (inputFields["materials"]) {
            Object.keys(inputFields["materials"]).forEach(materialKey => {
                updatedUserData.moreInfo.materials[materialKey] = inputFields["materials"][materialKey].checked;
            });
        }
    
        console.log("Final Updated Data:", updatedUserData);
    
        try {
            // Update the user in Firebase
            await updateUserInFirebase(userData.userIPN, updatedUserData);
            console.log("User data successfully updated in Firebase!");
    
            // After successful save, refresh the table to reflect changes
            fetchTable();
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    
        // Disable fields again after saving
        Object.values(inputFields).forEach(field => {
            if (typeof field === 'object' && !field.type) {
                Object.values(field).forEach(subField => subField.disabled = true);
            } else {
                field.disabled = true;
            }
        });
    
        // Hide save button and show edit button again
        editButton.style.display = "inline-block";
        saveButton.style.display = "none";
    });

    // Append elements
    modalContent.appendChild(closeButton);
    modalContent.appendChild(editButton);
    modalContent.appendChild(saveButton);
    modalContent.appendChild(userInfo);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add("fade-in"), 0);
}




function createAddColumnButton(data, table, thead, tbody, headers) {
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.classList.add('add-column-btn');
    addButton.setAttribute('aria-label', 'Add a new column');

    // Prevent the click from triggering the sorting function
    addButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Stops event from reaching the <th>
        addButton.disabled = true;  // Disable the "+" button when modal opens
        openColumnModal(data, table, thead, tbody, headers, addButton);
    });

    return addButton;
}

// Open modal for adding a new column
function openColumnModal(data) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const title = document.createElement("h3");
    title.textContent = "Add Column";
    modalContent.appendChild(title);

    const select = document.createElement("select");
    const moreInfoKeys = Object.keys(data[0].moreInfo || {});

    moreInfoKeys.forEach(key => {
        if (!addedColumns.includes(key)) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            select.appendChild(option);
        }
    });

    modalContent.appendChild(select);

    const addButton = document.createElement("button");
    addButton.textContent = "Add Column";
    addButton.addEventListener("click", () => {
        const selectedKey = select.value;
        if (selectedKey && !addedColumns.includes(selectedKey)) {
            addedColumns.push(selectedKey);
            fetchTable(); // Refresh table with new column
        }
        closeModal(modal);
    });

    const closeButton = document.createElement("button");
    closeButton.textContent = "Cancel";
    closeButton.addEventListener("click", () => {
        closeModal(modal);
    });

    modalContent.appendChild(addButton);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Trigger the show class to animate the modal
    setTimeout(() => {
        modal.classList.add("show");
    }, 10); // Give a slight delay to trigger the transition
}

// Function to close the modal and re-enable the "+" button
function closeModal(modal) {
    document.body.removeChild(modal);
    document.querySelector(".add-column-btn").disabled = false;
}

// Sorting function with toggle
function sortTableByColumn(data, column, tbody, headers) {
    let ascending = !sortTableByColumn.asc || sortTableByColumn.lastColumn !== column;
    sortTableByColumn.asc = ascending;
    sortTableByColumn.lastColumn = column;

    data.sort((a, b) => {
        let valA = a[column] ?? a.moreInfo?.[column] ?? "";
        let valB = b[column] ?? b.moreInfo?.[column] ?? "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        return ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    tbody.innerHTML = "";
    populateTable(data, headers, tbody);
}
