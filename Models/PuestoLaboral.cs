namespace GestionTickets.Models;

public class PuestoLaboral
{
    public int PuestoLaboralId { get; set; }
    public string? Descripcion { get; set; }
    public bool Eliminado { get; set; }

    // Relación con los desarrolladores
    public virtual ICollection<Desarrollador>? Desarrolladores { get; set; }
}