import React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import NodeArea from '../../components/NodeArea';
import Tabbar from '../../components/Tabbar';
import api from '../../../helper/api';
import convertForApi from '../../../helper/convertForApi';
import SideHelper from '../../components/SideHelper';


import './Simulator.scss';

class Simulator extends React.Component {
  constructor() {
    super();

    this.state = {
      availableNodes: {},
      flows: [],
      currentFlowIndex: 0,
      selectedNode: {},
    };

    this.nodeAreaRef = React.createRef();
  }

  componentWillMount() {
    api.getAvailableNodes()
      .then((availableNodes) => {
        this.setState({ availableNodes });
      })
      .catch((err) => {
        console.log(err)
      });

      this.loadFlows();
  }

  loadFlows() {
    api.getFlows()
    .then((flows) => {
      this.setState({ flows });
    })
    .catch((err) => {
      console.log(err)
    });
  }

  getFlowSerialized() {
    return this.nodeAreaRef.current.serialize();
  }

  sendFlow() {
    const serializedFlow = this.getFlowSerialized();
    const currentFlow = this.state.flows[this.state.currentFlowIndex];
    serializedFlow.id = currentFlow.id;
    serializedFlow.name = currentFlow.name;
    const serializedFlowForApi = convertForApi.convertFlow(serializedFlow);
    api.putFlow(serializedFlowForApi)
      .then(updatedFlow => {
        const { flows, currentFlowIndex } = this.state;
        flows[currentFlowIndex] = updatedFlow;
        this.setState({ flows });
      })
      .catch(console.log);
  }

  onTabChange(tabIndex) {
    if (tabIndex > this.state.flows.length - 1) {
      tabIndex = this.state.flows.length;
      api.postFlow()
      .then((newFlow) => {
        this.state.flows.push(newFlow);
        this.setState({ currentFlowIndex: tabIndex });
      })
      .catch(console.log);
    } else {
      this.setState({ currentFlowIndex: tabIndex });
    }
  }

  handleSelectionChange(object, isSelected = false) {
    isSelected ? this.setState({ selectedNode: object }) : {};
  }

  onNodeAreaEvent(event) {
    if (event.function === 'selectionChanged') {
      this.handleSelectionChange(event.entity.options, event.isSelected);
    }
  }

  render() {
    const {
      flows,
      currentFlowIndex,
      availableNodes,
      selectedNode
    } = this.state;

    const currentFlow = flows[currentFlowIndex];
    const tabs = flows
      .map(flow => ({ name: flow.name, icon: 'asdf' }));
    tabs.push({ name: 'Add', icon: 'asdf' });

    return (
      <div className="simulator">
        { /* <SideBar > */ }
        <div className="simulator__nodeArea">
          <div className="simulator__buttonBar">
            <div className="simulator__buttonBar__container">
              <ButtonGroup variant="contained" size="small" aria-label="small contained button group">
                <Button onClick={() => this.loadFlows()}>Reset</Button>
                <Button onClick={() => this.sendFlow()}>Save</Button>
              </ButtonGroup>
            </div>
          </div>
          <Tabbar
            tabs={tabs}
            onTabChange={(selectedTab) => this.onTabChange(selectedTab)}
          />
          <NodeArea
            ref={this.nodeAreaRef}
            availableNodes={availableNodes}
            options={currentFlow}
            onEvent={(event) => this.onNodeAreaEvent(event)}
          />
        </div>
        <SideHelper
          node={selectedNode}
        />
      </div>
    );
  }
};

export default Simulator;
