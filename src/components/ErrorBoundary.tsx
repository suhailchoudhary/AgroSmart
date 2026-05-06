import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <LanguageContext.Consumer>
          {({ t }) => {
            let errorMessage = t('common.somethingWentWrong');
            try {
              const parsedError = JSON.parse(this.state.error?.message || '');
              if (parsedError.error) {
                errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
              }
            } catch (e) {
              errorMessage = this.state.error?.message || errorMessage;
            }

            return (
              <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 max-w-md w-full text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">{t('common.applicationError')}</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
                  >
                    {t('common.reloadApplication')}
                  </button>
                </div>
              </div>
            );
          }}
        </LanguageContext.Consumer>
      );
    }

    return this.props.children;
  }
}
