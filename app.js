import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase конфіг
const firebaseConfig = {
  apiKey: "AIzaSyBhyucLkaEKzzFirNoYuNHAMnbiDd8_vHg",
  authDomain: "spogady-map.firebaseapp.com",
  projectId: "spogady-map",
  storageBucket: "spogady-map.appspot.com",
  messagingSenderId: "772600864295",
  appId: "1:772600864295:web:371f05287be64c04867802",
  measurementId: "G-TJC2YH0JVF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const map = L.map('map').setView([48.3794, 31.1656], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectedLatLng = null;
map.on('click', function(e) {
  selectedLatLng = e.latlng;
  L.popup().setLatLng(e.latlng).setContent("Тут буде ваш спогад.").openOn(map);
});

document.getElementById("saveBtn").onclick = async function () {
  const name = document.getElementById("name").value.trim();
  const memory = document.getElementById("memory").value.trim();

  if (!selectedLatLng || !name || !memory) {
    alert("Будь ласка, заповніть усі поля та виберіть точку на карті.");
    return;
  }

  await addDoc(collection(db, "memories"), {
    name,
    memory,
    lat: selectedLatLng.lat,
    lng: selectedLatLng.lng,
    timestamp: serverTimestamp()
  });

  document.getElementById("name").value = "";
  document.getElementById("memory").value = "";
};

onSnapshot(collection(db, "memories"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    if (change.type === "added") {
      const marker = L.marker([data.lat, data.lng]).addTo(map);
      marker.bindPopup(`<b>${data.name}</b><br>${data.memory}`);
    }
  });
});
