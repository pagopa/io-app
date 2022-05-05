import { View } from "native-base";
import React, { ReactElement, useMemo } from "react";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { CTA, CTAS } from "../../types/MessageCTA";
import { handleCtaAction, isCtaActionValid } from "../../utils/messages";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { isCTAv2 } from "../../utils/navigation";
import { ExtractedCtaButton } from "./ExtractedCtaButton";
import { ExtractedCtaButtonV2 } from "./ExtractedCtaButtonV2";

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
  { xsmall, dispatch, service, serviceMetadata }: Props,
  cta?: CTA
): React.ReactNode => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, dispatch, service);
  };

  if (cta !== undefined) {
    if (isCTAv2(cta.action)) {
      return <ExtractedCtaButtonV2 cta={cta} xsmall={xsmall} primary={false} />;
    }

    if (isCtaActionValid(cta, serviceMetadata)) {
      return (
        <ExtractedCtaButton
          cta={cta}
          xsmall={xsmall}
          primary={false}
          onCTAPress={handleCTAPress}
        />
      );
    }
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

  const cta2 = useMemo(() => renderCtaButton(props, ctas.cta_2), [props]);
  const cta1 = useMemo(() => renderCtaButton(props, ctas.cta_1), [props]);

  return (
    <>
      {cta2}
      {cta2 && <View hspacer={true} small={true} />}
      {cta1}
    </>
  );
};

export default ExtractedCTABar;
