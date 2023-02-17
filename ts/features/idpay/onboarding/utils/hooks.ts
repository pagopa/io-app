/* eslint-disable functional/immutable-data */
import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  ScrollView,
  useWindowDimensions
} from "react-native";

export const useInitiativeDetailsScrolling = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const markdownIsLoadingRef = useRef<boolean>(true);
  const screenHeight = useWindowDimensions().height;
  const [requiresScrolling, setRequiresScrolling] = useState<boolean>(true);

  const onScrollViewSizeChange = (_: number, height: number) => {
    // this method is called multiple times during the loading of the markdown
    if (!markdownIsLoadingRef.current) {
      setRequiresScrolling(height >= screenHeight);
    }
  };
  const scrollToEnd = () => {
    if (!markdownIsLoadingRef.current) {
      scrollViewRef.current?.scrollToEnd();
      setRequiresScrolling(false);
    }
  };

  const handleIsScrollEnd = (event: NativeScrollEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = event;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setRequiresScrolling(false);
    }
  };

  const setMarkdownRef = (value: boolean) =>
    (markdownIsLoadingRef.current = value);

  return {
    scrollViewRef,
    onScrollViewSizeChange,
    scrollToEnd,
    handleIsScrollEnd,
    setMarkdownRef,
    requiresScrolling
  };
};
