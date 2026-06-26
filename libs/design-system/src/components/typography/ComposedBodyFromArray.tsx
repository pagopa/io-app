import { ComponentProps, ReactElement } from "react";
import { TextStyle } from "react-native";
import { Body } from "./Body";

export type BodyProps = ComponentProps<typeof Body> & {
  text: string | ReactElement;
};

type PropsComposedBody = {
  body: Array<BodyProps>;
  textAlign?: TextStyle["textAlign"];
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
