import React, { useState } from "react";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";

export type TabBarItemPressType = {
  setTabPressCallback: React.Dispatch<React.SetStateAction<() => void>>;
  setHasInternTab: React.Dispatch<React.SetStateAction<boolean>>;
};

export function withUseTabItemPressWhenScreenActive<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return (props: any) => {
    const [callback, setTabPressCallback] = useState<() => void>(() => void 0);
    const [hasInternTab, setHasInternTab] = useState(false);

    const contextProps = {
      setTabPressCallback,
      setHasInternTab
    };

    useTabItemPressWhenScreenActive(callback, hasInternTab);

    return <WrappedComponent {...contextProps} {...props} />;
  };
}
