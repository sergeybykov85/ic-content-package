import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import TextInput from '~/components/general/TextInput'

const WarehousePage: FC = () => (
  <SectionLayout title="Warehouse">
    <TextInput placeholder={'Text'} />
  </SectionLayout>
)

export default WarehousePage
