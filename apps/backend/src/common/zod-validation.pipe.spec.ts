import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  const schema = z.object({ name: z.string().min(1), quantity: z.number().int().positive() });

  it("returns the parsed value when it satisfies the schema", () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: "Campaña", quantity: 2 })).toEqual({
      name: "Campaña",
      quantity: 2,
    });
  });

  it("strips fields not declared in the schema", () => {
    const pipe = new ZodValidationPipe(schema);
    const result = pipe.transform({ name: "Campaña", quantity: 2, extra: "should be dropped" });
    expect(result).toEqual({ name: "Campaña", quantity: 2 });
  });

  it("throws BadRequestException when a required field is missing", () => {
    const pipe = new ZodValidationPipe(schema);
    expect(() => pipe.transform({ quantity: 2 })).toThrow(BadRequestException);
  });

  it("throws BadRequestException when a field has the wrong type", () => {
    const pipe = new ZodValidationPipe(schema);
    expect(() => pipe.transform({ name: "Campaña", quantity: "not-a-number" })).toThrow(
      BadRequestException,
    );
  });

  it("includes the flattened zod error in the exception response", () => {
    const pipe = new ZodValidationPipe(schema);
    try {
      pipe.transform({ name: "", quantity: -1 });
      throw new Error("expected transform to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        fieldErrors: Record<string, string[]>;
      };
      expect(response.fieldErrors.name).toBeDefined();
      expect(response.fieldErrors.quantity).toBeDefined();
    }
  });
});
