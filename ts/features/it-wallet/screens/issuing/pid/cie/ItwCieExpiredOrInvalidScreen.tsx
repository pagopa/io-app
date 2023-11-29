import { Content } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import {
  Body,
  FooterWithButtons,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ScreenContentHeader } from "../../../../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../../../../components/screens/TopScreenComponent";
import { openLink } from "../../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../../i18n";
import { ReduxProps } from "../../../../../../store/actions/types";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";

const bookingUrl = I18n.t("cie.booking_url");
const browseToLink = () => openLink(bookingUrl);
type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUING_PID_CIE_EXPIRED_SCREEN"
>;
type Props = ReduxProps & NavigationProps;

class ItwCieExpiredOrInvalidScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private handleGoBack = () =>
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUING.PID.AUTH_INFO
    });

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("authentication.landing.expiredCardHeaderTitle")}
      >
        <ScreenContentHeader
          title={I18n.t("authentication.landing.expiredCardTitle")}
        />
        <Content>
          <Body>{I18n.t("authentication.landing.expiredCardContent")}</Body>
          <VSpacer size={16} />
          <LabelLink onPress={browseToLink}>
            {I18n.t("authentication.landing.expiredCardHelp")}
          </LabelLink>
        </Content>
        <FooterWithButtons
          primary={{
            type: "Outline",
            buttonProps: {
              color: "primary",
              accessibilityLabel: I18n.t("global.buttons.cancel"),
              onPress: this.handleGoBack,
              label: I18n.t("global.buttons.cancel")
            }
          }}
          type="SingleButton"
        />
      </TopScreenComponent>
    );
  }
}

export default connect()(ItwCieExpiredOrInvalidScreen);
