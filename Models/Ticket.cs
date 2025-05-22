namespace GestionTickets.Models;

public class Ticket {

    public int TicketId { get; set; }

    public string? Titulo { get; set; }

    public string? Descripcion { get; set; }

    public EstadoTicket Estado { get; set; }

    public PrioridadTicket Prioridad { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime FechaCierre { get; set; }

    public string? UsuarioClienteId { get; set; }

    public int CategoriaId { get; set; }

    // Relación con la tabla de Categorías
    public virtual Categoria? Categoria { get; set; }

    public virtual ICollection<ComentariosTicket>? Comentarios { get; set; }

    public virtual ICollection<HistorialTicket>? HistorialTickets { get; set; }

}

    public enum EstadoTicket 
    { Abierto = 1, 
    Cerrado, 
    EnProgreso, 
    Cancelado }
    
    public enum PrioridadTicket 
    { Baja = 1, 
    Media, 
    Alta }