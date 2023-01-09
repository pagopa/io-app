import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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

type InstrumentEnrollmentSwitchProps = {
  wallet: Wallet;
  status?: InstrumentDTO["status"];
  isDisabled?: boolean;
  onEnrollInstrument?: (walletId: number) => void;
  onDeleteInstrument?: (walletId: number) => void;
};

type InstrumentInfo = {
  logo: JSX.Element;
  maskedPan: string;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = (props: InstrumentEnrollmentSwitchProps) => {
  const { wallet, status, isDisabled, onEnrollInstrument, onDeleteInstrument } =
    props;

  const [switchStatus, setSwitchStatus] = React.useState(
    status === StatusEnum.ACTIVE
  );

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
          if (onEnrollInstrument) {
            onEnrollInstrument(wallet.idWallet);
          }
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

  const handleChange = () => {
    if (switchStatus) {
      if (onDeleteInstrument !== undefined) {
        onDeleteInstrument(wallet.idWallet);
      }
    } else {
      setSwitchStatus(true);
      enrollmentBottomSheetModal.present();
    }
  };

  const getPaymentMethodInfo = (wallet: Wallet): O.Option<InstrumentInfo> => {
    switch (wallet.type) {
      case "CREDIT_CARD":
        return O.some({
          logo: <View />,
          maskedPan: wallet.creditCard?.pan ?? ""
        });
      default:
        return O.none;
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
        onChange={handleChange}
        disabled={isDisabled}
      />
    );
  };

  const instrumentInfo = pipe(
    getPaymentMethodInfo(wallet),
    O.getOrElse(() => ({
      logo: <View />,
      maskedPan: ""
    }))
  );

  return (
    <>
      <ListItem>
        <View style={styles.listItemContainer}>
          <H4>{instrumentInfo.maskedPan}</H4>
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
