import React, { useMemo, useState } from 'react';
import { Book, ChevronDown, ChevronRight, Library } from 'lucide-react';
import type { BibleBook } from '../types/bible';

interface BookListProps {
  books: BibleBook[];
  onSelectBook: (book: BibleBook) => void;
  selectedBookId?: BibleBook['id'];
}

const SectionHeader: React.FC<{
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}> = ({ title, count, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 mb-3 transition-colors"
    aria-expanded={open}
  >
    <div className="flex items-center gap-3">
      <Library className="w-5 h-5 text-gray-600" />
      <div className="text-left">
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{count} livres</div>
      </div>
    </div>
    {open ? (
      <ChevronDown className="w-5 h-5 text-gray-600" />
    ) : (
      <ChevronRight className="w-5 h-5 text-gray-600" />
    )}
  </button>
);

const BookList: React.FC<BookListProps> = ({ books, onSelectBook, selectedBookId }) => {
  const [openOT, setOpenOT] = useState(true);
  const [openNT, setOpenNT] = useState(true);

  const { oldTestament, newTestament } = useMemo(() => ({
    oldTestament: books.filter((b) => b.testament === 'OT'),
    newTestament: books.filter((b) => b.testament === 'NT'),
  }), [books]);

  const renderBooks = (bookList: BibleBook[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {bookList.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book)}
          className={`p-3 rounded-lg text-left text-sm font-medium transition-colors border ${
            selectedBookId === book.id
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Book className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{book.name}</span>
          </div>
          <span className="text-xs opacity-75 mt-1 block">{book.chapters} chapitres</span>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHeader
        title="Ancien Testament"
        count={oldTestament.length}
        open={openOT}
        onToggle={() => setOpenOT((v) => !v)}
      />
      {openOT && (
        <div className="mb-6 animate-[fadeIn_200ms_ease-out]">
          {renderBooks(oldTestament)}
        </div>
      )}

      <SectionHeader
        title="Nouveau Testament"
        count={newTestament.length}
        open={openNT}
        onToggle={() => setOpenNT((v) => !v)}
      />
      {openNT && (
        <div className="animate-[fadeIn_200ms_ease-out]">
          {renderBooks(newTestament)}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default BookList;