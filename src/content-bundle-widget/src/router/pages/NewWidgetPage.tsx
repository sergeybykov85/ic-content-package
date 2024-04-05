import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import NewWidgetForm from '~/components/features/NewWidgetForm'

const NewWidgetPage: FC = () => (
  <SectionLayout title="Create new widget">
    <NewWidgetForm />
  </SectionLayout>
)

export default NewWidgetPage
