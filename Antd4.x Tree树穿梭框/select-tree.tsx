import React, { useState } from 'react';
import { TreeDataType, filterTree, mapTree, TreeTransfer } from './tree-transfer';
import _ from 'lodash';
import { Modal } from 'antd';
import { globalMessage } from '@/utils';

interface PropsType {
  loading: boolean;
  // onClose 处理左侧选中并点击了清空返回，无法解除禁用
  // const onClose = (leftKeys: string[]) => {
  //   // 处理左侧选中并点击了清空返回，无法解除禁用
  //   if (_.isEmpty(leftKeys)) {
  //     // 已选到右侧
  //     mapTree(carTree, 'disabled', false);
  //   } else {
  //     const items = filterTree(carTree, leftKeys);
  //     mapTree(items, 'disabled', false);
  //   }
  //   // ……
  // };
  onClose: (bkLeftKeys: string[]) => void;
  onOk: (items: TreeDataType[]) => void;
  treeData: TreeDataType[];
  selectedData: TreeDataType[];
  info: {
    title: string;
    titles: string[];
  };
}

const SelectTree = ({ onClose, onOk, treeData, selectedData, info }: PropsType) => {
  let bkLeftKeys: string[] = [];
  const [selectedKeys, setSelectedKeys] = useState<string[]>(selectedData.map((v) => v.key));
  // 搜索树
  const onTreeSearch = (dir: any, value: any) => {
    console.log(dir, value);
  };

  // 保存树选择
  const saveTreeSelect = () => {
    return filterTree(treeData, selectedKeys);
  };

  return (
    <Modal
      title={info.title}
      visible
      closable={false}
      keyboard={false}
      maskClosable={false}
      className="tree-modal"
      okText="保存"
      cancelText="清空返回"
      onOk={() => {
        const items = filterTree(treeData, bkLeftKeys);
        if (!_.isEmpty(bkLeftKeys) && items.some((v: TreeDataType) => v.children)) {
          // 当右侧存在数据，且左侧有勾选(勾选的数据有子级)时保存，会导致数据被禁用
          globalMessage('warning', '请先处理左侧已选项');
          return;
        }
        onOk(saveTreeSelect());
      }}
      onCancel={() => onClose(bkLeftKeys)}
    >
      <TreeTransfer
        titles={info.titles}
        operations={['添加', '删除']}
        // showSearch
        onSearch={onTreeSearch}
        filterOption={(inputValue: string, option: TreeDataType) =>
          option.title.indexOf(inputValue) > -1
        }
        dataSource={treeData}
        // selectedKeys={bkLeftKeys}
        targetKeys={selectedKeys}
        onChange={(keys: string[], dir: string, moveKey: string[]) => {
          // 将右侧已选车辆且为禁用状态的删除（已选择父级）
          const targetKeysItem = filterTree(treeData, keys);
          setSelectedKeys(targetKeysItem.filter((v) => !v.disabled).map((v) => v.key));
          if (dir === 'left') {
            // 删除选择后，有子级将子级启用
            const nowItem = filterTree(treeData, moveKey);
            mapTree(nowItem, 'disabled', false);
          }
        }}
        onSelectChange={(leftKeys: string[]) => {
          // if (_.isEmpty(leftKeys)) return;
          // 交集，当前变化的项
          const xorArr = _.xor(leftKeys, bkLeftKeys);
          bkLeftKeys = leftKeys.slice();
          xorArr.forEach((v) => {
            const nowItem = filterTree(treeData, [v]);
            if (leftKeys.includes(v)) {
              // 在左侧选中数组中
              // 将选中的子级加selected
              nowItem[0].selected = true;
            } else if (!selectedKeys.includes(v)) {
              // 否则，并且不在右侧选中数组中
              // 将取消的子级去selected
              nowItem[0].selected = false;
            }
          });
        }}
      />
    </Modal>
  );
};

export default SelectTree;
