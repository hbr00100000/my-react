let taskIdCounter = 1;
let taskQueue = []; // 最小堆
let timerQueue = []; // 最小堆
let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;
let isPerformingWork = false;
let taskTimeoutID = -1;
let isMessageLoopRunning = false;
let startTime = -1;
let currentTask = null;
let currentPriorityLevel = 3;
let frameInterval = 5;
const ImmediatePriority = 1;
const NormalPriority = 3;

function getCurrentTime() {
  return Performance.now();
}

function scheduleCallback(priorityLevel, callback, options) {
  /*
  生成一个新任务
  新任务包括
    1. id
    2. callback
    3. priorityLevel
    4. sortIndex
    5. startTime
    6. expirationTime
  根据当前任务的时间比较将新任务放入对应的队列
  */
  const currentTime = getCurrentTime();
  let startTime;
  if (options.delay) startTime = currentTime + options.delay;
  else startTime = currentTime;

  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = -1;
      break;
    case NormalPriority:
    default:
      timeout = 5000;
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

  // 查看任务是否到期，准备开始调度任务
  if (currentTime < startTime) {
    newTask.sortIndex = newTask.startTime;
    push(timerQueue, newTask);
    if (taskQueue.length === 0 && peek(timerQueue) === newTask) {
      if (isHostTimeoutScheduled) {
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      requestHostTimeout(handleTimeout, newTask.startTime - current);
    }
  } else {
    newTask.sortIndex = newTask.expirationTime;
    push(taskQueue, newTask);
    if (!isHostCallbackScheduled && !isPerformingWork) {
      requestHostCallback();
    }
  }

  return newTask;
}

function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled)
    if (peek(task) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null)
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
}

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

function advanceTimers(currentTime) {
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      pop(timerQueue);
      timer.sortIndex = expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue);
  }
}

function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    startTime = currentTime;

    let hasMoreWork = false;
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
}

function flushWork(initialTime) {
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  const previousPriorityLevel = currentPriorityLevel;
  isPerformingWork = true;
  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

function workLoop(initialTime) {
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
}
