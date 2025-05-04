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
    public class ComentariosTicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ComentariosTicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ComentariosTickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComentariosTicket>>> GetComentariosTickets()
        {
            return await _context.ComentariosTickets.ToListAsync();
        }

        // GET: api/ComentariosTickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ComentariosTicket>> GetComentariosTicket(int id)
        {
            var comentariosTicket = await _context.ComentariosTickets.FindAsync(id);

            if (comentariosTicket == null)
            {
                return NotFound();
            }

            return comentariosTicket;
        }

        // PUT: api/ComentariosTickets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComentariosTicket(int id, ComentariosTicket comentariosTicket)
        {
            if (id != comentariosTicket.ComentariosTicketId)
            {
                return BadRequest();
            }

            _context.Entry(comentariosTicket).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ComentariosTicketExists(id))
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

        // POST: api/ComentariosTickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ComentariosTicket>> PostComentariosTicket(ComentariosTicket comentariosTicket)
        {
            _context.ComentariosTickets.Add(comentariosTicket);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetComentariosTicket", new { id = comentariosTicket.ComentariosTicketId }, comentariosTicket);
        }

        // DELETE: api/ComentariosTickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComentariosTicket(int id)
        {
            var comentariosTicket = await _context.ComentariosTickets.FindAsync(id);
            if (comentariosTicket == null)
            {
                return NotFound();
            }

            _context.ComentariosTickets.Remove(comentariosTicket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ComentariosTicketExists(int id)
        {
            return _context.ComentariosTickets.Any(e => e.ComentariosTicketId == id);
        }
    }
}
