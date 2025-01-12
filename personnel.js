document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the JSON data
        const response = await fetch('personnel.json');
        const data = await response.json();

        const table = document.getElementById('userTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Collect all keys except "moreInfo"
        const headers = Object.keys(data[0]).filter(key => key !== 'moreInfo');

        // Generate headers dynamically
        const headerRow = document.createElement('tr');
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;

            // Add sorting icon when hovering over headers
            const sortIcon = document.createElement('i');
            sortIcon.classList.add('fa-solid', 'fa-arrows-up-down', 'sort-icon');
            th.appendChild(sortIcon);

            // Add click event listener for sorting by column
            th.addEventListener('click', () => {
                sortTableByColumn(data, header, tbody, headers);
            });

            // Add event listeners for hover effect
            th.addEventListener('mouseenter', () => {
                sortIcon.style.display = 'inline'; // Show icon on hover
            });
            th.addEventListener('mouseleave', () => {
                sortIcon.style.display = 'none'; // Hide icon when not hovered
            });

            headerRow.appendChild(th);
        });

        // Initially add the "+" button to the last header
        const addButton = createAddColumnButton(data, table, thead, tbody, headers);
        const lastHeader = headerRow.querySelector('th:last-child');
        lastHeader.appendChild(addButton);

        thead.appendChild(headerRow);

        // Generate rows dynamically
        populateTable(data, headers, tbody);

    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
});

// Function to sort the table by column
function sortTableByColumn(data, header, tbody, headers) {
    const sortedData = [...data];

    // Sort by the column data (alphabetically)
    sortedData.sort((a, b) => {
        let valueA = getDataForSorting(a, header);
        let valueB = getDataForSorting(b, header);

        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
    });

    // Re-populate the table with the sorted data
    populateTable(sortedData, headers, tbody);
}

// Helper function to retrieve data for sorting, handling nested 'moreInfo'
function getDataForSorting(item, header) {
    // Check if the header belongs to 'moreInfo'
    if (item.moreInfo && item.moreInfo[0] && item.moreInfo[0][header]) {
        return item.moreInfo[0][header] || ''; // Return data from 'moreInfo'
    }

    return item[header] || ''; // Return regular column data
}

