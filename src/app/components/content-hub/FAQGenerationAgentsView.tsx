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
    id: 'node-mpbanxcr-rj33c',
    flowType: 'trigger',
    data: {
      title: 'Start when a FAQ request is made',
      subtype: 'Reviews',
      subtitle: 'Run when a FAQ request is raised for your business or content',
      hasToggle: true,
      toggleEnabled: true,
      hasAiIcon: false,
      stepNumber: 1,
    },
  },
  {
    id: 'node-mpba4n5x-jq2up',
    flowType: 'task',
    data: {
      title: 'Collect web pages content for analysis',
      subtype: 'Ticketing',
      subtitle: 'Scrape selected business webpages to extract content, and context',
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
      title: '3. Determine core search queries',
      subtype: 'Custom',
      subtitle: 'Analyze scraped content to determine 3-5 primary search queries that define business',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 3,
    },
  },
  {
    id: 'node-6',
    flowType: 'task',
    data: {
      title: '4. Perplexity site search',
      subtype: 'Custom',
      subtitle: "Query Perplexity using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity's responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.",
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 4,
    },
  },
  {
    id: 'node-7',
    flowType: 'task',
    data: {
      title: '5. Identify customer questions',
      subtype: 'Custom',
      subtitle: "Extract the questions customers are already asking by mining the brand's reviews, support tickets, and on-site search queries.",
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 5,
    },
  },
  {
    id: 'node-8',
    flowType: 'task',
    data: {
      title: '6. Extract PAA (People Also Ask) Questions',
      subtype: 'Ticketing',
      subtitle: "Scrape Google's \"People Also Ask\" for core queries + related searches",
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 6,
    },
  },
  {
    id: 'node-mpbddllm-r2u8w',
    flowType: 'task',
    data: {
      title: 'Analyze query fanouts',
      subtype: 'Custom',
      subtitle: 'Evaluate which queries are most relevant and rank them accordingly',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 7,
    },
  },
  {
    id: 'node-9',
    flowType: 'task',
    data: {
      title: '8. Select FAQs from question pool',
      subtype: 'Custom',
      subtitle: 'Group similar questions, classify each cluster, and pick the strongest 8-15 clusters to become the final FAQ set.',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 8,
    },
  },
  {
    id: 'node-10',
    flowType: 'task',
    data: {
      title: '8. Select FAQs from question pool',
      subtype: 'Review',
      subtitle: 'Group similar questions, classify each cluster, and pick the strongest 8-15 clusters to become the final FAQ set.',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 9,
    },
  },
  {
    id: 'node-11',
    flowType: 'task',
    data: {
      title: '9. Generate AEO optimised FAQs',
      subtype: 'Custom',
      subtitle: 'Convert insights into structured questions and answers',
      hasAiIcon: true,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 10,
    },
  },
  {
    id: 'node-12',
    flowType: 'task',
    data: {
      title: '10. Send to Content Hub',
      subtype: 'Ticketing',
      subtitle: 'Format FAQs and send to Content Hub Editor',
      hasAiIcon: false,
      hasToggle: true,
      toggleEnabled: true,
      stepNumber: 11,
    },
  },
];

