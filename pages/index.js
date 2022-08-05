import { verify } from "jsonwebtoken";
import { parse } from "cookie";
import Navbar from "components/Navbar";
import Analytics from "components/Analytics";
import Submissions from "components/Submissions";
import Services from "components/Services";
import { Container, Group, Button, useMantineColorScheme } from "@mantine/core";
import { ExternalLink } from "tabler-icons-react";
import { getData } from "utils/getData";
import { useState, useRef } from "react";
import { NextSeo } from "next-seo";
import SEO from "seo";

const quickLinks = [
  {
    name: "Website",
    href: "https://joshlevy.io",
  },
  {
    name: "Vercel",
    href: "https://vercel.com/jml312/portfolio",
  },
  {
    name: "Sanity",
    href: "https://joshlevyio.sanity.studio/desk",
  },
  {
    name: "Github",
    href: "https://github.com/jml312/portfolio",
  },
];

export default function Home({ isAuthenticated, pageData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
  const [data, setData] = useState(pageData);
  const analyticsRef = useRef();
  const submissionsRef = useRef();
  const servicesRef = useRef();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  return (
    <>
      <NextSeo {...SEO} />
      <Container fluid>
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setData={setData}
          analyticsRef={analyticsRef}
          submissionsRef={submissionsRef}
          servicesRef={servicesRef}
          dark={dark}
          toggleColorScheme={toggleColorScheme}
        />
        <Container size={1200} px={0} my="xl" mb={5}>
          <Container fluid sx={{ margin: "5.5rem 0 -.25rem 0" }}>
            <Group spacing="lg">
              {quickLinks.map(({ name, href }) => (
                <Button
                  component="a"
                  href={href}
                  key={name}
                  variant="outline"
                  target="_blank"
                  leftIcon={<ExternalLink size={14} />}
                >
                  {name}
                </Button>
              ))}
            </Group>
          </Container>
          <Analytics
            analytics={data.analytics}
            isLoggedIn={isLoggedIn}
            analyticsRef={analyticsRef}
            dark={dark}
          />
          <Submissions
            submissions={data.submissions}
            isLoggedIn={isLoggedIn}
            submissionsRef={submissionsRef}
          />
          <Services
            isLoggedIn={isLoggedIn}
            services={data.services}
            servicesRef={servicesRef}
          />
        </Container>
      </Container>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const token = parse(req?.headers?.cookie || "")?.token;
  const isAuthenticated = token
    ? !!verify(token, process.env.JWT_SECRET)
    : false;

  return {
    props: {
      isAuthenticated,
      pageData: await getData(isAuthenticated),
    },
  };
}
