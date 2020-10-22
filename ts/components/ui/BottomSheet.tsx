/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import BottomSheetComponent from "../BottomSheetComponent";

export type BottomSheetContextInterface = Readonly<{
  component: React.ReactNode;
  sheetTitle: string;
  snapPoint: number;
  showBottomSheet: (
    component: React.ReactNode,
    title: string,
    snapPoint: number
  ) => void;
  hideBottomSheet: () => void;
}>;

export const BottomSheetContext = React.createContext<
  BottomSheetContextInterface
>({
  component: null,
  sheetTitle: "",
  snapPoint: 0,
  showBottomSheet: () => undefined,
  hideBottomSheet: () => undefined
});

type Props = Record<string, unknown> & { children: React.ReactNode };

export const BottomSheetConsumer = BottomSheetContext.Consumer;

type BottomSheetState = {
  component: React.ReactNode;
  sheetTitle: string;
  snapPoint: number;
};

export const BottomSheetProvider: React.FunctionComponent<Props> = (
  props: Props
) => {
  const initialState = {
    component: null,
    sheetTitle: "",
    snapPoint: 0
  };

  const [bottomSheetState, setBottomSheetState] = React.useState<
    BottomSheetState
  >(initialState);

  const showBottomSheet = async (
    component: React.ReactNode,
    sheetTitle: string,
    snapPoint: number
  ) => {
    setBottomSheetState({
      component,
      sheetTitle,
      snapPoint
    });
  };

  const hideBottomSheet = () => {
    setBottomSheetState(initialState);
  };

  const providerValue = {
    ...bottomSheetState,
    showBottomSheet,
    hideBottomSheet
  };

  return (
    <BottomSheetContext.Provider value={providerValue}>
      {props.children}
    </BottomSheetContext.Provider>
  );
};

export const BottomSheetRoot: React.FunctionComponent = () => (
  <BottomSheetConsumer>
    {({ component, sheetTitle, snapPoint, hideBottomSheet }) => (
      <BottomSheetComponent
        content={component}
        maxSnapPoint={snapPoint}
        bottomSheetTitle={sheetTitle}
        handleClose={hideBottomSheet}
      />
    )}
  </BottomSheetConsumer>
);
