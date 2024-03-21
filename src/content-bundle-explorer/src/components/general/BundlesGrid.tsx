import type { FC } from 'react'
import type Bundle from '~/models/Bundle.ts'
import Card from '~/components/general/Card'
import CardsGrid from '~/components/general/CardsGrid'
import { Link } from 'react-router-dom'

const BundlesGrid: FC<{ bundles: Bundle[] }> = ({ bundles }) => (
  <CardsGrid>
    {bundles.map(item => (
      <Link to={`bundle/${item.id}`} key={item.id}>
        <Card
          data={{
            title: item.name,
            logoUrl: item.logoUrl,
            label: item.classification,
            created: item.created,
            creator: item.creator,
          }}
        />
      </Link>
    ))}
  </CardsGrid>
)

export default BundlesGrid
