import { useNavigation } from "@react-navigation/native";
import { useActor } from "@xstate/react";
import { View, Text } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
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
import { useConfigurationMachineService } from "../xstate/provider";

const ibanList: ReadonlyArray<IbanDTO> = [
  {
    iban: "IT60X0542811101000000123456",
    checkIbanStatus: "VALID",
    holderBank: "BANCA POPOLARE DI SONDRIO",
    description: "IBAN di test",
    channel: "WEB",
    bicCode: "BPPIITRRXXX",
    queueDate: "2020-12-01T00:00:00.000Z",
    checkIbanResponseDate: new Date()
  },
  {
    iban: "IT60X0542811101000000223456",
    checkIbanStatus: "VALID",
    holderBank: "BANCA POPOLARE DI SONDRIO",
    description: "IBAN di test 2",
    channel: "WEB",
    bicCode: "BPPIITRRXXX",
    queueDate: "2020-12-01T00:00:00.000Z",
    checkIbanResponseDate: new Date()
  }
];

const IbanAssociationScreen = () => {
  const navigation = useNavigation();
  const configurationMachine = useConfigurationMachineService();
  const [_state, send] = useActor(configurationMachine);

  const [selectedIban, setSelectedIban] = React.useState<IbanDTO | undefined>();

  const isLoadingIbanList = false;

  const handleBackPress = () => {
    send({ type: "GO_BACK" });
    navigation.goBack();
  };

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
              bordered: true
            }}
            rightButton={{
              title: I18n.t("global.buttons.continue"),
              disabled: !selectedIban
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

export default IbanAssociationScreen;
