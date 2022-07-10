import React, { Component } from 'react';

import { Tabs, Button } from 'antd';
import TreeTransfer from './component/TreeTransfer';
import FnTreeTransfer from './component/FnTreeTransfer';
import Transfer from './component/Transfer';

import './app.css';

const { TabPane } = Tabs;
const mockData = [
  {
    title: '1',
    key: '1',
  },
  {
    title: '2',
    key: '2',
  },
];

let dataList = [
  {
    id: '1',
    parent_id: null,
    key: '1',
    title: '权限管理',
  },
  {
    id: '2',
    parent_id: '1',
    key: '1.2',
    title: '用户管理',
  },
  {
    id: '3',
    parent_id: '1',
    key: '1.3',
    title: '角色管理',
  },
  {
    id: '4',
    parent_id: '3',
    key: '1.3.4',
    title: '订单管理',
  },
  {
    id: '5',
    parent_id: '3',
    key: '1.3.5',
    title: '商品管理',
  },
];





export default class TreeTransferExer extends Component {
  state = {
    values: ['1-0-0', '2-0-0'], // 受控使用时的values
    dataSource: mockData,
  };
  onMove = (keys, info) => {
    this.setState({
      values: keys,
    });
    console.log(keys);
    console.log(JSON.parse(info));
  };

  changeValues = () => {
    this.setState({
      values: ['1-0-1', '2-0-1'],
    });
  };

  onLoadData = ({ key, children }) => {
    // alert(1);
    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      setTimeout(() => {
        this.setState(
          {
            dataSource: [
              {
                title: '1',
                key: '1',
                children: [
                  {
                    title: '1-0',
                    key: '1-0',
                  },
                  {
                    title: '1-1',
                    key: '1-1',
                  },
                ],
              },
              {
                title: '2',
                key: '2',
              },
            ],
          },
          () => {
            resolve();
          },
        );
      }, 2000);
    });
  };

  render() {
    const { values } = this.state;
    return (
      <div className="container">
        {/* <Tabs defaultActiveKey="normal">
          <TabPane tab="普通使用" key="normal">
            <TreeTransfer
              loadData={this.onLoadData}
              dataSource={mockData}
              title={['左侧标题', '右侧标题']}
              onMove={this.onMove}
            />
          </TabPane>
          <TabPane tab="defaultValues的使用" key="defaultValues">
            <TreeTransfer
              dataSource={mockData}
              title={['左侧标题', '右侧标题']}
              onMove={this.onMove}
              defaultValues={['1-0-0', '2-0-0']}
            />
          </TabPane>
          <TabPane tab="values的使用" key="values">
            <TreeTransfer
              dataSource={mockData}
              onMove={this.onMove}
              title={['左侧标题', '右侧标题']}
              values={values}
            />
            <Button onClick={this.changeValues}>changeState</Button>
          </TabPane>
          <TabPane tab="禁用穿梭框" key="disabled">
            <TreeTransfer
              dataSource={mockData}
              title={['左侧标题', '右侧标题']}
              onMove={this.onMove}
              defaultValues={['1-0-0', '2-0-0']}
              disabled
            />
          </TabPane>
          <TabPane tab="左侧穿梭框禁用" key="leftDisabled">
            <TreeTransfer
              dataSource={mockData}
              title={['左侧标题', '右侧标题']}
              onMove={this.onMove}
              defaultValues={['1-0-0', '2-0-0']}
              leftDisabled
            />
          </TabPane>
          <TabPane tab="右侧穿梭框禁用" key="rightDisabled">
            <TreeTransfer
              dataSource={mockData}
              title={['左侧标题', '右侧标题']}
              onMove={this.onMove}
              values={values}
              rightDisabled
            />
          </TabPane>
        </Tabs> */}
        <div style={{ padding: 24 }}>
          <FnTreeTransfer
            dataSource={this.state.dataSource}
            onLoadData={this.onLoadData}
            title={['左侧标题', '右侧标题']}
            onMove={this.onMove}
          />
        </div>
        <div style={{ padding: 24 }}>
          <Transfer
            dataSource={dataList}
            title={['左侧标题', '右侧标题']}
            onMove={this.onMove}
          />
        </div>
      </div>
    );
  }
}
