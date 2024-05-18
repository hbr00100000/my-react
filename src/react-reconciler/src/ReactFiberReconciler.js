import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";
import { createFiberRoot } from "./ReactFiberRoot";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

export const createContainer = (containerInfo, tag) => {
  const initialChildren = null;
  return createFiberRoot(containerInfo, tag, initialChildren);
};

export function updateContainer(element, container) {
  // rootFiber
  const current = container.current;
  const lane = requestUpdateLane();
  // 1. 创建更新
  const update = createUpdate(element, lane);
  // element: 虚拟dom节点
  update.payload = { element };
  // 2. 入更新队列 返回跟节点
  const root = enqueueUpdate(current, update);
  // 3. 开始调度
  if (root !== null) {
    scheduleUpdateOnFiber(root, current);
  }
}
