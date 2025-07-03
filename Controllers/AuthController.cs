using GestionTickets.Models.Usuario;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

// Si desarrollamdos una API pura, especialmente para consumir desde frontend o apps móviles:
//Usamos a modo organizativo [Route("api/[controller]")]

// Si desarrollamos algo interno, pequeño o una app híbrida (MVC + API):
//Usamos [Route("[controller]")]

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole> rolManager,
        IConfiguration configuration)
    {
        _context = context; //CONEXION A LA BASE DE DATOS
        _userManager = userManager; //GESTION DE USUARIOS (METODOS DE REGISTRO, LOGIN, ETC.)
        _signInManager = signInManager; //GESTION DE INICIO DE SESIÓN (METODOS DE LOGIN, LOGOUT, ETC.)
        _rolManager = rolManager; //GESTION DE ROLES (METODOS DE CREACIÓN, ASIGNACIÓN, ETC.)
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        //CREAR ROLES SI NO EXISTEN
        var nombreRolCrearExiste = _context.Roles.Where(r => r.Name == "ADMINISTRADOR").SingleOrDefault(); //UNO O NULO
        if (nombreRolCrearExiste == null)
        {
            var roleResult = await _rolManager.CreateAsync(new IdentityRole("ADMINISTRADOR"));
        }

        var clienteRolCrearExiste = _context.Roles.Where(r => r.Name == "CLIENTE").SingleOrDefault();
        if (clienteRolCrearExiste == null)
        {
            var roleResult = await _rolManager.CreateAsync(new IdentityRole("CLIENTE"));
        }
        var desarrolladorRolCrearExiste = _context.Roles.Where(r => r.Name == "DESARROLLADOR").SingleOrDefault();
        if (desarrolladorRolCrearExiste == null)
        {
            var roleResult = await _rolManager.CreateAsync(new IdentityRole("DESARROLLADOR"));
        }

        //ARMAMOS EL OBJETO COMPLETANDO LOS ATRIBUTOS COMPLETADOS POR EL USUARIO
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            NombreCompleto = model.NombreCompleto
        };

        //HACEMOS USO DEL MÉTODO REGISTRAR USUARIO
        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "ADMINISTRADOR"); // ASIGNAMOS UN ROL POR DEFECTO AL USUARIO
            return Ok("Usuario registrado");
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        //BUSCAMOS EL USUARIO POR MEDIO DE EMAIL EN LA BASE DE DATOS
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            string rolNombre = "CLIENTE";
            //BUSCAR ROL QUE TIENE
            var rolUsuario = _context.UserRoles.Where(r => r.UserId == user.Id).SingleOrDefault();
            if (rolUsuario != null)
            {
                var rol = _context.Roles.Where(r => r.Id == rolUsuario.RoleId).SingleOrDefault();
                rolNombre = rol.Name; // OBTENEMOS EL NOMBRE DEL ROL ASIGNADO AL USUARIO
            }
            //SI EL USUARIO ES ENCONTRADO Y LA CONTRASEÑA ES CORRECTA
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // ID DEL USUARIO
            new Claim(ClaimTypes.Name, user.UserName), // USUARIO
            new Claim("NombreCompleto", user.NombreCompleto),// NOMBRE COMPLETO DEL USUARIO
            new Claim (ClaimTypes.Role, rolNombre), // ASIGNAMOS EL ROL AL USUARIO
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // JTI (JWT ID) - IDENTIFICADOR ÚNICO DEL TOKEN
            };
         
            //RECUPERAMOS LA KEY SETEADA EN EL APPSETTING
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            //ARMAMOS EL OBJETO CON LOS ATRIBUTOS PARA GENERAR EL TOKEN
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(15), //TIEMPO DE EXPIRACIÓN DEL TOKEN
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            // GENERAMOS EL REFRESH TOKEN
            var refreshToken = GenerarRefreshToken();
            //GUARDAMOS EN BASE DE DATOS EL REFRESH TOKEN
            await _userManager.SetAuthenticationTokenAsync(user, "MyApp", "RefreshToken", refreshToken);

            return Ok(new
            {
                token = jwt,
                refreshToken = refreshToken,
                
                nombreCompleto = user.NombreCompleto,
            });
        }

        return Unauthorized("Credenciales inválidas");
    }

    private string GenerarRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    [HttpPost("refresh-token")]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);
    if (user == null)
        return Unauthorized();

    var savedToken = await _userManager.GetAuthenticationTokenAsync(user, "MyApp", "RefreshToken");
    if (savedToken != model.RefreshToken)
        return Unauthorized("Refresh token inválido");

    // BUSCAR ROL QUE TIENE
    string rolNombre = "CLIENTE";
    var rolUsuario = _context.UserRoles.Where(r => r.UserId == user.Id).SingleOrDefault();
    if (rolUsuario != null)
    {
        var rol = _context.Roles.Where(r => r.Id == rolUsuario.RoleId).SingleOrDefault();
        rolNombre = rol.Name;
    }

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim("NombreCompleto", user.NombreCompleto),
        new Claim(ClaimTypes.Role, rolNombre),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var newToken = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Issuer"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(15),
        signingCredentials: creds
    );

    var jwt = new JwtSecurityTokenHandler().WriteToken(newToken);

    var newRefreshToken = GenerarRefreshToken();
    await _userManager.SetAuthenticationTokenAsync(user, "MyApp", "RefreshToken", newRefreshToken);

    return Ok(new
    {
        token = jwt,
        refreshToken = newRefreshToken,
        nombreCompleto = user.NombreCompleto,
    });
}

    // [HttpPost("refresh-token")]
    // public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest model)
    // {
    //     //BUSCAMOS EL USUARIO POR EMAIL EN BASE DE DATOS
    //     var user = await _userManager.FindByEmailAsync(model.Email);
    //     if (user == null)
    //         return Unauthorized();

            

    //     //BUSCAMOS EL TOKENREFRESH GUARDADO
    //     var savedToken = await _userManager.GetAuthenticationTokenAsync(user, "MyApp", "RefreshToken");

    //     //COMPARAMOS EL REFRESH TOKEN DE BD CON EL GUARDADO EN EL DISPOSITIVO DEL USUARIO PARA UNA MAYOR SEGURIDAD
    //     if (savedToken != model.RefreshToken)
    //         return Unauthorized("Refresh token inválido");

    //     //GENERAMOS EL NUEVO TOKEN DE ACCESO PRINCIPAL
    //     var claims = new[]
    //     {
    //     new Claim(ClaimTypes.Name, user.UserName),
    //     new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    // };

    //     var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    //     var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    //     var newToken = new JwtSecurityToken(
    //         issuer: _configuration["Jwt:Issuer"],
    //         audience: _configuration["Jwt:Issuer"],
    //         claims: claims,
    //         expires: DateTime.Now.AddMinutes(15), //
    //         signingCredentials: creds
    //     );

    //     var jwt = new JwtSecurityTokenHandler().WriteToken(newToken);

    //     //GENERAMOS UN NUEVO REFRESH TOCKEN
    //     var newRefreshToken = GenerarRefreshToken();
    //     //VOLVEMOS A GUARDAR ESE REGISTRO
    //     await _userManager.SetAuthenticationTokenAsync(user, "MyApp", "RefreshToken", newRefreshToken);

    //     return Ok(new
    //     {
    //         token = jwt,
    //         refreshToken = newRefreshToken,
    //         nombreCompleto = user.NombreCompleto,
    //     });
    // }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return BadRequest();

        await _userManager.RemoveAuthenticationTokenAsync(user, "MyApp", "RefreshToken");
        return Ok("Sesión cerrada correctamente");
    }

}