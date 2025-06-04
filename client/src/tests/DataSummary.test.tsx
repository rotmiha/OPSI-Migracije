/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import { test, expect } from "vitest";
import DataSummary from "../components/DataSummary";

test("prikaže povzetek podatkov", () => {
  render(
    <DataSummary
      selectedParameterName="selitve_v_obcino"
      stats={{ min: 10, max: 30, avg: 20, median: 20 }}
    />
  );

  // Preveri labelo in njeno pripadajočo vrednost (avg)
  const povprecjeLabel = screen.getByText(/Povprečje/i);
  const povprecjeContainer = povprecjeLabel.closest("div")!;
  expect(within(povprecjeContainer).getByText("20")).toBeInTheDocument();

  // Preveri mediano
  const medianaLabel = screen.getByText(/Mediana/i);
  const medianaContainer = medianaLabel.closest("div")!;
  expect(within(medianaContainer).getByText("20")).toBeInTheDocument();

  // Minimum in maksimum sta unikatna
  expect(screen.getByText("10")).toBeInTheDocument(); // min
  expect(screen.getByText("30")).toBeInTheDocument(); // max
});
