import React, { useState } from "react";
import { Grommet, ResponsiveContext } from "grommet";

import Header from "Header";
import PageBody from "PageBody";

import "./App.css";

const theme = {
  global: {
    colors: {
      brand: "#228BE6",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

const App = () => {
  const [showNavbar, setShowNavbar] = useState<boolean>(false);
  const toggleNavbar = () => setShowNavbar(!showNavbar);
  return (
    <Grommet theme={theme} full>
      <ResponsiveContext.Consumer>
        {(size) => (
          <>
            <Header
              size={size}
              navbar={{
                toggle: toggleNavbar,
              }}
            />
            <PageBody
              size={size}
              navbar={{
                size,
                hidden: !showNavbar,
                toggle: toggleNavbar,
              }}
            />
          </>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
};

export default App;
