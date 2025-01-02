document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the JSON data
        const response = await fetch('stock.json');
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
    let modalHTML = `
        <span class="close-btn">&times;</span>
        <p><strong>User ID:</strong> ${userData.userIPN}</p>
        <p><strong>Name:</strong> ${userData.userFirstName} ${userData.userLastName}</p>
        <p><strong>Email:</strong> ${userData.userEmail}</p>
        <p><strong>Computer ID:</strong> ${userData.computerID}</p>
        <p><strong>Dotation Check:</strong> ${userData.dotationCheck ? 'Yes' : 'No'}</p>
    `;
    if (userData.moreInfo) {
        modalHTML += '<h3>More Information:</h3>';
        userData.moreInfo.forEach(info => {
            modalHTML += '<div>';
            for (const key in info) {
                if (key === 'materials') {
                    modalHTML += '<div class="materials">';
                    modalHTML += `
                        <label><i class="fa fa-phone"></i> Phone: <input type="checkbox" ${info.materials[0].phone ? 'checked' : ''} disabled /></label>
                        <label><i class="fa fa-plug"></i> Charger: <input type="checkbox" ${info.materials[0].charger ? 'checked' : ''} disabled /></label>
                        <label><i class="fa fa-key"></i> Token: <input type="checkbox" ${info.materials[0].token ? 'checked' : ''} disabled /></label>
                        <label><i class="fa fa-headphones"></i> Headset: <input type="checkbox" ${info.materials[0].headset ? 'checked' : ''} disabled /></label>
                    `;
                    modalHTML += '</div>';
                } else {
                    modalHTML += `<p><strong>${key}:</strong> ${info[key]}</p>`;
                }
            }
            modalHTML += '</div>';
        });
    }
    modalContent.innerHTML = modalHTML;
    modal.style.display = 'block';
}
