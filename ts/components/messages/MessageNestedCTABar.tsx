import { View } from "native-base";
import React, { ReactElement } from "react";
import { Dispatch } from "redux";
import { CTA, CTAS } from "../../types/MessageCTA";
import { handleCtaAction, isCtaActionValid } from "../../utils/messages";
import { MessageNestedCtaButton } from "./MessageNestedCtaButton";

type Props = {
  ctas: CTAS;
  xsmall: boolean;
  dispatch: Dispatch;
};

// render cta1 and cta2 if they are defined in the message content as nested front-matter
export const MessageNestedCTABar: React.FunctionComponent<Props> = (
  props: Props
): ReactElement => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, props.dispatch);
  };
  const { ctas } = props;
  const cta2 = ctas.cta_2 &&
    isCtaActionValid(ctas.cta_2) && (
      <MessageNestedCtaButton
        cta={ctas.cta_2}
        xsmall={props.xsmall}
        primary={false}
        onCTAPress={handleCTAPress}
      />
    );
  const cta1 = isCtaActionValid(ctas.cta_1) && (
    <MessageNestedCtaButton
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
