import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  BaseEdge,
  getStraightPath,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import GraphControls from '../Modules/FlowCanvas/GraphControls/GraphControls';
import '@xyflow/react/dist/style.css';
import StartNode from '../Molecules/Canvas/StartNode/StartNode';
import EndNode from '../Molecules/Canvas/EndNode/EndNode';
import CanvasNode from '../Molecules/Canvas/CanvasNode/CanvasNode';
import './FlowCanvas.css';

/* ─── Hover-plus drag handle shared by node wrappers ─── */
function NodeConnectHandle({ nodeId, visible, onClickAdd, fitViewFn }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: -13,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        width: 24,
        height: 24,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      {/* Visual circle with + icon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid #1976d2',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1976d2',
          pointerEvents: 'none',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
      </div>
      {/* React Flow source handle — transparent overlay that captures drag */}
      <Handle
        type="source"
        id="add-connect"
        position={Position.Bottom}
        className="flow-canvas__connect-handle"
        isConnectable={visible}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
        onClick={(e) => {
          if (!visible) return;
          e.stopPropagation();
          const rect = e.currentTarget.parentElement.getBoundingClientRect();
          fitViewFn?.();
          onClickAdd?.(nodeId, rect);
        }}
        onMouseDown={(e) => {
          if (visible) fitViewFn?.();
        }}
      />
    </div>
  );
}

/* ─── Custom Node Wrappers ─── */
function StartNodeWrapper({ id, data }) {
  const [hovered, setHovered] = useState(false);
  const { fitView } = useReactFlow();
  const doFitView = () => fitView({ nodes: [{ id }], duration: 300, padding: 0.5 });
  return (
    <div
      className="flow-canvas__node-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StartNode title={data.title} subtitle={data.subtitle} />
      <Handle type="source" position={Position.Bottom} />
      <NodeConnectHandle nodeId={id} visible={hovered} onClickAdd={data.onAddAfterClick} fitViewFn={doFitView} />
    </div>
  );
}

function TriggerNodeWrapper({ id, data }) {
  const [hovered, setHovered] = useState(false);
  const { fitView } = useReactFlow();
  const doFitView = () => fitView({ nodes: [{ id }], duration: 300, padding: 0.5 });
  return (
    <div
      className="flow-canvas__node-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      <CanvasNode nodeType="trigger" label={data.title} stepNumber={data.stepNumber} title={data.description} description={data.subtitle} hasToggle={data.hasToggle} toggleEnabled={data.toggleEnabled} onDelete={data.onDelete} />
      <Handle type="source" position={Position.Bottom} />
      <NodeConnectHandle nodeId={id} visible={hovered} onClickAdd={data.onAddAfterClick} fitViewFn={doFitView} />
    </div>
  );
}

function TaskNodeWrapper({ id, data }) {
  const [hovered, setHovered] = useState(false);
  const { fitView } = useReactFlow();
  const doFitView = () => fitView({ nodes: [{ id }], duration: 300, padding: 0.5 });
  return (
    <div
      className="flow-canvas__node-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      <CanvasNode nodeType="task" label={data.title} stepNumber={data.stepNumber} title={data.description} description={data.subtitle} hasAiIcon={data.hasAiIcon} hasToggle={data.hasToggle} toggleEnabled={data.toggleEnabled} onDelete={data.onDelete} />
      <Handle type="source" position={Position.Bottom} />
      <NodeConnectHandle nodeId={id} visible={hovered} onClickAdd={data.onAddAfterClick} fitViewFn={doFitView} />
    </div>
  );
}

function BranchNodeWrapper({ id, data }) {
  const [hovered, setHovered] = useState(false);
  const { fitView } = useReactFlow();
  const doFitView = () => fitView({ nodes: [{ id }], duration: 300, padding: 0.5 });
  return (
    <div
      className="flow-canvas__node-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} />
      <CanvasNode nodeType="branch" label={data.title} stepNumber={data.stepNumber} title={data.description} description={data.subtitle} hasToggle={data.hasToggle} toggleEnabled={data.toggleEnabled} hasAddButton onDelete={data.onDelete} />
      <Handle type="source" position={Position.Bottom} />
      <NodeConnectHandle nodeId={id} visible={hovered} onClickAdd={data.onAddAfterClick} fitViewFn={doFitView} />
    </div>
  );
}

