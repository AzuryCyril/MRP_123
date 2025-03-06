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

    subsDiv.innerHTML = '';

    data.forEach(sub => {

        //description too long
        // let descriptionText = sub.id || "No description available";
        //     if (descriptionText.length > 20) {
        //         descriptionText = descriptionText.substring(0, 20) + "...";
        // }

        const subContainer = document.createElement('div');
        subContainer.classList.add('sub-item');

        subContainer.insertAdjacentHTML('beforeend', `
            <div class="icon-container"><i class="fas fa-file-alt"></i></div>
            
            <div class="text-container"><p class="sub-id">${sub.id}</p><p class="sub-description">${sub.id}</p></div>
            `)

        subContainer.addEventListener('click', async () => {

            await filterHistory(sub.id);

            targetPage = 2;
            await updatePages();

        });

        subsDiv.appendChild(subContainer);
    })


    subsDiv.insertAdjacentHTML("beforeend", '<div class="addSubButton"><div class="icon-container">+</div></div>');

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

            updatePages();
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
    await getIssues(trailArray[2])
    await getContacts(trailArray[2])
}


async function getIssues() {

    const issuesDiv = document.querySelector('.possibleIssues');

    issuesDiv.innerHTML = "";

    data.forEach(sub => {

        if (sub.id == trailArray[2]) {

            for (let i = 0; i < sub.issues.length; i++) {

                const issueContainer = document.createElement('div');
                issueContainer.classList.add('issueItem');

                issueContainer.insertAdjacentHTML('beforeend', `
                     <div class="icon-container"><i class="fa-solid fa-book-open"></i></i></div>
                     <div class="preview__text">
                         <h4>${sub.issues[i].name}:</h4> 
                         <p>Category: ${sub.id}</p></br>
                         <p>${sub.issues[i].solution}</p>
                     </div>
                 `)

                issueContainer.addEventListener('click', async () => {

                    await filterHistory(sub.issues[i].name);

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


    });
}


async function getContacts(){
    console.log("ok")
}








/////// PAGE 3 issues
async function Page3() {

    targetPage = 3;

    await filterDescription(trailArray[3])

};




window.filterDescription = async function (name) {
    
    data.forEach(sub => {

        if (sub.id == name) {

            targetPage = 2;
            
            trailArray.splice(3);
            trailHistory();

            console.log(trailArray)
            getDescription(sub.id, sub.description)

        } else {

            for (let i = 0; i < sub.issues.length; i++) {

                if (sub.issues[i].name == name) {  

                    targetPage = 3;
                    filterHistory(sub.issues[i].name)
                    getDescription(sub.issues[i].name, sub.issues[i].solution)
                }

            }

        }

    })
}


async function getDescription(name, description) {
    console.log(targetPage)
    const descriptionDiv = document.querySelector('.subDescription');

    descriptionDiv.innerHTML = `
                <div class="descriptionHeader">
                    <h2 class="subTitle">${name}</h2>
                    <i class="fas fa-pencil-alt edit-icon"></i>
                </div>
                <div class="descriptionContent">
                    <div id="descText">${description || "No description available"}</div>
                </div>
            `;

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
            height: descriptionHeight + 150,
            width: descriptionWidth,
            menubar: false, // Optional: Hide the menu bar
            plugins: 'advlist autolink lists link image charmap print preview anchor',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
            setup: function (editor) {
                editor.on('change', function () {
                    // Automatically update the content inside the textarea as the user types
                    editor.save();
                });
            }
        });
        
        descriptionDiv.querySelector('.descriptionHeader').insertAdjacentHTML("beforeend", '<button class="save-btn">Save</button>');
        editIcon.style.display = 'none';

        document.querySelector(".save-btn").addEventListener("click", async () => {

            let newDesc = document.getElementById('descInput').value;
            
            if (targetPage == 2 && trailArray.length == 3) {
                console.log(targetPage)
                newDesc = newDesc.replace(
                    /<a(.*?)href="(.*?)"(.*?)>/g,
                    `<a$1href="$2"$3 onclick="event.preventDefault(); window.filterDescription(\'$2\')">`
                );

                await updateSubDescription(trailArray[2], newDesc, trailArray[1]);

                await fetchData(trailArray[1]);

                await filterDescription(trailArray[2])

            }

            if (targetPage == 3 && trailArray.length == 4) {
              
                newDesc = newDesc.replace(
                    /<a(.*?)href="(.*?)"(.*?)>/g,
                    `<a$1href="$2"$3 onclick="event.preventDefault(); window.filterDescription(\'$2\')">`
                );

                await updateIssueDescription(trailArray[2], newDesc, trailArray[1], trailArray[3]);

                await fetchData(trailArray[1]);

                await filterDescription(trailArray[3])

                await getIssues();

            }

        })

    });

};








//OTHERS

async function filterHistory(historyItem) {

    if (trailArray.length < 4) {
        trailArray.push(historyItem);
    }else{
        trailArray.splice(3)
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

            //  console.log(targetIndex);

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
        document.querySelector('.Subs').innerHTML = '';
        document.querySelector('.Subs').style.display = "flex";
        document.querySelector('.subDescription').style.display = "none";
        document.querySelector('.subContact').style.display = "none";
        document.querySelector('.subIssues').style.display = "none";
        document.querySelector('.followHeader').style.display = "none";

        await Page0();

    }

    if (targetPage == 1) {

        document.querySelector('.Subs').style.display = "flex";
        document.querySelector('.subDescription').style.display = "none";
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

