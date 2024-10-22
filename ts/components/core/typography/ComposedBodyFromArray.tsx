import { Body } from "@pagopa/io-app-design-system";
import React, { ComponentProps } from "react";

export type BodyProps = ComponentProps<typeof Body> & {
  text: string | React.ReactElement;
};

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
