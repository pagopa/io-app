/* eslint-disable functional/immutable-data */
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  ScrollView,
  useWindowDimensions
} from "react-native";

export const useInitiativeDetailsScrolling = (
  isLoading: boolean,
  description: string | undefined
  // type definition for the single "state" object
  // gets esoteric very fast, so passing the single 
  // values as arguments sounds like a more readable and easier approach
) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const markdownIsLoadingRef = useRef<boolean>(true);
  const screenHeight = useWindowDimensions().height;
  const [requiresScrolling, setRequiresScrolling] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      markdownIsLoadingRef.current = description !== undefined;
    }
  }, [isLoading, description]);

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

  const handleIsScrollEnd = ({
    layoutMeasurement,
    contentOffset,
    contentSize
  }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setRequiresScrolling(false);
    }
  };

  const setMarkdownIsLoaded = () => (markdownIsLoadingRef.current = false);
  return {
    scrollViewRef,
    onScrollViewSizeChange,
    scrollToEnd,
    handleIsScrollEnd,
    setMarkdownIsLoaded,
    requiresScrolling
  };
};
