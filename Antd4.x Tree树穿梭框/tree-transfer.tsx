import React from 'react';
import { Tree, Transfer } from 'antd';
import './index.less';

export interface TreeDataType {
  key: string;
  title: string;
  disabled?: boolean;
  selected?: boolean;
  children?: TreeDataType[];
}

// 通过key选出树对象
export const filterTree = (trees: TreeDataType[], keys: string[]): TreeDataType[] => {
  const tmp: TreeDataType[] = [];
  const foo = (a: TreeDataType[], k: string) => {
    a.forEach((v: TreeDataType) => {
      if (v.key === k) {
        tmp.push(v);
      } else if (v.children) {
        foo(v.children, k);
      }
    });
  };
  keys.forEach((v) => foo(trees, v));
  return tmp;
};

/**
 * 遍历树对象设置属性
 * @param trees 源数组
 * @param key 需设置的属性
 * @param value 属性值
 * @param flag 默认给每项children下的每项设置属性，为true表示给当前项也设置属性
 */
export const mapTree = (trees: TreeDataType[], key: any, value: unknown, flag?: boolean) => {
  trees.forEach((p) => {
    const v = p;
    if (flag) v[key] = value;
    v.children?.forEach((p1) => {
      const x = p1;
      x[key] = value;
      if (x.children && !x.selected) {
        mapTree(x.children, key, value, true);
      }
    });
  });
};

export const TreeTransfer = ({ dataSource, targetKeys, ...restProps }: any) => {
  const transferDataSource: TreeDataType[] = [];
  function flatten(list: TreeDataType[] = []) {
    list.forEach((item) => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  }
  flatten(dataSource);

  const isChecked = (selectedKeys: string[], eventKey: string) =>
    selectedKeys.indexOf(eventKey) !== -1;
  const toggleDisabled = (key: string, selected: boolean) => {
    // 当前点击的项
    const nowItem = filterTree(dataSource, [key]);
    if (selected) {
      // 选中
      mapTree(nowItem, 'disabled', true);
    } else {
      // 取消
      mapTree(nowItem, 'disabled', false);
    }
  };

  const generateTree = (
    treeNodes: TreeDataType[] = [],
    checkedKeys: string[] = [],
  ): TreeDataType[] =>
    treeNodes.map(({ children, ...props }) => ({
      ...props,
      disabled: props.disabled || checkedKeys.includes(props.key),
      children: generateTree(children, checkedKeys),
    }));

  return (
    <Transfer
      {...restProps}
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      className="policy-transfer"
      render={(item) => item.title}
      showSelectAll={false}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <Tree
              blockNode
              checkable
              checkStrictly
              defaultExpandAll
              checkedKeys={checkedKeys}
              treeData={generateTree(dataSource, targetKeys)}
              onCheck={(keys, { node: { key }, checked }) => {
                onItemSelect(key as string, !isChecked(checkedKeys, key as string));
                toggleDisabled(key as string, checked);
              }}
              onSelect={(keys, { node: { key } }) => {
                onItemSelect(key as string, !isChecked(checkedKeys, key as string));
                toggleDisabled(key as string, !selectedKeys.includes(key as string));
              }}
            />
          );
        }
        return null;
      }}
    </Transfer>
  );
};
