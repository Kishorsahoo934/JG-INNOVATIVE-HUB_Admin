import fs from 'fs';

const filePath = 'k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/pages/Internships.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add states
content = content.replace(
  "const [currentPage, setCurrentPage] = useState(1);",
  `const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InternshipApplication>>({});
  const [isEditing, setIsEditing] = useState(false);

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
  };`
);

// Add edit button inside the table actions
content = content.replace(
  `{ key: 'actions', label: 'Actions', render: (app) => (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setIsViewModalOpen(true); }}>
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </div>`,
  `{ key: 'actions', label: 'Actions', render: (app) => (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEditForm(app)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setIsViewModalOpen(true); }}>
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </div>`
);

// Append the Edit Dialog at the end (before last </div>)
const dialogContent = `
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Internship Application</DialogTitle>
            <DialogDescription>
              Modify application details.
            </DialogDescription>
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
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm"
                  value={editForm.category || 'paid'} 
                  onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                >
                  <option value="paid">Paid</option>
                  <option value="self-funded">Self Funded</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tier</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm"
                  value={editForm.tier || ''} 
                  onChange={e => setEditForm({ ...editForm, tier: e.target.value })}
                >
                  <option value="">None</option>
                  <option value="1-month">1 Month</option>
                  <option value="45-days">45 Days</option>
                  <option value="2-month">2 Months</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Payment Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm"
                  value={editForm.paymentStatus || 'free'} 
                  onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}
                >
                  <option value="free">Free</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Year of Study</Label>
                <Input value={editForm.yearOfStudy || ''} onChange={e => setEditForm({ ...editForm, yearOfStudy: e.target.value })} />
              </div>
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
`;

content = content.replace(/<\/div>\s*<Modal/g, dialogContent + '\n      <Modal'); // try to put it before Modal
if (!content.includes('Edit Internship Application')) {
    content = content.replace(/<\/div>\s*};\s*export default Internships;/g, dialogContent + '\nexport default Internships;');
}

fs.writeFileSync(filePath, content);
console.log('Patched Internships.tsx');

