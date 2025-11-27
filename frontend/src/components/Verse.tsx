import React from 'react';

interface VerseProps {
  number: number;
  text: string;
  highlight?: boolean;
}

const Verse: React.FC<VerseProps> = ({ number, text, highlight }) => {
  return (
    <div
      className={`py-2 px-4 rounded-lg transition-colors ${
        highlight ? 'bg-yellow-50' : 'hover:bg-gray-50'
      }`}
    >
      <span className="inline-flex items-start">
        <span className="text-blue-600 font-semibold text-sm mr-2 mt-1">{number}</span>
        <span className="text-gray-800 leading-relaxed">{text}</span>
      </span>
    </div>
  );
};

export default Verse;