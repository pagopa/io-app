import { useSelector } from "@xstate/react";
import { List, ListItem, Text, View } from "native-base";
import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ActivityIndicator from "../../../../../components/ui/ActivityIndicator";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import Switch from "../../../../../components/ui/Switch";
import TypedI18n from "../../../../../i18n";
import { Wallet } from "../../../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  selectIsLoadingInstruments,
  selectorIDPayInstrumentsByIdWallet,
  selectorPagoPAIntruments
} from "../xstate/selectors";

const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

type InstrumentEnrollmentSwitcher = {
  instrument: Wallet;
  idPayStatus: InstrumentDTO["status"];
  onSwitch: (idWallet: number) => void;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitcher = ({
  instrument,
  idPayStatus,
  onSwitch
}: InstrumentEnrollmentSwitcher) => {
  const [switchStatus, setSwitchStatus] = React.useState(false);
  const handleSwitch = () => {
    setSwitchStatus(_ => !_);
    onSwitch(instrument.idWallet);
  };

  return (
    <ListItem>
      <View style={styles.listItemContainer}>
        <H4>{instrument.idWallet}</H4>
        {idPayStatus === undefined ? (
          <Switch value={switchStatus} onChange={handleSwitch} />
        ) : (
          // TODO: Map with icon
          <Text>{idPayStatus}</Text>
        )}
      </View>
    </ListItem>
  );
};

// TODO: Disable enrollment of an instrument if one already in progress
const InstrumentsSelectionScreen = () => {
  const selectedCardRef = useRef<number | undefined>(undefined);
  const configurationMachine = useConfigurationMachineService();

  const isLoadingInstruments = useSelector(
    configurationMachine,
    selectIsLoadingInstruments
  );

  const pagoPAInstruments = useSelector(
    configurationMachine,
    selectorPagoPAIntruments
  );
  const idPayInstrumentsByIdWallet = useSelector(
    configurationMachine,
    selectorIDPayInstrumentsByIdWallet
  );

  const sendAddInstrument = (): void => {
    configurationMachine.send("ADD_INSTRUMENT", {
      walletId: selectedCardRef.current
    });
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

  const content = isLoadingInstruments ? (
    <ActivityIndicator />
  ) : (
    <>
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
          {pagoPAInstruments.map(pagoPAInstrument => (
            <InstrumentEnrollmentSwitcher
              key={pagoPAInstrument.idWallet}
              instrument={pagoPAInstrument}
              idPayStatus={
                idPayInstrumentsByIdWallet[pagoPAInstrument.idWallet]?.status
              }
              onSwitch={onSwitchHandler}
            />
          ))}
        </List>
        <Text>{TypedI18n.t("idpay.initiative.configuration.footer")}</Text>
      </View>
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
    </>
  );

  return (
    <>
      <BaseScreenComponent goBack={true} headerTitle="Iniziativa">
        {content}
      </BaseScreenComponent>

      {bottomSheet}
    </>
  );
};
export default InstrumentsSelectionScreen;
