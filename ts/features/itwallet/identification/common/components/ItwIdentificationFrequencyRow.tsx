import { memo, type ComponentProps } from "react";
import { Badge, BodySmall, HStack } from "@pagopa/io-app-design-system";

type BadgeProps = ComponentProps<typeof Badge>;

type Props = {
  label: string;
  badge?: BadgeProps;
};

export const ItwIdentificationMethodsHeader = memo(({ label, badge }: Props) => (
  <HStack
    space={8}
    style={{
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
    <BodySmall weight="Semibold">{label}</BodySmall>
    {badge ? <Badge {...badge} /> : null}
  </HStack>
));
