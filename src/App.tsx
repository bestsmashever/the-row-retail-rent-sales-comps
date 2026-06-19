import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  ArrowUpDown,
  Banknote,
  Building2,
  LocateFixed,
  MapPinned,
  ReceiptText,
  RefreshCcw,
  Search,
  Store,
  Table2,
  Tags,
} from 'lucide-react'
import {
  formatNumber,
  leaseComps,
  leaseRentMidpoint,
  mapPoints,
  pointById,
  saleComps,
  type LeaseComp,
  type MapPoint,
  type SaleComp,
} from './data'

type ActiveView = 'rent' | 'sale'
type SortKey = 'metric' | 'sf' | 'name' | 'market'

interface RentFilters {
  query: string
  status: 'all' | 'Lease' | 'LOI'
  property: string
  minRent: number
  maxRent: number
  minNnn: number
  maxNnn: number
}

interface SaleFilters {
  query: string
  city: string
  category: 'all' | SaleComp['category']
  minPsf: number
  maxPsf: number
  maxCap: number
  minOccupancy: number
}

interface PointBundle {
  point: MapPoint
  rent: LeaseComp[]
  sale: SaleComp[]
}

const initialRentFilters: RentFilters = {
  query: '',
  status: 'all',
  property: 'all',
  minRent: 0,
  maxRent: 60,
  minNnn: 0,
  maxNnn: 20,
}

