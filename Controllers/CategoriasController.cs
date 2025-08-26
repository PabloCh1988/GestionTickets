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
            var usuarioLogueadoID = HttpContext.User.Identity?.Name;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            var categorias = new List<Categoria>(); // Lista para almacenar las categorías filtradas

            if (rol == "DESARROLLADOR")
            {
                var desarrollador = await _context.Desarrollador.FirstOrDefaultAsync(d => d.Email == usuarioLogueadoID); // Busca el desarrollador por su email
                var puestoDesarrollador = desarrollador?.PuestoLaboralId;// Obtiene el ID del puesto laboral del desarrollador

                var categoriasPorPuesto = await _context.CategoriaPorPuesto
                    .Where(c => c.PuestoLaboralId == puestoDesarrollador)
                    .Select(c => c.CategoriaId)
                    .ToListAsync();// Obtiene las categorías asociadas al puesto laboral del desarrollador

                var categoriasFiltradas = await _context.Categorias
                .Where(c => categoriasPorPuesto.Contains(c.CategoriaId)).OrderBy(c => c.Descripcion)
                .ToListAsync(); // Obtiene las categorías que pertenecen a las categorías asociadas al puesto laboral del desarrollador

                categorias.AddRange(categoriasFiltradas);// Agrega las categorías filtradas a la lista de categorías
            }
            else // ADMINISTRADOR y CLIENTE
            {
                var categoriasFiltradas = await _context.Categorias
                    .OrderBy(c => c.Descripcion)
                    .ToListAsync(); // Obtiene todas las categorías ordenadas por descripción

                categorias.AddRange(categoriasFiltradas); // Agrega las categorías filtradas a la lista de categorías
            }
            return categorias;
        }

        // GET: api/Categorias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Categoria>> GetCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id); // Verifica si la categoría existe

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
            if (existeCategoria > 0) // Si existe una categoría con la misma descripción y un id diferente al que se está actualizando
            // se retorna un mensaje de error
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

            return Ok(new { codigo = 1, mensaje = "Categoría actualizada correctamente." }); // Retorna un mensaje de éxito
        }

        // POST: api/Categorias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            var existeCategoria = await _context.Categorias.Where(c => c.Descripcion == categoria.Descripcion).CountAsync(); // Verifica si ya existe una categoría con la misma descripción
            if (existeCategoria > 0) // Si existe una categoría con la misma descripción
            // se retorna un mensaje de error
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
            if (categoria == null) // Si la categoria existe
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
