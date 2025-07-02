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
    public class DesarrolladoresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DesarrolladoresController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Desarrolladores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Desarrollador>>> GetDesarrollador()
        {
            return await _context.Desarrollador.ToListAsync();
        }

        // GET: api/Desarrolladores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Desarrollador>> GetDesarrollador(int id)
        {
            var desarrollador = await _context.Desarrollador.FindAsync(id);

            if (desarrollador == null)
            {
                return NotFound();
            }

            return desarrollador;
        }

        // PUT: api/Desarrolladores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDesarrollador(int id, Desarrollador desarrollador)
        {
            if (id != desarrollador.DesarrolladorId)
            {
                return BadRequest();
            }

            _context.Entry(desarrollador).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DesarrolladorExists(id))
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

        // POST: api/Desarrolladores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Desarrollador>> PostDesarrollador(Desarrollador desarrollador)
        {
            _context.Desarrollador.Add(desarrollador);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDesarrollador", new { id = desarrollador.DesarrolladorId }, desarrollador);
        }

        // DELETE: api/Desarrolladores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDesarrollador(int id)
        {
            var desarrollador = await _context.Desarrollador.FindAsync(id);
            if (desarrollador == null)
            {
                return NotFound();
            }

            _context.Desarrollador.Remove(desarrollador);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DesarrolladorExists(int id)
        {
            return _context.Desarrollador.Any(e => e.DesarrolladorId == id);
        }
    }
}
