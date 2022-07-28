import {
  createStyles,
  Header,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Button,
  Container,
  TextInput,
} from "@mantine/core";
import { Sun, MoonStars } from "tabler-icons-react";
import { useModals } from "@mantine/modals";
import { useState } from "react";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";

const useStyles = createStyles((theme) => ({
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

export default function Navbar({ isLoggedIn, setIsLoggedIn, setData }) {
  const { classes } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
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

  return (
    <Header height={56} className={classes.header} mb={120}>
      <div className={classes.inner}>
        <Group>joshlevy.io</Group>
        <Group>
          <Group ml={50} spacing={5} className={classes.links}>
            <ActionIcon
              variant="outline"
              color={"blue"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? <Sun size={18} /> : <MoonStars size={18} />}
            </ActionIcon>
            {!isLoggedIn && <Button onClick={openLoginModal}>Login</Button>}
          </Group>
        </Group>
      </div>
    </Header>
  );
}
