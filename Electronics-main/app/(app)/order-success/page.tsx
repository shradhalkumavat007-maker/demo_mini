'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useInventoryStore } from '@/store/inventory-store';
import { OrderSuccessPage } from '@/components/checkout/order-success-page';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessRoutePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const receiptId = searchParams.get('receipt') || searchParams.get('id');
  const receipts = useInventoryStore((s) => s.receipts);

  // Find receipt by receiptNumber or fall back to latest receipt
  const receipt = receiptId
    ? receipts.find((r) => r.receiptNumber === receiptId || r.transactionId === receiptId)
    : receipts[0];

  if (!receipt) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">No Completed Order Found</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            No recent transaction was located. Please scan a product and complete checkout to generate an order receipt.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/scan-product">Scan &amp; Checkout Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OrderSuccessPage
      receipt={receipt}
      onNewSale={() => router.push('/scan-product')}
      onClose={() => router.push('/dashboard')}
    />
  );
}
