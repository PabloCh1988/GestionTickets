using System.ComponentModel.DataAnnotations;

namespace GestionTickets.Models.ModelsVistas

{
    public class ClienteTickets
    {
        [Key]
        public int ClienteId { get; set; }
        public string? Nombre { get; set; }
        public string? Email { get; set; }
        public List<VistaTickets>? Tickets { get; set; }

    }
}