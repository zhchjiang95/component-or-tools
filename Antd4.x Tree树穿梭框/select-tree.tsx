import React, { useState, useEffect } from 'react';
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

const checked = {
  value: false,
};

const SelectTree = ({ onClose, onOk, treeData, selectedData, info }: PropsType) => {
  const [bkLeftKeys, setBkLeftKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(selectedData.map((v) => v.key));
  const [shuttleData, setShuttleData] = useState<TreeDataType[]>([]);

  useEffect(() => {
    // 禁用已选择和子级
    const checkedItem = filterTree(treeData, selectedKeys).map(v => {
      const p = v
      p.selected = true
      return p
    });
    mapTree(checkedItem, 'disabled', true);
    setShuttleData(treeData);
  }, []);

  const chChecked = (val: boolean) => {
    checked.value = val;
  };

  // 搜索树
  const onTreeSearch = (dir: any, value: any) => {
    console.log(dir, value);
  };

  // 保存树选择
  const saveTreeSelect = () => {
    return filterTree(shuttleData, selectedKeys);
  };

  return (
    <Modal
      title={info.title}
      visible={!_.isEmpty(shuttleData)}
      closable={false}
      keyboard={false}
      maskClosable={false}
      className="tree-modal"
      okText="保存"
      cancelText="清空返回"
      onOk={() => {
        const items = filterTree(shuttleData, bkLeftKeys);
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
        dataSource={shuttleData}
        // selectedKeys={bkLeftKeys}
        targetKeys={selectedKeys}
        chChecked={chChecked}
        onChange={(keys: string[], dir: string, moveKey: string[]) => {
          // 将右侧已选车辆且为禁用状态的删除（已选择父级）
          const targetKeysItem = filterTree(shuttleData, keys);
          setSelectedKeys(
            targetKeysItem
              .filter((v) => !v.disabled)
              .map((v) => {
                // 将子级已选的selected重置
                v.children?.forEach((n) => {
                  const p = n;
                  if (p.selected) p.selected = false;
                });
                return v.key;
              }),
          );
          if (dir === 'left') {
            // 删除选择后，有子级将子级启用
            const nowItem = filterTree(shuttleData, moveKey);
            // 将删除项的selected设置为false
            nowItem.forEach((v) => {
              const p = v;
              p.selected = false;
            });
            mapTree(nowItem, 'disabled', false);
          }
        }}
        onSelectChange={(leftKeys: string[]) => {
          // if (_.isEmpty(leftKeys)) return;
          // 交集，当前变化的项
          const xorArr = _.xor(leftKeys, bkLeftKeys);
          setBkLeftKeys(leftKeys.slice());
          xorArr.forEach((v) => {
            const nowItem = filterTree(shuttleData, [v]);
            if (leftKeys.includes(v)) {
              // 在左侧选中数组中
              // 将选中的加selected
              nowItem[0].selected = true;
            } else if (!checked.value) {
              // 将左侧取消的去selected
              nowItem[0].selected = false;
              checked.value = true;
            }
          });
        }}
      />
    </Modal>
  );
};

export default SelectTree;
