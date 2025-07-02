namespace GestionTickets.Models;

public class Desarrollador
{
    public int DesarrolladorId { get; set; }
    public string? Nombre { get; set; }
    public int Dni { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Observaciones { get; set; }
    public bool Eliminado { get; set; }
    public int PuestoLaboralId { get; set; }
    public virtual PuestoLaboral? PuestoLaboral { get; set; }
}