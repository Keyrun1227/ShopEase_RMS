var firebaseConfig = {
  apiKey: "AIzaSyCBrT2na1eqUs2Cwu3H9TlALaF6AGF-_14",
  authDomain: "moreapp-a6598.firebaseapp.com",
  databaseURL: "https://moreapp-a6598-default-rtdb.firebaseio.com",
  projectId: "moreapp-a6598",
  storageBucket: "moreapp-a6598.appspot.com",
  messagingSenderId: "529818442557",
  appId: "1:529818442557:web:f26576b5a2783d335c4354",
  measurementId: "G-0M36L43FZD",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

function getRupeeValue(value) {
  return parseFloat(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    style: "currency",
    currency: "INR",
  });
}
