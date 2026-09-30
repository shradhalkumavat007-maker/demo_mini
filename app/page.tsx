'use client';

import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Package,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Bell,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">ElectroStock</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Benefits</Link>
            <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
            <Button asChild><Link href="/login">Get Started</Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
            <Link href="#features" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="#benefits" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Benefits</Link>
            <Button asChild className="w-full"><Link href="/login">Get Started</Link></Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                Smart Inventory Management Platform
              </Badge>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Smart Inventory Management for Electronic Businesses
              </h1>
              <p className="text-lg text-white/70 max-w-xl">
                Manage products, stock, suppliers, serial numbers, warranties and purchase orders from one powerful platform.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/login">Get Started <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                {['Real-time Stock Tracking', 'Serial / IMEI Management', 'Auto Reorder Suggestions'].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                    </div>
                    <span className="text-xs text-white/40 ml-2">ElectroStock Dashboard</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Products', value: '12', icon: Package },
                        { label: 'Stock Value', value: '8.4L', icon: TrendingUp },
                        { label: 'Low Stock', value: '3', icon: Bell },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-lg bg-white/5 p-3">
                          <kpi.icon className="h-4 w-4 text-primary mb-2" />
                          <div className="text-lg font-bold text-white">{kpi.value}</div>
                          <div className="text-[10px] text-white/50">{kpi.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {['Samsung 55" Crystal 4K Smart TV', 'Apple iPhone 15 (128GB)', 'HP Pavilion 14 Laptop'].map((p, i) => (
                        <div key={p} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                          <span className="text-xs text-white/80">{p}</span>
                          <Badge variant="outline" className={
                            i === 0 ? 'border-warning/30 text-warning bg-warning/10' :
                            i === 1 ? 'border-destructive/30 text-destructive bg-destructive/10' :
                            'border-success/30 text-success bg-success/10'
                          }>{i === 0 ? 'Low Stock' : i === 1 ? 'Out of Stock' : 'In Stock'}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">The Inventory Challenge</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Electronic businesses struggle with scattered stock data, manual tracking, and missed reorder opportunities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Package, title: 'Disconnected Stock Data', desc: 'Stock levels tracked in spreadsheets lead to errors, overselling, and missed sales opportunities.' },
              { icon: Bell, title: 'No Early Warning System', desc: 'Without automatic alerts, low stock and expiring warranties go unnoticed until it is too late.' },
              { icon: ShoppingCart, title: 'Manual Purchase Process', desc: 'Reordering is slow and error-prone without a centralized purchase workflow and supplier management.' },
            ].map((item) => (
              <Card key={item.title} className="border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
                    <item.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">The ElectroStock Solution</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              One unified platform that brings your entire electronics inventory lifecycle under control.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Package, title: 'Product Catalog', desc: 'Centralized product management with categories, brands, models, and pricing.' },
              { icon: RefreshCw, title: 'Stock Movement', desc: 'Track every stock in and stock out transaction with automatic value updates.' },
              { icon: ShoppingCart, title: 'Purchase Workflow', desc: 'From reorder suggestion to received stock in one streamlined workflow.' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Dashboard KPIs, profit and loss tracking, and actionable business insights.' },
            ].map((item) => (
              <Card key={item.title} className="border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">Complete Feature Set</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage an electronics business inventory in one place.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Package, title: 'Product Management', desc: 'Full CRUD for products with SKU tracking, categories, brands, and pricing.' },
              { icon: ShoppingCart, title: 'Purchase Center', desc: 'Create, approve, and receive purchase orders with automatic stock updates.' },
              { icon: RefreshCw, title: 'Auto Reorder', desc: 'Intelligent suggestions when stock falls below minimum levels.' },
              { icon: Smartphone, title: 'Serial / IMEI Tracking', desc: 'Track individual units by serial number or IMEI with status management.' },
              { icon: ShieldCheck, title: 'Warranty Management', desc: 'Automatic warranty status tracking with expiry alerts.' },
              { icon: Bell, title: 'Alert Center', desc: 'Consolidated alerts for low stock, out of stock, and warranty issues.' },
              { icon: TrendingUp, title: 'Profit & Loss', desc: 'Real-time profit calculations with product-wise and category-wise breakdowns.' },
              { icon: BarChart3, title: 'Reports & Export', desc: 'Generate and export reports for inventory, transactions, and purchases.' },
              { icon: LayoutDashboard, title: 'Role-based Dashboards', desc: 'Tailored views for admin, manager, and staff with permission controls.' },
            ].map((item) => (
              <Card key={item.title} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              A simple, end-to-end workflow from stock detection to inventory replenishment.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Track Stock', desc: 'Monitor stock levels in real-time as products move in and out.' },
              { step: '02', title: 'Detect Low Stock', desc: 'System automatically flags products below minimum stock levels.' },
              { step: '03', title: 'Create Purchase Order', desc: 'Generate POs from reorder suggestions with supplier selection.' },
              { step: '04', title: 'Receive & Update', desc: 'Receive stock and inventory updates automatically across the system.' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <Card className="border-border">
                  <CardContent className="p-6 space-y-3">
                    <span className="text-3xl font-bold text-primary/20">{item.step}</span>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground lg:text-3xl">Why Choose ElectroStock</h2>
              <p className="text-muted-foreground">
                Built specifically for electronics businesses that need precise control over their inventory lifecycle.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Reduce Stockouts', desc: 'Automatic reorder suggestions prevent lost sales from out-of-stock situations.' },
                  { title: 'Track Every Unit', desc: 'Serial and IMEI tracking gives you full visibility of individual products.' },
                  { title: 'Monitor Profitability', desc: 'Real-time profit and loss calculations help you make informed pricing decisions.' },
                  { title: 'Role-based Access', desc: 'Admin, manager, and staff roles ensure the right people see the right data.' },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '100%', label: 'Stock Visibility' },
                { value: 'Auto', label: 'Reorder Alerts' },
                { value: '3', label: 'Role Dashboards' },
                { value: 'CSV', label: 'Report Export' },
              ].map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl font-bold lg:text-3xl">Ready to Take Control of Your Inventory?</h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Get started with ElectroStock today. Use the demo accounts to explore the full platform.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/login">Get Started Now <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-foreground">ElectroStock</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart Inventory Management for Electronic Businesses — BCA Project Demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
