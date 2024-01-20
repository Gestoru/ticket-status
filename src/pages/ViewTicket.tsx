import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FlagIcon } from "@heroicons/react/16/solid";
import ItemSeguimiento from "../components/ItemSeguimiento";
import { Ticket, TicketComment, TicketCommentResponse } from "../types/Ticket";
import calculateTimeRelative from "../helpers/timeRelative";

const ViewTicket = () => {
  const { id } = useParams();
  const [ticket, SetTicket] = useState<Ticket>();
  const [comments, setComments] = useState<TicketComment[]>();
  const navigate = useNavigate();
  useEffect(() => {
    if (!id) return;
    fetchTicket(id)
      .then((ticket) => {
        console.log(ticket);
        SetTicket(ticket);
        fetchTicketComments(id).then((comments) => {
          const commentsSorted = comments.comments.reverse();
          setComments(commentsSorted);
        });
      })
      .catch(() => {
        navigate(`/`);
        return;
      });
  }, [id, navigate]);
  return (
    <article id={"ticket-" + id} className="p-1 flex flex-col gap-4">
      <header className="flex flex-col">
        <p className="text-sm text-neutral-500">#{id}</p>
        <h1
          className={"text-2xl font-bold "}
          style={{
            color: ticket?.status.color,
          }}
        >
          {ticket?.status.status.toUpperCase()}
        </h1>
        <div className="inline-flex justify-between">
          <p className="text-[#6fddff] text-xs inline-flex gap-1 items-center">
            <FlagIcon className="w-min h-3" />
            {ticket?.priority.priority}
          </p>
          <p className="text-xs text-neutral-500">
            Creado{" "}
            {calculateTimeRelative(
              ticket ? ticket.date_created : 0
            ).toLowerCase()}
          </p>
        </div>
      </header>
      <hr className=" border-neutral-700" />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Descripción</h2>
        <p className="text-xs text-pretty text-neutral-300">
          {ticket?.description}
        </p>
      </div>
      <hr className="border-neutral-700" />
      <main className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Seguimiento</h2>
        <ItemSeguimiento
          created={true}
          fecha={ticket ? ticket.date_created : 0}
          descripcion="El ticket fue creado"
        />
        {comments ? (
          comments.map((comment) => (
            <ItemSeguimiento
              key={comment.id}
              fecha={comment.date}
              descripcion={comment.comment_text}
            />
          ))
        ) : (
          <></>
        )}
      </main>
    </article>
  );
};

const fetchTicket = async (id: string): Promise<Ticket> => {
  const resp = await fetch(`https://api.clickup.com/api/v2/task/${id}`, {
    method: "GET",
    headers: {
      Authorization: import.meta.env.VITE_API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (resp.status != 200) throw new Error("Ticket no encontrado");
  return await resp.json();
};

const fetchTicketComments = async (
  id: string
): Promise<TicketCommentResponse> => {
  const resp = await fetch(
    `https://api.clickup.com/api/v2/task/${id}/comment`,
    {
      method: "GET",
      headers: {
        Authorization: import.meta.env.VITE_API_KEY,
        "Access-Control-Allow-Origin": "https://api.clickup.com",
      },
    }
  );
  return await resp.json();
};

export default ViewTicket;
