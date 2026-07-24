/* eslint-disable max-classes-per-file */
/**
 * This configuration was taken from the official library;
 * it is not present in the current version in use
 * but may be replaced with the first upgrade that introduces it.
 *
 * reference: https://github.com/gorhom/react-native-bottom-sheet/blob/master/mock.js
 */
import { Component, PropsWithChildren } from "react";

const NOOP = () => {};
const NOOP_VALUE = { value: 0, set: NOOP, get: () => 0 };

const BottomSheetModalProvider = ({ children }: PropsWithChildren) => children;

const BottomSheetBackdrop = NOOP;

const BottomSheetComponent = (props: PropsWithChildren) => props.children;

class BottomSheet extends Component<PropsWithChildren> {
  close() {}
  collapse() {}
  expand() {}
  forceClose() {}
  render() {
    return this.props.children;
  }
  snapToIndex() {}

  snapToPosition() {}
}

class BottomSheetModal extends Component<PropsWithChildren> {
  close() {}
  collapse() {}
  dismiss() {}
  expand() {}
  forceClose() {}
  present() {}
  render() {
    return this.props.children;
  }
  snapToIndex() {}

  snapToPosition() {}
}

const useBottomSheet = () => ({
  snapToIndex: NOOP,
  snapToPosition: NOOP,
  expand: NOOP,
  collapse: NOOP,
  close: NOOP,
  forceClose: NOOP,

  animatedIndex: NOOP_VALUE,
  animatedPosition: NOOP_VALUE
});

const useBottomSheetModal = () => ({
  dismiss: NOOP,
  dismissAll: NOOP
});

const useBottomSheetAnimationConfigs = (configs: unknown) => configs;

const bottomSheetInternal = {
  stopAnimation: NOOP,
  animateToPosition: NOOP,
  setScrollableRef: NOOP,
  removeScrollableRef: NOOP
};

const bottomSheetModalInternal = {
  mountSheet: NOOP,
  unmountSheet: NOOP,
  willUnmountSheet: NOOP
};

const internalProxy = {
  get(target: Record<string, unknown>, prop: string) {
    return prop in target ? target[prop] : NOOP_VALUE;
  }
};

const useBottomSheetInternal = () =>
  new Proxy(bottomSheetInternal, internalProxy);

const useBottomSheetModalInternal = () =>
  new Proxy(bottomSheetModalInternal, internalProxy);

const useBottomSheetDynamicSnapPoints = () => ({
  animatedSnapPoints: NOOP_VALUE,
  animatedHandleHeight: NOOP_VALUE,
  animatedContentHeight: NOOP_VALUE,
  handleContentLayout: NOOP
});

export default BottomSheet;
export {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetComponent as BottomSheetView,
  useBottomSheet,
  useBottomSheetDynamicSnapPoints,
  useBottomSheetInternal,
  useBottomSheetModal,
  useBottomSheetModalInternal,
  useBottomSheetAnimationConfigs as useBottomSheetSpringConfigs,
  useBottomSheetAnimationConfigs as useBottomSheetTimingConfigs
};
export {
  FlatList as BottomSheetFlashList,
  FlatList as BottomSheetFlatList,
  ScrollView as BottomSheetScrollView,
  SectionList as BottomSheetSectionList,
  TextInput as BottomSheetTextInput,
  VirtualizedList as BottomSheetVirtualizedList,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
