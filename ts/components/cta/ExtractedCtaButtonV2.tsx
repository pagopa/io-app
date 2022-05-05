import { Text } from "native-base";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { CTA } from "../../types/MessageCTA";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { convertUrlToNavigationLink } from "../../utils/navigation";

type Props = {
  cta: CTA;
  xsmall: boolean;
  primary?: boolean;
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
export const ExtractedCtaButtonV2: React.FunctionComponent<Props> = (
  props: Props
) => {
  const internalLink = useMemo(
    () => convertUrlToNavigationLink(props.cta.action),
    [props.cta]
  );
  const linkTo = useLinkTo();

  if (props.cta === undefined) {
    return null;
  }

  return (
    <ButtonDefaultOpacity
      primary={props.primary}
      disabled={false}
      xsmall={props.xsmall}
      bordered={!props.primary}
      onPress={() => linkTo(internalLink)}
      style={{ flex: 1 }}
    >
      <Text style={styles.marginTop1}>{props.cta.text}</Text>
    </ButtonDefaultOpacity>
  );
};
