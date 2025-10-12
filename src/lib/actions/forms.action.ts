"use server";

import { db } from "../firebase/server";
import { Form, FormStatus } from "../domains/forms.domain";

// Collection information
const FORMS_COLLECTION = "forms";

// Extended interface for form with timestamps
interface FormWithTimestamps extends Form {
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to serialize Firestore data for client components
function serializeForm(
  data: FirebaseFirestore.DocumentData
): FormWithTimestamps {
  return {
    ...data,
    submitted_at: data.submitted_at?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as FormWithTimestamps;
}

// Create a new form
export async function createForm(
  form: Omit<Form, "$id" | "submitted_at" | "status" | "has_view">
) {
  try {
    const docRef = await db.collection(FORMS_COLLECTION).add({
      name: form.name,
      email: form.email,
      phone: form.phone,
      age: form.age,
      nationality: form.nationality,
      gender: form.gender,
      requirement: form.requirement,
      ref_code_id: form.ref_code_id,
      submitted_at: new Date(),
      status: FormStatus.SUBMITTED,
      has_view: false, // Default to false when form is created
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeForm(data!),
      },
    };
  } catch (error) {
    console.error("Error creating form:", error);
    return {
      success: false,
      error: "Failed to create form",
    };
  }
}

// Get a specific form by ID
export async function getForm(formId: string) {
  try {
    const doc = await db.collection(FORMS_COLLECTION).doc(formId).get();

    if (!doc.exists) {
      return {
        success: false,
        error: "Form not found",
      };
    }

    const data = doc.data();
    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeForm(data!),
      },
    };
  } catch (error) {
    console.error("Error fetching form:", error);
    return {
      success: false,
      error: "Failed to fetch form",
    };
  }
}

// Get all forms with optional filters
export async function getForms(filters?: { status?: FormStatus }) {
  try {
    let query = db
      .collection(FORMS_COLLECTION)
      .orderBy("submitted_at", "desc")
      .limit(10000);

    if (filters?.status !== undefined) {
      query = query.where("status", "==", filters.status);
    }

    const snapshot = await query.get();
    const documents = snapshot.docs.map((doc) => ({
      $id: doc.id,
      ...serializeForm(doc.data()),
    }));

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return {
      success: false,
      error: "Failed to fetch forms",
    };
  }
}

// Get forms that use specific reference codes (for admin filtering)
export async function getFormsByRefCodes(
  refCodes: string[],
  filters?: { status?: FormStatus }
) {
  try {
    if (refCodes.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    let query = db
      .collection(FORMS_COLLECTION)
      .where("ref_code_id", "in", refCodes.slice(0, 10)) // Firestore 'in' limit is 10
      .orderBy("submitted_at", "desc")
      .limit(10000);

    if (filters?.status !== undefined) {
      query = query.where("status", "==", filters.status);
    }

    const snapshot = await query.get();
    let documents = snapshot.docs.map((doc) => ({
      $id: doc.id,
      ...serializeForm(doc.data()),
    }));

    // If we have more than 10 ref codes, we need multiple queries
    if (refCodes.length > 10) {
      const chunks = [];
      for (let i = 10; i < refCodes.length; i += 10) {
        chunks.push(refCodes.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        let chunkQuery = db
          .collection(FORMS_COLLECTION)
          .where("ref_code_id", "in", chunk)
          .orderBy("submitted_at", "desc")
          .limit(10000);

        if (filters?.status !== undefined) {
          chunkQuery = chunkQuery.where("status", "==", filters.status);
        }

        const chunkSnapshot = await chunkQuery.get();
        const chunkDocuments = chunkSnapshot.docs.map((doc) => ({
          $id: doc.id,
          ...serializeForm(doc.data()),
        }));
        documents = documents.concat(chunkDocuments);
      }
    }

    // Sort all documents by submission date
    documents.sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching forms by ref codes:", error);
    return {
      success: false,
      error: "Failed to fetch forms",
    };
  }
}

// Update a form
export async function updateForm(
  formId: string,
  updateData: Partial<Omit<Form, "$id">>
) {
  try {
    const docRef = db.collection(FORMS_COLLECTION).doc(formId);

    await docRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeForm(data!),
      },
    };
  } catch (error) {
    console.error("Error updating form:", error);
    return {
      success: false,
      error: "Failed to update form",
    };
  }
}

// Update form status
export async function updateFormStatus(formId: string, status: FormStatus) {
  return updateForm(formId, { status });
}

// Mark form as viewed
export async function markFormAsViewed(formId: string) {
  return updateForm(formId, { has_view: true });
}

// Mark form as unread
export async function markFormAsUnread(formId: string) {
  return updateForm(formId, { has_view: false });
}

// Delete a form
export async function deleteForm(formId: string) {
  try {
    await db.collection(FORMS_COLLECTION).doc(formId).delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting form:", error);
    return {
      success: false,
      error: "Failed to delete form",
    };
  }
}
