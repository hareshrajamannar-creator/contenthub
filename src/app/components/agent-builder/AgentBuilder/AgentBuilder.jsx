import React, { useState, useCallback } from 'react';
import dagre from '@dagrejs/dagre';
import AppShell from '../AppShell/AppShell';
import LHSDrawer, { TRIGGER_SUB_ITEMS } from '../LHSDrawer/LHSDrawer';
import FlowCanvas from '../FlowCanvas/FlowCanvas';
import RHS from '../Organisms/Panels/RHS/RHS';
import RHSStart from '../Molecules/RHS/Start/RHSStart';
import ScheduleBased from '../Molecules/RHS/Trigger/ScheduleBased/ScheduleBased';
import AddNodeModal from '../Organisms/Modals/AddNodeModal/AddNodeModal';
import AIChatBubble from '../Molecules/AIChatBubble/AIChatBubble';
import AIPromptBox from '../Molecules/AIPromptBox/AIPromptBox';
import './AgentBuilder.css';

const START_NODE_ID = '__start__';
const END_NODE_ID = '__end__';

// Node dimensions used by dagre for layout calculations
const NODE_DIMS = {
  start: { w: 400, h: 80 },
  end: { w: 400, h: 40 },
  branchPath: { w: 160, h: 40 },
  default: { w: 400, h: 100 },
};

function applyDagreLayout(rawNodes, rawEdges) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 80, marginx: 40, marginy: 40 });

  rawNodes.forEach((node) => {
    const dims = NODE_DIMS[node.type] || NODE_DIMS.default;
    g.setNode(node.id, { width: dims.w, height: dims.h });
  });

  rawEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return rawNodes.map((node) => {
    const { x, y, width, height } = g.node(node.id);
    return { ...node, position: { x: x - width / 2, y: y - height / 2 } };
  });
}

function buildFlow(nodeList, startData, nodeDetails = {}) {
  const rawNodes = [];
  const edges = [];

  rawNodes.push({
    id: START_NODE_ID,
    type: 'start',
    position: { x: 0, y: 0 },
    data: { title: startData.title, subtitle: startData.subtitle },
  });

  nodeList.forEach((item, i) => {
    const nodeId = item.id;
    const prevId = i === 0 ? START_NODE_ID : nodeList[i - 1].id;
    rawNodes.push({
      id: nodeId,
      type: item.flowType,
      position: { x: 0, y: 0 },
      data: { ...item.data },
    });
    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
      type: 'addButton',
      data: { isMainline: true },
    });

    if (item.flowType === 'branch') {
      const branches = nodeDetails[nodeId]?.branches || [];
      branches.forEach((branch) => {
        const pathNodes = nodeDetails[branch.id]?.nodes || [];

        rawNodes.push({
          id: branch.id,
          type: 'branchPath',
          position: { x: 0, y: 0 },
          data: { label: branch.name, hasIcons: true, parentId: nodeId, pathId: branch.id },
        });
        edges.push({
          id: `e-${nodeId}-${branch.id}`,
          source: nodeId,
          target: branch.id,
          style: { stroke: '#ccd5e4', strokeWidth: 1 },
        });

        let prevBranchId = branch.id;
        pathNodes.forEach((pn) => {
          rawNodes.push({
            id: pn.id,
            type: pn.flowType,
            position: { x: 0, y: 0 },
            data: { ...pn.data },
          });
          edges.push({
            id: `e-${prevBranchId}-${pn.id}`,
            source: prevBranchId,
            target: pn.id,
            type: 'addButton',
            data: { branchPathId: branch.id },
          });
          prevBranchId = pn.id;
        });

        // Each branch terminates with its own End node
        const branchEndId = `${branch.id}-end`;
        edges.push({
          id: `e-${prevBranchId}-${branchEndId}`,
          source: prevBranchId,
          target: branchEndId,
          type: 'addButton',
          data: { branchPathId: branch.id },
        });
        rawNodes.push({
          id: branchEndId,
          type: 'end',
          position: { x: 0, y: 0 },
          data: {},
        });
      });
    }
  });

  // Shared End only when the last mainline node is not a branch
  const lastItem = nodeList.length > 0 ? nodeList[nodeList.length - 1] : null;
  if (!lastItem || lastItem.flowType !== 'branch') {
    const lastId = lastItem ? lastItem.id : START_NODE_ID;
    rawNodes.push({
      id: END_NODE_ID,
      type: 'end',
      position: { x: 0, y: 0 },
      data: {},
    });
    edges.push({
      id: `e-${lastId}-${END_NODE_ID}`,
      source: lastId,
      target: END_NODE_ID,
      type: 'addButton',
      data: { isMainline: true },
    });
  }

  const nodes = applyDagreLayout(rawNodes, edges);
  return { nodes, edges };
}

