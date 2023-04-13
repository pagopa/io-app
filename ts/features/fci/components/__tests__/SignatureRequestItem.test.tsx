import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";
import { createRandomSignatureRequest } from "../../types/__mocks__/SignaturesList.mock";
import SignatureRequestItem from "../SignatureRequestItem";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";

type Props = {
  item: SignatureRequestListView;
  onPress: () => void;
};

describe("Test SignatureRequestItem component", () => {
  it("should render a SignatureRequestItem component with props correctly", () => {
    const props = {
      item: createRandomSignatureRequest(),
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a SignatureRequestItem component with right title 'mockedDossierTitle'", () => {
    const props = {
      item: createRandomSignatureRequest(),
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("mockedDossierTitle")).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with signed label", () => {
    const item = createRandomSignatureRequest();
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
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with notAvailable label", () => {
    const item = createRandomSignatureRequest();
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
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
  });
  it("should render a SignatureRequestItem component with inProgress label", () => {
    const item = createRandomSignatureRequest();
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
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
  });

  it("should render a SignatureRequestItem component and clickable", () => {
    const props = {
      item: createRandomSignatureRequest(),
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
