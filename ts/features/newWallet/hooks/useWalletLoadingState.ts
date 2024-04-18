import * as React from "react";

export const useWalletLoadingState = (timeoutMs: number = 3000) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, timeoutMs);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [timeoutMs, isLoading, setIsLoading]);

  return [isLoading, setIsLoading];
};
