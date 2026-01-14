import PoweredBy from "./PoweredBy";

function Footer() {
  return (
    <footer className="w-screen bg-foreground text-secondary flex flex-col text-lg justify-around items-center">
      <PoweredBy
        text="IP address data powered by "
        by="IPLocate.io"
        link="https://iplocate.io"
      />
      <p className="text-center mb-4">
        Private Demo Project. Not a commercial service.
        <br/>Created for portfolio purposes.
      </p>
    </footer>
  );
}

export default Footer;
