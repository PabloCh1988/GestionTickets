namespace GestionTickets.Models
{
    public class Categoria
    {
        public int CategoriaId { get; set; }
        public string? Descripcion { get; set; }
        public bool Eliminado { get; set; }

        // Relación con los tickets
        public virtual ICollection<Ticket>? Tickets { get; set; }
        public virtual ICollection<CategoriaPorPuesto>? CategoriasPorPuesto { get; set; }
    }

    public class TicketsPorCategoria
    {
        public int CategoriaID { get; set; }
        public string? Nombre { get; set; }
        public int Cantidad { get; set; }
    }
}