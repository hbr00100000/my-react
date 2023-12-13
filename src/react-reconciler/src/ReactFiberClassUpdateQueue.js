import {
  enqueueConcurrentClassUpdate,
  unsafe_markUpdateLaneFromFiberToRoot,
} from "./ReactFiberConcurrentUpdates";
import { isUnsafeClassRenderPhaseUpdate } from "./ReactFiberWorkLoop";

export const UpdateState = 0;

export function initializeUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}

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
