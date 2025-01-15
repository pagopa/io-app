import {
  ContentWrapper,
  Divider,
  FooterActionsInline,
  H2,
  H6,
  HSpacer,
  Icon,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { Skeleton } from "../../common/components/Skeleton";
import { isLoadingSelector } from "../../common/machine/selectors";
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

  React.useEffect(() => {
    pipe(
      params.trxCode,
      O.fromNullable,
      O.map(code => machine.send({ type: "authorize-payment", trxCode: code }))
    );
  }, [params, machine]);

  const transactionData = useSelector(transactionDataSelector);
  const isLoading = useSelector(isLoadingSelector);
  const isAuthorizing = useSelector(isAuthorizingSelector);
  const isCancelling = useSelector(isCancellingSelector);

  const handleCancel = () => {
    machine.send({ type: "close" });
  };

  const handleConfirm = () => {
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

  useHeaderSecondLevel({
    title: "Autorizza operazione",
    canGoBack: false,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <>
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.flex}>
          <ContentWrapper>
            <H2>{I18n.t("idpay.payment.authorization.header")}</H2>
            <VSpacer size={24} />
            {renderContent()}
          </ContentWrapper>
        </View>
      </SafeAreaView>
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: isCancelling ? "" : I18n.t("global.buttons.deny"),
          onPress: handleCancel,
          disabled: isLoading
        }}
        endAction={{
          color: "primary",
          label: I18n.t("global.buttons.confirm"),
          onPress: handleConfirm,
          loading: isAuthorizing,
          disabled: isLoading
        }}
      />
    </>
  );
};

const AuthorizationScreenContent = ({
  data
}: {
  data: AuthPaymentResponseDTO;
}) => (
  <>
    <Divider />
    <VSpacer size={16} />
    <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
      <H6>{I18n.t("idpay.payment.authorization.toAuth")}</H6>
      <H2>{formatNumberCurrencyCentsOrDefault(data.rewardCents)}</H2>
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
    <VSpacer size={24} />
    {/* TODO:: will be removed in favor of LIST_GROUP_HEADING in future updates */}
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="initiatives" size={24} color="bluegrey" />
      <HSpacer size={16} />
      <H6
        color="bluegrey"
        style={{
          // this should not happen, but the current typography adds 4
          // to paddingBottom because of line height
          // so we add 4 to paddingTop to compensate, else the text would not be centered
          // (this was temporarily approved by @dmnplb)
          paddingTop: 4
        }}
      >
        {I18n.t("idpay.payment.authorization.infoDivider")}
      </H6>
    </View>
    <VSpacer size={16} />

    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.initiativeName")}
      value={data.initiativeName || "-"}
      accessibilityLabel={I18n.t("idpay.payment.authorization.initiativeName")}
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.availableAmount")}
      value={formatNumberCurrencyCentsOrDefault(data.residualBudgetCents)}
      accessibilityLabel={I18n.t("idpay.payment.authorization.availableAmount")}
    />
  </>
);

const SmallSkeleton = () => <Skeleton width={178} height={24} radius={8} />;

const AuthorizationScreenSkeleton = () => (
  <>
    <VSpacer size={16} />
    <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
      <Skeleton width={82} height={29} />
      <Skeleton width={130} height={29} />
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
    <VSpacer size={24} />
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="initiatives" size={24} color="bluegrey" />
      <HSpacer size={16} />
      <H6
        color="bluegrey"
        style={{
          // see previous comment
          paddingTop: 4
        }}
      >
        {I18n.t("idpay.payment.authorization.infoDivider")}
      </H6>
    </View>
    <VSpacer size={16} />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.initiativeName")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.initiativeName")}
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("idpay.payment.authorization.availableAmount")}
      value={<SmallSkeleton />}
      accessibilityLabel={I18n.t("idpay.payment.authorization.availableAmount")}
    />
  </>
);

export { IDPayPaymentAuthorizationScreen };
