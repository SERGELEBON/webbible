import React from 'react';

interface ChapterListProps {
  totalChapters: number;
  selectedChapter?: number;
  onSelectChapter: (chapter: number) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  totalChapters,
  selectedChapter,
  onSelectChapter,
}) => {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => (
        <button
          key={chapter}
          onClick={() => onSelectChapter(chapter)}
          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
            selectedChapter === chapter
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {chapter}
        </button>
      ))}
    </div>
  );
};

export default ChapterList;