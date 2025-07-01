using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTickets.Migrations
{
    /// <inheritdoc />
    public partial class CambiosHistorialTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cliente_AspNetUsers_UsuarioClienteId",
                table: "Cliente");

            migrationBuilder.DropIndex(
                name: "IX_Cliente_UsuarioClienteId",
                table: "Cliente");

            migrationBuilder.DropColumn(
                name: "UsuarioClienteId",
                table: "Cliente");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsuarioClienteId",
                table: "Cliente",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cliente_UsuarioClienteId",
                table: "Cliente",
                column: "UsuarioClienteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cliente_AspNetUsers_UsuarioClienteId",
                table: "Cliente",
                column: "UsuarioClienteId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
