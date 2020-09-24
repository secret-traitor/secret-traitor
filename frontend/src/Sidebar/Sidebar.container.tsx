import React from "react";

import Sidebar from "./Sidebar.component";

import { SidebarProps } from "./types";

const SidebarContainer: React.FC<SidebarProps> = (props) => (
  <Sidebar {...props} />
);

export default SidebarContainer;
