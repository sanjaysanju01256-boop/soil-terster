import React, { useState } from 'react';
import { NPKData } from '../types';

interface FertilizerCalculatorPageProps {
  t: any;
}

const FertilizerCalculatorPage: React.FC<FertilizerCalculatorPageProps> = ({ t }) => {
  const [farmSize, setFarmSize] = useState('1');
  const [npk, setNpk] = useState<NPKData>({ nitrogen: 50, phosphorus: 25, potassium: 25 });
  const [result, setResult] = useState<NPKData | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const sizeInAcres = parseFloat(farmSize);
    if (isNaN(sizeInAcres) || sizeInAcres <= 0) {
      alert("Please enter a valid farm size.");
      return;
    }
    // Assuming NPK values are in kg/ha. 1 acre = 0.404686 ha
    const sizeInHa = sizeInAcres * 0.404686;
    setResult({
      nitrogen: npk.nitrogen * sizeInHa,
      phosphorus: npk.phosphorus * sizeInHa,
      potassium: npk.potassium * sizeInHa,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t.pageTitleFertilizer}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.fertilizerDesc}</p>
      </div>

      <form onSubmit={handleCalculate} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="farmSize" className="block text-sm font-medium">{t.farmSize}</label>
          <input
            type="number"
            id="farmSize"
            value={farmSize}
            onChange={(e) => setFarmSize(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-sm p-3"
            required
          />
        </div>
        <div className="text-center text-sm text-gray-500">Target NPK Levels (kg/hectare)</div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="nitrogen" className="block text-xs font-medium text-center">{t.nitrogen}</label>
            <input type="number" id="nitrogen" value={npk.nitrogen} onChange={e => setNpk(p => ({...p, nitrogen: +e.target.value}))} className="mt-1 w-full text-center rounded-md p-2 bg-gray-50 dark:bg-gray-800"/>
          </div>
          <div>
            <label htmlFor="phosphorus" className="block text-xs font-medium text-center">{t.phosphorus}</label>
            <input type="number" id="phosphorus" value={npk.phosphorus} onChange={e => setNpk(p => ({...p, phosphorus: +e.target.value}))} className="mt-1 w-full text-center rounded-md p-2 bg-gray-50 dark:bg-gray-800"/>
          </div>
          <div>
            <label htmlFor="potassium" className="block text-xs font-medium text-center">{t.potassium}</label>
            <input type="number" id="potassium" value={npk.potassium} onChange={e => setNpk(p => ({...p, potassium: +e.target.value}))} className="mt-1 w-full text-center rounded-md p-2 bg-gray-50 dark:bg-gray-800"/>
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg">
          {t.calculate}
        </button>
      </form>

      {result && (
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-2 text-center">{t.requiredFertilizer}</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">{t.nitrogen}</p>
              <p className="text-2xl font-bold">{result.nitrogen.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 dark:text-orange-400">{t.phosphorus}</p>
              <p className="text-2xl font-bold">{result.phosphorus.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">{t.potassium}</p>
              <p className="text-2xl font-bold">{result.potassium.toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerCalculatorPage;
