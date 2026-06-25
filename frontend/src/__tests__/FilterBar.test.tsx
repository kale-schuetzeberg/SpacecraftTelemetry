import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "../components/FilterBar";

function setup() {
  const onFilterChange = vi.fn();
  render(<FilterBar onFilterChange={onFilterChange} />);
  return { onFilterChange };
}

describe("FilterBar", () => {
  it("renders satellite ID input, status select, and action buttons", () => {
    setup();
    expect(screen.getByPlaceholderText("e.g. SAT-001")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("calls onFilterChange with empty values when Apply clicked with no input", () => {
    const { onFilterChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      satelliteId: "",
      status: "",
    });
  });

  it("passes typed satellite ID when Apply is clicked", async () => {
    const user = userEvent.setup();
    const { onFilterChange } = setup();
    await user.type(screen.getByPlaceholderText("e.g. SAT-001"), "SAT-042");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      satelliteId: "SAT-042",
      status: "",
    });
  });

  it("passes selected status when Apply is clicked", async () => {
    const user = userEvent.setup();
    const { onFilterChange } = setup();
    await user.selectOptions(screen.getByRole("combobox"), "warning");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      satelliteId: "",
      status: "warning",
    });
  });

  it("resets inputs and calls onFilterChange with empty values when Reset clicked", async () => {
    const user = userEvent.setup();
    const { onFilterChange } = setup();
    await user.type(screen.getByPlaceholderText("e.g. SAT-001"), "SAT-001");
    await user.selectOptions(screen.getByRole("combobox"), "critical");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      satelliteId: "",
      status: "",
    });
    expect(screen.getByPlaceholderText("e.g. SAT-001")).toHaveValue("");
  });

  it("triggers Apply when Enter is pressed inside the satellite ID input", async () => {
    const user = userEvent.setup();
    const { onFilterChange } = setup();
    await user.type(
      screen.getByPlaceholderText("e.g. SAT-001"),
      "SAT-007{Enter}",
    );
    expect(onFilterChange).toHaveBeenCalledWith({
      satelliteId: "SAT-007",
      status: "",
    });
  });
});
