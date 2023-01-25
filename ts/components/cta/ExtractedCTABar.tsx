import React, { ReactElement, useMemo } from "react";
import { Dispatch } from "redux";
import { useLinkTo } from "@react-navigation/native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { CTA, CTAS } from "../../types/MessageCTA";
import { handleCtaAction, isCtaActionValid } from "../../utils/messages";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { HSpacer } from "../core/spacer/Spacer";
import { ExtractedCtaButton } from "./ExtractedCtaButton";

type Props = {
  ctas: CTAS;
  xsmall: boolean;
  dispatch: Dispatch;
  // service and serviceMetadata could come from message or service detail
  // they could be useful to determine if a cta action is valid or not
  service?: ServicePublic;
  serviceMetadata?: ServiceMetadata;
};

const renderCtaButton = (
  { xsmall, service, serviceMetadata }: Props,
  linkTo: (path: string) => void,
  primary: boolean,
  cta?: CTA
): React.ReactNode => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, linkTo, service);
  };

  if (cta !== undefined && isCtaActionValid(cta, serviceMetadata)) {
    return (
      <ExtractedCtaButton
        cta={cta}
        xsmall={xsmall}
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
    () => renderCtaButton(props, linkTo, false, ctas.cta_2),
    [ctas.cta_2, linkTo, props]
  );
  const cta1 = useMemo(
    () => renderCtaButton(props, linkTo, true, ctas.cta_1),
    [ctas.cta_1, linkTo, props]
  );

  return (
    <>
      {cta2}
      {cta2 && <HSpacer size={8} />}
      {cta1}
    </>
  );
};

export default ExtractedCTABar;
