'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  QrCode,
  ShoppingCart,
  Receipt,
  CheckCircle2,
  Barcode,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCameraScanner, type ScanResult } from '@/components/scanner/qr-camera-scanner';
import { ProductDetailsCard } from '@/components/scanner/product-details-card';
import { SaleCart } from '@/components/checkout/sale-cart';
import { PaymentModal } from '@/components/checkout/payment-modal';
import { ReceiptView } from '@/components/checkout/receipt-view';
import { OrderSuccessPage } from '@/components/checkout/order-success-page';
import { PrintableBarcodesDialog } from '@/components/scanner/printable-barcodes-dialog';
import { useInventoryStore } from '@/store/inventory-store';
import { inventoryService } from '@/services/inventory-service';
import { useToast } from '@/hooks/use-toast';
import { getProductImageUrl } from '@/lib/product-assets';
import type { Product } from '@/types/product';
import type { SerialImei } from '@/types/serial';
import type { SaleCartItem, SaleCustomer, SaleReceipt, PaymentMethod } from '@/types/sale';

export default function ScanProductPage() {
  const { toast } = useToast();

  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const serials = useInventoryStore((s) => s.serials);
  const settings = useInventoryStore((s) => s.settings);

  // Active view step
  const [activeStep, setActiveStep] = useState<'scanner' | 'receipt'>('scanner');

  // Currently scanned/selected product
  const [scannedProduct, setScannedProduct] = useState<Product | null>(() => {
    // Default to first product so user sees rich layout immediately
    return products.length > 0 ? products[0] : null;
  });
  const [matchedSerial, setMatchedSerial] = useState<SerialImei | null>(null);

  // Auto-add to sale cart on scan (user toggleable)
  const [autoAddToCart, setAutoAddToCart] = useState(true);
  const [lastScanError, setLastScanError] = useState<string | null>(null);

  // Sale Cart state
  const [cartItems, setCartItems] = useState<SaleCartItem[]>([]);
  const cartItemsRef = useRef<SaleCartItem[]>(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const [customer, setCustomer] = useState<SaleCustomer>({
    name: 'Rohan Verma',
    phone: '9876543210',
    email: 'rohan.verma@example.com',
    address: 'Indiranagar, Bangalore, Karnataka',
  });
  const [orderDiscount, setOrderDiscount] = useState<number>(0);

  // Modals & Processing
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [printableBarcodesOpen, setPrintableBarcodesOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<SaleReceipt | null>(null);

  // Live synced product from store (ensures stock updates immediately reflect in UI)
  const activeProduct = useMemo(() => {
    if (!scannedProduct) return null;
    return products.find((p) => p.id === scannedProduct.id) || scannedProduct;
  }, [products, scannedProduct]);

  // Look up category and supplier for currently scanned product
  const scannedCategory = useMemo(() => {
    if (!activeProduct) return undefined;
    return categories.find((c) => c.id === activeProduct.categoryId);
  }, [categories, activeProduct]);

  const scannedSupplier = useMemo(() => {
    if (!activeProduct) return undefined;
    return suppliers.find((s) => s.id === activeProduct.supplierId);
  }, [suppliers, activeProduct]);

  const availableSerialsForProduct = useMemo(() => {
    if (!activeProduct) return [];
    return serials.filter(
      (s) => s.productId === activeProduct.id && s.status === 'available'
    );
  }, [serials, activeProduct]);

  // Instant 1-click restock handler
  const handleRestock = async (productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    await inventoryService.stockIn({
      productId,
      supplierId: prod.supplierId || 'sup-1',
      quantity,
      purchasePrice: prod.purchasePrice,
      serialNumbers: [],
      date: new Date().toISOString(),
      reference: `RESTOCK-${Date.now().toString().slice(-4)}`,
      notes: 'Quick 1-Click Restock from POS Scanner',
    });
    toast({
      title: 'Product Restocked! ⚡',
      description: `Added ${quantity} units of ${prod.name} into inventory.`,
    });
  };

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const cartGrandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - Math.min(cartSubtotal, orderDiscount));
  }, [cartSubtotal, orderDiscount]);

  // Core Scanner Identification & Auto-Add Logic
  const handleScanCode = useCallback(
    (code: string): ScanResult => {
      let cleanCode = code.trim().replace(/^["']|["']$/g, '');
      if (!cleanCode) {
        return { success: false, code: '', message: 'Empty barcode' };
      }

      // Handle JSON QR payloads
      try {
        if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
          const parsed = JSON.parse(cleanCode);
          if (parsed.sku) cleanCode = String(parsed.sku);
          else if (parsed.serialNumber) cleanCode = String(parsed.serialNumber);
          else if (parsed.id) cleanCode = String(parsed.id);
        }
      } catch (e) {
        // Not a JSON payload, continue
      }

      // Extract from URLs (e.g. http://.../products/SAM-TV-55-C4K)
      if (cleanCode.includes('/products/')) {
        const segments = cleanCode.split('/products/');
        if (segments[1]) {
          cleanCode = decodeURIComponent(segments[1].split(/[?#]/)[0]);
        }
      }

      // Strip common prefixes (e.g. "SKU: ", "SN: ", "IMEI: ")
      const strippedCode = cleanCode
        .replace(/^(SKU|SN|IMEI|ID|PRODUCT|MODEL):\s*/i, '')
        .trim();

      const candidateCodes = Array.from(new Set([cleanCode, strippedCode].filter(Boolean)));

      // Helper function to handle a confirmed product match
      const onMatchFound = (
        prod: Product,
        serial?: SerialImei | null,
        matchTypeLabel = 'Product Identified'
      ): ScanResult => {
        setScannedProduct(prod);
        setMatchedSerial(serial || null);
        setLastScanError(null);

        // Calculate expected quantity in cart after this scan
        const currentItem = cartItemsRef.current.find((item) => item.productId === prod.id);
        const currentQty = currentItem?.quantity || 0;
        let resultingQty = autoAddToCart ? Math.min(prod.stock, currentQty + 1) : currentQty;

        if (autoAddToCart) {
          if (prod.stock <= 0) {
            toast({
              title: `${prod.name} (Out of Stock)`,
              description: 'This product is out of stock and cannot be added to cart.',
              variant: 'destructive',
            });
            return {
              success: true,
              code: cleanCode,
              productName: prod.name,
              sku: prod.sku,
              cartQuantity: 0,
              message: 'Out of stock — cannot add to cart',
            };
          }

          setCartItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.productId === prod.id);
            if (existingIndex >= 0) {
              const existing = prev[existingIndex];
              const nextQty = Math.min(prod.stock, existing.quantity + 1);
              const updatedTotal = (existing.unitPrice * nextQty) - existing.discount;
              const serialList = serial
                ? Array.from(new Set([...(existing.serialNumbers || []), serial.serialNumber]))
                : existing.serialNumbers;
              const imeiList = (serial && serial.imei)
                ? Array.from(new Set([...(existing.imeiNumbers || []), serial.imei]))
                : existing.imeiNumbers;

              const updated = [...prev];
              updated[existingIndex] = {
                ...existing,
                quantity: nextQty,
                total: updatedTotal,
                serialNumbers: serialList,
                imeiNumbers: imeiList,
              };

              if (existing.quantity >= prod.stock) {
                toast({
                  title: `Max Stock in Cart: ${prod.name}`,
                  description: `All ${prod.stock} units are already in the cart.`,
                  variant: 'default',
                });
              } else {
                toast({
                  title: `Cart Updated: ${prod.name} 🛒`,
                  description: `Quantity increased to ${nextQty} units.`,
                });
              }

              return updated;
            } else {
              const cat = categories.find((c) => c.id === prod.categoryId);
              const sup = suppliers.find((s) => s.id === prod.supplierId);
              const newItem: SaleCartItem = {
                productId: prod.id,
                productName: prod.name,
                sku: prod.sku,
                brand: prod.brand,
                model: prod.model,
                category: cat?.name || 'General',
                unitPrice: prod.sellingPrice,
                purchasePrice: prod.purchasePrice,
                quantity: 1,
                availableStock: prod.stock,
                serialNumbers: serial ? [serial.serialNumber] : undefined,
                imeiNumbers: (serial && serial.imei) ? [serial.imei] : undefined,
                discount: 0,
                total: prod.sellingPrice,
                warrantyPeriodMonths: typeof prod.warrantyPeriodMonths === 'number' ? prod.warrantyPeriodMonths : 0,
                imageUrl: getProductImageUrl(prod),
                supplierName: sup?.name,
                supplierCompany: sup?.company,
                supplierPhone: sup?.phone,
                supplierEmail: sup?.email,
                supplierGstin: sup?.gstin,
              };

              toast({
                title: `Added to Cart: ${prod.name} 🛒`,
                description: `1x ${prod.name} (${prod.sku}) added to sale cart.`,
              });

              return [...prev, newItem];
            }
          });
        } else {
          toast({
            title: `${matchTypeLabel} 📦`,
            description: `${prod.name} (${prod.sku}) selected.`,
          });
        }

        return {
          success: true,
          code: cleanCode,
          productName: prod.name,
          sku: prod.sku,
          cartQuantity: autoAddToCart ? resultingQty : undefined,
          message: autoAddToCart
            ? (resultingQty > 1 ? `Quantity: ${resultingQty} in cart` : 'Added 1 unit to cart')
            : 'Product details displayed below',
        };
      };

      // 1. Try matching by Serial Number
      for (const target of candidateCodes) {
        const serialMatch = serials.find(
          (s) => s.serialNumber.toLowerCase() === target.toLowerCase()
        );
        if (serialMatch) {
          const prod = products.find((p) => p.id === serialMatch.productId);
          if (prod) {
            return onMatchFound(prod, serialMatch, 'Serial Number Identified ⚡');
          }
        }
      }

      // 2. Try matching by IMEI Number
      for (const target of candidateCodes) {
        const imeiMatch = serials.find((s) => s.imei && s.imei === target);
        if (imeiMatch) {
          const prod = products.find((p) => p.id === imeiMatch.productId);
          if (prod) {
            return onMatchFound(prod, imeiMatch, 'IMEI Identified ⚡');
          }
        }
      }

      // 3. Try matching by Product SKU
      for (const target of candidateCodes) {
        const skuMatch = products.find(
          (p) => p.sku.toLowerCase() === target.toLowerCase()
        );
        if (skuMatch) {
          return onMatchFound(skuMatch, null, 'Product Identified by SKU 📦');
        }
      }

      // 4. Try matching by Product ID
      for (const target of candidateCodes) {
        const idMatch = products.find(
          (p) => p.id.toLowerCase() === target.toLowerCase()
        );
        if (idMatch) {
          return onMatchFound(idMatch, null, 'Product Identified by ID');
        }
      }

      // 5. Try matching by Model Number
      for (const target of candidateCodes) {
        const modelMatch = products.find(
          (p) => p.model && p.model.toLowerCase() === target.toLowerCase()
        );
        if (modelMatch) {
          return onMatchFound(modelMatch, null, 'Product Identified by Model');
        }
      }

      // 6. Try matching by barcode field (if stored on product)
      const barcodeMatch = products.find(
        (p) => (p as any).barcode && (p as any).barcode === cleanCode
      );
      if (barcodeMatch) {
        return onMatchFound(barcodeMatch, null, 'Product Identified by Barcode');
      }

      // 7. Partial Name search
      const nameMatch = products.find((p) =>
        p.name.toLowerCase().includes(cleanCode.toLowerCase())
      );
      if (nameMatch) {
        return onMatchFound(nameMatch, null, 'Product Matched by Name');
      }

      // 8. Partial SKU search (for partial scans)
      const partialSkuMatch = products.find((p) =>
        p.sku.toLowerCase().includes(cleanCode.toLowerCase()) ||
        cleanCode.toLowerCase().includes(p.sku.toLowerCase())
      );
      if (partialSkuMatch) {
        return onMatchFound(partialSkuMatch, null, 'Product Matched (Partial SKU)');
      }

      // If no product found — display clear invalid barcode feedback
      setLastScanError(cleanCode);
      const isEanBarcode = /^\d{8,14}$/.test(cleanCode);
      toast({
        title: 'Invalid Barcode / Not in Inventory ❌',
        description: isEanBarcode
          ? `External barcode "${cleanCode}" is not registered to any product. Use "Barcode Directory" to assign it or try Manual SKU.`
          : `No product found matching "${cleanCode}". Please verify the barcode or SKU.`,
        variant: 'destructive',
      });

      return {
        success: false,
        code: cleanCode,
        message: 'Barcode not found in inventory',
      };
    },
    [products, serials, categories, suppliers, autoAddToCart, cartItems, toast]
  );

  // Add Item to Cart
  const handleAddToCart = (newItem: SaleCartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === newItem.productId);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedQty = Math.min(newItem.availableStock, existing.quantity + newItem.quantity);
        const updatedTotal = (existing.unitPrice * updatedQty) - existing.discount;

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: updatedQty,
          total: updatedTotal,
          serialNumbers: newItem.serialNumbers || existing.serialNumbers,
        };
        return updated;
      } else {
        return [...prev, newItem];
      }
    });

    toast({
      title: 'Added to Sale Cart',
      description: `${newItem.quantity}x ${newItem.productName}`,
    });
  };

  // Quick Checkout Direct Action
  const handleQuickCheckout = (newItem: SaleCartItem) => {
    handleAddToCart(newItem);
    setPaymentModalOpen(true);
  };

  // Update Item Quantity in Cart
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const validQty = Math.min(item.availableStock, quantity);
          return {
            ...item,
            quantity: validQty,
            total: (item.unitPrice * validQty) - item.discount,
          };
        }
        return item;
      })
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast({ title: 'Item Removed from Cart' });
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
    toast({ title: 'Sale Cart Cleared' });
  };

  // Confirm Payment & Execute Sale Transaction
  const handleConfirmPayment = async (paymentData: {
    method: PaymentMethod;
    reference?: string;
    details?: any;
    notes?: string;
  }) => {
    setIsProcessingPayment(true);

    try {
      // Execute transaction through inventoryService
      const result = await inventoryService.checkoutSale({
        customer,
        items: cartItems,
        subtotal: cartSubtotal,
        discount: orderDiscount,
        grandTotal: cartGrandTotal,
        paymentMethod: paymentData.method,
        paymentReference: paymentData.reference,
        paymentDetails: paymentData.details,
        notes: paymentData.notes,
      });

      if (!result.success || !result.receipt) {
        throw new Error(result.error || 'Failed to process checkout transaction.');
      }

      // Close payment modal
      setPaymentModalOpen(false);

      // Save completed receipt and display full-screen Congratulations / Order Success page
      setCompletedReceipt(result.receipt);
      setActiveStep('receipt');

      // Clear the cart
      setCartItems([]);
    } catch (err: any) {
      console.error('Payment Error:', err);
      toast({
        title: 'Payment Failed',
        description: err?.message || 'Transaction could not be completed.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Reset for New Sale
  const handleNewSale = () => {
    setCompletedReceipt(null);
    setActiveStep('scanner');
    setCartItems([]);
    setOrderDiscount(0);
    toast({ title: 'Ready for New Sale', description: 'Scanner is active.' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="QR Product Scanner & POS Checkout"
        description="Identify products by scanning barcodes, manage multi-item sale carts, accept UPI/Cash/Card payments, and generate official PDF receipts."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrintableBarcodesOpen(true)}
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary hover:text-white"
            >
              <QrCode className="h-4 w-4" /> Barcode Directory
            </Button>

            {activeStep === 'receipt' && (
              <Button
                size="sm"
                onClick={handleNewSale}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white"
              >
                <PlusCircle className="h-4 w-4" /> Start New Sale
              </Button>
            )}
          </div>
        }
      />

      {/* POS Workflow Step Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-xs overflow-x-auto text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              activeStep === 'scanner' ? 'bg-primary text-white' : 'bg-success text-white'
            }`}
          >
            1
          </span>
          <span className={activeStep === 'scanner' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
            Scan Product
          </span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-2" />

        <div className="flex items-center gap-2 font-medium">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              cartItems.length > 0
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </span>
          <span className={cartItems.length > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}>
            Add to Cart ({cartItems.length})
          </span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-2" />

        <div className="flex items-center gap-2 font-medium">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              paymentModalOpen ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </span>
          <span className={paymentModalOpen ? 'font-bold text-foreground' : 'text-muted-foreground'}>
            UPI / Cash / Card Payment
          </span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-2" />

        <div className="flex items-center gap-2 font-medium">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              activeStep === 'receipt' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            4
          </span>
          <span className={activeStep === 'receipt' ? 'font-bold text-success' : 'text-muted-foreground'}>
            Generate PDF Receipt
          </span>
        </div>
      </div>

      {/* STEP 1: SCANNER & CART VIEW */}
      {activeStep === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: QR / Barcode Scanner & Product Details Card (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive QR Camera Scanner with Auto-Add toggle */}
            <QrCameraScanner
              onScan={handleScanCode}
              autoAddToCart={autoAddToCart}
              onAutoAddToCartChange={setAutoAddToCart}
            />

            {/* Invalid Barcode Alert Banner */}
            {lastScanError && (
              <div className="p-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 text-destructive flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in-fade">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Invalid Barcode Detected</span>
                      <Badge variant="destructive" className="text-[10px] font-bold uppercase">
                        Not in Inventory
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      Barcode <span className="font-mono-code font-bold underline">{lastScanError}</span> was not found in products, serials, or IMEIs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLastScanError(null)}
                    className="text-xs h-8 border-destructive/30 hover:bg-destructive/10"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPrintableBarcodesOpen(true)}
                    className="text-xs h-8 bg-destructive text-white hover:bg-destructive/90 gap-1.5"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Barcode Directory
                  </Button>
                </div>
              </div>
            )}

            {/* Identified Product Details Card with All 13 Fields */}
            {activeProduct ? (
              <ProductDetailsCard
                product={activeProduct}
                category={scannedCategory}
                supplier={scannedSupplier}
                availableSerials={availableSerialsForProduct}
                matchedSerial={matchedSerial}
                onAddToCart={handleAddToCart}
                onQuickCheckout={handleQuickCheckout}
                onRestock={handleRestock}
              />
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-card text-muted-foreground">
                <Barcode className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No Product Selected</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan a barcode above or select a product from the directory.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Live Sale / Checkout Cart (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <SaleCart
              items={cartItems}
              customer={customer}
              onCustomerChange={setCustomer}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onProceedToPayment={() => setPaymentModalOpen(true)}
              orderDiscount={orderDiscount}
              onOrderDiscountChange={setOrderDiscount}
            />
          </div>
        </div>
      )}

      {/* STEP 2: FULL-SCREEN CONGRATULATIONS / ORDER SUCCESS PAGE */}
      {activeStep === 'receipt' && completedReceipt && (
        <OrderSuccessPage
          receipt={completedReceipt}
          onNewSale={handleNewSale}
          onClose={() => {
            setCompletedReceipt(null);
            setActiveStep('scanner');
          }}
        />
      )}

      {/* Payment Settlement Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        items={cartItems}
        customer={customer}
        subtotal={cartSubtotal}
        discount={orderDiscount}
        grandTotal={cartGrandTotal}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingPayment}
      />

      {/* Printable Barcodes Directory Modal */}
      <PrintableBarcodesDialog
        open={printableBarcodesOpen}
        onOpenChange={setPrintableBarcodesOpen}
        onSelectProductCode={handleScanCode}
      />
    </div>
  );
}
