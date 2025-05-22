namespace GestionTickets.Models;

public class HistorialTicket
{
    public int HistorialTicketId { get; set; }

    public int TicketId { get; set; }

    public string? CampoModificado { get; set; }

    public string? ValorAnterior { get; set; }
    public string? ValorNuevo { get; set; }
    public DateTime FechaCambio { get; set; }

    public virtual Ticket? Ticket { get; set; }
}