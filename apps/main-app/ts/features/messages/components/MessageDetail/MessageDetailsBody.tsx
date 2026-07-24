import { Alert, Body, VSpacer } from "@io-app/design-system";
import { useLinkTo } from "@react-navigation/native";
import I18n from "i18next";
import { useMemo, useState } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { trackAppCaughtError } from "../../../../utils/analytics";
import { unknownToString } from "../../../../utils/errors";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { removeCTAsFromMarkdown } from "../../utils/ctas";

export type MessageDetailsBodyProps = {
  messageMarkdown: string;
  serviceId: ServiceId;
};

export const MessageDetailsBody = ({
  messageMarkdown,
  serviceId
}: MessageDetailsBodyProps) => {
  const [showRawContent, setShowRawContent] = useState<boolean>(false);
  const linkTo = useLinkTo();
  const markdownWithNoCta = useMemo(
    () => removeCTAsFromMarkdown(messageMarkdown, serviceId),
    [messageMarkdown, serviceId]
  );
  if (markdownWithNoCta === undefined) {
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
            <Body testID="markdown-decoding-error-raw">{messageMarkdown}</Body>
          </Animated.View>
        )}
      </>
    );
  }
  return (
    <IOMarkdown
      content={markdownWithNoCta}
      onError={(error, _stack) => {
        const errorString = unknownToString(error);
        trackAppCaughtError(
          "MessageDetailsBody",
          "Unable to render message's markdown",
          errorString
        );
      }}
      rules={generateMessagesAndServicesRules(linkTo)}
    />
  );
};
