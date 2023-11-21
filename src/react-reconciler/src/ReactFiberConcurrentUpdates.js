import { HostRoot } from "./ReactRootTags";

const concurrentQueues = [];
let concurrentQueuesIndex = 0;

export function unsafe_markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
  const root = getRootForUpdatedFiber(sourceFiber);
  return root;
}

export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  const concurrentQueue = queue;
  const concurrentUpdate = update;
  // 入队 保存在 concurrentQueues 数组中
  enqueueUpdate(fiber, concurrentQueue, concurrentUpdate, lane);
  // 返回 root
  return getRootForUpdatedFiber(fiber);
}

function enqueueUpdate(fiber, queue, update, lane) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
}

// 向上找到根节点
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  return node.tag === HostRoot ? node.stateNode : null;
}
