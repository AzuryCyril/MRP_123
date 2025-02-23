"use strict";
import { fetchInternSubs } from "./database.js";

async function renderInternSubs() {
    const internSubsDiv = document.querySelector('.internSubs');

    if (!internSubsDiv) {
        console.error("Element with class 'internSubs' not found.");
        return;
    }

    try {
        const internSubs = await fetchInternSubs(); // Fetch data from Firestore
        console.log("Fetched Data:", internSubs);

        internSubsDiv.innerHTML = ''; // Clear existing content

        internSubs.forEach(sub => {
            console.log("Rendering item:", sub); // Debugging

            // Create container for each item
            const subContainer = document.createElement('div');
            subContainer.classList.add('intern-sub-item');

            // Create the black circle with a document icon
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('icon-container');

            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-file-alt'); // FontAwesome document icon
            iconContainer.appendChild(icon);

            // Create text container
            const textContainer = document.createElement('div');
            textContainer.classList.add('text-container');

            const idElement = document.createElement('p');
            idElement.textContent = sub.id;
            idElement.classList.add('sub-id');

            const labelElement = document.createElement('p');
            labelElement.textContent = "Lorem ipsum...";
            labelElement.classList.add('sub-label');

            // Append elements
            textContainer.appendChild(idElement);
            textContainer.appendChild(labelElement);
            subContainer.appendChild(iconContainer);
            subContainer.appendChild(textContainer);
            internSubsDiv.appendChild(subContainer);
        });

    } catch (error) {
        console.error("Error fetching intern subscriptions:", error);
        internSubsDiv.innerHTML = '<p>Error loading data.</p>';
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", () => {
    renderInternSubs();
});