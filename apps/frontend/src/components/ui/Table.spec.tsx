import { render, screen } from "@testing-library/react";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui";

function renderTable() {
  return render(
    <Table caption="Lista de campanas" data-testid="table" className="extra-table-class">
      <TableHead data-testid="thead" className="extra-thead-class">
        <TableRow>
          <Th>Nombre</Th>
          <Th scope="row" className="extra-th-class">
            Estado
          </Th>
        </TableRow>
      </TableHead>
      <TableBody data-testid="tbody">
        <TableRow className="extra-row-class">
          <Td className="extra-td-class">Campana 1</Td>
          <Td>Aprobada</Td>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe("Table", () => {
  it("renders the caption with sr-only class", () => {
    renderTable();
    const caption = screen.getByText("Lista de campanas");
    expect(caption.tagName).toBe("CAPTION");
    expect(caption).toHaveClass("sr-only");
  });

  it("does not render a caption element when no caption prop is given", () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <Td>Value</Td>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.queryByRole("caption" as never)).not.toBeInTheDocument();
    expect(document.querySelector("caption")).not.toBeInTheDocument();
  });

  it("merges className on the table element", () => {
    renderTable();
    expect(screen.getByTestId("table")).toHaveClass("extra-table-class", "w-full", "border-collapse");
  });

  it("merges className on TableHead and TableBody, renders real table structure", () => {
    renderTable();
    expect(screen.getByTestId("thead")).toHaveClass("extra-thead-class", "border-b", "border-border");
    expect(screen.getByTestId("tbody").tagName).toBe("TBODY");
  });

  it("Th defaults to scope=col but can be overridden", () => {
    renderTable();
    const nombreHeader = screen.getByRole("columnheader", { name: "Nombre" });
    expect(nombreHeader).toHaveAttribute("scope", "col");

    const estadoHeader = screen.getByRole("rowheader", { name: "Estado" });
    expect(estadoHeader).toHaveAttribute("scope", "row");
    expect(estadoHeader).toHaveClass("extra-th-class", "text-xs", "uppercase");
  });

  it("merges className on TableRow and Td, and Td renders cell content", () => {
    renderTable();
    const cell = screen.getByRole("cell", { name: "Campana 1" });
    expect(cell).toHaveClass("extra-td-class", "px-3", "py-2.5");
    const row = cell.closest("tr");
    expect(row).toHaveClass("extra-row-class", "border-b");
  });
});
