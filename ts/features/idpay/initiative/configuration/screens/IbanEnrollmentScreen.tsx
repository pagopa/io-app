import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { Text, View } from "native-base";
import React from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
import IconProfileAlt from "../../../../../components/core/icons/svg/IconProfileAlt";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  ibanListSelector,
  isLoadingIbanListSelector,
  isUpsertingIbanSelector
} from "../xstate/selectors";

type IbanEnrollmentScreenRouteParams = {
  initiativeId?: string;
};

type IbanEnrollmentScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT"
>;

const IbanEnrollmentScreen = () => {
  const route = useRoute<IbanEnrollmentScreenRouteProps>();
  const { initiativeId } = route.params;

  const [selectedIban, setSelectedIban] = React.useState<IbanDTO | undefined>();
  const configurationMachine = useConfigurationMachineService();

  const isLoadingIbanList = useSelector(
    configurationMachine,
    isLoadingIbanListSelector
  );

  const ibanList = useSelector(configurationMachine, ibanListSelector);

  const isUpsertingIban = useSelector(
    configurationMachine,
    isUpsertingIbanSelector
  );

  const handleBackPress = () => {
    configurationMachine.send({ type: "BACK" });
  };

  const handleContinuePress = () => {
    if (selectedIban !== undefined) {
      configurationMachine.send({ type: "ENROLL_IBAN", iban: selectedIban });
    }
  };

  const handleAddNewIbanPress = () => {
    Alert.alert("TODO: add new IBAN 🙂");
  };

  React.useEffect(() => {
    if (initiativeId) {
      configurationMachine.send({
        type: "START_CONFIGURATION",
        initiativeId,
        mode: ConfigurationMode.IBAN
      });
    }
  }, [configurationMachine, initiativeId]);

  const renderIbanList = () =>
    ibanList.map(iban => {
      const isSelected = iban.iban === selectedIban?.iban;

      return (
        <ListItemComponent
          key={iban.iban}
          title={iban.description}
          subTitle={iban.iban}
          iconName={isSelected ? "io-radio-on" : "io-radio-off"}
          smallIconSize={true}
          accessible={true}
          accessibilityRole={"radiogroup"}
          accessibilityState={{ checked: true }}
          onPress={() => setSelectedIban(iban)}
        />
      );
    });

  return (
    <BaseScreenComponent
      goBack={handleBackPress}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoadingIbanList} loadingOpacity={1}>
        <View style={IOStyles.flex}>
          <View spacer={true} large={true} />
          <View style={IOStyles.horizontalContentPadding}>
            <H1>Scegli quale IBAN associare all’iniziativa</H1>
            <View spacer={true} small={true} />
            <Body>
              Associa un IBAN salvato nel tuo profilo per poter ricevere i
              rimborsi legati all’iniziativa.
            </Body>
          </View>
          <View spacer={true} large={true} />
          <ScrollView style={IOStyles.horizontalContentPadding}>
            {/* IBAN list */}
            {renderIbanList()}
            <View spacer={true} />
            <View style={styles.infoRow}>
              <IconProfileAlt size={24} color={"gray"} />
              <View hspacer={true} />
              <Text style={IOStyles.flex}>
                Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
                visitando la sezione Profilo
              </Text>
            </View>
          </ScrollView>
        </View>
        <SafeAreaView>
          <FooterWithButtons
            type="TwoButtonsInlineHalf"
            leftButton={{
              title: "Aggiungi nuovo",
              bordered: true,
              onPress: handleAddNewIbanPress
            }}
            rightButton={{
              title: I18n.t("global.buttons.continue"),
              disabled: !selectedIban || isUpsertingIban,
              isLoading: isUpsertingIban,
              onPress: handleContinuePress
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export type { IbanEnrollmentScreenRouteParams };

export default IbanEnrollmentScreen;
