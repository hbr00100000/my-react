import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue";

export function createFiberRoot(containerInfo, tag) {
  // fiberRoot
  const root = new FiberRootNode(containerInfo, tag);
  // rootFiber
  const uninitializedFiber = createHostRootFiber(tag);
  /* 
    两者关联
    fiberRoot.current = rootFiber
    rootFiber.stateNode= fiberRoot 
  */
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  // 初始化更新队列
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
