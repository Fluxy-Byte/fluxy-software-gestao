"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { swrTickets } from "@/app/services/tickets.swr";
import { swrAttendence, Attendence } from "@/app/services/attendence.swr";
import { swrQueues } from "@/app/services/queues.swr";
import { useBuilders, Builder } from "@/app/services/builders.swr";
import { ToastPersonalizado } from "@/components/toast";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Checkbox } from "@/components/ui/checkbox"
import { Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Send } from "lucide-react"
import axios from "axios";

export default function DashboardPage() {

  const { data: session } = useSession();
  const { builders } = useBuilders();

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [searchId, setSearchId] = useState("")
  const [teamFilter, setTeamFilter] = useState("")
  const [agentFilter, setAgentFilter] = useState("")
  const [listTicketsChecked, setListTicketsChecked] = useState<string[]>([])
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
  const [typeTransfer, setTypeTransfer] = useState<string>("team");
  const [attendence, setAtendence] = useState<string | null>();
  const [teamAttendence, setTeamAtendence] = useState<string | null>();
  const [queue, setQueue] = useState<string | null>();
  const [isOpenSend, setIsOpenSend] = useState<boolean>(false);

  const url = process.env.NEXT_PUBLIC_API_URL_BACKEND ?? "https://thato-thato-be.nijpgo.easypanel.host";

  useEffect(() => {
    const hasTickets = listTicketsChecked.length > 0;
    const hasType = typeTransfer !== "";

    const isTeamValid =
      typeTransfer === "team" && !!queue;

    const isAttendenceValid =
      typeTransfer === "attendence" && !!attendence && !!teamAttendence;

    const isValid =
      hasTickets &&
      hasType &&
      (isTeamValid || isAttendenceValid);

    setIsOpenSend(!isValid);
  }, [listTicketsChecked, typeTransfer, attendence, queue, teamAttendence]);

  const [take, setTake] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const { tickets, refresh } = swrTickets(builder);
  const { attendences } = swrAttendence(builder);
  const { queues } = swrQueues(builder);
  const router = useRouter();

  useEffect(() => {
    if (builders.length == 1) {
      setBuilder(builders[0]);
    }
  }, [builders])

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  const handleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field)
      setSortDirection("asc")
      return
    }

    if (sortDirection === "asc") {
      setSortDirection("desc")
    } else if (sortDirection === "desc") {
      setSortField(null)
      setSortDirection(null)
    } else {
      setSortDirection("asc")
    }
  }

  const processedTickets = useMemo(() => {
    let data = [...tickets]

    data = data.filter((t) => {
      const matchId = searchId
        ? t.sequentialId.toString().includes(searchId)
        : true

      const matchTeam = teamFilter
        ? t.team === teamFilter
        : true

      const matchAgent = agentFilter
        ? t.agentIdentity === agentFilter
        : true

      return matchId && matchTeam && matchAgent
    })

    // SORT
    if (sortField && sortDirection) {
      data.sort((a, b) => {
        let valueA: any
        let valueB: any

        switch (sortField) {
          case "ticket":
            valueA = a.sequentialId
            valueB = b.sequentialId
            break
          case "contact":
            valueA = a.contact?.name || ""
            valueB = b.contact?.name || ""
            break
          case "team":
            valueA = a.team || ""
            valueB = b.team || ""
            break
          case "agent":
            valueA = a.agentIdentity || ""
            valueB = b.agentIdentity || ""
            break
          case "status":
            valueA = a.status
            valueB = b.status
            break
          case "date":
            valueA = new Date(a.storageDate).getTime()
            valueB = new Date(b.storageDate).getTime()
            break
          default:
            return 0
        }

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [tickets, searchId, teamFilter, agentFilter, sortField, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchId, teamFilter, agentFilter])

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-1 h-4 w-4 text-primary" />
    }
    return <ArrowDown className="ml-1 h-4 w-4 text-primary" />
  }

  const getAgentName = (agent?: string) => {
    if (!agent) return "-"
    return agent.split("%40")[0]
  }

  const getQueueTime = (openDate?: string, status?: string) => {
    if (status !== "Open" || !openDate) return "-"

    const now = new Date()
    const open = new Date(openDate)

    const diffMs = now.getTime() - open.getTime()

    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    let result = ""
    if (days > 0) result += `${days}d `
    if (hours > 0 || days > 0) result += `${hours}h `
    result += `${minutes}m`

    return result.trim()
  }

  const agentsList = useMemo(() => {
    return [...new Set(
      tickets.map(t => t.agentIdentity).filter(Boolean)
    )]
  }, [tickets])

  const handleCheck = (id: string) => {
    setListTicketsChecked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const total = processedTickets.length

  const visibleTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * take
    return processedTickets.slice(startIndex, startIndex + take)
  }, [processedTickets, currentPage, take])

  const isAllChecked =
    visibleTickets.length > 0 &&
    visibleTickets.every(t => listTicketsChecked.includes(t.id))

  const handleCheckAll = () => {
    if (isAllChecked) {
      setListTicketsChecked(prev =>
        prev.filter(id => !visibleTickets.some(t => t.id === id))
      )
    } else {
      const ids = visibleTickets.map(t => t.id)
      setListTicketsChecked(prev => [...new Set([...prev, ...ids])])
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / take))

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1)
  }

  const firstPage = () => setCurrentPage(1)

  const lastPage = () => setCurrentPage(totalPages)

  const changeTake = (value: string) => {
    setTake(Number(value))
    setCurrentPage(1)
  }

  interface ResultCreateTaskTransfer {
    sucess: boolean,
    message: string
  }

  const sendTrasnfer = async () => {
    try {
      const listaTickets = []

      for (const tickte of listTicketsChecked) {
        let dadosTicket = tickets.find((tick) => tick.id == tickte);
        listaTickets.push({
          id: dadosTicket?.id,
          sequentialId: dadosTicket?.sequentialId,
          agentIdentity: dadosTicket?.agentIdentity,
          team: dadosTicket?.team,
        })
      }
      const selectedQueue = queues.find((q) => q.id === queue);
      const selectedAttendence = attendences.find((att) => att.identity === attendence);

      const teamValue =
        typeTransfer === "team"
          ? selectedQueue?.name || ""
          : teamAttendence || "";

      const attendenceValue =
        typeTransfer === "attendence"
          ? selectedAttendence?.identity || ""
          : "";

      const body = {
        url: builder?.url,
        tokenBuilder: builder?.tokenBuilder,
        tokenRouter: builder?.tokenRooter,
        idOrganization: builder?.id,
        nameUser: session?.user.name,
        idUser: session?.user.id,
        nameAction: "Transferencia em massa",
        typeTransfer: typeTransfer,
        tickets: listaTickets,
        team: teamValue,
        atendence: attendenceValue
      }

      const { data } = await axios.post(`${url}/api/transfer/tickets`, body)
      const result: ResultCreateTaskTransfer = data;

      ToastPersonalizado({
        message: result.message,
        type: result.sucess == true ? "sucesso" : "erro",
      });

    } catch (e) {
      console.error(e);
      ToastPersonalizado({
        message: "Erro interno no sistema",
        type: "erro",
      });
    } finally {
      setListTicketsChecked([])
      setQueue(null)
      setTeamAtendence(null)
      setAtendence(null)
      refresh()
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="border-b flex px-3 h-22 bg-background gap-4 shrink-0">
            <div className="flex h-full items-center">
              <SidebarTrigger />
            </div>

            <div className="flex justify-between gap-2 md:gap-0 items-center w-full">
              <div>
                <h1 className="text-base md:text-2xl font-semibold">
                  Transferência Massiva de Tickets
                </h1>
                <p className="hidden md:block md:text-sm">
                  Selecione e transfira tickets em lote
                </p>
              </div>

              <Select
                onValueChange={(value) => {
                  const selected = builders.find(b => b.id.toString() === value)
                  if (selected) setBuilder(selected)
                }}
                value={builder?.id}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {builders.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* FILTROS */}
          {
            builder && (
              <>
                <div className="border-b flex flex-col md:flex-row px-3 py-4 gap-3 bg-background">

                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="w-full md:w-50">
                      <SelectValue placeholder="Equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[...new Set(tickets.map(t => t.team))].map((team, i) => (
                          <SelectItem key={`${team}-${i}`} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-full md:w-50">
                      <SelectValue placeholder="Atendente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {agentsList.map(agent => (
                          <SelectItem key={agent} value={agent!}>
                            {getAgentName(agent!)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center border rounded pl-3">
                    <Search size={20} className="text-zinc-400" />
                    <Input
                      placeholder="Buscar pelo Nº do ticket"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full h-11 rounded text-sm border-none outline-none focus:outline-none focus:ring-0"
                    />
                  </div>

                  <Button
                    variant={"link"}
                    onClick={() => {
                      setSearchId("")
                      setTeamFilter("")
                      setAgentFilter("")
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between px-6 py-3 border-b bg-background">

                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Itens por página:</span>

                      <Select onValueChange={changeTake} defaultValue={take.toString()}>
                        <SelectTrigger className="w-[80px] h-8!">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <span className="text-sm text-zinc-600">
                      {total === 0
                        ? "0"
                        : `${(currentPage - 1) * take + 1}-${Math.min(currentPage * take, total)} de ${total} tickets`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">


                    <div className="flex items-center gap-2">

                      <button disabled={currentPage === 1} className="text-zinc-400 cursor-pointer p-0 m-0" onClick={firstPage}>
                        <ChevronsLeft />
                      </button>

                      <button disabled={currentPage === 1} className="text-zinc-400 cursor-pointer" onClick={prevPage}>
                        <ChevronLeft />
                      </button>
                      <span className="text-sm text-zinc-600">
                        Página {currentPage} de {totalPages}
                      </span>

                      <button disabled={currentPage >= totalPages} className="text-zinc-400 cursor-pointer" onClick={nextPage}>
                        <ChevronRight />
                      </button>

                      <button disabled={currentPage >= totalPages} className="text-zinc-400 cursor-pointer" onClick={lastPage}>
                        <ChevronsRight />
                      </button>

                    </div>
                  </div>
                </div>

                <div className="p-3 h-full bg-background">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-center">
                            <Checkbox checked={isAllChecked} onCheckedChange={handleCheckAll} />
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("ticket")}
                            >
                              Ticket
                              {getSortIcon("ticket")}
                            </Button>
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("contact")}
                            >
                              Contato
                              {getSortIcon("contact")}
                            </Button>
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("team")}
                            >
                              Fila
                              {getSortIcon("team")}
                            </Button>
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("agent")}
                            >
                              Atendente
                              {getSortIcon("agent")}
                            </Button>
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("status")}
                            >
                              Status
                              {getSortIcon("status")}
                            </Button>
                          </TableHead>

                          <TableHead className="text-center font-normal text-zinc-600">
                            Tempo na fila
                          </TableHead>

                          <TableHead className="text-center">
                            <Button
                              variant="table"
                              onClick={() => handleSort("date")}
                            >
                              Criado em
                              {getSortIcon("date")}
                            </Button>
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {visibleTickets.map((t) => {
                          if (t.closed == false) {
                            return (
                              <TableRow key={t.id}>
                                <TableCell className="text-center">
                                  <Checkbox
                                    checked={listTicketsChecked.includes(t.id)}
                                    onCheckedChange={() => handleCheck(t.id)}
                                  />
                                </TableCell>

                                <TableCell className="text-primary font-medium text-center">
                                  #{t.sequentialId}
                                </TableCell>

                                <TableCell className="text-center">
                                  {t.contact?.name || "Sem nome"}
                                </TableCell>

                                <TableCell className="text-center">
                                  {t.team}
                                </TableCell>

                                <TableCell className="text-center">
                                  {getAgentName(t.agentIdentity)}
                                </TableCell>

                                <TableCell className="text-center">
                                  {t.status === "Open" ? (
                                    <span className="px-2 py-1 rounded bg-green-500/15 text-green-600 text-sm font-medium">
                                      Aberto
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded bg-zinc-500/15 text-zinc-600 text-sm font-medium">
                                      Aguardando
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell className="text-center">
                                  {getQueueTime((t as any).openDate, t.status)}
                                </TableCell>

                                <TableCell className="text-center text-zinc-600">
                                  {new Date(t.storageDate).toLocaleString("pt-BR")}
                                </TableCell>
                              </TableRow>
                            )
                          }
                        }
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="stick bottom-0 left-0 right-0 bg-background border-t px-6 py-4 flex flex-col md:flex-row items-center justify-between z-50">
                  {/* LEFT */}
                  <span className="text-sm font-medium mb-4 md:mb-0">
                    {listTicketsChecked.length} tickets selecionados
                  </span>

                  {/* RIGHT ACTIONS */}
                  <div className="flex flex-col md:flex-row items-center gap-4">

                    <Select
                      value={typeTransfer}
                      onValueChange={(value) => setTypeTransfer(value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Transferir para Fila" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Transferir para Fila</SelectItem>
                        <SelectItem value="attendence">Transferir para Agente</SelectItem>
                      </SelectContent>
                    </Select>

                    {
                      typeTransfer == "team" && (
                        <Select
                          value={queue ?? ""}
                          onValueChange={(value) => setQueue(value)}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Selecione uma fila" />
                          </SelectTrigger>

                          <SelectContent>
                            {
                              queues.map((q) => (
                                <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      )
                    }

                    {
                      typeTransfer == "attendence" && (
                        <Select
                          value={attendence ?? ""}
                          onValueChange={(value) => setAtendence(value)}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Selecione um atendente" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              attendences.map((q) => (
                                <SelectItem key={q.identity} value={q.identity}>{q.fullName}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      )
                    }

                    {
                      typeTransfer == "attendence" && attendence != null && (
                        <Select
                          value={teamAttendence ?? ""}
                          onValueChange={(value) => setTeamAtendence(value)}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Selecione uma fila" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              attendences.find((att) => att.identity == attendence)?.teams.map((t, i) => (
                                <SelectItem key={i} value={t}>{t}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      )
                    }
                    <Button
                      disabled={isOpenSend}
                      className="disabled:opacity-40"
                      size={"commum"}
                      onClick={sendTrasnfer}
                    >
                      <Send /> Executar Transferência
                    </Button>

                  </div>
                </div>
              </>
            )
          }
          {
            !builder && (
              <div className="w-full h-full flex justify-center items-center">
                <span >
                  Selecione uma equipe para carregar os tickets disponíveis.
                </span>
              </div>
            )
          }

        </main>
      </div>
    </SidebarProvider>
  )
}
