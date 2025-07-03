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
    public class ClientessController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        private readonly UserManager<ApplicationUser> _userManager; // UserManager para manejar usuarios de Identity
        public ClientessController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager; // Inyecta UserManager para manejar usuarios de Identity
        }

        // GET: api/Clientess
        [Authorize(Roles = "ADMINISTRADOR")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetCliente()
        {
            //  var usuarioLogueadoID = HttpContext.User.Identity.Name;
            //  var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            //  var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            return await _context.Cliente.OrderBy(c => c.Nombre).ToListAsync();
        }

        // GET: api/Clientess/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);

            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }

        // PUT: api/Clientess/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, Cliente cliente)
        {
            // Verifica si ya existe un cliente con el mismo email
            var existeCliente = await _context.Cliente.Where(c => c.Email == cliente.Email && c.ClienteId != id).CountAsync();
            var dniExistente = await _context.Cliente.Where(c => c.Dni == cliente.Dni && c.ClienteId != id).CountAsync(); // Verifica si ya existe un cliente con el mismo DNI
            if (dniExistente > 0) // si ya existe un cliente con el mismo DNI
            {
                return BadRequest("Ya existe un cliente con el mismo DNI.");
            }
            if (existeCliente > 0)
            {
                return BadRequest("Ya existe un cliente con el mismo email.");
            }

            if (id != cliente.ClienteId)
            {
                return BadRequest();
            }

            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClienteExists(id))
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

        // POST: api/Clientess
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Cliente>> PostCliente(Cliente cliente)
        { 
            // Validar que los campos requeridos no estén vacíos y que el DNI y Email sean válidos
            if (!String.IsNullOrEmpty(cliente.Nombre) && cliente.Dni != 0 && !String.IsNullOrEmpty(cliente.Email))
            {
                //VALIDAR QUE NO EXISTA CON EL MISMO NUMERO DE DOCUMENTO y EMAIL
                if (!_context.Cliente.Any(c => c.Dni == cliente.Dni || c.Email == cliente.Email))
                {

                    _context.Cliente.Add(cliente);
                    await _context.SaveChangesAsync();

                    // Crear un usuario de Identity para el cliente con contraseña por defecto            
                    var user = new ApplicationUser
                    {
                        UserName = cliente.Email,
                        Email = cliente.Email,
                        NombreCompleto = cliente.Nombre,
                        // Otros campos necesarios
                    };

                    var result = await _userManager.CreateAsync(user, "Ezpeleta2025."); // Crea el usuario con la contraseña
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "CLIENTE"); // Asigna el rol de cliente
                    }


                    return CreatedAtAction("GetCliente", new { id = cliente.ClienteId }, cliente);
                }
            }
            return BadRequest("No se pudo crear el cliente. Verifique los datos ingresados.");
        }


        // DELETE: api/Clientess/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

            cliente.Eliminado = true; // Marca el cliente como eliminado
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClienteExists(int id)
        {
            return _context.Cliente.Any(e => e.ClienteId == id);
        }
    }
}
