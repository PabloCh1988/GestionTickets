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
    public class HistorialTicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HistorialTicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/HistorialTickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HistorialTicket>>> GetHistorialTicket()
        {
            return await _context.HistorialTicket.ToListAsync();
        }

        // GET: api/HistorialTickets/5
        [HttpGet("{ticketId}")]
        public async Task<ActionResult<IEnumerable<HistorialTicket>>> GetHistorialTicket(int ticketId)
        {
            var historialTicket = await _context.HistorialTicket.Where(h => h.TicketId == ticketId)
            .OrderByDescending(h => h.FechaCambio).ToListAsync();

            if (historialTicket == null || historialTicket.Count == 0)
                 return NotFound();
 

            return historialTicket;
        }

        // PUT: api/HistorialTickets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHistorialTicket(int id, HistorialTicket historialTicket)
        {
            if (id != historialTicket.HistorialTicketId)
            {
                return BadRequest();
            }

            _context.Entry(historialTicket).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HistorialTicketExists(id))
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

        // POST: api/HistorialTickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<HistorialTicket>> PostHistorialTicket(HistorialTicket historialTicket)
        {

            _context.HistorialTicket.Add(historialTicket);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHistorialTicket", new { id = historialTicket.HistorialTicketId }, historialTicket);
        }

        // DELETE: api/HistorialTickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHistorialTicket(int id)
        {
            var historialTicket = await _context.HistorialTicket.FindAsync(id);
            if (historialTicket == null)
            {
                return NotFound();
            }

            _context.HistorialTicket.Remove(historialTicket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HistorialTicketExists(int id)
        {
            return _context.HistorialTicket.Any(e => e.HistorialTicketId == id);
        }
    }
}
