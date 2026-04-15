"use client";
import { useState, useMemo } from "react";
import { useHistory, History, HistoryTickets } from "@/app/services/hiostory.swr"
import { Filter, ChevronDown, ChevronUp, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAttendantName } from "@/app/services/functions/getAttendantName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Tipos baseados no JSON de exemplo
interface HistoryTicket {
  id: number;
  ticketId: string;
  sequentialId: number;
  queueStart: string;
  queueEnd: string;
  attendenceStart: string | null;
  attendenceEnd: string;
  result: string;
  motive: string;
  historyId: number;
}

interface HistoryItem {
  id: number;
  createdAt: string;
  nameUser: string;
  idUser: string;
  nameAction: string;
  typeAction: string;
  result: string;
  tickets: HistoryTicket[];
}

function formatDateTime(dateString: string): string {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function ResultBadge({ result }: { result: string }) {
  const isSuccess = result.toLowerCase() === "success";
  return (
    <Badge
      className={
        isSuccess
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
          : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
      }
    >
      {isSuccess ? "Sucesso" : "Falha"}
    </Badge>
  );
}

function TicketAccordion({
  tickets,
  isOpen,
  onToggle,
}: {
  tickets: HistoryTicket[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasMultipleTickets = tickets.length > 1;

  if (!hasMultipleTickets) {
    return (
      <span className="text-primary font-medium">
        Ticket #{tickets[0]?.sequentialId}
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-primary font-medium hover:underline"
      >
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
        <span>{tickets.length} tickets transferidos</span>
      </button>
    </div>
  );
}

function ExpandedTickets({
  tickets,
  ticketFilter,
}: {
  tickets: HistoryTicket[];
  ticketFilter: string;
}) {
  const filteredTickets = ticketFilter
    ? tickets.filter(
      (ticket) =>
        ticket.ticketId.toLowerCase().includes(ticketFilter.toLowerCase()) ||
        ticket.sequentialId.toString().includes(ticketFilter)
    )
    : tickets;

  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={8} className="py-3">
        <div className="pl-4">
          <span className="text-sm text-muted-foreground">
            Tickets transferidos:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {filteredTickets.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Nenhum ticket encontrado com o filtro aplicado
              </span>
            ) : (
              filteredTickets.map((ticket) => {
                const hasFailed = ticket.result === "failure";
                return (
                  <div
                    key={ticket.id}
                    className={`inline-flex flex-col gap-1 px-3 py-2 rounded text-sm ${hasFailed
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        #{ticket.sequentialId}
                      </span>
                      <ResultBadge result={ticket.result} />
                    </div>
                    <div className="text-xs opacity-80">
                      {ticket.queueStart} → {ticket.queueEnd}
                    </div>
                    {hasFailed && (
                      <span className="text-red-600 text-xs">
                        {ticket.motive || "Erro desconhecido"}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DatePickerField({
  label,
  date,
  onDateChange,
  placeholder,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size={"lg"}
            variant="ghost"
            className={cn(
              "w-full bg-[#FAFAFA] border h-12 border-gray-300 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Page() {
  // Substituir por useHistory() quando integrado com o SWR
  const { history } = useHistory();

  const [executedByFilter, setExecutedByFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [ticketFilter, setTicketFilter] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    history.forEach((h) => users.add(h.nameUser));
    return Array.from(users);
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Filtro por usuário
      if (executedByFilter !== "all" && item.nameUser !== executedByFilter) {
        return false;
      }

      // Filtro por status dos tickets (success/failure)
      if (statusFilter !== "all") {
        const hasMatchingStatus = item.tickets?.some(
          (ticket) => ticket.result === statusFilter
        );
        if (!hasMatchingStatus) return false;
      }

      const itemDate = new Date(item.createdAt);

      // Filtro por data inicial
      if (startDateFilter) {
        const startOfDay = new Date(startDateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        if (itemDate < startOfDay) return false;
      }

      // Filtro por data final
      if (endDateFilter) {
        const endOfDay = new Date(endDateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        if (itemDate > endOfDay) return false;
      }

      // Filtro por ticket (ticketId ou sequentialId)
      if (ticketFilter) {
        const hasMatchingTicket = item.tickets?.some(
          (ticket) =>
            ticket.ticketId
              .toLowerCase()
              .includes(ticketFilter.toLowerCase()) ||
            ticket.sequentialId.toString().includes(ticketFilter)
        );
        if (!hasMatchingTicket) return false;
      }

      return true;
    });
  }, [
    history,
    executedByFilter,
    statusFilter,
    startDateFilter,
    endDateFilter,
    ticketFilter,
  ]);

  const clearFilters = () => {
    setExecutedByFilter("all");
    setStatusFilter("all");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setTicketFilter("");
  };

  const hasActiveFilters =
    executedByFilter !== "all" ||
    statusFilter !== "all" ||
    startDateFilter !== undefined ||
    endDateFilter !== undefined ||
    ticketFilter !== "";

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getOverallResult = (tickets: HistoryTicket[]): string => {
    if (!tickets || tickets.length === 0) return "success";
    const hasFailure = tickets.some((t) => t.result === "failure");
    return hasFailure ? "failure" : "success";
  };

  const getOverallMotive = (tickets: HistoryTicket[]): string => {
    if (!tickets || tickets.length === 0) return "—";
    const failedTicket = tickets.find((t) => t.result === "failure");
    return failedTicket?.motive || "—";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="size-4" />
            <span className="font-medium">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-primary"
            >
              Limpar filtros
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Executado por
            </label>
            <Select
              value={executedByFilter}
              onValueChange={setExecutedByFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DatePickerField
            label="Data Inicial"
            date={startDateFilter}

            onDateChange={setStartDateFilter}
            placeholder="dd/mm/aaaa"
          />

          <DatePickerField
            label="Data Final"
            date={endDateFilter}
            onDateChange={setEndDateFilter}
            placeholder="dd/mm/aaaa"
          />

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Ticket</label>
            <Input
              type="text"
              placeholder="EX: 12345"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-zinc-500 font-normal">Data/Hora</TableHead>
              <TableHead className="text-zinc-500 font-normal">Executado por</TableHead>
              <TableHead className="text-zinc-500 font-normal">Ação</TableHead>
              <TableHead className="text-zinc-500 font-normal">Recurso</TableHead>
              <TableHead className="text-zinc-500 font-normal">De</TableHead>
              <TableHead className="text-zinc-500 font-normal">Para</TableHead>
              <TableHead className="text-zinc-500 font-normal">Resultado</TableHead>
              <TableHead className="text-zinc-500 font-normal">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                const hasMultipleTickets =
                  item.tickets && item.tickets.length > 1;
                const firstTicket = item.tickets?.[0];

                return (
                  <TableRow key={`row-${item.id}`} className="group">
                    <>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.nameUser}
                      </TableCell>
                      <TableCell className="text-primary">
                        {item.nameAction}
                      </TableCell>
                      <TableCell>
                        {item.tickets && item.tickets.length > 0 ? (
                          <TicketAccordion
                            tickets={item.tickets}
                            isOpen={isExpanded}
                            onToggle={() => toggleRowExpansion(item.id)}
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{`${firstTicket?.queueStart} - ${getAttendantName(firstTicket?.attendenceStart)}` || "—"}</TableCell>
                      <TableCell>{`${firstTicket?.queueEnd} - ${getAttendantName(firstTicket?.attendenceEnd)}` || "—"}</TableCell>
                      <TableCell>
                        {item.tickets && item.tickets.length > 0 ? (
                          <ResultBadge result={getOverallResult(item.tickets)} />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-destructive max-w-xs truncate">
                        {getOverallMotive(item.tickets)}
                      </TableCell>
                    </>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Renderiza os tickets expandidos fora da tabela principal para evitar problemas de layout */}
        {filteredHistory.map((item) => {
          const isExpanded = expandedRows.has(item.id);
          const hasMultipleTickets = item.tickets && item.tickets.length > 1;

          if (!hasMultipleTickets || !isExpanded) return null;

          return (
            <div key={`expanded-${item.id}`} className="border-t bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Tickets da ação #{item.id}:
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tickets
                  .filter((ticket: HistoryTickets) =>
                    ticketFilter
                      ? ticket.ticketId
                        .toLowerCase()
                        .includes(ticketFilter.toLowerCase()) ||
                      ticket.sequentialId.toString().includes(ticketFilter)
                      : true
                  )
                  .map((ticket: HistoryTickets) => {
                    const hasFailed = ticket.result === "failure";
                    return (
                      <div
                        key={ticket.id}
                        className={`inline-flex flex-col gap-1 px-3 py-2 rounded text-sm ${hasFailed
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                      >
                        <div className="w-full flex items-center gap-1">
                          <span className="font-medium">
                            #{ticket.sequentialId}
                          </span>
                          <ResultBadge result={ticket.result} />
                        </div>
                        <div className="text-xs opacity-80">
                          {ticket.queueStart} → {ticket.queueEnd}
                        </div>
                        <div className="text-xs opacity-80">
                          {getAttendantName(ticket.attendenceStart)} → {getAttendantName(ticket.attendenceEnd)}
                        </div>
                        {hasFailed && (
                          <span className="text-red-600 text-xs max-w-xs">
                            {ticket.motive || "Erro desconhecido"}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
