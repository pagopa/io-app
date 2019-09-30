// TODO: evaluate if substitute with EmailScreen introduced with https://github.com/teamdigitale/io-app/pull/1308/
// or just create a component to rendere its content

// TODO: shift the modal from the footer button here to the proper screens

// TODO: add contextual help

import { Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import H5 from "../../components/ui/H5";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps>;

class EmailDetailsScreen extends React.PureComponent<Props> {
  public render() {
    return (
      <TopScreenComponent goBack={() => this.props.navigation.goBack()}>
        <ScreenContent title={"Il tuo indirizzo email"}>
          <View style={{ paddingHorizontal: customVariables.contentPadding }}>
            <View spacer={true} />
            <Text>Indirizzo email personale</Text>
            <View spacer={true} />
            <H5>{this.props.email}</H5>
            <View spacer={true} />
            <Text>
              {`Puoi modificare questo indirizzo, che dovraivalidare cliccando su un link che spediremo alla tua casella di posta. Nel frattempo, le funzioni di IO che dipendono dalla email (pagamenti, inoltro messaggi, etc.) saranno disattivate. \n`}
              <Text bold={true}>
                Attenzione: il tuo account PagoPA è associato alla tua email,
                quindi se la modifichi non troverai più elencati
                nell'applicazione le tue transazioni ed i tuoi metodi di
                pagamento.
              </Text>
            </Text>
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            bordered: true,
            onPress: () => {/* TODO */},
            title: "Modifica indirizzo email"
          }}
        />
      </TopScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    email: "test@email.it" // TODO: add email
  };
}

export default connect(mapStateToProps)(EmailDetailsScreen);
