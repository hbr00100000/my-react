import { createRoot as createRootImpl } from "./";

/**
 * 后面跳转到index之后就有点迷这边，要提起精神看，后面你没看错
 * @param {*} container
 * @param {*} options
 * @returns
 */
export const createRoot = (container, options) => {
  return createRootImpl(container, options);
};
