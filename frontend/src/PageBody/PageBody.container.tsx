import React from "react";
import PageBody from "./PageBody.component";
import { PageBodyProps } from "./types";

const PageBodyContainer: React.FC<PageBodyProps> = (props) => (
  <PageBody {...props} />
);

export default PageBodyContainer;
