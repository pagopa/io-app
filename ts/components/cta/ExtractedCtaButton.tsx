import React from "react";
import { ButtonSolid, ButtonOutline } from "@pagopa/io-app-design-system";
import { CTA } from "../../features/messages/types/MessageCTA";

type Props = {
  cta: CTA;
  primary?: boolean;
  onCTAPress: (cta: CTA) => void;
};

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
  return props.primary ? (
    <ButtonSolid
      onPress={() => props.onCTAPress(cta)}
      label={cta.text}
      accessibilityLabel={cta.text}
      fullWidth
    />
  ) : (
    <ButtonOutline
      onPress={() => props.onCTAPress(cta)}
      label={cta.text}
      accessibilityLabel={cta.text}
      fullWidth
    />
  );
};
