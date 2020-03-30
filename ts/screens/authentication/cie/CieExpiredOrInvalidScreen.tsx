import { Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { openLink } from "../../../components/ui/Markdown/handlers/link";
import I18n from "../../../i18n";

type Props = NavigationInjectedProps;

const browseToLink = () =>
  openLink(
    "https://www.cartaidentita.interno.gov.it/prenotazione-della-richiesta/"
  );

class CieExpiredOrInvalidScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <TopScreenComponent goBack={true}>
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
            onPress: this.props.navigation.goBack, // TODO: check navigation - redirect to Landing Screen?
            title: I18n.t("global.buttons.cancel")
          }}
        />
      </TopScreenComponent>
    );
  }
}

export default CieExpiredOrInvalidScreen;
