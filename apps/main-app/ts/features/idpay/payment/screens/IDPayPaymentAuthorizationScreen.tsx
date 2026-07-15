import {
  Divider,
  H3,
  H6,
  IOSkeleton,
  ListItemInfo,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useEffect } from "react";
import { View } from "react-native";

import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { identificationRequest } from "../../../identification/store/actions";
import { isLoadingSelector } from "../../common/machine/selectors";
import {
  formatDateOrDefault,
  formatNumberCurrencyCents,
  formatNumberCurrencyCentsOrDefault
} from "../../common/utils/strings";
import {
  trackIDPayDetailAuthorizationCancel,
  trackIDPayDetailAuthorizationConversion,
  trackIDPayDetailAuthorizationSummary
} from "../../details/analytics";
import { IdPayPaymentMachineContext } from "../machine/provider";
import {
  areButtonsDisabledSelector,
  dataEntrySelector,
  isAuthorizingSelector,
  transactionDataSelector
} from "../machine/selectors";
import { IdPayPaymentParamsList } from "../navigation/params";

export type IDPayPaymentAuthorizationScreenRouteParams = {
  data_entry?: "manual" | "qr_code";
  trxCode?: string;
};

type IDPayPaymentAuthorizationRouteProps = RouteProp<
  IdPayPaymentParamsList,
  "IDPAY_PAYMENT_AUTHORIZATION"
>;

const IDPayPaymentAuthorizationScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const { params } = useRoute<IDPayPaymentAuthorizationRouteProps>();
  const machine = useActorRef();
  const dispatch = useIODispatch();

  useEffect(() => {
    pipe(
      params.trxCode,
      O.fromNullable,
      O.map(code =>
        machine.send({
          type: "authorize-payment",
          trxCode: code,
          data_entry: params.data_entry
        })
      )
    );
  }, [params, machine]);

  const transactionData = useSelector(transactionDataSelector);
  const isLoading = useSelector(isLoadingSelector);
  const isAuthorizing = useSelector(isAuthorizingSelector);
  const areButtonsDisabled = useSelector(areButtonsDisabledSelector);
  const showSkeletons = isLoading && !transactionData;
  const data_entry = useSelector(dataEntrySelector);

  const handleCancel = () => {
    if (areButtonsDisabled) {
      return;
    }
    if (O.isSome(transactionData)) {
      trackIDPayDetailAuthorizationCancel({
        initiativeId: transactionData?.value.initiativeId,
        initiativeName: transactionData?.value.initiativeName,
        data_entry
      });
    }
    machine.send({ type: "close" });
  };

  const handleConfirm = () => {
    if (areButtonsDisabled) {
      return;
    }
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => {
            if (O.isSome(transactionData)) {
              trackIDPayDetailAuthorizationConversion({
                initiativeId: transactionData.value.initiativeId,
                initiativeName: transactionData.value.initiativeName,
                data_entry
              });
            }
            machine.send({ type: "next" });
          }
        }
      )
    );
  };

  // get the name of the previous screen to track the entry point
  useOnFirstRender(() => {
    if (O.isSome(transactionData) && !showSkeletons) {
      trackIDPayDetailAuthorizationSummary({
        initiativeId: transactionData.value.initiativeId,
        initiativeName: transactionData.value.initiativeName,
        data_entry
      });
    }
  });

  const renderContent = () => {
    if (O.isSome(transactionData) && !showSkeletons) {
      return <AuthorizationScreenContent data={transactionData.value} />;
    }
    return <AuthorizationScreenSkeleton />;
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("global.buttons.confirm"),
          onPress: handleConfirm,
          disabled: areButtonsDisabled,
          loading: isLoading || isAuthorizing
        },
        secondary: {
          label: I18n.t("idpay.payment.authorization.deny"),
          onPress: handleCancel,
          disabled: areButtonsDisabled
        }
      }}
      canGoback={false}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.payment.authorization.header")
      }}
    >
      {renderContent()}
    </IOScrollViewWithLargeHeader>
  );
};

const AuthorizationScreenContent = ({
  data
}: {
  data: AuthPaymentResponseDTO;
}) => {
  const theme = useIOTheme();
  return (
    <>
      <VSpacer size={16} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <H6 color={theme["textBody-tertiary"]}>
            {I18n.t("idpay.payment.authorization.discountedAmount")}
          </H6>
          <H3>{formatNumberCurrencyCentsOrDefault(data.rewardCents)}</H3>
        </View>
      </View>
      <VSpacer size={16} />
      <Divider />
      <ListItemInfo
        accessibilityLabel={I18n.t("idpay.payment.authorization.amount")}
        label={I18n.t("idpay.payment.authorization.amount")}
        value={formatNumberCurrencyCents(data.amountCents)}
      />
      <Divider />
      <ListItemInfo
        accessibilityLabel={I18n.t("idpay.payment.authorization.businessName")}
        label={I18n.t("idpay.payment.authorization.businessName")}
        value={data.businessName || "-"}
      />
      <Divider />
      <ListItemInfo
        accessibilityLabel={I18n.t("idpay.payment.authorization.dateTime")}
        label={I18n.t("idpay.payment.authorization.dateTime")}
        value={formatDateOrDefault(data.trxDate)}
      />
      <Divider />
      <ListItemInfo
        accessibilityLabel={I18n.t(
          "idpay.payment.authorization.initiativeName"
        )}
        label={I18n.t("idpay.payment.authorization.initiativeName")}
        value={data.initiativeName || "-"}
      />
    </>
  );
};

const SmallSkeleton = () => (
  <IOSkeleton height={24} radius={8} shape="rectangle" width={178} />
);

const AuthorizationScreenSkeleton = () => (
  <>
    <VSpacer size={16} />
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <IOSkeleton height={29} radius={8} shape="rectangle" width={82} />
      <IOSkeleton height={29} radius={8} shape="rectangle" width={130} />
    </View>
    <VSpacer size={16} />
    <Divider />
    <ListItemInfo
      accessibilityLabel={I18n.t("idpay.payment.authorization.amount")}
      label={I18n.t("idpay.payment.authorization.amount")}
      value={<SmallSkeleton />}
    />
    <Divider />
    <ListItemInfo
      accessibilityLabel={I18n.t("idpay.payment.authorization.businessName")}
      label={I18n.t("idpay.payment.authorization.businessName")}
      value={<SmallSkeleton />}
    />
    <Divider />
    <ListItemInfo
      accessibilityLabel={I18n.t("idpay.payment.authorization.dateTime")}
      label={I18n.t("idpay.payment.authorization.dateTime")}
      value={<SmallSkeleton />}
    />
    <Divider />
    <ListItemInfo
      accessibilityLabel={I18n.t("idpay.payment.authorization.initiativeName")}
      label={I18n.t("idpay.payment.authorization.initiativeName")}
      value={<SmallSkeleton />}
    />
  </>
);

export { IDPayPaymentAuthorizationScreen };
