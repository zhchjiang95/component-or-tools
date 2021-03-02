import React, { useState, forwardRef, FocusEventHandler } from 'react';
import { Input } from 'antd';

interface PropsType {
  value?: string;
  onChange?: (arg1: string) => void;
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler;
  noAutoDecimal?: boolean; // 是否不自动补全小数
  disabled?: boolean;
}

/**
 * 金额输入，保留两位小数
 */

const Amount = (
  { value, onChange, onPressEnter, onBlur, noAutoDecimal, disabled }: PropsType,
  ref: any,
) => {
  const [values, setValues] = useState<string>(value || '');

  const handleChange = (e: any) => {
    const val = e.target.value;
    const reg = /^-?\d*(\.\d{0,2})?$/;
    if ((!Number.isNaN(val) && reg.test(val)) || val === '' || val === '-') {
      setValues(val);
    }
  };
  const onExtraBlur = (e: React.FocusEvent<Element>) => {
    let valueTemp = values;
    if (values.charAt(values.length - 1) === '.' || values === '-') {
      valueTemp = values.slice(0, -1);
    }
    if (!noAutoDecimal)
      valueTemp = Number(valueTemp)
        .toFixed(2)
        .replace(/0*(\d+)/, '$1');
    setValues(valueTemp);
    if (onChange) onChange(valueTemp);
    if (onBlur) onBlur(e);
  };

  return (
    <Input
      ref={ref}
      placeholder="请输入"
      maxLength={12}
      value={values}
      onBlur={onExtraBlur}
      onChange={handleChange}
      onPressEnter={onPressEnter}
      disabled={disabled}
    />
  );
};

export default forwardRef(Amount);
