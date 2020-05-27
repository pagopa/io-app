import { List, View } from "native-base";
import * as React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { ScrollView, StyleSheet } from "react-native";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";

type Props = {
  onRequestBonus: () => void;
};

const styles = StyleSheet.create({
  body: {
    flex: 1
  },
  footer: {
    flex: 2
  }
});

const screenTitle = "Attiva bonus";

export const requestBonusButtonProps = (props: Props): BlockButtonProps => {
  return {
    primary: true,
    title: "Richiedi Bonus",
    onPress: props.onRequestBonus
  };
};

/**
 * @param props
 * @constructor
 */
export const ActivateBonusComponent: React.FunctionComponent<Props> = props => {
  return (
    <BaseScreenComponent goBack={true} headerTitle={screenTitle}>
      <ScreenContent title={screenTitle} bounces={false}>
        <List withContentLateralPadding={true}>
          {/* Preferences */}
          <ListItemComponent
            title={I18n.t("profile.main.preferences.title")}
            hideIcon={true}
          />
          <ListItemComponent
            title={I18n.t("profile.main.preferences.title")}
            hideIcon={true}
          />
          <ListItemComponent
            title={I18n.t("profile.main.preferences.title")}
            hideIcon={true}
          />
        </List>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={requestBonusButtonProps(props)}
        />
      </ScreenContent>
    </BaseScreenComponent>
  );
};
