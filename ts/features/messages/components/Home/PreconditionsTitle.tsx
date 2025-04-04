import { H3, IOSkeleton, IOStyles } from "@pagopa/io-app-design-system";
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
  <View style={IOStyles.flex} accessible={false}>
    <IOSkeleton shape="rectangle" width={182} height={20} radius={4} />
  </View>
);

const PreconditionsHeader = () => {
  const title = useIOSelector(preconditionsTitleSelector);
  if (!title) {
    return null;
  }
  return (
    <View style={IOStyles.flex}>
      <H3>{title}</H3>
    </View>
  );
};
