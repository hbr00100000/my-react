import { allowConcurrentByDefault } from "shared/ReactFeatureFlags";
import { ConcurrentRoot } from "react-reconciler/src/ReactRootTags";
import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/ReactFiberReconciler";

/**
 * 看见这个参数熟悉不，恭喜你，来到最终关卡了，不容易啊，tnngx
 * @param {*} container
 * @param {*} options
 */
export const createRoot = (container, options) => {
  // 像是控制并发之类的开关，视频说是和并发模式有关的
  let concurrentUpdatesByDefaultOverride = false;
  // unstable：不稳定的
  if (options !== null && options !== undefined) {
    if (
      allowConcurrentByDefault &&
      options.unstable_concurrentUpdatesByDefault === true
    ) {
      concurrentUpdatesByDefaultOverride = true;
    }
  }

  // 嘎嘎重要的方法createContainer
  const root = createContainer(container, ConcurrentRoot);

  return new ReactDOMRoot(root);
};

// 这个就是整个React项目中的root了
class ReactDOMRoot {
  constructor(internalRoot) {
    this._internalRoot = internalRoot;
  }
}

// render 绑定在原型上面，这就是我们开头使用的root.render
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root);
};
