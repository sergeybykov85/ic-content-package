import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import WidgetForm from '~/components/features/WidgetForm'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'

const NewWidgetPage: FC = () => (
  <SectionLayout
    title="Create new widget"
    rightElement={
      <Link to={'/my-widgets'}>
        <Button text="Back to list" variant="text" />
      </Link>
    }
  >
    <WidgetForm />
  </SectionLayout>
)

export default NewWidgetPage