let nodeIdCounter = 0;
function nextId() {
  nodeIdCounter += 1;
  return `node-${nodeIdCounter}`;
}


export default function AgentBuilder({
  appTitle = 'Reviews AI',
  pageTitle = 'Review response agent  1',
  activeNavId = 'reviews',
  startSubtitle = 'AI-powered review response agent',
  defaultNodes = [],
  defaultNodeDetails = {},
  conversational = false,
  onBack,
  onPublish,
  publishDisabled = false,
  aiOptions,
}) {
  const [navId, setNavId] = useState(activeNavId);
  const [nodeList, setNodeList] = useState(defaultNodes);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nodeDetails, setNodeDetails] = useState(defaultNodeDetails);
  const [addAfterNodeId, setAddAfterNodeId] = useState(null);
  const [addAfterPosition, setAddAfterPosition] = useState(null);
  const [userEdges, setUserEdges] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const handleDeleteNode = useCallback((nodeId) => {
    // Check if this node lives inside a branch path
    let branchPathKey = null;
    for (const key of Object.keys(nodeDetails)) {
      if (nodeDetails[key]?.isBranchPath && nodeDetails[key]?.nodes) {
        if (nodeDetails[key].nodes.some((n) => n.id === nodeId)) {
          branchPathKey = key;
          break;
        }
      }
    }

    if (branchPathKey) {
      setNodeDetails((prev) => {
        const copy = { ...prev };
        const pathDetail = copy[branchPathKey];
        copy[branchPathKey] = {
          ...pathDetail,
          nodes: pathDetail.nodes
            .filter((n) => n.id !== nodeId)
            .map((n, i) => ({ ...n, data: { ...n.data, stepNumber: i + 1 } })),
        };
        delete copy[nodeId];
        return copy;
      });
    } else {
      setNodeList((prev) => {
        const updated = prev.filter((n) => n.id !== nodeId);
        return updated.map((n, i) => ({
          ...n,
          data: { ...n.data, stepNumber: i + 1 },
        }));
      });
      setNodeDetails((prev) => {
        const copy = { ...prev };
        delete copy[nodeId];
        Object.keys(copy).forEach((key) => {
          if (copy[key]?.parentId === nodeId) delete copy[key];
        });
        return copy;
      });
    }

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setDrawerOpen(false);
    }
  }, [selectedNodeId, nodeDetails]);

  const handleDropNode = useCallback(({ type, label, description, targetNodeId, sourceNodeId, branchPathId, insertAfterNodeId }) => {
    const id = nextId();

    let flowType = 'task';
    let title = 'Task';
    let hasAiIcon = false;

    if (type === 'trigger') {
      flowType = 'trigger';
      title = 'Trigger';
    } else if (type === 'branch') {
      flowType = 'branch';
      title = 'Branch';
    } else if (type === 'task') {
      flowType = 'task';
      title = 'Task';
      hasAiIcon = label === 'Custom' || description === 'Response';
    } else if (type === 'delay' || type === 'parallel' || type === 'loop') {
      flowType = 'task';
      title = 'Task';
    }

    const CONVERSATION_ITEMS = ['Response', 'Transfer', 'Close'];
    const isConversationItem = type === 'task' && CONVERSATION_ITEMS.includes(description);

    const TRIGGER_DUMMY_DESC = 'Triggers the workflow when this event occurs.';
    const TASK_DUMMY_DESC = 'Configure this task to automate your workflow.';

    let nodeDescription = description;
    let nodeSubtitle = `${label}: ${description}`;
    if (type === 'trigger' && label !== 'Schedule-based' && label !== 'Custom trigger') {
      nodeDescription = description;
      nodeSubtitle = TRIGGER_DUMMY_DESC;
    } else if (label === 'Custom trigger') {
      nodeSubtitle = description;
    } else if (type === 'task' && (label === 'Custom' || description === 'Response')) {
      nodeSubtitle = '';
    } else if (type === 'task') {
      nodeSubtitle = TASK_DUMMY_DESC;
    }

    const newNode = {
      id,
      flowType,
      data: {
        title,
        subtype: isConversationItem ? description : label,
        stepNumber: null,
        description: nodeDescription,
        subtitle: nodeSubtitle,
        hasAiIcon,
        hasToggle: true,
        toggleEnabled: true,
      },
    };

    // Compute details/extraDetails before state updates
    let details = {};
    let extraDetails = {};

    if (type === 'trigger' && label === 'Schedule-based') {
      details = { frequency: 'Daily', day: '7 days', time: '9:00 AM' };
    } else if (type === 'trigger') {
      details = {
        triggerName: description || '',
        description: TRIGGER_DUMMY_DESC,
        conditions: [
          { field: '', operator: '', value: '' },
          { field: '', operator: '', value: '' },
          { field: '', operator: '', value: '' },
        ],
      };
    } else if (type === 'branch' && label === 'Branch') {
      const path1Id = `${id}-path-1`;
      const path2Id = `${id}-path-2`;
      const defaultPathId = `${id}-path-default`;
      details = {
        basedOn: 'conditions',
        branches: [
          { id: path1Id, name: 'Branch 1' },
          { id: path2Id, name: 'Branch 2' },
          { id: defaultPathId, name: 'No conditions match' },
        ],
      };
      extraDetails = {
        [path1Id]: { branchName: 'Branch 1', description: '', conditions: [], parentId: id, isBranchPath: true, nodes: [] },
        [path2Id]: { branchName: 'Branch 2', description: '', conditions: [], parentId: id, isBranchPath: true, nodes: [] },
        [defaultPathId]: { branchName: 'No conditions match', description: '', conditions: [], parentId: id, isBranchPath: true, isDefault: true, nodes: [] },
      };
    } else if (type === 'task' && label === 'Custom') {
      details = {
        taskName: 'Custom',
        description: '',
        llmModel: 'Fast',
        systemPrompt: '',
        userPrompt: '',
      };
    } else if (type === 'task' && description === 'Response') {
      details = {
        taskName: description,
        description: '',
        tool: { name: description },
      };
    } else {
      details = {
        taskName: description,
        description: TASK_DUMMY_DESC,
        tool: { name: description },
      };
    }

    if (branchPathId) {
      // Insert into the branch path's own node list
      setNodeDetails((prev) => {
        const pathDetail = prev[branchPathId] || {};
        const pathNodes = pathDetail.nodes || [];
        let insertIdx = pathNodes.length;
        if (targetNodeId && targetNodeId !== '__branch_path__') {
          const idx = pathNodes.findIndex((n) => n.id === targetNodeId);
          if (idx >= 0) insertIdx = idx;
        }
        const updatedPathNodes = [
          ...pathNodes.slice(0, insertIdx),
          newNode,
          ...pathNodes.slice(insertIdx),
        ].map((n, i) => ({ ...n, data: { ...n.data, stepNumber: i + 1 } }));
        return {
          ...prev,
          [branchPathId]: { ...pathDetail, nodes: updatedPathNodes },
          [id]: details,
          ...extraDetails,
        };
      });
    } else {
      setNodeList((prev) => {
        let insertIndex;
        if (insertAfterNodeId !== undefined) {
          if (insertAfterNodeId === START_NODE_ID) {
            insertIndex = 0;
          } else {
            const idx = prev.findIndex((n) => n.id === insertAfterNodeId);
            insertIndex = idx >= 0 ? idx + 1 : prev.length;
          }
        } else if (targetNodeId !== undefined) {
          if (targetNodeId === END_NODE_ID) {
            insertIndex = prev.length;
          } else {
            const idx = prev.findIndex((n) => n.id === targetNodeId);
            if (idx >= 0) {
              insertIndex = idx;
            } else {
              const sourceIdx = prev.findIndex((n) => n.id === sourceNodeId);
              insertIndex = sourceIdx >= 0 ? sourceIdx + 1 : prev.length;
            }
          }
        } else {
          insertIndex = prev.length;
        }
        const updated = [
          ...prev.slice(0, insertIndex),
          newNode,
          ...prev.slice(insertIndex),
        ];
        return updated.map((n, i) => ({
          ...n,
          data: { ...n.data, stepNumber: i + 1 },
        }));
      });

      setNodeDetails((prev) => ({
        ...prev,
        [id]: details,
        ...extraDetails,
      }));
    }
  }, []);

  const startData = { title: pageTitle, subtitle: startSubtitle };
  const { nodes: rawNodes, edges } = buildFlow(nodeList, startData, nodeDetails);

  const nodes = rawNodes.map((n) => {
    if (n.id === END_NODE_ID) return n;
    if (n.id === START_NODE_ID) {
      return { ...n, data: { ...n.data, onAddAfterClick: (_, rect) => { setAddAfterNodeId(START_NODE_ID); setAddAfterPosition(rect ?? null); } } };
    }
    if (n.type === 'branchPath') {
      return { ...n, data: { ...n.data, onDropNode: handleDropNode } };
    }
    return {
      ...n,
      data: {
        ...n.data,
        onDelete: () => handleDeleteNode(n.id),
        onAddAfterClick: (_, rect) => { setAddAfterNodeId(n.id); setAddAfterPosition(rect ?? null); },
      },
    };
  });

  // Updates a node's data whether it lives in nodeList or inside a branch path
  const setNodeInPlace = (nodeId, updater) => {
    setNodeList((prev) => {
      if (!prev.some((n) => n.id === nodeId)) return prev;
      return prev.map((n) => (n.id !== nodeId ? n : updater(n)));
    });
    setNodeDetails((prev) => {
      for (const [pathId, detail] of Object.entries(prev)) {
        if (detail?.isBranchPath && detail.nodes?.some((n) => n.id === nodeId)) {
          return {
            ...prev,
            [pathId]: {
              ...detail,
              nodes: detail.nodes.map((n) => (n.id !== nodeId ? n : updater(n))),
            },
          };
        }
      }
      return prev;
    });
  };

  // Look for selected node in mainline list AND branch-internal nodes
  let selectedNode = nodeList.find((n) => n.id === selectedNodeId);
  if (!selectedNode && selectedNodeId) {
    for (const detail of Object.values(nodeDetails)) {
      if (detail?.nodes) {
        selectedNode = detail.nodes.find((n) => n.id === selectedNodeId);
        if (selectedNode) break;
      }
    }
  }

  const handleConnect = useCallback((connection) => {
    setUserEdges((prev) => [
      ...prev,
      {
        id: `ue-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        style: { stroke: '#1976d2', strokeWidth: 1.5 },
      },
    ]);
  }, []);

  const handleNodeClick = useCallback((node) => {
    if (node.type === 'end') return;
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedNodeId(null);
  }, []);

  const currentDetails = selectedNodeId ? (nodeDetails[selectedNodeId] || {}) : {};

  const renderRHSPanel = () => {
    if (!selectedNodeId) return null;

    // Start node → agent details (workflow) or conversational start
    if (selectedNodeId === START_NODE_ID) {
      if (conversational) {
        const startDetails = nodeDetails[START_NODE_ID] || {
          name: pageTitle,
          goals: '',
          outcomes: '',
          locations: [],
          channels: [],
          channelValues: {},
        };
        return (
          <RHSStart
            key={selectedNodeId}
            initialValues={startDetails}
            onValuesChange={(values) => {
              setNodeDetails((prev) => ({ ...prev, [START_NODE_ID]: values }));
            }}
            onClose={handleCloseDrawer}
            onSave={(values) => {
              setNodeDetails((prev) => ({ ...prev, [START_NODE_ID]: values }));
              handleCloseDrawer();
            }}
          />
        );
      }

      const startDetails = nodeDetails[START_NODE_ID] || {
        agentName: pageTitle,
        goals: 'Respond to customer reviews promptly and professionally, maintaining brand voice and addressing specific customer feedback.',
        outcomes: 'Improved customer satisfaction scores, faster response times, and consistent brand messaging across all review platforms.',
        locations: [
          { id: '1001', name: 'Mountain view, CA' },
          { id: '1002', name: 'Seattle, WA' },
          { id: '1004', name: 'Chicago, IL' },
        ],
        moreLocationsCount: 1,
      };
      return (
        <RHS
          key={selectedNodeId}
          variant="agentDetails"
          title="Agent details"
          bodyProps={{
            values: startDetails,
            onChange: (field, value) => {
              setNodeDetails((prev) => ({
                ...prev,
                [START_NODE_ID]: { ...startDetails, [field]: value },
              }));
            },
          }}
          onClose={handleCloseDrawer}
          onSave={handleCloseDrawer}
        />
      );
    }

    // Branch path node → branch details
    if (currentDetails.isBranchPath) {
      const parentDetails = nodeDetails[currentDetails.parentId] || {};
      return (
        <RHS
          key={selectedNodeId}
          variant="branch"
          title="Branch details"
          bodyProps={{
            initialValues: {
              ...currentDetails,
              basedOn: parentDetails.basedOn ?? 'conditions',
              parentFieldName: parentDetails.fieldName ?? '',
            },
          }}
          onClose={handleCloseDrawer}
          onSave={(values) => {
            setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            handleCloseDrawer();
          }}
        />
      );
    }

    if (!selectedNode) return null;
    const { flowType, data } = selectedNode;

    // Schedule trigger
    if (flowType === 'trigger' && data.subtype === 'Schedule-based') {
      return (
        <ScheduleBased
          key={selectedNodeId}
          onClose={handleCloseDrawer}
          onSave={(values) => {
            setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            handleCloseDrawer();
          }}
          onPreview={() => {}}
          onExpand={() => {}}
          frequencyOptions={['Hourly', 'Daily', 'Weekly', 'Monthly']}
          dayOptions={['1 day', '2 days', '3 days', '7 days', '14 days', '30 days']}
          timeOptions={['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM']}
          defaultFrequency={currentDetails.frequency || 'Daily'}
          defaultDay={currentDetails.day || '7 days'}
          defaultTime={currentDetails.time || '9:00 AM'}
        />
      );
    }

    // Custom trigger
    if (flowType === 'trigger' && data.subtype === 'Custom trigger') {
      return (
        <RHS
          key={selectedNodeId}
          variant="customTrigger"
          title="Trigger"
          bodyProps={{
            initialValues: currentDetails,
            onChange: (field, value) => {
              setNodeDetails((prev) => ({
                ...prev,
                [selectedNodeId]: { ...currentDetails, [field]: value },
              }));
              if (field === 'description') {
                setNodeList((prev) => prev.map((n) => {
                  if (n.id !== selectedNodeId) return n;
                  return {
                    ...n,
                    data: { ...n.data, subtitle: value || n.data.subtitle },
                  };
                }));
              }
            },
          }}
          onClose={handleCloseDrawer}
          onSave={(values) => {
            setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            handleCloseDrawer();
          }}
        />
      );
    }

    // Inbox channel triggers (Voice, Text, Webchat)
    const INBOX_CHANNELS = ['Voice', 'Text', 'Webchat'];
    if (flowType === 'trigger' && INBOX_CHANNELS.includes(data.subtype)) {
      const inboxOptions = TRIGGER_SUB_ITEMS?.Inbox?.platforms?.[data.subtype]?.items ?? [];
      return (
        <RHS
          key={selectedNodeId}
          variant="inboxTrigger"
          title={`${data.subtype} trigger`}
          bodyProps={{
            channel: data.subtype,
            options: inboxOptions,
            initialValues: currentDetails,
            onChange: (field, value) => {
              setNodeDetails((prev) => ({
                ...prev,
                [selectedNodeId]: { ...currentDetails, [field]: value },
              }));
              if (field === 'triggerName') {
                setNodeList((prev) => prev.map((n) => {
                  if (n.id !== selectedNodeId) return n;
                  return { ...n, data: { ...n.data, description: value } };
                }));
              }
            },
          }}
          onClose={handleCloseDrawer}
          onSave={handleCloseDrawer}
        />
      );
    }

    // Entity trigger
    if (flowType === 'trigger') {
      return (
        <RHS
          key={selectedNodeId}
          variant="entityTrigger"
          title="Trigger"
          bodyProps={{
            category: data.subtype,
            initialValues: currentDetails,
            onChange: (field, value) => {
              setNodeDetails((prev) => ({
                ...prev,
                [selectedNodeId]: { ...currentDetails, [field]: value },
              }));
              setNodeList((prev) => prev.map((n) => {
                if (n.id !== selectedNodeId) return n;
                if (field === 'triggerName') return { ...n, data: { ...n.data, description: value } };
                if (field === 'description') return { ...n, data: { ...n.data, subtitle: value } };
                return n;
              }));
            },
          }}
          onClose={handleCloseDrawer}
          onSave={handleCloseDrawer}
        />
      );
    }

    // Branch node → branch overview (controlBranch)
    if (flowType === 'branch' || Array.isArray(currentDetails.branches)) {
      return (
        <RHS
          key={selectedNodeId}
          variant="controlBranch"
          title="Branch"
          bodyProps={{
            initialValues: { description: data.subtitle ?? '', ...currentDetails },
            onValuesChange: (values) => {
              setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            },
          }}
          onClose={handleCloseDrawer}
          onSave={(values) => {
            setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            setNodeList((prev) => prev.map((n) => {
              if (n.id !== selectedNodeId) return n;
              return { ...n, data: { ...n.data, subtitle: values.description || n.data.subtitle } };
            }));
            handleCloseDrawer();
          }}
        />
      );
    }

    // Generic Conversation node — user picks type in RHS
    if (flowType === 'task' && data.subtype === 'Conversation') {
      return (
        <RHS
          key={selectedNodeId}
          variant="conversationType"
          title="Conversation"
          bodyProps={{
            initialValues: currentDetails,
            onTypeSelect: (type) => {
              setNodeInPlace(selectedNodeId, (n) => ({
                ...n,
                data: { ...n.data, subtype: type, description: type },
              }));
              setNodeDetails((prev) => ({
                ...prev,
                [selectedNodeId]: { ...prev[selectedNodeId], taskName: type },
              }));
            },
          }}
          onClose={handleCloseDrawer}
          onSave={handleCloseDrawer}
        />
      );
    }

    // Delay / Parallel / Loop / Conversation tasks by subtype
    const subtypeVariantMap = {
      Delay: 'delay',
      Parallel: 'parallel',
      Loop: 'loop',
      Response: 'responseNode',
      Transfer: 'transferNode',
      Close: 'endNode',
    };
    const subtypeVariant = subtypeVariantMap[data.subtype];
    if (subtypeVariant) {
      const isDelay = data.subtype === 'Delay';
      const savesToCanvas = data.subtype === 'Response' || data.subtype === 'Transfer';
      return (
        <RHS
          key={selectedNodeId}
          variant={subtypeVariant}
          title={data.subtype}
          bodyProps={{
            initialValues: {
              description: data.subtitle ?? '',
              ...currentDetails,
            },
            ...(isDelay && {
              onChange: (field, value) => {
                setNodeDetails((prev) => ({
                  ...prev,
                  [selectedNodeId]: { ...currentDetails, [field]: value },
                }));
                if (field === 'description') {
                  setNodeInPlace(selectedNodeId, (n) => ({ ...n, data: { ...n.data, subtitle: value } }));
                }
              },
            }),
          }}
          onClose={handleCloseDrawer}
          onSave={savesToCanvas ? (values) => {
            setNodeDetails((prev) => ({ ...prev, [selectedNodeId]: { ...currentDetails, ...values } }));
            setNodeInPlace(selectedNodeId, (n) => ({
              ...n,
              data: {
                ...n.data,
                description: data.subtype,
                subtitle: values.description || n.data.subtitle,
              },
            }));
            handleCloseDrawer();
          } : handleCloseDrawer}
        />
      );
    }

    // LLM task (Custom)
    if (data.hasAiIcon) {
      return (
        <RHS
          key={selectedNodeId}
          variant="llmTask"
          title="Task"
          bodyProps={{
            initialValues: currentDetails,
            onChange: (field, value) => {
              setNodeDetails((prev) => ({
                ...prev,
                [selectedNodeId]: { ...currentDetails, [field]: value },
              }));
              if (field === 'description') {
                setNodeInPlace(selectedNodeId, (n) => ({ ...n, data: { ...n.data, subtitle: value } }));
              }
            },
          }}
          onClose={handleCloseDrawer}
          onSave={handleCloseDrawer}
        />
      );
    }

    // Entity task (default)
    return (
      <RHS
        key={selectedNodeId}
        variant="entityTask"
        title="Task"
        bodyProps={{
          category: data.subtype,
          initialValues: currentDetails,
          onChange: (field, value) => {
            setNodeDetails((prev) => ({
              ...prev,
              [selectedNodeId]: { ...currentDetails, [field]: value },
            }));
            setNodeInPlace(selectedNodeId, (n) => {
              if (field === 'taskName') return { ...n, data: { ...n.data, description: value } };
              if (field === 'description') return { ...n, data: { ...n.data, subtitle: value } };
              return n;
            });
          },
        }}
        onClose={handleCloseDrawer}
        onSave={handleCloseDrawer}
      />
    );
  };

  const handlePublish = useCallback(() => {
    onPublish?.(nodeList, nodeDetails);
  }, [nodeList, nodeDetails, onPublish]);

  return (
    <AppShell
      appTitle={appTitle}
      pageTitle={pageTitle}
      activeNavId={navId}
      onNavChange={setNavId}
      onBack={onBack}
      onPublish={handlePublish}
      publishDisabled={publishDisabled}
    >
      <div className="agent-builder">
        <div className="agent-builder__lhs">
          <LHSDrawer triggerOpen tasksOpen={false} controlsOpen={false} />
        </div>
        <div className={`agent-builder__canvas ${drawerOpen ? 'agent-builder__canvas--with-rhs' : ''}`}>
          <FlowCanvas
            nodes={nodes}
            edges={[...edges, ...userEdges]}
            onNodeClick={handleNodeClick}
            onDropNode={handleDropNode}
            onConnect={handleConnect}
            selectedNodeId={selectedNodeId}
            orientation="vertical"
          />
          {/* Floating AI chat button */}
          <button
            className="agent-builder__ai-fab"
            onClick={() => setAiChatOpen((o) => !o)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
            Create with AI
          </button>
          {/* AI chat panel */}
          {aiChatOpen && (
            <div className="agent-builder__ai-chat-panel">
              <div className="agent-builder__ai-chat-header">
                <span>Create with AI</span>
                <button
                  className="agent-builder__ai-chat-close"
                  onClick={() => setAiChatOpen(false)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
              <div className="agent-builder__ai-chat-body">
                <AIChatBubble
                  message="Hi! I'm here to help you build your agent. Tell me what you'd like to build."
                  options={aiOptions}
                />
              </div>
              <AIPromptBox onSend={() => {}} />
            </div>
          )}
        </div>
        {drawerOpen && (
          <div className="agent-builder__rhs">
            {renderRHSPanel()}
          </div>
        )}
        {addAfterNodeId && (
          <AddNodeModal
            anchorRect={addAfterPosition}
            onSelect={(type, label, description) => {
              handleDropNode({ type, label, description, insertAfterNodeId: addAfterNodeId });
              setAddAfterNodeId(null);
              setAddAfterPosition(null);
            }}
            onClose={() => { setAddAfterNodeId(null); setAddAfterPosition(null); }}
          />
        )}
      </div>
    </AppShell>
  );
}
