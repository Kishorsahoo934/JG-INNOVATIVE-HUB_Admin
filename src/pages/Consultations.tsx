import React, { useState, useEffect } from 'react';
import { useFreshData } from '@/hooks/useFreshData';
import { Loader2, Search, BookOpen, Clock, FileText, Trash2, Pencil } from 'lucide-react';
import { adminApi, ConsultationBooking } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const stages = ['Idea Submitted', 'Requirement Discussion', 'Project Confirmation', 'Design & Development', 'Testing & Delivery', 'Completed'];

const Consultations = () => {
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ConsultationBooking | null>(null);
  const { toast } = useToast();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ConsultationBooking>>({});
  const [isEditing, setIsEditing] = useState(false);

  const openEditForm = (app: ConsultationBooking) => {
    setEditForm({
      name: app.name,
      email: app.email,
      phone: app.phone,
      productName: app.productName,
      productCategory: app.productCategory,
      currentStage: app.currentStage,
      estimatedBudget: app.estimatedBudget,
      expectedTimeline: app.expectedTimeline,
      problemStatement: app.problemStatement,
      detailedDescription: app.detailedDescription,
    });
    setSelectedItem(app);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsEditing(true);
    try {
      await adminApi.consultations.update(selectedItem.id, editForm);
      toast({ title: 'Success', description: 'Application updated successfully' });
      setIsEditOpen(false);
      fetchConsultations();
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consultation application?')) return;
    setIsDeletingId(id);
    try {
      await adminApi.consultations.delete(id);
      toast({ title: 'Success', description: 'Application deleted successfully' });
      fetchConsultations();
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeletingId(null);
    }
  };

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.consultations.getAll();
      setConsultations(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to fetch' });
    } finally {
      setIsLoading(false);
    }
  };

  useFreshData(fetchConsultations, 30000);

  const handleUpdateStage = async (id: string, stage: string) => {
    try {
      await adminApi.consultations.updateStage(id, stage);
      toast({ title: 'Success', description: 'Stage updated successfully.' });
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => prev ? { ...prev, processStage: stage as any } : null);
      }
      fetchConsultations();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const filtered = consultations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.productName && c.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Consultations & Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage Product Development bookings and track process stages.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Product / Category</TableHead>
                  <TableHead>Process Stage</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{item.productName || 'N/A'}</p>
                        <Badge variant="outline">{item.productCategory || 'Other'}</Badge>
                      </TableCell>
                      <TableCell>
                        <select 
                          className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={item.processStage || 'Idea Submitted'}
                          onChange={(e) => handleUpdateStage(item.id, e.target.value)}
                        >
                          {stages.map(s => <option className="bg-background text-foreground" key={s} value={s}>{s}</option>)}
                        </select>
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(item)} title="Edit">
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                            View Details
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={isDeletingId === item.id} className="text-destructive hover:bg-destructive hover:text-white">
                            {isDeletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Application</DialogTitle>
            <DialogDescription>Full details submitted by the client.</DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Name</h4>
                  <p>{selectedItem.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Email & Phone</h4>
                  <p>{selectedItem.email} | {selectedItem.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Company</h4>
                  <p>{selectedItem.company || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Process Stage</h4>
                  <Badge variant="default">{selectedItem.processStage || 'Idea Submitted'}</Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-4">Project Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Product Name</h4>
                    <p>{selectedItem.productName || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Category</h4>
                    <p>{selectedItem.productCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Current Stage</h4>
                    <p>{selectedItem.currentStage || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Budget & Timeline</h4>
                    <p>{selectedItem.estimatedBudget || 'N/A'} | {selectedItem.expectedTimeline || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Problem Statement</h4>
                    <p className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedItem.problemStatement || 'See message below'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Detailed Description</h4>
                    <p className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedItem.detailedDescription || selectedItem.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Consultation Application</DialogTitle>
            <DialogDescription>Modify the product development application details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <Input required value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <Input required type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Phone</p>
                <Input required value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Product Name</p>
                <Input value={editForm.productName || ''} onChange={e => setEditForm({ ...editForm, productName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Category</p>
                <Input value={editForm.productCategory || ''} onChange={e => setEditForm({ ...editForm, productCategory: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Stage</p>
                <Input value={editForm.currentStage || ''} onChange={e => setEditForm({ ...editForm, currentStage: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Budget</p>
                <Input value={editForm.estimatedBudget || ''} onChange={e => setEditForm({ ...editForm, estimatedBudget: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Timeline</p>
                <Input value={editForm.expectedTimeline || ''} onChange={e => setEditForm({ ...editForm, expectedTimeline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Problem Statement</p>
              <textarea className="w-full h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editForm.problemStatement || ''} onChange={e => setEditForm({ ...editForm, problemStatement: e.target.value })} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Detailed Description</p>
              <textarea className="w-full h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editForm.detailedDescription || ''} onChange={e => setEditForm({ ...editForm, detailedDescription: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isEditing}>{isEditing ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
</div>
  );
};

export default Consultations;
