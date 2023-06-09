import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { Divider } from "../../../../components/core/Divider";
import { Icon } from "../../../../components/core/icons";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../components/core/typography/H1";
import { H3 } from "../../../../components/core/typography/H3";
import { NewH6 } from "../../../../components/core/typography/NewH6";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ListItemInfo from "../../../../components/ui/ListItemInfo";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { Skeleton } from "../../common/components/Skeleton";
import { formatNumberCurrency } from "../../common/utils/strings";
import { IDPayPaymentParamsList } from "../navigation/navigator";
import { usePaymentMachineService } from "../xstate/provider";
import {
  selectIsAuthorizing,
  selectIsPreAuthorizing,
  selectTransactionData
} from "../xstate/selectors";

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
  const isUpserting = useSelector(machine, selectIsAuthorizing);

  const handleCancel = () => {
    machine.send("CANCEL_AUTHORIZATION");
  };

  const handleConfirm = () => {
    machine.send("CONFIRM_AUTHORIZATION");
  };

  const renderContent = () => {
    if (isLoading) {
      return <AuthorizationScreenSkeleton />;
    }
    if (transactionData !== undefined) {
      return <AuthorizationScreenContent data={transactionData} />;
    }
    // TODO:: correct navigation will be added with error mapping
    machine.send("CANCEL_AUTHORIZATION");
    return null;
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
            title: I18n.t("global.buttons.cancel"),
            bordered: true,
            onPress: handleCancel,
            disabled: isUpserting
          }}
          rightButton={{
            title: isUpserting ? "" : I18n.t("global.buttons.confirm"),
            onPress: handleConfirm,
            isLoading: isUpserting || isLoading,
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
  data: NonNullable<AuthPaymentResponseDTO>;
}) => {
  const getValueOrDash = (value: string | undefined) =>
    pipe(
      value,
      O.fromNullable,
      O.getOrElse(() => "-")
    );
  const amountCents = formatNumberCurrency(data.amountCents / 100);
  const reward = pipe(
    data.reward,
    O.fromNullable,
    O.fold(
      () => "-",
      data => formatNumberCurrency(data / 100)
    )
  );
  const businessName = getValueOrDash(data.businessName);
  const initiativeName = getValueOrDash(data.initiativeName);
  const date = pipe(
    data.trxDate,
    O.fromNullable,
    O.fold(
      () => "-",
      date => format(new Date(date), "D MMMM YYYY, HH:mm")
    )
  );
  return (
    <>
      <Divider />
      <VSpacer size={16} />
      <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
        <NewH6>{I18n.t("idpay.payment.authorization.toAuth")}</NewH6>
        <H1>{reward}</H1>
      </View>

      <VSpacer size={16} />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.amount")}
        value={amountCents}
        accessibilityLabel={I18n.t("idpay.payment.authorization.amount")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.businessName")}
        value={businessName}
        accessibilityLabel={I18n.t("idpay.payment.authorization.businessName")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.dateTime")}
        value={date}
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
        value={initiativeName}
        accessibilityLabel={I18n.t(
          "idpay.payment.authorization.initiativeName"
        )}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.payment.authorization.availableAmount")}
        value={"-"}
        accessibilityLabel={I18n.t(
          "idpay.payment.authorization.availableAmount"
        )}
      />
    </>
  );
};

const SmallSkeleton = () => <Skeleton width={178} height={16} radius={8} />;

const AuthorizationScreenSkeleton = () => (
  <>
    <Divider />
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
