/* eslint-disable functional/immutable-data */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef
} from "react";
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
import { TourCutoutStyle, TourItemMeasurement } from "../types";
import { TourOverlay } from "./TourOverlay";

type TourItemConfig = {
  ref?: AnimatedRef<Animated.View>;
  regionProvider?: () => TourItemMeasurement | undefined;
  title: string;
  description: string;
  cutoutStyle?: TourCutoutStyle;
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
    config: {
      title: string;
      description: string;
      cutoutStyle?: TourCutoutStyle;
    }
  ) => void;
  unregisterItem: (groupId: string, index: number) => void;
  registerRegion: (
    groupId: string,
    index: number,
    regionProvider: () => TourItemMeasurement | undefined,
    config: {
      title: string;
      description: string;
      cutoutStyle?: TourCutoutStyle;
    }
  ) => void;
  unregisterRegion: (groupId: string, index: number) => void;
  getMeasurement: (
    groupId: string,
    index: number
  ) => TourItemMeasurement | undefined;
  getConfig: (
    groupId: string,
    index: number
  ) => { title: string; description: string } | undefined;
  getCutoutStyle: (groupId: string, index: number) => { cornerRadius?: number };
  /** Returns true if the item is region-based (no ref tracking needed). */
  isRegionItem: (groupId: string, index: number) => boolean;
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
      config: {
        title: string;
        description: string;
        cutoutStyle?: TourCutoutStyle;
      }
    ) => {
      dispatch(registerTourItemAction({ groupId, index }));
      itemsRef.current.set(makeKey(groupId, index), {
        ref: viewRef,
        title: config.title,
        description: config.description,
        cutoutStyle: config.cutoutStyle
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

  const registerRegion = useCallback(
    (
      groupId: string,
      index: number,
      regionProvider: () => TourItemMeasurement | undefined,
      config: {
        title: string;
        description: string;
        cutoutStyle?: TourCutoutStyle;
      }
    ) => {
      dispatch(registerTourItemAction({ groupId, index }));
      itemsRef.current.set(makeKey(groupId, index), {
        regionProvider,
        title: config.title,
        description: config.description,
        cutoutStyle: config.cutoutStyle
      });
    },
    [dispatch]
  );

  const unregisterRegion = useCallback(
    (groupId: string, index: number) => {
      dispatch(unregisterTourItemAction({ groupId, index }));
      itemsRef.current.delete(makeKey(groupId, index));
    },
    [dispatch]
  );

  const getMeasurement = useCallback(
    (groupId: string, index: number): TourItemMeasurement | undefined => {
      const item = itemsRef.current.get(makeKey(groupId, index));
      if (!item) {
        return undefined;
      }

      // Region-based item: call the provider directly
      if (item.regionProvider) {
        return item.regionProvider();
      }

      // Ref-based item: measure the native view
      const node = item.ref?.current;
      if (!node) {
        return undefined;
      }
      const result: { value: TourItemMeasurement | undefined } = {
        value: undefined
      };
      node.measureInWindow((x, y, width, height) => {
        if (width !== 0 || height !== 0) {
          result.value = { x, y, width, height };
        }
      });
      return result.value;
    },
    []
  );

  const isRegionItem = useCallback(
    (groupId: string, index: number): boolean => {
      const item = itemsRef.current.get(makeKey(groupId, index));
      return item?.regionProvider != null;
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

  const getCutoutStyle = useCallback((groupId: string, index: number) => {
    const item = itemsRef.current.get(makeKey(groupId, index));
    return {
      cornerRadius: item?.cutoutStyle?.cornerRadius
    };
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

  const contextValue = useMemo(
    () => ({
      registerItem,
      unregisterItem,
      registerRegion,
      unregisterRegion,
      getMeasurement,
      getConfig,
      getCutoutStyle,
      isRegionItem,
      registerScrollRef,
      unregisterScrollRef,
      getScrollRef,
      cutoutX,
      cutoutY,
      cutoutW,
      cutoutH,
      isTracking,
      overlayAnimatedRef
    }),
    [
      registerItem,
      unregisterItem,
      registerRegion,
      unregisterRegion,
      getMeasurement,
      getConfig,
      getCutoutStyle,
      isRegionItem,
      registerScrollRef,
      unregisterScrollRef,
      getScrollRef,
      cutoutX,
      cutoutY,
      cutoutW,
      cutoutH,
      isTracking,
      overlayAnimatedRef
    ]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
};
