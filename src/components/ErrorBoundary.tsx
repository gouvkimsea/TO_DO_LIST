import React from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const STORAGE_KEY = 'interactive_todo_dashboard_state_v1';

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Application ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = (): void => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  handleResetAndReload = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage access issues
    }
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center bg-[#FAF6F0] text-[#2F2B28] px-4 py-12"
        >
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5DEC9] shadow-[0_18px_45px_-12px_rgba(68,53,39,0.12)] p-6 sm:p-8 text-center space-y-4">
            <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-[#B07B54]">
              UNEXPECTED ISSUE
            </span>
            <h1 className="font-serif-display font-extrabold text-2xl sm:text-3xl text-[#2F2C2A]">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed">
              We encountered an unexpected problem while rendering your dashboard.
              You can reload the page or reset saved browser data to restore the
              default tasks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-[#C26D43] hover:bg-[#AE5D35] text-white text-xs font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Dashboard</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="bg-[#F4EFE6] hover:bg-[#EAE2D6] text-[#4A433C] border border-[#E0D9CE] text-xs font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Saved Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
