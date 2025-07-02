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
    public class PuestosLaboralesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PuestosLaboralesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PuestosLaborales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PuestoLaboral>>> GetPuestoLaboral()
        {
            return await _context.PuestoLaboral.ToListAsync();
        }

        // GET: api/PuestosLaborales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PuestoLaboral>> GetPuestoLaboral(int id)
        {
            var puestoLaboral = await _context.PuestoLaboral.FindAsync(id);

            if (puestoLaboral == null)
            {
                return NotFound();
            }

            return puestoLaboral;
        }

        // PUT: api/PuestosLaborales/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPuestoLaboral(int id, PuestoLaboral puestoLaboral)
        {
            if (id != puestoLaboral.PuestoLaboralId)
            {
                return BadRequest();
            }

            _context.Entry(puestoLaboral).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PuestoLaboralExists(id))
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

        // POST: api/PuestosLaborales
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PuestoLaboral>> PostPuestoLaboral(PuestoLaboral puestoLaboral)
        {
            _context.PuestoLaboral.Add(puestoLaboral);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPuestoLaboral", new { id = puestoLaboral.PuestoLaboralId }, puestoLaboral);
        }

        // DELETE: api/PuestosLaborales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePuestoLaboral(int id)
        {
            var puestoLaboral = await _context.PuestoLaboral.FindAsync(id);
            if (puestoLaboral == null)
            {
                return NotFound();
            }

            _context.PuestoLaboral.Remove(puestoLaboral);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PuestoLaboralExists(int id)
        {
            return _context.PuestoLaboral.Any(e => e.PuestoLaboralId == id);
        }
    }
}
