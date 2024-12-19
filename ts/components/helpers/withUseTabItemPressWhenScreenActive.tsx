import { ComponentType, Dispatch, SetStateAction, useState } from "react";

import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";

export type TabBarItemPressType = {
  setTabPressCallback: Dispatch<SetStateAction<() => void>>;
  setHasInternalTab: Dispatch<SetStateAction<boolean>>;
};

export function withUseTabItemPressWhenScreenActive<P>(
  WrappedComponent: ComponentType<P>
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
