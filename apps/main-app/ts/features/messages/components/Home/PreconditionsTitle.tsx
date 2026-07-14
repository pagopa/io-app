import { H3, IOSkeleton } from "@io-app/design-system";
import { View } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import {
  preconditionsTitleContentSelector,
  preconditionsTitleSelector
} from "../../store/reducers/messagePrecondition";

export const PreconditionsTitle = () => {
  const titleContent = useIOSelector(preconditionsTitleContentSelector);
  switch (titleContent) {
    case "empty":
      return <View />;
    case "header":
      return <PreconditionsHeader />;
    case "loading":
      return <PreconditionsSkeleton />;
  }
  return null;
};

const PreconditionsSkeleton = () => (
  <View accessible={false} style={{ flex: 1 }}>
    <IOSkeleton height={20} radius={4} shape="rectangle" width={182} />
  </View>
);

const PreconditionsHeader = () => {
  const title = useIOSelector(preconditionsTitleSelector);
  if (!title) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <H3>{title}</H3>
    </View>
  );
};
