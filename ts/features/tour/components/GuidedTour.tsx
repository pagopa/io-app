import { PropsWithChildren, useEffect, useRef } from "react";
import { View } from "react-native";
import { useIODispatch } from "../../../store/hooks";
import {
  registerTourItemAction,
  unregisterTourItemAction
} from "../store/actions";
import { useTourContext } from "./TourProvider";

type GuidedTourProps = {
  groupId: string;
  index: number;
  title: string;
  description: string;
};

export const GuidedTour = (props: PropsWithChildren<GuidedTourProps>) => {
  const dispatch = useIODispatch();
  const viewRef = useRef<View>(null);
  const { registerItem, unregisterItem } = useTourContext();

  useEffect(() => {
    dispatch(
      registerTourItemAction({
        groupId: props.groupId,
        index: props.index
      })
    );
    registerItem(props.groupId, props.index, viewRef, {
      title: props.title,
      description: props.description
    });

    return () => {
      dispatch(
        unregisterTourItemAction({
          groupId: props.groupId,
          index: props.index
        })
      );
      unregisterItem(props.groupId, props.index);
    };
  }, [
    dispatch,
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
