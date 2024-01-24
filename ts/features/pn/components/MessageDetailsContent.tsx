import React from "react";
import { Body, ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";

type MessageDetailsContentProps = {
  abstract: string | undefined;
};

export const MessageDetailsContent = ({
  abstract
}: MessageDetailsContentProps) => {
  if (abstract === undefined) {
    return null;
  }

  return (
    <ContentWrapper>
      <VSpacer size={16} />
      <Body>{abstract}</Body>
    </ContentWrapper>
  );
};
