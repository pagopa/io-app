import * as React from "react";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  fallback: React.ReactNode;
  onError?:
    | ((error: unknown, componentStack: string | undefined) => void)
    | undefined;
}>;

type State = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: unknown) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(error, info.componentStack ?? "");
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