const initialSaleFilters: SaleFilters = {
  query: '',
  city: 'all',
  category: 'all',
  minPsf: 0,
  maxPsf: 1000,
  maxCap: 8,
  minOccupancy: 0,
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('rent')
  const [rentFilters, setRentFilters] = useState<RentFilters>(initialRentFilters)
  const [saleFilters, setSaleFilters] = useState<SaleFilters>(initialSaleFilters)
  const [selectedPointId, setSelectedPointId] = useState('target-the-row')
  const [sortKey, setSortKey] = useState<SortKey>('metric')

  const rentProperties = useMemo(() => Array.from(new Set(leaseComps.map((comp) => comp.property))).sort(), [])
  const saleCities = useMemo(() => Array.from(new Set(saleComps.map((comp) => comp.city))).sort(), [])

  const filteredRent = useMemo(() => {
    return leaseComps.filter((comp) => {
      const point = pointById.get(comp.pointId)
      const rent = leaseRentMidpoint(comp)
      const nnn = comp.nnn
      const haystack = `${comp.tenant} ${comp.property} ${point?.address ?? ''}`.toLowerCase()
      return (
        haystack.includes(rentFilters.query.toLowerCase()) &&
        (rentFilters.status === 'all' || comp.status === rentFilters.status) &&
        (rentFilters.property === 'all' || comp.property === rentFilters.property) &&
        (rent == null || (rent >= rentFilters.minRent && rent <= rentFilters.maxRent)) &&
        (nnn == null || (nnn >= rentFilters.minNnn && nnn <= rentFilters.maxNnn))
      )
    })
  }, [rentFilters])

  const filteredSale = useMemo(() => {
    return saleComps.filter((comp) => {
      const haystack = `${comp.property} ${comp.city} ${comp.address} ${comp.tenants}`.toLowerCase()
      return (
        haystack.includes(saleFilters.query.toLowerCase()) &&
        (saleFilters.city === 'all' || comp.city === saleFilters.city) &&
        (saleFilters.category === 'all' || comp.category === saleFilters.category) &&
        (comp.psf == null || (comp.psf >= saleFilters.minPsf && comp.psf <= saleFilters.maxPsf)) &&
        (comp.capRate == null || comp.capRate <= saleFilters.maxCap) &&
        (comp.occupancy == null || comp.occupancy >= saleFilters.minOccupancy)
      )
    })
  }, [saleFilters])

  const bundles = useMemo(() => {
    const byPoint = new Map<string, PointBundle>()
    const target = mapPoints.find((point) => point.id === 'target-the-row')
    if (target) byPoint.set(target.id, { point: target, rent: [], sale: [] })

    const records = activeView === 'rent' ? filteredRent : filteredSale
    records.forEach((comp) => {
      const point = pointById.get(comp.pointId)
      if (!point) return
      if (!byPoint.has(point.id)) byPoint.set(point.id, { point, rent: [], sale: [] })
      const bundle = byPoint.get(point.id)!
      if (activeView === 'rent') bundle.rent.push(comp as LeaseComp)
      if (activeView === 'sale') bundle.sale.push(comp as SaleComp)
    })

    return Array.from(byPoint.values())
  }, [activeView, filteredRent, filteredSale])

  const selectedBundle = bundles.find((bundle) => bundle.point.id === selectedPointId) ?? bundles[0]

  const rentKpis = useMemo(() => {
    const rents = filteredRent.map(leaseRentMidpoint).filter(isNumber)
    const nnns = filteredRent.map((comp) => comp.nnn).filter(isNumber)
    const tis = filteredRent.map((comp) => comp.ti).filter((value): value is number => isNumber(value) && value < 1000)
    return {
      count: filteredRent.length,
      avgRent: average(rents),
      avgNnn: average(nnns),
      avgTi: average(tis),
    }
  }, [filteredRent])

  const saleKpis = useMemo(() => {
    const psf = filteredSale.map((comp) => comp.psf).filter(isNumber)
    const caps = filteredSale.map((comp) => comp.capRate).filter(isNumber)
    const occ = filteredSale.map((comp) => comp.occupancy).filter(isNumber)
    const prices = filteredSale.map((comp) => comp.salePrice).filter(isNumber)
    return {
      count: filteredSale.length,
      avgPsf: average(psf),
      avgCap: average(caps),
      avgOcc: average(occ),
      totalVolume: prices.reduce((sum, value) => sum + value, 0),
    }
  }, [filteredSale])

  const rentRows = useMemo(() => {
    return filteredRent
      .map((comp) => ({
        id: comp.id,
        pointId: comp.pointId,
        name: comp.tenant,
        market: pointById.get(comp.pointId)?.city ?? '',
        metric: leaseRentMidpoint(comp) ?? -1,
        sf: comp.sf ?? 0,
        comp,
      }))
      .sort((a, b) => compareRows(a, b, sortKey))
  }, [filteredRent, sortKey])

  const saleRows = useMemo(() => {
    return filteredSale
      .map((comp) => ({
        id: comp.id,
        pointId: comp.pointId,
        name: comp.property,
        market: comp.city,
        metric: comp.psf ?? -1,
        sf: comp.sizeSf,
        comp,
      }))
      .sort((a, b) => compareRows(a, b, sortKey))
  }, [filteredSale, sortKey])

  const switchView = (view: ActiveView) => {
    setActiveView(view)
    setSelectedPointId('target-the-row')
    setSortKey('metric')
  }

  return (
    <div className={`app-shell ${activeView}`}>
      <aside className="left-rail">
        <div className="brand-block">
          <div className="brand-mark">
            <MapPinned size={22} />
          </div>
          <div>
            <h1>The Row Retail Comps</h1>
            <p>Separate rent and sale workspaces</p>
          </div>
        </div>

        <nav className="workspace-nav" aria-label="Comp workspaces">
          <button className={activeView === 'rent' ? 'active' : ''} onClick={() => switchView('rent')}>
            <Store size={18} />
            <span>
              <strong>Rent Comps</strong>
              <small>{leaseComps.length} tenant records</small>
            </span>
          </button>
          <button className={activeView === 'sale' ? 'active' : ''} onClick={() => switchView('sale')}>
            <Banknote size={18} />
            <span>
              <strong>Sale Comps</strong>
              <small>{saleComps.length} property records</small>
            </span>
          </button>
        </nav>

        {activeView === 'rent' ? (
          <RentFiltersPanel filters={rentFilters} properties={rentProperties} onChange={setRentFilters} />
        ) : (
          <SaleFiltersPanel filters={saleFilters} cities={saleCities} onChange={setSaleFilters} />
        )}

        <section className="source-note">
          <strong>Source basis</strong>
          <p>Rent: The Row - Lease Comps.pdf. Sales: The_Row_Sale_Comps.pdf. Map points use ArcGIS geocodes with specific manual refinements for Easton Park and Burleson Crossing East.</p>
        </section>
      </aside>

      <main className="workspace">
        {activeView === 'rent' ? (
          <RentWorkspace
            bundles={bundles}
            kpis={rentKpis}
            rows={rentRows}
            selectedBundle={selectedBundle}
            selectedPointId={selectedBundle?.point.id ?? ''}
            sortKey={sortKey}
            onSelect={setSelectedPointId}
            onSort={setSortKey}
          />
        ) : (
          <SaleWorkspace
            bundles={bundles}
            kpis={saleKpis}
            rows={saleRows}
            selectedBundle={selectedBundle}
            selectedPointId={selectedBundle?.point.id ?? ''}
            sortKey={sortKey}
            onSelect={setSelectedPointId}
            onSort={setSortKey}
          />
        )}
      </main>
    </div>
  )
}

