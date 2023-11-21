import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";
import { createFiberRoot } from "./ReactFiberRoot";

/**
 * 将传入的真实dom信息转换成fiberRoot和rootFiber,创建一个容器
 * @param {*} containerInfo
 * @param {*} tag
 * @returns
 */
export const createContainer = (containerInfo, tag) => {
  const initialChildren = null;
  return createFiberRoot(containerInfo, tag, initialChildren);
};

/**
 *
 * @param {*} element // render(element)
 * @param {*} container // fiberRoot
 */
export function updateContainer(element, container) {
  // rootFiber
  const current = container.current;
  // 1. 创建更新
  const update = createUpdate();
  // element: 虚拟dom节点
  update.payload = { element };
  // 2. 入更新队列 返回跟节点
  const root = enqueueUpdate(current, update);
  // 3. 开始调度
  if (root !== null) {
    scheduleUpdateOnFiber(root, current);
  }
}
