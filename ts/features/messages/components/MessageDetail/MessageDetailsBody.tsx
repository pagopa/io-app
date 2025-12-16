import * as E from "fp-ts/lib/Either";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Alert, Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { isIOMarkdownEnabledForMessagesAndServicesSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import IOMarkdown from "../../../../components/IOMarkdown";
import { removeCTAsFromMarkdown } from "../../utils/ctas";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { MessageMarkdown } from "./MessageMarkdown";

export type MessageDetailsBodyProps = {
  messageMarkdown: string;
  serviceId: ServiceId;
  scrollViewRef: React.RefObject<ScrollView | null>;
};

export const MessageDetailsBody = ({
  messageMarkdown,
  serviceId,
  scrollViewRef
}: MessageDetailsBodyProps) => {
  const [showRawContent, setShowRawContent] = useState<boolean>(false);
  const linkTo = useLinkTo();
  const useIOMarkdown = useIOSelector(
    isIOMarkdownEnabledForMessagesAndServicesSelector
  );
  const markdownWithNoCTAEither = useMemo(
    () => removeCTAsFromMarkdown(messageMarkdown, serviceId),
    [messageMarkdown, serviceId]
  );
  if (E.isLeft(markdownWithNoCTAEither)) {
    return (
      <>
        <Alert
          variant="warning"
          content={I18n.t("messageDetails.markdown.decodingErrorContent")}
          action={I18n.t(
            `messageDetails.markdown.${
              showRawContent ? "decodingErrorHide" : "decodingErrorShow"
            }`
          )}
          onPress={() =>
            setShowRawContent(innerShowRawContent => !innerShowRawContent)
          }
          testID="markdown-decoding-error-alert"
        />
        {showRawContent && (
          <Animated.View entering={FadeInUp}>
            <VSpacer size={16} />
            <Body testID="markdown-decoding-error-raw">
              {markdownWithNoCTAEither.left}
            </Body>
          </Animated.View>
        )}
      </>
    );
  }
  const markdownWithNoCTA = markdownWithNoCTAEither.right;
  return useIOMarkdown ? (
    <IOMarkdown
      content={markdownWithNoCTA}
      rules={generateMessagesAndServicesRules(linkTo)}
    />
  ) : (
    <MessageMarkdown
      onLoadEnd={() => {
        setTimeout(() => {
          setAccessibilityFocus(scrollViewRef);
        }, 100);
      }}
    >
      {markdownWithNoCTA}
    </MessageMarkdown>
  );
};
