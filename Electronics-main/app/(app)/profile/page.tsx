'use client';

import { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  Building,
  Key,
  Calendar,
  CheckCircle2,
  Save,
  Lock,
  Sparkles,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { useInventoryStore } from '@/store/inventory-store';
import { getRoleLabel, getPermissions } from '@/lib/permissions';
import { getInitials, formatDate } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useInventoryStore((s) => s.updateUser);
  const addAuditLog = useInventoryStore((s) => s.addAuditLog);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [department, setDepartment] = useState('Store Inventory & Retail POS Operations');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const permissions = user ? getPermissions(user.role) : [];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }

    if (user) {
      updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        role: user.role,
        status: user.status,
      });

      // Update auth store user
      useAuthStore.setState({
        user: {
          ...user,
          name: name.trim(),
          email: email.trim(),
        },
      });

      addAuditLog({
        action: 'user_updated',
        actionLabel: 'Profile Updated',
        userName: name.trim(),
        userId: user.id,
        userRole: user.role,
        relatedId: user.id,
        description: `User ${name.trim()} updated their profile information`,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your account details have been successfully saved.',
      });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    if (newPass !== confirmPass) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both password fields match.',
        variant: 'destructive',
      });
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      toast({
        title: 'Password Changed',
        description: 'Your security password has been updated successfully.',
      });
    }, 500);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Profile & Account"
        description="Manage your account profile, role access credentials, contact information, and security preferences."
      />

      {/* Identity Banner */}
      <Card className="border border-border overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-navy via-navy/95 to-primary p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-white/20 text-white font-black text-2xl flex items-center justify-center border-2 border-white/30 shrink-0 shadow-lg">
              {getInitials(user.name)}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs capitalize">
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    user.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {user.status === 'active' ? 'Active Account' : 'Inactive'}
                </Badge>
              </div>

              <p className="text-xs text-white/80 font-mono-code">{user.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/70 pt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Member since {user.createdAt ? formatDate(user.createdAt) : '2024'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono-code">ID: {user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription className="text-xs">
                Update personal details associated with your operator profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Patel"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. arjun@electrostock.internal"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="text-xs font-mono-code"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Department / Location</label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Primary Warehouse"
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" /> Save Profile Details
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> Security & Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update account authentication credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <Input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <Input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="text-xs"
                  />
                </div>

                <Button type="submit" disabled={passLoading} variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" /> {passLoading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Role Permissions Matrix */}
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Active Permissions
              </CardTitle>
              <CardDescription className="text-xs">
                Features authorized for your assigned <strong>{getRoleLabel(user.role)}</strong> role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5 max-h-96 overflow-y-auto pr-1">
                {permissions.map((perm) => (
                  <Badge
                    key={perm}
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-xs py-1 px-2.5 font-mono-code"
                  >
                    ✓ {perm.replace('_', ' ')}
                  </Badge>
                ))}
              </div>

              <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Role Assignment:</strong> Only authorized System Administrators can modify user roles or assign elevated administrative privileges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
