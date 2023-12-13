import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import hasOwnProperty from "shared/hasOwnProperty";

// 保留属性 react自用的
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 *
 * @param {*} type 类型
 * @param {*} config 配置 children
 * @param {*} maybeKey key
 * @param {*} source
 * @param {*} self
 */
export function jsxDEV(type, config, maybeKey, source, self) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;

  if (maybeKey !== undefined) {
    key = "" + maybeKey;
  }

  if (hasValidKey(config)) {
    key = "" + config.key;
  }

  if (hasValidRef(config)) {
    ref = config.ref;
  }

  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  // element
  return ReactElement(type, key, ref, props);
}

/**
 * 验证key不为undefined
 * @param {*} config
 * @returns
 */
function hasValidKey(config) {
  return config.key !== undefined;
}

/**
 * 验证ref不为undefined
 * @param {*} config
 * @returns
 */
function hasValidRef(config) {
  return config.ref !== undefined;
}

// 有人叫做jsx对象，也有叫做react element的
function ReactElement(type, key, ref, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type,
    key,
    ref,
    props,
  };

  return element;
}
