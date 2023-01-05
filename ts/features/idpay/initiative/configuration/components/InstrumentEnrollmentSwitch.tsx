import { Badge, ListItem, View } from "native-base";
import { default as React } from "react";
import { StyleSheet } from "react-native";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import Switch from "../../../../../components/ui/Switch";
import I18n from "../../../../../i18n";
import { Wallet } from "../../../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { instrumentStatusLabels } from "../../../common/labels";
import { useConfigurationMachineService } from "../xstate/provider";

type InstrumentEnrollmentSwitchProps = {
  instrument: Wallet;
  status: InstrumentDTO["status"];
  isDisabled?: boolean;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = (props: InstrumentEnrollmentSwitchProps) => {
  const configurationMachine = useConfigurationMachineService();

  const { instrument, status, isDisabled } = props;

  const [switchStatus, setSwitchStatus] = React.useState(
    status === StatusEnum.ACTIVE
  );

  const sendEnrollInstrument = (): void => {
    configurationMachine.send("ENROLL_INSTRUMENT", {
      instrumentId: instrument.idWallet
    });
  };

  const sendDeleteInstrument = (): void => {
    configurationMachine.send("DELETE_INSTRUMENT", {
      instrumentId: instrument.idWallet
    });
  };

  const enrollmentBottomSheetModal = useIOBottomSheetModal(
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
          sendEnrollInstrument();
          enrollmentBottomSheetModal.dismiss();
        },
        block: true,
        bordered: false,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonActivate"
        )
      }}
      leftButton={{
        onPress: () => {
          setSwitchStatus(false);
          enrollmentBottomSheetModal.dismiss();
        },
        block: true,
        bordered: true,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonCancel"
        )
      }}
    />
  );

  const handleSwitch = () => {
    if (switchStatus) {
      sendDeleteInstrument();
    } else {
      setSwitchStatus(true);
      enrollmentBottomSheetModal.present();
    }
  };

  const renderControl = () => {
    if (
      status === StatusEnum.PENDING_ENROLLMENT_REQUEST ||
      status === StatusEnum.PENDING_DEACTIVATION_REQUEST
    ) {
      return (
        <Badge style={styles.badge}>
          <LabelSmall color="white">
            {instrumentStatusLabels[status]}
          </LabelSmall>
        </Badge>
      );
    }

    return (
      <Switch
        value={switchStatus}
        onChange={handleSwitch}
        disabled={isDisabled}
      />
    );
  };

  return (
    <>
      <ListItem>
        <View style={styles.listItemContainer}>
          <H4>{instrument.idWallet}</H4>
          {renderControl()}
        </View>
      </ListItem>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};

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

export { InstrumentEnrollmentSwitch };
