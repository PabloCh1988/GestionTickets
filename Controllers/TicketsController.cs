using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionTickets.Models;

namespace GestionTickets.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            return await _context.Tickets.ToListAsync();
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
                if (ticketEditar != null)
                {  // Campos que se pueden editar
                    // Se asignan los nuevos valores a los campos editables
                    ticketEditar.Titulo = ticket.Titulo;
                    ticketEditar.Descripcion = ticket.Descripcion;
                    ticketEditar.Prioridad = ticket.Prioridad;
                    ticketEditar.CategoriaId = ticket.CategoriaId;
                    
                }
                await _context.SaveChangesAsync();
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