function RentFiltersPanel({ filters, properties, onChange }: { filters: RentFilters; properties: string[]; onChange: (filters: RentFilters) => void }) {
  return (
    <section className="filter-section rent-filter">
      <div className="section-title">
        <ReceiptText size={16} />
        <span>Rent filters</span>
      </div>
      <label className="input-row">
        <Search size={15} />
        <input value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder="Search tenant, property, address" />
      </label>
      <label>
        <span>Lease status</span>
        <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as RentFilters['status'] })}>
          <option value="all">Lease + LOI</option>
          <option value="Lease">Executed leases</option>
          <option value="LOI">LOIs only</option>
        </select>
      </label>
      <label>
        <span>Property cluster</span>
        <select value={filters.property} onChange={(event) => onChange({ ...filters, property: event.target.value })}>
          <option value="all">All rent clusters</option>
          {properties.map((property) => (
            <option key={property} value={property}>
              {property}
            </option>
          ))}
        </select>
      </label>
      <div className="range-grid">
        <label>
          <span>Min rent</span>
          <input type="number" value={filters.minRent} onChange={(event) => onChange({ ...filters, minRent: Number(event.target.value) })} />
        </label>
        <label>
          <span>Max rent</span>
          <input type="number" value={filters.maxRent} onChange={(event) => onChange({ ...filters, maxRent: Number(event.target.value) })} />
        </label>
      </div>
      <div className="range-grid">
        <label>
          <span>Min NNN</span>
          <input type="number" value={filters.minNnn} onChange={(event) => onChange({ ...filters, minNnn: Number(event.target.value) })} />
        </label>
        <label>
          <span>Max NNN</span>
          <input type="number" value={filters.maxNnn} onChange={(event) => onChange({ ...filters, maxNnn: Number(event.target.value) })} />
        </label>
      </div>
      <button className="reset-button" onClick={() => onChange(initialRentFilters)}>
        <RefreshCcw size={15} />
        Reset rent filters
      </button>
    </section>
  )
}

function SaleFiltersPanel({ filters, cities, onChange }: { filters: SaleFilters; cities: string[]; onChange: (filters: SaleFilters) => void }) {
  return (
    <section className="filter-section sale-filter">
      <div className="section-title">
        <Tags size={16} />
        <span>Sale filters</span>
      </div>
      <label className="input-row">
        <Search size={15} />
        <input value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder="Search property, city, tenant" />
      </label>
      <label>
        <span>Market</span>
        <select value={filters.city} onChange={(event) => onChange({ ...filters, city: event.target.value })}>
          <option value="all">All sale markets</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Sale type</span>
        <select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value as SaleFilters['category'] })}>
          <option value="all">All sale comps</option>
          <option value="Unanchored Strip">Unanchored strip</option>
          <option value="Lifestyle / Power Center">Lifestyle / power center</option>
        </select>
      </label>
      <div className="range-grid">
        <label>
          <span>Min $/SF</span>
          <input type="number" value={filters.minPsf} onChange={(event) => onChange({ ...filters, minPsf: Number(event.target.value) })} />
        </label>
        <label>
          <span>Max $/SF</span>
          <input type="number" value={filters.maxPsf} onChange={(event) => onChange({ ...filters, maxPsf: Number(event.target.value) })} />
        </label>
      </div>
      <label>
        <span>Max cap rate</span>
        <input type="range" min="5" max="8" step="0.05" value={filters.maxCap} onChange={(event) => onChange({ ...filters, maxCap: Number(event.target.value) })} />
        <strong>{filters.maxCap.toFixed(2)}%</strong>
      </label>
      <label>
        <span>Min occupancy</span>
        <input type="range" min="0" max="100" step="1" value={filters.minOccupancy} onChange={(event) => onChange({ ...filters, minOccupancy: Number(event.target.value) })} />
        <strong>{filters.minOccupancy.toFixed(0)}%</strong>
      </label>
      <button className="reset-button" onClick={() => onChange(initialSaleFilters)}>
        <RefreshCcw size={15} />
        Reset sale filters
      </button>
    </section>
  )
}

