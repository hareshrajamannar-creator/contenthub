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

/* ─── Hardcoded workflow nodes for the "On demand FAQ generation agent" ─── */

const ON_DEMAND_NODE_LIST = [
  {
    id: 'node-1',
    flowType: 'trigger',
    data: {
      title: '1. Start when a FAQ request is made',
      subtype: 'Event-based',
      headerLabel: 'Event-based trigger',
      subtitle: 'Run when a FAQ request is raised for a website URL',
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: null,
    },
  },
  {
    id: 'node-2',
    flowType: 'task',
    data: {
      title: '2. Collect web pages content for analysis',
      subtype: 'Task',
      subtitle: 'Scrape selected business webpages to extract content, and context',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 1,
    },
  },
  {
    id: 'node-3',
    flowType: 'task',
    data: {
      title: '3. Determine core search queries',
      subtype: 'LLM Task',
      subtitle: 'Analyze scraped content to determine 3–5 primary search queries that define the business',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 2,
    },
  },
  {
    id: 'node-6',
    flowType: 'task',
    data: {
      title: '4. Perplexity site search',
      subtype: 'LLM Task',
      subtitle: "Query Perplexity using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity's responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.",
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 3,
    },
  },
  {
    id: 'node-7',
    flowType: 'task',
    data: {
      title: '5. Identify customer questions',
      subtype: 'LLM Task',
      subtitle: "Extract the questions customers are already asking by mining the brand's reviews, support tickets, and on-site search queries.",
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 4,
    },
  },
  {
    id: 'node-8',
    flowType: 'task',
    data: {
      title: '6. Extract PAA (People Also Ask) Questions',
      subtype: 'Task',
      subtitle: "Scrape Google's \"People Also Ask\" for core queries + related searches",
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 5,
    },
  },
  {
    id: 'node-9',
    flowType: 'task',
    data: {
      title: '7. Query Fanout Expansion',
      subtype: 'LLM Task',
      subtitle: 'Expand the search queries into long-tail, voice search, and modifier variations real users type.',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 6,
    },
  },
  {
    id: 'node-10',
    flowType: 'task',
    data: {
      title: '8. Select FAQs from question pool',
      subtype: 'Task',
      subtitle: 'Group similar questions, classify each cluster, and pick the strongest 8–15 clusters to become the final FAQ set.',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 7,
    },
  },
  {
    id: 'node-11',
    flowType: 'task',
    data: {
      title: '9. Generate AEO optimised FAQs',
      subtype: 'LLM Task',
      subtitle: 'Convert insights into structured questions and answers',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 8,
    },
  },
  {
    id: 'node-12',
    flowType: 'task',
    data: {
      title: '10. Send to Content Hub',
      subtype: 'Task',
      subtitle: 'Format FAQs and send to Content Hub Editor',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 9,
    },
  },
];

