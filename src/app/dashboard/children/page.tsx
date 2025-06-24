'use client';
// src/app/dashboard/children/page.tsx
import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useChildren } from '@/hooks/useChildren';
import ChildForm from '@/components/children/child-form'; 
import type { ChildFormSubmission, ChildWithRelation } from '@/types';
import ChildManageCard from '@/components/children/child-manage';

type ViewMode = 'list' | 'add' | 'edit';

export default function ManageChildrenPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { children, isLoading, error, addChild, updateChild, deleteChild } = useChildren();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingChild, setEditingChild] = useState<ChildWithRelation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Redirect if not authenticated
  if (!isPending && !session) {
    router.push('/auth/signin');
    return null;
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddChild = async (childData: ChildFormSubmission) => {
    setIsSubmitting(true);
    const success = await addChild(childData);
    setIsSubmitting(false);
    
    if (success) {
      setViewMode('list');
      showToast('Child added successfully!', 'success');
      return true;
    } else {
      showToast(error || 'Failed to add child', 'error');
      return false;
    }
  };

  const handleUpdateChild = async (childData: ChildFormSubmission) => {
    if (!editingChild) return false;
    
    setIsSubmitting(true);
    const success = await updateChild(editingChild.id, childData);
    setIsSubmitting(false);
    
    if (success) {
      setViewMode('list');
      setEditingChild(null);
      showToast('Child updated successfully!', 'success');
      return true;
    } else {
      showToast(error || 'Failed to update child', 'error');
      return false;
    }
  };

  const handleDeleteChild = async (child: ChildWithRelation) => {
    const success = await deleteChild(child.id);
    
    if (success) {
      showToast('Child removed successfully!', 'success');
    } else {
      showToast(error || 'Failed to remove child', 'error');
    }
  };

  const handleEditChild = (child: ChildWithRelation) => {
    setEditingChild(child);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingChild(null);
  };

  return (
    <div className="min-h-screen max-w-xl mx-auto py-32 bg-base-100">
      <div className="container mx-auto px-4 py-6">
        {/* <div className="  mx-auto"> */}
          {/* Header */}
          {viewMode === 'list' && (
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-base-content">My Children</h1>
                <p className="text-base-content/70 mt-2">
                  Manage your childrens profiles and information
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setViewMode('add')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Child
              </button>
            </div>
          )}  

          {/* Content */}
          {viewMode === 'list' && (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👶</div>
                  <h2 className="text-2xl font-bold mb-2">No children added yet</h2>
                  <p className="text-base-content/70 mb-6">
                    Add your first child to start tracking their development
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setViewMode('add')}
                  >
                    Add Your First Child
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 mx-auto">
                  {children.map((child) => (
                    <ChildManageCard
                      key={child.id}
                      child={child}
                      onEdit={handleEditChild}
                      onDelete={handleDeleteChild}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'add' && (
            <ChildForm
              onSubmit={handleAddChild}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}

          {viewMode === 'edit' && (
            <ChildForm
              child={editingChild}
              onSubmit={handleUpdateChild}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        {/* </div> */}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className="toast toast-top toast-end">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}