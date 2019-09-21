import React, { useState } from 'react';
import TextField from '../TextField';
import Button from '../Button';
import Tabbar from '../TabBar';
import RenderWidget from './RenderWidget';

import './SideHelper.scss';


const SideHelper = (props) => {
  const { nodeModel = {} } = props;
  const { options: nodeModelOptions = {} } = nodeModel;
  const { options } = nodeModelOptions;
  const [selectedTab, changeTab] = useState(0);

  function onSettingSave(settings) {
    console.log(settings);
  }

  function setLockedModel(isLocked) {
    nodeModel.setLocked(isLocked)
  }
  
  function renderSettings(settings) {
    return (
      <div>
        {
          settings.map(setting => <TextField
            label={setting.name}
            defaultValue={setting.value}
            onChange={(newValue) => setting.value = newValue}
            onFocus={() => setLockedModel(true)}
            onBlur={() => setLockedModel(false)}
            />)
        }
        <Button onClick={() => onSettingSave(settings)}>Save</Button>
      </div>
    )
  }

  function renderDescription(description) {
    return (
      <div className="sideHelper__body__description">
        <RenderWidget nodeModel={nodeModel}/>
        { description }
      </div>
    )
  }

  return (
    <div className="sideHelper">
      <Tabbar
        tabs={[{ name: 'Description', icon: 'none' }, { name: 'Settings', icon: 'none' }]}
        onTabChange={(selectedTab) => changeTab(selectedTab)}
      />
      <div className="sideHelper__body">
        {
          selectedTab === 0 && options && options.description && renderDescription(options.description)
        }
        {
          selectedTab === 1 && options && options.settings && renderSettings(options.settings)
        }
      </div>
    </div>
  );
};

export default SideHelper;
