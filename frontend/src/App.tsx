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

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('home');
  const [disruptions, setDisruptions] = useState<DisruptionIncident[]>(mockDisruptions);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const activeDisruptionsCount = disruptions.filter((d) => d.status !== 'Resolved').length;

  const handleAddDisruption = (newIncident: DisruptionIncident) => {
    setDisruptions([newIncident, ...disruptions]);
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
            onNavigateToScenarioWithEntity={() => {
              setCurrentSection('what-if');
            }}
          />
        );
      case 'what-if':
        return <WhatIfScreen onNavigate={setCurrentSection} />;
      case 'disruptions':
        return (
          <DisruptionsScreen
            disruptions={disruptions}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigate={setCurrentSection}
          />
        );
      case 'impact-analysis':
        return <ImpactAnalysisScreen onNavigate={setCurrentSection} />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Persistent High-Contrast Dark Navy Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        activeDisruptionsCount={activeDisruptionsCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentSection={currentSection}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onNavigateToScenario={() => setCurrentSection('what-if')}
        />

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Quick Intake Modal for Disruptions */}
      <ReportDisruptionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddDisruption}
      />
    </div>
  );
};

export default App;
