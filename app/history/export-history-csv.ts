import { History } from "@/app/services/hiostory.swr";

function formatDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function escapeCSV(value: string | null | undefined): string {
  const str = value ?? ""; // converte null/undefined para string vazia
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateHistoryCSV(data: History[]): string {
  const headers = [
    "Data/Hora",
    "Executado por",
    "ID Usuário",
    "Ação",
    "Tipo de Ação",
    "Ticket ID",
    "ID Sequencial",
    "Fila Origem",
    "Fila Destino",
    "Início Atendimento",
    "Fim Atendimento",
    "Resultado",
    "Motivo",
  ];

  const rows: string[][] = [];

  data.forEach((history) => {
    if (history.tickets && history.tickets.length > 0) {
      // Uma linha por ticket
      history.tickets.forEach((ticket) => {
        rows.push([
          escapeCSV(formatDate(history.createdAt)), // ✅ formata a data
          escapeCSV(history.nameUser),
          escapeCSV(history.idUser),
          escapeCSV(history.nameAction),
          escapeCSV(history.typeAction),
          escapeCSV(ticket.ticketId),
          String(ticket.sequentialId),
          escapeCSV(ticket.queueStart),
          escapeCSV(ticket.queueEnd),
          escapeCSV(ticket.attendenceStart), // ✅ escapeCSV já trata null
          escapeCSV(ticket.attendenceEnd),
          escapeCSV(ticket.result),
          escapeCSV(ticket.motive),
        ]);
      });
    } else {
      // Histórico sem tickets
      rows.push([
        escapeCSV(formatDate(history.createdAt)),
        escapeCSV(history.nameUser),
        escapeCSV(history.idUser),
        escapeCSV(history.nameAction),
        escapeCSV(history.typeAction),
        "", "", "", "", "", "", "", "",
      ]);
    }
  });

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function downloadHistoryCSV(
  data: History[],
  filename: string = "historico-acoes.csv"
): void {
  const csvContent = generateHistoryCSV(data);
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}