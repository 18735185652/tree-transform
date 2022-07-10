import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import _, { startCase } from 'lodash';
import { Input, Tree, Button, Checkbox } from 'antd';
import { treeTransform, isLastLevelKey } from '../utils';
import './index.css';
import { useSetState } from 'ahooks';
const { Search } = Input;

// An highlighted block
// nodes就是树形的最原始数据，query就是关键字，最后会返回满足条件的节点数组

const filterTree = (val, tree, newArr = []) => {
  if (!(tree.length && val)) {
    // 如果搜索关键字为空直接返回源数据
    return tree;
  }

  for (let item of tree) {
    if (item.title.indexOf(val) > -1) {
      // 匹配到关键字的逻辑
      newArr.push(item); // 如果匹配到就在数值中添加记录
      continue; // 匹配到了就退出循环了此时如果有子集也会一并带着
    }

    if (item.children && item.children.length) {
      // 如果父级节点没有匹配到就看看是否有子集，然后做递归
      let subArr = filterTree(val, item.children); // 缓存递归后的子集数组
      if (subArr && subArr.length) {
        // 如果子集数据有匹配到的节点
        let node = { ...item, children: subArr }; // 关键逻辑，缓存父节点同时将递归后的子节点作为新值
        newArr.push(node); // 添加进数组
      }
    }
  }

  return newArr;
};

