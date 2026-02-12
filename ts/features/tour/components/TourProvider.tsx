import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef
} from "react";
import { View } from "react-native";
import { useIODispatch } from "../../../store/hooks";
import {
  registerTourItemAction,
  unregisterTourItemAction
} from "../store/actions";
import { TourItemMeasurement } from "../types";
import { TourOverlay } from "./TourOverlay";

type TourItemConfig = {
  ref: React.RefObject<View | null>;
  title: string;
  description: string;
};

type TourContextValue = {
  registerItem: (
    groupId: string,
    index: number,
    viewRef: React.RefObject<View | null>,
    config: { title: string; description: string }
  ) => void;
  unregisterItem: (groupId: string, index: number) => void;
  getMeasurement: (
    groupId: string,
    index: number
  ) => Promise<TourItemMeasurement | undefined>;
  getConfig: (
    groupId: string,
    index: number
  ) => { title: string; description: string } | undefined;
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

  const registerItem = useCallback(
    (
      groupId: string,
      index: number,
      viewRef: React.RefObject<View | null>,
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
    (
      groupId: string,
      index: number
    ): Promise<TourItemMeasurement | undefined> => {
      const item = itemsRef.current.get(makeKey(groupId, index));
      if (!item?.ref.current) {
        return Promise.resolve(undefined);
      }
      return new Promise(resolve => {
        item.ref.current?.measureInWindow((x, y, width, height) => {
          if (width === 0 && height === 0) {
            resolve(undefined);
          } else {
            resolve({ x, y, width, height });
          }
        });
      });
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

  return (
    <TourContext.Provider
      value={{ registerItem, unregisterItem, getMeasurement, getConfig }}
    >
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
};
