import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";
import SignatureRequestItem from "../SignatureRequestItem";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";
import { DossierTitle } from "../../../../../definitions/fci/DossierTitle";

type Props = {
  item: SignatureRequestListView;
  onPress: () => void;
};

const now = new Date("2020-04-01");
const signatureRequestItem: SignatureRequestListView = {
  id: "mockedId" as SignatureRequestListView["id"],
  status: SignatureRequestStatusEnum.SIGNED,
  created_at: now as SignatureRequestListView["created_at"],
  dossier_id: "mockedDossierId" as SignatureRequestListView["dossier_id"],
  dossier_title: "mockedDossierTitle" as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  signer_id: "mockedSignerId" as SignatureRequestListView["signer_id"],
  updated_at: now
};

describe("Test SignatureRequestItem component", () => {
  it("should render a SignatureRequestItem component with props correctly", () => {
    const props = {
      item: signatureRequestItem,
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a SignatureRequestItem component with right title 'mockedDossierTitle'", () => {
    const props = {
      item: signatureRequestItem,
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("mockedDossierTitle")).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with signed label", () => {
    const item = signatureRequestItem;
    const props = {
      item: {
        ...item,
        status:
          SignatureRequestStatusEnum.SIGNED as SignatureRequestListView["status"]
      },
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("FciSignatureRequestItemBadgeSigned")
    ).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with notAvailable label", () => {
    const item = signatureRequestItem;
    const props = {
      item: {
        ...item,
        status:
          SignatureRequestStatusEnum.WAIT_FOR_QTSP as SignatureRequestListView["status"]
      },
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("FciSignatureRequestItemBadgeNotAvailable")
    ).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with inProgress label", () => {
    const item = signatureRequestItem;
    const props = {
      item: {
        ...item,
        status:
          SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE as SignatureRequestListView["status"]
      },
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("FciSignatureRequestItemBadgeInProgress")
    ).toBeTruthy();
  });

  it("should render a SignatureRequestItem component and clickable", () => {
    const props = {
      item: signatureRequestItem,
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const onTap = component.getByTestId("FciSignatureRequestOnPress");
    expect(onTap).toBeTruthy();
    fireEvent.press(onTap);
    fireEvent.press(onTap);
    expect(props.onPress).toHaveBeenCalledTimes(2);
  });
});

const renderComponent = (props: Props) =>
  render(<SignatureRequestItem {...props} />);
