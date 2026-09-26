import React, { useState, useEffect } from 'react';
import { useFreshData } from '@/hooks/useFreshData';
import { 
  Plus, Search, Edit2, Trash2, ArrowUpDown, Loader2, 
  Package, Check, X, ShieldAlert, Sparkles, Clock, Compass 
} from 'lucide-react';
import { adminApi, DevelopedProduct } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const ProductDevelopment = () => {
  const [products, setProducts] = useState<DevelopedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DevelopedProduct | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [status, setStatus] = useState<'Available' | 'Coming Soon' | 'Under Research'>('Available');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.developedProducts.getAll();
      setProducts(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to fetch products' });
    } finally {
      setIsLoading(false);
    }
  };

  useFreshData(() => {
    fetchProducts();
  });

  const openForm = (product?: DevelopedProduct) => {
    if (product) {
      setSelectedProduct(product);
      setName(product.name || '');
      setDescription(product.description || '');
      setLongDescription(product.longDescription || '');
      setTag(product.tag || '');
      setCategory(product.category || '');
      setFeaturesInput(product.features ? product.features.join(', ') : '');
      setStatus(product.status || 'Available');
      setIsActive(product.isActive);
      setImageUrl(product.images?.[0] || '');
    } else {
      setSelectedProduct(null);
      setName('');
      setDescription('');
      setLongDescription('');
      setTag('');
      setCategory('');
      setFeaturesInput('');
      setStatus('Available');
      setIsActive(true);
      setImageUrl('');
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const url = await adminApi.products.uploadImage(file);
      setImageUrl(url);
      toast({ title: 'Success', description: 'Image uploaded successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      longDescription,
      tag,
      category,
      features: featuresInput.split(',').map(c => c.trim()).filter(Boolean),
      status,
      isActive,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (selectedProduct) {
        await adminApi.developedProducts.update(selectedProduct.id, payload);
        toast({ title: 'Success', description: 'Product Development updated successfully.' });
      } else {
        await adminApi.developedProducts.create(payload);
        toast({ title: 'Success', description: 'Product Development created successfully.' });
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Save failed' });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await adminApi.developedProducts.delete(selectedProduct.id);
      toast({ title: 'Success', description: 'Product deleted permanently.' });
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Development</h1>
          <p className="text-muted-foreground mt-1">Manage completed hardware projects and tech solutions.</p>
        </div>
        <Button onClick={() => openForm()} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products by name, tag, or category..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Showing {filteredProducts.length} items
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Category / Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg border bg-secondary/30 flex items-center justify-center overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline">{p.category}</Badge>
                        <span className="text-xs text-muted-foreground">{p.tag}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={p.status === 'Available' ? 'default' : p.status === 'Coming Soon' ? 'secondary' : 'outline'}>
                          {p.status}
                        </Badge>
                        {p.isActive ? (
                          <span className="flex items-center text-xs text-emerald-500 gap-1"><Check className="w-3 h-3"/> Active</span>
                        ) : (
                          <span className="flex items-center text-xs text-muted-foreground gap-1"><X className="w-3 h-3"/> Inactive</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openForm(p)}>
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedProduct(p); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
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

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product Development' : 'Add New Product Development'}</DialogTitle>
            <DialogDescription>
              Add details of your developed hardware products and solutions.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">PRODUCT NAME *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">TAG * (e.g. Smart IoT)</label>
                <Input value={tag} onChange={(e) => setTag(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">SHORT DESCRIPTION *</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">LONG DESCRIPTION (rich overview)</label>
              <Textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">CATEGORY *</label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Home Automation" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">STATUS *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-[#161c28] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Available">Available</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Under Research">Under Research</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">FEATURES (comma separated)</label>
              <Input 
                value={featuresInput} 
                onChange={(e) => setFeaturesInput(e.target.value)} 
                placeholder="e.g. Wi-Fi Enabled, Energy Efficient, Voice Control"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground block">PRODUCT IMAGE</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="Paste image URL or upload file..."
                  className="flex-1"
                />
                <div className="relative">
                  <Input 
                    type="file" 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                    id="product-image-uploader" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isUploading}
                    onClick={() => document.getElementById('product-image-uploader')?.click()}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                  </Button>
                </div>
              </div>
              {imageUrl && (
                <img src={imageUrl} alt="" className="w-16 h-16 rounded border bg-secondary/30 object-contain" />
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Is Active (Visible on Frontend)</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Delete Product?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProductDevelopment;

