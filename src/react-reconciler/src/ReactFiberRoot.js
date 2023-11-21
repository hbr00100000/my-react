import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue";

/**
 * 创建rootFiber和fiberRoot对象，然后两者关联，这就是两棵树了,然后初始化了更新队列
 * @param {*} containerInfo
 * @param {*} tag
 * @returns
 */
export function createFiberRoot(containerInfo, tag) {
  // FiberRoot
  const root = new FiberRootNode(containerInfo, tag);
  // rootFiber fiber对象
  const uninitializedFiber = createHostRootFiber(tag);
  // 相关关联
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  // 初始化更新队列 给fiber增加属性
  initializeUpdateQueue(uninitializedFiber);

  return root;
}

/**
 * fiberRoot，暂时记录了tag、传入的真实dom信息以及另外一颗树的地址
 */
class FiberRootNode {
  constructor(containerInfo, tag) {
    this.tag = tag;
    this.containerInfo = containerInfo;
    this.current = null;
  }
}
