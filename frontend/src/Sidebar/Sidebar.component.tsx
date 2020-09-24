import React from "react";
import { SidebarProps } from "./types";
import { Box, Collapsible } from "grommet";

const Navbar: React.FC<SidebarProps> = ({ hidden }) => (
  <Collapsible direction="horizontal" open={!hidden}>
    <Box
      flex
      width="medium"
      background="light-2"
      elevation="small"
      align="center"
      justify="center"
    >
      sidebar
    </Box>
  </Collapsible>
);

export default Navbar;
