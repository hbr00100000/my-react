// import React from 'react'
// import ReactDOM from "react-dom/client";
// import App from './App.jsx'
// import './index.css'
import { createRoot } from "./react-dom";
import { element_jsx, element_self } from "./sharing-session/element";

const rootDomNode = document.getElementById("root");
// concurrent模式
const root = createRoot(rootDomNode);
console.log(root);
console.log("element_jsx", element_jsx);
console.log("element_self", element_self);
// console.dir(rootDomNode);
// console.log("root", root);

// root.render(element_jsx);

// legacy模式
// ReactDOM.createRoot(document.getElementById("root")).render(element_jsx);
