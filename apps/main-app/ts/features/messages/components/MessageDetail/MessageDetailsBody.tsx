import { Alert, Body, VSpacer } from "@io-app/design-system";
import { useLinkTo } from "@react-navigation/native";
import I18n from "i18next";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOSelector } from "../../../../store/hooks";
import { isIOMarkdownEnabledForMessagesAndServicesSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { trackAppCaughtError } from "../../../../utils/analytics";
import { unknownToString } from "../../../../utils/errors";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { removeCTAsFromMarkdown } from "../../utils/ctas";
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
  const markdownWithNoCta = useMemo(
    () => removeCTAsFromMarkdown(messageMarkdown, serviceId),
    [messageMarkdown, serviceId]
  );
  if (markdownWithNoCta === undefined) {
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
            <Body testID="markdown-decoding-error-raw">{messageMarkdown}</Body>
          </Animated.View>
        )}
      </>
    );
  }
  return useIOMarkdown ? (
    <IOMarkdown
      content={markdownWithNoCta}
      rules={generateMessagesAndServicesRules(linkTo)}
      onError={(error, _stack) => {
        const errorString = unknownToString(error);
        trackAppCaughtError(
          "MessageDetailsBody",
          "Unable to render message's markdown",
          errorString
        );
      }}
    />
  ) : (
    <MessageMarkdown
      onLoadEnd={() => {
        setTimeout(() => {
          setAccessibilityFocus(scrollViewRef);
        }, 100);
      }}
    >
      {markdownWithNoCta}
    </MessageMarkdown>
  );
};
