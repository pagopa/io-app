import React, { useState } from "react";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";

export type TabBarItemPressType = {
  setTabPressCallback: React.Dispatch<React.SetStateAction<() => void>>;
  setHasInternalTab: React.Dispatch<React.SetStateAction<boolean>>;
};

export function withUseTabItemPressWhenScreenActive<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return (props: any) => {
    const [callback, setTabPressCallback] = useState<() => void>(() => void 0);
    const [hasInternalTab, setHasInternalTab] = useState(false);

    const contextProps = {
      setTabPressCallback,
      setHasInternalTab
    };

    useTabItemPressWhenScreenActive(callback, hasInternalTab);

    return <WrappedComponent {...contextProps} {...props} />;
  };
}
