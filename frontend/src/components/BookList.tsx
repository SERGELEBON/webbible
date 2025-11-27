import React from 'react';
import { Book } from 'lucide-react';
import type { BibleBook } from '../hooks/useBible';

interface BookListProps {
  books: BibleBook[];
  onSelectBook: (book: BibleBook) => void;
  selectedBookId?: string;
}

const BookList: React.FC<BookListProps> = ({ books, onSelectBook, selectedBookId }) => {
  const oldTestament = books.filter((b) => b.testament === 'OT');
  const newTestament = books.filter((b) => b.testament === 'NT');

  const renderBooks = (bookList: BibleBook[], title: string) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {bookList.map((book) => (
          <button
            key={book.id}
            onClick={() => onSelectBook(book)}
            className={`p-3 rounded-lg text-left text-sm font-medium transition-colors ${
              selectedBookId === book.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
    </div>
  );

  return (
    <div>
      {renderBooks(oldTestament, 'Ancien Testament')}
      {renderBooks(newTestament, 'Nouveau Testament')}
    </div>
  );
};

export default BookList;