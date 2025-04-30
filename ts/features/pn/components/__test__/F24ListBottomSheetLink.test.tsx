import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { F24ListBottomSheetLink } from "../F24ListBottomSheetLink";
import { UIMessageId } from "../../../messages/types";
import { ThirdPartyAttachment } from "../../../../../definitions/communications/ThirdPartyAttachment";

const numberToThirdPartyAttachment = (index: number) =>
  ({
    id: `${index}`,
    url: `https://domain.url/doc${index}.pdf`
  } as ThirdPartyAttachment);

describe("F24ListBottomSheetLink", () => {
  it("should be snapshot for an 0 items F24 list", () => {
    const zeroF24List = [] as ReadonlyArray<ThirdPartyAttachment>;
    const component = renderComponent(zeroF24List);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should be snapshot for an 1 item F24 list", () => {
    const oneF24List = [...Array(1).keys()].map(numberToThirdPartyAttachment);
    const component = renderComponent(oneF24List);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should be snapshot for a 10 items F24 list", () => {
    const oneF24List = [...Array(10).keys()].map(numberToThirdPartyAttachment);
    const component = renderComponent(oneF24List);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (f24List: ReadonlyArray<ThirdPartyAttachment>) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <F24ListBottomSheetLink
        f24List={f24List}
        messageId={"01HS94671EXDWDESDJB3NCBYPM" as UIMessageId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