const ON_DEMAND_NODE_DETAILS: Record<string, any> = {
  __start__: {
    agentName: 'On demand FAQ Generation Agent',
    goals: 'Generate FAQs for content you provide on demand',
    outcomes: 'Create FAQs ready to be published',
    locations: [],
  },
  'node-mpbanxcr-rj33c': {
    triggerName: 'Start when a FAQ request is made',
    description: 'Run when a FAQ request is raised for your business or content',
    conditions: [{ id: 1779114229629, fieldValue: 'event', operatorValue: 'is', valueValue: 'review_received' }],
    conditionOptions: {
      field: [
        { label: 'Manual request',  value: 'event' },
        { label: 'Message type',    value: 'message_type' },
        { label: 'Message age',     value: 'message_age' },
        { label: 'Rating',          value: 'rating' },
        { label: 'Sentiment',       value: 'sentiment' },
        { label: 'Source',          value: 'source' },
        { label: 'Location',        value: 'location' },
        { label: 'Keyword',         value: 'keyword' },
      ],
      value: [
        { label: 'Raised',    value: 'review_received' },
        { label: 'Google',    value: 'google' },
        { label: '48 hours',  value: '48_hours' },
      ],
      operator: [
        { label: 'is',              value: 'is' },
        { label: 'is not',          value: 'is_not' },
        { label: 'contains',        value: 'contains' },
        { label: 'is greater than', value: 'greater_than' },
        { label: 'is less than',    value: 'less_than' },
      ],
    },
  },
  'node-mpba4n5x-jq2up': {
    taskName: 'Collect web pages content for analysis',
    description: 'Scrape selected business webpages to extract content, and context',
    selectedTools: ['39hbiez'],
  },
  'node-3': {
    taskName: '3. Determine core search queries',
    description: 'Analyze scraped content to determine 3-5 primary search queries that define business',
    llmModel: 'Fast',
    systemPrompt: `You are given a webpage's content along with the brand's services. Your task is to identify the page type, extract the key facts the page contains, and derive 3-5 search queries the page should rank for Search and Answer engines.\n\nRequirements:\n- Identify the page_type in plain English (e.g., "service page", "product page", "educational blog", "FAQ page", "about page").\n- Extract the page's key facts as a list of {label, value} entries.\n- Derive 3-5 short search queries (2-6 words each) that real users would type to find this page.\n- Tag each query with a service_match from the brand knowledge, or "general" if no specific service fits.\n- Do not invent facts. Only extract what the page actually contains.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: `You are given a webpage's content along with the brand's services. Your task is to identify the page type, extract the key facts the page contains, and derive 3-5 search queries the page should rank for Search and Answer engines.\n\nSearch queries: {{Search_queries}}`,
    inputFields: [
      { type: 'variable', value: '2. Scraped_content' },
      { type: 'variable', value: '1. Website_URL' },
    ],
    outputFields: [{ type: 'variable', value: 'Search_queries' }],
    contextFields: [
      { type: 'address',    value: 'Brand.Brand_profile' },
      { type: 'attachment', value: 'Knowledge_Files' },
      { type: 'link',       value: 'Knowledge_URL' },
    ],
    previewInputFields: [
      { type: 'variable', name: 'Scraped_content',  value: '1. Query: Emergency dentist dallas,\nService_match: Emergency_dentistry\n\n2. Query: Emergency dentist dallas,\nService_match: Emergency_dentistry\n\n3. Query: Emergency dentist dallas,\nService_match: Emergency_dentistry' },
      { type: 'variable', name: '1.Website_URL',    value: 'https://brightsmiles.com/services/emergency-dental' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Search_queries', value: '- Dentist near me\n- Best dentist near me\n- Emergency dentist near me\n- Teeth cleaning cost in India\n- Dental clinic near me' },
    ],
  },
  'node-6': {
    taskName: '4. Perplexity site search',
    description: "Query Perplexity using the core search queries to retrieve AI-generated answers and related FAQ structures. Perplexity's responses reflect how AI answer engines are already responding to these questions, giving us the AEO gold standard to match or exceed.",
    llmModel: 'Fast',
    systemPrompt: `You are given a webpage URL and 3-5 search queries the page wants to rank for. Your task is to research what authoritative web sources say about each query and return the FAQs real users are asking on this topic.\n\nRequirements:\n- Use the page URL as context for the business's category and locale.\n- For each query, surface 5-10 closely related questions from authoritative sources (industry associations, government agencies, reputable editorial publications, trade sites). Avoid forums, social media, and SEO-thin aggregator sites.\n- For each question, include a short factual draft answer (1-3 sentences) and the source domains. The draft answer is for discovery context only.\n- Tag every question with the source_query that surfaced it.\n- Combine results across the source queries; if the same question appears under more than one, keep one entry.\n- Skip questions that match a source_query verbatim. Skip promotional, opinion, or speculative content.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: `You are given a webpage URL and 3-5 search queries the page wants to rank for. Your task is to research what authoritative web sources say about each query and return the FAQs real users are asking on this topic.\n\nPage_url: {{1. Website_URL}}\n\nSearch queries: {{3. Search_queries}}`,
    inputFields: [
      { type: 'variable', value: '1. Website_URL' },
      { type: 'variable', value: '3. Search_queries' },
    ],
    outputFields: [{ type: 'variable', value: 'Perplexity_questions' }],
    contextFields: [
      { type: 'address',    value: 'Brand.Brand_profile' },
      { type: 'attachment', value: 'Knowledge_Files' },
      { type: 'link',       value: 'Knowledge_URL' },
    ],
    previewInputFields: [
      { type: 'variable', name: '2. Website_URL',   value: 'https://brightsmiles.com/services/emergency-dental' },
      { type: 'variable', name: '3. Search_queries', value: '1. Query: Emergency dentist dallas\n    Service match : Emergency dentistry\n\n2. Query: Emergency dentist dallas\n    Service match : Emergency dentistry' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Perplexity_questions', value: 'Question: What qualifies as a dental emergency?\nPerplexity draft answer: A dental emergency is any situation requiring immediate care to save a tooth, stop bleeding, or relieve severe pain.\nSources: ada.org, mayoclinic.org\nSource query: Emergency dentist dallas' },
    ],
  },
  'node-7': {
    taskName: '5. Identify customer questions',
    description: "Extract the questions customers are already asking by mining the brand's reviews, support tickets, and on-site search queries.",
    llmModel: 'Fast',
    systemPrompt: `You are given customer signals from a brand's connected sources - review snippets, support ticket subjects. Your task is to extract the questions customers are actually asking.\nRequirements:\n- Convert each signal into a clear, natural-language question. For example, "I couldn't find your hours anywhere" becomes "What are your hours?".\n- Combine signals that ask the same thing into one entry with a frequency_count of how many signals merged into it.\n- Drop any question that doesn't relate to one of the service_matches provided.\n- Return at most 30 questions, ranked from highest to lowest frequency.\n- Do not fabricate questions that aren't implied by the signals.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: `You are given customer signals from a brand's connected sources - review snippets, support ticket subjects. Your task is to extract the questions customers are actually asking.\n\nReview excerpts: {{Review_excerpts}}\n\nTicket subjects: {{Ticket_subjects}}`,
    inputFields: [
      { type: 'variable', value: 'Review_excerpts' },
      { type: 'variable', value: 'Ticket_subjects' },
    ],
    outputFields: [{ type: 'variable', value: 'Customer_questions' }],
    contextFields: [
      { type: 'address',    value: 'Brand.Brand_profile' },
      { type: 'attachment', value: 'Knowledge_Files' },
      { type: 'link',       value: 'Knowledge_URL' },
    ],
    previewInputFields: [
      { type: 'variable', name: 'Review_excerpts', value: 'I called at 11pm because my tooth was killing me and they got me in the next morning. Lifesaver' },
      { type: 'variable', name: 'Ticket_subjects', value: 'Do you take walk-ins on Sundays?' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Customer_questions', value: ' Question: Can I be seen the same day for tooth pain?\n Source type: Review\n Frequency count: 18\n Service match: Emergency dentistry' },
    ],
  },
  'node-8': {
    taskName: '6. Extract PAA (People Also Ask) Questions',
    description: "Scrape Google's \"People Also Ask\" for core queries + related searches",
    selectedTools: ['s69wacq'],
  },
  'node-mpbddllm-r2u8w': {
    taskName: 'Analyze query fanouts',
    description: 'Evaluate which queries are most relevant and rank them accordingly',
    llmModel: 'Fast',
    systemPrompt: `You are given a set of search queries the page wants to rank for. Your task is to expand each one into 5-8 variations real users actually search for, covering long-tail keywords, voice search phrasings, and modifiers (with/without insurance, by urgency, by demographic).\n\nRequirements:\n- Cover a mix of long-tail keyword phrasings, voice search ("Hey Google..." style), and modifier variations across the variations you produce for each source query.\n- Every variation must read like something a real user would type or speak. Avoid synthetic combinations like "emergency dentist near me right now urgent" that no human searches for.\n- Tag each variation with the source_query it expands from.\n- Return only the JSON output shape — no commentary, no preamble.`,
    userPrompt: `You are given a set of search queries the page wants to rank for. Your task is to expand each one into 5-8 variations real users actually search for, covering long-tail keywords, voice search phrasings, and modifiers (with/without insurance, by urgency, by demographic).\n\nExpanded_queries: {{Expanded_queries}}`,
    inputFields: [{ type: 'variable', value: '3. Search_queries' }],
    outputFields: [{ type: 'variable', value: 'Expanded_queries' }],
    contextFields: [{ type: 'variable', value: 'Brand.Brand_profile' }],
    previewInputFields: [
      { type: 'variable', name: '3. Search_queries', value: '1. Query: Emergency dentist dallas\n\nService match : Emergency dentistry\n\n2. Query: Emergency dentist dallas\n\nService match : Emergency dentistry' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Expanded_queries', value: 'Source query: Emergency dentist austin\nQuery: 24 hour emergency dentist near me\nType: Long tail' },
    ],
  },
  'node-9': {
    taskName: '8. Select FAQs from question pool',
    description: 'Group similar questions, classify each cluster, and pick the strongest 8-15 clusters to become the final FAQ set.',
    llmModel: 'Fast',
    systemPrompt: `You are given questions from three sources (customer signals, Perplexity research, Google "People Also Ask"), the search queries the page wants to rank for, and an expanded set of long-tail and voice search variations of those queries. Your task is to cluster similar questions, classify each cluster, and pick the strongest 8-15 to become the final FAQ set.\n\nCluster questions with the same intent into one canonical question. For example, "how much does it cost" and "what's the price" belong together. Pick the clearest phrasing as the canonical question.\n- Classify each cluster's intent (informational, commercial, transactional, or navigational) and tag it with a service_match naming the page service it relates to, or "general" if no specific service fits.\n- Pick 8-15 clusters to ship. Decide the actual count based on what the pool supports; do not pad with weak clusters to hit 15, and do not omit strong clusters to stay near 8.\n- Prefer clusters that align with target_queries or expanded_queries (when present).\n- Do not invent questions. Every cluster must originate from at least one question in the input pool.\n- Return only the JSON output shape. No commentary, no preamble.`,
    userPrompt: `You are given questions from three sources (customer signals, Perplexity research, Google "People Also Ask"), the search queries the page wants to rank for, and an expanded set of long-tail and voice search variations of those queries. Your task is to cluster similar questions, classify each cluster, and pick the strongest 8-15 to become the final FAQ set.\n\nCustomer_questions: {{5. Customer_questions}}\n\nPerplexity_questions: {{4. Perplexity_questions}}\n\nPaa_questions: {{6. PAA_Questions}}\n\nExpanded_queries: {{Expanded_queries}}`,
    inputFields: [
      { type: 'variable', value: '3. Search_queries' },
      { type: 'variable', value: '5. Customer_questions' },
      { type: 'variable', value: '4. Perplexity_questions' },
      { type: 'variable', value: '6. Paa_questions' },
    ],
    outputFields: [{ type: 'variable', value: 'Selected_FAQs' }],
    contextFields: [{ type: 'address', value: 'Brand.Brand_profile' }],
    previewInputFields: [
      { type: 'variable', name: '5. Customer_questions',  value: 'Question: Can I be seen the same day for tooth pain?\nSource type : Review\nFrequency count: 18\nService match: Emergency dentistry' },
      { type: 'variable', name: '4. Perplexity_questions', value: 'Question: What qualifies as a dental emergency?\nPerplexity draft answer: A dental emergency is any situation...,\nSources: ada.org, mayoclinic.org,\nSource query: Emergency dentist dallas' },
      { type: 'variable', name: '6. Paa_questions',       value: 'Question: How much is an emergency dental visit?\nRelated queries: emergency dentist cost\nSource query: Emergency dentist dallas' },
      { type: 'variable', name: '3. Search_queries',      value: '1. Emergency dentist dallas\n2. 24 hour dental clinic dallas\n3. Dental emergency near me' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Selected_FAQs', value: '1. Canonical_question: What qualifies as a dental emergency?\nIntent: Informational\nService match: Emergency dentistry\nMerged question count : 6\n\n2. Canonical_question: What qualifies as a dental emergency?\nIntent: Informational\nService match: Emergency dentistry\nMerged question count : 6' },
    ],
  },
  'node-10': {
    taskName: '8. Select FAQs from question pool',
    description: 'Group similar questions, classify each cluster, and pick the strongest 8-15 clusters to become the final FAQ set.',
    selectedTools: ['538goya'],
  },
  'node-11': {
    taskName: '9. Generate AEO optimised FAQs',
    description: 'Convert insights into structured questions and answers',
    llmModel: 'Fast',
    systemPrompt: `You are given questions from three sources (customer signals, Perplexity research, Google "People Also Ask"), the search queries the page wants to rank for, and an expanded set of long-tail and voice search variations of those queries. Your task is to cluster similar questions, classify each cluster, and pick the strongest 8-15 to become the final FAQ set.\n\nFor each answer:\n- Lead with the direct answer in the first sentence. No preambles.\n- The first 40-50 words must stand alone as a complete answer.\n- Total length must be 45-65 words.\n- Ground every fact in page_facts or brand_kit. Do not invent prices, hours, or policies.\n- Include a call to action only if the intent is transactional.\n- Return only the JSON output shape. No commentary, no preamble.`,
    userPrompt: `You are given questions from three sources (customer signals, Perplexity research, Google "People Also Ask"), the search queries the page wants to rank for, and an expanded set of long-tail and voice search variations of those queries. Your task is to cluster similar questions, classify each cluster, and pick the strongest 8-15 to become the final FAQ set.\n\nSelected FAQs: {{8. Selected_FAQs}}\nPage_type: {{Page_context.page_type}}\nPage_facts: {{Page_context.extracted_facts}}\nBrand_kit: {{Brand. brand_kit}}\nLocation_context: {{Location_context}}`,
    inputFields: [
      { type: 'variable', value: '8. Selected_faqs' },
      { type: 'variable', value: 'Brand_name' },
      { type: 'variable', value: 'Page_context.page_type' },
      { type: 'variable', value: 'Page_context.extracted_facts' },
      { type: 'variable', value: 'Brand_voice_traits' },
      { type: 'variable', value: 'Location_context' },
    ],
    outputFields: [{ type: 'variable', value: 'Final_FAQs' }],
    previewInputFields: [
      { type: 'variable', name: 'Brand_name',                   value: 'Bright Smiles Dallas' },
      { type: 'variable', name: 'Selected_FAQs',                value: 'Canonical_question: "What qualifies as a dental emergency?",\nIntent: Informational,\nService_match: Emergency_dentistry,\nMerged_question_count: 6' },
      { type: 'variable', name: 'Page_context.page_type',       value: 'Service page' },
      { type: 'variable', name: 'Page_context.extracted_facts', value: 'Label: Service\nValue: Emergency dentistry' },
      { type: 'variable', name: 'Brand_voice_traits',           value: 'Warm, plainspoken, reassuring; uses second-person; avoids medical jargon' },
      { type: 'variable', name: 'Location_context',             value: 'City: Dallas\nNeighborhood: Deep Ellum\nState: TX' },
    ],
    previewOutputFields: [
      { type: 'variable', name: 'Final_faqs', value: "Question: What qualifies as a dental emergency?\nAnswer: A dental emergency is any tooth pain, injury, or infection that needs same-day care. At Bright Smiles Dallas, our emergency team treats severe toothaches, knocked-out teeth, broken crowns, abscesses, and uncontrolled bleeding 24/7. Not sure if your situation qualifies? Call our emergency line and we'll triage over the phone.\nWord_count: 49\nService_match: Emergency_dentistry\nAeo_checks_passed: \"snippet\", \"voice\", \"entity\", \"length\"" },
    ],
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
