import { View } from "native-base";
import React, { ReactElement } from "react";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServiceMetadataState } from "../../store/reducers/content";
import { CTA, CTAS } from "../../types/MessageCTA";
import { handleCtaAction, isCtaActionValid } from "../../utils/messages";
import { NestedCtaButton } from "./NestedCtaButton";

type Props = {
  ctas: CTAS;
  xsmall: boolean;
  dispatch: Dispatch;
  // service and serviceMetadata could come from message or service detail
  // they could be useful to determine if a cta action is valid or not
  service?: ServicePublic;
  serviceMetadata?: ServiceMetadataState;
};

/**
 * render cta1 and cta2 if they are defined in the message content as nested front-matter
 * or if they are defined on cta attribute in ServiceMetadata in the service detail screen
 * if a cta is not valid it won't be shown
 */
const NestedCTABar: React.FunctionComponent<Props> = (
  props: Props
): ReactElement => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, props.dispatch, props.service);
  };

  const { ctas } = props;

  const cta2 = ctas.cta_2 &&
    isCtaActionValid(ctas.cta_2, props.serviceMetadata) && (
      <NestedCtaButton
        cta={ctas.cta_2}
        xsmall={props.xsmall}
        primary={false}
        onCTAPress={handleCTAPress}
      />
    );
  const cta1 = isCtaActionValid(ctas.cta_1, props.serviceMetadata) && (
    <NestedCtaButton
      cta={ctas.cta_1}
      primary={true}
      xsmall={props.xsmall}
      onCTAPress={handleCTAPress}
    />
  );
  return (
    <>
      {cta2}
      {cta2 && <View hspacer={true} small={true} />}
      {cta1}
    </>
  );
};

export default NestedCTABar;
