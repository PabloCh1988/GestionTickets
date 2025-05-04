namespace GestionTickets.Models;

public class ComentariosTicket
{
    public int ComentariosTicketId { get; set; }

    public int TicketId { get; set; }

    public int UsuarioId { get; set; }

    public string? Mensaje { get; set; }

    public DateTime FechaCreacion { get; set; }

    // Relación con el modelo Ticket
    public virtual Ticket? Ticket { get; set; }

}