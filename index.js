const db = firebase.firestore();

const gratitudeForm = document.getElementById("gratitude-form");

const gratitudesContainer = document.getElementById("gratitudes-container");

let editStatus = false;
let id = '';

/**
 * Save a New gratitude in Firestore
 * @param {string} date the date of the gratitude
 * @param {string} description the description of the gratitude
 */
const saveGratitude = (date, description) =>
    db.collection("gratitudes").doc().set({
        date,
        description,
    });

const getGratitudes = () => db.collection("gratitudes").get();

const onGetGratitudes = (callback) => db.collection("gratitudes").onSnapshot(callback);

const deleteGratitude = (id) => db.collection("gratitudes").doc(id).delete();

const getGratitude = (id) => db.collection("gratitudes").doc(id).get();

const updateGratitude = (id, updatedGratitude) => db.collection('gratitudes').doc(id).update(updatedGratitude);

window.addEventListener("DOMContentLoaded", async(e) => {
    onGetGratitudes((querySnapshot) => {
        gratitudesContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const gratitude = doc.data();

            gratitudesContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
    <h3 class="h5">${gratitude.date}</h3>
    <p>${gratitude.description}</p>
    <div>
      <button class="btn btn-primary btn-delete" data-id="${doc.id}">
        🗑 Delete
      </button>
      <button class="btn btn-secondary btn-edit" data-id="${doc.id}">
        🖉 Edit
      </button>
    </div>
  </div>`;
        });

        const btnsDelete = gratitudesContainer.querySelectorAll(".btn-delete");
        btnsDelete.forEach((btn) =>
            btn.addEventListener("click", async(e) => {
                console.log(e.target.dataset.id);
                try {
                    await deleteGratitude(e.target.dataset.id);
                } catch (error) {
                    console.log(error);
                }
            })
        );

        const btnsEdit = gratitudesContainer.querySelectorAll(".btn-edit");
        btnsEdit.forEach((btn) => {
            btn.addEventListener("click", async(e) => {
                try {
                    const doc = await getGratitude(e.target.dataset.id);
                    const gratitude = doc.data();
                    gratitudeForm["gratitude-date"].value = gratitude.date;
                    gratitudeForm["gratitude-description"].value = gratitude.description;

                    editStatus = true;
                    id = doc.id;
                    gratitudeForm["btn-gratitude-form"].innerText = "Update";

                } catch (error) {
                    console.log(error);
                }
            });
        });
    });
});

gratitudeForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const date = gratitudeForm["gratitude-date"];
    const description = gratitudeForm["gratitude-description"];

    try {
        if (!editStatus) {
            await saveGratitude(date.value, description.value);
        } else {
            await updateGratitude(id, {
                date: date.value,
                description: description.value,
            })

            editStatus = false;
            id = '';
            gratitudeForm['btn-gratitude-form'].innerText = 'Save';
        }

        gratitudeForm.reset();
        date.focus();
    } catch (error) {
        console.log(error);
    }
});