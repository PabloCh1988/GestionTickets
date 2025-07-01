using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionTickets.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GestionTickets.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    // Crea la clase y hereda de la clase ControllerBase
    // Esta clase es responsable de manejar las solicitudes HTTP relacionadas con los tickets
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Se crea una variable privada de tipo ApplicationDbContext para acceder a la base de datos
        // Constructor de la clase TicketsController
        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaTickets>>> GetTickets() // Método para obtener todos los tickets
        // Devuelve una lista de tickets en formato VistaTickets, que es una clase que contiene los datos que se mostrarán
        {
            List<VistaTickets> vista = new List<VistaTickets>();

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usuarioLogueadoID = HttpContext.User.Identity?.Name;


            var tickets = await _context.Tickets.Include(t => t.Categoria).ToListAsync(); // Incluye la categoría relacionada

            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion))
            { // Recorre cada ticket y crea una instancia de VistaTickets para mostrar los datos
                // Crea una nueva instancia de VistaTickets y asigna los valores del ticket
                var ticketMostrar = new VistaTickets
                {
                    TicketId = ticket.TicketId,
                    Titulo = ticket.Titulo,
                    FechaCreacionString = ticket.FechaCreacionString,
                    UsuarioClienteId = ticket.UsuarioClienteId ?? usuarioLogueadoID, // Si el ticket no tiene un usuario asignado, se usa el usuario logueado
                    Prioridad = ticket.Prioridad,
                    EstadoString = ticket.EstadoString,
                    CategoriaString = ticket.CategoriaString,
                    PrioridadString = ticket.PrioridadString
                };
                vista.Add(ticketMostrar); // Agrega el ticket a la lista de vista
            }
            return vista.ToList(); // Retorna la lista de tickets

        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            // var mail = User.Identity?.Name; // Obtiene el correo del usuario logueado
            // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // var usuario = await _context.Users.FindAsync(userId);
            // var nombreCompleto = usuario?.NombreCompleto ?? "Desconocido";
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                usuario = ticket.UsuarioNombre,
                email = ticket.UsuarioClienteId,
                id = ticket.TicketId,
                titulo = ticket.Titulo,
                descripcion = ticket.Descripcion,
                categoriaId = ticket.CategoriaId,
                prioridad = ticket.Prioridad,
            });
        }

        // PUT: api/Tickets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, Ticket ticket)
        {
            if (id != ticket.TicketId)
            {
                return BadRequest();
            }
            // Verifica si ya existe un Ticket con la misma descripción
            var existeTicket = await _context.Tickets.Where(t => t.Titulo == ticket.Titulo && t.TicketId != id).CountAsync();
            if (existeTicket > 0) // Si existe un ticket con la misma descripción y un id diferente al que se está actualizando
            // se retorna un mensaje de error
            {
                return BadRequest("Ya existe un ticket con la misma descripción.");
            }

            try
            {   // PARA QUE FUNCIONE ESTE PUT DEBEMOS ELIMINAR EL MODIFIED DE LA CLASE TICKET
                //LLAMADA A LA BASE DE DATOS PARA EDITAR UN TICKET
                // Se busca el ticket por su ID
                var ticketEditar = await _context.Tickets.FindAsync(id);

                var userId = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var usuario = await _context.Users.FindAsync(userId);
                var nombreCompleto = usuario?.NombreCompleto ?? "Desconocido";

                // Guardar valores originales antes de editar
                string originalTitulo = ticketEditar.Titulo;
                string originalDescripcion = ticketEditar.Descripcion;
                // TENGO QUE LLAMAR A PRIORIDADTICKET PARA QUE ME TRAIGA EL ENUM
                // Y ASIGNARLO A UNA VARIABLE
                PrioridadTicket originalPrioridad = ticketEditar.Prioridad;
                int originalCategoriaId = ticketEditar.CategoriaId;

                // Se verifica si el ticket existe
                if (ticketEditar != null)
                {  // Campos que se pueden editar
                    // Se asignan los nuevos valores a los campos editables
                    ticketEditar.Titulo = ticket.Titulo;
                    ticketEditar.Descripcion = ticket.Descripcion;
                    ticketEditar.Prioridad = ticket.Prioridad;
                    ticketEditar.CategoriaId = ticket.CategoriaId;
                }

                await _context.SaveChangesAsync();

                // Guardar historial solo si hubo cambios
                if (originalTitulo != ticket.Titulo)
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Titulo",
                        ValorAnterior = originalTitulo,
                        ValorNuevo = ticket.Titulo,
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = nombreCompleto // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                if (originalDescripcion != ticket.Descripcion)
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Descripcion",
                        ValorAnterior = originalDescripcion,
                        ValorNuevo = ticket.Descripcion,
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = nombreCompleto // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                if (originalPrioridad != ticket.Prioridad)
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Prioridad",
                        ValorAnterior = originalPrioridad.ToString(),
                        ValorNuevo = ticket.Prioridad.ToString(),
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = nombreCompleto // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                if (originalCategoriaId != ticket.CategoriaId)
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Categoria",
                        ValorAnterior = originalCategoriaId.ToString(),
                        ValorNuevo = ticket.CategoriaId.ToString(),
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = nombreCompleto // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        // POST: api/Tickets/filtro
        // Este método permite filtrar los tickets según diferentes criterios
        [HttpPost("filtro")]
        public async Task<ActionResult<IEnumerable<VistaTickets>>> FiltroTicket([FromBody] FiltroTicket filtro)
        {
            List<VistaTickets> vista = new List<VistaTickets>();

            var tickets = _context.Tickets.Include(t => t.Categoria).AsQueryable();

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Obtiene el ID del usuario logueado
            // Obtiene el rol del usuario logueado
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            // Si el rol del usuario es CLIENTE, se filtran los tickets por el ID del cliente
            // Esto asegura que los clientes solo vean sus propios tickets

            // if (rol == "CLIENTE")
            // {
            //     tickets = tickets.Where(t => t.UsuarioClienteId == userId);
            // }


            if (filtro.CategoriaId > 0)
                tickets = tickets.Where(t => t.CategoriaId == filtro.CategoriaId);

            if (filtro.Estado > 0)
                tickets = tickets.Where(t => t.Estado == (EstadoTicket)filtro.Estado);

            if (filtro.Prioridad > 0)
                tickets = tickets.Where(t => t.Prioridad == (PrioridadTicket)filtro.Prioridad);

            if (filtro.FechaInicio.HasValue && filtro.FechaFin.HasValue)
            {
                DateTime FechaInicio = filtro.FechaInicio.Value;
                DateTime FechaFin = filtro.FechaFin.Value
                    .AddHours(23)
                    .AddMinutes(59)
                    .AddSeconds(59);

                tickets = tickets.Where(t => t.FechaCreacion >= FechaInicio && t.FechaCreacion <= FechaFin);
            }


            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion))
            {
                var ticketMostrar = new VistaTickets
                // Crea una nueva instancia de VistaTickets y asigna los valores del ticket                
                {
                    TicketId = ticket.TicketId,
                    Titulo = ticket.Titulo,
                    FechaCreacionString = ticket.FechaCreacionString,
                    Prioridad = ticket.Prioridad,
                    EstadoString = ticket.EstadoString,
                    CategoriaString = ticket.CategoriaString,
                    PrioridadString = ticket.PrioridadString
                };
                vista.Add(ticketMostrar); // Agrega el ticket a la lista de vista
            }

            return vista.ToList(); // Retorna la lista de tickets filtrados
        }

        // POST: api/Tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usuarioLogueadoID = HttpContext.User.Identity?.Name;
            // Obtener el nombre completo del usuario autenticado
            var usuario = await _context.Users.FindAsync(userId);
            var nombreCompleto = usuario?.NombreCompleto ?? "Desconocido";
            // Verifica si ya existe un Ticket con la misma descripción
            var yaExisteTicket = await _context.Tickets.Where(t => t.Titulo == ticket.Titulo).CountAsync();
            if (yaExisteTicket > 0) // Si existe un ticket con la misma descripción
            // se retorna un mensaje de error
            {
                return BadRequest("Ya existe un ticket con la misma descripción.");
            }

            // Al crear un nuevo ticket, se asignan valores por defecto a los campos
            // que no se envían en la solicitud
            ticket.FechaCreacion = DateTime.Now; // Asignar la fecha de creación al crear un nuevo ticket
            ticket.FechaCierre = Convert.ToDateTime("01/01/2025"); // Asignar una fecha de cierre por defecto
            ticket.Estado = EstadoTicket.Abierto; // Asignar el estado por defecto al crear un nuevo ticket
            ticket.UsuarioClienteId = usuarioLogueadoID; // Asignar el usuario logueado como cliente del ticket
            ticket.UsuarioNombre = nombreCompleto; // Asignar el nombre completo del usuario que crea el ticket

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicket", new { id = ticket.TicketId }, ticket); // Retorna el ticket creado
        }

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TicketExists(int id)
        {
            return _context.Tickets.Any(e => e.TicketId == id);
        }
    }
}