function RentWorkspace({
  bundles,
  kpis,
  rows,
  selectedBundle,
  selectedPointId,
  sortKey,
  onSelect,
  onSort,
}: {
  bundles: PointBundle[]
  kpis: { count: number; avgRent: number | null; avgNnn: number | null; avgTi: number | null }
  rows: ReturnType<typeof buildRentRows>
  selectedBundle?: PointBundle
  selectedPointId: string
  sortKey: SortKey
  onSelect: (id: string) => void
  onSort: (key: SortKey) => void
}) {
  return (
    <>
      <WorkspaceHeader
        accent="rent"
        title="Rent Comps"
        subtitle="Tenant-level lease comparables and LOIs"
        kpis={[
          ['Tenant records', formatNumber(kpis.count)],
          ['Avg base rent', kpis.avgRent == null ? '-' : `$${kpis.avgRent.toFixed(2)}/SF`],
          ['Avg NNN', kpis.avgNnn == null ? '-' : `$${kpis.avgNnn.toFixed(2)}/SF`],
          ['Avg TI', kpis.avgTi == null ? '-' : `$${kpis.avgTi.toFixed(0)}/SF`],
        ]}
      />
      <section className="workspace-grid">
        <MapCard mode="rent" bundles={bundles} selectedPointId={selectedPointId} onSelect={onSelect} />
        <RentDetail bundle={selectedBundle} />
      </section>
      <RentTable rows={rows} sortKey={sortKey} onSort={onSort} onSelect={onSelect} />
    </>
  )
}

function SaleWorkspace({
  bundles,
  kpis,
  rows,
  selectedBundle,
  selectedPointId,
  sortKey,
  onSelect,
  onSort,
}: {
  bundles: PointBundle[]
  kpis: { count: number; avgPsf: number | null; avgCap: number | null; avgOcc: number | null; totalVolume: number }
  rows: ReturnType<typeof buildSaleRows>
  selectedBundle?: PointBundle
  selectedPointId: string
  sortKey: SortKey
  onSelect: (id: string) => void
  onSort: (key: SortKey) => void
}) {
  return (
    <>
      <WorkspaceHeader
        accent="sale"
        title="Sale Comps"
        subtitle="Property-level transactions and pricing evidence"
        kpis={[
          ['Property records', formatNumber(kpis.count)],
          ['Avg sale $/SF', kpis.avgPsf == null ? '-' : `$${kpis.avgPsf.toFixed(0)}`],
          ['Avg cap rate', kpis.avgCap == null ? '-' : `${kpis.avgCap.toFixed(2)}%`],
          ['Known volume', `$${formatNumber(Math.round(kpis.totalVolume / 1000000))}M`],
        ]}
      />
      <section className="workspace-grid">
        <MapCard mode="sale" bundles={bundles} selectedPointId={selectedPointId} onSelect={onSelect} />
        <SaleDetail bundle={selectedBundle} />
      </section>
      <SaleTable rows={rows} sortKey={sortKey} onSort={onSort} onSelect={onSelect} />
    </>
  )
}

