// This script sets a custom 'admin' claim on a Firebase user account.
// IMPORTANT: To run this, you must first download your project's service account key
// from the Firebase Console: Project settings > Service accounts > Generate new private key.
// Save the downloaded JSON file in your project's root directory.

const admin = require('firebase-admin');

// --- CONFIGURATION ---
// 1. Replace with the path to your service account key file.
const serviceAccount = require('../../project1-71847-firebase-adminsdk-xxxxx-xxxxxxxxxx.json'); 
// 2. Replace with the UID of the user you want to make an admin.
// You can find a user's UID in the Firebase Console under Authentication > Users.
const uid = 'USER_UID_TO_MAKE_ADMIN'; 
// --- END CONFIGURATION ---


// Initialize the Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        console.log('Firebase Admin SDK already initialized.');
    } else {
        console.error('Error initializing Firebase Admin SDK:', error);
        process.exit(1);
    }
}


// Set the custom claim for the user
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('The user will have admin privileges on their next login.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });
