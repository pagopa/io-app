/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import { Modal, StyleSheet, View } from "react-native";
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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1000
  }
});

export const BottomSheetConsumer = BottomSheetContext.Consumer;

export const BottomSheetProvider: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [component, setComponent] = React.useState<React.ReactNode>();
  const [sheetTitle, setSheetTitle] = React.useState("");
  const [snapPoint, setSnapPoint] = React.useState(0);

  const showBS = async (
    childComponent: React.ReactNode,
    title: string,
    snapPoint: number
  ) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const component = isScreenReaderActive ? (
      <Modal>{childComponent}</Modal>
    ) : (
      childComponent
    );
    setComponent(component);
    setSheetTitle(title);
    setSnapPoint(snapPoint);
  };

  const hideBS = () => {
    setComponent(null);
  };

  const state = {
    component,
    sheetTitle,
    snapPoint,
    showBS,
    hideBS
  };

  return (
    <BottomSheetContext.Provider value={state}>
      {props.children}
    </BottomSheetContext.Provider>
  );
};

export const BottomSheetRoot: React.FunctionComponent = () => {
  return (
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
};
