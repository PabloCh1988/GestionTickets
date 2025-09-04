using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTickets.Models;

public class Ticket
{

    public int TicketId { get; set; }

    public string? Titulo { get; set; }

    public string? Descripcion { get; set; }

    public EstadoTicket Estado { get; set; }

    [NotMapped]
    public string EstadoString { get { return Estado.ToString(); } }

    public PrioridadTicket Prioridad { get; set; }

    [NotMapped]
    public string PrioridadString { get { return Prioridad.ToString(); } }

    public DateTime FechaCreacion { get; set; }

    [NotMapped]
    public string FechaCreacionString { get { return FechaCreacion.ToString("dd/MM/yyyy HH:mm"); } }

    [NotMapped]
    public string? CategoriaString { get { return Categoria?.Descripcion; } }

    public DateTime FechaCierre { get; set; }

    public string? UsuarioClienteId { get; set; }
    public string? UsuarioNombre { get; set; } // Nombre del usuario que crea el ticket

    public int CategoriaId { get; set; }

    // Relación con la tabla de Categorías
    public virtual Categoria? Categoria { get; set; }

    public virtual ICollection<ComentariosTicket>? Comentarios { get; set; }

    public virtual ICollection<HistorialTicket>? HistorialTickets { get; set; }

}
public class VistaTickets
{
    public int TicketId { get; set; }
    public string? Titulo { get; set; }
    public PrioridadTicket Prioridad { get; set; }
    public string? EstadoString { get; set; }
    public string? FechaCreacionString { get; set; }
    public string? UsuarioClienteId { get; set; }

    public string? PrioridadString { get; set; }
    public string? CategoriaString { get; set; }
}

public enum EstadoTicket
{
    Abierto = 1,
    Cerrado,
    EnProgreso,
    Cancelado
}

public enum PrioridadTicket
{
    Baja = 1,
    Media,
    Alta
}

public class FiltroTicket
{
    public int? CategoriaId { get; set; } // Hacerlo nullable para permitir body vacío
    public int? Estado { get; set; } // 1: Abierto, 2: Cerrado, 3: En Progreso, 4: Cancelado
    public int? Prioridad { get; set; } // 1: Baja, 2: Media, 3: Alta
    public string? FechaInicio { get; set; }
    public string? FechaFin { get; set; }
}

public class BuscarTicket
{
    public int? CategoriaId { get; set; } // Hacerlo nullable para permitir body vacío

    public string? FechaInicio { get; set; }
    public string? FechaFin { get; set; }
    public int? ClienteId { get; set; }
}