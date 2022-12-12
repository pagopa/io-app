import { useActor, useSelector } from "@xstate/react";
import { Badge, List, ListItem, Text, View } from "native-base";
import React, { useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import Switch from "../../../../../components/ui/Switch";
import I18n from "../../../../../i18n";
import { Wallet } from "../../../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  selectIsLoadingInstruments,
  selectIsUpsertingInstrument,
  selectorIDPayInstrumentsByIdWallet,
  selectorPagoPAIntruments
} from "../xstate/selectors";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { instrumentStatusLabels } from "../../../common/labels";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  }
});

type InstrumentEnrollmentSwitcher = {
  instrument: Wallet;
  idPayStatus: InstrumentDTO["status"];
  onSwitch: (idWallet: number) => void;
  isDisabled?: boolean;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitcher = ({
  instrument,
  idPayStatus,
  onSwitch,
  isDisabled
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
          <Switch
            value={switchStatus}
            onChange={handleSwitch}
            disabled={isDisabled}
          />
        ) : (
          <Badge style={styles.badge}>
            <LabelSmall color="white">
              {instrumentStatusLabels[idPayStatus]}
            </LabelSmall>
          </Badge>
        )}
      </View>
    </ListItem>
  );
};

const InstrumentsEnrollmentScreen = () => {
  const selectedCardRef = useRef<number | undefined>(undefined);
  const configurationMachine = useConfigurationMachineService();
  const [_state, send] = useActor(configurationMachine);

  const handleBackPress = () => {
    send({ type: "GO_BACK" });
  };

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

  const isUpserting = useSelector(
    configurationMachine,
    selectIsUpsertingInstrument
  );

  const hasSelectedInstruments =
    Object.keys(idPayInstrumentsByIdWallet).length > 0;

  const sendAddInstrument = (): void => {
    configurationMachine.send("ADD_INSTRUMENT", {
      walletId: selectedCardRef.current
    });
  };

  const handleContinueButton = () => {
    configurationMachine.send({
      type: "CONFIRM_INSTRUMENTS"
    });
  };

  const onSwitchHandler = (idWallet: number | undefined) => {
    // eslint-disable-next-line functional/immutable-data
    selectedCardRef.current = idWallet;
    present();
  };

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Body>
      {I18n.t("idpay.initiative.configuration.bottomSheet.bodyFirst")}
      <Body weight="SemiBold">
        {I18n.t("idpay.initiative.configuration.bottomSheet.bodyBold") + "\n"}
      </Body>
      {I18n.t("idpay.initiative.configuration.bottomSheet.bodyLast")}
    </Body>,

    I18n.t("idpay.initiative.configuration.bottomSheet.header"),
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
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonActivate"
        )
      }}
      leftButton={{
        onPress: () => dismiss(),
        block: true,
        bordered: true,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonCancel"
        )
      }}
    />
  );

  return (
    <>
      <BaseScreenComponent goBack={handleBackPress} headerTitle="Iniziativa">
        <LoadingSpinnerOverlay
          isLoading={isLoadingInstruments}
          loadingOpacity={1}
        >
          <View spacer />
          <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
            <H1>{I18n.t("idpay.initiative.configuration.header")}</H1>
            <View spacer small />
            <Text>
              {I18n.t("idpay.initiative.configuration.subHeader", {
                initiativeName: "18app"
              })}
            </Text>
            <View spacer />
            <ScrollView>
              <List>
                {pagoPAInstruments.map(pagoPAInstrument => (
                  <InstrumentEnrollmentSwitcher
                    key={pagoPAInstrument.idWallet}
                    instrument={pagoPAInstrument}
                    idPayStatus={
                      idPayInstrumentsByIdWallet[pagoPAInstrument.idWallet]
                        ?.status
                    }
                    onSwitch={onSwitchHandler}
                    isDisabled={isUpserting}
                  />
                ))}
              </List>
              <Text>{I18n.t("idpay.initiative.configuration.footer")}</Text>
            </ScrollView>
          </View>
          <SafeAreaView>
            <FooterWithButtons
              type="TwoButtonsInlineHalf"
              leftButton={{
                title: I18n.t(
                  "idpay.initiative.configuration.buttonFooter.noneCta"
                ),
                bordered: true,
                disabled: true
              }}
              rightButton={{
                title: I18n.t(
                  "idpay.initiative.configuration.buttonFooter.continueCta"
                ),
                disabled: isUpserting || !hasSelectedInstruments,
                onPress: handleContinueButton
              }}
            />
          </SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>

      {bottomSheet}
    </>
  );
};
export default InstrumentsEnrollmentScreen;
