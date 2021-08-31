import "cross-fetch/polyfill";
import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./plugins";

console.log("Tenant ID", process.env.REACT_APP_TENANT_ID);

const render = module.hot ? ReactDOM.render : ReactDOM.hydrate;
render(<App />, document.getElementById("root"));
