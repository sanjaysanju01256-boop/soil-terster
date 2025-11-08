import React from 'react';

interface SchemesPageProps {
  t: any;
}

const SIMULATED_SCHEMES = [
    {
        name: 'PM-Kisan Samman Nidhi',
        description: 'A government scheme with the objective to provide financial support to all the landholding farmer families in the country.',
        benefit: '₹6,000 per year',
        link: '#',
    },
    {
        name: 'Rythu Bandhu Scheme (Telangana)',
        description: 'A scheme to provide a grant for purchase of inputs like seeds, fertilizers, pesticides, labour and other investments for each farmer.',
        benefit: '₹5,000 per acre per season',
        link: '#',
    },
    {
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'An insurance service for farmers for their yields. It aims to provide a comprehensive insurance cover against failure of the crop.',
        benefit: 'Insurance Cover',
        link: '#',
    },
];


const SchemesPage: React.FC<SchemesPageProps> = ({ t }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t.pageTitleSchemes}</h2>
        <p className="text-gray-500 dark:text-gray-400">Information on relevant government schemes</p>
      </div>

      {SIMULATED_SCHEMES.map(scheme => (
          <div key={scheme.name} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{scheme.name}</h3>
              <p className="text-sm my-2">{scheme.description}</p>
              <div className="flex justify-between items-center mt-3">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-semibold px-3 py-1 rounded-full">{scheme.benefit}</span>
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                      Learn More &rarr;
                  </a>
              </div>
          </div>
      ))}
    </div>
  );
};

export default SchemesPage;
