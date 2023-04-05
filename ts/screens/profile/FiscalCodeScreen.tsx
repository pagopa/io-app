import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Text as NBText } from "native-base";
import * as React from "react";
import { ReactElement, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { HSpacer, VSpacer } from "../../components/core/spacer/Spacer";
import { H2 } from "../../components/core/typography/H2";
import { IOColors } from "../../components/core/variables/IOColors";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import FiscalCodeLandscapeOverlay from "../../components/FiscalCodeLandscapeOverlay";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import {
  BottomTopAnimation,
  LightModalContextInterface
} from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { ProfileParamsList } from "../../navigation/params/ProfileParamsList";
import { contentMunicipalityLoad } from "../../store/actions/content";
import { municipalitySelector } from "../../store/reducers/content";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { Icon } from "../../components/core/icons";

type Props = ReturnType<typeof mapStateToProps> & {
  navigation: IOStackNavigationProp<ProfileParamsList, "PROFILE_FISCAL_CODE">;
} & ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  darkBg: {
    backgroundColor: IOColors.bluegrey
  },
  shadow: {
    // iOS
    paddingBottom: 20,
    shadowColor: IOColors.bluegreyDark,
    shadowOffset: {
      width: 1,
      height: 8
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Android
    elevation: 8
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

const FiscalCodeScreen: React.FunctionComponent<Props> = (props: Props) => {
  const handleBackPress = () => {
    props.navigation.goBack();
    return true;
  };

  const { profile, loadMunicipality } = props;

  // Decode codice catastale effect manager
  useEffect(() => {
    if (profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        profile.fiscal_code.substring(11, 15)
      );
      pipe(
        maybeCodiceCatastale,
        E.map(code => loadMunicipality(code))
      );
    }
  }, [profile, loadMunicipality]);

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

  const customGoBack: ReactElement = (
    <TouchableDefaultOpacity
      onPress={handleBackPress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <Icon name="legChevronLeft" color="white" />
    </TouchableDefaultOpacity>
  );

  return (
    <React.Fragment>
      <DarkLayout
        allowGoBack={true}
        customGoBack={customGoBack}
        headerBody={
          <TouchableDefaultOpacity onPress={() => props.navigation.goBack}>
            <NBText white={true}>{I18n.t("profile.fiscalCode.title")}</NBText>
          </TouchableDefaultOpacity>
        }
        contentStyle={styles.darkBg}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["profile"]}
        hideHeader={true}
        topContent={
          <React.Fragment>
            <VSpacer size={16} />
            <H2 color={"white"}>{I18n.t("profile.fiscalCode.fiscalCode")}</H2>
            <VSpacer size={16} />
          </React.Fragment>
        }
      >
        {props.profile && (
          <React.Fragment>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <HSpacer size={24} />
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
              <HSpacer size={8} />
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
              <HSpacer size={24} />
            </ScrollView>
            <NBText white={true} style={styles.text}>
              {I18n.t("profile.fiscalCode.content")}
            </NBText>
          </React.Fragment>
        )}
      </DarkLayout>
    </React.Fragment>
  );
};

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
