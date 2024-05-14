import * as React from "react";
import { BackHandler, NativeEventSubscription, View } from "react-native";
import I18n from "i18n-js";
import {
  ContentWrapper,
  HeaderSecondLevel,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import { H1 } from "./core/typography/H1";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  onClose: () => void;
}>;

/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */
export default class ContextualInfo extends React.Component<Props> {
  private subscription: NativeEventSubscription | undefined;
  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPressed
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  private handleBackPressed = () => {
    this.props.onClose();
    return true;
  };

  public render(): React.ReactNode {
    return (
      <View style={[{ backgroundColor: IOColors.white }, IOStyles.flex]}>
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: this.props.onClose,
            accessibilityLabel: I18n.t("global.buttons.close"),
            testID: "contextualInfo_closeButton"
          }}
        />
        <ContentWrapper>
          <H1>{this.props.title}</H1>
          {this.props.body()}
        </ContentWrapper>
      </View>
    );
  }
}
