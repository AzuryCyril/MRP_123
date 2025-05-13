"use strict";

import {
    fetchInternSubs,
    fetchExternSubs,
    fetchServiceDeskSubs,
    updateSubDescription,
    updateContactInfo,
    addIssueToFirestore,
    addNewSub,
    updateIssueDescription
} from './database.js';

let trailArray = ["Renault Support BE"];
let targetPage = 0;
let data;
updatePages();



////PAGE 0 START
async function Page0() {

    targetPage = 0;

    await displayCategories()
}

async function displayCategories() {

    document.querySelectorAll(".filter-btn").forEach(category => {
        if (!category.hasAttribute("data-listener-attached")) {
            category.addEventListener("click", async () => {

                await filterHistory(category.dataset.type);

                await fetchData(trailArray[1])

                targetPage = 1;
                await updatePages();
            });

            category.setAttribute("data-listener-attached", "true"); // Prevent duplicate listeners
        }
    });
}














////PAGE 1 SUBS
async function Page1() {

    targetPage = 1;

    await displaySubs()
    
}


async function displaySubs() {

    const subsDiv = document.querySelector('.Subs');

    const subsDivIntern = document.querySelector('.SubsIntern');
    const subsDivExtern = document.querySelector('.SubsExtern');
    const subsDivOther = document.querySelector('.SubsOther');

    subsDivIntern.innerHTML = '';
    subsDivExtern.innerHTML = '';
    subsDivOther.innerHTML = '';

    data.forEach(sub => {

        //description too long
        // let descriptionText = sub.description || "No description available";
        // if (descriptionText.length > 20) {
        //     descriptionText = descriptionText.substring(0, 25) + "...";
        // }

        const subContainer = document.createElement('div');
        subContainer.classList.add('sub-item');

        subContainer.insertAdjacentHTML('beforeend', `
            <div class="icon-container"><i class="fas fa-file-alt"></i></div>
            
            <div class="text-container"><p class="sub-id">${sub.id}</p><div class="sub-description">${sub.id}</div></div>
            `)

        subContainer.addEventListener('click', async () => {

            await filterHistory(sub.id);

            targetPage = 2;
            await updatePages();

        });
        

        if(sub.contactList.Scope == "Intern"){
            subsDivIntern.appendChild(subContainer);
        }else if(sub.contactList.Scope == "Extern"){
            subsDivExtern.appendChild(subContainer);
        }else{
            subsDivOther.appendChild(subContainer);
        }

 
    })


    const addSubButton = subsDiv.querySelector(".addSubButton");
    addSubButton.addEventListener("click", async () => {

        // Prevent multiple input fields
        if (document.querySelector(".inputSubButton")) return;

        addSubButton.insertAdjacentHTML(
            "beforeend",
            `<div class="inputSubButton">
                <input type="text" id="newSubInput" placeholder="Enter sub name">
                <button class="confirmSub">✔</button>
                <button class="cancelSub">✖</button>
            </div>`
        );

        const inputField = document.querySelector("#newSubInput");

        document.querySelector(".confirmSub").addEventListener("click", async (event) => {
            event.stopPropagation();

            if (inputField.value.trim() === "") {
                alert("Sub name cannot be empty!");
                return;
            }

            await addNewSub(trailArray[1], inputField.value.trim());

            await fetchData(trailArray[1]);

            await updatePages();

            document.querySelector(".inputSubButton").remove();
        });

        document.querySelector(".cancelSub").addEventListener("click", (event) => {
            event.stopPropagation();

            document.querySelector(".inputSubButton").remove();
        });

    });
}


////PAGE 2 CONTENT

async function Page2() {

    targetPage = 2;

    await filterDescription(trailArray[2])

}


