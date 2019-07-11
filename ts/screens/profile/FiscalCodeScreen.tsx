import I18n from "i18n-js";
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
  },
  text: {
    paddingHorizontal: customVariables.contentPadding,
    marginTop: -10
  }
});

type Props = ReturnType<typeof mapStateToProps>;

class FiscalCodeScreen extends React.PureComponent<Props> {
  public render() {
    return (
      <DarkLayout
        allowGoBack={true}
        headerBody={
          <Text white={true}>{I18n.t("profile.fiscalCode.title")}</Text>
        }
        contentStyle={styles.darkBg}
        contextualHelp={{
          title: I18n.t("profile.fiscalCode.title"),
          body: () => <Markdown>{I18n.t("profile.fiscalCode.help")}</Markdown>
        }}
        hideHeader={true}
        topContent={
          <React.Fragment>
            <View spacer={true} />
            <H5 style={styles.white}>
              {I18n.t("profile.fiscalCode.fiscalCode")}
            </H5>
            <View spacer={true} />
          </React.Fragment>
        }
      >
        {this.props.profile && (
          <React.Fragment>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.largeSpacer} />
              <View style={styles.shadow}>
                <FiscalCodeComponent
                  type={"Full"}
                  profile={this.props.profile}
                  getBackSide={false}
                />
              </View>

              <View style={styles.spacer} />
              <View style={styles.shadow}>
                <FiscalCodeComponent
                  type={"Full"}
                  profile={this.props.profile}
                  getBackSide={true}
                />
              </View>
              <View style={styles.largeSpacer} />
            </ScrollView>
            <Text white={true} style={styles.text}>
              {I18n.t("profile.fiscalCode.content")}
            </Text>
          </React.Fragment>
        )}
      </DarkLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  profile: getOrElse(profileSelector(state), undefined)
});

export default connect(mapStateToProps)(FiscalCodeScreen);
