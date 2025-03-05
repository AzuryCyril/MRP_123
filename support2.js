"use strict";

let trailArray= ["Renault Support BE"];
let targetPage = 0;
updatePages();



////PAGE 0 START
async function Page0() {
    
    targetPage = 0;
    
    await displayCategories()
}

async function displayCategories(){

    document.querySelectorAll(".filter-btn").forEach(category => {
        
        category.addEventListener("click", async () => {
            console.log('test OK')
            await trailHistory(category.dataset.type)
            
            targetPage = 1
            await updatePages();

        },{ once: true });
    });

}




////PAGE 1 SUBS
async function Page1() {
    targetPage = 1;

   // await displaySubs()

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