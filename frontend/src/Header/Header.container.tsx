import React from "react";

import HeaderComponent from "./Header.component";
import { HeaderProps } from "./types";

const HeaderContainer: React.FC<HeaderProps> = (props) => (
  <HeaderComponent {...props} />
);

export default HeaderContainer;
