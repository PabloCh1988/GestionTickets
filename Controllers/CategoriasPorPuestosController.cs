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
    public class CategoriasPorPuestosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriasPorPuestosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CategoriasPorPuestos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaPorPuesto>>> GetCategoriaPorPuesto()
        {
            
            return await _context.CategoriaPorPuesto.ToListAsync();
        }

        // GET: api/CategoriasPorPuestos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaPorPuesto>> GetCategoriaPorPuesto(int id)
        {
            var categorias = await _context.CategoriaPorPuesto
            .Include(x => x.Categoria)
            .Where(x => x.PuestoLaboralId == id)
            .ToListAsync(); // Obtener todas las categorías asociadas al puesto laboral

        if (categorias == null || categorias.Count == 0)// Si no se encuentran categorías para el puesto laboral
            return NotFound();

        return Ok(categorias); // Retorna la lista de categorías asociadas al puesto laboral
        }

        // PUT: api/CategoriasPorPuestos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategoriaPorPuesto(int id, CategoriaPorPuesto categoriaPorPuesto)
        {
            if (id != categoriaPorPuesto.CategoriaPorPuestoId)
            {
                return BadRequest();
            }

            _context.Entry(categoriaPorPuesto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoriaPorPuestoExists(id))
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

        // POST: api/CategoriasPorPuestos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CategoriaPorPuesto>> PostCategoriaPorPuesto(CategoriaPorPuesto categoriaPorPuesto)
        {
            var categoriaporpuesto = await _context.CategoriaPorPuesto.Include(c => c.Categoria)
                .Include(p => p.PuestoLaboral)
                .ToListAsync(); // Obtener todas las categorías por puesto laboral

            // Verifica si ya existe una categoría con el mismo ID para este puesto laboral
            var existingEntry = await _context.CategoriaPorPuesto
                .FirstOrDefaultAsync(c => c.CategoriaId == categoriaPorPuesto.CategoriaId && c.PuestoLaboralId == categoriaPorPuesto.PuestoLaboralId); 

            if (existingEntry != null)
            {
                return Conflict("Ya existe una categoría con el mismo ID para este puesto laboral.");
            }
            _context.CategoriaPorPuesto.Add(categoriaPorPuesto); // Agrega la nueva categoría por puesto laboral
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCategoriaPorPuesto", new { id = categoriaPorPuesto.CategoriaPorPuestoId }, categoriaPorPuesto);
        }

        // DELETE: api/CategoriasPorPuestos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoriaPorPuesto(int id)
        {
            var categoriaPorPuesto = await _context.CategoriaPorPuesto.FindAsync(id);
            if (categoriaPorPuesto == null)
            {
                return NotFound();
            }

            _context.CategoriaPorPuesto.Remove(categoriaPorPuesto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoriaPorPuestoExists(int id)
        {
            return _context.CategoriaPorPuesto.Any(e => e.CategoriaPorPuestoId == id);
        }
    }
}
