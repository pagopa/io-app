import React from "react";
import { View } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import {
  ButtonOutline,
  ButtonSolid,
  HSpacer,
  IOStyles
} from "@pagopa/io-app-design-system";
import { CTA, CTAS } from "../../features/messages/types/MessageCTA";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { isServiceDetailNavigationLink } from "../../utils/internalLink";
import { trackPNOptInMessageAccepted } from "../../features/pn/analytics";
import { handleCtaAction } from "../../features/messages/utils/messages";

type ExtractedCtasProps = {
  ctas: CTAS;
  isPNOptIn?: boolean;
  serviceId: ServiceId;
};

/**
 * render cta_1 and cta_2 if they are defined in the message content as front-matter
 * or if they are defined on cta attribute in ServiceMetadata in the ServiceDetailScreen
 */
export const ExtractedCtas = ({
  ctas,
  serviceId,
  isPNOptIn = false
}: ExtractedCtasProps) => {
  const { cta_1, cta_2 } = ctas;

  const linkTo = useLinkTo();

  const handleOnPress = (cta: CTA) => {
    if (isPNOptIn && isServiceDetailNavigationLink(cta.action)) {
      trackPNOptInMessageAccepted();
    }
    handleCtaAction(cta, linkTo, serviceId);
  };

  return (
    <View style={IOStyles.row} testID="extracted-ctas">
      {cta_2 && (
        <>
          <View style={IOStyles.flex}>
            <ButtonOutline
              accessibilityLabel={cta_2.text}
              fullWidth
              label={cta_2.text}
              onPress={() => handleOnPress(cta_2)}
            />
          </View>
          <HSpacer size={8} />
        </>
      )}
      <View style={IOStyles.flex}>
        <ButtonSolid
          accessibilityLabel={cta_1.text}
          fullWidth
          label={cta_1.text}
          onPress={() => handleOnPress(cta_1)}
        />
      </View>
    </View>
  );
};
