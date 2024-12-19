import { Body, VSpacer } from "@pagopa/io-app-design-system";

type MessageDetailsContentProps = {
  abstract?: string;
};

export const MessageDetailsContent = ({
  abstract
}: MessageDetailsContentProps) => {
  if (abstract === undefined) {
    return null;
  }

  return (
    <>
      <VSpacer size={16} />
      <Body color="grey-850">{abstract}</Body>
    </>
  );
};
