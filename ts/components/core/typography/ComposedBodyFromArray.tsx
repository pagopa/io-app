import React from "react";
import {
  Body,
  ExternalTypographyProps,
  IOColors,
  IOFontWeight,
  IOTheme,
  TypographyProps
} from "@pagopa/io-app-design-system";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey" | "bluegreyLight"
>;
type AllowedColors = PartialAllowedColors | IOTheme["textBody-default"];
type AllowedWeight = IOFontWeight | "Regular" | "Semibold";

export type BodyProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors> & {
    text: string | React.ReactElement;
  }
>;

type PropsComposedBody = {
  body: Array<BodyProps>;
  textAlign?: "auto" | "left" | "right" | "center" | "justify" | undefined;
};

export const ComposedBodyFromArray = ({
  body,
  textAlign = "center"
}: PropsComposedBody) => (
  <Body style={{ textAlign }}>
    {body.map(({ text, key, ...props }, i) => (
      <Body key={key ?? `OpResScreen_${i}`} {...props}>
        {text}
      </Body>
    ))}
  </Body>
);
