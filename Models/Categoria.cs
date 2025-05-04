namespace GestionTickets.Models;

public class Categoria 
{
    public int CategoriaId { get; set; }
    public string? Descripcion { get; set; }
    public bool Eliminado { get; set; }
    
    // Relación con los tickets
    public virtual ICollection<Ticket>? Tickets { get; set; }
}
