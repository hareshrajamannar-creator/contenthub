import React, { useState, useRef } from 'react';
import { Input } from '@/app/components/ui/input';
import NodeType from '../Organisms/Accordion/NodeType/NodeType';
import LHSEntityGroup from '../Molecules/LHS/LHSEntityGroup/LHSEntityGroup';
import LHSTwoLevelGroup from '../Molecules/LHS/LHSTwoLevelGroup/LHSTwoLevelGroup';
import './LHSDrawer.css';

/* ─── Trigger data ─── */
export const TRIGGER_SUB_ITEMS = {
  Reviews: {
    title: 'Review event',
    items: [
      'When a new review is received',
      'When a review is updated',
      'When a review is responded',
      'When a new review is received or updated',
    ],
  },
  Inbox: {
    title: 'Inbox trigger',
    platforms: {
      Voice: {
        icon: 'call',
        items: ['Call received'],
      },
      Text: {
        icon: 'sms',
        items: ['Message received'],
      },
      Webchat: {
        icon: 'chat',
        items: ['Message received'],
      },
    },
  },
  Listings: {
    title: 'Listing event',
    items: [
      'When a listing is updated',
      'When a new listing is added',
      'When listing data changes',
    ],
  },
  Social: {
    title: 'Social event',
    items: [
      'When a new post is published',
      'When a comment is received',
      'When a mention is detected',
    ],
  },
  Appointments: {
    title: 'Appointment event',
    items: [
      'When an appointment is booked',
      'When an appointment is cancelled',
      'When an appointment is rescheduled',
    ],
  },
  Contacts: {
    title: 'Contact event',
    items: [
      'When a new contact is added',
      'When a contact is updated',
      'When a contact is merged',
    ],
  },
  Ticketing: {
    title: 'Ticketing event',
    items: [
      'When a new ticket is created',
      'When a ticket is updated',
      'When a ticket is resolved',
    ],
  },
  Payments: {
    title: 'Payment event',
    items: [
      'When a payment is received',
      'When a payment fails',
      'When a refund is issued',
    ],
  },
};

export const TRIGGER_CARDS = [
  { label: 'Schedule-based', icon: 'schedule', action: 'drag' },
  { label: 'Custom trigger', icon: 'tune', action: 'drag' },
  { label: 'Reviews', icon: 'grade', action: 'chevron' },
  { label: 'Listings', icon: 'location_on', action: 'chevron' },
  { label: 'Social', icon: 'workspaces', action: 'chevron' },
  { label: 'Inbox', icon: 'inbox', action: 'chevron' },
  { label: 'Appointments', icon: 'calendar_month', action: 'chevron' },
  { label: 'Contacts', icon: 'group', action: 'chevron' },
  { label: 'Ticketing', icon: 'shapes', action: 'chevron' },
  { label: 'Payments', icon: 'payments', action: 'chevron' },
];

/* ─── Task data ─── */
const TASK_SUB_ITEMS = {
  'Conversation-tasks': {
    title: 'Conversation task',
    items: ['Response', 'Transfer', 'Close'],
  },
  Review: {
    title: 'Review task',
    items: [
      'Respond to a review',
      'Translate a review',
      'Categorize a review',
      'Analyze review sentiment',
    ],
  },
  'Inbox-task': {
    title: 'Inbox task',
    platforms: {
      Voice: {
        icon: 'call',
        items: [
          'Make an outbound call',
          'Log a call',
          'Schedule a callback',
          'Send a voicemail',
        ],
      },
      Text: {
        icon: 'sms',
        items: [
          'Send an SMS',
          'Send a bulk SMS',
          'Schedule an SMS',
          'Send from template',
        ],
      },
      Webchat: {
        icon: 'chat',
        items: [
          'Send a message',
          'Assign a conversation',
          'Close a conversation',
          'Add a note',
        ],
      },
    },
  },
  Listings: {
    title: 'Listings task',
    items: [
      'Update a listing',
      'Publish a listing',
      'Unpublish a listing',
    ],
  },
  Social: {
    title: 'Social task',
    items: [
      'Post to social',
      'Reply to comment',
      'Schedule a post',
    ],
  },
  Appointments: {
    title: 'Appointment task',
    items: [
      'Book an appointment',
      'Cancel an appointment',
      'Send a reminder',
    ],
  },
  Contacts: {
    title: 'Contact task',
    items: [
      'Create a contact',
      'Update a contact',
      'Tag a contact',
    ],
  },
  Ticketing: {
    title: 'Ticketing task',
    items: [
      'Create a ticket',
      'Update a ticket',
      'Assign a ticket',
      'Close a ticket',
    ],
  },
  Payments: {
    title: 'Payment task',
    items: [
      'Send a payment request',
      'Issue a refund',
      'Send a receipt',
    ],
  },
};

