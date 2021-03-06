import { CommonData } from '../../core';
import { logger } from '../../utilities';
import { NodeBase } from '../../nodes/nodeBase';
import { Port } from '../../nodes/ports';
import { generateId } from '../../utilities/flow';

const MODULENAME = 'Flow';

function renameProperty(object: any, oldName: string, newName: string): any {
  if (oldName === newName) {
    return object;
  }
  if (object.hasOwnProperty(oldName)) {
    object[newName] = object[oldName];
    delete object[oldName];
  }
  return object;
}

export default class Flow {
  id: string;
  name: string;
  commonData: CommonData;
  nodes: { [index: string]: NodeBase; };
  activeNode: any;
  currentValue: number;
  percentageDone: number;
  isRunning: boolean;
  onValueUpdateCallbacks: { [callerId: string]: Function };

  constructor(commonData: CommonData) {
    this.id = generateId();
    this.name = `Flow ${commonData.flows.getAllFlows().length + 1}`;

    this.commonData = commonData;
    this.nodes = {};

    this.activeNode = null;
    this.currentValue = 0;
    this.percentageDone = 0;

    this.onValueUpdateCallbacks = {};

    this.isRunning = false;
  }

  addNode(nodeName: string): NodeBase {
    const node = this.commonData.nodeRegistry.createNode(this, nodeName);
    this.nodes[node.getNodeId()] = node;
    return node;
  }

  findNodeByName(nodeName: string): NodeBase[] {
    return Object.values(this.nodes).filter((node) => {
      if (node) return node.constructor.name === nodeName;
      return null;
    });
  }

  start() {
    this.isRunning = true;
    const startNode = this.getStartNode();
    if (startNode) startNode.start();
  }

  stop() {
    if (this.activeNode) this.activeNode.stop();
    this.isRunning = false;
  }

  updateValue(calculationValue: number, node: any, percentageDone: number) {
    this.activeNode = node;
    this.currentValue = calculationValue;
    this.percentageDone = percentageDone;
    Object.values(this.onValueUpdateCallbacks).forEach(callback => callback(calculationValue));

    const updateInfo = {
      percentageDone,
      value: calculationValue,
      nodeId: node.id,
      timestamp: new Date().getTime(),
    };
    if (this.commonData.socketio) this.commonData.socketio.emit(this.id, updateInfo);
  }

  createNewIds() {
    // Object for translation one id to another { fromId1: toId1, fromId2: toId2 }
    const nodeIdTranslation: {[originId: string]: string} = {};

    Object.entries(this.nodes).forEach(([key, value]) => {
      const newNodeId = generateId();
      nodeIdTranslation[key] = newNodeId;

      // renameProperty is a polyfill
      // this.nodes.renameProperty(key, newNodeId);
      renameProperty(this.nodes, key, newNodeId);
      value.id = newNodeId;

      const changePortId = (port: any) => {
        nodeIdTranslation[port.id] = generateId();
        port.id = nodeIdTranslation[port.id];
      };

      value.inputPorts.forEach((port: any) => {
        changePortId(port);
      });
      value.outputPorts.forEach((port: any) => {
        changePortId(port);
      });
    });
  }

  getCurrentValue() {
    return this.currentValue;
  }

  getNodeWithId(nodeId: string): NodeBase {
    return this.nodes[nodeId];
  }

  getPortWithId(portId: string): Port {
    let foundPort = null;
    Object.values(this.nodes).forEach((node) => {
      if (node) {
        const hasPort = node.getPortById(portId);
        if (hasPort) foundPort = hasPort;
      }
    });
    return foundPort;
  }

  serialize() {
    const serializedNodes = Object.values(this.nodes).map(node => node.serialize());
    return ({
      id: this.id,
      name: this.name,
      nodes: serializedNodes,
    });
  }

  deserialize(serializedData: {id: string, name: string, nodes: any[]}) {
    if (this.isRunning) this.stop();
    this.id = serializedData.id;
    this.name = serializedData.name;
    this.clearNodes();
    if (serializedData.nodes) {
      serializedData.nodes.forEach((serializedNode) => {
        const nodeRegistry = this.commonData.nodeRegistry;
        const node = nodeRegistry.createNode(this, serializedNode.name, serializedNode.id);
        node.deserialize(serializedNode);
        this.nodes[serializedNode.id] = node;
      });
    }
  }

  clearNodes() {
    Object.values(this.nodes).map((node: NodeBase) => node.onShutdown());
    this.nodes = {};
  }

  registerOnValueUpdateCB(callerId: string, cb: Function) {
    this.onValueUpdateCallbacks[callerId] = cb;
  }

  getStartNode(): NodeBase {
    const startNode = this.findNodeByName('StartNode');
    if (startNode.length === 0) {
      logger.error(MODULENAME, `No start node found in flow ${this.id}`);
      return null;
    }
    if (startNode.length > 1) {
      logger.warning(MODULENAME, `More than one start node found in flow ${this.id}. Will start only one.`);
      return null;
    }
    return startNode[0];
  }
}
