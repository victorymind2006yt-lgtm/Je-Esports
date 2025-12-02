import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { Tournament, TournamentStatus } from "./types";

/**
 * Updates tournament states based on time:
 * - upcoming → ongoing (when current time passes start time)
 * - ongoing → completed (when current time passes end time)
 * - completed → awaiting_payout (1 minute after end time)
 */
export const updateTournamentStates = async (): Promise<{
  updated: number,
  startedCount: number,
  completedCount: number,
  awaitingPayoutCount: number
}> => {
  const now = new Date();
  const currentTimestamp = Timestamp.fromDate(now);

  // 1 minute ago for the awaiting_payout check
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneMinuteAgoTimestamp = Timestamp.fromDate(oneMinuteAgo);

  let startedCount = 0;
  let completedCount = 0;
  let awaitingPayoutCount = 0;

  try {
    // 1. upcoming -> ongoing
    const upcomingQuery = query(
      collection(db, "tournaments"),
      where("status", "==", "upcoming"),
      where("startTime", "<=", currentTimestamp)
    );

    const upcomingSnapshot = await getDocs(upcomingQuery);
    const upcomingPromises = upcomingSnapshot.docs.map(async (docSnapshot) => {
      await updateDoc(doc(db, "tournaments", docSnapshot.id), {
        status: "ongoing"
      });
      startedCount++;
    });

    // 2. ongoing -> completed
    const ongoingQuery = query(
      collection(db, "tournaments"),
      where("status", "in", ["upcoming", "ongoing"]),
      where("endTime", "<=", currentTimestamp)
    );

    const ongoingSnapshot = await getDocs(ongoingQuery);
    const ongoingPromises = ongoingSnapshot.docs.map(async (docSnapshot) => {
      // Only update if it's not already completed or further
      const data = docSnapshot.data();
      if (data.status !== "completed" && data.status !== "awaiting_payout" && data.status !== "paid") {
        await updateDoc(doc(db, "tournaments", docSnapshot.id), {
          status: "completed"
        });
        completedCount++;
      }
    });

    // 3. completed -> awaiting_payout
    // We want to find tournaments that are 'completed' AND their endTime was more than 1 minute ago
    const completedQuery = query(
      collection(db, "tournaments"),
      where("status", "==", "completed"),
      where("endTime", "<=", oneMinuteAgoTimestamp)
    );

    const completedSnapshot = await getDocs(completedQuery);
    const completedPromises = completedSnapshot.docs.map(async (docSnapshot) => {
      await updateDoc(doc(db, "tournaments", docSnapshot.id), {
        status: "awaiting_payout"
      });
      awaitingPayoutCount++;
    });

    // Wait for all updates to complete
    await Promise.all([...upcomingPromises, ...ongoingPromises, ...completedPromises]);

    return {
      updated: startedCount + completedCount + awaitingPayoutCount,
      startedCount,
      completedCount,
      awaitingPayoutCount
    };
  } catch (error) {
    console.error("Error updating tournament states:", error);
    throw error;
  }
};

/**
 * Utility function to check if a tournament needs a state update
 * Returns the new state if update is needed, null otherwise
 */
export const checkTournamentState = (tournament: Tournament): TournamentStatus | null => {
  const now = new Date();

  // Check for completed -> awaiting_payout (1 minute buffer)
  if (tournament.status === "completed" && tournament.endTime) {
    const payoutTime = new Date(tournament.endTime.getTime() + 60 * 1000); // 1 minute after end
    if (now >= payoutTime) {
      return "awaiting_payout";
    }
  }

  // Check for ongoing -> completed
  if ((tournament.status === "ongoing" || tournament.status === "upcoming") &&
    tournament.endTime && tournament.endTime <= now) {
    return "completed";
  }

  // Check for upcoming -> ongoing
  if (tournament.status === "upcoming" && tournament.startTime <= now) {
    return "ongoing";
  }

  // No state change needed
  return null;
};
