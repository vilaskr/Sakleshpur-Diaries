import { auth } from './firebase';
import { toast } from 'sonner';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // User-friendly toast instead of alert
  const isPermissions = errInfo.error.includes('Missing or insufficient permissions') || errInfo.error.includes('No permission');
  
  let errorMessage = `Error (${operationType}): ${errInfo.error}`;
  let description = undefined;

  if (isPermissions) {
    errorMessage = `Action Blocked: Permission Denied`;
    if (operationType === OperationType.DELETE) {
      description = "Only the System Owner can delete records. If you are a Manager/Agent, you can only create or edit.";
    } else if (operationType === OperationType.UPDATE) {
      description = "Managers and Owners can edit. Agents can only create new entries.";
    } else if (operationType === OperationType.CREATE) {
      description = "Your account level might not have permission to create this resource. Contact the owner.";
    } else {
      description = "You don't have the required role for this operation in " + path;
    }
  }
  
  toast.error(errorMessage, { description });
  throw new Error(JSON.stringify(errInfo));
}
