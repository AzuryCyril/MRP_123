document.addEventListener('DOMContentLoaded', () => {
    // Load data for each category when the page loads
    fetchData('PC', 'stockPC.json');
    fetchData('Mobile', 'stockMobile.json');
    fetchData('Home', 'stockHome.json');

    // Show the PC tab by default when the page loads
    document.getElementById('PC').style.display = 'block';  // Show the PC table by default

    // Set the "PC" tab as the active tab
    document.querySelector('.tablink').classList.add('active');
    
    // Ensure only the PC tab is visible initially, and hide others
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(content => {
        if (content.id !== 'PC') {
            content.style.display = 'none';  // Hide all other tab content
        }
    });
});

// Function to handle tab switching
function openTab(evt, tabName) {
    // Hide all tab content by default
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(content => {
        content.style.display = 'none';  // Hide all content
    });

    // Remove active class from all tabs
    const tabLinks = document.querySelectorAll('.tablink');
    tabLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show the clicked tab content
    document.getElementById(tabName).style.display = 'block';

    // Add active class to the clicked tab
    evt.currentTarget.classList.add('active');
}



// Fetch data and populate table
function fetchData(tab, jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById(tab.toLowerCase() + 'Table').querySelector('tbody');
            const tableHead = document.getElementById(tab.toLowerCase() + 'Table').querySelector('thead');

            // Check if data is not empty
            if (data.length > 0) {
                // Dynamically create table headers
                const headerRow = document.createElement('tr');
                Object.keys(data[0]).forEach(key => {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1);  // Capitalize first letter
                    headerRow.appendChild(headerCell);
                });
                tableHead.innerHTML = '';  // Clear any existing headers
                tableHead.appendChild(headerRow);

                // Populate table with rows
                data.forEach(item => {
                    const row = document.createElement('tr');
                    Object.values(item).forEach(value => {
                        const cell = document.createElement('td');
                        cell.textContent = value;
                        row.appendChild(cell);
                    });
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => console.error(`Error fetching ${tab} data:`, error));
}
