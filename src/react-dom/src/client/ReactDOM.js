import { createRoot as createRootImpl } from "./ReactDOMRoot";

/**
 * 抄的我有点迷，我还以为我记忆错乱了，反复跑到client去看，结果这不就是一样的吗，这是需求变动为了妥协写的吗？引来引去的
 * @author hbr
 * @param {*} container
 * @param {*} options
 * @returns
 */
const createRoot = (container, options) => {
  return createRootImpl(container, options);
};

export { createRoot };
