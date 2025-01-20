import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import {
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector
} from "../../store/reducers/messagePrecondition";
import I18n from "../../../../i18n";
import { pnMinAppVersionSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import IOMarkdown from "../../../../components/IOMarkdown";
import { PreconditionsFeedback } from "./PreconditionsFeedback";

export const PreconditionsContent = () => {
  const content = useIOSelector(preconditionsContentSelector);
  switch (content) {
    case "content":
      return <PreconditionsContentMarkdown />;
    case "error":
      return <PreconditionsContentError />;
    case "loading":
      return <PreconditionsContentSkeleton />;
    case "update":
      return <PreconditionsContentUpdate />;
  }
  return null;
};

const PreconditionsContentMarkdown = () => {
  const markdown = useIOSelector(preconditionsContentMarkdownSelector);
  if (!markdown) {
    return null;
  }
  return <IOMarkdown content={markdown} />;
};

const PreconditionsContentError = () => (
  <PreconditionsFeedback
    pictogram="umbrellaNew"
    title={I18n.t("global.genericError")}
  />
);

const PreconditionsContentSkeleton = () => (
  <View accessible={false}>
    {Array.from({ length: 3 }).map((_, i) => (
      <View key={`pre_content_ske_${i}`}>
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"90%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
      </View>
    ))}
  </View>
);

const PreconditionsContentUpdate = () => {
  const pnMinAppVersion = useIOSelector(pnMinAppVersionSelector);
  return (
    <PreconditionsFeedback
      pictogram="umbrellaNew"
      title={I18n.t("features.messages.updateBottomSheet.title")}
      subtitle={I18n.t("features.messages.updateBottomSheet.subtitle", {
        value: pnMinAppVersion
      })}
    />
  );
};
