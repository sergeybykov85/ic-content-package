import type { FC } from 'react'
import type Bundle from '~/models/Bundle.ts'
import Card from '~/components/general/Card'
import CardsGrid from '~/components/general/CardsGrid'

const BundlesGrid: FC<{ bundles: Bundle[] }> = ({ bundles }) => (
  <CardsGrid>
    {bundles.map(item => (
      <Card
        key={item.id}
        data={{
          title: item.name,
          logoUrl: item.logoUrl,
          label: item.classification,
          created: item.created,
          creator: item.creator,
        }}
      />
    ))}
  </CardsGrid>
)

export default BundlesGrid
