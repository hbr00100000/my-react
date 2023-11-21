import {
  enqueueConcurrentClassUpdate,
  unsafe_markUpdateLaneFromFiberToRoot,
} from "./ReactFiberConcurrentUpdates";
import { isUnsafeClassRenderPhaseUpdate } from "./ReactFiberWorkLoop";

export const UpdateState = 0;

/**
 * 创建队列queue，将queue绑定到rootFiber的updateQueue属性上
 * @param {*} fiber
 */
export function initializeUpdateQueue(fiber) {
  const queue = {
    // baseState: fiber.memoizedState,
    // firstBaseUpdate: null, // 跳过更新lanes
    // lastBaseUpdate: null,
    // 循环更新链表
    shared: {
      pending: null,
      // lanes: NoLanes,
      // hiddenCallbacks: null,
    },
    // callbacks: null,
  };
  fiber.updateQueue = queue;
}

/**
 * 创建更新队列
 * @param {*} lane
 * @returns
 */
export function createUpdate(lane) {
  const update = {
    lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  };
  return update;
}

/**
 * 更新入队列
 * @param {*} fiber // rootFiber
 * @param {*} update
 * @param {*} lane
 */
export function enqueueUpdate(fiber, update, lane) {
  // 取出初始更新队列，initializeUpdateQueue，在createContainer中进行的初始化
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) return null;
  const sharedQueue = updateQueue.shared;
  if (isUnsafeClassRenderPhaseUpdate(fiber)) {
    // 环形链表，shareQueue.pengding.next永远执行指向最新的update
    const pending = sharedQueue.pending;
    if (pending === null) {
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    sharedQueue.pending = update;

    return unsafe_markUpdateLaneFromFiberToRoot(fiber, lane);
  } else {
    return enqueueConcurrentClassUpdate(fiber, sharedQueue, update);
  }
}
