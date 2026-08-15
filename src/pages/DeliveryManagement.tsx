import React, { useState, useEffect } from 'react';
import { deliveryApi, DeliveryStateRow, DeliveryDashboard } from '@/services/adminApi';
import { formatCurrency } from '@/utils/gstCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const DeliveryManagement: React.FC = () => {
  const { toast } = useToast();
  const [states, setStates] = useState<DeliveryStateRow[]>([]);
  const [dashboard, setDashboard] = useState<DeliveryDashboard | null>(null);
  const [defaultPlatform, setDefaultPlatform] = useState('');
  const [platformInput, setPlatformInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<DeliveryStateRow | null>(null);
  const [formState, setFormState] = useState({ state: '', defaultShippingCharge: 0, enabled: true });

  const loadStates = async () => {
    try {
      const list = await deliveryApi.getAllStates();
      setStates(list);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load state charges', variant: 'destructive' });
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await deliveryApi.getDashboard();
      setDashboard(data);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' });
    }
  };

  const loadPlatform = async () => {
    try {
      const res = await deliveryApi.getDefaultPlatform();
      const platform = (res as { defaultPlatform?: string }).defaultPlatform || 'Shiprocket';
      setDefaultPlatform(platform);
      setPlatformInput(platform);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load platform setting', variant: 'destructive' });
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadStates(), loadDashboard(), loadPlatform()]);
      setLoading(false);
    })();
  }, []);

  const openAddState = () => {
    setEditingState(null);
    setFormState({ state: '', defaultShippingCharge: 0, enabled: true });
    setStateModalOpen(true);
  };

  const openEditState = (row: DeliveryStateRow) => {
    setEditingState(row);
    setFormState({
      state: row.state,
      defaultShippingCharge: row.defaultShippingCharge,
      enabled: row.enabled,
    });
    setStateModalOpen(true);
  };

  const saveState = async () => {
    if (!formState.state.trim()) {
      toast({ title: 'Validation', description: 'State name is required', variant: 'destructive' });
      return;
    }
    try {
      const payload = { ...formState, manualBaseCharge: 0 };
      if (editingState) {
        await deliveryApi.updateState(editingState.id, payload);
        toast({ title: 'Updated', description: 'State charge updated' });
      } else {
        await deliveryApi.createState(payload);
        toast({ title: 'Created', description: 'State charge added' });
      }
      setStateModalOpen(false);
      await loadStates();
      await loadDashboard();
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to save', variant: 'destructive' });
    }
  };

  const deleteState = async (id: string) => {
    if (!window.confirm('Remove this state from delivery pricing?')) return;
    try {
      await deliveryApi.deleteState(id);
      toast({ title: 'Deleted', description: 'State removed' });
      await loadStates();
      await loadDashboard();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const savePlatform = async () => {
    const value = (platformInput || 'Shiprocket').trim();
    try {
      await deliveryApi.setDefaultPlatform(value);
      setDefaultPlatform(value);
      toast({ title: 'Saved', description: 'Default delivery platform updated' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save platform', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Delivery Management</h1>
        <p className="page-description">State-wise pricing, tracking dashboard, and platform settings</p>
      </div>

      <Tabs defaultValue="states" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="states">State-wise Pricing</TabsTrigger>
          <TabsTrigger value="dashboard">Tracking Dashboard</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="states" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Set the shipping charge per state. Checkout uses this amount based on the customer&apos;s delivery address state.
            </p>
            <Button onClick={openAddState}>
              <Plus className="w-4 h-4 mr-2" />
              Add State
            </Button>
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">State</th>
                  <th className="text-left p-3 text-sm font-medium">Shipping charge (₹)</th>
                  <th className="text-left p-3 text-sm font-medium">Enabled</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {states.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">No states configured. Add one to set delivery charges.</td>
                  </tr>
                ) : (
                  states.map((row) => (
                    <tr key={row.id} className="border-b border-border">
                      <td className="p-3 font-medium">{row.state}</td>
                      <td className="p-3">{formatCurrency(row.defaultShippingCharge)}</td>
                      <td className="p-3">{row.enabled ? 'Yes' : 'No'}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditState(row)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteState(row.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4">
          {dashboard && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{dashboard.totalOrders}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Checkout (standard)</p>
                <p className="text-2xl font-bold text-foreground">{dashboard.ordersByDeliveryMethod?.default ?? 0}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Legacy manual method</p>
                <p className="text-2xl font-bold text-foreground">{dashboard.ordersByDeliveryMethod?.manual ?? 0}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Total Shipping Collected</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(dashboard.totalShippingCollected ?? 0)}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Pending Deliveries</p>
                <p className="text-2xl font-bold text-warning">{dashboard.pendingDeliveries ?? 0}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">Completed Deliveries</p>
                <p className="text-2xl font-bold text-success">{dashboard.completedDeliveries ?? 0}</p>
              </div>
            </div>
          )}
          {dashboard?.ordersByState && Object.keys(dashboard.ordersByState).length > 0 && (
            <div className="mt-6 p-4 border border-border rounded-xl">
              <p className="text-sm font-medium text-foreground mb-3">Orders by State</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dashboard.ordersByState).map(([state, count]) => (
                  <span key={state} className="px-3 py-1 bg-muted rounded-lg text-sm">{state}: {count}</span>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="platform" className="mt-4">
          <div className="max-w-md space-y-4">
            <p className="text-sm text-muted-foreground">Set the default delivery platform (e.g. Shiprocket, Manual). You can assign platform per order from the Orders page.</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="platform">Default Delivery Platform</Label>
                <Input
                  id="platform"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  placeholder="e.g. Shiprocket"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={savePlatform}>Save</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Current: {defaultPlatform || 'Not set'}</p>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={stateModalOpen}
        onClose={() => setStateModalOpen(false)}
        title={editingState ? 'Edit State Charge' : 'Add State'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <Label>State Name</Label>
            <Input
              value={formState.state}
              onChange={(e) => setFormState({ ...formState, state: e.target.value })}
              placeholder="e.g. Maharashtra"
              disabled={!!editingState}
            />
          </div>
          <div>
            <Label>Shipping charge for this state (₹)</Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={formState.defaultShippingCharge || ''}
              onChange={(e) => setFormState({ ...formState, defaultShippingCharge: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formState.enabled}
              onCheckedChange={(v) => setFormState({ ...formState, enabled: v })}
            />
            <Label>Enabled</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setStateModalOpen(false)}>Cancel</Button>
            <Button onClick={saveState}>{editingState ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryManagement;
