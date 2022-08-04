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
import { useState } from "react";
import { LazyMotion } from "framer-motion";
import { NextSeo } from "next-seo";
import SEO from "seo";

function MyApp({ Component, pageProps }) {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "theme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  useHotkeys([["J", () => toggleColorScheme()]]);

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
            <LazyMotion
              features={() =>
                import("framerMotionFeatures").then(
                  ({ default: features }) => features
                )
              }
              strict
            >
              <NextSeo {...SEO} />
              <Component {...pageProps} />
            </LazyMotion>
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default MyApp;
