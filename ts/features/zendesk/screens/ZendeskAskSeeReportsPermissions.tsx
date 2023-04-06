import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import CardIcon from "../../../../img/assistance/card.svg";
import EmailIcon from "../../../../img/assistance/email.svg";
import NameSurnameIcon from "../../../../img/assistance/nameSurname.svg";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { Link } from "../../../components/core/typography/Link";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { zendeskPrivacyUrl } from "../../../config";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { showToast } from "../../../utils/showToast";
import { openWebUrl } from "../../../utils/url";
import ZendeskItemPermissionComponent, {
  ItemPermissionProps
} from "../components/ZendeskItemPermissionComponent";
import { ZendeskParamsList } from "../navigation/params";

export type ZendeskAskSeeReportsPermissionsNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
};

type ItemProps = {
  fiscalCode?: string;
  nameSurname?: string;
  email?: string;
};

const iconProps = { width: 24, height: 24 };

const getItems = (props: ItemProps): ReadonlyArray<ItemPermissionProps> => [
  {
    id: "profileNameSurname",
    icon: <NameSurnameIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.nameSurname"),
    value: props.nameSurname,
    testId: "profileNameSurname"
  },
  {
    id: "profileFiscalCode",
    icon: <CardIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.fiscalCode"),
    value: props.fiscalCode,
    testId: "profileFiscalCode"
  },
  {
    id: "profileEmail",
    icon: <EmailIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.emailAddress"),
    value: props.email,
    testId: "profileEmail"
  }
];

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_ASK_SEE_REPORTS_PERMISSIONS"
>;

/**
 * this screen shows the kinds of data the app could collect when a user is looking at the previous ticket only for the authenticated users
 * @constructor
 */
const ZendeskAskSeeReportsPermissions = (props: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const { assistanceForPayment, assistanceForCard } = props.route.params;
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const nameSurname = useIOSelector(profileNameSurnameSelector);
  const email = pipe(
    useIOSelector(profileEmailSelector),
    O.fold(
      () => undefined,
      e => e
    )
  );

  const itemsProps: ItemProps = {
    fiscalCode,
    nameSurname,
    email
  };

  const items = getItems(itemsProps)
    // remove these item whose have no value associated
    .filter(it => it.value);

  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: () => {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_SEE_REPORTS_ROUTERS",
        params: { assistanceForPayment, assistanceForCard }
      });
    },
    title: I18n.t("support.askPermissions.cta.allow")
  };

  return (
    <BaseScreenComponent
      showChat={false}
      goBack={true}
      headerTitle={I18n.t("support.askPermissions.listTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskAskPermissions"}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <H1>{I18n.t("support.askPermissions.title")}</H1>
            <VSpacer size={16} />
            <H4 weight={"Regular"}>
              {I18n.t("support.askPermissions.listBody")}
            </H4>
            <VSpacer size={4} />
            <Link
              onPress={() => {
                openWebUrl(zendeskPrivacyUrl, () =>
                  showToast(I18n.t("global.jserror.title"))
                );
              }}
            >
              {I18n.t("support.askPermissions.privacyLink")}
            </Link>
            <VSpacer size={8} />
            <H3>{I18n.t("support.askPermissions.listHeader")}</H3>

            {items.map((item, idx) => (
              <ZendeskItemPermissionComponent
                key={`permission_item_${idx}`}
                {...item}
              />
            ))}
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskAskSeeReportsPermissions;
