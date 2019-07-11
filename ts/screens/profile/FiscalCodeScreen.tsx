import { getOrElse } from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import H5 from "../../components/ui/H5";
import Markdown from "../../components/ui/Markdown";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  darkBg: {
    backgroundColor: customVariables.brandDarkGray
  },
  white: {
    color: customVariables.colorWhite
  },
  shadow: {
    // iOS
    paddingBottom: 20,
    shadowColor: customVariables.brandDarkestGray,
    shadowOffset: {
      width: 1,
      height: 8
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Android
    elevation: 8
  },
  spacer: {
    width: 8
  },
  largeSpacer: {
    width: customVariables.contentPadding
  }
});

type Props = ReturnType<typeof mapStateToProps>;

class FiscalCodeScreen extends React.PureComponent<Props> {
  public render() {
    return (
      <DarkLayout
        allowGoBack={true}
        title={""}
        headerBody={<Text white={true}>Documenti personali</Text>}
        contentStyle={styles.darkBg}
        contextualHelp={{
          title: "Documenti personali",
          body: () => (
            <Markdown>
              Qui è visualizzato il fac-simile della tessera del codice fiscale.
              Attenzione: i dati potrebbero non corrispondere BLA BLA
            </Markdown>
          )
        }}
        topContent={
          <React.Fragment>
            <H5 style={styles.white}>Codice Fiscale</H5>
            <View spacer={true} />
          </React.Fragment>
        }
      >
        {this.props.profile && (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.largeSpacer} />
            <View style={styles.shadow}>
              <FiscalCodeComponent
                type={"Full"}
                profile={this.props.profile}
                getBackSide={false}
              />
            </View>

            <View style={styles.spacer} />
            <FiscalCodeComponent
              type={"Full"}
              profile={this.props.profile}
              getBackSide={true}
            />
            <View style={styles.largeSpacer} />
          </ScrollView>
        )}
      </DarkLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  profile: getOrElse(profileSelector(state), undefined)
});

export default connect(mapStateToProps)(FiscalCodeScreen);
