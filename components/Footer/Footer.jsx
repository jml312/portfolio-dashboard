import {
  Container,
  Group,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { HiMail } from "react-icons/hi";
import { FaLinkedinIn, FaGithubAlt } from "react-icons/fa";
import { GoBook } from "react-icons/go";
import { AiOutlineHome } from "react-icons/ai";
import Logo from "components/Logo";
import { useMediaQuery } from "@mantine/hooks";

export default function Footer() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const links = [
    {
      name: "joshlevy.io",
      href: "https://www.joshlevy.io",
      Icon: AiOutlineHome,
    },
    {
      name: "Blog",
      href: "https://www.joshlevy.io/blog",
      Icon: GoBook,
    },
    {
      name: "Email",
      href: "mailto:me@joshlevy.io",
      Icon: HiMail,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/jml312",
      Icon: FaLinkedinIn,
    },
    {
      name: "GitHub",
      href: "https://github.com/jml312",
      Icon: FaGithubAlt,
    },
  ];
  const isSmall = useMediaQuery("(max-width: 575px)");
  return (
    <Group
      sx={{
        borderTop: `1px solid ${dark ? "rgb(44, 46, 51)" : "#e9ecef"}`,
        padding: "1rem 0 1rem 0",
        marginTop: "2rem",
      }}
      grow
      position="apart"
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            marginRight: !isSmall ? "10rem" : "4rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: ".75rem",
          }}
        >
          <Logo dark={dark} />
          dashboard
        </div>
        <Group
          sx={{
            marginLeft: !isSmall ? "11rem" : "4rem",
          }}
          position="center"
        >
          {links.map(({ name, href, Icon }) => (
            <ActionIcon
              key={name}
              href={href}
              variant="transparent"
              size={18}
              title={name}
              component="a"
              target="_blank"
            >
              <Icon />
            </ActionIcon>
          ))}
        </Group>
      </Container>
    </Group>
  );
}
