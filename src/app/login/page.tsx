import Home from "@/components/mf/login/home";
import LoginFormCardContainer from "@/components/mf/login/LoginFormCard";

export default function HomePage() {
  return (
    <>
      <Home
        InfoText="Simplifying Compliance for Digital Brands Our creative and content compliance solution, Tickr provides automated compliance regulation across creative and content to reduce errors and maximize efficiency with brand-compliant creative assets."
        logoSize="w-52"
        logoUrl="https://infringementportalcontent.mfilterit.com/images/media/logos/mfilterit-white-logo.png"
      >
        <LoginFormCardContainer />
      </Home>
    </>
  );
}
