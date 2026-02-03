import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isDynamicImportError?: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('AppErrorBoundary caught error:', error);
    const isDynamicImportError = error.message?.includes('Failed to fetch dynamically imported module') ||
                                 error.message?.includes('Failed to fetch');
    return { hasError: true, error, isDynamicImportError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch (e) {
      console.error('Reload failed:', e);
    }
  };

  handleClearCacheAndReload = async () => {
    try {
      // Clear service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }

      // Clear caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      // Reload with cache-busting parameter
      const url = new URL(window.location.href);
      url.searchParams.set('_cb', String(Date.now()));
      window.location.replace(url.toString());
    } catch (e) {
      console.error('Cache clearing failed:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {this.state.isDynamicImportError
                  ? 'Failed to load a required module. Your browser cache may be out of date.'
                  : 'The application encountered an error and couldn\'t continue.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                  <p className="text-xs text-muted-foreground font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                {this.state.isDynamicImportError && (
                  <Button
                    onClick={this.handleClearCacheAndReload}
                    className="w-full"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache & Reload
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                If the problem persists, please try closing and reopening your browser.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
