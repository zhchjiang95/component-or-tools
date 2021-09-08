import { useEffect, useState } from 'react'
import { DatePicker } from 'antd'

const YearPicker = ({getYear, yearVal}) => {
  const [time, setTime] = useState(null)
  const [isopen, setIsopen] = useState(false)
  useEffect(() => {
    getYear(time)
  }, [time])

  return <DatePicker value={yearVal} open={isopen} mode='year' format='YYYY' onOpenChange={(status) => status ? setIsopen(true) : setIsopen(false)} onChange={() => { setTime(null) }} onPanelChange={(v) => {
    setTime(v)
    setIsopen(false)
  }} placeholder='请选择' style={{ width: '100%' }} />
}

export default YearPicker