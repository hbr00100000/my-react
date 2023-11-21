// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
import { createRoot } from "./react-dom";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

const element = <div><span>hello world</span>123</div>

console.log("element",element);

const root = createRoot(document.getElementById("root"))
console.log(root)

root.render(element);