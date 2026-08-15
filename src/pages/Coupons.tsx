import React, { useState, useEffect, useCallback } from 'react';
import { couponsApi, AdminCoupon } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const emptyForm = {
  coupon_code: '',
  discount_type: 'percentage' as 'flat' | 'percentage',
  discount_value: 10,
  creation_date: '',
  expiry_date: '',
  usage_limit: 100,
  min_order_value: '' as string | number,
  active_status: true,
};

const Coupons: React.FC = () => {
  const { toast } = useToast();
  const [list, setList] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      const data = await couponsApi.getAll();
      setList(data);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load coupons',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    const now = new Date();
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const creationIso = now.toISOString().slice(0, 16);
    const iso = d.toISOString().slice(0, 16);
    setForm({ ...emptyForm, creation_date: creationIso, expiry_date: iso });
    setModalOpen(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    const creation =
      c.creation_date && !Number.isNaN(new Date(c.creation_date).getTime())
        ? new Date(c.creation_date).toISOString().slice(0, 16)
        : '';
    const exp =
      c.expiry_date && !Number.isNaN(new Date(c.expiry_date).getTime())
        ? new Date(c.expiry_date).toISOString().slice(0, 16)
        : '';
    setForm({
      coupon_code: c.coupon_code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      creation_date: creation,
      expiry_date: exp,
      usage_limit: c.usage_limit,
      min_order_value: c.min_order_value != null ? c.min_order_value : '',
      active_status: c.active_status,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.coupon_code.trim()) {
      toast({ title: 'Validation', description: 'Coupon code is required', variant: 'destructive' });
      return;
    }
    if (!form.creation_date) {
      toast({ title: 'Validation', description: 'Creation date is required', variant: 'destructive' });
      return;
    }
    if (!form.expiry_date) {
      toast({ title: 'Validation', description: 'Expiry date is required', variant: 'destructive' });
      return;
    }
    if (new Date(form.expiry_date).getTime() < new Date(form.creation_date).getTime()) {
      toast({
        title: 'Validation',
        description: 'Expiry date/time must be after creation date/time',
        variant: 'destructive',
      });
      return;
    }
    const payload: Parameters<typeof couponsApi.create>[0] = {
      coupon_code: form.coupon_code.trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      creation_date: new Date(form.creation_date).toISOString(),
      expiry_date: new Date(form.expiry_date).toISOString(),
      usage_limit: Math.floor(Number(form.usage_limit)) || 1,
      active_status: form.active_status,
    };
    if (form.min_order_value !== '' && form.min_order_value != null) {
      payload.min_order_value = Number(form.min_order_value);
    } else {
      payload.min_order_value = null;
    }
    try {
      if (editing) {
        await couponsApi.update(editing.id, payload);
        toast({ title: 'Updated', description: 'Coupon saved' });
      } else {
        await couponsApi.create(payload);
        toast({ title: 'Created', description: 'Coupon created' });
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Save failed',
        variant: 'destructive',
      });
    }
  };

  const remove = async (c: AdminCoupon) => {
    if (!window.confirm(`Delete coupon ${c.coupon_code}?`)) return;
    try {
      await couponsApi.delete(c.id);
      toast({ title: 'Deleted', description: 'Coupon removed' });
      await load();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const formatExpiry = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage discount codes for checkout.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New coupon
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No coupons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Min order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.coupon_code}</TableCell>
                    <TableCell>
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}%`
                        : `₹${c.discount_value}`}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatExpiry(c.expiry_date)}</TableCell>
                    <TableCell>
                      <span className="tabular-nums">
                        {c.used_count} / {c.usage_limit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.min_order_value != null ? `₹${c.min_order_value}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.active_status ? 'default' : 'secondary'}>
                        {c.active_status ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(c)}
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit coupon' : 'New coupon'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cc-code">Coupon code</Label>
            <Input
              id="cc-code"
              value={form.coupon_code}
              onChange={(e) => setForm((f) => ({ ...f, coupon_code: e.target.value }))}
              placeholder="e.g. SAVE10"
              className="font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount type</Label>
              <Select
                value={form.discount_type}
                onValueChange={(v: 'flat' | 'percentage') => setForm((f) => ({ ...f, discount_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-val">Discount value</Label>
              <Input
                id="cc-val"
                type="number"
                min={0}
                step={form.discount_type === 'percentage' ? 1 : 0.01}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cc-created">Creation</Label>
              <Input
                id="cc-created"
                type="datetime-local"
                value={form.creation_date}
                onChange={(e) => setForm((f) => ({ ...f, creation_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-exp">Expiry</Label>
              <Input
                id="cc-exp"
                type="datetime-local"
                value={form.expiry_date}
                onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cc-limit">Total usage limit</Label>
              <Input
                id="cc-limit"
                type="number"
                min={1}
                step={1}
                value={form.usage_limit}
                onChange={(e) => setForm((f) => ({ ...f, usage_limit: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-min">Min order value (optional)</Label>
              <Input
                id="cc-min"
                type="number"
                min={0}
                step={0.01}
                placeholder="None"
                value={form.min_order_value === '' ? '' : form.min_order_value}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    min_order_value: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="cc-active">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive codes cannot be applied at checkout.</p>
            </div>
            <Switch
              id="cc-active"
              checked={form.active_status}
              onCheckedChange={(v) => setForm((f) => ({ ...f, active_status: v }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Coupons;
