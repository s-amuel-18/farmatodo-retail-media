import { act, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./toast-context";

function Consumer() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Campaña aprobada.", "approved")}>show-approved</button>
      <button onClick={() => showToast("Campaña rechazada.", "rejected")}>show-rejected</button>
    </div>
  );
}

describe("ToastProvider / useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders a toast with the given message when showToast is called", () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("show-approved").click();
    });

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toHaveTextContent("Campaña aprobada.");
  });

  it("renders multiple toasts with incrementing ids, preserving order", () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("show-approved").click();
    });
    act(() => {
      screen.getByText("show-rejected").click();
    });

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("Campaña aprobada.");
    expect(toasts[1]).toHaveTextContent("Campaña rechazada.");
  });

  it("auto-dismisses a toast after 4000ms", () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("show-approved").click();
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryAllByRole("status")).toHaveLength(0);
  });

  it("dismisses each toast independently based on its own timer", () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    act(() => {
      screen.getByText("show-approved").click();
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    act(() => {
      screen.getByText("show-rejected").click();
    });

    expect(screen.getAllByRole("status")).toHaveLength(2);

    // First toast has now been alive 4000ms total, second only 2000ms.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const remaining = screen.getAllByRole("status");
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toHaveTextContent("Campaña rechazada.");
  });

  it("throws when useToast is called outside a ToastProvider", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow("useToast must be used within a ToastProvider");

    consoleErrorSpy.mockRestore();
  });
});
