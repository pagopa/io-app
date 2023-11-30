import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, View } from "react-native";
import {
  Icon,
  Divider,
  HSpacer,
  VSpacer,
  ContentWrapper,
  ListItemInfo,
  H6
} from "@pagopa/io-app-design-system";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { H1 } from "../../../../components/core/typography/H1";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { Skeleton } from "../../common/components/Skeleton";
import {
  formatDateOrDefault,
  formatNumberCurrencyCents,
  formatNumberCurrencyCentsOrDefault
} from "../../common/utils/strings";
import { IDPayPaymentParamsList } from "../navigation/navigator";
import { usePaymentMachineService } from "../xstate/provider";
import {
  selectIsAuthorizing,
  selectIsCancelling,
  selectIsPreAuthorizing,
  selectTransactionData
} from "../xstate/selectors";
import { useIODispatch } from "../../../../store/hooks";
import { identificationRequest } from "../../../../store/actions/identification";

export type IDPayPaymentAuthorizationScreenRouteParams = {
  trxCode?: string;
};

type IDPayPaymentAuthorizationRouteProps = RouteProp<
  IDPayPaymentParamsList,
  "IDPAY_PAYMENT_AUTHORIZATION"
>;

const IDPayPaymentAuthorizationScreen = () => {
  const route = useRoute<IDPayPaymentAuthorizationRouteProps>();

  const machine = usePaymentMachineService();
  const dispatch = useIODispatch();

  const transactionData = useSelector(machine, selectTransactionData);

  const { trxCode } = route.params;

  React.useEffect(() => {
    pipe(
      trxCode,
      O.fromNullable,
      O.map(code =>
        machine.send({ type: "START_AUTHORIZATION", trxCode: code })
      )
    );
  }, [trxCode, machine]);

  // Loading state for screen content
  const isLoading = useSelector(machine, selectIsPreAuthorizing);
  // Loading state for "Confirm" button
  const isAuthorizing = useSelector(machine, selectIsAuthorizing);
  const isCancelling = useSelector(machine, selectIsCancelling);
  const isUpserting = isAuthorizing || isCancelling;

  const handleCancel = () => {
    machine.send("CANCEL_AUTHORIZATION");
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
          onSuccess: () => machine.send("CONFIRM_AUTHORIZATION")
        }
      )
    );
  };

  const renderContent = () => {
    if (!isLoading && transactionData !== undefined) {
      return <AuthorizationScreenContent data={transactionData} />;
    }
    return <AuthorizationScreenSkeleton />;
  };

  return (
    <BaseScreenComponent
      headerTitle="Autorizza operazione"
      contextualHelp={emptyContextualHelp}
      goBack={false}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.flex}>
          <ContentWrapper>
            <H1>{I18n.t("idpay.payment.authorization.header")}</H1>
            <VSpacer size={24} />
            {renderContent()}
          </ContentWrapper>
        </View>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={{
            title: isCancelling ? "" : I18n.t("global.buttons.deny"),
            bordered: true,
            onPress: handleCancel,
            isLoading: isCancelling,
            disabled: isUpserting || isLoading
          }}
          rightButton={{
            title: isAuthorizing ? "" : I18n.t("global.buttons.confirm"),
            onPress: handleConfirm,
            isLoading: isAuthorizing,
            disabled: isUpserting || isLoading
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
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
      <H1>{formatNumberCurrencyCentsOrDefault(data.reward)}</H1>
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
      <H3
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
      </H3>
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
      value={formatNumberCurrencyCentsOrDefault(data.residualBudget)}
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
      <H3
        color="bluegrey"
        style={{
          // see previous comment
          paddingTop: 4
        }}
      >
        {I18n.t("idpay.payment.authorization.infoDivider")}
      </H3>
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
