import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import _, { startCase } from 'lodash';
import { Input, Tree, Button, Checkbox } from 'antd';
import {
  isLastLevelKey,
  disabledCategoryData,
  getLastLevelData,
  filterCategoryData,
} from '../utils';
import './index.css';
import { useSetState } from 'ahooks';
const { Search } = Input;
const FnTreeTransfer = (props) => {
  const [stateList, setStateList] = useSetState({
    hello: '',
    count: 0,
  });
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
    changeDataSource(selectValues);
  }, [JSON.stringify(props.dataSource), values]);

  // 初始的数据赋值(根据selectValues以及dataSources计算左右侧的展示数据，同时会处理disabled属性)
  const changeDataSource = (filterValues = []) => {
    let newDataSource = _.cloneDeep(props.dataSource); // 新的全量数据
    // 如果设置disabled时将数据源全部disabled(数据结构参考Tree组件)
    if (disabled) {
      newDataSource = disabledCategoryData(props.dataSource);
    }
    // 有value时计算两侧的dataSource
    const newLeftTreeDataSource = filterCategoryData(
      filterValues,
      newDataSource,
      'filter',
      disabled || leftDisabled,
    ); // 左侧Tree的的展示数据
    const newRightTreeDataSource = filterCategoryData(
      filterValues,
      newDataSource,
      'select',
      disabled || rightDisabled,
    );

    setDataSource([...newDataSource]);
    setSelectValues([...filterValues]);
    setLeftTree({
      dataSource: newLeftTreeDataSource,
    });
    // 右侧Tree的展示数据
    setRightTree({
      dataSource: newRightTreeDataSource,
    });
  };

  // 选择checkbox时改变状态的方法
  const operationOnCheck = (keys, data, direction, rightToLeft, callback) => {
    const newData = filterCategoryData(
      keys,
      data,
      'filter',
      rightToLeft ? leftDisabled : false,
    ); // 去除选中的数据
    const selectDataCategory = filterCategoryData(
      keys,
      data,
      'select',
      rightDisabled,
    ); // 选中的数据

    const changeState = direction === 'left' ? 'leftTree' : 'rightTree';

    if (rightToLeft) {
      // rightToLeft为true时会重新计算左侧Tree的selectDataSource和filterSelectDataSource
      const { checkedKeys } = leftTree;
      const newLeftKeys = [...checkedKeys, ...keys];
      const newLeftFilterData = filterCategoryData(
        newLeftKeys,
        data,
        'filter',
        leftDisabled,
      );
      const newLeftSelectData = filterCategoryData(
        newLeftKeys,
        data,
        'select',
        leftDisabled,
      );

      // 右面选中移动到左边时生成左边的数据
      if (changeState === 'leftTree') {
        setLeftTree({
          dataSource: newData,
          selectDataSource: newLeftSelectData,
          filterSelectDataSource: newLeftFilterData,
        });
      } else {
        setRightTree({
          dataSource: newData,
          selectDataSource: newLeftSelectData,
          filterSelectDataSource: newLeftFilterData,
        });
      }
    } else {
      if (changeState === 'leftTree') {
        setLeftTree({
          filterSelectDataSource: newData,
          selectDataSource: selectDataCategory,
        });
      } else {
        setRightTree({
          filterSelectDataSource: newData,
          selectDataSource: selectDataCategory,
        });
      }
    }
  };

  // 选中时的方法(rightToLeft表示右边移动到左边时调用该函数)
  const onCheck = (
    keys,
    info,
    direction,
    rightToLeft,
    callback,
    selectKeys,
  ) => {
    const { selectKey } = info;
    const selectList = selectKey ? selectKey : selectValues;

    // 选择的keys中是最后一级的keys
    const lastLevelKey = keys.filter((item) =>
      isLastLevelKey(props.dataSource, item),
    );

    if (direction === 'left') {
      setLeftTree({
        checkedKeys: rightToLeft ? leftTree.checkedKeys : lastLevelKey,
        keys: rightToLeft
          ? _.uniq([...selectList, ...leftTree.checkedKeys])
          : _.uniq([...selectList, ...lastLevelKey]),
      });
      const x = [...lastLevelKey, ...selectList];

      const newKeys = _.uniq(x);
      operationOnCheck(newKeys, dataSource, direction, rightToLeft, callback);
    } else {
      // 选择的是右侧的Tree时只需要改变受控的keys然后调用operationOnCheck方法
      setRightTree({
        checkedKeys: lastLevelKey,
        keys: lastLevelKey,
      });

      operationOnCheck(
        lastLevelKey,
        rightTree.dataSource,
        direction,
        rightToLeft,
      );
    }
  };
  // 左向右的按钮(左侧Tree新的数据源是左侧Tree的filterSelectDataSource，右侧Tree新的数据源是左侧Tree的selectDataSource)
  const leftToRight = () => {
    const { onMove } = props;
    const { selectDataSource, filterSelectDataSource } = leftTree;

    setSelectValues([...leftTree.keys]);
    setLeftTree({
      dataSource: filterSelectDataSource,
      matchedKeys: [],
      checkedKeys: [],
      filterSelectDataSource: [],
      selectDataSource: [],
    });
    setRightTree({
      dataSource: selectDataSource,
    });
  };

  // 右向左的按钮
  const rightToLeft = () => {
    const { onMove } = props;
    // 已选择的keys中去除右侧新选择的keys
    const newLeftKeys = selectValues.filter(
      (item) => !rightTree.keys.includes(item),
    );

    setSelectValues([...newLeftKeys]);
    setRightTree({
      dataSource: rightTree.filterSelectDataSource,
      keys: [],
      matchedKeys: [],
      selectDataSource: [],
      filterSelectDataSource: [],
      checkedKeys: [],
    });

    onCheck(newLeftKeys, { selectKey: newLeftKeys }, 'left', true);
  };

  // 渲染transfer的全选checkBox

  // 搜索筛选(设置expandedKeys和matchedKeys)
  const handleSearch = (e, direction) => {
    let { value } = e.target;
    const changeState = direction === 'left' ? 'leftTree' : 'rightTree';
    let dataSource = null;
    if (changeState === 'leftTree') {
      dataSource = leftTree.dataSource;
    } else {
      dataSource = rightTree.dataSource;
    }

    value = value.trim();
    if (!value) {
      const r = {
        matchedKeys: null,
        expandedKeys: [],
      };
      changeState === 'leftTree'
        ? setLeftTree({ ...r })
        : setRightTree({ ...r });
      return;
    }
    const matchedKeys = [];
    const loop = (data) => {
      data.forEach((item) => {
        if (
          searchItems.some(
            (searchItem) => String(item[searchItem] || '').indexOf(value) > -1,
          )
        ) {
          matchedKeys.push(item.key);
        }
        if (item.children && item.children.length) {
          loop(item.children);
        }
      });
    };

    loop(dataSource);

    const payload = {
      expandedKeys: [...matchedKeys],
      autoExpandParent: true,
      matchedKeys,
    };
    changeState === 'leftTree'
      ? setLeftTree({ ...payload })
      : setRightTree({ ...payload });
  };

  // 展开或收起时操作
  const handleExpand = (keys, direction) => {
    const changeState = direction === 'left' ? 'leftTree' : 'rightTree';
    const r = {
      expandedKeys: keys,
      autoExpandParent: false,
    };
    changeState === 'leftTree' ? setLeftTree({ ...r }) : setRightTree({ ...r });
  };
  // checkBox的全选事件
  const checkAll = (direction, type) => {
    const directionDisabled =
      direction === 'left' ? rightDisabled : leftDisabled;

    const dataList =
      direction === 'left' ? leftTree.dataSource : rightTree.dataSource;

    const selectAllKeys = getLastLevelData(dataList).map((item) => item.key);
    // 全选右侧时所有的key
    const allRightTreeKeys = getLastLevelData(rightTree.dataSource).map(
      (item) => item.key,
    );
    // 全选左侧时所有的key
    const allKeys = getLastLevelData(dataSource).map((item) => item.key);
    // 根据选择的方向生成对应的key
    const generateKeys = direction === 'left' ? allKeys : allRightTreeKeys;

    if (direction === 'left') {
      setLeftTree({
        selectDataSource: directionDisabled
          ? disabledCategoryData(dataSource)
          : dataSource,
        filterSelectDataSource: [],
        checkedKeys: type === 'clear' ? [] : selectAllKeys,
        keys: type === 'clear' ? [] : generateKeys,
      });
    } else {
      setRightTree({
        selectDataSource: directionDisabled
          ? disabledCategoryData(dataSource)
          : dataSource,
        filterSelectDataSource: [],
        checkedKeys: type === 'clear' ? [] : selectAllKeys,
        keys: type === 'clear' ? [] : generateKeys,
      });
    }
  };

  // 渲染transfer的全选checkBox
  const renderCheckBox = (direction) => {
    const { disabled, leftDisabled, rightDisabled } = props;
    const directionDisabled =
      direction === 'left' ? leftDisabled : rightDisabled;
    const operationState = direction === 'left' ? leftTree : rightTree;
    const allLength = getLastLevelData(operationState.dataSource).length; // 所有最后一项的数据长度
    const selectLength = operationState.checkedKeys.length; // 所选择的数据长度
    const checkAllDisabled =
      disabled || directionDisabled || _.isEmpty(operationState.dataSource); // 全选的checkbox是否disabled
    // 全选或者全不选的状态
    const type = allLength === selectLength ? 'clear' : 'checkAll';
    if (selectLength === 0) {
      // 非全选状态
      return (
        <div>
          <Checkbox
            checked={false}
            indeterminate={false}
            onClick={() => checkAll(direction, type)}
            style={{ marginRight: '6px' }}
            disabled={checkAllDisabled}
          />
          {`${allLength}项`}
        </div>
      );
    } else {
      // 全选状态
      return (
        <div>
          <Checkbox
            checked={selectLength === allLength}
            indeterminate={selectLength !== allLength}
            onClick={() => checkAll(direction, type)}
            style={{ marginRight: '6px' }}
          />
          {`${selectLength}/${allLength}项`}
        </div>
      );
    }
  };

  const leftFilterTreeNode = (node) =>
    leftTree.matchedKeys &&
    leftTree.matchedKeys.indexOf(node.props.eventKey) > -1;
  const rightFilterTreeNode = (node) =>
    rightTree.matchedKeys &&
    rightTree.matchedKeys.indexOf(node.props.eventKey) > -1;
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
              filterTreeNode={leftFilterTreeNode}
              onExpand={(keys) => handleExpand(keys, 'left')}
              treeData={leftTree.dataSource}
              checkable
              loadData={props.onLoadData}
              onCheck={(keys, info) => onCheck(keys, info, 'left', false)}
              checkedStrategy="child"
              checkedKeys={leftTree.checkedKeys}
            />
          </div>
        )}
        <div className="dyx-transfer-bottom-select">
          {renderCheckBox('left')}
        </div>
      </div>
      <div className="dyx-transfer-exchange">
        <Button
          onClick={leftToRight}
          disabled={leftTree.checkedKeys.length === 0}
          type={leftTree.checkedKeys.length !== 0 ? 'primary' : 'normal'}
        >
          右{/* <Icon type="right" /> */}
        </Button>
        <Button
          onClick={rightToLeft}
          disabled={rightTree.checkedKeys.length === 0}
          type={rightTree.checkedKeys.length !== 0 ? 'primary' : 'normal'}
        >
          {/* <Icon type="left" /> */}左
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
              filterTreeNode={rightFilterTreeNode}
              onExpand={(keys) => handleExpand(keys, 'right')}
              treeData={rightTree.dataSource}
              checkable
              onCheck={(keys, info) => onCheck(keys, info, 'right', false)}
              checkedStrategy="child"
              checkedKeys={rightTree.checkedKeys}
            />
          </div>
        )}
        <div className="dyx-transfer-bottom-select">
          {renderCheckBox('right')}
        </div>
      </div>
    </div>
  );
};

export default FnTreeTransfer;
