import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FlagIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import ItemSeguimiento from "../components/ItemSeguimiento";
import { Ticket, TicketComment, TicketCommentResponse } from "../types/Ticket";
import calculateTimeRelative from "../helpers/timeRelative";
import ContentLoader from "react-content-loader";

const ViewTicket = () => {
  const { id } = useParams();
  const [ticket, SetTicket] = useState<Ticket>();
  const [comments, setComments] = useState<TicketComment[]>();
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
        });
      })
      .catch(() => {
        toast.info("No existe un radicado con este número", {
          position: "top-right",
        });
        navigate(`/`);
        return;
      });
  }, [id, navigate]);
  return (
    <article id={"ticket-" + id} className="p-1 flex flex-col gap-4">
      {loading ? (
        <div style={{ width: "80vw", height: "40vh" }}>
          <ContentLoader
            speed={2}
            width="100%"
            height="100%"
            backgroundColor="#e5e7eb"
            foregroundColor="#d9d4d4"
          >
            <rect x="602" y="10" rx="5" ry="5" width="100" height="10" />
            <rect x="10" y="10" rx="5" ry="5" width="70" height="20" />
            <rect x="10" y="40" rx="5" ry="5" width="50" height="10" />
            <rect x="10" y="60" rx="5" ry="5" width="200" height="40" />
            <rect x="10" y="90" rx="5" ry="5" width="50" height="10" />
            <rect x="622" y="50" rx="5" ry="5" width="80" height="20" />
            <rect x="10" y="120" rx="5" ry="5" width="100" height="20" />
            <rect x="10" y="150" rx="5" ry="5" width="380" height="10" />
            <rect x="10" y="180" rx="5" ry="5" width="380" height="10" />
            <rect x="10" y="180" rx="5" ry="5" width="700" height="200" />
          </ContentLoader>
        </div>
      ) : (
        <>
          <section className="slide-entry">
            <article className="flex items-center justify-between">
              <Link to="/" className="button-secondary">
                <span>Volver</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                  <path
                    d="M 1 6 L 11 6"
                    fill="transparent"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M 7 10 L 11 6 L 7 2"
                    fill="transparent"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </Link>

              <p className="text-xs text-neutral-500">
                Creado{" "}
                {calculateTimeRelative(
                  ticket ? ticket.date_created : 0
                ).toLowerCase()}
              </p>
            </article>
            <header className="flex justify-between items-center my-4">
              <div>
                <p className="text-sm text-neutral-500">#{id}</p>
                <h1
                  className={"text-lg md:text-2xl font-bold "}
                  style={{
                    color: ticket?.status?.color || "black",
                  }}
                >
                  {ticket?.status.status.toUpperCase() || "UNKNOWN STATUS"}
                </h1>
              </div>

              <p
                className="text-white text-xs inline-flex gap-1 items-center capitalize py-1 px-4 rounded-full font-medium"
                style={{
                  background: ticket?.priority?.color || "black",
                }}
              >
                <FlagIcon className="w-min h-3" />
                {ticket?.priority?.priority}
              </p>
            </header>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Descripción</h2>
              <p className="text-sm text-prett">{ticket?.description}</p>
            </div>
            <hr className="h-0.5 bg-gradient-to-r from-transparent via-stone-300 my-3.5 to-transparent border-none" />
            <article className="max-h-[28vh] overflow-auto">
              <h2 className="text-lg font-bold mb-2">Seguimiento</h2>
              {comments ? (
                comments
                  .slice()
                  .reverse()
                  .map((comment) => (
                    <ItemSeguimiento
                      key={comment.id}
                      fecha={comment.date}
                      descripcion={comment.comment_text}
                    />
                  ))
              ) : (
                <></>
              )}
            </article>
          </section>
        </>
      )}
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