// Function to populate the table rows
function populateTable(data, headers, tbody) {
    tbody.innerHTML = ''; // Clear existing rows
    data.forEach(item => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');

            if (header === 'userIPN') {
                const userIDLink = document.createElement('a');
                userIDLink.href = '#';
                userIDLink.textContent = item[header];
                userIDLink.addEventListener('click', () => openUserModal(item));
                cell.appendChild(userIDLink);
            } else {
                const cellData = getDataForSorting(item, header); // Get data considering 'moreInfo'
                cell.textContent = cellData || 'N/A';
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

// Function to create the "+" button
function createAddColumnButton(data, table, thead, tbody, headers) {
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.classList.add('add-column-btn'); // Apply CSS class for button styling
    addButton.setAttribute('aria-label', 'Add a new column');
    addButton.addEventListener('click', () => openColumnModal(data, table, thead, tbody, headers));

    return addButton;
}

// Function to open the modal for adding a new column
function openColumnModal(data, table, thead, tbody, headers) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.backgroundColor = '#fff';
    modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    modal.style.zIndex = '1000';

    const modalContent = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'Add Column';
    modalContent.appendChild(title);

    const select = document.createElement('select');
    const moreInfoKeys = Object.keys(data[0].moreInfo[0]);
    moreInfoKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    });
    modalContent.appendChild(select);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Column';
    addButton.style.marginLeft = '10px';
    addButton.addEventListener('click', () => {
        const selectedKey = select.value;
        if (!headers.includes(selectedKey)) {
            headers.push(selectedKey);

            // Add new column header
            const th = document.createElement('th');
            th.textContent = selectedKey;

            // Add sorting functionality for the new column
            addSortingToNewColumn(th, selectedKey, data, tbody, headers);

            thead.querySelector('tr').appendChild(th);

            // Remove the existing "+" button and add it to the new column
            const existingButton = document.querySelector('.add-column-btn');
            if (existingButton) existingButton.remove(); // Remove the previous "+" button

            const lastHeader = thead.querySelector('tr').lastElementChild;
            const newAddButton = createAddColumnButton(data, table, thead, tbody, headers);
            lastHeader.appendChild(newAddButton);

            // Update table rows with the new column data
            populateTableWithNewColumn(data, tbody, headers, selectedKey);
        }

        // Close the modal
        document.body.removeChild(modal);
    });
    modalContent.appendChild(addButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.marginLeft = '10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    modalContent.appendChild(closeButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Function to add sorting functionality to newly added column
function addSortingToNewColumn(th, selectedKey, data, tbody, headers) {
    const sortIcon = document.createElement('i');
    sortIcon.classList.add('fa-solid', 'fa-arrows-up-down', 'sort-icon');
    th.appendChild(sortIcon);

    // Add sorting functionality for the new column
    th.addEventListener('click', () => {
        sortTableByColumn(data, selectedKey, tbody, headers);
    });

    // Add hover effect for the sort icon
    th.addEventListener('mouseenter', () => {
        sortIcon.style.display = 'inline'; // Show icon on hover
    });
    th.addEventListener('mouseleave', () => {
        sortIcon.style.display = 'none'; // Hide icon when not hovered
    });
}

// Function to populate the table rows with the new column data
function populateTableWithNewColumn(data, tbody, headers, newColumn) {
    tbody.querySelectorAll('tr').forEach((row, index) => {
        const cell = document.createElement('td');
        const moreInfo = data[index].moreInfo[0];
        cell.textContent = moreInfo[newColumn] || 'N/A';
        row.appendChild(cell);
    });
}

// Function to open the modal to show user data
function openUserModal(userData) {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('modalContent');

    // Create modal HTML content
    let modalHTML = `
    
    <div class="modal-buttons">
    
        <button id="editButton" class="edit-btn">Edit</button>
        <button id="saveButton" class="save-btn" style="display: none;">Save</button>
        <span class="close-btn">&times;</span>
    </div>
    <p><strong>User ID:</strong> <span id="userID">${userData.userIPN}</span></p>
    <p><strong>Name:</strong> <span id="userName">${userData.userFirstName} ${userData.userLastName}</span></p>
    <p><strong>Email:</strong> <span id="userEmail">${userData.userEmail}</span></p>
    <p><strong>Computer ID:</strong> <span id="computerID">${userData.computerID}</span></p>
    <p><strong>Dotation Check:</strong> <span id="dotationCheck">${userData.dotationCheck ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</span></p>
`;

    if (userData.moreInfo) {
        modalHTML += '<h3>More Information:</h3>';
        userData.moreInfo.forEach(info => {
            modalHTML += '<div>';
            for (const key in info) {
                if (key === 'materials') {
                    modalHTML += '<div class="materials">';
                    modalHTML += `
                    <label><i class="fa fa-phone"></i> Phone: <span id="phone">${info.materials[0].phone ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</span></label>
                    <label><i class="fa fa-plug"></i> Charger: <span id="charger">${info.materials[0].charger ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</span></label>
                    <label><i class="fa fa-key"></i> Token: <span id="token">${info.materials[0].token ? `<input type="checkbox" checked disabled>` : '<input type="checkbox" disabled>'}</span></label>
                    <label><i class="fa fa-headphones"></i> Headset: <span id="headset">${info.materials[0].headset ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</span></label>
                `;
                    modalHTML += '</div>';
                } else {
                    modalHTML += `<p><strong>${key}:</strong> <span id="${key}">${info[key]}</span></p>`;
                }
            }
            modalHTML += '</div>';
        });
    }


    // Add the Edit and Save buttons
    modalHTML += `<button id="saveButton" style="display: none;">Save</button>`;

    modalContent.innerHTML = modalHTML;
    modal.style.display = 'block';

    // Add event listener for the close button
    const closeButton = modal.querySelector('.close-btn');
    closeButton.addEventListener('click', () => closeModal(modal));

    // Add event listener for closing the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    // Edit button functionality
    const editButton = modal.querySelector('#editButton');
    const saveButton = modal.querySelector('#saveButton');

    editButton.addEventListener('click', () => {
        // Convert text to input fields for editing
        makeEditable(userData);
        // Show Save button, hide Edit button
        editButton.style.display = 'none';
        saveButton.style.display = 'inline';
    });

    // Save button functionality
    saveButton.addEventListener('click', () => {
        saveChanges(userData);
        // Re-convert input fields back to text with updated values
        revertToText(userData);
        // Keep the modal open after saving
    });
}

// Function to make fields editable
function makeEditable(userData) {
    // Convert span values into input fields for editing

    document.getElementById('userName').innerHTML = `
        <input type="text" value="${userData.userFirstName}" />
        <input type="text" value="${userData.userLastName}" />
    `;
    document.getElementById('userEmail').innerHTML = `<input type="email" value="${userData.userEmail}" />`;
    document.getElementById('computerID').innerHTML = `<input type="text" value="${userData.computerID}" />`;

    // Dotation Check becomes a checkbox input
    document.getElementById('dotationCheck').innerHTML = `<input type="checkbox" ${userData.dotationCheck ? 'checked' : ''} />`;

    // Update "More Information" fields (if any)
    if (userData.moreInfo) {
        userData.moreInfo.forEach(info => {
            for (const key in info) {
                if (key === 'materials') {
                    // Show checkboxes for materials
                    document.getElementById('phone').innerHTML = `<input type="checkbox" ${info.materials[0].phone ? 'checked' : ''} />`;
                    document.getElementById('charger').innerHTML = `<input type="checkbox" ${info.materials[0].charger ? 'checked' : ''} />`;
                    document.getElementById('token').innerHTML = `<input type="checkbox" ${info.materials[0].token ? 'checked' : ''} />`;
                    document.getElementById('headset').innerHTML = `<input type="checkbox" ${info.materials[0].headset ? 'checked' : ''} />`;
                } else {
                    document.getElementById(key).innerHTML = `<input type="text" value="${info[key]}" />`;
                }
            }
        });
    }
}

// Function to save the changes made in the modal
function saveChanges(userData) {
    // Retrieve edited values and update userData
    userData.userFirstName = document.querySelector('#userName input:nth-child(1)').value;
    userData.userLastName = document.querySelector('#userName input:nth-child(2)').value;
    userData.userEmail = document.querySelector('#userEmail input').value;
    userData.computerID = document.querySelector('#computerID input').value;
    userData.dotationCheck = document.querySelector('#dotationCheck input').checked;

    // Update "More Information" (if any)
    if (userData.moreInfo) {
        userData.moreInfo.forEach(info => {
            for (const key in info) {
                if (key === 'materials') {
                    info.materials[0].phone = document.getElementById('phone').querySelector('input').checked;
                    info.materials[0].charger = document.getElementById('charger').querySelector('input').checked;
                    info.materials[0].token = document.getElementById('token').querySelector('input').checked;
                    info.materials[0].headset = document.getElementById('headset').querySelector('input').checked;
                } else {
                    info[key] = document.getElementById(key).querySelector('input').value;
                }
            }
        });
    }

    // Send the updated data to the server
    fetch('http://localhost:3000/updateUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server if needed
            console.log('Data updated successfully', data);
            // Optionally, re-render the table or reload the data
            location.reload(); // Reload the page to get the updated JSON data
        })
        .catch(error => {
            console.error('Error updating data:', error);
        });
}


// Function to revert inputs back to text after saving
function revertToText(userData) {
    // Convert input fields back to text
    document.getElementById('userID').innerHTML = userData.userIPN;
    document.getElementById('userName').innerHTML = `${userData.userFirstName} ${userData.userLastName}`;
    document.getElementById('userEmail').innerHTML = userData.userEmail;
    document.getElementById('computerID').innerHTML = userData.computerID;

    // For the dotation check, show a checkbox (disabled) with checked or unchecked
    document.getElementById('dotationCheck').innerHTML = `
        <input type="checkbox" disabled ${userData.dotationCheck ? 'checked' : ''}>
    `;

    // Update "More Information" fields (if any)
    if (userData.moreInfo) {
        userData.moreInfo.forEach(info => {
            for (const key in info) {
                if (key === 'materials') {
                    document.getElementById('phone').innerHTML = `
                        <input type="checkbox" disabled ${info.materials[0].phone ? 'checked' : ''}>
                    `;
                    document.getElementById('charger').innerHTML = `
                        <input type="checkbox" disabled ${info.materials[0].charger ? 'checked' : ''}>
                    `;
                    document.getElementById('token').innerHTML = `
                        <input type="checkbox" disabled ${info.materials[0].token ? 'checked' : ''}>
                    `;
                    document.getElementById('headset').innerHTML = `
                        <input type="checkbox" disabled ${info.materials[0].headset ? 'checked' : ''}>
                    `;
                } else {
                    document.getElementById(key).innerHTML = info[key];
                }
            }
        });
    }

    // Hide Save button, show Edit button again
    const editButton = document.querySelector('#editButton');
    const saveButton = document.querySelector('#saveButton');
    editButton.style.display = 'inline';
    saveButton.style.display = 'none';
}


// Function to close the modal
function closeModal(modal) {
    modal.style.display = 'none';
    // Don't clear the modal content so it can be reused
}