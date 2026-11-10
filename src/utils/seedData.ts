import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../app/firebase';
import { categoryRepository } from '../repositories/categoryRepository';

const DUMMY_USER_IDS = ['usr_super_admin', 'usr_admin', 'usr_employee'];
const DUMMY_EMAILS = [
  'superadmin@company.com',
  'admin@company.com',
  'employee@company.com',
];
const DUMMY_PROJECT_IDS = [
  'proj_gemini_assist',
  'proj_cloud_metrics',
  'proj_design_system',
  'proj_secure_vault',
  'proj_pending_demo',
];

/**
 * Purges all hardcoded demo/fake profiles and sample mock projects from Firestore.
 */
export async function cleanupDummyData(): Promise<void> {
  try {
    // 1. Delete known dummy user docs by ID
    for (const uid of DUMMY_USER_IDS) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch {
        // Continue silently if permission or doc not found
      }
    }

    // 2. Delete any user documents matching fake company demo emails
    for (const email of DUMMY_EMAILS) {
      try {
        const snap = await getDocs(
          query(collection(db, 'users'), where('email', '==', email))
        );
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch {
        // Continue silently
      }
    }

    // 3. Delete known sample mock project documents by ID
    for (const pid of DUMMY_PROJECT_IDS) {
      try {
        await deleteDoc(doc(db, 'projects', pid));
      } catch {
        // Continue silently
      }
    }

    // 4. Delete any projects created under dummy creator IDs
    for (const dummyCreatorId of DUMMY_USER_IDS) {
      try {
        const snap = await getDocs(
          query(collection(db, 'projects'), where('creatorId', '==', dummyCreatorId))
        );
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch {
        // Continue silently
      }
    }
  } catch (err) {
    console.warn('[SeedData] Cleanup notification:', err);
  }
}

/**
 * Initializes baseline configuration and cleanses any legacy dummy data.
 * Does NOT generate fake users or mock submissions.
 */
export async function ensureInitialSeedData(): Promise<void> {
  try {
    // Purge any lingering dummy records
    await cleanupDummyData();

    // Ensure baseline taxonomy categories exist for real submissions
    await categoryRepository.list();
  } catch (err) {
    console.warn('[SeedData] Initialization check:', err);
  }
}
