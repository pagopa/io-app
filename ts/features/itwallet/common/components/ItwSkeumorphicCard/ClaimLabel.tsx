import { useTypographyFactory } from "@pagopa/io-app-design-system";
import React from "react";
import { Text } from "react-native";

type ClaimLabelProps = Omit<React.ComponentPropsWithRef<typeof Text>, "style">;

export const ClaimLabel: React.FunctionComponent<ClaimLabelProps> = props =>
  useTypographyFactory({
    ...props,
    defaultWeight: "Semibold",
    defaultColor: "black",
    font: "TitilliumSansPro",
    fontStyle: { fontSize: 12 },
    lineBreakMode: "head",
    numberOfLines: 1
  });
