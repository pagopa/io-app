import React, { ReactElement, useMemo } from "react";
import { Dispatch } from "redux";
import { useLinkTo } from "@react-navigation/native";
import { HSpacer, IOStyles } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { CTA, CTAS } from "../../features/messages/types/MessageCTA";
import {
  handleCtaAction,
  isCtaActionValid
} from "../../features/messages/utils/messages";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { trackPNOptInMessageAccepted } from "../../features/pn/analytics";
import { PNOptInMessageInfo } from "../../features/pn/utils";
import { ExtractedCtaButton } from "./ExtractedCtaButton";

type Props = {
  ctas: CTAS;
  dispatch: Dispatch;
  isPNOptInMessage?: PNOptInMessageInfo;
  // service and serviceMetadata could come from message or service detail
  // they could be useful to determine if a cta action is valid or not
  service?: ServicePublic;
  serviceMetadata?: ServiceMetadata;
};

const renderCtaButton = (
  { service, serviceMetadata }: Props,
  linkTo: (path: string) => void,
  primary: boolean,
  isPNOptInMessage: boolean,
  cta?: CTA
): React.ReactNode => {
  const handleCTAPress = (cta: CTA) => {
    if (isPNOptInMessage) {
      trackPNOptInMessageAccepted();
    }
    handleCtaAction(cta, linkTo, service);
  };

  if (cta !== undefined && isCtaActionValid(cta, serviceMetadata)) {
    return (
      <ExtractedCtaButton
        cta={cta}
        primary={primary}
        onCTAPress={handleCTAPress}
      />
    );
  }

  return null;
};
/**
 * render cta1 and cta2 if they are defined in the message content as nested front-matter
 * or if they are defined on cta attribute in ServiceMetadata in the service detail screen
 * if a cta is not valid it won't be shown
 */
const ExtractedCTABar: React.FunctionComponent<Props> = (
  props: Props
): ReactElement => {
  const { ctas } = props;
  const linkTo = useLinkTo();

  const cta2 = useMemo(
    () =>
      renderCtaButton(
        props,
        linkTo,
        false,
        props.isPNOptInMessage?.cta2HasServiceNavigationLink ?? false,
        ctas.cta_2
      ),
    [ctas.cta_2, linkTo, props]
  );
  const cta1 = useMemo(
    () =>
      renderCtaButton(
        props,
        linkTo,
        true,
        props.isPNOptInMessage?.cta1HasServiceNavigationLink ?? false,
        ctas.cta_1
      ),
    [ctas.cta_1, linkTo, props]
  );

  return (
    <>
      {cta2 && (
        <>
          <View style={IOStyles.flex}>{cta2}</View>
          <HSpacer size={8} />
        </>
      )}
      <View style={IOStyles.flex}>{cta1}</View>
    </>
  );
};

export default ExtractedCTABar;
