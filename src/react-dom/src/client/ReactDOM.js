import { createRoot as createRootImpl } from "./ReactDOMRoot";

const createRoot = (container, options) => {
  return createRootImpl(container, options);
};

export { createRoot };
