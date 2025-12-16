import { IOSkeleton, VStack } from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";
import I18n from "i18next";
import IOMarkdown from "../../../../components/IOMarkdown";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  isIOMarkdownEnabledForMessagesAndServicesSelector,
  pnMinAppVersionSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { trackDisclaimerLoadError } from "../../analytics";
import {
  errorPreconditionStatusAction,
  shownPreconditionStatusAction,
  toErrorPayload,
  toShownPayload
} from "../../store/actions/preconditions";
import {
  preconditionsCategoryTagSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector
} from "../../store/reducers/messagePrecondition";
import { MessageMarkdown } from "../MessageDetail/MessageMarkdown";
import { PreconditionsFeedback } from "./PreconditionsFeedback";

type PreconditionsContentProps = {
  footerHeight: number;
};

export const PreconditionsContent = ({
  footerHeight
}: PreconditionsContentProps) => {
  const content = useIOSelector(preconditionsContentSelector);
  switch (content) {
    case "content":
      return <PreconditionsContentMarkdown footerHeight={footerHeight} />;
    case "error":
      return <PreconditionsContentError />;
    case "loading":
      return <PreconditionsContentSkeleton />;
    case "update":
      return <PreconditionsContentUpdate />;
  }
  return null;
};

const PreconditionsContentMarkdown = ({
  footerHeight
}: PreconditionsContentProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const linkTo = useLinkTo();

  const useIOMarkdown = useIOSelector(
    isIOMarkdownEnabledForMessagesAndServicesSelector
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
  return (
    <View>
      {useIOMarkdown ? (
        <IOMarkdown
          content={markdown}
          onError={onErrorCallback}
          rules={generateMessagesAndServicesRules(linkTo)}
        />
      ) : (
        <MessageMarkdown
          loadingLines={7}
          onLoadEnd={onLoadEndCallback}
          onError={onErrorCallback}
          testID="preconditions_content_message_markdown"
        >
          {markdown}
        </MessageMarkdown>
      )}
      {/* This view is needed since the bottom sheet has a FooterActions component
          that is partially visible above the content. Without the extra space, the
          Markdown will go underneath it */}
      <View style={{ height: footerHeight + 24 }} />
    </View>
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
      <VStack space={8} key={`pre_content_ske_${i}`}>
        <IOSkeleton shape="rectangle" width={"100%"} height={20} radius={4} />
        <IOSkeleton shape="rectangle" width={"100%"} height={20} radius={4} />
        <IOSkeleton shape="rectangle" width={"90%"} height={20} radius={4} />
      </VStack>
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