async function getIssues() {

    const issuesDiv = document.querySelector('.possibleIssues');

    issuesDiv.innerHTML = "";

    data.forEach(sub => {

        if (sub.id == trailArray[2]) {

            for (let i = 0; i < sub.issues.length; i++) {

                const issueContainer = document.createElement('div');
                issueContainer.classList.add('issueItem');

                let solutionText = sub.issues[i].solution || "No description available";
                if (solutionText.length > 20) {
                    solutionText = solutionText.substring(0, 250) + "...";
                }

                issueContainer.insertAdjacentHTML('beforeend', `
                     <div class="icon-container"><i class="fa-solid fa-book-open"></i></i></div>
                     <div class="preview__text">
                         <h4>${sub.issues[i].name}:</h4> 
                         <p>Category: ${sub.id}</p></br>
                         <p>${solutionText}</p>
                     </div>
                 `)

                issueContainer.addEventListener('click', async () => {

                    await filterDescription(sub.issues[i].name)

                    targetPage = 3;

                    await updatePages();

                });


                issuesDiv.appendChild(issueContainer);

            }

        }

    })


    issuesDiv.insertAdjacentHTML("beforeend", '<button class="add-issue-btn">+ Add Issue</button>');

    document.querySelector(".add-issue-btn").addEventListener("click", () => {

        // Remove existing input if any
        const existingInput = document.getElementById("newIssueDiv");
        if (existingInput) return; // Prevent multiple inputs

        // Create input field
        issuesDiv.insertAdjacentHTML('afterend', `<div id="newIssueDiv">
        <input type = "text" class="issue-input" placeholder = "Enter issue name...">
        <button class="confirm-btn">Confirm</button>
        <button class="cancel-btn">Cancel</button>
        </div>`)



        document.querySelector(".confirm-btn").addEventListener("click", async () => {

            if (document.querySelector(".issue-input").value.trim() === "") {
                alert("Please enter a name")
                return;
            }

            await addIssueToFirestore(trailArray[2], document.querySelector(".issue-input").value.trim(), trailArray[1]);

            document.getElementById("newIssueDiv").remove()

            await fetchData(trailArray[1])

            await getIssues();

        });

        // Create cancel button
        document.querySelector(".cancel-btn").addEventListener("click", () => {
            document.getElementById("newIssueDiv").remove()
        });


    });
}


async function getContacts() {

    data.forEach(sub => {

        if (sub.id == trailArray[2]) {

            const contactHeader = document.querySelector('.contactHeader');

            contactHeader.innerHTML = `
                <h4>Contact Info</h4>
                <i class="fas fa-pencil-alt edit-icon" id="editContactIcon"></i>
            `;

            document.querySelector('.subContactInfo').innerHTML = `
            <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p id="contactName">${sub.contactList.name || "No name available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p id="contactPerson">${sub.contactList.contactPerson || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p id="contactEmail">${sub.contactList.contactPersonEmail || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p id="contactBackup">${sub.contactList.contactPersonBackup || "No phone available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p id="assignmentGroup">${sub.contactList.assignmentGroup || "No email available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">IRN:</p><p id="IRN">${sub.contactList.IRN || "No email available"}</p></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Scope:</p><p id="scope">${sub.contactList.Scope || "No email available"}</p></div>
            `;

            document.getElementById("editContactIcon").addEventListener("click", async () => {


                // Store current values
                const name = document.getElementById("contactName").textContent.trim();
                const person = document.getElementById("contactPerson").textContent.trim();
                const email = document.getElementById("contactEmail").textContent.trim();
                const backup = document.getElementById("contactBackup").textContent.trim();
                const group = document.getElementById("assignmentGroup").textContent.trim();
                const IRN = document.getElementById("IRN").textContent.trim();
                const Scope = document.getElementById("scope").textContent.trim();

                document.querySelector('.subContactInfo').innerHTML = `
            <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><input id="editContactName" type="text" value="${name}"></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><input id="editContactPerson" type="text" value="${person}"></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><input id="editContactEmail" type="email" value="${email}"></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><input id="editContactBackup" type="text" value="${backup}"></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><input id="editAssignmentGroup" type="text" value="${group}"></div>
            <div class="contactInfoRow"><p class="contactInfoTitle">IRN:</p><input id="editIRN" type="text" value="${IRN}"></div>
            <div class="contactInfoRow">
                <p class="contactInfoTitle">Scope:</p>
                <select id="editScope">
                    <option value="Intern" ${Scope === 'Intern' ? 'selected' : ''}>Intern</option>
                    <option value="Extern" ${Scope === 'Extern' ? 'selected' : ''}>Extern</option>
                    <option value="Other" ${Scope === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            `;

                const saveButton = document.createElement('button'); // Create the save button
                saveButton.id = "saveContact";
                saveButton.classList.add("save-btn");
                saveButton.textContent = "Save";

                contactHeader.appendChild(saveButton)

                document.getElementById("editContactIcon").style.display = 'none';
                saveButton.style.display = 'inline-block';

                saveButton.addEventListener("click", async () => {

                    const newName = document.getElementById("editContactName").value.trim();
                    const newPerson = document.getElementById("editContactPerson").value.trim();
                    const newEmail = document.getElementById("editContactEmail").value.trim();
                    const newBackup = document.getElementById("editContactBackup").value.trim();
                    const newGroup = document.getElementById("editAssignmentGroup").value.trim();
                    const newIRN = document.getElementById("editIRN").value.trim();
                    const newScope = document.getElementById("editScope").value.trim();

                    const updatedContactInfo = {
                        name: newName,
                        contactPerson: newPerson,
                        contactPersonEmail: newEmail,
                        contactPersonBackup: newBackup,
                        assignmentGroup: newGroup,
                        IRN: newIRN,
                        Scope: newScope
                    };


                    await updateContactInfo(trailArray[2], updatedContactInfo, trailArray[1]);

                    await fetchData(trailArray[1])

                    await getContacts();


                    //     document.querySelector('.subContactInfo').innerHTML = `
                    // <div class="contactInfoRow"><p class="contactInfoTitle">Name:</p><p id="contactName">${newName}</p></div>
                    // <div class="contactInfoRow"><p class="contactInfoTitle">Contact Person:</p><p id="contactPerson">${newPerson}</p></div>
                    // <div class="contactInfoRow"><p class="contactInfoTitle">Contact Email:</p><p id="contactEmail">${newEmail}</p></div>
                    // <div class="contactInfoRow"><p class="contactInfoTitle">Contact Backup:</p><p id="contactBackup">${newBackup}</p></div>
                    // <div class="contactInfoRow"><p class="contactInfoTitle">Assignment Group:</p><p id="assignmentGroup">${newGroup}</p></div>
                    // <div class="contactInfoRow"><p class="contactInfoTitle">IRN:</p><p id="assignmentGroup">${newIRN}</p></div>
                    // `;


                    //     document.getElementById("editContactIcon").style.display = 'inline-block';
                    //     saveButton.style.display = 'none';


                });


            });

        }

    })

}



