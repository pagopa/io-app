export type Events = AuthorizePayment | Back | Close | Next;

type AuthorizePayment = {
  readonly data_entry?: "manual" | "qr_code";
  readonly trxCode: string;
  readonly type: "authorize-payment";
};

type Back = {
  readonly type: "back";
};

type Close = {
  readonly type: "close";
};

type Next = {
  readonly type: "next";
};
