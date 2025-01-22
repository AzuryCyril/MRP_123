document.addEventListener('DOMContentLoaded', () => {
    // Load data for each category when the page loads
    fetchData('PC', 'stockPC.json');
    fetchData('Mobile', 'stockMobile.json');
    fetchData('Home', 'stockHome.json');

    // Show the PC tab by default when the page loads
    document.getElementById('PC').style.display = 'block';
    document.querySelector('.tablink').classList.add('active');
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(content => {
        if (content.id !== 'PC') {
            content.style.display = 'none';
        }
    });

    const infoSelect = document.getElementById('infoSelect');
    const dateField = document.getElementById('dateField');
    const dateLabel = document.getElementById('dateLabel');
    const datePicker = document.getElementById('datePicker');

    // Add event listener to the "Info" select field
    infoSelect.addEventListener('change', () => {
        const selectedValue = infoSelect.value;

        if (selectedValue === 'start') {
            dateLabel.textContent = 'Starting on:';
            dateField.style.display = 'block'; // Show the date field
        } else if (selectedValue === 'switch') {
            dateLabel.textContent = 'Switched on:';
            dateField.style.display = 'block'; // Show the date field
        } else {
            dateField.style.display = 'none'; // Hide the date field
        }
    });
    // Add event listener for closing modal
    const closeModalButton = document.getElementById('closeModal');
    closeModalButton.addEventListener('click', closeModal);

    // Add event listener for submitting modal form
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', () => {
        const selectedUserIPN = document.getElementById('userIPNSelect').value;
        const phoneChecked = document.getElementById('phoneCheckbox').checked;
        const chargerChecked = document.getElementById('chargerCheckbox').checked;
        const tokenChecked = document.getElementById('tokenCheckbox').checked;
        const headsetChecked = document.getElementById('headsetCheckbox').checked;
        const infoSelect = document.getElementById('infoSelect').value;

        console.log('Selected UserIPN:', selectedUserIPN);
        console.log('Phone:', phoneChecked);
        console.log('Charger:', chargerChecked);
        console.log('Token:', tokenChecked);
        console.log('Headset:', headsetChecked);
        console.log('Info:', infoSelect);

        // Close the modal after submission
        closeModal();
    });
});

// Function to fetch data and populate the corresponding table
function fetchData(tabName, jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const table = document.querySelector(`#${tabName} table`);
            const tableHead = table.querySelector('thead');
            const tableBody = table.querySelector('tbody');
            tableHead.innerHTML = ''; // Clear existing headers
            tableBody.innerHTML = ''; // Clear existing rows

            if (data.length > 0) {
                // Dynamically create table headers from the keys in the JSON data
                const headers = Object.keys(data[0]);
                const headerRow = document.createElement('tr');

                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });

                tableHead.appendChild(headerRow);

                // Populate table rows with data
                data.forEach(item => {
                    const row = document.createElement('tr');
                    headers.forEach(header => {
                        const cell = document.createElement('td');
                        cell.textContent = item[header] || 'N/A';
                        row.appendChild(cell);
                    });

                    // Add "USE" button to each row (without "Action" column header)
                    const buttonCell = document.createElement('td');
                    const useButton = document.createElement('button');
                    useButton.textContent = 'Use';
                    useButton.classList.add('use-button');
                    useButton.addEventListener('click', () => openModal(item['computerID'])); // Pass computerID to the modal
                    buttonCell.appendChild(useButton);
                    row.appendChild(buttonCell);

                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to handle tab switching
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });

    const tabLinks = document.querySelectorAll('.tablink');
    tabLinks.forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
}

// Function to open modal and populate dropdown
function openModal(computerID) {
    const modal = document.getElementById('modal');
    const userInputDropdown = document.getElementById('userIPNSelect');
    const modalComputerIDTitle = document.getElementById('modalComputerIDTitle');

    // Set the Computer ID title in the modal
    modalComputerIDTitle.textContent = `Computer ID: ${computerID}`;

    // Fetch UserIPN data from personnel.json
    fetch('personnel.json')
        .then(response => response.json())
        .then(data => {
            // Clear any existing options
            userInputDropdown.innerHTML = '';

            // Add options dynamically from personnel.json
            data.forEach(person => {
                const option = document.createElement('option');
                option.value = person.userIPN;
                option.textContent = `${person.userIPN} - ${person.userFirstName} ${person.userLastName}`;
                userInputDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching personnel data:', error));

    // Display the modal
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}
