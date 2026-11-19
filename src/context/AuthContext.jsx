import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export const ADMIN_EMAIL = "sdivyanshu352@gmail.com";

const AuthContext = createContext({
  currentUser: null,
  isAdmin: false,
  loadingAuth: true,
  userProfile: null,
  savedJobIds: new Set(),
  loginWithGoogle: async () => {},
  logout: async () => {},
  toggleSaveJob: async () => {},
  isJobSaved: () => false,
  updateUserProfile: async () => {},
  saveUserResume: async () => {},
  deleteUserResume: async () => {},
  saveAtsEvaluation: async () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Subscribe to user auth state & real-time profile/saved jobs
  useEffect(() => {
    let unsubSavedJobs = null;
    let unsubProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAdmin(user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

        // Ensure user document exists in Firestore
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split("@")[0],
              photoURL: user.photoURL || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          // Realtime listener on user profile (with error callback to avoid uncaught listener error)
          unsubProfile = onSnapshot(
            userRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setUserProfile({ id: docSnap.id, ...docSnap.data() });
              }
            },
            (err) => {
              console.warn("User profile realtime sync warning:", err.message);
            }
          );

          // Realtime listener on saved jobs collection (with error callback to avoid uncaught listener error)
          const savedJobsCol = collection(db, "users", user.uid, "savedJobs");
          unsubSavedJobs = onSnapshot(
            savedJobsCol,
            (querySnap) => {
              const ids = new Set();
              querySnap.forEach((d) => ids.add(d.id));
              setSavedJobIds(ids);
            },
            (err) => {
              console.warn("Saved jobs realtime sync warning:", err.message);
            }
          );
        } catch (err) {
          console.error("Error setting up user profile listeners:", err);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setUserProfile(null);
        setSavedJobIds(new Set());
        if (unsubSavedJobs) unsubSavedJobs();
        if (unsubProfile) unsubProfile();
      }
      setLoadingAuth(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubSavedJobs) unsubSavedJobs();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      console.error("Google login failed", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed", err);
      throw err;
    }
  };

  // Toggle Save / Bookmark a Job
  const toggleSaveJob = useCallback(
    async (job) => {
      if (!currentUser) {
        throw new Error("Please log in to save jobs to your profile.");
      }
      const targetJobId = String(job.id || job.jobId || "");
      if (!targetJobId) {
        throw new Error("Invalid job record: missing job ID.");
      }

      const jobRef = doc(db, "users", currentUser.uid, "savedJobs", targetJobId);
      if (savedJobIds.has(targetJobId)) {
        await deleteDoc(jobRef);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(targetJobId);
          return next;
        });
        return false; // un-saved
      } else {
        await setDoc(jobRef, {
          jobId: targetJobId,
          userId: currentUser.uid,
          savedAt: serverTimestamp(),
          title: job.title || "Untitled Position",
          company: job.company || "Company",
          location: job.location || "India",
          jobType: job.jobType || "Full Time",
          experience: job.experience || "Not Disclosed",
          salary: job.salary || "Competitive",
          url: job.url || job.applyUrl || "",
          domain: job.domain || "",
        });
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.add(targetJobId);
          return next;
        });
        return true; // saved
      }
    },
    [currentUser, savedJobIds]
  );

  const isJobSaved = useCallback(
    (jobId) => {
      return savedJobIds.has(jobId);
    },
    [savedJobIds]
  );

  // Update user profile fields (headline, phone, targetRole, etc.)
  const updateUserProfile = useCallback(
    async (fields) => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          ...fields,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [currentUser]
  );

  // Save / Update Default Resume metadata and extracted text
  const saveUserResume = useCallback(
    async (resumeData) => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          defaultResume: {
            ...resumeData,
            updatedAt: Date.now(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [currentUser]
  );

  // Delete User Default Resume
  const deleteUserResume = useCallback(async () => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        defaultResume: null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [currentUser]);

  // Save ATS evaluation to user's history
  const saveAtsEvaluation = useCallback(
    async (evalData) => {
      if (!currentUser) return;
      const historyRef = doc(
        collection(db, "users", currentUser.uid, "atsHistory")
      );
      await setDoc(historyRef, {
        id: historyRef.id,
        ...evalData,
        evaluatedAt: Date.now(),
      });
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loadingAuth,
        userProfile,
        savedJobIds,
        loginWithGoogle,
        logout,
        toggleSaveJob,
        isJobSaved,
        updateUserProfile,
        saveUserResume,
        deleteUserResume,
        saveAtsEvaluation,
        adminEmail: ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