export const TASK_CARDS = [
  { label: 'Custom', icon: 'dashboard_customize', action: 'drag' },
  { label: 'Conversation', icon: 'forum', action: 'chevron', subKey: 'Conversation-tasks' },
  { label: 'Inbox', icon: 'inbox', action: 'chevron', subKey: 'Inbox-task' },
  { label: 'Review', icon: 'grade', action: 'chevron', subKey: 'Review' },
  { label: 'Listings', icon: 'location_on', action: 'chevron', subKey: 'Listings' },
  { label: 'Social', icon: 'workspaces', action: 'chevron', subKey: 'Social' },
  { label: 'Appointments', icon: 'calendar_month', action: 'chevron', subKey: 'Appointments' },
  { label: 'Contacts', icon: 'group', action: 'chevron', subKey: 'Contacts' },
  { label: 'Ticketing', icon: 'confirmation_number', action: 'chevron', subKey: 'Ticketing' },
  { label: 'Payments', icon: 'payments', action: 'chevron', subKey: 'Payments' },
];

/* ─── Controls data ─── */
export const CONTROL_CARDS = [
  { label: 'Branch', icon: 'account_tree', action: 'drag', nodeType: 'branch' },
  { label: 'Delay', icon: 'schedule', action: 'drag', nodeType: 'delay' },
  { label: 'Parallel tasks', icon: 'splitscreen_add', action: 'drag', nodeType: 'parallel' },
  { label: 'Loop', icon: 'repeat', action: 'drag', nodeType: 'loop' },
];

/* ─── All sub-items merged ─── */
const ALL_SUB_ITEMS = { ...TRIGGER_SUB_ITEMS, ...TASK_SUB_ITEMS };
const SECTION_SUB_ITEMS = { trigger: TRIGGER_SUB_ITEMS, task: TASK_SUB_ITEMS };

/* ─── Card Row ─── */

export function CardRow({ label, icon, action, isActive, onClick, onHover, cardRef, nodeType }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType);
    e.dataTransfer.setData('application/reactflow-label', label);
    e.dataTransfer.setData('application/reactflow-description', label);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      ref={cardRef}
      className={`lhs-drawer__card ${action === 'drag' ? 'lhs-drawer__card--drag' : ''} ${isActive ? 'lhs-drawer__card--active' : ''}`}
      onClick={onClick}
      onMouseEnter={onHover}
      draggable={action === 'drag'}
      onDragStart={action === 'drag' ? handleDragStart : undefined}
    >
      <span className="lhs-drawer__card-icon material-symbols-outlined">
        {icon}
      </span>
      <span className="lhs-drawer__card-label">{label}</span>
      {action === 'drag' ? (
        <span className="lhs-drawer__card-action">
          <span className="material-symbols-outlined">drag_indicator</span>
        </span>
      ) : (
        <span className="lhs-drawer__card-action lhs-drawer__card-action--chevron">
          <span className="material-symbols-outlined">expand_more</span>
        </span>
      )}
    </div>
  );
}