/////// PAGE 3 issues
async function Page3() {

    targetPage = 3;

};


window.filterDescription = async function (name) {

    let namePath = [];


    data.forEach(sub => {

        if (sub.id == name) {

            targetPage = 2;

            namePath.push(name)

            trailArray.splice(2)

            filterHistory(namePath[0])

            getIssues(trailArray[2])
            getContacts(trailArray[2])
            getDescription(sub.id, sub.description)

        } else {

            for (let i = 0; i < sub.issues.length; i++) {

                if (sub.issues[i].name == name) {

                    targetPage = 3;

                    namePath.push(sub.id);
                    namePath.push(sub.issues[i].name);

                    trailArray.splice(2)
                    filterHistory(namePath[0])
                    filterHistory(namePath[1])

                    getIssues(trailArray[2])
                    getContacts(trailArray[2])
                    getDescription(sub.issues[i].name, sub.issues[i].solution)
                }

            }

        }

    })

}


async function getDescription(name, description) {

    const descriptionDiv = document.querySelector('.subDescription');

    descriptionDiv.innerHTML = `
                <div class="descriptionHeader">
                    <h3 class="subTitle">${name}</h3>
                   <div class="descriptionHeaderOptions"> <button id="generatePdfBtn" class="pdf-btn">PDF</button>
                    <i class="fas fa-pencil-alt edit-icon"></i> </div>
                </div>
                <div class="descriptionContent">
                    <div id="descText">${description || "No description available"}</div>
                </div>
            `;

    // Add event listener for the PDF button
    document.getElementById("generatePdfBtn").addEventListener("click", () => {
        generatePDF(name, description);
    });

    const editIcon = descriptionDiv.querySelector(".edit-icon");
    editIcon.addEventListener("click", async () => {

        const descText = document.getElementById('descText');

        // Store the current description, keeping HTML formatting
        const currentDescription = descText.innerHTML.trim();

        const descriptionWidth = descText.offsetWidth;
        const descriptionHeight = descText.scrollHeight;

        // Remove existing TinyMCE instance before replacing the textarea
        if (tinymce.get('descInput')) {
            tinymce.get('descInput').remove();
        }

        // Replace the description with an input field (textarea)
        descriptionDiv.querySelector('.descriptionContent').innerHTML = `
        <textarea id="descInput" class="desc-input" style="width: ${descriptionWidth}px; height: ${descriptionHeight}px;">${currentDescription}</textarea>
    `;

        // Re-initialize TinyMCE on the new textarea
        tinymce.init({
            selector: '#descInput', // Apply TinyMCE to the textarea
            height: descriptionHeight + 250,
            width: descriptionWidth,
            menubar: false, // Optional: Hide the menu bar
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'wordcount', 'textcolor', 'colorpicker'
            ],
            toolbar: 'undo redo | blocks | ' +
                'bold italic backcolor forecolor link anchor image | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat',
            setup: function (editor) {
                editor.on('change', function () {
                    // Automatically update the content inside the textarea as the user types
                    editor.save();
                });
            }
        });

        const saveButton = document.createElement('button');
        saveButton.classList.add("save-btn");
        saveButton.textContent = "Save";

        descriptionDiv.querySelector('.descriptionHeaderOptions').appendChild(saveButton);
        editIcon.style.display = 'none';

        saveButton.addEventListener("click", async () => {

            let newDesc = document.getElementById('descInput').value;

            if (targetPage == 2) {

                newDesc = newDesc.replace(
                    /<a(.*?)href="((?!#|http).*?)"(.*?)>/g,
                    `<a$1href="$2"$3 onclick="event.preventDefault(); window.filterDescription('$2')">`
                );

                await updateSubDescription(trailArray[2], newDesc, trailArray[1]);

                await fetchData(trailArray[1]);

                await filterDescription(trailArray[2])

            }

            if (targetPage == 3) {

                newDesc = newDesc.replace(
                    /<a(.*?)href="((?!#|http).*?)"(.*?)>/g,
                    `<a$1href="$2"$3 onclick="event.preventDefault(); window.filterDescription('$2')">`
                );

                await updateIssueDescription(trailArray[2], newDesc, trailArray[1], trailArray[3]);

                await fetchData(trailArray[1]);

                await filterDescription(trailArray[3])

                //await getIssues();

            }

        })

    });

};

