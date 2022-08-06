import {
  Container,
  ScrollArea,
  Group,
  Pagination,
  ActionIcon,
  NumberInput,
  Table as MantineTable,
  Checkbox,
  createStyles,
} from "@mantine/core";
import { useState, useRef, useMemo } from "react";
import { useModals } from "@mantine/modals";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { Trash, Minus } from "tabler-icons-react";
import { format } from "date-fns";

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function Table({ data, setData, isLoggedIn }) {
  const rows = useMemo(
    () =>
      data
        .flatMap(({ page, slug, visitors }) =>
          visitors.flatMap(({ viewings, device, os, browser, ip }) =>
            viewings.map(
              ({ locationShort, flag, date, timeSpent, referrer }) => ({
                ip,
                slug,
                page,
                referrer,
                location: `${locationShort} ${flag}`,
                timeSpent,
                date,
                device,
                os,
                browser,
                viewings: viewings.length,
              })
            )
          )
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [data]
  );
  const [activePage, setPage] = useState(1);
  const numberInputRef = useRef();
  const [rowsPerPage, setRowsPerPage] = useState(
    rows.length >= 5 ? 10 : rows.length === 1 ? 1 : 5
  );
  const TOTAL_PAGES = Math.max(Math.ceil(rows?.length / rowsPerPage), 1);
  const MAX_ROWS_PER_PAGE = Math.min(100, Math.ceil(rows.length / 5) * 5);

  const [selectedRows, setSelectedRows] = useState([]);
  const multipleSelectedRows = selectedRows.length > 1;
  const { classes, cx } = useStyles();
  const toggleRow = ({ date, ip, slug }) =>
    setSelectedRows((current) =>
      current.some((row) => row.date === date && row.ip === ip)
        ? current.filter((item) => item.date !== date)
        : [...current, { date, ip, slug }]
    );

  const pluralize = (first, second) => (multipleSelectedRows ? first : second);

  const modals = useModals();
  const openDeleteModal = () => {
    const deleteModalId = modals.openContextModal("confirm", {
      title: `Delete view${pluralize("s", "")}`,
      centered: true,
      closeOnClickOutside: true,
      innerProps: {
        modalBody: `Are you sure you want to delete ${pluralize(
          selectedRows.length === rows.length ? "all" : "these",
          "this"
        )} page view${pluralize("s", "")}?`,
        confirmButtonColor: "red",
        onClose: () => modals.closeModal(deleteModalId),
        onConfirm: async () => {
          try {
            const groupedIPS = selectedRows.reduce(
              (acc, { date, ip, slug }) => {
                if (slug in acc) {
                  if (ip in acc[slug]) {
                    acc[slug][ip].push(date);
                  } else {
                    acc[slug][ip] = [date];
                  }
                } else {
                  acc[slug] = { [ip]: [date] };
                }
                return acc;
              },
              {}
            );
            await axios.delete("/api/views/delete", {
              data: groupedIPS,
            });
            const updatedData = data.map(({ visitors, ...rest }) => {
              const filteredVisitors = visitors.map(
                ({ viewings, ip: viewIp, ...viewingsRest }) => {
                  const filteredViewings = viewings.filter(
                    ({ date: viewDate }) =>
                      !selectedRows.some(
                        ({ date: selectedDate, ip: selectedIp }) =>
                          viewDate === selectedDate && viewIp === selectedIp
                      )
                  );
                  return { viewings: filteredViewings, ...viewingsRest };
                }
              );
              return {
                ...rest,
                views: filteredVisitors.reduce(
                  (acc, { viewings }) => acc + viewings.length,
                  0
                ),
                visitors: filteredVisitors,
              };
            });
            setData([...updatedData]);
            setSelectedRows([]);
            modals.closeModal(deleteModalId);
            showNotification({
              title: `Page ${pluralize("Views", "View")} Deleted`,
              message: `Page ${pluralize("views", "view")} deleted.`,
              color: "green",
            });
          } catch {
            modals.closeModal(deleteModalId);
            showNotification({
              title: "Error",
              message: "Something went wrong",
              color: "red",
            });
          }
        },
      },
    });
  };

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60);
    const seconds = (value % 60).toFixed(1).toString();
    return minutes > 0 && seconds > 0
      ? `${minutes}m ${seconds.replace(".0", "")}s`
      : seconds > 0 && !minutes
      ? `${seconds.replace(".0", "")}s`
      : `${minutes}m`;
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Container fluid mt={16}>
      <ScrollArea>
        <MantineTable>
          <caption
            style={{
              textAlign: "left",
            }}
          >
            {rows.length} Total Visitors
          </caption>
          <thead>
            <tr>
              <th>
                <Group position="start">
                  <ActionIcon
                    onClick={openDeleteModal}
                    disabled={!isLoggedIn || selectedRows.length === 0}
                    color="red"
                    size="sm"
                  >
                    <Trash size={12} />
                  </ActionIcon>
                  {selectedRows.length && (
                    <ActionIcon
                      onClick={() => setSelectedRows([])}
                      size="sm"
                      variant="filled"
                    >
                      <Minus size={12} />
                    </ActionIcon>
                  )}
                </Group>
              </th>
              {[
                "Page",
                "Referrer",
                "Location",
                "Duration",
                "Date",
                "Device",
                "Browser",
                "OS",
                "Viewings",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
              .map(
                ({
                  slug,
                  ip,
                  page,
                  referrer,
                  location,
                  timeSpent,
                  date,
                  device,
                  browser,
                  os,
                  viewings,
                }) => {
                  const isSelected = selectedRows.some(
                    (row) => row.date === date && row.ip === ip
                  );
                  return (
                    <tr
                      key={date}
                      className={cx({
                        [classes.rowSelected]: isSelected,
                      })}
                    >
                      <td>
                        <Checkbox
                          sx={{
                            width: "min-content",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                          }}
                          checked={isSelected}
                          onChange={() =>
                            toggleRow({
                              slug,
                              date,
                              ip,
                            })
                          }
                          transitionDuration={0}
                        />
                      </td>
                      <td>{page}</td>
                      <td>{referrer}</td>
                      <td>{location}</td>
                      <td>{formatTime(timeSpent)}</td>
                      <td>{format(new Date(date), "MMM dd, yyyy h:mm a")}</td>
                      <td>{device}</td>
                      <td>
                        {browser.toLowerCase() === "ios"
                          ? "IOS"
                          : capitalize(browser)}
                      </td>
                      <td>
                        {os.toLowerCase() === "ios" ? "IOS" : capitalize(os)}
                      </td>
                      <td>{viewings}</td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </MantineTable>

        <Group grow>
          <Pagination
            mt={8}
            total={TOTAL_PAGES}
            page={activePage}
            onChange={setPage}
            withEdges={TOTAL_PAGES > 5}
          />
          <Group spacing={5} mt={8} sx={{ justifyContent: "flex-end" }}>
            <ActionIcon
              size={32}
              disabled={rowsPerPage === 1}
              variant="default"
              onClick={() => numberInputRef.current.decrement()}
            >
              –
            </ActionIcon>
            <NumberInput
              hideControls
              readOnly
              value={rowsPerPage}
              onChange={(val) => {
                setPage(1);
                setRowsPerPage(val);
              }}
              handlersRef={numberInputRef}
              min={1}
              max={MAX_ROWS_PER_PAGE}
              step={rowsPerPage === 1 ? 4 : 5}
              size={32}
              styles={{
                input: { width: 48, textAlign: "center", fontSize: ".9rem" },
              }}
            />
            <ActionIcon
              size={32}
              disabled={rowsPerPage === MAX_ROWS_PER_PAGE}
              variant="default"
              onClick={() => numberInputRef.current.increment()}
            >
              +
            </ActionIcon>
          </Group>
        </Group>
      </ScrollArea>
    </Container>
  );
}
