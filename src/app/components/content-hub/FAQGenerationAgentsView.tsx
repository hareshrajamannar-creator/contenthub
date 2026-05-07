import { useEffect, useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Plus, MoreHorizontal,
  LayoutTemplate, Search, Filter, Columns3,
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { MainCanvasViewHeader } from '@/app/components/layout/MainCanvasViewHeader';
import { AppDataTable } from '@/app/components/ui/AppDataTable';
import { TextTabsRow } from '@/app/components/ui/text-tabs';
// AgentBuilderEmbed stubbed for Vercel build (agent-builder is a separate app)
const AgentBuilderEmbed = ({ pageTitle }: { pageTitle?: string; [k: string]: unknown }) => (
  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
    Agent builder — {pageTitle}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AgentRow {
  id: number;
  name: string;
  status: 'Draft' | 'Active' | 'Paused';
  generated: number;
  accepted: number;
  timeSaved: string;
  locations: number;
}

interface Template {
  id: number;
  name: string;
  description: string;
  steps: number;
  kind: 'popular' | 'new';
}

export interface FAQGenerationAgentsViewProps {
  /** Called whenever the embedded builder is opened (true) or closed (false). */
  onBuilderModeChange?: (inBuilder: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_NAME = 'FAQ generation agents';

const METRICS = [
  { label: 'Generated FAQs', value: '265' },
  { label: 'Accepted FAQs',  value: '265' },
  { label: 'Time saved',     value: '9h'  },
];

const AGENTS: AgentRow[] = [
  { id: 1, name: 'AEO-Optimized FAQ Generation Agent',          status: 'Draft', generated: 200, accepted: 100, timeSaved: '4h 10m', locations: 100 },
  { id: 2, name: 'Search AI metric enhancer FAQ agent',         status: 'Draft', generated: 200, accepted: 100, timeSaved: '4h 10m', locations: 100 },
  { id: 3, name: 'Copy of Search AI metric enhancer FAQ agent', status: 'Draft', generated: 200, accepted: 100, timeSaved: '4h 10m', locations: 100 },
  { id: 4, name: 'AEO-Optimized FAQ Generation Agent',          status: 'Draft', generated: 200, accepted: 100, timeSaved: '4h 10m', locations: 100 },
];

const TEMPLATES: Template[] = [
  { id: 1, name: 'AEO-Optimized FAQ Generation', description: 'Generate AEO-optimized FAQs to improve Search AI score using web scraping and LLM analysis.', steps: 7, kind: 'popular' },
  { id: 2, name: 'Search visibility booster',    description: 'Automatically research competitor FAQs and People Also Ask data to boost organic visibility.',   steps: 5, kind: 'popular' },
  { id: 3, name: 'PAA research agent',            description: 'Scrape Google People Also Ask questions for your core queries and generate targeted FAQ content.', steps: 4, kind: 'new' },
  { id: 4, name: 'Content gap analyzer',          description: 'Identify FAQ content gaps by comparing your existing FAQs against top competitor content.',        steps: 6, kind: 'new' },
];

const STATUS_OPTS = [
  { value: 'all',    label: 'All status' },
  { value: 'Draft',  label: 'Draft' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Default workflow nodes
// ─────────────────────────────────────────────────────────────────────────────

const AEO_DEFAULT_NODES = [
  {
    flowType: 'trigger',
    data: {
      title: 'When a SearchAI FAQ recommendation is accepted',
      stepNumber: 1,
      description: 'When a new post is published',
      toggleEnabled: true,
      subtitle: 'When a SearchAI FAQ recommendation is accepted',
      descriptionPlaceholder: 'Enter description',
      subtype: 'Social',
      titlePlaceholder: 'Enter trigger name',
      hasToggle: true,
      hasAiIcon: false,
    },
    id: 'node-8',
  },
  {
    id: 'node-4',
    flowType: 'task',
    data: {
      hasAiIcon: true,
      hasToggle: true,
      titlePlaceholder: 'Enter task name',
      subtype: 'Custom',
      descriptionPlaceholder: 'Enter description',
      subtitle: 'Drill down from the search themes to generate 3-5 specific, high-value search queries per theme that will be used to query Perplexity AI and Google PAA. These queries directly drive FAQ content generation.',
      description: 'Custom',
      toggleEnabled: true,
      stepNumber: 2,
      title: 'Determine core search query',
    },
  },
  {
    id: 'node-10',
    data: {
      subtype: 'Custom',
      descriptionPlaceholder: 'Enter description',
      hasToggle: true,
      titlePlaceholder: 'Enter task name',
      hasAiIcon: true,
      title: 'Perplexity FAQ research',
      stepNumber: 3,
      subtitle: "Query AI site using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity's responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.",
      toggleEnabled: true,
      description: 'Custom',
    },
    flowType: 'task',
  },
  {
    data: {
      hasAiIcon: false,
      hasToggle: true,
      titlePlaceholder: 'Enter task name',
      subtype: 'Review',
      descriptionPlaceholder: 'Enter description',
      subtitle: "Pulls Google's PAA questions for each core query. Highest-intent, highest-CTR questions because Google has already validated that real searchers click on them",
      description: 'Respond to a review',
      toggleEnabled: true,
      stepNumber: 4,
      title: 'Extract PAA (People Also Ask) Questions',
    },
    flowType: 'task',
    id: 'node-12',
  },
  {
    flowType: 'task',
    data: {
      subtype: 'Custom',
      descriptionPlaceholder: 'Enter description',
      hasToggle: true,
      titlePlaceholder: 'Enter task name',
      hasAiIcon: true,
      title: 'Identify top queries for FAQ generation',
      stepNumber: 5,
      subtitle: 'Group similar questions together, classify each cluster, and pick the top questions that will become the final FAQ set.',
      toggleEnabled: true,
      description: 'Custom',
    },
    id: 'node-1',
  },
  {
    data: {
      stepNumber: 6,
      subtitle: 'For every selected question in FAQ',
      description: 'Loop',
      toggleEnabled: true,
      title: 'For every selected question in FAQ',
      hasToggle: true,
      titlePlaceholder: 'Enter name',
      hasAiIcon: false,
      subtype: 'Loop',
      descriptionPlaceholder: 'Enter description',
    },
    flowType: 'loop',
    id: 'node-5',
  },
  {
    flowType: 'task',
    data: {
      title: 'Generate AEO optimised FAQs',
      description: 'Custom',
      toggleEnabled: true,
      subtitle: 'For every selected question, generate AEO optimised answer, along with query fanout variations',
      stepNumber: 7,
      descriptionPlaceholder: 'Enter description',
      subtype: 'Custom',
      hasAiIcon: true,
      titlePlaceholder: 'Enter task name',
      hasToggle: true,
    },
    id: 'node-2',
  },
  {
    id: 'node-6',
    data: {
      title: 'Send to Search AI',
      stepNumber: 8,
      subtitle: 'Format FAQs and send to Birdeye Search AI recommendations section',
      toggleEnabled: true,
      description: 'Upcoming holiday events',
      subtype: 'Social-task',
      descriptionPlaceholder: 'Enter description',
      hasToggle: true,
      titlePlaceholder: 'Enter task name',
      hasAiIcon: false,
    },
    flowType: 'task',
  },
];

const AEO_DEFAULT_NODE_DETAILS: Record<string, Record<string, unknown>> = {
  '__start__': {
    goals: 'Mine high-value questions from real signals; cluster by intent and prioritize by frequency and AEO value; generate answer-first, snippet-ready FAQs (45–65 words optimal); optimize each FAQ for snippet capture, voice search, and schema readiness; route output to the user\'s chosen destination',
    outcomes: '12–18 deployable FAQ pairs per run with FAQPage JSON-LD schema; question coverage report (sources + intent distribution); editable FAQ set with full output flexibility (notify, publish to SearchAI, publish to CMS, export, save to draft, etc.)',
    locations: [],
    agentName: 'AEO-Optimized FAQ Generation Agent',
  },
  'node-8': {
    triggerName: 'When a SearchAI FAQ recommendation is accepted',
    conditions: [
      {
        id: 1777988023934,
        valueValue: 'opt_1777988009633',
        operatorValue: 'is',
        fieldValue: 'opt_1777987961982',
      },
    ],
    description: 'When a SearchAI FAQ recommendation is accepted',
    conditionOptions: {
      value: [
        { label: 'Review received', value: 'review_received' },
        { label: 'Google', value: 'google' },
        { value: '48_hours', label: '48 hours' },
        { label: 'Accepted', value: 'opt_1777988009633' },
      ],
      field: [
        { label: 'Event', value: 'event' },
        { label: 'Message type', value: 'message_type' },
        { label: 'Message age', value: 'message_age' },
        { value: 'rating', label: 'Rating' },
        { value: 'sentiment', label: 'Sentiment' },
        { value: 'source', label: 'Source' },
        { value: 'location', label: 'Location' },
        { value: 'keyword', label: 'Keyword' },
        { label: 'SearchAI FAQ recommendation', value: 'opt_1777987961982' },
      ],
      operator: [
        { label: 'is', value: 'is' },
        { label: 'is not', value: 'is_not' },
        { value: 'contains', label: 'contains' },
        { value: 'greater_than', label: 'is greater than' },
        { label: 'is less than', value: 'less_than' },
      ],
    },
  },
  'node-4': {
    description: 'Drill down from the search themes to generate 3-5 specific, high-value search queries per theme that will be used to query Perplexity AI and Google PAA. These queries directly drive FAQ content generation.',
    userPrompt: 'You are an SEO-focused search query generation agent. Given the business context, generate high-intent search queries that people would use to find this business or its services.  ',
    llmModel: 'Fast',
    taskName: 'Determine core search query',
    contextFields: [
      { value: 'scraped_content', type: 'variable' },
      { type: 'variable', value: 'website_url' },
    ],
    systemPrompt: 'You are an SEO-focused search query generation agent. Given the business context, generate high-intent search queries that people would use to find this business or its services.  \nQueries for each core theme: For each theme, create search queries optimized for Answer Engine Optimization (AEO).  \nQuery guidelines: - Use natural, conversational language (what users actually search) - Include local intent where relevant (for example, "near me" or city-based queries) - Include both informational and transactional queries - Avoid duplicate or overly similar queries - Keep queries clear, specific, and relevant to the business\nOutput: Return a structured list of search queries grouped by theme. Each query should: - Be concise and user-focused - Reflect real search behavior - Be tagged with its corresponding theme',
    outputFields: [
      { type: 'variable', value: 'search_queries' },
    ],
  },
  'node-10': {
    contextFields: [],
    taskName: 'Perplexity FAQ research',
    inputFields: [
      { value: 'search_queries', type: 'variable' },
      { value: 'website_url', type: 'variable' },
    ],
    outputFields: [
      { value: 'perplexity_faqs', type: 'variable' },
    ],
    systemPrompt: 'You are given a webpage URL and core search queries that page is trying to rank for. Your task is to research what authoritative web sources say about each query and return the FAQs real users are asking on this topic.\nRequirements:- Consider the webpage URL to anchor your research to the business\'s category, locale, and likely service offerings. Stay relevant to what a visitor of this page would search for.- For each core query, surface 5-10 closely related questions that appear in authoritative sources. Prioritize sources like industry associations, government health agencies, established editorial publications, and reputable trade sites. Avoid forums, social media, and SEO-thin aggregator sites.- ﻿﻿For each question, include a short, neutral, factual draft answer (1-3 sentences) and the source domains you drew from. -﻿﻿ Phrase each question in natural conversational language as a real user would search.﻿﻿Combine results across the core queries into a single deduplicated list. When the same question appears under more than one query, keep one entry and pick the source_query whose authoritative sources are stronger.- ﻿﻿Tag every question with the source_query that surfaced it so downstream tasks can trace provenance.﻿﻿Do not include questions that match the core query verbatim.﻿﻿Do not include promotional, opinion, or speculative content.﻿﻿Return only the JSON output shape - no commentary, no preamble.',
    userPrompt: 'page_url: {{page.url}}\ncore_queries: {{core_queries}}\nGiven a webpage URL and 3-5 core search queries that page is trying to rank for. Your task is to research what authoritative web sources say about each query and return the FAQs real users are asking on this topic.\n',
    description: 'Query AI site using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity\'s responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.',
    llmModel: 'Fast',
  },
  'node-12': {
    selectedTools: ['s69wacq'],
    taskName: 'Extract PAA (People Also Ask) Questions',
    description: "Pulls Google's PAA questions for each core query. Highest-intent, highest-CTR questions because Google has already validated that real searchers click on them",
  },
  'node-1': {
    taskName: 'Identify top queries for FAQ generation',
    inputFields: [
      { type: 'variable', value: 'search_queries' },
      { type: 'variable', value: 'perplexity_faqs' },
      { value: 'googlepaa_queries', type: 'variable' },
    ],
    systemPrompt: 'You are given a pool of questions along with the number of FAQs to ship and the search queries the page wants to win for. Your task is to merge similar questions, classify each merged cluster, and select the strongest clusters.\n\nRequirements:\n- Cluster questions that share the same underlying intent into a single canonical question. For example, "how much does it cost" and "what\'s the price" belong together. Pick the clearest, most natural phrasing as the canonical question.\n- Classify each cluster with an intent: informational, commercial, transactional, or navigational.\n- Tag each cluster with a service_match value naming the page service it relates to, or "general" if it does not map to a specific service.\n- Select exactly required_count clusters from your clustered set. Prefer clusters that align with the target_queries the page wants to win for. When two clusters are equally aligned, prefer the one that merged more questions — a larger cluster signals more underlying demand.\n- Do not invent questions. Every cluster must originate from at least one question in the input pool.\n- Return only the JSON output shape — no commentary, no preamble.',
    outputFields: [
      { type: 'variable', value: 'selected_faqs' },
    ],
    description: 'Group similar questions together, classify each cluster, and pick the top questions that will become the final FAQ set.',
    userPrompt: 'You are given a pool of questions along with the number of FAQs to ship and the search queries the page wants to win for. Your task is to merge similar questions, classify each merged cluster, and select the strongest clusters.',
    llmModel: 'Fast',
  },
  'node-5': {
    loopOver: 'results',
    loopMode: 'manual',
    name: 'For every selected question in FAQ',
    description: 'For every selected question in FAQ',
  },
  'node-2': {
    userPrompt: 'You are a FAQ writer. You are given one selected question along with the brand\'s services, voice, location context,\nand the page-specific content scraped earlier in the workflow. Your task is to write a single FAQ answer with all AEO requirements baked into the writing, and to produce 5-8 question variations for FAQPage schema markup.',
    description: 'For every selected question, generate AEO optimised answer, along with query fanout variations',
    llmModel: 'Fast',
    taskName: 'Generate AEO optimised FAQs',
    systemPrompt: 'You are a FAQ writer. You are given one selected question along with the brand\'s services, voice, location context,\nand the page-specific content scraped earlier in the workflow. Your task is to write a single FAQ answer with all AEO requirements baked into the writing, and to produce 5-8 question variations for FAQPage schema markup.\n\nRequirements for the answer:\n- The first sentence must directly answer the question. No preambles like "Great question" or "Thank you for asking" or "Well, ...".\n- The first 40-50 words must stand alone as a complete answer. Picture them appearing as a featured snippet on Google with no surrounding context — they must still answer the question.\n- Total length must be between 45 and 65 words.\n- Reference {{service_match}} by its actual name. Do not say "we" or "our service" when you can name the service.\n- When location_context is present, reference the city or neighbourhood naturally. Do not paste in a full street address.\n- Do not fabricate prices, hours, opening times, or contact details. Only use values that appear explicitly in scraped_business_context.\n- Avoid marketing fluff: phrases like "we\'re proud to offer", "industry-leading", "your trusted partner", and similar.\n- Include a call to action only if the intent is transactional. For informational, commercial, or navigational intents, do not push the reader toward booking.\n- Voice search test: read the answer aloud in your head. If a sentence has nested clauses, parenthetical asides, or jargon that needs immediate definition, simplify the structure.\n- Entity density: the answer must mention the service_match by name, the location when location_context is present, and any specific conditions or products named in the question. Place these naturally in the answer — do not jam them in.\n\nRequirements for question variations:\n- Produce 5-8 variations that reflect real ways users search the same intent. These are not synonym swaps of the canonical question.\n- Mix the variations: include 2-3 long-tail keyword phrasings (e.g., "emergency dentist near me cost", "24 hour dentist Dallas weekend"), 1-2 voice search phrasings (e.g., "Hey Google, where\'s the closest emergency dentist", "what counts as a dental emergency"), and 1-2 modifier variations such as with/without insurance, by demographic, or by urgency.\n\nSelf-check before returning:\n- Verify the answer satisfies snippet, voice, entity density, and length requirements above. Populate aeo_checks_passed with the list of checks the answer satisfies.\n- If any check fails, do not return the failing answer. Revise and try again before returning.\n\n',
  },
  'node-6': {
    taskName: 'Send to Search AI',
    description: 'Format FAQs and send to Birdeye Search AI recommendations section',
    selectedTools: ['izz5odk'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Column helper
// ─────────────────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<AgentRow>();

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {status}
    </Badge>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-border bg-background p-4">
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agents tab — receives header-level state from parent
// ─────────────────────────────────────────────────────────────────────────────

interface AgentsTabProps {
  onOpenAgent: (agent: AgentRow) => void;
  search: string;
  statusFilter: string;
  columnSheetOpen: boolean;
  onColumnSheetOpenChange: (open: boolean) => void;
}

function AgentsTab({ onOpenAgent, search, statusFilter, columnSheetOpen, onColumnSheetOpenChange }: AgentsTabProps) {
  const filtered = useMemo(
    () =>
      AGENTS.filter((a) => {
        const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [search, statusFilter],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        meta: { settingsLabel: 'Name' },
        size: 320,
        enableSorting: true,
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        meta: { settingsLabel: 'Status' },
        size: 110,
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('generated', {
        id: 'generated',
        header: 'Generated FAQs',
        meta: { settingsLabel: 'Generated FAQs' },
        size: 140,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('accepted', {
        id: 'accepted',
        header: 'Accepted FAQs',
        meta: { settingsLabel: 'Accepted FAQs' },
        size: 130,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('timeSaved', {
        id: 'timeSaved',
        header: 'Time saved',
        meta: { settingsLabel: 'Time saved' },
        size: 120,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('locations', {
        id: 'locations',
        header: 'Locations',
        meta: { settingsLabel: 'Locations' },
        size: 110,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 60,
        enableSorting: false,
        meta: { settingsLabel: 'Actions' },
        cell: () => (
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground opacity-0 transition-all group-hover/table-row:opacity-100 hover:bg-muted hover:text-foreground"
                  title="More options"
                >
                  <MoreHorizontal size={14} strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer text-xs">Run</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs">Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs">Rename</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Metric cards — full width */}
      <div className="flex shrink-0 items-stretch gap-4 px-6 pb-4">
        {METRICS.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <AppDataTable<AgentRow>
          tableId="faq-agents.directory"
          data={filtered}
          columns={columns}
          getRowId={(r) => String(r.id)}
          onRowClick={(r) => onOpenAgent(r)}
          columnSheetTitle="Agent columns"
          className="min-w-0"
          rowDensity="default"
          stickyFirstColumn
          stickyToolbar
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={onColumnSheetOpenChange}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates tab
// ─────────────────────────────────────────────────────────────────────────────

function TemplatesTab({ onUseTemplate }: { onUseTemplate: (name: string) => void }) {
  return (
    <div className="flex-1 overflow-auto px-6 pb-6">
      <div className="grid grid-cols-2 gap-4 pt-2">
        {TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <LayoutTemplate size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-primary" />
              </div>
              <span className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                tpl.kind === 'popular' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
              )}>
                {tpl.kind === 'popular' ? 'Popular' : 'New'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-semibold leading-snug text-foreground">{tpl.name}</p>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{tpl.description}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground">{tpl.steps} steps</span>
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => onUseTemplate(tpl.name)}>
                Use template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────

export function FAQGenerationAgentsView({ onBuilderModeChange }: FAQGenerationAgentsViewProps) {
  const [view, setView]             = useState<'list' | 'builder'>('list');
  const [activeAgent, setActiveAgent]   = useState<AgentRow | null>(null);
  const [activeTab, setActiveTab]   = useState<'agents' | 'templates'>('agents');

  // Header-level controls shared between header and table
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  // Notify parent when builder mode changes so it can hide the L2 nav
  useEffect(() => {
    onBuilderModeChange?.(view === 'builder');
  }, [view, onBuilderModeChange]);

  const openAgent = (agent: AgentRow) => {
    setActiveAgent(agent);
    setView('builder');
  };

  const closeBuilder = () => {
    setView('list');
    setActiveAgent(null);
  };

  /* ── Workflow builder — full-page, L2 hidden by parent ── */
  if (view === 'builder' && activeAgent) {
    return (
      <AgentBuilderEmbed
        pageTitle={activeAgent.name}
        startSubtitle="AEO-optimized FAQ generation workflow"
        defaultNodes={AEO_DEFAULT_NODES}
        defaultNodeDetails={AEO_DEFAULT_NODE_DETAILS}
        onBack={closeBuilder}
        backLabel={GROUP_NAME}
      />
    );
  }

  /* ── Agents list ── */
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header — search / filter / columns live here alongside New agent */}
      <MainCanvasViewHeader
        title={GROUP_NAME}
        actions={
          <div className="flex items-center gap-2">
            {/* Search — icon-only button, same pattern as other headers */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Search agents"
              aria-label="Search agents"
            >
              <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>

            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title="Filter by status"
                  aria-label="Filter by status"
                >
                  <Filter className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {STATUS_OPTS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    className={cn(
                      'cursor-pointer text-xs',
                      statusFilter === opt.value && 'font-medium text-primary',
                    )}
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column switcher */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Columns"
              aria-label="Columns"
              onClick={() => setColumnSheetOpen(true)}
            >
              <Columns3 className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* New agent */}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() =>
                openAgent({ id: 0, name: 'New agent', status: 'Draft', generated: 0, accepted: 0, timeSaved: '0m', locations: 0 })
              }
            >
              <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
              New agent
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="shrink-0 px-6">
        <TextTabsRow
          ariaLabel="Agent view"
          value={activeTab}
          onChange={(v) => setActiveTab(v as 'agents' | 'templates')}
          items={[
            { id: 'agents',    label: 'Agents' },
            { id: 'templates', label: 'Templates' },
          ]}
        />
      </div>

      {/* Tab content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        {activeTab === 'agents' ? (
          <AgentsTab
            onOpenAgent={openAgent}
            search={search}
            statusFilter={statusFilter}
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
          />
        ) : (
          <TemplatesTab
            onUseTemplate={(name) =>
              openAgent({ id: 0, name, status: 'Draft', generated: 0, accepted: 0, timeSaved: '0m', locations: 0 })
            }
          />
        )}
      </div>
    </div>
  );
}