const ON_DEMAND_NODE_DETAILS: Record<string, any> = {
  __start__: {
    agentName: 'On demand FAQ Generation Agent',
    goals: 'On Demand FAQ Generation Agent',
    outcomes: 'On Demand FAQ Generation Agent',
    locations: [],
  },
  'node-1': {
    triggerName: '1. Start when a FAQ request is made',
    description: 'Run when a FAQ request is raised for a website URL',
    conditions: [{ id: 1778700363602, fieldValue: 'opt_1778700434546', operatorValue: 'is', valueValue: '' }],
    conditionOptions: {
      field: [{ value: 'opt_1778700434546', label: 'Manual FAQ agent' }],
      value: [{ label: 'Raised', value: 'opt_1778700462725' }],
      operator: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { label: 'is greater than', value: 'greater_than' },
        { value: 'less_than', label: 'is less than' },
      ],
    },
  },
  'node-2': {
    taskName: '2. Collect web pages content for analysis',
    description: 'Scrape selected business webpages to extract content, and context',
    selectedTools: ['39hbiez'],
  },
  'node-3': {
    taskName: '3. Determine core search queries',
    description: 'Analyze scraped content to determine 3-5 primary search queries that define business',
    llmModel: 'Fast',
    systemPrompt: `Queries for each core theme:\nFor each theme, create search queries optimized for Answer Engine Optimization (AEO).\n\nQuery guidelines:\n- Use natural, conversational language (what users actually search)\n- Include local intent where relevant (e.g. "near me" or city-based queries)\n- Include both informational and transactional queries\n- Avoid duplicate or overly similar queries\n- Keep queries clear, specific, and relevant to the business\n\nOutput:\nReturn a structured list of search queries grouped by theme. Each query should:\n- Be concise and user-focused\n- Reflect real search behavior\n- Be tagged with its corresponding theme`,
    userPrompt: 'You are an SEO-focused search query generation agent.\nGiven the business context, generate high-intent search queries that people would use to find this business or its services.\n\nSearch queries: {{Search_queries}}',
    inputFields: [{ value: 'Scraped_content', type: 'variable' }, { value: '2. Website_URL', type: 'variable' }],
    outputFields: [{ value: 'Search_queries', type: 'variable' }],
  },
  'node-6': {
    taskName: '4. Perplexity site search',
    description: "Query Perplexity using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity's responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.",
    llmModel: 'Fast',
    systemPrompt: `Requirements:\n- Use the page URL as context for the business's category and locale.\n- For each query, surface 5-10 closely related questions from authoritative sources. Avoid forums, social media, and SEO-thin aggregator sites.\n- For each question, include a short factual draft answer (1-3 sentences) and the source domains.\n- Tag every question with the source_query that surfaced it.\n- Combine results across the source queries; if the same question appears under more than one, keep one entry.\n- Skip questions that match a source_query verbatim.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: 'You are given a webpage URL and 3-5 search queries the page wants to rank for. Your task is to research what authoritative web sources say about each query and return the FAQs real users are asking on this topic.\n\nPage_url: {{1. Website_URL}}\n\nSearch queries: {{3. Search_queries}}',
    inputFields: [{ value: '2. Website_URL', type: 'variable' }, { value: '3. Search_queries', type: 'variable' }],
    outputFields: [{ value: 'Perplexity_questions', type: 'variable' }],
  },
  'node-7': {
    taskName: '5. Identify customer questions',
    description: "Extract the questions customers are already asking by mining the brand's reviews, support tickets, and on-site search queries.",
    llmModel: 'Fast',
    systemPrompt: `Requirements:\n- Convert each signal into a clear, natural-language question.\n- Combine signals that ask the same thing into one entry with a frequency_count.\n- Drop any question that doesn't relate to one of the service_matches provided.\n- Return at most 30 questions, ranked from highest to lowest frequency.\n- Do not fabricate questions that aren't implied by the signals.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: 'You are given customer signals from a brand\'s connected sources - review snippets, support ticket subjects. Your task is to extract the questions customers are actually asking.\n\nService matches: {{Service_matches}}\n\nReview excerpts: {{Review_excerpts}}\n\nTicket subjects: {{Ticket_subjects}}\n\nSite search queries: {{Site search queries}}\n',
    inputFields: [{ value: '3. Search_queries', type: 'variable' }],
    outputFields: [{ value: 'Customer_questions', type: 'variable' }],
  },
  'node-8': {
    taskName: '6. Extract PAA (People Also Ask) Questions',
    description: "Scrape Google's \"People Also Ask\" for core queries + related searches",
    selectedTools: ['s69wacq'],
  },
  'node-9': {
    taskName: '7. Query Fanout Expansion',
    description: 'Expand the search queries into long-tail, voice search, and modifier variations real users type.',
    llmModel: 'Fast',
    systemPrompt: `Cluster questions with the same intent into one canonical question.\n- Classify each cluster's intent (informational, commercial, transactional, or navigational).\n- Pick 8-15 clusters to ship based on what the pool supports.\n- Prefer clusters that align with target_queries or expanded_queries.\n- Do not invent questions.\n- Return only the JSON output shape. No commentary, no preamble.`,
    userPrompt: "You are given questions from three sources (customer signals, Perplexity research, Google \"People Also Ask\"), the search queries the page wants to rank for, and an expanded set of long-tail and voice search variations.\n\nCustomer_questions: {{5. Customer_questions}}\n\nPerplexity_questions: {{4. Perplexity_questions}}\n\nPaa_questions: {{6. PAA_Questions}}\n\ntarget_queries: {{target_queries}}\n\nexpanded_queries: {{expanded_queries}}\n",
    inputFields: [{ value: '3. Search_queries', type: 'variable' }],
    outputFields: [{ value: 'Expanded_queries', type: 'variable' }],
  },
  'node-10': {
    taskName: '8. Select FAQs from question pool',
    description: 'Group similar questions, classify each cluster, and pick the strongest 8-15 clusters to become the final FAQ set.',
  },
  'node-11': {
    taskName: '9. Generate AEO optimised FAQs',
    description: 'Convert insights into structured questions and answers',
    llmModel: 'Fast',
    systemPrompt: `For each answer:\n- Lead with the direct answer in the first sentence. No preambles.\n- The first 40-50 words must stand alone as a complete answer.\n- Total length must be 45-65 words.\n- Ground every fact in page_facts or brand_kit. Do not invent prices, hours, or policies.\n- Include a call to action only if the intent is transactional.\n- Return only the JSON output shape. No commentary, no preamble.`,
    userPrompt: 'You are a FAQ writer for {{brand_name}}. You are given 8-15 selected question clusters along with the page\'s extracted facts, the brand kit, and location context. Write the complete FAQ set in one response — one answer per cluster.\n\nSelected_clusters: {{selected_clusters}}\nPage_type: {{page_context.page_type}}\nPage_facts: {{page_context.extracted_facts}}\nBrand_kit: {{brand_kit}}\nLocation_context: {{location_context}}',
    inputFields: [{ value: 'Selected_faqs', type: 'variable' }, { value: '1. Scraped_content', type: 'variable' }],
    outputFields: [{ value: 'Final_FAQs', type: 'variable' }],
  },
  'node-12': {
    taskName: '10. Send to Content Hub',
    description: 'Format FAQs and send to Content Hub Editor',
    selectedTools: ['qgmncsh'],
  },
};

/* ─────────────────────────────────────────── */

export interface FAQGenerationAgentsViewProps {
  onBuilderModeChange?: (inBuilder: boolean) => void;
}

type ViewMode = 'dashboard' | 'builder';

const ON_DEMAND_NAME_FRAGMENT = 'on demand';

function isOnDemandAgent(name: string) {
  return name.toLowerCase().includes(ON_DEMAND_NAME_FRAGMENT);
}

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

  const nodeList    = isOnDemandAgent(activeAgentName) ? ON_DEMAND_NODE_LIST    : MOCK_NODE_LIST;
  const nodeDetails = isOnDemandAgent(activeAgentName) ? ON_DEMAND_NODE_DETAILS : MOCK_NODE_DETAILS;

  /* ─── Builder view ─── */
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
          initialNodes={nodeList}
          initialNodeDetails={nodeDetails}
          initialStatus="Draft"
          onClose={closeBuilder}
        />
      </ReactFlowProvider>
    </div>
  );
}
