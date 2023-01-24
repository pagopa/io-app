import { Text as NBButtonText } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { CTA } from "../../types/MessageCTA";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

type Props = {
  cta: CTA;
  xsmall: boolean;
  primary?: boolean;
  onCTAPress: (cta: CTA) => void;
};

const styles = StyleSheet.create({
  marginTop1: {
    marginTop: 1
  }
});

/**
 * a button displaying a CTA coming from the message content as nested front-matter
 * or defined in the service detail as part of services metadata attributes
 */
export const ExtractedCtaButton: React.FunctionComponent<Props> = (
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
      style={{ flex: 1 }}
    >
      <NBButtonText style={styles.marginTop1}>{cta.text}</NBButtonText>
    </ButtonDefaultOpacity>
  );
};
