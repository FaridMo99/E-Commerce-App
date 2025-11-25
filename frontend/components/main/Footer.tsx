import React from "react";
import PoweredBy from "./PoweredBy";

//add icons,links disclaimers etc.
function Footer() {
  return (
    <footer className="w-screen min-h-[10vh] bg-foreground text-secondary flex justify-center items-center">
      <PoweredBy
        text="IP address data powered by "
        by="IPLocate.io"
        link="https://iplocate.io"
      />
    </footer>
  );
}

export default Footer;
