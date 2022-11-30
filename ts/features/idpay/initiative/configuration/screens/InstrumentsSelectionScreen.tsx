import * as pot from "@pagopa/ts-commons/lib/pot";
import { List, ListItem, Text, View } from "native-base";
import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { Wallet } from "../../../../../../definitions/pagopa/Wallet";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import Switch from "../../../../../components/ui/Switch";
import TypedI18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { pagoPaCreditCardWalletV1Selector } from "../../../../../store/reducers/wallet/wallets";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useConfigurationMachineService } from "../xstate/provider";

const styles = StyleSheet.create({
  ListItemMain: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

type CustomListItemProps = {
  onSwitchHandler: (idWallet: number | undefined) => void;
  cardObject: Wallet;
};

const CustomListItem = ({
  onSwitchHandler,
  cardObject
}: CustomListItemProps) => {
  const [switchStatus, setSwitchStatus] = React.useState(false);
  const handleSwitch = () => {
    onSwitchHandler(cardObject.idWallet);
    setSwitchStatus(_ => !_);
  };

  return (
    <ListItem>
      <View style={styles.ListItemMain}>
        <H4>{cardObject.creditCard?.pan}</H4>
        <Switch value={switchStatus} onChange={handleSwitch} />
      </View>
    </ListItem>
  );
};

const InstrumentsSelectionScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const { send } = configurationMachine;
  const cardsFromSelector = useIOSelector(pagoPaCreditCardWalletV1Selector);
  const cardsArray = pot.getOrElse(cardsFromSelector, []);

  const selectedCardRef = useRef<number | undefined>(undefined);
  const sendAddInstrument = (): void => {
    send("ADD_INSTRUMENT", { walletId: selectedCardRef.current });
  };

  const onSwitchHandler = (idWallet: number | undefined) => {
    // eslint-disable-next-line functional/immutable-data
    selectedCardRef.current = idWallet;
    present();
  };

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Body>
      {TypedI18n.t("idpay.initiative.configuration.bottomSheet.bodyFirst")}
      <Body weight="SemiBold">
        {TypedI18n.t("idpay.initiative.configuration.bottomSheet.bodyBold") +
          "\n"}
      </Body>
      {TypedI18n.t("idpay.initiative.configuration.bottomSheet.bodyLast")}
    </Body>,

    "Prima di continuare",
    270,

    <FooterWithButtons
      type="TwoButtonsInlineThird"
      rightButton={{
        onPress: () => {
          sendAddInstrument();
          dismiss();
        },
        block: true,
        bordered: false,
        title: TypedI18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonActivate"
        )
      }}
      leftButton={{
        onPress: () => dismiss(),
        block: true,
        bordered: true,
        title: TypedI18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonCancel"
        )
      }}
    />
  );

  return (
    <>
      <BaseScreenComponent goBack={true} headerTitle="Iniziativa">
        <View spacer />
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{TypedI18n.t("idpay.initiative.configuration.header")}</H1>
          <View spacer small />
          <Text>
            {TypedI18n.t("idpay.initiative.configuration.subHeader", {
              initiativeName: "18app"
            })}
          </Text>
          <View spacer />
          <List>
            {cardsArray.map((card, index) => (
              <CustomListItem
                key={index}
                onSwitchHandler={onSwitchHandler}
                cardObject={card}
              />
            ))}
          </List>
          <Text>{TypedI18n.t("idpay.initiative.configuration.footer")}</Text>
        </View>
      </BaseScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{
          title: TypedI18n.t(
            "idpay.initiative.configuration.buttonFooter.noneCta"
          ),
          block: true,
          bordered: true
        }}
        rightButton={{
          title: TypedI18n.t(
            "idpay.initiative.configuration.buttonFooter.continueCta"
          ),
          block: true,
          bordered: false,
          disabled: true
        }}
      />
      {bottomSheet}
    </>
  );
};
export default InstrumentsSelectionScreen;
