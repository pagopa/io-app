/* eslint-disable functional/immutable-data */
import { useSelector } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  ScrollView,
  useWindowDimensions
} from "react-native";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  initiativeDescriptionSelector,
  isLoadingSelector
} from "../xstate/selectors";

export const useInitiativeDetailsScrolling = () => {
  const machine = useOnboardingMachineService();
  const scrollViewRef = useRef<ScrollView>(null);
  const markdownIsLoadingRef = useRef<boolean>(true);
  const screenHeight = useWindowDimensions().height;
  const [requiresScrolling, setRequiresScrolling] = useState<boolean>(true);

  const isLoading = useSelector(machine, isLoadingSelector);
  const description = useSelector(machine, initiativeDescriptionSelector);

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

  const setMarkdownIsLoaded = () => (markdownIsLoadingRef.current = false);
  return {
    scrollViewRef,
    onScrollViewSizeChange,
    scrollToEnd,
    handleIsScrollEnd,
    setMarkdownIsLoaded,
    requiresScrolling,
    isLoading,
    description
  };
};
