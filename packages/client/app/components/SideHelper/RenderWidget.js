import React from 'react';
import createEngine from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { SimulationNodeModel } from '../NodeArea/SimulationNodes/SimulationNodeModel';
import { SimulationNodeWidget } from '../NodeArea/SimulationNodes/SimulationNodeWidget.js';

const RenderWidget = (props) => {
  const { nodeModel } = props;
  const engine = createEngine();

  return (
    <SimulationNodeWidget node={nodeModel} engine={engine} inActive/>
  );
}

export default RenderWidget;
