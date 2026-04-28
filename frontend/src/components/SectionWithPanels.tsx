import { type ReactNode } from "react";

interface LeftPanelProps {
  title: string;
  children: ReactNode;
  statHighlight?: string;
}

interface RightPanelProps {
  title: string;
  insights: string[];
  howToUse?: string;
}

interface SectionWithPanelsProps {
  leftPanel: LeftPanelProps;
  centerContent: ReactNode;
  rightPanel: RightPanelProps;
}

export function LeftPanel({ title, children, statHighlight }: LeftPanelProps) {
  return (
    <div className="section-left-panel">
      <h3 className="section-panel-title">{title}</h3>
      <div className="section-panel-text">{children}</div>
      {statHighlight && <div className="stat-highlight-box">{statHighlight}</div>}
    </div>
  );
}

export function RightPanel({ title, insights, howToUse }: RightPanelProps) {
  return (
    <div className="section-right-panel">
      <h3 className="section-panel-title">{title}</h3>
      <ul className="insights-list">
        {insights.map((insight, idx) => (
          <li key={idx}>{insight}</li>
        ))}
      </ul>
      {howToUse && <div className="how-to-tip">{howToUse}</div>}
    </div>
  );
}

export function SectionWithPanels({
  leftPanel,
  centerContent,
  rightPanel,
}: SectionWithPanelsProps) {
  return (
    <div className="section-with-panels">
      <LeftPanel title={leftPanel.title} statHighlight={leftPanel.statHighlight}>
        {leftPanel.children}
      </LeftPanel>
      <div>{centerContent}</div>
      <RightPanel
        title={rightPanel.title}
        insights={rightPanel.insights}
        howToUse={rightPanel.howToUse}
      />
    </div>
  );
}
