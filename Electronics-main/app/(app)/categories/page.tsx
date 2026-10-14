'use client';

import { useState } from 'react';
import { Plus, FolderTree, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';

import { apiClient } from '@/services/api-client';

export default function CategoriesPage() {
  const categories = useInventoryStore((s) => s.categories);
  const products = useInventoryStore((s) => s.products);
  const addCategory = useInventoryStore((s) => s.addCategory);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    const cleanDesc = description.trim();
    try {
      const saved = await apiClient.createCategory({ name: cleanName, description: cleanDesc });
      addCategory(saved.name, saved.description);
      toast({ title: 'Category added', description: `${cleanName} has been saved to database.` });
    } catch (e: any) {
      addCategory(cleanName, cleanDesc);
      toast({ title: 'Category added', description: `${cleanName} has been created.` });
    }
    setName('');
    setDescription('');
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your products into categories."
        actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>}
      />

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories" description="Create your first product category." action={{ label: 'Add Category', onClick: () => setOpen(true) }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <Card key={cat.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderTree className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{count} products</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {cat.description && <p className="mt-3 text-sm text-muted-foreground">{cat.description}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wearable Devices" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category?"
        description="This will remove the category. Products in this category will remain but lose their category association."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            useInventoryStore.setState((state) => ({
              categories: state.categories.filter((c) => c.id !== deleteTarget),
            }));
            toast({ title: 'Category deleted' });
            setDeleteTarget(null);
          }
        }}
        destructive
      />
    </div>
  );
}
