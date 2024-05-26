import { frameYieldMs } from "./SchedulerFeatureFlags";
import { NormalPriority } from "./SchedulerPriorities";
let taskIdCounter = 1;
let taskQueue = [];
let timerQueue = [];
let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;
let isPerformingWork = false;
let taskTimeoutID = -1;
let isMessageLoopRunning = false;
let startTime = -1;
var currentTask = null;
var currentPriorityLevel = NormalPriority;
let frameInterval = frameYieldMs;

const scheduleCallback = (priorityLevel, callback, options) => {
  /*
  1. 生成一个新的任务，将它入列
  2. 新的任务要有一些属性，分别是一下几点：
    2.1 优先级
    2.2 开始时间
    2.3 过期时间
    2.4 要进行的操作（callback）
    2.5 id
    2.6 sortIndex
  3. 根据时间来计算进入哪个队列
  */
  const currentTime = getCurrentTime();

  let startTime;
  if (typeof options === "object" && options !== null) {
    const delay = options.delay;
    if (typeof delay === "number") {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  let expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCounter++,
    priorityLevel,
    callback,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // 延时任务
    newTask.sortIndex = startTime;
    push(timerTask, newTask);
    if (taskQueue.length === 0 && peek(timerTask) === newTask) {
      if (isHostTimeoutScheduled) {
        // 打断当前任务，为了任务调度的重新分配做准备
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = newTask.expirationTime;
    push(taskQueue, newTask);
    if (!isHostCallbackScheduled && !isPerformingWork) {
      requestHostCallback();
    }
  }

  return newTask;
};

const cancelHostTimeout = () => {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = 1;
};

const handleTimeout = (currentTime) => {
  /*
    整理延时任务队列
    如果即时队列有任务，请求其中任务调度
    重新检视延时队列任务状态
  */
  isHostTimeoutScheduled = false;
  advances(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      requestHostCallback();
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTIme);
      }
    }
  }
};

const advances = (currentTime) => {
  /*
    整理延时中的任务状况
  */
  const timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      pop(timerQueue, timer);
    } else if (timer.startTime <= currentTime) {
      pop(timerQueue, timer);
      timer.sortIndex = expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue);
  }
};

const requestHostTimeout = (callback, ms) => {
  // setTimeout返回值的范围 [0,2^31 - 1]
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
};

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

const shouldYieldToHost = () => {
  const timeElapse = getCurrentTime() - startTime;
  if (timeElapse < frameInterval) {
    return false;
  }
  return true;
};

const workLoop = (initialTime) => {
  /*
  思路：
  将当前符合条件的事件不断调用的方法；
  条件要考虑到时间、callback以及continueCallback方面的因素；
  什么条件才能让事件不断调用--while (?){?};
  */
  let currentTime = initialTime;
  advances(currentTime);
  currentTask = peek(taskQueue);

  // 循环调用事件
  while (currentTask !== null) {
    // 不符合条件
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;
    }
    /*
    符合条件有哪些呢？
    callback是一个能调用的方法也就是function；
    callback()有没有返回下一个要执行的方法；
    要注意处理事情前后要做的一些事情，而不是关注调用事件本省；
    */
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null; // 标志要做的事情准备开始执行；
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback; // 不给任务出堆，因为他还有需要执行的任务；
        currentTime = getCurrentTime();
        advances(currentTime);
        return true;
      } else {
        if (peek(taskQueue) === currentTask) {
          pop(taskQueue);
        }
        advances(currentTime);
      }
    } else {
      pop(taskQueue);
    }
    currentTask = peek(taskQueue);
  }

  // 当前任务执行完成有后续任务的话不会走到这，其他情况都会走到这一流程；
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
};

const flushWork = (initialTime) => {
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  /*
  在workLoop执行任务；
  根据workLoop的返回值
  */
  const previousPriorityLevel = currentPriorityLevel;
  isPerformingWork = true;
  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
};

const performWorkUntilDeadline = () => {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    startTime = currentTime;

    /*
    根据flushWork的返回值，实际上就是workLoop的返回值来决定是否开启通道进行接下来下一循环执行任务；
    */
    let hasMoreWork = true;
    try {
      hasMoreWork = flushWork(startTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }

  needsPaint = false;
};

const schedulePerformWorkUntilDeadline = () => {
  port.postMessage(null);
};

const requestHostCallback = () => {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
};

const getCurrentTime = () => {
  return performance.now();
};
