import { createElement } from "../../react";

export const element_jsx = (
  <h1>
    hello<u>hbr</u>
  </h1>
);

export const element_self = createElement("h1", {
  children: [
    "hello",
    createElement("u", {
      children: "hbr",
    }),
  ],
});
