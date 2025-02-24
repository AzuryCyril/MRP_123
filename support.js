"use strict";
import { fetchInternSubs, fetchExternSubs, fetchServiceDeskSubs } from './database.js';

let historyTrail = []; // Start with an empty history

function updateHistory(selection, type) {
    const historyDiv = document.querySelector('.followHistory');
    const followHeader = document.querySelector('.followHeader'); // Get the full-width container

    if (!historyDiv || !followHeader) return;

    if (historyTrail.length === 0) {
        historyTrail.push({ label: "Renault Support BE", type: null }); // Add only once
    }

    historyTrail.push({ label: selection, type });

    // Show the followHeader when history is added
    followHeader.style.display = "block";

    // Render history as clickable links
    historyDiv.innerHTML = ''; 
    historyTrail.forEach((entry, index) => {
        const historyLink = document.createElement('span');
        historyLink.textContent = entry.label;
        historyLink.classList.add('history-link');

        if (index < historyTrail.length - 1) {
            historyLink.style.cursor = 'pointer';
            historyLink.style.color = 'blue';
            historyLink.addEventListener('click', () => restoreState(index));
        }

        historyDiv.appendChild(historyLink);
        if (index < historyTrail.length - 1) {
            historyDiv.appendChild(document.createTextNode(" => "));
        }
    });
}

function restoreState(index) {
    const subsDiv = document.querySelector('.Subs');
    const buttonContainer = document.querySelector('.button-container');
    const followHeader = document.querySelector('.followHeader');

    historyTrail = historyTrail.slice(0, index + 1);
    updateHistory(historyTrail[index].label, historyTrail[index].type);

    if (index === 0) {
        buttonContainer.style.display = "flex";
        subsDiv.innerHTML = ''; 
        historyTrail = [];
        document.querySelector('.followHistory').innerHTML = ''; 
        followHeader.style.display = "none"; // Hide the header when history is cleared
    } else {
        renderSubs(historyTrail[index].type, false);
    }
}

// Function to render the fetched data into the Subs div
async function renderSubs(type, addToHistory = true) {
    const subsDiv = document.querySelector('.Subs');
    const buttonContainer = document.querySelector('.button-container');

    if (!subsDiv || !buttonContainer) {
        console.error("Elements not found.");
        return;
    }

    // Hide buttons after selection
    buttonContainer.style.display = "none";

    try {
        let subs = [];
        let label = "";

        if (type === "intern") {
            subs = await fetchInternSubs();
            label = "Intern";
        } else if (type === "extern") {
            subs = await fetchExternSubs();
            label = "Extern";
        } else if (type === "servicedesk") {
            subs = await fetchServiceDeskSubs();
            label = "ServiceDesk";
        }

        if (addToHistory) {
            updateHistory(label, type); // Update history only when a button is clicked
        }

        subsDiv.innerHTML = ''; // Clear existing content

        subs.forEach(sub => {
            const subContainer = document.createElement('div');
            subContainer.classList.add('sub-item');

            // Icon
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('icon-container');
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-file-alt');
            iconContainer.appendChild(icon);

            // Text
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
            subsDiv.appendChild(subContainer);
        });

    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        subsDiv.innerHTML = '<p>Error loading data.</p>';
    }
}

// Event listener for buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            renderSubs(type);
        });
    });
});

