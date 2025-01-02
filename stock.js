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
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Generate rows dynamically
        data.forEach(item => {
            const row = document.createElement('tr');
            
            // Loop through each header (key)
            headers.forEach(header => {
                const cell = document.createElement('td');
                
                // If it's the userID (or the key you want to make clickable)
                if (header === 'userIPN') {
                    const userIDLink = document.createElement('a');
                    userIDLink.href = '#';
                    userIDLink.textContent = item[header];
                    userIDLink.addEventListener('click', () => {
                        openUserModal(item); // Open modal with user data
                    });
                    cell.appendChild(userIDLink);
                } else {
                    cell.textContent = item[header] || 'N/A'; // Default to N/A if data is missing
                }
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
});

// Function to open the modal and populate it with the clicked user’s data
function openUserModal(userData) {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('modalContent');
    
    // Start with the main user data (excluding 'moreInfo')
    let modalHTML = `
        <div class="user-info">
            <p><strong>User ID:</strong> ${userData.userIPN}</p>
            <p><strong>Name:</strong> ${userData.userFirstName} ${userData.userLastName}</p>
            <p><strong>Email:</strong> ${userData.userEmail}</p>
            <p><strong>Computer ID:</strong> ${userData.computerID}</p>
            <p><strong>Dotation Check:</strong> ${userData.dotationCheck}</p>
        </div>
    `;
    
    // Check if 'moreInfo' exists and iterate over it
    if (userData.moreInfo && Array.isArray(userData.moreInfo)) {
        modalHTML += '<h3>More Information:</h3>';
        userData.moreInfo.forEach(info => {
            modalHTML += '<div class="user-info">';
            Object.keys(info).forEach(key => {
                modalHTML += `
                    <p><strong>${key}:</strong> ${info[key]}</p>
                `;
            });
            modalHTML += '</div>';
        });
    }
    
    // Insert the generated content into the modal
    modalContent.innerHTML = modalHTML;

    // Display the modal
    modal.style.display = 'block';

    // Add event listener to close modal
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal if the user clicks outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}
