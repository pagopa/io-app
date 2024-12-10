import {
  Body,
  FooterWithButtons,
  H4,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { IOStyles } from "../core/variables/IOStyles";

type Props = WithTestID<
  Readonly<{
    avoidNavigationEvents?: boolean;
    onRetry: () => void;
    onCancel?: () => void;
    image?: ImageSourcePropType;
    text?: string;
    subText?: string;
    retryButtonTitle?: string;
    cancelButtonTitle?: string;
    ref?: React.RefObject<View>;
  }>
>;

const styles = StyleSheet.create({
  contentContainerStyle: { flexGrow: 1, justifyContent: "center" }
});

/**
 ** @deprecated Use `OperationResultScreen` instead
 */
const GenericErrorComponent = (props: Props) => {
  const ref = useMemo(() => props.ref ?? React.createRef<View>(), [props.ref]);

  const renderFooterButtons = () =>
    props.onCancel ? (
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            label: props.cancelButtonTitle ?? I18n.t("global.buttons.cancel"),
            accessibilityLabel:
              props.cancelButtonTitle ?? I18n.t("global.buttons.cancel"),
            onPress: props.onCancel
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
            accessibilityLabel:
              props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
            onPress: props.onRetry
          }
        }}
      />
    ) : (
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
            accessibilityLabel:
              props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
            onPress: props.onRetry
          }
        }}
      />
    );

  // accessible if undefined (default error subtext) or text length > 0
  const subTextAccessible = pipe(
    props.subText,
    O.fromNullable,
    O.fold(
      () => true,
      text => text.length > 0
    )
  );

  useFocusEffect(
    React.useCallback(() => {
      if (props.avoidNavigationEvents !== true) {
        setAccessibilityFocus(ref);
      }
    }, [ref, props.avoidNavigationEvents])
  );

  return (
    <React.Fragment>
      <ScrollView
        bounces={false}
        testID={props.testID}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <View style={IOStyles.alignCenter}>
          <VSpacer size={40} />
          {props.image ? (
            <Image accessibilityIgnoresInvertColors source={props.image} />
          ) : (
            <Pictogram name="umbrellaNew" />
          )}
          <VSpacer size={40} />
          <View style={IOStyles.alignCenter}>
            <H4 ref={ref}>
              {props.text ? props.text : I18n.t("wallet.errors.GENERIC_ERROR")}
            </H4>
            <VSpacer size={16} />
            <Body accessible={subTextAccessible}>
              {props.subText !== undefined
                ? props.subText
                : I18n.t("wallet.errorTransaction.submitBugText")}
            </Body>
          </View>
          <VSpacer size={40} />
        </View>
      </ScrollView>
      {renderFooterButtons()}
    </React.Fragment>
  );
};

export default GenericErrorComponent;
