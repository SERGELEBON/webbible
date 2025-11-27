import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Calendar, CheckCircle2, Circle, BookOpen } from 'lucide-react';

interface ReadingDay {
  day: number;
  date: string;
  readings: string[];
  completed: boolean;
}

const mockPlan: ReadingDay[] = [
  { day: 1, date: '1 janvier', readings: ['Genèse 1-3', 'Matthieu 1'], completed: true },
  { day: 2, date: '2 janvier', readings: ['Genèse 4-6', 'Matthieu 2'], completed: true },
  { day: 3, date: '3 janvier', readings: ['Genèse 7-9', 'Matthieu 3'], completed: false },
  { day: 4, date: '4 janvier', readings: ['Genèse 10-12', 'Matthieu 4'], completed: false },
  { day: 5, date: '5 janvier', readings: ['Genèse 13-15', 'Matthieu 5'], completed: false },
];

export default function Plans() {
  const [plan] = useState<ReadingDay[]>(mockPlan);
  const completedDays = plan.filter((d) => d.completed).length;
  const progress = (completedDays / 365) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Plans de lecture
            </h1>
            <p className="text-gray-600">
              Lisez la Bible en un an avec un plan structuré
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Bible en un an</h2>
                <p className="text-blue-100">Votre progression</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{completedDays} jours complétés</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-blue-700 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Lectures du jour</h3>
            <div className="space-y-4">
              {plan.map((day) => (
                <div
                  key={day.day}
                  className={`border rounded-xl p-4 transition-colors ${
                    day.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {day.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Jour {day.day}</h4>
                        <span className="text-sm text-gray-600">{day.date}</span>
                      </div>
                      <div className="space-y-1">
                        {day.readings.map((reading, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>{reading}</span>
                          </div>
                        ))}
                      </div>
                      {!day.completed && (
                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">À propos de ce plan</h3>
            <p className="text-sm text-blue-800">
              Ce plan vous permet de lire toute la Bible en 365 jours. Chaque jour comprend des lectures de l'Ancien et du Nouveau Testament pour une compréhension équilibrée de la Parole de Dieu.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}