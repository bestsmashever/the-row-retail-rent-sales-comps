import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { ArrowUpDown, Building2, Filter, LocateFixed, MapPinned, RefreshCcw, Search, Table2 } from 'lucide-react'
import { formatNumber, leaseComps, leaseRentMidpoint, mapPoints, pointById, saleComps, type LeaseComp, type MapPoint, type SaleComp } from './data'

type DatasetFilter = 'all' | 'lease' | 'sale'
type SortKey = 'name' | 'city' | 'metric' | 'sf'

interface Filters {
  dataset: DatasetFilter
  query: string
  city: string
  leaseStatus: 'all' | 'Lease' | 'LOI'
  saleCategory: 'all' | SaleComp['category']
  minRent: number
  maxRent: number
  maxCap: number
}

interface PointBundle {
  point: MapPoint
  lease: LeaseComp[]
  sale: SaleComp[]
}

const initialFilters: Filters = {
  dataset: 'all',
  query: '',
  city: 'all',
  leaseStatus: 'all',
  saleCategory: 'all',
  minRent: 0,
  maxRent: 60,
  maxCap: 8,
}

function App() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedPointId, setSelectedPointId] = useState('target-the-row')
  const [sortKey, setSortKey] = useState<SortKey>('metric')

  const filteredLease = useMemo(() => {
    if (filters.dataset === 'sale') return []
    return leaseComps.filter((comp) => {
      const point = pointById.get(comp.pointId)
      const rent = leaseRentMidpoint(comp)
      const haystack = `${comp.property} ${comp.tenant} ${point?.address ?? ''}`.toLowerCase()
      return (
        haystack.includes(filters.query.toLowerCase()) &&
        (filters.city === 'all' || point?.city === filters.city) &&
        (filters.leaseStatus === 'all' || comp.status === filters.leaseStatus) &&
        (rent == null || (rent >= filters.minRent && rent <= filters.maxRent))
      )
    })
  }, [filters])

  const filteredSale = useMemo(() => {
    if (filters.dataset === 'lease') return []
    return saleComps.filter((comp) => {
      const haystack = `${comp.property} ${comp.city} ${comp.address} ${comp.tenants}`.toLowerCase()
      return (
        haystack.includes(filters.query.toLowerCase()) &&
        (filters.city === 'all' || comp.city === filters.city) &&
        (filters.saleCategory === 'all' || comp.category === filters.saleCategory) &&
        (comp.capRate == null || comp.capRate <= filters.maxCap)
      )
    })
  }, [filters])

  const bundles = useMemo(() => {
    const byPoint = new Map<string, PointBundle>()
    const ensureBundle = (point: MapPoint) => {
      if (!byPoint.has(point.id)) byPoint.set(point.id, { point, lease: [], sale: [] })
      return byPoint.get(point.id)!
    }

    ensureBundle(mapPoints.find((point) => point.id === 'target-the-row')!)
    filteredLease.forEach((comp) => ensureBundle(pointById.get(comp.pointId)!).lease.push(comp))
    filteredSale.forEach((comp) => ensureBundle(pointById.get(comp.pointId)!).sale.push(comp))
    return Array.from(byPoint.values())
  }, [filteredLease, filteredSale])

  const selectedBundle = bundles.find((bundle) => bundle.point.id === selectedPointId) ?? bundles[0]

  const tableRows = useMemo(() => {
    const rows = [
      ...filteredLease.map((comp) => ({ type: 'Lease' as const, id: comp.id, pointId: comp.pointId, name: comp.tenant, property: comp.property, city: pointById.get(comp.pointId)?.city ?? '', metric: leaseRentMidpoint(comp) ?? -1, sf: comp.sf ?? 0, comp })),
      ...filteredSale.map((comp) => ({ type: 'Sale' as const, id: comp.id, pointId: comp.pointId, name: comp.property, property: comp.category, city: comp.city, metric: comp.psf ?? -1, sf: comp.sizeSf, comp })),
    ]
    return rows.sort((a, b) => {
      if (sortKey === 'metric' || sortKey === 'sf') return b[sortKey] - a[sortKey]
      return String(a[sortKey]).localeCompare(String(b[sortKey]))
    })
  }, [filteredLease, filteredSale, sortKey])

  const kpis = useMemo(() => {
    const rents = filteredLease.map(leaseRentMidpoint).filter((value): value is number => value != null)
    const salePsf = filteredSale.map((comp) => comp.psf).filter((value): value is number => value != null)
    const caps = filteredSale.map((comp) => comp.capRate).filter((value): value is number => value != null)
    return {
      leaseCount: filteredLease.length,
      saleCount: filteredSale.length,
      avgRent: average(rents),
      avgPsf: average(salePsf),
      avgCap: average(caps),
    }
  }, [filteredLease, filteredSale])

  const cities = useMemo(() => {
    const citySet = new Set<string>()
    leaseComps.forEach((comp) => citySet.add(pointById.get(comp.pointId)?.city ?? ''))
    saleComps.forEach((comp) => citySet.add(comp.city))
    return Array.from(citySet).filter(Boolean).sort()
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <MapPinned size={22} />
          </div>
          <div>
            <h1>The Row Comps Map</h1>
            <p>Retail lease and sale comparables</p>
          </div>
        </div>

        <section className="filter-section">
          <div className="section-title">
            <Filter size={16} />
            <span>Filters</span>
          </div>
          <div className="segmented">
            {(['all', 'lease', 'sale'] as DatasetFilter[]).map((value) => (
              <button key={value} className={filters.dataset === value ? 'active' : ''} onClick={() => setFilters({ ...filters, dataset: value })}>
                {value === 'all' ? 'All' : value === 'lease' ? 'Lease' : 'Sale'}
              </button>
            ))}
          </div>
          <label className="input-row">
            <Search size={15} />
            <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search tenant, property, address" />
          </label>
          <label>
            <span>City / submarket</span>
            <select value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}>
              <option value="all">All markets</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Lease status</span>
            <select value={filters.leaseStatus} onChange={(event) => setFilters({ ...filters, leaseStatus: event.target.value as Filters['leaseStatus'] })}>
              <option value="all">Lease + LOI</option>
              <option value="Lease">Executed leases</option>
              <option value="LOI">LOIs only</option>
            </select>
          </label>
          <label>
            <span>Sale category</span>
            <select value={filters.saleCategory} onChange={(event) => setFilters({ ...filters, saleCategory: event.target.value as Filters['saleCategory'] })}>
              <option value="all">All sale comps</option>
              <option value="Unanchored Strip">Unanchored strip</option>
              <option value="Lifestyle / Power Center">Lifestyle / power center</option>
            </select>
          </label>
          <div className="range-grid">
            <label>
              <span>Min rent</span>
              <input type="number" value={filters.minRent} onChange={(event) => setFilters({ ...filters, minRent: Number(event.target.value) })} />
            </label>
            <label>
              <span>Max rent</span>
              <input type="number" value={filters.maxRent} onChange={(event) => setFilters({ ...filters, maxRent: Number(event.target.value) })} />
            </label>
          </div>
          <label>
            <span>Max cap rate</span>
            <input type="range" min="5" max="8" step="0.05" value={filters.maxCap} onChange={(event) => setFilters({ ...filters, maxCap: Number(event.target.value) })} />
            <strong>{filters.maxCap.toFixed(2)}%</strong>
          </label>
          <button className="reset-button" onClick={() => setFilters(initialFilters)}>
            <RefreshCcw size={15} />
            Reset filters
          </button>
        </section>

        <section className="source-note">
          <strong>Source basis</strong>
          <p>Lease PDF: The Row - Lease Comps.pdf. Sale PDF: The_Row_Sale_Comps.pdf. Map coordinates are ArcGIS geocodes, with Easton Park and Burleson Crossing refined using public address/intersection references.</p>
        </section>
      </aside>

      <main className="main-pane">
        <header className="topbar">
          <div>
            <p className="eyebrow">Compiled June 19, 2026</p>
            <h2>Austin / Central Texas retail comp set</h2>
          </div>
          <div className="kpi-strip">
            <Kpi label="Lease comps" value={formatNumber(kpis.leaseCount)} />
            <Kpi label="Avg base rent" value={kpis.avgRent == null ? '-' : `$${kpis.avgRent.toFixed(2)}/SF`} />
            <Kpi label="Sale comps" value={formatNumber(kpis.saleCount)} />
            <Kpi label="Avg sale $/SF" value={kpis.avgPsf == null ? '-' : `$${kpis.avgPsf.toFixed(0)}`} />
            <Kpi label="Avg cap" value={kpis.avgCap == null ? '-' : `${kpis.avgCap.toFixed(2)}%`} />
          </div>
        </header>

        <section className="workbench">
          <div className="map-panel">
            <MapView bundles={bundles} selectedPointId={selectedBundle?.point.id ?? ''} onSelect={setSelectedPointId} />
            <div className="map-legend">
              <span><i className="dot target" /> The Row</span>
              <span><i className="dot lease" /> Lease</span>
              <span><i className="dot sale" /> Sale</span>
              <span><i className="dot mixed" /> Mixed</span>
            </div>
          </div>

          <DetailPanel bundle={selectedBundle} />
        </section>

        <section className="table-panel">
          <div className="table-header">
            <div>
              <Table2 size={17} />
              <span>{tableRows.length} visible records</span>
            </div>
            <div className="sort-buttons">
              {(['metric', 'sf', 'name', 'city'] as SortKey[]).map((key) => (
                <button key={key} className={sortKey === key ? 'active' : ''} onClick={() => setSortKey(key)}>
                  <ArrowUpDown size={13} />
                  {key === 'metric' ? 'Metric' : key === 'sf' ? 'SF' : key}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Property / category</th>
                  <th>Market</th>
                  <th>SF</th>
                  <th>Rent or $/SF</th>
                  <th>Cap / status</th>
                  <th>Other</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={`${row.type}-${row.id}`} onClick={() => setSelectedPointId(row.pointId)}>
                    <td><span className={`type-pill ${row.type.toLowerCase()}`}>{row.type}</span></td>
                    <td>{row.name}</td>
                    <td>{row.property}</td>
                    <td>{row.city}</td>
                    <td>{formatNumber(row.sf)}</td>
                    <td>{row.type === 'Lease' ? (row.comp as LeaseComp).baseRentLabel : (row.comp as SaleComp).psfLabel}</td>
                    <td>{row.type === 'Lease' ? (row.comp as LeaseComp).status : (row.comp as SaleComp).capRateLabel}</td>
                    <td>{row.type === 'Lease' ? `NNN ${(row.comp as LeaseComp).nnnLabel}; TI ${(row.comp as LeaseComp).tiLabel}` : (row.comp as SaleComp).tenants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function DetailPanel({ bundle }: { bundle?: PointBundle }) {
  if (!bundle) return null
  const { point, lease, sale } = bundle
  const leaseRents = lease.map(leaseRentMidpoint).filter((value): value is number => value != null)
  const salePsf = sale.map((comp) => comp.psf).filter((value): value is number => value != null)

  return (
    <aside className="detail-panel">
      <div className="detail-title">
        <span className={`detail-icon ${point.kind}`}>{point.kind === 'target' ? <LocateFixed size={19} /> : <Building2 size={19} />}</span>
        <div>
          <h3>{point.name}</h3>
          <p>{point.address} · {point.city}</p>
        </div>
      </div>

      <div className="detail-metrics">
        <Metric label="Lease records" value={formatNumber(lease.length)} />
        <Metric label="Avg lease rent" value={leaseRents.length ? `$${average(leaseRents)!.toFixed(2)}/SF` : '-'} />
        <Metric label="Sale records" value={formatNumber(sale.length)} />
        <Metric label="Avg sale $/SF" value={salePsf.length ? `$${average(salePsf)!.toFixed(0)}` : '-'} />
      </div>

      {point.kind === 'target' ? (
        <div className="target-card">
          <strong>The Row reference point</strong>
          <p>Shown as the comparison anchor at SH 71 / SH 130. Use the visible distance pattern to separate Southeast Austin comps from broader Central Texas sale comps.</p>
        </div>
      ) : null}

      <CompList title="Lease comps" items={lease.map((comp) => `${comp.tenant}: ${comp.sfLabel} at ${comp.baseRentLabel} (${comp.status})`)} />
      <CompList title="Sale comps" items={sale.map((comp) => `${comp.property}: ${comp.psfLabel}/SF, ${comp.capRateLabel} cap, ${comp.saleDate}`)} />

      <div className="geocode-box">
        <strong>Map note</strong>
        <p>{point.geocodeNote}</p>
      </div>
    </aside>
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

function CompList({ title, items }: { title: string; items: string[] }) {
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
        <p>No records at this point.</p>
      )}
    </div>
  )
}

function MapView({ bundles, selectedPointId, onSelect }: { bundles: PointBundle[]; selectedPointId: string; onSelect: (id: string) => void }) {
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
      const icon = L.divIcon({
        className: '',
        html: `<button class="map-marker ${markerClass(bundle)} ${selectedPointId === point.id ? 'selected' : ''}" aria-label="${point.name}"><span>${point.kind === 'target' ? 'T' : bundle.lease.length && bundle.sale.length ? 'M' : bundle.lease.length ? 'L' : 'S'}</span></button>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
      L.marker([point.lat, point.lng], { icon })
        .addTo(layerRef.current!)
        .on('click', () => onSelect(point.id))
        .bindTooltip(`${point.name}<br>${bundle.lease.length} lease / ${bundle.sale.length} sale`, { direction: 'top', offset: [0, -14] })
    })
    if (bounds.length > 1) mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 })
  }, [bundles, selectedPointId, onSelect])

  return <div ref={containerRef} className="map-canvas" />
}

function markerClass(bundle: PointBundle): string {
  if (bundle.point.kind === 'target') return 'target'
  if (bundle.lease.length && bundle.sale.length) return 'mixed'
  return bundle.lease.length ? 'lease' : 'sale'
}

function average(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default App
