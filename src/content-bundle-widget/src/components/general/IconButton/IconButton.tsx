import type { ComponentPropsWithoutRef, FC } from 'react'
import Button from '~/components/general/Button'
import clsx from 'clsx'
import styles from './IconButton.module.scss'

interface IconButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'color'> {
  iconName: string
  iconAlt?: string
  size?: number
}

const IconButton: FC<IconButtonProps> = ({ iconName, size = 50, className, iconAlt, ...props }) => (
  <Button variant="text" className={clsx(styles.button, className)} style={{ width: size, height: size }} {...props}>
    <img src={`/images/${iconName}`} alt={iconAlt} style={{ height: size / 2 }} />
  </Button>
)

export default IconButton
