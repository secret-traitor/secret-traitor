import React from "react";
import { Box, Button, Heading } from "grommet";
// @ts-ignore
import { Apps } from "grommet-icons";
import { HeaderProps } from "./types";
const Header: React.FC<HeaderProps> = ({ navbar }) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: 1 }}
  >
    <Heading level="3" margin="none">
      My App
    </Heading>
    <Button icon={<Apps />} onClick={navbar.toggle} />
  </Box>
);

export default Header;
