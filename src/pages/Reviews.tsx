import React, { useState, useMemo, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import SearchBar from '@/components/admin/SearchBar';
import Table from '@/components/admin/Table';
import Pagination from '@/components/admin/Pagination';
import StatusBadge, { getStatusVariant } from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useAdminData } from '@/context/AdminDataContext';
import { Review, reviewsApi } from '@/services/adminApi';
import { cn } from '@/lib/utils';

const Reviews: React.FC = () => {
  const { state, approveReview, rejectReview, deleteReview } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'any-user' | 'delivered-only'>('delivered-only');
  const [autoApprove, setAutoApprove] = useState(false);
  const [isModeSaving, setIsModeSaving] = useState(false);
  useEffect(() => {
    const loadMode = async () => {
      try {
        const res = await reviewsApi.getMode();
        if (res?.mode) setReviewMode(res.mode);
        if (typeof res?.autoApprove === 'boolean') setAutoApprove(res.autoApprove);
      } catch {
        // ignore mode load errors
      }
    };
    loadMode();
  }, []);

  const handleModeChange = async (mode: 'any-user' | 'delivered-only') => {
    setReviewMode(mode);
    setIsModeSaving(true);
    try {
      await reviewsApi.updateMode({ mode });
    } finally {
      setIsModeSaving(false);
    }
  };

  const handleAutoApproveChange = async (value: boolean) => {
    setAutoApprove(value);
    setIsModeSaving(true);
    try {
      await reviewsApi.updateMode({ autoApprove: value });
    } finally {
      setIsModeSaving(false);
    }
  };
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    reviewId: string;
    productName: string;
  }>({
    isOpen: false,
    reviewId: '',
    productName: '',
  });

  const pageSize = 10;

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return state.reviews.filter((review) => {
      const matchesSearch =
        review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [state.reviews, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleApprove = async (reviewId: string) => {
    setIsActionLoading(reviewId);
    await approveReview(reviewId);
    setIsActionLoading(null);
  };

  const handleReject = async (reviewId: string) => {
    setIsActionLoading(reviewId);
    await rejectReview(reviewId);
    setIsActionLoading(null);
  };

  const handleDeleteClick = (review: Review) => {
    setConfirmDialog({
      isOpen: true,
      reviewId: review.id,
      productName: review.productName,
    });
  };

  const handleConfirmDelete = async () => {
    await deleteReview(confirmDialog.reviewId);
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      key: 'productName',
      header: 'Product',
      render: (review: Review) => (
        <div>
          <p className="font-medium text-foreground">{review.productName}</p>
          <p className="text-xs text-muted-foreground">ID: {review.productId}</p>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'User',
      render: (review: Review) => (
        <span className="text-foreground">{review.userName}</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (review: Review) => renderStars(review.rating),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (review: Review) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate" title={review.comment}>
          {review.comment}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (review: Review) => (
        <StatusBadge variant={getStatusVariant(review.status)}>
          {getStatusLabel(review.status)}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (review: Review) => (
        <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (review: Review) => (
        <div className="flex items-center gap-1">
          {review.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(review.id)}
                disabled={isActionLoading === review.id}
                className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(review.id)}
                disabled={isActionLoading === review.id}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleDeleteClick(review)}
            disabled={isActionLoading === review.id}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate stats from context
  const pendingCount = state.reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = state.reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = state.reviews.filter((r) => r.status === 'rejected').length;
  const averageRating = state.reviews.length > 0
    ? (state.reviews.reduce((sum, r) => sum + r.rating, 0) / state.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Reviews</h1>
          <p className="page-description">
            Manage product reviews and ratings • {state.reviews.length} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => handleModeChange('any-user')}
              disabled={isModeSaving}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                reviewMode === 'any-user'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Any User
            </button>
            <button
              onClick={() => handleModeChange('delivered-only')}
              disabled={isModeSaving}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                reviewMode === 'delivered-only'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Delivered Only
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Auto approve:</span>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => handleAutoApproveChange(true)}
                disabled={isModeSaving}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  autoApprove ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                On
              </button>
              <button
                onClick={() => handleAutoApproveChange(false)}
                disabled={isModeSaving}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  !autoApprove ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Off
              </button>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {autoApprove ? 'New reviews show on site immediately' : 'New reviews need approval'}
            </span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-36"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <SearchBar
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground">{state.reviews.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-success">{approvedCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-foreground">{averageRating}</p>
            <Star className="w-6 h-6 fill-warning text-warning" />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={paginatedReviews}
          keyExtractor={(review) => review.id}
          emptyMessage="No reviews found"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message={`Are you sure you want to delete this review for "${confirmDialog.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Reviews;
