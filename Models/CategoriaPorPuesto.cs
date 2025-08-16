namespace GestionTickets.Models
{
    public class CategoriaPorPuesto
    {
        public int CategoriaPorPuestoId { get; set; }
        public int CategoriaId { get; set; }
        public int PuestoLaboralId { get; set; }

        // Relación con la tabla de Categorías
        public virtual Categoria? Categoria { get; set; }

        // Relación con la tabla de Puestos Laborales
        public virtual PuestoLaboral? PuestoLaboral { get; set; }
    }
}