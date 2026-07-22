import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, followUpsApi } from '../api/endpoints';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const followUpSchema = z.object({
  notes: z.string().min(2, 'Notes are required'),
  followUpDate: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await customersApi.getCustomerById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      status: 'PENDING',
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: FollowUpFormData) =>
      followUpsApi.createFollowUp({
        ...data,
        customerId: id,
      }),
    onSuccess: () => {
      showToast('Follow-up note logged', 'success');
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      setIsAddNoteModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to add note', 'error');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => followUpsApi.deleteFollowUp(noteId),
    onSuccess: () => {
      showToast('Note deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-2xl">
        <p className="text-rose-700 dark:text-rose-300">Customer account not found.</p>
        <Button onClick={() => navigate('/customers')} className="mt-4" size="sm">
          Return to Customers Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-2xl border border-brand-500/20 shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
                {customer.name}
              </h1>
              <Badge variant={customer.status === 'ACTIVE' ? 'success' : customer.status === 'LEAD' ? 'warning' : 'danger'}>
                {customer.status}
              </Badge>
              <Badge variant="purple">{customer.type}</Badge>
            </div>
            {customer.company && (
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {customer.company}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
              </span>
              {customer.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {hasRole(['ADMIN', 'SALES']) && (
          <div className="shrink-0 flex items-center gap-2">
            <Button
              onClick={() => setIsAddNoteModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Follow-up Note
            </Button>
          </div>
        )}
      </div>

      {/* Details Grid: CRM Follow-ups Timeline & Sales History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Follow-up & Communication Timeline
            </h2>
            <span className="text-xs text-slate-500">
              {customer.followUps?.length || 0} Total Notes
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            {!customer.followUps || customer.followUps.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No follow-up notes recorded yet for this customer.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {customer.followUps.map((note) => (
                  <div key={note.id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-brand-500 bg-white dark:bg-slate-900" />

                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {note.createdBy?.name || 'Sales Rep'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              note.status === 'COMPLETED'
                                ? 'success'
                                : note.status === 'PENDING'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {note.status}
                          </Badge>
                          {hasRole(['ADMIN']) && (
                            <button
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {note.notes}
                      </p>

                      {note.followUpDate && (
                        <div className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Next Scheduled Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Sales Challans Sidebar (1 col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            Associated Sales Orders
          </h2>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            {!customer.salesChallans || customer.salesChallans.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No sales challans recorded.
              </p>
            ) : (
              customer.salesChallans.map((challan) => (
                <div
                  key={challan.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <Link
                      to={`/sales/${challan.id}`}
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {challan.challanNumber}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ${challan.totalAmount.toFixed(2)}
                    </div>
                    <Badge
                      variant={
                        challan.status === 'CONFIRMED'
                          ? 'success'
                          : challan.status === 'DRAFT'
                          ? 'info'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {challan.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add FollowUp Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Log Follow-up Communication"
      >
        <form onSubmit={handleSubmit((d) => createNoteMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Follow-up Notes / Call Details *
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Describe conversation, pricing discussions, or agreed next steps..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.notes && (
              <p className="text-xs text-rose-500 mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Next Follow-Up Date
              </label>
              <input
                {...register('followUpDate')}
                type="date"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="PENDING">Pending Action</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddNoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
