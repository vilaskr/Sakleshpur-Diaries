import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'owner' | 'manager' | 'agent' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'admin_users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setRole(userDoc.data().role as Role);
          } else if (currentUser.email?.toLowerCase() === 'vilaskr762@gmail.com') {
            // Auto-create admin doc for the primary owner
            const newAdmin = {
              email: currentUser.email,
              role: 'owner',
              createdAt: Date.now()
            };
            try {
              await setDoc(userDocRef, newAdmin);
              setRole('owner');
            } catch (e) {
              console.error("Failed to auto-create admin doc", e);
              setRole('owner'); // Still set role in context so UI works
            }
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
