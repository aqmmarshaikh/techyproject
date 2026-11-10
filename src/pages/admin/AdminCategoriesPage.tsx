import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tag, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { categoryRepository } from '../../repositories/categoryRepository';
import { adminService } from '../../services/adminService';
import { Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { categorySchema, CategoryFormData } from '../../schemas/adminSchemas';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const AdminCategoriesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const items = await categoryRepository.list();
      setCategories(items);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({
      id: '',
      name: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    reset({
      id: c.id,
      name: c.name,
      description: c.description,
      isActive: c.isActive,
    });
    setIsModalOpen(true);
  };

  const onSave = async (data: CategoryFormData) => {
    if (!userProfile) return;

    try {
      const category: Category = {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        projectCount: editingCategory?.projectCount || 0,
        createdAt: editingCategory?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await adminService.saveCategory(category, userProfile);
      toastSuccess(
        editingCategory ? 'Category Updated' : 'Category Created',
        `"${data.name}" is now available in category taxonomy.`
      );

      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      toastError('Error', msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !userProfile) return;

    setIsDeleting(true);
    try {
      // Referential integrity check happens inside adminService / categoryRepository
      await adminService.deleteCategory(deleteTarget.id, userProfile);
      toastSuccess('Category Deleted', `"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot delete category';
      toastError('Deletion Prevented', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
            Project Category Taxonomy
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Manage official project categories and enforce referential integrity.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Add New Category
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#FF3D88]" />
                    <h3 className="font-heading font-bold text-base text-[#0F1B3D]">{c.name}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-2">
                  {c.description}
                </p>

                <p className="text-[11px] font-mono text-slate-400 mt-2">slug: {c.id}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEdit(c)}
                >
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={() => setDeleteTarget(c)}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Configure taxonomy label and description."
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Category Slug <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="text"
              {...register('id')}
              disabled={Boolean(editingCategory)}
              placeholder="e.g. data-pipelines"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 disabled:opacity-50"
            />
            {errors.id && <p className="text-xs text-rose-600 mt-1">{errors.id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Display Name <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Data Pipelines & Analytics"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Description <span className="text-[#FF3D88]">*</span>
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Short explanation of what projects fall under this category..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              {...register('isActive')}
              className="rounded text-[#FF3D88] focus:ring-[#FF3D88]"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700">
              Active Category (Permit new submissions)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Referential Integrity Protected) */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message={`Deleting "${deleteTarget?.name}" is only permitted if zero approved or pending projects are categorized under it. Otherwise, deletion will be blocked.`}
        confirmLabel="Confirm Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

