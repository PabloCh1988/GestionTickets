using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTickets.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDesarrolladores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PuestoLaboral",
                columns: table => new
                {
                    PuestoLaboralId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PuestoLaboral", x => x.PuestoLaboralId);
                });

            migrationBuilder.CreateTable(
                name: "Desarrollador",
                columns: table => new
                {
                    DesarrolladorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dni = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    PuestoLaboralId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Desarrollador", x => x.DesarrolladorId);
                    table.ForeignKey(
                        name: "FK_Desarrollador_PuestoLaboral_PuestoLaboralId",
                        column: x => x.PuestoLaboralId,
                        principalTable: "PuestoLaboral",
                        principalColumn: "PuestoLaboralId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Desarrollador_PuestoLaboralId",
                table: "Desarrollador",
                column: "PuestoLaboralId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Desarrollador");

            migrationBuilder.DropTable(
                name: "PuestoLaboral");
        }
    }
}
