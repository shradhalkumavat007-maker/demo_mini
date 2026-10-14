'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Application Error Caught by Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/30 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-destructive">
            An Unexpected Problem Occurred
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            The operation could not be completed cleanly. We caught the issue so your session remains safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/60 p-3.5 border border-border text-xs font-mono-code text-foreground overflow-x-auto max-h-32">
            {error?.message || 'Unknown runtime error occurred.'}
          </div>
          {error?.digest && (
            <p className="text-[11px] text-muted-foreground text-center">
              Error Digest: <span className="font-mono-code">{error.digest}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto flex-1 gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