function BranchPathNodeWrapper({ data }) {
  const [isDropActive, setIsDropActive] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDropActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDropActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropActive(false);
    const type = e.dataTransfer.getData('application/reactflow-type');
    const label = e.dataTransfer.getData('application/reactflow-label');
    const description = e.dataTransfer.getData('application/reactflow-description');
    if (!type) return;
    data.onDropNode?.({ type, label, description, sourceNodeId: data.parentId, targetNodeId: '__branch_path__', branchPathId: data.pathId });
  }, [data]);

  return (
    <div
      className="flow-canvas__branch-path-wrapper"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Handle type="target" position={Position.Top} />
      <div className={`flow-canvas__branch-path${isDropActive ? ' flow-canvas__branch-path--drop-active' : ''}`}>
        <span>{data.label}</span>
        {data.hasIcons && (
          <>
            <span className="material-symbols-outlined flow-canvas__branch-path-icon">info</span>
            <span className="material-symbols-outlined flow-canvas__branch-path-icon">more_vert</span>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function EndNodeWrapper() {
  return (
    <div className="flow-canvas__node-center">
      <Handle type="target" position={Position.Top} />
      <EndNode />
    </div>
  );
}

/* ─── Custom Edge with Add Button ─── */
function AddButtonEdge({ id, source, target, sourceX, sourceY, targetX, targetY, style, data }) {
  const [isDropActive, setIsDropActive] = useState(false);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDropActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDropActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropActive(false);
    const type = e.dataTransfer.getData('application/reactflow-type');
    const label = e.dataTransfer.getData('application/reactflow-label');
    const description = e.dataTransfer.getData('application/reactflow-description');
    if (!type) return;
    data?.onDropNode?.({ type, label, description, targetNodeId: target, sourceNodeId: source, branchPathId: data?.branchPathId });
  }, [data, target, source]);

  const activeEdgeStyle = isDropActive
    ? { stroke: '#3b62f6', strokeDasharray: 'none', strokeWidth: 2 }
    : style;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={activeEdgeStyle} />
      <foreignObject
        width={400}
        height={80}
        x={labelX - 200}
        y={labelY - 40}
      >
        <div
          className="flow-canvas__edge-drop-zone"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </foreignObject>
    </>
  );
}

/* ─── Node & Edge Types (stable references) ─── */
const NODE_TYPES = {
  start: StartNodeWrapper,
  trigger: TriggerNodeWrapper,
  task: TaskNodeWrapper,
  branch: BranchNodeWrapper,
  branchPath: BranchPathNodeWrapper,
  end: EndNodeWrapper,
};

const EDGE_TYPES = {
  addButton: AddButtonEdge,
};

/* ─── Main FlowCanvas ─── */
function FlowCanvasInner({
  nodes = [],
  edges = [],
  onNodeClick,
  onDropNode,
  onConnect,
  orientation = 'vertical',
  onOrientationChange,
  onRun,
  selectedNodeId,
}) {
  const { screenToFlowPosition, zoomTo, fitView } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  const prevNodeCountRef = useRef(nodes.length);
  useEffect(() => {
    if (nodes.length !== prevNodeCountRef.current) {
      prevNodeCountRef.current = nodes.length;
      setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50);
    }
  }, [nodes.length, fitView]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'addButton',
      style: { stroke: '#ccd5e4', strokeWidth: 1 },
    }),
    []
  );

  const handleNodeClick = useCallback(
    (event, node) => onNodeClick?.(node),
    [onNodeClick]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      // Skip if the drop was already handled by an edge zone or branch path node
      if (
        event.target.closest?.('.flow-canvas__edge-drop-zone') ||
        event.target.closest?.('.flow-canvas__branch-path-wrapper')
      ) return;

      const type = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const description = event.dataTransfer.getData('application/reactflow-description');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onDropNode?.({ type, label, description, position });
    },
    [screenToFlowPosition, onDropNode]
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        className: n.id === selectedNodeId ? 'flow-canvas__node--selected' : '',
      })),
    [nodes, selectedNodeId]
  );

  const styledEdges = useMemo(
    () => edges.map((e) => ({ ...e, data: { ...e.data, onDropNode } })),
    [edges, onDropNode]
  );

  const handleViewportChange = useCallback(({ zoom: z }) => {
    setZoom(Math.round(z * 100));
  }, []);

  return (
    <div className="flow-canvas">
      <div className="flow-canvas__toolbar-anchor">
        <GraphControls
          orientation={orientation}
          onOrientationChange={onOrientationChange}
          onRun={onRun}
          zoom={zoom}
          onZoomSelect={(z) => zoomTo(z, { duration: 200 })}
          onFitView={() => fitView({ padding: 0.3, duration: 200 })}
        />
      </div>

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={handleNodeClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onViewportChange={handleViewportChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={true}
        onConnect={onConnect}
        connectionLineStyle={{ stroke: '#1976d2', strokeWidth: 1.5 }}
        panOnScroll
        zoomOnScroll
      />
    </div>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
