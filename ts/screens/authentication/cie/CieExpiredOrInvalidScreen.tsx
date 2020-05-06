import { Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { openLink } from "../../../components/ui/Markdown/handlers/link";
import I18n from "../../../i18n";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";

type Props = NavigationInjectedProps & ReduxProps;

const browseToLink = () =>
  openLink(
    "https://www.cartaidentita.interno.gov.it/prenotazione-della-richiesta/"
  );

class CieExpiredOrInvalidScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private handleGoBack = () => this.props.dispatch(resetToAuthenticationRoute);

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
          <Text>{I18n.t("authentication.landing.expiredCardContent")}</Text>
          <View spacer={true} />
          <Text link={true} onPress={browseToLink}>
            {I18n.t("authentication.landing.expiredCardHelp")}
          </Text>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            cancel: true,
            onPress: this.handleGoBack,
            title: I18n.t("global.buttons.cancel")
          }}
        />
      </TopScreenComponent>
    );
  }
}

export default connect()(CieExpiredOrInvalidScreen);
