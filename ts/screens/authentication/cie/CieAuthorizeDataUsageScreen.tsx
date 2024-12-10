/**
 * A screen displayed while the backend manage the opening of the session for the CIE authentication
 */
import {
  ContentWrapper,
  FooterActionsInline,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, ScrollView } from "react-native";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_AUTHORIZE_USAGE_SCREEN"
>;

type State = {
  isLoadingCompleted: boolean;
};

class CieAuthorizeDataUsageScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoadingCompleted: false };
    this.handleMarkdownLoadingCompleted =
      this.handleMarkdownLoadingCompleted.bind(this);
  }

  private readonly handleMarkdownLoadingCompleted = () => {
    this.setState({ isLoadingCompleted: true });
  };

  public render(): React.ReactNode {
    return (
      <TopScreenComponent goBack={true}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("authentication.cie.noDataTitle")}</H2>
            <VSpacer size={16} />
            <LegacyMarkdown onLoadEnd={this.handleMarkdownLoadingCompleted}>
              {I18n.t("authentication.cie.authToSendData")}
            </LegacyMarkdown>
          </ContentWrapper>
        </ScrollView>
        {this.state.isLoadingCompleted && (
          <FooterActionsInline
            startAction={{
              label: I18n.t("global.buttons.cancel"),
              onPress: this.props.navigation.goBack
            }}
            endAction={{
              label: I18n.t("global.buttons.retry"),
              onPress: () => Alert.alert(I18n.t("global.notImplemented"))
            }}
          />
        )}
      </TopScreenComponent>
    );
  }
}

export default CieAuthorizeDataUsageScreen;
