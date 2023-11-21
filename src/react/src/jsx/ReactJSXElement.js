import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import hasOwnProperty from "shared/hasOwnProperty";

// react自己的保留属性
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

const jsxDEV = (type, config, maybeKey) => {
  let propName;
  const props = {};
  let key = null;
  let ref = null;

  //? 暂时不知道maybeKey是干什么用的，也不知道代表那一块
  // 判断作用域里面将数值转成了string类型
  if (maybeKey !== undefined) {
    key = "" + maybeKey;
  }

  // 判断作用域里面将数值转成了string类型
  if (hasValidKey(config)) {
    key = "" + config.key;
  }

  // 将config中的ref拿了出来赋值
  if (hasValidRef(config)) {
    ref = config.ref;
  }

  // 抽离react自己的保留字，将其他的属性赋值给props
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  //? 不知道type中defaultProps是干什么的
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, props);
};

// 校验key是否为undefined
const hasValidKey = (config) => {
  return config.key !== undefined;
};

// ref
const hasValidRef = (config) => {
  return config.ref !== undefined;
};

class ReactElement {
  constructor(type, key, ref, props) {
    (this.$$typeof = REACT_ELEMENT_TYPE),
      (this.type = type),
      (this.key = key),
      (this.ref = ref),
      (this.props = props);
  }
}
