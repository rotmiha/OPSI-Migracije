/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import ColorLegend from "../components/ColorLegend";

// 🛠️ Mockiramo getColorForValue, ker je to uporabniška funkcija iz lib/mapUtils
vi.mock("@/lib/mapUtils", () => ({
  getColorForValue: (value: number, min: number, max: number) => "#cccccc",
}));

test("prikaže legendo za barve", () => {
  render(
    <ColorLegend
      min={0}
      max={100}
      parameterName="selitve_v_obcino"
      year={2022}
    />
  );

  // Preveri osnovne naslove in besedilo
  expect(screen.getByText(/Barvna legenda/i)).toBeInTheDocument();
  expect(screen.getByText(/selitve_v_obcino/i)).toBeInTheDocument();
  expect(screen.getByText(/Leto 2022/i)).toBeInTheDocument();

  // Preveri, da obstaja gradient z vsaj eno barvno celico
  const gradientItems = screen.getAllByRole("presentation");
  expect(gradientItems.length).toBeGreaterThan(0);
});
