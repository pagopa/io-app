import { useCallback } from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { VSpacer } from "@pagopa/io-app-design-system";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  preconditionsCategoryTagSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector
} from "../../store/reducers/messagePrecondition";
import I18n from "../../../../i18n";
import { pnMinAppVersionSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { MessageMarkdown } from "../MessageDetail/MessageMarkdown";
import {
  errorPreconditionStatusAction,
  shownPreconditionStatusAction,
  toErrorPayload,
  toShownPayload
} from "../../store/actions/preconditions";
import { trackDisclaimerLoadError } from "../../analytics";
import IOMarkdown from "../../../../components/IOMarkdown";
import { isIOMarkdownEnabledOnMessagesAndServicesSelector } from "../../../common/store/reducers";
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
  const dispatch = useIODispatch();
  const store = useIOStore();

  const useIOMarkdown = useIOSelector(
    isIOMarkdownEnabledOnMessagesAndServicesSelector
  );
  const markdown = useIOSelector(preconditionsContentMarkdownSelector);

  const onLoadEndCallback = useCallback(() => {
    dispatch(shownPreconditionStatusAction(toShownPayload()));
  }, [dispatch]);
  const onErrorCallback = useCallback(
    (anyError: any) => {
      const state = store.getState();
      const category = preconditionsCategoryTagSelector(state);
      if (category) {
        trackDisclaimerLoadError(category);
      }
      dispatch(
        errorPreconditionStatusAction(
          toErrorPayload(`Markdown loading failure (${anyError})`)
        )
      );
    },
    [dispatch, store]
  );

  if (!markdown) {
    return null;
  }
  return useIOMarkdown ? (
    <IOMarkdown content={markdown} onError={onErrorCallback} />
  ) : (
    <MessageMarkdown
      loadingLines={7}
      onLoadEnd={onLoadEndCallback}
      onError={onErrorCallback}
      testID="preconditions_content_message_markdown"
    >
      {markdown}
    </MessageMarkdown>
  );
};

const PreconditionsContentError = () => (
  <PreconditionsFeedback
    pictogram="umbrella"
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
      pictogram="umbrella"
      title={I18n.t("features.messages.updateBottomSheet.title")}
      subtitle={I18n.t("features.messages.updateBottomSheet.subtitle", {
        value: pnMinAppVersion
      })}
    />
  );
};
