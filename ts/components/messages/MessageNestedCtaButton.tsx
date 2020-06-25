import { Text } from "native-base";
import React from "react";
import { CTA } from "../../types/MessageCTA";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

type Props = {
  cta: CTA;
  xsmall: boolean;
  primary?: boolean;
  onCTAPress: (cta: CTA) => void;
};

// a button displaying a CTA coming from the message content as nested front-matter
export const MessageNestedCtaButton: React.FunctionComponent<Props> = (
  props: Props
) => {
  const cta = props.cta;
  if (cta === undefined) {
    return null;
  }
  return (
    <ButtonDefaultOpacity
      primary={props.primary}
      disabled={false}
      xsmall={props.xsmall}
      bordered={!props.primary}
      onPress={() => props.onCTAPress(cta)}
      style={{
        flex: 1
      }}
    >
      <Text>{cta.text}</Text>
    </ButtonDefaultOpacity>
  );
};
