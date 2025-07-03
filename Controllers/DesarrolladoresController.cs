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
using Microsoft.AspNetCore.Identity;

namespace GestionTickets.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DesarrolladoresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DesarrolladoresController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Desarrolladores
        [Authorize(Roles = "ADMINISTRADOR")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Desarrollador>>> GetDesarrollador()
        {
            // 
            var desarrolladores = await _context.Desarrollador.OrderBy(d => d.Nombre).Include(d => d.PuestoLaboral)
                .Select(d => new
                {
                    d.DesarrolladorId,
                    d.Nombre,
                    d.Dni,
                    d.Email,
                    d.Telefono,
                    d.Observaciones,
                    d.Eliminado,
                    d.PuestoLaboralId,
                    PuestoLaboralDescripcion = d.PuestoLaboral.Descripcion
                })
                .ToListAsync();

            return Ok(desarrolladores);
            // return await _context.Desarrollador.OrderBy(d => d.Nombre).ToListAsync();
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
            var existeDesarrollador = await _context.Desarrollador
                .Where(d => d.Email == desarrollador.Email && d.DesarrolladorId != id)
                .CountAsync();
            var existeDni = await _context.Desarrollador
            .Where(d => d.Dni == desarrollador.Dni && d.DesarrolladorId != id)
            .CountAsync();
            if (existeDesarrollador > 0)
            {
                return BadRequest("Ya existe un desarrollador con el mismo email.");
            }
            if (existeDni > 0)
            {
                return BadRequest("Ya existe un desarrollador con el mismo DNI.");
            }
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
            // VALIDAR QUE LOS CAMPOS NO ESTÉN VACÍOS Y QUE EL DNI Y EMAIL NO EXISTAN
            if (!String.IsNullOrEmpty(desarrollador.Nombre) && desarrollador.Dni != 0 && !String.IsNullOrEmpty(desarrollador.Email))
            {
                // Verificar si ya existe un desarrollador con el mismo email o DNI
                if (!_context.Desarrollador.Any(d => d.Dni == desarrollador.Dni || d.Email == desarrollador.Email))
                {
                    _context.Desarrollador.Add(desarrollador);// Agregar el desarrollador a la base de datos
                    await _context.SaveChangesAsync();

                    //Crear un usuario Identity
                    var user = new ApplicationUser
                    {
                        UserName = desarrollador.Email,
                        Email = desarrollador.Email,
                        NombreCompleto = desarrollador.Nombre,
                    };

                    var result = await _userManager.CreateAsync(user, "Desarrollador2025."); // Contraseña por defecto
                    if (result.Succeeded)
                    {
                        // Asignar el rol de Desarrollador al usuario
                        await _userManager.AddToRoleAsync(user, "DESARROLLADOR");
                    }
                    return CreatedAtAction("GetDesarrollador", new { id = desarrollador.DesarrolladorId }, desarrollador);
                }
            }

            return BadRequest("No se puede crear el desarrollador, verifique los datos ingresados.");


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

            desarrollador.Eliminado = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DesarrolladorExists(int id)
        {
            return _context.Desarrollador.Any(e => e.DesarrolladorId == id);
        }
    }
}
