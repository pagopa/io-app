import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet } from "react-native";
import { NavigationContext, NavigationInjectedProps } from "react-navigation";
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
import { navSelector } from "../../store/reducers/navigationHistory";

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

/* type State = {
  baseBrightnessValue?: number;
}; */

const HIGH_BRIGHTNESS = 1.0; // Target screen brightness for a very bright screen

const FiscalCodeScreen: React.FunctionComponent<Props> = (props: Props) => {
  const navigation = React.useContext(NavigationContext);

  const [initialBrightness, storeInitialBrightness] = useState(0.0);

  const setHighDeviceBrightnessTask = getBrightness()
    .map((myBrightness: number) => storeInitialBrightness(myBrightness))
    .chain(() => setBrightness(HIGH_BRIGHTNESS))
    .fold(
      () => alert("Failed to set screen Brightness"),
      () => undefined
    );

  const restoreDeviceBrightnessTask = setBrightness(initialBrightness).fold(
    () => alert("Failed to restore screen brightness."),
    () => undefined
  );

  const restoreDeviceBrightness = async () =>
    await restoreDeviceBrightnessTask.run();

  const handleBackPress = () => {
    // TODO: add log or silent exception
    void restoreDeviceBrightness();
    props.navigation.goBack();
    return true;
  };

  // Add and remove EventListener effect manager

  useEffect(() => {
    if (navigation.isFocused()) {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    } else {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    }
  }, [navigation.isFocused()]);

  // Set and unset brightness effect manager

  useEffect(() => {
    if (navigation.isFocused()) {
      const setHighDeviceBrightness = async () =>
        await setHighDeviceBrightnessTask.run();

      void setHighDeviceBrightness();
    } else {
      void restoreDeviceBrightness();
    }
  }, [navigation.isFocused()]);

  // Decode codice catastale effect manager
  useEffect(() => {
    if (props.profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        props.profile.fiscal_code.substring(11, 15)
      );
      maybeCodiceCatastale.map(code => props.loadMunicipality(code));
    }
  }, []);

  const showModal = (showBackSide: boolean = false) => {
    if (props.profile) {
      const component = (
        <FiscalCodeLandscapeOverlay
          onCancel={props.hideModal}
          profile={props.profile}
          municipality={props.municipality.data}
          showBackSide={showBackSide}
        />
      );
      props.showAnimatedModal(component, BottomTopAnimation);
    }
  };

  const customGoBack: React.FunctionComponent = () => (
    <TouchableDefaultOpacity
      onPress={handleBackPress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont
        name={"io-back"}
        style={{ color: customVariables.colorWhite }}
      />
    </TouchableDefaultOpacity>
  );

  return (
    <React.Fragment>
      <DarkLayout
        allowGoBack={true}
        customGoBack={customGoBack}
        headerBody={
          <TouchableDefaultOpacity onPress={() => props.navigation.goBack}>
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
        {props.profile && (
          <React.Fragment>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.largeSpacer} />
              <TouchableDefaultOpacity
                onPress={() => showModal()}
                accessibilityRole={"button"}
              >
                <View style={styles.shadow}>
                  <FiscalCodeComponent
                    type={"Full"}
                    profile={props.profile}
                    getBackSide={false}
                    municipality={props.municipality.data}
                  />
                </View>
              </TouchableDefaultOpacity>
              <View style={styles.spacer} />
              <TouchableDefaultOpacity
                onPress={() => showModal(true)}
                accessibilityRole={"button"}
              >
                <View style={styles.shadow}>
                  <FiscalCodeComponent
                    type={"Full"}
                    profile={props.profile}
                    getBackSide={true}
                    municipality={props.municipality.data}
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
};

/*
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

  public async componentDidMount() {
    const screenBrightness = await getBrightness().run();
    screenBrightness.fold(
      _ => {
        this.setState({
          baseBrightnessValue: undefined
        });
      },
      brightness => {
        this.setState(
          {
            baseBrightnessValue: brightness
          },
          async () => await setBrightness(SCREEN_BRIGHTNESS).run()
        );
      }
    );

    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    if (this.props.profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        this.props.profile.fiscal_code.substring(11, 15)
      );

      maybeCodiceCatastale.map(c => this.props.loadMunicipality(c));
    }
  }

  public async componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    await this.resetAppBrightness();
  }

  private resetAppBrightness = async () => {
    fromNullable(this.state.baseBrightnessValue).map(
      async v => await setBrightness(v).run()
    );
  };

  private goBack = () => {
    this.props.navigation.goBack();
  };



  private customGoBack = (
    <TouchableDefaultOpacity
      onPress={this.handleBackPress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont
        name={"io-back"}
        style={{ color: customVariables.colorWhite }}
      />
    </TouchableDefaultOpacity>
  );

  public render() {
    return (
      <React.Fragment>
        <DarkLayout
          allowGoBack={true}
          customGoBack={this.customGoBack}
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
                <TouchableDefaultOpacity
                  onPress={() => this.showModal()}
                  accessibilityRole={"button"}
                >
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
                <TouchableDefaultOpacity
                  onPress={() => this.showModal(true)}
                  accessibilityRole={"button"}
                >
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

*/

const mapStateToProps = (state: GlobalState) => ({
  profile: pot.toUndefined(profileSelector(state)),
  municipality: municipalitySelector(state),
  nav: navSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadMunicipality: (code: CodiceCatastale) =>
    dispatch(contentMunicipalityLoad.request(code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(FiscalCodeScreen));
