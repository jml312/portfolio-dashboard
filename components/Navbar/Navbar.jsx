import {
  createStyles,
  Header,
  Group,
  ActionIcon,
  Button,
  Container,
  TextInput,
  Burger,
  Anchor,
  Transition,
  Paper,
  Stack,
} from "@mantine/core";
import { Sun, MoonStars } from "tabler-icons-react";
import { useModals } from "@mantine/modals";
import { useState } from "react";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useMediaQuery, useDisclosure, useClickOutside } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  dropdown: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",
    padding: "1rem",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    position: "fixed",
  },

  inner: {
    height: 56,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ".75rem",
  },
}));

function LoginContent({ isLoggedIn, setIsLoggedIn, setData, closeLoginModal }) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({ initialValues: { sitePassword: "" } });
  return (
    <Container px={0}>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={form.onSubmit(async (values) => {
          setIsLoading(true);
          try {
            const { data } = await axios.post("/api/login", values);
            setIsLoggedIn(true);
            setData(data);
            closeLoginModal();
            showNotification({
              title: "Login Successful",
              message: "You are now logged in!",
              color: "green",
            });
          } catch {
            form.setFieldError("sitePassword", "Invalid site password");
            setIsLoading(false);
          }
        })}
      >
        <TextInput
          mt={10}
          required
          placeholder="Site password"
          {...form.getInputProps("sitePassword")}
          disabled={isLoading}
          sx={{
            width: "100%",
            minWidth: "14rem",
          }}
          type="password"
        />
        {!isLoggedIn && (
          <Button
            centered
            mt={12}
            type="submit"
            loading={isLoading}
            size={"md"}
          >
            {isLoading ? "Authenticating..." : "Login"}
          </Button>
        )}
      </form>
    </Container>
  );
}

export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  setData,
  submissionsRef,
  analyticsRef,
  servicesRef,
  toggleColorScheme,
  dark,
}) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const dropdownRef = useClickOutside(() => close());
  const isSmall = useMediaQuery("(max-width: 575px)");
  const { classes } = useStyles();
  const modals = useModals();
  const openLoginModal = () => {
    const id = modals.openModal({
      title: "Enter the site password",
      centered: true,
      children: (
        <LoginContent
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setData={setData}
          closeLoginModal={() => modals.closeModal(id)}
        />
      ),
    });
  };

  const links = [
    {
      label: "Analytics",
      ref: analyticsRef,
    },
    {
      label: "Submissions",
      ref: submissionsRef,
    },
    {
      label: "Services",
      ref: servicesRef,
    },
  ];

  return (
    <Header height={56} className={classes.header} mb={120} ref={dropdownRef}>
      <div className={classes.inner}>
        <Group>dashboard</Group>
        <Group>
          <Group ml={50} className={classes.links}>
            {isSmall && !isLoggedIn && (
              <Button onClick={openLoginModal}>Login</Button>
            )}
            {isSmall && (
              <ActionIcon
                mr={2}
                variant="outline"
                color={"blue"}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {dark ? <Sun size={18} /> : <MoonStars size={18} />}
              </ActionIcon>
            )}
            <Group mr={3}>
              {isSmall ? (
                <Burger opened={opened} onClick={toggle} size="sm" />
              ) : (
                links.map(({ label, ref }) => (
                  <Anchor
                    sx={{
                      color: dark ? "#c1c2c5" : "#000000",
                    }}
                    key={label}
                    onClick={() =>
                      ref.current.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    {label}
                  </Anchor>
                ))
              )}
              {!isSmall && (
                <ActionIcon
                  mr={2}
                  variant="outline"
                  color={"blue"}
                  onClick={() => toggleColorScheme()}
                  title="Toggle color scheme"
                >
                  {dark ? <Sun size={18} /> : <MoonStars size={18} />}
                </ActionIcon>
              )}
              {!isSmall && !isLoggedIn && (
                <Button onClick={openLoginModal}>Login</Button>
              )}
            </Group>
          </Group>
          <Transition
            transition="pop-top-right"
            duration={200}
            mounted={opened}
          >
            {(styles) => (
              <Paper className={classes.dropdown} withBorder style={styles}>
                <Stack>
                  {links.map(({ label, ref }) => (
                    <Anchor
                      sx={{
                        color: dark ? "#c1c2c5" : "#000000",
                      }}
                      key={label}
                      onClick={() => {
                        ref.current.scrollIntoView({
                          behavior: "smooth",
                        });
                        close();
                      }}
                    >
                      {label}
                    </Anchor>
                  ))}
                </Stack>
              </Paper>
            )}
          </Transition>
        </Group>
      </div>
    </Header>
  );
}
