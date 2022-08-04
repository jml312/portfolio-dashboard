import {
  Title,
  Container,
  Text,
  Group,
  useMantineColorScheme,
  ScrollArea,
} from "@mantine/core";
import { useState } from "react";
import abbreviate from "number-abbreviate";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("./Map"), { ssr: false });

export default function AnalyticsCard({
  title,
  subTitle,
  tabs,
  data,
  isSmall,
}) {
  const [activeTab, setActiveTab] = useState(tabs?.length && tabs[0]);
  const [activeData, setActiveData] = useState(
    Array.isArray(data) ? data : data[activeTab.key]
  );
  const totalVisitors = activeData.reduce(
    (acc, curr) => acc + curr.visitors,
    0
  );
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Container
      mt={8}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "436px",
        maxHeight: "436px",
        overflow: "scroll",
        borderRadius: "8px",
        padding: "0",
        border: `1px solid ${dark ? "#2f3136" : "#e6e6e6"}`,
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "relative",
          width: "100%",
          padding: "1rem",
        }}
      >
        <Container
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: isSmall ? "start" : "center",
            padding: "0",
          }}
        >
          <Title order={3} mb={8}>
            {title}
          </Title>
          {tabs?.length && (
            <Group
              mb={8}
              spacing="xs"
              sx={{
                display: "flex",
                flexDirection: isSmall ? "column" : "row",
                alignItems: "end",
                margin: "0",
                padding: "0",
                fontWeight: "500",
                fontSize: ".75rem",
              }}
            >
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab.key;
                return (
                  <Text
                    size="sm"
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab);
                      setActiveData(data[tab.key]);
                    }}
                    sx={{
                      display: "inline-block",
                      fontWeight: "bold",
                      textDecoration: isActive && "underline",
                      opacity: isActive ? 1 : 0.5,
                      cursor: isActive ? "default" : "pointer",
                      ":hover": {
                        opacity: !isActive && "1",
                      },
                      transition: "opacity .1s ease-in-out",
                    }}
                  >
                    {tab.shortName}
                  </Text>
                );
              })}
            </Group>
          )}
        </Container>
        {activeTab?.key === "map" ? (
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              height: "100%",
              padding: "0",
              position: "relative",
            }}
          >
            <Container
              sx={{
                flexGrow: 1,
                width: "100%",
                height: "100%",
                opacity: "1",
                transition: "opacity .1s ease-in",
                padding: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                paddingTop: ".9rem",
              }}
            >
              <Map data={activeData} dark={dark} />
            </Container>
          </Container>
        ) : (
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              padding: "0",
            }}
          >
            <Container
              sx={{
                flexGrow: 1,
                width: "100%",
                opacity: "1",
                transition: "opacity .1s ease-in",
                padding: "0",
              }}
            >
              <Container
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  letterSpacing: ".025rem",
                  fontSize: ".85rem",
                  lineHeight: "1rem",
                  marginBottom: "0.5rem",
                  marginTop: "0.75rem",
                  padding: "0",
                }}
              >
                <span>{activeTab?.longName || subTitle}</span>
                <span
                  style={{
                    textAlign: "right",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "7rem",
                    }}
                  >
                    Visitors
                  </span>
                </span>
              </Container>
              <ScrollArea mt={8} style={{ height: 325 }} offsetScrollbars>
                {activeData.map((el) => {
                  const [name, visitors, icon] = Object.values(el);
                  return (
                    <Container
                      key={name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: "-.65rem 0 -1.5rem 0",
                        fontSize: ".875rem",
                        lineHeight: "1.25rem",
                        padding: "0",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "calc(100% - 5rem)",
                          width: "100%",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            transform: "translateY(50%)",
                            height: "50%",
                            backgroundColor: "rgba(34,139,230,0.25)",
                            width: `${(visitors / totalVisitors) * 100}%`,
                            borderTopRightRadius: "4px",
                            borderBottomRightRadius: "4px",
                          }}
                        ></div>
                        <span
                          style={{
                            display: "flex",
                            padding: "0.375rem 0.5rem",
                            position: "relative",
                            zIndex: "9",
                            wordBreak: "break-all",
                          }}
                        >
                          <p
                            style={{
                              display: "block",
                            }}
                          >
                            {icon ? (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {icon}&nbsp; {capitalize(name)}
                              </span>
                            ) : (
                              capitalize(name)
                            )}
                          </p>
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 500,
                          width: "5rem",
                          textAlign: "right",
                        }}
                      >
                        {abbreviate(visitors, 1)}
                      </span>
                    </Container>
                  );
                })}
              </ScrollArea>
            </Container>
          </Container>
        )}
      </Container>
    </Container>
  );
}
