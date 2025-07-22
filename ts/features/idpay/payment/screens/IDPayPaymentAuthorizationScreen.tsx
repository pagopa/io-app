import {
  Divider,
  H3,
  H6,
  IOSkeleton,
  ListItemInfo,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../identification/store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  isLoadingPaymentSelector,
  isLoadingSelector
} from "../../common/machine/selectors";
import {
  formatDateOrDefault,
  formatNumberCurrencyCents,
  formatNumberCurrencyCentsOrDefault
} from "../../common/utils/strings";
import { IdPayPaymentMachineContext } from "../machine/provider";
import {
  isAuthorizingSelector,
  isCancellingSelector,
  transactionDataSelector
} from "../machine/selectors";
import { IdPayPaymentParamsList } from "../navigation/params";

export type IDPayPaymentAuthorizationScreenRouteParams = {
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
      O.map(code => machine.send({ type: "authorize-payment", trxCode: code }))
    );
  }, [params, machine]);

  const transactionData = useSelector(transactionDataSelector);
  const isLoading = useSelector(isLoadingSelector);
  const isLoadingPayment = useSelector(isLoadingPaymentSelector);
  const isAuthorizing = useSelector(isAuthorizingSelector);
  const isCancelling = useSelector(isCancellingSelector);
  const areButtonsDisabled =
    isLoading || isAuthorizing || isLoadingPayment || isCancelling;

  const handleCancel = () => {
    if (areButtonsDisabled) {
      return;
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
          onSuccess: () => machine.send({ type: "next" })
        }
      )
    );
  };

  const renderContent = () => {
    if (!isLoading && O.isSome(transactionData)) {
      return <AuthorizationScreenContent data={transactionData.value} />;
    }
    return <AuthorizationScreenSkeleton />;
  };

  return (
    <IOScrollViewWithLargeHeader
      canGoback={false}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("idpay.payment.authorization.header")
      }}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("global.buttons.confirm"),
          onPress: handleConfirm,
          disabled: areButtonsDisabled,
          loading: isLoading || isAuthorizing || isLoadingPayment
        },
        secondary: {
          label: I18n.t("idpay.payment.authorization.deny"),
          onPress: handleCancel,
          disabled: areButtonsDisabled
        }
      }}
      includeContentMargins
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
        label={I18n.t("idpay.payment.authorization.amount")}
        value={formatNumberCurrencyCents(data.amountCents)}
        accessibilityLabel={I18n.t("idpay.payment.authorization.amount")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.businessName")}
        value={data.businessName || "-"}
        accessibilityLabel={I18n.t("idpay.payment.authorization.businessName")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.dateTime")}
        value={formatDateOrDefault(data.trxDate)}
        accessibilityLabel={I18n.t("idpay.payment.authorization.dateTime")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.initiativeName")}
        value={data.initiativeName || "-"}
        accessibilityLabel={I18n.t(
          "idpay.payment.authorization.initiativeName"
        )}
      />
    </>
  );
};

const SmallSkeleton = () => (
  <IOSkeleton shape="rectangle" width={178} height={24} radius={8} />
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
      <IOSkeleton shape="rectangle" width={82} height={29} radius={8} />
      <IOSkeleton shape="rectangle" width={130} height={29} radius={8} />
    </View>
    <VSpacer size={16} />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.amount")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.amount")}
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.businessName")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.businessName")}
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.dateTime")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.dateTime")}
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.initiativeName")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.initiativeName")}
    />
  </>
);

export { IDPayPaymentAuthorizationScreen };
