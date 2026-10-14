'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  QrCode,
  CreditCard,
  ShieldCheck,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Inventory',
    question: 'How do minimum stock alerts work in ElectroStock?',
    answer:
      'Each product in the catalog has a "Minimum Stock" threshold. When available units fall below this threshold due to sales or stock-out transactions, the system automatically triggers a warning alert and adds the product to Reorder Suggestions with suggested purchase quantities.',
  },
  {
    category: 'Stock In/Out',
    question: 'What is the difference between Stock In and Stock Out?',
    answer:
      'Stock In records new stock received from suppliers or inward adjustments, which increases product inventory and sets the latest purchase cost. Stock Out records customer sales or outward stock removals, which decreases inventory, generates warranty tracking, and calculates gross profit.',
  },
  {
    category: 'POS & Scanner',
    question: 'Can I scan both 1D Barcodes and 2D QR Codes?',
    answer:
      'Yes! ElectroStock supports camera-based video scanning and USB hardware scanners for standard 1D barcodes (Code128, EAN-13, UPC) and 2D QR codes containing product SKU, serial numbers, or IMEI credentials.',
  },
  {
    category: 'Payments',
    question: 'How does dynamic UPI QR Payment work?',
    answer:
      'When you choose UPI at checkout, ElectroStock generates a compliant NPCI UPI QR code containing the exact bill amount and unique invoice reference. Customers can scan using Google Pay, PhonePe, Paytm, or BHIM to pay instantly.',
  },
  {
    category: 'Warranty',
    question: 'How are warranty periods tracked and calculated?',
    answer:
      'ElectroStock automatically tracks warranty periods in months or years from the purchase date. The system computes the exact expiry date and displays live statuses: Active, Expiring Soon (within 30 days), and Expired.',
  },
  {
    category: 'Purchase Center',
    question: 'How does the automated purchase reordering workflow work?',
    answer:
      'When stock is low, the Reorder workspace calculates recommended order quantities. With one click, you can create a Purchase Order for the assigned supplier, approve it, and inward the stock once delivered.',
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast({ title: 'Please provide both subject and message', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: 'Support Request Dispatched',
        description: `Ticket #${Math.floor(1000 + Math.random() * 9000)} created. Our team will contact you shortly.`,
      });
      setTicketSubject('');
      setTicketMessage('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Help & Knowledge Center"
        description="Comprehensive guides, operational workflows, barcode scanning tutorials, and direct enterprise support."
      />

      {/* Hero Search Box */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-navy via-navy/95 to-primary text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How can we help you today?</h2>
            <p className="text-xs text-white/80">Search documentation, FAQs, and hardware scanning guides.</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, e.g. 'UPI payment', 'warranty claim', 'stock in'..."
            className="pl-11 h-12 bg-white text-foreground rounded-xl shadow-lg border-none text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Interactive Tabs: Guides vs FAQs vs Contact */}
      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="guides" className="text-xs font-semibold gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Interactive Guides
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs font-semibold gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> FAQs
          </TabsTrigger>
          <TabsTrigger value="support" className="text-xs font-semibold gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Support & Contact
          </TabsTrigger>
        </TabsList>

        {/* 1. GUIDES TAB */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Guide 1: Inventory Management */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">1. Inventory Management</CardTitle>
                <CardDescription className="text-xs">
                  Adding catalog products, brands, models, and setting minimum stock thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Navigate to <strong>Products</strong> & click <strong>Add Product</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Enter Brand, Model, SKU, Category, and primary Supplier.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Configure purchase price, selling price, and minimum stock safety buffer.</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide 2: Stock In / Out */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center mb-2">
                  <ArrowDownToLine className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">2. Stock In & Stock Out</CardTitle>
                <CardDescription className="text-xs">
                  Receiving supplier shipments and dispatching units for retail customer sales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Use <strong>Stock In</strong> to inward new batch deliveries with purchase invoices.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Use <strong>Stock Out</strong> or <strong>Scan Product</strong> to record sales.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Profit & Loss is automatically calculated per transaction.</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide 3: Purchase Center */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">3. Purchase Center & POs</CardTitle>
                <CardDescription className="text-xs">
                  Automated reordering workflow from low-stock suggestion to stock inward.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Review <strong>Reorder Suggestions</strong> for critical inventory shortages.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Click <strong>Create PO</strong> to bundle items and select vendor.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Click <strong>Receive Stock</strong> once goods arrive to increment stock.</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide 4: QR & Barcode Scanner */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2">
                  <QrCode className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">4. QR & Barcode Scanner</CardTitle>
                <CardDescription className="text-xs">
                  High-speed optical scanning for POS checkout, serial numbers, and IMEI lookup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Open <strong>Scan Product</strong> and grant camera permission when prompted.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Align barcode within green laser guide or type SKU manually.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>View matched product details, warranty status, and add to sale cart.</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide 5: Payment & Receipts */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">5. Payment & PDF Receipts</CardTitle>
                <CardDescription className="text-xs">
                  Accept UPI QR, Cash, and Cards, and auto-generate GST-compliant PDF receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Review Cart items, enter customer phone and name, and proceed to pay.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Display the dynamic UPI QR code containing the exact payable amount.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Click <strong>Download PDF</strong> or <strong>Print</strong> for the customer.</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide 6: Warranty Tracking */}
            <Card className="border border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">6. Warranty Registration</CardTitle>
                <CardDescription className="text-xs">
                  Digital warranty certificates, repair RMA tracking, and expiration alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Warranties auto-register upon customer checkout completion.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>Or manually register a certificate under <strong>Warranty</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>File and track customer RMA repair claims with status updates.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. FAQS TAB */}
        <TabsContent value="faqs" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-xs">
                Answers to common inquiries regarding operation, hardware, accounting, and user permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={faq.question}
                    className="rounded-lg border border-border overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-[10px] font-mono-code">
                          {faq.category}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">{faq.question}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SUPPORT TAB */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Details Card */}
            <Card className="border border-border lg:col-span-1 space-y-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Contact Support</CardTitle>
                <CardDescription className="text-xs">
                  Enterprise technical support desk for hardware and platform inquiries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Email Support</span>
                    <span className="text-muted-foreground">support@electrostock.internal</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Toll-Free Helpline</span>
                    <span className="text-muted-foreground font-mono-code">+91 1800 200 4567</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Mon–Sat, 9:00 AM – 8:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Emergency POS Support</span>
                    <span className="text-muted-foreground">Available 24/7 for active retail checkouts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Support Ticket Form */}
            <Card className="border border-border lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Create a Support Ticket</CardTitle>
                <CardDescription className="text-xs">
                  Submit a technical inquiry or feature request to the ElectroStock engineering team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Subject / Issue Title *</label>
                    <Input
                      placeholder="e.g. Barcode scanner device not detecting EAN-13 barcodes"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Priority Level</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high', 'urgent'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketPriority(p)}
                          className={`px-3 py-1 rounded text-xs font-medium capitalize border transition-colors ${
                            ticketPriority === p
                              ? 'bg-primary text-white border-primary'
                              : 'bg-card text-muted-foreground hover:bg-muted border-border'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Detailed Description *</label>
                    <Textarea
                      placeholder="Provide step-by-step reproduction steps or details regarding the inquiry..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      rows={4}
                      className="text-xs"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="gap-2">
                    <Send className="h-4 w-4" /> {submitting ? 'Submitting Ticket...' : 'Dispatch Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
