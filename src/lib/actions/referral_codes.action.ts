"use server";

import { db } from "../firebase/server";
import { ReferralCode } from "../domains/referral_codes.domain";

// Collection information
const REFERRAL_CODES_COLLECTION = "referralCodes";

// Extended interface for referral code with timestamps
interface ReferralCodeWithTimestamps extends ReferralCode {
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to serialize Firestore data for client components
function serializeReferralCode(
  data: FirebaseFirestore.DocumentData
): ReferralCodeWithTimestamps {
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as ReferralCodeWithTimestamps;
}

// Create a new referral code
export async function createReferralCode(
  referralCode: Omit<ReferralCode, "$id">
) {
  try {
    const docRef = await db.collection(REFERRAL_CODES_COLLECTION).add({
      code: referralCode.code,
      createdBy: referralCode.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeReferralCode(data!),
      },
    };
  } catch (error) {
    console.error("Error creating referral code:", error);
    return {
      success: false,
      error: "Failed to create referral code",
    };
  }
}

// Get a specific referral code by ID
export async function getReferralCode(referralCodeId: string) {
  try {
    const doc = await db
      .collection(REFERRAL_CODES_COLLECTION)
      .doc(referralCodeId)
      .get();

    if (!doc.exists) {
      return {
        success: false,
        error: "Referral code not found",
      };
    }

    const data = doc.data();
    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeReferralCode(data!),
      },
    };
  } catch (error) {
    console.error("Error fetching referral code:", error);
    return {
      success: false,
      error: "Failed to fetch referral code",
    };
  }
}

// Find a referral code by its code value
export async function findReferralCodeByCode(code: string) {
  try {
    const snapshot = await db
      .collection(REFERRAL_CODES_COLLECTION)
      .where("code", "==", code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        error: "Referral code not found",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeReferralCode(data!),
      },
    };
  } catch (error) {
    console.error("Error finding referral code:", error);
    return {
      success: false,
      error: "Failed to find referral code",
    };
  }
}

// Get all referral codes
export async function getAllReferralCodes() {
  try {
    const snapshot = await db
      .collection(REFERRAL_CODES_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    const documents = snapshot.docs.map((doc) => ({
      $id: doc.id,
      ...serializeReferralCode(doc.data()),
    }));

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching all referral codes:", error);
    return {
      success: false,
      error: "Failed to fetch referral codes",
    };
  }
}

// Get referral codes created by a specific user
export async function getReferralCodesByCreator(createdBy: string) {
  try {
    const snapshot = await db
      .collection(REFERRAL_CODES_COLLECTION)
      .where("createdBy", "==", createdBy)
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    const documents = snapshot.docs.map((doc) => ({
      $id: doc.id,
      ...serializeReferralCode(doc.data()),
    }));

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching referral codes by creator:", error);
    return {
      success: false,
      error: "Failed to fetch referral codes",
    };
  }
}

// Get referral code values created by a specific user (for filtering forms)
export async function getReferralCodeValuesByCreator(
  createdBy: string
): Promise<string[]> {
  try {
    const snapshot = await db
      .collection(REFERRAL_CODES_COLLECTION)
      .where("createdBy", "==", createdBy)
      .get();

    const codes = snapshot.docs.map((doc) => doc.data().code as string);
    return codes;
  } catch (error) {
    console.error("Error fetching referral code values by creator:", error);
    return [];
  }
}

// Update a referral code
export async function updateReferralCode(
  referralCodeId: string,
  updatedCode: string
) {
  try {
    const docRef = db.collection(REFERRAL_CODES_COLLECTION).doc(referralCodeId);

    await docRef.update({
      code: updatedCode,
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeReferralCode(data!),
      },
    };
  } catch (error) {
    console.error("Error updating referral code:", error);
    return {
      success: false,
      error: "Failed to update referral code",
    };
  }
}

// Delete a referral code
export async function deleteReferralCode(referralCodeId: string) {
  try {
    await db.collection(REFERRAL_CODES_COLLECTION).doc(referralCodeId).delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting referral code:", error);
    return {
      success: false,
      error: "Failed to delete referral code",
    };
  }
}

// Check if referral code exists
export async function validateReferralCode(code: string) {
  try {
    const result = await findReferralCodeByCode(code);
    return {
      success: result.success,
      valid: result.success,
    };
  } catch (error) {
    console.error("Error validating referral code:", error);
    return {
      success: false,
      valid: false,
      error: "Failed to validate referral code",
    };
  }
}
