import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { BackHandler, ScrollView, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import FiscalCodeLandscapeOverlay from "../../components/FiscalCodeLandscapeOverlay";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import H5 from "../../components/ui/H5";
import IconFont from "../../components/ui/IconFont";
import {
  BottomTopAnimation,
  LightModalContextInterface
} from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { contentMunicipalityLoad } from "../../store/actions/content";
import { municipalitySelector } from "../../store/reducers/content";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { getBrightness, setBrightness } from "../../utils/brightness";

type Props = ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.fiscalCode.title",
  body: "profile.fiscalCode.help"
};

type State = {
  baseBrightnessValue?: number;
};

class FiscalCodeScreen extends React.PureComponent<Props, State> {
  private showModal(showBackSide: boolean = false) {
    if (this.props.profile) {
      const component = (
        <FiscalCodeLandscapeOverlay
          onCancel={this.props.hideModal}
          profile={this.props.profile}
          municipality={this.props.municipality.data}
          showBackSide={showBackSide}
        />
      );
      this.props.showAnimatedModal(component, BottomTopAnimation);
    }
  }

  public componentDidMount() {
    const screenBrightness = getBrightness();
    // tslint:disable-next-line: no-floating-promises
    screenBrightness.then(brightness => {
      this.setState(
        {
          baseBrightnessValue: brightness
        },
        () => setBrightness(0.9)
      );
    });

    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    if (this.props.profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        this.props.profile.fiscal_code.substring(11, 15)
      );
      // if municipality data are none we request a load
      if (pot.isNone(this.props.municipality.data)) {
        maybeCodiceCatastale.map(c => this.props.loadMunicipality(c));
      }
    }
  }
  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    this.resetAppBrightness();
  }

  private resetAppBrightness = () => {
    if (this.state.baseBrightnessValue !== undefined) {
      setBrightness(this.state.baseBrightnessValue);
    }
  };

  private goBack = () => {
    this.props.navigation.goBack();
  };

  private handleBackPress = () => {
    if (this.state.baseBrightnessValue !== undefined) {
      setBrightness(this.state.baseBrightnessValue);
    }
    this.props.navigation.goBack();
    return true;
  };

  private customOnboardingGoBack = (
    <IconFont
      name={"io-back"}
      style={{ color: customVariables.colorWhite }}
      onPress={this.goBack}
    />
  );

  public render() {
    return (
      <React.Fragment>
        <DarkLayout
          allowGoBack={true}
          customGoBack={this.customOnboardingGoBack}
          headerBody={
            <TouchableDefaultOpacity onPress={this.goBack}>
              <Text white={true}>{I18n.t("profile.fiscalCode.title")}</Text>
            </TouchableDefaultOpacity>
          }
          contentStyle={styles.darkBg}
          contextualHelpMarkdown={contextualHelpMarkdown}
          faqCategories={["profile"]}
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
                <TouchableDefaultOpacity onPress={() => this.showModal()}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={false}
                      municipality={this.props.municipality.data}
                    />
                  </View>
                </TouchableDefaultOpacity>
                <View style={styles.spacer} />
                <TouchableDefaultOpacity onPress={() => this.showModal(true)}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={true}
                      municipality={this.props.municipality.data}
                    />
                  </View>
                </TouchableDefaultOpacity>

                <View style={styles.largeSpacer} />
              </ScrollView>
              <Text white={true} style={styles.text}>
                {I18n.t("profile.fiscalCode.content")}
              </Text>
            </React.Fragment>
          )}
        </DarkLayout>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  profile: pot.toUndefined(profileSelector(state)),
  municipality: municipalitySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadMunicipality: (code: CodiceCatastale) =>
    dispatch(contentMunicipalityLoad.request(code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(FiscalCodeScreen));
