import { parseListFilters } from "./list-campaigns.query";

describe("parseListFilters", () => {
  it("returns an empty filters object when nothing is provided", () => {
    expect(parseListFilters({})).toEqual({});
  });

  it("parses a single status", () => {
    expect(parseListFilters({ status: "DRAFT" })).toEqual({ status: ["DRAFT"] });
  });

  it("parses multiple comma-separated statuses, trimming whitespace", () => {
    expect(parseListFilters({ status: "DRAFT, REJECTED" })).toEqual({
      status: ["DRAFT", "REJECTED"],
    });
  });

  it("drops unknown statuses but keeps the valid ones in the same request", () => {
    expect(parseListFilters({ status: "DRAFT,NOT_A_STATUS" })).toEqual({
      status: ["DRAFT"],
    });
  });

  it("omits the status key entirely when every value is invalid", () => {
    expect(parseListFilters({ status: "NOT_A_STATUS" })).toEqual({});
  });

  it("passes dateFrom and dateTo through unchanged", () => {
    expect(parseListFilters({ dateFrom: "2026-01-01", dateTo: "2026-01-31" })).toEqual({
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
    });
  });

  it("passes the cursor through unchanged", () => {
    expect(parseListFilters({ cursor: "campaign-42" })).toEqual({ cursor: "campaign-42" });
  });

  it("parses a valid pageSize", () => {
    expect(parseListFilters({ pageSize: "10" })).toEqual({ pageSize: 10 });
  });

  it.each(["0", "-5", "3.5", "abc", ""])(
    "ignores an invalid pageSize (%s) instead of throwing",
    (pageSize) => {
      expect(parseListFilters({ pageSize })).toEqual({});
    },
  );

  it("combines every filter in a single request", () => {
    expect(
      parseListFilters({
        status: "APPROVED,PENDING_APPROVAL",
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
        pageSize: "5",
        cursor: "campaign-1",
      }),
    ).toEqual({
      status: ["APPROVED", "PENDING_APPROVAL"],
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
      pageSize: 5,
      cursor: "campaign-1",
    });
  });
});
