using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore;
using GestionTickets.Models;



public class ApplicationDbContext : IdentityDbContext<ApplicationUser>

{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)

        : base(options)

    {

    }
    



    // Agrega tus DbSet aquí
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<ComentariosTicket> ComentariosTickets { get; set; }

public DbSet<GestionTickets.Models.HistorialTicket> HistorialTicket { get; set; } = default!;
}