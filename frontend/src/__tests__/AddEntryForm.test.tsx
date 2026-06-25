import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEntryForm from "../components/AddEntryForm";

function setup(onAdd = vi.fn()) {
  render(<AddEntryForm onAdd={onAdd} />);
  return { onAdd };
}

function openForm() {
  fireEvent.click(screen.getByRole("button", { name: "+ Add Entry" }));
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Satellite ID"), "SAT-001");
  fireEvent.change(screen.getByLabelText("Timestamp"), {
    target: { value: "2024-06-01T12:00" },
  });
  await user.clear(screen.getByLabelText("Altitude (km)"));
  await user.type(screen.getByLabelText("Altitude (km)"), "400");
  await user.clear(screen.getByLabelText("Velocity (km/s)"));
  await user.type(screen.getByLabelText("Velocity (km/s)"), "7.8");
}

describe("AddEntryForm", () => {
  it("shows the toggle button and hides the form initially", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "+ Add Entry" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save Entry" }),
    ).not.toBeInTheDocument();
  });

  it("shows the form when the toggle button is clicked", () => {
    setup();
    openForm();
    expect(
      screen.getByRole("button", { name: "Save Entry" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "✕ Cancel" }),
    ).toBeInTheDocument();
  });

  it("hides the form when Cancel is clicked", () => {
    setup();
    openForm();
    fireEvent.click(screen.getByRole("button", { name: "✕ Cancel" }));
    expect(
      screen.queryByRole("button", { name: "Save Entry" }),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    setup();
    openForm();
    await user.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(screen.getByText("Satellite ID is required")).toBeInTheDocument();
    expect(screen.getByText("Timestamp is required")).toBeInTheDocument();
    expect(
      screen.getByText("Altitude must be a positive number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Velocity must be a positive number"),
    ).toBeInTheDocument();
  });

  it("shows a validation error when altitude is zero", async () => {
    const user = userEvent.setup();
    setup();
    openForm();
    await user.type(screen.getByLabelText("Satellite ID"), "SAT-001");
    fireEvent.change(screen.getByLabelText("Timestamp"), {
      target: { value: "2024-06-01T12:00" },
    });
    // fireEvent.submit bypasses HTML5 native constraint validation (min attr) so
    // React's own validation logic runs and we can assert our custom error message
    fireEvent.change(screen.getByLabelText("Altitude (km)"), {
      target: { value: "0" },
    });
    await user.type(screen.getByLabelText("Velocity (km/s)"), "7.8");
    fireEvent.submit(document.querySelector("form")!);
    expect(
      screen.getByText("Altitude must be a positive number"),
    ).toBeInTheDocument();
  });

  it("calls onAdd with correct data and closes the form on successful submit", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    openForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        satelliteId: "SAT-001",
        altitude: 400,
        velocity: 7.8,
        status: "nominal",
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
    expect(
      await screen.findByRole("button", { name: "+ Add Entry" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save Entry" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the form open when onAdd rejects", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockRejectedValue(new Error("Server error"));
    setup(onAdd);
    openForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(
      await screen.findByRole("button", { name: "Save Entry" }),
    ).toBeInTheDocument();
  });
});
