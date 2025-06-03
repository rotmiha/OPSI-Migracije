import * as React from "react";
import { Popover } from "@/components/ui/popover"; // We'll still use Popover's open state
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface PopupProps {
  jeOdprt: boolean;
  onZapri: () => void;
 
}

const Popup = ({ jeOdprt, onZapri}: PopupProps) => {
  return (
    <>
      {/* Trigger button */}
      <Button variant="outline" size="sm" onClick={onZapri}>
        <Info className="h-4 w-4 mr-2" />
        📚 Viri
      </Button>

      {/* Centered modal-style popup */}
      {jeOdprt && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onZapri}
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Viri podatkov</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <strong>Delovne migracije – izbrani kazalniki, občine, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Delovne migracije – občine, Slovenija, letno (nadomestna zbirka)</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Bruto prejeti dohodek prebivalcev, občine, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Bruto prejeti dohodek – občine, Slovenija, letno (nadomestna zbirka)</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Selitveno gibanje prebivalstva, občine, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Selitveno gibanje – občine, Slovenija, letno (nadomestna zbirka)</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Prebivalstvo, staro 15 ali več let, po izobrazbi, občine in naselja, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Skupni prirast prebivalstva, občine, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Skupni prirast – občine, Slovenija, letno (nadomestna zbirka)</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Delovno aktivno prebivalstvo – izbrani kazalniki, občine, Slovenija, letno</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
                <li>
                  <strong>Delovno aktivno prebivalstvo – občine, Slovenija, letno (nadomestna zbirka)</strong><br />
                  Statistični urad Republike Slovenije, dostop 23. 5. 2025, licenca: CC BY 4.0
                </li>
              </ul>

              {/* Close button */}
              <div className="mt-4 text-right">
                <Button onClick={onZapri} size="sm" variant="secondary">Zapri</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Popup;
