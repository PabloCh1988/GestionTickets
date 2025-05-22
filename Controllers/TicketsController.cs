using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionTickets.Models;
using Microsoft.AspNetCore.Authorization;

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
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            return await _context.Tickets.Include(t => t.Categoria).ToListAsync(); // Incluye la categoría relacionada
        
        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
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
                        FechaCambio = DateTime.Now
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
                        FechaCambio = DateTime.Now
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
                        FechaCambio = DateTime.Now
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
                        FechaCambio = DateTime.Now
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

        // POST: api/Tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket)
        {  // Verifica si ya existe un Ticket con la misma descripción
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
