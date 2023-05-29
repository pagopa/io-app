type E_EXIT = {
  type: "EXIT";
};

type E_BEGIN_AUTHORIZATION = {
  type: "BEGIN_AUTHORIZATION";
  transactionId: string;
};

export type Events = E_EXIT | E_BEGIN_AUTHORIZATION;
