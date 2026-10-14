'use client';

import { useState, useEffect } from 'react';
import {
  QrCode,
  Banknote,
  CreditCard,
  Layers,
  CheckCircle2,
  Copy,
  Clock,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatINR } from '@/lib/calculations';
import { generateQRCodeDataUrl, buildUPIPaymentString } from '@/lib/product-assets';
import type { SaleCartItem, SaleCustomer, PaymentMethod } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SaleCartItem[];
  customer: SaleCustomer;
  subtotal: number;
  discount: number;
  grandTotal: number;
  onConfirmPayment: (paymentData: {
    method: PaymentMethod;
    reference?: string;
    details?: any;
    notes?: string;
  }) => void;
  isProcessing?: boolean;
}

export function PaymentModal({
  open,
  onOpenChange,
  items,
  customer,
  subtotal,
  discount,
  grandTotal,
  onConfirmPayment,
  isProcessing = false,
}: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // UPI State
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [upiRef, setUpiRef] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min countdown

  // Cash State
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [cashNotes, setCashNotes] = useState('');

  // Card State
  const [cardType, setCardType] = useState('Visa');
  const [cardLast4, setCardLast4] = useState('');
  const [cardAuthCode, setCardAuthCode] = useState('');

  // Other State
  const [otherMode, setOtherMode] = useState('Net Banking');
  const [otherRef, setOtherRef] = useState('');

  // Generate Dynamic Payment QR Code when grand total changes or modal opens
  useEffect(() => {
    if (!open) return;

    setCashTendered(grandTotal);
    setTimerSeconds(300);

    const upiString = buildUPIPaymentString({
      payeeVpa: 'electrostock@upi',
      payeeName: 'ElectroStock Retail Solutions',
      amount: grandTotal,
      transactionNote: `Invoice-${customer.name.slice(0, 10)}`,
      transactionId: `TXN${Date.now().toString().slice(-6)}`,
    });

    generateQRCodeDataUrl(upiString, { width: 260, margin: 2 }).then((url) => {
      setUpiQrDataUrl(url);
    });
  }, [open, grandTotal, customer.name]);

  // UPI Timer tick
  useEffect(() => {
    if (!open || paymentMethod !== 'upi') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, paymentMethod]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('electrostock@upi');
    setUpiCopied(true);
    toast({ title: 'UPI ID Copied', description: 'electrostock@upi copied to clipboard' });
    setTimeout(() => setUpiCopied(false), 2000);
  };

  // Cash quick denomination chips
  const addCashTendered = (amount: number) => {
    setCashTendered((prev) => prev + amount);
  };

  const changeDue = Math.max(0, cashTendered - grandTotal);

  // Complete Payment Action
  const handleComplete = () => {
    let reference = '';
    let details: any = {};

    if (paymentMethod === 'upi') {
      reference = upiRef || `UPI-${Date.now().toString().slice(-6)}`;
      details = { upiId: 'electrostock@upi', upiRef: reference };
    } else if (paymentMethod === 'cash') {
      reference = `CASH-${Date.now().toString().slice(-6)}`;
      details = { cashTendered, changeDue, notes: cashNotes };
    } else if (paymentMethod === 'card') {
      reference = cardAuthCode || `AUTH-${Date.now().toString().slice(-6)}`;
      details = { cardType, cardLast4: cardLast4 || '4242', authCode: reference };
    } else {
      reference = otherRef || `REF-${Date.now().toString().slice(-6)}`;
      details = { mode: otherMode, reference };
    }

    onConfirmPayment({
      method: paymentMethod,
      reference,
      details,
      notes: paymentMethod === 'cash' ? cashNotes : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border bg-card">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 bg-gradient-to-r from-navy via-navy to-primary/90 text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment & Settlement
              </DialogTitle>
              <DialogDescription className="text-xs text-white/70 mt-0.5">
                Customer: <span className="font-semibold text-white">{customer.name}</span> ({customer.phone})
              </DialogDescription>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/70 uppercase tracking-wider block font-semibold">
                Amount Due
              </span>
              <span className="text-2xl font-extrabold text-white font-mono-code">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Selected Products Compact Summary Bar */}
        <div className="bg-muted/40 px-4 py-2 border-b border-border text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            <span>•</span>
            <span>Subtotal: {formatINR(subtotal)}</span>
            {discount > 0 && (
              <>
                <span>•</span>
                <span className="text-success font-semibold">Disc: -{formatINR(discount)}</span>
              </>
            )}
          </div>
          <Badge variant="outline" className="text-[11px] font-mono-code bg-background">
            GST 18% Included
          </Badge>
        </div>

        {/* Payment Tabs Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <Tabs
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full h-11 bg-muted/60 p-1">
              <TabsTrigger value="upi" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                <QrCode className="h-4 w-4 text-primary" /> UPI QR
              </TabsTrigger>
              <TabsTrigger value="cash" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                <Banknote className="h-4 w-4 text-emerald-600" /> Cash
              </TabsTrigger>
              <TabsTrigger value="card" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                <CreditCard className="h-4 w-4 text-blue-600" /> Card
              </TabsTrigger>
              <TabsTrigger value="other" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                <Layers className="h-4 w-4 text-purple-600" /> Other
              </TabsTrigger>
            </TabsList>

            {/* 1. UPI QR TAB */}
            <TabsContent value="upi" className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-muted/20 p-4 rounded-xl border border-border">
                {/* Dynamic QR Code Card */}
                <div className="flex flex-col items-center space-y-2 shrink-0">
                  <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-primary/30 flex items-center justify-center">
                    {upiQrDataUrl ? (
                      <img
                        src={upiQrDataUrl}
                        alt="Dynamic Payment UPI QR Code"
                        className="w-48 h-48 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-muted flex items-center justify-center text-xs animate-pulse">
                        Generating Dynamic QR...
                      </div>
                    )}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white">
                      BHIM UPI
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>QR expires in:</span>
                    <span className="font-mono-code font-bold text-foreground">{formatTimer(timerSeconds)}</span>
                  </div>
                </div>

                {/* UPI Details & Test Simulator */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                      Scan with any UPI App
                    </span>
                    <div className="text-xl font-extrabold text-foreground font-mono-code mt-0.5">
                      {formatINR(grandTotal)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Supports GPay, PhonePe, Paytm, Cred, BHIM & all bank UPI apps
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-muted-foreground block">Store UPI ID:</span>
                      <span className="font-mono-code font-semibold text-xs text-foreground truncate block">
                        electrostock@upi
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUpi}
                      className="h-7 text-xs gap-1"
                    >
                      <Copy className="h-3 w-3" /> {upiCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-foreground block mb-1">
                      UPI Ref / UTR Number (Optional)
                    </label>
                    <Input
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      placeholder="e.g. 423940192831"
                      className="h-8 text-xs font-mono-code"
                    />
                  </div>

                  {/* 1-Click Instant Payment Simulation */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUpiRef(`UPI-${Date.now().toString().slice(-6)}`);
                      toast({
                        title: 'Simulated UPI Customer Payment',
                        description: `Received ₹${grandTotal.toLocaleString('en-IN')} successfully!`,
                      });
                    }}
                    className="w-full text-xs gap-1.5 border border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Simulate Customer Scan & Pay
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 2. CASH TAB */}
            <TabsContent value="cash" className="pt-4 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Cash Tendered / Received (₹)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseInt(e.target.value) || 0)}
                      className="text-base font-bold font-mono-code h-10"
                    />
                    {cashTendered < grandTotal && (
                      <p className="text-[11px] text-destructive mt-1">
                        Amount tendered is less than Grand Total ({formatINR(grandTotal - cashTendered)} remaining)
                      </p>
                    )}
                  </div>

                  {/* Change Due Box */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
                      Change Due to Customer
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-code">
                      {formatINR(changeDue)}
                    </div>
                  </div>
                </div>

                {/* Quick Cash Chips */}
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">
                    Quick Currency Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCashTendered(grandTotal)}
                      className="text-xs h-7 font-mono-code"
                    >
                      Exact (₹{grandTotal.toLocaleString('en-IN')})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCashTendered(500)}
                      className="text-xs h-7 font-mono-code"
                    >
                      +₹500
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCashTendered(2000)}
                      className="text-xs h-7 font-mono-code"
                    >
                      +₹2,000
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCashTendered(5000)}
                      className="text-xs h-7 font-mono-code"
                    >
                      +₹5,000
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1 font-medium">
                    Cashier / Register Notes (Optional)
                  </label>
                  <Input
                    value={cashNotes}
                    onChange={(e) => setCashNotes(e.target.value)}
                    placeholder="e.g. Counter Register #1"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </TabsContent>

            {/* 3. CARD TAB */}
            <TabsContent value="card" className="pt-4 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Card Network</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="RuPay">RuPay</option>
                      <option value="Amex">American Express</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Last 4 Digits</label>
                    <Input
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      placeholder="e.g. 8842"
                      className="h-9 text-xs font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">POS Auth Code</label>
                    <Input
                      value={cardAuthCode}
                      onChange={(e) => setCardAuthCode(e.target.value)}
                      placeholder="e.g. AUTH-9281"
                      className="h-9 text-xs font-mono-code"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Swipe/Dip card on EDC POS Terminal and confirm approval code.
                </p>
              </div>
            </TabsContent>

            {/* 4. OTHER TAB */}
            <TabsContent value="other" className="pt-4 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Payment Method</label>
                    <select
                      value={otherMode}
                      onChange={(e) => setOtherMode(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
                    >
                      <option value="Net Banking">Net Banking (IMPS / NEFT)</option>
                      <option value="Store Credit">Store Credit / Gift Voucher</option>
                      <option value="Cheque">Bank Cheque / DD</option>
                      <option value="Bajaj Finserv EMI">Consumer Financing / EMI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Reference / Cheque No.</label>
                    <Input
                      value={otherRef}
                      onChange={(e) => setOtherRef(e.target.value)}
                      placeholder="Transaction / Reference ID"
                      className="h-9 text-xs font-mono-code"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              onClick={handleComplete}
              disabled={isProcessing || (paymentMethod === 'cash' && cashTendered < grandTotal)}
              className="px-6 h-11 text-sm font-bold gap-2 bg-success hover:bg-success/90 text-white shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isProcessing ? 'Processing Transaction...' : `Confirm ${formatINR(grandTotal)} Payment`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
