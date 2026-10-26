// Firebase Admin SDK bootstrap for Cloud Functions.
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./firebase-service-account.json" with { type: "json" };
initializeApp({ credential: cert(serviceAccount) });
export const db = getFirestore();
