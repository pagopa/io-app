/* eslint-disable functional/immutable-data */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef
} from "react";
import { View } from "react-native";
import Animated, {
  AnimatedRef,
  SharedValue,
  useAnimatedRef,
  useSharedValue
} from "react-native-reanimated";
import { useIODispatch } from "../../../store/hooks";
import {
  registerTourItemAction,
  unregisterTourItemAction
} from "../store/actions";
import { TourItemMeasurement } from "../types";
import { TourOverlay } from "./TourOverlay";

type TourItemConfig = {
  ref: AnimatedRef<Animated.View>;
  title: string;
  description: string;
};

type ScrollRef = {
  scrollViewRef: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
  headerHeight: number;
};

type TourContextValue = {
  registerItem: (
    groupId: string,
    index: number,
    viewRef: AnimatedRef<Animated.View>,
    config: { title: string; description: string }
  ) => void;
  unregisterItem: (groupId: string, index: number) => void;
  getMeasurement: (
    groupId: string,
    index: number
  ) => TourItemMeasurement | undefined;
  getConfig: (
    groupId: string,
    index: number
  ) => { title: string; description: string } | undefined;
  registerScrollRef: (
    groupId: string,
    ref: AnimatedRef<Animated.ScrollView>,
    scrollY: SharedValue<number>,
    headerHeight: number
  ) => void;
  unregisterScrollRef: (groupId: string) => void;
  getScrollRef: (groupId: string) => ScrollRef | undefined;
  /** Shared values driving the cutout and tooltip position. */
  cutoutX: SharedValue<number>;
  cutoutY: SharedValue<number>;
  cutoutW: SharedValue<number>;
  cutoutH: SharedValue<number>;
  /**
   * When true, the active GuidedTour component continuously tracks its
   * position via useFrameCallback. Set to false during step transitions.
   */
  isTracking: SharedValue<boolean>;
  /** Animated ref for the overlay container, used for coordinate conversion. */
  overlayAnimatedRef: AnimatedRef<Animated.View>;
};

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const useTourContext = () => {
  const ctx = useContext(TourContext);
  if (ctx === undefined) {
    throw new Error("useTourContext must be used within a TourProvider");
  }
  return ctx;
};

const makeKey = (groupId: string, index: number) => `${groupId}::${index}`;

export const TourProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useIODispatch();
  const itemsRef = useRef<Map<string, TourItemConfig>>(new Map());
  const scrollRefsRef = useRef<Map<string, ScrollRef>>(new Map());

  const cutoutX = useSharedValue(0);
  const cutoutY = useSharedValue(0);
  const cutoutW = useSharedValue(0);
  const cutoutH = useSharedValue(0);
  const isTracking = useSharedValue(false);
  const overlayAnimatedRef = useAnimatedRef<Animated.View>();

  const registerItem = useCallback(
    (
      groupId: string,
      index: number,
      viewRef: AnimatedRef<Animated.View>,
      config: { title: string; description: string }
    ) => {
      dispatch(registerTourItemAction({ groupId, index }));
      itemsRef.current.set(makeKey(groupId, index), {
        ref: viewRef,
        title: config.title,
        description: config.description
      });
    },
    [dispatch]
  );

  const unregisterItem = useCallback(
    (groupId: string, index: number) => {
      dispatch(unregisterTourItemAction({ groupId, index }));
      itemsRef.current.delete(makeKey(groupId, index));
    },
    [dispatch]
  );

  const getMeasurement = useCallback(
    (groupId: string, index: number): TourItemMeasurement | undefined => {
      const item = itemsRef.current.get(makeKey(groupId, index));
      const node = item?.ref.current;
      if (!node) {
        return undefined;
      }
      const result: { value: TourItemMeasurement | undefined } = {
        value: undefined
      };
      // On Fabric the underlying host view supports synchronous
      // measureInWindow via JSI. The AnimatedRef resolves to the
      // native view at runtime; the cast satisfies TypeScript.
      (node as unknown as View).measureInWindow((x, y, width, height) => {
        if (width !== 0 || height !== 0) {
          result.value = { x, y, width, height };
        }
      });
      return result.value;
    },
    []
  );

  const getConfig = useCallback((groupId: string, index: number) => {
    const item = itemsRef.current.get(makeKey(groupId, index));
    if (!item) {
      return undefined;
    }
    return { title: item.title, description: item.description };
  }, []);

  const registerScrollRef = useCallback(
    (
      groupId: string,
      ref: AnimatedRef<Animated.ScrollView>,
      scrollY: SharedValue<number>,
      headerHeight: number
    ) => {
      scrollRefsRef.current.set(groupId, {
        scrollViewRef: ref,
        scrollY,
        headerHeight
      });
    },
    []
  );

  const unregisterScrollRef = useCallback((groupId: string) => {
    scrollRefsRef.current.delete(groupId);
  }, []);

  const getScrollRef = useCallback(
    (groupId: string) => scrollRefsRef.current.get(groupId),
    []
  );

  return (
    <TourContext.Provider
      value={{
        registerItem,
        unregisterItem,
        getMeasurement,
        getConfig,
        registerScrollRef,
        unregisterScrollRef,
        getScrollRef,
        cutoutX,
        cutoutY,
        cutoutW,
        cutoutH,
        isTracking,
        overlayAnimatedRef
      }}
    >
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
};
