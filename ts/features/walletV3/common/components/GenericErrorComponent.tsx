import { NavigationEvents } from "@react-navigation/compat";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  VSpacer,
  IOPictograms,
  Pictogram,
  FooterWithButtons,
  ButtonSolidProps,
  Body,
  IOStyles,
  H3
} from "@pagopa/io-app-design-system";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import themeVariables from "../../../../theme/variables";
import I18n from "../../../../i18n";
import { WithTestID } from "../../../../types/WithTestID";

type GenericErrorComponentProps = WithTestID<{
  title: string;
  pictogram: IOPictograms;
  body?: string | React.ReactNode;
  onRetry?: () => void;
  onClose?: () => void;
}>;

const styles = StyleSheet.create({
  main: {
    padding: themeVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

const renderBody = (body: string | React.ReactNode) =>
  pipe(
    body,
    t.string.decode,
    E.fold(
      () => body,
      bodyText => (
        <Body testID="errorScreenBody" style={styles.textAlignCenter}>
          {bodyText}
        </Body>
      )
    )
  );

/**
 * A base Error screen that displays one image, text, and bottom buttons
 * @param props
 * @constructor
 */
export const GenericErrorComponent = ({
  title,
  body,
  pictogram,
  testID,
  onRetry,
  onClose
}: GenericErrorComponentProps) => {
  const elementRef = React.createRef<Text>();

  const retryButtonProps: ButtonSolidProps = {
    testID: "WalletOnboardingRetryButtonTestID",
    fullWidth: true,
    accessibilityLabel: I18n.t("features.fci.errors.buttons.retry"),
    label: I18n.t("features.fci.errors.buttons.retry"),
    onPress: () => onRetry?.()
  };

  const closeButtonProps: ButtonSolidProps = {
    testID: "WalletOnboardingCloseButtonTestID",
    fullWidth: true,
    accessibilityLabel: I18n.t("features.fci.errors.buttons.close"),
    label: I18n.t("features.fci.errors.buttons.close"),
    onPress: () => onClose?.()
  };

  const renderFooterButtons = () => {
    const buttons = pipe(
      [onRetry && retryButtonProps, onClose && closeButtonProps],
      A.filterMap(O.fromNullable),
      buttons => (A.isEmpty(buttons) ? [closeButtonProps] : buttons)
    );

    if (buttons.length === 1) {
      return (
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Outline",
            buttonProps: closeButtonProps
          }}
        />
      );
    } else if (buttons.length === 2) {
      return (
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          primary={{
            type: "Solid",
            buttonProps: retryButtonProps
          }}
          secondary={{
            type: "Outline",
            buttonProps: closeButtonProps
          }}
        />
      );
    }

    return <></>;
  };

  return (
    <SafeAreaView style={IOStyles.flex} testID={testID}>
      <View style={styles.main} testID="GenericErrorComponent">
        <NavigationEvents
          onWillFocus={() => setAccessibilityFocus(elementRef)}
        />
        <Pictogram name={pictogram} />
        <VSpacer size={24} />
        <H3
          testID="infoScreenTitle"
          accessible
          ref={elementRef}
          style={styles.textAlignCenter}
        >
          {title}
        </H3>
        <VSpacer size={16} />
        {body && renderBody(body)}
      </View>

      {renderFooterButtons()}
    </SafeAreaView>
  );
};
