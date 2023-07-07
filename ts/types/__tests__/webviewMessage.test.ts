import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { AlertContent, WebviewMessage } from "../WebviewMessage";

const validCloseModal = {
  type: "CLOSE_MODAL"
};

const validStartLoad = {
  type: "START_LOAD"
};

const validEndLoad = {
  type: "END_LOAD"
};

const validShowSuccess1 = {
  type: "SHOW_SUCCESS",
  en: "test",
  it: "test"
};

const validShowSuccess2 = {
  type: "SHOW_SUCCESS",
  en: "test"
};

const invalidShowSuccess1 = {
  type: "SHOW_SUCCESS"
};

const invalidShowSuccess2 = {
  type: "SHOW_SUCCESS",
  en: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowSuccess3 = {
  type: "SHOW_SUCCESS",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowError1 = {
  type: "SHOW_ERROR",
  en: "test",
  it: "test"
};

const validShowError2 = {
  type: "SHOW_ERROR",
  en: "test"
};

const invalidShowError1 = {
  type: "SHOW_ERROR"
};

const invalidShowError2 = {
  type: "SHOW_ERROR",
  en: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowError3 = {
  type: "SHOW_ERROR",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowAlert1 = {
  type: "SHOW_ALERT",
  en: {
    title: "Test title",
    description: "Test description"
  },
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const validShowAlert2 = {
  type: "SHOW_ALERT",
  en: {
    title: "Test title",
    description: "Test description"
  },
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowAlert1 = {
  type: "SHOW_ALERT",
  it: {
    title: "Test title",
    description: "Test description"
  }
};

const invalidShowAlert2 = {
  type: "SHOW_ALERT",
  en: "Test title"
};

const invalidShowAlert3 = {
  type: "SHOW_ALERT"
};

const validSetTitle1 = {
  type: "SET_TITLE",
  en: "test",
  it: "test"
};

const validSetTitle2 = {
  type: "SET_TITLE",
  en: "test"
};

const invalidSetTitle1 = {
  type: "SET_TITLE"
};

const invalidSetTitle2 = {
  type: "SET_TITLE",
  en: {
    title: "Test title"
  }
};

const invalidSetTitle3 = {
  type: "SET_TITLE",
  it: {
    title: "Test title"
  }
};

const localeEN = "en";

const localeIT = "it";

describe("WebviewMessage", () => {
  it("Should recognize a valid Message for Close Modal event", () => {
    expect(E.isRight(WebviewMessage.decode(validCloseModal))).toBeTruthy();
  });

  it("Should recognize a valid Message for Start Load event", () => {
    expect(E.isRight(WebviewMessage.decode(validStartLoad))).toBeTruthy();
  });

  it("Should recognize a valid Message for End Load event", () => {
    expect(E.isRight(WebviewMessage.decode(validEndLoad))).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Success event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowSuccess1))).toBeTruthy();
    expect(
      E.isRight(t.string.decode(validShowSuccess1[localeEN]))
    ).toBeTruthy();
    expect(
      E.isRight(t.string.decode(validShowSuccess1[localeIT]))
    ).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Success event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowSuccess2))).toBeTruthy();
    expect(
      E.isRight(t.string.decode(validShowSuccess2[localeEN]))
    ).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowSuccess1))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowSuccess2))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Success event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowSuccess3))).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Error event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowError1))).toBeTruthy();
    expect(E.isRight(t.string.decode(validShowError1[localeEN]))).toBeTruthy();
    expect(E.isRight(t.string.decode(validShowError1[localeIT]))).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Error event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowError2))).toBeTruthy();
    expect(E.isRight(t.string.decode(validShowError2[localeEN]))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowError1))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowError2))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Error event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidShowError3))).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Alert event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowAlert1))).toBeTruthy();
    expect(
      E.isRight(AlertContent.decode(validShowAlert1[localeEN]))
    ).toBeTruthy();
    expect(
      E.isRight(AlertContent.decode(validShowAlert1[localeIT]))
    ).toBeTruthy();
  });

  it("Should recognize a valid Message for Show Alert event", () => {
    expect(E.isRight(WebviewMessage.decode(validShowAlert2))).toBeTruthy();
    expect(
      E.isRight(AlertContent.decode(validShowAlert1[localeEN]))
    ).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(E.isRight(WebviewMessage.decode(invalidShowAlert1))).toBeFalsy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(E.isRight(WebviewMessage.decode(invalidShowAlert2))).toBeFalsy();
  });

  it("Should NOT recognize a valid Message for Show Alert event", () => {
    expect(E.isRight(WebviewMessage.decode(invalidShowAlert3))).toBeFalsy();
  });

  it("Should recognize a valid Message for Set Title event", () => {
    expect(E.isRight(WebviewMessage.decode(validSetTitle1))).toBeTruthy();
    expect(E.isRight(t.string.decode(validSetTitle1[localeEN]))).toBeTruthy();
    expect(E.isRight(t.string.decode(validSetTitle1[localeIT]))).toBeTruthy();
  });

  it("Should recognize a valid Message for Set Title event", () => {
    expect(E.isRight(WebviewMessage.decode(validSetTitle2))).toBeTruthy();
    expect(E.isRight(t.string.decode(validSetTitle2[localeEN]))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Set Title event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidSetTitle1))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Set Title event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidSetTitle2))).toBeTruthy();
  });

  it("Should NOT recognize a valid Message for Set Title event", () => {
    expect(E.isLeft(WebviewMessage.decode(invalidSetTitle3))).toBeTruthy();
  });
});
