import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import {
  MantineProvider,
  ColorSchemeProvider,
  Text,
  Button,
  Group,
} from "@mantine/core";
import { useLocalStorage, useHotkeys } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { useState, useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "theme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const ConfirmModal = ({ innerProps }) => {
    const [isLoading, setIsLoading] = useState(false);
    return (
      <>
        <Text size="sm">{innerProps.modalBody}</Text>
        <Group mt="md" position="right" spacing="md">
          <Button onClick={innerProps.onClose} variant="default" color="gray">
            No
          </Button>
          <Button
            color={innerProps.confirmButtonColor}
            loading={isLoading}
            onClick={() => {
              setIsLoading(true);
              innerProps.onConfirm();
            }}
          >
            Yes
          </Button>
        </Group>
      </>
    );
  };

  const ContentModal = ({ innerProps }) => {
    return (
      <>
        <Text size="sm">{innerProps.modalBody}</Text>
      </>
    );
  };

  const [start, setStart] = useState(new Date().getTime());

  // useEffect(() => {
  //   console.log("Called", new Date().getTime());
  //   setStart(new Date().getTime());
  // }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", function logData() {
      if (document.visibilityState === "hidden") {
        localStorage.setItem("lastActive", new Date().getTime());
        const end = new Date().getTime();
        const totalTime = (end - start) / 1000;
        // console.log(totalTime);
        // navigator.sendBeacon(
        //   `https://dbjl1.free.beeceptor.com/log/${totalTime}`,
        //   "stuff"
        // );
      } else {
        console.log("Called", new Date().getTime());
        setStart(new Date().getTime());
      }
    });
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <ModalsProvider
          modals={{ confirm: ConfirmModal, content: ContentModal }}
        >
          <NotificationsProvider>
            <Component {...pageProps} />
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default MyApp;
