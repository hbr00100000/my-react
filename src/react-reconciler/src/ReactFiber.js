import { ConcurrentMode } from "./ReactTypeOfMode";
import { HostRoot } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

/**
 * 创建fiber，只是这个fiber的tag是HostRoot
 * @param {*} tag
 * @returns
 */
export function createHostRootFiber(tag) {
  let mode = ConcurrentMode;
  return createFiber(HostRoot, null, null, mode);
}

/**
 * 返回一个FiberNode的实例
 * @param {*} tag
 * @param {*} pendingProps
 * @param {*} key
 * @param {*} mode
 * @returns
 */
function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}

/**
 * fiber
 */
class FiberNode {
  constructor(tag, pendingProps, key, mode) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;

    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.updateQueue = null;

    this.mode = mode;

    // Effects
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.deletions = null;

    // 双缓存模型
    this.alternate = null;
  }
}
