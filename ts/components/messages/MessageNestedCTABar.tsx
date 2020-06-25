import { View } from "native-base";
import React, { ReactElement } from "react";
import { Dispatch } from "redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { CTA } from "../../types/MessageCTA";
import {
  getCTA,
  handleCtaAction,
  isCtaActionValid
} from "../../utils/messages";
import { MessageNestedCtaButton } from "./MessageNestedCtaButton";

type Props = {
  message: CreatedMessageWithContent;
  xsmall: boolean;
  dispatch: Dispatch;
};

// render cta1 and cta2 if they are defined in the message content as nested front-matter
export const MessageNestedCTABar: React.FunctionComponent<Props> = (
  props: Props
): ReactElement | null => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, props.dispatch);
  };

  const maybeNestedCTA = getCTA(props.message);
  if (maybeNestedCTA.isSome()) {
    const ctas = maybeNestedCTA.value;
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
  }
  return null;
};
