/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  View
} from "react-native";

import { isScreenReaderEnabled } from "../../utils/accessibility";
export type LightModalContextInterface = Readonly<{
  component: ReactNode;
  hideModal: () => void;
  onHiddenModal: () => void;
  setOnHiddenModal: (callback: () => void) => void;
  showAnimatedModal: (
    component: ReactNode,
    animatedValue?: AnimationLightModal
  ) => void;
  showModal: (component: ReactNode) => void;
  showModalFadeInAnimation: (component: ReactNode) => void;
}>;

export const LightModalContext = createContext<LightModalContextInterface>({
  component: null,
  showModal: () => undefined,
  showModalFadeInAnimation: () => undefined,
  showAnimatedModal: () => undefined,
  hideModal: () => undefined,
  onHiddenModal: () => undefined,
  setOnHiddenModal: () => undefined
});

type Props = Record<string, unknown>;

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

const animatedValue = new Animated.Value(0);
const compositeAnimation = Animated.timing(animatedValue, {
  toValue: 1,
  duration: 250,
  useNativeDriver: true,
  easing: Easing.linear
});
const animationCallback = () => compositeAnimation.start();
const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
export const RightLeftAnimation = {
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0]
      })
    }
  ]
};

export const LeftRightAnimation = {
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, 0]
      })
    }
  ]
};

export const BottomTopAnimation = {
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight, 0]
      })
    }
  ]
};

export const TopBottomAnimation = {
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenHeight, 0]
      })
    }
  ]
};

export const ScaleAnimation = {
  transform: [
    {
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1]
      })
    }
  ]
};

const fadeAnim = new Animated.Value(0);
const FadeInAnimation = Animated.timing(fadeAnim, {
  useNativeDriver: false,
  toValue: 1,
  duration: 250
});

export type AnimationLightModal =
  | typeof BottomTopAnimation
  | typeof LeftRightAnimation
  | typeof RightLeftAnimation
  | typeof ScaleAnimation
  | typeof TopBottomAnimation;

export const LightModalConsumer = LightModalContext.Consumer;

/** Hook to access the LightModal context. */
export const useLightModalContext = () => useContext(LightModalContext);

export const LightModalProvider = ({ children }: PropsWithChildren<Props>) => {
  const [component, setComponent] = useState<ReactNode>(null);
  const onHiddenModalRef = useRef<() => void>(() => undefined);
  // Tracks a pending hideModal call so we can invoke onHiddenModal after
  // the component state is cleared — matching the original setState callback timing.
  const pendingHideRef = useRef(false);

  const showAnimatedModal = useCallback(
    async (
      childComponent: ReactNode,
      styledAnimation: AnimationLightModal = RightLeftAnimation
    ) => {
      const isScreenReaderActive = await isScreenReaderEnabled();
      const comp = (
        <Animated.View style={[styles.container, styledAnimation]}>
          {isScreenReaderActive ? (
            <Modal>{childComponent}</Modal>
          ) : (
            childComponent
          )}
        </Animated.View>
      );
      setComponent(comp);
      animationCallback();
    },
    []
  );

  const showModalFadeInAnimation = useCallback(
    async (childComponent: ReactNode) => {
      const isScreenReaderActive = await isScreenReaderEnabled();
      const comp = (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {isScreenReaderActive ? (
            <Modal>{childComponent}</Modal>
          ) : (
            childComponent
          )}
        </Animated.View>
      );
      setComponent(comp);
      FadeInAnimation.start();
    },
    []
  );

  const showModal = useCallback(async (childComponent: ReactNode) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const comp = (
      <View style={styles.container}>
        {isScreenReaderActive ? (
          <Modal>{childComponent}</Modal>
        ) : (
          childComponent
        )}
      </View>
    );
    setComponent(comp);
  }, []);

  // Stable wrapper that always calls the latest registered onHiddenModal
  const onHiddenModal = useCallback(() => {
    onHiddenModalRef.current();
  }, []);

  const setOnHiddenModal = useCallback((callback: () => void) => {
    // eslint-disable-next-line functional/immutable-data
    onHiddenModalRef.current = callback;
  }, []);

  const hideModal = useCallback(() => {
    fadeAnim.setValue(0);
    FadeInAnimation.stop();
    // eslint-disable-next-line functional/immutable-data
    pendingHideRef.current = true;
    setComponent(null);
  }, []);

  // Invoke onHiddenModal after component is cleared, matching the original
  // setState callback behavior.
  useEffect(() => {
    if (component === null && pendingHideRef.current) {
      // eslint-disable-next-line functional/immutable-data
      pendingHideRef.current = false;
      onHiddenModalRef.current();
    }
  }, [component]);

  const contextValue = useMemo<LightModalContextInterface>(
    () => ({
      component,
      showModal,
      showModalFadeInAnimation,
      showAnimatedModal,
      hideModal,
      onHiddenModal,
      setOnHiddenModal
    }),
    [
      component,
      showModal,
      showModalFadeInAnimation,
      showAnimatedModal,
      hideModal,
      onHiddenModal,
      setOnHiddenModal
    ]
  );

  return (
    <LightModalContext.Provider value={contextValue}>
      {children}
    </LightModalContext.Provider>
  );
};

export const LightModalRoot = () => (
  <LightModalConsumer>{({ component }) => component}</LightModalConsumer>
);
