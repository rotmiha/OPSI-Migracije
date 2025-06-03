import * as React from "react";
import { Popover } from "@/components/ui/popover"; // We'll still use Popover's open state
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { BsLightbulb } from "react-icons/bs";
interface PopupPomocProps {
  jeOdprt: boolean;
  onZapri: () => void;
 
}

const PopupPomoc = ({ jeOdprt, onZapri}: PopupPomocProps) => {
  return (
    <>

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
          <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Razlaga posameznih parametrov</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Bruto dohodek – SKUPAJ:</strong> Skupni znesek vseh prejetih bruto dohodkov posameznika (vključno z dohodki iz dela, pokojninami itd.).</li>
                <li><strong>Dohodek iz dela:</strong> Dohodki iz zaposlitve, samozaposlitve ali drugega plačanega dela.</li>
                <li><strong>Starševski, družinski in socialni prejemki:</strong> Vključuje otroške dodatke, nadomestila za starševstvo, socialno pomoč ipd.</li>
                <li><strong>Pokojnine:</strong> Dohodki posameznikov, ki so jih prejeli kot pokojnino po upokojitvi.</li>
                <li><strong>Dohodki iz premoženja, kapitala in drugi:</strong> Vključuje najemnine, dividende, obresti in druge ne-delovne dohodke.</li>

                <li><strong>Izobrazba – SKUPAJ:</strong> Delež prebivalstva glede na doseženo izobrazbo (skupno).</li>
                <li><strong>Terciarna izobrazba:</strong> Višješolska, visokošolska, magistrska ali doktorska izobrazba.</li>
                <li><strong>Srednješolska izobrazba:</strong> Vključuje poklicno in splošno srednješolsko izobrazbo.</li>
                <li><strong>Osnovnošolska ali manj:</strong> Prebivalstvo z največ osnovnošolsko izobrazbo ali brez nje.</li>

                <li><strong>Indeks delovne migracije:</strong> Razmerje med številom zaposlenih, ki delajo izven občine prebivališča, in številom delovno aktivnih v občini.</li>
                <li><strong>Indeks delovne migracije – moški:</strong> Indeks delovne migracije ločeno za moške.</li>
                <li><strong>Indeks delovne migracije – ženske:</strong> Indeks delovne migracije ločeno za ženske.</li>

                <li><strong>Delovno aktivni v občini prebivališča:</strong> Število delovno aktivnih oseb, ki prebivajo v določeni občini.</li>
                <li><strong>Delovno aktivni v občini prebivališča – moški:</strong> Število delovno aktivnih moških v občini prebivališča.</li>
                <li><strong>Delovno aktivni v občini prebivališča – ženske:</strong> Število delovno aktivnih žensk v občini prebivališča.</li>
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

export default PopupPomoc;
