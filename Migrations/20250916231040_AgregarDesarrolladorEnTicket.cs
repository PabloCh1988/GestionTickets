using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTickets.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDesarrolladorEnTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DesarrolladorId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_DesarrolladorId",
                table: "Tickets",
                column: "DesarrolladorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Desarrollador_DesarrolladorId",
                table: "Tickets",
                column: "DesarrolladorId",
                principalTable: "Desarrollador",
                principalColumn: "DesarrolladorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Desarrollador_DesarrolladorId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_DesarrolladorId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DesarrolladorId",
                table: "Tickets");
        }
    }
}
