import {
  Container,
  ScrollArea,
  Group,
  Pagination,
  ActionIcon,
  NumberInput,
  Table as MantineTable,
  MultiSelect,
  Tabs,
  Checkbox,
  createStyles,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { useModals } from "@mantine/modals";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { Trash } from "tabler-icons-react";

const headers = [
  "City",
  "Region",
  "Country Name",
  "Device",
  "Browser",
  "OS",
  "Visits",
];

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

const uniqueValues = (arr, key) => [
  ...new Map(arr.map((item) => [item[key], item])).values(),
];

export default function Table({ data, isLoggedIn }) {
  const [selectedPage, setSelectedPage] = useState("Home");
  const [rows, setRows] = useState(
    uniqueValues(data.find((el) => el.page === selectedPage).visitors, "ip")
  );
  const [selectedCities, setSelectedCities] = useState([]);
  const [activePage, setPage] = useState(1);
  const numberInputRef = useRef();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const TOTAL_PAGES = Math.max(Math.ceil(rows?.length / rowsPerPage), 1);

  const [selectedRowIPS, setSelectedRowIPS] = useState([]);
  const multipleSelectedRowIPS = selectedRowIPS.length > 1;
  const { classes, cx } = useStyles();
  const toggleRow = (ip) =>
    setSelectedRowIPS((current) =>
      current.includes(ip)
        ? current.filter((item) => item !== ip)
        : [...current, ip]
    );

  const modals = useModals();
  const openDeleteModal = () => {
    const deleteModalId = modals.openContextModal("confirm", {
      title: "Delete submission",
      centered: true,
      closeOnClickOutside: true,
      innerProps: {
        modalBody: `Are you sure you want to delete ${
          multipleSelectedRowIPS ? "these" : "this"
        } page view${multipleSelectedRowIPS ? "" : "s"}?`,
        confirmButtonColor: "red",
        onClose: () => modals.closeModal(deleteModalId),
        onConfirm: async () => {
          try {
            await axios.delete();
            setRows(data.filter(({ ip }) => !selectedRowIPS.includes(ip)));
            setSelectedRowIPS([]);
            modals.closeModal(deleteModalId);
            showNotification({
              title: `Page ${
                multipleSelectedRowIPS ? "Views" : "View"
              } Deleted`,
              message: `${multipleSelectedRowIPS ? "These" : "This"} page ${
                multipleSelectedRowIPS ? "views" : "view"
              } ${multipleSelectedRowIPS ? "have" : "has"} been deleted.`,
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

  useEffect(() => {
    const visitors = data.find((el) => el.page === selectedPage).visitors;
    if (selectedCities.length) {
      setRows(visitors.filter(({ city }) => selectedCities.includes(city)));
    } else {
      setRows(uniqueValues(visitors, "ip"));
    }
  }, [selectedCities]);

  return (
    <Container fluid mt={16}>
      <ScrollArea>
        <MultiSelect
          mb={8}
          data={uniqueValues(
            data.find((el) => el.page === selectedPage).visitors,
            "city"
          ).map(({ city, region, countryName }) => ({
            value: city,
            label: `${city}, ${region}, ${countryName}`,
          }))}
          label="Filter by cities"
          placeholder="Pick all that you like"
          onChange={(val) => setSelectedCities(val)}
          maxDropdownHeight={160}
          searchable
          nothingFound="Nothing found"
          clearButtonLabel="Clear selection"
          clearable
          clearSearchOnChange
        />
        {/* <Tabs></Tabs> */}

        <MantineTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                {/* only select rows from current paginated page */}
                <Checkbox
                  onChange={() =>
                    setSelectedRowIPS((current) =>
                      current.length === rows.length
                        ? []
                        : rows.map((item) => item.ip)
                    )
                  }
                  checked={selectedRowIPS.length === rows.length}
                  indeterminate={
                    selectedRowIPS.length > 0 &&
                    selectedRowIPS.length !== rows.length
                  }
                  transitionDuration={0}
                />
                {selectedRowIPS.length > 0 && (
                  <ActionIcon
                    onClick={openDeleteModal}
                    disabled={!isLoggedIn || selectedRowIPS.length === 0}
                    color="red"
                  >
                    <Trash size={16} />
                  </ActionIcon>
                )}
              </th>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
              .map(
                ({
                  city,
                  region,
                  countryName,
                  device,
                  browser,
                  os,
                  viewDates,
                  ip,
                }) => {
                  const isSelected = selectedRowIPS.includes(ip);
                  return (
                    <tr
                      key={ip}
                      className={cx({ [classes.rowSelected]: isSelected })}
                    >
                      <td>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(ip)}
                          transitionDuration={0}
                        />
                      </td>
                      <td>{city}</td>
                      <td>{region}</td>
                      <td>{countryName}</td>
                      <td>{device}</td>
                      <td>{browser}</td>
                      <td>{os === "null" ? "Unknown" : os}</td>
                      <td>{viewDates.length}</td>
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
              onChange={(val) => setRowsPerPage(val)}
              handlersRef={numberInputRef}
              min={1}
              max={100}
              step={rowsPerPage === 1 ? 4 : 5}
              size={32}
              styles={{
                input: { width: 48, textAlign: "center", fontSize: ".9rem" },
              }}
            />
            <ActionIcon
              size={32}
              disabled={rowsPerPage === 100}
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

// Tabs for each page in table (top left)
// Multi select for city search (select multiple cities)

// selectable table - https://ui.mantine.dev/category/tables - delete icon appears when rows are selected

// pagination, row limit at bottom
