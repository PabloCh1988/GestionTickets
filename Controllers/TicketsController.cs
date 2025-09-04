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
using GestionTickets.Models.ModelsVistas;

namespace GestionTickets.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    // Crea la clase y hereda de la clase ControllerBase
    // Esta clase es responsable de manejar las solicitudes HTTP relacionadas con los tickets
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Se crea una variable privada de tipo ApplicationDbContext para acceder a la base de datos
        // Constructor de la clase TicketsController
        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets() // Método para obtener todos los tickets
        // Devuelve una lista de tickets en formato VistaTickets, que es una clase que contiene los datos que se mostrarán
        {
            var tickets = await _context.Tickets.Include(x => x.Categoria).ToListAsync();
            return tickets;
        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {

            var ticket = await _context.Tickets.FindAsync(id); // Busca el ticket por su ID
            var usuario = await _context.Users.Where(u => u.Id == ticket.UsuarioClienteId).Select(u => new // Busca el usuario asociado al ticket
            {
                u.NombreCompleto,// Selecciona solo el nombre completo y el correo del usuario
                u.Email
            }).FirstOrDefaultAsync();

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(new // Retorna el ticket junto con el nombre y correo del usuario asociado
            {
                usuario = usuario?.NombreCompleto,
                email = usuario?.Email,
                id = ticket.TicketId,
                titulo = ticket.Titulo,
                descripcion = ticket.Descripcion,
                categoriaId = ticket.CategoriaId,
                prioridad = ticket.Prioridad,
            });
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

                var userId = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value; // Obtiene el ID del usuario logueado
                var usuario = await _context.Users.FindAsync(userId); // Busca el usuario por su ID
                var nombreCompleto = usuario?.NombreCompleto ?? "Desconocido"; // Obtiene el nombre completo del usuario o "Desconocido" si no se encuentra

                // Guardar valores originales antes de editar
                string originalTitulo = ticketEditar.Titulo;
                string originalDescripcion = ticketEditar.Descripcion;
                // TENGO QUE LLAMAR A PRIORIDADTICKET PARA QUE ME TRAIGA EL ENUM
                // Y ASIGNARLO A UNA VARIABLE
                PrioridadTicket originalPrioridad = ticketEditar.Prioridad;
                int originalCategoriaId = ticketEditar.CategoriaId;

                // Se verifica si el ticket existe
                if (ticketEditar != null)
                {  // Campos que se pueden editar
                    // Se asignan los nuevos valores a los campos editables
                    ticketEditar.Titulo = ticket.Titulo;
                    ticketEditar.Descripcion = ticket.Descripcion;
                    ticketEditar.Prioridad = ticket.Prioridad;
                    ticketEditar.CategoriaId = ticket.CategoriaId;
                }

                await _context.SaveChangesAsync();

                // Guardar historial solo si hubo cambios en los campos relevantes
                if (originalTitulo != ticket.Titulo)// Si el título ha cambiado
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Titulo",
                        ValorAnterior = originalTitulo,
                        ValorNuevo = ticket.Titulo,
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = userId // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                if (originalDescripcion != ticket.Descripcion)// Si la descripción ha cambiado
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Descripcion",
                        ValorAnterior = originalDescripcion,
                        ValorNuevo = ticket.Descripcion,
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = userId // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                // {
                //     var historialTicket = new HistorialTicket
                //     {
                //         TicketId = ticket.TicketId,
                //         CampoModificado = "Descripcion",
                //         ValorAnterior = originalDescripcion,
                //         ValorNuevo = ticket.Descripcion,
                //         FechaCambio = DateTime.Now,
                //         UsuarioNombre = userId // Asignar el ID del usuario que realizó el cambio
                //     };
                //     _context.HistorialTicket.Add(historialTicket);
                //     await _context.SaveChangesAsync();
                // }
                if (originalPrioridad != ticket.Prioridad) // Si la prioridad ha cambiado
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Prioridad",
                        ValorAnterior = originalPrioridad.ToString(),
                        ValorNuevo = ticket.Prioridad.ToString(),
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = userId // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }
                if (originalCategoriaId != ticket.CategoriaId) // Si la categoría ha cambiado
                {
                    var historialTicket = new HistorialTicket
                    {
                        TicketId = ticket.TicketId,
                        CampoModificado = "Categoria",
                        ValorAnterior = originalCategoriaId.ToString(),
                        ValorNuevo = ticket.CategoriaId.ToString(),
                        FechaCambio = DateTime.Now,
                        UsuarioNombre = userId // Asignar el ID del usuario que realizó el cambio
                    };
                    _context.HistorialTicket.Add(historialTicket);
                    await _context.SaveChangesAsync();
                }

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
        // POST: api/Tickets/filtro
        // Este método permite filtrar los tickets según diferentes criterios
        [HttpPost("filtro")]

        // Recibe en el cuerpo del request([FromBody]) un objeto llamado filtro de tipo FiltroTicket.
        // Devuelve una lista de VistaTickets(una vista resumida del modelo Ticket).
        public async Task<ActionResult<IEnumerable<VistaTickets>>> FiltroTicket([FromBody] FiltroTicket filtro)
        {
            List<VistaTickets> vista = new List<VistaTickets>(); // Lista para almacenar los tickets filtrados
            var tickets = new List<Ticket>(); // Lista para almacenar los tickets obtenidos de la base de datos

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var desId = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

            if (rol == "DESARROLLADOR")
            {
                // Se busca que Desarrollador es
                var puestoLaboralId = await _context.Desarrollador
                .Where(d => d.Email == desId)
                .Select(d => d.PuestoLaboralId)
                .FirstOrDefaultAsync();
                // DEL PUESTOLABROLA DEL DESARRLLADOR BUSCAMOS LAS CATEGORIAS ASIGNADAS AL PUESTO
                var categPorPuesto = await _context.CategoriaPorPuesto
                .Where(p => p.PuestoLaboralId == puestoLaboralId)
                .Select(p => p.CategoriaId)
                .ToListAsync();

                foreach (var catId in categPorPuesto)
                {
                    var ticketsFiltrados = _context.Tickets.Include(t => t.Categoria).Where(t => t.CategoriaId == catId).ToList();
                    tickets.AddRange(ticketsFiltrados);// Agrega los tickets filtrados a la lista de tickets
                }
            }
            else if (rol == "CLIENTE") // si el rol es CLIENTE
            {
                // Filtramos los tickets por usuario
                tickets.AddRange(_context.Tickets.Include(t => t.Categoria).Where(t => t.UsuarioClienteId == userId).ToList());
            }
            else // ADMINISTRADOR
            {
                tickets.AddRange(_context.Tickets.Include(t => t.Categoria).ToList()); // Agrega los tickets filtrados a la lista de tickets
            }

            // Aplica los filtros adicionales sobre la lista en memoria
            if (filtro.CategoriaId > 0) // si se especifica una categoría
                tickets = tickets.Where(t => t.CategoriaId == filtro.CategoriaId).ToList();// Filtra por categoría

            if (filtro.Estado > 0) // si se especifica un estado
                tickets = tickets.Where(t => t.Estado == (EstadoTicket)filtro.Estado).ToList();// Filtra por estado

            if (filtro.Prioridad > 0) // si se especifica una prioridad
                tickets = tickets.Where(t => t.Prioridad == (PrioridadTicket)filtro.Prioridad).ToList();// Filtra por prioridad

            DateTime fechaInicio = new DateTime();
            bool fechaInicioValida = DateTime.TryParse(filtro.FechaInicio, out fechaInicio);

            DateTime fechaFin = new DateTime();
            bool fechaFinValida = DateTime.TryParse(filtro.FechaFin, out fechaFin);

            if (fechaInicioValida && fechaFinValida)
            {
                fechaFin = fechaFin.AddHours(23);
                fechaFin = fechaFin.AddMinutes(59);
                fechaFin = fechaFin.AddSeconds(59);
                tickets = (List<Ticket>)tickets.Where(t => t.FechaCreacion >= fechaInicio && t.FechaCreacion <= fechaFin);
            }

            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion)) // Recorre cada ticket y crea una instancia de VistaTickets para mostrar los datos
            {
                var ticketMostrar = new VistaTickets // Crea una nueva instancia de VistaTickets y asigna los valores del ticket
                {
                    TicketId = ticket.TicketId,
                    Titulo = ticket.Titulo,
                    FechaCreacionString = ticket.FechaCreacionString,
                    Prioridad = ticket.Prioridad,
                    EstadoString = ticket.EstadoString,
                    CategoriaString = ticket.Categoria?.Descripcion,
                    PrioridadString = ticket.PrioridadString,
                    UsuarioClienteId = ticket.UsuarioClienteId
                };
                vista.Add(ticketMostrar); // Agrega el ticket a la lista de vista
            }
            return vista.ToList(); // Retorna la lista de tickets filtrados
        }

        [Authorize(Roles = "ADMINISTRADOR")]
        [HttpPost("buscar")]
        public async Task<ActionResult<IEnumerable<VistaTickets>>> BuscarTicket([FromBody] BuscarTicket filtro)
        {
            List<VistaTickets> vistaCliente = new List<VistaTickets>();
            var tickets = new List<Ticket>();

            // 1. Obtener el usuario del cliente
            var emailUsuario = await _context.Cliente.Where(c => c.ClienteId == filtro.ClienteId).Select(c => c.Email).FirstOrDefaultAsync();

            var clienteUserId = await _context.Users.Where(u => u.Email == emailUsuario).Select(u => u.Id).FirstOrDefaultAsync();

            if (filtro.ClienteId > 0)
                tickets.AddRange(_context.Tickets.Include(t => t.Categoria).Where(t => t.UsuarioClienteId == clienteUserId).ToList());

            DateTime fechaInicio = new DateTime();
            bool fechaInicioValida = DateTime.TryParse(filtro.FechaInicio, out fechaInicio);

            DateTime fechaFin = new DateTime();
            bool fechaFinValida = DateTime.TryParse(filtro.FechaFin, out fechaFin);


            if (fechaInicioValida && fechaFinValida)
            {
                fechaFin = fechaFin.AddHours(23).AddMinutes(59).AddSeconds(59);

                tickets = [.. tickets.Where(t => t.FechaCreacion >= fechaInicio && t.FechaCreacion <= fechaFin)];// Filtra por rango de fechas
            }

            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion))
            {
                var ticketMostrar = new VistaTickets
                {
                    TicketId = ticket.TicketId,
                    Titulo = ticket.Titulo,
                    FechaCreacionString = ticket.FechaCreacionString,
                    Prioridad = ticket.Prioridad,
                    EstadoString = ticket.EstadoString,
                    CategoriaString = ticket.Categoria?.Descripcion,
                    PrioridadString = ticket.PrioridadString,
                    UsuarioClienteId = ticket.UsuarioClienteId
                };
                vistaCliente.Add(ticketMostrar);
            }

            return vistaCliente.ToList();
        }



        [HttpPost("grafico")]
        //TicketsPorCategoria se obtiene del Model Categorias
        // y FiltroTicket del Models Tickets
        public async Task<ActionResult<IEnumerable<TicketsPorCategoria>>> TicketsPorCategoria([FromBody] FiltroTicket filtro)
        {
            // Lista que se irá llenando con el resultado (por categoría).
            List<TicketsPorCategoria> listadoCategoriasMostrar = new List<TicketsPorCategoria>();

            // Empiezo con todos los tickets y traigo la navegación a Categoria.
            // AsQueryable permite agregar filtros dinámicamente.
            var tickets = _context.Tickets.Include(t => t.Categoria).AsQueryable();

            // Variables para parsear las fechas que vienen en filtro (suponiendo strings).
            DateTime fechaInicio = new DateTime();
            bool fechaInicioValida = DateTime.TryParse(filtro.FechaInicio, out fechaInicio);

            DateTime fechaFin = new DateTime();
            bool fechaFinValida = DateTime.TryParse(filtro.FechaFin, out fechaFin);

            // Si las dos fechas son válidas, armo un filtro por rango de fechas.
            if (fechaInicioValida && fechaFinValida)
            {
                // Ajusta la fecha fin al final del día (23:59:59) para incluir ese día completo.
                fechaFin = fechaFin.AddHours(23);
                fechaFin = fechaFin.AddMinutes(59);
                fechaFin = fechaFin.AddSeconds(59);

                // Aplico el filtro de fecha a la consulta.
                tickets = tickets.Where(t => t.FechaCreacion >= fechaInicio && t.FechaCreacion <= fechaFin);
            }

            // Si se especificó prioridad (>0), filtro por ella (se castea a la enum PrioridadTicket).
            if (filtro.Prioridad > 0)
            {
                tickets = tickets.Where(t => t.Prioridad == (PrioridadTicket)filtro.Prioridad);
            }

            // Si se especificó estado (>0), filtro por él (se castea a la enum EstadoTicket).
            if (filtro.Estado > 0)
            {
                tickets = tickets.Where(t => t.Estado == (EstadoTicket)filtro.Estado);
            }

            // Recorro los tickets ordenados por fecha de creación descendente.
            // IMPORTANTE: hasta acá 'tickets' es un IQueryable; al iterarlo EF ejecutará la consulta.
            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion))
            {
                // Busco si ya existe un elemento en la lista para la categoría del ticket actual.
                var categoriaMostrar = listadoCategoriasMostrar
                                           .Where(c => c.CategoriaID == ticket.CategoriaId)
                                           .SingleOrDefault();

                if (categoriaMostrar == null)
                {
                    // Si no existe, creo uno nuevo con Cantidad = 1
                    categoriaMostrar = new TicketsPorCategoria
                    {
                        CategoriaID = ticket.CategoriaId,
                        Nombre = ticket.CategoriaString, // aquí usan una propiedad string del ticket
                        Cantidad = 1
                    };
                    listadoCategoriasMostrar.Add(categoriaMostrar);
                }
                else
                {
                    // Si ya existe, incremento la cantidad.
                    categoriaMostrar.Cantidad += 1;
                }
            }

            // Devuelvo la lista (será serializada a JSON).
            return listadoCategoriasMostrar.ToList();
        }


        [HttpPost("ticketsporcategoria")]
        public async Task<ActionResult<IEnumerable<CategoriaTickets>>> TicketsPorCliente([FromBody] FiltroTicket filtro)
        {
            List<CategoriaTickets> categoriasMostrar = new List<CategoriaTickets>();

            var tickets = _context.Tickets.Include(t => t.Categoria).AsQueryable();

            //VER DE ACUERDO AL ROL QUE TIENE SI DEBE FILTRAR POR USUARIO O NO
            //var usuarioLogueadoID = HttpContext.User.Identity.Name;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            if (rol == "CLIENTE")
            {
                tickets = tickets.Where(t => t.UsuarioClienteId == userId);
            }

             // Variables para parsear las fechas que vienen en filtro (suponiendo strings).
            DateTime fechaInicio = new DateTime();
            bool fechaInicioValida = DateTime.TryParse(filtro.FechaInicio, out fechaInicio);

            DateTime fechaFin = new DateTime();
            bool fechaFinValida = DateTime.TryParse(filtro.FechaFin, out fechaFin);

            // Si las dos fechas son válidas, armo un filtro por rango de fechas.
            if (fechaInicioValida && fechaFinValida)
            {
                // Ajusta la fecha fin al final del día (23:59:59) para incluir ese día completo.
                fechaFin = fechaFin.AddHours(23);
                fechaFin = fechaFin.AddMinutes(59);
                fechaFin = fechaFin.AddSeconds(59);

                // Aplico el filtro de fecha a la consulta.
                tickets = tickets.Where(t => t.FechaCreacion >= fechaInicio && t.FechaCreacion <= fechaFin);
            }

            if (filtro.CategoriaId > 0)
                tickets = tickets.Where(t => t.CategoriaId == filtro.CategoriaId);

            if (filtro.Prioridad > 0)
            {
                tickets = tickets.Where(t => t.Prioridad == (PrioridadTicket)filtro.Prioridad);
            }

            if (filtro.Estado > 0)
            {
                tickets = tickets.Where(t => t.Estado == (EstadoTicket)filtro.Estado);
            }

            foreach (var ticket in tickets.OrderByDescending(t => t.FechaCreacion))
            {
                //POR CADA TICKETS VAMOS A BUSCAR EL CLIENTE  
                var categoriaMostrar = categoriasMostrar.Where(c => c.CategoriaId == ticket.CategoriaId).SingleOrDefault();
                if (categoriaMostrar == null)
                {
                    categoriaMostrar = new CategoriaTickets
                    {
                        CategoriaId = ticket.CategoriaId,
                        Nombre = ticket.CategoriaString,
                        Tickets = new List<VistaTickets>()
                    };
                    categoriasMostrar.Add(categoriaMostrar);
                }

                var ticketMostrar = new VistaTickets
                {
                    TicketId = ticket.TicketId,
                    Titulo = ticket.Titulo,
                    FechaCreacionString = ticket.FechaCreacionString,
                    Prioridad = ticket.Prioridad,
                    EstadoString = ticket.EstadoString,
                    CategoriaString = ticket.Categoria?.Descripcion,
                    PrioridadString = ticket.PrioridadString,
                    UsuarioClienteId = ticket.UsuarioClienteId
                };
                categoriaMostrar.Tickets.Add(ticketMostrar);
            }

            return categoriasMostrar.ToList();
        }




        // POST: api/Tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket)
        {
            // Obtiene el ID del usuario logueado
            // Esto se usa para asignar el ticket al usuario que lo crea
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usuarioLogueadoID = HttpContext.User.Identity?.Name;
            // Obtener el nombre completo del usuario autenticado
            var usuario = await _context.Users.FindAsync(userId);
            var nombreCompleto = usuario?.NombreCompleto ?? "Desconocido";
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            // Verifica si ya existe un Ticket con la misma descripción
            var yaExisteTicket = await _context.Tickets.Where(t => t.Titulo == ticket.Titulo).CountAsync();
            if (yaExisteTicket > 0) // Si existe un ticket con la misma descripción
            // se retorna un mensaje de error
            {
                return BadRequest("Ya existe un ticket con la misma descripción.");
            }
            // Verifica si el usuario logueado es un desarrollador
            if (rol == "DESARROLLADOR")
            {
                return BadRequest("Los desarrolladores no pueden crear Tickets.");
            }

            // Al crear un nuevo ticket, se asignan valores por defecto a los campos
            // que no se envían en la solicitud
            ticket.FechaCreacion = DateTime.Now; // Asignar la fecha de creación al crear un nuevo ticket
            ticket.FechaCierre = Convert.ToDateTime("01/01/2025"); // Asignar una fecha de cierre por defecto
            ticket.Estado = EstadoTicket.Abierto; // Asignar el estado por defecto al crear un nuevo ticket
            ticket.UsuarioClienteId = userId; // Asignar el usuario logueado como cliente del ticket


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
