using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionTickets.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCatPorPuesto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoriaPorPuesto",
                columns: table => new
                {
                    CategoriaPorPuestoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    PuestoLaboralId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriaPorPuesto", x => x.CategoriaPorPuestoId);
                    table.ForeignKey(
                        name: "FK_CategoriaPorPuesto_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "CategoriaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategoriaPorPuesto_PuestoLaboral_PuestoLaboralId",
                        column: x => x.PuestoLaboralId,
                        principalTable: "PuestoLaboral",
                        principalColumn: "PuestoLaboralId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategoriaPorPuesto_CategoriaId",
                table: "CategoriaPorPuesto",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoriaPorPuesto_PuestoLaboralId",
                table: "CategoriaPorPuesto",
                column: "PuestoLaboralId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoriaPorPuesto");
        }
    }
}
