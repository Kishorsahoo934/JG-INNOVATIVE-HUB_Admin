import fs from 'fs';

const filePath = 'k:/jg_inovative_hub/JG-INNOVATIVE-HUB_Admin/src/pages/Internships.tsx';
let text = fs.readFileSync(filePath, 'utf8');

const dialog = `      </Modal>

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
                <select className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm" value={editForm.category || 'paid'} onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}>
                  <option value="paid">Paid</option>
                  <option value="self-funded">Self Funded</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tier</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm" value={editForm.tier || ''} onChange={e => setEditForm({ ...editForm, tier: e.target.value })}>
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
                <select className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm" value={editForm.paymentStatus || 'free'} onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}>
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

export default Internships;`;

text = text.replace(/<\/Modal>\s*<\/div>\s*\);\s*};\s*export default Internships;/m, dialog);
fs.writeFileSync(filePath, text);

