import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, getDoc, doc, setDoc, collection, getDocs, updateDoc  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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


  

  export async function fetchContactList() {
    const querySnapshot = await getDocs(collection(db, "contactList")); // Assuming 'contacts' is the collection name
    const contactList = [];
    
    querySnapshot.forEach((doc) => {
        // Push the document's data with the document id to the list
        contactList.push({ id: doc.id, ...doc.data() }); // doc.id is the document ID, doc.data() is the fields inside the document
    });
    
    return contactList; // Return the array of contacts
}


export async function updateContactInFirebase(contact) {
    const contactRef = doc(db, "contactList", contact.id); // Reference the document using its ID
    try {
        await setDoc(contactRef, contact); // Update the document with new data
        console.log('Document successfully updated!');
    } catch (error) {
        console.error('Error updating document:', error);
    }
}

export async function fetchContactById(contactId) {
    const docRef = doc(db, "contactList", contactId); // Reference to the document
    try {
        const docSnap = await getDoc(docRef);  // Fetch the document
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };  // If the document exists, return the data
        } else {
            console.log("No such document!");
            return null;  // Handle the case where the document doesn't exist
        }
    } catch (error) {
        console.error('Error getting document:', error);
        return null;  // Return null in case of error
    }
}




  export async function fetchStockPC() {
    try {
        const personnelCollection = collection(db, 'stockPc'); // Reference to 'personnel' collection
        const personnelSnapshot = await getDocs(personnelCollection); // Fetch the documents in the collection
        const personnelList = personnelSnapshot.docs.map(doc => doc.data()); // Get the document data

        return personnelList;
    } catch (error) {
        console.error("Error fetching personnel data:", error);
    }
}






  export async function fetchPersonnel() {
    try {
        const personnelCollection = collection(db, 'personnel'); // Reference to 'personnel' collection
        const personnelSnapshot = await getDocs(personnelCollection); // Fetch the documents in the collection
        const personnelList = personnelSnapshot.docs.map(doc => doc.data()); // Get the document data

        return personnelList;
    } catch (error) {
        console.error("Error fetching personnel data:", error);
    }
}

export async function updateUserInFirebase(userIPN, updatedUserData) {
    try {
        // Reference to the specific document in the 'personnel' collection
        const userDocRef = doc(db, 'personnel', userIPN); // Assuming userIPN is the document ID

        // Update the document with new data
        await updateDoc(userDocRef, updatedUserData);

        console.log('User data updated successfully in Firebase!');
    } catch (error) {
        console.error('Error updating user in Firebase:', error);
    }
}












  // Generic function to fetch dynamic count for any material
export const getMaterialDynamicCount = async (materialName) => {
    try {
        const docRef = doc(db, "materialAmount", materialName); // Material name determines the document
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().count;  // Assuming 'count' holds the value
        } else {
            console.log(`No such document for ${materialName}!`);
            return 0;
        }
    } catch (error) {
        console.error(`Error fetching ${materialName} count: `, error);
        return 0;
    }
};
export async function updateMaterialDynamicCount(material, count) {
    const materialDoc = doc(db, 'materialAmount', material);
    await setDoc(materialDoc, { count: count }, { merge: true });
}
