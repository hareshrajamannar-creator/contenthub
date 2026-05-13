/**
 * FAQGenerationAgentsView
 *
 * Embeds the full agent-builder experience (Agents list, Library, Workflow canvas)
 * inside the Content Hub FAQ generation agents section.
 *
 * Prototype / review mode: no Firebase. All data is hardcoded in-memory.
 * The agent builder canvas is fully interactive — nodes can be added, dragged,
 * configured — but nothing persists beyond the current session.
 */
import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

// @ts-ignore
import './faq-agents/faq-agents-scoped.css';
// @ts-ignore
import AgentBuilder from './faq-agents/AgentBuilder/AgentBuilder';
import { FAQAgentsDashboardView, type AgentRow } from './FAQAgentsDashboardView';

/* ─── Hardcoded workflow nodes for the "Search AI metric enhancer FAQ agent" ─── */

const MOCK_NODE_LIST = [
  {
    id: 'node-trigger-1',
    flowType: 'trigger',
    data: {
      title: 'Determine core search queries',
      subtype: 'Schedule-based',
      headerLabel: 'Schedule-based trigger',
      subtitle: 'Runs weekly to refresh query targets',
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: null,
    },
  },
  {
    id: 'node-1',
    flowType: 'task',
    data: {
      title: 'AI site FAQ research',
      subtype: 'LLM Task',
      subtitle: 'Query AI site for comprehensive FAQ research on core business queries',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 1,
    },
  },
  {
    id: 'node-2',
    flowType: 'task',
    data: {
      title: 'Extract FAQs from AI site',
      subtype: 'LLM Task',
      subtitle: 'Query AI site using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity\'s responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 2,
    },
  },
  {
    id: 'node-3',
    flowType: 'task',
    data: {
      title: 'Extract PAA (People Also Ask) Questions',
      subtype: 'LLM Task',
      subtitle: 'Scrape Google\'s "People Also Ask" for core queries + related searches',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 3,
    },
  },
  {
    id: 'node-4',
    flowType: 'task',
    data: {
      title: 'Analyze query fanouts',
      subtype: 'LLM Task',
      subtitle: 'Understand query variations and long-tail coverage for maximum search visibility',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 4,
    },
  },
  {
    id: 'node-5',
    flowType: 'task',
    data: {
      title: 'Generate FAQs',
      subtype: 'LLM Task',
      subtitle: 'Convert insights into structured questions and answers',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 5,
    },
  },
  {
    id: 'node-6',
    flowType: 'task',
    data: {
      title: 'Score & rank FAQs',
      subtype: 'LLM Task',
      subtitle: 'Evaluate each FAQ pair for AEO relevance, clarity, and search intent alignment',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 6,
    },
  },
  {
    id: 'node-7',
    flowType: 'task',
    data: {
      title: 'Publish to Content Hub',
      subtype: 'Task',
      subtitle: 'Push approved FAQ pairs to the Content Hub for review and publication',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 7,
    },
  },
];

const MOCK_NODE_DETAILS: Record<string, any> = {
  __start__: {
    agentName: 'Search AI metric enhancer FAQ agent',
    goals: 'Generate high-quality FAQ content optimized for AI search engines and People Also Ask sections to improve organic visibility and AEO metrics.',
    outcomes: 'Published FAQ pages that rank in AI-generated answer boxes, improved search visibility, and higher click-through rates from People Also Ask.',
    locations: [],
  },
  'node-trigger-1': {
    triggerName: 'Determine core search queries',
    description: 'Runs weekly to refresh query targets',
    frequency: 'Weekly',
    day: '7 days',
    time: '9:00 AM',
  },
  'node-1': {
    taskName: 'AI site FAQ research',
    description: 'Query AI site for comprehensive FAQ research on core business queries',
  },
  'node-2': {
    taskName: 'Extract FAQs from AI site',
    description: 'Query AI site using the core search queries to retrieve AI-generated answers and related FAQ structures.',
  },
  'node-3': {
    taskName: 'Extract PAA (People Also Ask) Questions',
    description: 'Scrape Google\'s "People Also Ask" for core queries + related searches',
  },
  'node-4': {
    taskName: 'Analyze query fanouts',
    description: 'Understand query variations and long-tail coverage for maximum search visibility',
  },
  'node-5': {
    taskName: 'Generate FAQs',
    description: 'Convert insights into structured questions and answers',
    llmModel: 'Fast',
    systemPrompt: 'You are an SEO and AEO specialist. Generate structured FAQ pairs that directly answer common search queries.',
    userPrompt: 'Based on the query analysis and PAA data, generate {{count}} FAQ pairs optimized for AI search engines.',
  },
  'node-6': {
    taskName: 'Score & rank FAQs',
    description: 'Evaluate each FAQ pair for AEO relevance, clarity, and search intent alignment',
    llmModel: 'Fast',
    systemPrompt: 'Score each FAQ on a scale of 1-10 for AEO relevance, answer completeness, and search intent match.',
    userPrompt: 'Score and rank the following FAQ pairs: {{faqs}}',
  },
  'node-7': {
    taskName: 'Publish to Content Hub',
    description: 'Push approved FAQ pairs to the Content Hub for review and publication',
  },
};

/* ─────────────────────────────────────────── */

export interface FAQGenerationAgentsViewProps {
  onBuilderModeChange?: (inBuilder: boolean) => void;
}

type ViewMode = 'dashboard' | 'builder';

export function FAQGenerationAgentsView({ onBuilderModeChange }: FAQGenerationAgentsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeAgentName, setActiveAgentName] = useState<string>('Search AI metric enhancer FAQ agent');

  const openBuilder = useCallback((agentId: string, agents: AgentRow[]) => {
    const agent = agents?.find((a) => a.id === agentId);
    setActiveAgentName(agent?.name || 'Search AI metric enhancer FAQ agent');
    setViewMode('builder');
    onBuilderModeChange?.(true);
  }, [onBuilderModeChange]);

  const openNewAgent = useCallback((agent: AgentRow) => {
    setActiveAgentName(agent?.name || 'Untitled FAQ agent');
    setViewMode('builder');
    onBuilderModeChange?.(true);
  }, [onBuilderModeChange]);

  const closeBuilder = useCallback(() => {
    setViewMode('dashboard');
    onBuilderModeChange?.(false);
  }, [onBuilderModeChange]);

  /* ─── Dashboard view ─── */
  if (viewMode === 'dashboard') {
    return (
      <FAQAgentsDashboardView
        onOpenAgent={openBuilder}
        onCreateAgent={openNewAgent}
      />
    );
  }

  /* ─── Builder view — pre-loaded with hardcoded FAQ workflow ─── */
  return (
    <div className="faq-agents-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReactFlowProvider>
        <AgentBuilder
          agentId="mock-faq-agent"
          moduleSlug="search"
          moduleContext="search"
          sectionContext="faq-generation-agents"
          pageTitle={activeAgentName}
          activeNavId="search"
          initialNodes={MOCK_NODE_LIST}
          initialNodeDetails={MOCK_NODE_DETAILS}
          initialStatus="Draft"
          onClose={closeBuilder}
        />
      </ReactFlowProvider>
    </div>
  );
}
