import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, getDoc, doc, setDoc, collection, getDocs, updateDoc, deleteDoc, addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAt0x4UEocfK2skKuABAwym2fG_o4nP1bs",
    authDomain: "test-1aaff.firebaseapp.com",
    projectId: "test-1aaff",
    storageBucket: "test-1aaff.firebasestorage.app",
    messagingSenderId: "153349488252",
    appId: "1:153349488252:web:c6339f2c475d79d1f093f9"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);



   
    export async function addIssueToFirestore(subId, inputFieldValue, parentType) {

        try {
            const docRef = doc(db, parentType, subId); // Reference to document
            const docSnap = await getDoc(docRef);
    
            let existingIssues = [];
    
            if (docSnap.exists()) {
                const docData = docSnap.data();
                existingIssues = Array.isArray(docData.issues) ? docData.issues : []; // Ensure it's an array
            }
    
            // Create new issue object
            const newIssue = {
                name: inputFieldValue,
                solution: "solution here"
            };
    
            // Append new issue
            const updatedIssues = [...existingIssues, newIssue];
    
            // Update Firestore
            await updateDoc(docRef, { issues: updatedIssues });
    
            console.log("Issue added successfully!");
        } catch (error) {
            console.error("Error adding issue:", error);
        }
    }
    






    export async function addNewSub(type, subName) {
       
    
        // Firestore reference with the user-defined subName as the document ID
        const subRef = doc(db, type, subName);
    
        try {
            await setDoc(subRef, {
                description: "",
                issues: {},
                contactList: {contactPerson: "",contactPersonEmail: "",contactPersonBackup:"",assignmentGroup: "", name:"", Scope:"Other" }
            });
    
            console.log("Sub added successfully:", subName);
    
            // Refresh the list
        } catch (error) {
            console.error("Error adding sub:", error);
        }
    }


  

export async function fetchInternSubs() {
    const querySnapshot = await getDocs(collection(db, "supportIntern"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchExternSubs() {
    const querySnapshot = await getDocs(collection(db, "supportExtern"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchSupportSubs() {
    const querySnapshot = await getDocs(collection(db, "supportSupport"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateSubDescription(subId, newDescription, parentType) {

    const subRef = doc(db, parentType, subId); // Correct Firestore path

    try {
        await updateDoc(subRef, {
            description: newDescription
        });
        console.log(`Description updated in ${parentType}`);
    } catch (error) {
        console.error("Error updating Firestore:", error);
    }
}

export async function updateIssueDescription(subId, newDescription, parentType, issueName){
    
    try {
        const subRef = doc(db, parentType, subId); // Get document reference

        // Get the current sub document data
        const subSnap = await getDoc(subRef);
        if (!subSnap.exists()) {
            console.error("Sub not found.");
            return;
        }

        let currentSub = subSnap.data(); // Get sub data

        // Find the issue to update
        let issueIndex = currentSub.issues.findIndex(issue => issue.name === issueName);

        if (issueIndex === -1) {
            console.error("Issue not found:", issueName);
            return;
        }

        // Get the issue object and create an updated version
        let updatedIssue = { ...currentSub.issues[issueIndex], solution: newDescription };

        // Remove the old issue and add the updated issue
        let updatedIssues = [...currentSub.issues];
        updatedIssues[issueIndex] = updatedIssue; // Replace the old issue

        // Update the document with the modified issues array
        await updateDoc(subRef, { issues: updatedIssues });

        console.log(`Solution updated in ${parentType}`);
    } catch (error) {
        console.error("Error updating Firestore:", error);
    }


}



export async function updateContactInfo(subId, updatedInfo, parentType) {


    try {
        const contactRef = doc(db, parentType, subId);  // Reference to document
        await updateDoc(contactRef,{
            contactList: updatedInfo
        } );  
        console.log("Contact info updated successfully!");
    } catch (error) {
        console.error("Error updating contact info:", error);
    }
}



// export async function updateContactInFirebase(contact) {
//     const contactRef = doc(db, "contactList", contact.id); // Reference the document using its ID
//     try {
//         await setDoc(contactRef, contact); // Update the document with new data
//         console.log('Document successfully updated!');
//     } catch (error) {
//         console.error('Error updating document:', error);
//     }
// }

// export async function fetchContactById(contactId) {
//     const docRef = doc(db, "contactList", contactId); // Reference to the document
//     try {
//         const docSnap = await getDoc(docRef);  // Fetch the document
//         if (docSnap.exists()) {
//             return { id: docSnap.id, ...docSnap.data() };  // If the document exists, return the data
//         } else {
//             console.log("No such document!");
//             return null;  // Handle the case where the document doesn't exist
//         }
//     } catch (error) {
//         console.error('Error getting document:', error);
//         return null;  // Return null in case of error
//     }
// }


// export async function addContactToDatabase(contactId, contactData) {
//     try {
//         // Set the document with the user-defined contact ID
//         const contactRef = doc(db, "contactList", contactId);
//         await setDoc(contactRef, contactData);
//         console.log("Contact added successfully with ID: ", contactId);
//     } catch (error) {
//         console.error("Error adding contact:", error);
//     }
// }

// // Function to delete multiple contacts from the database
// export async function deleteContactsFromDatabase(contactIds) {
//     try {
//         for (const id of contactIds) {
//             await deleteDoc(doc(db, "contactList", id)); // Delete from Firestore
//         }
//         console.log("Contacts deleted successfully!");
//     } catch (error) {
//         console.error("Error deleting contacts:", error);
//     }
// }








//   export async function fetchStockPC() {
//     try {
//         const personnelCollection = collection(db, 'stockPc'); // Reference to 'personnel' collection
//         const personnelSnapshot = await getDocs(personnelCollection); // Fetch the documents in the collection
//         const personnelList = personnelSnapshot.docs.map(doc => doc.data()); // Get the document data

//         return personnelList;
//     } catch (error) {
//         console.error("Error fetching personnel data:", error);
//     }
// }






//   export async function fetchPersonnel() {
//     try {
//         const personnelCollection = collection(db, 'personnel'); // Reference to 'personnel' collection
//         const personnelSnapshot = await getDocs(personnelCollection); // Fetch the documents in the collection
//         const personnelList = personnelSnapshot.docs.map(doc => doc.data()); // Get the document data

//         return personnelList;
//     } catch (error) {
//         console.error("Error fetching personnel data:", error);
//     }
// }

// export async function updateUserInFirebase(userIPN, updatedUserData) {
//     try {
//         // Reference to the specific document in the 'personnel' collection
//         const userDocRef = doc(db, 'personnel', userIPN); // Assuming userIPN is the document ID

//         // Update the document with new data
//         await updateDoc(userDocRef, updatedUserData);

//         console.log('User data updated successfully in Firebase!');
//     } catch (error) {
//         console.error('Error updating user in Firebase:', error);
//     }
// }












  // Generic function to fetch dynamic count for any material
// export const getMaterialDynamicCount = async (materialName) => {
//     try {
//         const docRef = doc(db, "materialAmount", materialName); // Material name determines the document
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//             return docSnap.data().count;  // Assuming 'count' holds the value
//         } else {
//             console.log(`No such document for ${materialName}!`);
//             return 0;
//         }
//     } catch (error) {
//         console.error(`Error fetching ${materialName} count: `, error);
//         return 0;
//     }
// };
// export async function updateMaterialDynamicCount(material, count) {
//     const materialDoc = doc(db, 'materialAmount', material);
//     await setDoc(materialDoc, { count: count }, { merge: true });
// }
