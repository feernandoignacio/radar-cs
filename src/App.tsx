import { useState } from 'react';
import { GoalCard } from './components/GoalCard.tsx';
import { Header } from './components/Header.tsx';
import { StatusCards } from './components/StatusCards.tsx';
import { SAMPLE_CLIENTS } from './sampleData.ts';
import { getSummary } from './utils/summary.ts';
import './App.css';

function App() {
  // Por enquanto usa os dados de exemplo. Na parte 3 vem do CSV.
  const [clients] = useState(SAMPLE_CLIENTS);
  const summary = getSummary(clients);

  return (
    <div className="app">
      <Header batchName="Lote de exemplo" total={summary.total} />

      <div className="app-summary">
        <GoalCard summary={summary} />
        <StatusCards summary={summary} />
      </div>
    </div>
  );
}

export default App;
