/**
 * agentService — in-memory mock for Content Hub prototype.
 * No Firebase / Firestore. All operations work on an in-memory store
 * so the agent builder canvas is fully interactive without a backend.
 */

/* ─── In-memory store ─── */
const _agents = new Map();
const _customTools = new Map();
const _agentListeners = new Set();
const _toolListeners = new Set();

function _notifyAgentListeners() {
  const list = Array.from(_agents.values());
  _agentListeners.forEach((cb) => cb(list));
}

function _notifyToolListeners() {
  const list = Array.from(_customTools.values());
  _toolListeners.forEach((cb) => cb(list));
}

/* ─── Agent operations ─── */

export function subscribeToAgents(callback) {
  _agentListeners.add(callback);
  callback(Array.from(_agents.values()));
  return () => _agentListeners.delete(callback);
}

export async function saveAgent(id, agent) {
  _agents.set(id, { ...agent, id });
  _notifyAgentListeners();
}

export async function deleteAgent(id) {
  _agents.delete(id);
  _notifyAgentListeners();
}

export async function getAgentBySlug(_moduleSlug, _agentSlug) {
  return null;
}

export function getCachedAgent(_agentSlug, _moduleSlug) {
  return null;
}

export async function prefetchAgent() {}

export async function getAgentsByModuleSlug(_moduleSlug) {
  return Array.from(_agents.values());
}

/* ─── Custom tool operations ─── */

export async function saveCustomTool(tool) {
  _customTools.set(tool.id, tool);
  _notifyToolListeners();
  return tool;
}

export async function deleteCustomTool(id) {
  _customTools.delete(id);
  _notifyToolListeners();
}

export function subscribeToCustomTools(callback) {
  _toolListeners.add(callback);
  callback(Array.from(_customTools.values()));
  return () => _toolListeners.delete(callback);
}

export async function getCustomTools() {
  return Array.from(_customTools.values());
}

export async function getCustomToolsByIds(ids) {
  return (ids || []).map((id) => _customTools.get(id)).filter(Boolean);
}
