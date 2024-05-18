// mode
const NoMode = /*                            */ 0b0000000;
const ConcurrentMode = /*                    */ 0b0000001;

// state
const UpdateState = 0;

// lane
const NoLanes = /*                           */ 0b0000000000000000000000000000000;
const SyncLane = /*                          */ 0b0000000000000000000000000000010;
const DefaultLane = /*                       */ 0b0000000000000000000000000100000;

// priority
const DefaultEventPriority = DefaultLane;

// work tags
export const HostRoot = 3;

/**
 *
 * @param {ReactElement <App />} element
 * @param {FiberRootNode} container
 * @returns
 */
const updateContainer = (element, container) => {
  const current = container.current;
  const lane = requestUpdateLane(current);

  const update = createUpdate(lane);
  update.payload = { element };

  // FiberRootNode
  const root = enqueueUpdate(current, update, lane);

  if (root !== null) {
    scheduleUpdateOnFiber(root, current, lane);
  }

  return lane;
};

/**
 *
 * @param {RootFiber} fiber
 */
const requestUpdateLane = (fiber) => {
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) === NoMode) {
    return SyncLane;
  }

  let eventLane = null;

  const currentEvent = window.event;
  if (currentEvent !== undefined) {
    eventLane = DefaultEventPriority;
  }

  eventLane = getEventPriority(currentEvent.type);
  return eventLane;
};

const getEventPriority = (domEventName) => {
  return "对应事件的priority";
};

const createUpdate = (lane) => {
  const update = {
    lane,
    tag: UpdateState,
    payload: null,
    next: null,
  };

  return update;
};

const enqueueUpdate = (fiber, update, lane) => {
  const updateQueue = fiber.updateQueue;

  const sharedQueue = updateQueue.shared;

  return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
};

const concurrentQueues = [];
let concurrentQueuesIndex = 0;
let concurrentlyUpdatedLanes = NoLanes;

const enqueueConcurrentClassUpdate = (fiber, queue, update, lane) => {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;

  concurrentlyUpdatedLanes = mergeLanes(concurrentlyUpdatedLanes, lane);

  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  let node = fiber;
  let parent = node.return;

  // 找到根节点
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  // 返回 FiberRootNode
  return node.tag === HostRoot ? node.stateNode : null;
};

const mergeLanes = (a, b) => {
  return a | b;
};

/**
 *
 * @param {FiberRootNode} root
 * @param {RootFiber} fiber
 * @param {lane} lane
 */
const scheduleUpdateOnFiber = (root, fiber, lane) => {
  markRootUpdated(root, lane);
  scheduleImmediateTask(processRootScheduleInMicrotask);
};
