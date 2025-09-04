using System.ComponentModel.DataAnnotations;

namespace GestionTickets.Models.ModelsVistas

{
    public class CategoriaTickets
    {
        [Key]
        public int CategoriaId { get; set; }
        public string? Nombre { get; set; }
        public List<VistaTickets>? Tickets { get; set; }
    }
}