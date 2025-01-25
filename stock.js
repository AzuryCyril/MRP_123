// Declare materialCheckboxes globally so they can be accessed in various functions
let materialCheckboxes;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize materialCheckboxes here
    materialCheckboxes = [
        document.getElementById('phoneCheckbox'),
        document.getElementById('chargerCheckbox'),
        document.getElementById('tokenCheckbox'),
        document.getElementById('headsetCheckbox')
    ];

    // Fetch data for each category when the page loads
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
    const switchDropdown = document.getElementById('switchDropdownSelect');
    const switchComputerField = document.getElementById('switchDropdown');  // Add this for the computerID field
    const submitButton = document.getElementById('submitButton');
    const userIPNSelect = document.getElementById('userIPNSelect');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Add event listener to the "Info" select field
    infoSelect.addEventListener('change', () => {
        const selectedValue = infoSelect.value;

        if (selectedValue === 'Start') {
            dateLabel.textContent = 'Starting on:';
            dateField.style.display = 'block'; // Show the date field
            switchDropdown.style.display = 'none'; // Hide the dropdown
            switchComputerField.style.display = 'none'; // Hide the computerID field
        } else if (selectedValue === 'Switch') {
            dateLabel.textContent = 'Switched on:';
            dateField.style.display = 'block'; // Show the date field
            switchDropdown.style.display = 'block'; // Show the dropdown
            switchComputerField.style.display = 'block'; // Show the computerID field
            populateSwitchDropdown(); // Fetch and populate the dropdown
        } else {
            dateField.style.display = 'none'; // Hide the date field
            switchDropdown.style.display = 'none'; // Hide the dropdown
            switchComputerField.style.display = 'none'; // Hide the computerID field
        }

        validateForm();
    });

    datePicker.addEventListener('change', validateForm);

    // Step-by-step form logic
    userIPNSelect.addEventListener('change', () => {
        if (userIPNSelect.value) {
            step2.style.display = 'block'; // Show Step 2
        }
        validateForm();
    });

    // Show Step 3 if any material is selected
    materialCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (materialCheckboxes.some(cb => cb.checked)) {
                step3.style.display = 'block'; // Show Step 3
            } else {
                step3.style.display = 'none'; // Hide Step 3 if no material is selected
            }
            validateForm();
        });
    });

    // Add event listener for closing modal
    const closeModalButton = document.getElementById('closeModal');
    closeModalButton.addEventListener('click', closeModal);

    submitButton.addEventListener('click', async () => {
        const userIPN = userIPNSelect.value;
        const oldComputerID = switchDropdown.value; // Fetch the computerID from the dropdown or use 'N/A'
        const selectedMaterials = [];
        materialCheckboxes.forEach(cb => {
            if (cb.checked) {
                selectedMaterials.push(cb.id);
            }
        });
        const infoType = infoSelect.value;
        const selectedDate = datePicker.value;
        const computerID = modalComputerIDTitle.textContent;
        const model = modelComputer.textContent;

        const userInfo = await fetchUserInfo(userIPN);
    
        // Pass computerID to the generatePDF function
        await generatePDF(userIPN, userInfo, oldComputerID, computerID, model, selectedMaterials, infoType, selectedDate);
    });

    async function fetchUserInfo(userIPN) {
        const response = await fetch('personnel.json');
        const personnelData = await response.json();
        const user = personnelData.find(person => person.userIPN === userIPN);
        return user || {}; // Return the user data or an empty object if not found
    }

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    async function generatePDF(userIPN, userInfo, oldComputerID, computerID, model, materials, infoType, date) {
    const { PDFDocument } = window.PDFLib;

    // Load the template PDF
    const existingPdfBytes = await fetch("dotationPC.pdf").then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the pages of the PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1]; // Access the second page

    // Define positions (x, y) for text placement on the first page
    const firstPagePositions = {
        userIPN: { x: 277, y: 590 },
        userName: { x: 130, y: 590 },
        infoType: { x: 112, y: 313 },
        date: { x: 157, y: 313 },
        materials: { x: 110.5, y: 433 },
        oldComputerID: { x: 320, y: 475 },
        computerID: { x: 222, y: 475 },
        model: { x: 113, y: 475 }
    };

    // Define position for the Manager on the second page
    const secondPagePositions = {
        manager: { x: 78, y: 253 }, // Adjust the x, y to where you want to place the Manager's name
        userName: { x: 330, y: 128 }
    };

    // Format the date as day/month/year
    const formattedDate = formatDate(date);
    const { rgb } = window.PDFLib;
    firstPage.setFontColor(rgb(0, 0, 1));
    secondPage.setFontColor(rgb(0, 0, 1));
    // Add form data to the first page
    firstPage.drawText(`${userIPN}`, { x: firstPagePositions.userIPN.x, y: firstPagePositions.userIPN.y, size: 10 });
    firstPage.drawText(`${userInfo.userFirstName} ${userInfo.userLastName}`, { x: firstPagePositions.userName.x, y: firstPagePositions.userName.y, size: 10 });
    firstPage.drawText(`${infoType} on`, { x: firstPagePositions.infoType.x, y: firstPagePositions.infoType.y, size: 10 });
    firstPage.drawText(`${formattedDate}`, { x: firstPagePositions.date.x, y: firstPagePositions.date.y, size: 10 });
    firstPage.drawText(`${oldComputerID}`, { x: firstPagePositions.oldComputerID.x, y: firstPagePositions.oldComputerID.y, size: 10 }); // Add computerID to the first page
    firstPage.drawText(`${computerID}`, { x: firstPagePositions.computerID.x, y: firstPagePositions.computerID.y, size: 10 }); // Add computerID to the first page
    firstPage.drawText(`${model}`, { x: firstPagePositions.model.x, y: firstPagePositions.model.y, size: 10 }); // Add computerID to the first page

    // Draw materials in bullet point format on the first page
    let yOffset = firstPagePositions.materials.y;
    materials.forEach(material => {
        firstPage.drawText(`X`, { x: firstPagePositions.materials.x, y: yOffset, size: 12 });
        yOffset -= 19; // Adjust line spacing for materials
    });

    // Add Manager info to the second page
    secondPage.drawText(`${userInfo.moreInfo[0]?.Manager || 'N/A'}`, {x: secondPagePositions.manager.x, y: secondPagePositions.manager.y, size: 10});
    secondPage.drawText(`${userInfo.userFirstName} ${userInfo.userLastName}`, { x: secondPagePositions.userName.x, y: secondPagePositions.userName.y, size: 10 });
    

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${userIPN} - ${userInfo.userFirstName} ${userInfo.userLastName}.pdf`;
    link.click();
}
    

    // Function to validate the form and enable/disable the Submit button
    function validateForm() {
        const isUserSelected = !!userIPNSelect.value;
        const isMaterialSelected = materialCheckboxes.some(cb => cb.checked);
        const isInfoValid = infoSelect.value === 'Start' || infoSelect.value === 'Switch';
        const isDateSelected = !!datePicker.value;

        if (isUserSelected && isMaterialSelected && isInfoValid && isDateSelected) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
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
                    useButton.addEventListener('click', () => openModal(item['computerID'],item['model'])); // Pass computerID to the modal
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
function openModal(computerID, model) {
    const modal = document.getElementById('modal');
    const userInputDropdown = document.getElementById('userIPNSelect');
    const modalComputerIDTitle = document.getElementById('modalComputerIDTitle');
    const modelComputer = document.getElementById('modelComputer');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const submitButton = document.getElementById('submitButton');

    // Set the Computer ID title in the modal
    modalComputerIDTitle.textContent = `${computerID}`;
    modelComputer.textContent = `${model}`;
    // Fetch UserIPN data from personnel.json
    fetch('personnel.json')
        .then(response => response.json())
        .then(data => {
            // Clear any existing options
            userInputDropdown.innerHTML = '';

            // Add "Neutral" option
            const neutralOption = document.createElement('option');
            neutralOption.value = '';
            neutralOption.textContent = '--'; // Or any text you prefer
            userInputDropdown.appendChild(neutralOption);

            // Add options dynamically from personnel.json
            data.forEach(person => {
                const option = document.createElement('option');
                option.value = person.userIPN;
                option.textContent = `${person.userIPN} - ${person.userFirstName} ${person.userLastName}`;
                userInputDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching personnel data:', error));

    // Reset the modal steps
    resetModalSteps();
    modal.style.display = 'block';

    // Add event listener to handle Step 1 (user selection)
    userInputDropdown.addEventListener('change', () => {
        const selectedUser = userInputDropdown.value;

        if (selectedUser === '') {
            // "Neutral" selected, hide steps 2 and 3, and disable the Submit button
            resetModalSteps()
            step2.style.display = 'none';
            step3.style.display = 'none';
            submitButton.disabled = true;
        } else {
            // A valid user is selected, proceed with showing steps 2 and 3
            step2.style.display = 'block';
            submitButton.disabled = false;
        }

        // Validate the form again based on the user selection
        validateForm();
    });
}

// Function to reset modal steps
function resetModalSteps() {
    document.getElementById('step2').style.display = 'none'; // Hide Step 2
    document.getElementById('step3').style.display = 'none'; // Hide Step 3
    document.getElementById('submitButton').disabled = true;  // Disable Submit button
    document.getElementById('userIPNSelect').value = '';      // Reset the user dropdown
    materialCheckboxes.forEach(cb => (cb.checked = false));   // Reset material checkboxes
    document.getElementById('infoSelect').value = '';         // Reset the info select
    document.getElementById('dateField').style.display = 'none'; // Hide date field
    document.getElementById('switchDropdown').style.display = 'none'; // Hide switch dropdown
}

// Function to validate the form and enable/disable the Submit button
function validateForm() {
    const userIPNSelect = document.getElementById('userIPNSelect');
    const materialCheckboxes = [
        document.getElementById('phoneCheckbox'),
        document.getElementById('chargerCheckbox'),
        document.getElementById('tokenCheckbox'),
        document.getElementById('headsetCheckbox')
    ];
    const infoSelect = document.getElementById('infoSelect');
    const datePicker = document.getElementById('datePicker');
    const submitButton = document.getElementById('submitButton');

    const isUserSelected = !!userIPNSelect.value;
    const isMaterialSelected = materialCheckboxes.some(cb => cb.checked);
    const isInfoValid = infoSelect.value === 'Start' || infoSelect.value === 'Switch';
    const isDateSelected = !!datePicker.value;

    if (isUserSelected && isMaterialSelected && isInfoValid && isDateSelected) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// Function to populate switch dropdown with computerIDs
function populateSwitchDropdown() {
    const switchDropdown = document.getElementById('switchDropdownSelect');

    fetch('personnel.json')
        .then(response => response.json())
        .then(data => {
            // Clear existing options
            switchDropdown.innerHTML = '';

            // Populate with computerIDs from personnel.json
            data.forEach(person => {
                const option = document.createElement('option');
                option.value = person.computerID;
                option.textContent = person.computerID;
                switchDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching computerID data:', error));
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}



fetch('personnel.json')
.then(response => response.json())
.then(data => {
    // Initialize counts
    let phoneCount = 0;
    let chargerCount = 0;
    let tokenCount = 0;
    let headsetCount = 0;

    // Loop through each user and count the materials
    data.forEach(person => {
        if (person.moreInfo[0].materials[0].phone) phoneCount++;
        if (person.moreInfo[0].materials[0].charger) chargerCount++;
        if (person.moreInfo[0].materials[0].token) tokenCount++;
        if (person.moreInfo[0].materials[0].headset) headsetCount++;
    });

    // Update the counts in the fixed bar
    document.getElementById('phoneCount').textContent = "( " + phoneCount + " )";
    document.getElementById('chargerCount').textContent = "( " + chargerCount + " )";
    document.getElementById('tokenCount').textContent = "( " + tokenCount + " )";
    document.getElementById('headsetCount').textContent = "( " + headsetCount + " )";
})
.catch(error => console.error('Error fetching personnel data:', error));
