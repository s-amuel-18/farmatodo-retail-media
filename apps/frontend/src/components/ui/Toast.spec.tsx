import { render, screen } from "@testing-library/react";
import { Toast } from "@/components/ui/Toast";
import type { ToastData } from "@/components/ui/Toast";

describe("Toast", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the message with role=status and the tone class", () => {
    jest.useFakeTimers();
    const toast: ToastData = { id: 1, message: "Hola", tone: "approved" };
    render(<Toast toast={toast} onDismiss={jest.fn()} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Hola");
    expect(status).toHaveClass("bg-status-approved-bg", "text-status-approved-fg");
  });

  it("applies the rejected and pending tone classes", () => {
    jest.useFakeTimers();
    const { rerender } = render(
      <Toast toast={{ id: 1, message: "Error", tone: "rejected" }} onDismiss={jest.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveClass("bg-status-rejected-bg", "text-status-rejected-fg");

    rerender(<Toast toast={{ id: 1, message: "Espera", tone: "pending" }} onDismiss={jest.fn()} />);
    expect(screen.getByRole("status")).toHaveClass("bg-status-pending-bg", "text-status-pending-fg");
  });

  it("calls onDismiss with the toast id after 4000ms", () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    const toast: ToastData = { id: 42, message: "Hola", tone: "approved" };
    render(<Toast toast={toast} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(3999);
    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith(42);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("clears the timeout on unmount so onDismiss is not called afterward", () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    const toast: ToastData = { id: 7, message: "Hola", tone: "approved" };
    const { unmount } = render(<Toast toast={toast} onDismiss={onDismiss} />);

    unmount();
    jest.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
