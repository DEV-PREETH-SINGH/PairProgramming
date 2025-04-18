import React, { Component, memo } from 'react';
import { View } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <View />;
    }

    return this.props.children;
  }
}

interface PerformanceWrapperProps {
  children: React.ReactNode;
  shouldUpdate?: (prevProps: any, nextProps: any) => boolean;
  fallback?: React.ReactNode;
}

const PerformanceWrapper: React.FC<PerformanceWrapperProps> = memo(
  ({ children, fallback }) => {
    return (
      <ErrorBoundary fallback={fallback}>
        {children}
      </ErrorBoundary>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.shouldUpdate) {
      return prevProps.shouldUpdate(prevProps, nextProps);
    }
    return true;
  }
);

export default PerformanceWrapper; 