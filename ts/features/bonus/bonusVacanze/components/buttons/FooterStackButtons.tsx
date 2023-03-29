import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import IconFont from "../../../../../components/ui/IconFont";
import { FooterTopShadow } from "../FooterTopShadow";

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch"
  },
  main: {
    justifyContent: "flex-end"
  }
});

type Props = {
  buttons: ReadonlyArray<BlockButtonProps>;
};

const renderButton = (props: BlockButtonProps) => (
  <>
    <ButtonDefaultOpacity style={styles.button} {...props}>
      {props.iconName && <IconFont name={props.iconName} />}
      <NBText
        style={pipe(
          props.buttonFontSize,
          O.fromNullable,
          O.fold(
            () => undefined,
            fs => ({
              fontSize: fs
            })
          )
        )}
      >
        {props.title}
      </NBText>
    </ButtonDefaultOpacity>
  </>
);

const withSpacer = (base: JSX.Element, idx: number) => (
  <React.Fragment key={`stack_spacer_${idx}`}>
    {base}
    <VSpacer size={16} />
  </React.Fragment>
);

/**
 * A generic component to render a stack of buttons in the footer
 * @param props
 */
export const FooterStackButton: React.FunctionComponent<Props> = props => {
  const buttonLength = props.buttons.length;

  return (
    <FooterTopShadow>
      <View style={styles.main}>
        {props.buttons
          .slice(0, buttonLength - 1)
          .map((b, idx) => withSpacer(renderButton(b), idx))}
        {renderButton(props.buttons[buttonLength - 1])}
      </View>
    </FooterTopShadow>
  );
};
