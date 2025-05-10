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
    public class CategoriasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Categorias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            return await _context.Categorias.ToListAsync();
        }

        // GET: api/Categorias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Categoria>> GetCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);

            if (categoria == null)
            {
                return NotFound();
            }

            return categoria;
        }

        // PUT: api/Categorias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategoria(int id, Categoria categoria)
        {
            var existeCategoria = await _context.Categorias.Where(c => c.Descripcion == categoria.Descripcion && c.CategoriaId != id).CountAsync(); // Verifica si ya existe una categoría con la misma descripción
            if (existeCategoria > 0)
            {
                return BadRequest("Ya existe una categoría con la misma descripción."); 
            }

            if (id != categoria.CategoriaId)
            {
                return BadRequest();
            }
            
            _context.Entry(categoria).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoriaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new {codigo = 1, mensaje = "Categoría actualizada correctamente."}); // Retorna un mensaje de éxito
        }

        // POST: api/Categorias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            var existeCategoria = await _context.Categorias.Where(c => c.Descripcion == categoria.Descripcion).CountAsync(); // Verifica si ya existe una categoría con la misma descripción
            if (existeCategoria > 0)
            {
                return BadRequest("Ya existe una categoría con la misma descripción.");
            }

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCategoria", new { id = categoria.CategoriaId }, categoria);
        }

        // DELETE: api/Categorias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id); // Verifica si la categoría existe
            if (categoria == null)
            {
                return NotFound();
            }

            categoria.Eliminado = true; // Marca la categoría como eliminada
            await _context.SaveChangesAsync();


            return NoContent();
        }


        private bool CategoriaExists(int id)
        {
            return _context.Categorias.Any(e => e.CategoriaId == id);
        }
    }
}
