import { IOSkeleton, VStack } from "@io-app/design-system";
import { useLinkTo } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";

import IOMarkdown from "../../../../components/IOMarkdown";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { pnMinAppVersionSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { trackDisclaimerLoadError } from "../../analytics";
import {
  errorPreconditionStatusAction,
  toErrorPayload
} from "../../store/actions/preconditions";
import {
  preconditionsCategoryTagSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector
} from "../../store/reducers/messagePrecondition";
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

  const markdown = useIOSelector(preconditionsContentMarkdownSelector);

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
      <IOMarkdown
        content={markdown}
        onError={onErrorCallback}
        rules={generateMessagesAndServicesRules(linkTo)}
      />
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
      <VStack key={`pre_content_ske_${i}`} space={8}>
        <IOSkeleton height={20} radius={4} shape="rectangle" width={"100%"} />
        <IOSkeleton height={20} radius={4} shape="rectangle" width={"100%"} />
        <IOSkeleton height={20} radius={4} shape="rectangle" width={"90%"} />
      </VStack>
    ))}
  </View>
);

const PreconditionsContentUpdate = () => {
  const pnMinAppVersion = useIOSelector(pnMinAppVersionSelector);
  return (
    <PreconditionsFeedback
      pictogram="umbrella"
      subtitle={I18n.t("features.messages.updateBottomSheet.subtitle", {
        value: pnMinAppVersion
      })}
      title={I18n.t("features.messages.updateBottomSheet.title")}
    />
  );
};
