import React from "react";
import { List } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import ListItemComponent from "../../components/screens/ListItemComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import I18n from "../../i18n";
import nameSurnameIcon from "../../../img/assistance/nameSurname.svg";
import cardIcon from "../../../img/assistance/card.svg";
import emailIcon from "../../../img/assistance/email.svg";
import brokenLinkImage from "../../../img/broken-link.png";

import {
  NewProfileState,
  newProfileStateSelector
} from "../../store/reducers/newProfile";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { getNewProfile } from "../../store/actions/newProfile";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { H2 } from "../../components/core/typography/H2";
import ButtonSolid from "../../components/ui/ButtonSolid";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.newContextualHelpContent"
};

/**
 * Renders a screen with basic information about the current user, including name, surname, fiscal code and email.
 * It includes a header bar with a contextual helper menu and a back button.
 */
const NewProfileScreen = () => {
  const title = I18n.t("profile.main.title");
  const newProfilePot: NewProfileState = useSelector(newProfileStateSelector);
  const dispatch = useDispatch();

  /**
   * Gets an attribute value from the InitializedProfile Pot.
   * @param attribute - the attribute to extract.
   * @returns the attribute as string or a 'not available' string.
   */
  const getValueFromPot = (attribute: keyof InitializedProfile) =>
    pot.getOrElse(
      pot.map(newProfilePot, p => String(p[attribute])),
      I18n.t("global.remoteStates.notAvailable")
    );

  /**
   * Renders a loading view.
   */
  const renderLoadingView = () => (
    <SafeAreaView style={styles.loadingView}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );

  /**
   * Renders a error view with a 'retry' button.
   */
  const renderErrorView = () => (
    <View style={[IOStyles.horizontalContentPadding, styles.errContainer]}>
      <Image source={brokenLinkImage} resizeMode="contain" />
      <VSpacer size={24} />
      <H2>{I18n.t("global.jserror.title")}</H2>
      <View style={styles.errBtnOuterView}>
        <View style={styles.errBtnInnerView}>
          <ButtonSolid
            fullWidth
            onPress={() => dispatch(getNewProfile())}
            label={I18n.t("global.buttons.retry")}
            accessibilityLabel={I18n.t("global.buttons.retry")}
          />
        </View>
      </View>
    </View>
  );

  /**
   * Renders the main content of the screen.
   */
  const renderContentView = () => (
    <ScreenContent title={title}>
      <List withContentLateralPadding={true}>
        <ListItemComponent
          title={I18n.t("profile.data.list.nameSurname")}
          subTitle={`${getValueFromPot("name")} ${getValueFromPot(
            "family_name"
          )}`}
          hideIcon
          leadingIcon={nameSurnameIcon}
        ></ListItemComponent>
        <ListItemComponent
          title={I18n.t("profile.data.list.fiscalCode")}
          subTitle={getValueFromPot("fiscal_code")}
          hideIcon
          leadingIcon={cardIcon}
        ></ListItemComponent>
        <ListItemComponent
          title={I18n.t("profile.data.list.email")}
          subTitle={getValueFromPot("email")}
          hideIcon
          leadingIcon={emailIcon}
        ></ListItemComponent>
      </List>
    </ScreenContent>
  );

  /**
   * Folds a Pot and maps any possible internal state to a view.
   */
  const renderMask = () =>
    pot.fold(
      newProfilePot,
      () => renderLoadingView(), // foldNone:
      () => renderLoadingView(), // foldNoneLoading:
      () => renderLoadingView(), // foldNoneUpdating:
      () => renderErrorView(), // foldNoneError:
      () => renderContentView(), // foldSome:
      () => renderLoadingView(), // foldSomeLoading:
      () => renderLoadingView(), // foldSomeUpdating:
      () => renderErrorView() // foldSomeError:
    );

  useOnFirstRender(() => {
    dispatch(getNewProfile());
  });

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={title}
      accessibilityLabel={title}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      {renderMask()}
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  loadingView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center"
  },

  errContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errBtnOuterView: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  errBtnInnerView: {
    flex: 1
  }
});

export default NewProfileScreen;
