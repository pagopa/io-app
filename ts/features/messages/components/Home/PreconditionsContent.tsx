import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOListItemVisualParams, VSpacer } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isShownPreconditionStatusSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector
} from "../../store/reducers/messagePrecondition";
import I18n from "../../../../i18n";
import { MessageFeedback } from "../PreconditionBottomSheet/MessageFeedback";
import { pnMinAppVersionSelector } from "../../../../store/reducers/backendStatus";
import { MessageMarkdown } from "../MessageDetail/MessageMarkdown";
import {
  shownPreconditionStatusAction,
  toShownPayload
} from "../../store/actions/preconditions";

const styles = StyleSheet.create({
  container: {
    marginTop: IOListItemVisualParams.actionMargin
  }
});

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
  const dispatch = useIODispatch();

  const isShownPreconditionStatus = useIOSelector(
    isShownPreconditionStatusSelector
  );
  const markdown = useIOSelector(preconditionsContentMarkdownSelector);

  const handleOnLoadEnd = useCallback(() => {
    dispatch(shownPreconditionStatusAction(toShownPayload()));
  }, [dispatch]);

  if (!markdown) {
    return null;
  }

  return (
    <>
      {!isShownPreconditionStatus && <PreconditionsContentSkeleton />}
      <View
        style={[
          styles.container,
          {
            display: isShownPreconditionStatus ? "flex" : "none"
          }
        ]}
      >
        <MessageMarkdown onLoadEnd={handleOnLoadEnd}>
          {markdown}
        </MessageMarkdown>
      </View>
    </>
  );
};

const PreconditionsContentError = () => (
  <MessageFeedback pictogram="umbrella" title={I18n.t("global.genericError")} />
);

const PreconditionsContentSkeleton = () => (
  <View style={styles.container} accessible={false}>
    {Array.from({ length: 4 }).map((_, i) => (
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
    <MessageFeedback
      pictogram="umbrella"
      title={I18n.t("features.messages.updateBottomSheet.title")}
      subtitle={I18n.t("features.messages.updateBottomSheet.subtitle", {
        value: pnMinAppVersion
      })}
    />
  );
};
