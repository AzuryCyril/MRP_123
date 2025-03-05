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

let trailArray= ["Renault Support BE"];
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
        
                await trailHistory(category.dataset.type);

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
    await fetchData(trailArray[1])

    console.log(data)

    const subsDiv = document.querySelector('.Subs');
    data.forEach(sub =>  {

        //description too long
        // let descriptionText = sub.id || "No description available";
        //     if (descriptionText.length > 20) {
        //         descriptionText = descriptionText.substring(0, 20) + "...";
        // }

        subsDiv.insertAdjacentHTML('beforeend', `<div class="sub-item">
            <div class="icon-container"><i class="fas fa-file-alt"></i></div>
            
            <div class="text-container"><p class="sub-id">${sub.id}</p><p class="sub-description">${sub.id}</p></div>
            </div>`)
    })
    
    subsDiv.insertAdjacentHTML("beforeend", '<div class="addSubButton"><div class="icon-container">+</div></div>');

    const addSubButton = subsDiv.querySelector(".addSubButton");
    addSubButton.addEventListener("click", () => {

        addSubButton.insertAdjacentHTML(
            "beforeend",
            `<div class="inputSubButton">
                <input type="text" id="newSubInput" placeholder="Enter sub name">
                <button class="confirmSub">✔</button>
                <button class="cancelSub">✖</button>
            </div>`
        );

    });
}
























//OTHERS
async function trailHistory(historyItem){
    trailArray.push(historyItem);
    

    const historyDiv = document.querySelector('.followHistory');
    historyDiv.innerHTML = '';

    for (let i = 0; i < trailArray.length; i++) {
        historyDiv.insertAdjacentHTML('beforeend', `<span class="history-link" data-id ="${i}">${trailArray[i]}</span> ` + "\u00A0>\u00A0")
    }


    document.querySelectorAll(".history-link").forEach(item => {
        item.addEventListener("click", async () => {
            
            let targetIndex = item.dataset.id;
            
          //  console.log(targetIndex);

            if (targetIndex != targetPage) {

                trailArray.splice(targetIndex + 1);

                targetPage = targetIndex
                
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
        showDescription();
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


















window.filterDescription = async function (name){

}


async function getDescription(name, description) {

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
  
};