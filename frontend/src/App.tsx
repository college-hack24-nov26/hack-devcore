import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeScreen } from './screens/HomeScreen';
import { SupplyChainScreen } from './screens/SupplyChainScreen';
import { WhatIfScreen } from './screens/WhatIfScreen';
import { DisruptionsScreen } from './screens/DisruptionsScreen';
import { ImpactAnalysisScreen } from './screens/ImpactAnalysisScreen';
import { RecoveryPlanningScreen } from './screens/RecoveryPlanningScreen';
import { ReportDisruptionModal } from './components/ReportDisruptionModal';
import type { NavigationSection, DisruptionIncident } from './types';
import { mockDisruptions } from './data/mockData';
import type { SimulationResult } from '../../shared/types';

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('home');
  const [disruptions, setDisruptions] = useState<DisruptionIncident[]>(mockDisruptions);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const activeDisruptionsCount = disruptions.filter(
    (disruption) => disruption.status !== 'Resolved',
  ).length;

  const handleAddDisruption = (newIncident: DisruptionIncident) => {
    setDisruptions((previous) => [newIncident, ...previous]);
  };

  const renderActiveScreen = () => {
    switch (currentSection) {
      case 'home':
        return (
          <HomeScreen
            disruptions={disruptions}
            onNavigate={setCurrentSection}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        );

      case 'supply-chain':
        return (
          <SupplyChainScreen
            onNavigate={setCurrentSection}
            onNavigateToScenarioWithEntity={() => setCurrentSection('what-if')}
          />
        );

      case 'what-if':
        return (
          <WhatIfScreen
            onNavigate={setCurrentSection}
            onSimulationComplete={setSimulationResult}
          />
        );

      case 'disruptions':
        return (
          <DisruptionsScreen
            disruptions={disruptions}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigate={setCurrentSection}
          />
        );

      case 'impact-analysis':
        return (
          <ImpactAnalysisScreen
            onNavigate={setCurrentSection}
            result={simulationResult}
          />
        );

      case 'recovery-planning':
        return <RecoveryPlanningScreen onNavigate={setCurrentSection} />;

      default:
        return (
          <HomeScreen
            disruptions={disruptions}
            onNavigate={setCurrentSection}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        activeDisruptionsCount={activeDisruptionsCount}
      />

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Header
          currentSection={currentSection}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onNavigateToScenario={() => setCurrentSection('what-if')}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderActiveScreen()}
        </main>
      </div>

      <ReportDisruptionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddDisruption}
      />
    </div>
  );
};

export default App;
