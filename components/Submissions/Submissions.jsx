import { useState, useEffect, useRef } from "react";
import {
  Table,
  ScrollArea,
  Group,
  Text,
  TextInput,
  Anchor,
  Badge,
  ActionIcon,
  Title,
  Container,
  Pagination,
  NumberInput,
  Tooltip,
} from "@mantine/core";
import { Search, Check, Trash, ArrowsMaximize } from "tabler-icons-react";
import { format } from "date-fns";
import { useModals } from "@mantine/modals";
import axios from "axios";
import { showNotification } from "@mantine/notifications";

const headers = ["Name", "Email", "Message", "Date", "Is Read", "Actions"];

export default function Submissions({
  submissions,
  isLoggedIn,
  submissionsRef,
}) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([...submissions]);
  const [activeRowId, setActiveRowId] = useState("");
  const [activeRowActionType, setActiveRowActionType] = useState("");
  const [activePage, setPage] = useState(1);
  const numberInputRef = useRef();
  const [rowsPerPage, setRowsPerPage] = useState(
    rows.length >= 5 ? 10 : rows.length === 1 ? 1 : 5
  );
  const TOTAL_PAGES = Math.max(Math.ceil(rows?.length / rowsPerPage), 1);
  const MAX_ROWS_PER_PAGE =
    rows.length >= 5 ? Math.min(100, Math.ceil(rows.length / 5) * 5) : 1;

  const modals = useModals();
  const openConfirmModal = () => {
    const confirmModalId = modals.openContextModal("confirm", {
      title: "Mark Read",
      centered: true,
      closeOnClickOutside: true,
      onClose: () => {
        setActiveRowId("");
        setActiveRowActionType("");
      },
      innerProps: {
        modalBody: "Are you sure you want to mark this submission as read?",
        confirmButtonColor: "green",
        onClose: () => {
          setActiveRowId("");
          setActiveRowActionType("");
          modals.closeModal(confirmModalId);
        },
        onConfirm: async () => {
          try {
            await axios.patch(`/api/submissions/mark-read?_id=${activeRowId}`);
            setRows(
              rows
                .map((row) =>
                  row._id === activeRowId ? { ...row, isRead: true } : row
                )
                .sort(
                  (a, b) =>
                    Number(a.isRead) - Number(b.isRead) ||
                    new Date(b) - new Date(a)
                )
            );
            setActiveRowId("");
            setActiveRowActionType("");
            modals.closeModal(confirmModalId);
            showNotification({
              title: "Submission Marked Read",
              message: "This submission has been marked as read.",
              color: "green",
            });
          } catch {
            modals.closeModal(confirmModalId);
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

  const openDeleteModal = () => {
    const deleteModalId = modals.openContextModal("confirm", {
      title: "Delete submission",
      centered: true,
      closeOnClickOutside: true,
      onClose: () => {
        setActiveRowId("");
        setActiveRowActionType("");
      },
      innerProps: {
        modalBody: "Are you sure you want to delete this submission?",
        confirmButtonColor: "red",
        onClose: () => {
          setActiveRowId("");
          setActiveRowActionType("");
          modals.closeModal(deleteModalId);
        },
        onConfirm: async () => {
          try {
            await axios.delete(`/api/submissions/delete?_id=${activeRowId}`);
            setRows(rows.filter((row) => row._id !== activeRowId));
            setActiveRowId("");
            setActiveRowActionType("");
            modals.closeModal(deleteModalId);
            showNotification({
              title: "Submission Deleted",
              message: "This submission has been deleted.",
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

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearch(value);
    setRows(
      submissions.filter(
        (submission) =>
          submission.name.toLowerCase().includes(value.toLowerCase()) ||
          submission.email.toLowerCase().includes(value.toLowerCase()) ||
          submission.message.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setRows([...submissions]);
  }, [submissions, isLoggedIn]);

  useEffect(() => {
    if (activeRowActionType === "delete") {
      openDeleteModal();
    } else if (activeRowActionType === "mark-read") {
      openConfirmModal();
    }
  }, [activeRowId, activeRowActionType]);

  const shortenWithTooltip = (text) => {
    if (text.length > 13) {
      return (
        <Tooltip label={text}>
          <span>
            {text.substring(0, 13)}
            {isLoggedIn && "..."}
          </span>
        </Tooltip>
      );
    }
    return text;
  };

  return (
    <Container
      fluid
      mt={32}
      ref={submissionsRef}
      sx={{
        scrollMarginTop: "60px",
      }}
    >
      <Title order={1} mb={8}>
        Submissions
      </Title>
      <ScrollArea>
        <TextInput
          placeholder="Search by name, email, or message"
          mb="md"
          icon={<Search size={14} />}
          value={search}
          onChange={handleSearchChange}
          disabled={!isLoggedIn}
        />
        <Table
          mt={-8}
          verticalSpacing="sm"
          sx={{ tableLayout: "fixed", minWidth: 700 }}
        >
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows
                .slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
                .map(({ _id, name, email, message, date, isRead }) => (
                  <tr key={_id}>
                    <td>{shortenWithTooltip(name)}</td>
                    <td>
                      <Anchor href={isLoggedIn ? `mailto:${email}` : undefined}>
                        {shortenWithTooltip(email)}
                      </Anchor>
                      {/* <Anchor href={isLoggedIn ? `mailto:${email}` : undefined}>
                        {email}
                      </Anchor> */}
                    </td>
                    <td>
                      <ActionIcon
                        variant="default"
                        onClick={() =>
                          modals.openContextModal("content", {
                            title: "Message",
                            centered: true,
                            overflow: "inside",
                            closeOnClickOutside: true,
                            innerProps: {
                              modalBody: message,
                            },
                          })
                        }
                      >
                        <ArrowsMaximize size={18} />
                      </ActionIcon>
                    </td>
                    <td>{format(new Date(date), "M/d/yyyy")}</td>
                    <td>
                      <Badge color={isRead ? "gray" : "red"}>
                        {isRead ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing={3} noWrap>
                        <ActionIcon
                          onClick={() => {
                            setActiveRowId(_id);
                            setActiveRowActionType("mark-read");
                          }}
                          disabled={!isLoggedIn || isRead}
                          color="green"
                        >
                          <Check size={16} />
                        </ActionIcon>
                        <ActionIcon
                          onClick={() => {
                            setActiveRowId(_id);
                            setActiveRowActionType("delete");
                          }}
                          disabled={!isLoggedIn}
                          color="red"
                        >
                          <Trash size={16} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={headers.length}>
                  <Text weight={500} align="center">
                    {submissions.length === 0
                      ? "No submissions"
                      : "Nothing found"}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {rows.length > 0 && (
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
        )}
      </ScrollArea>
    </Container>
  );
}
