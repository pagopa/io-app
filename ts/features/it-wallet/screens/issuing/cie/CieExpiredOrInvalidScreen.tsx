import { Content } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { Link } from "../../../../../components/core/typography/Link";
import { ScreenContentHeader } from "../../../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { openLink } from "../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../i18n";
import { ReduxProps } from "../../../../../store/actions/types";
import { ITW_ROUTES } from "../../../navigation/routes";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/params";

const bookingUrl = I18n.t("cie.booking_url");
const browseToLink = () => openLink(bookingUrl);
type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_CIE_EXPIRED_SCREEN"
>;
type Props = ReduxProps & NavigationProps;

class CieExpiredOrInvalidScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private handleGoBack = () =>
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ACTIVATION.DETAILS
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
          <Link onPress={browseToLink}>
            {I18n.t("authentication.landing.expiredCardHelp")}
          </Link>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            bordered: true,
            onPress: this.handleGoBack,
            title: I18n.t("global.buttons.cancel")
          }}
        />
      </TopScreenComponent>
    );
  }
}

export default connect()(CieExpiredOrInvalidScreen);
