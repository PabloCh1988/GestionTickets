using System.ComponentModel.DataAnnotations;

namespace GestionTickets.Models.ModelsVistas;

public class TicketsCerradosPorMes
{
    public string Mes { get; set; } // Ej: "2025-09"
    public int Cantidad { get; set; }
    public List<TicketsCerradosPorMes>? Datos { get; set; }
}