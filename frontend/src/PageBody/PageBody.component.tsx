import React from "react";
import { Box } from "grommet";
import { PageBodyProps } from "./types";

import Navbar from "Sidebar";

const PageBody: React.FC<PageBodyProps> = ({ navbar }) => (
  <>
    <Box fill>
      <Box direction="row" flex overflow={{ horizontal: "hidden" }}>
        <Box flex align="center" justify="center">
          app body
        </Box>
        <Navbar {...navbar} />
      </Box>
    </Box>
  </>
);

export default PageBody;