function WorkspaceHeader({ accent, title, subtitle, kpis }: { accent: ActiveView; title: string; subtitle: string; kpis: [string, string][] }) {
  return (
    <header className={`workspace-header ${accent}`}>
      <div>
        <p className="date-line">Compiled June 19, 2026</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="kpi-strip">
        {kpis.map(([label, value]) => (
          <div className="kpi" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </header>
  )
}

function MapCard({ mode, bundles, selectedPointId, onSelect }: { mode: ActiveView; bundles: PointBundle[]; selectedPointId: string; onSelect: (id: string) => void }) {
  return (
    <div className="map-panel">
      <MapView mode={mode} bundles={bundles} selectedPointId={selectedPointId} onSelect={onSelect} />
      <div className="map-legend">
        <span><i className="dot target" /> The Row</span>
        <span><i className={`dot ${mode}`} /> {mode === 'rent' ? 'Rent comp' : 'Sale comp'}</span>
      </div>
    </div>
  )
}

function RentDetail({ bundle }: { bundle?: PointBundle }) {
  if (!bundle) return null
  const rents = bundle.rent.map(leaseRentMidpoint).filter(isNumber)
  return (
    <aside className="detail-panel rent-detail">
      <DetailTitle point={bundle.point} mode="rent" />
      <div className="detail-metrics">
        <Metric label="Tenant records" value={formatNumber(bundle.rent.length)} />
        <Metric label="Avg base rent" value={rents.length ? `$${average(rents)!.toFixed(2)}/SF` : '-'} />
      </div>
      {bundle.point.kind === 'target' ? <TargetNote mode="rent" /> : null}
      <CompList
        title="Tenant records"
        empty="No rent records at this point."
        items={bundle.rent.map((comp) => `${comp.tenant}: ${comp.sfLabel}, ${comp.baseRentLabel} base rent, ${comp.nnnLabel} NNN, ${comp.status}`)}
      />
      <MapNote note={bundle.point.geocodeNote} />
    </aside>
  )
}

function SaleDetail({ bundle }: { bundle?: PointBundle }) {
  if (!bundle) return null
  const psf = bundle.sale.map((comp) => comp.psf).filter(isNumber)
  const caps = bundle.sale.map((comp) => comp.capRate).filter(isNumber)
  return (
    <aside className="detail-panel sale-detail">
      <DetailTitle point={bundle.point} mode="sale" />
      <div className="detail-metrics">
        <Metric label="Sale records" value={formatNumber(bundle.sale.length)} />
        <Metric label="Avg $/SF" value={psf.length ? `$${average(psf)!.toFixed(0)}` : '-'} />
        <Metric label="Avg cap" value={caps.length ? `${average(caps)!.toFixed(2)}%` : '-'} />
        <Metric label="Market" value={bundle.point.city} />
      </div>
      {bundle.point.kind === 'target' ? <TargetNote mode="sale" /> : null}
      <CompList
        title="Property records"
        empty="No sale records at this point."
        items={bundle.sale.map((comp) => `${comp.property}: ${comp.psfLabel}/SF, ${comp.capRateLabel} cap, ${comp.salePriceLabel}, ${comp.saleDate}`)}
      />
      <MapNote note={bundle.point.geocodeNote} />
    </aside>
  )
}

function DetailTitle({ point, mode }: { point: MapPoint; mode: ActiveView }) {
  return (
    <div className="detail-title">
      <span className={`detail-icon ${point.kind === 'target' ? 'target' : mode}`}>
        {point.kind === 'target' ? <LocateFixed size={19} /> : <Building2 size={19} />}
      </span>
      <div>
        <h3>{point.name}</h3>
        <p>{point.address} - {point.city}</p>
      </div>
    </div>
  )
}

function TargetNote({ mode }: { mode: ActiveView }) {
  return (
    <div className="target-card">
      <strong>The Row reference point</strong>
      <p>{mode === 'rent' ? 'Use this anchor to compare tenant rent evidence near Southeast Austin and nearby retail clusters.' : 'Use this anchor to compare sale pricing across Austin, San Antonio, and Central Texas retail assets.'}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function CompList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="comp-list">
      <h4>{title}</h4>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  )
}

function MapNote({ note }: { note: string }) {
  return (
    <div className="geocode-box">
      <strong>Map note</strong>
      <p>{note}</p>
    </div>
  )
}

function RentTable({ rows, sortKey, onSort, onSelect }: { rows: ReturnType<typeof buildRentRows>; sortKey: SortKey; onSort: (key: SortKey) => void; onSelect: (id: string) => void }) {
  return (
    <section className="table-panel rent-table">
      <TableHeader count={rows.length} label="rent records" sortKey={sortKey} onSort={onSort} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Property</th>
              <th>Status</th>
              <th>SF</th>
              <th>Base rent</th>
              <th>NNN</th>
              <th>TI</th>
              <th>Market</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onSelect(row.pointId)}>
                <td>{row.comp.tenant}</td>
                <td>{row.comp.property}</td>
                <td><span className="status-pill">{row.comp.status}</span></td>
                <td>{row.comp.sfLabel}</td>
                <td>{row.comp.baseRentLabel}</td>
                <td>{row.comp.nnnLabel}</td>
                <td>{row.comp.tiLabel}</td>
                <td>{row.market}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SaleTable({ rows, sortKey, onSort, onSelect }: { rows: ReturnType<typeof buildSaleRows>; sortKey: SortKey; onSort: (key: SortKey) => void; onSelect: (id: string) => void }) {
  return (
    <section className="table-panel sale-table">
      <TableHeader count={rows.length} label="sale records" sortKey={sortKey} onSort={onSort} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>City</th>
              <th>Size</th>
              <th>Sale date</th>
              <th>Sale price</th>
              <th>$/SF</th>
              <th>Cap</th>
              <th>Occ.</th>
              <th>Tenants</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onSelect(row.pointId)}>
                <td>{row.comp.property}</td>
                <td>{row.comp.category}</td>
                <td>{row.comp.city}</td>
                <td>{formatNumber(row.comp.sizeSf)}</td>
                <td>{row.comp.saleDate}</td>
                <td>{row.comp.salePriceLabel}</td>
                <td>{row.comp.psfLabel}</td>
                <td>{row.comp.capRateLabel}</td>
                <td>{row.comp.occupancyLabel}</td>
                <td>{row.comp.tenants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TableHeader({ count, label, sortKey, onSort }: { count: number; label: string; sortKey: SortKey; onSort: (key: SortKey) => void }) {
  return (
    <div className="table-header">
      <div>
        <Table2 size={17} />
        <span>{count} visible {label}</span>
      </div>
      <div className="sort-buttons">
        {(['metric', 'sf', 'name', 'market'] as SortKey[]).map((key) => (
          <button key={key} className={sortKey === key ? 'active' : ''} onClick={() => onSort(key)}>
            <ArrowUpDown size={13} />
            {key === 'metric' ? 'Metric' : key === 'sf' ? 'SF' : key}
          </button>
        ))}
      </div>
    </div>
  )
}

function MapView({ mode, bundles, selectedPointId, onSelect }: { mode: ActiveView; bundles: PointBundle[]; selectedPointId: string; onSelect: (id: string) => void }) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([30.22, -97.76], 9)
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current)
    layerRef.current = L.layerGroup().addTo(mapRef.current)
    setTimeout(() => mapRef.current?.invalidateSize(), 100)
  }, [])

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return
    layerRef.current.clearLayers()
    const bounds: L.LatLngTuple[] = []
    bundles.forEach((bundle) => {
      const { point } = bundle
      bounds.push([point.lat, point.lng])
      const count = mode === 'rent' ? bundle.rent.length : bundle.sale.length
      const markerText = point.kind === 'target' ? 'T' : String(Math.max(count, 1))
      const icon = L.divIcon({
        className: '',
        html: `<button class="map-marker ${point.kind === 'target' ? 'target' : mode} ${selectedPointId === point.id ? 'selected' : ''}" aria-label="${point.name}"><span>${markerText}</span></button>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
      L.marker([point.lat, point.lng], { icon })
        .addTo(layerRef.current!)
        .on('click', () => onSelect(point.id))
        .bindTooltip(`${point.name}<br>${count} ${mode === 'rent' ? 'rent' : 'sale'} records`, { direction: 'top', offset: [0, -14] })
    })
    if (bounds.length > 1) mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 })
    setTimeout(() => mapRef.current?.invalidateSize(), 50)
  }, [bundles, mode, selectedPointId, onSelect])

  return <div ref={containerRef} className="map-canvas" />
}

function buildRentRows() {
  return [] as {
    id: string
    pointId: string
    name: string
    market: string
    metric: number
    sf: number
    comp: LeaseComp
  }[]
}

function buildSaleRows() {
  return [] as {
    id: string
    pointId: string
    name: string
    market: string
    metric: number
    sf: number
    comp: SaleComp
  }[]
}

function compareRows<T extends { metric: number; sf: number; name: string; market: string }>(a: T, b: T, sortKey: SortKey) {
  if (sortKey === 'metric' || sortKey === 'sf') return b[sortKey] - a[sortKey]
  return a[sortKey].localeCompare(b[sortKey])
}

function isNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function average(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default App
