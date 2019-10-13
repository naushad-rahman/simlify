import React, { useState } from 'react';
import Tabbar from 'components/TabBar';
import RenderWidget from './RenderWidget';
import SideHelperSettings from './SideHelperSettings';

import './SideHelper.scss';

function renderDescription(description, nodeModel) {
  return (
    <div className="sideHelper__body__description">
      <RenderWidget nodeModel={nodeModel}/>
      { description }
    </div>
  )
}

function renderSettings(settings, nodeModel, nodeModelOptions) {
  return (
    <SideHelperSettings
      settings={settings}
      nodeModel={nodeModel}
      nodeModelOptions={nodeModelOptions}
    />
  )
}

const SideHelper = (props) => {
  const { nodeModel = {} } = props;
  const { options: nodeModelOptions = {} } = nodeModel;
  const { options } = nodeModelOptions;
  const [selectedTab, changeTab] = useState(0);

  return (
    <div className="sideHelper">
      <Tabbar
        tabs={[{ name: 'Description', icon: 'none' }, { name: 'Settings', icon: 'none' }]}
        onTabChange={(selectedTab) => changeTab(selectedTab)}
      />
      <div className="sideHelper__body" key={`${nodeModelOptions.id}`}>
        {
          selectedTab === 0 && options && options.description &&
          renderDescription(options.description, nodeModel)
        }
        {
          selectedTab === 1 && options && options.settings &&
          renderSettings(options.settings, nodeModel, nodeModelOptions)
        }
      </div>
    </div>
  );
};

export default SideHelper;
