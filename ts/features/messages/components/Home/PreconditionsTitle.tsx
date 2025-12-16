import { H3, IOSkeleton } from "@pagopa/io-app-design-system";
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
    case "loading":
      return <PreconditionsSkeleton />;
    case "header":
      return <PreconditionsHeader />;
  }
  return null;
};

const PreconditionsSkeleton = () => (
  <View style={{ flex: 1 }} accessible={false}>
    <IOSkeleton shape="rectangle" width={182} height={20} radius={4} />
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
