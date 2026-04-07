import { Alert, Body, VSpacer } from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import I18n from "i18next";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOSelector } from "../../../../store/hooks";
import { isIOMarkdownEnabledForMessagesAndServicesSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { removeCTAsFromMarkdown } from "../../utils/ctas";
import { MessageMarkdown } from "./MessageMarkdown";

export type MessageDetailsBodyProps = {
  messageMarkdown: string;
  scrollViewRef: React.RefObject<null | ScrollView>;
  serviceId: ServiceId;
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
          action={I18n.t(
            `messageDetails.markdown.${
              showRawContent ? "decodingErrorHide" : "decodingErrorShow"
            }`
          )}
          content={I18n.t("messageDetails.markdown.decodingErrorContent")}
          onPress={() =>
            setShowRawContent(innerShowRawContent => !innerShowRawContent)
          }
          testID="markdown-decoding-error-alert"
          variant="warning"
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