// Function to generate PDF with html2pdf.js and handle images
function generatePDF(title, content) {
    const element = document.createElement("div");
    element.innerHTML = `
        <div class="descriptionHeader">
            <h3 class="subTitle">${title}</h3>
        </div>
        <div class="descriptionContent">
            <div id="descText">${content || "No description available"}</div>
        </div>
    `;

    // Styling the element that will be converted to PDF (you can customize the styles as needed)
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';

    // Wait for images to load
    const images = element.querySelectorAll("img");
    let imagesLoaded = 0;

    images.forEach((img) => {
        if (img.complete) {
            imagesLoaded++;
        } else {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === images.length) {
                    // All images loaded, generate PDF
                    generatePdfFromElement(title, element);
                }
            };
        }
    });

    // If no images, directly generate the PDF
    if (images.length === 0 || imagesLoaded === images.length) {
        generatePdfFromElement(title, element);
    }
}

// Function to generate the PDF after image load
function generatePdfFromElement(title, element) {
    html2pdf(element, {
        filename: `${title}.pdf`, // Set the filename of the PDF
        margin: [10, 10, 10, 10], // PDF margins
        html2canvas: {
            scale: 2, // Increase resolution of the screenshot
            logging: true, // Enable logging for debugging
            useCORS: true, // Use Cross-Origin Resource Sharing to handle images from other domains
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        } // PDF format
    });
}

//OTHERS

async function filterHistory(historyItem) {

    if (trailArray.length < 4) {
        trailArray.push(historyItem);
    }


    trailHistory();
}

async function trailHistory() {
    const historyDiv = document.querySelector('.followHistory');
    historyDiv.innerHTML = '';

    for (let i = 0; i < trailArray.length; i++) {
        historyDiv.insertAdjacentHTML('beforeend', `<span class="history-link" data-id ="${i}">${trailArray[i]}</span> ` + "\u00A0>\u00A0")
    }


    document.querySelectorAll(".history-link").forEach(item => {
        item.addEventListener("click", async () => {

            let targetIndex = parseInt(item.getAttribute("data-id"));

            if (targetIndex != targetPage) {

                trailArray.splice(targetIndex + 1);

                targetPage = targetIndex

                await trailHistory();

                await updatePages();


            }

        })
    })

}



async function updatePages() {
    if (targetPage == 0) {

        document.querySelector('.button-container').style.display = "flex";
        document.querySelector('.Subs').style.display = "none";
        document.querySelector('.addSubButton').style.display = "none"
        document.querySelector('.subDescription').style.display = "none";
        document.querySelector('.subContact').style.display = "none";
        document.querySelector('.subIssues').style.display = "none";
        document.querySelector('.followHeader').style.display = "none";

        await Page0();

    }

    if (targetPage == 1) {

        await fetchData(trailArray[1]);
        
        document.querySelector('.subDescription').style.display = "none";
        document.querySelector('.Subs').style.display = "block";
        document.querySelector('.addSubButton').style.display = "inline-flex";
        document.querySelector('.subContact').style.display = "none";
        document.querySelector('.subIssues').style.display = "none";
        document.querySelector('.button-container').style.display = "none";
        document.querySelector('.followHeader').style.display = "block";

        await Page1();
    }

    if (targetPage == 2) {
        document.querySelector('.subDescription').style.display = "block";
        document.querySelector('.subContact').style.display = "block";
        document.querySelector('.subIssues').style.display = "block";
        document.querySelector('.Subs').style.display = "none";


        await Page2();
    }

    if (targetPage == 3) {

        await Page3();

    }
}


async function fetchData(parentType) {
    if (parentType === "supportIntern") {
        data = await fetchInternSubs();
    } else if (parentType === "supportExtern") {
        data = await fetchExternSubs();
    } else if (parentType === "supportServiceDesk") {
        data = await fetchServiceDeskSubs();
    }
}