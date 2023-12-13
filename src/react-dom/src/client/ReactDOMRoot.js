import { allowConcurrentByDefault } from "shared/ReactFeatureFlags";
import { ConcurrentRoot } from "react-reconciler/src/ReactRootTags";
import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/ReactFiberReconciler";

export const createRoot = (container, options) => {
  // createContainer挺重要的，legacy和concurrent模式都会走到这边来
  const root = createContainer(container, ConcurrentRoot);
  return new ReactDOMRoot(root);
};

// 这个就是整个React项目中的开始了也就是顶层root
class ReactDOMRoot {
  constructor(internalRoot) {
    this._internalRoot = internalRoot;
  }
}

// render 绑定在原型上面
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root);
};
