export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Verse {
  id: string;
  number: number;
  text: string;
  reference?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  verses?: Verse[];
}
