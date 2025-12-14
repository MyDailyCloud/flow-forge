import React, { ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const isDev = import.meta.env.DEV;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* 错误图标 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* 错误标题 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            出错了 / Something went wrong
          </h1>
          <p className="text-muted-foreground">
            应用遇到了一个意外错误，请尝试刷新页面或返回首页。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            重试 / Retry
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            返回首页 / Go Home
          </Button>
        </div>

        {/* 开发模式显示错误详情 */}
        {isDev && error && (
          <div className="mt-8 text-left">
            <details className="bg-muted/50 rounded-lg p-4 border border-border">
              <summary className="cursor-pointer text-sm font-medium text-foreground mb-2">
                错误详情 / Error Details (Dev Only)
              </summary>
              <div className="space-y-3 mt-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Error Message:</p>
                  <pre className="text-xs text-destructive bg-background p-2 rounded overflow-auto max-h-24">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Stack Trace:</p>
                    <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Component Stack:</p>
                    <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
