import React, { useState, useEffect, useMemo } from 'react';
import { useFreshData } from '@/hooks/useFreshData';
import { adminApi, InternshipApplication } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { 
  Briefcase, Search, AlertCircle, Mail, Phone, Calendar, 
  ExternalLink, FileText, Globe, Check, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Modal from '@/components/admin/Modal';
import Table from '@/components/admin/Table';
import Pagination from '@/components/admin/Pagination';

const Internships: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InternshipApplication['status']>('pending');
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InternshipApplication>>({});
  const [isEditing, setIsEditing] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<InternshipApplication>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await adminApi.internships.create(createForm);
      toast({ title: 'Success', description: 'Application created successfully' });
      setIsCreateOpen(false);
      setCreateForm({});
      fetchApplications();
    } catch (err: any) {
      toast({ title: 'Create Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this internship application?')) return;
    setIsDeletingId(id);
    try {
      await adminApi.internships.delete(id);
      toast({ title: 'Success', description: 'Application deleted successfully' });
      if (selectedApp?.id === id) setIsViewModalOpen(false);
      fetchApplications();
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeletingId(null);
    }
  };


  const openEditForm = (app: InternshipApplication) => {
    setEditForm({
      name: app.name,
      email: app.email,
      mobile: app.mobile,
      category: app.category,
      tier: app.tier,
      paymentStatus: app.paymentStatus,
      yearOfStudy: app.yearOfStudy,
    });
    setSelectedApp(app);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsEditing(true);
    try {
      await adminApi.internships.update(selectedApp.id, editForm);
      toast({ title: 'Success', description: 'Application updated successfully' });
      setIsEditOpen(false);
      fetchApplications();
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsEditing(false);
    }
  };
  const pageSize = 10;

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.internships.getAll();
      setApplications(data);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error loading applications',
        description: err.message || 'Could not fetch internship applications.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFreshData(() => {
    fetchApplications();
  });

  const handleUpdateStatus = async (id: string, status: InternshipApplication['status']) => {
    setIsUpdatingId(id);
    try {
      await adminApi.internships.updateStatus(id, status);
      toast({
        title: 'Status Updated',
        description: `Application status has been changed to "${status}".`
      });
      
      // Update local state if modal is open
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
      
      await fetchApplications();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Action Failed',
        description: err.message || 'Could not update status.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Filter applications based on search and tab status
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = app.status === activeTab;
      const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.mobile.includes(searchQuery) ||
        app.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        app.coverLetter.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredApps.length / pageSize);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleViewApp = (app: InternshipApplication) => {
    setSelectedApp(app);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: InternshipApplication['status']) => {
    switch (status) {
      case 'shortlisted': return 'default'; // Success / Primary
      case 'rejected': return 'destructive';
      case 'under-review': return 'secondary';
      default: return 'outline';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Applicant',
      render: (app: InternshipApplication) => (
        <div>
          <p className="font-semibold text-foreground">{app.name}</p>
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {app.email}
          </span>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (app: InternshipApplication) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {app.mobile}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (app: InternshipApplication) => (
        <div className="flex flex-col gap-1">
          <Badge variant={app.category === 'paid' ? 'default' : 'secondary'} className="text-[10px] w-fit">
            {app.category === 'paid' ? 'Paid (₹49)' : 'Self Funded'}
          </Badge>
          {app.tier && <span className="text-[10px] text-muted-foreground">{app.tier}</span>}
          {app.paymentStatus === 'paid' && (
            <Badge variant="outline" className="text-[9px] w-fit bg-green-500/10 text-green-500 border-none px-1 py-0">
              Paid
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Key Skills',
      render: (app: InternshipApplication) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {app.skills.slice(0, 3).map((skill, idx) => (
            <Badge key={idx} variant="outline" className="text-[9px] px-1 py-0 bg-background/40">
              {skill}
            </Badge>
          ))}
          {app.skills.length > 3 && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
              +{app.skills.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Applied Date',
      render: (app: InternshipApplication) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(app.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: InternshipApplication) => (
        <Badge variant={getStatusBadgeVariant(app.status)} className="text-[10px] uppercase font-bold tracking-wider capitalize">
          {app.status.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (app: InternshipApplication) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => openEditForm(app)}
            title="Edit Application"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleViewApp(app)}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-destructive"
            onClick={() => handleDelete(app.id || (app as any)._id)}
            title="Delete Application"
            disabled={isDeletingId === (app.id || (app as any)._id)}
          >
            {isDeletingId === (app.id || (app as any)._id) ? <div className="w-4 h-4 border-2 border-destructive border-t-transparent animate-spin rounded-full" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary" />
            Internship Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            Review applicant skills, resumes, cover letters and manage hiring/screening statuses.
          </p>
        </div>
      </div>

      {/* Tabs list & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        {/* Tabs */}
        <div className="flex bg-[#111827] p-1 rounded-lg border border-border/80 max-w-fit overflow-x-auto">
          {(['pending', 'under-review', 'shortlisted', 'rejected'] as const).map((tab) => {
            const count = applications.filter(app => app.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-md capitalize transition-all flex items-center gap-2 shrink-0 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                {tab.replace('-', ' ')}
                <Badge variant={isActive ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0.5">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

                {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, cover..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : paginatedApps.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No applications found</h3>
          <p className="text-sm text-muted-foreground">No applications match the status filter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table
              columns={columns}
              data={paginatedApps}
              keyExtractor={(app) => app.id}
              emptyMessage="No applications found"
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* View Application Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Internship Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedApp.name}</h3>
                <div className="flex flex-col gap-1.5 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedApp.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedApp.mobile}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Applied on: {formatDate(selectedApp.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={getStatusBadgeVariant(selectedApp.status)} className="text-[10px] uppercase font-bold tracking-wider">
                  {selectedApp.status.replace('-', ' ')}
                </Badge>
                <Badge variant={selectedApp.category === 'paid' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                  {selectedApp.category === 'paid' ? 'Paid Program' : 'Self Funded'}
                </Badge>
              </div>
            </div>

            {/* Education & Application Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {selectedApp.yearOfStudy && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Year of Study</h4>
                  <p className="text-sm font-medium text-foreground">{selectedApp.yearOfStudy}</p>
                </div>
              )}
              {selectedApp.tier && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tier / Duration</h4>
                  <p className="text-sm font-medium text-foreground">{selectedApp.tier}</p>
                </div>
              )}
              {selectedApp.category === 'paid' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment Status</h4>
                    <Badge variant="outline" className={`text-[10px] uppercase ${selectedApp.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500 border-none' : ''}`}>
                      {selectedApp.paymentStatus || 'Pending'}
                    </Badge>
                  </div>
                  {selectedApp.paymentId && (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment ID</h4>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{selectedApp.paymentId}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedApp.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1 bg-background/50 border border-border">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Social / Portfolio Links */}
            {(selectedApp.githubUrl || selectedApp.linkedinUrl || selectedApp.personalPortfolioUrl) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Online Profiles</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedApp.githubUrl && (
                    <a href={selectedApp.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {selectedApp.linkedinUrl && (
                    <a href={selectedApp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {selectedApp.personalPortfolioUrl && (
                    <a href={selectedApp.personalPortfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Links / Attachments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Candidate Resume</p>
                    <p className="text-[10px] text-muted-foreground">PDF Document</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                  <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                </Button>
              </div>

              {selectedApp.portfolioUrl && (
                <div className="p-4 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">External Portfolio</p>
                      <p className="text-[10px] text-muted-foreground">Web Link</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                    <a href={selectedApp.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cover Letter / Statement of Purpose</h4>
              <Card className="bg-muted/20 border-border/65">
                <CardContent className="p-4">
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line font-serif">
                    {selectedApp.coverLetter}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Workflow status update */}
            <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Update Screening Status</span>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'under-review', 'shortlisted', 'rejected'] as const).map((status) => {
                  const isActive = selectedApp.status === status;
                  return (
                    <Button
                      key={status}
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      className="text-xs capitalize font-semibold"
                      disabled={isUpdatingId === selectedApp.id}
                      onClick={() => handleUpdateStatus(selectedApp.id, status)}
                    >
                      {status === selectedApp.status && <Check className="w-3.5 h-3.5 mr-1" />}
                      {status.replace('-', ' ')}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
            </Modal>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Internship Application</DialogTitle>
            <DialogDescription>Manually create an internship application for a student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student Name *</Label>
              <Input required value={createForm.name || ''} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input required type="email" value={createForm.email || ''} onChange={e => setCreateForm({...createForm, email: e.target.value})} placeholder="Student's email" />
              <p className="text-[10px] text-muted-foreground">If the user doesn't exist, a placeholder account will be created automatically.</p>
            </div>
            <div className="space-y-2">
              <Label>Mobile Number *</Label>
              <Input required value={createForm.mobile || ''} onChange={e => setCreateForm({...createForm, mobile: e.target.value})} placeholder="10-digit number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={createForm.category || 'self-funded'} onChange={e => setCreateForm({...createForm, category: e.target.value as any})}>
                  <option className="bg-background text-foreground" value="paid">Paid</option>
                  <option className="bg-background text-foreground" value="self-funded">Self-funded</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={createForm.tier || '1-month'} onChange={e => setCreateForm({...createForm, tier: e.target.value})}>
                  <option className="bg-background text-foreground" value="1-month">1 Month</option>
                  <option className="bg-background text-foreground" value="45-days">45 Days</option>
                  <option className="bg-background text-foreground" value="2-months">2 Months</option>
                  <option className="bg-background text-foreground" value="6-months">6 Months</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key Skills</Label>
              <Input value={(createForm.skills || []).join(', ')} onChange={e => setCreateForm({...createForm, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="e.g. React, Node.js, Python (comma separated)" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={createForm.status || 'pending'} onChange={e => setCreateForm({...createForm, status: e.target.value as any})}>
                <option className="bg-background text-foreground" value="pending">Pending</option>
                <option className="bg-background text-foreground" value="under-review">Under Review</option>
                <option className="bg-background text-foreground" value="shortlisted">Shortlisted</option>
                <option className="bg-background text-foreground" value="rejected">Rejected</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Internship Application</DialogTitle>
            <DialogDescription>Modify application details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input required value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input required value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Mobile</Label>
              <Input required value={editForm.mobile || ''} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm" value={editForm.category || 'paid'} onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}>
                  <option className="bg-background text-foreground" value="paid">Paid</option>
                  <option className="bg-background text-foreground" value="self-funded">Self Funded</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tier</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm" value={editForm.tier || ''} onChange={e => setEditForm({ ...editForm, tier: e.target.value })}>
                  <option className="bg-background text-foreground" value="">None</option>
                  <option className="bg-background text-foreground" value="1-month">1 Month</option>
                  <option className="bg-background text-foreground" value="45-days">45 Days</option>
                  <option className="bg-background text-foreground" value="2-month">2 Months</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Payment Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm" value={editForm.paymentStatus || 'free'} onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}>
                  <option className="bg-background text-foreground" value="free">Free</option>
                  <option className="bg-background text-foreground" value="pending">Pending</option>
                  <option className="bg-background text-foreground" value="paid">Paid</option>
                  <option className="bg-background text-foreground" value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Year of Study</Label>
                <Input value={editForm.yearOfStudy || ''} onChange={e => setEditForm({ ...editForm, yearOfStudy: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Key Skills</Label>
              <Input value={(editForm.skills || []).join(', ')} onChange={e => setEditForm({ ...editForm, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g. React, Python" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isEditing}>{isEditing ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Internships;


