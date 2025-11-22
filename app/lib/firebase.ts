import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { Tournament, PlayerRegistration, TournamentStatus } from "./types";

// Convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Date to Firestore timestamp
const toTimestamp = (date: Date): any => {
  return Timestamp.fromDate(date);
};

// Tournament CRUD operations
export const createTournament = async (
  tournament: Omit<Tournament, "id" | "createdAt" | "updatedAt" | "registeredSlots">,
) => {
  try {
    // Build a clean object without any undefined optional fields so Firestore
    // never receives unsupported values.
    const status = (tournament.status ?? "upcoming") as TournamentStatus;
    const base: any = {
      name: tournament.name,
      description: tournament.description,
      mode: tournament.mode,
      type: tournament.type,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      maxSlots: tournament.maxSlots,
      status,

      startTime: toTimestamp(tournament.startTime),
      endTime: tournament.endTime ? toTimestamp(tournament.endTime) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      registeredSlots: 0,
    };

    if (typeof tournament.prizeDistribution === "string") {
      base.prizeDistribution = tournament.prizeDistribution;
    } else {
      base.prizeDistribution = null;
    }

    if (typeof (tournament as any).roomId === "string") {
      base.roomId = (tournament as any).roomId;
    }

    if (typeof (tournament as any).roomPassword === "string") {
      base.roomPassword = (tournament as any).roomPassword;
    }

    const docRef = await addDoc(collection(db, "tournaments"), base);
    return { id: docRef.id, ...tournament };
  } catch (error) {
    console.error("Error creating tournament:", error);
    throw error;
  }
};

export const getTournaments = async (status?: TournamentStatus): Promise<Tournament[]> => {
  try {
    let q = query(collection(db, "tournaments"));
    
    if (status) {
      q = query(collection(db, "tournaments"), where("status", "==", status));
    }
    
    q = query(q, orderBy("startTime", "asc"));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: toDate(data.startTime),
        endTime: data.endTime ? toDate(data.endTime) : undefined,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt)
      } as Tournament;
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startTime: toDate(data.startTime),
        endTime: data.endTime ? toDate(data.endTime) : undefined,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt)
      } as Tournament;
    }
    return null;
  } catch (error) {
    console.error("Error fetching tournament:", error);
    throw error;
  }
};

export const updateTournament = async (id: string, updates: Partial<Tournament>) => {
  try {
    const tournamentRef = doc(db, "tournaments", id);
    
    // Handle date conversions
    const updateData: any = { ...updates, updatedAt: serverTimestamp() };
    
    if (updates.startTime) {
      updateData.startTime = toTimestamp(updates.startTime);
    }
    
    if (updates.endTime) {
      updateData.endTime = toTimestamp(updates.endTime);
    }
    
    await updateDoc(tournamentRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating tournament:", error);
    throw error;
  }
};

export const deleteTournament = async (id: string) => {
  try {
    await deleteDoc(doc(db, "tournaments", id));
    return true;
  } catch (error) {
    console.error("Error deleting tournament:", error);
    throw error;
  }
};

// Player Registration operations
export const registerPlayer = async (registration: Omit<PlayerRegistration, 'id' | 'registrationTime'>) => {
  try {
    const registrationData = {
      ...registration,
      registrationTime: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "registrations"), registrationData);
    
    // Update tournament registered slots count
    const tournament = await getTournamentById(registration.tournamentId);
    if (tournament) {
      await updateTournament(registration.tournamentId, {
        registeredSlots: tournament.registeredSlots + 1
      });
    }
    
    return { id: docRef.id, ...registration };
  } catch (error) {
    console.error("Error registering player:", error);
    throw error;
  }
};

export const getPlayerRegistrations = async (userId: string): Promise<PlayerRegistration[]> => {
  try {
    const q = query(
      collection(db, "registrations"), 
      where("userId", "==", userId),
      orderBy("registrationTime", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        registrationTime: toDate(data.registrationTime)
      } as PlayerRegistration;
    });
  } catch (error) {
    console.error("Error fetching player registrations:", error);
    throw error;
  }
};

export const getTournamentRegistrations = async (tournamentId: string): Promise<PlayerRegistration[]> => {
  try {
    const q = query(
      collection(db, "registrations"), 
      where("tournamentId", "==", tournamentId),
      orderBy("registrationTime", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        registrationTime: toDate(data.registrationTime)
      } as PlayerRegistration;
    });
  } catch (error) {
    console.error("Error fetching tournament registrations:", error);
    throw error;
  }
};

export const unregisterPlayer = async (registrationId: string, tournamentId: string) => {
  try {
    await deleteDoc(doc(db, "registrations", registrationId));
    
    // Update tournament registered slots count
    const tournament = await getTournamentById(tournamentId);
    if (tournament) {
      await updateTournament(tournamentId, {
        registeredSlots: Math.max(0, tournament.registeredSlots - 1)
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error unregistering player:", error);
    throw error;
  }
};