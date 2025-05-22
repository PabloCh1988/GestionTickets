using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTickets.Migrations
{
    /// <inheritdoc />
    public partial class MigracionHistorialTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HistorialTicket",
                columns: table => new
                {
                    HistorialTicketId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    CampoModificado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorAnterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorNuevo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCambio = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialTicket", x => x.HistorialTicketId);
                    table.ForeignKey(
                        name: "FK_HistorialTicket_Tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Tickets",
                        principalColumn: "TicketId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistorialTicket_TicketId",
                table: "HistorialTicket",
                column: "TicketId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistorialTicket");
        }
    }
}
