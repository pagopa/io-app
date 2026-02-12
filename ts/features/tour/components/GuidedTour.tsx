import { PropsWithChildren, useEffect, useRef } from "react";
import { View } from "react-native";
import { useTourContext } from "./TourProvider";

type GuidedTourProps = {
  groupId: string;
  index: number;
  title: string;
  description: string;
};

export const GuidedTour = (props: PropsWithChildren<GuidedTourProps>) => {
  const viewRef = useRef<View>(null);
  const { registerItem, unregisterItem } = useTourContext();

  useEffect(() => {
    registerItem(props.groupId, props.index, viewRef, {
      title: props.title,
      description: props.description
    });

    return () => {
      unregisterItem(props.groupId, props.index);
    };
  }, [
    registerItem,
    unregisterItem,
    props.groupId,
    props.index,
    props.title,
    props.description
  ]);

  return (
    <View ref={viewRef} collapsable={false}>
      {props.children}
    </View>
  );
};