export default function LHSDrawer({
  defaultOpenSection = 'Trigger',
}) {
  const [openSection, setOpenSection] = useState(defaultOpenSection);
  const toggleSection = (section) => setOpenSection(section);
  const [search, setSearch] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const panelRef = useRef(null);
  const cardRefs = useRef({});

  const handleCardHover = (card, section, subKey) => {
    if (card.action !== 'chevron') {
      setExpandedCard(null);
      setExpandedSection(null);
      return;
    }

    const key = subKey || card.label;

    const cardEl = cardRefs.current[`${section}-${card.label}`];
    const panelEl = panelRef.current;
    if (cardEl && panelEl) {
      const cardRect = cardEl.getBoundingClientRect();
      const panelRect = panelEl.getBoundingClientRect();
      setDropdownTop(cardRect.top - panelRect.top);
    }
    setExpandedCard(key);
    setExpandedSection(section);
  };

  const renderCards = (cards, section, nodeType) => (
    <div className="lhs-drawer__cards">
      {cards.filter(
        (c) => !search || c.label.toLowerCase().includes(search.toLowerCase())
      ).map((card) => {
        const subKey = card.subKey || card.label;
        return (
          <div key={card.label} className="lhs-drawer__card-wrapper">
            <CardRow
              label={card.label}
              icon={card.icon}
              action={card.action}
              nodeType={card.nodeType || nodeType}
              isActive={expandedCard === subKey && expandedSection === section}
              onClick={() => {}}
              onHover={() => handleCardHover(card, section, card.subKey)}
              cardRef={(el) => { cardRefs.current[`${section}-${card.label}`] = el; }}
            />
          </div>
        );
      })}
    </div>
  );

  const triggerContent = renderCards(TRIGGER_CARDS, 'trigger', 'trigger');
  const tasksContent = renderCards(TASK_CARDS, 'task', 'task');
  const controlsContent = renderCards(CONTROL_CARDS, 'control', 'branch');

  const activeSubItems = expandedCard
    ? (SECTION_SUB_ITEMS[expandedSection] ?? ALL_SUB_ITEMS)[expandedCard]
    : null;

  const closeDropdown = () => {
    setExpandedCard(null);
    setExpandedSection(null);
  };

  return (
    <div className="lhs-drawer" ref={panelRef} onMouseLeave={closeDropdown}>
      <div className="lhs-drawer__body">
        <div className="lhs-drawer__search">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 8, fontSize: 18, color: '#8f8f8f', pointerEvents: 'none' }}>search</span>
            <Input
              name="search"
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
        </div>

        <div className="lhs-drawer__sections">
          <NodeType title="Trigger" content={triggerContent} isOpen={openSection === 'Trigger'} onToggle={() => toggleSection('Trigger')} />
          <NodeType title="Tasks" content={tasksContent} isOpen={openSection === 'Tasks'} onToggle={() => toggleSection('Tasks')} />
          <NodeType title="Controls" content={controlsContent} isOpen={openSection === 'Controls'} onToggle={() => toggleSection('Controls')} />
        </div>
      </div>

      {activeSubItems && (
        <div
          className="lhs-drawer__dropdown-zone"
          style={{ top: dropdownTop }}
        >
          <div className="lhs-drawer__dropdown-bridge" />
          {activeSubItems.platforms ? (
            <LHSTwoLevelGroup
              title={activeSubItems.title}
              platforms={activeSubItems.platforms}
              nodeType={expandedSection === 'trigger' ? 'trigger' : 'task'}
              onDragStart={closeDropdown}
            />
          ) : (
            <LHSEntityGroup
              title={activeSubItems.title}
              items={activeSubItems.items}
              nodeType={expandedSection === 'trigger' ? 'trigger' : 'task'}
              parentLabel={expandedCard}
              onDragStart={closeDropdown}
            />
          )}
        </div>
      )}
    </div>
  );
}