const Transfer = (props) => {
  const {
    values = undefined,
    defaultValues = [],
    onMove = () => {},
    title = ['左侧标题', '右侧标题'],
    showSearch = true,
    searchItems = ['label', 'key'],
    searchPlaceholder = ['请输入', '请输入'],
    notFoundContent = '暂无数据',
    disabled = false,
    leftDisabled = false,
    rightDisabled = false,
    dataSource: dataList = [],
  } = props;

  const [dataSource, setDataSource] = useState([...dataList]); //全量的数据

  const [selectValues, setSelectValues] = useState(
    values || defaultValues || [],
  );
  const [leftTree, setLeftTree] = useSetState({
    // 左侧剩余的数据
    dataSource: [], // 展示的数据
    selectDataSource: [], // 选中的产品数据
    filterSelectDataSource: [], // 去除选中的产品数据
    keys: [], // 选中的keys(包括已经选择移动到右边的keys)
    checkedKeys: [], // 受控选中的keys
    expandedKeys: [], // 展开的项
    autoExpandParent: true, // 自动展开父节点
    matchedKeys: [], // 匹配搜索内容的数据
  });
  const [rightTree, setRightTree] = useSetState({
    // 右侧已选择的数据
    dataSource: [], // 展示的数据
    selectDataSource: [], // 选中的产品数据
    filterSelectDataSource: [], // 去除选中的产品数据
    keys: [], // 选中的keys(和checkedKeys相同)
    checkedKeys: [], // 受控选中的keys
    expandedKeys: [], // 展开的项
    autoExpandParent: true, // 自动展开父节点
    matchedKeys: [], // 匹配搜索内容的数据
  });

  // 当传入的受控values和全量的dataSource改变时，重新计算左右侧的数据
  useEffect(() => {
    changeDataSource(props.dataSource);
  }, [JSON.stringify(props.dataSource), values]);

  // 初始的数据赋值(根据selectValues以及dataSources计算左右侧的展示数据，同时会处理disabled属性)
  const changeDataSource = (data) => {
    console.log('data: ', data);
    const list = treeTransform(data);
    console.log('list: ', list);
    let x = filterTree('订单', list);
    console.log('x: ', x);

    setLeftTree({
      dataSource: list,
    });
    console.log('data: ', list);
  };

  // 选择checkbox时改变状态的方法
  const operationOnCheck = (keys, data, direction, rightToLeft, callback) => {};

  // 选中时的方法(rightToLeft表示右边移动到左边时调用该函数)
  const onCheck = (keys) => {
    console.log('keys: ', keys);
    // console.log('props.dataSource: ', props.dataSource);
    const filtersArr = [];
    // console.log('props.dataSource: ', props.dataSource);
    const Map = {};
    keys.forEach((ele) => {
      const arr = ele.split('.');
      if (arr.length === 1) {
        props.dataSource.forEach((ele) => {
          if (ele.key.includes(arr[0])) {
            Map[ele.key] = {
              ...ele,
              children: [],
            };
          }
        });
      }
      if (arr.length === 2) {
        props.dataSource.forEach((ele) => {
          if (ele.key === arr[0] || ele.key.includes(arr[1])) {
            Map[ele.key] = {
              ...ele,
              children: [],
            };
          }
        });
      }
      if (arr.length === 3) {
        props.dataSource.forEach((ele) => {
          console.log('ele: ', ele.key);
          if (
            ele.key === arr[0] ||
            ele.key === [arr[0], arr[1]].join('.') ||
            ele.key === [arr[0], arr[1], arr[2]].join('.')
          ) {
            Map[ele.key] = {
              ...ele,
              children: [],
            };
          }
        });
      }
    });
    const result = [];
    Object.keys(Map).forEach((ele) => result.push(Map[ele]));
    console.log('arr: ', Map);
    const aa = treeTransform(result);
    console.log('aa: ', aa);
    setLeftTree({
      checkedKeys: keys,
    });
    setRightTree({
      // checkedKeys: keys,
      dataSource: aa,
      // expandedKeys:keys
    });
  };
  // 左向右的按钮(左侧Tree新的数据源是左侧Tree的filterSelectDataSource，右侧Tree新的数据源是左侧Tree的selectDataSource)
  const leftToRight = () => {};

  // 右向左的按钮
  const rightToLeft = () => {};

  // 渲染transfer的全选checkBox

  // 搜索筛选(设置expandedKeys和matchedKeys)
  const handleSearch = (e, direction) => {};

  // 展开或收起时操作
  const handleExpand = (keys, direction) => {
    if (direction === 'left') {
      setLeftTree({
        expandedKeys: keys,
      });
    } else {
      setRightTree({
        expandedKeys: keys,
      });
    }
  };

  return (
    <div className="dyx-tree-transfer">
      <div className="dyx-transfer-box">
        <div className="dyx-transfer-box-title">
          {_.get(title, 0, '选择框')}
        </div>
        {showSearch && (
          <div className="dyx-transfer-search">
            <Search
              style={{ width: '95%', marginBottom: '10px' }}
              onChange={(e) => handleSearch(e, 'left')}
              placeholder={_.get(searchPlaceholder, 0, '请输入')}
            />
          </div>
        )}
        {_.isEmpty(leftTree.dataSource) ? (
          <div className="dyx-transfer-no-data">{notFoundContent}</div>
        ) : (
          <div className="dyx-transfer-tree">
            <Tree
              expandedKeys={leftTree.expandedKeys}
              autoExpandParent={leftTree.autoExpandParent}
              onExpand={(keys) => handleExpand(keys, 'left')}
              treeData={leftTree.dataSource}
              checkable
              onCheck={(keys, info) => onCheck(keys, info, 'left', false)}
              checkedStrategy="child"
              checkedKeys={leftTree.checkedKeys}
            />
          </div>
        )}
      </div>
      <div className="dyx-transfer-exchange">
        <Button
          onClick={leftToRight}
          disabled={leftTree.checkedKeys.length === 0}
          type={leftTree.checkedKeys.length !== 0 ? 'primary' : 'normal'}
        >
          右
        </Button>
        <Button
          onClick={rightToLeft}
          disabled={rightTree.checkedKeys.length === 0}
          type={rightTree.checkedKeys.length !== 0 ? 'primary' : 'normal'}
        >
          左
        </Button>
      </div>
      {/* 右侧tree */}
      <div className="dyx-transfer-box">
        <div className="dyx-transfer-box-title">
          {_.get(title, 1, '已选择')}
        </div>
        {showSearch && (
          <div className="dyx-transfer-search">
            <Search
              style={{ width: '95%', marginBottom: '10px' }}
              onChange={(e) => handleSearch(e, 'right')}
              placeholder={_.get(searchPlaceholder, 1, '请输入')}
            />
          </div>
        )}
        {_.isEmpty(rightTree.dataSource) ? (
          <div className="dyx-transfer-no-data">{notFoundContent}</div>
        ) : (
          <div className="dyx-transfer-tree">
            <Tree
              expandedKeys={rightTree.expandedKeys}
              autoExpandParent={rightTree.autoExpandParent}
              treeData={rightTree.dataSource}
              onExpand={(keys) => handleExpand(keys, 'right')}
              checkable
              onCheck={(keys, info) => onCheck(keys, info, 'right', false)}
              checkedStrategy="child"
              checkedKeys={rightTree.checkedKeys}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfer;
