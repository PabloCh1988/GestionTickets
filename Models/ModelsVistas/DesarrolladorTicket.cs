using System.ComponentModel.DataAnnotations;

namespace GestionTickets.Models.ModelsVistas

{
    public class DesarrolladorTickets
    {
        [Key]
        public int DesarrolladorId { get; set; }
        public string? Nombre { get; set; }
        public string? Email { get; set; }
        public List<VistaTickets>? Tickets { get; set; }
    }
}