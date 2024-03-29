import type { FC } from 'react'
import type { PackageWithSubmitter } from '~/models/PackageWithSubmitter.ts'
import { Link } from 'react-router-dom'
import Card from '~/components/general/Card'
import CardsGrid from '~/components/general/CardsGrid'

const PackageGrid: FC<{ packages: PackageWithSubmitter[] }> = ({ packages }) => (
  <CardsGrid>
    {packages.map(item => (
      <Link to={`/package/${item.id}`} key={item.id}>
        <Card
          data={{
            title: item.name,
            logoUrl: item.logoUrl,
            label: item.submission,
            created: item.created,
            creator: item.creator,
          }}
        />
      </Link>
    ))}
  </CardsGrid>
)

export default PackageGrid
