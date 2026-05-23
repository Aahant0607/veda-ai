'use client';

import { Download, Printer } from 'lucide-react';

export default function OutputPage() {
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} /> Print
        </button>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors">
          <Download size={16} /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-none sm:rounded-xl shadow-sm p-6 sm:p-16 text-black print:p-0 print:shadow-none min-h-[1056px]">

        {/* Document Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">Delhi Public School, Sector-4, Bokaro</h1>
          <h2 className="text-lg font-bold mt-2">Subject: Science</h2>
          <p className="text-sm font-semibold mt-1">Class: 8th</p>
          <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm font-semibold gap-2 sm:gap-0">
            <span>Time Allowed: 45 minutes</span>
            <span>Maximum Marks: 20</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-sm font-bold italic">All questions are compulsory unless stated otherwise.</p>
        </div>

        {/* Student Detail Fields */}
        <div className="space-y-3 mb-10 text-sm font-semibold">
          <div className="flex gap-2">
            <span className="w-28">Name:</span>
            <div className="border-b border-black flex-1 max-w-xs"></div>
          </div>
          <div className="flex gap-2">
            <span className="w-28">Roll Number:</span>
            <div className="border-b border-black flex-1 max-w-xs"></div>
          </div>
          <div className="flex gap-2">
            <span className="w-28">Class: 8th</span>
            <span className="ml-4">Section:</span>
            <div className="border-b border-black w-24"></div>
          </div>
        </div>

        {/* Section A */}
        <div className="text-center font-bold text-lg mb-6 underline">Section A</div>
        <div className="space-y-6 text-sm mb-16">
          <p className="font-bold">Short Answer Questions</p>
          <p className="italic text-gray-700">Attempt all questions. Each question carries 2 marks.</p>
          <ol className="list-decimal pl-5 space-y-4 font-medium">
            <li>[Easy] Define electroplating. Explain its purpose. [2 Marks]</li>
            <li>[Moderate] What is the role of a conductor in the process of electrolysis? [2 Marks]</li>
            <li>[Easy] Why does a solution of copper sulfate conduct electricity? [2 Marks]</li>
            <li>[Moderate] Describe one example of the chemical effect of electric current in daily life. [2 Marks]</li>
            <li>[Moderate] Explain why electric current is said to have chemical effects. [2 Marks]</li>
            <li>[Challenging] How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved. [2 Marks]</li>
            <li>[Challenging] What happens at the cathode and anode during the electrolysis of water? Name the gases evolved. [2 Marks]</li>
            <li>[Easy] Mention the type of current used in electroplating and justify why it is used. [2 Marks]</li>
            <li>[Moderate] What is the importance of electric current in the field of metallurgy? [2 Marks]</li>
            <li>[Challenging] Explain with a chemical equation how copper is deposited during the electroplating of an object. [2 Marks]</li>
          </ol>

          <div className="text-center font-bold mt-10 pt-10 border-t border-gray-300">
            End of Question Paper
          </div>
        </div>

        {/* Answer Key */}
        <div className="print:break-before-page border-t-2 border-black pt-10">
          <h3 className="font-bold text-lg mb-6 underline">Answer Key:</h3>
          <ol className="list-decimal pl-5 space-y-6 text-sm font-medium text-gray-800">
            <li>
              Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.
            </li>
            <li>
              A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.
            </li>
            <li>
              Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.
            </li>
            <li>
              An example is the electroplating of silver on jewelry to prevent tarnishing.
            </li>
            <li>
              Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.
            </li>
            <li>
              Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons:
              <br />
              <span className="inline-block mt-2 font-mono bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                2H₂O + 2e⁻ → H₂ + 2OH⁻
              </span>
              <br />
              <span className="inline-block mt-1 font-mono bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                Na⁺ + OH⁻ → NaOH (in solution)
              </span>
            </li>
            <li>
              At the cathode: water is reduced to hydrogen gas and hydroxide ions.
              <br />
              At the anode: water is oxidized to oxygen gas and hydrogen ions.
            </li>
            <li>
              Direct current (DC) is used in electroplating because it flows in one direction consistently, ensuring uniform deposition of metal ions on the object.
            </li>
            <li>
              Electric current is used in metallurgy to extract and purify metals such as aluminium and copper through the process of electrolysis.
            </li>
            <li>
              At the cathode, copper ions in solution gain electrons and deposit as copper metal:
              <br />
              <span className="inline-block mt-2 font-mono bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                Cu²⁺ + 2e⁻ → Cu (solid)
              </span>
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}