import React, { useCallback } from "react";
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
import { trackPNOptInMessageAccepted } from "../../features/pn/analytics";
import { handleCtaAction } from "../../features/messages/utils/messages";
import { usePNOptInMessage } from "../../features/pn/hooks/usePNOptInMessage";

type CTAsBarProps = {
  ctas: CTAS;
  serviceId: ServiceId;
};

/**
 * render cta_1 and cta_2 if they are defined in the message content as front-matter
 * or if they are defined on cta attribute in ServiceMetadata in the ServiceDetailScreen
 */
export const CTAsBar = ({ ctas, serviceId }: CTAsBarProps) => {
  const { cta_1, cta_2 } = ctas;
  const {
    cta1HasServiceNavigationLink,
    cta2HasServiceNavigationLink,
    isPNOptInMessage
  } = usePNOptInMessage(ctas, serviceId);

  const linkTo = useLinkTo();

  const handleOnPress = useCallback(
    (cta: CTA, isServiceNavigationLink: boolean) => {
      if (isPNOptInMessage && isServiceNavigationLink) {
        trackPNOptInMessageAccepted();
      }
      handleCtaAction(cta, linkTo, serviceId);
    },
    [isPNOptInMessage, linkTo, serviceId]
  );

  return (
    <View style={IOStyles.row}>
      {cta_2 && (
        <>
          <View style={IOStyles.flex}>
            <ButtonOutline
              accessibilityLabel={cta_2.text}
              fullWidth
              label={cta_2.text}
              onPress={() => handleOnPress(cta_2, cta2HasServiceNavigationLink)}
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
          onPress={() => handleOnPress(cta_1, cta1HasServiceNavigationLink)}
        />
      </View>
    </View>
  );
};
