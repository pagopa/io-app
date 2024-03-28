/**
 * A screen to alert the user about the number of attempts remains
 */
import {
  ContentWrapper,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { Linking, Platform, ScrollView } from "react-native";
import { connect } from "react-redux";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";

type NavigationProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_PIN_TEMP_LOCKED_SCREEN"
>;

type Props = NavigationProps & ReduxProps;

type State = Readonly<{
  isLoadingCompleted: boolean;
}>;

class CiePinLockedTemporarilyScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoadingCompleted: false };
  }
  private goToCieID() {
    Linking.openURL(
      Platform.select({
        ios: "https://apps.apple.com/it/app/cieid/id1504644677",
        default: "https://play.google.com/store/apps/details?id=it.ipzs.cieid"
      })
    ).catch(constNull);
  }

  private getContextualHelp = () => ({
    title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
    body: () => (
      <LegacyMarkdown>
        {I18n.t("authentication.cie.pin.contextualHelpBody")}
      </LegacyMarkdown>
    )
  });

  private renderFooterButtons = () => (
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      primary={{
        type: "Outline",
        buttonProps: {
          onPress: this.handleGoBack,
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          label: I18n.t("authentication.cie.pinTempLocked.button"),
          accessibilityLabel: I18n.t("authentication.cie.pinTempLocked.button"),
          icon: "cie",
          onPress: this.goToCieID
        }
      }}
    />
  );

  private handleGoBack = () => resetToAuthenticationRoute();

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        contextualHelp={this.getContextualHelp()}
        headerTitle={I18n.t("authentication.cie.pinTempLocked.header")} // TODO: validate
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ScreenContentHeader
            title={I18n.t("authentication.cie.pinTempLocked.title")}
          />
          <ContentWrapper>
            <LegacyMarkdown
              onLoadEnd={() => {
                this.setState({ isLoadingCompleted: true });
              }}
            >
              {I18n.t("authentication.cie.pinTempLocked.content")}
            </LegacyMarkdown>
          </ContentWrapper>
        </ScrollView>

        {this.state.isLoadingCompleted && this.renderFooterButtons()}
      </TopScreenComponent>
    );
  }
}

export default connect()(CiePinLockedTemporarilyScreen);
