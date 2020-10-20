/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import { Modal } from "react-native";
import { isScreenReaderEnabled } from "../../utils/accessibility";
import BottomSheetComponent from "../BottomSheetComponent";

export type BottomSheetContextInterface = Readonly<{
  component: React.ReactNode;
  sheetTitle: string;
  snapPoint: number;
  showBS: (
    component: React.ReactNode,
    title: string,
    snapPoint: number
  ) => void;
  hideBS: () => void;
}>;

export const BottomSheetContext = React.createContext<
  BottomSheetContextInterface
>({
  component: null,
  sheetTitle: "",
  snapPoint: 0,
  showBS: () => undefined,
  hideBS: () => undefined
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

  const showBS = async (
    childComponent: React.ReactNode,
    sheetTitle: string,
    snapPoint: number
  ) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const component = isScreenReaderActive ? (
      <Modal>{childComponent}</Modal>
    ) : (
      childComponent
    );
    setBottomSheetState({
      component,
      sheetTitle,
      snapPoint
    });
  };

  const hideBS = () => {
    setBottomSheetState(initialState);
  };

  const providerValue = {
    ...bottomSheetState,
    showBS,
    hideBS
  };

  return (
    <BottomSheetContext.Provider value={providerValue}>
      {props.children}
    </BottomSheetContext.Provider>
  );
};

export const BottomSheetRoot: React.FunctionComponent = () => (
  <BottomSheetConsumer>
    {({ component, sheetTitle, snapPoint, hideBS }) => (
      <BottomSheetComponent
        content={component}
        maxSnapPoint={snapPoint}
        bottomSheetTitle={sheetTitle}
        handleClose={hideBS}
      />
    )}
  </BottomSheetConsumer>
);
