import { type FC } from 'react'
import clsx from 'clsx'
import Chip, { type ChipProps } from '~/components/general/Chip'
import If from '~/components/general/If.tsx'
import styles from './ChipsFilter.module.scss'

interface ChipsFilterProps {
  data: string[]
  label: string
  name: string
  activeItem: string
  onChange: (value: string, name: string) => void
  className?: string
  color?: ChipProps['color']
}

const ChipsFilter: FC<ChipsFilterProps> = ({ data, label, name, activeItem, onChange, className, color }) => {
  return (
    <div className={clsx(className)}>
      <If condition={data.length > 0}>
        <label>{label}</label>
        <div className={styles.chips}>
          {data.map(i => (
            <Chip
              key={i}
              text={i}
              withCross={i === activeItem}
              onClick={value => onChange(value, name)}
              onCrossClick={() => onChange('', name)}
              color={color}
            />
          ))}
        </div>
      </If>
    </div>
  )
}

export default ChipsFilter
