import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("enables both buttons when hasNextPage and hasPrevPage are true", () => {
    render(<Pagination hasNextPage hasPrevPage onNext={jest.fn()} onPrev={jest.fn()} />);

    expect(screen.getByRole("button", { name: /Anterior/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Siguiente/ })).toBeEnabled();
  });

  it("calls onPrev and announces the previous page when Anterior is clicked", async () => {
    const user = userEvent.setup();
    const onPrev = jest.fn();
    render(<Pagination hasNextPage hasPrevPage onNext={jest.fn()} onPrev={onPrev} />);

    await user.click(screen.getByRole("button", { name: /Anterior/ }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Mostrando página anterior.");
  });

  it("calls onNext and announces the next page when Siguiente is clicked", async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    render(<Pagination hasNextPage hasPrevPage onNext={onNext} onPrev={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /Siguiente/ }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Mostrando página siguiente.");
  });

  it("disables both buttons when hasNextPage and hasPrevPage are false, and clicks do nothing", async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    const onPrev = jest.fn();
    render(<Pagination hasNextPage={false} hasPrevPage={false} onNext={onNext} onPrev={onPrev} />);

    const prevButton = screen.getByRole("button", { name: /Anterior/ });
    const nextButton = screen.getByRole("button", { name: /Siguiente/ });
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    await user.click(prevButton);
    await user.click(nextButton);

    expect(onPrev).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
