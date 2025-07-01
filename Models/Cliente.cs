namespace GestionTickets.Models;

public class Cliente
{
    public int ClienteId { get; set; }
    public string? Nombre { get; set; }
    public int Dni { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Observaciones { get; set; }
    public bool Eliminado { get; set; }

}

public class FiltarCliente
{
    public int? Eliminado { get; set; }
}